# 📚 KamilComic - Comic Collection Web App

A simple personal comic collection app built with **Next.js**, designed to manually upload and manage your personal comic collection, including chapters and metadata.

---

## ✨ Fitur Saat Ini

- Upload informasi komik secara manual:
  - Judul, author, artist, grup, karakter, parodi, kategori, tag, dan status
- Upload cover image
- Tambahkan satu atau lebih chapter:
  - Nomor chapter otomatis (mulai dari 001 dan meningkat)
  - Judul chapter, bahasa, dan file (gambar atau .zip/.rar)
- Field multi-input (tags, author, artist, grup, dst.) bisa dipisah dengan koma
- Slug otomatis berdasarkan judul
- Chapter bisa dihapus (nomor akan diperbarui otomatis)
- Simpan file ke struktur `/public/comics/[slug]/chapter/`
- Simulasi backend: metadata disimpan ke `data/comics.json`
- Pencarian berdasarkan judul
- Halaman list berdasarkan:
  - Author, Artist, Grup, Tag, Karakter, Parodi, Kategori
- Halaman detail komik dan galeri chapter
- Halaman Setting:
  - Hapus semua komik
  - Bersihkan cache upload

---

## 🐞 Bug / Issue Saat Ini

- ❗ Setelah menyimpan urutan gambar chapter, tampilan belum langsung berubah (perlu refresh)
- ❗ Error 500 jika file tidak lengkap atau field `chapters` tidak dikirim dengan benar
- ❗ Tidak ada validasi tipe file & ukuran maksimum
- ❗ Form tidak memperingatkan user sebelum pindah halaman (data bisa hilang)
- ❗ Tidak ada progress bar saat upload
- ❗ Bookmark belum tersimpan ke localStorage
- ❗ Halaman tags/author/etc. belum memiliki pagination jika terlalu banyak item

---

## 🚧 Rencana Fitur Selanjutnya

- ✅ Simpan metadata komik & chapter ke `data/comics.json`
- ✅ Validasi form input (wajib isi, batas panjang, dll.)
- ✅ Progress bar dan notifikasi upload
- ✅ Preview gambar chapter saat upload
- ✅ Halaman list komik (`/comics`)
- ✅ Halaman detail per komik dengan galeri per chapter
- 🔍 Pencarian dan filter lanjutan (tags, kategori, status)
- 📝 Mode edit metadata komik
- 🔐 Login sederhana (opsional, untuk keamanan upload)
- 📁 Support drag & drop gambar ke upload
- 📦 Ekstrak otomatis dari file `.zip` / `.rar`
