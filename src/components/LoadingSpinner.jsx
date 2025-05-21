import { motion } from "framer-motion";

const LoadingSpinner = () => (
  <motion.div 
    className="flex flex-col items-center justify-center h-screen bg-[#1e1e1e] gap-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
    />
    <motion.p 
      className="text-white text-lg font-medium"
      initial={{ y: 10 }}
      animate={{ y: 0 }}
      transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
    >
    </motion.p>
  </motion.div>
);

export default LoadingSpinner;
