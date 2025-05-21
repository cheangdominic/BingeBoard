import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
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
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

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
