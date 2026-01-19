'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import NewsCard from '@/components/NewsCard';
import Footer from '@/components/Footer';
import PPDBBanner from '@/components/PPDBBanner';
import { Loader2 } from 'lucide-react';

interface HomeClientProps {
    initialNews: any[];
}

export default function HomeClient({ initialNews }: HomeClientProps) {
    const [news] = useState<any[]>(initialNews);
    const [filteredNews, setFilteredNews] = useState<any[]>(initialNews);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const categories = ['All', 'Kegiatan', 'Prestasi', 'Pengumuman'];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        let result = news;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.title.toLowerCase().includes(term) ||
                p.content.toLowerCase().includes(term)
            );
        }
        setFilteredNews(result);
    }, [news, searchTerm]);

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-purple-500/30">
            <Navbar
                isScrolled={isScrolled}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                setIsModalOpen={() => { }}
            />

            <main>
                <Hero
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    handleSearchSubmit={(e) => e.preventDefault()}
                    filterCategories={categories}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    setIsModalOpen={() => { }}
                />

                <PPDBBanner />

                <section id="berita-terbaru" className="max-w-7xl mx-auto px-4 md:px-6 pb-24 scroll-mt-24">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight italic">Berita <span className="text-[var(--accent)]">Terbaru</span></h2>
                        <div className="h-px flex-grow bg-[var(--border)] mx-8 hidden md:block"></div>
                    </div>

                    {filteredNews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                            {filteredNews.map((post) => (
                                <NewsCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 bg-[var(--card-bg)] rounded-[32px] border border-[var(--border)] border-dashed shadow-sm">
                            <p className="text-gray-500 text-lg font-medium">Belum ada berita yang ditemukan.</p>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}
