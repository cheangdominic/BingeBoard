import { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function ImageUploadModal({ onClose, onConfirm }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError("");

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setError("Only JPG, JPEG, or PNG files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: 20, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-[#2E2E2E] p-6 rounded-xl max-w-md w-full border border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-4 text-white font-coolvetica">Upload Profile Picture</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-400">
            Accepted formats: <strong className="text-amber-200">JPG, JPEG, PNG</strong> (Max 5MB)
          </p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg, image/png, image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        {preview ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 flex justify-center"
          >
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-48 rounded-md border-2 border-gray-600"
            />
          </motion.div>
        ) : (
          <motion.div 
            whileHover={{ borderColor: "#60a5fa" }}
            className="mb-4 p-8 border-2 border-dashed border-gray-600 rounded-md text-center cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          >
            <p className="text-gray-400">No image selected</p>
          </motion.div>
        )}

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm mb-4"
          >
            {error}
          </motion.p>
        )}

        <div className="flex justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#3b82f6" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current.click()}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg"
          >
            Choose File
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => preview ? onConfirm(fileInputRef.current.files[0]) : null}
            disabled={!preview}
            className={`px-4 py-2 rounded-lg ${preview ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-500 cursor-not-allowed"}`}
          >
            Upload
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#ef4444" }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg"
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}