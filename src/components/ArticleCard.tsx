import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { formatDate, getOptimizedImageUrl, shouldBypassNextImageOptimization } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'spotlight' | 'trending';
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const articleDate = article.createdAt
    ? formatDate(article.createdAt)
    : article.date || 'Unknown Date';
  const cardImage = getOptimizedImageUrl(article.image, {
    width: variant === 'trending' ? 160 : 800,
    height: variant === 'trending' ? 160 : 500,
    crop: 'fill',
  });
  const unoptimizedImage = shouldBypassNextImageOptimization(cardImage);

  const articleHref = `/a/${article.publicId || article._id}`;

  if (variant === 'spotlight') {
    return (
      <Link href={articleHref} className="block group rounded-xl overflow-hidden bg-white border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
        <div className="relative w-full pb-[62%] overflow-hidden">
          <Image
            src={cardImage || 'https://placehold.co/400x250/cccccc/ffffff?text=No+Image'}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 650px"
            unoptimized={unoptimizedImage}
          />
          {/* Category overlay */}
          {article.category && (
            <div className="absolute top-2 left-2">
              <span className="category-badge text-[10px]">{article.category}</span>
            </div>
          )}
        </div>
        <div className="p-2.5 sm:p-4">
          <h3 className="text-sm sm:text-[0.95rem] font-bold text-gray-800 line-clamp-3 mb-1.5 leading-[1.35] group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <div className="flex items-center gap-3 text-gray-400 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              {articleDate}
            </span>
            {article.views !== undefined && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {Intl.NumberFormat('en-US', { notation: 'compact' }).format(article.views)}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'trending') {
    return (
      <li className="group">
        <Link href={articleHref} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg px-1 transition-colors">
          <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] flex-shrink-0 rounded-xl overflow-hidden">
            <Image
              src={cardImage || 'https://placehold.co/100x60/cccccc/ffffff?text=No+Image'}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="72px"
              unoptimized={unoptimizedImage}
            />
          </div>
          <div className="flex-grow min-w-0">
            <span className="block font-bold text-gray-800 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">
              {article.title}
            </span>
            <div className="flex items-center gap-3 text-gray-400 text-[11px] mt-1.5">
              <span>{articleDate}</span>
              {article.views !== undefined && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {Intl.NumberFormat('en-US', { notation: 'compact' }).format(article.views)}
                </span>
              )}
            </div>
          </div>
        </Link>
      </li>
    );
  }

  // Default
  return (
    <Link href={articleHref} className="block group rounded-xl overflow-hidden bg-white border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
      <div className="relative w-full pb-[62%] overflow-hidden">
        <Image
          src={cardImage || 'https://placehold.co/400x250/cccccc/ffffff?text=No+Image'}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px"
          unoptimized={unoptimizedImage}
        />
        {article.category && (
          <div className="absolute top-2 left-2">
            <span className="category-badge text-[10px]">{article.category}</span>
          </div>
        )}
      </div>
      <div className="p-2.5 sm:p-4 flex flex-col">
        <div className="flex items-center gap-3 text-gray-400 text-[11px] sm:text-xs mb-1 sm:mb-1.5">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            {articleDate}
          </span>
          {article.views !== undefined && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {Intl.NumberFormat('en-US', { notation: 'compact' }).format(article.views)}
            </span>
          )}
        </div>
        <h3 className="text-sm sm:text-[0.95rem] font-bold text-gray-800 line-clamp-3 leading-[1.35] group-hover:text-primary transition-colors">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}
