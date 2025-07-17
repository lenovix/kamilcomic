import comics from "../data/comics.json";
import Link from "next/link";
import Header from "../components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="p-6 max-w-7xl mx-auto">
        {comics.length === 0 ? (
          <p className="text-gray-500">Belum ada komik dalam koleksi kamu.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {comics.map((comic) => (
              <Link
                key={comic.slug}
                href={`/${comic.slug}`}
                className="group relative border rounded-xl overflow-hidden shadow hover:shadow-xl transition duration-200"
              >
                <img
                  src={comic.cover || "/placeholder-cover.jpg"}
                  alt={comic.title}
                  className="w-full h-56 object-cover"
                />
                <div className="p-3 bg-white">
                  <h2 className="text-md font-semibold group-hover:text-blue-600 transition">
                    {comic.title}
                  </h2>
                  <p className="text-xs text-gray-500 mb-1">
                    {comic.genre?.join(", ")}
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
