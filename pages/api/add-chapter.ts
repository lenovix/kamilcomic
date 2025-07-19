import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import formidable, { File } from 'formidable';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  const form = formidable({ multiples: true });
  form.parse(req, async (err: any, fields: any, files: any) => {
    if (err) return res.status(500).json({ message: 'Form parse error', error: err });
    const slug = Array.isArray(fields.slug) ? fields.slug[0] : fields.slug;
    const chapterNumber = Array.isArray(fields.number) ? fields.number[0] : fields.number;
    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
    const language = Array.isArray(fields.language) ? fields.language[0] : fields.language;
    const uploadChapter = Array.isArray(fields.uploadChapter) ? fields.uploadChapter[0] : fields.uploadChapter;
    if (!slug || !chapterNumber) return res.status(400).json({ message: 'slug & number required' });
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
      // Tambah data chapter
      const newChapter = {
        number: String(chapterNumber),
        title: String(title),
        language: String(language),
        uploadChapter: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace('T', ' '),
      };
      comics[idx].chapters.push(newChapter);
      fs.writeFileSync(comicsPath, JSON.stringify(comics, null, 2));
      // Simpan file gambar
      const chapterDir = path.join(process.cwd(), 'public', 'comics', String(slug), 'chapters', String(chapterNumber));
      fs.mkdirSync(chapterDir, { recursive: true });
      let pageFiles = files.pages;
      if (pageFiles) {
        if (!Array.isArray(pageFiles)) pageFiles = [pageFiles];
        // Urutkan file sesuai nama file (agar page1, page2, dst)
        pageFiles.sort((a: File, b: File) => {
          const nameA = a.originalFilename || '';
          const nameB = b.originalFilename || '';
          return nameA.localeCompare(nameB);
        });
        pageFiles.forEach((file: File, idx: number) => {
          if (file && file.filepath) {
            const dest = path.join(chapterDir, `page${idx + 1}.jpg`);
            fs.copyFileSync(file.filepath, dest);
          }
        });
      }
      return res.status(200).json({ message: 'Chapter added' });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to add chapter', error });
    }
  });
}
