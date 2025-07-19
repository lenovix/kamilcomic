

import { useEffect, useState } from "react";
import {
  isBookmarked,
  toggleBookmark,
  getRating,
  setRating,
  getAverageRating
} from "../utils/BookmarkRatingUtils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
import comics from "../data/comics.json";
import Link from "next/link";
import Header from "../components/Header";
dayjs.extend(relativeTime);


export default function ComicDetail() {
  const { query } = useRouter();
  // Pastikan slug bisa string/number
  const slug = typeof query.slug === "string" ? query.slug : Array.isArray(query.slug) ? query.slug[0] : undefined;
  const comic = comics.find((c) => String(c.slug) === String(slug));

  // Bookmark & Rating state (client only)
  const [bookmarked, setBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (comic && typeof window !== "undefined") {
      setBookmarked(isBookmarked(comic.slug));
      setUserRating(getRating(comic.slug));
      setAvgRating(getAverageRating(comic.slug));
    }
  }, [comic]);

  const handleBookmark = () => {
    if (!comic) return;
    toggleBookmark(comic.slug);
    setBookmarked(isBookmarked(comic.slug));
  };

  const handleRating = (rating: number) => {
    if (!comic) return;
    setRating(comic.slug, rating);
    setUserRating(rating);
    setAvgRating(getAverageRating(comic.slug));
  };

  const handleDelete = async () => {
    if (!comic) return;
    if (typeof window === "undefined") return;
    if (!window.confirm('Yakin ingin menghapus komik ini beserta semua chapter-nya?')) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/delete-comic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: comic.slug })
      });
      if (res.ok) {
        window.location.href = '/';
      } else {
        alert('Gagal menghapus komik!');
      }
    } catch {
      alert('Gagal menghapus komik!');
    } finally {
      setDeleting(false);
    }
  };

  if (!comic) return <p className="p-6">Loading...</p>;

  return (
    <>
      <Header />
      <main className="p-6 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-10 bg-white rounded-xl shadow-lg p-6">
          <div className="flex-shrink-0 flex justify-center items-start">
            <img
              src={
                comic.cover
                  ? `${comic.cover}?v=${typeof window !== 'undefined' ? Date.now() : ''}`
                  : "/placeholder-cover.jpg"
              }
              alt={Array.isArray(comic.title) ? comic.title.join(", ") : comic.title}
              className="w-56 h-auto rounded-lg shadow-lg border-2 border-gray-200 object-cover"
            />
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-extrabold mb-2 text-blue-800">{comic.title}</h1>
              <p className="text-xs text-gray-400 mb-4">ID: #{comic.slug}</p>
              {/* Bookmark, Rating, Delete */}
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => window.location.href = `/edit-comic?slug=${comic.slug}`}
                  className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-700 transition ml-2"
                  title="Edit data komik"
                >
                  ✏️ Edit Comic
                </button>
                <button
                  onClick={handleBookmark}
                  className={`px-3 py-1 rounded text-white ${bookmarked ? 'bg-yellow-500' : 'bg-gray-400'} transition`}
                  title={bookmarked ? 'Hapus dari Bookmark' : 'Bookmark komik ini'}
                >
                  {bookmarked ? '★ Favorit' : '☆ Bookmark'}
                </button>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      className="text-2xl focus:outline-none"
                      title={`Beri rating ${star}`}
                    >
                      {userRating >= star ? '★' : '☆'}
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({avgRating}/5)</span>
                </div>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-700 transition ml-2"
                  disabled={deleting}
                  title="Hapus komik beserta semua chapter"
                >
                  {deleting ? 'Menghapus...' : '🗑️ Hapus Komik'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {comic.tags?.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tags/${encodeURIComponent(tag)}`}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 hover:bg-blue-200 hover:text-blue-900 transition"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm mb-4 text-black">
                <div>
                  <span className="font-semibold">Parodies:</span>{" "}
                  {Array.isArray(comic.parodies)
                    ? comic.parodies.map((p) => (
                        <Link
                          key={p}
                          href={`/parodies/${encodeURIComponent(p)}`}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 hover:bg-blue-200 hover:text-blue-900 transition mr-1"
                        >
                          {p}
                        </Link>
                      ))
                    : comic.parodies
                    ? (
                        <Link
                          href={`/parodies/${encodeURIComponent(comic.parodies)}`}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 hover:bg-blue-200 hover:text-blue-900 transition"
                        >
                          {comic.parodies}
                        </Link>
                      )
                    : "-"}
                </div>
                <div>
                  <span className="font-semibold">Characters:</span>{" "}
                  {Array.isArray(comic.characters)
                    ? comic.characters.map((c) => (
                        <Link
                          key={c}
                          href={`/characters/${encodeURIComponent(c)}`}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 hover:bg-blue-200 hover:text-blue-900 transition mr-1"
                        >
                          {c}
                        </Link>
                      ))
                    : comic.characters
                    ? (
                        <Link
                          href={`/characters/${encodeURIComponent(comic.characters)}`}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 hover:bg-blue-200 hover:text-blue-900 transition"
                        >
                          {comic.characters}
                        </Link>
                      )
                    : "-"}
                </div>
                <div>
                  <span className="font-semibold">Artists:</span>{" "}
                  {Array.isArray(comic.artists)
                    ? comic.artists.map((a) => (
                        <Link
                          key={a}
                          href={`/artists/${encodeURIComponent(a)}`}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 hover:bg-blue-200 hover:text-blue-900 transition mr-1"
                        >
                          {a}
                        </Link>
                      ))
                    : comic.artists
                    ? (
                        <Link
                          href={`/artists/${encodeURIComponent(comic.artists)}`}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 hover:bg-blue-200 hover:text-blue-900 transition"
                        >
                          {comic.artists}
                        </Link>
                      )
                    : "-"}
                </div>
                <div>
                  <span className="font-semibold">Groups:</span>{" "}
                  {Array.isArray(comic.groups)
                    ? comic.groups.map((g) => (
                        <Link
                          key={g}
                          href={`/groups/${encodeURIComponent(g)}`}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 hover:bg-blue-200 hover:text-blue-900 transition mr-1"
                        >
                          {g}
                        </Link>
                      ))
                    : comic.groups
                    ? (
                        <Link
                          href={`/groups/${encodeURIComponent(comic.groups)}`}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 hover:bg-blue-200 hover:text-blue-900 transition"
                        >
                          {comic.groups}
                        </Link>
                      )
                    : "-"}
                </div>
                <div>
                  <span className="font-semibold">Categories:</span>{" "}
                  {Array.isArray(comic.categories)
                    ? comic.categories.map((cat) => (
                        <Link
                          key={cat}
                          href={`/categories/${encodeURIComponent(cat)}`}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 hover:bg-blue-200 hover:text-blue-900 transition mr-1"
                        >
                          {cat}
                        </Link>
                      ))
                    : comic.categories
                    ? (
                        <Link
                          href={`/categories/${encodeURIComponent(comic.categories)}`}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 hover:bg-blue-200 hover:text-blue-900 transition"
                        >
                          {comic.categories}
                        </Link>
                      )
                    : "-"}
                </div>
                <div>
                  <span className="font-semibold">Author:</span>{" "}
                  {Array.isArray(comic.author)
                    ? comic.author.map((a) => (
                        <Link
                          key={a}
                          href={`/authors/${encodeURIComponent(a)}`}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 hover:bg-blue-200 hover:text-blue-900 transition mr-1"
                        >
                          {a}
                        </Link>
                      ))
                    : comic.author
                    ? (
                        <Link
                          href={`/authors/${encodeURIComponent(comic.author)}`}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 hover:bg-blue-200 hover:text-blue-900 transition"
                        >
                          {comic.author}
                        </Link>
                      )
                    : "-"}
                </div>
                <div>
                  <span className="font-semibold">Uploaded:</span>{" "}
                  {typeof comic.uploaded === "string"
                    ? `${dayjs(comic.uploaded, "MM/DD/YYYY").fromNow()}, ${comic.uploaded}`
                    : "-"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter List */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">📖 <span>Chapters</span></h2>
          <button
            onClick={() => window.location.href = `/add-chapter?slug=${comic.slug}`}
            className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-700 transition text-sm"
          >
            + Tambah Chapter
          </button>
        </div>
        {comic.chapters.length === 0 ? (
          <p className="text-gray-500">Belum ada chapter yang diunggah.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {comic.chapters.map((ch) => {
              // Pastikan key unik dan konsisten
              const chapterNum = typeof ch.number === "number" ? ch.number : Array.isArray(ch.number) ? ch.number.join("-") : String(ch.number);
              // Format tanggal upload
              const uploadDate = ch.uploadChapter
                ? dayjs(Array.isArray(ch.uploadChapter) ? ch.uploadChapter[0] : ch.uploadChapter).format("DD MMM YYYY")
                : "-";
              // Badge bahasa
              const langMap: Record<string, string> = {
                English: "🇬🇧 English",
                Japanese: "🇯🇵 Japanese",
                Korean: "🇰🇷 Korean",
                Chinese: "🇨🇳 Chinese",
                Indonesian: "🇮🇩 Indonesian",
              };
              return (
                <div key={chapterNum} className="relative group border-2 border-blue-100 rounded-lg px-5 py-4 bg-gradient-to-br from-white to-blue-50 shadow hover:shadow-lg hover:border-blue-300 transition flex flex-col justify-between min-h-[170px]">
                  <Link
                    href={`/reader/${comic.slug}/${ch.number}`}
                    className="block"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600 font-bold group-hover:underline text-lg">Chapter {ch.number}</span>
                      {ch.language && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 ml-1">
                          {langMap[ch.language] || ch.language}
                        </span>
                      )}
                    </div>
                    <div className="text-base font-semibold text-gray-800 mb-1 truncate">{ch.title}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">
                        <span className="font-semibold">Tanggal:</span> {uploadDate}
                      </span>
                      <span className="text-xs text-gray-400">{ch.uploadChapter ? dayjs(Array.isArray(ch.uploadChapter) ? ch.uploadChapter[0] : ch.uploadChapter).fromNow() : "-"}</span>
                    </div>
                  </Link>
                  <div className="absolute top-2 right-2 flex gap-2 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          window.location.href = `/edit-chapter?slug=${comic.slug}&chapter=${ch.number}`;
                        }
                      }}
                      className="px-2 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-700 shadow"
                      title="Edit chapter"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (typeof window === "undefined") return;
                        if (!window.confirm('Yakin ingin menghapus chapter ini?')) return;
                        const res = await fetch('/api/delete-chapter', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ slug: comic.slug, chapter: ch.number })
                        });
                        if (res.ok) window.location.reload();
                        else alert('Gagal menghapus chapter!');
                      }}
                      className="px-2 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-700 shadow"
                      title="Hapus chapter"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}