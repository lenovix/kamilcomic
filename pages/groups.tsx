import { useState } from "react";
import comics from "../data/comics.json";
import Header from "../components/Header";
import Link from "next/link";

export default function groupsPage() {
  const [search, setSearch] = useState("");

  // Ambil semua group unik
  const allgroups = Array.from(
    new Set(comics.flatMap((comic) => comic.groups || []))
  ).sort();

  // Filter berdasarkan input search
  const filteredgroups = allgroups.filter((group) =>
    group.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">🏷️ Groups</h1>

        {/* Search Bar */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari group..."
          className="w-full border px-4 py-2 rounded-md mb-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* List groups */}
        {filteredgroups.length === 0 ? (
          <p className="text-gray-500">Tidak ada group yang cocok.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredgroups.map((group) => (
              <Link
                key={group}
                href={`/groups/${encodeURIComponent(group)}`}
                className="px-4 py-2 bg-gray-100 hover:bg-blue-100 text-sm text-gray-800 rounded-full text-center shadow-sm"
              >
                {group}
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}