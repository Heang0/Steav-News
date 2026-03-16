'use client';

import { useState, useEffect } from 'react';
import { Article } from '@/types';

export function useCategorySpotlights() {
  const [spotlights, setSpotlights] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldShow, setShouldShow] = useState(true);

  const fetchSpotlights = async () => {
    try {
      const res = await fetch('/api/categories/homepage-previews');
      if (!res.ok) throw new Error('Failed to fetch category spotlights');

      const data = await res.json();
      setSpotlights(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if we should show spotlights (hide on category filter or search)
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFilter = urlParams.get('category');
    const searchTerm = urlParams.get('search');

    if (categoryFilter || searchTerm) {
      setShouldShow(false);
    } else {
      setShouldShow(true);
      fetchSpotlights();
    }
  }, []);

  return {
    spotlights,
    loading,
    error,
    shouldShow,
    refresh: fetchSpotlights,
  };
}
