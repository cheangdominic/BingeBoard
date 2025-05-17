import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageUploadModal from './ImageUploadModal';

export default function ProfileImage({ src, alt, size, isOwnProfile }) {
  const [imageSrc, setImageSrc] = useState(src || '');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!src && isOwnProfile) {
      const fetchProfileImage = async () => {
        try {
          const response = await axios.get('/api/getUserInfo', { withCredentials: true });
          if (response.data.success) {
            setImageSrc(response.data.profilePic || '/default-profile.png');
          }
        } catch (error) {
          console.error("Failed to fetch profile image:", error);
        }
      };

      fetchProfileImage();
    } else if (src) {
      setImageSrc(src);
    }
  }, [src, isOwnProfile]);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const response = await axios.post(
        "/api/upload-profile-image",
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setImageSrc(response.data.imageUrl);
        setShowModal(false);

        window.dispatchEvent(new Event('profileImageUpdated'));
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <>
      <div
        className={`relative ${isOwnProfile ? 'group cursor-pointer' : ''}`}
        onClick={() => isOwnProfile && setShowModal(true)}
      >
        <img
          src={imageSrc}
          alt={alt}
          className={`rounded-full ${size === 'lg' ? 'w-24 h-24' : 'w-16 h-16'} object-cover`}
        />
        {isOwnProfile && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-sm">Edit</span>
          </div>
        )}
      </div>

      {isOwnProfile && showModal && (
        <ImageUploadModal
          onClose={() => setShowModal(false)}
          onConfirm={handleUpload}
        />
      )}
    </>
  );
}
