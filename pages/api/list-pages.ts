import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug, chapter } = req.query;
  if (!slug || !chapter) return res.status(400).json({ pages: [] });
  const dir = path.join(process.cwd(), 'public', 'comics', String(slug), 'chapters', String(chapter));
  try {
    if (!fs.existsSync(dir)) return res.status(200).json({ pages: [] });
    const files = fs.readdirSync(dir)
      .filter(f => /^page\d+\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort((a, b) => {
        // Sort by page number
        const na = parseInt(a.replace(/\D/g, ''));
        const nb = parseInt(b.replace(/\D/g, ''));
        return na - nb;
      });
    return res.status(200).json({ pages: files });
  } catch {
    return res.status(200).json({ pages: [] });
  }
}
