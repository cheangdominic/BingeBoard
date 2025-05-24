/**
 * @file ShowHero.js
 * @description A React component that displays the hero section for a TV show's details page.
 * It includes the show's backdrop image, title, release information, status, creator,
 * rating, season/episode count, available platforms, and a countdown to the next episode.
 * It also features placeholder like/dislike/share buttons.
 */

// Import icons from react-icons (for like/dislike/share) and react-icons/si (for platform logos).
import { FaThumbsUp, FaThumbsDown, FaShareAlt } from 'react-icons/fa';
import { SiNetflix, SiYoutube, SiHbo, SiCrunchyroll } from 'react-icons/si';

/**
 * @function ShowHero
 * @description A React functional component that renders the hero section for a TV show.
 * It displays key information about the show overlaid on its backdrop image.
 * Includes a loading skeleton state.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} props.show - The TV show data object. Expected to contain fields like `title`,
 *                              `releaseDate`, `status`, `creator`, `rating` (content rating),
 *                              `platforms`, `seasons`, `nextEpisode`, and `backdropUrl`.
 * @param {boolean} props.isLoading - Boolean indicating if the show data is currently loading.
 *                                    If true, a skeleton loader is displayed.
 * @returns {JSX.Element} The rendered ShowHero component or its loading skeleton.
 */
