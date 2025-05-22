import React, { useEffect, useState } from "react";
import TVShowCard from "../../components/TVShowCard"; 
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import axios from "axios";

function RecentlyWatched({ userId, username, isOwnProfile, activities }) {
  const [recentShows, setRecentShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentlyWatched = async () => {
      try {
        setLoading(true);
        let watchActivities = [];

        if (isOwnProfile) {
          const response = await fetch('/api/activities', {
            credentials: "include"
          });

          if (!response.ok) {
            throw new Error('Failed to fetch activities');
          }

          const data = await response.json();
          watchActivities = data;
        } else {
          watchActivities = activities || [];
        }

        const watchlistAddActivities = watchActivities
          .filter(activity => activity.action === 'watchlist_add')
          .slice(0, 5); 

        if (watchlistAddActivities.length === 0) {
          setRecentShows([]);
          return;
        }

        const uniqueShowIds = [...new Set(watchlistAddActivities.map(activity => activity.targetId))];

        const showPromises = uniqueShowIds.slice(0, 5).map(async (showId) => {
          try {
            const tmdbResponse = await axios.get(`https://api.themoviedb.org/3/tv/${showId}`, {
              params: {
                api_key: process.env.VITE_TMDB_API_KEY || import.meta.env.VITE_TMDB_API_KEY
              },
              timeout: 5000
            });

            return {
              id: showId,
              name: tmdbResponse.data.name || tmdbResponse.data.original_name,
              imageUrl: tmdbResponse.data.poster_path 
                ? `https://image.tmdb.org/t/p/w300${tmdbResponse.data.poster_path}`
                : "https://via.placeholder.com/300x450",
              overview: tmdbResponse.data.overview,
              vote_average: tmdbResponse.data.vote_average,
              number_of_seasons: tmdbResponse.data.number_of_seasons || 0,
              number_of_episodes: tmdbResponse.data.number_of_episodes || 0
            };
          } catch (apiError) {
            console.error(`Failed to fetch show details for ID ${showId}:`, apiError);
            return {
              id: showId,
              name: `Show ${showId}`,
              imageUrl: "https://via.placeholder.com/300x450",
              overview: "No description available",
              vote_average: 0,
              number_of_seasons: 0,
              number_of_episodes: 0
            };
          }
        });

        const shows = await Promise.all(showPromises);
        setRecentShows(shows);
      } catch (err) {
        console.error("Error fetching recently watched:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyWatched();
  }, [userId, username, isOwnProfile, activities]);

  if (loading) {
    return <LoadingSpinner small={true} />;
  }

  if (error) {
    return <div className="text-red-500">Error loading recently watched: {error}</div>;
  }

  return (
    <section className="mx-auto w-[97vw] sm:w-[97.5vw] mt-2 sm:mt-3 text-white">
      <div className="flex justify-between items-center mb-4 px-4 pt-3">
        <h3 className="text-xl font-bold">
          {isOwnProfile ? 'Recently Watched' : `${username}'s Recently Watched`}
        </h3>
        {isOwnProfile && (
          <button
            onClick={() => navigate('/profile/recently-watched')}
            className="text-sm text-blue-400 hover:underline"
          >
            View All
          </button>
        )}
      </div>

      {recentShows.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          {isOwnProfile
            ? "No recently watched shows yet."
            : `${username} hasn't watched anything recently.`
          }
        </div>
      ) : (
        <div className="flex overflow-x-auto space-x-4 pb-2 px-4 scroll-smooth">
          {recentShows.map((show) => (
            <TVShowCard
              key={show.id}
              imageUrl={show.imageUrl}
              title={show.name}
              averageRating={show.vote_average}
              cardWidth="150px"
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentlyWatched;