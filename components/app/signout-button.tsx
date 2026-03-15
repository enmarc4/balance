"use client";

import { startTransition } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Locale } from "@/types/domain";

export function SignOutButton({ locale }: { locale: Locale }) {
  const t = useTranslations("settings");
  const router = useRouter();

  return (
    <Button
      variant="primary"
      className="w-full"
      onClick={() =>
        startTransition(async () => {
          const supabase = createSupabaseBrowserClient();
          await supabase.auth.signOut();
          router.replace("/login", { locale });
          router.refresh();
        })
      }
    >
      {t("logout")}
    </Button>
  );
}
