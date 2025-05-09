import { useState, useEffect } from 'react'; 
import { useParams } from 'react-router-dom'; 
import { fetchTVShow } from '/src/backend/tmdb';
import ShowHero from './ShowHero';
import ShowDescription from './ShowDescription';
import EpisodeList from './EpisodeList';
import EpisodeListView from './EpisodeListView';
import ReviewSection from './ReviewSection';

const ShowDetailsPage = () => {
  const { id } = useParams(); 
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatCountdown = (airDate) => {
    if (!airDate) return 'Coming soon';
    const now = new Date();
    const airDateObj = new Date(airDate);
    const diffTime = airDateObj - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days` : 'Available now';
  };

  const getPlatforms = (tmdbData) => {
    const networks = tmdbData.networks?.map(n => n.name) || [];
    const providers = tmdbData['watch/providers']?.results?.US?.flatrate?.map(p => p.provider_name) || [];
    return [...new Set([...networks, ...providers])];
  };

  useEffect(() => {
  const loadShow = async () => {
    try {
      console.log("Fetching show with ID:", id);
      const showData = await fetchTVShow(id);
      console.log("API Response:", showData);
      setShow(formatShowData(showData));
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false); 
    }
  };
  loadShow();
}, [id]);

  const formatShowData = (tmdbData) => ({
    title: tmdbData.name,
    releaseDate: tmdbData.first_air_date,
    description: tmdbData.overview,
    status: tmdbData.status,
    creator: tmdbData.created_by?.map(c => c.name).join(', ') || 'Unknown',
    rating: (tmdbData.content_ratings?.results.find(r => r.iso_3166_1 === 'US') || {}).rating || 'TV-MA',
    platforms: getPlatforms(tmdbData),
    seasons: tmdbData.seasons?.filter(s => s.season_number > 0).map(season => ({
      number: season.season_number,
      episodes: [], 
      episodeCount: season.episode_count
    })) || [],
    nextEpisode: tmdbData.next_episode_to_air ? {
      countdown: formatCountdown(tmdbData.next_episode_to_air.air_date)
    } : null,
    seasonsData: tmdbData.seasons || [], 
    reviews: [],
    backdropUrl: tmdbData.backdrop_path ? `https://image.tmdb.org/t/p/w500${tmdbData.backdrop_path}` : '/fallback.jpg', // Ensure backdropUrl is correctly set
  });

  if (loading) return <div className="text-white p-10">Loading...</div>;
  if (!show) return <div className="text-white p-10">Show not found</div>;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-6 max-w-8xl mx-auto space-y-6">
        <ShowHero show={show} isLoading={loading} />
        <ShowDescription show={show} />
        <EpisodeList seasons={show.seasons} showId={id}/>
        <EpisodeListView seasons={show.seasons} showId={id}/>
        <ReviewSection reviews={show.reviews} />
      </div>
    </div>
  );
};

export default ShowDetailsPage;
