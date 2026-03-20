"use client";

import { useState } from "react";
import Image from "next/image";
import { Material } from "@/lib/types";
import { useCart } from "@/lib/cart-context";

type Props = {
  material: Material;
  onClose: () => void;
};

export default function MaterialModal({ material, onClose }: Props) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const [currentPage, setCurrentPage] = useState(0);

  const catalogPages = material.catalog_pages || [];
  const hasMultiplePages = catalogPages.length > 1;

  const handleAdd = () => {
    addItem(material, quantity);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* スクロール領域 */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* カタログページ画像 */}
          {catalogPages.length > 0 ? (
            <div className="relative">
              <div className="relative w-full" style={{ aspectRatio: "210/297" }}>
                <Image
                  src={catalogPages[currentPage]}
                  alt={`${material.name} - ページ ${currentPage + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, 512px"
                />
              </div>
              {/* ページ切り替え */}
              {hasMultiplePages && (
                <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="bg-white/90 backdrop-blur rounded-full p-1.5 shadow-md disabled:opacity-30"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span className="bg-white/90 backdrop-blur rounded-full px-3 py-1 text-xs font-medium shadow-md">
                    {currentPage + 1} / {catalogPages.length}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(catalogPages.length - 1, currentPage + 1))}
                    disabled={currentPage === catalogPages.length - 1}
                    className="bg-white/90 backdrop-blur rounded-full p-1.5 shadow-md disabled:opacity-30"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
              {/* 閉じるボタン */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full p-2 hover:bg-white shadow-md transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="relative w-full aspect-video bg-gray-50 flex items-center justify-center rounded-t-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <button
                onClick={onClose}
                className="absolute top-3 right-3 bg-white/90 rounded-full p-2 hover:bg-white shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {/* テキスト詳細 */}
          <div className="px-5 pt-4 pb-2">
            <h2 className="text-lg font-bold text-brand">{material.name}</h2>
            {material.description && (
              <p className="text-sm text-gray-500 mt-1">{material.description}</p>
            )}
            {material.spec && Object.keys(material.spec).length > 0 && (
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {Object.entries(material.spec).map(([key, value]) => (
                  <div key={key} className="contents">
                    <dt className="text-gray-400">{key}</dt>
                    <dd className="text-brand">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        {/* 固定フッター */}
        <div className="border-t border-gray-100 px-5 py-4 bg-white sm:rounded-b-2xl flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M20 12H4" /></svg>
            </button>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-12 text-center text-sm font-medium border-x border-gray-200 h-10"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
          <button
            onClick={handleAdd}
            className="flex-1 h-10 bg-brand text-white rounded-full text-sm font-medium hover:bg-brand-light active:bg-brand-dark transition-colors"
          >
            カートに追加
          </button>
        </div>
      </div>
    </div>
  );
}
