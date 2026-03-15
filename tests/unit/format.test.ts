import { describe, expect, it } from "vitest";

import { formatDate, formatMoney, mapLocaleToIntl } from "@/lib/format";

describe("format helpers", () => {
  it("maps app locale to Intl locale", () => {
    expect(mapLocaleToIntl("ca")).toBe("ca-ES");
    expect(mapLocaleToIntl("es")).toBe("es-ES");
    expect(mapLocaleToIntl("en")).toBe("en-US");
  });

  it("formats money with locale and currency", () => {
    const value = formatMoney(1234.5, "es", "EUR");
    expect(value).toContain("€");
  });

  it("formats date with locale", () => {
    const value = formatDate("2026-01-15T00:00:00.000Z", "en");
    expect(value).toContain("2026");
  });
});