const ShowHero = ({ show, isLoading }) => {
  // If `isLoading` is true, render a skeleton loader UI.
  if (isLoading) {
    return (
      // Skeleton container with animation.
      <div className="relative rounded-xl overflow-hidden shadow-lg text-white min-h-[400px] bg-gray-800 animate-pulse">
        {/* Inner container for positioning skeleton elements. */}
        <div className="bg-black bg-opacity-60 p-6 h-full flex flex-col justify-end">
          {/* Placeholder elements for text content. */}
          <div className="space-y-3">
            <div className="h-8 w-3/4 bg-gray-700 rounded"></div> {/* Placeholder for title */}
            <div className="h-4 w-1/2 bg-gray-700 rounded"></div> {/* Placeholder for subtitle/info */}
            <div className="h-4 w-1/3 bg-gray-700 rounded"></div> {/* Placeholder for more info */}
          </div>
        </div>
      </div>
    );
  }

  // Destructure properties from the `show` object with default fallbacks to prevent errors if data is missing.
  const {
    title = 'Unknown Title',        // Show title
    releaseDate = 'Unknown',        // First air date
    status = 'Unknown',             // Show status (e.g., "Returning Series")
    creator = 'Unknown',            // Creator(s)
    rating = 'NR',                  // Content rating (e.g., "TV-MA")
    platforms = [],                 // Array of platforms/networks
    seasons = [],                   // Array of season objects
    nextEpisode = null,             // Object with next episode info, or null
    backdropUrl = '/fallback.jpg',  // URL for the backdrop image, with a fallback
  } = show; // `show` object itself is destructured from props.

  // Check for specific streaming platforms by case-insensitive search in the `platforms` array.
  const hasNetflix = platforms.some(p => p.toLowerCase().includes('netflix'));
  const hasYouTube = platforms.some(p => p.toLowerCase().includes('youtube'));
  const hasHBO = platforms.some(p => p.toLowerCase().includes('hbo')); // Or Max
  const hasCrunchyroll = platforms.some(p => p.toLowerCase().includes('crunchyroll'));

  // Construct the final image URL.
  // If `backdropUrl` is already a full HTTP/HTTPS URL, use it directly.
  // Otherwise, assume it's a relative path and prepend `/public` (this might need adjustment based on actual asset serving setup).
  // A more robust solution might involve checking if it starts with '/' for relative paths within the app's public folder
  // or directly using the TMDB base URL if `backdropUrl` is just the path component.
  const imageUrl = backdropUrl.startsWith('http') ? backdropUrl : `/public${backdropUrl}`; // This `/public` prefix might be specific to a certain setup (e.g., Vite or Next.js with public folder).

  // Render the hero section.
  return (
    // Main container for the hero section, styled with background image and gradient overlay.
    <div
      className="relative rounded-xl overflow-hidden shadow-lg text-white min-h-[400px]" // Min height to ensure visibility.
      style={{
        // Apply background image using inline style.
        // A linear gradient overlay is applied on top of the image for better text readability.
        backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%), url(${imageUrl})`,
        backgroundSize: 'cover',       // Ensure image covers the container.
        backgroundPosition: 'center',  // Center the image.
      }}
    >
      {/* Additional gradient overlay from bottom to transparent, enhancing readability of bottom content. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

      {/* Container for all textual content and interactive elements, positioned relatively. */}
      {/* `z-10` ensures content is above the gradient overlays. */}
      {/* `justify-end` pushes content to the bottom of the hero section. */}
      <div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-6 lg:p-8">
        {/* Content rating badge, positioned at the top-right. */}
        <div className="absolute top-4 right-4 bg-black/80 px-3 py-1 rounded-full text-xs font-bold">
          {rating}
        </div>

        {/* Placeholder social interaction buttons (Like, Dislike, Share). */}
        {/* These are currently non-functional and for display. */}
        <div className="flex space-x-4 mb-4 text-xl">
          <button className="hover:text-green-400 transition"><FaThumbsUp /></button>
          <button className="hover:text-red-400 transition"><FaThumbsDown /></button>
          <button className="hover:text-blue-400 transition"><FaShareAlt /></button>
        </div>

        {/* Show title. */}
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
        {/* Release date and status. */}
        <p className="text-sm text-gray-200 mb-1">
          Release: {new Date(releaseDate).toLocaleDateString()} • Status: {status} {/* Format date string. */}
        </p>
        {/* Creator(s). */}
        <p className="text-sm text-gray-200 mb-3">Creator: {creator}</p>
        {/* Season and episode count. */}
        <p className="text-sm text-gray-300 mb-6">
          {seasons.length} Season{seasons.length !== 1 ? 's' : ''}{' '} {/* Handle pluralization for "Season(s)". */}
          • {seasons.reduce((sum, s) => sum + (s.episodeCount || 0), 0)} Episode{seasons.reduce((sum, s) => sum + (s.episodeCount || 0), 0) !== 1 ? 's' : ''} {/* Sum episode counts from all seasons, handle pluralization. */}
        </p>

        {/* "Where To Watch" section displaying platform logos. */}
        <div className="flex flex-wrap gap-2 items-center mb-4">
          <span className="text-sm font-semibold mr-2">Where To Watch:</span>
          {/* Conditionally render platform badges if the show is available on them. */}
          {hasYouTube && (
            <span className="inline-flex items-center bg-red-600 px-2 py-1 rounded text-xs">
              <SiYoutube className="mr-1" /> YouTube
            </span>
          )}
          {hasNetflix && (
            <span className="inline-flex items-center bg-black px-2 py-1 rounded text-xs">
              <SiNetflix className="mr-1 text-red-600" /> Netflix {/* Netflix icon with its brand red color. */}
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
          {/* A message if no specific platform badges are shown (e.g., if platforms array is empty or no matches).
              This could be enhanced to list all platforms from `show.platforms` if none match the specific checks.
              Example:
              {platforms.length === 0 && !hasNetflix && !hasYouTube && !hasHBO && !hasCrunchyroll && (
                <span className="text-xs text-gray-400">Not specified</span>
              )}
          */}
        </div>

        {/* "Next Episode" countdown, displayed if `nextEpisode` data exists. */}
        {/* Positioned at the bottom-right of the hero section. */}
        {nextEpisode && (
          <div className="absolute right-4 bottom-4 bg-black/80 border border-blue-400 rounded-lg p-3 w-40 text-center">
            <div className="text-xs font-semibold mb-1">Next Episode:</div>
            <div className="text-sm font-bold">{nextEpisode.countdown}</div> {/* Display formatted countdown string. */}
          </div>
        )}
      </div>
    </div>
  );
};

// Export the ShowHero component as the default export of this module.
export default ShowHero;