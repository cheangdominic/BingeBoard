/**
 * @file Statistics.jsx
 * @description React component for displaying key application statistics such as
 * total users and reviews made. Includes animated number transitions and hover effects.
 */

import { useState, useEffect, useRef } from "react";
import { motion, useInView, animate as motionAnimate } from "framer-motion";

import personIcon from "../../assets/person_statistics_icon.svg";
import ratingIcon from "../../assets/review_rating_icon.svg";

/**
 * Statistics Component
 * 
 * @component
 * @description Renders a statistics section showing total users and total reviews. 
 * Data is fetched from backend API endpoints and presented with animated cards.
 *
 * @returns {JSX.Element} A styled container displaying animated statistics.
 */
function Statistics() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [totalUsers, setTotalUsers] = useState(0);
  const [reviewsMade, setReviewsMade] = useState(0);

  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const res = await fetch("/api/statistics/total-users");
        const data = await res.json();
        if (data.success) setTotalUsers(data.totalUsers);
      } catch (err) {
        console.error("Error fetching total users:", err);
      }
    };

    const fetchTotalReviews = async () => {
      try {
        const res = await fetch("/api/statistics/total-reviews");
        const data = await res.json();
        if (data.success) setReviewsMade(data.totalReviews);
      } catch (err) {
        console.error("Error fetching total reviews:", err);
      }
    };

    fetchTotalUsers();
    fetchTotalReviews();

    // Optional: To refresh review data periodically, uncomment below
    // const interval = setInterval(fetchTotalReviews, 60000);
    // return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={ref}
      className="bg-[#252525] rounded-xl px-6 py-8 max-w-6xl mx-auto my-8 border border-gray-700/50"
    >
      <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-12">
        <StatCard
          icon={personIcon}
          value={totalUsers}
          text="Total Users"
          isInView={isInView}
          colorType="blue"
        />
        <div className="h-px md:h-auto md:w-px bg-gray-600/50 my-4 md:my-0" />
        <StatCard
          icon={ratingIcon}
          value={reviewsMade}
          text="Reviews Made"
          isInView={isInView}
          colorType="amber"
        />
      </div>
    </div>
  );
}

/**
 * StatCard Component
 * 
 * @component
 * @description Displays a single statistic with icon, animated number, and label.
 * Supports themed styling and interactive hover effects.
 *
 * @param {Object} props
 * @param {string} props.icon - Path to the icon image.
 * @param {number} props.value - The numeric value to display.
 * @param {string} props.text - Label for the statistic.
 * @param {boolean} props.isInView - Indicates if the element is visible in the viewport.
 * @param {'blue' | 'amber'} props.colorType - Determines the color theme of the card.
 * @param {string} [props.suffix] - Optional suffix to display with the number.
 * 
 * @returns {JSX.Element} A styled statistic card with animation.
 */
function StatCard({ icon, value, text, isInView, colorType, suffix = "" }) {
  const colors = {
    blue: {
      text: "text-blue-400",
      border: "hover:border-blue-400/30",
      shadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2)",
      glow: "rgba(59, 130, 246, 0.15)",
      textHover: "#93c5fd",
      iconBg: "bg-blue-500/20"
    },
    amber: {
      text: "text-amber-400",
      border: "hover:border-amber-400/30",
      shadow: "0 10px 25px -5px rgba(245, 158, 11, 0.2)",
      glow: "rgba(245, 158, 11, 0.15)",
      textHover: "#fef3c7",
      iconBg: "bg-amber-500/20"
    }
  };

  const currentColor = colors[colorType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="flex-1"
    >
      <motion.div
        initial={{ y: 0, scale: 1 }}
        whileHover={{
          y: -8,
          scale: 1.02,
          boxShadow: currentColor.shadow
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 15,
          bounce: 0.4
        }}
        className={`flex flex-col md:flex-row items-center gap-6 p-6 rounded-xl bg-[#2E2E2E] border border-gray-800 ${currentColor.border} relative cursor-pointer h-full`}
      >
        <div
          className="absolute inset-0 rounded-xl pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `inset 0 0 20px ${currentColor.glow}` }}
        />

        <div className={`p-4 rounded-lg ${currentColor.iconBg} backdrop-blur-[1px]`}>
          <img className="w-16 h-16 object-contain" src={icon} alt={`${text} icon`} />
        </div>

        <div className="text-center md:text-left">
          <motion.div
            whileHover={{ color: currentColor.textHover }}
            className={`text-5xl font-bold ${currentColor.text} mb-1 transition-colors duration-300`}
          >
            <AnimatedNumber value={value} isInView={isInView} />
            {suffix}
          </motion.div>
          <motion.div
            whileHover={{ color: "#e5e7eb" }}
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
 * AnimatedNumber Component
 * 
 * @component
 * @description Animates counting from a previous value to a new target value when in view.
 * Enhances user experience by adding a sense of motion and engagement.
 *
 * @param {Object} props
 * @param {number} props.value - The target value to animate to.
 * @param {boolean} props.isInView - Triggers animation when component enters the viewport.
 * 
 * @returns {JSX.Element} A span element containing the animated number.
 */
function AnimatedNumber({ value, isInView }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) {
      setDisplayValue(0);
      return;
    }
    const controls = motionAnimate(displayValue, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
      onComplete: () => setDisplayValue(value),
    });
    return () => controls.stop();
  }, [isInView, value]);

  return <span>{displayValue.toLocaleString()}</span>;
}

export default Statistics;
