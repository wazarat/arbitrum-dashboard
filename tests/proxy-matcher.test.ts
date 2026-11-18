import { describe, expect, it } from "vitest";
import { config } from "@/proxy";

/** Next turns each matcher into a full-path regex; this mirrors that closely enough for these paths. */
const matches = (path: string) => config.matcher.some((m) => new RegExp(`^${m}$`).test(path));

describe("proxy matcher", () => {
  it("sends Clerk's frontend API proxy through the proxy, scripts included", () => {
    expect(matches("/__clerk/npm/@clerk/clerk-js@6/dist/clerk.browser.js")).toBe(true);
    expect(matches("/__clerk/v1/client")).toBe(true);
  });
  it("still runs on pages and the gated API, and skips static files", () => {
    expect(matches("/sectors/")).toBe(true);
    expect(matches("/api/data/gated/")).toBe(true);
    expect(matches("/_next/static/chunks/app.js")).toBe(false);
    expect(matches("/og.png")).toBe(false);
  });
});
