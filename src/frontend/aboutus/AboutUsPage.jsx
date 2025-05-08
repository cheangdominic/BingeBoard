import { motion } from 'framer-motion';
import Landing from '../landing/TopNavbar';
import Footer from '../landing/Footer';
import AboutUsInfo from './AboutUsInfo';

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

function AboutUsPage() {
  return (
    <>
      <Landing />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.3 }}
        key="aboutus-info"
      >
        <AboutUsInfo />
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.5 }}
        key="footer"
      >
        <Footer />
      </motion.div>
    </>
  );
}

export default AboutUsPage;
