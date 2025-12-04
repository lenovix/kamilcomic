import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, UploadCloud, X } from "lucide-react";

interface DialogBoxCoverProps {
  open: boolean;
  onClose: () => void;
  onSave: (file: File) => void;
}

export default function DialogBoxCover({
  open,
  onClose,
  onSave,
}: DialogBoxCoverProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/"))
      return alert("File harus berupa gambar.");
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Dialog */}
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
              onClick={onClose}
            >
              <X size={22} />
            </button>

            {/* Title */}
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-800">
              <ImageIcon size={22} className="text-blue-600" />
              Upload Cover
            </h2>

            {/* Drop Zone */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition"
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => document.getElementById("coverInput")?.click()}
            >
              {!preview ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <UploadCloud size={42} className="text-gray-400" />
                  <p className="text-gray-600 text-sm font-medium">
                    Klik atau seret gambar ke area ini
                  </p>
                  <p className="text-gray-400 text-xs">
                    Format: JPG, PNG · Maks 5MB
                  </p>
                </div>
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full rounded-lg shadow max-h-80 object-cover"
                />
              )}
            </div>

            {/* Hidden Input */}
            <input
              id="coverInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handleFileSelect(e.target.files[0])
              }
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-7">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                className={`px-4 py-2 rounded-lg text-white transition
                ${
                  selectedFile
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-300 cursor-not-allowed"
                }
              `}
                onClick={() => selectedFile && onSave(selectedFile)}
                disabled={!selectedFile}
              >
                Simpan Cover
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

}
