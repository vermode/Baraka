import { toast } from "sonner";
import { ApiError } from "@workspace/api-client-react";

/**
 * Centralised, user-friendly error handling for the whole app.
 *
 * Why this exists: every failed request used to show the same generic
 * "Something went wrong" toast. This module turns a raw error (an `ApiError`
 * from the API client, a network `TypeError`, or anything else) into a clear,
 * localised message — and `notifyError` shows it as a red toast so different
 * failures look and read differently.
 */

export type Lang = "ar" | "en";

/**
 * Read the current site language outside of React (e.g. in a global
 * react-query error handler). Mirrors how `LanguageContext` persists the
 * choice to `localStorage`, defaulting to Arabic.
 */
export function getCurrentLang(): Lang {
  const saved =
    typeof localStorage !== "undefined" ? localStorage.getItem("lang") : null;
  return saved === "en" ? "en" : "ar";
}

/** A message available in both site languages. */
type Bilingual = { ar: string; en: string };

/** Lets a specific call site override the default copy per HTTP status. */
export type ErrorOverrides = Partial<
  Record<number | "network" | "default", Bilingual>
>;

const GENERIC: Bilingual = {
  ar: "حدث خطأ غير متوقع، حاول مرة أخرى.",
  en: "Something went wrong. Please try again.",
};

const NETWORK: Bilingual = {
  ar: "تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت.",
  en: "Couldn't reach the server. Check your internet connection.",
};

/** Default friendly copy for the HTTP statuses this API actually returns. */
const BY_STATUS: Record<number, Bilingual> = {
  400: { ar: "البيانات المُدخلة غير صحيحة.", en: "Some of the information you entered is invalid." },
  401: { ar: "يلزم تسجيل الدخول للمتابعة.", en: "Please sign in to continue." },
  403: { ar: "ليس لديك صلاحية للقيام بهذا الإجراء.", en: "You don't have permission to do that." },
  404: { ar: "العنصر المطلوب غير موجود.", en: "We couldn't find what you're looking for." },
  409: { ar: "هناك تعارض مع بيانات موجودة مسبقاً.", en: "This conflicts with data that already exists." },
  413: { ar: "حجم البيانات كبير جداً.", en: "That request is too large." },
  429: { ar: "محاولات كثيرة جداً. انتظر قليلاً ثم حاول مجدداً.", en: "Too many attempts. Please wait a moment and try again." },
  500: { ar: "خطأ في الخادم. نعمل على إصلاحه.", en: "A server error occurred. We're looking into it." },
};

/**
 * Map any thrown value to a friendly, localised message.
 * Pass `overrides` to customise copy for a specific status at a call site
 * (e.g. login: `{ 401: { ar: "...", en: "..." } }`).
 */
export function getErrorMessage(
  err: unknown,
  lang: Lang,
  overrides?: ErrorOverrides,
): string {
  if (err instanceof ApiError) {
    const byStatus = overrides?.[err.status] ?? BY_STATUS[err.status];
    if (byStatus) return byStatus[lang];
    return (overrides?.default ?? GENERIC)[lang];
  }

  // `fetch` throws a TypeError when the network request itself fails.
  if (err instanceof TypeError) {
    return (overrides?.network ?? NETWORK)[lang];
  }

  return (overrides?.default ?? GENERIC)[lang];
}

/** Show a red error toast with a friendly, localised message. */
export function notifyError(
  err: unknown,
  lang: Lang,
  overrides?: ErrorOverrides,
): void {
  toast.error(getErrorMessage(err, lang, overrides));
}

/** Show a green success toast. */
export function notifySuccess(message: string): void {
  toast.success(message);
}

/** Show a neutral/info toast. */
export function notifyInfo(message: string): void {
  toast.info(message);
}
