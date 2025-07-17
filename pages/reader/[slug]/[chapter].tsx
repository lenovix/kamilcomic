import { useRouter } from "next/router";
import comics from "../../../data/comics.json";

export default function ReaderPage() {
  const { query } = useRouter();
  const comic = comics.find((c) => c.slug === query.slug);
  const chapter = comic?.chapters.find((ch) => ch.number === query.chapter);

  if (!comic || !chapter) return <p>Loading...</p>;

  const imagePath = `/comics/${comic.slug}/chapters/${chapter.number}`;

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-2">
        {comic.title} - Chapter {chapter.number}
      </h1>
      <div className="flex flex-col items-center gap-4">
        {[...Array(30)].map((_, i) => (
          <img
            key={i}
            src={`${imagePath}/page${i + 1}.jpg`}
            alt={`Page ${i + 1}`}
            onError={(e) => (e.currentTarget.style.display = "none")}
            className="w-full max-w-2xl"
          />
        ))}
      </div>
    </main>
  );
}
