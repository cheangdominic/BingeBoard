/**
 * @file AppleRating.jsx
 * @description A React component that displays a rating using apple icons,
 * supporting full, partial, and empty apple representations.
 */

// Import the Apple icon component from the lucide-react library.
import { Apple } from "lucide-react";

/**
 * @function AppleRating
 * @description A React functional component that renders a rating display using apple icons.
 * It can show full apples, a partially filled apple (for fractional ratings), and empty apples
 * to represent a rating out of 5.
 *
 * @param {object} props - The properties passed to the component.
 * @param {number} [props.rating=0] - The numerical rating value (e.g., 3.5). Defaults to 0.
 *                                    Expected to be a value between 0 and 5.
 * @returns {JSX.Element} The rendered AppleRating component.
 */
function AppleRating({ rating = 0 }) {
  // Calculate the number of full apples based on the integer part of the rating.
  const fullApples = Math.floor(rating);
  // Calculate the percentage fill for a partial apple, based on the fractional part of the rating.
  const partialFillPercent = (rating - fullApples) * 100;
  // Determine if there is a partial apple to display (i.e., if there's a fractional part).
  const hasPartialApple = partialFillPercent > 0;
  // Calculate the number of empty apples needed to complete the 5-apple scale.
  // This accounts for full apples and one potential partial apple.
  const emptyApples = 5 - fullApples - (hasPartialApple ? 1 : 0);

  /**
   * @function PartialApple
   * @description An inner React functional component responsible for rendering a single apple icon
   * that is partially filled to represent a fractional rating.
   * It overlays a filled apple (clipped to the `fillPercent`) on top of an empty apple.
   *
   * @param {object} props - The properties passed to the PartialApple component.
   * @param {number} props.fillPercent - The percentage (0-100) to fill the apple icon.
   * @returns {JSX.Element} The rendered partially filled apple icon.
   */
  const PartialApple = ({ fillPercent }) => (
    // Container for the partial apple, using relative positioning for layering.
    <div className="relative w-5 h-5 inline-block">
      {/* Base empty apple icon (gray). */}
      <Apple className="absolute top-0 left-0 w-5 h-5 text-gray-400" />
      {/* Container for the filled portion of the apple.
          Uses `overflow: hidden` and a dynamic width based on `fillPercent` to create the partial fill effect. */}
      <div className="absolute top-0 left-0 h-5 overflow-hidden" style={{ width: `${fillPercent}%` }}>
        {/* Filled apple icon (yellow), clipped by the parent div's width. */}
        <Apple className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      </div>
    </div>
  );

  // Render the container for all apple icons.
  return (
    <div className="flex gap-1">
      {/* Render the full (filled yellow) apple icons. */}
      {[...Array(fullApples)].map((_, i) => (
        <Apple key={`full-${i}`} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      ))}
      {/* Render the partial apple icon if `hasPartialApple` is true. */}
      {hasPartialApple && (
        <PartialApple key="partial" fillPercent={partialFillPercent} />
      )}
      {/* Render the empty (gray) apple icons. */}
      {[...Array(emptyApples)].map((_, i) => (
        <Apple key={`empty-${i}`} className="w-5 h-5 text-gray-400" />
      ))}
    </div>
  );
}

// Export the AppleRating component as the default export of this module.
export default AppleRating;