import React, { useState } from "react";
import { Star, Filter, Flame, Clock } from "lucide-react";

const ReviewSection = ({ reviews }) => {
  const [filter, setFilter] = useState("relevant");
  const [showSpoilers, setShowSpoilers] = useState(false);

  const filteredReviews = [...reviews]
    .filter(review => !review.containsSpoiler || showSpoilers)
    .sort((a, b) => {
      if (filter === "popular") return b.likes - a.likes;
      if (filter === "latest") return new Date(b.date) - new Date(a.date);
      return (b.rating * 10 + new Date(b.date).getTime() / 100000) - 
             (a.rating * 10 + new Date(a.date).getTime() / 100000);
    });

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter("relevant")} 
            className={`flex items-center px-3 py-1 rounded-md text-sm ${
              filter === "relevant" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Filter className="w-4 h-4 mr-1" /> Relevant
          </button>
          <button 
            onClick={() => setFilter("popular")} 
            className={`flex items-center px-3 py-1 rounded-md text-sm ${
              filter === "popular" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Flame className="w-4 h-4 mr-1" /> Popular
          </button>
          <button 
            onClick={() => setFilter("latest")} 
            className={`flex items-center px-3 py-1 rounded-md text-sm ${
              filter === "latest" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Clock className="w-4 h-4 mr-1" /> Latest
          </button>
        </div>
        
        <label className="flex items-center space-x-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={showSpoilers} 
            onChange={() => setShowSpoilers(!showSpoilers)}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-300 text-sm">Show spoilers</span>
        </label>
      </div>

      <div className="space-y-6">
        {filteredReviews.map((review) => (
          <div key={review.id} className="pb-6 border-b border-gray-700 last:border-0">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-blue-400">{review.username}</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-500"}`}
                  />
                ))}
              </div>
            </div>
            
            {review.containsSpoiler && !showSpoilers ? (
              <div className="bg-gray-700 p-4 rounded-md mb-3">
                <p className="font-bold text-gray-300">Spoiler!</p>
                <p className="text-sm text-gray-400">Mark TV Show as watched to view spoiler marked comment.</p>
              </div>
            ) : (
              <p className="text-gray-300 mb-3">{review.content}</p>
            )}
            
            <div className="flex justify-between text-sm text-gray-400">
              <span>{new Date(review.date).toLocaleDateString()}</span>
              <div className="flex items-center">
                <Flame className="w-4 h-4 mr-1" />
                <span>{review.likes} likes</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;