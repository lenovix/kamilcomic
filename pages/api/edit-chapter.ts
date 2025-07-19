import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  const { slug, chapter, title, language, uploadChapter } = req.body;
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
    comics[idx].chapters[chIdx] = {
      ...comics[idx].chapters[chIdx],
      title,
      language,
      uploadChapter: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace('T', ' '),
    };
    fs.writeFileSync(comicsPath, JSON.stringify(comics, null, 2));
    return res.status(200).json({ message: 'Chapter updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update chapter', error });
  }
}
