import BottomNavbar from './BottomNavbar.jsx';
import TrendingCarousel from './TrendingCarousel.jsx';
import FriendsRecentlyWatched from './FriendsRecentlyWatched.jsx';
import RecommendedByFriends from './RecommendedByFriends.jsx';

function Home() {
  return (
    <>
    <TrendingCarousel/>
    <FriendsRecentlyWatched/>
    <RecommendedByFriends/>
    <BottomNavbar/>
    </>
  )
}

export default Home