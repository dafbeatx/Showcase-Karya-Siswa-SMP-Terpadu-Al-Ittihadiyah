'use client';

import React from 'react';
import { Menu, X, Plus, Sun, Moon, LayoutDashboard, LogIn } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';

interface NavbarProps {
    isScrolled: boolean;
    mobileMenuOpen?: boolean;
    setMobileMenuOpen?: (open: boolean) => void;
    setIsModalOpen?: (open: boolean) => void;
}

export default function Navbar({ isScrolled, mobileMenuOpen, setMobileMenuOpen, setIsModalOpen }: NavbarProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <>
            <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)] py-3 md:py-4' : 'bg-transparent py-4 md:py-6'}`}>
                <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3 group cursor-pointer flex-shrink-0">
                        <div className="h-9 w-9 md:h-10 md:w-10 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300 relative">
                            <Image src="/logo1.png" alt="Logo" fill className="object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base md:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--foreground)] to-gray-500 group-hover:to-[var(--foreground)] transition-all">Portal Berita</span>
                            <span className="text-[9px] md:text-[10px] font-medium text-gray-500 tracking-[0.2em] uppercase -mt-0.5 group-hover:text-purple-400 transition-colors">SMP Terpadu Al-Ittihadiyah</span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-[var(--foreground)] transition-colors">Beranda</Link>

                        <div className="h-4 w-px bg-[var(--border)] mx-2"></div>

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-gray-500 hover:text-[var(--accent)] transition-all hover:scale-110"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <Link href="/admin" className="px-5 py-2 bg-[var(--accent)] text-white text-sm font-bold rounded-full hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20">
                            <Plus size={16} /> Post Berita
                        </Link>

                        <Link href="/login" className="px-5 py-2 bg-[var(--card-bg)] border border-[var(--border)] text-[var(--foreground)] text-sm font-bold rounded-full hover:bg-[var(--background)] transition-all flex items-center gap-2">
                            <LogIn size={16} /> Admin Login
                        </Link>
                    </div>

                    <div className="flex items-center gap-3 md:hidden">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-gray-500"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button className="text-[var(--foreground)] p-1" onClick={() => setMobileMenuOpen?.(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-[var(--background)]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6 md:hidden animate-fade-in p-6">
                    <Link href="/" onClick={() => setMobileMenuOpen?.(false)} className="text-2xl font-bold text-[var(--foreground)]">Beranda</Link>
                    <Link href="/admin" onClick={() => setMobileMenuOpen?.(false)} className="w-full max-w-xs px-8 py-4 bg-[var(--accent)] text-white text-lg font-bold rounded-full flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20">
                        <Plus size={20} /> Post Berita
                    </Link>
                    <Link href="/login" onClick={() => setMobileMenuOpen?.(false)} className="w-full max-w-xs px-8 py-4 bg-[var(--card-bg)] border border-[var(--border)] text-[var(--foreground)] text-lg font-bold rounded-full flex items-center justify-center gap-2">
                        <LogIn size={20} /> Admin Login
                    </Link>
                    <button onClick={() => setMobileMenuOpen?.(false)} className="text-gray-500 hover:text-[var(--foreground)] mt-4 text-sm">Tutup Menu</button>
                </div>
            )}
        </>
    );
}
