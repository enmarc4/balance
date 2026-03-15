import type { Locale } from "@/types/domain";

type RouteGroup = "auth" | "protected" | "other";

const AUTH_SEGMENTS = new Set(["login", "register", "forgot-password"]);
const PROTECTED_SEGMENTS = new Set(["onboarding", "app"]);

export function getRouteGroup(pathname: string): RouteGroup {
  const segments = pathname.split("/").filter(Boolean);
  const segment = segments[1] ?? "";

  if (AUTH_SEGMENTS.has(segment)) {
    return "auth";
  }

  if (PROTECTED_SEGMENTS.has(segment)) {
    return "protected";
  }

  return "other";
}

export function resolveAuthRedirect(params: {
  pathname: string;
  locale: Locale;
  hasUser: boolean;
}) {
  const routeGroup = getRouteGroup(params.pathname);

  if (!params.hasUser && routeGroup === "protected") {
    return `/${params.locale}/login`;
  }

  if (params.hasUser && routeGroup === "auth") {
    return `/${params.locale}/app`;
  }

  return null;
}
