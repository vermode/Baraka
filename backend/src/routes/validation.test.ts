import { describe, expect, it } from "vitest";
import {
  SignupBody,
  CreateHelpRequestBody,
  ConfirmDonationReceivedBody,
  LinkDonationHelpRequestBody,
} from "@workspace/api-zod";

describe("SignupBody password policy", () => {
  const base = { name: "Ali", email: "ali@gmail.com" };

  it("accepts a compliant password", () => {
    expect(SignupBody.safeParse({ ...base, password: "Abcdef1!" }).success).toBe(true);
  });

  it("rejects passwords shorter than 8 chars", () => {
    expect(SignupBody.safeParse({ ...base, password: "Ab1!" }).success).toBe(false);
  });

  it("rejects passwords without an uppercase letter", () => {
    expect(SignupBody.safeParse({ ...base, password: "abcdef1!" }).success).toBe(false);
  });

  it("rejects passwords without a digit", () => {
    expect(SignupBody.safeParse({ ...base, password: "Abcdefg!" }).success).toBe(false);
  });

  it("rejects passwords without a special character", () => {
    expect(SignupBody.safeParse({ ...base, password: "Abcdefg1" }).success).toBe(false);
  });
});

describe("SignupBody phone policy", () => {
  const base = { name: "Ali", email: "ali@gmail.com", password: "Abcdef1!" };

  it.each(["0791234567", "0781234567", "0771234567"])("accepts %s", (phone: string) => {
    expect(SignupBody.safeParse({ ...base, phone }).success).toBe(true);
  });

  it.each([
    "0761234567", // wrong prefix
    "079123456", // too short
    "07912345678", // too long
    "+962791234567", // international form not accepted
    "079123456a", // non-digit
  ])("rejects %s", (phone: string) => {
    expect(SignupBody.safeParse({ ...base, phone }).success).toBe(false);
  });
});

describe("CreateHelpRequestBody phone policy", () => {
  const base = {
    name: "Sara",
    governorate: "Amman",
    aidType: "food",
    description: "Need basic food supplies for the month.",
  };

  it("accepts a valid Jordanian number", () => {
    expect(CreateHelpRequestBody.safeParse({ ...base, phone: "0791234567" }).success).toBe(true);
  });

  it("rejects an invalid number", () => {
    expect(CreateHelpRequestBody.safeParse({ ...base, phone: "12345" }).success).toBe(false);
  });
});

describe("ConfirmDonationReceivedBody", () => {
  it("accepts a numeric donationId", () => {
    expect(ConfirmDonationReceivedBody.safeParse({ donationId: 12 }).success).toBe(true);
  });

  it("rejects a non-numeric donationId", () => {
    expect(ConfirmDonationReceivedBody.safeParse({ donationId: "12" }).success).toBe(false);
  });

  it("rejects a missing donationId", () => {
    expect(ConfirmDonationReceivedBody.safeParse({}).success).toBe(false);
  });
});

describe("LinkDonationHelpRequestBody", () => {
  it("accepts a numeric help request id", () => {
    expect(LinkDonationHelpRequestBody.safeParse({ helpRequestId: 7 }).success).toBe(true);
  });

  it("rejects a non-numeric id", () => {
    expect(LinkDonationHelpRequestBody.safeParse({ helpRequestId: "7" }).success).toBe(false);
  });
});
