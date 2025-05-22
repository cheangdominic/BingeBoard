import React, { useEffect, useState, useRef, useCallback } from "react";
import TVShowCard from "../../components/TVShowCard";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function WatchlistCarousel({
  user,
  title = "Your Watchlist",
  cardActualWidth = 130,
  userScrollBehavior = "smooth",
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
      setShows([]);
      return;
    }

    const fetchShowDetails = async () => {
      setIsLoading(true);
      try {
        const showPromises = user.watchlist.map((id) =>
          axios
            .get(
              `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=en-US`
            )
            .then((res) => res.data)
            .catch((err) => {
              console.error(`Failed to fetch show ${id}:`, err);
              return null;
            })
        );

        const showResults = await Promise.all(showPromises);
        const validShows = showResults.filter((show) => show !== null);
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

    let newScrollLeft = scrollPos;
    let didTeleport = false;

    if (scrollPos >= contentWidth * 2 - containerWidth / 2) {
      newScrollLeft = scrollPos - contentWidth;
      didTeleport = true;
    } else if (scrollPos <= contentWidth - containerWidth / 2) {
      newScrollLeft = scrollPos + contentWidth;
      didTeleport = true;
    }

    if (didTeleport) {
      const originalBehavior = container.style.scrollBehavior;
      container.style.scrollBehavior = "auto";
      container.scrollLeft = newScrollLeft;
      container.style.scrollBehavior = originalBehavior || userScrollBehavior;
    }
  }, [shows, itemWidth, userScrollBehavior]);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content || shows.length === 0 || itemWidth <= 0) {
      if (content) content.style.width = "0px";
      return;
    }

    const contentWidth = shows.length * itemWidth;
    content.style.width = `${contentWidth * 3}px`;
    const initialScrollPosition = contentWidth;

    const originalBehavior = container.style.scrollBehavior;
    container.style.scrollBehavior = "auto";
    container.scrollLeft = initialScrollPosition;
    container.style.scrollBehavior = userScrollBehavior;

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
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

  if (isLoading) {
    // Skeleton Card Component for loading state
    const SkeletonCard = () => (
      <motion.div
        className="flex-shrink-0 mx-2 py-2"
        style={{ width: `${itemWidth}px` }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { duration: 0.5 },
        }}
      >
        <motion.div
          className="bg-gray-700 rounded-lg overflow-hidden"
          style={{
            width: `${itemWidth}px`,
            height: `${itemWidth * 1.5}px`,
          }}
          animate={{
            background: [
              "linear-gradient(90deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)",
              "linear-gradient(90deg, #2d3748 0%, #4a5568 100%, #2d3748 100%)",
              "linear-gradient(90deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)",
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>
    );

    return (
      <section className="relative my-8 pl-2 mr-2">
        <div className="flex justify-between items-center mb-4 px-4 md:px-0">
          <h3 className="text-xl text-white font-bold md:pl-2 md:m-0 -m-2">
            {title}
          </h3>
        </div>

        <div
          ref={containerRef}
          className="relative w-full overflow-x-auto no-scrollbar px-4"
        >
          <div ref={contentRef} className="flex">
            {Array.from({ length: 10 }).map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))}
          </div>
        </div>
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
        <h3 className="text-xl text-white font-bold md:pl-2 md:m-0 -m-2">
          {title}
        </h3>
        <Link to="/view-all/watchlist" state={{ watchlist: user.watchlist }}>
  <button className="text-sm text-white font-semibold hover:underline">
    View All
  </button>
</Link>
      </div>

      <div
        ref={containerRef}
        className="relative w-full overflow-x-auto no-scrollbar px-4"
      >
        <div ref={contentRef} className="flex">
          <AnimatePresence>
            {displayItems.map((show, index) => (
              <motion.div
                key={`${show.id}-${index}`}
                className="flex-shrink-0 mx-2 py-2"
                style={{ width: `${itemWidth}px` }}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    delay: (index % shows.length) * 0.03,
                    type: "spring",
                    stiffness: 100,
                    damping: 10,
                  },
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                exit={{ opacity: 0 }}
              >
                <Link to={`/show/${show.id}`}>
                  <div className="transition-transform duration-300 ease-in-out hover:shadow-lg">
                    <TVShowCard
                      imageUrl={
                        show.poster_path
                          ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                          : undefined
                      }
                      title={show.name || show.title}
                      cardWidth={cardActualWidth}
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default WatchlistCarousel;
