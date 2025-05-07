import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import TopNavbar from '../landing/TopNavbar.jsx';
import Footer from '../landing/Footer.jsx';

function BrowseFeature() {
  return (
    <>
      <TopNavbar />
    <section className="px-4 py-4 md:py-6 bg-[#1e1e1e]">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-6 max-w-7xl mx-auto">
        {[
          {
            title: "Save For Later",
            description:
              "Never forget that show you wanted to watch but never found the time for. With BingeBoard, you can build and manage your personal watchlist—so every must-watch moment is right where you left it.",
            icon: "src/assets/watchlist_icon.svg",
            link: "/watchlistfeature",
          },
        ].map((feature, index) => (
          <div className="w-full max-w-10xl group">
            <motion.div
              initial={{ y: 0, scale: 1 }}
              className="h-full bg-[#2E2E2E] rounded-xl overflow-hidden border border-gray-800 relative"
            >
              <motion.div 
                className="p-1 bg-gradient-to-r from-amber-200/60 to-blue-300/60 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-opacity duration-500 -rotate-45 w-200% -left-[100%]" />
                <img
                  className="w-full h-40 object-contain p-4 relative z-10"
                  src={feature.icon}
                  alt={feature.title}
                />
              </motion.div>

              <div className="p-6">
                <motion.h3 
                  className="text-xl font-bold text-white mb-3 transition-colors duration-300"
                >
                  {feature.title}
                </motion.h3>
                <motion.p 
                  className="text-gray-300/90 leading-relaxed transition-colors duration-300"
                >
                  {feature.description}
                </motion.p>
              </div>
              
              <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300" style={{
                boxShadow: "inset 0 0 20px rgba(59, 130, 246, 0.15)"
              }} />
            </motion.div>
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-center items-center w-full max-w-7xl mx-auto mt-6 bg-[#2E2E2E] rounded-xl p-6 text-white">
          <p className="text-gray-300">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia ipsum at libero mollis, vel suscipit felis fermentum. Aenean in ante lectus. Quisque malesuada ipsum ut dolor efficitur, et volutpat sapien tempus. Integer maximus purus et nisi lacinia, nec vulputate velit gravida. Nullam euismod metus vel dui pretium tincidunt. Nam sed orci orci. Curabitur at urna vitae odio gravida pharetra sed in sapien.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia ipsum at libero mollis, vel suscipit felis fermentum. Aenean in ante lectus. Quisque malesuada ipsum ut dolor efficitur, et volutpat sapien tempus. Integer maximus purus et nisi lacinia, nec vulputate velit gravida. Nullam euismod metus vel dui pretium tincidunt. Nam sed orci orci. Curabitur at urna vitae odio gravida pharetra sed in sapien.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia ipsum at libero mollis, vel suscipit felis fermentum. Aenean in ante lectus. Quisque malesuada ipsum ut dolor efficitur, et volutpat sapien tempus. Integer maximus purus et nisi lacinia, nec vulputate velit gravida. Nullam euismod metus vel dui pretium tincidunt. Nam sed orci orci. Curabitur at urna vitae odio gravida pharetra sed in sapien.
          </p>

          <p className="text-gray-300 mt-6">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia ipsum at libero mollis, vel suscipit felis fermentum. Aenean in ante lectus. Quisque malesuada ipsum ut dolor efficitur, et volutpat sapien tempus. Integer maximus purus et nisi lacinia, nec vulputate velit gravida. Nullam euismod metus vel dui pretium tincidunt. Nam sed orci orci. Curabitur at urna vitae odio gravida pharetra sed in sapien.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia ipsum at libero mollis, vel suscipit felis fermentum. Aenean in ante lectus. Quisque malesuada ipsum ut dolor efficitur, et volutpat sapien tempus. Integer maximus purus et nisi lacinia, nec vulputate velit gravida. Nullam euismod metus vel dui pretium tincidunt. Nam sed orci orci. Curabitur at urna vitae odio gravida pharetra sed in sapien.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia ipsum at libero mollis, vel suscipit felis fermentum. Aenean in ante lectus. Quisque malesuada ipsum ut dolor efficitur, et volutpat sapien tempus. Integer maximus purus et nisi lacinia, nec vulputate velit gravida. Nullam euismod metus vel dui pretium tincidunt. Nam sed orci orci. Curabitur at urna vitae odio gravida pharetra sed in sapien.
          </p>
        </div>
    </section>
    <Footer/>
    </>
  );
}

export default BrowseFeature;