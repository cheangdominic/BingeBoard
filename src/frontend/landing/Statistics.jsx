import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

function Statistics() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div 
      ref={ref}
      className="bg-[#252525] rounded-xl px-6 py-8 max-w-6xl mx-auto my-8 border border-gray-700/50"
    >
      <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-12">
        <StatCard 
          icon="src/assets/person_statistics_icon.svg"
          value={10000}
          text="Active Users"
          isInView={isInView}
          colorType="blue"
        />
        <div className="h-px md:h-auto md:w-px bg-gray-600/50 my-4 md:my-0" />
        <StatCard 
          icon="src/assets/review_rating_icon.svg"
          value={50000}
          text="Reviews Made"
          isInView={isInView}
          colorType="amber"
        />
      </div>
    </div>
  );
}

function StatCard({ icon, value, text, isInView, colorType }) {
  const colors = {
    blue: {
      text: "text-blue-400",
      border: "hover:border-blue-400/30",
      shadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2)",
      glow: "rgba(59, 130, 246, 0.15)",
      textHover: "#93c5fd"
    },
    amber: {
      text: "text-amber-400",
      border: "hover:border-amber-400/30",
      shadow: "0 10px 25px -5px rgba(245, 158, 11, 0.2)",
      glow: "rgba(245, 158, 11, 0.15)",
      textHover: "#fef3c7"
    }
  };

  const currentColor = colors[colorType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="flex-1"
    >
      <motion.div
        initial={{ y: 0, scale: 1 }}
        whileHover={{ 
          y: -8, 
          scale: 1.02,
          boxShadow: currentColor.shadow
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400,
          damping: 15,
          bounce: 0.4
        }}
        className={`flex flex-col md:flex-row items-center gap-6 p-6 rounded-xl bg-[#2E2E2E] border border-gray-800 ${currentColor.border} relative cursor-pointer h-full`}
      >
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300" 
          style={{ boxShadow: `inset 0 0 20px ${currentColor.glow}` }}
        />

        <div className={`p-4 rounded-lg ${currentColor.iconBg} backdrop-blur-[1px]`}>
          <img className="w-16 h-16 object-contain" src={icon} alt="" />
        </div>

        <div className="text-center md:text-left">
          <motion.div 
            whileHover={{ color: currentColor.textHover }}
            className={`text-5xl font-bold ${currentColor.text} mb-1 transition-colors duration-300`}
          >
            <AnimatedNumber value={value} isInView={isInView} />+
          </motion.div>
          <motion.div 
            whileHover={{ color: "#e5e7eb" }}
            className="text-gray-300 text-lg font-medium transition-colors duration-300"
          >
            {text}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AnimatedNumber({ value, isInView }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const start = Date.now();
    const end = start + duration;

    const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    const updateValue = () => {
      const now = Date.now();
      const progress = Math.min((now - start) / duration, 1);
      const easedProgress = easeOutExpo(progress);
      setDisplayValue(Math.floor(easedProgress * value));

      if (now < end) requestAnimationFrame(updateValue);
    };

    updateValue();
  }, [isInView, value]);

  return <span>{displayValue.toLocaleString()}</span>;
}

export default Statistics;