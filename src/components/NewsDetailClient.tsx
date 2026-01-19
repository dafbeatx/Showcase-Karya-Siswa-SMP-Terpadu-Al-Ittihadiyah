'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, ChevronLeft, Share2, Facebook, Twitter, Link as LinkIcon, Check } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface NewsDetailClientProps {
    post: any;
    otherNews: any[];
}

export default function NewsDetailClient({ post, otherNews }: NewsDetailClientProps) {
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!post) {
        return (
            <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center gap-6">
                <h2 className="text-2xl font-bold italic">Berita tidak ditemukan</h2>
                <button onClick={() => router.push('/')} className="px-8 py-3 bg-[var(--accent)] text-white rounded-full font-bold shadow-lg shadow-purple-500/20 active:scale-95 transition-all">Kembali</button>
            </div>
        );
    }

    const formattedDate = new Date(post.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleShare = async (platform: 'facebook' | 'twitter' | 'copy' | 'web') => {
        if (platform === 'web' && navigator.share) {
            try {
                await navigator.share({
                    title: post.title,
                    text: post.content.substring(0, 100) + '...',
                    url: shareUrl,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        } else if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-purple-500/30">
            <Navbar
                isScrolled={isScrolled}
                mobileMenuOpen={false}
                setMobileMenuOpen={() => { }}
                setIsModalOpen={() => { }}
            />

            <main className="pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-[var(--foreground)] transition-colors mb-8 group font-bold text-sm uppercase tracking-widest"
                    >
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Kembali
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 items-start">
                        {/* LEFT: CONTENT */}
                        <article className="space-y-12">
                            <header>
                                <div className="flex items-center gap-2 text-[var(--accent)] text-xs font-bold uppercase tracking-widest mb-4">
                                    <Calendar size={16} />
                                    {formattedDate}
                                    {post.is_featured && (
                                        <span className="ml-4 px-2 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded text-[10px]">FEATURED</span>
                                    )}
                                </div>
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-8 leading-[1.1] md:leading-[1.2]">
                                    {post.title}
                                </h1>
                            </header>

                            <div className="relative w-full aspect-[16/9] rounded-[40px] overflow-hidden shadow-2xl border border-[var(--border)] shadow-purple-500/5">
                                <Image
                                    src={post.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop'}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                {post.image_source && (
                                    <div className="absolute bottom-6 right-6 bg-[var(--background)]/80 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-bold text-gray-400 border border-[var(--border)] shadow-lg uppercase tracking-widest">
                                        Sumber: {post.image_source}
                                    </div>
                                )}
                            </div>

                            <div className="prose prose-invert max-w-none">
                                {post.content.split('\n').map((para: string, i: number) => (
                                    para.trim() && <p key={i} className="text-gray-500 text-lg md:text-xl leading-relaxed mb-6 font-medium">{para}</p>
                                ))}
                            </div>

                            {/* MOBILE ONLY SHARE */}
                            <div className="pt-12 border-t border-[var(--border)] lg:hidden">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Bagikan Berita</h4>
                                <div className="flex gap-4">
                                    <button onClick={() => handleShare('facebook')} className="h-14 w-14 rounded-2xl bg-[#1877f2]/10 border border-[#1877f2]/20 flex items-center justify-center text-[#1877f2] hover:bg-[#1877f2] hover:text-white transition-all"><Facebook size={24} /></button>
                                    <button onClick={() => handleShare('twitter')} className="h-14 w-14 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all"><Twitter size={24} /></button>
                                    <button onClick={() => handleShare('copy')} className="flex-grow h-14 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-center gap-2 text-gray-500 hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-all font-bold text-sm uppercase tracking-widest">
                                        {copied ? <Check size={20} className="text-green-500" /> : <LinkIcon size={20} />}
                                        {copied ? 'Tersalin' : 'Copy link'}
                                    </button>
                                </div>
                            </div>
                        </article>

                        {/* RIGHT: SIDEBAR */}
                        <aside className="space-y-12">
                            {/* SHARE BOX (Desktop) */}
                            <div className="hidden lg:block p-8 rounded-[32px] bg-[var(--card-bg)] border border-[var(--border)] sticky top-32 shadow-sm">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                                    <Share2 size={12} className="text-[var(--accent)]" /> Bagikan
                                </h4>
                                <div className="space-y-4">
                                    <button
                                        onClick={() => handleShare('facebook')}
                                        className="w-full flex items-center gap-4 p-3 rounded-2xl bg-[#1877f2]/10 border border-[#1877f2]/20 text-[#1877f2] hover:bg-[#1877f2] hover:text-white transition-all group"
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20"><Facebook size={20} /></div>
                                        <span className="text-sm font-bold">Facebook</span>
                                    </button>
                                    <button
                                        onClick={() => handleShare('twitter')}
                                        className="w-full flex items-center gap-4 p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all group shadow-sm"
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20"><Twitter size={20} /></div>
                                        <span className="text-sm font-bold">Twitter / X</span>
                                    </button>
                                    <button
                                        onClick={() => handleShare('copy')}
                                        className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all group shadow-sm ${copied ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/30'}`}
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20">
                                            {copied ? <Check size={20} /> : <LinkIcon size={20} />}
                                        </div>
                                        <span className="text-sm font-bold">{copied ? 'Tersalin!' : 'Salin Link'}</span>
                                    </button>

                                    {typeof navigator !== 'undefined' && !!navigator.share && (
                                        <button
                                            onClick={() => handleShare('web')}
                                            className="w-full flex items-center gap-4 p-3 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all group"
                                        >
                                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20"><Share2 size={20} /></div>
                                            <span className="text-sm font-bold">Lainnya</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* OTHER NEWS */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center justify-between">
                                    <span>Berita Lainnya</span>
                                    <div className="h-px flex-grow bg-[var(--border)] ml-4"></div>
                                </h4>
                                <div className="space-y-6">
                                    {otherNews.length > 0 ? (
                                        otherNews.map((news) => (
                                            <Link
                                                key={news.id}
                                                href={`/news/${news.id}`}
                                                className="flex gap-4 group cursor-pointer"
                                            >
                                                <div className="relative h-20 w-24 rounded-2xl overflow-hidden flex-shrink-0 border border-[var(--border)] group-hover:border-[var(--accent)]/30 transition-all shadow-sm">
                                                    <Image
                                                        src={news.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop'}
                                                        alt={news.title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        sizes="96px"
                                                    />
                                                </div>
                                                <div className="flex flex-col justify-center min-w-0">
                                                    <h5 className="text-sm font-bold line-clamp-2 leading-snug group-hover:text-[var(--accent)] transition-colors">
                                                        {news.title}
                                                    </h5>
                                                    <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">
                                                        {new Date(news.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-500 text-center py-4 italic">Belum ada berita lainnya.</p>
                                    )}
                                </div>
                                <Link
                                    href="/"
                                    className="block text-center py-4 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] text-xs font-black text-gray-500 hover:text-[var(--foreground)] hover:border-[var(--accent)]/30 transition-all uppercase tracking-[0.2em] shadow-sm active:scale-95"
                                >
                                    Lihat Semua
                                </Link>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
