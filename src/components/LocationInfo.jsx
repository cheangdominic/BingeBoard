import React, { useEffect, useState } from "react";

const LocationBox = () => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetch("https://geolocation-db.com/json/")
      .then((res) => res.json())
      .then((data) => {
        const timeString = new Date().toLocaleTimeString(undefined, {
          timeZone: data.timezone,
          timeStyle: "short",
        });

        const tzString = new Date().toLocaleDateString(undefined, {
          timeZone: data.timezone,
          timeZoneName: "long",
        });

        setLocation({
          city: data.city,
          country: data.country_name,
          timezone: data.timezone,
          time: timeString,
          timezoneName: tzString.split(", ")[1], 
        });
      })
      .catch((err) => console.error("Failed to fetch location:", err));
  }, []);

  return (
    <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl p-4 w-72 text-white font-sans shadow-lg">
      {location ? (
        <>
          <p className="mb-2">
            <span className="font-semibold text-blue-400">Country:</span>{" "}
            {location.country}
          </p>
          <p className="mb-2">
            <span className="font-semibold text-blue-400">City:</span>{" "}
            {location.city}
          </p>
          <p className="mb-2">
            <span className="font-semibold text-blue-400">Local Time:</span>{" "}
            {location.time}
          </p>
          <p>
            <span className="font-semibold text-blue-400">Timezone:</span>{" "}
            {location.timezoneName} ({location.timezone})
          </p>
        </>
      ) : (
        <p className="text-gray-400">Loading location...</p>
      )}
    </div>
  );
};

export default LocationBox;
