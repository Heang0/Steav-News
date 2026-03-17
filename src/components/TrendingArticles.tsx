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

  return (
    <aside className="sticky top-[80px] mb-8">
      {/* Header */}
      <div className="section-title-bar mb-4">
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 3a1 1 0 00-1.928-.375l-3 9A1 1 0 009 13h2v1a1 1 0 002 0v-1h1a1 1 0 00.928-1.375l-2-6z"/>
            <path fillRule="evenodd" d="M4.5 4.5A1.5 1.5 0 006 6h12a1.5 1.5 0 001.5-1.5v-1A1.5 1.5 0 0018 2H6A1.5 1.5 0 004.5 3.5v1zM6 20.5A1.5 1.5 0 014.5 22v-8A1.5 1.5 0 016 12.5h12a1.5 1.5 0 011.5 1.5v8A1.5 1.5 0 0118 22H6z" clipRule="evenodd"/>
          </svg>
          Trending Now
        </h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] flex-shrink-0 rounded-xl bg-gray-200" />
              <div className="flex-grow space-y-2 py-1">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-4/5" />
                <div className="h-2 bg-gray-100 rounded w-1/3 mt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : trendingArticles.length === 0 ? (
        <p className="text-gray-400 text-center text-sm py-6">No trending articles.</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {trendingArticles.map((article, index) => (
            <div key={article._id} className="relative">
              {/* Rank badge */}
              <span className={`absolute top-3 left-0 z-10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold leading-none
                ${index === 0 ? 'bg-primary text-white' : index === 1 ? 'bg-gray-700 text-white' : index === 2 ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'}
              `}>
                {index + 1}
              </span>
              <div className="pl-6">
                <ArticleCard article={article} variant="trending" />
              </div>
            </div>
          ))}
        </ul>
      )}
    </aside>
  );
}
