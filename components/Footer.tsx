import { Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full py-6 mt-10 border-t border-gray-800/50">
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-3 text-center">
        {/* GitHub Link */}
        <a
          href="https://github.com/lenovix/kamilcomic"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-white transition flex items-center gap-1"
        >
          <Github size={18} />
          <span className="text-sm">GitHub</span>
        </a>

        {/* Version */}
        <p className="text-xs text-gray-400">
          Komify <span className="font-medium">v0.0.6</span>
        </p>

        {/* Copyright */}
        <p className="text-[11px] text-gray-500">
          © {new Date().getFullYear()} Komify. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
