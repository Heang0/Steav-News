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
          className="pagination-button px-3 py-2 text-gray-500"
        >
          {text}
        </span>
      );
    }

    return (
      <button
        key={`page-${page}`}
        className={`pagination-button px-3 sm:px-4 py-2 rounded text-sm sm:text-base font-semibold transition-colors min-w-[40px] sm:min-w-[48px]
          ${isActive 
            ? 'bg-primary text-white' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
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

  return (
    <div className="pagination-container flex justify-center items-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 flex-wrap">
      {appendPaginationItem(
        currentPage - 1,
        'Previous',
        false,
        currentPage === 1
      )}

      {renderPaginationItems()}

      {appendPaginationItem(
        currentPage + 1,
        'Next',
        false,
        currentPage === totalPages
      )}
    </div>
  );
}
