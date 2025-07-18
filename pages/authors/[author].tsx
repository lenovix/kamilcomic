import { useRouter } from "next/router";
import comics from "../../data/comics.json";
import Header from "../../components/Header";
import Link from "next/link";
import { useState } from "react";

export default function AuthorDetailPage() {
  const { query } = useRouter();
  const author = query.author as string;

  const [search, setSearch] = useState("");

  // Filter komik berdasarkan author
  const comicsByAuthor = comics.filter((comic) => {
    const authorField = Array.isArray(comic.author)
      ? comic.author[0]
      : comic.author;
    if (typeof authorField !== 'string') return false;
    return authorField.toLowerCase() === author?.toLowerCase();
  });

  // Tambahan: filter berdasarkan input pencarian
  const filteredComics = comicsByAuthor.filter((comic) => {
    const title = typeof comic.title === 'string' ? comic.title : Array.isArray(comic.title) ? comic.title[0] : '';
    return title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">
          ✍️ Author: <span className="text-blue-600">{author}</span>
        </h1>

        {/* Search bar */}
        <input
          type="text"
          placeholder="Cari judul komik..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border px-4 py-2 rounded-md mb-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {filteredComics.length === 0 ? (
          <p className="text-gray-500">Tidak ada komik dari author ini.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {filteredComics.map((comic) => (
              <Link
                key={comic.slug}
                href={`/${comic.slug}`}
                className="group border rounded-xl overflow-hidden shadow hover:shadow-md transition"
              >
                <img
                  src={comic.cover || "/placeholder-cover.jpg"}
                  alt={typeof comic.title === "string" ? comic.title : Array.isArray(comic.title) ? comic.title[0] : ""}
                  className="w-full h-52 object-cover"
                />
                <div className="p-3 bg-white">
                  <h2 className="text-sm font-semibold group-hover:text-blue-600">
                    {comic.title}
                  </h2>
                  <span
                    className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
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
