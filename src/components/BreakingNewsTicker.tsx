'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BreakingNewsTicker({ articles }: { articles: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!articles || articles.length === 0) return null;

  // Duplicate the articles array so the CSS marquee has a seamless infinite loop
  const displayArticles = [...articles, ...articles];

  return (
    <div className="w-full bg-black text-white border-b border-gray-800 overflow-hidden relative flex items-center h-10">
      {/* Red Badge */}
      <div className="absolute left-0 top-0 bottom-0 bg-primary z-10 px-4 flex items-center shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
        <span className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "'Outfit', 'Battambang', sans-serif" }}>
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          ព័ត៌មានទាន់ហេតុការណ៍
        </span>
      </div>

      {/* Scrolling Text */}
      {mounted && (
        <div className="flex whitespace-nowrap pl-[180px] sm:pl-[220px] animate-marquee" style={{ animationDuration: `${articles.length * 5}s` }}>
          {displayArticles.map((article, index) => (
            <Link 
              key={`${article._id}-${index}`} 
              href={`/articles/${article.publicId || article._id}`}
              className="flex items-center text-sm font-medium hover:text-primary transition-colors mx-6 group"
              style={{ fontFamily: "'Battambang', sans-serif" }}
            >
              <span className="text-gray-500 mr-2">/</span>
              {article.title}
            </Link>
          ))}
        </div>
      )}

      {/* Tailwind Marquee Animation CSS inline just for this component */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
}
