'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import NewsCard from '@/components/NewsCard';
import Footer from '@/components/Footer';
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
        <div className="min-h-screen bg-[#09090b] text-white selection:bg-purple-500/30 selection:text-purple-200">
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

                <section id="berita-terbaru" className="max-w-7xl mx-auto px-4 md:px-6 pb-24 scroll-mt-24">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Berita Terbaru</h2>
                        <div className="h-px flex-grow bg-white/5 mx-8 hidden md:block"></div>
                    </div>

                    {filteredNews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                            {filteredNews.map((post) => (
                                <NewsCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                            <p className="text-gray-500 text-lg">Belum ada berita yang ditemukan.</p>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}
