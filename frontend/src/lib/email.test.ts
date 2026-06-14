import { describe, expect, it } from "vitest";
import {
  isValidEmail,
  isKnownProvider,
  suggestEmailCorrection,
  emailSuggestions,
} from "./email";

describe("isValidEmail", () => {
  it.each(["a@b.co", "user.name@gmail.com", "x+y@proton.me"])(
    "accepts %s",
    (email: string) => {
      expect(isValidEmail(email)).toBe(true);
    },
  );

  it.each(["", "no-at", "a@b", "a@@b.com", "a b@c.com"])(
    "rejects %s",
    (email: string) => {
      expect(isValidEmail(email)).toBe(false);
    },
  );
});

describe("isKnownProvider", () => {
  it("accepts known providers", () => {
    expect(isKnownProvider("ali@gmail.com")).toBe(true);
    expect(isKnownProvider("ali@outlook.com")).toBe(true);
  });

  it("rejects unknown / custom domains", () => {
    expect(isKnownProvider("ali@mycompany.com")).toBe(false);
    expect(isKnownProvider("ali@gmail.co")).toBe(false);
  });

  it("is case-insensitive on the domain", () => {
    expect(isKnownProvider("Ali@GMAIL.com")).toBe(true);
  });
});

describe("suggestEmailCorrection", () => {
  it("corrects a close typo of a known provider", () => {
    expect(suggestEmailCorrection("ali@gmial.com")).toBe("ali@gmail.com");
    expect(suggestEmailCorrection("ali@hotmial.com")).toBe("ali@hotmail.com");
  });

  it("returns null for an exact known provider", () => {
    expect(suggestEmailCorrection("ali@gmail.com")).toBeNull();
  });

  it("returns null when there is no '@' or no local part", () => {
    expect(suggestEmailCorrection("ali")).toBeNull();
    expect(suggestEmailCorrection("@gmail.com")).toBeNull();
  });

  it("returns null when the domain is too far from any known provider", () => {
    expect(suggestEmailCorrection("ali@somerandomdomain.com")).toBeNull();
  });
});

describe("emailSuggestions", () => {
  it("suggests full emails matching the typed domain prefix", () => {
    const out = emailSuggestions("ali@g");
    expect(out).toContain("ali@gmail.com");
    expect(out.every((s) => s.startsWith("ali@"))).toBe(true);
  });

  it("returns nothing before an '@' is typed", () => {
    expect(emailSuggestions("ali")).toEqual([]);
  });

  it("respects the limit argument", () => {
    expect(emailSuggestions("ali@", 2)).toHaveLength(2);
  });
});
