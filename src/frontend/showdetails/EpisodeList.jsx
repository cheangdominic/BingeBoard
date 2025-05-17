
const formatEpisodeNumber = (num) => {
  const numStr = String(num);
  const cleanNum = numStr.replace(/[^\d]/g, '');

  return parseInt(cleanNum, 10) || 0;
}; import { useEffect, useState } from 'react';
import { FaEye, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { fetchSeasonEpisodes } from '/src/backend/tmdb';

const EpisodeList = ({ seasons, showId }) => {
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]?.number || 1);
  const [episodesBySeason, setEpisodesBySeason] = useState({});
  const [selectedEpisodes, setSelectedEpisodes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [viewAll, setViewAll] = useState(false);

  const EPISODES_LIMIT = 20; // Show more episodes by default in the grid view

  useEffect(() => {
    const loadEpisodes = async () => {
      if (!episodesBySeason[selectedSeason]) {
        try {
          const episodes = await fetchSeasonEpisodes(showId, selectedSeason);
          setEpisodesBySeason(prev => ({
            ...prev,
            [selectedSeason]: episodes
          }));
        } catch (err) {
          console.error('Failed to load episodes:', err.message);
        }
      }
    };

    loadEpisodes();
  }, [selectedSeason, showId, episodesBySeason]);

  // Reset viewAll and selectedEpisodes when changing seasons
  useEffect(() => {
    setViewAll(false);
    setSelectedEpisodes([]);
  }, [selectedSeason]);

  const episodes = episodesBySeason[selectedSeason] || [];
  const displayedEpisodes = viewAll ? episodes : episodes.slice(0, EPISODES_LIMIT);
  const hasMoreEpisodes = episodes.length > EPISODES_LIMIT;

  const handleEpisodeClick = (episodeId) => {
    setSelectedEpisodes(prev =>
      prev.includes(episodeId)
        ? prev.filter(id => id !== episodeId)
        : [...prev, episodeId]
    );
  };

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  const currentSeason = seasons.find(season => season.number === selectedSeason) || {};

  return (
    <div className="bg-gradient-to-br from-[#272733] to-[#1c1c24] rounded-xl p-6 shadow-lg border border-[#343444]">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Season {selectedSeason} Episodes</h2>
          <p className="text-blue-400 text-sm mt-1">
            {episodes.length} Episode{episodes.length !== 1 ? "s" : ""} • Select to mark as watched
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-400">
            {selectedEpisodes.length} selected
          </span>
          <button
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
            onClick={() => setSelectedSeason(seasons[0]?.number || 1)}
          >
            First Season
          </button>
        </div>
      </div>

      {/* Season Selector */}
      <div className="flex space-x-3 mb-6 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-[#3a3a3a] scrollbar-track-transparent">
        {seasons.map(season => (
          <button
            key={season.number}
            onClick={() => setSelectedSeason(season.number)}
            className={`px-5 py-2.5 rounded-lg text-sm md:text-base font-medium whitespace-nowrap transition-colors ${selectedSeason === season.number
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-[#343444] text-gray-300 hover:bg-[#3f3f52]'
              }`}
          >
            Season {season.number}
          </button>
        ))}
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-4 mb-6">
        {displayedEpisodes.map(ep => (
          <div
            key={ep.id}
            onClick={() => handleEpisodeClick(ep.id)}
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            onMouseEnter={() => isDragging && handleEpisodeClick(ep.id)}
            className={`aspect-square rounded-lg flex items-center justify-center relative cursor-pointer transition-all ${selectedEpisodes.includes(ep.id)
                ? 'bg-blue-600 border-2 border-blue-400 shadow-lg shadow-blue-500/20'
                : 'bg-[#343444] hover:bg-[#3f3f52] border border-[#4a4a5a]'
              }`}
          >
            <span className="text-sm font-medium text-gray-200">{formatEpisodeNumber(ep.number)}</span>
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
              <span className="text-sm font-bold text-yellow-400">
                {ep.rating?.toFixed(1) ?? 'N/A'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      {hasMoreEpisodes && (
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setViewAll(!viewAll)}
            className="flex items-center space-x-2 bg-[#343444] hover:bg-[#3f3f52] text-white px-6 py-2.5 rounded-lg transition-colors font-medium"
          >
            <span>{viewAll ? "Show Less" : `View All ${episodes.length} Episodes`}</span>
            {viewAll ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
          </button>
        </div>
      )}

      {/* Action Button */}
      <button
        disabled={selectedEpisodes.length === 0}
        className={`w-full py-3.5 rounded-lg font-medium flex items-center justify-center space-x-3 transition-colors text-lg ${selectedEpisodes.length > 0
            ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-lg shadow-green-500/20'
            : 'bg-[#343444] text-gray-400 cursor-not-allowed'
          }`}
      >
        <FaEye className="text-base" />
        <span>Mark Selected as Watched</span>
        {selectedEpisodes.length > 0 && (
          <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm">
            {selectedEpisodes.length}
          </span>
        )}
      </button>
    </div>
  );
};

export default EpisodeList;