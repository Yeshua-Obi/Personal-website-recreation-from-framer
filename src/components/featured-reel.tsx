"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PreviewProject } from "@/lib/projects";
import { ProjectPreview } from "./gallery";
import { Arrow } from "./site-ui";
import { useMotion } from "./motion";

export function FeaturedReel({ projects }: { projects: PreviewProject[] }) {
  const { enabled } = useMotion();
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const region = useRef<HTMLDivElement>(null);
  const change = useCallback((step: number) => {
    setPrevious(enabled ? index : null);
    setIndex((index + step + projects.length) % projects.length);
  }, [enabled, index, projects.length]);
  const advance = useCallback(() => change(1), [change]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .1 });
    if (region.current) observer.observe(region.current);
    const visibility = () => setTabVisible(!document.hidden);
    visibility(); document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  useEffect(() => {
    if (previous === null) return;
    const timer = window.setTimeout(() => setPrevious(null), 700);
    return () => window.clearTimeout(timer);
  }, [index, previous]);
  useEffect(() => {
    if (!enabled || !visible || !tabVisible || projects.length < 2) return;
    // Normal transitions happen at the real clip's end. A stalled/blocked
    // video still advances after a generous fallback interval.
    const timer = window.setTimeout(advance, 20_000);
    return () => window.clearTimeout(timer);
  }, [advance, enabled, visible, tabVisible, projects.length]);

  if (!projects.length) return null;
  return <div className="hero-feature featured-reel" ref={region} role="region" aria-label="Featured projects" aria-roledescription="carousel">
    <div className="feature-topline"><span>In focus / {String(index + 1).padStart(2, "0")}</span><span>Brand → Digital → Systems</span></div>
    <div className="reel-stage">
      {[...(previous !== null && previous !== index ? [previous] : []), index].map(slide => {
        const current = slide === index;
        return <div key={projects[slide].slug} className={`reel-slide ${current ? "reel-current" : "reel-outgoing"}`} data-project={projects[slide].slug} aria-hidden={!current} inert={!current}><ProjectPreview project={projects[slide]} index={slide} featured active={current} onComplete={current && enabled && visible && tabVisible ? advance : undefined} /></div>;
      })}
    </div>
    <div className="reel-controls"><span>{String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span><div><button type="button" onClick={() => change(-1)} aria-label="Previous featured project"><Arrow direction="left" /></button><button type="button" onClick={() => change(1)} aria-label="Next featured project"><Arrow /></button></div></div>
    <div className="feature-footnote"><span className="handwritten">a few worlds I’ve worked in.</span><p>One practice.<br />Different ways of seeing.</p></div>
  </div>;
}
