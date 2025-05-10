import React from "react";

function ProfileImage({ src, alt = "Profile", size = "md" }) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full object-cover ring-1 ring-gray-300`}
    />
  );
}

export default ProfileImage;