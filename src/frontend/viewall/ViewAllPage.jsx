import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import TVShowCard from "../../components/TVShowCard";
import { motion } from "framer-motion";
import axios from "axios";

const FILMS_PER_PAGE = 12;
const CARD_WIDTH = 130;

export default function ViewAllPage() {
  const { tmdbEndpoint } = useParams();
  const decodedEndpoint = decodeURIComponent(tmdbEndpoint);
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShows = async () => {
      if (!API_KEY || !tmdbEndpoint) {
        console.error("Missing API key or tmdbEndpoint.");
        setShows([]);
        return;
      }

      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/${decodedEndpoint}?api_key=${API_KEY}&language=en-US&page=1`
        );
        setShows(res.data.results || []);
      } catch (error) {
        console.error(`Failed to fetch shows from ${tmdbEndpoint}:`, error);
        setShows([]);
      }
    };

    fetchShows();
  }, [tmdbEndpoint]);

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

      <h1 className="text-4xl font-semibold mb-8 capitalize tracking-tight">
        All {decodedEndpoint.replace(/_/g, " ")} Shows
      </h1>

      <div className="flex flex-wrap gap-4">
        {displayedShows.map((show, index) => (
          <motion.div
            key={show.id}
            className="flex-shrink-0"
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
