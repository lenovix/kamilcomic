import React from "react";
import {
  AlertCircle,
  CheckCircle,
  TriangleAlert,
  X,
  Loader2,
} from "lucide-react";

interface AlertProps {
  title: string;
  desc?: string;
  type?: "success" | "warning" | "error" | "onprogress";
  progress?: number; // Tambahan
  onClose: () => void;
}

export default function Alert({
  title,
  desc,
  type = "error",
  progress = 0,
  onClose,
}: AlertProps) {
  const icons = {
    success: <CheckCircle className="w-6 h-6 mt-1 text-green-600" />,
    warning: <TriangleAlert className="w-6 h-6 mt-1 text-yellow-600" />,
    error: <TriangleAlert className="w-6 h-6 mt-1 text-red-600" />,
    onprogress: <Loader2 className="w-6 h-6 mt-1 text-blue-600 animate-spin" />,
  };

  const styles = {
    success: {
      border: "border-green-300",
      bg: "bg-green-50",
      title: "text-green-800",
    },
    warning: {
      border: "border-yellow-300",
      bg: "bg-yellow-50",
      title: "text-yellow-800",
    },
    error: {
      border: "border-red-300",
      bg: "bg-red-50",
      title: "text-red-800",
    },
    onprogress: {
      border: "border-blue-300",
      bg: "bg-blue-50",
      title: "text-blue-800",
    },
  };

  const style = styles[type] || styles.error;

  return (
    <div
      className={`
        fixed bottom-6 right-6
        w-[90%] max-w-md
        p-4 rounded-xl border shadow-md
        flex flex-col gap-3 z-50
        transition-all duration-300

        ${style.bg} ${style.border}
      `}
    >
      <div className="flex items-start gap-3">
        {icons[type]}

        <div className="flex-1">
          <h4 className={`font-bold text-lg ${style.title}`}>{title}</h4>
          {desc && <p className="text-sm text-gray-700">{desc}</p>}
        </div>

        {/* sembunyikan tombol close saat upload */}
        {type !== "onprogress" && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition"
            aria-label="Close alert"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      {type === "onprogress" && (
        <div className="w-full h-2 bg-white rounded-full border border-blue-200 overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
