"use client";

import { createContext, use, useContext, type ReactNode } from "react";
import type { Category, Material } from "./types";

type CatalogValue = {
  categories: Category[];
  materials: Material[];
};

type CatalogPromise = Promise<CatalogValue>;

const CatalogContext = createContext<CatalogPromise | null>(null);

export function CatalogProvider({
  catalogPromise,
  children,
}: {
  catalogPromise: CatalogPromise;
  children: ReactNode;
}) {
  return (
    <CatalogContext.Provider value={catalogPromise}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogValue {
  const promise = useContext(CatalogContext);
  if (!promise) {
    throw new Error("useCatalog must be used within CatalogProvider");
  }
  return use(promise);
}
