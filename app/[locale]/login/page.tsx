import { getTranslations } from "next-intl/server";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import type { Locale } from "@/types/domain";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const t = await getTranslations("auth.login");
  const tCommon = await getTranslations("common");
  const tAuth = await getTranslations("auth");

  return (
    <AuthShell
      appName={tCommon("appName")}
      title={t("title")}
      subtitle={t("subtitle")}
      locale={locale}
      mode="login"
      loginLabel={tAuth("tabs.login")}
      signupLabel={tAuth("tabs.register")}
    >
      <LoginForm locale={locale} />
    </AuthShell>
  );
}
