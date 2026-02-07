'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, ChevronLeft, Share2, Facebook, Link as LinkIcon, Check, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const XIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
    </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

interface NewsPost {
    id: string;
    title: string;
    content: string;
    image_url: string;
    image_source?: string;
    category?: string;
    author_name?: string;
    author_role?: string;
    is_featured?: boolean;
    created_at: string;
}

interface OtherNewsItem {
    id: string;
    title: string;
    image_url: string;
    created_at: string;
}

interface NewsDetailClientProps {
    post: NewsPost;
    otherNews: OtherNewsItem[];
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
                <button onClick={() => router.push('/')} className="px-8 py-3 bg-[var(--accent)] text-white rounded-full font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">Kembali</button>
            </div>
        );
    }

    const formattedDate = new Date(post.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleShare = async (platform: 'facebook' | 'twitter' | 'whatsapp' | 'copy' | 'web') => {
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
        } else if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + shareUrl)}`, '_blank');
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-emerald-500/30">
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

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
                        {/* LEFT: CONTENT */}
                        <article className="space-y-12">
                            <header>
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    <div className="flex items-center gap-2 text-[var(--accent)] text-xs font-bold uppercase tracking-widest border-r border-[var(--border)] pr-4">
                                        <Calendar size={16} />
                                        {formattedDate}
                                    </div>
                                    {post.category && (
                                        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                            {post.category}
                                        </div>
                                    )}
                                    {post.is_featured && (
                                        <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded text-[10px] font-bold">FEATURED</span>
                                    )}
                                </div>
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-8 leading-[1.1] md:leading-[1.2]">
                                    {post.title}
                                </h1>

                                {(post.author_name || post.author_role) && (
                                    <div className="flex items-center gap-3 p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl mb-8">
                                        <div className="h-10 w-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ditulis oleh</p>
                                            <p className="text-sm font-bold">
                                                {post.author_name || 'Admin'}
                                                {post.author_role && <span className="text-gray-400 font-medium ml-1">• {post.author_role}</span>}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </header>

                            <div className="space-y-4">
                                <div className="relative w-full aspect-[16/9] rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl border border-[var(--border)] shadow-emerald-500/5">
                                    <Image
                                        src={post.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop'}
                                        alt={post.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                                {post.image_source && (
                                    <div className="text-[10px] md:text-xs font-medium text-gray-400 dark:text-gray-500 italic px-2 flex items-center gap-2">
                                        <div className="w-6 h-px bg-gray-200 dark:bg-gray-800" />
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
                                <div className="flex flex-wrap gap-3">
                                    <button onClick={() => handleShare('whatsapp')} className="h-12 w-12 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all shadow-sm" title="WhatsApp">
                                        <WhatsAppIcon className="w-6 h-6" />
                                    </button>
                                    <button onClick={() => handleShare('facebook')} className="h-12 w-12 rounded-2xl bg-[#1877f2]/10 border border-[#1877f2]/20 flex items-center justify-center text-[#1877f2] hover:bg-[#1877f2] hover:text-white transition-all shadow-sm" title="Facebook">
                                        <Facebook size={24} />
                                    </button>
                                    <button onClick={() => handleShare('twitter')} className="h-12 w-12 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all shadow-sm" title="X (Twitter)">
                                        <XIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleShare('copy')} className="flex-grow h-12 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-center gap-2 text-gray-500 hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-all font-bold text-xs uppercase tracking-widest shadow-sm">
                                        {copied ? <Check size={20} className="text-green-500" /> : <LinkIcon size={20} />}
                                        {copied ? 'Tersalin' : 'Salin link'}
                                    </button>
                                </div>
                            </div>
                        </article>

                        {/* RIGHT: SIDEBAR */}
                        <aside className="relative">
                            <div className="sticky top-32 space-y-12">
                                {/* SHARE BOX (Desktop) */}
                                <div className="hidden lg:block p-8 rounded-[32px] bg-[var(--card-bg)] border border-[var(--border)] shadow-sm">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                                        <Share2 size={12} className="text-[var(--accent)]" /> Bagikan
                                    </h4>
                                    <div className="space-y-4">
                                        <button
                                            onClick={() => handleShare('whatsapp')}
                                            className="w-full flex items-center gap-4 p-3 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all group shadow-sm"
                                        >
                                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20">
                                                <WhatsAppIcon className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-bold">WhatsApp</span>
                                        </button>
                                        <button
                                            onClick={() => handleShare('facebook')}
                                            className="w-full flex items-center gap-4 p-3 rounded-2xl bg-[#1877f2]/10 border border-[#1877f2]/20 text-[#1877f2] hover:bg-[#1877f2] hover:text-white transition-all group shadow-sm"
                                        >
                                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20"><Facebook size={20} /></div>
                                            <span className="text-sm font-bold">Facebook</span>
                                        </button>
                                        <button
                                            onClick={() => handleShare('twitter')}
                                            className="w-full flex items-center gap-4 p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all group shadow-sm"
                                        >
                                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20">
                                                <XIcon className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold">Bagikan ke X</span>
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
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
