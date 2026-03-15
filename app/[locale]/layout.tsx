import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { QueryProvider } from "@/components/providers/query-provider";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/types/domain";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <QueryProvider>{children}</QueryProvider>
    </NextIntlClientProvider>
  );
}
