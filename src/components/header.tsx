"use client";

import { MagneticLogo } from "./motion";
import { SiteNavigation } from "./site-navigation";

export function SiteHeader() {
  return <header className="site-header shell"><div className="header-identity"><MagneticLogo /><span>Yeshua Obi<br /><small>The Creative Nomad</small></span></div><SiteNavigation /><span className="header-location">Lagos, NG<br /><small>Thinking across disciplines.</small></span></header>;
}
