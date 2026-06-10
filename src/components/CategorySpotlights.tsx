import { getCategorySpotlights } from '@/lib/article-queries';
import { getCategorySlug } from '@/lib/utils';
import ArticleCard from './ArticleCard';
import Link from 'next/link';

export default async function CategorySpotlights({ excludeIds = [] }: { excludeIds?: string[] }) {
  const spotlights = await getCategorySpotlights(excludeIds);

  if (!spotlights || spotlights.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {spotlights.map((article) => (
        <section key={article._id} className="border-b border-gray-200 pb-8 last:border-0 last:pb-0">
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight border-l-4 border-primary pl-3">
              {article.category}
            </h2>
            <Link 
              href={`/category/${getCategorySlug(article.category || '')}`}
              className="text-primary hover:text-red-700 text-sm font-bold flex items-center gap-1"
            >
              មើលបន្ថែម
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1">
            <ArticleCard article={article} variant="spotlight" />
          </div>
        </section>
      ))}
    </div>
  );
}
