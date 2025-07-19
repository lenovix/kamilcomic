

import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import comicsData from "../data/comics.json";
import Header from "../components/Header";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function EditChapter() {
  const router = useRouter();
  const { slug, chapter } = router.query;
  const [chapterData, setChapterData] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<string[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    if (!slug || !chapter) return;
    const comic = comicsData.find((c) => c.slug === Number(slug));
    if (!comic) return;
    const ch = comic.chapters.find((c: any) => String(c.number) === String(chapter));
    if (ch) {
      setChapterData(ch);
      setForm({
        title: ch.title || "",
        language: ch.language || "",
      });
    }
    // Fetch pages
    fetch(`/api/list-pages?slug=${slug}&chapter=${chapter}`)
      .then((res) => res.json())
      .then((data) => setPages(data.pages || []));
  }, [slug, chapter]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/edit-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, chapter, ...form }),
      });
      if (res.ok) {
        router.push(`/${slug}`);
      } else {
        alert("Gagal update chapter!");
      }
    } catch {
      alert("Gagal update chapter!");
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop reorder
  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const newPages = Array.from(pages);
    const [removed] = newPages.splice(result.source.index, 1);
    newPages.splice(result.destination.index, 0, removed);
    setPages(newPages);
  };

  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      const res = await fetch("/api/reorder-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, chapter, order: pages }),
      });
      if (res.ok) {
        alert("Urutan gambar berhasil disimpan!");
        // reload pages from server
        fetch(`/api/list-pages?slug=${slug}&chapter=${chapter}`)
          .then((res) => res.json())
          .then((data) => setPages(data.pages || []));
      } else {
        alert("Gagal menyimpan urutan gambar!");
      }
    } finally {
      setSavingOrder(false);
    }
  };

  if (!chapterData) return <p className="p-6">Loading...</p>;

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">Edit Chapter {chapterData.number}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Judul Chapter</label>
            <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Bahasa</label>
            <input name="language" value={form.language} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>

        {/* Gambar chapter & drag drop */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-blue-700">Urutkan Gambar Chapter</h2>
            <button
              onClick={handleSaveOrder}
              className="bg-green-600 text-white px-4 py-1 rounded text-sm disabled:opacity-60"
              disabled={savingOrder}
            >
              {savingOrder ? "Menyimpan..." : "Simpan Urutan"}
            </button>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="pages-droppable" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex gap-3 overflow-x-auto py-2"
                  style={{ minHeight: 120 }}
                >
                  {pages.map((filename, idx) => (
                    <Draggable key={filename} draggableId={filename} index={idx}>
                      {(prov, snapshot) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className={`border rounded shadow bg-white p-2 flex flex-col items-center min-w-[100px] ${snapshot.isDragging ? 'ring-2 ring-blue-400' : ''}`}
                        >
                          <img
                            src={`/comics/${slug}/chapters/${chapter}/${filename}`}
                            alt={`Page ${idx + 1}`}
                            className="w-20 h-28 object-contain mb-1"
                          />
                          <span className="text-xs text-gray-600">{filename}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </main>
    </>
  );
}
