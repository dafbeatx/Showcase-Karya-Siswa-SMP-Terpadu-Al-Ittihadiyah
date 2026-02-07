'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { 
    RATE_LIMIT_CONFIG, 
    getProgressiveDelay, 
    isValidEmail, 
    sanitizeInput,
    calculateLockoutRemaining 
} from '@/lib/rate-limiter';

// Get client IP from headers
async function getClientIP(): Promise<string> {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIP = headersList.get('x-real-ip');
    
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
    return realIP || 'unknown';
}

// Check rate limit for IP address
async function checkRateLimit(supabase: Awaited<ReturnType<typeof createClient>>, ip: string): Promise<{
    allowed: boolean;
    remainingAttempts: number;
    lockoutSeconds?: number;
}> {
    if (!supabase) return { allowed: true, remainingAttempts: RATE_LIMIT_CONFIG.MAX_ATTEMPTS };
    
    const windowStart = new Date(Date.now() - RATE_LIMIT_CONFIG.WINDOW_MINUTES * 60 * 1000);
    
    const { data: attempts, error } = await supabase
        .from('login_attempts')
        .select('attempted_at, success')
        .eq('ip_address', ip)
        .gte('attempted_at', windowStart.toISOString())
        .eq('success', false)
        .order('attempted_at', { ascending: false });
    
    if (error) {
        console.error('Rate limit check error:', error);
        return { allowed: true, remainingAttempts: RATE_LIMIT_CONFIG.MAX_ATTEMPTS };
    }
    
    const failedAttempts = attempts?.length || 0;
    const remaining = Math.max(0, RATE_LIMIT_CONFIG.MAX_ATTEMPTS - failedAttempts);
    
    if (failedAttempts >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS) {
        const lastAttempt = attempts?.[0];
        if (lastAttempt) {
            const lockoutSeconds = calculateLockoutRemaining(new Date(lastAttempt.attempted_at));
            if (lockoutSeconds > 0) {
                return { allowed: false, remainingAttempts: 0, lockoutSeconds };
            }
        }
    }
    
    return { allowed: true, remainingAttempts: remaining };
}

// Record login attempt
async function recordLoginAttempt(
    supabase: Awaited<ReturnType<typeof createClient>>, 
    ip: string, 
    email: string, 
    success: boolean
): Promise<void> {
    if (!supabase) return;
    
    await supabase.from('login_attempts').insert({
        ip_address: ip,
        email: email,
        success: success,
        attempted_at: new Date().toISOString()
    });
}

// Get failed attempt count for progressive delay
async function getFailedAttemptCount(
    supabase: Awaited<ReturnType<typeof createClient>>, 
    ip: string
): Promise<number> {
    if (!supabase) return 0;
    
    const windowStart = new Date(Date.now() - RATE_LIMIT_CONFIG.WINDOW_MINUTES * 60 * 1000);
    
    const { count } = await supabase
        .from('login_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .gte('attempted_at', windowStart.toISOString())
        .eq('success', false);
    
    return count || 0;
}

// Apply progressive delay
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function signIn(formData: FormData) {
    const rawEmail = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Input validation
    if (!rawEmail || !password) {
        return { success: false, error: 'Email dan password wajib diisi.' };
    }

    const email = sanitizeInput(rawEmail);
    
    // Validate email format
    if (!isValidEmail(email)) {
        return { success: false, error: 'Format email tidak valid.' };
    }

    // Minimum password length
    if (password.length < 6) {
        return { success: false, error: 'Password minimal 6 karakter.' };
    }

    try {
        const supabase = await createClient();
        if (!supabase) {
            return { success: false, error: 'Gagal terhubung ke database. Cek konfigurasi server.' };
        }

        const clientIP = await getClientIP();
        
        // Check rate limit
        const rateLimit = await checkRateLimit(supabase, clientIP);
        if (!rateLimit.allowed) {
            const minutes = Math.ceil((rateLimit.lockoutSeconds || 0) / 60);
            return { 
                success: false, 
                error: `Terlalu banyak percobaan login. Coba lagi dalam ${minutes} menit.`,
                lockoutSeconds: rateLimit.lockoutSeconds,
                isLocked: true
            };
        }

        // Apply progressive delay based on failed attempts
        const failedAttempts = await getFailedAttemptCount(supabase, clientIP);
        const progressiveDelay = getProgressiveDelay(failedAttempts);
        if (progressiveDelay > 0) {
            await delay(progressiveDelay);
        }

        // Attempt login
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            // Record failed attempt
            await recordLoginAttempt(supabase, clientIP, email, false);
            
            const newFailedCount = failedAttempts + 1;
            const remaining = Math.max(0, RATE_LIMIT_CONFIG.MAX_ATTEMPTS - newFailedCount);
            
            // Generic error message (don't reveal if email exists)
            let errorMessage = 'Email atau password salah.';
            if (remaining > 0 && remaining <= 3) {
                errorMessage += ` Sisa ${remaining} percobaan.`;
            } else if (remaining === 0) {
                errorMessage = `Akun terkunci selama ${RATE_LIMIT_CONFIG.LOCKOUT_MINUTES} menit.`;
            }
            
            return { 
                success: false, 
                error: errorMessage,
                remainingAttempts: remaining
            };
        }

        // Record successful login
        await recordLoginAttempt(supabase, clientIP, email, true);

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Sign In Unexpected Error:', error);
        return { success: false, error: 'Terjadi kesalahan sistem saat mencoba login.' };
    }
}

export async function signOut() {
    try {
        const supabase = await createClient();
        if (!supabase) return { success: false, error: 'Gagal terhubung ke database.' };

        const { error } = await supabase.auth.signOut();
        if (error) return { success: false, error: error.message };

        revalidatePath('/', 'layout');
        return { success: true };
    } catch {
        return { success: false, error: 'Gagal logout.' };
    }
}

export async function getUser() {
    try {
        const supabase = await createClient();
        if (!supabase) return null;

        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return null;

        return user;
    } catch {
        return null;
    }
}
