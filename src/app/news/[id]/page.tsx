import React from 'react';
import { getNewsPostById } from '@/actions/news';
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

    try {
        post = await getNewsPostById(id);
    } catch (error) {
        console.error('Error fetching news detail on server:', error);
    }

    if (!post) {
        notFound();
    }

    return (
        <NewsDetailClient post={post} />
    );
}
