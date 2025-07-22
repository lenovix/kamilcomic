import { useEffect, useState } from "react";

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  edited?: boolean;
}

export default function CommentSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Ambil komentar dari server
  useEffect(() => {
    fetch(`/api/comments/${slug}`)
      .then((res) => res.json())
      .then(setComments);
  }, [slug]);

  // Submit komentar baru
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const res = await fetch(`/api/comments/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const result = await res.json();
    if (result.comment) {
      setComments((prev) => [result.comment, ...prev]);
      setText("");
    }
  };

  // Hapus komentar
  const handleDelete = async (id: string) => {
    const confirmed = confirm("Hapus komentar ini?");
    if (!confirmed) return;

    await fetch(`/api/comments/${slug}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  // Edit komentar
  const handleEdit = async (id: string) => {
    if (!editingText.trim()) return;

    const res = await fetch(`/api/comments/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, text: editingText }),
    });

    const result = await res.json();
    if (result.comment) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, text: editingText, timestamp: result.comment.timestamp, edited: true } : c
        )
      );
      setEditingId(null);
      setEditingText("");
    }
  };

  return (
    <div className="mt-10 border-t border-gray-300 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        💬 Komentar
        <span className="text-sm text-gray-500">({comments.length})</span>
      </h3>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          rows={3}
          placeholder="Tulis komentarmu di sini..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-3 text-right">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
          >
            Kirim Komentar
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {[...comments]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .map((cmt) => (
            <div
              key={cmt.id}
              className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow transition"
            >
              {editingId === cmt.id ? (
                <>
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-2 text-black"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleEdit(cmt.id)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Simpan
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-800 mb-1">{cmt.text}</p>
                  <div className="text-sm text-gray-500 flex justify-between">
                    <span>{cmt.username}</span>
                    <span>
                      {cmt.timestamp}
                      {cmt.edited ? " (edited)" : ""}
                    </span>
                  </div>
                  <div className="text-right mt-2 space-x-3">
                    <button
                      onClick={() => {
                        setEditingId(cmt.id);
                        setEditingText(cmt.text);
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cmt.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
