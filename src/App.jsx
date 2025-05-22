import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Landing from './frontend/landing/Landing.jsx';
import ProfilePage from './frontend/profile/ProfilePage.jsx';
import ShowDetailsPage from './frontend/showdetails/ShowDetailsPage.jsx';
import AboutUsPage from './frontend/aboutus/AboutUsPage.jsx';
import LoginPage from './frontend/login/LoginPage.jsx';
import SignupPage from './frontend/signup/SignupPage.jsx';
import SearchPage from './frontend/search/SearchPage.jsx';
import ViewAllPage from './frontend/viewall/ViewAllPage.jsx';

import SocialFeature from './frontend/featurecards/SocialFeature.jsx';
import WatchlistFeature from './frontend/featurecards/WatchlistFeature.jsx';
import BrowseFeature from './frontend/featurecards/BrowseFeature.jsx';
import NotFound from './frontend/NotFound.jsx';
import ActivityPage from './frontend/activity/ActivityPage.jsx';
import LogPage from './frontend/log/LogPage.jsx';
import SearchUsers from './frontend/social/SearchUsers.jsx';
import UserProfile from './frontend/social/UserProfile.jsx';
import Home from './frontend/home/Home.jsx';
import ViewAllWatchlist from './frontend/profile/WatchlistViewAll.jsx';
import ViewAllRecentlyWatched from './frontend/profile/RecentlyWatchedViewAll.jsx';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/aboutus" element={<AboutUsPage />} />
        <Route path="/socialfeature" element={<SocialFeature />} />
        <Route path="/watchlistfeature" element={<WatchlistFeature />} />
        <Route path="/browsefeature" element={<BrowseFeature />} />
        <Route path="/show/:id" element={<ShowDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/log" element={<LogPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/browse" element={<SearchPage />} />
        <Route path="/social" element={<SearchUsers />} />
        <Route path="/user/:username" element={<UserProfile />} />
        <Route path="/view-all/:tmdbEndpoint" element={<ViewAllPage />} />
        <Route path="/view-all/watchlist" element={<ViewAllWatchlist />} />
        <Route path="/view-all/recentlywatched" element={<ViewAllRecentlyWatched />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
