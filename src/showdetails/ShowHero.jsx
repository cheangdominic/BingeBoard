import { FaThumbsUp, FaThumbsDown, FaShareAlt } from 'react-icons/fa';
import { SiNetflix, SiYoutube } from 'react-icons/si';
import backdropImg from '../assets/dragonballsuper1.jpg';
import nextEpImg from '../assets/dragonballsuper2.jpg';

const ShowHero = ({ show }) => {
  return (
    <div
      className="relative rounded-xl overflow-hidden shadow-lg text-white"
      style={{
        backgroundImage: `url(${backdropImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="bg-black bg-opacity-60 p-4 md:p-6 lg:p-8">
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded-md text-xs font-bold z-20 sm:right-4">
          {show.rating}
        </div>

        <div className="flex space-x-3 mb-3 text-lg md:text-xl">
          <button className="hover:text-green-400 transition"><FaThumbsUp /></button>
          <button className="hover:text-red-400 transition"><FaThumbsDown /></button>
          <button className="hover:text-blue-400 transition"><FaShareAlt /></button>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{show.title}</h1>
        <p className="text-xs sm:text-sm text-gray-200">
          Release: {show.releaseDate} &nbsp;|&nbsp; Status: {show.status}
        </p>
        <p className="text-xs sm:text-sm text-gray-200 mb-1 sm:mb-2">
          Creator: {show.creator}
        </p>
        <p className="text-xs sm:text-sm text-gray-300 mb-8 sm:mb-6">
          {show.seasons} Seasons &nbsp;|&nbsp; {show.episodes} Episodes
        </p>

        <div className="mb-3 sm:mb-4">
          <span className="text-xs sm:text-sm font-semibold mr-2">Where To Watch:</span>
          {show.platforms.includes('YouTube') && (
            <span className="inline-flex items-center bg-red-600 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded mr-1 sm:mr-2 text-2xs sm:text-xs">
              <SiYoutube className="mr-0.5 sm:mr-1" /> YouTube
            </span>
          )}
          {show.platforms.includes('Netflix') && (
            <span className="inline-flex items-center bg-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-2xs sm:text-xs">
              <SiNetflix className="mr-0.5 sm:mr-1 text-red-600" /> Netflix
            </span>
          )}
        </div>

        {show.nextEpisode && (
          <div className="absolute right-2 bottom-2 bg-black bg-opacity-70 border border-blue-400 rounded-lg p-1.5 w-28 sm:w-36 text-center z-10">
            <img
              src={nextEpImg}
              alt="Next episode"
              className="w-16 sm:w-20 h-auto rounded mb-1 mx-auto"
            />
            <div className="text-2xs sm:text-xs font-semibold">Next Ep:</div>
            <div className="text-sm sm:text-base font-bold">{show.nextEpisode.countdown}</div>
          </div>
        )}
      </div>  
    </div>
  );
};

export default ShowHero;