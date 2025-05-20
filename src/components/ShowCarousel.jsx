import React, { useEffect, useState, useRef, useCallback } from "react";
import TVShowCard from "./TVShowCard";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function ShowCarousel({
  title,
  tmdbEndpoint = "popular",
  cardActualWidth = 130,
  userScrollBehavior = 'smooth',
}) {
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const itemWidth = cardActualWidth;

  useEffect(() => {
    const fetchShows = async () => {
      if (!API_KEY) {
        console.error("TMDB API Key is missing.");
        setShows([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await axios.get(
          `https://api.themoviedb.org/3/${tmdbEndpoint}?api_key=${API_KEY}&language=en-US&page=1`
        );

        const tmdbResults = res.data.results || [];

        const enrichedShows = await Promise.all(
          tmdbResults.map(async (show) => {
            try {
              const ratingRes = await axios.get(
                `/api/average-rating?showId=${show.id}`,
                { withCredentials: true }
              );
              return {
                ...show,
                averageRating: ratingRes.data.averageRating,
              };
            } catch (ratingError) {
              console.warn(`Rating fetch failed for show ${show.id}:`, ratingError);
              return {
                ...show,
                averageRating: null,
              };
            }
          })
        );

        setShows(enrichedShows);
      } catch (error) {
        console.error(`Failed to fetch "${tmdbEndpoint}":`, error);
        setShows([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShows();
  }, [tmdbEndpoint, API_KEY]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || !shows.length || itemWidth <= 0) return;

    const contentWidthPerClone = shows.length * itemWidth;
    if (contentWidthPerClone <= 0) return;

    const currentPos = container.scrollLeft;
    let newScrollLeft = currentPos;
    let didTeleport = false;

    if (currentPos >= contentWidthPerClone * 2 - (container.offsetWidth / 2)) {
      newScrollLeft = currentPos - contentWidthPerClone;
      didTeleport = true;
    } else if (currentPos <= contentWidthPerClone - (container.offsetWidth / 2)) {
      newScrollLeft = currentPos + contentWidthPerClone;
      didTeleport = true;
    }

    if (didTeleport) {
      const originalBehavior = container.style.scrollBehavior;
      container.style.scrollBehavior = 'auto';
      container.scrollLeft = newScrollLeft;
      container.style.scrollBehavior = originalBehavior;
    }
  }, [shows, itemWidth]);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content || !shows.length || itemWidth <= 0) {
      if (content) content.style.width = '0px';
      return;
    }

    const numItems = shows.length;
    const contentWidthPerClone = numItems * itemWidth;
    if (contentWidthPerClone <= 0) return;

    content.style.width = `${contentWidthPerClone * 3}px`;
    const initialScrollPosition = contentWidthPerClone;

    const originalBehavior = container.style.scrollBehavior;
    container.style.scrollBehavior = 'auto';
    container.scrollLeft = initialScrollPosition;
    container.style.scrollBehavior = userScrollBehavior;

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [shows, itemWidth, handleScroll, userScrollBehavior]);

  if (!API_KEY) {
    return (
      <section className="relative my-8">
        <h3 className="text-xl font-bold px-4 md:px-0 mb-4">{title}</h3>
        <p className="px-4 md:px-0 text-red-500">TMDB API Key not configured.</p>
      </section>
    );
  }

  const allItems = shows.length > 0 ? [...shows, ...shows, ...shows] : [];

  const SkeletonCard = () => (
    <motion.div
      className="flex-shrink-0 mx-2 py-2"
      style={{ width: `${itemWidth}px` }}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        transition: { duration: 0.5 }
      }}
    >
      <motion.div 
        className="bg-gray-700 rounded-lg overflow-hidden"
        style={{ 
          width: `${itemWidth}px`, 
          height: `${itemWidth * 1.5}px` 
        }}
        animate={{
          background: [
            'linear-gradient(90deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)',
            'linear-gradient(90deg, #2d3748 0%, #4a5568 100%, #2d3748 100%)',
            'linear-gradient(90deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)',
          ],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </motion.div>
  );

  return (
    <section className="relative my-8 pl-2 mr-2">
      <div className="flex justify-between items-center mb-4 px-4 md:px-0">
        <h3 className="text-xl text-white font-bold md:pl-2 md:m-0 -m-2">{title}</h3>
        {!isLoading && (
          <Link to={`/view-all/${encodeURIComponent(tmdbEndpoint)}`}>
            <button className="text-sm text-white font-semibold hover:underline">View All</button>
          </Link>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative w-full overflow-x-auto overflow-y-hidden no-scrollbar px-4"
      >
        <div ref={contentRef} className="flex">
          {isLoading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))
          ) : (
            <AnimatePresence>
              {allItems.map((show, index) => (
                <motion.div
                  key={`${show.id}-${index}-${tmdbEndpoint}`}
                  className="flex-shrink-0 mx-2 py-2"
                  style={{ width: `${itemWidth}px` }}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { 
                      delay: index * 0.03,
                      type: "spring",
                      stiffness: 100,
                      damping: 10
                    }
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  }}
                  exit={{ opacity: 0 }}
                >
                  <Link to={`/show/${show.id}`}>
                    <div className="transition-transform duration-300 ease-in-out hover:shadow-lg">
                      <TVShowCard
                        imageUrl={show.poster_path ? `https://image.tmdb.org/t/p/w300${show.poster_path}` : undefined}
                        title={show.name || show.title}
                        cardWidth={cardActualWidth}
                        averageRating={show.averageRating}
                      />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}

export default ShowCarousel;