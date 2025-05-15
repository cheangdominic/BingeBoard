import { useState, useEffect } from 'react';
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { Apple } from "lucide-react";

function AppleRating({ rating = 0 }) {
  const fullApples = Math.floor(rating);
  const partialFillPercent = (rating - fullApples) * 100;
  const hasPartialApple = partialFillPercent > 0;
  const emptyApples = 5 - fullApples - (hasPartialApple ? 1 : 0);

  const PartialApple = ({ fillPercent }) => (
    <div className="relative w-5 h-5 inline-block">
      <Apple className="absolute top-0 left-0 w-5 h-5 text-gray-400" />
      <div className="absolute top-0 left-0 h-5 overflow-hidden" style={{ width: `${fillPercent}%` }}>
        <Apple className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      </div>
    </div>
  );

  return (
    <div className="flex gap-1">
      {[...Array(fullApples)].map((_, i) => (
        <Apple key={`full-${i}`} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      ))}
      {hasPartialApple && (
        <PartialApple key="partial" fillPercent={partialFillPercent} />
      )}
      {[...Array(emptyApples)].map((_, i) => (
        <Apple key={`empty-${i}`} className="w-5 h-5 text-gray-400" />
      ))}
    </div>
  );
}

export default function TrendingCarousel({
  tmdbEndpoint = "top_rated",
  mediaType = "tv",
  slideLimit = 10
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [trendingShows, setTrendingShows] = useState([]);

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  useEffect(() => {
    const fetchTrendingShows = async () => {
      if (!API_KEY) {
        console.error("TMDB API Key is missing.");
        return;
      }

      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/${mediaType}/${tmdbEndpoint}?api_key=${API_KEY}&language=en-US&page=1`
        );

        const limitedResults = res.data.results.slice(0, slideLimit);

        const showDetails = await Promise.all(
          limitedResults.map(async (show) => {
            if (mediaType === "tv") {
              try {
                const details = await axios.get(
                  `https://api.themoviedb.org/3/tv/${show.id}?api_key=${API_KEY}&language=en-US`
                );
                return {
                  id: show.id,
                  name: show.name,
                  title: show.title,
                  backdrop_path: show.backdrop_path,
                  number_of_episodes: details.data.number_of_episodes,
                  number_of_seasons: details.data.number_of_seasons,
                  overview: details.data.overview,
                  vote_average: details.data.vote_average,
                };
              } catch (error) {
                console.error("Error fetching TV show details", error);
              }
            }
            return show;
          })
        );

        setTrendingShows(showDetails);
      } catch (error) {
        console.error("Failed to fetch trending shows:", error);
      }
    };

    fetchTrendingShows();
  }, [API_KEY, tmdbEndpoint, mediaType, slideLimit]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % trendingShows.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? trendingShows.length - 1 : prev - 1
    );
  };

  return (
    <div className="relative mx-auto w-[97vw] sm:w-[97.5vw] mt-2 sm:mt-3 h-[30vh] sm:h-[50vh] bg-black text-white overflow-hidden rounded-lg">
      <div
        className="h-full flex transition-transform duration-300"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {trendingShows.map((show) => (
          <div key={show.id} className="w-full h-full flex-shrink-0 relative">
            <Link to={`/show/${show.id}`}>
              <img
                src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
                alt={show.name || show.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-0 sm:top-[62%] lg:top-[65%] bg-black/70 w-full h-full px-4 pt-3 sm:pt-2 text-white rounded-lg flex flex-col justify-start">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm font-semibold">
                    <span className="text-white text-base sm:text-lg">
                      {show.name || show.title}
                    </span>
                    <span className="text-white text-opacity-70 font-semibold">
                      {show.number_of_seasons} Season{show.number_of_seasons > 1 ? "s" : ""} • {show.number_of_episodes} Episode{show.number_of_episodes > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center mr-4 gap-1.5 font-semibold text-yellow-400 text-opacity-90">
                    {Math.round(show.vote_average / 2 * 100) / 100}
                    <AppleRating rating={Math.round((show.vote_average / 2) * 100) / 100} />
                  </div>
                </div>
                <div
                  className="overflow-hidden text-md pt-1 sm:text-lg sm:pt-0 text-[#d5d5d5] pr-2 line-clamp-4 sm:line-clamp-2"
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {show.overview}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <button
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/20 hover:bg-black/30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <FaArrowLeft size={24} />
      </button>

      <button
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/20 hover:bg-black/30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <FaArrowRight size={24} />
      </button>

      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 pt-2">
        {trendingShows.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-white' : 'bg-gray-500'}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
