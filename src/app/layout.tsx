import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://smptaialittihadiyah.vercel.app"
  ),
  title: "Portal Berita | SMP Terpadu Al-Ittihadiyah",
  description:
    "Dapatkan informasi terbaru, berita kegiatan, dan prestasi siswa dari SMP Terpadu Al-Ittihadiyah.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    siteName: "SMP Terpadu Al-Ittihadiyah",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/thumbnail.png",
        width: 1200,
        height: 630,
        alt: "SMP Terpadu Al-Ittihadiyah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/thumbnail.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
