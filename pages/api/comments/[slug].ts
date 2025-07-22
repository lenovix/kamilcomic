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

  if (req.method === "GET") {
    const comments = allComments[slug] || [];
    return res.status(200).json(comments);
  }

  if (req.method === "POST") {
    const { username = "Anon", text } = req.body;
    if (!text) return res.status(400).json({ error: "Komentar kosong" });

    const newComment = {
      id: `cmt_${Date.now()}`,
      username,
      text,
      timestamp: new Date()
        .toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" })
        .replace("T", " "),
    };

    const updatedComments = [...(allComments[slug] || []), newComment];
    allComments[slug] = updatedComments;

    fs.writeFileSync(commentsPath, JSON.stringify(allComments, null, 2));
    return res
      .status(200)
      .json({ message: "Komentar ditambahkan", comment: newComment });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
