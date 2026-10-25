"use client";

import { useEffect, useRef } from "react";

export function CategoryHeading({ id, children }: { id: string; children: string }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (window.location.hash !== `#${id}`) return;
    const frame = requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [id]);
  return <h1 id={id} ref={heading} tabIndex={-1}>{children}</h1>;
}
