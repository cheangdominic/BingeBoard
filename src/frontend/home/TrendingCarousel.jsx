import { useState } from 'react';
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

export default function TrendingCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image: "https://via.placeholder.com",
      alt: "Trending Image 1"
    },
    {
      image: "https://via.placeholder.com",
      alt: "Trending Image 2"
    },
    {
      image: "https://via.placeholder.com",
      alt: "Trending Image 3"
    }
  ];

  const nextSlide = () => {
    if (currentSlide === slides.length - 1) {
      setCurrentSlide(0);
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  };
  
  const prevSlide = () => {
    if (currentSlide === 0) {
      setCurrentSlide(slides.length - 1);
    } else {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="relative mx-auto w-[97vw] sm:w-[97.5vw] mt-2 sm:mt-3 h-[30vh] sm:h-[50vh] bg-black text-white overflow-hidden rounded-lg">
      <div className="h-full flex transition-transform duration-300" 
           style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {slides.map((slide, index) => (
          <div key={index} className="w-full h-full flex-shrink-0">
            <img 
              src={slide.image} 
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <button 
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <FaArrowLeft size={24} />
      </button>
      
      <button 
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <FaArrowRight size={24} />
      </button>

      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-gray-500'
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}