/**
 * @file Footer.jsx
 * @description A React component that renders the footer section of the application.
 * It includes the application logo and name, navigation links, social media icons, and copyright information.
 */

// Import Link component from react-router-dom for client-side navigation.
import { Link } from "react-router-dom";
// Import useState hook from React (currently unused in this component, but imported).
import { useState } from "react";

// Import image assets for the logo and social media icons.
import logo from "../../assets/BingeBoard Icon.svg";
import instagramLogo from "../../assets/instagram_footer_icon.svg";
import xLogo from "../../assets/X_footer_icon.svg"; // Assuming this is for Twitter/X
import facebookLogo from "../../assets/facebook_footer_icon.svg";
import tiktokLogo from "../../assets/tiktok_footer_icon.svg";

/**
 * @function Footer
 * @description A React functional component that renders the application's footer.
 * It contains the site logo, name, a set of navigation links (Home, Features, About Us, Contact),
 * social media icons, and a copyright notice.
 *
 * @returns {JSX.Element} The rendered Footer component.
 */
function Footer() {
  // `count` state and `setCount` function are declared but not used in this component.
  // This might be leftover from a previous implementation or a placeholder.
  const [count, setCount] = useState(0);

  return (
    // Footer element with styling for background, text color, font, padding, and margin.
    <footer className="bg-[#1e1e1e] text-[#ECE6DD] font-coolvetica py-10 mt-20">
      {/* Container for the main footer content, centered with max width, padding, and responsive flex layout. */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">

        {/* Left section: Logo and application name, linked to the homepage. */}
        <Link
          to="/" // Links to the root path.
          // Scrolls to the top of the page smoothly when clicked.
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex gap-3" // Flex layout for logo and name.
        >
          {/* Application logo image. */}
          <img
            alt="BingeBoard logo"
            src={logo}
            className="h-10 w-auto" // Styling for logo size.
          />
          {/* Application name text. */}
          <div className="text-3xl font-bold text-white hover:text-blue-400 transition">
            BingeBoard
          </div>
        </Link>

        {/* Middle section: Navigation links. */}
        <ul className="flex flex-col md:flex-row gap-4 text-center text-sm">
          <li>
            <Link
              to="/"
              // Scrolls to the top of the page smoothly.
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-blue-400 transition" // Hover effect for link text.
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/" // Assuming "Features" section is on the homepage.
              // Scrolls to a specific vertical position (1000px from top) smoothly.
              // This is a common technique for same-page anchor links in SPAs.
              onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })}
              className="hover:text-blue-400 transition"
            >
              Features
            </Link>
          </li>
          <li>
            <Link
              to="/aboutus" // Links to the "About Us" page.
              className="hover:text-blue-400 transition"
            >
              About Us
            </Link>
          </li>
          <li>
            <Link
              to="/contact" // Links to the "Contact" page.
              className="hover:text-blue-400 transition"
            >
              Contact
            </Link>
          </li>
        </ul>

        {/* Right section: Social media icons. */}
        {/* Placeholder href="#" should be replaced with actual social media profile URLs. */}
        <div className="flex gap-4 justify-center md:justify-end w-full md:w-auto md:ml-20">
          <a href="#" aria-label="Instagram" className="hover:opacity-75 transition"> {/* Link to Instagram */}
            <img src={instagramLogo} alt="Instagram" className="h-5 w-5" />
          </a>
          <a href="#" aria-label="X" className="hover:opacity-75 transition"> {/* Link to X (formerly Twitter) */}
            <img src={xLogo} alt="X" className="h-5 w-5" />
          </a>
          <a href="#" aria-label="Facebook" className="hover:opacity-75 transition"> {/* Link to Facebook */}
            <img src={facebookLogo} alt="Facebook" className="h-5 w-5" />
          </a>
          <a href="#" aria-label="TikTok" className="hover:opacity-75 transition"> {/* Link to TikTok */}
            <img src={tiktokLogo} alt="TikTok" className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* Bottom section: Copyright notice. */}
      <div className="mt-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} BingeBoard. All rights reserved. {/* Dynamically displays the current year. */}
      </div>
    </footer>
  );
}

// Export the Footer component as the default export of this module.
export default Footer;