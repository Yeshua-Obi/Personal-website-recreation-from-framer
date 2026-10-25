"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { projectHref, type PreviewProject } from "@/lib/projects";
import { mediaUrl, previewUrl } from "@/lib/media";
import { useMotion } from "./motion";
import { Arrow } from "./site-ui";

export function ProjectPreview({ project, index, featured = false, active = true, onComplete }: { project: PreviewProject; index: number; featured?: boolean; active?: boolean; onComplete?: () => void }) {
  const { enabled } = useMotion();
  const frame = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hasVideoFrame, setHasVideoFrame] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [activated, setActivated] = useState(false);
  const photos = [project.image, ...(project.gallery || []).map(image => image.src)].filter((src): src is string => Boolean(src));
  const slides = [...new Set(photos)].slice(0, 3);
  const shownSlides = (!project.video || failed) && activated && enabled ? slides : slides.slice(0, 1);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { if (visible && enabled && active) setActivated(true); }, [visible, enabled, active]);

  useEffect(() => {
    const media = video.current;
    if (!media) return;
    const update = () => {
      if (enabled && visible && active && !document.hidden) void media.play().catch(() => {});
      else media.pause();
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => { document.removeEventListener("visibilitychange", update); media.pause(); };
  }, [enabled, visible, active, failed, activated]);

  const unavailable = imageError && !imageReady && !hasVideoFrame;
  return <article ref={frame} className={`project-preview${featured ? " featured-preview" : ""}`} data-playing={enabled && visible && active} data-has-media={imageReady || hasVideoFrame} data-media-unavailable={unavailable} style={{ "--project-index": index, "--project-accent": project.accent || "#7a9abf" } as CSSProperties}>
    <Link className="project-link" href={projectHref(project.slug)}><span className="sr-only">View </span>
      <div className="preview-media" data-slides={shownSlides.length}>
        <span className="media-index" aria-hidden="true">{String(index + 1).padStart(2,"0")} / {project.date?.slice(0,4)}</span>
        <span className="media-placeholder" aria-hidden="true"><span className="placeholder-title">{project.title}</span><Arrow /></span>
        {shownSlides.map((source, slide) => <div key={source} className="preview-slide" style={{ "--slide": slide, "--slides": shownSlides.length } as CSSProperties}>
          <Image src={mediaUrl(source)} alt="" fill sizes={featured ? "(max-width: 600px) 90vw, (max-width: 1200px) 45vw, 40vw" : "(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 30vw"} loading={featured && slide === 0 ? "eager" : "lazy"} fetchPriority={featured && slide === 0 ? "high" : "auto"} className="preview-image" unoptimized={mediaUrl(source).startsWith("https:")} onLoad={event => { event.currentTarget.style.visibility = "visible"; setImageReady(true); }} onError={event => { event.currentTarget.style.visibility = "hidden"; setImageError(true); }} />
        </div>)}
        {project.video && !failed && <video ref={video} src={activated ? previewUrl(project.video) : undefined} muted loop={!onComplete} playsInline preload="none" aria-hidden="true" tabIndex={-1} onEnded={active ? onComplete : undefined}
          onPlaying={() => setHasVideoFrame(true)} onError={() => { setFailed(true); setHasVideoFrame(false); }} className={hasVideoFrame ? "video-ready" : ""} />}
      </div>
      <div className="preview-caption"><div><span>{String(index + 1).padStart(2,"0")} / {project.category}</span><h3>{project.title}</h3>{unavailable && <small>Original media unavailable here</small>}</div><Arrow /></div>
    </Link>
  </article>;
}

export function Gallery({ projects }: { projects: PreviewProject[] }) {
  if (!projects.length) return <p className="empty-gallery">Projects will appear here when their case studies are published.</p>;
  return <div className="project-grid" data-count={projects.length}>{projects.map((project, index) => <ProjectPreview key={project.slug} project={project} index={index} />)}</div>;
}
