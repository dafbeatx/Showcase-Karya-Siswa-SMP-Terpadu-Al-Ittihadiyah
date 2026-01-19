'use client';
import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface NewsPost {
    id: string;
    title: string;
    content: string;
    image_url: string;
    created_at: string;
}

interface NewsCardProps {
    post: NewsPost;
}

export default function NewsCard({ post }: NewsCardProps) {
    const { id, title, content, image_url, created_at } = post;
    const formattedDate = new Date(created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Create a short excerpt from content
    const excerpt = content.substring(0, 100) + (content.length > 100 ? '...' : '');

    return (
        <div className="group bg-[var(--card-bg)] backdrop-blur-md border border-[var(--border)] rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-[var(--accent)]/30 flex flex-col h-full shadow-sm">
            <div className="relative h-56 overflow-hidden">
                <Image
                    src={image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop'}
                    alt={title}
                    fill
                    className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] to-transparent opacity-60" />
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-[var(--accent)] text-xs font-bold uppercase tracking-wider mb-3">
                    <Calendar size={14} />
                    {formattedDate}
                </div>

                <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--accent)] transition-colors line-clamp-2 leading-tight">
                    {title}
                </h3>

                <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {excerpt}
                </p>

                <Link
                    href={`/news/${id}`}
                    className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-[var(--foreground)] group/link"
                >
                    Baca Selengkapnya
                    <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform text-[var(--accent)]" />
                </Link>
            </div>
        </div>
    );
}
