import React, { useEffect, useState, useRef, useCallback } from "react";
import TVShowCard from "../../components/TVShowCard";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function WatchlistCarousel({
  user,
  title = "Your Watchlist",
  cardActualWidth = 130,
  onWatchlistChange,
  userScrollBehavior = "smooth",
}) {
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredShowId, setHoveredShowId] = useState(null);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const itemWidth = cardActualWidth;
  const MIN_SHOWS_FOR_INFINITE_SCROLL = 6;

  // Fetch shows when user or watchlist changes
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
          axios.get(
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

  // Handle scroll behavior
  const handleScroll = useCallback(() => {
    if (shows.length < MIN_SHOWS_FOR_INFINITE_SCROLL) return;
    
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
    
    if (shows.length < MIN_SHOWS_FOR_INFINITE_SCROLL) {
      content.style.width = `${contentWidth}px`;
      container.style.scrollBehavior = userScrollBehavior;
      container.removeEventListener("scroll", handleScroll);
    } else {
      content.style.width = `${contentWidth * 3}px`;
      const initialScrollPosition = contentWidth;

      const originalBehavior = container.style.scrollBehavior;
      container.style.scrollBehavior = "auto";
      if (Math.abs(container.scrollLeft - initialScrollPosition) > 1) {
        container.scrollLeft = initialScrollPosition;
      }
      container.style.scrollBehavior = userScrollBehavior;

      container.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [shows, itemWidth, handleScroll, userScrollBehavior]);

  const handleRemoveFromWatchlist = async (showIdToRemove) => {
    if (!user || !user.watchlist) {
      toast.warning("You need to be logged in to modify your watchlist");
      return;
    }

    try {
      const response = await axios.post(
        "/api/watchlist/remove",
        { showId: String(showIdToRemove) }, // Ensure we send as string
        { withCredentials: true }
      );

      if (response.data.success) {
        setShows(prevShows => prevShows.filter(show => show.id !== showIdToRemove));
        
        if (onWatchlistChange) {
          const updatedWatchlist = user.watchlist.filter(id => id != showIdToRemove); // != instead of !== to handle string/number
          onWatchlistChange(updatedWatchlist);
        }
        toast.success("Show removed from your watchlist");
      } else {
        toast.error(response.data.message || "Failed to remove show");
      }
    } catch (error) {
      console.error("Error removing show:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Error removing show");
    }
  };

  if (!API_KEY) {
    return (
      <section className="relative my-8">
        <h3 className="text-xl font-bold px-4 md:px-0 mb-4">{title}</h3>
        <p className="px-4 md:px-0 text-red-500">TMDB API Key not configured.</p>
      </section>
    );
  }

  if (isLoading) {
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
            {Array.from({ length: Math.min(user?.watchlist?.length || 5, 10) }).map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!isLoading && (!user?.watchlist || user.watchlist.length === 0)) {
    return (
      <section className="relative my-8">
        <h3 className="text-xl font-bold px-4 md:px-0 mb-4">{title}</h3>
        <p className="px-4 md:px-0">Your watchlist is empty. Add some shows!</p>
      </section>
    );
  }
  
  if (!isLoading && shows.length === 0 && user?.watchlist && user.watchlist.length > 0) {
    return (
      <section className="relative my-8">
        <h3 className="text-xl font-bold px-4 md:px-0 mb-4">{title}</h3>
        <p className="px-4 md:px-0">Could not load watchlist shows.</p>
      </section>
    );
  }


  const displayItems = shows.length < MIN_SHOWS_FOR_INFINITE_SCROLL 
    ? shows 
    : [...shows, ...shows, ...shows];

  return (
    <section className="relative my-8 pl-2 mr-2">
      <div className="flex justify-between items-center mb-4 px-4 md:px-0">
        <h3 className="text-xl text-white font-bold md:pl-2 md:m-0 -m-2">
          {title}
        </h3>
        {user?.watchlist && user.watchlist.length > 0 && (
          <Link to="/view-all/watchlist" state={{ watchlist: user.watchlist }}>
            <button className="text-sm text-white font-semibold hover:underline">
              View All
            </button>
          </Link>
        )}
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
                className="flex-shrink-0 mx-2 py-2 relative"
                style={{ width: `${itemWidth}px` }}
                onMouseEnter={() => setHoveredShowId(show.id)}
                onMouseLeave={() => setHoveredShowId(null)}
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
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              >
                <Link to={`/show/${show.id}`}>
                  <div className="transition-transform duration-300 ease-in-out">
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
                {hoveredShowId === show.id && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFromWatchlist(show.id);
                    }}
                    className="absolute right-1 bottom-[30%] transform translate-y-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-0.5 rounded hover:bg-red-600 hover:bg-opacity-100 z-20 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={`Remove ${show.name || show.title} from watchlist`}
                    title="Remove from watchlist"
                  >
                    Remove?
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default WatchlistCarousel;