import { motion } from 'framer-motion';
import TopNavbar from './TopNavbar.jsx';
import MottoBanner from './MottoBanner.jsx';
import FeatureCards from './FeatureCards.jsx';
import Statistics from './Statistics.jsx';
import PopularReviews from './PopularReviews.jsx';
import ShowCarousel from '../../components/ShowCarousel.jsx';
import Footer from './Footer.jsx';

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
        <FeatureCards />
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.6 }}
      >
        <Statistics />
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.8 }}
      >
        <PopularReviews />
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 1.0 }}
      >
        <ShowCarousel
          title="Airing Today"
          tmdbEndpoint="airing_today"
          mediaType="tv"
        />
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