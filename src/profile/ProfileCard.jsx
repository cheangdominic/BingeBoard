import React from "react";

function ProfileCard() {
  return (
    <section className="bg-[#2E2E2E] rounded-lg shadow-lg p-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <img
          className="w-24 h-24 rounded-full ring-1 ring-gray-300"
          src="/profilePhotos/generic_profile_picture.jpg"
          alt="Default Profile"
        />
        <div>
          <h2 className="text-2xl font-bold">@johndoe</h2>
          <p className="text-gray-300">John Doe</p>
          <p className="text-gray-400 text-sm">12 Connections</p>
          <p className="text-gray-400 text-sm">2 Groups</p>
        </div>
      </div>
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        Settings
      </button>
    </section>
  );
}

export default ProfileCard;