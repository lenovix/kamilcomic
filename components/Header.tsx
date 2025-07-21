import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="w-full bg-white shadow sticky top-0 z-50">
      <div className=" mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          📚 Kamil Comic v0.0.5
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="w-full md:w-1/2">
          <input
            type="text"
            placeholder="Cari komik, author, tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
          />
        </form>

        {/* Upload link */}
        <div className="hidden md:flex space-x-4 text-sm">
          <Link href="/upload" className="text-gray-700 hover:text-blue-600">
            Upload Comic
          </Link>
          <Link
            href="/bookmarks"
            className="text-yellow-600 hover:text-yellow-800 font-semibold"
          >
            ★ Bookmarks
          </Link>
          <Link href="/settings" className="text-gray-700 hover:text-blue-600">
            ⚙️ Setting
          </Link>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="bg-gray-50 border-t border-b border-gray-200 text-sm">
        <div className=" mx-auto px-6 py-2 flex flex-wrap gap-4">
          <Link href="/random" className="text-gray-600 hover:text-blue-600">
            🎲 Random
          </Link>
          <Link href="/tags" className="text-gray-600 hover:text-blue-600">
            # Tags
          </Link>
          <Link href="/author" className="text-gray-600 hover:text-blue-600">
            ✍️ Author
          </Link>
          <Link href="/artist" className="text-gray-600 hover:text-blue-600">
            🎨 Artist
          </Link>
          <Link href="/groups" className="text-gray-600 hover:text-blue-600">
            🛠️ Groups
          </Link>
          <Link
            href="/characters"
            className="text-gray-600 hover:text-blue-600"
          >
            👤 Characters
          </Link>
          <Link href="/parodies" className="text-gray-600 hover:text-blue-600">
            🎭 Parodies
          </Link>
          <Link
            href="/categories"
            className="text-gray-600 hover:text-blue-600"
          >
            🗂️ Categories
          </Link>
        </div>
      </nav>
    </header>
  );
}
