/**
 * @file ActivityPageHeader.js
 * @description A React component that renders the header section for the Activity Page.
 * It displays a title and a subtitle.
 */

// Import React for creating the component.
import React from 'react';

/**
 * @function ActivityPageHeader
 * @description A stateless functional React component that renders the header for the activity page.
 * This includes a main title "Activity" and a descriptive subtitle.
 *
 * @returns {JSX.Element} The rendered ActivityPageHeader component.
 */
const ActivityPageHeader = () => (
  // Main container for the header, styled for text alignment, margins, and padding.
  <div className="text-center mb-10 mt-6 px-4">
    {/* Main title "Activity".
        Styled with various Tailwind CSS classes for font size, weight, color, and a custom font.
        `relative inline-block` can be used if pseudo-elements (like underlines) were to be added via CSS. */}
    <h2 className="text-3xl sm:text-4xl font-bold text-white font-coolvetica relative inline-block">
      Activity
    </h2>
    {/* Subtitle providing a brief description of the page content.
        Styled for color, margins, font size, and constrained max width for better readability. */}
    <p className="text-gray-400 mt-2 text-sm sm:text-base max-w-md mx-auto">
      Your latest reviews and ratings.
    </p>
  </div>
);

// Export the ActivityPageHeader component as the default export of this module.
export default ActivityPageHeader;