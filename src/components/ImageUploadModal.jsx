/**
 * @file ImageUploadModal.jsx
 * @description A React component for a modal dialog that allows users to select and preview an image for upload.
 * It includes validation for file type and size.
 */

// Import React hooks (useState, useRef) for managing state and DOM references.
import { useState, useRef } from "react";
// Import `motion` from framer-motion for animations.
import { motion } from "framer-motion";

/**
 * @function ImageUploadModal
 * @description A React functional component that renders a modal for image uploading.
 * Users can choose a file, see a preview, and then confirm the upload or cancel.
 *
 * @param {object} props - The properties passed to the component.
 * @param {function} props.onClose - Callback function to be invoked when the modal is closed (e.g., by clicking "Cancel").
 * @param {function} props.onConfirm - Callback function to be invoked when the user confirms the upload.
 *                                     It receives the selected `File` object as an argument.
 * @returns {JSX.Element} The rendered ImageUploadModal component.
 */
export default function ImageUploadModal({ onClose, onConfirm }) {
  // State to store the data URL of the selected image for preview.
  const [preview, setPreview] = useState(null);
  // State to store any error messages related to file selection (e.g., wrong type, too large).
  const [error, setError] = useState("");
  // Ref to access the hidden file input element directly.
  const fileInputRef = useRef(null);

  /**
   * Handles the change event of the file input.
   * Validates the selected file's type and size.
   * If valid, it reads the file and sets the preview state.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event object from the file input.
   */
  const handleFileChange = (e) => {
    // Get the first selected file.
    const file = e.target.files[0];
    // Clear any previous error messages.
    setError("");

    // Check if a file was selected.
    if (!file) return; // Added to prevent errors if no file is chosen

    // Validate file type: only allow JPEG, PNG, or JPG.
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setError("Only JPG, JPEG, or PNG files are allowed.");
      return;
    }

    // Validate file size: must be less than 5MB.
    if (file.size > 5 * 1024 * 1024) { // 5MB in bytes
      setError("File size must be less than 5MB.");
      return;
    }

    // Create a FileReader instance to read the file content.
    const reader = new FileReader();
    // Set up the onload event handler: when the file is read, update the preview state with the result (data URL).
    reader.onload = () => setPreview(reader.result);
    // Read the file as a data URL, which can be used as an `src` for an `<img>` tag.
    reader.readAsDataURL(file);
  };

  return (
    // Outermost div for the modal overlay, covering the entire screen.
    // Uses framer-motion for fade-in/out animation.
    <motion.div 
      initial={{ opacity: 0 }} // Initial animation state: transparent
      animate={{ opacity: 1 }} // Animate to: fully opaque
      exit={{ opacity: 0 }}    // Animate on exit: fade out
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" // Styling for overlay
    >
      {/* Inner div for the modal content. */}
      {/* Uses framer-motion for a spring-like pop-in animation. */}
      <motion.div
        initial={{ y: 20, scale: 0.98 }} // Initial animation state: slightly down and scaled down
        animate={{ y: 0, scale: 1 }}    // Animate to: original position and scale
        transition={{ type: "spring", stiffness: 300, damping: 25 }} // Spring animation parameters
        className="bg-[#2E2E2E] p-6 rounded-xl max-w-md w-full border border-gray-700" // Styling for modal box
      >
        {/* Modal title. */}
        <h2 className="text-2xl font-bold mb-4 text-white font-coolvetica">Upload Profile Picture</h2>
        
        {/* Informational text about accepted file formats and size. */}
        <div className="mb-4">
          <p className="text-sm text-gray-400">
            Accepted formats: <strong className="text-amber-200">JPG, JPEG, PNG</strong> (Max 5MB)
          </p>
        </div>

        {/* Hidden file input element. Triggered programmatically by other elements. */}
        <input
          type="file"
          ref={fileInputRef} // Assign the ref to this input
          accept="image/jpeg, image/png, image/jpg" // Specify accepted file types for the browser's file dialog
          onChange={handleFileChange} // Call handleFileChange when a file is selected
          className="hidden" // Keep the default file input hidden
        />

        {/* Conditional rendering: Show image preview if `preview` state is not null. */}
        {preview ? (
          // Container for the image preview with animation.
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} // Initial animation for preview
            animate={{ opacity: 1, scale: 1 }}    // Animate to full opacity and scale
            className="mb-4 flex justify-center"
          >
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-48 rounded-md border-2 border-gray-600" // Styling for the preview image
            />
          </motion.div>
        ) : (
          // If no preview, show a placeholder area to click for file selection.
          <motion.div 
            whileHover={{ borderColor: "#60a5fa" }} // Change border color on hover
            className="mb-4 p-8 border-2 border-dashed border-gray-600 rounded-md text-center cursor-pointer"
            onClick={() => fileInputRef.current.click()} // Programmatically click the hidden file input
          >
            <p className="text-gray-400">No image selected</p>
          </motion.div>
        )}

        {/* Display error message if `error` state is not empty. */}
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }} // Initial animation for error message
            animate={{ opacity: 1, y: 0 }}    // Animate error message into view
            className="text-red-400 text-sm mb-4"
          >
            {error}
          </motion.p>
        )}

        {/* Container for action buttons (Choose File, Upload, Cancel). */}
        <div className="flex justify-end gap-3">
          {/* "Choose File" button: Triggers the hidden file input. */}
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#3b82f6" }} // Hover animation
            whileTap={{ scale: 0.95 }} // Tap animation
            onClick={() => fileInputRef.current.click()} // Programmatically click the hidden file input
            className="px-4 py-2 bg-gray-700 text-white rounded-lg"
          >
            Choose File
          </motion.button>
          {/* "Upload" button: Confirms the upload. Disabled if no preview is available. */}
          <motion.button
            whileHover={{ scale: 1.05 }} // Hover animation
            whileTap={{ scale: 0.95 }} // Tap animation
            // Calls onConfirm with the selected file if a preview exists.
            onClick={() => preview ? onConfirm(fileInputRef.current.files[0]) : null}
            disabled={!preview} // Disable button if no image is selected/previewed
            // Dynamic styling based on whether a preview is available.
            className={`px-4 py-2 rounded-lg ${preview ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-500 cursor-not-allowed"}`}
          >
            Upload
          </motion.button>
          {/* "Cancel" button: Closes the modal. */}
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#ef4444" }} // Hover animation
            whileTap={{ scale: 0.95 }} // Tap animation
            onClick={onClose} // Call the onClose callback
            className="px-4 py-2 bg-gray-700 text-white rounded-lg"
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}