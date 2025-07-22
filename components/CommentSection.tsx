import { useEffect, useState } from "react";

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

export default function CommentSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(`/api/comments/${slug}`)
      .then((res) => res.json())
      .then(setComments);
  }, [slug]);

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
      setComments([...comments, result.comment]);
      setText("");
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
        {comments.map((cmt) => (
          <div
            key={cmt.id}
            className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow transition"
          >
            <p className="text-gray-800 mb-1">{cmt.text}</p>
            <div className="text-sm text-gray-500 flex justify-between">
              <span>{cmt.username}</span>
              <span>{cmt.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
