import { z } from "zod";

import { CURRENCIES } from "@/lib/currencies";

const currencySchema = z.enum(CURRENCIES, { message: "invalidCurrency" });

const accountTypeSchema = z.enum([
  "cash",
  "checking",
  "savings",
  "investment",
  "credit",
  "wallet",
]);

export const createAccountSchema = z.object({
  name: z.string().min(2, "minAccountName"),
  type: accountTypeSchema,
  currency: currencySchema,
  currentBalance: z.number(),
});

export const updateAccountSchema = createAccountSchema.extend({
  id: z.string().uuid(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
