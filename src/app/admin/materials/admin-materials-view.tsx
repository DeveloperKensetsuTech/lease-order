"use client";

import { useState, useTransition } from "react";
import type { Category, Material } from "@/lib/types";
import {
  createMaterial,
  setMaterialActive,
  updateMaterial,
} from "@/app/admin/actions";

type EditingState =
  | { mode: "create"; categoryId: string }
  | { mode: "edit"; material: Material };

export default function AdminMaterialsView({
  categories,
  allMaterials,
}: {
  categories: Category[];
  allMaterials: Material[];
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categories[0]?.id ?? ""
  );
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtered = allMaterials
    .filter((m) => m.category_id === selectedCategoryId)
    .sort((a, b) => a.sort_order - b.sort_order);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 1800);
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        if (editing?.mode === "edit") {
          await updateMaterial(editing.material.id, formData);
          showToast("更新しました");
        } else {
          await createMaterial(formData);
          showToast("追加しました");
        }
        setEditing(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "保存に失敗しました");
      }
    });
  };

  const handleToggleActive = (material: Material) => {
    startTransition(async () => {
      try {
        await setMaterialActive(material.id, !material.is_active);
        showToast(material.is_active ? "非公開にしました" : "公開しました");
      } catch (e) {
        setError(e instanceof Error ? e.message : "更新に失敗しました");
      }
    });
  };

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold text-accent mb-6">資材マスタ</h1>

      {/* カテゴリ選択 */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategoryId === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-surface-muted text-muted hover:bg-border"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-subtle">{filtered.length}件</span>
        <button
          onClick={() =>
            setEditing({ mode: "create", categoryId: selectedCategoryId })
          }
          className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + 新規追加
        </button>
      </div>

      {/* 資材リスト */}
      <div className="space-y-2">
        {filtered.map((mat) => (
          <div
            key={mat.id}
            className={`flex items-center justify-between p-4 bg-surface rounded-xl border border-border ${
              !mat.is_active ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-surface-muted rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                {mat.image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={mat.image_url}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-subtle text-[10px]">NO IMG</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-accent truncate">
                  {mat.name}
                </p>
                <p className="text-xs text-subtle truncate">
                  {mat.description || "説明なし"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <button
                onClick={() => handleToggleActive(mat)}
                disabled={isPending}
                className="text-xs px-2.5 py-1.5 bg-surface-muted text-muted rounded-full hover:bg-surface-muted disabled:opacity-40"
              >
                {mat.is_active ? "非公開" : "公開"}
              </button>
              <button
                onClick={() => setEditing({ mode: "edit", material: mat })}
                className="text-sm px-3 py-1.5 bg-surface-muted text-muted rounded-full hover:bg-border transition-colors"
              >
                編集
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 保存トースト */}
      {toastMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] pointer-events-none">
          <div className="bg-surface rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <svg
                className="h-6 w-6 text-primary-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-base font-medium text-accent">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {editing && (
        <EditModal
          key={editing.mode === "edit" ? editing.material.id : "new"}
          categories={categories}
          initial={
            editing.mode === "edit"
              ? { ...editing.material }
              : {
                  category_id: editing.categoryId,
                  name: "",
                  description: "",
                  sort_order: filtered.length,
                  is_active: true,
                  image_url: null,
                }
          }
          isEdit={editing.mode === "edit"}
          pending={isPending}
          error={error}
          onClose={() => {
            setEditing(null);
            setError(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </main>
  );
}

type EditInitial = {
  category_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  image_url?: string | null;
};

function EditModal({
  categories,
  initial,
  isEdit,
  pending,
  error,
  onClose,
  onSubmit,
}: {
  categories: Category[];
  initial: EditInitial;
  isEdit: boolean;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  const [categoryId, setCategoryId] = useState(initial.category_id);
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description ?? "");
  const [sortOrder, setSortOrder] = useState(initial.sort_order);
  const [isActive, setIsActive] = useState(initial.is_active);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initial.image_url ?? null
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFormAction = (formData: FormData) => {
    formData.set("category_id", categoryId);
    formData.set("name", name);
    formData.set("description", description);
    formData.set("sort_order", String(sortOrder));
    formData.set("is_active", isActive ? "true" : "false");
    if (imageFile) {
      formData.set("image", imageFile);
    }
    onSubmit(formData);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-surface w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form action={handleFormAction} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-accent">
              {isEdit ? "資材を編集" : "資材を追加"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-subtle hover:text-muted"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                カテゴリ
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                資材名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                説明
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                画像
              </label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <div className="w-16 h-16 bg-surface-muted rounded-lg overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm text-muted file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-surface-muted file:text-foreground hover:file:bg-border"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  並び順
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
                />
              </div>
              <label className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-accent"
                />
                <span className="text-sm text-foreground">公開</span>
              </label>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="flex-1 py-2.5 border border-border-strong text-foreground rounded-full text-sm font-medium hover:bg-surface-muted disabled:opacity-40"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={pending || !name.trim()}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 disabled:opacity-40"
            >
              {pending ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
