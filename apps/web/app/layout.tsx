import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Recursive } from "next/font/google";
import "./globals.css";

const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans" });
const recursive = Recursive({
  subsets: ["latin"],
  variable: "--font-recursive",
});

export const metadata: Metadata = {
  title: {
    default: "Sidequest",
    template: "%s",
  },
  description: "Plans with friends, minus the group chat.",
  openGraph: {
    title: "Sidequest",
    description: "Plans with friends, minus the group chat.",
    siteName: "Sidequest",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${recursive.variable}`}>
      <body>
        <div className="sq-blur" aria-hidden />
        {children}
      </body>
    </html>
  );
}
