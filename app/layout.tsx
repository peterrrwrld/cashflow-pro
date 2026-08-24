import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"; // <-- Import notifikasi

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CashFlow Pro - Solusi Finansial UMKM",
  description: "Sistem Manajemen Keuangan Modern Real-time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
        {/* Wadah notifikasi pop-up modern di pojok kanan atas */}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}