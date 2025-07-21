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
    const tmpPath = path.join(process.cwd(), "public", "tmp_upload");
    await fs.rm(tmpPath, { recursive: true, force: true });
    await fs.mkdir(tmpPath); // Buat ulang folder kosong
    return res.status(200).json({ message: "Cache berhasil dibersihkan." });
  } catch (err) {
    return res.status(500).json({ error: "Gagal membersihkan cache." });
  }
}
