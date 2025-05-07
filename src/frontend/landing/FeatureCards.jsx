import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function FeatureCards() {
  return (
    <section className="px-4 py-12 md:py-16 bg-[#1e1e1e]">
      <h1 className="text-white text-3xl md:text-4xl font-bold mb-12 text-center font-coolvetica">
        BingeBoard gives you the power to...
      </h1>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-6 max-w-7xl mx-auto">
        {[
          {
            title: "Connect and Share",
            description:
              "Binging doesn't have to be lonely. BingeBoard lets you connect with friends, share what you're watching, and discover new favorites together—making your streaming experience social and fun.",
            icon: "src/assets/friend_feature_icon.svg",
            link: "/socialfeature",
          },
          {
            title: "Save For Later",
            description:
              "Never forget that show you wanted to watch but never found the time for. With BingeBoard, you can build and manage your personal watchlist—so every must-watch moment is right where you left it.",
            icon: "src/assets/watchlist_icon.svg",
            link: "/watchlistfeature",
          },
          {
            title: "Browse Your Next Watch",
            description:
              "Not sure what to watch next? BingeBoard helps you discover new shows based on your interests, trending picks, and what your friends are watching—so your next binge is always one click away.",
            icon: "src/assets/browse_tv_icon.svg",
            link: "/browsefeature",
          },
        ].map((feature, index) => (
          <Link to={feature.link} key={index} className="w-full max-w-md group">
            <motion.div
              initial={{ y: 0, scale: 1 }}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2)"
              }}
              transition={{ 
                type: "spring", 
                stiffness: 400,
                damping: 15,
                bounce: 0.4
              }}
              className="h-full bg-[#2E2E2E] rounded-xl overflow-hidden border border-gray-800 hover:border-blue-400/30 relative"
            >
              <motion.div 
                whileHover={{ opacity: 0.9 }}
                className="p-1 bg-gradient-to-r from-amber-200/60 to-blue-300/60 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -rotate-45 w-200% -left-[100%]" />
                <img
                  className="w-full h-40 object-contain p-4 relative z-10"
                  src={feature.icon}
                  alt={feature.title}
                />
              </motion.div>

              <div className="p-6">
                <motion.h3 
                  whileHover={{ color: "#fef3c7" }}
                  className="text-xl font-bold text-white mb-3 transition-colors duration-300"
                >
                  {feature.title}
                </motion.h3>
                <motion.p 
                  whileHover={{ color: "#e5e7eb" }}
                  className="text-gray-300/90 leading-relaxed transition-colors duration-300"
                >
                  {feature.description}
                </motion.p>
              </div>
              
              <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                boxShadow: "inset 0 0 20px rgba(59, 130, 246, 0.15)"
              }} />
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default FeatureCards;