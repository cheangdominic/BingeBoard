import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "../search/SearchBar.jsx";
import TVShowFilters from "../search/TVShowFilters";
import { X, CheckCircle, Eye as EyeIcon } from "lucide-react";
import { FaEye, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import AppleRatingDisplay from '../../components/AppleRatingDisplay';

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const fetchSeasonEpisodes = async (showId, seasonNumber) => {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "en-US"
      }
    });
    return response.data.episodes.map(ep => ({
      id: ep.id,
      number: ep.episode_number,
      name: ep.name,
      rating: ep.vote_average,
    }));
  } catch (error) {
    console.error(`Error fetching episodes for show ${showId}, season ${seasonNumber}:`, error);
    return [];
  }
};

const formatEpisodeNumber = (num) => {
  const numStr = String(num);
  const cleanNum = numStr.replace(/[^\d]/g, '');
  return parseInt(cleanNum, 10) || 0;
};

const EpisodeList = ({ 
    seasons, 
    showId, 
    isAuthenticated, 
    showName, 
    posterPath, 
    setShowWatchedToast,
    setWatchedToastMessage
}) => {
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]?.number || 1);
  const [episodesBySeason, setEpisodesBySeason] = useState({});
  const [selectedEpisodesInfo, setSelectedEpisodesInfo] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [isMarkingWatched, setIsMarkingWatched] = useState(false);

  const EPISODES_LIMIT = 20;

  useEffect(() => {
    setEpisodesBySeason({});
    setSelectedEpisodesInfo([]);
    setViewAll(false);
    setIsLoadingEpisodes(false);
    if (seasons && seasons.length > 0) {
      const currentSeasonStillValid = seasons.find(s => s.number === selectedSeason);
      if (currentSeasonStillValid) {
        setSelectedSeason(currentSeasonStillValid.number);
      } else {
        setSelectedSeason(seasons[0]?.number || 1);
      }
    } else {
      setSelectedSeason(1);
    }
  }, [seasons, showId]);


  useEffect(() => {
    const loadEpisodes = async () => {
      if (!selectedSeason) return;
      if (!episodesBySeason[selectedSeason]) {
        setIsLoadingEpisodes(true);
        try {
          const fetchedEpisodes = await fetchSeasonEpisodes(showId, selectedSeason);
          setEpisodesBySeason(prev => ({ ...prev, [selectedSeason]: fetchedEpisodes }));
        } catch (err) {
          setEpisodesBySeason(prev => ({ ...prev, [selectedSeason]: [] }));
        } finally {
          setIsLoadingEpisodes(false);
        }
      }
    };
    loadEpisodes();
  }, [selectedSeason, showId]);

  useEffect(() => {
    setViewAll(false);
    setSelectedEpisodesInfo([]);
  }, [selectedSeason]);

  const episodes = episodesBySeason[selectedSeason] || [];
  const displayedEpisodes = viewAll ? episodes : episodes.slice(0, EPISODES_LIMIT);
  const hasMoreEpisodes = episodes.length > EPISODES_LIMIT;

  const handleEpisodeClick = (episode) => {
    setSelectedEpisodesInfo(prev => {
      const isSelected = prev.find(epInfo => epInfo.id === episode.id);
      if (isSelected) {
        return prev.filter(epInfo => epInfo.id !== episode.id);
      } else {
        return [...prev, { id: episode.id, number: episode.number, name: episode.name }];
      }
    });
  };
  
  const handleMarkAsWatched = async () => {
    if (!isAuthenticated || selectedEpisodesInfo.length === 0) return;
    setIsMarkingWatched(true);

    const watchedData = {
      showId: showId.toString(),
      showName: showName, 
      posterPath: posterPath, 
      seasonNumber: selectedSeason,
      episodes: selectedEpisodesInfo,
    };

    try {
      await axios.post('/api/users/mark-watched', watchedData, { withCredentials: true });
      setWatchedToastMessage(`${selectedEpisodesInfo.length} episode(s) from ${showName} marked as watched!`);
      setShowWatchedToast(true);
      setSelectedEpisodesInfo([]);
    } catch (error) {
      console.error("Failed to mark episodes as watched:", error.response?.data || error.message);
      alert(`Error: ${error.response?.data?.message || "Could not mark episodes as watched."}`);
    } finally {
      setIsMarkingWatched(false);
    }
  };

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  useEffect(() => {
    const endDragGlobal = () => setIsDragging(false);
    window.addEventListener('mouseup', endDragGlobal);
    return () => window.removeEventListener('mouseup', endDragGlobal);
  }, []);

  if (!seasons || seasons.length === 0) {
    return <div className="text-gray-400 text-center py-3">No season data available.</div>;
  }

  return (
    <div className="bg-[#2a2a2a] rounded-xl p-6">
      <div className="text-2xl font-bold mb-6 text-gray-100">
        Episodes
      </div>
      <div className="bg-gradient-to-br from-[#272733] to-[#1c1c24] rounded-xl p-4 sm:p-6 shadow-lg border border-[#343444]">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-3 sm:gap-0">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-100">Season {selectedSeason} Episodes</h3>
          <p className="text-blue-400 text-xs sm:text-sm mt-1">
            {episodes.length} Episode{episodes.length !== 1 ? "s" : ""} • Select to mark as watched
          </p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <span className="text-xs sm:text-sm text-gray-400">
            {selectedEpisodesInfo.length} selected
          </span>
          <button
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-white text-xs sm:text-sm font-medium transition-colors"
            onClick={() => setSelectedSeason(seasons[0]?.number || 1)}
          >
            First Season
          </button>
        </div>
      </div>

      <div className="flex space-x-2 sm:space-x-3 mb-6 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-[#3a3a3a] scrollbar-track-transparent">
        {seasons.map(season => (
          <button
            key={season.id || season.number}
            onClick={() => setSelectedSeason(season.number)}
            className={`px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm md:text-base font-medium whitespace-nowrap transition-colors ${selectedSeason === season.number
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-[#343444] text-gray-300 hover:bg-[#3f3f52]'
              }`}
          >
            {season.name || `Season ${season.number}`}
          </button>
        ))}
      </div>

      {isLoadingEpisodes ? (
         <div className="text-center py-8 text-gray-400">Loading episodes...</div>
      ) : episodes.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No episodes found for this season.</div>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-3 mb-6">
          {displayedEpisodes.map(ep => {
            const isCurrentlySelected = selectedEpisodesInfo.some(selEp => selEp.id === ep.id);
            const canSelect = isAuthenticated;
            const ratingValue = typeof ep.rating === 'number' ? ep.rating : parseFloat(ep.rating);
            const displayRating = !isNaN(ratingValue) ? ratingValue.toFixed(1) : 'N/A';

            return (
              <div
                key={ep.id}
                onClick={canSelect ? () => handleEpisodeClick(ep) : undefined}
                onMouseDown={canSelect ? handleDragStart : undefined}
                onMouseUp={canSelect ? handleDragEnd : undefined}
                onMouseEnter={canSelect && isDragging ? () => handleEpisodeClick(ep) : undefined}
                className={`aspect-square rounded-md sm:rounded-lg flex items-center justify-center relative transition-all cursor-pointer
                  ${canSelect
                    ? isCurrentlySelected
                      ? 'bg-blue-600 border-2 border-blue-400 shadow-md shadow-blue-500/20'
                      : 'bg-[#343444] hover:bg-[#3f3f52] border border-[#4a4a5a]'
                    : 'bg-[#343444] border border-[#4a4a5a] cursor-not-allowed'
                  }`}
                title={`Ep. ${formatEpisodeNumber(ep.number)}: ${ep.name || ''} - Rating: ${displayRating}`}
              >
                <span className="text-xs sm:text-sm font-medium text-gray-200">{formatEpisodeNumber(ep.number)}</span>
                {canSelect && (
                  <div className={`absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 ${isDragging ? '' : 'hover:opacity-100'} transition-opacity rounded-md sm:rounded-lg`}>
                    <span className="text-xs sm:text-sm font-bold text-yellow-400">
                      {displayRating}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {hasMoreEpisodes && !isLoadingEpisodes && episodes.length > 0 && (
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setViewAll(!viewAll)}
            className="flex items-center space-x-2 bg-[#343444] hover:bg-[#3f3f52] text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg transition-colors font-medium text-xs sm:text-sm"
          >
            <span>{viewAll ? "Show Less" : `View All ${episodes.length} Episodes`}</span>
            {viewAll ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
          </button>
        </div>
      )}

      {isAuthenticated && (
        <button
          onClick={handleMarkAsWatched}
          disabled={selectedEpisodesInfo.length === 0 || isMarkingWatched}
          className={`w-full py-2.5 sm:py-3.5 rounded-lg font-medium flex items-center justify-center space-x-2 sm:space-x-3 transition-colors text-xs sm:text-sm md:text-md lg:text-lg ${selectedEpisodesInfo.length > 0 && !isMarkingWatched
              ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-md shadow-green-500/20'
              : 'bg-[#343444] text-gray-400 cursor-not-allowed'
            }`}
        >
          <FaEye className="text-base" />
          <span>{isMarkingWatched ? "Marking..." : "Mark Selected as Watched"}</span>
          {selectedEpisodesInfo.length > 0 && !isMarkingWatched && (
            <span className="bg-white/20 px-2 py-0.5 sm:px-2.5 rounded-full text-xs sm:text-sm">
              {selectedEpisodesInfo.length}
            </span>
          )}
        </button>
      )}
      </div>
    </div>
  );
};

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
  const [selectedShowDetails, setSelectedShowDetails] = useState(null);
  const [formattedShowSeasons, setFormattedShowSeasons] = useState([]);
  const [isLoadingShowDetails, setIsLoadingShowDetails] = useState(false);
  
  const { user } = useAuth();
  const isAuthenticatedForReview = !!user; 

  const [reviewText, setReviewText] = useState("");
  const [ratingWhole, setRatingWhole] = useState(0);
  const [ratingDecimal, setRatingDecimal] = useState(0);
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  
  const [showSuccessReviewToast, setShowSuccessReviewToast] = useState(false);
  const [showWatchedToast, setShowWatchedToast] = useState(false);
  const [watchedToastMessage, setWatchedToastMessage] = useState("");
  
  const [modalCanClose, setModalCanClose] = useState(true);

  useEffect(() => {
    if (ratingWhole >= 5) {
      setRatingDecimal(0);
    }
  }, [ratingWhole]);

  const handleInteractiveAppleClick = (appleNumber) => {
    setRatingWhole(appleNumber);
    if (appleNumber >= 5) {
      setRatingDecimal(0);
    }
  };

  const fetchTrendingShowsWeek = async () => {
    setIsSearching(true);
    try {
      const trendingRes = await axios.get(
        "https://api.themoviedb.org/3/trending/tv/week",
        { params: { api_key: TMDB_API_KEY, language: "en-US", page: 1 } }
      );
      setBroadenedShows(trendingRes.data.results);
      setFilteredBroadenedShows(trendingRes.data.results);
    } catch (error) {
      console.error("Failed to fetch trending shows:", error);
      setBroadenedShows([]);
      setFilteredBroadenedShows([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!query.trim() && !hasSearched) {
      fetchTrendingShowsWeek();
    }
  }, [query, hasSearched]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (selectedShow) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setModalCanClose(true); 
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedShow]);

  useEffect(() => {
    const fetchShowDetailsForModal = async () => {
      if (!selectedShow) {
        setFormattedShowSeasons([]);
        setSelectedShowDetails(null);
        return;
      }
      setIsLoadingShowDetails(true);
      try {
        const response = await axios.get(`https://api.themoviedb.org/3/tv/${selectedShow.id}`, {
          params: {
            api_key: TMDB_API_KEY,
            language: "en-US",
          },
        });
        setSelectedShowDetails(response.data); 
        const adaptedSeasons = response.data.seasons
          ?.filter(s => s.season_number > 0 )
          .map(s => ({
            id: s.id,
            number: s.season_number,
            name: s.name,
            episode_count: s.episode_count
          })) || [];
        setFormattedShowSeasons(adaptedSeasons);
      } catch (error) {
        console.error("Failed to fetch show details for seasons:", error);
        setFormattedShowSeasons([]);
        setSelectedShowDetails(null);
      } finally {
        setIsLoadingShowDetails(false);
      }
    };

    fetchShowDetailsForModal();
  }, [selectedShow]);


  const searchShows = async () => {
    if (!query.trim()) {
      setExactMatches([]);
      setHasSearched(false);
      setTotalResults(0);
      setCurrentPage(1);
      fetchTrendingShowsWeek();
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    setCurrentPage(1);

    try {
      const exactRes = await axios.get("https://api.themoviedb.org/3/search/tv", {
        params: { api_key: TMDB_API_KEY, query: `"${query}"`, page: 1 },
      });
      const broadRes = await axios.get("https://api.themoviedb.org/3/search/tv", {
        params: { api_key: TMDB_API_KEY, query: query, page: 1 },
      });
      setTotalResults(broadRes.data.total_results);
      let tempExactMatches = exactRes.data.results.filter(
        (show) => show.name.toLowerCase() === query.toLowerCase()
      );
      broadRes.data.results.forEach(show => {
        if (show.name.toLowerCase() === query.toLowerCase() && !tempExactMatches.find(s => s.id === show.id)) {
          tempExactMatches.push(show);
        }
      });
      setExactMatches(tempExactMatches);
      const allCombinedResults = [...exactRes.data.results, ...broadRes.data.results];
      const uniqueBroadened = allCombinedResults.filter(
        (show, index, self) =>
          index === self.findIndex((s) => s.id === show.id) &&
          !tempExactMatches.find(em => em.id === show.id)
      );
      setBroadenedShows(uniqueBroadened);
      setFilteredBroadenedShows(uniqueBroadened);
    } catch (error) {
      console.error("Search failed:", error);
      setExactMatches([]); setBroadenedShows([]); setFilteredBroadenedShows([]); setTotalResults(0);
    } finally {
      setIsSearching(false);
    }
  };

  const loadMore = async () => {
    const nextPage = currentPage + 1;
    try {
      const moreResults = await axios.get("https://api.themoviedb.org/3/search/tv", {
        params: { api_key: TMDB_API_KEY, query: query, page: nextPage },
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

  const handleCardClick = (show) => {
      setSelectedShow(show);
      setReviewText("");
      setRatingWhole(0);
      setRatingDecimal(0);
      setContainsSpoilers(false);
      setIsSubmittingReview(false);
      setReviewError(null);
      setShowSuccessReviewToast(false);
      setShowWatchedToast(false);
      setModalCanClose(true); 
  };

  const closeModal = () => {
    if (modalCanClose) {
        setSelectedShow(null);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedShowDetails) {
        setReviewError("Show details not loaded yet.");
        return;
    }
    if (!user) { 
      setReviewError("You must be logged in to submit a review.");
      return;
    }

    setIsSubmittingReview(true);
    setReviewError(null);
    setShowSuccessReviewToast(false); 
    setModalCanClose(false); 

    const reviewData = {
      showId: selectedShowDetails.id.toString(),
      rating: ratingWhole + (Number(ratingDecimal) || 0) / 100,
      content: reviewText,
      containsSpoiler: containsSpoilers,
    };

    try {
      const response = await axios.post('/api/reviews', reviewData, { withCredentials: true });

      if (response.data) { 
        setReviewText("");
        setRatingWhole(0);
        setRatingDecimal(0);
        setContainsSpoilers(false);
        
        setShowSuccessReviewToast(true); 
        setTimeout(() => {
          setSelectedShow(null); 
        }, 1800);


      } else {
        throw new Error("API did not return a successful response or data.");
      }

    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to submit review. Please try again.";
      setReviewError(errorMessage);
      setModalCanClose(true); 
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    let reviewToastTimer;
    if (showSuccessReviewToast) {
      setModalCanClose(false); 
      reviewToastTimer = setTimeout(() => {
        setShowSuccessReviewToast(false);
        if (!selectedShow) setModalCanClose(true);
      }, 2500); 
    }
    return () => clearTimeout(reviewToastTimer);
  }, [showSuccessReviewToast, selectedShow]);

  useEffect(() => {
    let watchedToastTimer;
    if (showWatchedToast) {
        setModalCanClose(false);
        watchedToastTimer = setTimeout(() => {
            setShowWatchedToast(false);
            setModalCanClose(true); 
        }, 2500);
    }
    return () => clearTimeout(watchedToastTimer);
  }, [showWatchedToast]);


  const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  
  const modalVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: "easeOut" } }, 
    exit: { opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.25, ease: "easeIn" } } 
  };

  const overlayVariants = { 
    hidden: { opacity: 0 }, 
    visible: { opacity: 1 }, 
    exit: { opacity: 0, transition: { duration: 0.25 } } 
  };

  const toastVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25, duration: 0.3 } },
    exit: { opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.3 } }
  };

  let listTitle = "";
  if (hasSearched) {
    if (exactMatches.length === 0 && filteredBroadenedShows.length === 0 && !isSearching) {
      listTitle = `No results for "${query}"`;
    }
  } else if (!isSearching && filteredBroadenedShows.length > 0) {
    listTitle = "Trending This Week";
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] py-16 px-4 pb-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-center text-[#1963da] mb-8">Log Shows</h1>
        <SearchBar query={query} setQuery={setQuery} onSearch={searchShows} isSearching={isSearching} />
        {hasSearched && (exactMatches.length > 0 || broadenedShows.length > 0) && (
          <div className="max-w-4xl mx-auto mt-6">
            <TVShowFilters shows={broadenedShows} onFilter={setFilteredBroadenedShows} />
          </div>
        )}
        {hasSearched && <div className="w-full text-center my-4"><p className="text-gray-400 inline-block">Found {totalResults} results for "{query}"</p></div>}
        <div className="mt-10">
          <div className="space-y-12">
            {exactMatches.length > 0 && (
              <section className="pt-4">
                <h2 className="text-2xl font-semibold text-[#f1f1f1] mb-6">Exact Matches</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                  {exactMatches.map((show) => (
                    <motion.div key={show.id} className="bg-zinc-900 rounded-2xl overflow-hidden shadow-lg cursor-pointer" variants={fadeInUp} initial="hidden" animate="visible" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3, ease: "easeOut" }} onClick={() => handleCardClick(show)}>
                      <img src={show.poster_path ? IMAGE_BASE_URL + show.poster_path : "https://via.placeholder.com/500x750?text=No+Image"} alt={show.name} className="w-full h-72 object-cover"/>
                      <div className="p-4">
                        <h3 className="text-white text-lg font-bold mb-2 truncate">{show.name}</h3>
                        <p className="text-gray-400 text-sm font-semibold flex items-center gap-1">
                          <AppleRatingDisplay rating={show.vote_average / 2} appleSize="w-4 h-4" />
                          {show.vote_average ? `${(show.vote_average / 2).toFixed(2)} (${show.vote_count})` : "N/A"}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
            {(filteredBroadenedShows.length > 0 || (listTitle && listTitle.startsWith("No results"))) && (
              <section className="pt-4">
                {hasSearched && exactMatches.length > 0 && filteredBroadenedShows.length > 0 && <h2 className="text-2xl font-semibold text-[#f1f1f1] mb-6">Other Results</h2>}
                {!hasSearched && filteredBroadenedShows.length > 0 && <h2 className="text-2xl font-semibold text-[#f1f1f1] mb-6">{listTitle}</h2>}
                {hasSearched && exactMatches.length === 0 && filteredBroadenedShows.length > 0 && <h2 className="text-2xl font-semibold text-[#f1f1f1] mb-6">Results</h2>}
                {listTitle && listTitle.startsWith("No results") && <p className="text-xl text-center text-gray-400 mt-8">{listTitle}</p>}
                {filteredBroadenedShows.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {filteredBroadenedShows.map((show) => (
                      <motion.div key={show.id} className="bg-zinc-900 rounded-2xl overflow-hidden shadow-lg cursor-pointer" variants={fadeInUp} initial="hidden" animate="visible" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3, ease: "easeOut" }} onClick={() => handleCardClick(show)}>
                        <img src={show.poster_path ? IMAGE_BASE_URL + show.poster_path : "https://via.placeholder.com/500x750?text=No+Image"} alt={show.name} className="w-full h-72 object-cover"/>
                        <div className="p-4">
                            <h3 className="text-white text-lg font-bold mb-2 truncate">{show.name}</h3>
                            <p className="text-gray-400 text-sm font-semibold flex items-center gap-1">
                                <AppleRatingDisplay rating={show.vote_average / 2} appleSize="w-4 h-4" />
                                {show.vote_average ? `${(show.vote_average / 2).toFixed(2)} (${show.vote_count})` : "N/A"}
                            </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            )}
            {isSearching && (!hasSearched || (exactMatches.length === 0 && filteredBroadenedShows.length === 0)) && <div className="text-center text-gray-400 py-10">Loading shows...</div>}
            {hasSearched && filteredBroadenedShows.length + exactMatches.length < totalResults && !isSearching && <div className="flex justify-center mt-8"><button className="bg-[#1963da] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={loadMore}>Load More</button></div>}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedShow && selectedShowDetails && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center z-50 p-4 pt-6 sm:pt-8 md:pt-10" 
            initial="hidden" 
            animate="visible" 
            exit="exit" 
            variants={overlayVariants} 
            onClick={closeModal}
          >
            <motion.div 
                className="bg-zinc-900 rounded-xl shadow-xl text-white w-full max-w-5xl max-h-[80vh] overflow-y-auto relative scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800" 
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={closeModal} 
                className="absolute top-6 right-6 text-gray-400 hover:text-white z-20" 
                aria-label="Close review modal"
                disabled={!modalCanClose} 
              >
                <X size={28} />
              </button>
              <div className="p-4 space-y-3">
                <div className="relative w-full rounded-lg overflow-hidden mb-4">
                  <img
                    src={selectedShowDetails.backdrop_path ? BACKDROP_BASE_URL + selectedShowDetails.backdrop_path : (selectedShowDetails.poster_path ? IMAGE_BASE_URL + selectedShowDetails.poster_path : "https://via.placeholder.com/1280x720?text=No+Image&fontsize=50")}
                    alt={selectedShowDetails.name}
                    className="w-full h-auto object-cover max-h-[50vh] block"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
                    <h2 className="text-3xl sm:text-5xl font-bold text-white text-center shadow-lg mb-[1vh] sm:mb-[2vh] lg:mb-[4vh]">
                      {selectedShowDetails.name}
                    </h2>
                  </div>
                </div>

                <div className="mt-8">
                  {isLoadingShowDetails ? (
                    <div className="text-center py-4 text-gray-400">Loading season information...</div>
                  ) : formattedShowSeasons && formattedShowSeasons.length > 0 && selectedShowDetails ? (
                    <EpisodeList 
                        seasons={formattedShowSeasons} 
                        showId={selectedShowDetails.id} 
                        isAuthenticated={isAuthenticatedForReview}
                        showName={selectedShowDetails.name}
                        posterPath={selectedShowDetails.poster_path}
                        setShowWatchedToast={setShowWatchedToast}
                        setWatchedToastMessage={setWatchedToastMessage}
                    />
                  ) : (
                    !isLoadingShowDetails && <div className="text-center py-3 text-gray-400">No season information available for this show.</div>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <form onSubmit={handleReviewSubmit} className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                      Review for "{selectedShowDetails.name}"
                    </h3>

                    <div className="mb-6">
                        <label className="block text-gray-300 mb-2 font-semibold text-lg">Rating</label>
                        <AppleRatingDisplay 
                            rating={ratingWhole + (Number(ratingDecimal) || 0) / 100} 
                            appleSize="w-8 h-8" 
                            onAppleClick={handleInteractiveAppleClick}
                            interactive={true}
                        />
                        <div className="flex items-center gap-1.5 mt-3">
                        <input type="number" min={0} max={5} value={ratingWhole} aria-label="Rating whole number" onFocus={(e) => {if (e.target.value === "0") setRatingWhole("");}} onChange={(e) => {const v=e.target.value;if(v==="")setRatingWhole("");else{const n=Number(v);if(!isNaN(n)&&n>=0&&n<=5)setRatingWhole(n);}}} onBlur={(e) => {if(e.target.value===""||e.target.value===null)setRatingWhole(0);}} className="bg-zinc-800 border-2 border-black p-2 rounded-md text-gray-200 w-15 text-center text-md focus:ring-1 focus:ring-[#1963da] outline-none"/>
                        <span className="text-gray-200 text-lg font-bold select-none">.</span>
                        <input type="number" min={0} max={99} aria-label="Rating decimal part" value={ratingDecimal} onFocus={(e)=>{if(e.target.value==="0"||e.target.value==="00")setRatingDecimal("");}} onChange={(e)=>{const v=e.target.value;if(v==="")setRatingDecimal("");else{const n=Number(v);if(!isNaN(n)&&n>=0&&n<=99&&v.length<=2)setRatingDecimal(v);}}} onBlur={(e)=>{let s=e.target.value;if(s==="")setRatingDecimal(0);else{let n=Number(s);if(s.length===1&&n<10)setRatingDecimal("0"+n);else setRatingDecimal(s);}}} disabled={ratingWhole>=5} className={`bg-zinc-800 border-2 border-black p-2 rounded-md text-gray-200 w-15 text-center text-md focus:ring-1 focus:ring-[#1963da] outline-none ${ratingWhole>=5?"opacity-50 cursor-not-allowed":""}`}/>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="review-text-modal" className="block text-gray-300 mb-2 font-semibold text-lg">Your Review</label>
                        <textarea
                            id="review-text-modal"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            className="bg-zinc-800 border-2 border-black rounded-md p-2 w-full text-gray-200 text-md focus:ring-1 focus:ring-[#1963da] outline-none resize-none"
                            rows={5}
                            maxLength={2000}
                            placeholder={`Share your thoughts about ${selectedShowDetails.name}...`}
                        />
                        <div className="flex items-center gap-2 mt-3"> 
                            <input
                                type="checkbox"
                                id="spoiler-checkbox-modal"
                                checked={containsSpoilers}
                                onChange={(e) => setContainsSpoilers(e.target.checked)}
                                className="form-checkbox h-5 w-5 text-yellow-500 bg-zinc-700 border-zinc-600 rounded focus:ring-yellow-500 focus:ring-offset-zinc-800 cursor-pointer"
                            />
                            <label htmlFor="spoiler-checkbox-modal" className="text-md text-gray-300 select-none font-medium cursor-pointer">
                                Contains Spoilers
                            </label>
                        </div>
                    </div>

                    {reviewError && (
                      <div className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-400 text-sm rounded-md">
                        {reviewError}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-4"> 
                      <motion.button
                        type="button"
                        onClick={closeModal} 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="w-full py-2.5 sm:py-3 bg-zinc-700 text-gray-300 rounded-lg hover:bg-zinc-600 transition-colors text-sm font-semibold"
                        disabled={!modalCanClose || isSubmittingReview}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        disabled={!isAuthenticatedForReview || isSubmittingReview || ((ratingWhole === 0 && Number(ratingDecimal) === 0) || !reviewText.trim())}
                        className="w-full py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingReview ? 'Submitting...' : (isAuthenticatedForReview ? 'Submit Review' : 'Login to Review')}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessReviewToast && (
            <motion.div
                key="review-success-toast"
                variants={toastVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed top-10 inset-x-0 mx-auto w-fit z-[100] bg-zinc-800 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3"
            >
                <CheckCircle size={24} />
                <span>Review Submitted!</span>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWatchedToast && (
            <motion.div
                key="watched-success-toast"
                variants={toastVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed top-10 inset-x-0 mx-auto w-fit z-[100] bg-zinc-800 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3"
            >
                <EyeIcon size={24} /> 
                <span>{watchedToastMessage}</span>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShowGrid;