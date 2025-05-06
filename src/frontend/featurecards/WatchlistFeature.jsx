import { useState } from "react";
import TopNavbar from '../landing/TopNavbar.jsx';

function WatchlistFeature() {
  const [count, setCount] = useState(0);

  return (
    <>
        <TopNavbar/>
    </>
  );
}

export default WatchlistFeature;
