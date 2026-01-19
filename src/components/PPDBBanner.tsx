'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function PPDBBanner() {
    return (
        <section className="max-w-7xl mx-auto px-4 md:px-6 mb-12 md:mb-24 animate-fade-in-up">
            <div className="relative overflow-hidden rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-1 md:p-1.5 shadow-2xl shadow-purple-500/20">
                <div className="relative bg-[var(--background)] rounded-[28px] md:rounded-[36px] overflow-hidden p-6 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative flex-grow space-y-4 md:space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
                            <Sparkles size={14} /> PPDB TP. 2026/2027
                        </div>

                        <h2 className="text-2xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.2] md:leading-[1.1]">
                            Masa Depan Cerah Dimulai <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Dari Sini.</span>
                        </h2>

                        <p className="text-gray-500 text-sm md:text-xl font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Penerimaan Peserta Didik Baru (PPDB) SMP Terpadu Al-Ittihadiyah telah dibuka. Bergabunglah bersama kami untuk mencetak generasi unggul.
                        </p>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 md:pt-4">
                            <a
                                href="https://ppdb-smp-terpadu-al-ittihadiyah.vercel.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-4 md:px-10 md:py-5 bg-[var(--accent)] text-white font-black text-base md:text-lg rounded-2xl hover:opacity-90 flex items-center gap-2 md:gap-3 transition-all active:scale-[0.98] shadow-xl shadow-purple-500/30 uppercase tracking-widest"
                            >
                                Daftar Sekarang <ArrowRight size={20} />
                            </a>
                            <a
                                href="https://wa.me/62895351251395"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-4 md:px-8 md:py-5 bg-[var(--card-bg)] border border-[var(--border)] text-[var(--foreground)] font-black text-xs md:text-sm rounded-2xl hover:bg-[var(--background)] transition-all uppercase tracking-widest shadow-sm"
                            >
                                Tanya Admin
                            </a>
                        </div>
                    </div>

                    <div className="relative w-full lg:w-[400px] h-48 md:h-64 lg:h-80 flex-shrink-0 animate-float">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-[32px] md:rounded-[40px] rotate-6 scale-95 blur-xl" />
                        <div className="relative w-full h-full bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl group">
                            <Image
                                src="/ppdb-banner.jpg"
                                alt="PPDB SMP Terpadu Al-Ittihadiyah"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            <div className="absolute bottom-4 md:bottom-6 left-6 right-6">
                                <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-pulse" />
                                </div>
                                <div className="flex justify-between mt-1 md:mt-2 font-black text-[7px] md:text-[8px] text-white uppercase tracking-widest">
                                    <span>Quota 2026</span>
                                    <span>65% Terisi</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
