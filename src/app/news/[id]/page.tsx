'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getNewsPostById } from '@/actions/news';
import { Calendar, ChevronLeft, Share2, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export default function NewsDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [post, setPost] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        fetchPost();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [id]);

    async function fetchPost() {
        if (!id) return;
        setIsLoading(true);
        try {
            const data = await getNewsPostById(id as string);
            setPost(data);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
                <Loader2 className="animate-spin text-purple-500" size={48} />
            </div>
        );
    }

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

    return (
        <div className="min-h-screen bg-[#09090b] text-white selection:bg-purple-500/30">
            <Navbar
                isScrolled={isScrolled}
                mobileMenuOpen={false}
                setMobileMenuOpen={() => { }}
                setIsModalOpen={() => { }}
            />

            <main className="pt-32 pb-24">
                <article className="max-w-4xl mx-auto px-4 md:px-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Kembali
                    </button>

                    <header className="mb-12">
                        <div className="flex items-center gap-2 text-purple-400 text-sm font-medium mb-4">
                            <Calendar size={16} />
                            {formattedDate}
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                            {post.title}
                        </h1>
                    </header>

                    <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-purple-900/10 border border-white/5">
                        <Image
                            src={post.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop'}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {post.image_source && (
                        <p className="text-gray-500 text-xs italic -mt-10 mb-10 text-right pr-4">
                            Sumber: {post.image_source}
                        </p>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-start">
                        <div className="prose prose-invert max-w-none">
                            {post.content.split('\n').map((para: string, i: number) => (
                                para.trim() && <p key={i} className="text-gray-300 text-lg leading-relaxed mb-6">{para}</p>
                            ))}
                        </div>

                        <aside className="lg:w-48 sticky top-32 space-y-8">
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Bagikan</h4>
                                <div className="flex lg:flex-col gap-4">
                                    <button className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#1877f2] hover:text-white hover:border-transparent transition-all"><Facebook size={18} /></button>
                                    <button className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#1da1f2] hover:text-white hover:border-transparent transition-all"><Twitter size={18} /></button>
                                    <button className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black hover:border-transparent transition-all"><LinkIcon size={18} /></button>
                                </div>
                            </div>
                        </aside>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
}
