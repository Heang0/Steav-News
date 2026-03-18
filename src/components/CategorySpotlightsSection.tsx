import { getCategorySpotlights } from '@/lib/article-queries';
import ArticleCard from './ArticleCard';

interface CategorySpotlightsSectionProps {
  category: string | null;
  search: string | null;
}

export default async function CategorySpotlightsSection({ category, search }: CategorySpotlightsSectionProps) {
  if (category || search) return null;

  const spotlights = await getCategorySpotlights();

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
        {spotlights.length === 0 ? (
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
