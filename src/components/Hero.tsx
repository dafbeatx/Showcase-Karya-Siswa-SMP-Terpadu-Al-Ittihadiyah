'use client';

import React from 'react';
import { Search, ArrowRight, Plus } from 'lucide-react';

interface HeroProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    handleSearchSubmit: (e: React.FormEvent) => void;
    filterCategories: string[];
    activeCategory: string;
    setActiveCategory: (cat: string) => void;
    setIsModalOpen: (open: boolean) => void;
}

export default function Hero({
    searchTerm,
    setSearchTerm,
    handleSearchSubmit,
    filterCategories,
    activeCategory,
    setActiveCategory,
    setIsModalOpen
}: HeroProps) {
    return (
        <section className="pt-24 md:pt-44 pb-8 md:pb-16 px-4 md:px-6 max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-[var(--card-bg)] border border-[var(--border)] text-[9px] md:text-xs font-bold uppercase tracking-wider mb-5 md:mb-8 animate-fade-in-up hover:border-[var(--accent)]/30 transition-colors cursor-default text-gray-500 shadow-sm">
                <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-green-500"></span>
                </span>
                Showcase Resmi SMP Terpadu Al-Ittihadiyah
            </div>
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-3 md:mb-6 leading-[1.2] md:leading-tight">
                Portal <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500">Berita</span> & <br className="hidden md:block" /> Kegiatan Sekolah.
            </h1>
            <p className="text-gray-500 text-sm md:text-xl max-w-2xl mx-auto mb-5 leading-relaxed px-2 font-medium">
                Informasi terkini mengenai kegiatan, prestasi, dan pengumuman resmi dari SMP Terpadu Al-Ittihadiyah.
            </p>

            {/* TOMBOL LIHAT BERITA DI HERO (VISIBLE ON MOBILE) */}
            <div className="flex justify-center mb-6 md:hidden">
                <a
                    href="#berita-terbaru"
                    className="px-5 py-2.5 bg-[var(--foreground)] text-[var(--background)] text-sm font-bold rounded-full flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
                >
                    Lihat Berita Terbaru
                </a>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl mx-auto mb-5 md:mb-8 group px-2">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--accent)] transition-colors" size={16} />
                <input
                    type="text"
                    placeholder="Cari berita..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl py-3 md:py-4 pl-12 pr-14 text-sm md:text-base text-[var(--foreground)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)]/50 transition-all placeholder-gray-500 shadow-sm"
                />
                <button type="submit" className="absolute right-5 top-1/2 -translate-y-1/2 p-2 bg-[var(--background)] hover:bg-[var(--accent)] rounded-xl text-gray-500 hover:text-white transition-all shadow-sm" title="Cari"><ArrowRight size={16} /></button>
            </form>
            <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 px-2">
                {filterCategories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3.5 py-1.5 md:px-6 rounded-full text-[10px] md:text-sm font-bold border transition-all duration-300 ${activeCategory === cat ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-lg' : 'bg-[var(--card-bg)] text-gray-500 border-[var(--border)] hover:border-[var(--accent)]/30 hover:text-[var(--foreground)] shadow-sm'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </section>
    );
}
