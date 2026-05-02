"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/admin/auth-actions";

type NavItem = {
  href: string;
  label: string;
  badge?: number;
  disabled?: boolean;
  hint?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

export type SidebarProps = {
  pendingCount: number;
  email: string | null;
  onNavigate?: () => void;
};

export default function Sidebar({ pendingCount, email, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const groups: NavGroup[] = [
    {
      label: "業務",
      items: [
        { href: "/admin", label: "ダッシュボード" },
        {
          href: "/admin/orders",
          label: "発注管理",
          badge: pendingCount > 0 ? pendingCount : undefined,
        },
      ],
    },
    {
      label: "マスタ",
      items: [
        { href: "/admin/materials", label: "資材" },
        { href: "/admin/categories", label: "カテゴリ" },
        { href: "/admin/offices", label: "営業所" },
        { href: "/admin/customers", label: "顧客", disabled: true, hint: "近日" },
      ],
    },
    {
      label: "設定",
      items: [
        { href: "/admin/users", label: "管理ユーザー" },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="flex h-full w-full flex-col bg-surface">
      <div className="px-5 py-4 border-b border-border">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="text-base font-bold tracking-tight text-accent"
        >
          管理画面
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                if (item.disabled) {
                  return (
                    <li key={item.href}>
                      <span className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-subtle cursor-not-allowed">
                        <span>{item.label}</span>
                        {item.hint && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-surface-muted text-subtle rounded">
                            {item.hint}
                          </span>
                        )}
                      </span>
                    </li>
                  );
                }
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        active
                          ? "bg-accent text-white font-medium"
                          : "text-foreground hover:bg-surface-muted"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-5 py-4 space-y-2">
        {email && (
          <p className="text-xs text-subtle truncate" title={email}>
            {email}
          </p>
        )}
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-muted hover:text-accent transition-colors"
          >
            サインアウト
          </button>
        </form>
      </div>
    </div>
  );
}
