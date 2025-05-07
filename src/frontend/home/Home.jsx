import { useState } from 'react'
import BottomNavbar from './BottomNavBar.jsx';

function Home() {
  const [count, setCount] = useState(0)

  return (
    <>
    <BottomNavbar/>
    </>
  )
}

export default Home