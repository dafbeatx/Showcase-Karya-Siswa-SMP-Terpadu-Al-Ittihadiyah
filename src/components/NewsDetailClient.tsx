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
            <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center gap-6">
                <h2 className="text-2xl font-bold">Berita tidak ditemukan</h2>
                <button onClick={() => router.push('/')} className="px-6 py-2 bg-white text-black rounded-full font-bold">Kembali</button>
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
        <div className="min-h-screen bg-[#09090b] text-white selection:bg-purple-500/30">
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
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Kembali
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 items-start">
                        {/* LEFT: CONTENT */}
                        <article className="space-y-12">
                            <header>
                                <div className="flex items-center gap-2 text-purple-400 text-sm font-medium mb-4">
                                    <Calendar size={16} />
                                    {formattedDate}
                                </div>
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-8 leading-[1.2]">
                                    {post.title}
                                </h1>
                            </header>

                            <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/10 border border-white/5">
                                <Image
                                    src={post.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop'}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                {post.image_source && (
                                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] text-gray-300 border border-white/10">
                                        Sumber: {post.image_source}
                                    </div>
                                )}
                            </div>

                            <div className="prose prose-invert max-w-none">
                                {post.content.split('\n').map((para: string, i: number) => (
                                    para.trim() && <p key={i} className="text-gray-300 text-lg md:text-xl leading-relaxed mb-6">{para}</p>
                                ))}
                            </div>

                            {/* MOBILE ONLY SHARE (Simplified for flow) */}
                            <div className="pt-12 border-t border-white/5 lg:hidden">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6">Bagikan Berita</h4>
                                <div className="flex gap-4">
                                    <button onClick={() => handleShare('facebook')} className="h-12 w-12 rounded-2xl bg-[#1877f2]/10 border border-[#1877f2]/20 flex items-center justify-center text-[#1877f2] hover:bg-[#1877f2] hover:text-white transition-all"><Facebook size={20} /></button>
                                    <button onClick={() => handleShare('twitter')} className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"><Twitter size={20} /></button>
                                    <button onClick={() => handleShare('copy')} className="flex-grow h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-gray-300 hover:bg-white/10 transition-all font-bold text-sm">
                                        {copied ? <Check size={18} className="text-green-500" /> : <LinkIcon size={18} />}
                                        {copied ? 'Tersalin' : 'Salin Link'}
                                    </button>
                                </div>
                            </div>
                        </article>

                        {/* RIGHT: SIDEBAR */}
                        <aside className="space-y-12">
                            {/* SHARE BOX (Desktop) */}
                            <div className="hidden lg:block p-8 rounded-3xl bg-white/5 border border-white/10 sticky top-32">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Bagikan</h4>
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
                                        className="w-full flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black transition-all group"
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20"><Twitter size={20} /></div>
                                        <span className="text-sm font-bold">Twitter / X</span>
                                    </button>
                                    <button
                                        onClick={() => handleShare('copy')}
                                        className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all group ${copied ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-white/5 border-white/10 text-white hover:bg-purple-500/10 hover:border-purple-500/30'}`}
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20">
                                            {copied ? <Check size={20} /> : <LinkIcon size={20} />}
                                        </div>
                                        <span className="text-sm font-bold">{copied ? 'Tersalin!' : 'Copy Link'}</span>
                                    </button>

                                    {typeof navigator !== 'undefined' && !!navigator.share && (
                                        <button
                                            onClick={() => handleShare('web')}
                                            className="w-full flex items-center gap-4 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white transition-all group"
                                        >
                                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20"><Share2 size={20} /></div>
                                            <span className="text-sm font-bold">Lainnya</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* OTHER NEWS */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center justify-between">
                                    <span>Berita Lainnya</span>
                                    <div className="h-px flex-grow bg-white/5 ml-4"></div>
                                </h4>
                                <div className="space-y-6">
                                    {otherNews.length > 0 ? (
                                        otherNews.map((news) => (
                                            <Link
                                                key={news.id}
                                                href={`/news/${news.id}`}
                                                className="flex gap-4 group cursor-pointer"
                                            >
                                                <div className="relative h-20 w-24 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5 group-hover:border-purple-500/30 transition-all">
                                                    <Image
                                                        src={news.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop'}
                                                        alt={news.title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        sizes="96px"
                                                    />
                                                </div>
                                                <div className="flex flex-col justify-center min-w-0">
                                                    <h5 className="text-sm font-bold line-clamp-2 leading-snug group-hover:text-purple-400 transition-colors">
                                                        {news.title}
                                                    </h5>
                                                    <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-medium">
                                                        {new Date(news.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-600 text-center py-4 italic">Belum ada berita lainnya.</p>
                                    )}
                                </div>
                                <Link
                                    href="/"
                                    className="block text-center py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                                >
                                    Lihat Semua Berita
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
