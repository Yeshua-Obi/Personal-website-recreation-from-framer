"use client";

import { MagneticLogo } from "./motion";
import { SiteNavigation } from "./site-navigation";

export function SiteHeader({ identity }: { identity: { displayName: string; tagline: string; mark: string } }) {
  return <header className="site-header shell"><div className="header-identity"><MagneticLogo source={identity.mark} /><span>{identity.displayName}<br /><small>{identity.tagline}</small></span></div><SiteNavigation /><span className="header-location">Lagos, NG<br /><small>Thinking across disciplines.</small></span></header>;
}
