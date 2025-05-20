import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import SignupForm from "./SignupForm";
import TopNavbar from "../landing/TopNavbar";
import Footer from '../landing/Footer.jsx';

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

function SignupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);
  return (
    <>
      <TopNavbar />
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp} 
        transition={{ delay: 0.2 }}
        key="signup-form"
      >
        <SignupForm />
      </motion.div>
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.4 }}
        key="footer"
      >
        <Footer />
      </motion.div>
    </>
  );
}

export default SignupPage;