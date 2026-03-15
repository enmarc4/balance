import { getTranslations } from "next-intl/server";

import { LanguageSwitcher } from "@/components/app/language-switcher";
import { SignOutButton } from "@/components/app/signout-button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/server";
import type { Locale } from "@/types/domain";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const t = await getTranslations("settings");
  await requireUser(locale);

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

      <Card>
        <p className="text-sm font-medium text-[var(--color-text)]">
          {t("languageLabel")}
        </p>
        <div className="mt-3 max-w-56">
          <LanguageSwitcher testId="settings-locale-select" />
        </div>
      </Card>

      <Card>
        <SignOutButton locale={locale} />
      </Card>
    </main>
  );
}
