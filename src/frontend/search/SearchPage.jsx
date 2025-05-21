import TopNavbar from "../../frontend/landing/TopNavbar.jsx";
import Footer from "../../frontend/landing/Footer.jsx";
import BottomNavbar from "../../components/BottomNavbar.jsx";
import TVShowSearchGrid from "./TvShowSearchGrid.jsx";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

function SearchPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {!user && <TopNavbar />}
      <TVShowSearchGrid />
      {user && <BottomNavbar />}
      {!user && <Footer />}
    </>
  );
}

export default SearchPage;
