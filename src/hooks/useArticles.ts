'use client';

import { useState, useEffect } from 'react';
import { Article } from '@/types';

interface UseArticlesOptions {
  initialLimit?: number;
  category?: string | null;
  search?: string | null;
}

export function useArticles({ initialLimit = 6, category, search }: UseArticlesOptions = {}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const articlesPerPage = initialLimit;
  const totalPages = Math.ceil(totalArticles / articlesPerPage);

  const fetchArticles = async (page: number = currentPage) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('limit', articlesPerPage.toString());
      params.set('offset', ((page - 1) * articlesPerPage).toString());

      if (category) params.set('category', category);
      if (search) params.set('search', search);

      const [articlesRes, countRes] = await Promise.all([
        fetch(`/api/articles?${params.toString()}`),
        fetch(`/api/articles/count?${params.toString()}`),
      ]);

      if (!articlesRes.ok || !countRes.ok) {
        throw new Error('Failed to fetch articles');
      }

      const articlesData = await articlesRes.json();
      const countData = await countRes.json();

      setArticles(articlesData);
      setTotalArticles(countData.count);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(1);
  }, [category, search]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchArticles(page);
    }
  };

  return {
    articles,
    totalArticles,
    currentPage,
    totalPages,
    loading,
    error,
    goToPage,
    refresh: () => fetchArticles(currentPage),
  };
}
