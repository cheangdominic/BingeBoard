import { motion } from 'framer-motion';
import BottomNavbar from './BottomNavbar.jsx';
import TrendingCarousel from './TrendingCarousel.jsx';
import FriendsRecentlyWatched from './FriendsRecentlyWatched.jsx';
import RecommendedByFriends from './RecommendedByFriends.jsx';
import RecentReviewsFiltered from './RecentReviewsFiltered.jsx';
import ShowCarousel from '../../components/ShowCarousel.jsx';

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
  return (
    <>
    <TrendingCarousel/>

    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ delay: 0.2 }}
    >
    <FriendsRecentlyWatched/>
    </motion.div>


     <ShowCarousel title="Recently Watched" tmdbEndpoint="popular" mediaType="tv" />

    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ delay: 0.4 }}
    >
    <RecentReviewsFiltered/>
    </motion.div>

    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ delay: 0.6 }}
    >
    <RecommendedByFriends/>
    </motion.div>


    <BottomNavbar/>
    </>
  )
}

export default Home