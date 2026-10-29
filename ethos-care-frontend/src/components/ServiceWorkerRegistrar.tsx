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

    // في التطوير أسماء ملفات /_next/static ثابتة بين التعديلات، فالكاش يقدّم كودًا قديمًا:
    // نشغّل الـ service worker في الإنتاج فقط ونزيل أي نسخة مسجّلة سابقًا أثناء التطوير
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => registrations.forEach((r) => void r.unregister()));
      void caches?.keys().then((keys) => keys.forEach((key) => void caches.delete(key)));
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
