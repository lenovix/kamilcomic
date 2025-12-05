import { Html, Head, Main, NextScript } from "next/document";
import Footer from "@/components/Footer";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Meta utama (title tidak boleh di sini) */}
        <meta name="theme-color" content="#111827" />
      </Head>

      <body className="antialiased bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <Main />
        <Footer />
        <NextScript />
      </body>
    </Html>
  );
}
