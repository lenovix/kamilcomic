import { useRouter } from "next/router";
import comics from "../../data/comics.json";
import Header from "../../components/Header";
import Link from "next/link";
import { useState } from "react";

export default function groupDetailPage() {
  const { query } = useRouter();
  const groups = query.group as string;

  const [search, setSearch] = useState("");

  // Filter komik berdasarkan group
  const comicsBygroup = comics.filter((comic) => {
    if (!comic.groups) return false;
    if (Array.isArray(comic.groups)) {
      return comic.groups.some(
        (g) => g.toLowerCase() === groups?.toLowerCase()
      );
    }
    return comic.groups.toLowerCase() === groups?.toLowerCase();
  });

  // Tambahan: filter berdasarkan input pencarian
  const filteredComics = comicsBygroup.filter((comic) => {
    const title =
      typeof comic.title === "string"
        ? comic.title
        : Array.isArray(comic.title)
        ? comic.title.join(" ")
        : "";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Judul */}
        <h1 className="text-3xl font-bold mb-6">
          ✍️ Group: <span className="text-blue-600">{groups}</span>
        </h1>

        {/* Search Bar */}
        <div className="mb-8">
          <label htmlFor="search" className="sr-only">
            Cari komik
          </label>
          <input
            id="search"
            type="text"
            placeholder="Cari judul komik..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* List Komik */}
        {filteredComics.length === 0 ? (
          <p className="text-gray-500 text-center">
            Tidak ada komik dari grup ini.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredComics.map((comic) => (
              <Link
                key={comic.slug}
                href={`/${comic.slug}`}
                className="group border rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[2/3] overflow-hidden bg-gray-100">
                  <img
                    src={comic.cover || "/placeholder-cover.jpg"}
                    alt={
                      typeof comic.title === "string"
                        ? comic.title
                        : Array.isArray(comic.title)
                        ? comic.title.join(" ")
                        : ""
                    }
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <h2 className="text-sm font-semibold group-hover:text-blue-600 leading-snug line-clamp-2">
                    {comic.title}
                  </h2>
                  <span
                    className={`inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full ${
                      comic.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {comic.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
