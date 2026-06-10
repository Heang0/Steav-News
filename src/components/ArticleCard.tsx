import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { formatDate, getOptimizedImageUrl, shouldBypassNextImageOptimization } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'spotlight' | 'trending' | 'compact' | 'bbc-hero' | 'bbc-list';
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
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100 flex-shrink-0 mb-4">
          <Image
            src={getOptimizedImageUrl(article.image, { width: 1200, height: 675, crop: 'fill' }) || 'https://placehold.co/1200x675/cccccc/ffffff?text=No+Image'}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 800px"
            unoptimized={unoptimizedImage}
          />
        </div>
        <div className="flex flex-col px-2">
          <h3 data-nosnippet className="text-2xl sm:text-3xl md:text-[34px] font-extrabold text-gray-900 leading-[1.25] group-hover:text-primary transition-colors mb-3 tracking-tight" style={{ fontFamily: "'Outfit', 'Battambang', sans-serif" }}>
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
      <Link href={articleHref} className="flex gap-4 group items-start py-4 border-b border-gray-200 last:border-0">
        <div className="flex-grow pr-2">
          <h3 data-nosnippet className="text-base sm:text-lg font-bold text-gray-900 leading-snug group-hover:text-primary transition-colors mb-2" style={{ fontFamily: "'Outfit', 'Battambang', sans-serif" }}>
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
          <div className="relative w-[130px] aspect-[16/9] flex-shrink-0 bg-gray-100">
            <Image
              src={getOptimizedImageUrl(article.image, { width: 260, height: 146, crop: 'fill' }) || 'https://placehold.co/260x146/cccccc/ffffff?text=No+Image'}
              alt={article.title}
              fill
              className="object-cover"
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
    <Link href={articleHref} className="block group h-full">
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100 mb-2">
        <Image
          src={cardImage || 'https://placehold.co/400x300/cccccc/ffffff?text=No+Image'}
          alt={article.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px"
          unoptimized={unoptimizedImage}
        />
      </div>
      <div className="flex flex-col">
        <h3 data-nosnippet className="text-base sm:text-lg font-bold text-gray-900 line-clamp-3 leading-snug group-hover:text-primary transition-colors mb-2" style={{ fontFamily: "'Outfit', 'Battambang', sans-serif" }}>
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
