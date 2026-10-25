"use client";

import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/media";
import { CursorFollower } from "./cursor-follower";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const MotionContext = createContext({ enabled: false });
export const useMotion = () => useContext(MotionContext);

export function MotionScene({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const scene = useRef<HTMLDivElement>(null);
  const ambient = useRef<HTMLDivElement>(null);
  const enabled = !reduced && !paused;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    try { setPaused(window.localStorage.getItem("portfolio-motion-paused") === "true"); } catch { /* Storage can be unavailable in private browsing. */ }
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = scene.current;
    const glow = ambient.current;
    if (!root || !glow || !enabled) {
      root?.style.setProperty("--orb-x", "0px");
      root?.style.setProperty("--orb-y", "0px");
      root?.style.setProperty("--parallax", "0px");
      return;
    }
    const fine = window.matchMedia("(pointer: fine)").matches;
    const savedX = Number.parseFloat(glow.style.getPropertyValue("--sphere-x"));
    const savedY = Number.parseFloat(glow.style.getPropertyValue("--sphere-y"));
    let x = Number.isFinite(savedX) ? savedX : window.innerWidth * .5;
    let y = Number.isFinite(savedY) ? savedY : window.innerHeight * .6;
    let targetX = x, targetY = y;
    let scrollTarget = Math.min(window.scrollY * 0.12, 280), scroll = scrollTarget;
    let frame = 0, previousTime = 0;
    const tick = (time: number) => {
      const elapsed = previousTime ? Math.min(time - previousTime, 64) : 1000 / 60;
      previousTime = time;
      // A 900ms time constant gives a long, soft drift at any refresh rate.
      const ease = 1 - Math.exp(-elapsed / 900);
      x += (targetX - x) * ease;
      y += (targetY - y) * ease;
      scroll += (scrollTarget - scroll) * (1 - Math.exp(-elapsed / 180));
      root.style.setProperty("--orb-x", `${x.toFixed(2)}px`);
      root.style.setProperty("--orb-y", `${y.toFixed(2)}px`);
      root.style.setProperty("--parallax", `${scroll.toFixed(2)}px`);
      glow.style.setProperty("--sphere-x", `${x.toFixed(2)}px`);
      glow.style.setProperty("--sphere-y", `${y.toFixed(2)}px`);
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) + Math.abs(scrollTarget - scroll) > 0.2
        ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => { if (!frame && !document.hidden) { previousTime = 0; frame = requestAnimationFrame(tick); } };
    const pointer = (event: PointerEvent) => {
      if (!fine || event.pointerType === "touch") return;
      targetX = event.clientX;
      targetY = event.clientY;
      wake();
    };
    const leave = () => { targetX = window.innerWidth * .5; targetY = window.innerHeight * .6; wake(); };
    const resize = () => { targetX = Math.min(targetX, window.innerWidth); targetY = Math.min(targetY, window.innerHeight); wake(); };
    const onScroll = () => { scrollTarget = Math.min(window.scrollY * 0.12, 280); wake(); };
    const visibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (!document.hidden) wake();
    };
    window.addEventListener("pointermove", pointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    wake();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", pointer);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [enabled]);

  return (
    <MotionContext.Provider value={{ enabled }}>
      <div ref={scene} className="motion-scene" data-motion={enabled ? "on" : "off"}>
        {children}
      </div>
        <div ref={ambient} className="ambient" aria-hidden="true"><div className="orb" /><div className="orb-core" /></div>
        <div className="motion-control">
          <button className="motion-toggle" type="button" aria-pressed={paused || reduced}
            aria-label={reduced ? "Reduced motion" : paused ? "Resume motion" : "Pause motion"} aria-describedby="motion-description"
            disabled={reduced} onClick={() => {
              const next = !paused;
              setPaused(next);
              try { window.localStorage.setItem("portfolio-motion-paused", String(next)); } catch { /* The current tab still retains the setting. */ }
            }}>
            <span className="motion-icon" aria-hidden="true"><svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">{enabled ? <path d="M1 1h2v8H1Zm6 0h2v8H7Z" /> : <path d="m2 1 7 4-7 4Z" />}</svg></span>
            <span className="motion-label" aria-hidden="true">{reduced ? "Reduced motion" : paused ? "Resume motion" : "Pause motion"}</span>
          </button>
          <span className="sr-only" id="motion-description">{reduced ? "Your device’s reduced motion preference is active." : paused ? "Resume looping animations throughout the website." : "Pause looping animations throughout the website."}</span>
          <span className="motion-tooltip" aria-hidden="true">{reduced ? "Your device’s reduced motion preference is active." : paused ? "Resume looping animations throughout the website." : "Pause looping animations throughout the website."}</span>
        </div>
      <CursorFollower enabled={enabled} />
    </MotionContext.Provider>
  );
}

export function MagneticLogo({ source }: { source: string }) {
  const { enabled } = useMotion();
  const mark = useRef<HTMLSpanElement>(null);
  const reset = () => {
    mark.current?.style.setProperty("--magnet-x", "0px");
    mark.current?.style.setProperty("--magnet-y", "0px");
  };
  useEffect(reset, [enabled]);

  return (
    <Link href="/" className="brand" data-cursor="hide" aria-label="Yeshua Obi — home"
      onPointerMove={(event) => {
        if (!enabled || event.pointerType === "touch") return;
        const box = event.currentTarget.getBoundingClientRect();
        mark.current?.style.setProperty("--magnet-x", `${(event.clientX - box.left - box.width / 2) * 0.16}px`);
        mark.current?.style.setProperty("--magnet-y", `${(event.clientY - box.top - box.height / 2) * 0.16}px`);
      }} onPointerLeave={reset} onBlur={reset}>
      <span ref={mark} className="brand-mark" aria-hidden="true"><Image src={mediaUrl(source)} alt="" width={42} height={64} sizes="42px" /></span>
    </Link>
  );
}
