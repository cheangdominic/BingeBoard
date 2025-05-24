/**
 * @file App.js
 * @description The main application component that sets up client-side routing
 * using React Router. It defines all the routes for different pages and features
 * of the BingeBoard application.
 */

// Import useState hook from React (currently unused in this App component, but often present).
import { useState } from 'react';
// Import BrowserRouter, Routes, and Route components from react-router-dom for routing.
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Import global CSS file for the application.
import './App.css';

// Import page and feature components that will be mapped to routes.
// Landing Page and related informational pages:
import Landing from './frontend/landing/Landing.jsx';         // Main landing page for unauthenticated users.
import AboutUsPage from './frontend/aboutus/AboutUsPage.jsx';   // Page describing the team/project.
// Feature detail pages (linked from landing page feature cards):
import SocialFeature from './frontend/featurecards/SocialFeature.jsx';     // Detailed page for the social feature.
import WatchlistFeature from './frontend/featurecards/WatchlistFeature.jsx'; // Detailed page for the watchlist feature.
import BrowseFeature from './frontend/featurecards/BrowseFeature.jsx';     // Detailed page for the browse/discovery feature.

// Authentication related pages:
import LoginPage from './frontend/login/LoginPage.jsx';       // User login page.
import SignupPage from './frontend/signup/SignupPage.jsx';      // User signup/registration page.

// Core application pages for authenticated users:
import Home from './frontend/home/Home.jsx';                 // Main dashboard/home page for logged-in users.
import ProfilePage from './frontend/profile/ProfilePage.jsx';   // Authenticated user's own profile page.
import UserProfile from './frontend/social/UserProfile.jsx';    // Public profile page for any user (viewed by username).
import ShowDetailsPage from './frontend/showdetails/ShowDetailsPage.jsx'; // Page displaying details for a specific TV show.
import SearchPage from './frontend/search/SearchPage.jsx';      // Page for searching TV shows.
import LogPage from './frontend/log/LogPage.jsx';             // Page for logging watched shows/episodes.
import ActivityPage from './frontend/activity/ActivityPage.jsx';  // Page displaying the user's activity feed.

// Social and friends-related pages:
import SearchUsers from './frontend/social/searchUsers.jsx';      // Page for searching other users.
import FriendRequestsPage from './frontend/friends/FriendRequestsPage.jsx'; // Page to view and manage friend requests.
import FriendsListPage from './frontend/friends/FriendListPage.jsx';      // Page displaying a user's list of friends.

// "View All" pages for specific lists or carousels:
import ViewAllPage from './frontend/viewall/ViewAllPage.jsx';                 // Generic page to view all items from a TMDB endpoint (e.g., trending, popular).
import ViewAllWatchlist from './frontend/profile/WatchlistViewAll.jsx';       // Page to view all items in the user's watchlist.
import ViewAllRecentlyWatched from './frontend/profile/RecentlyWatchedViewAll.jsx'; // Page to view all recently watched shows.

// Error handling page:
import NotFound from './frontend/NotFound.jsx';               // 404 Page Not Found component.


/**
 * @function App
 * @description The root component of the React application.
 * It sets up the `Router` and defines all the `Routes` for the application.
 * Each `Route` maps a URL path to a specific React component.
 *
 * @returns {JSX.Element} The rendered application with its routing structure.
 */
function App() {
  // The `count` state and `setCount` function are declared but not used in this App component.
  // This might be leftover from a template or previous implementation.
  // const [count, setCount] = useState(0); // Currently unused

  return (
    // `Router` component (aliased as BrowserRouter) provides the routing context for the application.
    <Router>
      {/* `Routes` component is a container for all individual `Route` definitions.
          It ensures that only one route matches and renders at a time. */}
      <Routes>
        {/* Landing Page and Authentication Routes */}
        <Route path="/" element={<Landing />} /> {/* Root path, typically the landing page. */}
        <Route path="/login" element={<LoginPage />} /> {/* Login page. */}
        <Route path="/signup" element={<SignupPage />} /> {/* Signup page. */}

        {/* Informational and Feature Detail Pages (mostly for unauthenticated users or general info) */}
        <Route path="/aboutus" element={<AboutUsPage />} /> {/* About Us page. */}
        <Route path="/socialfeature" element={<SocialFeature />} /> {/* Detailed page for social feature. */}
        <Route path="/watchlistfeature" element={<WatchlistFeature />} /> {/* Detailed page for watchlist feature. */}
        <Route path="/browsefeature" element={<BrowseFeature />} /> {/* Detailed page for browse feature. */}
        
        {/* Core Authenticated User Routes */}
        <Route path="/home" element={<Home />} /> {/* Main home/dashboard for logged-in users. */}
        <Route path="/profile" element={<ProfilePage />} /> {/* Authenticated user's own profile. */}
        {/* Note: The `/profile` route for the authenticated user's own profile is distinct from `/user/:username`
             which is for viewing any user's public profile. `ProfilePage` might internally fetch the
             logged-in user's data, while `UserProfile` fetches based on the `username` param. */}
        <Route path="/activity" element={<ActivityPage />} /> {/* User's activity feed. */}
        <Route path="/log" element={<LogPage />} /> {/* Page for logging shows. */}

        {/* Search and Discovery Routes */}
        <Route path="/search" element={<SearchPage />} /> {/* Main TV show search page. */}
        <Route path="/browse" element={<SearchPage />} /> {/* "/browse" also leads to SearchPage, offering an alternative path. */}
        <Route path="/show/:id" element={<ShowDetailsPage />} /> {/* Detail page for a specific TV show by ID. */}
        
        {/* Social and User Interaction Routes */}
        <Route path="/social" element={<SearchUsers />} /> {/* Page to search for other users. */}
        <Route path="/user/:username" element={<UserProfile />} /> {/* Public profile page for a user specified by `username`. */}
        <Route path="/user/:username/friends" element={<FriendsListPage />} /> {/* Page showing a user's friends list. */}
        <Route path="/requests" element={<FriendRequestsPage />} /> {/* Page for managing friend requests. */}

        {/* "View All" List Pages */}
        {/* Generic route for "View All" pages based on a TMDB endpoint (e.g., /view-all/trending/tv/week). */}
        <Route path="/view-all/:tmdbEndpoint" element={<ViewAllPage />} />
        {/* Specific "View All" page for the user's watchlist. */}
        <Route path="/view-all/watchlist" element={<ViewAllWatchlist />} />
        {/* Specific "View All" page for recently watched shows. */}
        <Route path="/view-all/recentlywatched" element={<ViewAllRecentlyWatched />} />
        
        {/* Fallback Route for 404 Not Found */}
        {/* The `*` path matches any URL not matched by the routes above. */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

// Export the App component as the default export of this module.
export default App