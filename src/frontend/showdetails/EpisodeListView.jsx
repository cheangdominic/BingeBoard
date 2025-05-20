import React, { useState, useEffect } from "react";
import { Star, ChevronDown } from "lucide-react";
import { fetchSeasonEpisodes } from '/src/backend/tmdb';

const EpisodeListView = ({ seasons = [], showId }) => {
  const [activeSeason, setActiveSeason] = useState(seasons[0]?.number || 1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedEpisode, setExpandedEpisode] = useState(null);
  const [episodesBySeason, setEpisodesBySeason] = useState({});
  const [loading, setLoading] = useState(false);
  const [viewAll, setViewAll] = useState(false);

  const EPISODES_LIMIT = 10;

  const currentSeason = seasons.find(season => season.number === activeSeason) || {};
  const episodes = episodesBySeason[activeSeason] || [];
  const displayedEpisodes = viewAll ? episodes : episodes.slice(0, EPISODES_LIMIT);
  const hasMoreEpisodes = episodes.length > EPISODES_LIMIT;

  useEffect(() => {
    const loadEpisodes = async () => {
      if (!episodesBySeason[activeSeason]) {
        setLoading(true);
        try {
          const episodes = await fetchSeasonEpisodes(showId, activeSeason);
          setEpisodesBySeason(prev => ({
            ...prev,
            [activeSeason]: episodes
          }));
        } catch (err) {
          console.error("Failed to load episodes:", err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    loadEpisodes();
  }, [activeSeason, showId, episodesBySeason]);

  useEffect(() => {
    setViewAll(false);
  }, [activeSeason]);

  const displayRating = (rating) => {
    return (typeof rating === "number" && rating > 0) ? rating.toFixed(1) : "N/A";
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Season Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-between w-full md:w-72 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white px-5 py-3 rounded-xl transition-colors"
        >
          <span className="font-medium">Season {activeSeason}</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute z-10 mt-2 w-full md:w-72 bg-[#2a2a2a] rounded-xl shadow-lg border border-[#3a3a3a]">
            {seasons.map((season) => (
              <button
                key={season.number}
                onClick={() => {
                  setActiveSeason(season.number);
                  setIsDropdownOpen(false);
                  setExpandedEpisode(null);
                }}
                className={`w-full text-left px-5 py-3 hover:bg-[#3a3a3a] transition-colors ${activeSeason === season.number ? "text-blue-400 font-medium" : "text-gray-300"
                  }`}
              >
                Season {season.number} • {season.episodeCount || 0} episodes
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Season Content */}
      <div className="bg-[#2a2a2a] p-6 rounded-xl shadow-lg">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Season {currentSeason.number}</h1>
            <div className="flex items-center text-gray-300">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
              <span className="font-medium">{displayRating(currentSeason.rating)}</span>
            </div>
          </div>
          <p className="text-gray-400 mt-2">
            {episodes.length} Episode{episodes.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400 text-lg">Loading episodes...</div>
        ) : episodes.length > 0 ? (
          <div className="space-y-4">
            {displayedEpisodes.map((episode) => (
              <div
                key={episode.id}
                className="bg-[#3a3a3a] rounded-xl border border-[#4a4a4a] overflow-hidden hover:border-[#5a5a5a] transition-colors"
              >
                <div
                  className="p-5 cursor-pointer flex justify-between items-start"
                  onClick={() => setExpandedEpisode(expandedEpisode === episode.id ? null : episode.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="text-blue-400 font-medium">Episode {episode.number}</span>
                      {(episode.rating > 0) && (
                        <div className="flex items-center bg-[#2a2a2a] px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                          <span className="text-sm font-medium text-white">
                            {displayRating(episode.rating)}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {episode.title || "Untitled Episode"}
                    </h3>
                    <p className="text-gray-400 mt-1">{episode.duration || "Duration N/A"}</p>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedEpisode === episode.id ? "rotate-180" : ""
                      }`}
                  />
                </div>

                {expandedEpisode === episode.id && (
                  <div className="px-5 pb-5 pt-3 border-t border-[#4a4a4a]">
                    <p className="text-gray-300 text-base leading-relaxed">
                      {episode.overview || "No description available"}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* View All Episodes Button */}
            {hasMoreEpisodes && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setViewAll(!viewAll)}
                  className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white px-6 py-3 rounded-xl transition-colors font-medium"
                >
                  {viewAll ? "Show Less" : `View All ${episodes.length} Episodes`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 text-lg">No episodes found for this season</div>
        )}
      </div>
    </div>
  );
};

export default EpisodeListView;