import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import formidable, { File } from 'formidable';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const form = formidable({ multiples: false });
  form.parse(req, async (err: any, fields: any, files: any) => {
    if (err) return res.status(500).json({ message: 'Form parse error', error: err });
    const slug = fields.slug;
    if (!slug) return res.status(400).json({ message: 'Slug is required' });
    try {
      const comicsPath = path.join(process.cwd(), 'data', 'comics.json');
      let comics = [];
      if (fs.existsSync(comicsPath)) {
        const data = fs.readFileSync(comicsPath, 'utf-8');
        comics = JSON.parse(data);
      }
      const idx = comics.findIndex((c: any) => c.slug === Number(slug));
      if (idx === -1) return res.status(404).json({ message: 'Comic not found' });
      // Helper: string/array to array (split by koma)
      const toArray = (val: any): string[] => {
        if (Array.isArray(val)) return val.flatMap((v) => toArray(v));
        if (typeof val === 'string') {
          if (val.includes(',')) return val.split(',').map((t) => t.trim()).filter(Boolean);
          return [val.trim()];
        }
        return [];
      };
      // Update data
      comics[idx] = {
        ...comics[idx],
        slug: Number(slug),
        title: typeof fields.title === 'string' ? fields.title : Array.isArray(fields.title) ? fields.title[0] : '',
        parodies: toArray(fields.parodies),
        characters: toArray(fields.characters),
        artists: toArray(fields.artists),
        groups: toArray(fields.groups),
        categories: toArray(fields.categories),
        uploaded: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace('T', ' '),
        author: toArray(fields.author),
        tags: toArray(fields.tags),
        status: typeof fields.status === 'string' ? fields.status : Array.isArray(fields.status) ? fields.status[0] : '',
        cover: comics[idx].cover // cover akan diupdate di bawah jika ada file baru
      };
      // Jika ada file cover baru, replace cover lama
      let coverFile = files.cover as any;
      if (Array.isArray(coverFile)) coverFile = coverFile[0];
      if (
        coverFile &&
        coverFile.filepath &&
        coverFile.originalFilename &&
        coverFile.originalFilename !== '' &&
        fs.existsSync(coverFile.filepath)
      ) {
        const coverPath = path.join(process.cwd(), 'public', 'comics', String(slug), 'cover.jpg');
        fs.copyFileSync(coverFile.filepath, coverPath);
      }
      fs.writeFileSync(comicsPath, JSON.stringify(comics, null, 2));
      return res.status(200).json({ message: 'Comic updated' });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update comic', error });
    }
  });
}
