import { useEffect } from "react";
import { useRouter } from "next/router";
import comics from "../data/comics.json";

export default function RandomComicRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (comics.length > 0) {
      const randomIndex = Math.floor(Math.random() * comics.length);
      const randomComic = comics[randomIndex];
      router.replace(`/${randomComic.slug}`);
    }
  }, []);

  return (
    <main className="p-6 text-center">
      <p className="text-gray-500">Mengambil komik acak...</p>
    </main>
  );
}
