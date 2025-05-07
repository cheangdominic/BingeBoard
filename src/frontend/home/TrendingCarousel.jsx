import { useState } from 'react';
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

export default function TrendingCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = ["Trending 1", "Trending 2", "Trending 3"];

  const nextSlide = () => {
    if (currentSlide === slides.length - 1) {
      setCurrentSlide(0);
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  };
  
  const prevSlide = () => {
    if (currentSlide === 0) {
        setCurrentSlide(2);
      } else {
        setCurrentSlide(currentSlide - 1);
      }
  };

  return (
    <div className="relative mx-auto w-[98vw] sm:w-[99vw] mt-1 sm:mt-2 h-[30vh] sm:h-[50vh] bg-black text-white overflow-hidden rounded-lg">
      <div className="h-full flex transition-transform duration-300" 
           style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {slides.map((content, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 flex items-center justify-center p-6">
            <span className="text-2xl sm:text-4xl">{content}</span>
          </div>
        ))}
      </div>

      <button 
        className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full w-10 h-10 flex items-center justify-center"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <FaArrowLeft size={24} />
      </button>
      
      <button 
        className="absolute top-1/2 right-4 -translate-y-1/2 text-xl rounded-full w-10 h-10 flex items-center justify-center"
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