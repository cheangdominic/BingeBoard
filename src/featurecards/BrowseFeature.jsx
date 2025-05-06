import { useState } from "react";
import TopNavbar from '../landing/TopNavbar.jsx';

function BrowseFeature() {
  const [count, setCount] = useState(0);

  return (
    <>
        <TopNavbar/>
    </>
  );
}

export default BrowseFeature;
