import { useState } from 'react'
import TopNavbar from './TopNavbar.jsx'
import MottoBanner from './MottoBanner.jsx'
import FeatureCards from './FeatureCards.jsx'
import Statistics from './Statistics.jsx'

function Landing() {
  const [count, setCount] = useState(0)

  return (
    <>
    <TopNavbar/>
    <MottoBanner/>
    <FeatureCards/>
    <Statistics/>
    </>
  )
}

export default Landing
