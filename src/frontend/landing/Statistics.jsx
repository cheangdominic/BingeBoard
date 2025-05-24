/**
 * @file Statistics.jsx
 * @description A React component that displays key statistics for the application,
 * such as active users and reviews made. It features animated numbers and hover effects.
 */

// Import React hooks (useState, useEffect, useRef) for managing state, side effects, and DOM references.
import { useState, useEffect, useRef } from "react";
// Import `motion` and `useInView` from framer-motion for animations and viewport detection.
import { motion, useInView } from "framer-motion";

// Import icons for the statistics cards.
import personIcon from "../../assets/person_statistics_icon.svg";
import ratingIcon from "../../assets/review_rating_icon.svg";

/**
 * @function Statistics
 * @description A React functional component that renders a section displaying application statistics.
 * It fetches active user count and uses a fixed value for reviews made.
 * Each statistic is displayed in an animated `StatCard`.
 *
 * @returns {JSX.Element} The rendered Statistics component.
 */
function Statistics() {
  // Ref to the main container div of the Statistics section, used for `useInView`.
  const ref = useRef(null);
  /**
   * `isInView` boolean from `useInView` hook.
   * Becomes `true` when the `ref`'d element enters the viewport (with a -100px margin).
   * `once: true` means it only triggers once.
   * @type {boolean}
   */
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  // State to store the number of active users, fetched from an API.
  const [activeUsers, setActiveUsers] = useState(0);

  /**
   * `useEffect` hook to fetch the active user count when the component mounts
   * and then at regular intervals (every 10 seconds).
   */
  useEffect(() => {
    /**
     * Asynchronous function to fetch active user data from the `/api/active-users` endpoint.
     * @async
     */
    const fetchActiveUsers = async () => {
      try {
        const res = await fetch("/api/active-users"); // Assumes this endpoint exists and returns JSON
        const data = await res.json();
        if (data.success) { // Check for a success flag in the response
          setActiveUsers(data.activeUsers); // Update active users state
        }
      } catch (err) {
        console.error("Failed to fetch active users:", err);
        // Optionally, set an error state or handle fallback here.
      }
    };

    fetchActiveUsers(); // Fetch immediately on mount.
    // Set up an interval to fetch active users every 10 seconds.
    const interval = setInterval(fetchActiveUsers, 10000);
    // Cleanup function: clear the interval when the component unmounts.
    return () => clearInterval(interval);
  }, []); // Empty dependency array: run only on mount and unmount.

  return (
    // Main container for the statistics section, attached with `ref` for viewport detection.
    <div 
      ref={ref}
      className="bg-[#252525] rounded-xl px-6 py-8 max-w-6xl mx-auto my-8 border border-gray-700/50" // Styling
    >
      {/* Flex container for arranging StatCards, responsive for different screen sizes. */}
      <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-12">
        {/* StatCard for "Active Users". */}
        <StatCard 
          icon={personIcon} // Icon for active users
          value={activeUsers} // Fetched active users count
          text="Active Users"
          isInView={isInView} // Pass `isInView` to trigger animation
          colorType="blue" // Color theme for this card
        />
        {/* Vertical (on md screens) or horizontal divider between StatCards. */}
        <div className="h-px md:h-auto md:w-px bg-gray-600/50 my-4 md:my-0" />
        {/* StatCard for "Reviews Made". */}
        <StatCard 
          icon={ratingIcon} // Icon for reviews
          value={50000}    // Placeholder/static value for reviews made
          text="Reviews Made"
          isInView={isInView}
          colorType="amber" // Color theme for this card
        />
      </div>
    </div>
  );
}

/**
 * @function StatCard
 * @description A reusable component to display a single statistic with an icon, animated number, and text.
 * It includes hover animations and uses a color theme.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string} props.icon - The source URL for the icon image.
 * @param {number} props.value - The numerical value of the statistic.
 * @param {string} props.text - The descriptive text for the statistic.
 * @param {boolean} props.isInView - Boolean indicating if the card is currently in the viewport (for animation).
 * @param {'blue' | 'amber'} props.colorType - The color theme to apply to the card.
 * @returns {JSX.Element} The rendered StatCard component.
 */
