import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import './App.css';

import Landing from './landing/Landing.jsx'; 
import AboutUsPage from './aboutus/AboutUsPage.jsx'; 

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router> 
      <Routes> 
        <Route path="/" element={<Landing />} />  
        <Route path="/aboutus" element={<AboutUsPage />} />
      </Routes>
    </Router>
  )
}

export default App
