import { Suspense } from "react";
import { CartProvider } from "@/lib/cart-context";
import { CatalogProvider } from "@/lib/catalog-context";
import { getAllMaterials, getCategories } from "@/lib/data";
import Header from "@/components/header";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const catalogPromise = Promise.all([getCategories(), getAllMaterials()]).then(
    ([categories, materials]) => ({ categories, materials })
  );

  return (
    <CatalogProvider catalogPromise={catalogPromise}>
      <CartProvider>
        <Suspense fallback={<div className="h-14 border-b border-border bg-surface" />}>
          <Header />
        </Suspense>
        {children}
      </CartProvider>
    </CatalogProvider>
  );
}
