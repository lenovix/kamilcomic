import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  const { slug, chapter, title, language, uploadChapter, order } = req.body;
  if (!slug || !chapter) return res.status(400).json({ message: 'slug & chapter required' });
  try {
    // Update comics.json
    const comicsPath = path.join(process.cwd(), 'data', 'comics.json');
    let comics = [];
    if (fs.existsSync(comicsPath)) {
      const data = fs.readFileSync(comicsPath, 'utf-8');
      comics = JSON.parse(data);
    }
    const idx = comics.findIndex((c: any) => c.slug === Number(slug));
    if (idx === -1) return res.status(404).json({ message: 'Comic not found' });
    const chIdx = comics[idx].chapters.findIndex((c: any) => String(c.number) === String(chapter));
    if (chIdx === -1) return res.status(404).json({ message: 'Chapter not found' });
    // Update judul, bahasa, tanggal
    comics[idx].chapters[chIdx] = {
      ...comics[idx].chapters[chIdx],
      title,
      language,
      uploadChapter: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace('T', ' '),
    };

    // Jika ada order (urutan gambar), update urutan pages dan rename file di folder
    if (Array.isArray(order) && comics[idx].chapters[chIdx].pages) {
      // 1. Rename file di folder agar urutan file fisik sesuai order baru
      const dir = path.join(process.cwd(), 'public', 'comics', String(slug), 'chapters', String(chapter));
      if (fs.existsSync(dir)) {
        // Step 1: Rename all files to temporary unique names
        const tempNames: string[] = [];
        order.forEach((filename: string, idx: number) => {
          const oldPath = path.join(dir, filename);
          const tempName = `__tmp__${idx}.jpg`;
          const tempPath = path.join(dir, tempName);
          if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, tempPath);
            tempNames.push(tempName);
          } else {
            tempNames.push("");
          }
        });
        // Step 2: Rename temp files to final names (page1.jpg, page2.jpg, ...)
        const newFilenames: string[] = [];
        tempNames.forEach((tempName, idx) => {
          if (!tempName) return;
          const tempPath = path.join(dir, tempName);
          const finalName = `page${idx + 1}.jpg`;
          const finalPath = path.join(dir, finalName);
          if (fs.existsSync(tempPath)) {
            fs.renameSync(tempPath, finalPath);
            newFilenames.push(finalName);
          } else {
            newFilenames.push("");
          }
        });
        // 2. Update urutan pages di JSON
        const pageMap: Record<string, any> = {};
        comics[idx].chapters[chIdx].pages.forEach((p: any) => { if (p && p.filename) pageMap[p.filename] = p; });
        const newPages = newFilenames.map((fname) => {
          if (fname && pageMap[fname]) return pageMap[fname];
          return { id: `${Date.now()}_${Math.random()}`, filename: fname };
        });
        comics[idx].chapters[chIdx].pages = newPages;
      }
    }
    fs.writeFileSync(comicsPath, JSON.stringify(comics, null, 2));
    return res.status(200).json({ message: 'Chapter updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update chapter', error });
  }
}
