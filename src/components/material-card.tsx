"use client";

import { Material } from "@/lib/types";

type Props = {
  material: Material;
  onClick: () => void;
};

export default function MaterialCard({ material, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-surface rounded-lg border border-border px-4 py-3.5 hover:bg-surface-muted transition-colors text-left flex items-center gap-3 group"
    >
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-accent group-hover:underline">{material.name}</h3>
        {material.description && (
          <p className="text-xs text-subtle mt-0.5 truncate">{material.description}</p>
        )}
      </div>
      <svg className="h-4 w-4 text-subtle flex-shrink-0 group-hover:text-muted transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
