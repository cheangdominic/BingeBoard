import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

function Statistics() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="bg-[#2E2E2E] rounded-xl px-10 py-2 max-w-[1400px] mx-auto mt-5">
      <div className="flex flex-col md:flex-row justify-evenly gap-16 font-coolvetica">
        <StatCard 
          icon="src/assets/person_statistics_icon.svg"
          value={10000}
          text="Active Users"
          isInView={isInView}
        />
        <StatCard 
          icon="src/assets/review_rating_icon.svg"
          value={50000}
          text="Reviews Made"
          isInView={isInView}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, value, text, isInView }) {
  return (
    <div className="w-full max-w-[40rem] rounded overflow-hidden px-6 py-4">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <img className="w-40 h-40" src={icon} alt="Icon" />
        <h1 className="text-[#1963da] text-4xl font-bold">
          <AnimatedNumber value={value} isInView={isInView} />+ {text}
        </h1>
      </div>
    </div>
  );
}

function AnimatedNumber({ value, isInView }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 4000;
    const start = Date.now();
    const end = start + duration;

    const easeOutQuad = (t) => t * (2 - t); 

    const updateValue = () => {
      const now = Date.now();
      const progress = Math.min((now - start) / duration, 1);
      const easedProgress = easeOutQuad(progress);
      setDisplayValue(Math.floor(easedProgress * value));

      if (now < end) requestAnimationFrame(updateValue);
      else setDisplayValue(value);
    };

    updateValue();
  }, [isInView, value]);

  return <span>{displayValue.toLocaleString()}</span>;
}

export default Statistics;