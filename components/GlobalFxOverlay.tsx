"use client";

import { useEffect } from "react";

export default function GlobalFxOverlay() {
  useEffect(() => {
    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    // sits above absolutely everything, never blocks clicks
    el.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:2147483647";

    // NOTE: add BOTH the animate-* classes AND inline animation fallback
    el.innerHTML = `
      <div
        class="fx-mesh animate-mesh"
        style="
          position:absolute;
          inset:-40px;
          opacity:.16;
          animation: mesh 22s linear infinite;
        "
      ></div>

      <div
        class="fx-grid animate-grid"
        style="
          position:absolute;
          inset:0;
          opacity:.12;
          animation: gridSlide 24s linear infinite;
        "
      ></div>
    `;

    document.body.appendChild(el);
    return () => {
      try { document.body.removeChild(el); } catch {}
    };
  }, []);

  return null;
}
