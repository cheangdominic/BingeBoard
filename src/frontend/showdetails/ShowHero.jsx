import { FaThumbsUp, FaThumbsDown, FaShareAlt } from 'react-icons/fa';
import { SiNetflix, SiYoutube, SiHbo, SiCrunchyroll } from 'react-icons/si';

const ShowHero = ({ show, isLoading }) => {
  if (isLoading) {
    return (
      <div className="relative rounded-xl overflow-hidden shadow-lg text-white min-h-[400px] bg-gray-800 animate-pulse">
        <div className="bg-black bg-opacity-60 p-6 h-full flex flex-col justify-end">
          <div className="space-y-3">
            <div className="h-8 w-3/4 bg-gray-700 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-700 rounded"></div>
            <div className="h-4 w-1/3 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const {
    title = 'Unknown Title',
    releaseDate = 'Unknown',
    status = 'Unknown',
    creator = 'Unknown',
    rating = 'NR',
    platforms = [],
    seasons = [],
    nextEpisode = null,
    backdropUrl = '/fallback.jpg', 
  } = show;

  const hasNetflix = platforms.some(p => p.toLowerCase().includes('netflix'));
  const hasYouTube = platforms.some(p => p.toLowerCase().includes('youtube'));
  const hasHBO = platforms.some(p => p.toLowerCase().includes('hbo'));
  const hasCrunchyroll = platforms.some(p => p.toLowerCase().includes('crunchyroll'));


  const imageUrl = backdropUrl.startsWith('http') ? backdropUrl : `/public${backdropUrl}`;

  return (
    <div
      className="relative rounded-xl overflow-hidden shadow-lg text-white min-h-[400px]"
      style={{
        backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%), url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

      <div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-6 lg:p-8">
        <div className="absolute top-4 right-4 bg-black/80 px-3 py-1 rounded-full text-xs font-bold">
          {rating}
        </div>

        <div className="flex space-x-4 mb-4 text-xl">
          <button className="hover:text-green-400 transition"><FaThumbsUp /></button>
          <button className="hover:text-red-400 transition"><FaThumbsDown /></button>
          <button className="hover:text-blue-400 transition"><FaShareAlt /></button>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
        <p className="text-sm text-gray-200 mb-1">
          Release: {new Date(releaseDate).toLocaleDateString()} • Status: {status}
        </p>
        <p className="text-sm text-gray-200 mb-3">Creator: {creator}</p>
        <p className="text-sm text-gray-300 mb-6">
          {seasons.length} Season{seasons.length !== 1 ? 's' : ''}{' '}
          • {seasons.reduce((sum, s) => sum + s.episodeCount, 0)} Episode{seasons.length !== 1 ? 's' : ''}
        </p>

        <div className="flex flex-wrap gap-2 items-center mb-4">
          <span className="text-sm font-semibold mr-2">Where To Watch:</span>
          {hasYouTube && (
            <span className="inline-flex items-center bg-red-600 px-2 py-1 rounded text-xs">
              <SiYoutube className="mr-1" /> YouTube
            </span>
          )}
          {hasNetflix && (
            <span className="inline-flex items-center bg-black px-2 py-1 rounded text-xs">
              <SiNetflix className="mr-1 text-red-600" /> Netflix
            </span>
          )}
          {hasHBO && (
            <span className="inline-flex items-center bg-purple-900 px-2 py-1 rounded text-xs">
              <SiHbo className="mr-1" /> HBO
            </span>
          )}
          {hasCrunchyroll && (
            <span className="inline-flex items-center bg-blue-800 px-2 py-1 rounded text-xs">
              <SiCrunchyroll className="mr-1" /> Crunchyroll
            </span>
          )}
        </div>

        {nextEpisode && (
          <div className="absolute right-4 bottom-4 bg-black/80 border border-blue-400 rounded-lg p-3 w-40 text-center">
            <div className="text-xs font-semibold mb-1">Next Episode:</div>
            <div className="text-sm font-bold">{nextEpisode.countdown}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowHero;
