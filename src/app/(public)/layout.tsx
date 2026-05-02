import { Suspense } from "react";
import { CartProvider } from "@/lib/cart-context";
import { CatalogProvider } from "@/lib/catalog-context";
import { getAllMaterials, getCategories } from "@/lib/data";
import { getCurrentCustomer } from "@/lib/customer-auth";
import Header from "@/components/header";
import MainPadding from "@/components/main-padding";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const catalogPromise = Promise.all([getCategories(), getAllMaterials()]).then(
    ([categories, materials]) => ({ categories, materials })
  );
  const customer = await getCurrentCustomer();

  return (
    <CatalogProvider catalogPromise={catalogPromise}>
      <CartProvider>
        <Suspense fallback={<div className="h-14 border-b border-border bg-surface" />}>
          <Header />
        </Suspense>
        <MainPadding hasCustomer={!!customer}>{children}</MainPadding>
      </CartProvider>
    </CatalogProvider>
  );
}
