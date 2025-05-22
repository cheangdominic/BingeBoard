import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import BottomNavbar from '../../components/BottomNavbar.jsx';
import TrendingCarousel from './TrendingCarousel.jsx';
import ShowCarousel from '../../components/ShowCarousel.jsx';
import RecentReviewsFiltered from './RecentReviewsFiltered.jsx';

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

function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.2 }}
        className="pb-20"
      >
        <TrendingCarousel tmdbEndpoint="tv/top_rated" />
        <ShowCarousel title="Trending Today" tmdbEndpoint="trending/tv/day" />
        <ShowCarousel title="Airing Today TV Shows" tmdbEndpoint="tv/airing_today" />
        <ShowCarousel title="Popular TV Shows" tmdbEndpoint="tv/popular" />
        <ShowCarousel title="Top Rated TV Shows" tmdbEndpoint="tv/top_rated" />
        <ShowCarousel title="On Air TV Shows" tmdbEndpoint="tv/on_the_air" />
        <RecentReviewsFiltered />
      </motion.div>
      <BottomNavbar />
    </>
  );
}

export default Home;
