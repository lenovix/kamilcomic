# 📚 KamilComic - Comic Collection Web App

A simple personal comic collection app built with **Next.js**, designed to upload and manage comic metadata and chapters manually.

---

## ✨ Fitur Saat Ini

- Upload informasi komik:
  - Judul, author, artist, grup, karakter, parodi, kategori, tag, status
- Upload cover image
- Tambahkan satu atau lebih chapter:
  - Nomor chapter, judul, bahasa, dan file (gambar atau .zip/.rar)
- Chapter bisa dihapus (kecuali chapter pertama)
- Slug otomatis terisi dari `comics.json` server
- Menyimpan file ke `/public/comics/[slug]/...` (simulasi backend)

---

## 🐞 Bug/Issue Saat Ini

- ❗ setelah menyimpan perubahan pada urutan page/gamabr chapter, urutan tidak langsung berubah, harus di refresh dulu
- ❗ web belum bisa menerima file .png
- ❗ Error 500 jika file tidak lengkap atau field `chapters` tidak dikirim dengan benar
- ❗ Tidak ada validasi tipe file & ukuran maksimum
- ❗ Upload belum menyimpan metadata ke `comics.json`
- ❗ Form tidak memperingatkan user sebelum pindah halaman (data hilang)
- ❗ Tidak ada progress bar saat upload (UI)

---

## 🚧 Rencana Fitur Selanjutnya

- ✅ Simpan metadata komik & chapter ke `data/comics.json`
- ✅ Validasi form input (wajib isi, batas panjang, dll.)
- ✅ Progress bar dan notifikasi upload
- ✅ Fitur preview chapter (gambar)
- ✅ Tambahkan halaman list komik (`/comics`)
- ✅ Halaman detail per komik dengan galeri per chapter
- 🗃️ Cari/filter komik berdasarkan tag, kategori, status