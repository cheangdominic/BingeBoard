import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";  
import TVShowCard from "../../components/TVShowCard";
import { motion } from "framer-motion";
import axios from "axios";

const FILMS_PER_PAGE = 12;
const CARD_WIDTH = 130;

export default function ViewAllPage() {
  const { tmdbEndpoint } = useParams();
  const location = useLocation();
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  useEffect(() => {
    const fetchShows = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const isWatchlist = location.pathname.includes('watchlist');
        
        if (isWatchlist) {
          const watchlistIds = location.state?.watchlist || [];
          
          if (watchlistIds.length === 0) {
            setShows([]);
            return;
          }

          const showPromises = watchlistIds.map(id => 
            axios.get(`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=en-US`)
              .then(res => res.data)
              .catch(err => {
                console.error(`Failed to fetch show ${id}:`, err);
                return null;
              })
          );

          const results = await Promise.all(showPromises);
          setShows(results.filter(show => show !== null));
        } else {
          if (!tmdbEndpoint) {
            throw new Error('No endpoint specified');
          }
          
          const decodedEndpoint = decodeURIComponent(tmdbEndpoint);
          const res = await axios.get(
            `https://api.themoviedb.org/3/tv/${decodedEndpoint}?api_key=${API_KEY}&language=en-US&page=${page}`
          );
          setShows(prev => [...prev, ...(res.data.results || [])]);
        }
      } catch (error) {
        console.error("Failed to fetch shows:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShows();
  }, [tmdbEndpoint, page, API_KEY, location]);

  const displayedShows = shows.slice(0, page * FILMS_PER_PAGE);

  if (isLoading && page === 1) {
    return (
      <motion.div 
        className="p-6 bg-gray-900 min-h-screen text-white"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-6">
          {location.pathname.includes('watchlist') ? 'Your Watchlist' : `All Shows`}
        </h1>
        <p>Loading...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="p-6 bg-gray-900 min-h-screen text-white"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-3xl font-bold mb-6">
        {location.pathname.includes('watchlist') ? 'Your Watchlist' : `All ${tmdbEndpoint?.replace(/_/g, " ")} Shows`}
      </h1>

      {error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : shows.length === 0 ? (
        <p className="text-lg">
          {location.pathname.includes('watchlist') 
            ? 'Your watchlist is empty' 
            : 'No shows found'}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap justify-start">
            {displayedShows.map((show, index) => (
              <motion.div
                key={show.id}
                className="flex-shrink-0 px-1 py-2"
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
              </motion.div>
            ))}
          </div>

          {displayedShows.length < shows.length && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setPage(page + 1)}
                className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}