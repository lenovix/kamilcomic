import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ThemeProvider } from "next-themes";
import Footer from "@/components/Footer";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Komify</title>
      </Head>

      <ThemeProvider
        attribute="data-mode"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
        themes={["light", "dark"]}
      >
        <Component {...pageProps} />
        <Footer />
      </ThemeProvider>
    </>
  );
}
