import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, TriangleAlert } from "lucide-react";

interface DialogBoxProps {
  open: boolean;
  title: string;
  desc: string;
  type?: "info" | "warning" | "danger" | "success";
  confirmText?: string;
  cancelText?: string;
  hideCancel?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DialogBox({
  open,
  title,
  desc,
  type = "info", // info | warning | danger
  confirmText = "Confirm",
  cancelText = "Cancel",
  hideCancel = false,
  onConfirm,
  onCancel,
}: DialogBoxProps) {
  const icons = {
    info: <AlertCircle className="w-6 h-6 text-blue-600" />,
    warning: <TriangleAlert className="w-6 h-6 text-yellow-600" />,
    danger: <TriangleAlert className="w-6 h-6 text-red-600" />,
    success: <CheckCircle className="w-6 h-6 text-green-600" />,
  };

  const colors = {
    info: "text-blue-700",
    warning: "text-yellow-700",
    danger: "text-red-700",
    success: "text-green-700",
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
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="shrink-0">{icons[type]}</div>
              <h2 className={`text-xl font-semibold ${colors[type]}`}>
                {title}
              </h2>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-8 leading-relaxed">{desc}</p>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              {!hideCancel && (
                <button
                  className="
                  px-4 py-2 rounded-lg 
                  border border-gray-300 
                  text-gray-600 
                  hover:bg-gray-100 
                  transition
                "
                  onClick={onCancel}
                >
                  {cancelText}
                </button>
              )}

              <button
                className={`
                px-4 py-2 rounded-lg text-white transition font-medium
                ${
                  type === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : type === "warning"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : type === "success"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }
              `}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

}
