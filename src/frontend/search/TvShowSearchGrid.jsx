import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import TVShowFilters from "./TVShowFilters";

const TVShowSearchGrid = () => {
  const [query, setQuery] = useState("");
  const [exactMatches, setExactMatches] = useState([]);
  const [broadenedShows, setBroadenedShows] = useState([]);
  const [filteredBroadenedShows, setFilteredBroadenedShows] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const navigate = useNavigate();

  const fetchTrendingShowsThisWeek = async () => {
    try {
      const trendingRes = await axios.get("https://api.themoviedb.org/3/trending/tv/week", {
        params: {
          api_key: "325f0c86f4e9c504dac84ae3046cbee2",
        },
      });
      setBroadenedShows(trendingRes.data.results);
      setFilteredBroadenedShows(trendingRes.data.results);
    } catch (error) {
      console.error("Failed to fetch trending shows this week:", error);
    }
  };


  useEffect(() => {
    if (!query) {
      fetchTrendingShowsThisWeek();
    }
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
          page: 1,
        },
      });

      const broadRes = await axios.get("https://api.themoviedb.org/3/search/tv", {
        params: {
          api_key: "325f0c86f4e9c504dac84ae3046cbee2",
          query: query,
          page: 1,
        },
      });

      setTotalResults(broadRes.data.total_results);

      const allResults = [...exactRes.data.results, ...broadRes.data.results];
      const uniqueResults = allResults.filter(
        (show, index, self) => index === self.findIndex((s) => s.id === show.id)
      );

      const exactMatchesData = uniqueResults.filter(
        (show) => show.name.toLowerCase() === query.toLowerCase()
      );

      const broadenedShowsData = uniqueResults.filter((show) => 
        !exactMatchesData.some(em => em.id === show.id)
      );

      setExactMatches(exactMatchesData);
      setBroadenedShows(broadenedShowsData);
      setFilteredBroadenedShows(broadenedShowsData);
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
          page: nextPage,
        },
      });

      setCurrentPage(nextPage);
      const newShowsToAdd = moreResults.data.results.filter(
        newShow => 
          !broadenedShows.find(bs => bs.id === newShow.id) &&
          !exactMatches.find(em => em.id === newShow.id)
      );
      const updatedBroadenedShows = [...broadenedShows, ...newShowsToAdd];

      setBroadenedShows(updatedBroadenedShows);
      setFilteredBroadenedShows(updatedBroadenedShows); 
    } catch (error) {
      console.error("Failed to load more results:", error);
    }
  };

  const handleCardClick = (showId) => {
    navigate(`/show/${showId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut"} },
  };

  const renderGrid = (shows, sectionKey) => (
    <motion.div
      key={sectionKey}
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8"
    >
      {shows.map((show) => (
        <motion.div
          key={show.id}
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-[#2a2a2a] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer flex flex-col"
          onClick={() => handleCardClick(show.id)}
        >
          <img
            src={
              show.poster_path
                ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                : "https://via.placeholder.com/500x750?text=No+Poster"
            }
            alt={show.name}
            className="w-full h-72 object-cover"
          />
          <div className="p-3 sm:p-4 flex-grow flex flex-col justify-between">
            <div>
              <h3 className="text-base sm:text-lg text-[#f1f1f1] font-semibold line-clamp-1">
                {show.name}
              </h3>
              {show.first_air_date && (
                  <p className="text-gray-400 text-sm">
                      {new Date(show.first_air_date).getFullYear()}
                  </p>
              )}
            </div>
            <p className="text-gray-300 text-xs sm:text-sm mt-2 line-clamp-3">
              {show.overview || "No description available."}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#1e1e1e] py-16 px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-3xl font-semibold text-center text-[#1963da] mb-8">
          Search for a TV Show
        </h1>

        <SearchBar query={query} setQuery={setQuery} onSearch={searchShows} isSearching={isSearching} />

        <div className="mt-10 space-y-12">
          {hasSearched && (
            <div className="space-y-4">
              <p className="text-gray-400 text-center">
                Found {totalResults} results for "{query}"
              </p>
              {broadenedShows.length > 0 && (
                <div className="max-w-4xl mx-auto">
                  <TVShowFilters shows={broadenedShows} onFilter={setFilteredBroadenedShows} />
                </div>
              )}
            </div>
          )}

          {exactMatches.length > 0 && (
            <section className="pt-4">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-semibold text-[#f1f1f1] mb-6"
              >
                Exact Matches
              </motion.h2>
              {renderGrid(exactMatches, "exact-matches-grid")}
            </section>
          )}

          {filteredBroadenedShows.length > 0 && (
            <section className={exactMatches.length > 0 ? "pt-4" : ""}>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-semibold text-[#f1f1f1] mb-6"
              >
                {hasSearched && exactMatches.length > 0 ? "Other Results" : (hasSearched ? "Results" : "Trending This Week")}
              </motion.h2>
              {renderGrid(filteredBroadenedShows, "related-shows-grid")}

              { hasSearched && (exactMatches.length + filteredBroadenedShows.length) < totalResults && !isSearching && (
                <div className="flex justify-center mt-8 mb-12">
                  <button
                    onClick={loadMore}
                    className="px-6 py-3 bg-[#1963da] text-white rounded-xl hover:bg-[#1652b5] transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
            </section>
          )}
          

          {!isSearching && hasSearched && exactMatches.length === 0 && filteredBroadenedShows.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <p className="text-gray-300 text-xl">No results found for "{query}". Try a different search term.</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TVShowSearchGrid;