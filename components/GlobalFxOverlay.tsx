"use client";

import { useEffect } from "react";

const FX_LEVEL = (process.env.NEXT_PUBLIC_FX_LEVEL || "low").toLowerCase(); // off | low | high

export default function GlobalFxOverlay() {
  useEffect(() => {
    // Respect reduced motion
    const prefersReduce = typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduce || FX_LEVEL === "off") return;

    let disposed = false;

    const mount = () => {
      if (disposed) return;

      const el = document.createElement("div");
      el.setAttribute("aria-hidden", "true");
      // Above page content but below modals/menus (adjust if needed)
      el.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:80";

      // Tunables
      const meshOpacity = FX_LEVEL === "high" ? 0.12 : 0.08;
      const gridOpacity = FX_LEVEL === "high" ? 0.12 : 0.08;
      const meshClass = "fx-mesh animate-mesh";
      const gridClass = "fx-grid animate-grid";

      el.innerHTML = `
        <div class="${meshClass}" style="position:absolute;inset:-40px;opacity:${meshOpacity}"></div>
        <div class="${gridClass}" style="position:absolute;inset:0;opacity:${gridOpacity}"></div>
      `;

      document.body.appendChild(el);

      const onVisibility = () => {
        const running = document.visibilityState === "visible";
        // Pause animations by toggling classes (CSS keeps it cheap)
        const mesh = el.firstElementChild as HTMLElement | null;
        const grid = el.lastElementChild as HTMLElement | null;
        if (mesh && grid) {
          mesh.style.animationPlayState = running ? "running" : "paused";
          grid.style.animationPlayState = running ? "running" : "paused";
        }
      };

      document.addEventListener("visibilitychange", onVisibility);
      onVisibility();

      const onResize = () => {
        // noop hook (reserved for density changes if needed)
      };
      window.addEventListener("resize", onResize, { passive: true });

      return () => {
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("resize", onResize);
        try {
          document.body.removeChild(el);
        } catch {}
      };
    };

    // Idle-mount: avoid blocking hydration
    const idle =
      (window as any).requestIdleCallback ||
      ((cb: Function) => setTimeout(cb as any, 120));

    const cancelIdle =
      (window as any).cancelIdleCallback || ((id: any) => clearTimeout(id));

    const id = idle(() => !disposed && mount());

    return () => {
      disposed = true;
      cancelIdle(id);
    };
  }, []);

  return null;
}
