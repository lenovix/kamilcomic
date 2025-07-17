import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">
          📚 KamilComic
        </Link>
        <nav className="text-sm space-x-4">
          <Link href="/" className="text-gray-700 hover:text-blue-600">
            Upload Comic
          </Link>
          {/* Tambahan di masa depan: */}
          {/* <Link href="/upload" className="text-gray-700 hover:text-blue-600">
            Tambah Komik
          </Link> */}
        </nav>
      </div>
    </header>
  );
}
