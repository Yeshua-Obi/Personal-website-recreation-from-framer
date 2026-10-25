"use client";

import { useEffect, useRef, useState } from "react";
import { brandTextureStyle } from "@/lib/brand-texture";

export function FooterGrain() {
  const layer = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setReady(true); observer.disconnect(); }
    }, { rootMargin: "400px" });
    if (layer.current) observer.observe(layer.current);
    return () => observer.disconnect();
  }, []);
  return <span ref={layer} className="footer-grain" aria-hidden="true" style={ready ? brandTextureStyle : undefined} />;
}
