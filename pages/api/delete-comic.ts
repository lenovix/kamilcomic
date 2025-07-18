import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { slug } = req.body;
  if (!slug) {
    return res.status(400).json({ message: 'Slug is required' });
  }
  try {
    // Hapus data dari comics.json
    const comicsPath = path.join(process.cwd(), 'data', 'comics.json');
    let comics = [];
    if (fs.existsSync(comicsPath)) {
      const data = fs.readFileSync(comicsPath, 'utf-8');
      comics = JSON.parse(data);
    }
    const newComics = comics.filter((c: any) => c.slug !== Number(slug));
    fs.writeFileSync(comicsPath, JSON.stringify(newComics, null, 2));

    // Hapus folder komik beserta chapter dan cover
    const comicDir = path.join(process.cwd(), 'public', 'comics', String(slug));
    if (fs.existsSync(comicDir)) {
      fs.rmSync(comicDir, { recursive: true, force: true });
    }
    return res.status(200).json({ message: 'Comic deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete comic', error });
  }
}
