'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/', label: 'ទំព័រដើម' },
  { href: '/?category=កម្សាន្ត', label: 'កម្សាន្ត' },
  { href: '/?category=សង្គម', label: 'សង្គម' },
  { href: '/?category=ស្នេហា', label: 'ស្នេហា' },
  { href: '/?category=ពិភពលោក', label: 'ពិភពលោក' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-primary/95 backdrop-blur-md shadow-md border-primary-dark/50'
          : 'bg-gradient-to-r from-primary via-[#d40000] to-primary-dark border-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-0 flex items-center justify-between h-[60px] sm:h-[70px]">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 select-none group"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="flex flex-col justify-center leading-none">
            <span className="text-white font-extrabold text-xl sm:text-2xl tracking-tight group-hover:text-white/90 transition-colors"
              style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
              STEAV
            </span>
            <span className="text-white/90 font-bold text-[10px] sm:text-xs tracking-[0.18em] uppercase">
              NEWS
            </span>
          </div>
          {/* Divider bar */}
          <div className="w-px h-8 bg-white/30 hidden sm:block" />
          <span className="hidden sm:block text-white/80 text-xs font-semibold max-w-[120px] leading-tight">
            ព័ត៌មានទូទៅ
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-white/90 font-bold text-sm px-4 py-2 rounded-xl hover:text-white hover:bg-white/10 transition-all duration-200 group"
            >
              {link.label}
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-white rounded-full group-hover:w-1/2 transition-all duration-200" />
            </Link>
          ))}
        </nav>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors gap-1.5 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-primary border-t border-white/20 shadow-lg ${
          isMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/90 font-bold text-base py-3 px-4 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
