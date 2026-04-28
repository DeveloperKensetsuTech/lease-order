"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { useCatalog } from "@/lib/catalog-context";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";

function SearchBar({ className }: { className?: string }) {
  const { materials, categories } = useCatalog();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return materials
      .filter((m) => m.is_active && m.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name || "";

  const getCategorySlug = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.slug || "";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const showDropdown = focused && query.trim().length > 0;

  const handleSelect = (materialCategoryId: string) => {
    const slug = getCategorySlug(materialCategoryId);
    if (slug) {
      router.push(`/category/${slug}?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setFocused(false);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className || ""}`}>
      <div className="relative">
        <input
          type="text"
          placeholder="資材を検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          className="w-full pl-10 pr-4 py-2 bg-surface-muted rounded-full text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent transition-colors"
        />
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {query && (
          <button
            onClick={() => { setQuery(""); setFocused(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface rounded-xl shadow-lg border border-border overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-subtle">
              該当する資材がありません
            </div>
          ) : (
            <div className="py-1">
              {results.map((material) => (
                <button
                  key={material.id}
                  onClick={() => handleSelect(material.category_id)}
                  className="w-full px-4 py-3 text-left hover:bg-surface-muted flex items-center gap-3 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-accent truncate">{material.name}</p>
                    <p className="text-xs text-subtle">{getCategoryName(material.category_id)}</p>
                  </div>
                  <svg className="h-4 w-4 text-subtle flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { totalItems } = useCart();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-4">
          <Link href={isAdmin ? "/admin" : "/"} className="flex items-center gap-2.5 flex-shrink-0">
            <Image
              src="/images/logo-union.png"
              alt="union"
              width={486}
              height={823}
              priority
              className="h-12 sm:h-14 w-auto"
            />
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-cyan-500">発注<span className="text-xs sm:text-sm font-medium ml-1">for リース</span></span>
          </Link>

          {!isAdmin && (
            <SearchBar className="flex-1 max-w-md hidden sm:block" />
          )}

          {!isAdmin && (
            <div className="flex items-center gap-3">
              <Link
                href="/cart"
                className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-muted transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-[18px] min-w-[18px] flex items-center justify-center px-1">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          )}
        </div>

        {!isAdmin && (
          <div className="pb-3 sm:hidden">
            <SearchBar />
          </div>
        )}
      </div>
    </header>
  );
}
