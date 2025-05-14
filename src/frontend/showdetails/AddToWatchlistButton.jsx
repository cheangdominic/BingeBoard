import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const AddToWatchlistButton = ({ showId }) => {
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleClick = () => {
    if (loading) return;
    added ? handleRemove() : handleAdd();
  };

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