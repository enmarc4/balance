import { describe, expect, it } from "vitest";

import { getRouteGroup, resolveAuthRedirect } from "@/lib/auth/route-access";

describe("route access rules", () => {
  it("detects route groups", () => {
    expect(getRouteGroup("/ca/login")).toBe("auth");
    expect(getRouteGroup("/ca/app")).toBe("protected");
    expect(getRouteGroup("/ca/anything")).toBe("other");
  });

  it("redirects unauthenticated users from protected routes", () => {
    const redirect = resolveAuthRedirect({
      pathname: "/ca/app",
      locale: "ca",
      hasUser: false,
    });

    expect(redirect).toBe("/ca/login");
  });

  it("redirects authenticated users away from auth routes", () => {
    const redirect = resolveAuthRedirect({
      pathname: "/es/login",
      locale: "es",
      hasUser: true,
    });

    expect(redirect).toBe("/es/app");
  });

  it("keeps route untouched when access is valid", () => {
    const redirect = resolveAuthRedirect({
      pathname: "/en/app/accounts",
      locale: "en",
      hasUser: true,
    });

    expect(redirect).toBeNull();
  });
});
