import { useState } from 'react';
import { Apple, X } from 'lucide-react';

export default function ReviewForm({ onSubmit, showTitle, onCancel }) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [containsSpoiler, setContainsSpoiler] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setIsSubmitting(true);
  try {
    await onSubmit({ rating, content, containsSpoiler });
    setRating(0);
    setContent('');
    setContainsSpoiler(false);
  } catch (err) {
    setError(err);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Review {showTitle}</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-[#3a3a3a]"
          aria-label="Close review form"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Rating</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-2 rounded-full transition-colors ${
                  rating >= star
                    ? 'text-yellow-400 hover:text-yellow-300'
                    : 'text-gray-500 hover:text-gray-400'
                }`}
                aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              >
                <Apple className="w-6 h-6" fill={rating >= star ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="review" className="block text-gray-300 mb-2">
            Your Review
          </label>
          <textarea
            id="review"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-[#3a3a3a] text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            maxLength={2000}
            required
            placeholder={`Share your thoughts about ${showTitle}...`}
          />
        </div>

        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="spoiler"
            checked={containsSpoiler}
            onChange={(e) => setContainsSpoiler(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="spoiler" className="ml-2 text-sm text-gray-300">
            Contains spoilers
          </label>
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 bg-[#3a3a3a] text-gray-300 rounded-lg hover:bg-[#4a4a4a] transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !rating || !content}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}