/**
 * @file ActivityCard.jsx
 * @description A React component that displays an activity related to a TV show review.
 * It shows the show's name, review date, review text (expandable), rating, and a link to the show.
 */

// Import React and the useState hook for managing component state
import React, { useState } from "react";
// Import Link component from react-router-dom for navigation
import { Link } from "react-router-dom";
// Import TVShowCard component, presumably used to display the show's image
import TVShowCard from "./TVShowCard";

/**
 * @function ActivityCard
 * @description A React functional component that renders a card displaying information
 * about a user's activity, specifically a review they've written for a TV show.
 * The review text can be expanded or collapsed by clicking on it.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string} props.showName - The name of the TV show being reviewed.
 * @param {string} props.date - The date when the review was posted or activity occurred.
 * @param {string} props.reviewText - The text content of the review.
 * @param {number} props.rating - The star rating given in the review (e.g., out of 5).
 * @param {string} props.imageUrl - The URL for the TV show's poster or image.
 * @param {string} props.showLink - The URL path to navigate to the TV show's details page.
 * @returns {JSX.Element} The rendered ActivityCard component.
 */
function ActivityCard({ showName, date, reviewText, rating, imageUrl, showLink }) {
    /**
     * State variable to control whether the review text is expanded or collapsed.
     * `expanded` is a boolean: true if expanded, false if collapsed.
     * `setExpanded` is the function to update this state.
     * @type {[boolean, function(boolean): void]}
     */
    const [expanded, setExpanded] = useState(false);

    return (
        // Main container for the activity card with styling for width, margin, background, padding, layout, border, hover effects, and shadow.
        <div className="w-full mx-2 sm:mx-5 bg-[#2E2E2E] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4 border border-gray-700/50 hover:border-blue-400/30 transition duration-300 shadow-md">
            {/* Left section containing text details: show name, date, review text, and rating. */}
            <div className="flex-1">
                {/* Container for show name and date. */}
                <div className="mb-2">
                    {/* Show name, styled with blue text, larger font size, and bold. */}
                    <p className="text-blue-400 text-xl sm:text-2xl font-semibold leading-tight">{showName}</p>
                    {/* Date of the activity/review, styled with gray text and smaller font size. */}
                    <p className="text-gray-400 text-xs sm:text-sm">{date}</p>
                </div>

                {/* Review text. Clickable to toggle expansion.
                    Uses `line-clamp-3` for a 3-line preview when not expanded. */}
                <p
                    className={`text-[#ECE6DD] text-sm sm:text-base leading-relaxed ${
                        !expanded ? "line-clamp-3" : "" // Apply line-clamp if not expanded
                    }`}
                    onClick={() => setExpanded(!expanded)} // Toggle expanded state on click
                >
                    {reviewText}
                </p>

                {/* Star rating display. */}
                <div className="flex mt-2 text-yellow-400 text-lg">
                    {/* Create 5 star icons. Filled stars (★) for rating, empty stars (☆) for the remainder. */}
                    {Array.from({ length: 5 }, (_, i) => (
                        <span key={i}>{i < rating ? "★" : "☆"}</span>
                    ))}
                </div>
            </div>

            {/* Right section displaying the TV show card/image, linked to the show's detail page.
                Includes a hover effect to slightly scale up the card. */}
            <Link to={showLink} className="flex-shrink-0 hover:scale-105 transition-transform duration-200">
                {/* TVShowCard component to display the show's image. */}
                <TVShowCard imageUrl={imageUrl} size="md" />
            </Link>
        </div>
    );
}

// Export the ActivityCard component as the default export of this module.
export default ActivityCard;