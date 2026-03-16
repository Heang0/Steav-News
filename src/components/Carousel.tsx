'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="carousel-container w-full mx-auto mt-[52px] sm:mt-[60px] relative overflow-hidden shadow-lg">
      <div className="carousel relative w-full pb-[50%] sm:pb-[45%] md:pb-[40%] h-0 overflow-hidden">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={`carousel-slide absolute top-0 left-0 w-full h-full flex justify-center items-center opacity-0 transition-opacity duration-700 z-10
              ${currentSlide === index ? 'active opacity-100 z-20' : ''}`}
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
                const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
                target.src = `https://placehold.co/${width}x${Math.floor(width * 0.4)}/e60000/ffffff?text=Banner+${index + 1}`;
              }}
            />
          </div>
        ))}
      </div>

      <div className="carousel-nav absolute top-1/2 w-full flex justify-between items-center px-2 sm:px-4 md:px-12 -translate-y-1/2 z-30">
        <button
          className="bg-black/50 text-white border-none py-1.5 px-3 sm:py-2 sm:px-4 cursor-pointer text-lg sm:text-xl rounded transition-colors hover:bg-black/70 active:scale-95"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          &#10094;
        </button>
        <button
          className="bg-black/50 text-white border-none py-1.5 px-3 sm:py-2 sm:px-4 cursor-pointer text-lg sm:text-xl rounded transition-colors hover:bg-black/70 active:scale-95"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          &#10095;
        </button>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 sm:gap-2">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
              currentSlide === index ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
