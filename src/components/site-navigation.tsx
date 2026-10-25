"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/portfolio" },
  { label: "About", href: "/about" },
  { label: "Manual", href: "/manual" },
  { label: "Contact", href: "/contact" },
];

function NavigationHint() {
  const { pending } = useLinkStatus();
  return <span className="navigation-hint" data-pending={pending} aria-hidden="true" />;
}

export function SiteNavigation({ footer = false }: { footer?: boolean }) {
  const path = usePathname();
  return <nav className={`site-navigation${footer ? " footer-navigation" : ""}`} aria-label={footer ? "Footer navigation" : "Main navigation"}>
    {items.map(link => <Link key={link.href} href={link.href} aria-current={(link.href === "/" ? path === "/" : path.startsWith(link.href)) ? "page" : undefined}>{link.label}<NavigationHint /></Link>)}
  </nav>;
}
