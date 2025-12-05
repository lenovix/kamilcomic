import { Html, Head, Main, NextScript } from "next/document";
import Footer from "@/components/Footer";

export default function Document() {
  return (
    <Html lang="en">
      <title>Komify</title>
      <Head />
      <body className="antialiased">
        <Main />
        <NextScript />
        <Footer />
      </body>
    </Html>
  );
}
