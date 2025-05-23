/**
 * @file SearchUsers.js
 * @description A React component that allows users to search for other users within the application.
 * It displays exact and similar matches, handles loading and authentication states, and provides navigation.
 */

// Import React hooks (useState, useEffect) for managing component state and side effects.
import { useState, useEffect } from "react";
// Import `useAuth` custom hook to access authentication context (user state and auth loading status).
import { useAuth } from "../../context/AuthContext";
// Import `useNavigate` from react-router-dom for programmatic navigation.
import { useNavigate } from 'react-router-dom';
// Import `motion` from framer-motion for animations.
import { motion } from "framer-motion";
// Import `Link` from react-router-dom for client-side navigation to user profiles.
import { Link } from "react-router-dom";
// Import `BottomNavbar` component for application navigation.
import BottomNavbar from "../../components/BottomNavbar.jsx";
// Import `SearchBar` component for user input.
import SearchBar from "../search/SearchBar.jsx"; // Assuming SearchBar is in a sibling 'search' directory.
// Import `axios` for making HTTP requests to the backend API.
import axios from "axios";
// Import `LoadingSpinner` component for visual feedback during loading states.
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

/**
 * @function SearchUsers
 * @description A React functional component that provides an interface for searching users.
 * It displays search results categorized into exact and similar matches.
 * Requires user authentication to access.
 *
 * @returns {JSX.Element | null} The rendered SearchUsers page component, a loading spinner, or null if redirecting.
 */
