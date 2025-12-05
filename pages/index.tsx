import { useState, useMemo, useEffect } from "react";
import comics from "../data/comics.json";
import Link from "next/link";
import Header from "../components/Header";
import { getAverageRating } from "../utils/BookmarkRatingUtils";
import Head from "next/head";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  // Komik terbaru (berdasarkan tanggal uploaded, urut descending)
  const newComics = useMemo(() => {
    return [...comics]
      .sort((a, b) => {
        const uploadedA = Array.isArray(a.uploaded) ? a.uploaded[0] : a.uploaded;
        const uploadedB = Array.isArray(b.uploaded) ? b.uploaded[0] : b.uploaded;
        const dateA = new Date(uploadedA || 0).getTime();
        const dateB = new Date(uploadedB || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 6);
  }, [comics]);

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
          uploaded: Array.isArray(comic.uploaded) ? comic.uploaded[0] : comic.uploaded,
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
  }, [comics]);

  // Filter comics berdasarkan judul (case-insensitive)
  const filteredComics = useMemo(() => {
    const filtered = comics.filter((comic) => {
      const title = typeof comic.title === 'string' ? comic.title : Array.isArray(comic.title) ? comic.title[0] : '';
      return title.toLowerCase().includes(searchTerm.toLowerCase());
    });
    return filtered.sort((a, b) => {
      const uploadedA = Array.isArray(a.uploaded) ? a.uploaded[0] : a.uploaded;
      const uploadedB = Array.isArray(b.uploaded) ? b.uploaded[0] : b.uploaded;
      const dateA = new Date(uploadedA || 0).getTime();
      const dateB = new Date(uploadedB || 0).getTime();
      return dateB - dateA;
    });
  }, [searchTerm, comics]);

  return (
    <>
      <Head>
        <title>Komify :: Manga, Manhwa, Doujin</title>
      </Head>
      <Header />
      <main className="p-4 sm:p-6 mx-auto space-y-16 bg-gray-50 min-h-screen">
        {/* Section: Komik Baru */}
        <section>
          <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2 mb-6">
            <span>🆕</span> Komik Terbaru
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {newComics.map((comic) => (
              <Link
                key={comic.slug}
                href={`/${comic.slug}`}
                className="group bg-white rounded-xl overflow-hidden border hover:border-blue-300 shadow-sm hover:shadow-md transition"
              >
                <img
                  src={comic.cover || "/placeholder-cover.jpg"}
                  alt="Cover"
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-3 space-y-1">
                  <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 truncate">
                    {typeof comic.title === "string"
                      ? comic.title
                      : comic.title?.[0]}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {comic.uploaded}
                  </span>
                  {isClient && (
                    <div className="flex items-center text-yellow-500 text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>
                          {getAverageRating(comic.slug) > i ? "★" : "☆"}
                        </span>
                      ))}
                      <span className="ml-1 text-gray-500">
                        ({getAverageRating(comic.slug)}/5)
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section: Update Chapter */}
        <section>
          <h2 className="text-2xl font-bold text-green-700 flex items-center gap-2 mb-6">
            <span>⏫</span> Update Chapter
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {updateChapters.map((ch) => (
              <Link
                key={`${ch.comicSlug}-${ch.number}`}
                href={`/reader/${ch.comicSlug}/${ch.number}`}
                className="flex items-center gap-3 bg-white border rounded-xl shadow-sm hover:shadow-md transition p-3"
              >
                <img
                  src={ch.comicCover || "/placeholder-cover.jpg"}
                  className="w-14 h-14 object-cover rounded-lg border"
                  alt="cover"
                />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="text-xs text-gray-500 truncate">
                    {ch.comicTitle}
                  </div>
                  <div className="font-semibold text-sm text-green-700 truncate">
                    Chapter {ch.number}: {ch.title}
                  </div>
                  <div className="text-xs text-gray-400">
                    {ch.uploadChapter}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section: Semua Komik */}
        <section>
          <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2 mb-6">
            <span>📖</span> Semua Komik
          </h2>
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
                  className="group bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
                >
                  <img
                    src={comic.cover || "/placeholder-cover.jpg"}
                    alt="Cover"
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-1">
                    <h2 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 truncate">
                      {typeof comic.title === "string"
                        ? comic.title
                        : comic.title?.[0]}
                    </h2>
                    <p className="text-xs text-gray-500 truncate">
                      {Array.isArray(comic.tags)
                        ? comic.tags.join(", ")
                        : comic.tags}
                    </p>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full w-max ${
                        comic.status === "Completed" ||
                        comic.status?.[0] === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {comic.status || comic.status?.[0] || "Unknown"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
