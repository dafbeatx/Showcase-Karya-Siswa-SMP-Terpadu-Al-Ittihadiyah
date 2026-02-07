'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function signIn(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { success: false, error: 'Email dan password wajib diisi.' };
    }

    try {
        const supabase = await createClient();
        if (!supabase) return { success: false, error: 'Gagal terhubung ke database. Cek konfigurasi server.' };

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Auth Error:', error.message);
            return { success: false, error: error.message };
        }

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
