import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";

const genreMap = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western"
};

const ratingSteps = [1, 2, 3, 4];

export default function TVShowFilters({ shows, onFilter }) {
  const [filters, setFilters] = useState({
    year: [],
    minRating: [],
    genre: [],
  });

  const [availableGenres, setAvailableGenres] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [filteredCount, setFilteredCount] = useState(shows.length);
  const [activeTab, setActiveTab] = useState("year");

  useEffect(() => {
    const genres = new Set();
    const years = new Set();

    shows.forEach(show => {
      show.genre_ids?.forEach(id => genres.add(id));
      if (show.first_air_date) {
        years.add(show.first_air_date.split("-")[0]);
      }
    });

    setAvailableGenres(Array.from(genres));
    setAvailableYears(Array.from(years).sort((a, b) => b - a));
  }, [shows]);

  const toggleFilter = (type, value) => {
    setFilters(prev => {
      const isActive = prev[type].includes(value);
      return {
        ...prev,
        [type]: isActive
          ? prev[type].filter(v => v !== value)
          : [...prev[type], value]
      };
    });
  };

  const applyFilters = () => {
    const filtered = shows.filter(show => {
      if (filters.year.length && show.first_air_date) {
        const showYear = show.first_air_date.split("-")[0];
        if (!filters.year.includes(showYear)) return false;
      }

      if (filters.minRating.length) {
        if (show.vote_average == null || !filters.minRating.some(r => show.vote_average >= r * 2)) {
          return false;
        }
      }


      if (filters.genre.length && show.genre_ids) {
        if (!filters.genre.some(g => show.genre_ids.includes(parseInt(g)))) {
          return false;
        }
      }

      return true;
    });

    setFilteredCount(filtered.length);
    onFilter(filtered);
  };

  const resetFilters = () => {
    setFilters({ year: [], minRating: [], genre: [] });
    setFilteredCount(shows.length);
    onFilter(shows);
  };

  const removeSingleFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].filter(v => v !== value)
    }));
  };

  const filterTabs = [
    { id: "year", label: "Year", color: "bg-blue-600" },
    { id: "minRating", label: "Rating", color: "bg-yellow-500" },
    { id: "genre", label: "Genre", color: "bg-blue-900" }
  ];

  const tabLabelMap = {
    year: "Filter by Year",
    minRating: "Filter by Rating",
    genre: "Filter by Genre"
  };

  return (
    <div className="w-full">
      {/* Active filters chips */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        <AnimatePresence>
          {filters.year.map(y => (
            <motion.span
              key={`year-${y}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full flex items-center gap-1 shrink-0"
            >
              {y}
              <button
                onClick={() => removeSingleFilter("year", y)}
                className="text-gray-300 hover:text-white transition"
              >
                <MdClose size={16} />
              </button>
            </motion.span>
          ))}
          {filters.minRating.map(r => (
            <motion.span
              key={`rating-${r}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="px-3 py-1 bg-yellow-500 text-gray-900 text-sm rounded-full flex items-center gap-1 shrink-0"
            >
              ≥ {r}
              <button
                onClick={() => removeSingleFilter("minRating", r)}
                className="text-gray-600 hover:text-gray-800 transition"
              >
                <MdClose size={16} />
              </button>
            </motion.span>
          ))}
          {filters.genre.map(g => (
            <motion.span
              key={`genre-${g}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="px-3 py-1 bg-blue-900 text-white text-sm rounded-full flex items-center gap-1 shrink-0"
            >
              {genreMap[g]}
              <button
                onClick={() => removeSingleFilter("genre", g)}
                className="text-gray-300 hover:text-white transition"
              >
                <MdClose size={16} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Tab indicators */}
      <div className="flex justify-center gap-2 mb-2">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-2 h-2 rounded-full transition-all ${activeTab === tab.id ? tab.color + " opacity-100" : "bg-gray-400 opacity-30"}`}
            aria-label={`Show ${tab.label} filters`}
          />
        ))}
      </div>

      {/* Filter label */}
      <h3 className="text-sm font-semibold text-gray-600 text-center mb-2">
        {tabLabelMap[activeTab]}
      </h3>

      {/* Filter content with scrollable years */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ x: activeTab === "year" ? -50 : 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: activeTab === "year" ? -50 : 50, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex justify-center"
          >
            {activeTab === "year" && (
              <div className="flex gap-2 overflow-x-auto px-1 scrollbar-hide">
                {availableYears.map(year => (
                  <motion.button
                    key={year}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleFilter("year", year)}
                    className={`px-3 py-1 rounded-full text-xs font-medium shrink-0
                      ${filters.year.includes(year)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                    `}
                  >
                    {year}
                  </motion.button>
                ))}
              </div>
            )}

            {activeTab === "minRating" && (
              <div className="flex gap-2">
                {ratingSteps.map(rating => (
                  <motion.button
                    key={rating}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleFilter("minRating", rating)}
                    className={`px-3 py-1 rounded-full text-xs font-medium
                      ${filters.minRating.includes(rating)
                        ? "bg-yellow-500 text-gray-900"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                    `}
                  >
                    ≥ {rating}
                  </motion.button>
                ))}
              </div>
            )}

            {activeTab === "genre" && (
              <div className="flex gap-2 flex-wrap justify-center">
                {availableGenres.map(genreId => (
                  <motion.button
                    key={genreId}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleFilter("genre", genreId.toString())}
                    className={`px-3 py-1 rounded-full text-xs font-medium
                      ${filters.genre.includes(genreId.toString())
                        ? "bg-blue-900 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                    `}
                  >
                    {genreMap[genreId] || genreId}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <div className="flex justify-between mt-3 px-1">
        <button
          onClick={() => {
            const currentIndex = filterTabs.findIndex(tab => tab.id === activeTab);
            const prevTab = filterTabs[(currentIndex - 1 + filterTabs.length) % filterTabs.length];
            setActiveTab(prevTab.id);
          }}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <MdArrowBackIos size={20} />
        </button>
        <button
          onClick={() => {
            const currentIndex = filterTabs.findIndex(tab => tab.id === activeTab);
            const nextTab = filterTabs[(currentIndex + 1) % filterTabs.length];
            setActiveTab(nextTab.id);
          }}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <MdArrowForwardIos size={20} />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-2 mt-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={resetFilters}
          className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 transition"
        >
          Reset
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={applyFilters}
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Apply ({filteredCount} matches)
        </motion.button>
      </div>
    </div>
  );
}