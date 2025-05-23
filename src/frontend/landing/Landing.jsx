import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import TopNavbar from './TopNavbar.jsx';
import MottoBanner from './MottoBanner.jsx';
import FeatureCards from './FeatureCards.jsx';
import Statistics from './Statistics.jsx';
import PopularReviews from './PopularReviews.jsx';
import ShowCarousel from '../../components/ShowCarousel.jsx';
import Footer from './Footer.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

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

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/home');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <LoadingSpinner/>;
  }

  if (user) {
    return null;
  }

  return (
    <>
      <TopNavbar />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.2 }}
      >
        <MottoBanner />
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.4 }}
      >
        <ShowCarousel
          title="Trending This Week"
          tmdbEndpoint="trending/tv/week"
          mediaType="tv"
        />
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.6 }}
      >
        <PopularReviews />
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.8 }}
      >
        <FeatureCards />
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 1.0 }}
      >
        <Statistics />
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 1.2 }}
      >
        <Footer />
      </motion.div>
    </>
  );
}

export default Landing;
