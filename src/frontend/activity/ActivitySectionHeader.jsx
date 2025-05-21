import React from 'react';

const ActivitySectionHeader = ({ monthYear }) => (
  <div className="w-full flex items-center mb-4 mt-2 px-2 sm:px-4">
    <div className="h-px flex-1 bg-gradient-to-r from-blue-400/30 via-gray-500/30 to-transparent" />
    <h4 className="px-4 py-1 bg-[#2E2E2E] text-white text-md sm:text-lg font-semibold rounded-full shadow border border-gray-700 mx-4">
      {monthYear}
    </h4>
    <div className="h-px flex-1 bg-gradient-to-l from-blue-400/30 via-gray-500/30 to-transparent" />
  </div>
);

export default ActivitySectionHeader;