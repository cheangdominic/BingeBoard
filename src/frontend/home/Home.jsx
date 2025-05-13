import { motion } from 'framer-motion';
import BottomNavbar from '../../components/BottomNavbar.jsx';
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
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.2 }}
      >
        <TrendingCarousel />

        <FriendsRecentlyWatched />

        <ShowCarousel
          title="Trending Today"
          tmdbEndpoint="tv/day"
          mediaType="trending"
        />
        <ShowCarousel
          title="Popular TV Shows"
          tmdbEndpoint="popular"
          mediaType="tv"
        />
        <ShowCarousel
          title="Top Rated TV Shows"
          tmdbEndpoint="top_rated"
          mediaType="tv"
        />
        <RecentReviewsFiltered />

        <ShowCarousel
          title="On Air TV Shows"
          tmdbEndpoint="on_the_air"
          mediaType="tv"
        />

        <ShowCarousel
          title="Airing Today TV Shows"
          tmdbEndpoint="airing_today"
          mediaType="tv"
        />
      
      <RecommendedByFriends />

      </motion.div>
      <BottomNavbar />
    </>
  )
}

export default Home