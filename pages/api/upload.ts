import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public/comics');

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const form = formidable({ multiples: true, uploadDir: '/tmp', keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Parse error:', err);
      return res.status(500).json({ message: 'Form parse error' });
    }

    try {
      const slug = fields.slug?.toString() || 'unknown';
      const slugPath = path.join(uploadDir, slug);
      fs.mkdirSync(slugPath, { recursive: true });

      // Simpan cover
      const coverFile = files.cover as File;
      if (coverFile) {
        const coverPath = path.join(slugPath, 'cover.jpg');
        fs.copyFileSync(coverFile.filepath, coverPath);
      }

      // Simpan setiap chapter
      const chapters = JSON.parse(fields.chapters as string);
      chapters.forEach((ch: any) => {
        const chapterPath = path.join(slugPath, `chapters/${ch.number}`);
        fs.mkdirSync(chapterPath, { recursive: true });

        const chFiles = files[`chapter-${ch.number}`] as File | File[];
        const fileArray = Array.isArray(chFiles) ? chFiles : [chFiles];

        fileArray.forEach((file, idx) => {
          const destPath = path.join(chapterPath, `page${idx + 1}.jpg`);
          fs.copyFileSync(file.filepath, destPath);
        });
      });

      return res.status(200).json({ message: 'Upload successful' });
    } catch (error) {
      console.error('Upload failed:', error);
      return res.status(500).json({ message: 'Upload failed', error });
    }
  });
};

export default handler;
