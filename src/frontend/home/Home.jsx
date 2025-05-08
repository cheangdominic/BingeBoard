import BottomNavbar from './BottomNavbar.jsx';
import TrendingCarousel from './TrendingCarousel.jsx';
import FriendsRecentlyWatched from './FriendsRecentlyWatched.jsx';
import RecommendedByFriends from './RecommendedByFriends.jsx';
import RecentReviewsFiltered from './RecentReviewsFiltered.jsx';

function Home() {
  return (
    <>
    <TrendingCarousel/>
    <FriendsRecentlyWatched/>
    <RecentReviewsFiltered/>
    <RecommendedByFriends/>
    <BottomNavbar/>
    </>
  )
}

export default Home