import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import formidable, { IncomingForm } from 'formidable';

export const config = {
  api: {
    bodyParser: false, // Disable default body parser to handle FormData
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  // Ensure temp directory exists
  const tempDir = path.join(process.cwd(), 'public', 'tmp_upload');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir: tempDir, // Temporary directory for uploads
    keepExtensions: true,
  });

  try {
    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const { slug, chapter, title, language, order } = fields;
    const uploadedFiles = files.files ? (Array.isArray(files.files) ? files.files : [files.files]) : [];

    if (!slug || !chapter) return res.status(400).json({ message: 'slug & chapter required' });

    // Load comics.json
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

    // Update chapter metadata, handling array or string for title and language
    comics[idx].chapters[chIdx] = {
      ...comics[idx].chapters[chIdx],
      title: Array.isArray(title) ? title[0] : title, // Normalize to string
      language: Array.isArray(language) ? language[0] : language, // Normalize to string
      uploadChapter: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace('T', ' '),
    };

    // Handle uploaded files
    const dir = path.join(process.cwd(), 'public', 'comics', String(slug), 'chapters', String(chapter));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let newFilenames: string[] = [];
    let newPageEntries: Array<{ id: string; filename: string }> = [];
    const existingPages = comics[idx].chapters[chIdx].pages || [];
    const existingPageCount = existingPages.length;

    if (uploadedFiles.length > 0) {
      newFilenames = uploadedFiles.map((file: any, idx: number) => {
        if (!file.filepath || !fs.existsSync(file.filepath)) {
          throw new Error(`File not found: ${file.originalFilename}`);
        }
        const ext = path.extname(file.originalFilename) || '.jpg';
        const newName = `page${existingPageCount + idx + 1}${ext}`;
        const newPath = path.join(dir, newName);
        fs.renameSync(file.filepath, newPath); // Move file from temp to final destination
        return newName;
      });

      // Create new page entries for uploaded files
      newPageEntries = newFilenames.map((filename, idx) => ({
        id: `new-${Date.now()}-${idx}`,
        filename,
      }));
    }

    // Parse order from JSON string
    let orderArray: string[] = [];
    try {
      orderArray = order ? JSON.parse(order) : [];
    } catch {
      return res.status(400).json({ message: 'Invalid order format' });
    }

    // Combine existing pages with new uploads
    const pageMap: Record<string, any> = {};
    existingPages.forEach((p: any) => {
      if (p && p.filename) pageMap[p.filename] = p;
    });

    // Add new files to pageMap with their temporary IDs
    newPageEntries.forEach((entry) => {
      pageMap[entry.id] = entry;
    });

    // If orderArray is empty, use existing pages + new pages in default order
    let finalPages: Array<{ id: string; filename: string }> = [];
    if (orderArray.length === 0) {
      finalPages = [
        ...existingPages,
        ...newPageEntries.map((entry, idx) => ({
          id: `${Date.now()}_${Math.random()}`,
          filename: entry.filename,
        })),
      ];
    } else {
      // Reorder pages based on the provided order
      finalPages = orderArray
        .map((id: string) => {
          const filename = id.startsWith('new-') ? pageMap[id]?.filename : id.split('-').slice(1).join('-');
          if (filename && pageMap[filename]) return pageMap[filename];
          if (id.startsWith('new-') && pageMap[id]) return pageMap[id];
          return null;
        })
        .filter((p: any) => p !== null);

      // Ensure any new pages not in orderArray are appended
      newPageEntries.forEach((entry) => {
        if (!finalPages.some((p) => p.filename === entry.filename)) {
          finalPages.push({ id: `${Date.now()}_${Math.random()}`, filename: entry.filename });
        }
      });
    }

    // Rename files in the filesystem to match the final order
    if (finalPages.length > 0) {
      const tempNames: string[] = [];
      finalPages.forEach((page: any, idx: number) => {
        const oldPath = path.join(dir, page.filename);
        const tempName = `__tmp__${idx}${path.extname(page.filename) || '.jpg'}`;
        const tempPath = path.join(dir, tempName);
        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, tempPath);
          tempNames.push(tempName);
        } else {
          tempNames.push('');
        }
      });

      // Rename temp files to final names (page1.jpg, page2.jpg, ...)
      finalPages.forEach((page: any, idx: number) => {
        const tempName = tempNames[idx];
        if (!tempName) return;
        const tempPath = path.join(dir, tempName);
        const finalName = `page${idx + 1}${path.extname(tempName) || '.jpg'}`;
        const finalPath = path.join(dir, finalName);
        if (fs.existsSync(tempPath)) {
          fs.renameSync(tempPath, finalPath);
          page.filename = finalName;
          page.id = `${Date.now()}_${Math.random()}`;
        }
      });
    }

    // Update pages in comics.json
    comics[idx].chapters[chIdx].pages = finalPages;

    // Clean up any remaining temporary files
    const tempFiles = fs.readdirSync(dir).filter((file) => file.startsWith('__tmp__'));
    tempFiles.forEach((file) => {
      fs.unlinkSync(path.join(dir, file));
    });

    // Save updated comics.json
    fs.writeFileSync(comicsPath, JSON.stringify(comics, null, 2));
    return res.status(200).json({ message: 'Chapter updated' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update chapter', error: (error as Error).message });
  }
}