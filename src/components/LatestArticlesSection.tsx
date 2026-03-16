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
    <section className="news-section bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h2 id="articlesSectionTitle" className="text-xl sm:text-2xl md:text-3xl font-bold text-primary text-left mb-4 sm:mb-6">
        {getSectionTitle()}
      </h2>

      <div className="news-cards grid grid-cols-2 gap-3 sm:gap-4">
        {loading ? (
          <p className="text-gray-500 text-center col-span-full py-8">
            Loading articles...
          </p>
        ) : error ? (
          <p className="text-red-500 text-center col-span-full py-8">
            {error}
          </p>
        ) : articles.length === 0 ? (
          <p className="text-gray-500 text-center col-span-full py-8">
            No articles found{category ? ` in the '${category}' category` : ''}
            {search ? ` for "${search}"` : ''}.
          </p>
        ) : (
          articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))
        )}
      </div>

      {!loading && !error && articles.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      )}
    </section>
  );
}
