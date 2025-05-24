/**
 * @file TVShowCard.jsx
 * @description A React component that displays a card for a TV show, including its poster,
 * title (on hover), and average rating (on hover).
 */

// Import React.
import React from "react";
// Import the AppleRating component to display star/apple ratings.
import AppleRating from "./AppleRating";

/**
 * @function TVShowCard
 * @description A React functional component that renders a card for a TV show.
 * It displays the show's poster image. On hover, it reveals the show's title at the top
 * and its average rating (using apple icons) at the bottom.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string} [props.imageUrl] - The URL of the TV show's poster image.
 *                                    A fallback image is used if this is not provided.
 * @param {string} props.title - The title of the TV show.
 * @param {number|string} props.cardWidth - The width of the card (e.g., "150px" or 150).
 *                                          This is applied via an inline style.
 * @param {number} [props.averageRating] - The average rating of the TV show (e.g., out of 10, as it's divided by 2 for AppleRating).
 *                                         If not provided, rating will be shown as 0.
 * @param {function} [props.onRemove] - A callback function that could be used for a remove action.
 *                                      (Note: This prop is defined but not currently used in the component's JSX).
 * @returns {JSX.Element} The rendered TVShowCard component.
 */
function TVShowCard({ imageUrl, title, cardWidth, averageRating, onRemove }) {
  return (
    // Main container for the card, applying the specified width.
    // 'group' class is used by Tailwind CSS to enable group-hover states on child elements.
    <div className="group relative" style={{ width: cardWidth }}>
      {/* Relative container for the image and overlays to allow absolute positioning of overlays. */}
      <div className="relative rounded-lg overflow-hidden">
        {/* Image element for the TV show poster.
            Uses a fallback image if `imageUrl` is not provided. */}
        <img
          src={imageUrl || "/fallback-image.jpg"} // Use provided imageUrl or a fallback
          alt={title} // Alt text for accessibility
          className="w-full object-cover rounded-lg" // Styling: full width, cover to fill, rounded corners
        />

        {/* Top overlay for displaying the show title.
            Visible on hover over the parent 'group'.
            Animates in from the top. */}
        <div
          className="
            absolute top-0 left-0 right-0  
            bg-[#4a4a4a]/80                 
            text-white                     
            text-center                    
            text-sm                        
            py-1                            
            rounded-t-lg                  
            opacity-0 group-hover:opacity-100 
            transition-all duration-300   
            transform -translate-y-full group-hover:translate-y-0 
            z-20                          
            truncate                     
            px-3                          
            whitespace-nowrap               
          "
          title={title} // HTML title attribute for tooltip on hover (useful if text is truncated)
        >
          {title} {/* Display the show title */}
        </div>

       
        {/* Bottom overlay for displaying the average rating.
            Visible on hover over the parent 'group'.
            Animates in from the bottom. */}
        <div
          className="
            absolute bottom-0 left-0 right-0 
            bg-black/70 text-white        
            flex items-center justify-center
            py-1 text-xs                   
            opacity-0 group-hover:opacity-100 
            transition-all duration-300    
            transform translate-y-full group-hover:translate-y-0 
            z-10                        
          "
        >
          {/* AppleRating component to display the rating.
              The `averageRating` (assumed to be out of 10) is divided by 2 to fit a 0-5 scale for AppleRating. */}
          <AppleRating rating={averageRating ? averageRating / 2 : 0} />
        </div>
      </div>
      {/* `onRemove` prop is passed but not used here. If a remove button were added, it might use this.
          Example: 
          {onRemove && (
            <button onClick={() => onRemove()} className="absolute top-2 right-2 ...">Remove</button>
          )} 
      */}
    </div>
  );
}

// Export the TVShowCard component as the default export of this module.
export default TVShowCard;