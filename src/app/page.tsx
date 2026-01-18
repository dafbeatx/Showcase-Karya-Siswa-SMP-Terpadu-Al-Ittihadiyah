'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import NewsCard from '@/components/NewsCard';
import Footer from '@/components/Footer';
import { getNewsPosts } from '@/actions/news';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [filteredNews, setFilteredNews] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const categories = ['All', 'Kegiatan', 'Prestasi', 'Pengumuman'];

  useEffect(() => {
    fetchNews();
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let result = news;
    // We don't have categories in DB yet, but let's keep the filter UI for future or just show all
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.content.toLowerCase().includes(term)
      );
    }
    setFilteredNews(result);
  }, [news, searchTerm]);

  async function fetchNews() {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await getNewsPosts();
      if (data) {
        setNews(data);
      } else {
        setHasError(true);
      }
    } catch (error) {
      console.error(error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-purple-500/30 selection:text-purple-200">
      <Navbar
        isScrolled={isScrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        setIsModalOpen={() => { }} // Not used here, using admin page
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

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="animate-spin text-purple-500" size={40} />
              <p className="text-gray-500 font-medium animate-pulse text-sm">Memuat berita...</p>
            </div>
          ) : hasError ? (
            <div className="text-center py-24 bg-red-500/5 rounded-3xl border border-red-500/10 flex flex-col items-center gap-4">
              <p className="text-red-400 font-medium">Gagal memuat berita dari server.</p>
              <button
                onClick={() => fetchNews()}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-bold transition-all"
              >
                Coba Lagi
              </button>
            </div>
          ) : filteredNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
              {filteredNews.map((post) => (
                <NewsCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white/5 rounded-3xl border border-white/5 border-dashed">
              <p className="text-gray-500 text-lg">Belum ada berita yang diterbitkan.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
