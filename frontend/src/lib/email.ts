// Email helpers shared by the auth forms: known-provider validation (donors),
// "did you mean" typo correction, and autocomplete suggestions on "@".

export const KNOWN_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function getDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

export function isKnownProvider(email: string): boolean {
  return (KNOWN_EMAIL_DOMAINS as readonly string[]).includes(getDomain(email));
}

/** Levenshtein distance, capped use for short domain strings. */
function distance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

/**
 * If the typed domain looks like a typo of a known provider, return the
 * corrected full email (e.g. "ali@gmial.com" -> "ali@gmail.com"). Otherwise null.
 */
export function suggestEmailCorrection(email: string): string | null {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at < 1) return null;
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1).toLowerCase();
  if (!domain || (KNOWN_EMAIL_DOMAINS as readonly string[]).includes(domain)) {
    return null;
  }
  let best: { domain: string; dist: number } | null = null;
  for (const known of KNOWN_EMAIL_DOMAINS) {
    const d = distance(domain, known);
    if (best === null || d < best.dist) best = { domain: known, dist: d };
  }
  if (best && best.dist > 0 && best.dist <= 2) {
    return `${local}@${best.domain}`;
  }
  return null;
}

/**
 * Autocomplete suggestions while typing the domain after "@".
 * Returns full email candidates, e.g. "ali@" -> ["ali@gmail.com", ...].
 */
export function emailSuggestions(email: string, limit = 4): string[] {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at < 1) return [];
  const local = trimmed.slice(0, at);
  const partial = trimmed.slice(at + 1).toLowerCase();
  return KNOWN_EMAIL_DOMAINS.filter((d) => d.startsWith(partial))
    .slice(0, limit)
    .map((d) => `${local}@${d}`);
}
