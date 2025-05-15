import { motion } from 'framer-motion';
import ShowGrid from './ShowGrid.jsx';
import BottomNavbar from '../../components/BottomNavbar.jsx';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

function LogPage() {
  return (
    <>
      <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
        >
        <ShowGrid />
        </motion.div>
        <BottomNavbar />
    </>
  )
}

export default LogPage