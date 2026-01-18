import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portal Berita | SMP Terpadu Al-Ittihadiyah",
  description: "Dapatkan informasi terbaru, berita kegiatan, dan prestasi siswa dari SMP Terpadu Al-Ittihadiyah.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
