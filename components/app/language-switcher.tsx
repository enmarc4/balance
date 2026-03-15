"use client";

import { useLocale, useTranslations } from "next-intl";

import { Select } from "@/components/ui/select";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALES } from "@/i18n/locales";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  testId,
  className,
}: {
  testId?: string;
  className?: string;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Select
      data-testid={testId}
      aria-label={t("common.language")}
      className={cn(className)}
      value={locale}
      onChange={(event) =>
        router.replace(pathname, {
          locale: event.target.value as (typeof LOCALES)[number],
        })
      }
    >
      {LOCALES.map((item) => (
        <option key={item} value={item}>
          {t(`localeNames.${item}`)}
        </option>
      ))}
    </Select>
  );
}
