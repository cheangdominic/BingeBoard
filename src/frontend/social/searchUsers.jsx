import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import BottomNavbar from "../../components/BottomNavbar.jsx";
import SearchBar from "../search/SearchBar.jsx";
import axios from "axios";

function SearchUsers() {
    const [query, setQuery] = useState("");
    const [exactMatches, setExactMatches] = useState([]);
    const [similarMatches, setSimilarMatches] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchAnimationKey, setSearchAnimationKey] = useState(0);

    const fetchUsers = async () => {
        if (!query.trim()) return;

        try {
            setHasSearched(true);
            const res = await axios.get(`/api/users?search=${query}`);
            const { exactMatches, similarMatches } = res.data;
            setExactMatches(exactMatches);
            setSimilarMatches(similarMatches);

            setSearchAnimationKey(prev => prev + 1);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    const UserCard = ({ user }) => {
        const profilePic = user.profilePic || "/img/profilePhotos/generic_profile_picture.jpg";

        return (
            <Link to={`/user/${user.username}`}>
                <div className="bg-[#2E2E2E] rounded-xl p-4 flex items-center gap-4 border border-gray-700/40">
                    <img
                        src={profilePic}
                        alt={`${user.username}'s profile`}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                        <p className="text-white font-semibold">{user.username}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                </div>
            </Link>
        );
    };


    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <section className="min-h-screen bg-[#1e1e1e] py-16 px-4 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-6xl mx-auto"
                >
                    <h2 className="text-3xl font-semibold text-center text-[#1963da] mb-8">
                        Search for a User
                    </h2>

                    <SearchBar query={query} setQuery={setQuery} onSearch={fetchUsers} />
                </motion.div>

                <motion.div
                    key={searchAnimationKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="mt-10 flex flex-col gap-6"
                >
                    <>
                        {exactMatches.length > 0 && (
                            <div>
                                <h3 className="text-lg text-white font-semibold mb-2">
                                    Exact Matches
                                </h3>
                                <div className="flex flex-col gap-4">
                                    {exactMatches.map((user) => (
                                        <UserCard key={user._id} user={user} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {hasSearched && exactMatches.length === 0 && (
                            <div>
                                <h3 className="text-lg text-white font-semibold mb-2">
                                    Exact Matches
                                </h3>
                                <div className="flex flex-col gap-4">
                                    <p className="text-gray-400 mt-4">No exact matches found.</p>
                                </div>
                            </div>
                        )}

                        {similarMatches.length > 0 && (
                            <div>
                                <h3 className="text-lg text-white font-semibold mt-6 mb-2">
                                    Similar Matches
                                </h3>
                                <div className="flex flex-col gap-4">
                                    {similarMatches.map((user, index) => (
                                        <UserCard key={user._id} user={user} index={index} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {hasSearched && similarMatches.length === 0 && (
                            <div>
                                <h3 className="text-lg text-white font-semibold mb-2">
                                    Similar Matches
                                </h3>
                                <div className="flex flex-col gap-4">
                                    <p className="text-gray-400 mt-4">
                                        No similar matches found.
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                </motion.div>
            </section>

            <BottomNavbar />
        </>
    );
}

export default SearchUsers;
