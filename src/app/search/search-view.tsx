"use client";

import { useState } from "react";
import MaterialCard from "@/components/material-card";
import MaterialModal from "@/components/material-modal";
import type { Category, Material } from "@/lib/types";

export default function SearchView({
  query,
  results,
  categories,
}: {
  query: string;
  results: Material[];
  categories: Category[];
}) {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name || "";

  return (
    <>
      <h1 className="text-2xl font-bold text-brand mb-1">
        &ldquo;{query}&rdquo; の検索結果
      </h1>
      <p className="text-sm text-gray-400 mb-6">{results.length}件</p>

      {results.length === 0 ? (
        <p className="text-gray-400 text-center py-16">該当する資材がありません</p>
      ) : (
        <div className="space-y-6">
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
    </>
  );
}
