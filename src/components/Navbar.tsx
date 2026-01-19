'use client';

import React, { useEffect, useState } from 'react';
import { Menu, X, Plus, Sun, Moon, LayoutDashboard, LogIn, LogOut, User } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import { createClient } from '@/lib/supabase';
import { signOut } from '@/actions/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NavbarProps {
    isScrolled: boolean;
    mobileMenuOpen?: boolean;
    setMobileMenuOpen?: (open: boolean) => void;
    setIsModalOpen?: (open: boolean) => void;
}

export default function Navbar({ isScrolled, mobileMenuOpen, setMobileMenuOpen, setIsModalOpen }: NavbarProps) {
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        if (!supabase) return;

        // Get initial user
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

    const handleLogout = async () => {
        const result = await signOut();
        if (result.success) {
            router.refresh();
        }
    };

    return (
        <>
            <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)] py-3 md:py-4' : 'bg-transparent py-4 md:py-6'}`}>
                <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3 group cursor-pointer flex-shrink-0">
                        <div className="h-9 w-9 md:h-10 md:w-10 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300 relative">
                            <Image src="/logo1.png" alt="Logo" fill className="object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base md:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--foreground)] to-gray-500 group-hover:to-[var(--foreground)] transition-all uppercase tracking-tight">Portal Berita</span>
                            <span className="text-[9px] md:text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase -mt-0.5 group-hover:text-purple-400 transition-colors">SMP Terpadu Al-Ittihadiyah</span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-4">
                        <nav className="flex items-center gap-6 mr-4">
                            <Link href="/" className="text-sm font-bold text-gray-500 hover:text-[var(--foreground)] transition-colors uppercase tracking-widest">Beranda</Link>
                            {user && (
                                <Link href="/admin/dashboard" className="text-sm font-bold text-gray-500 hover:text-[var(--foreground)] transition-colors uppercase tracking-widest flex items-center gap-2">
                                    <LayoutDashboard size={14} /> Dashboard
                                </Link>
                            )}
                        </nav>

                        <div className="h-4 w-px bg-[var(--border)] mx-2"></div>

                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-gray-500 hover:text-[var(--accent)] transition-all hover:scale-110 shadow-sm"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <Link href="/admin" className="px-6 py-2.5 bg-[var(--accent)] text-white text-sm font-black rounded-full hover:opacity-90 transition-all flex items-center gap-2 shadow-xl shadow-purple-500/20 uppercase tracking-widest">
                            <Plus size={16} /> Post Berita
                        </Link>

                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="px-6 py-2.5 bg-[var(--card-bg)] border border-[var(--border)] text-red-500 text-sm font-black rounded-full hover:bg-red-500/10 transition-all flex items-center gap-2 shadow-sm uppercase tracking-widest"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        ) : (
                            <Link href="/login" className="px-6 py-2.5 bg-[var(--card-bg)] border border-[var(--border)] text-[var(--foreground)] text-sm font-black rounded-full hover:bg-[var(--background)] transition-all flex items-center gap-2 shadow-sm uppercase tracking-widest">
                                <LogIn size={16} /> Admin Login
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center gap-3 md:hidden">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-gray-500"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button className="text-[var(--foreground)] p-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl" onClick={() => setMobileMenuOpen?.(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[60] bg-[var(--background)]/98 backdrop-blur-2xl flex flex-col items-center justify-center gap-8 md:hidden animate-fade-in p-6 overflow-y-auto">
                    <button
                        onClick={() => setMobileMenuOpen?.(false)}
                        className="absolute top-8 right-8 p-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl text-[var(--foreground)]"
                    >
                        <X size={32} />
                    </button>

                    <Link href="/" onClick={() => setMobileMenuOpen?.(false)} className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tighter">Beranda</Link>

                    {user && (
                        <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen?.(false)} className="text-3xl font-black text-purple-500 uppercase tracking-tighter">Dashboard</Link>
                    )}

                    <div className="w-full h-px bg-[var(--border)] max-w-xs"></div>

                    <Link href="/admin" onClick={() => setMobileMenuOpen?.(false)} className="w-full max-w-xs px-8 py-5 bg-[var(--accent)] text-white text-xl font-black rounded-3xl flex items-center justify-center gap-3 shadow-xl shadow-purple-500/20 uppercase tracking-widest">
                        <Plus size={24} /> Post Berita
                    </Link>

                    {user ? (
                        <button
                            onClick={() => { handleLogout(); setMobileMenuOpen?.(false); }}
                            className="w-full max-w-xs px-8 py-5 bg-red-500/10 border border-red-500/20 text-red-500 text-xl font-black rounded-3xl flex items-center justify-center gap-3 uppercase tracking-widest"
                        >
                            <LogOut size={24} /> Logout
                        </button>
                    ) : (
                        <Link href="/login" onClick={() => setMobileMenuOpen?.(false)} className="w-full max-w-xs px-8 py-5 bg-[var(--card-bg)] border border-[var(--border)] text-[var(--foreground)] text-xl font-black rounded-3xl flex items-center justify-center gap-3 shadow-sm uppercase tracking-widest">
                            <LogIn size={24} /> Admin Login
                        </Link>
                    )}

                    <button onClick={() => setMobileMenuOpen?.(false)} className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs mt-8">Tutup Menu</button>
                </div>
            )}
        </>
    );
}
