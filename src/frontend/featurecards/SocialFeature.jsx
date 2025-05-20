import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import TopNavbar from '../landing/TopNavbar.jsx';
import Footer from '../landing/Footer.jsx';
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import friendIcon from "../../assets/friend_feature_icon.svg";

function SocialFeature() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/home');
    }
  }, [user, loading, navigate]);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <TopNavbar />
      <section className="px-4 py-4 md:py-6 bg-[#1e1e1e]">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-6 max-w-7xl mx-auto text-center">
          {[{
            title: "Connect and Share",
            icon: friendIcon,
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
                  style={{
                    boxShadow: "inset 0 0 20px rgba(59, 130, 246, 0.15)"
                  }}
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
          <div ref={ref} className="p-6 text-white">
            <p className="text-gray-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia ipsum at libero mollis, vel suscipit felis fermentum. Aenean in ante lectus. Quisque malesuada ipsum ut dolor efficitur, et volutpat sapien tempus. Integer maximus purus et nisi lacinia, nec vulputate velit gravida. Nullam euismod metus vel dui pretium tincidunt. Nam sed orci orci. Curabitur at urna vitae odio gravida pharetra sed in sapien.
            </p>
            <p className="text-gray-300 mt-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia ipsum at libero mollis, vel suscipit felis fermentum. Aenean in ante lectus. Quisque malesuada ipsum ut dolor efficitur, et volutpat sapien tempus. Integer maximus purus et nisi lacinia, nec vulputate velit gravida. Nullam euismod metus vel dui pretium tincidunt. Nam sed orci orci. Curabitur at urna vitae odio gravida pharetra sed in sapien. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia ipsum at libero mollis, vel suscipit felis fermentum. Aenean in ante lectus. Quisque malesuada ipsum ut dolor efficitur, et volutpat sapien tempus. Integer maximus purus et nisi lacinia, nec vulputate velit gravida. Nullam euismod metus vel dui pretium tincidunt. Nam sed orci orci. Curabitur at urna vitae odio gravida pharetra sed in sapien.
            </p>
            <p className="text-gray-300 mt-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia ipsum at libero mollis, vel suscipit felis fermentum. Aenean in ante lectus. Quisque malesuada ipsum ut dolor efficitur, et volutpat sapien tempus. Integer maximus purus et nisi lacinia, nec vulputate velit gravida. Nullam euismod metus vel dui pretium tincidunt. Nam sed orci orci. Curabitur at urna vitae odio gravida pharetra sed in sapien. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia ipsum at libero mollis, vel suscipit felis fermentum. Aenean in ante lectus. Quisque malesuada ipsum ut dolor efficitur, et volutpat sapien tempus. Integer maximus purus et nisi lacinia, nec vulputate velit gravida.
            </p>
            <p className="text-gray-300 mt-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia ipsum at libero mollis, vel suscipit felis fermentum. Aenean in ante lectus. Quisque malesuada ipsum ut dolor efficitur, et volutpat sapien tempus. Integer maximus purus et nisi lacinia, nec vulputate velit gravida. Nullam euismod metus vel dui pretium tincidunt. Nam sed orci orci. Curabitur at urna vitae odio gravida pharetra sed in sapien. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia ipsum at libero mollis, vel suscipit felis fermentum. Aenean in ante lectus. Quisque malesuada ipsum ut dolor efficitur, et volutpat sapien tempus. Integer maximus purus et nisi lacinia, nec vulputate velit gravida.
            </p>
          </div>
        </motion.div>
      </section>
      <Footer />
    </>
  );
}

export default SocialFeature;
