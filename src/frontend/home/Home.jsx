import { useState } from 'react'
import BottomNavbar from './frontend/home/BottomNavBar.jsx';

function Home() {
  const [count, setCount] = useState(0)

  return (
    <>
    <BottomNavbar/>
    </>
  )
}

export default Home