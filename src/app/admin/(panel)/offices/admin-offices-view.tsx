"use client";

import { useState, useTransition } from "react";
import type { AdminOfficeRow } from "@/lib/admin-data";
import {
  createOffice,
  deleteOffice,
  updateOffice,
} from "@/app/admin/actions";

type EditingState =
  | { mode: "create" }
  | { mode: "edit"; office: AdminOfficeRow };

export default function AdminOfficesView({
  offices,
}: {
  offices: AdminOfficeRow[];
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
          await updateOffice(editing.office.id, formData);
          showToast("更新しました");
        } else {
          await createOffice(formData);
          showToast("追加しました");
        }
        setEditing(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "保存に失敗しました");
      }
    });
  };

  const handleDelete = (office: AdminOfficeRow) => {
    if (office.in_use_count > 0) {
      showToast(
        "発注で使われているため削除できません。非公開にしてください。"
      );
      return;
    }
    if (!confirm(`営業所「${office.name}」を削除します。よろしいですか？`)) return;
    startTransition(async () => {
      try {
        await deleteOffice(office.id);
        showToast("削除しました");
      } catch (e) {
        showToast(e instanceof Error ? e.message : "削除に失敗しました");
      }
    });
  };

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold text-accent mb-6">営業所マスタ</h1>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-subtle">{offices.length}件</span>
        <button
          onClick={() => setEditing({ mode: "create" })}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + 新規追加
        </button>
      </div>

      <div className="space-y-2">
        {offices.map((o) => (
          <div
            key={o.id}
            className={`flex items-start justify-between gap-3 p-4 bg-surface rounded-xl border border-border ${
              !o.is_active ? "opacity-50" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-accent truncate">
                  {o.name}
                </p>
                {o.area && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-muted text-subtle">
                    {o.area}
                  </span>
                )}
              </div>
              {o.address && (
                <p className="text-xs text-subtle truncate">{o.address}</p>
              )}
              <div className="flex gap-3 mt-1 text-xs text-subtle">
                {o.phone && <span>TEL {o.phone}</span>}
                {o.fax && <span>FAX {o.fax}</span>}
                {o.in_use_count > 0 && (
                  <span className="text-amber-700">
                    発注 {o.in_use_count}件で使用
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleDelete(o)}
                disabled={isPending || o.in_use_count > 0}
                className="text-xs px-2.5 py-1.5 bg-surface-muted text-muted rounded-full hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-surface-muted disabled:hover:text-muted"
                title={
                  o.in_use_count > 0
                    ? "発注で使われているため削除不可"
                    : "削除"
                }
              >
                削除
              </button>
              <button
                onClick={() => setEditing({ mode: "edit", office: o })}
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
          key={editing.mode === "edit" ? editing.office.id : "new"}
          initial={
            editing.mode === "edit"
              ? {
                  name: editing.office.name,
                  area: editing.office.area ?? "",
                  address: editing.office.address ?? "",
                  phone: editing.office.phone ?? "",
                  fax: editing.office.fax ?? "",
                  sort_order: editing.office.sort_order,
                  is_active: editing.office.is_active,
                }
              : {
                  name: "",
                  area: "",
                  address: "",
                  phone: "",
                  fax: "",
                  sort_order: (offices.at(-1)?.sort_order ?? 0) + 1,
                  is_active: true,
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
  area: string;
  address: string;
  phone: string;
  fax: string;
  sort_order: number;
  is_active: boolean;
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
  const [area, setArea] = useState(initial.area);
  const [address, setAddress] = useState(initial.address);
  const [phone, setPhone] = useState(initial.phone);
  const [fax, setFax] = useState(initial.fax);
  const [sortOrder, setSortOrder] = useState(initial.sort_order);
  const [isActive, setIsActive] = useState(initial.is_active);

  const handleFormAction = (formData: FormData) => {
    formData.set("name", name);
    formData.set("area", area);
    formData.set("address", address);
    formData.set("phone", phone);
    formData.set("fax", fax);
    formData.set("sort_order", String(sortOrder));
    formData.set("is_active", isActive ? "true" : "false");
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
              {isEdit ? "営業所を編集" : "営業所を追加"}
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
            <Field label="営業所名" required>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
              />
            </Field>
            <Field label="エリア（例: 関東）">
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
              />
            </Field>
            <Field label="住所">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="電話番号">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
                />
              </Field>
              <Field label="FAX">
                <input
                  type="tel"
                  value={fax}
                  onChange={(e) => setFax(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-muted rounded-lg text-sm focus:outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
                />
              </Field>
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

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
