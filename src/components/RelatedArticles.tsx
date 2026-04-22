import { Article } from '@/types';
import ArticleCard from './ArticleCard';

interface RelatedArticlesProps {
  articles: Article[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="mt-6 sm:mt-8">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 sm:p-6 md:p-8 overflow-hidden">
        <div className="section-title-bar mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Related Articles</h2>
        </div>

        <div className="-mx-5 sm:-mx-6 md:-mx-8 -mb-5 sm:-mb-6 md:-mb-8">
          <div className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
