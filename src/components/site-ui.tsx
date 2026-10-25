import Link from "next/link";
import type { ReactNode } from "react";
import site from "@/content/site.json";
import { SiteNavigation } from "./site-navigation";
import { FooterGrain } from "./footer-grain";

export function Arrow({ direction = "up-right" }: { direction?: "up-right" | "down" | "left" | "up" }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ transform: `rotate(${{ "up-right": 0, down: 135, left: 225, up: -45 }[direction]}deg)` }}><path d="M5 19 19 5M5 5h14v14" /></svg>;
}

export function ActionLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="action-link" href={href}><span>{children}</span><i><Arrow /></i></Link>;
}

export function SectionTitle({ children, number, id }: { children: ReactNode; number: string; id?: string }) {
  return <div className="section-title"><span className="section-number" aria-hidden="true">{number.padStart(2, "0")} /</span><h2 id={id}>{children}</h2><span className="title-rule" aria-hidden="true" /></div>;
}

export function ContactSection({ number = "04" }: { number?: string }) {
  return <section className="contact-section shell" aria-labelledby="talk-title"><div className="contact-ending"><div><p className="eyebrow">{number} / The next conversation</p><h2 id="talk-title">An idea in mind?<br />Let’s give it<br /><span className="annotated">some shape.<svg viewBox="0 0 500 30" preserveAspectRatio="none" aria-hidden="true"><path d="M5 17Q240 1 495 13M40 26Q270 9 465 22" /></svg></span></h2></div><div className="contact-ending-aside"><span className="handwritten">this is a good place to start</span><p>Looking to start a project or need a consultation? Feel free to contact me.</p><ActionLink href="/contact">Let’s talk</ActionLink><a className="direct-email" href={`mailto:${site.email}`}>{site.email}</a></div></div></section>;
}

export function SiteFooter() {
  return <footer className="site-footer shell"><FooterGrain /><div className="footer-signoff"><Link href="/about" className="footer-wordmark">Yeshua Obi<span><Arrow /></span></Link><p>Brand & Systems Designer.<br />A person before a portfolio.</p></div><div className="footer-bottom"><p>© {new Date().getFullYear()} Yeshua Obi / Lagos, Nigeria</p><div className="social-links">{site.socials.map(social => <a key={social.label} href={social.url} target="_blank" rel="noopener noreferrer">{social.label} <Arrow /></a>)}</div><a href="#main" className="back-top">Back to top <Arrow direction="up" /></a><SiteNavigation footer /></div></footer>;
}
