import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import comicsData from "../data/comics.json";
import Header from "../components/Header";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function AddChapter() {
  const router = useRouter();
  const { slug } = router.query;
  const [comic, setComic] = useState<any>(null);
  // Find next chapter number
  const nextChapterNumber = comic && comic.chapters && comic.chapters.length > 0
    ? String(
        comic.chapters
          .map((ch: any) => Number(ch.number))
          .filter((n: number) => !isNaN(n))
          .reduce((max: number, n: number) => Math.max(max, n), 0) + 1
      ).padStart(3, '0')
    : '001';

  const [form, setForm] = useState<any>({
    number: nextChapterNumber,
    title: '',
    language: '',
    files: null,
  });
  // For drag-and-drop preview and ordering
  const [previewPages, setPreviewPages] = useState<Array<{id: string, file: File, url: string}>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const found = comicsData.find((c) => c.slug === Number(slug));
    if (found) setComic(found);
    // Update chapter number if comic changes
    if (found && found.chapters) {
      const nextNum = found.chapters.length > 0
        ? String(
            found.chapters
              .map((ch: any) => Number(ch.number))
              .filter((n: number) => !isNaN(n))
              .reduce((max: number, n: number) => Math.max(max, n), 0) + 1
          ).padStart(3, '0')
        : '001';
      setForm((prev: any) => ({ ...prev, number: nextNum }));
    }
  }, [slug]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setForm({ ...form, files: files });
    // Create preview objects for drag-and-drop
    setPreviewPages(files.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      file,
      url: URL.createObjectURL(file)
    })));
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
      // fd.append('uploadChapter', form.uploadChapter); // Remove manual upload date
      // Use previewPages order for upload
      previewPages.forEach((item) => {
        fd.append('pages', item.file, item.file.name);
      });
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
  // Drag and drop reorder for previewPages
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const newPages = Array.from(previewPages);
    const [removed] = newPages.splice(result.source.index, 1);
    newPages.splice(result.destination.index, 0, removed);
    setPreviewPages(newPages);
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
            <input name="number" value={form.number} readOnly className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Judul Chapter</label>
            <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Bahasa</label>
            <input name="language" value={form.language} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          {/* Tanggal upload dihilangkan, otomatis terisi di backend */}
          <div>
            <label className="block font-semibold mb-1">File Gambar (halaman, urutkan sesuai drag & drop)</label>
            <input type="file" name="pages" accept="image/*" multiple onChange={handleFilesChange} className="w-full border rounded px-3 py-2" required />
          </div>
          {/* Drag and drop preview for uploaded images */}
          {previewPages.length > 0 && (
            <div className="mb-4">
              <label className="block font-semibold mb-1">Urutkan Gambar Sebelum Upload</label>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="preview-pages-droppable" direction="horizontal">
                  {(provided: any) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex gap-3 overflow-x-auto py-2 min-h-[120px]"
                      style={{ minHeight: 120, minWidth: previewPages.length === 0 ? 200 : undefined }}
                      id="dnd-preview-pages-container"
                    >
                      {previewPages.map((item, idx) => (
                        <Draggable key={item.id} draggableId={item.id} index={idx}>
                          {(prov: any, snapshot: any) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              className={`border rounded shadow bg-white p-2 flex flex-col items-center min-w-[100px] select-none ${snapshot.isDragging ? 'ring-2 ring-blue-400' : ''}`}
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
                                src={item.url}
                                alt={`Page ${idx + 1}`}
                                className="w-20 h-28 object-contain mb-1"
                                draggable={false}
                                style={{ pointerEvents: 'none' }}
                              />
                              <span className="text-xs text-gray-600">{item.file.name}</span>
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
          )}
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? "Mengupload..." : "Tambah Chapter"}
          </button>
        </form>
      </main>
    </>
  );
}
