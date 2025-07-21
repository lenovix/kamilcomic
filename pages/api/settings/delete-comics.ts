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
    const comicsDir = path.join(process.cwd(), "public/comics");
    const comicsJson = path.join(process.cwd(), "data/comics.json");

    // Hapus folder public/comics
    await fs.rm(comicsDir, { recursive: true, force: true });
    await fs.mkdir(comicsDir); // Buat ulang folder kosong

    // Kosongkan file data/comics.json
    await fs.writeFile(comicsJson, "[]", "utf-8");

    return res
      .status(200)
      .json({ message: "Semua komik dan data berhasil dihapus." });
  } catch (err) {
    console.error("Error saat menghapus komik:", err);
    return res.status(500).json({ error: "Gagal menghapus komik." });
  }
}
