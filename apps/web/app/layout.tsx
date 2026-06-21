import type { Metadata } from "next";
import { Inter, Recursive } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const recursive = Recursive({ subsets: ["latin"], variable: "--font-recursive" });

export const metadata: Metadata = {
  title: "Sidequest",
  description: "Plans with friends, minus the group chat.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${recursive.variable}`}>
      <body>{children}</body>
    </html>
  );
}
