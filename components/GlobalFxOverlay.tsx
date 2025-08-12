// components/GlobalFxOverlay.tsx
"use client";

import { useEffect } from "react";

export default function GlobalFxOverlay() {
  useEffect(() => {
    // =========================
    // TUNABLES (safe to tweak)
    // =========================
    const BUBBLE_COUNT = 28;       // more = busier
    const MOLECULE_OPACITY = 0.38; // 0..1
    const MESH_OPACITY_1 = 0.30;   // main blobs
    const MESH_OPACITY_2 = 0.22;   // secondary blobs
    const GRID_OPACITY_1 = 0.22;   // main grid
    const GRID_OPACITY_2 = 0.12;   // diagonal grid
    const BEAMS_OPACITY   = 0.28;  // sweeping light beams
    // Turn on the deep-blue base (site-wide)
    const DEEP_BLUE_MODE  = true;

    // 1) Inject CSS (self-contained; avoids conflicts/purge)
    const style = document.createElement("style");
    style.setAttribute("data-fx", "global-v3");
    style.textContent = `
:root{ --fx-mx:0; --fx-my:0; } /* mouse parallax */

@keyframes __v3_mesh {
  0% { transform: translate3d(0,0,0) scale(1); }
  50% { transform: translate3d(0,-2%,0) scale(1.03); }
  100% { transform: translate3d(0,0,0) scale(1); }
}
@keyframes __v3_gridSlide {
  from { background-position: 0 0, 0 0; }
  to   { background-position: 120px 120px, 120px 120px; }
}
@keyframes __v3_floatUp {
  0%   { transform: translateY(20px) scale(var(--s,1)); opacity: 0; }
  10%  { opacity: .55; }
  90%  { opacity: .55; }
  100% { transform: translateY(-120vh) scale(var(--s,1)); opacity: 0; }
}
@keyframes __v3_beamSweep {
  0%   { transform: translateX(-25%) rotate(12deg); opacity: 0; }
  18%  { opacity: ${BEAMS_OPACITY}; }
  82%  { opacity: ${BEAMS_OPACITY}; }
  100% { transform: translateX(25%) rotate(12deg); opacity: 0; }
}

/* Root wrapper (never blocks clicks) */
.__fxRoot {
  position: fixed; inset: 0;
  pointer-events: none;
  z-index: 2147483647;
}

/* Deep blue base for the entire site */
.__fxBackdrop {
  position: absolute; inset: 0;
  background:
    radial-gradient(1200px 800px at 50% -10%, #0b3a7e 0%, #0a2c63 35%, #082752 60%, #071f42 100%);
  opacity: ${DEEP_BLUE_MODE ? 1 : 0};
}

/* Color blobs (two layers, parallax) */
.__mesh1, .__mesh2 {
  position:absolute; inset:-40px; will-change: transform;
  filter: saturate(115%);
}
.__mesh1 {
  opacity: ${MESH_OPACITY_1};
  /* cyan/teal/blue glow */
  background:
    radial-gradient(900px 380px at 80% -10%, rgba(34,211,238,.42), transparent 60%),
    radial-gradient(720px 320px at -10% 20%, rgba(20,184,166,.32), transparent 60%),
    radial-gradient(640px 280px at 40% 90%, rgba(96,165,250,.22), transparent 60%);
  animation: __v3_mesh 18s ease-in-out infinite;
  transform: translate3d(calc(var(--fx-mx)*6px), calc(var(--fx-my)*4px), 0);
}
.__mesh2 {
  opacity: ${MESH_OPACITY_2};
  /* indigo/violet accent */
  background:
    radial-gradient(900px 400px at 20% 10%, rgba(129,140,248,.30), transparent 60%),
    radial-gradient(720px 300px at 110% 40%, rgba(59,130,246,.28), transparent 60%);
  animation: __v3_mesh 28s ease-in-out infinite reverse;
  transform: translate3d(calc(var(--fx-mx)*-4px), calc(var(--fx-my)*-3px), 0);
}

/* Grids (main + subtle diagonal) */
.__grid1, .__grid2 {
  position:absolute; inset:0; will-change: background-position, transform;
  background-size: 120px 120px, 120px 120px;
}
.__grid1 {
  opacity: ${GRID_OPACITY_1};
  background:
    linear-gradient(to right, rgba(226,232,240,.28) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(226,232,240,.28) 1px, transparent 1px);
  animation: __v3_gridSlide 30s linear infinite;
  transform: translate3d(calc(var(--fx-mx)*2px), calc(var(--fx-my)*1px), 0);
}
.__grid2 {
  opacity: ${GRID_OPACITY_2};
  background:
    linear-gradient(to right, rgba(148,163,184,.20) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(148,163,184,.20) 1px, transparent 1px);
  transform-origin: center;
  transform: rotate(15deg) translate3d(calc(var(--fx-mx)*-3px), calc(var(--fx-my)*2px), 0);
  animation: __v3_gridSlide 42s linear infinite;
}

/* Sweeping light beams */
.__beams {
  position:absolute; inset:-12% -6%;
  background:
    linear-gradient(115deg, transparent 30%, rgba(255,255,255,.45) 48%, transparent 66%),
    linear-gradient(115deg, transparent 52%, rgba(255,255,255,.28) 66%, transparent 80%);
  mix-blend-mode: overlay;
  animation: __v3_beamSweep 7s ease-in-out infinite;
}

/* Molecules (SVG) */
.__mol {
  position:absolute; inset:0; width:100%; height:100%;
  color:#e5f1ff; opacity:${MOLECULE_OPACITY};
  filter: drop-shadow(0 1px 2px rgba(0,0,0,.14));
  transform: translate3d(calc(var(--fx-mx)*1px), calc(var(--fx-my)*1px), 0);
}

/* Soft bubbles (cheap, layered depth) */
.__bubbles { position:absolute; inset:-10% -5% 0 -5%; overflow:hidden; }
.__bubble {
  position:absolute; bottom:-12vh;
  width:12px; height:12px; border-radius:50%;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.95), rgba(255,255,255,.38) 60%, rgba(255,255,255,0) 70%);
  filter: blur(.2px);
  animation: __v3_floatUp var(--d,14s) linear infinite;
  left: var(--x, 50%);
  transform: translateX(-50%) scale(var(--s,1));
}

/* Respect reduced motion */
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
      const x = Math.round(Math.random() * 100);   // 0–100 vw
      const d = 12 + Math.random() * 14;           // 12–26s
      const s = 0.8 + Math.random() * 1.8;         // 0.8–2.6 scale
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

    // 4) Lightweight parallax (mouse move)
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
