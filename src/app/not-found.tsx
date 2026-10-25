import { Arrow } from "@/components/site-ui";
import Link from "next/link";

export default function NotFound() {
  return <main id="main" className="not-found shell"><p className="eyebrow">404 / NO SIGNAL</p><h1>This channel<br />is off air.</h1><p>The page you’re looking for isn’t available.</p><Link className="text-link" href="/">Back to the homepage <Arrow /></Link></main>;
}
