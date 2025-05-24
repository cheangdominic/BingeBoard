/**
 * @file NotFound.js
 * @description A React component that renders a "404 Page Not Found" error page.
 * It displays a user-friendly message and provides a link to navigate back to the appropriate home page
 * (either the main application home for logged-in users or the landing page for guests).
 * The navigation bars (TopNavbar/Footer or BottomNavbar) are conditionally rendered based on authentication status.
 */

// Import Link component from react-router-dom for client-side navigation.
import { Link } from "react-router-dom";
// Import TopNavbar, typically used for landing pages or unauthenticated users.
import TopNavbar from './landing/TopNavbar.jsx'; // Assuming TopNavbar is in a 'landing' subdirectory relative to this file's parent
// Import Footer, typically used for landing pages or unauthenticated users.
import Footer from './landing/Footer.jsx';     // Assuming Footer is in a 'landing' subdirectory
// Import BottomNavbar, typically used for authenticated users within the main application.
import BottomNavbar from "../components/BottomNavbar.jsx"; // Assuming BottomNavbar is in a 'components' directory relative to this file's parent
// Import useAuth custom hook to access authentication context (to determine if a user is logged in).
import { useAuth } from '../context/AuthContext';

/**
 * @function NotFound
 * @description A React functional component that displays a 404 error page.
 * It adapts the "Return to Home" link and displayed navigation components based on the user's authentication state.
 *
 * @returns {JSX.Element} The rendered NotFound page component.
 */
function NotFound() {
  /**
   * `user`: The authenticated user object from the AuthContext. Null if not authenticated.
   * This is used to determine which home page link to provide and which navigation components to display.
   * @type {object|null}
   */
  const { user } = useAuth();

  /**
   * Determines the appropriate home page URL based on user authentication.
   * If a user is logged in, it links to '/home' (main application dashboard).
   * Otherwise, it links to '/' (landing page).
   * @const {string}
   */
  const homeLink = user ? "/home" : "/";

  // Render the 404 page structure.
  return (
    <>
      {/* Conditionally render the TopNavbar if no user is authenticated. */}
      {!user && <TopNavbar />}
      
      {/* Main content area for the 404 page, styled to be centered. */}
      <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8 bg-[#1e1e1e]">
        <div className="text-center"> {/* Centered text content. */}
          {/* "404" error code text. */}
          <p className="text-base font-semibold text-[#ebbd34]">404</p>
          {/* Main "Page not found" heading. */}
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-blue-400 sm:text-7xl">
            Page not found
          </h1>
          {/* Descriptive message for the user. */}
          <p className="mt-6 text-lg font-medium text-pretty text-[#ffffff] sm:text-xl/8">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          {/* Container for the action button (link to home). */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {/* Link component to navigate back to the determined home page. */}
            <Link
              to={homeLink} // Dynamic link based on authentication state.
              className="rounded-md bg-[#1963da] px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#ebbd34] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 transition"
            >
              Return to the Home page
            </Link>
          </div>
        </div>
      </main>
      
      {/* Conditionally render either the BottomNavbar (for authenticated users) or the Footer (for guests). */}
      {user ? <BottomNavbar /> : <Footer />}
    </>
  );
}

// Export the NotFound component as the default export of this module.
export default NotFound;