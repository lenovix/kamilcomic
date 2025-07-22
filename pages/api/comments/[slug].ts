import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const commentsPath = path.join(process.cwd(), "data", "comment-history.json");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const slug = req.query.slug as string;
  if (!slug) return res.status(400).json({ error: "Slug tidak ditemukan" });

  const raw = fs.existsSync(commentsPath)
    ? fs.readFileSync(commentsPath, "utf-8")
    : "{}";
  const allComments = JSON.parse(raw);

  const comments = allComments[slug] || [];

  // === GET: Ambil semua komentar
  if (req.method === "GET") {
    return res.status(200).json(comments);
  }

  // === POST: Tambah komentar baru
  if (req.method === "POST") {
    const { username = "Anon", text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "Komentar kosong" });

    const newComment = {
      id: `cmt_${Date.now()}`,
      username,
      text,
      timestamp: new Date()
        .toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" })
        .replace("T", " "),
    };

    allComments[slug] = [...comments, newComment];
    fs.writeFileSync(commentsPath, JSON.stringify(allComments, null, 2));

    return res.status(200).json({ message: "Komentar ditambahkan", comment: newComment });
  }

  // === PUT: Edit komentar
  if (req.method === "PUT") {
    const { id, text } = req.body;
    if (!id || !text?.trim())
      return res.status(400).json({ error: "ID atau komentar kosong" });

    const index = comments.findIndex((c: any) => c.id === id);
    if (index === -1) return res.status(404).json({ error: "Komentar tidak ditemukan" });

    comments[index].text = text;
    comments[index].edited = true;
    comments[index].timestamp = new Date()
      .toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" })
      .replace("T", " ");

    allComments[slug] = comments;
    fs.writeFileSync(commentsPath, JSON.stringify(allComments, null, 2));

    return res.status(200).json({ message: "Komentar diedit", comment: comments[index] });
  }

  // === DELETE: Hapus komentar
  if (req.method === "DELETE") {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "ID komentar tidak diberikan" });

    const filtered = comments.filter((c: any) => c.id !== id);
    if (filtered.length === comments.length)
      return res.status(404).json({ error: "Komentar tidak ditemukan" });

    allComments[slug] = filtered;
    fs.writeFileSync(commentsPath, JSON.stringify(allComments, null, 2));

    return res.status(200).json({ message: "Komentar dihapus" });
  }

  return res.status(405).json({ error: "Method tidak didukung" });
}
