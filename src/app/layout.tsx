import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Keyun Studio",
  description: "No-code web builder for modern sites.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
