'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { signIn } from '@/actions/auth';
import { Loader2, LogIn, AlertCircle, CheckCircle2, Clock, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [lockoutSeconds, setLockoutSeconds] = useState(0);
    const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
    const router = useRouter();

    // Lockout countdown timer
    useEffect(() => {
        if (lockoutSeconds <= 0) return;
        
        const timer = setInterval(() => {
            setLockoutSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setError('');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [lockoutSeconds]);

    // Format seconds to mm:ss
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Client-side email validation
    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Don't allow submit during lockout
        if (lockoutSeconds > 0) {
            return;
        }

        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;

        // Client-side validation
        if (!isValidEmail(email)) {
            setError('Format email tidak valid.');
            setIsLoading(false);
            return;
        }

        try {
            const result = await signIn(formData);

            if (!result.success) {
                setError(result.error || 'Login gagal. Periksa data Anda.');
                
                // Handle lockout response
                if ('isLocked' in result && result.isLocked && 'lockoutSeconds' in result) {
                    setLockoutSeconds(result.lockoutSeconds as number);
                }
                
                // Show remaining attempts
                if ('remainingAttempts' in result && typeof result.remainingAttempts === 'number') {
                    setRemainingAttempts(result.remainingAttempts);
                }
            } else {
                setSuccess(true);
                setRemainingAttempts(null);
                router.push('/admin/dashboard');
                router.refresh();
            }
        } catch {
            setError('Terjadi kesalahan koneksi.');
        } finally {
            setIsLoading(false);
        }
    };

    const isLocked = lockoutSeconds > 0;

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-emerald-500/30">
            <Navbar isScrolled={true} />

            <main className="flex items-center justify-center min-h-screen p-6">
                <div className="w-full max-w-md space-y-8 bg-[var(--card-bg)] p-8 md:p-10 rounded-[40px] border border-[var(--border)] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-green-500"></div>

                    <div className="text-center space-y-2">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-500 mb-4 border border-emerald-500/20 shadow-inner">
                            {isLocked ? <Shield size={32} /> : <LogIn size={32} />}
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">Portal Admin</h1>
                        <p className="text-gray-500 font-medium">Masuk untuk mengelola publikasi berita sekolah.</p>
                    </div>

                    {/* Lockout Timer Display */}
                    {isLocked && (
                        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 px-5 py-6 rounded-2xl flex flex-col items-center gap-3 animate-pulse">
                            <Clock size={32} />
                            <div className="text-center">
                                <p className="font-black text-lg uppercase tracking-widest">Akun Terkunci</p>
                                <p className="text-4xl font-black mt-2">{formatTime(lockoutSeconds)}</p>
                                <p className="text-xs font-medium mt-2 opacity-75">Terlalu banyak percobaan login</p>
                            </div>
                        </div>
                    )}

                    {error && !isLocked && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-5 py-4 rounded-2xl flex items-center gap-3 animate-shake font-bold text-sm">
                            <AlertCircle size={20} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Remaining attempts warning */}
                    {remainingAttempts !== null && remainingAttempts <= 3 && remainingAttempts > 0 && !isLocked && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-bold">
                            <AlertCircle size={16} />
                            <span>Peringatan: Sisa {remainingAttempts} percobaan sebelum akun terkunci.</span>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-5 py-4 rounded-2xl flex items-center gap-3 font-bold text-sm">
                            <CheckCircle2 size={20} className="shrink-0" />
                            <span>Login berhasil! Mengalihkan...</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Sekolah</label>
                            <input
                                name="email"
                                type="email"
                                required
                                disabled={isLocked || isLoading || success}
                                placeholder="admin@alittihadiyah.sch.id"
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-5 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-[var(--foreground)] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                disabled={isLocked || isLoading || success}
                                minLength={6}
                                placeholder="••••••••"
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-5 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-[var(--foreground)] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || success || isLocked}
                            className="w-full py-5 bg-[var(--accent)] text-white font-black text-lg rounded-2xl hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest mt-8"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : isLocked ? (
                                <Shield size={24} />
                            ) : (
                                <LogIn size={24} />
                            )}
                            {isLocked ? 'Terkunci' : 'Masuk Ke Panel'}
                        </button>
                    </form>

                    {/* Security notice */}
                    <div className="text-center text-[10px] font-medium text-gray-500 uppercase tracking-widest flex items-center justify-center gap-2">
                        <Shield size={12} />
                        <span>Protected by Rate Limiting</span>
                    </div>

                    <div className="text-center pt-2">
                        <Link href="/" className="text-xs font-bold text-gray-500 hover:text-[var(--foreground)] transition-colors uppercase tracking-[0.1em]">Kembali ke Beranda</Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
