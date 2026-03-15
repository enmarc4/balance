"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  House,
  PiggyBank,
  Settings2,
} from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { QuickTransactionSheet } from "@/components/app/quick-transaction-sheet";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/types/domain";

const items = [
  { key: "accounts", href: "/app/accounts", icon: PiggyBank },
  { key: "home", href: "/app", icon: House },
  { key: "settings", href: "/app/settings", icon: Settings2 },
] as const;

const quickActions = [
  { key: "send", icon: ArrowUpRight, mode: "expense", tone: "expense" },
  {
    key: "request",
    icon: ArrowDownLeft,
    mode: "income",
    tone: "income",
  },
] as const;

export function MobileNav() {
  const locale = useLocale();
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tAction = useTranslations("dashboard.actions");
  const [sheetMode, setSheetMode] = useState<TransactionType | null>(null);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(14px,env(safe-area-inset-bottom))]">
        <div className="w-full max-w-[430px] space-y-2">
          <div className="pointer-events-auto grid grid-cols-2 gap-2 rounded-[22px] border border-[var(--color-border)] bg-[var(--color-card)] p-2">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.key}
                  type="button"
                  aria-label={tAction(action.key)}
                  onClick={() => setSheetMode(action.mode)}
                  className={cn(
                    "inline-flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border px-3 text-sm font-semibold transition-colors",
                    action.tone === "income"
                      ? "border-[var(--color-action-hover)] bg-[var(--color-accent)] text-[var(--color-accent-text)] hover:bg-[var(--color-action-hover)]"
                      : "border-transparent bg-[var(--color-text)] !text-white hover:bg-[#1f1f22] hover:!text-white",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      action.tone === "expense" && "!text-white",
                    )}
                  />
                  <span className={cn(action.tone === "expense" && "!text-white")}>
                    {tAction(action.key)}
                  </span>
                </button>
              );
            })}
          </div>

          <nav className="pointer-events-auto">
            <ul className="flex items-center justify-between gap-2 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 shadow-[var(--shadow-card)]">
              {items.map((item) => {
                const href = `/${locale}${item.href}`;
                const isActive =
                  pathname === href || pathname.startsWith(`${href}/`);
                const Icon = item.icon;

                return (
                  <li key={item.key} className="flex-1">
                    <Link
                      href={item.href}
                      aria-label={tNav(item.key)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] text-[var(--color-text-muted)] transition-all",
                        "hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]",
                        isActive &&
                          "h-16 w-16 -translate-y-0.5 rounded-[18px] border border-[var(--color-action-hover)] bg-[var(--color-accent)] text-[var(--color-accent-text)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-text)]",
                      )}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="sr-only">{tNav(item.key)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
      <QuickTransactionSheet
        mode={sheetMode}
        onClose={() => setSheetMode(null)}
      />
    </>
  );
}
