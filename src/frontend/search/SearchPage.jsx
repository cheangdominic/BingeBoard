/**
 * @file SearchPage.js
 * @description A React component that serves as the main container for the TV show search page.
 * It conditionally renders different navigation bars (TopNavbar/Footer for unauthenticated users,
 * BottomNavbar for authenticated users) and displays the `TVShowSearchGrid` component
 * for the search functionality. It also handles the loading state from the authentication context.
 */

// Import TopNavbar, typically used for landing pages or unauthenticated users.
import TopNavbar from "../../frontend/landing/TopNavbar.jsx";
// Import Footer, typically used for landing pages or unauthenticated users.
import Footer from "../../frontend/landing/Footer.jsx";
// Import BottomNavbar, typically used for authenticated users within the main application.
import BottomNavbar from "../../components/BottomNavbar.jsx";
// Import TVShowSearchGrid, which contains the core search interface and results display.
import TVShowSearchGrid from "./TvShowSearchGrid.jsx"; // Corrected path if TvShowSearchGrid.jsx is in the same directory
// Import useAuth custom hook to access authentication context (user state and loading status).
import { useAuth } from "../../context/AuthContext";
// Import LoadingSpinner component to display while authentication status is being determined.
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

/**
 * @function SearchPage
 * @description A React functional component that renders the search page.
 * It adapts its layout (navigation bars) based on whether a user is authenticated.
 * The primary content is the `TVShowSearchGrid`.
 *
 * @returns {JSX.Element} The rendered SearchPage component or a loading spinner.
 */
function SearchPage() {
  /**
   * `user`: The authenticated user object from the AuthContext. Null if not authenticated.
   * `loading`: Boolean indicating if the authentication status is currently being loaded.
   * @type {{user: object|null, loading: boolean}}
   */
  const { user, loading } = useAuth();

  /**
   * If the authentication status is still loading, render the `LoadingSpinner` component.
   * This provides visual feedback to the user that the application is initializing.
   */
  if (loading) {
    return <LoadingSpinner />;
  }

  /**
   * Render the SearchPage structure.
   * The layout of navigation components (TopNavbar, Footer, BottomNavbar)
   * depends on the authentication status (`user`).
   */
  return (
    <>
      {/* If the user is NOT authenticated, render the TopNavbar. */}
      {!user && <TopNavbar />}
      
      {/* Always render the TVShowSearchGrid, which contains the search functionality and results. */}
      <TVShowSearchGrid />
      
      {/* If the user IS authenticated, render the BottomNavbar. */}
      {user && <BottomNavbar />}
      
      {/* If the user is NOT authenticated, render the Footer. */}
      {!user && <Footer />}
    </>
  );
}

// Export the SearchPage component as the default export of this module.
export default SearchPage;