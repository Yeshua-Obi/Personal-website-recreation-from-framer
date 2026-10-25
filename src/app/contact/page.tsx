import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Arrow } from "@/components/site-ui";
import { pageMetadata } from "@/lib/seo";
import site from "@/content/site.json";

export const metadata: Metadata = pageMetadata("Contact — Projects & Collaborations", "Contact Yeshua Obi, Brand & Systems Designer in Lagos, Nigeria, about brand identities, digital products, AI workflows, film or a design consultation.", "/contact");

export default function ContactPage() {
  const channels = [
    { label: "+234 814 458 7272", url: `tel:${site.phone}` },
    { label: site.email, url: `mailto:${site.email}` },
    ...site.socials.map(social => ({ label: social.url.replace(/^https:\/\/(www\.)?/, ""), url: social.url })),
  ];
  return <main id="main" className="contact-page shell"><div className="page-intro"><p className="eyebrow">03 / CONTACT / A conversation first</p><h1>Good things<br />start with <span className="annotated">hello.<svg viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden="true"><path d="M4 20Q150 2 295 12" /></svg></span></h1><div className="page-intro-bottom"><p>Have a project in mind, a knot to untangle,<br />or something you think I’d love? I’m listening.</p><span className="handwritten">no perfect brief required.</span></div></div><div className="contact-layout"><div className="contact-channels"><p className="eyebrow">Find me here</p>{channels.map(channel => <a key={channel.url} href={channel.url} {...(channel.url.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{channel.label}<Arrow /></a>)}</div><div><p className="eyebrow form-heading">Or put the idea into words</p><ContactForm /></div></div></main>;
}
