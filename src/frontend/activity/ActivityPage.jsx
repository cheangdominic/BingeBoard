import { motion } from 'framer-motion';
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import BottomNavbar from '../../components/BottomNavbar.jsx';
import ActivityCard from '../../components/ActivityCard.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

function ActivityPage() {
    const [count, setCount] = useState(0);

    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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

    const getMonthYear = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    const reviews = [
        {
            showName: "Breaking Bad",
            date: "May 6, 2025",
            reviewText: "This show completely changed the way I think about reality...",
            rating: 4,
            imageUrl: "https://via.placeholder.com/300x450",
            showLink: "/show/1396"
        },
        {
            showName: "Breaking Bad",
            date: "May 5, 2025",
            reviewText: "A solid show overall...",
            rating: 3,
            imageUrl: "https://via.placeholder.com/300x450",
            showLink: "/show/1396"
        },
        {
            showName: "Breaking Bad",
            date: "March 5, 2025",
            reviewText: "Still worth watching though...",
            rating: 3,
            imageUrl: "https://via.placeholder.com/300x450",
            showLink: "/show/1396"
        },
    ];

    let lastMonth = "";

    if (authLoading) {
        return (
            <LoadingSpinner />
        );
    }

    if (!user) {
        return null;
    }

    return (
        <>
            <section className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
                <div className="text-center mb-10 mt-6 px-4">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white font-coolvetica relative inline-block">
                        Activity
                    </h2>
                    <p className="text-gray-400 mt-2 text-sm sm:text-base max-w-md mx-auto">
                        Your latest reviews and ratings.
                    </p>
                </div>

                <div className="flex flex-col space-y-4 w-full px-8 mb-20">
                    {reviews.map((review, index) => {
                        const currentMonth = getMonthYear(review.date);
                        const showHeader = currentMonth !== lastMonth;
                        lastMonth = currentMonth;

                        return (
                            <div key={index} className="w-full flex flex-col items-center">
                                {showHeader ? (
                                    <div className="w-full flex items-center mb-4 mt-2 px-2 sm:px-4">
                                        <div className="h-px flex-1 bg-gradient-to-r from-blue-400/30 via-gray-500/30 to-transparent" />
                                        <h4 className="px-4 py-1 bg-[#2E2E2E] text-white text-md sm:text-lg font-semibold rounded-full shadow border border-gray-700 mx-4">
                                            {currentMonth}
                                        </h4>
                                        <div className="h-px flex-1 bg-gradient-to-l from-blue-400/30 via-gray-500/30 to-transparent" />
                                    </div>
                                ) : null}

                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={fadeInUp}
                                    transition={{ delay: index * 0.2 }}
                                    className="w-full flex justify-center"
                                >
                                    <ActivityCard {...review} />
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </section>
            <BottomNavbar />
        </>
    );
}

export default ActivityPage;