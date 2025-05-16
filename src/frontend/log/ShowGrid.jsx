import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import SearchBar from "../search/SearchBar.jsx";
import TVShowFilters from "../search/TVShowFilters";
import { Apple } from "lucide-react";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const PartialApple = ({ fillPercent }) => (
  <div className="relative w-6 h-6 inline-block group">
    <Apple className="absolute top-0 left-0 w-6 h-6 text-gray-400" />
    <div
      className="absolute top-0 left-0 h-6 overflow-hidden"
      style={{ width: `${fillPercent}%` }}
    >
      <motion.div whileHover={{ scale: 1.2 }} className="w-6 h-6">
        <Apple className="w-6 h-6 text-yellow-500 fill-yellow-500" />
      </motion.div>
    </div>
  </div>
);

function AppleRating({ rating = 0, onClickApple = null }) {
  const fullApples = Math.floor(rating);
  const partialFillPercent = (rating - fullApples) * 100;
  const hasPartialApple = partialFillPercent > 0;
  const emptyApples = 5 - fullApples - (hasPartialApple ? 1 : 0);

  return (
    <div className="flex gap-1 mb-2">
      {Array.from({ length: fullApples }).map((_, idx) => (
        <motion.div key={`full-${idx}`} whileHover={{ scale: 1.2 }}>
          <Apple
            className="w-6 h-6 text-yellow-500 fill-yellow-500 cursor-pointer"
            onClick={() => onClickApple && onClickApple(idx + 1)}
          />
        </motion.div>
      ))}
      {hasPartialApple && (
        <motion.div
          onClick={() => onClickApple && onClickApple(fullApples + 1)}
          whileHover={{ scale: 1.2 }}
        >
          <PartialApple fillPercent={partialFillPercent} />
        </motion.div>
      )}
      {Array.from({ length: emptyApples }).map((_, idx) => (
        <motion.div key={`empty-${idx}`} whileHover={{ scale: 1.2 }}>
          <Apple
            className="w-6 h-6 text-gray-400 cursor-pointer"
            onClick={() =>
              onClickApple &&
              onClickApple(fullApples + (hasPartialApple ? 1 : 0) + idx + 1)
            }
          />
        </motion.div>
      ))}
    </div>
  );
}

const ShowGrid = () => {
  const [query, setQuery] = useState("");
  const [exactMatches, setExactMatches] = useState([]);
  const [broadenedShows, setBroadenedShows] = useState([]);
  const [filteredBroadenedShows, setFilteredBroadenedShows] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedShow, setSelectedShow] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [ratingWhole, setRatingWhole] = useState(0);
  const [ratingDecimal, setRatingDecimal] = useState(0);
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (ratingWhole >= 5) {
      setRatingDecimal(0);
    }
  }, [ratingWhole]);

  const handleAppleClick = (appleNumber) => {
    setRatingWhole(appleNumber);
    if (appleNumber >= 5) {
      setRatingDecimal(0);
    }
  };

  const fetchTrendingShowsToday = async () => {
    try {
      const trendingRes = await axios.get(
        "https://api.themoviedb.org/3/trending/tv/day",
        {
          params: {
            api_key: "325f0c86f4e9c504dac84ae3046cbee2",
            language: "en-US",
            page: 1,
          },
        }
      );
      setBroadenedShows(trendingRes.data.results);
      setFilteredBroadenedShows(trendingRes.data.results);
    } catch (error) {
      console.error("Failed to fetch trending shows:", error);
    }
  };

  useEffect(() => {
    if (!query) fetchTrendingShowsToday();
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

      const exactMatches = uniqueResults.filter(
        (show) => show.name.toLowerCase() === query.toLowerCase()
      );

      const broadenedShows = uniqueResults.filter((show) => !exactMatches.includes(show));

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
          page: nextPage,
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

  const handleCardClick = (show) => {
    setSelectedShow(show);
    setRatingWhole(0);
    setRatingDecimal(0);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] py-16 px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-3xl font-semibold text-center text-[#1963da] mb-8">
          Log Shows
        </h1>

        <SearchBar query={query} setQuery={setQuery} onSearch={searchShows} isSearching={isSearching} />

        <div className="flex gap-6 mt-10 items-start">
          <div className="flex-grow space-y-12">
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
                <h2 className="text-2xl font-semibold text-[#f1f1f1] mb-6">Exact Matches</h2>

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
                      onClick={() => handleCardClick(show)}
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
                        <h3 className="text-white text-lg font-bold mb-2 truncate">{show.name}</h3>
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
                      onClick={() => handleCardClick(show)}
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
                        <h3 className="text-white text-lg font-bold mb-2 truncate">{show.name}</h3>
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <p className="text-gray-300 text-xl">
                  No results found for "{query}". Try a different search term.
                </p>
              </motion.div>
            )}
          </div>

          {selectedShow && (
            <div className="w-96 bg-zinc-900 rounded-xl p-6 shadow-xl text-white flex-shrink-0">
              <h2 className="text-2xl font-bold mb-4">{selectedShow.name}</h2>
              <img
                src={
                  selectedShow.poster_path
                    ? IMAGE_BASE_URL + selectedShow.poster_path
                    : "https://via.placeholder.com/500x750?text=No+Image"
                }
                alt={selectedShow.name}
                className="w-full rounded-lg mb-4"
              />
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-semibold">Review</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="bg-zinc-800 rounded-md p-3 w-full text-gray-200"
                    rows={4}
                    placeholder="Write your thoughts..."
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-1 font-semibold">Rating</label>
                  <AppleRating
                    rating={ratingWhole + ratingDecimal / 100}
                    onClickApple={handleAppleClick}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={ratingWhole}
                      onFocus={() => {
                        if (ratingWhole === "0" || ratingWhole === 0) {
                          setRatingWhole("");
                        }
                      }}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          setRatingWhole("");
                        } else {
                          const numericValue = Number(value);
                          if (!isNaN(numericValue) && numericValue <= 5) {
                            setRatingWhole(numericValue);
                          }
                        }
                      }}
                      onBlur={() => {
                        if (ratingWhole === "" || ratingWhole === null) {
                          setRatingWhole(0);
                        }
                      }}
                      className="bg-zinc-800 p-2 rounded-md text-gray-200 w-12 text-center"
                    />
                    <span className="text-gray-200 text-xl font-bold select-none">.</span>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={ratingDecimal}
                      onFocus={() => {
                        if (ratingDecimal === "0" || ratingDecimal === 0) {
                          setRatingDecimal("");
                        }
                      }}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          setRatingDecimal("");
                        } else {
                          const numericValue = Number(value);
                          if (!isNaN(numericValue) && numericValue <= 99) {
                            setRatingDecimal(numericValue);
                          }
                        }
                      }}
                      onBlur={() => {
                        if (ratingDecimal !== "" && ratingDecimal < 10) {
                          setRatingDecimal(ratingDecimal * 10);
                        }
                        if (ratingDecimal === "") {
                          setRatingDecimal(0);
                        }
                      }}
                      disabled={ratingWhole >= 5}
                      className={`bg-zinc-800 p-2 rounded-md text-gray-200 w-16 text-center ${ratingWhole >= 5 ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Tags</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="bg-zinc-800 rounded-md p-3 w-full text-gray-200"
                    placeholder="e.g., Comedy, Drama"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="mt-4 w-full py-2 bg-[#1963da] text-white rounded-lg hover:bg-[#1652b5] transition-colors"
                >
                  Submit
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ShowGrid;
