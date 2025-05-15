import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Apple } from 'lucide-react';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

function ShowGrid() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchShows() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=en-US&page=1`
        );
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();
        setShows(data.results);
      } catch (err) {
        console.error("Failed to fetch TV shows", err);
        setError("Unable to load shows. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchShows();
  }, []);

  if (loading) {
    return <p className="text-center text-white text-lg mt-8">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 text-lg mt-8">{error}</p>;
  }

  if (shows.length === 0) {
    return <p className="text-center text-white text-lg mt-8">No shows available.</p>;
  }

  return (
    <div className="px-6 py-10 bg-black min-h-screen">
      <h1 className="text-3xl font-extrabold text-white mb-8 text-center">
        Logged Shows
      </h1>
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {shows.map((show) => (
          <motion.div
            key={show.id}
            className="bg-zinc-900 rounded-2xl overflow-hidden shadow-lg"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <img
              src={
                show.poster_path
                  ? IMAGE_BASE_URL + show.poster_path
                  : "https://via.placeholder.com/500x750?text=No+Image"
              }
              alt={show.name}
              className="w-full h-72 object-cover"
            />
            <div className="p-4">
              <h3 className="text-white text-lg font-bold mb-2 truncate">
                {show.name}
              </h3>
              <p className="text-gray-400 text-sm font-semibold flex items-center gap-1">
                <Apple className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {Math.round(show.vote_average / 2 * 10) / 10}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default ShowGrid;
