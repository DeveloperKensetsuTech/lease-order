"use client";

import { useState, useTransition } from "react";
import { Button, ButtonLink, SectionRule } from "@/components/admin/ui";
import type { AdminApplicationRow } from "@/lib/admin-data";
import { approveApplication, rejectApplication } from "../actions";

type Issued = {
  companyId: string;
  tempPassword: string;
  emailSent: boolean;
  contactEmail: string;
};

export default function ApplicationsList({
  applications,
}: {
  applications: AdminApplicationRow[];
}) {
  const [rows, setRows] = useState(applications);
  const [issued, setIssued] = useState<Record<string, Issued>>({});

  if (rows.length === 0 && Object.keys(issued).length === 0) {
    return (
      <div className="border border-rule bg-surface-muted/40 px-4 py-8 text-center text-sm text-muted">
        承認待ちの申請はありません
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((app) => (
        <ApplicationCard
          key={app.id}
          app={app}
          issued={issued[app.id]}
          onApproved={(info) => {
            setIssued((prev) => ({ ...prev, [app.id]: info }));
            setRows((prev) => prev.filter((r) => r.id !== app.id));
          }}
          onRejected={() => setRows((prev) => prev.filter((r) => r.id !== app.id))}
        />
      ))}
      {/* 承認直後の資格情報カードは rows から消えても表示し続ける */}
      {Object.entries(issued).map(([id, info]) =>
        rows.find((r) => r.id === id) ? null : (
          <IssuedCard key={`issued-${id}`} info={info} />
        )
      )}
    </div>
  );
}

function ApplicationCard({
  app,
  issued,
  onApproved,
  onRejected,
}: {
  app: AdminApplicationRow;
  issued?: Issued;
  onApproved: (info: Issued) => void;
  onRejected: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (issued) return <IssuedCard info={issued} />;

  function onApprove() {
    if (!confirm(`「${app.company_name}」を承認し、アカウントを発行します。よろしいですか？`)) return;
    setError(null);
    startTransition(async () => {
      const res = await approveApplication(app.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onApproved({
        companyId: res.companyId,
        tempPassword: res.tempPassword,
        emailSent: res.emailSent,
        contactEmail: res.contactEmail,
      });
    });
  }

  function onReject() {
    const reason = prompt("却下理由（任意・社内メモ）を入力してください。空欄でも却下できます。");
    if (reason === null) return; // キャンセル
    setError(null);
    startTransition(async () => {
      const res = await rejectApplication(app.id, reason || undefined);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onRejected();
    });
  }

  return (
    <div className="border border-rule bg-surface px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{app.company_name}</p>
          <dl className="mt-2 space-y-1 text-xs text-muted">
            {app.contact_name && (
              <div className="flex gap-2">
                <dt className="w-16 text-subtle">担当</dt>
                <dd className="text-foreground">{app.contact_name}</dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="w-16 text-subtle">メール</dt>
              <dd className="text-foreground break-all">{app.contact_email}</dd>
            </div>
            {app.phone && (
              <div className="flex gap-2">
                <dt className="w-16 text-subtle">電話</dt>
                <dd className="text-foreground">{app.phone}</dd>
              </div>
            )}
            {app.note && (
              <div className="flex gap-2">
                <dt className="w-16 text-subtle">備考</dt>
                <dd className="text-foreground whitespace-pre-wrap">{app.note}</dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="w-16 text-subtle">申請日</dt>
              <dd className="text-foreground">
                {new Date(app.created_at).toLocaleString("ja-JP", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Button size="sm" onClick={onApprove} disabled={isPending}>
            {isPending ? "処理中…" : "承認して発行"}
          </Button>
          <Button size="sm" variant="ghost" onClick={onReject} disabled={isPending}>
            却下
          </Button>
        </div>
      </div>
      {error && (
        <div
          role="alert"
          className="mt-3 px-3 py-2 border-l-2 border-[var(--color-status-rejected-fg)] bg-[var(--color-status-rejected-bg)] text-xs text-[var(--color-status-rejected-fg)]"
        >
          {error}
        </div>
      )}
    </div>
  );
}

function IssuedCard({ info }: { info: Issued }) {
  const [copied, setCopied] = useState<"id" | "pw" | null>(null);

  async function copy(value: string, kind: "id" | "pw") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="border border-rule bg-surface px-4 py-4 space-y-4">
      <div className="border-l-2 border-[var(--color-status-completed-fg)] bg-[var(--color-status-completed-bg)] px-4 py-3 text-sm text-[var(--color-status-completed-fg)]">
        <p className="font-semibold">アカウントを発行しました</p>
        <p className="text-xs mt-1 leading-relaxed">
          {info.emailSent
            ? `${info.contactEmail} 宛に会社 ID と初期パスワードを送信しました。`
            : `メール送信に失敗しました。下記の情報を ${info.contactEmail} へ別途お伝えください。`}
        </p>
      </div>

      <SectionRule label="発行された認証情報" />
      <div className="space-y-3">
        <CredentialRow
          label="会社 ID"
          value={info.companyId}
          copied={copied === "id"}
          onCopy={() => copy(info.companyId, "id")}
        />
        <CredentialRow
          label="初期パスワード"
          value={info.tempPassword}
          copied={copied === "pw"}
          onCopy={() => copy(info.tempPassword, "pw")}
        />
      </div>
      <ButtonLink href="/admin/customers" size="sm" variant="secondary">
        顧客一覧へ
      </ButtonLink>
    </div>
  );
}

function CredentialRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-wider text-subtle">
        {label}
      </div>
      <code className="flex-1 px-3 py-2 bg-surface-muted border border-rule font-[family-name:var(--font-mono)] text-sm tabular-nums">
        {value}
      </code>
      <Button size="sm" variant="secondary" onClick={onCopy}>
        {copied ? "コピー済" : "コピー"}
      </Button>
    </div>
  );
}
