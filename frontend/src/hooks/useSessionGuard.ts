import { useEffect } from "react";

// Same-origin logout endpoint. The session cookie is httpOnly, so we can't clear
// it from JS directly — we ask the server to clear it instead.
const LOGOUT_URL = "/api/auth/logout";

/**
 * Ties the login session to the lifetime of the visit.
 *
 * - On `pagehide` (closing the tab, navigating to another site, or refreshing)
 *   we end the session server-side via `sendBeacon`, so coming back requires a
 *   fresh login. SPA route changes use the History API and do NOT fire
 *   `pagehide`, so in-app navigation keeps the user signed in.
 * - On `pageshow` with `event.persisted` the document was restored from the
 *   back/forward cache (e.g. pressing Back after leaving the site). Because the
 *   session was just killed, we reload so auth is re-checked and the user is
 *   sent to the login screen instead of seeing a stale, cached page.
 */
export function useSessionGuard(): void {
  useEffect(() => {
    function endSession(): void {
      const sent =
        typeof navigator.sendBeacon === "function" &&
        navigator.sendBeacon(LOGOUT_URL);
      if (!sent) {
        // Fallback for browsers without sendBeacon: keepalive lets the request
        // outlive the unloading document.
        void fetch(LOGOUT_URL, { method: "POST", keepalive: true }).catch(
          () => undefined,
        );
      }
    }

    function handlePageShow(event: PageTransitionEvent): void {
      if (event.persisted) window.location.reload();
    }

    window.addEventListener("pagehide", endSession);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pagehide", endSession);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);
}
