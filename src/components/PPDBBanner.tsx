'use client';

import React from 'react';
import { ArrowRight, Sparkles, GraduationCap } from 'lucide-react';

export default function PPDBBanner() {
    return (
        <section className="max-w-7xl mx-auto px-4 md:px-6 mb-24 animate-fade-in-up">
            <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-1 md:p-1.5 shadow-2xl shadow-purple-500/20">
                <div className="relative bg-[var(--background)] rounded-[36px] overflow-hidden p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative flex-grow space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 text-xs font-black uppercase tracking-[0.2em]">
                            <Sparkles size={16} /> PPDB TP. 2025/2026
                        </div>

                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                            Masa Depan Cerah Dimulai <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Dari Sini.</span>
                        </h2>

                        <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Penerimaan Peserta Didik Baru (PPDB) SMP Terpadu Al-Ittihadiyah telah dibuka. Bergabunglah bersama kami untuk mencetak generasi unggul dan berakhlak mulia.
                        </p>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                            <a
                                href="https://ppdb-smp-terpadu-al-ittihadiyah.vercel.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-10 py-5 bg-[var(--accent)] text-white font-black text-lg rounded-2xl hover:opacity-90 flex items-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-purple-500/30 uppercase tracking-widest"
                            >
                                Daftar Sekarang <ArrowRight size={24} />
                            </a>
                            <a
                                href="https://wa.me/62895351251395"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-5 bg-[var(--card-bg)] border border-[var(--border)] text-[var(--foreground)] font-black text-sm rounded-2xl hover:bg-[var(--background)] transition-all uppercase tracking-widest shadow-sm"
                            >
                                Tanya Admin
                            </a>
                        </div>
                    </div>

                    <div className="relative w-full lg:w-80 h-48 lg:h-80 flex-shrink-0 animate-float">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-[40px] rotate-6 scale-90 blur-xl" />
                        <div className="relative w-full h-full bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] flex items-center justify-center shadow-2xl p-8 overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 group-hover:opacity-100 opacity-0 transition-opacity duration-700" />
                            <GraduationCap size={120} className="text-[var(--accent)] drop-shadow-2xl" strokeWidth={1.5} />

                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" />
                                </div>
                                <div className="flex justify-between mt-2 font-black text-[8px] text-gray-500 uppercase tracking-widest">
                                    <span>Quota 2025</span>
                                    <span>65% Filled</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
