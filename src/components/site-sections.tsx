import Link from "next/link";
import { getSiteContent } from "@/lib/content";
import { ActionLink, Arrow } from "./site-ui";
import { SiteNavigation } from "./site-navigation";
import { FooterGrain } from "./footer-grain";

export async function ContactSection({ number = "04" }: { number?: string }) {
  const site = await getSiteContent();
  return <section className="contact-section shell" aria-labelledby="talk-title"><div className="contact-ending"><div><p className="eyebrow">{number} / The next conversation</p><h2 id="talk-title">An idea in mind?<br />Let’s give it<br /><span className="annotated">some shape.<svg viewBox="0 0 500 30" preserveAspectRatio="none" aria-hidden="true"><path d="M5 17Q240 1 495 13M40 26Q270 9 465 22" /></svg></span></h2></div><div className="contact-ending-aside"><span className="handwritten">this is a good place to start</span><p>Looking to start a project or need a consultation? Feel free to contact me.</p><ActionLink href="/contact">Let’s talk</ActionLink><a className="direct-email" href={`mailto:${site.email}`}>{site.email}</a></div></div></section>;
}

export async function SiteFooter() {
  const site = await getSiteContent();
  return <footer className="site-footer shell"><FooterGrain /><div className="footer-signoff"><Link href="/about" className="footer-wordmark">{site.displayName}<span><Arrow /></span></Link><p>{site.role}.<br />A person before a portfolio.</p></div><div className="footer-bottom"><p>© {new Date().getFullYear()} Yeshua Obi / Lagos, Nigeria</p><div className="social-links">{site.socials.map(social => <a key={social.label} href={social.url} target="_blank" rel="noopener noreferrer">{social.label} <Arrow /></a>)}</div><a href="#main" className="back-top">Back to top <Arrow direction="up" /></a><SiteNavigation footer /></div></footer>;
}
