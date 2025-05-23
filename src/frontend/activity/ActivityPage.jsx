/**
 * @file ActivityPage.js
 * @description A React component that displays a user's activity feed.
 * Activities are fetched from an API, can be filtered by type, and are grouped by month.
 * Each month's activities can be collapsed or expanded.
 */

// Import React hooks and utilities.
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from 'react-router-dom'; // For navigation, e.g., redirecting unauthenticated users.
import { motion, AnimatePresence } from 'framer-motion'; // For animations.
import axios from 'axios'; // For making HTTP requests.
import { format } from 'date-fns'; // For date formatting.
import { useAuth } from "../../context/AuthContext"; // Custom hook to access authentication context.
import BottomNavbar from '../../components/BottomNavbar'; // Navigation bar component.
import ActivityCard from './ActivityCard'; // Component to display individual activities.
import ActivitySectionHeader from './ActivitySectionHeader'; // Component for month headers.
import ActivityPageHeader from './ActivityPageHeader'; // Component for the page header.

/**
 * @function ActivityPage
 * @description A React functional component that serves as the main page for displaying user activities.
 * It fetches, filters, groups, and displays activities with animations and user interaction.
 * @returns {JSX.Element} The rendered ActivityPage component.
 */
function ActivityPage() {
  // State to store the array of fetched activities.
  const [activities, setActivities] = useState([]);
  // State to track loading status.
  const [loading, setLoading] = useState(true);
  // State to store any error messages during data fetching.
  const [error, setError] = useState(null);
  // State to store the current filter type for activities (e.g., 'all', 'reviews').
  const [filter, setFilter] = useState('all');
  // State to manage the collapsed/expanded state of each month's activity section.
  // It's an object where keys are "Month Year" strings and values are booleans.
  const [collapsedMonths, setCollapsedMonths] = useState({});

  // Access user authentication status from context.
  const { user } = useAuth();
  // Hook for programmatic navigation.
  const navigate = useNavigate();

  // Framer Motion variant for "fade in up" animation.
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
  };

  // Framer Motion variants for collapse/expand animation.
  const collapseVariants = {
    open: { height: 'auto', opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
    collapsed: { height: 0, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
  };

  // `useEffect` hook to fetch activities when the component mounts or user/navigate changes.
  // Redirects to login if the user is not authenticated.
  useEffect(() => {
    // If user is not authenticated, redirect to login page.
    if (!user) {
      navigate('/login');
      return; // Exit early if not authenticated.
    }
    // Async function to fetch activities from the API.
    const fetchActivities = async () => {
      try {
        setLoading(true); // Set loading state to true.
        // Make GET request to '/api/activities'.
        const response = await axios.get('/api/activities');
        setActivities(response.data); // Update activities state with fetched data.
        setError(null); // Clear any previous errors.
      } catch (err) {
        // If fetching fails, set error message and clear activities.
        setError("Failed to load activities. Please try again later.");
        setActivities([]);
      } finally {
        // Set loading state to false regardless of success or failure.
        setLoading(false);
      }
    };
    fetchActivities();
  }, [user, navigate]); // Dependencies: re-run if user or navigate changes.

  // `useEffect` hook to scroll to the top of the page when the component mounts.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Empty dependency array: runs only on mount.

  /**
   * Gets the "Month Year" string (e.g., "January 2023") from a date string.
   * @param {string} dateStr - The date string (parsable by `new Date()`).
   * @returns {string} The formatted "Month Year" string or "Invalid Date".
   */
  const getMonthYear = (dateStr) => {
    try {
      return format(new Date(dateStr), 'MMMM yyyy');
    } catch (e) {
      return "Invalid Date"; // Fallback for invalid date strings.
    }
  };

  /**
   * Toggles the collapsed state for a given month-year section.
   * @param {string} monthYear - The "Month Year" string key.
   */
  const toggleCollapse = (monthYear) => {
    setCollapsedMonths(prev => ({
      ...prev, // Spread previous collapsed states.
      [monthYear]: !prev[monthYear] // Toggle the state for the specific monthYear.
    }));
  };

  // A map of filter functions based on the `filter` state.
  const filterMap = {
    all: () => true, // 'all' filter shows all activities.
    login: (action) => action === 'login',
    reviews: (action) => [ // 'reviews' filter shows review-related actions.
      'review_create', 'review_like', 'review_dislike', 'review_unlike', 'review_undislike'
    ].includes(action),
    watchlist: (action) => ['watchlist_add', 'watchlist_remove'].includes(action),
    account: (action) => ['account_creation', 'profile_update'].includes(action)
  };

  // `useMemo` hook to efficiently filter activities based on the current `filter`.
  // Recalculates only when `activities` or `filter` changes.
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => filterMap[filter](activity.action));
  }, [activities, filter]);

  // `useMemo` hook to group filtered activities by month and year.
  // Recalculates only when `filteredActivities` changes.
  const groupedActivities = useMemo(() => {
    return filteredActivities.reduce((acc, activity) => {
      const monthYear = getMonthYear(activity.createdAt); // Get "Month Year" string.
      if (!acc[monthYear]) {
        acc[monthYear] = []; // Initialize array for the month if it doesn't exist.
      }
      acc[monthYear].push(activity); // Add activity to the corresponding month's array.
      return acc;
    }, {}); // Initial accumulator is an empty object.
  }, [filteredActivities]);

  // `useMemo` hook to get a sorted array of "Month Year" keys from `groupedActivities`.
  // Sorted in descending order (most recent month first).
  // Recalculates only when `groupedActivities` changes.
  const sortedMonthYears = useMemo(() => {
    return Object.keys(groupedActivities).sort((a, b) => {
      try {
        // Parse "Month Year" strings into Date objects for comparison.
        // This replaces "Month YYYY" with "Month 1, YYYY" for robust parsing.
        const dateA = new Date(Date.parse(a.replace(/(\w+) (\d{4})/, "$1 1, $2")));
        const dateB = new Date(Date.parse(b.replace(/(\w+) (\d{4})/, "$1 1, $2")));
        return dateB - dateA; // Sort descending (newest first).
      } catch (e) {
        return 0; // Fallback if parsing fails.
      }
    });
  }, [groupedActivities]);

  // If loading, display a loading message.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1e1e1e' }}>
        <motion.div
          className="text-lg font-semibold select-none"
          style={{ color: '#ECE6DD' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Loading your activities...
        </motion.div>
      </div>
    );
  }

  // If there's an error, display the error message.
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1e1e1e' }}>
        <motion.div
          className="text-lg font-semibold select-none"
          style={{ color: '#ff6b6b' }} // Error message in red.
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {error}
        </motion.div>
      </div>
    );
  }

  // Main render method for the ActivityPage.
  return (
    <>
      {/* Main section for the activity page content. */}
      <section
        className="min-h-screen flex flex-col items-center pt-4 pb-24" // Styling for padding, flex layout, min height.
        style={{ backgroundColor: '#1e1e1e', color: '#ECE6DD' }} // Background and text color.
      >
        {/* Page header component. */}
        <ActivityPageHeader />

        {/* Filter buttons section. */}
        <div className="flex gap-2 sm:gap-4 mt-6 flex-wrap justify-center px-4 sm:px-8">
          {[ // Array of filter options.
            { label: 'All', value: 'all' },
            { label: 'Login', value: 'login' },
            { label: 'Reviews', value: 'reviews' },
            { label: 'Watchlist', value: 'watchlist' },
            { label: 'Account', value: 'account' }
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)} // Set filter state on click.
              // Dynamic classes for styling active vs. inactive filter buttons.
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base font-semibold transition-colors
                ${
                  filter === value
                    ? 'bg-[#ECE6DD] text-[#1e1e1e]' // Active filter style.
                    : 'bg-[#2e2e2e] text-[#b0a899] hover:bg-[#484538]' // Inactive filter style.
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Container for displaying grouped activities. */}
        <div className="w-full mt-6 space-y-10 px-4 sm:px-8">
          {/* If no activities found for the current filter (and not loading), display a message. */}
          {sortedMonthYears.length === 0 && !loading && (
            <motion.div
              className="text-center py-20 select-none"
              style={{ color: '#8a8a8a' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              No activities found for this filter.
            </motion.div>
          )}

          {/* Map over sorted month-year keys to render each month's section. */}
          {sortedMonthYears.map((monthYear) => {
            // Get activities for the current month and sort them by creation date (newest first).
            const monthActivities = groupedActivities[monthYear].slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            // Check if the current month section is collapsed.
            const isCollapsed = collapsedMonths[monthYear];
            return (
              <div key={monthYear} className="select-none"> {/* `select-none` to prevent text selection on header. */}
                {/* Clickable header to toggle collapse state. */}
                <div
                  onClick={() => toggleCollapse(monthYear)}
                  className="cursor-pointer flex items-center justify-between"
                  style={{ userSelect: 'none' }} // Ensure text selection is off for the clickable header.
                >
                  {/* Section header component (displays month and year). */}
                  <ActivitySectionHeader monthYear={monthYear} />
                  {/* Animated arrow icon indicating collapse/expand state. */}
                  <motion.div
                    animate={{ rotate: isCollapsed ? 0 : 90 }} // Rotate arrow based on `isCollapsed`.
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="mr-2 text-lg transform" // Styling for the arrow.
                  >
                    ▶
                  </motion.div>
                </div>

                {/* AnimatePresence to handle enter/exit animations of the collapsible content. */}
                <AnimatePresence initial={false}>
                  {!isCollapsed && ( // Conditionally render content if not collapsed.
                    <motion.div
                      key="content" // Key for AnimatePresence.
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={collapseVariants} // Use pre-defined collapse/expand animation variants.
                      className="flex flex-col gap-6 mt-4" // Styling for the content container.
                    >
                      {/* Map over activities for the current month to render ActivityCard components. */}
                      {monthActivities.map((activity, index) => (
                        <motion.div
                          key={activity._id || index} // Use activity ID or index as key.
                          initial="hidden"
                          animate="visible"
                          exit="hidden" // For potential dynamic removal, though not used here.
                          variants={fadeInUp} // Use "fade in up" animation.
                          transition={{ delay: index * 0.05 }} // Staggered animation delay for each card.
                          className="w-full flex justify-center" // Center the ActivityCard.
                        >
                          <ActivityCard activity={activity} />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
      {/* Bottom navigation bar component. */}
      <BottomNavbar />
    </>
  );
}

// Export the ActivityPage component as the default.
export default ActivityPage;