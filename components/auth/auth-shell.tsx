import { ReactNode } from "react";

import { LanguageSwitcher } from "@/components/app/language-switcher";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types/domain";

interface AuthShellProps {
  appName: string;
  title: string;
  subtitle: string;
  locale: Locale;
  mode: "login" | "register" | "forgot-password";
  loginLabel: string;
  signupLabel: string;
  children: ReactNode;
}

export function AuthShell({
  appName,
  title,
  subtitle,
  locale,
  mode,
  loginLabel,
  signupLabel,
  children,
}: AuthShellProps) {
  const activeTab = mode === "register" ? "register" : "login";

  return (
    <main className="app-mobile-root">
      <section className="app-mobile-frame flex flex-col overflow-hidden bg-black text-white">
        <header className="relative overflow-hidden px-6 pb-8 pt-7">
          <div className="absolute right-6 top-6 w-24">
            <LanguageSwitcher
              testId="auth-locale-select"
              className="h-9 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs text-white shadow-none focus-visible:ring-white/40"
            />
          </div>

          <p className="text-sm font-semibold tracking-[0.24em] uppercase text-white/80">
            {appName}
          </p>
          <h1 className="mt-9 text-5xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-3 max-w-[18rem] text-base leading-6 text-white/75">
            {subtitle}
          </p>

          <div className="pointer-events-none absolute -right-20 top-8 h-[370px] w-[370px]">
            <span className="absolute inset-0 rounded-full border border-white/45" />
            <span className="absolute inset-[22px] rounded-full border border-white/35" />
            <span className="absolute inset-[44px] rounded-full border border-white/25" />
            <span className="absolute inset-[66px] rounded-full border border-white/14" />
          </div>

          <div className="mt-11 grid grid-cols-2 gap-2 rounded-full bg-white/10 p-1 backdrop-blur">
            <Link
              locale={locale}
              href="/login"
              className={cn(
                "rounded-full px-4 py-2.5 text-center text-sm font-semibold transition-colors",
                activeTab === "login"
                  ? "bg-[var(--color-accent)] text-[var(--color-accent-text)]"
                  : "text-white/80 hover:text-white",
              )}
            >
              {loginLabel}
            </Link>
            <Link
              locale={locale}
              href="/register"
              className={cn(
                "rounded-full px-4 py-2.5 text-center text-sm font-semibold transition-colors",
                activeTab === "register"
                  ? "bg-[var(--color-accent)] text-[var(--color-accent-text)]"
                  : "text-white/80 hover:text-white",
              )}
            >
              {signupLabel}
            </Link>
          </div>
        </header>

        <section className="mt-auto rounded-t-[var(--radius-shell)] border-t border-[#cfcfd3] bg-[var(--color-auth-panel)] px-5 pb-8 pt-6 text-[var(--color-text)]">
          {children}
        </section>
      </section>
    </main>
  );
}
