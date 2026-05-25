import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Inter } from "next/font/google";

const inter = Inter ({ subsets: [ "latin" ]});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      {/* 'children' disini adalah isi page.tsx */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}
