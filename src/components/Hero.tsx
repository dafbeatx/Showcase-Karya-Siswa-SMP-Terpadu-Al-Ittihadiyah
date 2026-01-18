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
        <section className="pt-32 md:pt-44 pb-12 md:pb-16 px-4 md:px-6 max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs font-medium mb-6 md:mb-8 animate-fade-in-up hover:bg-white/10 transition-colors cursor-default">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Showcase Resmi SMP Terpadu Al-Ittihadiyah
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-4 md:mb-6 leading-[1.15] md:leading-tight">
                Karya <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">Siswa/i</span>, <br /> Untuk Masa Depan Kalian.
            </h1>
            <p className="text-gray-400 text-base md:text-xl max-w-2xl mx-auto mb-6 leading-relaxed px-2">
                Selamat datang di platform galeri digital SMP Terpadu Al-Ittihadiyah. Tempat kami merayakan kreativitas, inovasi teknologi, dan bakat seni dari seluruh siswa.
            </p>

            {/* TOMBOL SUBMIT DI HERO (VISIBLE ON MOBILE) */}
            <div className="flex justify-center mb-8 md:hidden">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-white text-black font-bold rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-pulse hover:scale-105 transition-transform"
                >
                    <Plus size={18} /> Upload Karyamu
                </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl mx-auto mb-6 md:mb-8 group px-2">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Cari judul karya atau nama siswa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-14 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder-gray-600"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-white/10 hover:bg-purple-500 rounded-lg text-gray-400 hover:text-white transition-all" title="Cari"><ArrowRight size={18} /></button>
            </form>
            <div className="flex flex-wrap justify-center gap-2 px-2">
                {filterCategories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 md:px-6 rounded-full text-xs md:text-sm font-medium border transition-all duration-300 ${activeCategory === cat ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </section>
    );
}
