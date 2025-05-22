import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import TopNavbar from '../landing/TopNavbar.jsx';
import Footer from '../landing/Footer.jsx';
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import browseIcon from "../../assets/browse_tv_icon.svg";

function BrowseFeature() {

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
            title: "Browse Your Next Watch",
            description:
              "Not sure what to watch next? BingeBoard helps you discover new shows based on your interests, trending picks, and what your friends are watching—so your next binge is always one click away.",
            icon: browseIcon,
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
                  <p className="text-gray-300 text-base">{feature.description}</p>
                </div>

                <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300" style={{
                  boxShadow: "inset 0 0 20px rgba(59, 130, 246, 0.15)"
                }} />
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
          <div ref={ref} className="p-6 text-white space-y-8">
            <h2 className="text-3xl font-semibold text-white">Discover Smarter, Binge Better</h2>
            <p className="text-gray-300 text-lg">
              With BingeBoard, discovering your next obsession is effortless. Whether you're into thrillers, sitcoms, or documentaries, our recommendation engine and social feeds bring you tailored suggestions based on what you love and what’s trending. You can also explore genre-specific lists, follow friends or critics, and even join watch parties.
            </p>

            <h2 className="text-2xl font-semibold text-white">Track Every Episode with Ease</h2>
            <p className="text-gray-300 text-lg">
              Dive into detailed show pages to track what you’ve seen, rate seasons, and read or write reviews. Each episode can be marked off as you watch, helping you stay organized and up to date—no more forgetting where you left off. Plus, get notified when new episodes air so you never miss a premiere.
            </p>

            <h2 className="text-2xl font-semibold text-white">Your Personalized TV Journal</h2>
            <p className="text-gray-300 text-lg">
              Your profile becomes your TV journal—log your watched history, curate personal lists, and share your viewing habits with others. Whether you're a casual viewer or a hardcore binger, BingeBoard gives you the tools to reflect on your watching journey and connect with a community that gets it.
            </p>

            <h2 className="text-2xl font-semibold text-white">Social Connections That Matter</h2>
            <p className="text-gray-300 text-lg">
              BingeBoard isn't just about tracking—it's about connecting. See what your friends are watching, comment on their reviews, and get inspired by their lists. Your public profile lets you express your TV personality while discovering others who share your taste.
            </p>

            <h2 className="text-2xl font-semibold text-white">Stay in the Loop</h2>
            <p className="text-gray-300 text-lg">
              Stay ahead of premieres and finales with our episode release tracker. Show pages highlight upcoming episodes and notify you when it's time to binge again. Never fall behind on your favorite series.
            </p>

            <h2 className="text-2xl font-semibold text-white">Mobile-Optimized and Future-Ready</h2>
            <p className="text-gray-300 text-lg">
              Use BingeBoard on the go with our mobile-optimized web app. A dedicated mobile app is coming soon, with more ways to watch, share, and connect from anywhere.
            </p>

            <h2 className="text-2xl font-semibold text-white">Get Started Today</h2>
            <p className="text-gray-300 text-lg">
              Whether you're watching alone or with friends, tracking casually or reviewing deeply, BingeBoard is your home for everything TV. Create your account, build your watchlist, and start discovering smarter.
            </p>
          </div>
        </motion.div>
      </section>
      <Footer />
    </>
  );
}

export default BrowseFeature;
