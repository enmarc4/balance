import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { SupabaseWarning } from "@/components/setup/supabase-warning";
import { getProfileForUser, requireUser } from "@/lib/auth/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Locale } from "@/types/domain";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;

  if (!isSupabaseConfigured()) {
    return (
      <div className="app-mobile-root">
        <main className="app-mobile-frame bg-[var(--color-shell)] px-4 py-8">
          <SupabaseWarning />
        </main>
      </div>
    );
  }

  const user = await requireUser(locale);
  const profile = await getProfileForUser(user.id);

  if (profile?.onboarding_completed_at) {
    redirect(`/${locale}/app`);
  }

  return (
    <div className="app-mobile-root">
      <main className="app-mobile-frame bg-[var(--color-shell)] px-4 py-6">
        <OnboardingForm locale={locale} />
      </main>
    </div>
  );
}
