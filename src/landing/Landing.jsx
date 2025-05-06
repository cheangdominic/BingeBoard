import { useState } from 'react'
import TopNavbar from './TopNavbar.jsx'
import MottoBanner from './MottoBanner.jsx'

function Landing() {
  const [count, setCount] = useState(0)

  return (
    <>
    <TopNavbar/>
    <MottoBanner/>
    </>
  )
}

export default Landing
