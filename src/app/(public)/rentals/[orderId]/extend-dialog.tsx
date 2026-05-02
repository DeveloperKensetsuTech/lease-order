"use client";

import { useEffect, useState } from "react";
import type { RentalItemRow } from "@/lib/rentals-data";

function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function minNewEndDate(currentEnd: string | null): string {
  const today = tomorrowIso();
  if (!currentEnd) return today;
  return currentEnd >= today ? addDays(currentEnd, 1) : today;
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function ExtendDialog({
  item,
  onConfirm,
  onCancel,
}: {
  item: RentalItemRow;
  onConfirm: (newEndDate: string, reason: string) => void;
  onCancel: () => void;
}) {
  const min = minNewEndDate(item.lease_end_date);
  const [newEndDate, setNewEndDate] = useState(min);
  const [reason, setReason] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newEndDate || newEndDate < min) return;
    onConfirm(newEndDate, reason.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
      <div className="bg-surface w-full sm:max-w-md sm:rounded-xl rounded-t-xl shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground">期限を延長</h2>
          <p className="text-sm text-muted mt-0.5 truncate">{item.material_name}</p>
        </div>
        <form onSubmit={submit} className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              新しい返却期限 <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              required
              min={min}
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              className="w-full h-11 px-3.5 bg-surface border border-border-strong rounded-md text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            {item.lease_end_date && (
              <p className="text-xs text-subtle mt-1">現在の期限: {item.lease_end_date}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">理由（任意）</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="例: 工期延長のため"
              className="w-full px-3.5 py-2.5 bg-surface border border-border-strong rounded-md text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 h-10 text-sm font-medium text-muted hover:text-foreground"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!newEndDate || newEndDate < min}
              className="px-5 h-10 bg-accent text-white text-sm font-semibold rounded-md hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              延長を予約
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
