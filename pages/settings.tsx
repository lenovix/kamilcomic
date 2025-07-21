"use client";

import Header from "@/components/Header";
import { useState } from "react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDeleteComics = async () => {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/settings/delete-comics", { method: "POST" });
    const data = await res.json();
    setMessage(data.message || "Done");
    setLoading(false);
  };

  const handleClearCache = async () => {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/settings/clear-cache", { method: "POST" });
    const data = await res.json();
    setMessage(data.message || "Done");
    setLoading(false);
  };

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-blue-700">⚙️ Settings</h1>

        <div className="space-y-4">
          <button
            onClick={handleDeleteComics}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded shadow"
            disabled={loading}
          >
            Delete Semua Komik
          </button>

          <button
            onClick={handleClearCache}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded shadow"
            disabled={loading}
          >
            Delete Cache (Folder tmp_upload)
          </button>

          {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
        </div>
      </main>
    </>
  );
}
