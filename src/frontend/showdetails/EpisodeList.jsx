import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEye, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { X, CheckCircle, Eye as EyeIcon } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

const TMDB_API_KEY_EXAMPLE = import.meta.env.VITE_TMDB_API_KEY;

const fetchSeasonEpisodesFromTMDB = async (showId, seasonNumber) => {
  if (!TMDB_API_KEY_EXAMPLE) {
    console.error("TMDB API Key is not defined for fetchSeasonEpisodesFromTMDB");
    return [];
  }
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}`, {
      params: {
        api_key: TMDB_API_KEY_EXAMPLE,
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
  posterPath
}) => {
  console.log("Standalone EpisodeList - Props Received:", { seasons, showId, isAuthenticated, showName, posterPath });

  const [selectedSeason, setSelectedSeason] = useState(seasons?.[0]?.number || 1);
  const [episodesBySeason, setEpisodesBySeason] = useState({});
  const [selectedEpisodesInfo, setSelectedEpisodesInfo] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [isMarkingWatched, setIsMarkingWatched] = useState(false);

  const [showWatchedToast, setShowWatchedToast] = useState(false);
  const [watchedToastMessage, setWatchedToastMessage] = useState("");
  const [toastIsError, setToastIsError] = useState(false);

  const EPISODES_LIMIT = 20;

  useEffect(() => {
    setEpisodesBySeason({});
    setSelectedEpisodesInfo([]);
    setViewAll(false);
    setIsLoadingEpisodes(false);
    if (seasons && seasons.length > 0) {
      const firstSeasonNumber = seasons[0]?.number;
      const currentSeasonStillValid = seasons.find(s => s.number === selectedSeason);
      if (currentSeasonStillValid) {
      } else if (firstSeasonNumber) {
        setSelectedSeason(firstSeasonNumber);
      } else {
        setSelectedSeason(1);
      }
    } else {
      setSelectedSeason(1);
    }
  }, [seasons, showId]);

  useEffect(() => {
    const loadEpisodes = async () => {
      if (!selectedSeason || !showId) return;
      if (!episodesBySeason[selectedSeason]) {
        setIsLoadingEpisodes(true);
        try {
          const fetchedEpisodes = await fetchSeasonEpisodesFromTMDB(showId, selectedSeason);
          setEpisodesBySeason(prev => ({ ...prev, [selectedSeason]: fetchedEpisodes }));
        } catch (err) {
          console.error(`Failed to load episodes for season ${selectedSeason}:`, err.message);
          setEpisodesBySeason(prev => ({ ...prev, [selectedSeason]: [] }));
        } finally {
          setIsLoadingEpisodes(false);
        }
      }
    };
    if (showId && selectedSeason) {
        loadEpisodes();
    }
  }, [selectedSeason, showId, episodesBySeason]);

  useEffect(() => {
    setViewAll(false);
    setSelectedEpisodesInfo([]);
  }, [selectedSeason]);

  useEffect(() => {
    let toastTimerId;
    if (showWatchedToast) {
      toastTimerId = setTimeout(() => {
        setShowWatchedToast(false);
      }, 3000);
    }
    return () => clearTimeout(toastTimerId);
  }, [showWatchedToast]);

  const episodes = episodesBySeason[selectedSeason] || [];
  const displayedEpisodes = viewAll ? episodes : episodes.slice(0, EPISODES_LIMIT);
  const hasMoreEpisodes = episodes.length > EPISODES_LIMIT && !viewAll;

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
    if (!isAuthenticated) {
      console.warn("User not authenticated. Cannot mark as watched.");
      setWatchedToastMessage("You must be logged in to mark episodes as watched.");
      setToastIsError(true);
      setShowWatchedToast(true);
      return;
    }

    if (selectedEpisodesInfo.length === 0) {
      console.warn("Client-Side: No episodes selected. Aborting mark as watched.");
      setWatchedToastMessage("Please select at least one episode to mark as watched.");
      setToastIsError(true);
      setShowWatchedToast(true);
      return;
    }

    setIsMarkingWatched(true);
    setToastIsError(false);

    const watchedData = {
      showId: showId ? String(showId) : null,
      showName: showName || "Unknown Show",
      posterPath: posterPath === undefined ? null : posterPath,
      seasonNumber: selectedSeason,
      episodes: selectedEpisodesInfo,
    };

    console.log("Client-Side (Standalone EpisodeList): Preparing to send data for marking watched:", {
        propsReceived: { showId, showNameFromProp: showName, posterPath, isAuthenticated },
        localComponentState: { selectedSeason, selectedEpisodesInfo_count: selectedEpisodesInfo.length },
        payloadToServer: watchedData
    });

    if (!watchedData.showId || !watchedData.showName || watchedData.posterPath === undefined ||
        !watchedData.episodes || !Array.isArray(watchedData.episodes) || watchedData.episodes.length === 0) {
      console.error("Client-Side FATAL (Standalone EpisodeList): Data is incomplete or malformed just before sending.", watchedData);
      setWatchedToastMessage("Client error: Could not prepare data. Check console.");
      setToastIsError(true);
      setShowWatchedToast(true);
      setIsMarkingWatched(false);
      return;
    }

    try {
      await axios.post('/api/users/mark-watched', watchedData, { withCredentials: true });
      setWatchedToastMessage(`${selectedEpisodesInfo.length} episode(s) from ${watchedData.showName} marked as watched!`);
      setShowWatchedToast(true);
      setSelectedEpisodesInfo([]);
    } catch (error) {
      console.error("Failed to mark episodes as watched (Standalone EpisodeList):", error.response?.data || error.message, error.response);
      setWatchedToastMessage(`Error: ${error.response?.data?.message || "Could not mark episodes."}`);
      setToastIsError(true);
      setShowWatchedToast(true);
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

  const toastVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25, duration: 0.3 } },
    exit: { opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.3 } }
  };

  if (!seasons || seasons.length === 0) {
    return <div className="text-gray-400 text-center py-3">No season data available for this show.</div>;
  }

  return (
    <>
      <div className="bg-gradient-to-br from-[#272733] to-[#1c1c24] rounded-xl p-6 shadow-lg border border-[#343444]">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">Season {selectedSeason} Episodes</h2>
            <p className="text-blue-400 text-sm mt-1">
              {episodes.length} Episode{episodes.length !== 1 ? "s" : ""} • Select to mark as watched
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-400">
              {selectedEpisodesInfo.length} selected
            </span>
            <button
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
              onClick={() => setSelectedSeason(seasons[0]?.number || 1)}
              disabled={!seasons || seasons.length <=1}
            >
              First Season
            </button>
          </div>
        </div>

        <div className="flex space-x-3 mb-6 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-[#3a3a3a] scrollbar-track-transparent">
          {seasons.map(season => (
            <button
              key={season.id || season.number}
              onClick={() => setSelectedSeason(season.number)}
              className={`px-5 py-2.5 rounded-lg text-sm md:text-base font-medium whitespace-nowrap transition-colors ${selectedSeason === season.number
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
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
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-4 mb-6">
            {displayedEpisodes.map(ep => {
              const isSelected = selectedEpisodesInfo.some(selEp => selEp.id === ep.id);
              const canSelect = isAuthenticated;
              const ratingValue = typeof ep.rating === 'number' ? ep.rating : parseFloat(ep.rating);
              const displayRating = !isNaN(ratingValue) && ratingValue > 0 ? ratingValue.toFixed(1) : 'N/A';

              return (
                <div
                  key={ep.id}
                  onClick={canSelect ? () => handleEpisodeClick(ep) : undefined}
                  onMouseDown={canSelect ? handleDragStart : undefined}
                  onMouseUp={canSelect ? handleDragEnd : undefined}
                  onMouseEnter={canSelect && isDragging ? () => handleEpisodeClick(ep) : undefined}
                  className={`aspect-square rounded-lg flex items-center justify-center relative transition-all cursor-pointer
                    ${canSelect
                      ? isSelected
                        ? 'bg-blue-600 border-2 border-blue-400 shadow-lg shadow-blue-500/20'
                        : 'bg-[#343444] hover:bg-[#3f3f52] border border-[#4a4a5a]'
                      : 'bg-[#343444] border border-[#4a4a5a] cursor-not-allowed'
                    }`}
                  title={`Ep. ${formatEpisodeNumber(ep.number)}: ${ep.name || ''} - Rating: ${displayRating}`}
                >
                  <span className="text-sm font-medium text-gray-200">{formatEpisodeNumber(ep.number)}</span>
                  {canSelect && displayRating !== 'N/A' && (
                    <div className={`absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 ${isDragging && !isSelected ? '' : 'hover:opacity-100'} transition-opacity rounded-lg`}>
                      <span className="text-sm font-bold text-yellow-400">
                        {displayRating}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {hasMoreEpisodes && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setViewAll(true)}
              className="flex items-center space-x-2 bg-[#343444] hover:bg-[#3f3f52] text-white px-6 py-2.5 rounded-lg transition-colors font-medium"
            >
              <span>{`View All ${episodes.length} Episodes`}</span>
              <FaChevronDown className="text-sm" />
            </button>
          </div>
        )}
        {viewAll && episodes.length > EPISODES_LIMIT && (
            <div className="flex justify-center mb-6">
            <button
                onClick={() => setViewAll(false)}
                className="flex items-center space-x-2 bg-[#343444] hover:bg-[#3f3f52] text-white px-6 py-2.5 rounded-lg transition-colors font-medium"
            >
                <span>Show Less</span>
                <FaChevronUp className="text-sm" />
            </button>
            </div>
        )}

        {isAuthenticated && (
          <button
            onClick={handleMarkAsWatched}
            disabled={!isAuthenticated || selectedEpisodesInfo.length === 0 || isMarkingWatched}
            className={`w-full py-3.5 rounded-lg font-medium flex items-center justify-center space-x-3 transition-colors text-lg ${
                isAuthenticated && selectedEpisodesInfo.length > 0 && !isMarkingWatched
                ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-lg shadow-green-500/20'
                : 'bg-[#343444] text-gray-400 cursor-not-allowed'
              }`}
          >
            <FaEye className="text-base" />
            <span>{isMarkingWatched ? "Marking..." : "Mark Selected as Watched"}</span>
            {isAuthenticated && selectedEpisodesInfo.length > 0 && !isMarkingWatched && (
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm">
                {selectedEpisodesInfo.length}
              </span>
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showWatchedToast && (
            <motion.div
                key="episode-list-watched-toast"
                variants={toastVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`fixed top-10 inset-x-0 mx-auto w-fit z-[200] text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 ${toastIsError ? 'bg-red-600' : 'bg-zinc-900'}`}
            >
                {toastIsError ? <X size={24} /> : <EyeIcon size={24} />}
                <span>{watchedToastMessage}</span>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EpisodeList;
