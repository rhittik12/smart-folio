import { describe, it, expect } from "vitest";
import { canDeletePortfolio } from "./portfolio-guards";

describe("canDeletePortfolio", () => {
  it("returns true when server status is FAILED", () => {
    expect(canDeletePortfolio("FAILED")).toBe(true);
  });

  it("returns false when server status is GENERATING (transient stream error)", () => {
    // Stream hook may report error, but the backend hasn't confirmed failure.
    // Deletion must NOT happen in this case.
    expect(canDeletePortfolio("GENERATING")).toBe(false);
  });

  it("returns false when server status is READY", () => {
    expect(canDeletePortfolio("READY")).toBe(false);
  });

  it("returns false when server status is DRAFT", () => {
    expect(canDeletePortfolio("DRAFT")).toBe(false);
  });

  it("returns false when server status is undefined", () => {
    expect(canDeletePortfolio(undefined)).toBe(false);
  });
});
