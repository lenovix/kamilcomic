import { useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import { GetServerSideProps } from "next";
import fs from "fs";
import path from "path";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Alert from "@/components/Alert";

interface UploadComicPageProps {
  defaultSlug: number;
}

export default function UploadComicPage({ defaultSlug }: UploadComicPageProps) {
  const [alertData, setAlertData] = useState<{
    title: string;
    desc?: string;
    type: "success" | "warning" | "error" | "onprogress";
    progress?: number;
  } | null>(null);

  const [uploadProgress, setUploadProgress] = useState(0);
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
  const [previewChapterIndex, setPreviewChapterIndex] = useState<number | null>(
    null
  );

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
      setAlertData({
        title: "Data Tidak Lengkap",
        desc: "Judul komik harus diisi sebelum melanjutkan.",
        type: "error",
      });
      return;
    }

    if (!comicData.cover) {
      setAlertData({
        title: "Data Tidak Lengkap",
        desc: "Tolong upload gambar cover komik sebelum melanjutkan.",
        type: "error",
      });
      return;
    }

    if (!chapters.length || !chapters[0].title) {
      setAlertData({
        title: "Chapter Belum Lengkap",
        desc: "Setidaknya harus ada satu chapter yang memiliki judul.",
        type: "error",
      });
      return;
    }

    for (const ch of chapters) {
      if (!ch.number || !ch.title || !ch.language) {
        setAlertData({
          title: "Data Chapter Tidak Lengkap",
          desc: "Setiap chapter wajib memiliki nomor, judul, dan bahasa.",
          type: "error",
        });
        return;
      }

      if (!ch.files || ch.files.length === 0) {
        setAlertData({
          title: "File Halaman Belum Ada",
          desc: `Chapter ${ch.number} belum memiliki file halaman.`,
          type: "error",
        });
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
      setAlertData({ title: "Uploading...", type: "onprogress", progress: 0 });
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
          setAlertData((prev) =>
            prev ? { ...prev, progress: percent } : null
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setAlertData({
            title: "Upload Berhasil",
            desc: "Data komik berhasil diunggah.",
            type: "success",
          });
          setTimeout(() => {
            router.push("/");
          }, 3000);
        } else {
          let errMessage = "Terjadi kesalahan saat memproses upload.";
          try {
            const err = JSON.parse(xhr.responseText);
            errMessage = err.message || errMessage;
          } catch {}
          setAlertData({
            title: "Gagal Mengunggah",
            desc: errMessage,
            type: "error",
          });
        }
      };

      xhr.onerror = () => {
        setAlertData({
          title: "Kesalahan Jaringan",
          desc: "Tidak dapat terhubung ke server. Periksa koneksi dan coba lagi.",
          type: "error",
        });
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Network error:", error);
      setAlertData({
        title: "Kesalahan Jaringan",
        desc: "Tidak dapat terhubung ke server. Periksa koneksi dan coba lagi.",
        type: "error",
      });
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
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4">
          📤 Upload Comic #{comicData.slug}
        </h1>

        {/* Alert */}
        {alertData && (
          <Alert
            title={alertData.title}
            desc={alertData.desc}
            type={alertData.type}
            progress={alertData.progress}
            onClose={() => setAlertData(null)}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover + Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cover */}
            <div className="flex flex-col items-center space-y-3">
              <label className="block font-medium">Cover Image</label>
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
                  className="mt-2 w-full max-w-xs rounded shadow"
                />
              )}
            </div>

            {/* Form Detail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "title", placeholder: "Title" },
                { name: "parodies", placeholder: "Parodies" },
                { name: "characters", placeholder: "Characters" },
                { name: "tags", placeholder: "Tags" },
                { name: "artist", placeholder: "Artist" },
                { name: "groups", placeholder: "Groups" },
                { name: "author", placeholder: "Author" },
                { name: "categories", placeholder: "Categories" },
              ].map((field) => (
                <input
                  key={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={(comicData as any)[field.name]}
                  onChange={handleComicChange}
                  className="border p-2 rounded w-full"
                />
              ))}
            </div>
          </div>

          {/* Chapters */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">📄 Chapters</h2>

            {chapters.map((ch, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-3 relative "
              >
                {/* Input nomor, title, language */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                  <input
                    name="number"
                    placeholder="No"
                    value={ch.number}
                    onChange={(e) => handleChapterChange(index, e)}
                    className="border p-2 rounded w-full focus:ring-1 focus:ring-blue-400"
                  />
                  <input
                    name="title"
                    placeholder="Title"
                    value={ch.title}
                    onChange={(e) => handleChapterChange(index, e)}
                    className="border p-2 rounded w-full focus:ring-1 focus:ring-blue-400"
                  />
                  <input
                    name="language"
                    placeholder="Language"
                    value={ch.language}
                    onChange={(e) => handleChapterChange(index, e)}
                    className="border p-2 rounded w-full focus:ring-1 focus:ring-blue-400"
                  />
                  <input
                    type="file"
                    multiple
                    accept=".zip,.rar,image/*"
                    onChange={(e) => handleChapterFile(index, e.target.files)}
                    className="border p-2 rounded w-full"
                  />
                </div>

                {/* File info & preview */}
                {ch.files?.length > 0 && (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-500">
                      {ch.files.length} file dipilih
                    </p>
                    <button
                      type="button"
                      onClick={() => openPreview(index)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Preview
                    </button>
                  </div>
                )}

                {/* Tombol hapus */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeChapter(index)}
                    className="absolute top-2 right-2 p-1 rounded hover:bg-red-100 text-red-600"
                    title="Hapus Chapter"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
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
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Simpan Komik
          </button>
        </form>
      </main>

      {/* Modal untuk Preview Gambar dengan Drag-and-Drop */}
      {previewChapterIndex !== null &&
        chapters[previewChapterIndex].files.length > 0 && (
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
                      {chapters[previewChapterIndex].files.map(
                        (file, idx) =>
                          file.type.startsWith("image/") && (
                            <Draggable
                              key={idx}
                              draggableId={`image-${idx}`}
                              index={idx}
                            >
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
                      )}
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
