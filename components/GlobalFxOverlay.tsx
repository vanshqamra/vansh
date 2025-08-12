"use client";

import { useEffect } from "react";

export default function GlobalFxOverlay() {
  useEffect(() => {
    // 1) Inject keyframes + base styles directly into <head>
    const style = document.createElement("style");
    style.setAttribute("data-fx", "global");
    style.textContent = `
@keyframes __fx_mesh {
  0% { transform: translate3d(0,0,0) scale(1); }
  50% { transform: translate3d(0,-2%,0) scale(1.02); }
  100% { transform: translate3d(0,0,0) scale(1); }
}
@keyframes __fx_gridSlide {
  from { background-position: 0 0, 0 0; }
  to   { background-position: 80px 80px, 80px 80px; }
}
/* keep it visible on white, but subtle */
.__fxMesh {
  position:absolute; inset:-40px; opacity:.14;
  background:
    radial-gradient(1000px 400px at 80% -10%, rgba(14,165,233,.28), transparent 60%),
    radial-gradient(800px 300px at -10% 20%, rgba(20,184,166,.24), transparent 60%),
    radial-gradient(700px 280px at 40% 90%, rgba(59,130,246,.16), transparent 60%);
  animation: __fx_mesh 22s linear infinite;
  will-change: transform;
}
.__fxGrid {
  position:absolute; inset:0; opacity:.10;
  background:
    linear-gradient(to right, rgba(2,6,23,.09) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(2,6,23,.09) 1px, transparent 1px);
  background-size: 80px 80px, 80px 80px;
  animation: __fx_gridSlide 24s linear infinite;
  will-change: background-position;
}
/* optional: drifting molecules for extra motion */
.__fxMol circle, .__fxMol line { stroke: currentColor; }
`;
    document.head.appendChild(style);

    // 2) Mount overlay above everything (non-interactive)
    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    el.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:2147483647";

    el.innerHTML = `
      <div class="__fxMesh"></div>
      <div class="__fxGrid"></div>
      <svg viewBox="0 0 1200 400"
           class="__fxMol"
           style="position:absolute;inset:0;width:100%;height:100%;opacity:.20;color:#1e293b">
        <defs>
          <g id="mol">
            <circle r="2.2" fill="currentColor" />
            <circle cx="11" r="2.2" fill="currentColor" />
            <circle cx="5.5" cy="6" r="2.2" fill="currentColor" />
            <line x1="0" y1="0" x2="11" y2="0" stroke-width="1.25" />
            <line x1="5.5" y1="6" x2="11" y2="0" stroke-width="1.25" />
          </g>
        </defs>
        <g>
          <use href="#mol">
            <animateMotion dur="26s" repeatCount="indefinite"
              path="M 10,80 C 200,30 400,130 580,80 S 900,110 1100,60" />
          </use>
          <use href="#mol">
            <animateMotion dur="32s" repeatCount="indefinite"
              path="M 0,200 C 260,160 420,260 700,200 S 900,260 1200,220" />
          </use>
          <use href="#mol">
            <animateMotion dur="28s" repeatCount="indefinite"
              path="M 50,350 C 300,390 520,330 800,370 S 980,330 1150,360" />
          </use>
        </g>
      </svg>
    `;

    document.body.appendChild(el);

    return () => {
      try { document.body.removeChild(el); } catch {}
      try { document.head.removeChild(style); } catch {}
    };
  }, []);

  return null;
}
