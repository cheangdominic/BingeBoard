import React, { useEffect, useState } from "react";
import LocationInfo from './../components/LocationInfo.jsx';
import ProfileImage from './../components/ProfileImage.jsx';

function ProfileCard() {
  const [username, setUsername] = useState("loading...");

  useEffect(() => {
    fetch("/api/getUserInfo", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setUsername(data.username || "unknown");
      })
      .catch((error) => {
        console.error("Error fetching user info:", error);
        setUsername("error");
      });
  }, []);

  return (
    <section className="bg-[#2E2E2E] rounded-lg shadow-lg p-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <ProfileImage
          src="/img/profilePhotos/generic_profile_picture.jpg"
          alt="Default Profile"
          size="lg"
        />
        <div>
          <h2 className="text-2xl font-bold">@{username}</h2>
          <p className="text-gray-400 text-sm">12 Connections</p>
          <p className="text-gray-400 text-sm">2 Groups</p>
        </div>
      </div>
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        Settings
      </button>
      <LocationInfo />
    </section>
  );
}

export default ProfileCard;
