/**
 * @file ReviewForm.js
 * @description A React component that renders a form for users to write and submit a review for a show.
 * It includes fields for rating, review content, and a spoiler warning checkbox.
 */

// Import React and useState hook for managing component state.
import { useState } from 'react';
// Import Apple and X icons from lucide-react for UI elements.
import { Apple, X } from 'lucide-react';

/**
 * @function ReviewForm
 * @description A React functional component that provides a form for submitting a review.
 *
 * @param {object} props - The properties passed to the component.
 * @param {function} props.onSubmit - Callback function invoked when the review form is submitted.
 *                                   Receives an object with `rating`, `content`, and `containsSpoiler` as an argument.
 *                                   This function is expected to be asynchronous and may throw an error.
 * @param {string} props.showTitle - The title of the show being reviewed, used in placeholders and headings.
 * @param {function} props.onCancel - Callback function invoked when the cancel button or close icon is clicked.
 * @returns {JSX.Element} The rendered ReviewForm component.
 */
export default function ReviewForm({ onSubmit, showTitle, onCancel }) {
  // State for the star rating (0-5).
  const [rating, setRating] = useState(0);
  // State for the text content of the review.
  const [content, setContent] = useState('');
  // State for the "contains spoiler" checkbox.
  const [containsSpoiler, setContainsSpoiler] = useState(false);
  // State to track if the form is currently being submitted (to disable buttons).
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State to store any error messages that occur during form submission.
  // Note: The `error` state is set but not currently displayed in the JSX.
  // It could be used to show an error message to the user if `onSubmit` throws.
  const [error, setError] = useState(null);

 /**
  * Handles the submission of the review form.
  * Prevents default form submission, sets submitting state, calls the `onSubmit` prop,
  * and resets form fields on success. Catches and sets errors from `onSubmit`.
  * @async
  * @param {React.FormEvent<HTMLFormElement>} e - The form submission event object.
  */
 const handleSubmit = async (e) => {
  e.preventDefault(); // Prevent default browser form submission.
  setError(null);     // Clear any previous errors.
  setIsSubmitting(true); // Set submitting state to true.
  try {
    // Call the onSubmit prop (passed from parent) with the review data.
    // This function is expected to handle the actual API call for submitting the review.
    await onSubmit({ rating, content, containsSpoiler });
    // If onSubmit is successful (doesn't throw), reset the form fields.
    setRating(0);
    setContent('');
    setContainsSpoiler(false);
    // Optionally, call onCancel() here if the form should close after successful submission.
  } catch (err) {
    // If onSubmit throws an error, set the error state.
    setError(err); // `err` might be an Error object or an object with error details.
    // The error is not currently displayed in the UI.
  } finally {
    // Reset submitting state regardless of success or failure.
    setIsSubmitting(false);
  }
};

  // Render the review form UI.
  return (
    // Main container for the review form with styling.
    <div className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg mb-8">
      {/* Header section: Title and close button. */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Review {showTitle}</h3> {/* Dynamic title including show name. */}
        {/* Close button for the form/modal. */}
        <button
          onClick={onCancel} // Call onCancel prop when clicked.
          className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-[#3a3a3a]"
          aria-label="Close review form" // Accessibility label.
        >
          <X className="w-5 h-5" /> {/* X icon. */}
        </button>
      </div>

      {/* The review form element. */}
      <form onSubmit={handleSubmit}>
        {/* Rating input section. */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Rating</label>
          {/* Flex container for star/apple rating buttons. */}
          <div className="flex space-x-2">
            {/* Create 5 buttons for rating, 1 to 5 stars/apples. */}
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button" // Important: `type="button"` prevents form submission.
                onClick={() => setRating(star)} // Set rating state when a star is clicked.
                // Dynamic classes for styling selected vs. unselected stars.
                className={`p-2 rounded-full transition-colors ${
                  rating >= star // If current rating is greater or equal to this star's value
                    ? 'text-yellow-400 hover:text-yellow-300' // Style for selected star.
                    : 'text-gray-500 hover:text-gray-400'    // Style for unselected star.
                }`}
                aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`} // Accessibility label.
              >
                {/* Apple icon, filled based on current rating. */}
                <Apple className="w-6 h-6" fill={rating >= star ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        {/* Review content textarea section. */}
        <div className="mb-4">
          <label htmlFor="review" className="block text-gray-300 mb-2">
            Your Review
          </label>
          <textarea
            id="review"
            value={content} // Controlled component: value bound to `content` state.
            onChange={(e) => setContent(e.target.value)} // Update `content` state on change.
            className="w-full bg-[#3a3a3a] text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" // Styling.
            rows={5} // Default number of visible text lines.
            maxLength={2000} // Maximum character limit.
            required // HTML5 required attribute.
            placeholder={`Share your thoughts about ${showTitle}...`} // Dynamic placeholder.
          />
        </div>

        {/* "Contains spoiler" checkbox section. */}
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="spoiler"
            checked={containsSpoiler} // Controlled component: checked state bound to `containsSpoiler`.
            onChange={(e) => setContainsSpoiler(e.target.checked)} // Update `containsSpoiler` state.
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" // Styling.
          />
          <label htmlFor="spoiler" className="ml-2 text-sm text-gray-300">
            Contains spoilers
          </label>
        </div>

        {/* Action buttons section: Cancel and Submit. */}
        <div className="flex space-x-3">
          {/* Cancel button. */}
          <button
            type="button"
            onClick={onCancel} // Call onCancel prop.
            className="flex-1 py-2 bg-[#3a3a3a] text-gray-300 rounded-lg hover:bg-[#4a4a4a] transition-colors"
            disabled={isSubmitting} // Disable if form is currently submitting.
          >
            Cancel
          </button>
          {/* Submit button. */}
          <button
            type="submit"
            // Disable if submitting, or if rating is 0 (not selected), or if content is empty/whitespace.
            disabled={isSubmitting || !rating || !content.trim()}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" // Dynamic styling for disabled state.
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'} {/* Dynamic button text. */}
          </button>
        </div>
        {/* Error display area - currently not implemented in JSX but `error` state exists.
            Could be added here, e.g.:
            {error && <p className="text-red-500 mt-4 text-sm">Error: {error.message || "Submission failed"}</p>}
        */}
      </form>
    </div>
  );
}