import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import './App.css';

import Landing from './landing/Landing.jsx'; 
import AboutUsPage from './aboutus/AboutUsPage.jsx'; 
import LoginPage from './login/LoginPage.jsx';
import SocialFeature from './featurecards/SocialFeature.jsx';
import WatchlistFeature from './featurecards/WatchlistFeature.jsx';
import BrowseFeature from './featurecards/BrowseFeature.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router> 
      <Routes> 
        <Route path="/" element={<Landing />} />  
        <Route path="/login" element={<LoginPage />} />
        <Route path="/aboutus" element={<AboutUsPage />} />
        <Route path="/socialfeature" element={<SocialFeature/>} />
        <Route path="/watchlistfeature" element={<WatchlistFeature/>} />
        <Route path="/browsefeature" element={<BrowseFeature/>} />
      </Routes>
    </Router>
  )
}

export default App
