import { useState } from "react";
import comics from "../data/comics.json";
import Header from "../components/Header";
import Link from "next/link";

export default function parodiesPage() {
  const [search, setSearch] = useState("");

  // Ambil semua parodie unik
  const allparodies = Array.from(
    new Set(comics.flatMap((comic) => comic.parodies || []))
  ).sort();

  // Filter berdasarkan input search
  const filteredparodies = allparodies.filter((parodie) =>
    parodie.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">🏷️ Parodies</h1>

        {/* Search Bar */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari parodie..."
          className="w-full border px-4 py-2 rounded-md mb-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* List parodies */}
        {filteredparodies.length === 0 ? (
          <p className="text-gray-500">Tidak ada parodie yang cocok.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredparodies.map((parodie) => (
              <Link
                key={parodie}
                href={`/parodies/${encodeURIComponent(parodie)}`}
                className="px-4 py-2 bg-gray-100 hover:bg-blue-100 text-sm text-gray-800 rounded-full text-center shadow-sm"
              >
                {parodie}
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}