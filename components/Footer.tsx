import { Github } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Footer() {
  return (
    <footer
      className="w-full py-6 border-t 
      bg-white text-black dark:bg-gray-900 dark:text-white
      border-gray-300 dark:border-gray-700 transition-colors"
    >
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-2">
        {/* GitHub Link */}
        <a
          href="https://github.com/lenovix/kamilcomic"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 
          hover:text-black dark:hover:text-white transition"
        >
          <Github size={18} />
          <span className="text-sm">GitHub</span>
        </a>

        {/* Version */}
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Komify <span className="font-medium">v0.0.6</span>
        </p>

        {/* Copyright */}
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Komify. All rights reserved.
        </p>

        {/* Theme Toggle Button */}
        <div className="mt-2">
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
