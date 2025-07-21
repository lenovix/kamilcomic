import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import comicsData from "../data/comics.json";
import Header from "../components/Header";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function EditChapter() {
  const router = useRouter();
  const { slug, chapter } = router.query;
  const [chapterData, setChapterData] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<Array<{ id: string; file?: File; url?: string; filename?: string }>>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

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
      .then((data) => {
        // Support both array of string and array of object
        if (Array.isArray(data.pages) && data.pages.length > 0 && typeof data.pages[0] === 'object') {
          setPages(
            data.pages.map((page: any, idx: number) => ({
              id: page.id || `${idx}-${page.filename}`,
              url: `/comics/${slug}/chapters/${chapter}/${page.filename}`,
              filename: page.filename
            }))
          );
        } else if (Array.isArray(data.pages)) {
          setPages(
            data.pages.map((filename: string, idx: number) => ({
              id: `${idx}-${filename}`,
              url: `/comics/${slug}/chapters/${chapter}/${filename}`,
              filename
            }))
          );
        } else {
          setPages([]);
        }
      });
  }, [slug, chapter]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setNewFiles(files);
    const newPages = files.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      file,
      url: URL.createObjectURL(file),
    }));
    setPages([...pages, ...newPages]);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("slug", slug as string);
    formData.append("chapter", chapter as string);
    formData.append("title", form.title);
    formData.append("language", form.language);
    formData.append("order", JSON.stringify(pages.map((page) => page.id)));
    newFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("/api/edit-chapter", {
        method: "POST",
        body: formData,
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

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const newPages = Array.from(pages);
    const [removed] = newPages.splice(result.source.index, 1);
    newPages.splice(result.destination.index, 0, removed);
    setPages(newPages);
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
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Bahasa</label>
            <input
              name="language"
              value={form.language}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Upload Gambar Baru</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>

        {/* Gambar chapter & drag drop */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-blue-700 mb-2">Urutkan Gambar Chapter</h2>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="pages-droppable" direction="horizontal">
              {(provided: any) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex gap-3 overflow-x-auto py-2 min-h-[120px]"
                  style={{ minHeight: 120, minWidth: pages.length === 0 ? 200 : undefined }}
                  id="dnd-pages-container"
                >
                  {pages.length === 0 && (
                    <span className="text-gray-400 text-sm">Tidak ada gambar di chapter ini.</span>
                  )}
                  {pages.map((page, idx) => (
                    <Draggable key={page.id} draggableId={page.id} index={idx}>
                      {(prov: any, snapshot: any) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          className={`border rounded shadow bg-white p-2 flex flex-col items-center min-w-[100px] select-none ${snapshot.isDragging ? "ring-2 ring-blue-400" : ""}`}
                          style={{ minWidth: 100, ...prov.draggableProps.style }}
                        >
                          <span
                            {...prov.dragHandleProps}
                            className="cursor-grab text-gray-400 hover:text-blue-500 mb-1"
                            title="Geser untuk urutkan"
                            style={{ fontSize: 18 }}
                          >
                            ☰
                          </span>
                          <img
                            src={page.url}
                            alt={`Page ${idx + 1}`}
                            className="w-20 h-28 object-contain mb-1"
                            draggable={false}
                            style={{ pointerEvents: "none" }}
                            onError={(e) => { e.currentTarget.src = '/file.svg'; }}
                          />
                          <span className="text-xs text-gray-600">
                            {page.filename || (page.file ? page.file.name : page.id.split("-").slice(1).join("-"))}
                          </span>
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