'use client';

import { useArticles } from '@/hooks/useArticles';
import ArticleCard from './ArticleCard';
import Pagination from './Pagination';

interface LatestArticlesSectionProps {
  category: string | null;
  search: string | null;
}

export default function LatestArticlesSection({ category, search }: LatestArticlesSectionProps) {
  const { articles, currentPage, totalPages, loading, error, goToPage } = useArticles({
    initialLimit: 6,
    category,
    search,
  });

  const getSectionTitle = () => {
    if (category) return category;
    if (search) return `Search Results for "${search}"`;
    return 'Latest Articles';
  };

  return (
    <section className="mb-8">
      {/* Section Header */}
      <div className="section-title-bar mb-4 sm:mb-6 px-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
          {getSectionTitle()}
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {loading ? (
          // Skeleton placeholders
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
        ) : error ? (
          <p className="text-red-500 text-center col-span-full py-10">{error}</p>
        ) : articles.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <svg className="w-14 h-14 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p className="text-gray-400 text-sm sm:text-base">
              No articles found{category ? ` in '${category}'` : ''}{search ? ` for "${search}"` : ''}.
            </p>
          </div>
        ) : (
          articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))
        )}
      </div>

      {!loading && !error && articles.length > 0 && (
        <div className="mt-5 sm:mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </div>
      )}
    </section>
  );
}
