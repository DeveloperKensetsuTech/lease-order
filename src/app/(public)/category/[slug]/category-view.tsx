"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MaterialCard from "@/components/material-card";
import MaterialModal from "@/components/material-modal";
import type { Category, Material } from "@/lib/types";

function CategoryViewInner({
  category,
  materials,
}: {
  category: Category;
  materials: Material[];
}) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [search, setSearch] = useState(initialQuery);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const filtered = useMemo(
    () =>
      materials.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase())
      ),
    [materials, search]
  );

  return (
    <>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-subtle hover:text-accent transition-colors mb-6"
      >
        <span aria-hidden>←</span> トップに戻る
      </Link>

      <h1 className="text-2xl font-bold text-accent mb-1">{category.name}</h1>
      <p className="text-sm text-subtle mb-6">{filtered.length}件の資材</p>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <input
            type="text"
            placeholder="この中から検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-muted rounded-full text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent transition-colors"
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
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-subtle text-center py-16">
          {search ? "該当する資材がありません" : "資材が登録されていません"}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filtered.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onClick={() => setSelectedMaterial(material)}
            />
          ))}
        </div>
      )}

      {selectedMaterial && (
        <MaterialModal
          material={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
        />
      )}
    </>
  );
}

export default function CategoryView(props: { category: Category; materials: Material[] }) {
  return (
    <Suspense fallback={<p className="text-subtle text-center py-16">読み込み中...</p>}>
      <CategoryViewInner {...props} />
    </Suspense>
  );
}
