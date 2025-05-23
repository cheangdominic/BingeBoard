/**
 * @file TrendingCarousel.js
 * @description A React component that displays a carousel of trending TV shows.
 * It fetches data from a TMDB endpoint, shows backdrops, titles, season/episode counts,
 * ratings, and overviews. Includes navigation controls and slide indicators.
 */

// Import React hooks (useState, useEffect) for managing state and side effects.
import { useState, useEffect } from 'react';
// Import icons for carousel navigation.
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
// Import Link component from react-router-dom for navigation to show detail pages.
import { Link } from "react-router-dom";
// Import axios for making HTTP requests to the TMDB API.
import axios from "axios";
// Import AppleRating component for displaying star/apple ratings.
import AppleRating from '../../components/AppleRating';

/**
 * @function TrendingCarousel
 * @description A React functional component that renders a carousel of trending TV shows.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string} [props.tmdbEndpoint="tv/top_rated"] - The TMDB API endpoint to fetch shows from (e.g., "tv/popular", "trending/tv/week").
 * @param {number} [props.slideLimit=10] - The maximum number of shows to fetch and display in the carousel.
 * @returns {JSX.Element} The rendered TrendingCarousel component.
 */
export default function TrendingCarousel({
  tmdbEndpoint = "tv/top_rated", // Default TMDB endpoint if not provided
  slideLimit = 10                 // Default limit for the number of slides
}) {
  // State to track the index of the currently displayed slide.
  const [currentSlide, setCurrentSlide] = useState(0);
  // State to store the array of trending show data fetched from TMDB.
  const [trendingShows, setTrendingShows] = useState([]);
  // TMDB API key retrieved from environment variables.
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  /**
   * `useEffect` hook to fetch trending shows when the component mounts or when
   * `API_KEY`, `tmdbEndpoint`, or `slideLimit` props change.
   */
  useEffect(() => {
    /**
     * Asynchronous function to fetch trending shows from TMDB.
     * It fetches a list of shows and then details for each show to get season/episode counts.
     * @async
     */
    const fetchTrendingShows = async () => {
      // If API_KEY is missing, log an error and do not proceed.
      if (!API_KEY) {
        console.error("TMDB API Key is missing.");
        return;
      }

      try {
        // Fetch the list of shows from the specified TMDB endpoint.
        const res = await axios.get(
          `https://api.themoviedb.org/3/${tmdbEndpoint}?api_key=${API_KEY}&language=en-US&page=1`
        );

        // Limit the results to the specified `slideLimit`.
        const limitedResults = res.data.results.slice(0, slideLimit);

        // Fetch detailed information for each show in `limitedResults`.
        // `Promise.all` ensures all detail requests are made concurrently.
        const showDetails = await Promise.all(
          limitedResults.map(async (show) => {
            // Determine media type (default to "tv" if not present in initial fetch, e.g. for /tv/popular)
            const mediaType = show.media_type || "tv";
            try {
              // Fetch details for the specific show ID and media type.
              const details = await axios.get(
                `https://api.themoviedb.org/3/${mediaType}/${show.id}?api_key=${API_KEY}&language=en-US`
              );
              // Return a structured object with relevant details.
              return {
                id: show.id,
                name: show.name, // Name (for TV shows)
                title: show.title, // Title (for movies, though this carousel is TV focused)
                backdrop_path: show.backdrop_path, // Backdrop image path
                number_of_episodes: details.data.number_of_episodes,
                number_of_seasons: details.data.number_of_seasons,
                overview: details.data.overview,
                vote_average: details.data.vote_average, // Rating
              };
            } catch (error) {
              console.error("Error fetching show details for ID:", show.id, error);
              return show; // Fallback to the original show object if detail fetch fails
            }
          })
        );
        // Sort shows by vote_average in descending order.
        showDetails.sort((a, b) => b.vote_average - a.vote_average);
        // Update the `trendingShows` state with the fetched and processed data.
        setTrendingShows(showDetails);


      } catch (error) {
        console.error("Failed to fetch trending shows:", error);
        // Optionally, set an error state here to display a message to the user.
      }
    };

    fetchTrendingShows();
  }, [API_KEY, tmdbEndpoint, slideLimit]); // Dependencies for the effect

  /**
   * Advances the carousel to the next slide.
   * Wraps around to the first slide if currently on the last slide.
   */
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % trendingShows.length);
  };

  /**
   * Moves the carousel to the previous slide.
   * Wraps around to the last slide if currently on the first slide.
   */
  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? trendingShows.length - 1 : prev - 1
    );
  };

  // Render the carousel.
  return (
    // Main container for the carousel with relative positioning for controls.
    <div className="relative mx-auto w-[97vw] sm:w-[97.5vw] mt-2 sm:mt-3 h-[30vh] sm:h-[50vh] bg-black text-white overflow-hidden rounded-lg">
      {/* Container for all slides, uses `transform: translateX` for sliding effect. */}
      <div
        className="h-full flex transition-transform duration-300" // Smooth transition for slide changes
        style={{ transform: `translateX(-${currentSlide * 100}%)` }} // Slide effect
      >
        {/* Map over `trendingShows` to render each show as a slide. */}
        {trendingShows.map((show) => (
          <div key={show.id} className="w-full h-full flex-shrink-0 relative"> {/* Each slide takes full width/height */}
            {/* Link the entire slide to the show's detail page. */}
            <Link to={`/show/${show.id}`}>
              {/* Backdrop image for the show. */}
              <img
                src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
                alt={show.name || show.title} // Use name or title for alt text
                className="w-full h-full object-cover" // Image covers the slide area
              />
              {/* Overlay containing show information. */}
              <div className="absolute top-0 sm:top-[62%] lg:top-[65%] bg-black/70 w-full h-full px-4 pt-3 sm:pt-2 text-white rounded-lg flex flex-col justify-start"> {/* Positioned overlay */}
                {/* Container for title, season/episode count, and rating. */}
                <div className="flex justify-between items-center mb-1">
                  {/* Left side: Show title and season/episode info. */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm font-semibold">
                    <span className="text-white text-base sm:text-lg">
                      {show.name || show.title}
                    </span>
                    <span className="text-white text-opacity-70 font-semibold">
                      {show.number_of_seasons} Season{show.number_of_seasons > 1 ? "s" : ""} • {show.number_of_episodes} Episode{show.number_of_episodes > 1 ? "s" : ""}
                    </span>
                  </div>
                  {/* Right side: Rating display. */}
                  <div className="flex items-center mr-4 gap-1.5 font-semibold text-yellow-400 text-opacity-90">
                    {/* Numerical rating (e.g., 4.5), converted from 0-10 scale to 0-5 and rounded. */}
                    {Math.round(show.vote_average / 2 * 100) / 100}
                    {/* AppleRating component for visual star/apple rating. */}
                    <AppleRating rating={Math.round((show.vote_average / 2) * 100) / 100} />
                  </div>
                </div>
                {/* Show overview/description, truncated to a few lines. */}
                <div
                  className="overflow-hidden text-md pt-1 sm:text-lg sm:pt-0 text-[#d5d5d5] pr-2 line-clamp-4 sm:line-clamp-2" // Tailwind `line-clamp` for truncation
                  // CSS for multi-line ellipsis (requires -webkit prefix for some browsers).
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

      {/* "Previous" button for carousel navigation. */}
      <button
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/20 hover:bg-black/30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
        onClick={prevSlide}
        aria-label="Previous slide" // Accessibility label
      >
        <FaArrowLeft size={24} />
      </button>

      {/* "Next" button for carousel navigation. */}
      <button
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/20 hover:bg-black/30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
        onClick={nextSlide}
        aria-label="Next slide" // Accessibility label
      >
        <FaArrowRight size={24} />
      </button>

      {/* Slide indicator dots at the bottom of the carousel. */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 pt-2">
        {/* Map over `trendingShows` to create a dot for each slide. */}
        {trendingShows.map((_, index) => (
          <button
            key={index}
            // Dynamic class to highlight the dot corresponding to the current slide.
            className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-white' : 'bg-gray-500'}`}
            onClick={() => setCurrentSlide(index)} // Go to the clicked slide
            aria-label={`Go to slide ${index + 1}`} // Accessibility label
          />
        ))}
      </div>
    </div>
  );
}