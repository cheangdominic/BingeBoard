import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TVShowCard from "../../components/TVShowCard";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const ITEMS_PER_PAGE = 12;
const CARD_WIDTH = 130;

export default function ViewAllRecentlyWatched() {
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  useEffect(() => {
    const fetchRecentlyWatchedData = async () => {
      if (!authUser) {
        setIsLoading(false);
        setShows([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/users/recently-watched', {
          credentials: "include"
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
          throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setShows(data.map(s => ({
          id: s.showId,
          name: s.showName,
          poster_path: s.posterPath,
          lastWatchedAt: s.lastWatchedAt
        })));
      } catch (err) {
        console.error("Error fetching recently watched shows for view all page:", err);
        setError(err.message || "Failed to load recently watched shows.");
        setShows([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentlyWatchedData();
  }, [authUser]);

  const displayedShows = shows.slice(0, page * ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="px-6 py-8 bg-[#1e1e1e] min-h-screen text-white">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-semibold mb-8">Recently Watched Shows</h1>
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="bg-gray-700 rounded-lg animate-pulse"
              style={{ width: `${CARD_WIDTH}px`, height: `${CARD_WIDTH * 1.5}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="px-6 py-8 bg-[#1e1e1e] min-h-screen text-white text-center">
        <h1 className="text-4xl font-semibold mb-8">Recently Watched</h1>
        <p className="text-lg">Please <Link to="/login" className="text-blue-400 hover:underline">log in</Link> to view your recently watched shows.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-8 bg-[#1e1e1e] min-h-screen text-white text-center">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-semibold mb-8">Error</h1>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!shows.length) {
    return (
      <div className="px-6 py-8 bg-[#1e1e1e] min-h-screen text-white">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-semibold mb-8">Recently Watched Shows</h1>
        <p>You haven't watched any shows recently. Go watch some!</p>
      </div>
    );
  }

  return (
    <motion.div
      className="px-6 py-8 bg-[#1e1e1e] min-h-screen text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-semibold mb-8">Recently Watched Shows</h1>

      <div className="flex flex-wrap gap-4">
        {displayedShows.map((show, index) => (
          <motion.div
            key={show.id || index}
            className="flex-shrink-0"
            style={{ width: `${CARD_WIDTH}px` }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index % ITEMS_PER_PAGE) * 0.03, duration: 0.3 }}
            whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2 } }}
          >
            <Link to={`/show/${show.id}`}>
              <TVShowCard
                imageUrl={
                  show.poster_path
                    ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                    : undefined
                }
                title={show.name}
                cardWidth={CARD_WIDTH}
              />
            </Link>
          </motion.div>
        ))}
      </div>

      {displayedShows.length < shows.length && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setPage(page + 1)}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition hover:scale-105"
            disabled={isLoading}
          >
            Load More
          </button>
        </div>
      )}
    </motion.div>
  );
}
