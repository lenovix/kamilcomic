import { useRouter } from "next/router";
import comics from "../../../data/comics.json";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useState } from "react";
dayjs.extend(relativeTime);

export default function ReaderPage() {
  const { query } = useRouter();
  const comic = comics.find((c) => c.slug === Number(query.slug));
  const chapter = comic?.chapters.find((ch) => ch.number === query.chapter);

  if (!comic || !chapter) return <p className="p-6">Loading...</p>;

  const imagePath = `/comics/${comic.slug}/chapters/${chapter.number}`;

  // State untuk daftar file gambar
  const [pages, setPages] = useState<string[]>([]);

  useEffect(() => {
    // Hanya jalan di client, fetch daftar file dari API custom
    async function fetchPages() {
      const res = await fetch(
        `/api/list-pages?slug=${comic?.slug}&chapter=${chapter?.number}`
      );
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages || []);
      }
    }
    fetchPages();
  }, [comic.slug, chapter.number]);

  // Cari index chapter saat ini
  const chapterIndex = comic.chapters.findIndex(
    (ch) => ch.number === chapter.number
  );
  const prevChapter =
    chapterIndex > 0 ? comic.chapters[chapterIndex - 1] : null;
  const nextChapter =
    chapterIndex < comic.chapters.length - 1
      ? comic.chapters[chapterIndex + 1]
      : null;

  return (
    <main className="px-4 py-8 max-w-5xl mx-auto">
      {/* Back Link */}
      <div className="mb-4">
        <Link
          href={`/${comic.slug}`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to {comic.title}
        </Link>
      </div>

      {/* Header Komik */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">
          {comic.title} - Chapter {chapter.number}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span className="bg-gray-100 px-2 py-1 rounded">
            {chapter.language || "Unknown"}
          </span>
          {chapter.uploadChapter && (
            <span className="bg-gray-100 px-2 py-1 rounded">
              Uploaded {dayjs(chapter.uploadChapter).fromNow()}
            </span>
          )}
        </div>
      </div>

      {/* Navigasi Chapter - atas */}
      <div className="flex justify-between items-center mb-6">
        {prevChapter ? (
          <Link
            href={`/reader/${comic.slug}/${prevChapter.number}`}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            ← Chapter {prevChapter.number}
          </Link>
        ) : (
          <div />
        )}
        {nextChapter ? (
          <Link
            href={`/reader/${comic.slug}/${nextChapter.number}`}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Chapter {nextChapter.number} →
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Gambar Halaman */}
      <div className="flex flex-col items-center gap-4">
        {pages.length > 0 ? (
          pages.map((filename, i) => (
            <img
              key={filename}
              src={`${imagePath}/${filename}`}
              alt={`Page ${i + 1}`}
              className="w-full max-w-2xl rounded shadow"
            />
          ))
        ) : (
          <p className="text-gray-400">Tidak ada halaman ditemukan.</p>
        )}
      </div>

      {/* Navigasi Chapter - bawah */}
      <div className="flex justify-between items-center mt-8">
        {prevChapter ? (
          <Link
            href={`/reader/${comic.slug}/${prevChapter.number}`}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            ← Chapter {prevChapter.number}
          </Link>
        ) : (
          <div />
        )}
        {nextChapter ? (
          <Link
            href={`/reader/${comic.slug}/${nextChapter.number}`}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Chapter {nextChapter.number} →
          </Link>
        ) : (
          <div />
        )}
      </div>
    </main>
  );
}
