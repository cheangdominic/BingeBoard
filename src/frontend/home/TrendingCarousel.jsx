import { useState, useEffect } from 'react';
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import AppleRating from '../../components/AppleRating';

export default function TrendingCarousel({
  tmdbEndpoint = "tv/top_rated",
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
          `https://api.themoviedb.org/3/${tmdbEndpoint}?api_key=${API_KEY}&language=en-US&page=1`
        );

        const limitedResults = res.data.results.slice(0, slideLimit);

        const showDetails = await Promise.all(
          limitedResults.map(async (show) => {
            const mediaType = show.media_type || "tv";
            try {
              const details = await axios.get(
                `https://api.themoviedb.org/3/${mediaType}/${show.id}?api_key=${API_KEY}&language=en-US`
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
              console.error("Error fetching show details", error);
              return show;
            }
          })
        );
        showDetails.sort((a, b) => b.vote_average - a.vote_average);
        setTrendingShows(showDetails);


      } catch (error) {
        console.error("Failed to fetch trending shows:", error);
      }
    };

    fetchTrendingShows();
  }, [API_KEY, tmdbEndpoint, slideLimit]);

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
