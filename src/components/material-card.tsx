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
      className="w-full bg-white rounded-lg border border-gray-150 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left flex items-center gap-3 group"
    >
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-brand group-hover:underline">{material.name}</h3>
        {material.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{material.description}</p>
        )}
      </div>
      <svg className="h-4 w-4 text-gray-300 flex-shrink-0 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
