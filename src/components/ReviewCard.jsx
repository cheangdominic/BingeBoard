import AppleRatingDisplay from './AppleRatingDisplay';

export default function ReviewCard({ 
  user, 
  date, 
  reviewText, 
  rating, 
  imageUrl,
  showName,
  showId,
  containsSpoiler
}) {
  const displayRatingText = typeof rating === 'number' ? rating.toFixed(2) : parseFloat(rating || 0).toFixed(2);


  return (
    <div className="flex-shrink-0 w-[300px] h-[500px] bg-[#2a2a2a] rounded-lg p-4 flex flex-col shadow-lg">
      <div className="flex items-center gap-3 h-16">
        <img 
          src={user?.profilePhoto || "/img/profilePhotos/generic_profile_picture.jpg"} 
          alt={user?.username || "User"}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="text-white font-semibold">@{user?.username || "Anonymous"}</p>
          <p className="text-gray-400 text-xs">{date}</p>
        </div>
      </div>

      <div className="h-8 flex items-center">
        {containsSpoiler && (
          <div className="bg-yellow-900 text-yellow-200 text-xs px-2 py-1 rounded self-start">
            Contains Spoilers
          </div>
        )}
      </div>

      <div className="h-8 my-1 flex items-center">
        <AppleRatingDisplay rating={rating} appleSize="w-5 h-5" />
        <span className="ml-2 text-sm text-gray-400">{displayRatingText}/5</span>
      </div>

      <div className="h-20 overflow-y-auto mb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        <p className="text-gray-300 text-sm">
          {reviewText}
        </p>
      </div>
      
      {showName && showId && (
        <a href={`/show/${showId}`} className="h-8 mb-2 text-white font-medium text-sm truncate hover:underline">
          {showName}
        </a>
      )}
      {!showName && showId && (
         <p className="h-8 mb-2 text-white font-medium text-sm truncate">Show ID: {showId}</p>
      )}
      
      <div className="flex-grow mt-auto overflow-hidden rounded-lg">
        <img 
          src={imageUrl || "/img/no-poster.png"} 
          alt={showName || "Show poster"} 
          className="w-full h-64 object-cover rounded-lg"
        />
      </div>
    </div>
  );
}