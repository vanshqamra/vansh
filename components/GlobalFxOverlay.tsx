// components/GlobalFxOverlay.tsx
"use client";

import { useEffect } from "react";

export default function GlobalFxOverlay() {
  useEffect(() => {
    // Avoid double-mounts
    if (document.getElementById("__fxRootV5")) return;

    // ---------- TUNABLES ----------
    const GRID_OPACITY_MAIN = 0.12;
    const GRID_OPACITY_DIAG = 0.07;
    const LAB_OPACITY_1 = 0.23; // main lab pattern
    const LAB_OPACITY_2 = 0.14; // secondary pattern (parallax feel)

    // ---------- CSS (self-contained, no Tailwind) ----------
    const style = document.createElement("style");
    style.id = "__fxStylesV5";
    style.textContent = `
:root{ --fx-mx:0; --fx-my:0; } /* kept if you want to add parallax later */

@keyframes fx_gridSlide {
  from { background-position: 0 0, 0 0; }
  to   { background-position: 120px 120px, 120px 120px; }
}

@keyframes fx_drift_1 {
  0%   { background-position: 0 0; }
  100% { background-position: 360px 280px; }
}

@keyframes fx_drift_2 {
  0%   { background-position: 90px 60px; }
  100% { background-position: 450px 340px; }
}

/* Root overlay above content, never intercepts input */
#__fxRootV5 {
  position: fixed; inset: 0;
  pointer-events: none;
  z-index: 2147483647;
}

/* Subtle grids (no blend modes; visible on white + dark) */
.__gridMain, .__gridDiag {
  position:absolute; inset:0;
  will-change: background-position;
  background-size: 120px 120px, 120px 120px;
}
.__gridMain {
  opacity: ${GRID_OPACITY_MAIN};
  background:
    linear-gradient(to right, rgba(203,213,225,.35) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(203,213,225,.35) 1px, transparent 1px);
  animation: fx_gridSlide 36s linear infinite;
}
.__gridDiag {
  opacity: ${GRID_OPACITY_DIAG};
  background:
    linear-gradient(to right, rgba(148,163,184,.28) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(148,163,184,.28) 1px, transparent 1px);
  transform: rotate(12deg) scale(1.05);
  transform-origin: center;
  animation: fx_gridSlide 48s linear infinite reverse;
}

/* Lab icons pattern layers (test tubes, flasks, beakers) */
.__lab1, .__lab2 {
  position:absolute; inset:-8% -4% 0 -4%;
  background-repeat: repeat;
  will-change: background-position;
  filter: saturate(115%);
}

/* Speeds and opacities tuned for smoothness */
.__lab1 { opacity: ${LAB_OPACITY_1}; animation: fx_drift_1 60s linear infinite; }
.__lab2 { opacity: ${LAB_OPACITY_2}; animation: fx_drift_2 90s linear infinite reverse; }

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .__gridMain, .__gridDiag, .__lab1, .__lab2 { animation: none !important; }
}
`;
    document.head.appendChild(style);

    // ---------- Build SVG pattern tiles ----------
    // Tile 1 (cool blue/cyan)
    const svg1 = `
<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'>
  <g fill='none' stroke='#5aa7ff' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round' opacity='0.75'>
    <!-- Erlenmeyer flask -->
    <path d='M30 20 h30 v8 l-8 14 v34 l15 26 h-44 l15-26 v-34 l-8-14 z'/>
    <circle cx='45' cy='78' r='3'/>
    <!-- Test tube -->
    <rect x='100' y='12' width='14' height='64' rx='7'/>
    <line x1='100' y1='60' x2='114' y2='60'/>
    <!-- Round flask -->
    <circle cx='170' cy='70' r='20'/><rect x='166' y='15' width='8' height='30' rx='4'/>
    <!-- Beaker -->
    <path d='M20 120 h45 l5 10 v46 h-55 v-46 z'/>
    <!-- Mortar & pestle-ish -->
    <path d='M120 120 q15 8 30 0 v18 q-15 12 -30 0 z'/>
  </g>
</svg>`.trim();

    // Tile 2 (teal/indigo accent)
    const svg2 = `
<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'>
  <g fill='none' stroke='#22c3a6' stroke-width='1.15' stroke-linecap='round' stroke-linejoin='round' opacity='0.65'>
    <!-- Tall test tube rack -->
    <rect x='24' y='20' width='14' height='70' rx='7'/>
    <rect x='44' y='20' width='14' height='70' rx='7'/>
    <rect x='64' y='20' width='14' height='70' rx='7'/>
    <line x1='20' y1='92' x2='84' y2='92'/>
    <!-- Volumetric flask -->
    <circle cx='150' cy='68' r='22'/><rect x='146' y='18' width='8' height='28' rx='4'/>
    <!-- Beaker angled -->
    <path d='M26 130 h55 l6 10 v52 h-67 v-52 z'/>
    <!-- Microscope minimalist -->
    <path d='M140 130 l12 -12 l12 12 v28 h-24 z'/>
  </g>
</svg>`.trim();

    const url1 = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg1)}")`;
    const url2 = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg2)}")`;

    // ---------- Build DOM ----------
    const root = document.createElement("div");
    root.id = "__fxRootV5";

    const gridMain = document.createElement("div");
    gridMain.className = "__gridMain";

    const gridDiag = document.createElement("div");
    gridDiag.className = "__gridDiag";

    const lab1 = document.createElement("div");
    lab1.className = "__lab1";
    lab1.style.backgroundImage = url1;
    lab1.style.backgroundSize = "220px 220px";

    const lab2 = document.createElement("div");
    lab2.className = "__lab2";
    lab2.style.backgroundImage = url2;
    lab2.style.backgroundSize = "260px 260px";

    root.appendChild(gridMain);
    root.appendChild(gridDiag);
    root.appendChild(lab1);
    root.appendChild(lab2);

    document.body.appendChild(root);

    // ---------- Cleanup ----------
    return () => {
      try { document.body.removeChild(root); } catch {}
      try { document.head.removeChild(style); } catch {}
    };
  }, []);

  return null;
}