function StatCard({ icon, value, text, isInView, colorType }) {
  // Color theme definitions for different `colorType` props.
  const colors = {
    blue: {
      text: "text-blue-400",
      border: "hover:border-blue-400/30",
      shadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2)", // Box shadow on hover
      glow: "rgba(59, 130, 246, 0.15)", // Inner glow effect on hover
      textHover: "#93c5fd" // Text color on hover for the number
    },
    amber: {
      text: "text-amber-400",
      border: "hover:border-amber-400/30",
      shadow: "0 10px 25px -5px rgba(245, 158, 11, 0.2)",
      glow: "rgba(245, 158, 11, 0.15)",
      textHover: "#fef3c7"
    }
  };

  // Get the current color theme based on `colorType`.
  const currentColor = colors[colorType];

  return (
    // Outer motion div for fade-in-up animation when the card enters view.
    <motion.div
      initial={{ opacity: 0, y: 20 }} // Initial animation state
      animate={isInView ? { opacity: 1, y: 0 } : {}} // Animate if `isInView` is true
      transition={{ duration: 0.6 }}
      className="flex-1" // Takes up available flex space
    >
      {/* Inner motion div for hover animations (lift, scale, shadow). */}
      <motion.div
        initial={{ y: 0, scale: 1 }} // Initial state for hover animation
        // Hover animation properties
        whileHover={{ 
          y: -8, 
          scale: 1.02,
          boxShadow: currentColor.shadow // Apply themed shadow on hover
        }}
        // Transition settings for hover animation (spring physics).
        transition={{ 
          type: "spring", 
          stiffness: 400,
          damping: 15,
          bounce: 0.4
        }}
        // Styling for the card itself: layout, padding, background, border, hover border.
        className={`flex flex-col md:flex-row items-center gap-6 p-6 rounded-xl bg-[#2E2E2E] border border-gray-800 ${currentColor.border} relative cursor-pointer h-full`}
      >
        {/* Inner glow effect element, visible on hover. */}
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300" // `hover:opacity-100` seems to be a direct CSS hover, Framer Motion's `whileHover` on parent might be preferred.
          style={{ boxShadow: `inset 0 0 20px ${currentColor.glow}` }} // Apply themed inner glow
        />

        {/* Icon container. */}
        <div className={`p-4 rounded-lg ${currentColor.iconBg} backdrop-blur-[1px]`}> {/* `iconBg` is not defined in `colors` object, might be missing or intended to be transparent. */}
          <img className="w-16 h-16 object-contain" src={icon} alt="" /> {/* Icon image */}
        </div>

        {/* Text container for the statistic value and description. */}
        <div className="text-center md:text-left">
          {/* Animated number display. */}
          <motion.div 
            whileHover={{ color: currentColor.textHover }} // Change number color on hover
            className={`text-5xl font-bold ${currentColor.text} mb-1 transition-colors duration-300`}
          >
            <AnimatedNumber value={value} isInView={isInView} />+ {/* Animated number component, with a '+' suffix */}
          </motion.div>
          {/* Statistic description text. */}
          <motion.div 
            whileHover={{ color: "#e5e7eb" }} // Change description text color on hover
            className="text-gray-300 text-lg font-medium transition-colors duration-300"
          >
            {text}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * @function AnimatedNumber
 * @description A component that animates a number counting up from 0 to a target `value`.
 * The animation starts when `isInView` becomes true.
 *
 * @param {object} props - The properties passed to the component.
 * @param {number} props.value - The target numerical value to animate to.
 * @param {boolean} props.isInView - Boolean indicating if the component is in the viewport.
 * @returns {JSX.Element} A span element displaying the animated number.
 */
function AnimatedNumber({ value, isInView }) {
  // State to hold the currently displayed value during animation.
  const [displayValue, setDisplayValue] = useState(0);

  /**
   * `useEffect` hook to start the number animation when `isInView` becomes true
   * or when the `value` prop changes while already in view.
   */
  useEffect(() => {
    // If not in view, do not start the animation.
    if (!isInView) return;

    const duration = 2000; // Duration of the animation in milliseconds.
    const start = Date.now(); // Timestamp when animation starts.
    const end = start + duration; // Timestamp when animation ends.

    // Easing function (easeOutExpo) for a smooth deceleration effect.
    const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    /**
     * Function to update the `displayValue` based on animation progress.
     * Uses `requestAnimationFrame` for smooth updates.
     */
    const updateValue = () => {
      const now = Date.now();
      // Calculate progress as a value between 0 and 1.
      const progress = Math.min((now - start) / duration, 1);
      // Apply easing function to the progress.
      const easedProgress = easeOutExpo(progress);
      // Calculate the current display value based on eased progress and target value.
      setDisplayValue(Math.floor(easedProgress * value));

      // If animation is not yet complete, request the next frame.
      if (now < end) requestAnimationFrame(updateValue);
    };

    updateValue(); // Start the animation.
  }, [isInView, value]); // Dependencies: re-run if `isInView` or `value` changes.

  // Render the animated number, formatted with commas for thousands.
  return <span>{displayValue.toLocaleString()}</span>;
}

// Export the Statistics component as the default export of this module.
export default Statistics;