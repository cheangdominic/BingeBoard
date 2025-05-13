import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchTVShow } from '/src/backend/tmdb';
import ShowHero from './ShowHero';
import ShowDescription from './ShowDescription';
import EpisodeList from './EpisodeList';
import EpisodeListView from './EpisodeListView';
import ReviewSection from './ReviewSection';
import BottomNavbar from '../../components/BottomNavbar.jsx';

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
    loadShow();
  }, [id, formatShowData]);

  if (loading) return <div className="text-white p-10">Loading...</div>;
  if (error) return <div className="text-white p-10">{error}</div>;
  if (!show) return <div className="text-white p-10">Show not found</div>;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-6 max-w-8xl mx-auto space-y-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
        >
          <ShowHero show={show} isLoading={loading} />
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.4 }}
        >
          <ShowDescription show={show} />
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.6 }}
        >
          <EpisodeList seasons={show.seasons} showId={id} />
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.8 }}
        >
          <EpisodeListView seasons={show.seasons} showId={id} />
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 1.0 }}
        >
          <ReviewSection reviews={show.reviews} />
        </motion.div>  
      </div>
      <BottomNavbar />  
    </div>
  );
};

export default ShowDetailsPage;