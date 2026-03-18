import { getTrendingArticles } from '@/lib/article-queries';
import ArticleCard from './ArticleCard';
 
export default async function TrendingArticles() {
  const trendingArticles = await getTrendingArticles(5);

  return (
    <aside className="sticky top-[80px] mb-8">
      {/* Header */}
      <div className="section-title-bar mb-4">
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 3a1 1 0 00-1.928-.375l-3 9A1 1 0 009 13h2v1a1 1 0 002 0v-1h1a1 1 0 00.928-1.375l-2-6z"/>
            <path fillRule="evenodd" d="M4.5 4.5A1.5 1.5 0 006 6h12a1.5 1.5 0 001.5-1.5v-1A1.5 1.5 0 0018 2H6A1.5 1.5 0 004.5 3.5v1zM6 20.5A1.5 1.5 0 014.5 22v-8A1.5 1.5 0 016 12.5h12a1.5 1.5 0 011.5 1.5v8A1.5 1.5 0 0118 22H6z" clipRule="evenodd"/>
          </svg>
          Trending Now
        </h2>
      </div>

      {trendingArticles.length === 0 ? (
        <p className="text-gray-400 text-center text-sm py-6">No trending articles.</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {trendingArticles.map((article, index) => (
            <div key={article._id} className="relative">
              {/* Rank badge */}
              <span className={`absolute top-3 left-0 z-10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold leading-none
                ${index === 0 ? 'bg-primary text-white' : index === 1 ? 'bg-gray-700 text-white' : index === 2 ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'}
              `}>
                {index + 1}
              </span>
              <div className="pl-6">
                <ArticleCard article={article} variant="trending" />
              </div>
            </div>
          ))}
        </ul>
      )}
    </aside>
  );
}
