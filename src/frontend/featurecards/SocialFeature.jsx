import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import TopNavbar from '../landing/TopNavbar.jsx';
import Footer from '../landing/Footer.jsx';
import { useEffect } from "react";
import { useRef, useState } from "react";
import { useLayoutEffect } from "react";

import friendIcon from "../../assets/friend_feature_icon.svg";

function SocialFeature() {
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
            title: "Connect and Share",
            icon: friendIcon,
          }].map((feature, index) => (
            <div className="w-full max-w-10xl group">
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
            <h2 className="text-3xl font-bold text-white mb-4">Social TV Watching, Reimagined</h2>
            <p className="text-gray-300">
              BingeBoard isn’t just about watching TV—it’s about connecting with the people who love it as much as you do. With our social features, you can follow your friends, discover new shows through your network, and keep up with what everyone’s watching.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-8">Follow Friends & See Their Activity</h3>
            <p className="text-gray-300">
              Want to see what your friends thought about the season finale of your favorite show? Follow them and get updates when they rate or review something. BingeBoard makes it easy to stay in sync and never miss out on the conversation.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-8">Comment and React</h3>
            <p className="text-gray-300">
              Each review, rating, or list can be liked and commented on. Whether it’s insightful analysis or a hot take, jump into discussions and make your voice heard in the community.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-8">Privacy Controls</h3>
            <p className="text-gray-300">
              You're in control. Choose to make your profile public or private, approve follower requests, and select who sees your ratings and reviews. Your viewing habits stay as personal—or as social—as you want.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-8">A Feed Built Around You</h3>
            <p className="text-gray-300">
              Your homepage feed surfaces the most relevant content: trending reviews, friends’ activities, newly released episodes, and more—all personalized to your tastes.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-8">Celebrate Your Watch History</h3>
            <p className="text-gray-300">
              Milestones like finishing a series or hitting your 100th episode watched are celebrated with digital badges and notifications—because your binge journey deserves some recognition.
            </p>

            <p className="text-gray-300 mt-6">
              Whether you're a casual watcher or a die-hard fan, BingeBoard transforms your solo binges into a shared experience. Connect, discover, and celebrate the shows you love with a community that gets it.
            </p>
          </div>
        </motion.div>
      </section>
      <Footer />
    </>
  );
}

export default SocialFeature;
