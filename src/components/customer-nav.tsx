"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { logout } from "@/app/(public)/login/actions";

type CustomerSummary = { id: string; company_id: string; name: string };

type NavItem = {
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
  badge?: number;
  icon: (active: boolean) => React.ReactNode;
};

function ItemIcon({ d, active }: { d: string; active: boolean }) {
  return (
    <svg
      className={`h-5 w-5 ${active ? "text-accent" : "text-muted"}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.7}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function getNavItems(overdueCount: number): NavItem[] {
  return [
    {
      label: "発注",
      href: "/",
      isActive: (p) => p === "/" || p.startsWith("/category") || p.startsWith("/search") || p.startsWith("/cart"),
      icon: (active) => <ItemIcon active={active} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
    },
    {
      label: "レンタル品",
      href: "/rentals",
      isActive: (p) => p.startsWith("/rentals"),
      badge: overdueCount,
      icon: (active) => (
        <ItemIcon
          active={active}
          d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-7 0H4a1 1 0 01-1-1V8a1 1 0 011-1h3l1-2h8l1 2h3a1 1 0 011 1v8a1 1 0 01-1 1h-2m-7 0h6"
        />
      ),
    },
    {
      label: "発注履歴",
      href: "/orders",
      isActive: (p) => p.startsWith("/orders"),
      icon: (active) => (
        <ItemIcon
          active={active}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      ),
    },
    {
      label: "マイページ",
      href: "/account",
      isActive: (p) => p.startsWith("/account"),
      icon: (active) => (
        <ItemIcon
          active={active}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      ),
    },
  ];
}

function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="absolute top-1 right-1 md:top-2 md:right-3 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold bg-red-600 text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function CustomerNav({ customer, overdueCount }: { customer: CustomerSummary; overdueCount: number }) {
  const pathname = usePathname();
  const items = getNavItems(overdueCount);
  const [isPending, startTransition] = useTransition();

  function onLogout() {
    startTransition(async () => {
      await logout();
    });
  }

  if (pathname.startsWith("/admin") || pathname === "/login") {
    return null;
  }

  return (
    <>
      {/* PC: 左サイドバー */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 flex-col bg-surface border-r border-border z-40">
        <Link href="/" className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Image
            src="/images/logo-union.png"
            alt="union"
            width={486}
            height={823}
            priority
            className="h-10 w-auto"
          />
          <span className="text-base font-bold tracking-tight text-cyan-500">
            発注<span className="text-[10px] font-medium ml-0.5">for リース</span>
          </span>
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((item) => {
            const active = item.isActive(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  active ? "bg-accent/10 text-accent" : "text-muted hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                {item.icon(active)}
                <span>{item.label}</span>
                {item.badge ? <Badge count={item.badge} /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-border space-y-1">
          <p className="text-xs font-medium text-foreground truncate">{customer.name}</p>
          <p className="text-[10px] font-mono text-subtle truncate">{customer.company_id}</p>
          <button
            type="button"
            onClick={onLogout}
            disabled={isPending}
            className="mt-2 w-full text-left text-xs font-medium text-muted hover:text-foreground disabled:opacity-50"
          >
            ログアウト
          </button>
        </div>
      </aside>

      {/* モバイル: ボトムタブ */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-surface border-t border-border z-40 grid grid-cols-4 pb-[env(safe-area-inset-bottom,0)]">
        {items.map((item) => {
          const active = item.isActive(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                active ? "text-accent" : "text-muted hover:text-foreground"
              }`}
            >
              {item.icon(active)}
              <span>{item.label}</span>
              {item.badge ? <Badge count={item.badge} /> : null}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
