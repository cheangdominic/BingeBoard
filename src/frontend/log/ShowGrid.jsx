import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SearchBar from "../search/SearchBar.jsx";
import TVShowFilters from "../search/TVShowFilters";
import { Apple } from "lucide-react";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const ShowGrid = () => {
  const [query, setQuery] = useState("");
  const [exactMatches, setExactMatches] = useState([]);
  const [broadenedShows, setBroadenedShows] = useState([]);
  const [filteredBroadenedShows, setFilteredBroadenedShows] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const navigate = useNavigate();

  const fetchRandomShows = async () => {
    try {
      const randomRes = await axios.get("https://api.themoviedb.org/3/discover/tv", {
        params: {
          api_key: "325f0c86f4e9c504dac84ae3046cbee2",
          sort_by: "popularity.desc",
          page: 1
        },
      });
      setBroadenedShows(randomRes.data.results);
      setFilteredBroadenedShows(randomRes.data.results);
    } catch (error) {
      console.error("Failed to fetch random shows:", error);
    }
  };

  useEffect(() => {
    if (!query) fetchRandomShows();
  }, [query]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const searchShows = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setCurrentPage(1);

    try {
      const exactRes = await axios.get("https://api.themoviedb.org/3/search/tv", {
        params: {
          api_key: "325f0c86f4e9c504dac84ae3046cbee2",
          query: `"${query}"`,
          page: 1
        },
      });

      const broadRes = await axios.get("https://api.themoviedb.org/3/search/tv", {
        params: {
          api_key: "325f0c86f4e9c504dac84ae3046cbee2",
          query: query,
          page: 1
        },
      });

      setTotalResults(broadRes.data.total_results);

      const allResults = [...exactRes.data.results, ...broadRes.data.results];
      const uniqueResults = allResults.filter(
        (show, index, self) => index === self.findIndex((s) => s.id === show.id)
      );

      const exactMatches = uniqueResults.filter(
        show => show.name.toLowerCase() === query.toLowerCase()
      );

      const broadenedShows = uniqueResults.filter(
        show => !exactMatches.includes(show)
      );

      setExactMatches(exactMatches);
      setBroadenedShows(broadenedShows);
      setFilteredBroadenedShows(broadenedShows);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const loadMore = async () => {
    const nextPage = currentPage + 1;
    try {
      const moreResults = await axios.get("https://api.themoviedb.org/3/search/tv", {
        params: {
          api_key: "325f0c86f4e9c504dac84ae3046cbee2",
          query: query,
          page: nextPage
        },
      });

      setCurrentPage(nextPage);
      const newShows = [...broadenedShows, ...moreResults.data.results];
      setBroadenedShows(newShows);
      setFilteredBroadenedShows(newShows);
    } catch (error) {
      console.error("Failed to load more results:", error);
    }
  };

  const handleCardClick = (showId) => {
    navigate(`/show/${showId}`);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] py-16 px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-3xl font-semibold text-center text-[#1963da] mb-8">
          Search for a TV Show
        </h1>

        <SearchBar
          query={query}
          setQuery={setQuery}
          onSearch={searchShows}
          isSearching={isSearching}
        />

        <div className="mt-10 space-y-12">
          {hasSearched && (
            <div className="space-y-4">
              <p className="text-gray-400 text-center">
                Found {totalResults} results for "{query}"
              </p>
              {broadenedShows.length > 0 && (
                <div className="max-w-4xl mx-auto">
                  <TVShowFilters
                    shows={broadenedShows}
                    onFilter={setFilteredBroadenedShows}
                  />
                </div>
              )}
            </div>
          )}

          {exactMatches.length > 0 && (
            <section className="pt-4">
              <h2 className="text-2xl font-semibold text-[#f1f1f1] mb-6">
                Exact Matches
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {exactMatches.map((show) => (
                  <motion.div
                    key={show.id}
                    className="bg-zinc-900 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    onClick={() => handleCardClick(show.id)}
                  >
                    <img
                      src={
                        show.poster_path
                          ? IMAGE_BASE_URL + show.poster_path
                          : "https://via.placeholder.com/500x750?text=No+Image"
                      }
                      alt={show.name}
                      className="w-full h-72 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-white text-lg font-bold mb-2 truncate">
                        {show.name}
                      </h3>
                      <p className="text-gray-400 text-sm font-semibold flex items-center gap-1">
                        <Apple className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        {show.vote_average ? Math.round((show.vote_average / 2) * 100) / 100 : "N/A"}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {filteredBroadenedShows.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-[#f1f1f1] mb-6">
                Related Shows
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {filteredBroadenedShows.map((show) => (
                  <motion.div
                    key={show.id}
                    className="bg-zinc-900 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    onClick={() => handleCardClick(show.id)}
                  >
                    <img
                      src={
                        show.poster_path
                          ? IMAGE_BASE_URL + show.poster_path
                          : "https://via.placeholder.com/500x750?text=No+Image"
                      }
                      alt={show.name}
                      className="w-full h-72 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-white text-lg font-bold mb-2 truncate">
                        {show.name}
                      </h3>
                      <p className="text-gray-400 text-sm font-semibold flex items-center gap-1">
                        <Apple className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        {show.vote_average ? Math.round((show.vote_average / 2) * 100) / 100 : "N/A"}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredBroadenedShows.length < totalResults && (
                <div className="flex justify-center mt-8 mb-12">
                  <button
                    onClick={loadMore}
                    className="px-6 py-3 bg-[#1963da] text-white rounded-lg hover:bg-[#1652b5] transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
            </section>
          )}

          {!isSearching && hasSearched && exactMatches.length === 0 && broadenedShows.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-gray-300 text-xl">
                No results found for "{query}". Try a different search term.
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ShowGrid;
