"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { materials, categories } from "@/lib/data";
import MaterialCard from "@/components/material-card";
import MaterialModal from "@/components/material-modal";
import { Material } from "@/lib/types";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return materials.filter(
      (m) =>
        m.is_active &&
        (m.name.toLowerCase().includes(q) ||
          (m.description && m.description.toLowerCase().includes(q)))
    );
  }, [query]);

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name || "";

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-brand transition-colors">
          トップ
        </Link>
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-brand font-medium">検索結果</span>
      </nav>

      <h1 className="text-2xl font-bold text-brand mb-1">
        &ldquo;{query}&rdquo; の検索結果
      </h1>
      <p className="text-sm text-gray-400 mb-6">{results.length}件</p>

      {results.length === 0 ? (
        <p className="text-gray-400 text-center py-16">該当する資材がありません</p>
      ) : (
        <div className="space-y-6">
          {/* カテゴリ別にグルーピング */}
          {Array.from(new Set(results.map((r) => r.category_id))).map((catId) => {
            const catMaterials = results.filter((r) => r.category_id === catId);
            return (
              <div key={catId}>
                <h2 className="text-sm font-medium text-gray-400 mb-2">{getCategoryName(catId)}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {catMaterials.map((material) => (
                    <MaterialCard
                      key={material.id}
                      material={material}
                      onClick={() => setSelectedMaterial(material)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedMaterial && (
        <MaterialModal
          material={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
        />
      )}
    </main>
  );
}
