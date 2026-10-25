import type { Metadata } from "next";
import { brandTextureStyle } from "@/lib/brand-texture";
import { SourceImage } from "@/components/source-image";
import { ActionLink, SectionTitle } from "@/components/site-ui";
import { ContactSection } from "@/components/site-sections";
import { pageMetadata, profileSchema } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { mediaUrl } from "@/lib/media";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = pageMetadata("About — The Creative Nomad", "Meet Yeshua Obi (Joshua Adedotun Obi), Brand & Systems Designer in Lagos and founder of XAI. Explore his background, experience and creative practice.", "/about");

const experience = [
  { role: "Founder / Design Studio", company: "XAI", date: "2020 — Present", text: "My design studio, where brand strategy, visual systems and digital experiences meet. Most of my independent professional practice has operated through XAI, from identity development to digital platforms and creative technology." },
  { role: "Brand, Digital & Systems Design", company: "Baron Architecture", date: "2024 — Present", text: "Brand, digital, and systems design for Baron Architecture, including the website, visual system, investor communications, and repeatable content workflows. Translating a loosely defined brand into a clearer platform for growth and communication." },
  { role: "Brand & Systems Designer", company: "ECAD Design Architects", date: "2026", text: "Developed ECAD Design Architects’ digital brand direction and website experience, translating the approved identity, research, and stylescape into a cohesive system of typography, colour, patterns, layout, and visual storytelling. Led the design refinement process while balancing brand strategy, usability, and stakeholder feedback." },
  { role: "Brand Designer & Consultant", company: "TAIKEZ", date: "2022 — 2023", text: "Designed the brand and digital product foundation for a food-commerce startup connecting farmers, vendors, and customers. Shaped the website, CMS, user touchpoints, messaging, and design system to make food shopping clearer, more accessible, and easier to scale." },
  { role: "Creative Director", company: "Closer Than We Know", date: "2025", text: "Led strategy and design for a faith-based reflection card game. Built a structured multi-tier card system, packaging architecture, visual identity, and user experience that made the product feel intuitive, warm, and emotionally engaging." },
];

export default async function AboutPage() {
  const site = await getSiteContent();
  const portrait = mediaUrl(site.portrait);
  return <main id="main"><section className="about-opening brand-grain" style={brandTextureStyle} aria-labelledby="about-identity-title"><div className="about-intro shell"><header className="about-identity"><p className="eyebrow">02 / PERSON / The Creative Nomad</p><h1 id="about-identity-title">Yeshua Obi.<br /><span className="muted">The person<br />behind the work.</span></h1></header><aside className="about-role"><p>{site.intro}</p><span className="handwritten">a curious mind.<br />a considered practice.</span></aside><div className="about-bio">{site.about.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<ActionLink href="/contact">Get in touch</ActionLink></div><figure className="portrait"><SourceImage src={portrait} alt="Joshua Obi, Brand & Systems Designer" fill sizes="(max-width: 600px) 75vw, (max-width: 900px) 60vw, 32vw" preload unoptimized={portrait.startsWith("https:")} /><figcaption className="portrait-label handwritten">the human in the system.</figcaption></figure></div></section><section className="about-philosophy shell"><p className="eyebrow">A way of seeing</p><h2>Curiosity opens the door.<br /><span className="muted">Care makes the work.</span></h2><div>{site.biography.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</div></section><section className="resume-section shell"><SectionTitle number="01">Experience & practice</SectionTitle>{experience.map(job => <article className="resume-row" key={job.company}><div><p className="eyebrow">{job.role}</p><h3>{job.company}</h3><span>{job.date}</span></div><p>{job.text}</p></article>)}</section><section className="resume-section shell"><SectionTitle number="02">Education & learning</SectionTitle><div className="resume-row"><div><h3>B.Sc. Botany</h3><p>University of Lagos, Nigeria</p><span>2021 / Second Class Upper</span></div><p>Botany developed a systems-oriented way of observing relationships, patterns, and structure. I now apply that thinking to digital products, visual systems, and creative technology workflows.</p></div><div className="resume-row"><div><h3>Continuing to connect the dots.</h3></div><div className="education-list"><p>Foundations of UX Design / Google & Coursera / 2023</p><p>AI & Automation / TS Academy / Jan–May 2026</p></div></div></section><JsonLd data={profileSchema()} /><ContactSection /></main>;
}
