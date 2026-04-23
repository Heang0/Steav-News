'use client';

import { useState, useEffect } from 'react';
import { Article } from '@/types';
import { formatDate } from '@/lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    categories: {} as Record<string, number>,
    totalViews: 0,
    totalLikes: 0,
  });
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch all articles to calculate stats (in a real app, this would be a single API call)
        const res = await fetch('/api/articles?limit=1000');
        const data = await res.json();
        
        if (data.success && data.articles) {
          const articles: Article[] = data.articles;
          const categories: Record<string, number> = {};
          let views = 0;
          let likes = 0;

          articles.forEach(a => {
            categories[a.category] = (categories[a.category] || 0) + 1;
            views += (a.views || 0);
            likes += (a.likes || 0);
          });

          setStats({
            total: data.total || articles.length,
            categories,
            totalViews: views,
            totalLikes: likes
          });
          setLatestArticles(articles.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Articles</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Views</p>
              <h3 className="text-2xl font-bold text-gray-900">{Intl.NumberFormat('en-US', { notation: 'compact' }).format(stats.totalViews)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Likes</p>
              <h3 className="text-2xl font-bold text-gray-900">{Intl.NumberFormat('en-US', { notation: 'compact' }).format(stats.totalLikes)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Categories</p>
              <h3 className="text-2xl font-bold text-gray-900">{Object.keys(stats.categories).length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest Articles */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-lg font-bold text-gray-900">Latest Articles</h4>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {latestArticles.map(article => (
                <div key={article._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={article.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{article.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(article.createdAt || article.date)} • {article.category}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {Intl.NumberFormat('en-US', { notation: 'compact' }).format(article.views || 0)} views
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-gray-900">Categories</h4>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            {Object.entries(stats.categories).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
              <div key={cat} className="space-y-1.5">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-700">{cat}</span>
                  <span className="text-gray-900 font-bold">{count}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
