import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { formatDate } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'spotlight' | 'trending';
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const articleDate = article.createdAt
    ? formatDate(article.createdAt)
    : article.date || 'Unknown Date';

  // Always use clean URL format: /a/shortId or /a/objectId
  const articleHref = article.shortId 
    ? `/a/${article.shortId}`
    : `/a/${article._id}`;

  if (variant === 'spotlight') {
    return (
      <Link
        href={articleHref}
        className="category-spotlight-card card block group"
      >
        <div className="card-image relative w-full pb-[60%] overflow-hidden border-b border-gray-100">
          <Image
            src={article.image || 'https://placehold.co/400x250/cccccc/ffffff?text=No+Image'}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 650px"
          />
        </div>
        <div className="card-content p-3 sm:p-4">
          <p className="card-category text-primary font-semibold text-xs sm:text-sm mb-2">
            {article.category || 'General'}
          </p>
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-3 mb-2">
            {article.title}
          </h3>
          <p className="card-date text-gray-500 text-xs sm:text-sm">
            {articleDate}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === 'trending') {
    return (
      <li className="flex items-center mb-3 sm:mb-4 bg-white p-2 sm:p-3 rounded-lg shadow-sm">
        <Link href={articleHref} className="flex items-center w-full">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 mr-3 sm:mr-4 rounded overflow-hidden">
            <Image
              src={article.image || 'https://placehold.co/100x60/cccccc/ffffff?text=No+Image'}
              alt={article.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <span className="flex-grow font-bold text-gray-800 text-sm sm:text-base line-clamp-2">
            {article.title}
          </span>
        </Link>
      </li>
    );
  }

  // Default variant
  return (
    <Link
      href={articleHref}
      className="card block group min-h-[200px] sm:min-h-[250px]"
    >
      <div className="card-image relative w-full pb-[60%] overflow-hidden border-b border-gray-100">
        <Image
          src={article.image || 'https://placehold.co/400x250/cccccc/ffffff?text=No+Image'}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px"
        />
      </div>
      <div className="card-content p-3 sm:p-4 flex flex-col flex-grow">
        <p className="card-date text-gray-500 text-xs sm:text-sm mb-2">
          {articleDate}
        </p>
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-3 mb-2">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}
