import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import './App.css';
import ProfilePage from './profile/ProfilePage.jsx';
import Landing from './frontend/landing/Landing.jsx'; 
import ShowDetailsPage from './frontend/showdetails/ShowDetailsPage.jsx';
import AboutUsPage from './frontend/aboutus/AboutUsPage.jsx'; 
import LoginPage from './frontend/login/LoginPage.jsx';
import SignupPage from './frontend/signup/SignupPage.jsx';
import SocialFeature from './frontend/featurecards/SocialFeature.jsx';
import WatchlistFeature from './frontend/featurecards/WatchlistFeature.jsx';
import BrowseFeature from './frontend/featurecards/BrowseFeature.jsx';
import NotFound from './frontend/NotFound.jsx';
import Home from './frontend/home/Home.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router> 
      <Routes> 
        <Route path="/" element={<Landing />} />  
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/aboutus" element={<AboutUsPage />} />
        <Route path="/socialfeature" element={<SocialFeature/>} />
        <Route path="/watchlistfeature" element={<WatchlistFeature/>} />
        <Route path="/browsefeature" element={<BrowseFeature/>} />
        <Route path="/show/:id" element={<ShowDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/home" element = {<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
