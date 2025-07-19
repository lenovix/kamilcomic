import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'comics');

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  // Gunakan folder temp lokal agar cross-platform
  const tempDir = path.join(process.cwd(), 'public', 'tmp_upload');
  fs.mkdirSync(tempDir, { recursive: true });
  const form = formidable({ multiples: true, uploadDir: tempDir, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Parse error:', err);
      return res.status(500).json({ message: 'Form parse error' });
    }

    try {
      const slug = fields.slug?.toString() || 'unknown';
      const slugPath = path.join(uploadDir, slug);
      fs.mkdirSync(slugPath, { recursive: true });

      // Simpan cover di public/comics/[slug]/cover.jpg
      let coverFile = files.cover as File | File[] | undefined;
      if (Array.isArray(coverFile)) coverFile = coverFile[0];
      if (coverFile && coverFile.filepath) {
        const coverPath = path.join(slugPath, 'cover.jpg');
        fs.copyFileSync(coverFile.filepath, coverPath);
      }

      // Simpan setiap chapter di public/comics/[slug]/chapters/[chapterNumber]/
      let chaptersRaw = fields.chapters;
      let chaptersStr = '';
      if (Array.isArray(chaptersRaw)) {
        chaptersStr = chaptersRaw[0];
      } else if (typeof chaptersRaw === 'string') {
        chaptersStr = chaptersRaw;
      } else {
        chaptersStr = '';
      }
      const chapters = chaptersStr ? JSON.parse(chaptersStr) : [];
      // Build pages array for each chapter
      const chaptersWithPages = chapters.map((ch: any) => {
        const chapterPath = path.join(slugPath, 'chapters', ch.number);
        fs.mkdirSync(chapterPath, { recursive: true });

        const chFiles = files[`chapter-${ch.number}`] as File | File[] | undefined;
        if (!chFiles) return { ...ch, pages: [] };
        const fileArray = Array.isArray(chFiles) ? chFiles : [chFiles];
        let pagesArr: { id: string, filename: string }[] = [];
        fileArray.forEach((file, idx) => {
          if (!file || !file.filepath) return;
          const filename = `page${idx + 1}.jpg`;
          const destPath = path.join(chapterPath, filename);
          fs.copyFileSync(file.filepath, destPath);
          pagesArr.push({ id: `${Date.now()}_${idx}`, filename });
        });
        return { ...ch, pages: pagesArr };
      });

      // Simpan ke comics.json
      const comicsPath = path.join(process.cwd(), 'data', 'comics.json');
      let comics = [];
      if (fs.existsSync(comicsPath)) {
        const data = fs.readFileSync(comicsPath, 'utf-8');
        comics = JSON.parse(data);
      }

      // Siapkan data komik baru
      // Helper: ambil string dari field (array/string/undefined)
      const getString = (val: any) => Array.isArray(val) ? val[0] : (val ?? '');
      // Helper: string/array to array (split by koma)
      const toArray = (val: any): string[] => {
        if (Array.isArray(val)) return val.flatMap((v) => toArray(v));
        if (typeof val === 'string') {
          if (val.includes(',')) return val.split(',').map((t) => t.trim()).filter(Boolean);
          return [val.trim()];
        }
        return [];
      };
      const newComic = {
        slug: Number(slug),
        title: Array.isArray(fields.title) ? fields.title[0] : (fields.title ?? ''),
        parodies: toArray(fields.parodies),
        characters: toArray(fields.characters),
        artists: toArray(fields.artist || fields.artists),
        groups: toArray(fields.groups),
        categories: toArray(fields.categories),
        uploaded: getString(fields.uploaded),
        author: getString(fields.author),
        tags: toArray(fields.tags),
        status: getString(fields.status),
        cover: `/comics/${slug}/cover.jpg`,
        chapters: chaptersWithPages.map((ch: any) => ({
          number: ch.number,
          title: ch.title,
          language: ch.language,
          uploadChapter: ch.uploadChapter || getString(fields.uploaded),
          pages: ch.pages || []
        })),
      };

      // Cek jika slug sudah ada, replace, jika tidak, push
      const idx = comics.findIndex((c: any) => c.slug == slug);
      if (idx !== -1) {
        comics[idx] = newComic;
      } else {
        comics.push(newComic);
      }
      fs.writeFileSync(comicsPath, JSON.stringify(comics, null, 2));

      return res.status(200).json({ message: 'Upload successful' });
    } catch (error) {
      console.error('Upload failed:', error);
      return res.status(500).json({ message: 'Upload failed', error });
    }
  });
};

export default handler;
