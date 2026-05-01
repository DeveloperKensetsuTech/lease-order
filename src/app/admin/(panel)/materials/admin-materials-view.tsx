"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Category, Material } from "@/lib/types";
import { createMaterial, setMaterialActive } from "@/app/admin/actions";

export default function AdminMaterialsView({
  categories,
  allMaterials,
}: {
  categories: Category[];
  allMaterials: Material[];
}) {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categories[0]?.id ?? ""
  );
  const [creating, setCreating] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = allMaterials
    .filter((m) => m.category_id === selectedCategoryId)
    .sort((a, b) => a.sort_order - b.sort_order);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 1800);
  };

  const handleToggleActive = (material: Material) => {
    startTransition(async () => {
      try {
        await setMaterialActive(material.id, !material.is_active);
        showToast(material.is_active ? "非公開にしました" : "公開しました");
      } catch (e) {
        showToast(e instanceof Error ? e.message : "更新に失敗しました");
      }
    });
  };

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold text-accent mb-6">資材マスタ</h1>

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

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-subtle">{filtered.length}件</span>
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + 新規追加
        </button>
      </div>

      <div className="space-y-2">
        {filtered.map((mat) => (
          <div
            key={mat.id}
            className={`flex items-center justify-between p-4 bg-surface rounded-xl border border-border ${
              !mat.is_active ? "opacity-50" : ""
            }`}
          >
            <Link
              href={`/admin/materials/${mat.id}`}
              className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity"
            >
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
            </Link>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <button
                onClick={() => handleToggleActive(mat)}
                disabled={isPending}
                className="text-xs px-2.5 py-1.5 bg-surface-muted text-muted rounded-full hover:bg-border disabled:opacity-40"
              >
                {mat.is_active ? "非公開" : "公開"}
              </button>
              <Link
                href={`/admin/materials/${mat.id}`}
                className="text-sm px-3 py-1.5 bg-surface-muted text-muted rounded-full hover:bg-border transition-colors"
              >
                詳細
              </Link>
            </div>
          </div>
        ))}
      </div>

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

      {creating && (
        <CreateModal
          categories={categories}
          defaultCategoryId={selectedCategoryId}
          defaultSortOrder={(filtered.at(-1)?.sort_order ?? 0) + 1}
          onClose={() => setCreating(false)}
          onCreated={(id) => {
            setCreating(false);
            router.push(`/admin/materials/${id}`);
          }}
        />
      )}
    </main>
  );
}

function CreateModal({
  categories,
  defaultCategoryId,
  defaultSortOrder,
  onClose,
  onCreated,
}: {
  categories: Category[];
  defaultCategoryId: string;
  defaultSortOrder: number;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    formData.set("category_id", categoryId);
    formData.set("name", name);
    formData.set("description", "");
    formData.set("sort_order", String(defaultSortOrder));
    formData.set("is_active", "true");
    startTransition(async () => {
      try {
        const id = await createMaterial(formData);
        onCreated(id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "作成に失敗しました");
      }
    });
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
        <form action={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-accent">資材を追加</h2>
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

          <p className="text-xs text-subtle mb-4">
            まず最低限の情報で作成し、続けて詳細ページで画像・バリエーション・説明を編集できます。
          </p>

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
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-2.5 border border-border-strong text-foreground rounded-full text-sm font-medium hover:bg-surface-muted disabled:opacity-40"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 disabled:opacity-40"
            >
              {isPending ? "作成中..." : "作成して詳細へ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
