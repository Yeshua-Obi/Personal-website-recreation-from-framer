import type { Metadata } from "next";
import { ActionLink, ContactSection, SectionTitle } from "@/components/site-ui";
import { pageMetadata } from "@/lib/seo";
import site from "@/content/site.json";

export const metadata: Metadata = pageMetadata("A Personal Manual — Practice & Interests", "Yeshua Obi’s personal manual: curiosity, creative practice, visual storytelling and the interests that shape his work as a Brand & Systems Designer.", "/manual");

const interests = [
  { number: "01", title: "Images that say something.", text: "Film, motion and visual storytelling are part of my practice too. Rhythm, atmosphere and emotion matter as much as the final frame.", href: "/portfolio/gentry", link: "A little visual storytelling" },
  { number: "02", title: "The patterns underneath.", text: "I studied Botany. Observing relationships, patterns and structure still shapes how I look at a brand, a product or a workflow.", href: "/about", link: "The longer story" },
  { number: "03", title: "Tools as a playground.", text: "AI workflows and creative technology give me more ways to explore an idea. The part I keep coming back to is the thinking: what the idea needs, how it feels, and whether it holds meaning.", href: "/portfolio/saka", link: "An experiment in the work" },
];

export default function ManualPage() {
  return <main id="main">
    <section className="page-intro manual-intro shell"><p className="eyebrow">PERSON / A personal manual</p><h1>A person before<br /><span className="annotated">a portfolio.<svg viewBox="0 0 500 30" preserveAspectRatio="none" aria-hidden="true"><path d="M5 17Q240 1 495 13" /></svg></span></h1><div className="page-intro-bottom"><p>A few things about how I see, think and make.<br />Some professional. Some just personal.</p><span className="handwritten">a manual, not a rulebook.</span></div></section>
    <section className="manual-outlook shell"><SectionTitle number="01">A way of seeing</SectionTitle><div className="manual-reading"><h2>Curious first.<br /><span className="muted">Careful with the details.</span></h2>{site.biography.map((paragraph, index) => <p key={index}>{paragraph}</p>)}<blockquote className="personal-note">{site.personalNote}</blockquote></div></section>
    <section className="manual-interests shell"><SectionTitle number="02">Things I keep coming back to</SectionTitle><div className="manual-cards">{interests.map(item => <article key={item.number}><span className="eyebrow">{item.number} / An interest</span><h2>{item.title}</h2><p>{item.text}</p><ActionLink href={item.href}>{item.link}</ActionLink></article>)}</div><p className="manual-margin-note handwritten">different interests. same curious mind.</p></section>
    <section className="manual-practice shell"><SectionTitle number="03">Making things together</SectionTitle><div className="manual-reading"><h2>Start with an idea.<br /><span className="muted">Give it room to grow.</span></h2><p>My work moves between brand systems, digital products, AI workflows and visual storytelling. The project decides which of those worlds it needs.</p><p>Have a project in mind, a knot to untangle, or something you think I’d love? I’m listening.</p><ActionLink href="/contact">Start a conversation</ActionLink></div></section>
    <ContactSection />
  </main>;
}
