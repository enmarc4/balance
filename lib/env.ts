import { z } from "zod";

const supabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const appUrlSchema = z.url();

const supabaseEnvResult = supabaseEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

const appUrlResult = appUrlSchema.safeParse(process.env.NEXT_PUBLIC_APP_URL);

export function isSupabaseConfigured() {
  return supabaseEnvResult.success;
}

export function getSupabaseEnv() {
  if (!supabaseEnvResult.success) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return supabaseEnvResult.data;
}

export function getAppUrl() {
  if (appUrlResult.success) {
    return appUrlResult.data;
  }

  return "http://localhost:3000";
}
