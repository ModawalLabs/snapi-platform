import { describe, expect, it } from "vitest";

import { clamp, cn, formatCompact, formatPrice } from "@/lib/utils";

describe("cn", () => {
  it("resolves conflicting Tailwind utilities in favour of the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy values", () => {
    expect(cn("flex", false && "hidden", undefined, "gap-2")).toBe("flex gap-2");
  });
});

describe("formatPrice", () => {
  it("treats the input as minor units", () => {
    expect(formatPrice(1999)).toBe("$19.99");
  });

  it("honours a non-USD currency", () => {
    expect(formatPrice(250000, { currency: "INR", locale: "en-IN" })).toContain("2,500");
  });

  it("can hide decimals for whole-unit display", () => {
    expect(formatPrice(2000, { showDecimals: false })).toBe("$20");
  });

  it("does not accumulate float error across a cart total", () => {
    const lines = [1999, 1999, 1999];
    const total = lines.reduce((sum, line) => sum + line, 0);
    expect(formatPrice(total)).toBe("$59.97");
  });
});

describe("formatCompact", () => {
  it("abbreviates large counts", () => {
    expect(formatCompact(1200)).toBe("1.2K");
  });
});

describe("clamp", () => {
  it("bounds the value on both sides", () => {
    expect(clamp(15, 1, 10)).toBe(10);
    expect(clamp(-5, 1, 10)).toBe(1);
    expect(clamp(5, 1, 10)).toBe(5);
  });
});
