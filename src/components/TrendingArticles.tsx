'use client';

import { useEffect, useState } from 'react';
import ArticleCard from './ArticleCard';
import { Article } from '@/types';

export default function TrendingArticles() {
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trending')
      .then((res) => res.json())
      .then((data) => {
        setTrendingArticles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch trending articles:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <aside className="trending bg-white p-4 sm:p-5 rounded-lg shadow-md">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary text-left border-b-2 border-gray-100 pb-3 mb-4">
          Trending Now
        </h2>
        <p className="text-gray-500 text-center py-8">Loading...</p>
      </aside>
    );
  }

  return (
    <aside className="trending bg-white p-4 sm:p-5 rounded-lg shadow-md sticky top-[60px] sm:top-[65px]">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary text-left border-b-2 border-gray-100 pb-3 mb-4">
        Trending Now
      </h2>
      <ul className="list-none p-0 m-0">
        {trendingArticles.length === 0 ? (
          <li className="text-gray-500 text-center py-4">
            No trending articles found.
          </li>
        ) : (
          trendingArticles.map((article) => (
            <ArticleCard
              key={article._id}
              article={article}
              variant="trending"
            />
          ))
        )}
      </ul>
    </aside>
  );
}
