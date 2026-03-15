import { redirect } from "next/navigation";

type LocaleRootPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LocaleRootPage({
  params,
  searchParams,
}: LocaleRootPageProps) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const forwardedQuery = new URLSearchParams();

  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      forwardedQuery.set(key, value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => forwardedQuery.append(key, entry));
    }
  });

  const query = forwardedQuery.toString();
  redirect(`/${locale}/login${query ? `?${query}` : ""}`);
}
