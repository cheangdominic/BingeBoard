import { useState } from 'react'
import BottomNavbar from './BottomNavbar.jsx';
import TrendingCarousel from './TrendingCarousel.jsx'

function Home() {
  const [count, setCount] = useState(0)

  return (
    <>
    <TrendingCarousel/>
    <BottomNavbar/>
    </>
  )
}

export default Home