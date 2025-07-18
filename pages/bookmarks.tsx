import { useEffect, useState } from "react";
import comics from "../data/comics.json";
import Link from "next/link";
import Header from "../components/Header";
import { getBookmarks } from "../utils/BookmarkRatingUtils";

export default function BookmarksPage() {
  const [bookmarked, setBookmarked] = useState<number[]>([]);

  useEffect(() => {
    setBookmarked(getBookmarks());
  }, []);

  const bookmarkedComics = comics.filter((c) => bookmarked.includes(c.slug));

  return (
    <>
      <Header />
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">★ Komik Favorit Saya</h1>
        {bookmarkedComics.length === 0 ? (
          <p className="text-gray-500">Belum ada komik yang di-bookmark.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {bookmarkedComics.map((comic) => (
              <Link
                key={comic.slug}
                href={`/${comic.slug}`}
                className="block border-2 border-yellow-100 rounded-lg px-4 py-3 bg-gradient-to-br from-white to-yellow-50 shadow hover:shadow-lg hover:border-yellow-300 transition group"
              >
                <img
                  src={comic.cover}
                  alt={comic.title}
                  className="w-full h-48 object-cover rounded mb-2 border border-yellow-200"
                />
                <div className="font-bold text-lg text-yellow-700 group-hover:underline mb-1">{comic.title}</div>
                <div className="text-xs text-gray-500">ID: #{comic.slug}</div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
