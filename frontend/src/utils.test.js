import { describe, it, expect } from "vitest";
import { toDateKey, formatDate } from "./utils";

describe("toDateKey", () => {
  it("formats a Date object to YYYY-MM-DD", () => {
    const d = new Date(2026, 5, 15);
    expect(toDateKey(d)).toBe("2026-06-15");
  });

  it("formats a date string to YYYY-MM-DD", () => {
    expect(toDateKey("2026-06-15")).toBe("2026-06-15");
  });

  it("pads single-digit months and days", () => {
    const d = new Date(2026, 0, 5);
    expect(toDateKey(d)).toBe("2026-01-05");
  });
});

describe("formatDate", () => {
  it("formats a date string to readable format", () => {
    const result = formatDate("2026-06-15");
    expect(result).toContain("Jun");
    expect(result).toContain("15");
    expect(result).toContain("2026");
  });

  it("returns empty string for falsy input", () => {
    expect(formatDate("")).toBe("");
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
  });
});
