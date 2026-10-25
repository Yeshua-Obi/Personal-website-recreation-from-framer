import type { Metadata } from "next";
import Link from "next/link";
import { Gallery } from "@/components/gallery";
import { FeaturedReel } from "@/components/featured-reel";
import { ActionLink, Arrow, ContactSection, SectionTitle } from "@/components/site-ui";
import { getHomepageProjects, toProjectPreview } from "@/lib/projects";
import { getSiteUrl } from "@/lib/site";
import site from "@/content/site.json";
import { categoryHref, projectCategories } from "@/lib/project-categories";

export const metadata: Metadata = { alternates: { canonical: getSiteUrl() || undefined } };

export default function Home() {
  const projects = getHomepageProjects();
  return <main id="main">

    <section className="editorial-hero shell" aria-labelledby="hero-title">
      <div className="hero-copy"><p className="eyebrow">Personal practice / The Creative Nomad</p><h1 id="hero-title">Yeshua<br /><span>Obi.</span></h1><div className="hero-position"><h2>Brand &<br /><span className="circled-word">Systems<svg viewBox="0 0 300 90" preserveAspectRatio="none" aria-hidden="true"><path d="M287 29C275 0 51-6 14 27S15 83 139 82 302 65 286 35C272 12 57 7 22 28" /></svg><svg className="mobile-hero-arrow" viewBox="0 0 100 34" preserveAspectRatio="none" fill="none" aria-hidden="true"><path d="M94 12Q58 24 2 19M14 7Q7 13 2 19L15 29" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></svg></span> Designer.</h2><span className="handwritten mobile-hero-note" aria-hidden="true">brand → systems</span><span className="handwritten hero-note">brand <span className="hero-note-divider" aria-hidden="true">→</span> systems<br /><svg viewBox="0 0 120 60" fill="none" aria-hidden="true"><path d="M112 5Q72 53 8 44m13-9L6 44l13 11" /></svg></span></div><p className="hero-description">I design digital products, AI workflows, and visual systems that turn complex ideas into clear, useful experiences.</p><Link className="text-link" href="#work">Explore the work <Arrow direction="down" /></Link></div>
      <FeaturedReel projects={projects.filter(project => Boolean(project.video)).map(toProjectPreview)} />
      <div className="hero-bottomline"><span>Editorial. Cinematic. Precise.</span><span>Digital products / AI workflows / Creative technology</span><span aria-hidden="true"><Arrow direction="down" /></span></div>
    </section>
    <section className="work-room"><div id="work" className="work-section shell" aria-labelledby="work-title"><SectionTitle number="01" id="work-title">Selected work</SectionTitle><div className="work-introduction"><h2>Work that holds meaning.<br /><span className="work-lives">Work that lives.</span></h2><div><p>Brand, digital experiences and visual storytelling. Different disciplines; the same care for how things feel.</p><span className="eyebrow">{String(projects.length).padStart(2,"0")} projects / Always evolving</span></div></div><Gallery projects={projects.map(toProjectPreview)} /><div className="gallery-bottom"><span className="handwritten">follow what catches your eye</span><ActionLink href="/portfolio">More work</ActionLink></div></div></section>
    <section id="about" className="home-about shell" aria-labelledby="about-title"><div className="about-margin"><p className="eyebrow">02 / Behind the work</p><span className="handwritten desktop-shy-note">shy, but bold.</span><svg viewBox="0 0 140 110" aria-hidden="true"><path d="M20 12Q95 10 116 87m-17-8 20 12 6-22" /></svg></div><div className="about-main"><h2 id="about-title">I’m a child in the<br />playground when<br />I <span className="annotated">design.<span className="handwritten mobile-shy-note" aria-hidden="true"><span className="circled-word">shy, but bold.<svg viewBox="0 0 300 90" preserveAspectRatio="none"><path d="M287 29C275 0 51-6 14 27S15 83 139 82 302 65 286 35C272 12 57 7 22 28" /></svg></span><svg className="shy-arrow" viewBox="0 0 140 60" fill="none"><path d="M126 8Q85 80 10 25m13-8L8 25l13 9" /></svg></span><svg viewBox="0 0 260 20" preserveAspectRatio="none" aria-hidden="true"><path d="M2 14Q135 2 258 9" /></svg></span></h2><div className="about-columns">{site.biography.map((paragraph, index) => <p key={index}>{index === 0 ? paragraph.replace("I’m a child in the playground when I design. ", "") : paragraph}</p>)}</div><blockquote className="personal-note">{site.personalNote}<cite>@yeshuaobi</cite></blockquote><ActionLink href="/about">A little more about me</ActionLink></div></section>
    <section className="practice-strip shell" aria-labelledby="practice-title"><p className="eyebrow" id="practice-title">03 / Moving between worlds</p><div>{projectCategories.map(category => <Link key={category.slug} href={categoryHref(category.slug)}><span>{category.label}</span><Arrow /></Link>)}</div></section>
    <ContactSection />
  </main>;
}
