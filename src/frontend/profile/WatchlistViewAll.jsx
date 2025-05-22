import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import TVShowCard from "../../components/TVShowCard";
import { motion } from "framer-motion";
import axios from "axios";

const FILMS_PER_PAGE = 12;
const CARD_WIDTH = 130;

export default function ViewAllWatchlist() {
  const { state } = useLocation();
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [watchlist, setWatchlist] = useState(state?.watchlist || []);
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWatchlistShows = async () => {
      if (!API_KEY || !watchlist || watchlist.length === 0) {
        setIsLoading(false);
        setShows([]);
        return;
      }

      try {
        setIsLoading(true);
        const showPromises = watchlist.map((id) =>
          axios.get(
            `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=en-US`
          )
        );

        const showResults = await Promise.all(showPromises);
        const validShows = showResults
          .filter((res) => res.data)
          .map((res) => res.data);

        setShows(validShows);
      } catch (error) {
        console.error("Error fetching watchlist shows:", error);
        setShows([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchlistShows();
  }, [API_KEY, watchlist]);

  const handleRemoveFromWatchlist = async (showId) => {
    try {
      const response = await axios.post(
        "/api/watchlist/remove",
        { showId: String(showId) },
        { withCredentials: true }
      );

      if (response.data.success) {
        setShows((prev) => prev.filter((s) => s.id !== showId));
        setWatchlist((prev) => prev.filter((id) => id != showId));
        toast.success("Show removed from your watchlist");
      } else {
        toast.error(response.data.message || "Failed to remove show");
      }
    } catch (error) {
      console.error("Remove error:", error);
      toast.error(error.response?.data?.message || "Error removing show");
    }
  };

  const displayedShows = shows.slice(0, page * FILMS_PER_PAGE);

  return (
    <motion.div
      className="px-6 py-8 bg-[#1e1e1e] min-h-screen text-white"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-semibold mb-8">Your Watchlist</h1>

      <div className="flex flex-wrap gap-4">
        {displayedShows.map((show, index) => (
          <motion.div
            key={show.id}
            className="relative flex-shrink-0"
            style={{ width: `${CARD_WIDTH}px` }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ scale: 1.05 }}
          >
            <Link to={`/show/${show.id}`}>
              <TVShowCard
                imageUrl={
                  show.poster_path
                    ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                    : undefined
                }
                title={show.name || show.title}
                cardWidth={CARD_WIDTH}
              />
            </Link>
            <button
              onClick={() => handleRemoveFromWatchlist(show.id)}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-xs text-white px-2 py-1 rounded z-10"
            >
              Remove
            </button>
          </motion.div>
        ))}
      </div>

      {displayedShows.length < shows.length && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setPage(page + 1)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition hover:scale-105"
          >
            Load More
          </button>
        </div>
      )}
    </motion.div>
  );
}
