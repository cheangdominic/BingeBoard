import { Link } from "react-router-dom";
import { useState } from "react";

import logo from "../../assets/BingeBoard Icon.svg";
import instagramLogo from "../../assets/instagram_footer_icon.svg";
import xLogo from "../../assets/X_footer_icon.svg";
import facebookLogo from "../../assets/facebook_footer_icon.svg";
import tiktokLogo from "../../assets/tiktok_footer_icon.svg";

function Footer() {
    const [count, setCount] = useState(0);

  return (
    <footer className="bg-[#1e1e1e] text-[#ECE6DD] font-coolvetica py-10 mt-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        
      <Link
      to="/"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <div className="flex gap-3">
        <img
              alt="BingeBoard logo"
              src={logo}
              className="h-10 w-auto"
            />
        <div className="text-3xl font-bold text-white hover:text-blue-400 transition">
          BingeBoard
        </div>
        </div>
        </Link>

        <ul className="flex flex-col md:flex-row gap-4 text-center text-sm">
          <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
          <li><a href="/" className="hover:text-blue-400 transition">Home</a></li>
          </Link>
          <Link
          to="/"
          onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
          >
          <li><a href="/features" className="hover:text-blue-400 transition">Features</a></li>
          </Link>
          <li><a href="/aboutus" className="hover:text-blue-400 transition">About Us</a></li>
          <li><a href="/contact" className="hover:text-blue-400 transition">Contact</a></li>
        </ul>

        <div className="flex gap-4 justify-center md:justify-end w-full md:w-auto md:ml-20">
        <a href="#" aria-label="Instagram" className="hover:opacity-75 transition">
            <img src={instagramLogo} alt="Instagram" className="h-5 w-5" />
          </a>
          <a href="#" aria-label="X" className="hover:opacity-75 transition">
            <img src={xLogo} alt="X" className="h-5 w-5" />
          </a>
          <a href="#" aria-label="Facebook" className="hover:opacity-75 transition">
            <img src={facebookLogo} alt="Facebook" className="h-5 w-5" />
          </a>
          <a href="#" aria-label="TikTok" className="hover:opacity-75 transition">
            <img src={tiktokLogo} alt="TikTok" className="h-5 w-5" />
          </a>
          
        </div>
      </div>


      <div className="mt-6 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} BingeBoard. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
