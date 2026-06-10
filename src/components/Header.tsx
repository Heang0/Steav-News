'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'ទំព័រដើម' },
  { href: '/category/entertainment', label: 'កម្សាន្ត' },
  { href: '/category/society', label: 'សង្គម' },
  { href: '/category/love', label: 'ស្នេហា' },
  { href: '/category/world', label: 'ពិភពលោក' },
  { href: '/newspaper', label: 'ធ្វើកាសែត' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (searchTerm.trim()) {
      router.push(`/search/${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push(`/`);
    }
    
    setIsSearchOpen(false); // Close search on mobile after searching
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200' 
        : 'bg-white border-b border-gray-200'
    }`}>

      {/* Search Overlay Dropdown */}
      <div className={`w-full bg-white border-b border-gray-200 overflow-hidden transition-all duration-300 ${isSearchOpen ? 'max-h-[80px] py-4' : 'max-h-0 py-0 border-transparent'}`}>
        <div className="container mx-auto px-4 max-w-[1400px]">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative w-full flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ស្វែងរកព័ត៌មាន..."
                className="w-full bg-gray-50 border border-gray-300 rounded-none focus:border-primary focus:ring-1 focus:ring-primary px-4 py-2.5 text-base outline-none"
                autoFocus={isSearchOpen}
              />
              <button type="submit" className="bg-primary text-white px-6 py-2.5 font-bold hover:bg-primary-dark transition-colors">
                ស្វែងរក
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-[1400px]">
        <div className="flex items-center justify-between h-14 sm:h-16 relative">
          
          {/* MOBILE LEFT: Hamburger */}
          <div className="flex-1 md:hidden flex justify-start">
            <button
              className="p-2 -ml-2 text-black hover:text-primary transition-colors focus:outline-none"
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                setIsSearchOpen(false);
              }}
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                {isMenuOpen ? (
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* DESKTOP LEFT / MOBILE CENTER: Logo */}
          <div className="flex-shrink-0 flex justify-center md:justify-start">
            <Link href="/" className="flex items-center h-full py-2" onClick={() => setIsMenuOpen(false)}>
              <div className="relative h-9 w-24 sm:h-11 sm:w-32 flex-shrink-0">
                <Image
                  src="/uploads/images/LOGO.jpg"
                  alt="STEAV NEWS Logo"
                  fill
                  className="object-contain object-center md:object-left"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* DESKTOP CENTER: Navigation Links */}
          <nav className="hidden md:flex flex-1 justify-start ml-8 h-full">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="h-full flex items-center px-4 font-bold text-[14px] text-gray-800 hover:text-primary transition-colors relative group border-l border-gray-100 first:border-0"
              >
                {link.label}
                {/* Red Underline strictly matching BBC hover style */}
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            ))}
          </nav>

          {/* RIGHT: Search Icon */}
          <div className="flex-1 md:flex-none flex justify-end">
            <button 
              className="p-2 -mr-2 text-black hover:text-primary transition-colors flex items-center gap-2 font-bold focus:outline-none"
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                setIsMenuOpen(false);
              }}
            >
              {isSearchOpen ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                   <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              <span className="hidden lg:block text-[14px] ml-1">ស្វែងរក</span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-b border-gray-200 shadow-xl ${
          isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 border-transparent'
        }`}
      >
        <nav className="flex flex-col">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-bold text-[16px] py-4 px-6 border-b border-gray-100 last:border-0 hover:text-primary hover:bg-gray-50 transition-colors text-black"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
