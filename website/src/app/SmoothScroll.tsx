"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Site-wide smooth scrolling with depth.
 *
 * Lenis animates the real window scroll (so IntersectionObserver,
 * getBoundingClientRect and native scroll listeners keep working), while a
 * lightweight parallax pass translates any element tagged with `data-depth`
 * to give the page a layered sense of depth as it scrolls.
 *
 * `data-depth` is a multiplier: positive values drift slower than the scroll
 * (they sit "further back"), so 0.15 is a subtle recede, 0.4 is pronounced.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    // Desktop only: leave touch devices on native scroll for the best feel.
    const desktop = window.matchMedia("(min-width: 1024px) and (pointer: fine)");

    let teardown: (() => void) | null = null;

    const start = () => {
      if (teardown) return;
      teardown = init();
    };
    const stop = () => {
      teardown?.();
      teardown = null;
    };

    const onChange = () => (desktop.matches ? start() : stop());
    if (desktop.matches) start();
    desktop.addEventListener("change", onChange);

    return () => {
      desktop.removeEventListener("change", onChange);
      stop();
    };
  }, []);

  return null;
}

function init(): () => void {
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.4,
  });

  const layers = Array.from(
    document.querySelectorAll<HTMLElement>("[data-depth]"),
  );

  const applyDepth = (scroll: number) => {
    for (const el of layers) {
      const depth = parseFloat(el.dataset.depth || "0");
      if (!depth) continue;
      // Anchor each layer to its own document position so the parallax is
      // centred on the element rather than the top of the page.
      const anchor = el.offsetTop;
      const offset = (scroll - anchor) * depth;
      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      el.style.willChange = "transform";
    }
  };

  lenis.on("scroll", ({ scroll }: { scroll: number }) => applyDepth(scroll));
  applyDepth(window.scrollY);

  let rafId = 0;
  const raf = (time: number) => {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);

  // Smooth-scroll in-page anchor links through Lenis.
  const onAnchorClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement)?.closest<HTMLAnchorElement>(
      'a[href^="#"]',
    );
    if (!target) return;
    const id = target.getAttribute("href");
    if (!id || id === "#") return;
    const dest = document.querySelector<HTMLElement>(id);
    if (!dest) return;
    e.preventDefault();
    lenis.scrollTo(dest, { offset: -80 });
  };
  document.addEventListener("click", onAnchorClick);

  return () => {
    cancelAnimationFrame(rafId);
    document.removeEventListener("click", onAnchorClick);
    lenis.destroy();
    for (const el of layers) el.style.transform = "";
  };
}
