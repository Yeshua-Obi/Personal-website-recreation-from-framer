import Link from "next/link";
import type { ReactNode } from "react";

export function Arrow({ direction = "up-right" }: { direction?: "up-right" | "down" | "left" | "up" }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ transform: `rotate(${{ "up-right": 0, down: 135, left: 225, up: -45 }[direction]}deg)` }}><path d="M5 19 19 5M5 5h14v14" /></svg>;
}

export function ActionLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="action-link" href={href}><span>{children}</span><i><Arrow /></i></Link>;
}

export function SectionTitle({ children, number, id }: { children: ReactNode; number: string; id?: string }) {
  return <div className="section-title"><span className="section-number" aria-hidden="true">{number.padStart(2, "0")} /</span><h2 id={id}>{children}</h2><span className="title-rule" aria-hidden="true" /></div>;
}
