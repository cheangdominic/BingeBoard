import React, { useEffect, useState, useRef, useCallback } from "react";
import TVShowCard from "../components/TVShowCard";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function WatchlistCarousel({
  user,
  title = "Your Watchlist",
  cardActualWidth = 130,
  userScrollBehavior = 'smooth'
}) {
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const itemWidth = cardActualWidth;

  useEffect(() => {
    if (!API_KEY || !user?.watchlist || user.watchlist.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchShowDetails = async () => {
      setIsLoading(true);
      try {
        const showPromises = user.watchlist.map(id => 
          axios.get(`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=en-US`)
            .then(res => res.data)
            .catch(err => {
              console.error(`Failed to fetch show ${id}:`, err);
              return null;
            })
        );

        const showResults = await Promise.all(showPromises);
        const validShows = showResults.filter(show => show !== null);
        setShows(validShows);
      } catch (error) {
        console.error("Error fetching show details:", error);
        setShows([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShowDetails();
  }, [user?.watchlist, API_KEY]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || shows.length === 0 || itemWidth <= 0) return;

    const contentWidth = shows.length * itemWidth;
    const scrollPos = container.scrollLeft;
    const containerWidth = container.offsetWidth;

    if (scrollPos >= contentWidth * 2 - containerWidth / 2) {
      container.style.scrollBehavior = 'auto';
      container.scrollLeft = scrollPos - contentWidth;
      container.style.scrollBehavior = userScrollBehavior;
    } else if (scrollPos <= contentWidth - containerWidth / 2) {
      container.style.scrollBehavior = 'auto';
      container.scrollLeft = scrollPos + contentWidth;
      container.style.scrollBehavior = userScrollBehavior;
    }
  }, [shows, itemWidth, userScrollBehavior]);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content || !shows.length || itemWidth <= 0) {
      if (content) content.style.width = '0px';
      return;
    }

    const contentWidth = shows.length * itemWidth;
    
    content.style.width = `${contentWidth * 3}px`;
    container.style.scrollBehavior = 'auto';
    container.scrollLeft = contentWidth;
    container.style.scrollBehavior = userScrollBehavior;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [shows, itemWidth, handleScroll, userScrollBehavior]);

  if (!API_KEY) {
    return (
      <section className="relative my-8">
        <h3 className="text-xl font-bold px-4 md:px-0 mb-4">{title}</h3>
        <p className="px-4 md:px-0 text-red-500">TMDB API Key not configured.</p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="relative my-8">
        <h3 className="text-xl font-bold px-4 md:px-0 mb-4">{title}</h3>
        <p className="px-4 md:px-0">Loading your watchlist...</p>
      </section>
    );
  }

  if (!user?.watchlist || user.watchlist.length === 0) {
    return (
      <section className="relative my-8">
        <h3 className="text-xl font-bold px-4 md:px-0 mb-4">{title}</h3>
        <p className="px-4 md:px-0">Your watchlist is empty. Add some shows!</p>
      </section>
    );
  }

  if (shows.length === 0) {
    return (
      <section className="relative my-8">
        <h3 className="text-xl font-bold px-4 md:px-0 mb-4">{title}</h3>
        <p className="px-4 md:px-0">Could not load watchlist shows.</p>
      </section>
    );
  }

  const displayItems = [...shows, ...shows, ...shows];

  return (
    <section className="relative my-8 pl-2 mr-2">
      <div className="flex justify-between items-center mb-4 px-4 md:px-0">
        <h3 className="text-xl text-white font-bold md:pl-2 md:m-0 -m-2">{title}</h3>
      </div>

      <div
        ref={containerRef}
        className="relative w-full overflow-x-auto overflow-y-hidden no-scrollbar"
      >
        <div ref={contentRef} className="flex">
          {displayItems.map((show, index) => (
            <motion.div
              key={`${show.id}-${index}`}
              className="flex-shrink-0 px-1 py-2" 
              style={{ width: `${itemWidth}px` }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index % shows.length) * 0.03 }}
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

export default WatchlistCarousel;