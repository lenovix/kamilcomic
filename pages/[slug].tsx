import { useRouter } from "next/router";
import comics from "../data/comics.json";
import Link from "next/link";

export default function ComicDetail() {
  const { query } = useRouter();
  const comic = comics.find((c) => c.slug === query.slug);

  if (!comic) return <p className="p-6">Loading...</p>;

  return (
    <main className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <img
          src={comic.cover || "/placeholder-cover.jpg"}
          alt={comic.title}
          className="w-48 h-auto rounded shadow-md"
        />
        <div>
          <h1 className="text-3xl font-bold mb-2">{comic.title}</h1>
          <p className="text-gray-700 mb-2">
            <strong>Author:</strong> {comic.author || "Unknown"}
          </p>
          <p className="mb-2">
            <strong>Status:</strong>{" "}
            <span
              className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                comic.status === "Completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {comic.status || "Unknown"}
            </span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <strong>Genre:</strong>
            {comic.genre?.map((g) => (
              <span
                key={g}
                className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Chapter List */}
      <h2 className="text-xl font-semibold mb-3">📖 Chapters</h2>
      {comic.chapters.length === 0 ? (
        <p className="text-gray-500">Belum ada chapter yang diunggah.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {comic.chapters.map((ch) => (
            <Link
              key={ch.number}
              href={`/reader/${comic.slug}/${ch.number}`}
              className="block border rounded-md px-4 py-3 bg-white shadow hover:shadow-md transition"
            >
              <h3 className="text-sm font-semibold">
                Chapter {ch.number}: {ch.title}
              </h3>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
