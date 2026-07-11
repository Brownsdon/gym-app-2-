import { useEffect } from "react";

// Keep the screen awake while the app is open (Screen Wake Lock API).
// The browser auto-releases the lock when the tab is hidden or the phone
// is locked manually, so re-request it whenever the app becomes visible.
export function useWakeLock() {
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    let lock = null;
    let active = true;

    async function acquire() {
      try {
        lock = await navigator.wakeLock.request("screen");
        if (!active) lock.release().catch(() => {});
      } catch {
        // denied (low battery mode etc) — the app still works, screen just sleeps
      }
    }

    function onVisibility() {
      if (document.visibilityState === "visible") acquire();
    }

    acquire();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisibility);
      if (lock) lock.release().catch(() => {});
    };
  }, []);
}
