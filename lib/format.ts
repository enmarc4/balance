import type { CurrencyCode, Locale } from "@/types/domain";

export function mapLocaleToIntl(locale: Locale) {
  if (locale === "ca") {
    return "ca-ES";
  }

  if (locale === "es") {
    return "es-ES";
  }

  return "en-US";
}

export function formatMoney(
  amount: number,
  locale: Locale,
  currency: CurrencyCode,
) {
  return new Intl.NumberFormat(mapLocaleToIntl(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateIso: string, locale: Locale) {
  return new Intl.DateTimeFormat(mapLocaleToIntl(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateIso));
}
