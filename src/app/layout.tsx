import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "union発注for リース",
  description: "仮設足場機材の発注管理システム",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-surface-muted">{children}</body>
    </html>
  );
}
