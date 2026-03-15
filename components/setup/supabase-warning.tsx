import { getTranslations } from "next-intl/server";

import { Card } from "@/components/ui/card";

export async function SupabaseWarning() {
  const t = await getTranslations("setup");

  return (
    <Card className="border-amber-300 bg-amber-50">
      <h2 className="text-lg font-semibold text-amber-900">{t("title")}</h2>
      <p className="mt-2 text-sm text-amber-900/90">{t("body")}</p>
    </Card>
  );
}
