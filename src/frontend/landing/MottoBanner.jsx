import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

function MottoBanner() {
  const [buttonText, setButtonText] = useState("Get Started");
  const [isHovered, setIsHovered] = useState(false);
  const [trendingShow, setTrendingShow] = useState(null);
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  const messages = [
    "Join the community",
    "Start tracking",
    "Discover new shows",
    "Review your favorites",
    "See new episodes",
  ];

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setButtonText(prev => {
        let newMessage;
        do {
          newMessage = messages[Math.floor(Math.random() * messages.length)];
        } while (newMessage === prev && messages.length > 1);
        return newMessage;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered]);

  useEffect(() => {
    const fetchTrendingShow = async () => {
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}&language=en-US`
        );

        const topShow = res.data.results[0];

        const details = await axios.get(
          `https://api.themoviedb.org/3/tv/${topShow.id}?api_key=${API_KEY}&language=en-US`
        );

        setTrendingShow({
          id: topShow.id,
          backdrop_path: topShow.backdrop_path,
          name: topShow.name,
          overview: details.data.overview,
        });
      } catch (error) {
        console.error("Error fetching trending TV show:", error);
      }
    };

    fetchTrendingShow();
  }, [API_KEY]);

  const bannerImage = trendingShow?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${trendingShow.backdrop_path}`
    : '/fallback-banner.jpg';

  return (
    <div className="relative">
      <img
        src={bannerImage}
        alt={trendingShow?.name || "Trending show"}
        className="w-full h-[500px] object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-35 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-center -mt-24">
          <h1 className="text-white text-4xl lg:text-6xl font-bold font-coolvetica">
            Track What You Watch.
          </h1>
          <h1 className="text-white text-4xl lg:text-6xl font-bold font-coolvetica">
            Share What You Love.
          </h1>

          <a
            href="/signup"
            className="min-w-[120px] inline-block text-center no-underline"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div
              className="px-6 py-3 bg-[#1963da] text-white font-bold rounded-lg hover:bg-[#ebbd34] hover:text-black transition-colors cursor-pointer mt-4"
              layout
              transition={{
                type: "tween",
                ease: "easeInOut",
                duration: 0.3,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={buttonText}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="inline-block"
                >
                  {buttonText}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          </a>
        </div>

        {trendingShow?.name && (
          <Link
            to={`/show/${trendingShow.id}`}
            className="absolute bottom-4 left-4 bg-[#1963da] bg-opacity-70 text-white px-2 py-1 rounded-lg text-lg font-semibold max-w-[80%] hover:underline"
          >
            {trendingShow.name}
          </Link>
        )}
      </div>
    </div>
  );
}

export default MottoBanner;
