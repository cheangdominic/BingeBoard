import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @file AddToWatchlistButton.js
 * @description A React component that renders a button allowing users to add or remove a show from their watchlist.
 * It visually indicates the current watchlist status, handles loading states during async requests,
 * and animates text changes on hover and loading.
 */

/**
 * @function AddToWatchlistButton
 * @description React component that toggles a show’s presence in the user’s watchlist.
 * It manages its own loading and hover states, and performs API calls to add or remove the show.
 *
 * @param {object} props - Component props.
 * @param {string|number} props.showId - The unique identifier for the show to add or remove from the watchlist.
 *
 * @returns {JSX.Element} The interactive button element with animated text and loading spinner.
 */
const AddToWatchlistButton = ({ showId }) => {
  // State to track if the show is currently in the watchlist.
  const [added, setAdded] = useState(false);

  // State to track whether the button is currently hovered.
  const [hovered, setHovered] = useState(false);

  // State to track whether an API call is in progress (disables button and triggers spinner).
  const [loading, setLoading] = useState(false);

  /**
   * Adds the show to the watchlist by calling the backend API.
   * Updates button state accordingly.
   */
  const handleAdd = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        '/api/watchlist/add',
        { showId },
        { withCredentials: true }
      );
      if (res.data.success) {
        setAdded(true);
        setHovered(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add to watchlist');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Removes the show from the watchlist by calling the backend API.
   * Updates button state accordingly.
   */
  const handleRemove = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        '/api/watchlist/remove',
        { showId },
        { withCredentials: true }
      );
      if (res.data.success) setAdded(false);
    } catch (err) {
      console.error(err);
      alert('Failed to remove from watchlist');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the button click event.
   * If loading, does nothing.
   * Otherwise, toggles between add or remove action depending on current state.
   */
  const handleClick = () => {
    if (loading) return;
    added ? handleRemove() : handleAdd();
  };

  // Base CSS classes for styling the button.
  const baseClasses = 'px-4 py-2 rounded-full font-semibold flex items-center justify-center';

  return (
    <motion.button
      onMouseEnter={() => !loading && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      disabled={loading}
      className={`${baseClasses} ${
        added
          ? hovered
            ? 'bg-red-600 text-white'
            : 'bg-yellow-400 text-black'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      }`}
      whileHover={!loading ? { scale: 1.05 } : {}}
      whileTap={!loading ? { scale: 0.95 } : {}}
      initial={false}
    >
      {loading ? (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          />
          Processing...
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.span
            key={hovered && added ? 'remove' : added ? 'in' : 'add'}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
          >
            {hovered && added ? 'Remove from Watchlist' : added ? 'In Watchlist ✓' : '+ Add to Watchlist'}
          </motion.span>
        </AnimatePresence>
      )}
    </motion.button>
  );
};

export default AddToWatchlistButton;
