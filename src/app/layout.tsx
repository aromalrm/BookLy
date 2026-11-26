import type { Metadata } from "next";
import { EB_Garamond, Manrope, Newsreader } from "next/font/google";
import "./globals.css";

const display = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const body = Newsreader({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BookLy",
  description: "A personal library. Read, keep notes, and inspect the books on the shelf.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${sans.variable}`}>{children}</body>
    </html>
  );
}
