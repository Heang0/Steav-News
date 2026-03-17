'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full mx-auto mt-[56px] sm:mt-[64px] relative overflow-hidden">
      {/* Slides */}
      <div className="relative w-full pb-[48%] sm:pb-[42%] md:pb-[36%] h-0 overflow-hidden bg-gray-900">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={`absolute top-0 left-0 w-full h-full transition-all duration-700 ease-in-out
              ${currentSlide === index ? 'opacity-100 z-20 scale-100' : 'opacity-0 z-10 scale-105'}`}
          >
            <Image
              src={`/uploads/images/banner${index + 1}.jpg`}
              alt={`Banner ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1300px"
              priority={index === 0}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
                target.src = `https://placehold.co/${w}x${Math.floor(w * 0.38)}/c00000/ffffff?text=STEAV+NEWS`;
              }}
            />
            {/* Dark gradient overlay bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
        ))}

        {/* Prev / Next arrows */}
        <div className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-6 z-30">
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/40 shadow-lg"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-6 z-30">
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/40 shadow-lg"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`rounded-full transition-all duration-300 border border-white/50
                ${currentSlide === index
                  ? 'w-6 sm:w-8 h-2 sm:h-2.5 bg-white'
                  : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/40 hover:bg-white/70'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
