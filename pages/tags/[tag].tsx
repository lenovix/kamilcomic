import { useRouter } from "next/router";
import comics from "../../data/comics.json";
import Header from "../../components/Header";
import Link from "next/link";
import { useState } from "react";

export default function TagDetailPage() {
  const { query } = useRouter();
  const tag = query.tag as string;

  const [search, setSearch] = useState("");

  // Filter komik berdasarkan tag
  const comicsWithTag = comics.filter((comic) =>
    comic.tags?.map((t) => t.toLowerCase()).includes(tag?.toLowerCase())
  );

  // Tambahan: filter berdasarkan input pencarian
  const filteredComics = comicsWithTag.filter((comic) =>
    (typeof comic.title === "string" ? comic.title : String(comic.title))
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Judul Tag */}
        <h1 className="text-3xl font-bold mb-6">
          📚 Tag: <span className="text-blue-600">{tag}</span>
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

        {/* Hasil */}
        {filteredComics.length === 0 ? (
          <p className="text-gray-500 text-center">
            Tidak ada komik ditemukan.
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
                      Array.isArray(comic.title)
                        ? comic.title.join(", ")
                        : comic.title
                    }
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <h2 className="text-sm font-semibold leading-tight group-hover:text-blue-600 line-clamp-2">
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
