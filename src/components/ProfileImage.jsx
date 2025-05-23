/**
 * @file ProfileImage.jsx
 * @description A React component to display a user's profile image.
 * It supports different sizes and allows the owner of the profile to upload a new image via a modal.
 */

// Import React and hooks (useState, useEffect) for component logic.
import React, { useState, useEffect } from 'react';
// Import axios for making HTTP requests (e.g., to fetch user info or upload image).
import axios from 'axios';
// Import the ImageUploadModal component, used when the user wants to change their profile picture.
import ImageUploadModal from './ImageUploadModal';

/**
 * @function ProfileImage
 * @description A React functional component that displays a profile image.
 * If it's the user's own profile, it allows them to click the image to open a modal for uploading a new one.
 * It fetches the profile image if no `src` is provided and `isOwnProfile` is true.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string} [props.src] - The source URL of the profile image. If not provided and `isOwnProfile` is true,
 *                               it attempts to fetch the image URL from the API.
 * @param {string} props.alt - The alt text for the image.
 * @param {'lg' | 'md' | string} props.size - The size of the profile image. 'lg' for large, 'md' (or other) for medium.
 *                                            Determines Tailwind CSS classes for width and height.
 * @param {boolean} props.isOwnProfile - A boolean indicating if the displayed profile belongs to the currently logged-in user.
 *                                     If true, enables image upload functionality.
 * @returns {JSX.Element} The rendered ProfileImage component.
 */
export default function ProfileImage({ src, alt, size, isOwnProfile }) {
  /**
   * State variable to store the current source URL of the image to be displayed.
   * Initializes with the provided `src` prop or an empty string.
   * @type {[string, function(string): void]}
   */
  const [imageSrc, setImageSrc] = useState(src || '');
  /**
   * State variable to control the visibility of the ImageUploadModal.
   * `true` if the modal should be shown, `false` otherwise.
   * @type {[boolean, function(boolean): void]}
   */
  const [showModal, setShowModal] = useState(false);

  /**
   * `useEffect` hook to manage the image source.
   * - If no `src` is provided and it's the user's own profile, it fetches the profile image URL from `/api/getUserInfo`.
   * - If `src` is provided, it updates `imageSrc` with the new `src`.
   * This effect runs when `src` or `isOwnProfile` props change.
   */
  useEffect(() => {
    // If no `src` prop is given and it's the user's own profile, fetch the image.
    if (!src && isOwnProfile) {
      const fetchProfileImage = async () => {
        try {
          // Make GET request to fetch user information, including profile picture URL.
          const response = await axios.get('/api/getUserInfo', { withCredentials: true });
          if (response.data.success) {
            // Set the image source to the fetched profile picture or a default if none is found.
            setImageSrc(response.data.profilePic || '/default-profile.png'); // Assuming a default image path
          }
        } catch (error) {
          console.error("Failed to fetch profile image:", error);
          // Optionally set to a default image on error as well
          // setImageSrc('/default-profile.png');
        }
      };

      fetchProfileImage();
    } else if (src) {
      // If a `src` prop is provided, use it directly.
      setImageSrc(src);
    }
    // Dependencies: re-run effect if `src` or `isOwnProfile` changes.
  }, [src, isOwnProfile]);

  /**
   * Handles the image upload process when a file is confirmed in the ImageUploadModal.
   * It sends the selected file to the `/api/upload-profile-image` endpoint.
   * On success, updates the `imageSrc`, closes the modal, and dispatches an event to notify other components.
   * @async
   * @param {File} file - The image file selected by the user for upload.
   */
  const handleUpload = async (file) => {
    // Create a FormData object to send the file.
    const formData = new FormData();
    formData.append("profileImage", file); // "profileImage" should match the backend's expected field name

    try {
      // Make a POST request to upload the image.
      const response = await axios.post(
        "/api/upload-profile-image",
        formData,
        { withCredentials: true } // Send cookies for authentication
      );

      // If the upload was successful.
      if (response.data.success) {
        // Update the displayed image source with the new URL from the server.
        setImageSrc(response.data.imageUrl);
        // Close the upload modal.
        setShowModal(false);

        // Dispatch a custom event to signal that the profile image has been updated.
        // Other components (like a navbar) can listen for this event to refresh the profile image.
        window.dispatchEvent(new Event('profileImageUpdated'));
      }
    } catch (error) {
      console.error("Upload failed:", error);
      // Optionally, display an error message to the user here.
    }
  };

  // Render the profile image and, if applicable, the upload modal.
  return (
    <>
      {/* Container for the profile image. It becomes clickable to open the modal if `isOwnProfile` is true. */}
      <div
        className={`relative ${isOwnProfile ? 'group cursor-pointer' : ''}`} // Add 'group' and 'cursor-pointer' if it's the user's own profile.
        onClick={() => isOwnProfile && setShowModal(true)} // Open modal on click if it's the user's own profile.
      >
        {/* The image element. */}
        <img
          src={imageSrc} // Current image source.
          alt={alt}     // Alt text for accessibility.
          // Dynamic class for size based on the `size` prop.
          className={`rounded-full ${size === 'lg' ? 'w-24 h-24' : 'w-16 h-16'} object-cover`}
        />
        {/* Overlay "Edit" text, shown on hover if `isOwnProfile` is true. */}
        {isOwnProfile && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-sm">Edit</span>
          </div>
        )}
      </div>

      {/* Conditionally render the ImageUploadModal if `isOwnProfile` is true and `showModal` is true. */}
      {isOwnProfile && showModal && (
        <ImageUploadModal
          onClose={() => setShowModal(false)} // Callback to close the modal.
          onConfirm={handleUpload}            // Callback to handle image upload confirmation.
        />
      )}
    </>
  );
}