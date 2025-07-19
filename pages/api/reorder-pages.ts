import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  const { slug, chapter, order } = req.body;
  if (!slug || !chapter || !Array.isArray(order)) return res.status(400).json({ message: 'Invalid data' });
  const dir = path.join(process.cwd(), 'public', 'comics', String(slug), 'chapters', String(chapter));
  try {
    if (!fs.existsSync(dir)) return res.status(404).json({ message: 'Folder not found' });
    // Step 1: Rename all files to temporary unique names
    const tempNames: string[] = [];
    order.forEach((filename, idx) => {
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

    // Update order in comics.json (pages array)
    const comicsPath = path.join(process.cwd(), 'data', 'comics.json');
    if (fs.existsSync(comicsPath)) {
      const data = fs.readFileSync(comicsPath, 'utf-8');
      let comics = JSON.parse(data);
      const comicIdx = comics.findIndex((c: any) => c.slug === Number(slug));
      if (comicIdx !== -1) {
        const chapterIdx = comics[comicIdx].chapters.findIndex((c: any) => String(c.number) === String(chapter));
        if (chapterIdx !== -1) {
          const chapter = comics[comicIdx].chapters[chapterIdx];
          if (Array.isArray(chapter.pages)) {
            // Buat map filename ke page object lama (agar id tetap)
            const pageMap: Record<string, any> = {};
            chapter.pages.forEach((p: any) => { if (p && p.filename) pageMap[p.filename] = p; });
            // Susun ulang pages sesuai urutan baru
            const newPages = newFilenames.map((fname) => {
              if (fname && pageMap[fname]) return pageMap[fname];
              // fallback: buat object baru jika tidak ketemu
              return { id: `${Date.now()}_${Math.random()}`, filename: fname };
            });
            comics[comicIdx].chapters[chapterIdx].pages = newPages;
            fs.writeFileSync(comicsPath, JSON.stringify(comics, null, 2));
          }
        }
      }
    }

    return res.status(200).json({ message: 'Order updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reorder', error });
  }
}
