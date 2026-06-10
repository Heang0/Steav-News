import Link from 'next/link';
import { getCategorySlug } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  category?: string | null;
  search?: string | null;
  baseUrl?: string;
}

export default function Pagination({ currentPage, totalPages, category, search, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();

    if (search) {
      if (page > 1) params.set('page', String(page));
      const query = params.toString();
      return `/search/${encodeURIComponent(search)}${query ? `?${query}` : ''}`;
    }

    if (page > 1) params.set('page', String(page));
    const query = params.toString();

    if (baseUrl) {
      return `${baseUrl}${query ? `?${query}` : ''}`;
    }

    if (category) {
      return `/category/${getCategorySlug(category)}${query ? `?${query}` : ''}`;
    }

    return query ? `/?${query}` : '/';
  };

  const appendPaginationItem = (
    page: number | null,
    text: string,
    isActive = false,
    isDisabled = false
  ) => {
    if (page === null) {
      return (
        <span
          key={`ellipsis-${text}`}
          className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-gray-400 text-sm"
        >
          …
        </span>
      );
    }

    return (
      <Link
        key={`page-${page}`}
        href={buildPageHref(page)}
        className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-none text-sm font-bold transition-all duration-200 border
          ${isActive
            ? 'bg-primary text-white border-primary shadow-none'
            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-none'
          }`}
        aria-current={isActive ? 'page' : undefined}
      >
        {text}
      </Link>
    );
  };

  const renderPaginationItems = () => {
    const items: React.ReactNode[] = [];
    const compactPagination = totalPages > 5;

    if (compactPagination) {
      let pagesToDisplay = new Set<number>();
      pagesToDisplay.add(1);
      if (totalPages >= 2) pagesToDisplay.add(2);
      pagesToDisplay.add(currentPage);
      if (totalPages > 2) pagesToDisplay.add(totalPages);

      let sortedPages = Array.from(pagesToDisplay)
        .filter((p) => p >= 1 && p <= totalPages)
        .sort((a, b) => a - b);

      let lastPrintedPage = 0;
      for (const page of sortedPages) {
        if (page > lastPrintedPage + 1) {
          items.push(appendPaginationItem(null, '...'));
        }
        items.push(appendPaginationItem(page, String(page), page === currentPage));
        lastPrintedPage = page;
      }
    } else {
      // Desktop pagination with more context
      let pagesToDisplay = new Set<number>();
      pagesToDisplay.add(1);
      if (totalPages >= 2) pagesToDisplay.add(2);

      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        if (i > 0 && i <= totalPages) {
          pagesToDisplay.add(i);
        }
      }

      if (totalPages > 0) pagesToDisplay.add(totalPages);

      let sortedPages = Array.from(pagesToDisplay)
        .filter((page) => page >= 1 && page <= totalPages)
        .sort((a, b) => a - b);

      let lastPrintedPage = 0;
      for (const page of sortedPages) {
        if (page > lastPrintedPage + 1) {
          items.push(appendPaginationItem(null, '...'));
        }
        items.push(appendPaginationItem(page, String(page), page === currentPage));
        lastPrintedPage = page;
      }
    }

    return items;
  };

  const arrowBtn = (page: number, direction: 'prev' | 'next', disabled: boolean) => (
    disabled ? (
      <span
        key={direction}
        aria-disabled="true"
        className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-none font-semibold text-sm bg-gray-50 text-gray-300 border border-gray-200 cursor-not-allowed"
      >
        {direction === 'prev' ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </span>
    ) : (
      <Link
        key={direction}
        href={buildPageHref(page)}
        aria-label={direction === 'prev' ? 'Previous page' : 'Next page'}
        className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-none border border-gray-200 font-semibold text-sm transition-all duration-200 bg-white hover:bg-primary hover:text-white hover:border-primary text-gray-600 shadow-none"
      >
        {direction === 'prev' ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </Link>
    )
  );

  return (
    <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 flex-wrap">
      {arrowBtn(currentPage - 1, 'prev', currentPage === 1)}
      {renderPaginationItems()}
      {arrowBtn(currentPage + 1, 'next', currentPage === totalPages)}
    </div>
  );
}
