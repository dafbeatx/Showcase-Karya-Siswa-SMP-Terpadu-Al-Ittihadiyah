import React from 'react';
import { getNewsPostById, getNewsPosts } from '@/actions/news';
import NewsDetailClient from '@/components/NewsDetailClient';
import { notFound } from 'next/navigation';

// Force dynamic rendering to handle real-time data and env vars correctly
export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
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
