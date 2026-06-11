import { getArticleList } from '@/lib/article-queries';
import ArticleCard from './ArticleCard';

export default async function VideoNewsSection() {
  // Fetch up to 4 articles that have a Facebook Video URL
  const { articles: videoArticles } = await getArticleList({
    limit: 4,
    hasVideo: true,
  });

  if (!videoArticles || videoArticles.length === 0) {
    return null; // Hide section if no videos are available
  }

  return (
    <section className="bg-[#111111] w-full py-12 border-y border-gray-800 my-8">
      <div className="container mx-auto px-4 max-w-[1300px]">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 pb-3 border-b-2 border-gray-800">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2" style={{ fontFamily: "'Outfit', 'Battambang', sans-serif" }}>
            <span className="text-primary">▶</span> វីដេអូព័ត៌មាន
          </h2>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            Watch Now
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {videoArticles.map((article) => (
            <div key={article._id}>
              <ArticleCard article={article} variant="video" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
