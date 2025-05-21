import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from "../../context/AuthContext";
import BottomNavbar from '../../components/BottomNavbar';
import ActivityCard from './ActivityCard';
import ActivitySectionHeader from './ActivitySectionHeader';
import ActivityPageHeader from './ActivityPageHeader';

function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [collapsedMonths, setCollapsedMonths] = useState({});

  const { user } = useAuth();
  const navigate = useNavigate();

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
  };

  const collapseVariants = {
    open: { height: 'auto', opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
    collapsed: { height: 0, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/activities');
        setActivities(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load activities. Please try again later.");
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [user, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getMonthYear = (dateStr) => {
    try {
      return format(new Date(dateStr), 'MMMM yyyy');
    } catch (e) {
      return "Invalid Date";
    }
  };

  const toggleCollapse = (monthYear) => {
    setCollapsedMonths(prev => ({
      ...prev,
      [monthYear]: !prev[monthYear]
    }));
  };

  const filterMap = {
    all: () => true,
    login: (action) => action === 'login',
    reviews: (action) => [
      'review_create', 'review_like', 'review_dislike', 'review_unlike', 'review_undislike'
    ].includes(action),
    watchlist: (action) => ['watchlist_add', 'watchlist_remove'].includes(action),
    account: (action) => ['account_creation', 'profile_update'].includes(action)
  };

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => filterMap[filter](activity.action));
  }, [activities, filter]);

  const groupedActivities = useMemo(() => {
    return filteredActivities.reduce((acc, activity) => {
      const monthYear = getMonthYear(activity.createdAt);
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(activity);
      return acc;
    }, {});
  }, [filteredActivities]);

  const sortedMonthYears = useMemo(() => {
    return Object.keys(groupedActivities).sort((a, b) => {
      try {
        const dateA = new Date(Date.parse(a.replace(/(\w+) (\d{4})/, "$1 1, $2")));
        const dateB = new Date(Date.parse(b.replace(/(\w+) (\d{4})/, "$1 1, $2")));
        return dateB - dateA;
      } catch (e) {
        return 0;
      }
    });
  }, [groupedActivities]);

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1e1e1e' }}>
        <motion.div
          className="text-lg font-semibold select-none"
          style={{ color: '#ff6b6b' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {error}
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <section
        className="min-h-screen flex flex-col items-center pt-4 pb-24 px-4 sm:px-8"
        style={{ backgroundColor: '#1e1e1e', color: '#ECE6DD' }}
      >
        <ActivityPageHeader />

        <div className="flex gap-2 sm:gap-4 mt-6 flex-wrap justify-center">
          {[
            { label: 'All', value: 'all' },
            { label: 'Login', value: 'login' },
            { label: 'Reviews', value: 'reviews' },
            { label: 'Watchlist', value: 'watchlist' },
            { label: 'Account', value: 'account' }
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base font-semibold transition-colors
                ${
                  filter === value
                    ? 'bg-[#ECE6DD] text-[#1e1e1e]'
                    : 'bg-[#2e2e2e] text-[#b0a899] hover:bg-[#484538]'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="w-full max-w-2xl mt-6 space-y-10">
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

          {sortedMonthYears.map((monthYear) => {
            const monthActivities = groupedActivities[monthYear].slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const isCollapsed = collapsedMonths[monthYear];
            return (
              <div key={monthYear} className="select-none">
                <div
                  onClick={() => toggleCollapse(monthYear)}
                  className="cursor-pointer flex items-center justify-between"
                  style={{ userSelect: 'none' }}
                >
                  <ActivitySectionHeader monthYear={monthYear} />
                  <motion.div
                    animate={{ rotate: isCollapsed ? 0 : 90 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="mr-2 text-lg transform"
                  >
                    ▶
                  </motion.div>
                </div>

                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      key="content"
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={collapseVariants}
                      className="flex flex-col gap-6 mt-4"
                    >
                      {monthActivities.map((activity, index) => (
                        <motion.div
                          key={activity._id || index}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={fadeInUp}
                          transition={{ delay: index * 0.05 }}
                          className="w-full flex justify-center"
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
      <BottomNavbar />
    </>
  );
}

export default ActivityPage;