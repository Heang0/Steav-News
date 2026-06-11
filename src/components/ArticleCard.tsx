import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { formatDate, getOptimizedImageUrl, shouldBypassNextImageOptimization } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'spotlight' | 'trending' | 'compact' | 'bbc-hero' | 'bbc-list' | 'video';
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const articleDate = article.createdAt
    ? formatDate(article.createdAt)
    : article.date || 'Unknown Date';
  const cardImage = getOptimizedImageUrl(article.image, {
    width: variant === 'spotlight' ? 1200 : (variant === 'trending' ? 160 : 800),
    height: variant === 'spotlight' ? 630 : (variant === 'trending' ? 160 : 450),
    crop: 'fill',
  });
  const unoptimizedImage = shouldBypassNextImageOptimization(cardImage);

  const articleHref = `/a/${article.publicId || article._id}`;

  if (variant === 'bbc-hero') {
    return (
      <Link href={articleHref} className="flex flex-col group w-full h-full pb-4">
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100 flex-shrink-0 mb-4 border-b-4 border-transparent group-hover:border-primary transition-colors">
          <Image
            src={getOptimizedImageUrl(article.image, { width: 1200, height: 675, crop: 'fill' }) || 'https://placehold.co/1200x675/cccccc/ffffff?text=No+Image'}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 1024px) 100vw, 800px"
            unoptimized={unoptimizedImage}
          />
        </div>
        <div className="flex flex-col px-2">
          <h3 data-nosnippet className="text-2xl sm:text-3xl md:text-[36px] font-black text-gray-900 leading-[1.2] group-hover:text-primary transition-colors mb-3 tracking-tight group-hover:underline decoration-2 underline-offset-4" style={{ fontFamily: "'Outfit', 'Battambang', sans-serif" }}>
            {article.title}
          </h3>
          <div className="flex items-center gap-3 text-gray-600 text-sm font-semibold">
            {article.category && (
              <>
                <span className="text-primary font-bold uppercase tracking-wider">{article.category}</span>
                <span className="w-1 h-1 bg-gray-300"></span>
              </>
            )}
            <span className="flex items-center">
              {articleDate}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'bbc-list') {
    return (
      <Link href={articleHref} className="flex gap-4 group items-start py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors -mx-4 px-4 last:border-0">
        <div className="flex-grow pr-2">
          <h3 data-nosnippet className="text-base sm:text-lg font-bold text-gray-900 leading-snug group-hover:text-primary transition-colors mb-2 group-hover:underline decoration-2 underline-offset-2" style={{ fontFamily: "'Outfit', 'Battambang', sans-serif" }}>
            {article.title}
          </h3>
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold">
            <span className="flex items-center">{articleDate}</span>
            {article.category && (
              <>
                <span className="w-1 h-1 bg-gray-300"></span>
                <span className="text-primary font-bold uppercase">{article.category}</span>
              </>
            )}
          </div>
        </div>
        {article.image && (
          <div className="relative w-[130px] aspect-[16/9] flex-shrink-0 bg-gray-100 overflow-hidden border border-gray-200 group-hover:border-primary transition-colors">
            <Image
              src={getOptimizedImageUrl(article.image, { width: 260, height: 146, crop: 'fill' }) || 'https://placehold.co/260x146/cccccc/ffffff?text=No+Image'}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="130px"
              unoptimized={unoptimizedImage}
            />
          </div>
        )}
      </Link>
    );
  }

  if (variant === 'spotlight') {
    return (
      <Link href={articleHref} className="flex flex-col md:flex-row gap-4 md:gap-6 group w-full h-full items-start">
        <div className="relative w-full md:w-[65%] aspect-[16/9] overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
          <Image
            src={cardImage || 'https://placehold.co/1200x800/cccccc/ffffff?text=No+Image'}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 800px"
            unoptimized={unoptimizedImage}
          />
        </div>
        <div className="flex flex-col md:w-[35%]">
          <h3 data-nosnippet className="text-2xl sm:text-[28px] font-extrabold text-gray-900 leading-[1.2] group-hover:text-primary transition-colors mb-3" style={{ fontFamily: "'Outfit', 'Battambang', sans-serif" }}>
            {article.title}
          </h3>
            
            <div className="flex items-center gap-3 text-gray-500 text-xs sm:text-sm font-semibold mt-1">
              {article.category && (
                <>
                  <span className="text-primary font-bold uppercase tracking-wider">{article.category}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                </>
              )}
              <span className="flex items-center">
                {articleDate}
              </span>
            </div>
          </div>
      </Link>
    );
  }

  if (variant === 'trending') {
    return (
      <li className="group py-3 border-b border-gray-200 last:border-0">
        <Link href={articleHref} className="flex flex-col">
          <span data-nosnippet className="block font-bold text-gray-900 text-sm sm:text-[15px] leading-snug group-hover:text-primary transition-colors">
            {article.title}
          </span>
        </Link>
      </li>
    );
  }

  if (variant === 'video') {
    return (
      <Link href={articleHref} className="block group h-full hover:-translate-y-1 transition-transform duration-300">
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-800 mb-3 rounded-lg shadow-md border border-gray-800 group-hover:border-primary transition-colors">
          <Image
            src={cardImage || 'https://placehold.co/400x300/111111/ffffff?text=No+Image'}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px"
            unoptimized={unoptimizedImage}
          />
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg group-hover:bg-primary group-hover:scale-110 transition-all duration-300 backdrop-blur-sm">
              <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex flex-col px-1">
          <h3 data-nosnippet className="text-base sm:text-lg font-bold text-white line-clamp-3 leading-snug group-hover:text-primary transition-colors mb-2" style={{ fontFamily: "'Outfit', 'Battambang', sans-serif" }}>
            {article.title}
          </h3>
          <div className="flex items-center gap-2 text-gray-400 text-[11px] sm:text-xs font-semibold mt-1">
            {article.category && (
              <>
                <span className="text-primary font-bold">{article.category}</span>
                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              </>
            )}
            <span className="flex items-center">
              {articleDate}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={articleHref} className="flex gap-3 group h-full items-start pb-4 border-b border-gray-200 last:border-0 last:pb-0">
        <div className="flex-grow">
          <h3 data-nosnippet className="text-sm sm:text-[15px] font-bold text-gray-900 line-clamp-3 leading-snug group-hover:text-primary transition-colors mb-1.5" style={{ fontFamily: "'Outfit', 'Battambang', sans-serif" }}>
            {article.title}
          </h3>
          <div className="flex items-center gap-2 text-gray-500 text-[11px] font-semibold mt-1">
            {article.category && (
              <>
                <span className="text-primary font-bold">{article.category}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              </>
            )}
            <span className="flex items-center">
              {articleDate}
            </span>
          </div>
        </div>
        {article.image && (
          <div className="relative w-[100px] sm:w-[120px] aspect-[4/3] flex-shrink-0 bg-gray-100">
            <Image
              src={getOptimizedImageUrl(article.image, { width: 300, height: 225, crop: 'fill' }) || 'https://placehold.co/300x225/cccccc/ffffff?text=No+Image'}
              alt={article.title}
              fill
              className="object-cover"
              sizes="120px"
              unoptimized={unoptimizedImage}
            />
          </div>
        )}
      </Link>
    );
  }

  // Default
  return (
    <Link href={articleHref} className="block group h-full hover:bg-gray-50 transition-colors -mx-2 p-2 sm:-mx-4 sm:p-4 border border-transparent hover:border-gray-100">
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100 mb-3 border-b-2 border-transparent group-hover:border-primary transition-colors">
        <Image
          src={cardImage || 'https://placehold.co/400x300/cccccc/ffffff?text=No+Image'}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px"
          unoptimized={unoptimizedImage}
        />
      </div>
      <div className="flex flex-col">
        <h3 data-nosnippet className="text-base sm:text-lg font-bold text-gray-900 line-clamp-3 leading-snug group-hover:text-primary transition-colors mb-2 group-hover:underline decoration-1 underline-offset-2" style={{ fontFamily: "'Outfit', 'Battambang', sans-serif" }}>
          {article.title}
        </h3>
        <div className="flex items-center gap-2 text-gray-500 text-[11px] sm:text-xs font-semibold mt-1">
          {article.category && (
            <>
              <span className="text-primary font-bold">{article.category}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            </>
          )}
          <span className="flex items-center">
            {articleDate}
          </span>
        </div>
      </div>
    </Link>
  );
}
