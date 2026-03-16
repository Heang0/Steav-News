'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-primary text-white fixed top-0 left-0 right-0 z-50 shadow-md">
      <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex justify-between items-center">
        <Link href="/" className="logo font-bold text-xl sm:text-2xl leading-tight">
          STEAV<br className="sm:hidden" /> NEWS
        </Link>

        <button
          className="md:hidden bg-none border-none text-white text-2xl cursor-pointer p-2"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <nav
          className={`
            fixed md:static top-[52px] sm:top-[60px] left-0 right-0
            bg-primary md:bg-transparent
            flex flex-col md:flex-row
            items-center
            transition-all duration-300 ease-in-out
            ${isMenuOpen ? 'block' : 'hidden md:flex'}
            md:gap-6 lg:gap-8
          `}
        >
          <Link 
            href="/" 
            className="w-full md:w-auto text-center md:text-left px-4 py-3 md:py-0 text-white font-bold text-base sm:text-lg hover:bg-primary/80 md:hover:bg-transparent md:hover:underline"
            onClick={() => setIsMenuOpen(false)}
          >
            ទំព័រដើម
          </Link>
          <Link 
            href="/?category=កម្សាន្ត" 
            className="w-full md:w-auto text-center md:text-left px-4 py-3 md:py-0 text-white font-bold text-base sm:text-lg hover:bg-primary/80 md:hover:bg-transparent md:hover:underline"
            onClick={() => setIsMenuOpen(false)}
          >
            កម្សាន្ត
          </Link>
          <Link 
            href="/?category=សង្គម" 
            className="w-full md:w-auto text-center md:text-left px-4 py-3 md:py-0 text-white font-bold text-base sm:text-lg hover:bg-primary/80 md:hover:bg-transparent md:hover:underline"
            onClick={() => setIsMenuOpen(false)}
          >
            សង្គម
          </Link>
          <Link 
            href="/?category=កីឡា" 
            className="w-full md:w-auto text-center md:text-left px-4 py-3 md:py-0 text-white font-bold text-base sm:text-lg hover:bg-primary/80 md:hover:bg-transparent md:hover:underline"
            onClick={() => setIsMenuOpen(false)}
          >
            កីឡា
          </Link>
          <Link 
            href="/?category=ពិភពលោក" 
            className="w-full md:w-auto text-center md:text-left px-4 py-3 md:py-0 text-white font-bold text-base sm:text-lg hover:bg-primary/80 md:hover:bg-transparent md:hover:underline"
            onClick={() => setIsMenuOpen(false)}
          >
            ពិភពលោក
          </Link>
        </nav>
      </div>
    </header>
  );
}
