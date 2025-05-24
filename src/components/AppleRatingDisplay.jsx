/**
 * @file AppleRatingDisplay.jsx
 * @description A React component for displaying a rating using apple icons.
 * It supports full, partial, and empty apples, customizable size, and optional interactivity for setting a rating.
 */

// Import React for creating the component.
import React from 'react';
// Import `motion` from framer-motion for animations (e.g., hover effects).
import { motion } from 'framer-motion';
// Import the `Apple` icon from the lucide-react library.
import { Apple } from 'lucide-react';

/**
 * @function PartialAppleDisplay
 * @description An inner component to render a single apple icon that is partially filled.
 * This is used to represent fractional parts of a rating.
 *
 * @param {object} props - The properties passed to the component.
 * @param {number} props.fillPercent - The percentage (0-100) to fill the apple icon.
 * @param {string} props.size - Tailwind CSS classes defining the size of the apple icon (e.g., "w-5 h-5").
 * @returns {JSX.Element} The rendered partially filled apple icon.
 */
const PartialAppleDisplay = ({ fillPercent, size }) => (
  // Container for the partial apple, using relative positioning for layering.
  <div className={`relative ${size} inline-block`}>
    {/* Base (empty part) of the apple icon, typically grayed out. */}
    <Apple className={`absolute top-0 left-0 ${size} text-gray-500`} />
    {/* Container for the filled portion of the apple.
        `overflow: hidden` and a dynamic width based on `fillPercent` create the partial fill effect. */}
    <div
      className={`absolute top-0 left-0 h-full overflow-hidden`}
      style={{ width: `${fillPercent}%` }}
    >
      {/* Inner div to ensure the filled apple icon aligns correctly within the clipped area. */}
      <div className={`${size}`}>
        {/* The filled apple icon (typically yellow), which will be clipped by its parent. */}
        <Apple className={`${size} text-yellow-400 fill-yellow-400`} />
      </div>
    </div>
  </div>
);

/**
 * @function AppleRatingDisplay
 * @description A React functional component that renders a rating display using apple icons.
 * It can show full apples, a partially filled apple, and empty apples.
 * It can also be interactive, allowing users to click on apples to set a rating.
 *
 * @param {object} props - The properties passed to the component.
 * @param {number|string} props.rating - The numerical rating value (e.g., 3.5 or "3.5").
 * @param {string} [props.appleSize="w-5 h-5"] - Tailwind CSS classes for the size of each apple icon.
 * @param {function|null} [props.onAppleClick=null] - Callback function invoked when an apple is clicked in interactive mode.
 *                                                   Receives the new rating (1-5) as an argument.
 * @param {boolean} [props.interactive=false] - If true, apples are clickable and have hover effects.
 * @returns {JSX.Element} The rendered AppleRatingDisplay component or a "No rating" message if the rating is invalid.
 */
export default function AppleRatingDisplay({ rating, appleSize = "w-5 h-5", onAppleClick = null, interactive = false }) {
  // Convert the input rating to a number.
  const numericRating = Number(rating);

  // Validate the rating: if it's not a number or out of the 0-5 range, display "No rating".
  if (isNaN(numericRating) || numericRating < 0 || numericRating > 5) {
    return <span className="text-xs text-gray-400">No rating</span>;
  }

  // Calculate the number of full apples (integer part of the rating).
  const fullApples = Math.floor(numericRating);
  // Calculate the fill percentage for a potential partial apple (fractional part).
  const partialFillPercent = (numericRating - fullApples) * 100;
  // Determine if a partial apple should be displayed (only if the fill percentage is significant, e.g., > 1%).
  const hasPartialApple = partialFillPercent > 1;
  // Calculate the number of empty apples needed to complete the 5-apple display.
  const emptyApples = 5 - fullApples - (hasPartialApple ? 1 : 0);

  /**
   * Handles the click event on an apple when the component is in interactive mode.
   * @param {number} index - The 1-based index of the clicked apple, representing the new rating.
   */
  const handleAppleClick = (index) => {
    // If the component is interactive and an onAppleClick callback is provided, call it.
    if (interactive && onAppleClick) {
      onAppleClick(index);
    }
  };

  // Array to store the JSX elements for each apple in the rating display.
  const appleElements = [];

  // Generate JSX for full (filled yellow) apples.
  for (let i = 0; i < fullApples; i++) {
    appleElements.push(
      <motion.div 
        key={`full-${i}`} 
        // Apply hover scale animation if interactive.
        whileHover={interactive ? { scale: 1.2 } : {}}
        onClick={() => handleAppleClick(i + 1)}
        // Add cursor-pointer class if interactive.
        className={`${interactive ? 'cursor-pointer' : ''} flex items-center justify-center`}
      >
        <Apple
          className={`${appleSize} text-yellow-400 fill-yellow-400`}
        />
      </motion.div>
    );
  }

  // Generate JSX for the partial apple if one exists.
  if (hasPartialApple) {
    appleElements.push(
      <motion.div 
        key="partial" 
        whileHover={interactive ? { scale: 1.2 } : {}}
        onClick={() => handleAppleClick(fullApples + 1)} // Clicking a partial apple means selecting the next full rating.
        className={`${interactive ? 'cursor-pointer' : ''} flex items-center justify-center`}
      >
        <PartialAppleDisplay fillPercent={partialFillPercent} size={appleSize} />
      </motion.div>
    );
  }

  // Generate JSX for empty (gray) apples.
  for (let i = 0; i < emptyApples; i++) {
    appleElements.push(
      <motion.div 
        key={`empty-${i}`} 
        whileHover={interactive ? { scale: 1.2 } : {}}
        // Calculate the rating value for clicking an empty apple.
        onClick={() => handleAppleClick(fullApples + (hasPartialApple ? 1 : 0) + i + 1)}
        className={`${interactive ? 'cursor-pointer' : ''} flex items-center justify-center`}
      >
        <Apple
          className={`${appleSize} text-gray-500`}
        />
      </motion.div>
    );
  }
  
  // Ensure there are always 5 apple elements in total by adding transparent placeholders if needed.
  // This loop might be redundant if the logic above always results in 5 elements (full + partial + empty).
  // However, it could be a safeguard or for visual consistency if the sum is less than 5.
  while (appleElements.length < 5) {
    appleElements.push(
      <motion.div 
        key={`placeholder-${appleElements.length}`}
        // Placeholders are not interactive and are transparent.
        className={`flex items-center justify-center`}
      >
        <Apple
            className={`${appleSize} text-transparent fill-transparent`} // Make placeholder apples invisible.
          />
      </motion.div>
    );
  }

  // Render the container for the apple rating display, showing only the first 5 apple elements.
  return (
    <div className="flex items-center space-x-1">
      {/* Slice to ensure exactly 5 apples are rendered, even if placeholder logic overfills. */}
      {appleElements.slice(0, 5)}
    </div>
  );
}