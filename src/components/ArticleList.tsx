'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Article } from '@/types';
import { formatDate, shouldBypassNextImageOptimization } from '@/lib/utils';

interface ArticleListProps {
  onEdit: (article: Article) => void;
}

export default function ArticleList({ onEdit }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const fetchArticles = async () => {
    setLoading(true);
    try {
      // Fetch total count first
      const countRes = await fetch('/api/articles/count');
      if (countRes.ok) {
        const countData = await countRes.json();
        setTotalCount(countData.count);
      }

      // Fetch page data
      const offset = (currentPage - 1) * pageSize;
      const res = await fetch(`/api/articles?limit=${pageSize}&offset=${offset}`);
      if (!res.ok) throw new Error('Failed to fetch articles');
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [currentPage]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    setDeletingId(id);
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Session-ID': sessionId,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete article');
      }

      setArticles(articles.filter((article) => article._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete article');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading articles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trending
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {articles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No articles found. Create your first article!
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-16 w-24 relative rounded overflow-hidden">
                      <Image
                        src={article.image || 'https://placehold.co/100x60/cccccc/ffffff?text=No+Image'}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                        unoptimized={shouldBypassNextImageOptimization(article.image || '')}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2 max-w-xs">
                      {article.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-primary/10 text-primary border border-primary/10">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(article.createdAt || article.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.views || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {article.trending ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Yes
                      </span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => onEdit(article)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
                            handleDelete(article._id);
                          }
                        }}
                        disabled={deletingId === article._id}
                        className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors disabled:opacity-50"
                      >
                        {deletingId === article._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalCount > 0 && (
        <div className="bg-white px-4 py-4 sm:px-6 border-t border-gray-100 mt-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Info text */}
            <div className="text-sm text-gray-500 order-2 sm:order-1">
              Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-gray-900">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-semibold text-gray-900">{totalCount}</span> articles
            </div>

            {/* Controls */}
            {totalCount > pageSize && (
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-primary hover:border-primary transition-all disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-500 disabled:hover:border-gray-200"
                  title="Previous Page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center gap-1.5">
                  {[...Array(Math.ceil(totalCount / pageSize))].map((_, idx) => {
                    const pageNum = idx + 1;
                    // Smart pagination: show first, last, and range around current
                    if (
                      pageNum === 1 ||
                      pageNum === Math.ceil(totalCount / pageSize) ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                            currentPage === pageNum
                              ? 'bg-primary text-white shadow-md shadow-red-100'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <span key={pageNum} className="text-gray-400 px-1">...</span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalCount / pageSize)))}
                  disabled={currentPage === Math.ceil(totalCount / pageSize)}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-primary hover:border-primary transition-all disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-500 disabled:hover:border-gray-200"
                  title="Next Page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