function SearchUsers() {
    // State for the current search query string.
    const [query, setQuery] = useState("");
    // State to store users that are exact matches to the query.
    const [exactMatches, setExactMatches] = useState([]);
    // State to store users that are similar matches to the query.
    const [similarMatches, setSimilarMatches] = useState([]);
    // State to track if a search has been performed at least once.
    const [hasSearched, setHasSearched] = useState(false);
    // State to track if a user search operation is currently in progress.
    const [searchLoading, setSearchLoading] = useState(false);
    // State to manage a key for re-triggering animations on new search results.
    const [searchAnimationKey, setSearchAnimationKey] = useState(0);

    /**
     * `user`: The authenticated user object from the AuthContext.
     * `authLoading`: Boolean indicating if the authentication status is currently being loaded.
     * @type {{user: object|null, loading: boolean}}
     */
    const { user, loading: authLoading } = useAuth();
    /**
     * `navigate`: Function from `react-router-dom` used for programmatic navigation.
     * @type {function}
     */
    const navigate = useNavigate();

    /**
     * `useEffect` hook to handle redirection for unauthenticated users.
     * If authentication check is complete (`!authLoading`) and no user is authenticated (`!user`),
     * it navigates to the '/login' page.
     */
    useEffect(() => {
        if (!authLoading && !user) { // If auth check done and no user
            navigate('/login');     // Redirect to login
        }
    }, [user, authLoading, navigate]); // Dependencies

    /**
     * Fetches users from the backend API based on the current `query`.
     * Updates `exactMatches` and `similarMatches` states with the results.
     * @async
     */
    const fetchUsers = async () => {
        // If the query is empty or only whitespace, do not proceed.
        if (!query.trim()) return;

        setSearchLoading(true); // Set search loading state to true.
        try {
            setHasSearched(true); // Mark that a search has been performed.
            // Make GET request to `/api/users` with the search query.
            const res = await axios.get(`/api/users?search=${query}`);
            const { exactMatches, similarMatches } = res.data; // Destructure results from response.
            // Update state with fetched matches.
            setExactMatches(exactMatches);
            setSimilarMatches(similarMatches);
            // Increment animation key to re-trigger animations for new results.
            setSearchAnimationKey(prev => prev + 1);
        } catch (err) {
            console.error("Error fetching users:", err);
            // Optionally, set an error state here to display a message to the user.
        } finally {
            setSearchLoading(false); // Reset search loading state.
        }
    };

    /**
     * @function UserCard
     * @description A simple component to display a single user in the search results.
     * Links to the user's profile page.
     * @param {object} props - Component props.
     * @param {object} props.user - The user object to display.
     * @returns {JSX.Element} The rendered UserCard.
     */
    const UserCard = ({ user }) => {
        // Determine profile picture URL, using a default if not available.
        const profilePic = user.profilePic || "/img/profilePhotos/generic_profile_picture.jpg";

        return (
            // Link to the user's profile page (`/user/:username`).
            <Link to={`/user/${user.username}`}>
                {/* Card container with styling. */}
                <div className="bg-[#2E2E2E] rounded-xl p-4 flex items-center gap-4 border border-gray-700/40">
                    {/* User's profile picture. */}
                    <img
                        src={profilePic}
                        alt={`${user.username}'s profile`}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    {/* User's username. */}
                    <div>
                        <p className="text-white font-semibold">@{user.username}</p>
                    </div>
                </div>
            </Link>
        );
    };

    /**
     * `useEffect` hook to scroll to the top of the page when the component mounts.
     */
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []); // Empty dependency array: runs only on mount.

    // If authentication status is still loading, display a full-page loading spinner.
    if (authLoading) {
        return <LoadingSpinner />;
    }

    // If no authenticated user (after auth loading is complete), return null.
    // Redirection is handled by the `useEffect` hook above.
    if (!user) {
        return null;
    }

    // Main render method for the SearchUsers page.
    return (
        <>
            {/* Main section container for the search page content. */}
            <section className="min-h-screen bg-[#1e1e1e] py-16 px-4 pb-24">
                {/* Animated container for the page title and search bar. */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }} // Initial animation state.
                    animate={{ opacity: 1, y: 0 }}     // Animate into view.
                    className="max-w-6xl mx-auto"    // Centered with max width.
                >
                    <h2 className="text-3xl font-semibold text-center text-[#1963da] mb-8">
                        Search for a User
                    </h2>
                    {/* SearchBar component for user input. */}
                    <SearchBar query={query} setQuery={setQuery} onSearch={fetchUsers} />
                </motion.div>

                {/* Conditional rendering for search loading state. */}
                {searchLoading ? (
                    <div className="mt-6 flex justify-center">
                        <LoadingSpinner /> {/* Show spinner while searching. */}
                    </div>
                ) : (
                    // Animated container for search results, re-animates when `searchAnimationKey` changes.
                    <motion.div
                        key={searchAnimationKey} // Key to trigger re-animation on new search.
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="mt-10 flex flex-col gap-6 max-w-6xl mx-auto" // Layout for results sections.
                    >
                        <> {/* Fragment to group multiple conditional sections. */}
                            {/* Display Exact Matches section if any exist. */}
                            {exactMatches.length > 0 && (
                                <div>
                                    <h3 className="text-lg text-white font-semibold mb-2">
                                        Exact Matches
                                    </h3>
                                    <div className="flex flex-col gap-4">
                                        {exactMatches.map((u) => (
                                            <UserCard key={u._id} user={u} /> // Render UserCard for each exact match.
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Message if a search was done but no exact matches found. */}
                            {hasSearched && exactMatches.length === 0 && (
                                <div>
                                    <h3 className="text-lg text-white font-semibold mb-2">
                                        Exact Matches
                                    </h3>
                                    <p className="text-gray-400 mt-4">No exact matches found.</p>
                                </div>
                            )}

                            {/* Display Similar Matches section if any exist. */}
                            {similarMatches.length > 0 && (
                                <div>
                                    <h3 className="text-lg text-white font-semibold mt-6 mb-2">
                                        Similar Matches
                                    </h3>
                                    <div className="flex flex-col gap-4">
                                        {similarMatches.map((u) => (
                                            <UserCard key={u._id} user={u} /> // Render UserCard for each similar match.
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Message if a search was done but no similar matches found. */}
                            {hasSearched && similarMatches.length === 0 && (
                                <div>
                                    {/* The heading "Similar Matches" might be redundant if the "Exact Matches" heading is already shown and was empty.
                                        Consider combining logic or adjusting headings if both are empty. */}
                                    <h3 className="text-lg text-white font-semibold mb-2"> 
                                        Similar Matches
                                    </h3>
                                    <p className="text-gray-400 mt-4">No similar matches found.</p>
                                </div>
                            )}

                            {/* Initial prompt if no search has been performed yet. */}
                            {!hasSearched && (
                                <div className="text-center mt-10">
                                    <p className="text-gray-400">
                                        Enter a username to start searching for users.
                                    </p>
                                </div>
                            )}
                        </>
                    </motion.div>
                )}
            </section>

            {/* Bottom navigation bar. */}
            <BottomNavbar />
        </>
    );
}

// Export the SearchUsers component as the default.
export default SearchUsers;