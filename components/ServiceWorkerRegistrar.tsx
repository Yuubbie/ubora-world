"use client";

import { useEffect } from "react";

/**
 * Registers the service worker so Chrome will offer to install the app.
 * Renders nothing. Mount once in the root layout.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        // Registration failing must never break the page - the app works
        // perfectly well without it, it just will not be installable.
        console.warn("Service worker registration failed:", err);
      });
    };

    // Wait for load so registration never competes with first paint.
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
