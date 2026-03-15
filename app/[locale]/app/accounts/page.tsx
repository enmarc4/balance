import { getTranslations } from "next-intl/server";

import { AccountManager } from "@/components/accounts/account-manager";
import { requireUser } from "@/lib/auth/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AccountItem, Locale } from "@/types/domain";

export default async function AccountsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const t = await getTranslations("accounts");

  const user = await requireUser(locale);
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("accounts")
    .select(
      "id,user_id,name,type,currency,current_balance,status,created_at,updated_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="space-y-4">
      <section className="rounded-[28px] bg-black px-4 pb-5 pt-4 text-white shadow-[var(--shadow-card)]">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-white/75">
          {t("subtitle")}
        </p>
      </section>
      <AccountManager
        locale={locale}
        initialAccounts={(data ?? []) as AccountItem[]}
      />
    </main>
  );
}
