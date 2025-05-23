/**
 * @file LocationBox.js
 * @description A React component that fetches and displays the user's approximate geolocation,
 * local time, and timezone information using an external geolocation API.
 */

// Import React, and the useEffect and useState hooks from the 'react' library.
import React, { useEffect, useState } from "react";

/**
 * @function LocationBox
 * @description A functional React component that fetches geolocation data based on the user's IP address
 * and displays the country, city, local time, and timezone.
 *
 * @returns {JSX.Element} The rendered LocationBox component, showing either loading text
 * or the fetched location details.
 */
const LocationBox = () => {
  /**
   * State variable to store the fetched location data.
   * Initialized to `null` until the data is fetched.
   * When populated, it will be an object with properties like city, country, timezone, time, and timezoneName.
   * @type {[object | null, function(object | null): void]}
   */
  const [location, setLocation] = useState(null);

  /**
   * `useEffect` hook to fetch location data when the component mounts.
   * The empty dependency array `[]` ensures this effect runs only once after the initial render.
   */
  useEffect(() => {
    // Fetch geolocation data from the geolocation-db.com API.
    fetch("https://geolocation-db.com/json/")
      .then((res) => res.json()) // Parse the response as JSON.
      .then((data) => {
        // Format the current time according to the fetched timezone.
        const timeString = new Date().toLocaleTimeString(undefined, { // 'undefined' uses default locale
          timeZone: data.timezone, // Use the timezone from the API response
          timeStyle: "short",      // Format as short time (e.g., 10:30 AM)
        });

        // Get the full timezone name string (e.g., "Pacific Daylight Time").
        const tzString = new Date().toLocaleDateString(undefined, { // 'undefined' uses default locale
          timeZone: data.timezone,     // Use the timezone from the API response
          timeZoneName: "long",        // Request the long version of the timezone name
        });

        // Update the location state with the fetched and formatted data.
        setLocation({
          city: data.city,                           // City name from API
          country: data.country_name,                // Country name from API
          timezone: data.timezone,                   // IANA timezone identifier (e.g., "America/Los_Angeles")
          time: timeString,                          // Formatted local time string
          timezoneName: tzString.split(", ")[1],      // Extract the timezone name part (e.g., "Pacific Daylight Time")
                                                     // This split assumes the format "M/D/YYYY, Timezone Name"
        });
      })
      .catch((err) => console.error("Failed to fetch location:", err)); // Log any errors during the fetch operation.
  }, []); // Empty dependency array means this effect runs once on mount.

  // Render the component.
  return (
    // Main container div for the location box with styling.
    <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl p-4 w-72 text-white font-sans shadow-lg">
      {/* Conditional rendering: If location data is available, display it. Otherwise, show a loading message. */}
      {location ? (
        <>
          {/* Display Country */}
          <p className="mb-2">
            <span className="font-semibold text-blue-400">Country:</span>{" "}
            {location.country}
          </p>
          {/* Display City */}
          <p className="mb-2">
            <span className="font-semibold text-blue-400">City:</span>{" "}
            {location.city}
          </p>
          {/* Display Local Time */}
          <p className="mb-2">
            <span className="font-semibold text-blue-400">Local Time:</span>{" "}
            {location.time}
          </p>
          {/* Display Timezone Name and Identifier */}
          <p>
            <span className="font-semibold text-blue-400">Timezone:</span>{" "}
            {location.timezoneName} ({location.timezone})
          </p>
        </>
      ) : (
        // Display a loading message while data is being fetched.
        <p className="text-gray-400">Loading location...</p>
      )}
    </div>
  );
};

// Export the LocationBox component as the default export of this module.
export default LocationBox;