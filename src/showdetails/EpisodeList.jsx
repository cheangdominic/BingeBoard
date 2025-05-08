import { useState } from 'react';
import { FaCheck, FaEye } from 'react-icons/fa';

const EpisodeList = ({ seasons }) => {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisodes, setSelectedEpisodes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const episodes = [
    { id: 1, rating: 7.3 },
    { id: 2, rating: 8.7 },
    { id: 3, rating: 9.4 },
    { id: 4, rating: 6.5 },
    { id: 5, rating: 8.0 },
    { id: 6, rating: 7.1 },
    { id: 7, rating: 9.0 },
    { id: 8, rating: 8.2 },
    { id: 9, rating: 7.8 },
    { id: 10, rating: 8.5 },
  ];

  const handleEpisodeClick = (episodeId) => {
    if (selectedEpisodes.includes(episodeId)) {
      setSelectedEpisodes(selectedEpisodes.filter(id => id !== episodeId));
    } else {
      setSelectedEpisodes([...selectedEpisodes, episodeId]);
    }
  };

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  return (
    <div className="bg-gray-800 rounded-lg p-5 shadow-md border border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-100">Episode List</h2>
        <button className="text-blue-400 hover:text-blue-300 text-sm">
          View All
        </button>
      </div>

      <div className="flex space-x-2 mb-5 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map(season => (
          <button
            key={season}
            onClick={() => setSelectedSeason(season)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedSeason === season
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Season {season}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3 mb-5">
        {episodes.map(episode => (
          <div
            key={episode.id}
            onClick={() => handleEpisodeClick(episode.id)}
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            onMouseEnter={() => isDragging && handleEpisodeClick(episode.id)}
            className={`aspect-square rounded-md flex items-center justify-center relative cursor-pointer transition-all ${
              selectedEpisodes.includes(episode.id)
                ? 'bg-blue-600/90 border-2 border-blue-400'
                : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
            }`}
          >
            <span className="text-xs font-medium text-gray-200">
              {episode.id}
            </span>

            <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md">
              <span className="text-xs font-bold text-yellow-400">
                {episode.rating}
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