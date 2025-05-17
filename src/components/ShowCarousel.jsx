import React, { useEffect, useState, useRef, useCallback } from "react";
import TVShowCard from "./TVShowCard";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function ShowCarousel({
  title,
  tmdbEndpoint = "popular",
  cardActualWidth = 130,
  userScrollBehavior = 'smooth',
}) {
  const [shows, setShows] = useState([]);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const itemWidth = cardActualWidth;

  useEffect(() => {
    const fetchShows = async () => {
      if (!API_KEY) {
        console.error("TMDB API Key is missing.");
        setShows([]);
        return;
      }
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/${tmdbEndpoint}?api_key=${API_KEY}&language=en-US&page=1`
        );
        setShows(res.data.results || []);
      } catch (error) {
        console.error(`Failed to fetch "${tmdbEndpoint}":`, error);
        setShows([]);
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

  return (
    <section className="relative my-8 pl-2 mr-2">
      <div className="flex justify-between items-center mb-4 px-4 md:px-0">
        <h3 className="text-xl text-white font-bold md:pl-2 md:m-0 -m-2">{title}</h3>
        <Link to={`/view-all/${encodeURIComponent(tmdbEndpoint)}`}>
          <button className="text-sm text-white font-semibold hover:underline">View All</button>
        </Link>
      </div>

      <div
        ref={containerRef}
        className="relative w-full overflow-x-auto overflow-y-hidden no-scrollbar"
      >
        <div ref={contentRef} className="flex">
          {allItems.map((show, index) => (
            <motion.div
              key={`${show.id}-${index}-${tmdbEndpoint}`}
              className="flex-shrink-0 px-1 py-2" 
              style={{ width: `${itemWidth}px` }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.05 }}
            >
              <Link to={`/show/${show.id}`}>
                <div className="transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                  <TVShowCard
                    imageUrl={show.poster_path ? `https://image.tmdb.org/t/p/w300${show.poster_path}` : undefined}
                    title={show.name || show.title}
                    cardWidth={cardActualWidth}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ShowCarousel;
