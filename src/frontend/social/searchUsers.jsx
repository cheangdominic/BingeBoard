import { useState } from "react";
import BottomNavbar from "../home/BottomNavbar.jsx";
import SearchBar from "../search/SearchBar.jsx";
import axios from "axios";

function SearchUsers() {
    const [query, setQuery] = useState("");
    const [exactMatches, setExactMatches] = useState([]);
    const [similarMatches, setSimilarMatches] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    const fetchUsers = async () => {
        if (!query.trim()) return;

        try {
            setHasSearched(true);
            const res = await axios.get(`/api/users?search=${query}`);
            const { exactMatches, similarMatches } = res.data;
            setExactMatches(exactMatches);
            setSimilarMatches(similarMatches);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    const UserCard = ({ user }) => (
        <div
            key={user._id}
            className="bg-[#2E2E2E] rounded-xl p-4 flex items-center gap-4 border border-gray-700/40"
        >
            <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center text-white font-bold text-xl">
                {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
                <p className="text-white font-semibold">{user.username}</p>
                <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
        </div>
    );

    return (
        <>
            <section className="min-h-screen bg-[#1e1e1e] pb-24 px-4">
                <h2 className="text-white text-2xl font-bold text-center mt-6 mb-4 font-coolvetica">
                    Search Users
                </h2>

                <SearchBar query={query} setQuery={setQuery} onSearch={fetchUsers} />

                <div className="mt-6 flex flex-col gap-6">
                    {
                        (
                            <>
                                {exactMatches.length > 0 && (
                                    <div>
                                        <h3 className="text-lg text-white font-semibold mb-2">
                                            Exact Matches
                                        </h3>
                                        <div className="flex flex-col gap-4">
                                            {exactMatches.map(user => (
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
                                            {similarMatches.map(user => (
                                                <UserCard key={user._id} user={user} />
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
                                            <p className="text-gray-400 mt-4">No similar matches found.</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                </div>
            </section>

            <BottomNavbar />
        </>
    );
}

export default SearchUsers;
