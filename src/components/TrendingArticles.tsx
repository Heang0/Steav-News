import { getTrendingArticles } from '@/lib/article-queries';
import Link from 'next/link';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/utils';

export default async function TrendingArticles() {
  const trendingArticles = await getTrendingArticles(5);

  return (
    <aside className="sticky top-[80px] mb-8">
      {/* Header */}
      <div className="section-title-bar mb-5">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Outfit', 'Battambang', sans-serif" }}>
          កំពុងពេញនិយម
        </h2>
      </div>

      {trendingArticles.length === 0 ? (
        <p className="text-gray-400 text-center text-sm py-6">No trending articles.</p>
      ) : (
        <ul className="flex flex-col">
          {trendingArticles.map((article, index) => (
            <li key={article._id} className="group border-b border-gray-200 last:border-0 py-4">
              <Link href={`/a/${article.publicId || article._id}`} className="flex gap-3 items-start">
                {/* Big Red Number */}
                <div className="text-[28px] font-bold text-primary mt-[-2px] leading-none w-5 flex-shrink-0 text-center" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {index + 1}
                </div>
                
                {/* Small Image Thumbnail */}
                {article.image && (
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-none overflow-hidden bg-gray-100">
                    <Image
                      src={getOptimizedImageUrl(article.image, { width: 150, height: 150, crop: 'fill', applyWatermark: article.applyWatermark }) || '/uploads/images/LOGO.jpg'}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized={!article.image?.startsWith('http')}
                    />
                  </div>
                )}

                {/* Headline */}
                <div className="flex-grow">
                  <span className="block font-bold text-gray-900 text-[14px] leading-snug group-hover:text-primary transition-colors line-clamp-3">
                    {article.title}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
