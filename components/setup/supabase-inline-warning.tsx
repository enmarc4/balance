"use client";

import { useTranslations } from "next-intl";

export function SupabaseInlineWarning() {
  const t = useTranslations("setup");

  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      <p className="font-semibold">{t("title")}</p>
      <p className="mt-1">{t("body")}</p>
    </div>
  );
}
