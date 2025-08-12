// components/GlobalFxOverlay.tsx
"use client";

import { useEffect } from "react";

export default function GlobalFxOverlay() {
  useEffect(() => {
    // =========================
    // TUNABLES (safe to tweak)
    // =========================
    const BUBBLE_COUNT = 16;     // how many soft bubbles
    const MOLECULE_OPACITY = 0.28; // SVG molecule layer opacity
    const MESH_OPACITY_1 = 0.18; // main color blobs
    const MESH_OPACITY_2 = 0.12; // secondary blobs
    const GRID_OPACITY_1 = 0.14; // main grid
    const GRID_OPACITY_2 = 0.08; // diagonal grid
    const BEAMS_OPACITY   = 0.18; // sweeping light beams
    // Switch to deep-blue backdrop vibe? set TRUE
    const DEEP_BLUE_MODE  = false;

    // 1) Inject CSS (self-contained; no globals required)
    const style = document.createElement("style");
    style.setAttribute("data-fx", "global-v2");
    style.textContent = `
:root{ --fx-mx:0; --fx-my:0; } /* mouse parallax */

@keyframes fx_mesh {
  0% { transform: translate3d(0,0,0) scale(1); }
  50% { transform: translate3d(0,-2%,0) scale(1.03); }
  100% { transform: translate3d(0,0,0) scale(1); }
}
@keyframes fx_gridSlide {
  from { background-position: 0 0, 0 0; }
  to   { background-position: 120px 120px, 120px 120px; }
}
@keyframes fx_rotate {
  from { transform: rotate(0deg) }
  to   { transform: rotate(360deg) }
}
@keyframes fx_floatUp {
  0%   { transform: translateY(20px) scale(var(--s,1)); opacity: 0; }
  10%  { opacity: .5; }
  90%  { opacity: .5; }
  100% { transform: translateY(-120vh) scale(var(--s,1)); opacity: 0; }
}
@keyframes fx_beamSweep {
  0%   { transform: translateX(-20%) rotate(12deg); opacity: 0; }
  20%  { opacity: ${BEAMS_OPACITY}; }
  80%  { opacity: ${BEAMS_OPACITY}; }
  100% { transform: translateX(20%)  rotate(12deg); opacity: 0; }
}

/* Root wrapper (never blocks clicks) */
.__fxRoot {
  position: fixed; inset: 0;
  pointer-events: none;
  z-index: 2147483647;
}

/* Optional deep-blue base behind everything for stronger look */
.__fxBackdrop {
  position: absolute; inset: 0;
  background:
    radial-gradient(1200px 800px at 50% -10%, #0b3a7e 0%, #0a2c63 35%, #082752 60%, #071f42 100%);
  opacity: ${DEEP_BLUE_MODE ? 1 : 0};
}

/* Color “blobs” (two layers, different speeds) */
.__mesh1, .__mesh2 {
  position:absolute; inset:-40px; will-change: transform;
  filter: saturate(115%);
}
.__mesh1 {
  opacity: ${MESH_OPACITY_1};
  background:
    radial-gradient(900px 380px at 80% -10%, rgba(14,165,233,.40), transparent 60%),
    radial-gradient(700px 300px at -10% 20%, rgba(20,184,166,.32), transparent 60%),
    radial-gradient(600px 260px at 40% 90%, rgba(59,130,246,.22), transparent 60%);
  animation: fx_mesh 18s ease-in-out infinite;
  transform: translate3d(calc(var(--fx-mx)*6px), calc(var(--fx-my)*4px), 0);
}
.__mesh2 {
  opacity: ${MESH_OPACITY_2};
  background:
    radial-gradient(900px 400px at 20% 10%, rgba(59,130,246,.35), transparent 60%),
    radial-gradient(700px 300px at 110% 40%, rgba(14,165,233,.30), transparent 60%);
  animation: fx_mesh 28s ease-in-out infinite reverse;
  transform: translate3d(calc(var(--fx-mx)*-4px), calc(var(--fx-my)*-3px), 0);
}

/* Grids (main + subtle diagonal) */
.__grid1, .__grid2 {
  position:absolute; inset:0; will-change: background-position, transform;
  background-size: 120px 120px, 120px 120px;
  animation: fx_gridSlide 30s linear infinite;
}
.__grid1 {
  opacity: ${GRID_OPACITY_1};
  background:
    linear-gradient(to right, rgba(2,6,23,.12) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(2,6,23,.12) 1px, transparent 1px);
  transform: translate3d(calc(var(--fx-mx)*2px), calc(var(--fx-my)*1px), 0);
}
.__grid2 {
  opacity: ${GRID_OPACITY_2};
  background:
    linear-gradient(to right, rgba(2,6,23,.10) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(2,6,23,.10) 1px, transparent 1px);
  transform-origin: center;
  transform: rotate(15deg) translate3d(calc(var(--fx-mx)*-3px), calc(var(--fx-my)*2px), 0);
  animation-duration: 42s;
}

/* Sweeping beams */
.__beams {
  position:absolute; inset:-10% 0;
  background:
    linear-gradient(115deg, transparent 35%, rgba(255,255,255,.45) 50%, transparent 65%),
    linear-gradient(115deg, transparent 55%, rgba(255,255,255,.25) 68%, transparent 80%);
  mix-blend-mode: overlay;
  animation: fx_beamSweep 6.5s ease-in-out infinite;
}

/* Molecules (SVG paths drifting) */
.__mol {
  position:absolute; inset:0;
  width:100%; height:100%;
  color:#1e293b; opacity:${MOLECULE_OPACITY};
  filter: drop-shadow(0 1px 2px rgba(0,0,0,.12));
  transform: translate3d(calc(var(--fx-mx)*1px), calc(var(--fx-my)*1px), 0);
}

/* Soft bubbles (cheap) */
.__bubbles { position:absolute; inset:-10% -5% 0 -5%; overflow:hidden; }
.__bubble {
  position:absolute; bottom:-10vh;
  width:12px; height:12px; border-radius:50%;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.9), rgba(255,255,255,.35) 60%, rgba(255,255,255,0) 70%);
  filter: blur(.2px);
  animation: fx_floatUp var(--d,12s) linear infinite;
  left: var(--x, 50%);
  transform: translateX(-50%) scale(var(--s,1));
}

@media (prefers-reduced-motion: reduce) {
  .__mesh1, .__mesh2, .__grid1, .__grid2, .__beams, .__mol, .__bubble { animation: none !important; }
}
`;
    document.head.appendChild(style);

    // 2) Root overlay (above everything)
    const root = document.createElement("div");
    root.className = "__fxRoot";
    root.setAttribute("aria-hidden", "true");

    // 3) Layers
    const backdrop = document.createElement("div");
    backdrop.className = "__fxBackdrop";

    const mesh1 = document.createElement("div");
    mesh1.className = "__mesh1";

    const mesh2 = document.createElement("div");
    mesh2.className = "__mesh2";

    const grid1 = document.createElement("div");
    grid1.className = "__grid1";

    const grid2 = document.createElement("div");
    grid2.className = "__grid2";

    const beams = document.createElement("div");
    beams.className = "__beams";

    const mol = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    mol.setAttribute("viewBox", "0 0 1200 400");
    mol.setAttribute("class", "__mol");
    mol.innerHTML = `
      <defs>
        <g id="molNode">
          <circle r="2.2" fill="currentColor" />
          <circle cx="11" r="2.2" fill="currentColor" />
          <circle cx="5.5" cy="6" r="2.2" fill="currentColor" />
          <line x1="0" y1="0" x2="11" y2="0" stroke="currentColor" stroke-width="1.25" />
          <line x1="5.5" y1="6" x2="11" y2="0" stroke="currentColor" stroke-width="1.25" />
        </g>
      </defs>
      <g>
        <use href="#molNode"><animateMotion dur="22s" repeatCount="indefinite" path="M 10,80 C 200,30 400,130 580,80 S 900,110 1100,60" /></use>
        <use href="#molNode"><animateMotion dur="28s" repeatCount="indefinite" path="M 0,200 C 260,160 420,260 700,200 S 900,260 1200,220" /></use>
        <use href="#molNode"><animateMotion dur="24s" repeatCount="indefinite" path="M 50,350 C 300,390 520,330 800,370 S 980,330 1150,360" /></use>
        <use href="#molNode"><animateMotion dur="30s" repeatCount="indefinite" path="M 0,120 C 180,60 420,160 600,120 S 880,160 1200,140" /></use>
        <use href="#molNode"><animateMotion dur="26s" repeatCount="indefinite" path="M 60,40 C 260,100 420,60 700,90 S 980,60 1150,80" /></use>
      </g>
    `;

    // Bubbles
    const bubbles = document.createElement("div");
    bubbles.className = "__bubbles";
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      const b = document.createElement("div");
      b.className = "__bubble";
      const x = Math.round(Math.random() * 100);      // 0–100 vw
      const d = 12 + Math.random() * 12;              // 12–24s
      const s = 0.8 + Math.random() * 1.6;            // 0.8–2.4 scale
      b.style.setProperty("--x", `${x}vw`);
      b.style.setProperty("--d", `${d}s`);
      b.style.setProperty("--s", `${s}`);
      bubbles.appendChild(b);
    }

    // Compose
    root.appendChild(backdrop);
    root.appendChild(mesh1);
    root.appendChild(mesh2);
    root.appendChild(grid1);
    root.appendChild(grid2);
    root.appendChild(beams);
    root.appendChild(mol);
    root.appendChild(bubbles);

    document.body.appendChild(root);

    // 4) Lightweight parallax (mouse moves)
    const onMove = (e: MouseEvent) => {
      const mx = (e.clientX / window.innerWidth) * 2 - 1;  // -1..1
      const my = (e.clientY / window.innerHeight) * 2 - 1; // -1..1
      document.documentElement.style.setProperty("--fx-mx", mx.toFixed(3));
      document.documentElement.style.setProperty("--fx-my", my.toFixed(3));
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    // Cleanup
    return () => {
      try { window.removeEventListener("mousemove", onMove); } catch {}
      try { document.body.removeChild(root); } catch {}
      try { document.head.removeChild(style); } catch {}
    };
  }, []);

  return null;
}
