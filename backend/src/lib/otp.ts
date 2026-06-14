import { randomInt } from "node:crypto";

/**
 * Generate a numeric tracking code.
 *
 * Used as a capability token for the public `/track` endpoints: a donor tracks
 * their donation's delivery status, and a person-in-need confirms receipt. We
 * use 8 digits (100M space) so the codes resist brute-forcing even though the
 * `/track` routes are also rate-limited.
 */
export function generateOtp(length = 8): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += randomInt(0, 10).toString();
  }
  return code;
}
