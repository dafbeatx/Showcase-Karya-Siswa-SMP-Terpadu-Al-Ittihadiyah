'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { signIn } from '@/actions/auth';
import { Loader2, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);

        try {
            const result = await signIn(formData);

            if (!result.success) {
                setError(result.error || 'Login gagal. Periksa data Anda.');
            } else {
                setSuccess(true);
                router.push('/admin/dashboard');
                router.refresh(); // Ensure Navbar updates
            }
        } catch {
            setError('Terjadi kesalahan koneksi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-emerald-500/30">
            <Navbar isScrolled={true} />

            <main className="flex items-center justify-center min-h-screen p-6">
                <div className="w-full max-w-md space-y-8 bg-[var(--card-bg)] p-8 md:p-10 rounded-[40px] border border-[var(--border)] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-green-500"></div>

                    <div className="text-center space-y-2">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-500 mb-4 border border-emerald-500/20 shadow-inner">
                            <LogIn size={32} />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">Portal Admin</h1>
                        <p className="text-gray-500 font-medium">Masuk untuk mengelola publikasi berita sekolah.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-5 py-4 rounded-2xl flex items-center gap-3 animate-shake font-bold text-sm">
                            <AlertCircle size={20} className="shrink-0" />
                            <span>{error}</span>
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
                                placeholder="admin@alittihadiyah.sch.id"
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-5 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-[var(--foreground)] shadow-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-5 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-[var(--foreground)] shadow-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || success}
                            className="w-full py-5 bg-[var(--accent)] text-white font-black text-lg rounded-2xl hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 disabled:opacity-50 uppercase tracking-widest mt-8"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={24} /> : <LogIn size={24} />}
                            Masuk Ke Panel
                        </button>
                    </form>

                    <div className="text-center pt-4">
                        <Link href="/" className="text-xs font-bold text-gray-500 hover:text-[var(--foreground)] transition-colors uppercase tracking-[0.1em]">Kembali ke Beranda</Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
