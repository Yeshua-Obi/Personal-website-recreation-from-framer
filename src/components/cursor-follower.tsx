"use client";

import { useEffect, useRef } from "react";

export function CursorFollower({ enabled }: { enabled: boolean }) {
  const follower = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = follower.current;
    if (!element || !enabled) return;
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let x = 0, y = 0, targetX = 0, targetY = 0, frame = 0;
    let shown = false;
    let hoverTarget: HTMLElement | null = null;
    const clearHover = () => {
      hoverTarget?.classList.remove("cursor-hover-target");
      hoverTarget?.style.removeProperty("--hover-x");
      hoverTarget?.style.removeProperty("--hover-y");
      hoverTarget = null;
    };
    const updateTarget = (target: Element | null) => {
      const hidden = !!target?.closest("[data-cursor='hide']");
      const interactive = hidden ? null : target?.closest<HTMLElement>("a, button, [role='button']") || null;
      if (interactive !== hoverTarget) { clearHover(); hoverTarget = interactive; }
      if (hoverTarget) {
        const bounds = hoverTarget.getBoundingClientRect();
        hoverTarget.style.setProperty("--hover-x", `${targetX - bounds.left}px`);
        hoverTarget.style.setProperty("--hover-y", `${targetY - bounds.top}px`);
        hoverTarget.classList.add("cursor-hover-target");
      }
      element.dataset.mode = hidden ? "hidden" : interactive ? "hover" : "free";
      element.dataset.visible = String(!hidden && !interactive);
      element.dataset.interactive = String(!!interactive);
    };
    const tick = () => {
      x += (targetX - x) * .2; y += (targetY - y) * .2;
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) > .1 ? requestAnimationFrame(tick) : 0;
    };
    const move = (event: PointerEvent) => {
      if (!pointer.matches || event.pointerType === "touch") return;
      targetX = event.clientX; targetY = event.clientY;
      if (!shown) { x = targetX; y = targetY; shown = true; }
      updateTarget(event.target instanceof Element ? event.target : null);
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const hide = () => { clearHover(); shown = false; element.dataset.visible = "false"; cancelAnimationFrame(frame); frame = 0; };
    const scroll = () => { if (shown) updateTarget(document.elementFromPoint(targetX, targetY)); };
    const visibility = () => { if (document.hidden) hide(); };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    document.addEventListener("visibilitychange", visibility);
    pointer.addEventListener("change", hide);
    return () => { hide(); window.removeEventListener("pointermove", move); window.removeEventListener("scroll", scroll); document.documentElement.removeEventListener("pointerleave", hide); document.removeEventListener("visibilitychange", visibility); pointer.removeEventListener("change", hide); };
  }, [enabled]);
  return <div ref={follower} className="cursor-follower" data-enabled={enabled} aria-hidden="true"><span /></div>;
}
