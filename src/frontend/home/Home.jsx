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
        <TrendingCarousel tmdbEndpoint="tv/top_rated" />

        {/* <FriendsRecentlyWatched /> */}

        <ShowCarousel
          title="Trending Today"
          tmdbEndpoint="trending/tv/day"
        />

        <ShowCarousel
          title="Airing Today TV Shows"
          tmdbEndpoint="tv/airing_today"
        />

        <ShowCarousel
          title="Popular TV Shows"
          tmdbEndpoint="tv/popular"
        />
        <ShowCarousel
          title="Top Rated TV Shows"
          tmdbEndpoint="tv/top_rated"
        />
        {/* <RecentReviewsFiltered /> */}

        <ShowCarousel
          title="On Air TV Shows"
          tmdbEndpoint="tv/on_the_air"
        />

        {/* <RecommendedByFriends /> */}
      </motion.div>
      <BottomNavbar />
    </>
  );
}

export default Home;