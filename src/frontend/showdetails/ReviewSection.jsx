import React, { useState } from "react";
import { Star, Filter, Flame, Clock } from "lucide-react";

const ReviewSection = ({ reviews = [] }) => {
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
    <div className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg">
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setFilter("relevant")} 
            className={`flex items-center px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${
              filter === "relevant" 
                ? "bg-blue-600 text-white" 
                : "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
            }`}
          >
            <Filter className="w-5 h-5 mr-2" /> Relevant
          </button>
          <button 
            onClick={() => setFilter("popular")} 
            className={`flex items-center px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${
              filter === "popular" 
                ? "bg-blue-600 text-white" 
                : "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
            }`}
          >
            <Flame className="w-5 h-5 mr-2" /> Popular
          </button>
          <button 
            onClick={() => setFilter("latest")} 
            className={`flex items-center px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${
              filter === "latest" 
                ? "bg-blue-600 text-white" 
                : "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
            }`}
          >
            <Clock className="w-5 h-5 mr-2" /> Latest
          </button>
        </div>
        
        {/* Spoiler Toggle */}
        <label className="flex items-center space-x-3 cursor-pointer">
          <div className="relative">
            <input 
              type="checkbox" 
              checked={showSpoilers} 
              onChange={() => setShowSpoilers(!showSpoilers)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#3a3a3a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
          <span className="text-gray-300 text-sm md:text-base">Show spoilers</span>
        </label>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div key={review.id} className="pb-6 border-b border-[#3a3a3a] last:border-0">
              {/* Review Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-blue-400 text-lg">{review.username}</span>
                  <span className="text-gray-400 text-sm">
                    {new Date(review.date).toLocaleDateString('en-US', {
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Review Content */}
              {review.containsSpoiler && !showSpoilers ? (
                <div className="bg-[#3a3a3a] p-4 rounded-lg mb-4">
                  <p className="font-bold text-gray-300 mb-1">⚠️ Spoiler Warning</p>
                  <p className="text-gray-400">This review contains spoilers. Enable "Show spoilers" to view.</p>
                </div>
              ) : (
                <p className="text-gray-300 text-base leading-relaxed mb-4">{review.content}</p>
              )}
              
              {/* Review Footer */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-gray-400">
                  {review.containsSpoiler && (
                    <span className="px-2 py-1 bg-[#3a3a3a] rounded-full text-xs">Spoiler</span>
                  )}
                </div>
                <div className="flex items-center text-gray-300">
                  <Flame className="w-5 h-5 mr-1 text-red-400" />
                  <span className="font-medium">{review.likes} likes</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400 text-lg">
            No reviews yet. Be the first to review!
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;