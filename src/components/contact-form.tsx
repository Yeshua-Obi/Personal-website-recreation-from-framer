"use client";

import { useState, type FormEvent } from "react";
import site from "@/content/site.json";

export function ContactForm() {
  const [draft, setDraft] = useState<string>();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const message = String(form.get("message") || "").trim();
    const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
    setDraft(`mailto:${site.email}?subject=${subject}&body=${body}`);
  }
  return <form className="contact-form" onSubmit={submit}><label htmlFor="contact-name">Your name<input id="contact-name" name="name" autoComplete="name" required maxLength={100} placeholder="Your name" /></label><label htmlFor="contact-email">Email address<input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="Your email address" /></label><label htmlFor="contact-message">Tell me about your project<textarea id="contact-message" name="message" required rows={5} maxLength={5000} placeholder="What are you thinking?" /></label><button className="email-button" type="submit">Create email draft <span aria-hidden="true">↗</span></button><p className="form-note">Prepare a draft, then open it in your email app to review and send.</p>{draft && <p role="status">Your draft is ready to open. <a href={draft}>Open email draft</a>, or email <a href={`mailto:${site.email}`}>{site.email}</a> directly.</p>}</form>;
}
