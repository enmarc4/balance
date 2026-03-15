import { getTranslations } from "next-intl/server";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import type { Locale } from "@/types/domain";

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const t = await getTranslations("auth.forgot");
  const tCommon = await getTranslations("common");
  const tAuth = await getTranslations("auth");

  return (
    <AuthShell
      appName={tCommon("appName")}
      title={t("title")}
      subtitle={t("subtitle")}
      locale={locale}
      mode="forgot-password"
      loginLabel={tAuth("tabs.login")}
      signupLabel={tAuth("tabs.register")}
    >
      <ForgotPasswordForm locale={locale} />
    </AuthShell>
  );
}
