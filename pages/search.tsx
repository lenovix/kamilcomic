import { useRouter } from "next/router";
import comics from "../data/comics.json";
import Link from "next/link";
import Header from "../components/Header";
import { useMemo } from "react";

export default function SearchPage() {
  const router = useRouter();
  const query = (router.query.query as string)?.toLowerCase() || "";

  const filteredComics = useMemo(() => {
    return comics.filter((comic) => {
      return (
        (typeof comic.title === "string" && comic.title.toLowerCase().includes(query)) ||
        (typeof comic.author === "string"
          ? comic.author.toLowerCase().includes(query)
          : Array.isArray(comic.author)
          ? comic.author.some((a) => a.toLowerCase().includes(query))
          : false) ||
        comic.tags?.some((g) => g.toLowerCase().includes(query))
      );
    });
  }, [query]);

  return (
    <>
      <Header />
      <main className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          🔍 Hasil Pencarian: <span className="text-blue-600">{query}</span>
        </h1>

        {filteredComics.length === 0 ? (
          <p className="text-gray-500">Tidak ditemukan komik yang cocok.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {filteredComics.map((comic) => (
              <Link
                key={comic.slug}
                href={`/${comic.slug}`}
                className="group border rounded-xl overflow-hidden shadow hover:shadow-lg transition"
              >
                <img
                  src={comic.cover || "/placeholder-cover.jpg"}
                  alt={Array.isArray(comic.title) ? comic.title.join(", ") : comic.title}
                  className="w-full h-56 object-cover"
                />
                <div className="p-3 bg-white">
                  <h2 className="text-md font-semibold group-hover:text-blue-600 transition">
                    {comic.title}
                  </h2>
                  <p className="text-xs text-gray-500 mb-1">
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
