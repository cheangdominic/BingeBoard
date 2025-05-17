import TopNavbar from "../../frontend/landing/TopNavbar.jsx";
import Footer from "../../frontend/landing/Footer.jsx";
import BottomNavbar from "../../components/BottomNavbar.jsx";
import TVShowSearchGrid from "./TvShowSearchGrid.jsx";
import { useAuth } from "../../context/AuthContext";

function SearchPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <>
      {!isAuthenticated && <TopNavbar />}
      <TVShowSearchGrid />
      {isAuthenticated && <BottomNavbar />}
      {!isAuthenticated && <Footer />}
    </>
  );
}

export default SearchPage;
