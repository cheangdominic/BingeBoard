import React, { useState, useEffect } from "react";
import { Star, ChevronDown } from "lucide-react";
import { fetchSeasonEpisodes } from '/src/backend/tmdb';

const EpisodeListView = ({ seasons = [], showId }) => {
  const [activeSeason, setActiveSeason] = useState(seasons[0]?.number || 1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedEpisode, setExpandedEpisode] = useState(null);
  const [episodesBySeason, setEpisodesBySeason] = useState({});
  const [loading, setLoading] = useState(false);

  const currentSeason = seasons.find(season => season.number === activeSeason) || {};
  const episodes = episodesBySeason[activeSeason] || [];

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

  const displayRating = (rating) => {
    return typeof rating === "number" ? rating.toFixed(1) : "N/A";
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-between w-full md:w-64 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-md transition-colors"
        >
          <span>Season {activeSeason}</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute z-10 mt-1 w-full md:w-64 bg-gray-800 rounded-md shadow-lg border border-gray-700">
            {seasons.map((season) => (
              <button
                key={season.number}
                onClick={() => {
                  setActiveSeason(season.number);
                  setIsDropdownOpen(false);
                  setExpandedEpisode(null);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${
                  activeSeason === season.number ? "text-blue-400" : "text-white"
                }`}
              >
                Season {season.number} • {season.episodeCount || 0} episodes
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Season {currentSeason.number}</h1>
            <div className="flex items-center text-gray-400">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="font-medium">{displayRating(currentSeason.rating)}</span>
            </div>
          </div>
          <p className="text-gray-400 mt-1">
            {episodes.length} Episode{episodes.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading episodes...</div>
        ) : episodes.length > 0 ? (
          <div className="space-y-3">
            {episodes.map((episode) => (
              <div
                key={episode.id}
                className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden hover:border-gray-500 transition-colors"
              >
                <div
                  className="p-4 cursor-pointer flex justify-between items-start"
                  onClick={() => setExpandedEpisode(expandedEpisode === episode.id ? null : episode.id)}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Episode {episode.number} • {episode.title || "Untitled Episode"}
                    </h3>
                    <div className="flex items-center mt-1 space-x-4">
                      <p className="text-gray-300">{episode.duration || "Duration N/A"}</p>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="text-sm font-medium text-white">{displayRating(episode.rating)}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedEpisode === episode.id ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {expandedEpisode === episode.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-600">
                    <p className="text-gray-300">{episode.overview || "No description available"}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">No episodes found for this season</div>
        )}
      </div>
    </div>
  );
};

export default EpisodeListView;
