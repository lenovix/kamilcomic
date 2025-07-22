import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const commentJson = path.join(process.cwd(), "data/comment-history.json");

    // Kosongkan file data/comics.json
    await fs.writeFile(commentJson, "[]", "utf-8");

    return res
      .status(200)
      .json({ message: "Semua Komen berhasil dihapus." });
  } catch (err) {
    console.error("Error saat menghapus Komen:", err);
    return res.status(500).json({ error: "Gagal menghapus Komen." });
  }
}
