import React from 'react';
import { getNewsPosts } from '@/actions/news';
import HomeClient from '@/components/HomeClient';

// Force the page to be dynamic to ensure fresh data and avoid build-time env var issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  let news: any[] = [];
  let error = false;

  try {
    news = await getNewsPosts();
  } catch (e) {
    console.error('Failed to fetch news on server:', e);
    error = true;
  }

  return (
    <HomeClient initialNews={news} />
  );
}
