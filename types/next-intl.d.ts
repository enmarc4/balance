import type { AppMessages } from "@/i18n/messages";
import type { LOCALES } from "@/i18n/locales";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof LOCALES)[number];
    Messages: AppMessages;
  }
}
