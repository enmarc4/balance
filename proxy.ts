import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "@/i18n/routing";
import { resolveAuthRedirect } from "@/lib/auth/route-access";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/env";

const intlMiddleware = createIntlMiddleware(routing);

async function getSessionStatus(request: NextRequest, response: NextResponse) {
  if (!isSupabaseConfigured()) {
    return { response, hasUser: false };
  }

  const env = getSupabaseEnv();
  let authResponse = response;

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          authResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            authResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    response: authResponse,
    hasUser: Boolean(user),
  };
}

export async function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request);
  const { response, hasUser } = await getSessionStatus(request, intlResponse);

  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const localeSegment = segments[0];

  if (
    !localeSegment ||
    !routing.locales.includes(localeSegment as (typeof routing.locales)[number])
  ) {
    return response;
  }

  const redirectPath = resolveAuthRedirect({
    pathname: request.nextUrl.pathname,
    locale: localeSegment as (typeof routing.locales)[number],
    hasUser,
  });

  if (!redirectPath) {
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = redirectPath;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
