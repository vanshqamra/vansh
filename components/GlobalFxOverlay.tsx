"use client";

import { useEffect } from "react";

export default function GlobalFxOverlay() {
  useEffect(() => {
    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    // Max z-index so nothing beats it; never blocks clicks
    el.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:2147483647";

    el.innerHTML = `
      <div class="fx-mesh" style="position:absolute;inset:-40px;opacity:.12"></div>
      <div class="fx-grid" style="position:absolute;inset:0;opacity:.10"></div>
    `;

    document.body.appendChild(el);
    return () => {
      try {
        document.body.removeChild(el);
      } catch {}
    };
  }, []);

  return null;
}
