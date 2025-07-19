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
    // Rename files to match new order: page1.jpg, page2.jpg, ...
    order.forEach((filename, idx) => {
      const oldPath = path.join(dir, filename);
      const newPath = path.join(dir, `page${idx + 1}.jpg`);
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
      }
    });
    return res.status(200).json({ message: 'Order updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reorder', error });
  }
}
