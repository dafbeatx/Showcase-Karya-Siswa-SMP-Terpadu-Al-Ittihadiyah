import React from 'react';
import { getNewsPosts } from '@/actions/news';
import HomeClient from '@/components/HomeClient';

// Force the page to be dynamic to ensure fresh data and avoid build-time env var issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const { data: newsPosts } = await getNewsPosts({
    limit: 9,
    status: 'published'
  });

  return (
    <HomeClient initialNews={newsPosts} />
  );
}
