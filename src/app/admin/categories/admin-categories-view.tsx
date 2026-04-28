"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { AdminCategoryRow } from "@/lib/admin-data";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/app/admin/actions";

type EditingState =
  | { mode: "create" }
  | { mode: "edit"; category: AdminCategoryRow };

export default function AdminCategoriesView({
  categories,
}: {
  categories: AdminCategoryRow[];
}) {
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 1800);
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        if (editing?.mode === "edit") {
          await updateCategory(editing.category.id, formData);
          showToast("更新しました");
        } else {
          await createCategory(formData);
          showToast("追加しました");
        }
        setEditing(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "保存に失敗しました");
      }
    });
  };

  const handleDelete = (cat: AdminCategoryRow) => {
    if (cat.material_count > 0) {
      showToast("資材が紐付いているため削除できません");
      return;
    }
    if (!confirm(`カテゴリ「${cat.name}」を削除します。よろしいですか？`)) return;
    startTransition(async () => {
      try {
        await deleteCategory(cat.id);
        showToast("削除しました");
      } catch (e) {
        showToast(e instanceof Error ? e.message : "削除に失敗しました");
      }
    });
  };

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-subtle hover:text-accent transition-colors mb-3"
      >
        <span aria-hidden>←</span> 管理画面に戻る
      </Link>
      <h1 className="text-2xl font-bold text-accent mb-6">カテゴリマスタ</h1>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-subtle">{categories.length}件</span>
        <button
          onClick={() => setEditing({ mode: "create" })}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + 新規追加
        </button>
      </div>

      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 bg-surface-muted rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                {cat.image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={cat.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-subtle text-[10px]">NO IMG</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-accent truncate">
                  {cat.name}
                </p>
                <p className="text-xs text-subtle truncate">
                  {cat.slug} ・ 資材 {cat.material_count}件
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <button
                onClick={() => handleDelete(cat)}
                disabled={isPending || cat.material_count > 0}
                className="text-xs px-2.5 py-1.5 bg-surface-muted text-muted rounded-full hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-surface-muted disabled:hover:text-muted"
                title={
                  cat.material_count > 0
                    ? "資材が紐付いているため削除不可"
                    : "削除"
                }
              >
                削除
              </button>
              <button
                onClick={() => setEditing({ mode: "edit", category: cat })}
                className="text-sm px-3 py-1.5 bg-surface-muted text-muted rounded-full hover:bg-border transition-colors"
              >
                編集
              </button>
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

      {editing && (
        <EditModal
          key={editing.mode === "edit" ? editing.category.id : "new"}
          initial={
            editing.mode === "edit"
              ? {
                  name: editing.category.name,
                  slug: editing.category.slug,
                  sort_order: editing.category.sort_order,
                  image_url: editing.category.image_url,
                }
              : {
                  name: "",
                  slug: "",
                  sort_order: (categories.at(-1)?.sort_order ?? 0) + 1,
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
  name: string;
  slug: string;
  sort_order: number;
  image_url: string | null;
};

function EditModal({
  initial,
  isEdit,
  pending,
  error,
  onClose,
  onSubmit,
}: {
  initial: EditInitial;
  isEdit: boolean;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [sortOrder, setSortOrder] = useState(initial.sort_order);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initial.image_url
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFormAction = (formData: FormData) => {
    formData.set("name", name);
    formData.set("slug", slug);
    formData.set("sort_order", String(sortOrder));
    if (imageFile) formData.set("image", imageFile);
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
              {isEdit ? "カテゴリを編集" : "カテゴリを追加"}
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
                カテゴリ名 <span className="text-red-500">*</span>
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
                slug（URL。空欄なら名前から自動生成）
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="例: karigakoi"
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
                      className="w-full h-full object-cover"
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
            <div>
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
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

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
