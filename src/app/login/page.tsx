'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase';
import { Loader2, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (!supabase) throw new Error('Supabase client is not initialized.');
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            setSuccess(true);
            setTimeout(() => {
                router.push('/admin/dashboard');
            }, 1000);
        } catch (err: any) {
            setError(err.message || 'Login gagal. Periksa email dan password Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-purple-500/30">
            <Navbar isScrolled={true} />

            <main className="flex items-center justify-center min-h-screen p-6">
                <div className="w-full max-w-md space-y-8 bg-[var(--card-bg)] p-8 md:p-10 rounded-3xl border border-[var(--border)] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>

                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Admin Login</h1>
                        <p className="text-gray-500 text-sm">Masuk untuk mengelola konten portal berita.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-2xl flex items-center gap-3 animate-shake">
                            <AlertCircle size={20} />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-2xl flex items-center gap-3">
                            <CheckCircle2 size={20} />
                            <span className="text-sm font-medium">Login berhasil! Mengalihkan...</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-4 outline-none focus:border-purple-500 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-4 outline-none focus:border-purple-500 transition-all"
                            />
                        </div>

                        <button
                            disabled={isLoading || success}
                            className="w-full py-4 bg-[var(--accent)] text-white font-bold rounded-2xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-purple-500/20 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                            Masuk Sekarang
                        </button>
                    </form>

                    <div className="text-center">
                        <Link href="/" className="text-sm text-gray-500 hover:text-[var(--foreground)] transition-colors">Kembali ke Beranda</Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
