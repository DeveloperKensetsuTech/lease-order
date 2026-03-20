"use client";

import { useState } from "react";
import { categories, materials as allMaterials } from "@/lib/data";
import { Material } from "@/lib/types";

export default function AdminMaterialsPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0].id);
  const [editing, setEditing] = useState<Material | null>(null);

  const filtered = allMaterials.filter((m) => m.category_id === selectedCategoryId);

  // 編集フォーム
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  function startEdit(material: Material) {
    setEditing(material);
    setFormName(material.name);
    setFormDescription(material.description || "");
    setFormImageUrl(material.image_url || "");
  }

  function startAdd() {
    setEditing({
      id: "",
      category_id: selectedCategoryId,
      name: "",
      slug: "",
      image_url: null,
      description: null,
      spec: null,
      sort_order: filtered.length,
      is_active: true,
    });
    setFormName("");
    setFormDescription("");
    setFormImageUrl("");
  }

  function handleSave() {
    setEditing(null);
    setToastMessage("保存しました");
    setTimeout(() => setToastMessage(""), 2000);
  }

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold text-brand mb-6">資材マスタ</h1>

      {/* カテゴリ選択 */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategoryId === cat.id
                ? "bg-brand text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-400">{filtered.length}件</span>
        <button
          onClick={startAdd}
          className="px-4 py-2 bg-brand text-white rounded-full text-sm font-medium hover:bg-brand-light transition-colors"
        >
          + 新規追加
        </button>
      </div>

      {/* 資材リスト */}
      <div className="space-y-2">
        {filtered.map((mat) => (
          <div
            key={mat.id}
            className={`flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 ${
              !mat.is_active ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                {mat.image_url ? (
                  <img
                    src={mat.image_url}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-gray-300 text-[10px]">NO IMG</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-brand truncate">{mat.name}</p>
                <p className="text-xs text-gray-400 truncate">{mat.description || "説明なし"}</p>
              </div>
            </div>
            <button
              onClick={() => startEdit(mat)}
              className="text-sm px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0 ml-2"
            >
              編集
            </button>
          </div>
        ))}
      </div>

      {/* 保存トースト */}
      {toastMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-base font-medium text-brand">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px]"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-brand">
                  {editing.id ? "資材を編集" : "資材を追加"}
                </h2>
                <button
                  onClick={() => setEditing(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">資材名</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">説明</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand transition-colors"
                  />
                </div>
                {/* TODO: DB接続後に画像アップロード機能を実装 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">画像</label>
                  <div className="mb-2">
                    {formImageUrl ? (
                      <div className="w-full aspect-video bg-gray-50 rounded-lg overflow-hidden relative">
                        <img src={formImageUrl} alt="" className="w-full h-full object-contain" />
                        <button
                          onClick={() => setFormImageUrl("")}
                          className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 hover:bg-white shadow"
                        >
                          <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="w-full aspect-video bg-gray-50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors border-2 border-dashed border-gray-200">
                        <svg className="h-8 w-8 text-gray-300 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-xs text-gray-400">画像を選択</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              setFormImageUrl(url);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 bg-brand text-white rounded-full text-sm font-medium hover:bg-brand-light transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
