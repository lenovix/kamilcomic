import { useRouter } from "next/router";
import comics from "../data/comics.json";
import Link from "next/link";
import Header from "../components/Header";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function ComicDetail() {
  const { query } = useRouter();
  const comic = comics.find((c) => c.slug === Number(query.slug));

  if (!comic) return <p className="p-6">Loading...</p>;

  return (
    <>
      <Header />
      <main className="p-6 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-10 bg-white rounded-xl shadow-lg p-6">
          <div className="flex-shrink-0 flex justify-center items-start">
            <img
              src={comic.cover || "/placeholder-cover.jpg"}
              alt={comic.title}
              className="w-56 h-auto rounded-lg shadow-lg border-2 border-gray-200 object-cover"
            />
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-extrabold mb-2 text-blue-800">{comic.title}</h1>
              <p className="text-xs text-gray-400 mb-4">ID: #{comic.slug}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {comic.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm mb-4 text-black">
                <div><span className="font-semibold">Parodies:</span> {comic.parodies || "-"}</div>
                <div><span className="font-semibold">Characters:</span> {comic.characters || "-"}</div>
                <div><span className="font-semibold">Artists:</span> {comic.artists || "-"}</div>
                <div><span className="font-semibold">Groups:</span> {comic.groups || "-"}</div>
                <div><span className="font-semibold">Categories:</span> {comic.categories || "-"}</div>
                <div><span className="font-semibold">Uploaded:</span> {dayjs(comic.uploaded, "MM/DD/YYYY").fromNow()}, {comic.uploaded || "-"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter List */}
        <h2 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">📖 <span>Chapters</span></h2>
        {comic.chapters.length === 0 ? (
          <p className="text-gray-500">Belum ada chapter yang diunggah.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {comic.chapters.map((ch) => (
              <Link
                key={ch.number}
                href={`/reader/${comic.slug}/${ch.number}`}
                className="block border-2 border-blue-100 rounded-lg px-5 py-4 bg-gradient-to-br from-white to-blue-50 shadow hover:shadow-lg hover:border-blue-300 transition group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-600 font-bold group-hover:underline">Chapter {ch.number}</span>
                  <span className="text-xl text-gray-500">
                  {ch.language === "English" && "🇬🇧"}
                  {ch.language === "Japanese" && "🇯🇵"}
                  {ch.language === "Korean" && "🇰🇷"}
                  {ch.language === "Chinese" && "🇨🇳"}
                  {ch.language === "Indonesian" && "🇮🇩"}
                </span>
                </div>
                <div className="text-sm font-medium text-gray-800 mb-1 truncate">{ch.title}</div>
                <div className="text-xs text-gray-500">{ch.uploadChapter ? dayjs(ch.uploadChapter).fromNow() : "-"}</div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}