import { getTranslations } from "next-intl/server";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Bell,
  CirclePlus,
  Sparkles,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { getProfileForUser, requireUser } from "@/lib/auth/server";
import { formatDate, formatMoney } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CurrencyCode, Locale } from "@/types/domain";

function getInitials(value: string | null | undefined) {
  if (!value) {
    return "B";
  }

  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "B";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? "B"}${parts[1][0] ?? "A"}`.toUpperCase();
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const t = await getTranslations("dashboard");
  const tCommon = await getTranslations("common");

  const user = await requireUser(locale);
  const supabase = await createSupabaseServerClient();
  const profile = await getProfileForUser(user.id);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    { data: accounts },
    { data: monthlyTransactions },
    { data: recentTransactions },
  ] = await Promise.all([
    supabase
      .from("accounts")
      .select("id,name,current_balance,currency,status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("transactions")
      .select("amount,type,currency,transaction_date")
      .eq("user_id", user.id)
      .gte("transaction_date", monthStart.toISOString()),
    supabase
      .from("transactions")
      .select("id,name,amount,type,currency,transaction_date")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false })
      .limit(4),
  ]);

  const activeAccountItems =
    accounts?.filter((item) => item.status === "active") ?? [];
  const activeAccounts = activeAccountItems.length;

  const monthlyIncome =
    monthlyTransactions
      ?.filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount ?? 0), 0) ?? 0;

  const monthlyExpense =
    monthlyTransactions
      ?.filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount ?? 0), 0) ?? 0;

  const netMonth = monthlyIncome - monthlyExpense;
  const totalBalance =
    accounts?.reduce(
      (sum, item) => sum + Number(item.current_balance ?? 0),
      0,
    ) ?? 0;
  const primaryCurrency = (profile?.preferred_currency ??
    accounts?.[0]?.currency ??
    "EUR") as CurrencyCode;
  const monthlySignalValue = formatMoney(
    Math.abs(netMonth),
    locale,
    primaryCurrency,
  );

  return (
    <main className="space-y-5">
      <section className="overflow-hidden rounded-[30px] bg-[#f4f4f5] p-4 shadow-[0_14px_40px_rgba(15,23,42,0.09)] sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="rounded-2xl bg-[#b1b1b5] px-4 py-2 text-sm font-semibold text-white">
            {t("highlight")}
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-[#9ce66f] px-3 py-2 text-sm font-semibold text-[#1f4210]">
            <Sparkles className="h-4 w-4" />
            <span>
              {t("monthlySignal", {
                value: monthlySignalValue,
                mode: netMonth >= 0 ? t("signalPositive") : t("signalNegative"),
              })}
            </span>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="inline-flex min-w-0 items-center gap-3">
            <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#d2d2d5] bg-white text-lg font-semibold text-[#202024]">
              {getInitials(profile?.display_name)}
              <span className="absolute -bottom-1.5 -right-1.5 h-4 w-4 rounded-full border-2 border-[#f4f4f5] bg-[#d43434]" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-4xl font-semibold leading-none tracking-tight text-[#111114]">
                {t("welcomeTitle")}
              </h1>
              <p className="mt-1 truncate text-sm text-[#6a6a70]">
                {t("welcomeSubtitle", { appName: tCommon("appName") })}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label={t("notifications")}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#d9d9dc] bg-white text-[#1f4010]"
          >
            <Bell className="h-5 w-5" />
          </button>
        </div>

        <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {activeAccountItems.map((account) => (
            <Card
              key={account.id}
              className="w-[86%] shrink-0 snap-start rounded-[24px] border-0 bg-[#dfdfe0] p-5 shadow-none"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold text-[#28282c]">
                    {account.name}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#5f5f64]">
                    {account.currency}
                  </p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white/70">
                  <Banknote className="h-5 w-5 text-[#1e3b10]" />
                </div>
              </div>
              <p className="mt-7 text-sm text-[#65656a]">
                {t("currentBalance")}
              </p>
              <p className="mt-1 text-4xl font-semibold tracking-tight text-[#111113]">
                {formatMoney(
                  Number(account.current_balance ?? 0),
                  locale,
                  account.currency as CurrencyCode,
                )}
              </p>
            </Card>
          ))}

          <Link
            href="/app/accounts"
            locale={locale}
            className="flex w-[86%] shrink-0 snap-start items-center justify-between rounded-[24px] border border-dashed border-[#d0d0d5] bg-[#f2f2f3] p-5 transition-colors hover:bg-[#ececee]"
          >
            <div>
              <p className="text-lg font-semibold text-[#2a2a2f]">
                {t("newAccountTitle")}
              </p>
              <p className="mt-1 text-sm text-[#686870]">
                {t("newAccountBody")}
              </p>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-full border border-[#c9c9ce] bg-white">
              <CirclePlus className="h-6 w-6 text-[#2a2a2f]" />
            </div>
          </Link>
        </div>
      </section>

      <section className="space-y-3 rounded-[26px] bg-[#f4f4f5] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-[#111114]">
            {t("transactionsTitle")}
          </h2>
          <Link
            href="/app/accounts"
            locale={locale}
            className="text-base font-semibold text-[#2d5f16] underline underline-offset-2"
          >
            {t("seeAll")}
          </Link>
        </div>

        {recentTransactions && recentTransactions.length > 0 ? (
          <div className="space-y-2">
            {recentTransactions.map((item) => {
              const isIncome = item.type === "income";
              const SignIcon = isIncome ? ArrowDownLeft : ArrowUpRight;

              return (
                <article
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl bg-white px-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#dbdbde] bg-[#f7f7f8]">
                      <SignIcon className="h-5 w-5 text-[#2c2c31]" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-[#222228]">
                        {item.name}
                      </p>
                      <p className="truncate text-sm text-[#6a6a70]">
                        {formatDate(item.transaction_date, locale)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-semibold ${
                        isIncome ? "text-[#376f1a]" : "text-[#b23e3e]"
                      }`}
                    >
                      {isIncome ? "+" : "-"}{" "}
                      {formatMoney(
                        Number(item.amount ?? 0),
                        locale,
                        item.currency as CurrencyCode,
                      )}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <Card className="rounded-2xl border border-dashed border-[#cfcfd4] bg-white p-4 shadow-none">
            <p className="text-sm text-[#66666d]">{t("empty")}</p>
          </Card>
        )}
      </section>

      <section className="rounded-[24px] bg-[#f4f4f5] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <p className="text-sm text-[#64646a]">{t("summaryLabel")}</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight text-[#111114]">
          {formatMoney(totalBalance, locale, primaryCurrency)}
        </p>
        <p className="mt-2 text-sm text-[#64646a]">
          {t("activeAccountsLabel", { count: activeAccounts })}
        </p>
      </section>
    </main>
  );
}
