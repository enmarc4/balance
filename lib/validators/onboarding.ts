import { z } from "zod";

import { CURRENCIES } from "@/lib/currencies";

const currencySchema = z.enum(CURRENCIES, { message: "invalidCurrency" });

export const onboardingSchema = z.object({
  fullName: z.string().min(2, "minName"),
  preferredCurrency: currencySchema,
  firstAccountName: z.string().min(2, "minAccountName"),
  firstAccountType: z.enum([
    "cash",
    "checking",
    "savings",
    "investment",
    "credit",
    "wallet",
  ]),
  firstAccountCurrency: currencySchema,
  firstAccountBalance: z.number(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
