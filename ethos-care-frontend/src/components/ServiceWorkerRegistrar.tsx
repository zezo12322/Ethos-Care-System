"use client";

import { useEffect } from "react";

/**
 * Registers the offline service worker (public/sw.js) once the page has loaded.
 * Rendering null keeps it side-effect only. Registration failures are non-fatal —
 * the app continues to work online without offline caching.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* non-fatal */
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
