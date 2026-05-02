import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { CatalogProvider } from "@/lib/catalog-context";
import { getAllMaterials, getCategories } from "@/lib/data";
import { getCurrentCustomer } from "@/lib/customer-auth";
import Header from "@/components/header";
import MainPadding from "@/components/main-padding";

export const metadata: Metadata = {
  title: "union発注for リース",
  description: "仮設足場機材の発注管理システム",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const catalogPromise = Promise.all([getCategories(), getAllMaterials()]).then(
    ([categories, materials]) => ({ categories, materials })
  );
  const customer = await getCurrentCustomer();

  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-surface-muted">
        <CatalogProvider catalogPromise={catalogPromise}>
          <CartProvider>
            <Suspense fallback={<div className="h-14 border-b border-border bg-surface" />}>
              <Header />
            </Suspense>
            <MainPadding hasCustomer={!!customer}>{children}</MainPadding>
          </CartProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
