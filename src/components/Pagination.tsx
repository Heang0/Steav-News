'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

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
      <button
        key={`page-${page}`}
        className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-bold transition-all duration-200
          ${isActive
            ? 'bg-primary text-white shadow-md shadow-red-200'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:-translate-y-0.5 hover:shadow-sm'
          }`}
        onClick={() => onPageChange(page)}
        disabled={isDisabled}
      >
        {text}
      </button>
    );
  };

  const renderPaginationItems = () => {
    const items: React.ReactNode[] = [];
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;

    if (isMobile) {
      // Simplified mobile pagination
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
    <button
      key={direction}
      onClick={() => !disabled && onPageChange(page)}
      disabled={disabled}
      aria-label={direction === 'prev' ? 'Previous page' : 'Next page'}
      className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-semibold text-sm transition-all duration-200
        ${disabled
          ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
          : 'bg-gray-100 hover:bg-primary hover:text-white text-gray-600 hover:shadow-md hover:-translate-y-0.5'
        }`}
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
    </button>
  );

  return (
    <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 flex-wrap">
      {arrowBtn(currentPage - 1, 'prev', currentPage === 1)}
      {renderPaginationItems()}
      {arrowBtn(currentPage + 1, 'next', currentPage === totalPages)}
    </div>
  );
}
