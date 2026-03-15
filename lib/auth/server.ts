import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Locale } from "@/types/domain";

export async function requireUser(locale: Locale) {
  if (!isSupabaseConfigured()) {
    redirect(`/${locale}/login`);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return user;
}

export async function getProfileForUser(userId: string) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "id,user_id,display_name,preferred_currency,onboarding_completed_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}
