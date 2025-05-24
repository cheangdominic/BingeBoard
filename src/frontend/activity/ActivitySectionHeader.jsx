/**
 * @file ActivitySectionHeader.js
 * @description A React component that renders a section header, typically used to display
 * a month and year for grouping activities. It includes decorative lines on either side of the text.
 */

// Import React for creating the component.
import React from 'react';

/**
 * @function ActivitySectionHeader
 * @description A stateless functional React component that renders a header for a section of activities,
 * usually displaying a month and year. It features the text centered between two horizontal lines.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string} props.monthYear - The month and year string to be displayed (e.g., "January 2023").
 * @returns {JSX.Element} The rendered ActivitySectionHeader component.
 */
const ActivitySectionHeader = ({ monthYear }) => (
  // Main container for the section header, styled as a flex row to align items.
  // Includes margin, padding, and full width.
  <div className="w-full flex items-center mb-4 mt-2 px-2 sm:px-4">
    {/* Left decorative horizontal line.
        `flex-1` makes it take up available space.
        `bg-gradient-to-r` creates a horizontal gradient that fades to transparent. */}
    <div className="h-px flex-1 bg-gradient-to-r from-blue-400/30 via-gray-500/30 to-transparent" />
    
    {/* The month and year text, styled as a pill-shaped badge.
        Includes background color, text color, font size/weight, padding, rounded corners, shadow, and border. */}
    <h4 className="px-4 py-1 bg-[#2E2E2E] text-white text-md sm:text-lg font-semibold rounded-full shadow border border-gray-700 mx-4">
      {monthYear}
    </h4>
    
    {/* Right decorative horizontal line.
        Similar to the left line, but the gradient goes from left to transparent (`bg-gradient-to-l`). */}
    <div className="h-px flex-1 bg-gradient-to-l from-blue-400/30 via-gray-500/30 to-transparent" />
  </div>
);

// Export the ActivitySectionHeader component as the default export of this module.
export default ActivitySectionHeader;