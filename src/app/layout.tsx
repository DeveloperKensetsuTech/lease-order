import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { CatalogProvider } from "@/lib/catalog-context";
import { getAllMaterials, getCategories } from "@/lib/data";
import Header from "@/components/header";

export const metadata: Metadata = {
  title: "資材発注システム",
  description: "仮設足場機材の発注管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const catalogPromise = Promise.all([getCategories(), getAllMaterials()]).then(
    ([categories, materials]) => ({ categories, materials })
  );

  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50">
        <CatalogProvider catalogPromise={catalogPromise}>
          <CartProvider>
            <Suspense fallback={<div className="h-14 border-b border-gray-100 bg-white" />}>
              <Header />
            </Suspense>
            {children}
          </CartProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
