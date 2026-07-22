import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bella EOS – Enterprise Operating System (Enterprise Brain)",
  description: "An advanced, self-evolutionary AI Platform designed to govern enterprise operations via a unified cognitive brain and capability-based workflow scheduling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="h-full bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
