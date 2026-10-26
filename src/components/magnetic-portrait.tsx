"use client";

import {useEffect, useRef} from "react";
import {useMotion} from "./motion";
import {SourceImage} from "./source-image";

export function MagneticPortrait({source, alt}: {source: string; alt: string}) {
  const {enabled} = useMotion();
  const surface = useRef<HTMLSpanElement>(null);
  const reset = () => {
    surface.current?.style.setProperty("--magnet-x", "0px");
    surface.current?.style.setProperty("--magnet-y", "0px");
  };
  useEffect(reset, [enabled]);

  return <figure className="portrait magnetic-portrait" data-cursor="hide"
    onPointerMove={event => {
      if (!enabled || event.pointerType === "touch") return;
      // Measure the stable figure, so moving the image cannot shift its hit area.
      const box = event.currentTarget.getBoundingClientRect();
      surface.current?.style.setProperty("--magnet-x", `${(event.clientX - box.left - box.width / 2) * 0.16}px`);
      surface.current?.style.setProperty("--magnet-y", `${(event.clientY - box.top - box.height / 2) * 0.16}px`);
    }} onPointerLeave={reset} onPointerCancel={reset}>
    <span ref={surface} className="portrait-surface"><SourceImage src={source} alt={alt} fill sizes="(max-width: 600px) 75vw, (max-width: 900px) 60vw, 32vw" preload unoptimized={source.startsWith("https:")} /></span>
    <figcaption className="portrait-label handwritten">the human in the system.</figcaption>
  </figure>;
}
