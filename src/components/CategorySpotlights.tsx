import { getCategorySpotlights } from '@/lib/article-queries';
import { getCategorySlug } from '@/lib/utils';
import ArticleCard from './ArticleCard';
import Link from 'next/link';

export default async function CategorySpotlights({ excludeIds = [] }: { excludeIds?: string[] }) {
  const spotlights = await getCategorySpotlights(excludeIds);

  if (!spotlights || spotlights.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
      {spotlights.map((article) => (
        <section key={article._id} className="flex flex-col">
          <div className="flex justify-between items-center mb-3 border-b border-gray-900 pb-1">
            <h2 className="text-lg font-bold text-gray-900 uppercase">
              <span className="text-primary mr-1">/</span>{article.category}
            </h2>
            <Link 
              href={`/category/${getCategorySlug(article.category || '')}`}
              className="text-primary hover:text-red-700 text-sm font-bold tracking-wider flex items-center gap-1 group"
              style={{ fontFamily: "'Noto Sans Khmer', 'Battambang', sans-serif" }}
            >
              មើលបន្ថែម
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="flex-grow">
            <ArticleCard article={article} variant="default" />
          </div>
        </section>
      ))}
    </div>
  );
}
