import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import { Toaster } from "@/components/ui/sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LBNK48 Sisaster Sites",
  description: "ประวัติและข้อมูลของ LBNK48 Sisaster Team พร้อมระบบ L-Point",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${plusJakartaSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-gray-50 antialiased">
        <ConditionalNavbar />
        <main>{children}</main>
        <footer className="bg-gray-900 text-gray-400 text-center py-8 text-sm">
          <p className="font-bold text-white mb-1">LBNK48 Sisaster Sites</p>
          <p>© 2024 Sisaster Team Fan Site · ไม่ใช่เว็บไซต์ทางการ</p>
        </footer>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
