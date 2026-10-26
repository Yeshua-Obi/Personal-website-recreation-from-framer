// Conservative suggestions from the owner's brief. No remote model or media analysis.
export function suggestMissingDetails(document: Record<string, unknown>) {
  const brief = typeof document.brief === 'string' ? document.brief.trim() : '';
  if (!brief) return {};
  const suggestions: Record<string, unknown> = {};
  const matches = [
    ['brand-systems', 'Brand systems', /\b(brand|branding|identity|packaging|logo)\b/i],
    ['digital-products', 'Digital products', /\b(website|web|app|ux|ui|digital product|e-commerce)\b/i],
    ['ai-workflows', 'AI workflows', /\b(ai|automation|automated|workflow|machine learning)\b/i],
    ['visual-storytelling', 'Visual storytelling', /\b(film|cinema|cinematography|animation|video|visualization|photography)\b/i],
  ] as const;
  const categories = matches.filter(([, , pattern]) => pattern.test(brief));
  if (!Array.isArray(document.categories) || !document.categories.length) {
    if (categories.length) suggestions.categories = categories.map(([slug]) => slug);
  }
  if (!document.category && categories.length) suggestions.category = categories.map(([,label]) => label).join(' / ');
  if (!document.description) suggestions.description = brief.split(/\n\s*\n/)[0];
  if ((!Array.isArray(document.content) || !document.content.length) && (!Array.isArray(document.sections) || !document.sections.length)) suggestions.content = brief.split(/\n\s*\n/).filter(Boolean);
  return suggestions;
}
