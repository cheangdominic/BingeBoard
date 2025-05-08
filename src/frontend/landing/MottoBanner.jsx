import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function MottoBanner() {
  const [buttonText, setButtonText] = useState("Get Started");
  const [isHovered, setIsHovered] = useState(false);
  
  const messages = [
    "Join the community",
    "Start tracking",
    "Discover new shows",
    "Review your favorites",
    "See new episodes",
  ];

  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      setButtonText(prev => {
        let newMessage;
        do {
          newMessage = messages[Math.floor(Math.random() * messages.length)];
        } while (newMessage === prev && messages.length > 1);
        return newMessage;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div className="relative">
      <img
        src={"src/assets/severance-apple-tv-plus.jpg"}
        alt="Landing banner"
        className="w-full h-[500px] object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-center -mt-24">
          <h1 className="text-white text-4xl lg:text-6xl font-bold font-coolvetica">
            Track What You Watch.
          </h1>
          <h1 className="text-white text-4xl lg:text-6xl font-bold font-coolvetica">
            Share What You Love.
          </h1>
          
          <a 
            href="/signup"
            className="min-w-[120px] inline-block text-center no-underline"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div 
              className="px-6 py-3 bg-[#1963da] text-white font-bold rounded-lg hover:bg-[#ebbd34] hover:text-black transition-colors cursor-pointer"
              layout 
              transition={{
                type: "tween",
                ease: "easeInOut",
                duration: 0.3
              }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={buttonText}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="inline-block"
                >
                  {buttonText}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          </a>
        </div>
      </div>
    </div>
  );
}

export default MottoBanner;