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
    <section className="category-spotlight-section mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary text-left mb-4 sm:mb-6">
        Highlights
      </h2>
      <div className="category-spotlight-grid grid grid-cols-2 gap-3 sm:gap-4">
        {spotlightsLoading ? (
          <p className="text-gray-500 text-center col-span-full py-8">
            Loading category highlights...
          </p>
        ) : spotlights.length === 0 ? (
          <p className="text-gray-500 text-center col-span-full py-8">
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
