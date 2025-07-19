import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import comicsData from "../data/comics.json";
import Header from "../components/Header";

export default function AddChapter() {
  const router = useRouter();
  const { slug } = router.query;
  const [comic, setComic] = useState<any>(null);
  const [form, setForm] = useState<any>({
    number: '',
    title: '',
    language: '',
    uploadChapter: '',
    files: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const found = comicsData.find((c) => c.slug === Number(slug));
    if (found) setComic(found);
  }, [slug]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, files: e.target.files });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('slug', String(slug));
      fd.append('number', form.number);
      fd.append('title', form.title);
      fd.append('language', form.language);
      fd.append('uploadChapter', form.uploadChapter);
      if (form.files) {
        (Array.from(form.files) as File[]).forEach((file, idx) => {
          fd.append('pages', file, file.name);
        });
      }
      const res = await fetch('/api/add-chapter', {
        method: 'POST',
        body: fd,
      });
      if (res.ok) {
        router.push(`/${slug}`);
      } else {
        alert('Gagal menambah chapter!');
      }
    } catch {
      alert('Gagal menambah chapter!');
    } finally {
      setLoading(false);
    }
  };

  if (!comic) return <p className="p-6">Loading...</p>;

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">Tambah Chapter Baru</h1>
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div>
            <label className="block font-semibold mb-1">Nomor Chapter</label>
            <input name="number" value={form.number} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Judul Chapter</label>
            <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Bahasa</label>
            <input name="language" value={form.language} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Tanggal Upload</label>
            <input name="uploadChapter" value={form.uploadChapter} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">File Gambar (halaman, urutkan sesuai nama file)</label>
            <input type="file" name="pages" accept="image/*" multiple onChange={handleFilesChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? "Mengupload..." : "Tambah Chapter"}
          </button>
        </form>
      </main>
    </>
  );
}
