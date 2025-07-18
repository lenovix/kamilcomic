
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import comicsData from "../data/comics.json";
import Header from "../components/Header";

export default function EditComic() {
  const router = useRouter();
  const { slug } = router.query;
  const [comic, setComic] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const found = comicsData.find((c) => c.slug === Number(slug));
    if (found) {
      setComic(found);
      setForm({
        title: found.title || "",
        parodies: Array.isArray(found.parodies) ? found.parodies.join(", ") : found.parodies || "",
        characters: Array.isArray(found.characters) ? found.characters.join(", ") : found.characters || "",
        artists: Array.isArray(found.artists) ? found.artists.join(", ") : found.artists || "",
        groups: Array.isArray(found.groups) ? found.groups.join(", ") : found.groups || "",
        categories: Array.isArray(found.categories) ? found.categories.join(", ") : found.categories || "",
        uploaded: found.uploaded || "",
        author: Array.isArray(found.author) ? found.author.join(", ") : found.author || "",
        tags: Array.isArray(found.tags) ? found.tags.join(", ") : found.tags || "",
        status: found.status || "",
      });
    }
  }, [slug]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
    } else {
      setCoverFile(null);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('slug', String(slug));
      Object.keys(form).forEach((key) => {
        fd.append(key, form[key]);
      });
      if (coverFile) {
        fd.append('cover', coverFile);
      }
      const res = await fetch("/api/edit-comic", {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        router.push(`/${slug}`);
      } else {
        alert("Gagal update komik!");
      }
    } catch {
      alert("Gagal update komik!");
    } finally {
      setLoading(false);
    }
  };

  if (!comic) return <p className="p-6">Loading...</p>;

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">Edit Komik</h1>
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div>
            <label className="block font-semibold mb-1">Judul</label>
            <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Parodies</label>
            <input name="parodies" value={form.parodies} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Characters</label>
            <input name="characters" value={form.characters} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Artists</label>
            <input name="artists" value={form.artists} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Groups</label>
            <input name="groups" value={form.groups} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Categories</label>
            <input name="categories" value={form.categories} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Uploaded</label>
            <input name="uploaded" value={form.uploaded} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Author</label>
            <input name="author" value={form.author} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Tags</label>
            <input name="tags" value={form.tags} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Status</label>
            <input name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Cover (opsional, upload untuk ganti cover)")</label>
            <input type="file" name="cover" accept="image/*" onChange={handleCoverChange} className="w-full border rounded px-3 py-2" />
            {comic.cover && (
              <img src={comic.cover} alt="cover" className="w-32 h-auto mt-2 rounded border" />
            )}
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </main>
    </>
  );
}
