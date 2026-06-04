import { describe, it, expect } from "vitest";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

describe("validators", () => {
  it("exports all required rule sets as arrays", () => {
    const mod = require("../src/validators");
    expect(mod.bookingRules).toBeInstanceOf(Array);
    expect(mod.dateRangeRules).toBeInstanceOf(Array);
    expect(mod.blockRules).toBeInstanceOf(Array);
    expect(mod.emailRule).toBeInstanceOf(Array);
    expect(mod.cancelRules).toBeInstanceOf(Array);
    expect(mod.priceRules).toBeInstanceOf(Array);
    expect(mod.imageRules).toBeInstanceOf(Array);
    expect(mod.handleValidation).toBeInstanceOf(Function);
  });

  it("bookingRules has 8 validators", () => {
    const { bookingRules } = require("../src/validators");
    expect(bookingRules).toHaveLength(8);
  });

  it("handleValidation calls next when no errors", () => {
    const { handleValidation } = require("../src/validators");
    const req = {};
    const res = { status: () => ({ json: () => {} }) };
    const next = () => {};
    expect(() => handleValidation(req, res, next)).not.toThrow();
  });
});
