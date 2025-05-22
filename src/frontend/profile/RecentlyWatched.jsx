import React, { useEffect, useState, useRef, useCallback } from "react";
import TVShowCard from "../../components/TVShowCard";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext.jsx";

function RecentlyWatched({
  title = "Recently Watched",
  cardActualWidth = 130,
  userScrollBehavior = "smooth",
}) {
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const { user: authUser } = useAuth();
  const itemWidth = cardActualWidth;

  useEffect(() => {
    const fetchRecentlyWatchedData = async () => {
      if (!authUser) {
        setIsLoading(false);
        setShows([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch('/api/users/recently-watched', { 
          credentials: "include"
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
          throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setShows(data.map(s => ({ ...s, id: s.showId, name: s.showName, poster_path: s.posterPath })));
      } catch (error) {
        console.error("Error fetching recently watched shows:", error);
        setShows([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentlyWatchedData();
  }, [authUser]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || !shows || shows.length === 0 || itemWidth <= 0) return;

    const contentWidth = shows.length * (itemWidth + 16);
    const scrollPos = container.scrollLeft;
    const containerWidth = container.offsetWidth;

    let newScrollLeft = scrollPos;
    let didTeleport = false;

    if (contentWidth === 0) return;


    if (scrollPos >= contentWidth * 2 - containerWidth / 2 - itemWidth) {
      newScrollLeft = scrollPos - contentWidth;
      didTeleport = true;
    } else if (scrollPos <= contentWidth - containerWidth / 2 + itemWidth) {
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

    if (!container || !content || !shows || shows.length === 0 || itemWidth <= 0) {
      if (content) content.style.width = "0px";
      return;
    }

    const actualItemWidthWithMargin = itemWidth + 16; 
    const contentWidth = shows.length * actualItemWidthWithMargin;
    
    if (contentWidth > 0) {
        content.style.width = `${contentWidth * 3}px`;
        const initialScrollPosition = contentWidth - (container.offsetWidth / 2) + (itemWidth / 2) ;
        
        const originalBehavior = container.style.scrollBehavior;
        container.style.scrollBehavior = "auto";
        container.scrollLeft = initialScrollPosition;
        container.style.scrollBehavior = userScrollBehavior;
    } else {
        content.style.width = "0px";
    }


    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [shows, itemWidth, handleScroll, userScrollBehavior]);


  if (isLoading) {
    const SkeletonCard = () => (
      <motion.div
        className="flex-shrink-0 mx-2 py-2"
        style={{ width: `${itemWidth}px` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.5 } }}
      >
        <motion.div
          className="bg-gray-700 rounded-lg overflow-hidden"
          style={{ width: `${itemWidth}px`, height: `${itemWidth * 1.5}px` }}
          animate={{
            background: [
              "linear-gradient(90deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)",
              "linear-gradient(90deg, #2d3748 0%, #4a5568 100%, #2d3748 100%)",
              "linear-gradient(90deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    );
    return (
      <section className="relative my-8 pl-2 mr-2">
        <div className="flex justify-between items-center mb-4 px-4 md:px-0">
          <h3 className="text-xl text-white font-bold md:pl-2 md:m-0 -m-2">{title}</h3>
        </div>
        <div ref={containerRef} className="relative w-full overflow-x-auto no-scrollbar px-4">
          <div ref={contentRef} className="flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonCard key={`skeleton-recent-${index}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!authUser) {
    return (
      <section className="relative my-8 py-4 px-4 md:px-0">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400">Please <a href="/login" className="text-blue-400 hover:underline">log in</a> to see this section.</p>
      </section>
    );
  }
  
  if (!shows || shows.length === 0) {
    return (
      <section className="relative my-8">
        <h3 className="text-xl font-bold px-4 md:px-0 mb-4">{title}</h3>
        <p className="px-4 md:px-0 text-gray-400">You haven't watched any shows recently.</p>
      </section>
    );
  }

  const displayItems = shows.length > 0 ? [...shows, ...shows, ...shows] : [];

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
          <AnimatePresence>
            {displayItems.map((show, index) => (
              <motion.div
                key={`${show.id || show.showId}-${index}`}
                className="flex-shrink-0 mx-2 py-2"
                style={{ width: `${itemWidth}px` }}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    delay: (index % shows.length) * 0.05,
                    type: "spring",
                    stiffness: 100,
                    damping: 12,
                  },
                }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.2 },
                }}
                exit={{ opacity: 0 }}
              >
                <Link to={`/show/${show.id || show.showId}`}>
                  <div className="transition-transform duration-300 ease-in-out hover:shadow-lg h-full">
                    <TVShowCard
                      imageUrl={
                        show.poster_path
                          ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                          : undefined
                      }
                      title={show.name || show.showName}
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

export default RecentlyWatched;