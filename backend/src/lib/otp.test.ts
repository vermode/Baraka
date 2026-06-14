import { describe, expect, it } from "vitest";
import { generateOtp } from "./otp";

describe("generateOtp", () => {
  it("returns 8 numeric digits by default", () => {
    const otp = generateOtp();
    expect(otp).toMatch(/^[0-9]{8}$/);
  });

  it("respects a custom length", () => {
    expect(generateOtp(4)).toMatch(/^[0-9]{4}$/);
    expect(generateOtp(8)).toHaveLength(8);
  });

  it("produces varied output across many calls", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) seen.add(generateOtp());
    // With 10^6 space, 200 draws should be effectively unique.
    expect(seen.size).toBeGreaterThan(190);
  });
});
