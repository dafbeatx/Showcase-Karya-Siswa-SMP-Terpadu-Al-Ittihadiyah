import React from 'react';
import type { Metadata } from 'next';
import { getNewsPostById, getNewsPosts } from '@/actions/news';
import NewsDetailClient from '@/components/NewsDetailClient';
import { notFound } from 'next/navigation';

// Force dynamic rendering to handle real-time data and env vars correctly
export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

// Generate dynamic metadata for social media sharing
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const post = await getNewsPostById(id);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://smptaialittihadiyah.vercel.app';

    if (!post) {
        return {
            title: 'Berita Tidak Ditemukan | SMP Terpadu Al-Ittihadiyah',
            description: 'Halaman berita yang Anda cari tidak tersedia.',
        };
    }

    // Clean HTML tags and limit description length
    const rawText = post.content?.replace(/<[^>]*>/g, '').trim() || '';
    const cleanDescription = rawText.length > 160
        ? rawText.substring(0, 160).trim() + '...'
        : rawText || 'Baca berita selengkapnya di Portal Berita SMP Terpadu Al-Ittihadiyah.';

    // Helper to ensure absolute URL for images
    const getAbsoluteImageUrl = (url: string | null | undefined): string => {
        if (!url) return `${siteUrl}/og-image.png`;
        // Already absolute (Supabase URLs)
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        // Local path - make absolute
        return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const imageUrl = getAbsoluteImageUrl(post.image_url);
    const articleUrl = `${siteUrl}/news/${id}`;

    return {
        title: `${post.title} | SMP Terpadu Al-Ittihadiyah`,
        description: cleanDescription,
        openGraph: {
            title: post.title,
            description: cleanDescription,
            url: articleUrl,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
            type: 'article',
            siteName: 'SMP Terpadu Al-Ittihadiyah',
            locale: 'id_ID',
            publishedTime: post.created_at,
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: cleanDescription,
            images: [imageUrl],
        },
    };
}

interface NewsPost {
    id: string;
    title: string;
    content: string;
    image_url: string;
    created_at: string;
}

export default async function NewsDetailPage({ params }: PageProps) {
    const { id } = await params;
    let post = null;
    let otherNews: NewsPost[] = [];

    try {
        // Fetch main post
        post = await getNewsPostById(id);

        if (post) {
            // Fetch all news for the sidebar
            const { data: allNews } = await getNewsPosts({ status: 'published', limit: 6 });
            // Filter out current news and take first 5
            otherNews = (allNews || [])
                .filter((item: NewsPost) => item.id !== id)
                .slice(0, 5);
        }
    } catch (error) {
        console.error('Error fetching news detail on server:', error);
    }

    if (!post) {
        notFound();
    }

    return (
        <NewsDetailClient post={post} otherNews={otherNews} />
    );
}
