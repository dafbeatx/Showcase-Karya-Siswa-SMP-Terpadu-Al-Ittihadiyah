'use client';

import React from 'react';
import { Menu, X, Plus } from 'lucide-react';
import Image from 'next/image';

interface NavbarProps {
    isScrolled: boolean;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    setIsModalOpen: (open: boolean) => void;
}

export default function Navbar({ isScrolled, mobileMenuOpen, setMobileMenuOpen, setIsModalOpen }: NavbarProps) {
    return (
        <>
            <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 py-3 md:py-4' : 'bg-transparent py-4 md:py-6'}`}>
                <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3 group cursor-pointer flex-shrink-0">
                        <div className="h-9 w-9 md:h-10 md:w-10 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300 relative">
                            <Image src="/logo1.png" alt="Logo" fill className="object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base md:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all">Portal Berita</span>
                            <span className="text-[9px] md:text-[10px] font-medium text-gray-500 tracking-[0.2em] uppercase -mt-0.5 group-hover:text-purple-400 transition-colors">SMP Terpadu Al-Ittihadiyah</span>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <a href="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Beranda</a>
                        <a href="/admin" className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]">
                            <Plus size={16} /> Post Berita
                        </a>
                    </div>
                    <button className="md:hidden text-white p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-[#09090b]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 md:hidden animate-fade-in p-6">
                    <a href="/" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">Beranda</a>
                    <a href="/admin" onClick={() => setMobileMenuOpen(false)} className="w-full max-w-xs px-8 py-4 bg-white text-black text-lg font-bold rounded-full flex items-center justify-center gap-2 shadow-lg shadow-white/10 active:scale-95 transition-transform">
                        <Plus size={20} /> Post Berita
                    </a>
                    <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 hover:text-white mt-4 text-sm">Tutup Menu</button>
                </div>
            )}
        </>
    );
}
