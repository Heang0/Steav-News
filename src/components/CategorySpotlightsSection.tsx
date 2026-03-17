'use client';

import { useCategorySpotlights } from '@/hooks/useCategorySpotlights';
import ArticleCard from './ArticleCard';

interface CategorySpotlightsSectionProps {
  category: string | null;
  search: string | null;
}

export default function CategorySpotlightsSection({ category, search }: CategorySpotlightsSectionProps) {
  const { spotlights, loading: spotlightsLoading, shouldShow } = useCategorySpotlights();

  if (!shouldShow) return null;

  return (
    <section className="mb-6 sm:mb-8">
      <div className="section-title-bar mb-4 sm:mb-5 px-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Highlights
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {spotlightsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-gray-100 animate-pulse">
              <div className="pb-[62%] bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-2.5 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          ))
        ) : spotlights.length === 0 ? (
          <p className="text-gray-400 text-center col-span-full py-8 text-sm">
            No category spotlights available yet.
          </p>
        ) : (
          spotlights.map((article) => (
            <ArticleCard
              key={article._id}
              article={article}
              variant="spotlight"
            />
          ))
        )}
      </div>
    </section>
  );
}
