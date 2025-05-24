/**
 * @file LoadingSpinner.jsx
 * @description A React component that displays a full-screen loading animation.
 * It features a rotating circular spinner and can optionally display a pulsing text message.
 */

// Import `motion` from framer-motion for creating animations.
import { motion } from "framer-motion";

/**
 * @function LoadingSpinner
 * @description A React functional component that renders a full-screen loading indicator.
 * The component consists of a container that fades in and out, a circular spinner
 * that rotates indefinitely, and a text element (currently empty) that can pulse.
 *
 * @returns {JSX.Element} The rendered LoadingSpinner component.
 */
const LoadingSpinner = () => (
  // Main container for the loading spinner.
  // It's styled to be a full-screen flex container, centering its children.
  // It has a fade-in and fade-out animation.
  <motion.div 
    className="flex flex-col items-center justify-center h-screen bg-[#1e1e1e] gap-4" // Styling: flex column, center content, full screen height, background color, gap between children.
    initial={{ opacity: 0 }} // Initial animation state: transparent.
    animate={{ opacity: 1 }} // Animate to: fully opaque.
    exit={{ opacity: 0 }}    // Animate on exit: fade out.
  >
    {/* The rotating circular spinner element. */}
    <motion.div
      animate={{ rotate: 360 }} // Animation: continuously rotate 360 degrees.
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }} // Animation transition: 1s duration, repeat infinitely, linear easing for smooth rotation.
      className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" // Styling: size, border (blue with transparent top for spinner effect), rounded full.
    />
    {/* Text element below the spinner. Currently, it doesn't display any text. */}
    {/* It has a y-axis pulsing animation (moving up and down). */}
    <motion.p 
      className="text-white text-lg font-medium" // Styling: white text, large font size, medium font weight.
      initial={{ y: 10 }} // Initial animation state: slightly shifted down.
      animate={{ y: 0 }}  // Animate to: original y-position.
      transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }} // Animation transition: repeat infinitely, reverse direction each time (pulse), 1s duration.
    >
      {/* The text content is currently empty. If text were added here, it would pulse. */}
    </motion.p>
  </motion.div>
);

// Export the LoadingSpinner component as the default export of this module.
export default LoadingSpinner;