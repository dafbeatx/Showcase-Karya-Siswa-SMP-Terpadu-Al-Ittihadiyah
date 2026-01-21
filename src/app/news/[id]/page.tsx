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

    if (!post) {
        return {
            title: 'Berita Tidak Ditemukan | SMP Terpadu Al-Ittihadiyah',
            description: 'Halaman berita yang Anda cari tidak tersedia.',
        };
    }

    // Clean HTML tags and limit description length
    const cleanDescription = post.content
        ?.replace(/<[^>]*>/g, '')
        .substring(0, 160)
        .trim() + '...';

    // Use article image or fallback to default thumbnail
    const imageUrl = post.image_url || '/thumbnail.png';

    return {
        title: `${post.title} | SMP Terpadu Al-Ittihadiyah`,
        description: cleanDescription,
        openGraph: {
            title: post.title,
            description: cleanDescription,
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
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: cleanDescription,
            images: [imageUrl],
        },
    };
}

export default async function NewsDetailPage({ params }: PageProps) {
    const { id } = await params;
    let post = null;
    let otherNews: any[] = [];

    try {
        // Fetch main post
        post = await getNewsPostById(id);

        if (post) {
            // Fetch all news for the sidebar
            const { data: allNews } = await getNewsPosts({ status: 'published', limit: 6 });
            // Filter out current news and take first 5
            otherNews = (allNews || [])
                .filter((item: any) => item.id !== id)
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
