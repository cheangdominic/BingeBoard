import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchTVShow } from '/src/backend/tmdb';
import { useAuth } from '../../context/AuthContext';
import ShowHero from './ShowHero';
import ShowDescription from './ShowDescription';
import EpisodeList from './EpisodeList';
import EpisodeListView from './EpisodeListView';
import ReviewSection from './ReviewSection';
import BottomNavbar from '../home/BottomNavbar';

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

const ShowDetailsPage = () => {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const { user } = useAuth();


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

  if (loading) return (
    <div className="min-h-screen bg-[#1e1e1e] p-6">
      <div className="animate-pulse space-y-8">
        <div className="h-64 bg-[#2a2a2a] rounded-xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-[#2a2a2a] rounded"></div>
            <div className="h-4 bg-[#2a2a2a] rounded"></div>
          </div>
          <div className="lg:col-span-1 h-64 bg-[#2a2a2a] rounded-xl"></div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-[#1e1e1e]">
      <div className="text-white text-lg font-medium">{error}</div>
    </div>
  );

  if (!show) return (
    <div className="flex items-center justify-center h-screen bg-[#1e1e1e]">
      <div className="text-white text-lg font-medium">Show not found</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-gray-100">
      <div className="p-6 max-w-8xl mx-auto space-y-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
        >
          <ShowHero show={show} isLoading={loading} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <ShowDescription show={show} />
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Show Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className="font-medium">{show.status}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Creator</p>
                  <p className="font-medium">{show.creator}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">First Aired</p>
                  <p className="font-medium">{show.releaseDate}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Rating</p>
                  <p className="font-medium">{show.rating}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Available On</p>
                  <p className="font-medium">{show.platforms.join(', ')}</p>
                </div>
                {show.nextEpisode && (
                  <div>
                    <p className="text-gray-400 text-sm">Next Episode</p>
                    <p className="font-medium">{show.nextEpisode.countdown}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.8 }}
          className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6">Episodes</h2>
          <EpisodeList seasons={show.seasons} showId={id} />
          <EpisodeListView seasons={show.seasons} showId={id} />
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 1.0 }}
          className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg"
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
    </div>
  );
};

export default ShowDetailsPage;