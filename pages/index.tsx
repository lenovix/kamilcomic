import { useState, useMemo } from "react";
import comics from "../data/comics.json";
import Link from "next/link";
import Header from "../components/Header";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  // Komik terbaru (berdasarkan tanggal uploaded, urut descending)
  const newComics = useMemo(() => {
    return [...comics]
      .sort((a, b) => {
        const dateA = new Date(a.uploaded || 0).getTime();
        const dateB = new Date(b.uploaded || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 6);
  }, []);

  // Semua chapter terbaru dari semua komik
  const updateChapters = useMemo(() => {
    let chapters: any[] = [];
    comics.forEach((comic) => {
      comic.chapters.forEach((ch) => {
        chapters.push({
          ...ch,
          comicTitle: comic.title,
          comicSlug: comic.slug,
          comicCover: comic.cover,
        });
      });
    });
    return chapters
      .filter((ch) => ch.uploadChapter)
      .sort((a, b) => {
        const dateA = new Date(a.uploadChapter || 0).getTime();
        const dateB = new Date(b.uploadChapter || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 8);
  }, []);

  // Filter comics berdasarkan judul (case-insensitive)
  const filteredComics = useMemo(() => {
    return comics.filter((comic) =>
      comic.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <>
      <Header />
      <main className="p-4 sm:p-6 max-w-7xl mx-auto">

        {/* Section: New Comic */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🆕</span>
            <h2 className="text-2xl font-bold text-blue-700">New Comic</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5">
            {newComics.map((comic) => (
              <Link
                key={comic.slug}
                href={`/${comic.slug}`}
                className="group border-2 border-blue-100 rounded-xl overflow-hidden shadow hover:shadow-lg transition bg-white flex flex-col"
              >
                <img
                  src={comic.cover || "/placeholder-cover.jpg"}
                  alt={comic.title}
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="p-2 flex-1 flex flex-col justify-between">
                  <h3 className="text-xs font-semibold truncate group-hover:text-blue-600 mb-1 text-black">{comic.title}</h3>
                  <span className="text-[10px] text-gray-400">{comic.uploaded}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section: Update Chapter */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⏫</span>
            <h2 className="text-2xl font-bold text-green-700">Update Chapter</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {updateChapters.map((ch) => (
              <Link
                key={`${ch.comicSlug}-${ch.number}`}
                href={`/reader/${ch.comicSlug}/${ch.number}`}
                className="flex items-center gap-3 border-2 border-green-100 rounded-xl bg-white shadow hover:shadow-lg transition px-3 py-2"
              >
                <img
                  src={ch.comicCover || "/placeholder-cover.jpg"}
                  alt={ch.comicTitle}
                  className="w-14 h-14 object-cover rounded-md border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 truncate">{ch.comicTitle}</div>
                  <div className="font-semibold text-sm text-green-700 truncate">Chapter {ch.number}: {ch.title}</div>
                  <div className="text-xs text-gray-400">{ch.uploadChapter}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section: Semua Komik (filtered) */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📖</span>
          <h2 className="text-2xl font-bold text-gray-700">Semua Komik</h2>
        </div>
        {filteredComics.length === 0 ? (
          <p className="text-gray-500">
            Tidak ditemukan komik dengan judul tersebut.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {filteredComics.map((comic) => (
              <Link
                key={comic.slug}
                href={`/${comic.slug}`}
                className="group relative border-2 border-gray-100 rounded-xl overflow-hidden shadow hover:shadow-xl transition duration-200 bg-white flex flex-col"
              >
                <img
                  src={comic.cover || "/placeholder-cover.jpg"}
                  alt={comic.title}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <h2 className="text-md font-semibold group-hover:text-blue-600 transition truncate mb-1 text-black">
                    {comic.title}
                  </h2>
                  <p className="text-xs text-gray-500 mb-1 truncate">
                    {comic.tags?.join(", ")}
                  </p>
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                      comic.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {comic.status || "Unknown"}
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
