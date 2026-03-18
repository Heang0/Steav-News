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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 sm:p-6 md:p-8">
        <div className="section-title-bar mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Related Articles</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
