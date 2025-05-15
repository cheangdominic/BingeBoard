import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchTVShow } from '/src/backend/tmdb';
import { useAuth } from '../../context/AuthContext';
import ShowHero from './ShowHero';
import ShowDescription from './ShowDescription';
import EpisodeList from './EpisodeList';
import EpisodeListView from './EpisodeListView';
import ReviewSection from './ReviewSection';
import BottomNavbar from '../../components/BottomNavbar.jsx';
import AddToWatchlistButton from './AddToWatchlistButton.jsx';
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] 
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const ShowDetailsPage = () => {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const { user } = useAuth();

  const LoadingSpinner = () => (
    <motion.div 
      className="flex flex-col items-center justify-center h-screen bg-[#1e1e1e] gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
      />
      <motion.p 
        className="text-white text-lg font-medium"
        initial={{ y: 10 }}
        animate={{ y: 0 }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
      >
        Loading show details...
      </motion.p>
    </motion.div>
  );
  const formatCountdown = (airDate) => {
    if (!airDate) return 'Coming soon';
    const now = new Date();
    const airDateObj = new Date(airDate);
    const diffTime = airDateObj - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days` : 'Available now';
  };

  const getPlatforms = (tmdbData) => {
    const networks = tmdbData.networks?.map(n => n.name) || [];
    const providers = tmdbData['watch/providers']?.results?.US?.flatrate?.map(p => p.provider_name) || [];
    return [...new Set([...networks, ...providers])];
  };

  const formatShowData = useCallback((tmdbData) => ({
    title: tmdbData.name,
    releaseDate: tmdbData.first_air_date,
    description: tmdbData.overview,
    status: tmdbData.status,
    creator: tmdbData.created_by?.map(c => c.name).join(', ') || 'Unknown',
    rating: (tmdbData.content_ratings?.results.find(r => r.iso_3166_1 === 'US') || {}).rating || 'TV-MA',
    platforms: getPlatforms(tmdbData),
    seasons: tmdbData.seasons?.filter(s => s.season_number > 0).map(season => ({
      number: season.season_number,
      episodes: [],
      episodeCount: season.episode_count
    })) || [],
    nextEpisode: tmdbData.next_episode_to_air ? {
      countdown: formatCountdown(tmdbData.next_episode_to_air.air_date)
    } : null,
    seasonsData: tmdbData.seasons || [],
    reviews: [],
    backdropUrl: tmdbData.backdrop_path
      ? `https://image.tmdb.org/t/p/w500${tmdbData.backdrop_path}`
      : '/images/fallback.jpg',
  }), []);

  useEffect(() => {
    const loadShow = async () => {
      try {
        setError(null);
        setLoading(true);
        const showData = await fetchTVShow(id);
        setShow(formatShowData(showData));
      } catch (error) {
        setError('Failed to load show details');
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadShow();
    }
  }, [id, formatShowData]);

  if (loading) return <LoadingSpinner />;
  
  if (error) return (
    <motion.div 
      className="flex items-center justify-center h-screen bg-[#1e1e1e]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="text-white text-lg font-medium p-8 bg-red-900/30 rounded-xl"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        {error}
      </motion.div>
    </motion.div>
  );

  if (!show) return (
    <motion.div 
      className="flex items-center justify-center h-screen bg-[#1e1e1e]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div 
        className="text-white text-lg font-medium"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
      >
        Show not found
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#1e1e1e] text-gray-100"
    >
      <div className="p-6 max-w-8xl mx-auto space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`hero-${id}`}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            <ShowHero show={show} isLoading={loading} />
          </motion.div>
        </AnimatePresence>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <motion.div
        variants={fadeInUp}
            className="lg:col-span-2 space-y-6"
          >
            <ShowDescription show={show} />
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <AddToWatchlistButton showId={id} />
            </motion.div>
      </motion.div>

          <motion.div
            variants={scaleUp}
            className="lg:col-span-1"
          >
            <div className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <motion.h3 
                className="text-xl font-bold mb-4"
                whileHover={{ x: 5 }}
              >
                Show Details
              </motion.h3>
              <div className="space-y-3">
                {[
                  { label: 'Status', value: show.status },
                  { label: 'Creator', value: show.creator },
                  { label: 'First Aired', value: show.releaseDate },
                  { label: 'Rating', value: show.rating },
                  { label: 'Available On', value: show.platforms.join(', ') },
                  ...(show.nextEpisode ? [{ label: 'Next Episode', value: show.nextEpisode.countdown }] : [])
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <p className="text-gray-400 text-sm">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.6 }}
          className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
        >
          <motion.h2 
            className="text-2xl font-bold mb-6"
            whileHover={{ scale: 1.01 }}
          >
            Episodes
          </motion.h2>
          <EpisodeList seasons={show.seasons} showId={id} />
          <EpisodeListView seasons={show.seasons} showId={id} />
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.8 }}
          className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
        >
          <ReviewSection
            showId={id}
            showTitle={show.title}
            currentUserId={user?._id}
            reviews={reviews}
            setReviews={setReviews}
            isLoading={reviewsLoading}
          />
        </motion.div>
        <BottomNavbar />
      </div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <BottomNavbar />
      </motion.div>
    </motion.div>
  );
};

export default ShowDetailsPage;