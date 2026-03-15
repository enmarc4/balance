import { getTranslations } from "next-intl/server";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import type { Locale } from "@/types/domain";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const t = await getTranslations("auth.register");
  const tCommon = await getTranslations("common");
  const tAuth = await getTranslations("auth");

  return (
    <AuthShell
      appName={tCommon("appName")}
      title={t("title")}
      subtitle={t("subtitle")}
      locale={locale}
      mode="register"
      loginLabel={tAuth("tabs.login")}
      signupLabel={tAuth("tabs.register")}
    >
      <RegisterForm locale={locale} />
    </AuthShell>
  );
}
