import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import TopNavbar from '../landing/TopNavbar.jsx';
import Footer from '../landing/Footer.jsx';
import { useEffect, useRef, useState, useLayoutEffect } from "react";

import watchlistIcon from "../../assets/watchlist_icon.svg";

function WatchlistFeature() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const ref = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    if (ref.current) {
      setContentHeight(ref.current.scrollHeight);
    }
  }, []);

  return (
    <>
      <TopNavbar />
      <section className="px-4 py-4 md:py-6 bg-[#1e1e1e]">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-6 max-w-7xl mx-auto text-center">
          {[{
            title: "Save For Later",
            icon: watchlistIcon,
          }].map((feature, index) => (
            <div className="w-full max-w-10xl group" key={index}>
              <motion.div
                initial={{ y: 0, scale: 1 }}
                className="h-full bg-[#2E2E2E] rounded-xl overflow-hidden border border-gray-800 relative"
              >
                <motion.div className="p-1 bg-gradient-to-r from-amber-200/60 to-blue-300/60 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -rotate-45 w-200% -left-[100%]" />
                  <img
                    className="w-full h-40 object-contain p-4 relative z-10"
                    src={feature.icon}
                    alt={feature.title}
                  />
                </motion.div>
                <div className="p-6">
                  <motion.h3 className="text-4xl font-bold text-white mb-3 transition-colors duration-300">
                    {feature.title}
                  </motion.h3>
                </div>
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300"
                  style={{ boxShadow: "inset 0 0 20px rgba(59, 130, 246, 0.15)" }}
                />
              </motion.div>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: contentHeight, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="overflow-hidden bg-[#2E2E2E] rounded-xl mt-6 mx-auto w-full max-w-7xl"
        >
          <div ref={ref} className="p-6 text-white space-y-6">
            <h2 className="text-3xl font-bold text-white mb-4">Never Miss a Must-Watch Again</h2>
            <p className="text-gray-300">
              Our Watchlist feature lets you save shows and movies you're interested in watching, making it easy to keep track of your entertainment goals.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-8">Plan Your Next Binge</h3>
            <p className="text-gray-300">
              Add any show or movie to your personal Watchlist with a single click. Whether it's a recommendation from a friend or a title that caught your eye, your Watchlist is your go-to queue.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-8">Smart Organization</h3>
            <p className="text-gray-300">
              Your Watchlist is automatically organized by release date and genre, helping you prioritize upcoming releases or dive into specific moods.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-8">Sync Across Devices</h3>
            <p className="text-gray-300">
              Log in from any device and pick up right where you left off. Your Watchlist stays with you, whether you're browsing from your phone, tablet, or laptop.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-8">Share and Discover</h3>
            <p className="text-gray-300">
              Share your Watchlist with friends, or browse theirs for inspiration. It's a great way to discover hidden gems and stay connected over shared interests.
            </p>

            <p className="text-gray-300 mt-6">
              Your Watchlist is more than just a list—it's a personalized roadmap to your entertainment journey. With smart features and seamless sync, BingeBoard makes sure you’re always ready for what’s next.
            </p>
          </div>
        </motion.div>
      </section>
      <Footer />
    </>
  );
}

export default WatchlistFeature;
