import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Campus Care — QR-Based Campus Complaint Management",
  description:
    "Report campus maintenance issues instantly through QR codes. Track complaints, assign repairs, and monitor resolution — all in one platform.",
  keywords: [
    "campus maintenance",
    "complaint management",
    "QR code",
    "school maintenance",
    "facility management",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
