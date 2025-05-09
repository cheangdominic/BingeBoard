import { useEffect, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import { fetchSeasonEpisodes } from '/src/backend/tmdb';

const EpisodeList = ({ seasons, showId }) => {
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]?.number || 1);
  const [episodesBySeason, setEpisodesBySeason] = useState({});
  const [selectedEpisodes, setSelectedEpisodes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

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

  const episodes = episodesBySeason[selectedSeason] || [];

  const handleEpisodeClick = (episodeId) => {
    setSelectedEpisodes(prev =>
      prev.includes(episodeId)
        ? prev.filter(id => id !== episodeId)
        : [...prev, episodeId]
    );
  };

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  return (
    <div className="bg-gray-800 rounded-lg p-5 shadow-md border border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-100">Episode List</h2>
        <button
          className="text-blue-400 hover:text-blue-300 text-sm"
          onClick={() => setSelectedSeason(seasons[0].number)}
        >
          View All
        </button>
      </div>

      <div className="flex space-x-2 mb-5 overflow-x-auto pb-2">
        {seasons.map(season => (
          <button
            key={season.number}
            onClick={() => setSelectedSeason(season.number)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedSeason === season.number
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Season {season.number}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3 mb-5">
        {episodes.map(ep => (
          <div
            key={ep.id}
            onClick={() => handleEpisodeClick(ep.id)}
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            onMouseEnter={() => isDragging && handleEpisodeClick(ep.id)}
            className={`aspect-square rounded-md flex items-center justify-center relative cursor-pointer transition-all ${
              selectedEpisodes.includes(ep.id)
                ? 'bg-blue-600/90 border-2 border-blue-400'
                : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
            }`}
          >
            <span className="text-xs font-medium text-gray-200">{ep.number}</span>
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md">
              <span className="text-xs font-bold text-yellow-400">
                {ep.rating?.toFixed(1) ?? 'N/A'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        disabled={selectedEpisodes.length === 0}
        className={`w-full py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
          selectedEpisodes.length > 0
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        <FaEye className="text-sm" />
        <span>Mark Selected Episodes as Watched</span>
        {selectedEpisodes.length > 0 && (
          <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
            {selectedEpisodes.length}
          </span>
        )}
      </button>
    </div>
  );
};

export default EpisodeList;
