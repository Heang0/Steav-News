'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
      params.set('page', '1');
    } else {
      params.delete('search');
    }
    
    router.push(`/?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-bar-container w-full px-3 sm:px-4 py-4 sm:py-6">
      <div className="max-w-[1300px] mx-auto flex gap-2">
        <input
          type="text"
          id="searchInput"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search articles by title or content..."
          className="input-field flex-grow text-base sm:text-base py-2.5 sm:py-2.5 min-h-[44px]"
        />
        <button
          id="searchButton"
          onClick={handleSearch}
          className="btn-primary px-4 sm:px-6 py-2.5 sm:py-2.5 text-base sm:text-base whitespace-nowrap min-h-[44px]"
        >
          Search
        </button>
      </div>
    </div>
  );
}
