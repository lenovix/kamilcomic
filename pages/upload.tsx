import { useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import { GetServerSideProps } from "next";
import fs from "fs";
import path from "path";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface UploadComicPageProps {
  defaultSlug: number;
}

export default function UploadComicPage({ defaultSlug }: UploadComicPageProps) {
  const router = useRouter();

  const [comicData, setComicData] = useState({
    slug: defaultSlug.toString(),
    title: "",
    author: "",
    artist: "",
    groups: "",
    parodies: "",
    characters: "",
    categories: "",
    tags: "",
    uploaded: new Date().toISOString().split("T")[0],
    status: "Ongoing",
    cover: "",
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [chapters, setChapters] = useState([
    { number: "001", title: "", language: "English", files: [] as File[] },
  ]);
  const [previewChapterIndex, setPreviewChapterIndex] = useState<number | null>(null);

  const handleComicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComicData({ ...comicData, [e.target.name]: e.target.value });
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setCoverFile(file);
      setComicData({ ...comicData, cover: URL.createObjectURL(file) });
    }
  };

  const handleChapterChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updated = [...chapters];
    const key = e.target.name as keyof (typeof updated)[number];
    if (key === "files") {
      return;
    }
    updated[index][key] = e.target.value as never;
    setChapters(updated);
  };

  const handleChapterFile = (index: number, files: FileList | null) => {
    const updated = [...chapters];
    updated[index].files = files ? Array.from(files) : [];
    setChapters(updated);
  };

  const formatChapterNumber = (num: number) => String(num).padStart(3, "0");

  const addChapter = () => {
    const nextNumber = formatChapterNumber(chapters.length + 1);
    setChapters([
      ...chapters,
      { number: nextNumber, title: "", language: "English", files: [] },
    ]);
  };

  const removeChapter = (index: number) => {
    const updated = [...chapters];
    updated.splice(index, 1);
    const renumbered = updated.map((ch, i) => ({
      ...ch,
      number: formatChapterNumber(i + 1),
    }));
    setChapters(renumbered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comicData.title) {
      alert("Judul komik wajib diisi");
      return;
    }
    if (!chapters.length || !chapters[0].title) {
      alert("Minimal 1 chapter dengan judul wajib diisi");
      return;
    }
    for (const ch of chapters) {
      if (!ch.number || !ch.title || !ch.language) {
        alert("Semua chapter wajib diisi nomor, judul, dan bahasa!");
        return;
      }
      if (!ch.files || ch.files.length === 0) {
        alert(`Chapter ${ch.number} belum ada file halaman!`);
        return;
      }
    }

    const formData = new FormData();
    Object.entries(comicData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (coverFile) {
      formData.append("cover", coverFile);
    }
    formData.append(
      "chapters",
      JSON.stringify(
        chapters.map((ch) => ({
          number: ch.number,
          title: ch.title,
          language: ch.language,
          uploadChapter: comicData.uploaded,
        }))
      )
    );
    chapters.forEach((ch) => {
      if (ch.files && ch.files.length > 0) {
        ch.files.forEach((file) => {
          formData.append(`chapter-${ch.number}`, file);
        });
      }
    });
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        alert("Upload berhasil!");
        router.push("/");
      } else {
        const err = await res.json();
        console.error("Upload error:", err);
        alert(`Upload gagal: ${err.message}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Terjadi kesalahan jaringan");
    }
  };

  const openPreview = (index: number) => {
    setPreviewChapterIndex(index);
  };

  const closePreview = () => {
    setPreviewChapterIndex(null);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || previewChapterIndex === null) return;

    const updatedChapters = [...chapters];
    const files = [...updatedChapters[previewChapterIndex].files];
    const [reorderedItem] = files.splice(result.source.index, 1);
    files.splice(result.destination.index, 0, reorderedItem);
    updatedChapters[previewChapterIndex].files = files;
    setChapters(updatedChapters);
  };

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">📤 Upload Comic</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                name="slug"
                value={comicData.slug}
                onChange={handleComicChange}
                required
                className="border p-2 rounded"
                readOnly
              />
              <input
                name="title"
                placeholder="Title"
                onChange={handleComicChange}
                required
                className="border p-2 rounded"
              />
              <input
                name="author"
                placeholder="Author (pisah dengan koma)"
                onChange={handleComicChange}
                className="border p-2 rounded"
              />
              <input
                name="artist"
                placeholder="Artist (pisah dengan koma)"
                onChange={handleComicChange}
                className="border p-2 rounded"
              />
              <input
                name="groups"
                placeholder="Groups (pisah dengan koma)"
                onChange={handleComicChange}
                className="border p-2 rounded"
              />
              <input
                name="parodies"
                placeholder="Parodies (pisah dengan koma)"
                onChange={handleComicChange}
                className="border p-2 rounded"
              />
              <input
                name="characters"
                placeholder="Characters (pisah dengan koma)"
                onChange={handleComicChange}
                className="border p-2 rounded"
              />
              <input
                name="categories"
                placeholder="Categories (pisah dengan koma)"
                onChange={handleComicChange}
                className="border p-2 rounded"
              />
              <input
                name="tags"
                placeholder="Tags (pisah dengan koma)"
                onChange={handleComicChange}
                className="col-span-2 border p-2 rounded"
              />
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Cover Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="border p-2 rounded w-full"
                />
                {comicData.cover && (
                  <img
                    src={comicData.cover}
                    alt="Preview Cover"
                    className="mt-2 w-48 h-auto rounded shadow"
                  />
                )}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">📄 Chapters</h2>
            {chapters.map((ch, index) => (
              <div
                key={index}
                className="space-y-2 mb-4 border p-3 rounded relative"
              >
                <div className="grid grid-cols-3 gap-4">
                  <input
                    name="number"
                    placeholder="No"
                    value={ch.number}
                    onChange={(e) => handleChapterChange(index, e)}
                    className="border p-2 rounded"
                  />
                  <input
                    name="title"
                    placeholder="Title"
                    value={ch.title}
                    onChange={(e) => handleChapterChange(index, e)}
                    className="border p-2 rounded"
                  />
                  <input
                    name="language"
                    placeholder="Language"
                    value={ch.language}
                    onChange={(e) => handleChapterChange(index, e)}
                    className="border p-2 rounded"
                  />
                </div>
                <input
                  type="file"
                  multiple
                  accept=".zip,.rar,image/*"
                  onChange={(e) => handleChapterFile(index, e.target.files)}
                  className="w-full border p-2 rounded"
                />
                {ch.files && (
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-500">
                      {ch.files.length} file dipilih
                    </p>
                    {ch.files.length > 0 && (
                      <button
                        type="button"
                        onClick={() => openPreview(index)}
                        className="text-sm text-blue-600 hover underline"
                      >
                        Preview Gambar
                      </button>
                    )}
                  </div>
                )}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeChapter(index)}
                    className="absolute top-1 right-2 text-red-500 hover:text-red-700 text-sm"
                  >
                    Hapus
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addChapter}
              className="text-sm text-blue-600 hover:underline"
            >
              + Tambah Chapter
            </button>
          </section>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Simpan Komik
          </button>
        </form>

        {/* Modal untuk Preview Gambar dengan Drag-and-Drop */}
        {previewChapterIndex !== null && chapters[previewChapterIndex].files.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">
                Preview Chapter {chapters[previewChapterIndex].number}
              </h2>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="chapter-images">
                  {(provided) => (
                    <div
                      className="grid grid-cols-2 gap-4"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {chapters[previewChapterIndex].files.map((file, idx) => (
                        file.type.startsWith("image/") && (
                          <Draggable key={idx} draggableId={`image-${idx}`} index={idx}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="relative"
                              >
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Page ${idx + 1}`}
                                  className="w-full h-auto rounded shadow cursor-move"
                                />
                                <span className="absolute top-0 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                                  Page {idx + 1}
                                </span>
                              </div>
                            )}
                          </Draggable>
                        )
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <button
                onClick={closePreview}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const filePath = path.join(process.cwd(), "data", "comics.json");

  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const comics = JSON.parse(data);

    const lastSlug =
      comics.length > 0 ? parseInt(comics[comics.length - 1].slug) : 0;
    const nextSlug = lastSlug + 1;

    return { props: { defaultSlug: nextSlug } };
  } catch (error) {
    console.error("Gagal membaca comics.json:", error);
    return { props: { defaultSlug: 1 } };
  }
};