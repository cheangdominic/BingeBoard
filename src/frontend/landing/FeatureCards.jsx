/**
 * @file FeatureCards.jsx
 * @description A React component that displays a set of feature cards for the application's landing page.
 * Each card highlights a key feature (e.g., Social, Watchlist, Browse) with an icon, title, description,
 * and links to a more detailed feature page. Includes hover animations.
 */

// Import Link component from react-router-dom for client-side navigation.
import { Link } from "react-router-dom";
// Import `motion` from framer-motion for creating animated components.
import { motion } from "framer-motion";

// Import icons for each feature card.
import friendIcon from "../../assets/friend_feature_icon.svg";
import watchlistIcon from "../../assets/watchlist_icon.svg";
import browseIcon from "../../assets/browse_tv_icon.svg";

/**
 * @function FeatureCards
 * @description A React functional component that renders a section with multiple feature cards.
 * Each card is animated on hover and links to a page detailing that specific feature.
 *
 * @returns {JSX.Element} The rendered FeatureCards component.
 */
function FeatureCards() {
  return (
    // Main section container with padding and background color.
    <section className="px-4 py-12 md:py-16 bg-[#1e1e1e]">
      {/* Section title, centered and styled. */}
      <h1 className="text-white text-3xl md:text-4xl font-bold mb-12 text-center font-coolvetica">
        BingeBoard gives you the power to...
      </h1>

      {/* Flex container for the feature cards, arranges them in a row on medium screens and up, column on small. */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-6 max-w-7xl mx-auto">
        {/* Array defining the data for each feature card. */}
        {[
          {
            title: "Connect and Share",
            description:
              "Binging doesn't have to be lonely. BingeBoard lets you connect with friends, share what you're watching, and discover new favorites together—making your streaming experience social and fun.",
            icon: friendIcon, // Icon for the social feature
            link: "/socialfeature", // Link to the social feature page
          },
          {
            title: "Save For Later",
            description:
              "Never forget that show you wanted to watch but never found the time for. With BingeBoard, you can build and manage your personal watchlist—so every must-watch moment is right where you left it.",
            icon: watchlistIcon, // Icon for the watchlist feature
            link: "/watchlistfeature", // Link to the watchlist feature page
          },
          {
            title: "Browse Your Next Watch",
            description:
              "Not sure what to watch next? BingeBoard helps you discover new shows based on your interests, trending picks, and what your friends are watching—so your next binge is always one click away.",
            icon: browseIcon, // Icon for the browse feature
            link: "/browsefeature", // Link to the browse feature page
          },
        ].map((feature, index) => ( // Map over the feature data array to render each card.
          // Link component wraps the entire card, making it clickable for navigation.
          // `group` class enables group-hover states for Tailwind CSS on child elements.
          <Link to={feature.link} key={index} className="w-full max-w-md group">
            {/* Animated card container using framer-motion. */}
            <motion.div
              initial={{ y: 0, scale: 1 }} // Initial animation state (no change from default).
              // Hover animation: slight lift, scale up, and add a blue shadow.
              whileHover={{ 
                y: -8, // Move up by 8 pixels
                scale: 1.02, // Scale up by 2%
                boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2)" // Add a subtle blue shadow
              }}
              // Transition settings for the hover animation (spring physics).
              transition={{ 
                type: "spring", 
                stiffness: 400,
                damping: 15,
                bounce: 0.4
              }}
              // Styling for the card: height, background, rounded corners, overflow, border, hover border color.
              className="h-full bg-[#2E2E2E] rounded-xl overflow-hidden border border-gray-800 hover:border-blue-400/30 relative"
            >
              {/* Top section of the card containing the icon, with a gradient background and hover shimmer. */}
              <motion.div 
                whileHover={{ opacity: 0.9 }} // Slightly reduce opacity of the gradient bar on hover (can be adjusted).
                className="p-1 bg-gradient-to-r from-amber-200/60 to-blue-300/60 relative overflow-hidden"
              >
                {/* Shimmer effect element: a diagonal gradient that moves across on group hover. */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -rotate-45 w-200% -left-[100%]" />
                {/* Feature icon image. */}
                <img
                  className="w-full h-40 object-contain p-4 relative z-10" // `z-10` to place icon above shimmer.
                  src={feature.icon}
                  alt={feature.title}
                />
              </motion.div>

              {/* Bottom section of the card containing the title and description. */}
              <div className="p-6">
                {/* Feature title with hover color change. */}
                <motion.h3 
                  whileHover={{ color: "#fef3c7" }} // Change text color to a light yellow on hover.
                  className="text-xl font-bold text-white mb-3 transition-colors duration-300"
                >
                  {feature.title}
                </motion.h3>
                {/* Feature description with hover color change. */}
                <motion.p 
                  whileHover={{ color: "#e5e7eb" }} // Change text color to a lighter gray on hover.
                  className="text-gray-300/90 leading-relaxed transition-colors duration-300"
                >
                  {feature.description}
                </motion.p>
              </div>
              
              {/* Subtle inner shadow effect that appears on group hover, enhancing depth. */}
              <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                boxShadow: "inset 0 0 20px rgba(59, 130, 246, 0.15)" // Light blue inner shadow
              }} />
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Export the FeatureCards component as the default export of this module.
export default FeatureCards;