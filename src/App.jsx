import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import './App.css';

import Landing from './landing/Landing.jsx'; 

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router> 
      <Routes> 
        <Route path="/" element={<Landing />} />  
      </Routes>
    </Router>
  )
}

export default App
