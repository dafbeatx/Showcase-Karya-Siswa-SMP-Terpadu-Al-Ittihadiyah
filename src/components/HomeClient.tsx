'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import NewsCard from '@/components/NewsCard';
import Footer from '@/components/Footer';
import PPDBBanner from '@/components/PPDBBanner';
import { Loader2, Search, Filter, ArrowRight } from 'lucide-react';
import { getNewsPosts } from '@/actions/news';

interface HomeClientProps {
    initialNews: any[];
}

export default function HomeClient({ initialNews }: HomeClientProps) {
    const [news, setNews] = useState<any[]>(initialNews);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(initialNews.length >= 9);
    const [offset, setOffset] = useState(initialNews.length);

    const categories = ['All', 'Kegiatan', 'Prestasi', 'Pengumuman', 'PPDB'];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch news based on category and search
    useEffect(() => {
        const fetchFiltered = async () => {
            const { data } = await getNewsPosts({
                category: activeCategory,
                search: searchTerm,
                limit: 9,
                status: 'published'
            });
            setNews(data);
            setOffset(data.length);
            setHasMore(data.length >= 9);
        };

        const timer = setTimeout(fetchFiltered, 300);
        return () => clearTimeout(timer);
    }, [activeCategory, searchTerm]);

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const { data } = await getNewsPosts({
            category: activeCategory,
            search: searchTerm,
            limit: 9,
            offset: offset,
            status: 'published'
        });

        if (data.length > 0) {
            setNews(prev => [...prev, ...data]);
            setOffset(prev => prev + data.length);
            if (data.length < 9) setHasMore(false);
        } else {
            setHasMore(false);
        }
        setLoadingMore(false);
    };

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

                <section id="berita-terbaru" className="max-w-7xl mx-auto px-4 md:px-6 pb-16 md:pb-24 scroll-mt-24">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h2 className="text-xl md:text-3xl font-extrabold tracking-tight italic mb-2">Portal <span className="text-[var(--accent)]">Berita</span></h2>
                            <p className="text-gray-500 text-sm font-medium">Informasi terbaru seputar kegiatan dan prestasi sekolah.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2 md:block hidden">Filter:</span>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${activeCategory === cat
                                        ? 'bg-[var(--accent)] text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-[var(--card-bg)] border border-[var(--border)] text-gray-400 hover:border-[var(--accent)]/30 hover:text-[var(--foreground)]'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {news.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                                {news.map((post) => (
                                    <NewsCard key={post.id} post={post} />
                                ))}
                            </div>

                            {hasMore && (
                                <div className="mt-16 flex justify-center">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="inline-flex items-center gap-3 px-10 py-4 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] font-black text-xs uppercase tracking-[0.2em] hover:border-[var(--accent)]/30 hover:text-[var(--accent)] transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {loadingMore ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <>Muat Lebih Banyak <ArrowRight size={16} /></>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-32 bg-[var(--card-bg)] rounded-[32px] border border-[var(--border)] border-dashed shadow-sm">
                            <div className="h-16 w-16 bg-gray-500/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={32} className="text-gray-500/20" />
                            </div>
                            <p className="text-gray-500 text-lg font-medium">Belum ada berita yang dipublikasikan.</p>
                            <button onClick={() => { setSearchTerm(''); setActiveCategory('All'); }} className="mt-4 text-[var(--accent)] text-sm font-bold hover:underline">Reset Filter</button>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}
