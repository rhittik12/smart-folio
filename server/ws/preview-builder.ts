import type { PortfolioOutput, PortfolioSection } from './types'

export function buildPreviewHtml(partial: Partial<PortfolioOutput>): string {
  const variant = partial.theme?.variant ?? 'MINIMAL'
  const colors = THEME_COLORS[variant] ?? THEME_COLORS.MINIMAL

  const sectionsHtml = (partial.sections ?? [])
    .map((s) => renderSection(s, colors))
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      background: ${colors.bg};
      color: ${colors.text};
      line-height: 1.6;
    }
    .section { padding: 3rem 2rem; max-width: 800px; margin: 0 auto; }
    .hero { text-align: center; padding: 5rem 2rem; }
    .hero h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: ${colors.heading}; }
    .hero p { font-size: 1.125rem; color: ${colors.muted}; max-width: 600px; margin: 0 auto; }
    .hero .cta { display: inline-block; margin-top: 1.5rem; padding: 0.75rem 2rem; background: ${colors.accent}; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600; }
    h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; color: ${colors.heading}; }
    .about p { color: ${colors.text}; }
    .highlights { list-style: none; margin-top: 1rem; }
    .highlights li { padding: 0.25rem 0; color: ${colors.muted}; }
    .highlights li::before { content: '→ '; color: ${colors.accent}; }
    .project-card { border: 1px solid ${colors.border}; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; background: ${colors.card}; }
    .project-card h3 { font-size: 1.125rem; font-weight: 600; color: ${colors.heading}; }
    .project-card p { margin-top: 0.5rem; font-size: 0.875rem; color: ${colors.muted}; }
    .tech-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
    .tech-tag { font-size: 0.75rem; padding: 0.25rem 0.625rem; border-radius: 9999px; background: ${colors.tagBg}; color: ${colors.accent}; }
    .skill-cat { margin-bottom: 1.25rem; }
    .skill-cat h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: ${colors.heading}; }
    .skill-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .skill-pill { font-size: 0.8rem; padding: 0.3rem 0.75rem; border-radius: 9999px; border: 1px solid ${colors.border}; color: ${colors.text}; }
    .contact { text-align: center; }
    .contact-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; margin-top: 1rem; }
    .contact-links a { color: ${colors.accent}; text-decoration: none; font-size: 0.9rem; }
    .footer { text-align: center; padding: 2rem; font-size: 0.8rem; color: ${colors.muted}; border-top: 1px solid ${colors.border}; }
    .skeleton { background: ${colors.border}; border-radius: 6px; animation: pulse 1.5s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
  </style>
</head>
<body>
${sectionsHtml || skeletonHtml(colors)}
</body>
</html>`
}

interface ThemeColors {
  bg: string; text: string; heading: string; muted: string
  accent: string; border: string; card: string; tagBg: string
}

const THEME_COLORS: Record<string, ThemeColors> = {
  MINIMAL: { bg: '#fafafa', text: '#374151', heading: '#111827', muted: '#6b7280', accent: '#6366f1', border: '#e5e7eb', card: '#ffffff', tagBg: '#eef2ff' },
  MODERN: { bg: '#0f172a', text: '#cbd5e1', heading: '#f1f5f9', muted: '#94a3b8', accent: '#3b82f6', border: '#1e293b', card: '#1e293b', tagBg: '#1e3a5f' },
  CREATIVE: { bg: '#fdf6e3', text: '#5c524a', heading: '#2d2820', muted: '#8a8078', accent: '#e67e22', border: '#ede0c8', card: '#fff8eb', tagBg: '#ffecd2' },
  PROFESSIONAL: { bg: '#ffffff', text: '#4a5568', heading: '#1a202c', muted: '#718096', accent: '#2b6cb0', border: '#e2e8f0', card: '#f7fafc', tagBg: '#ebf4ff' },
  DARK: { bg: '#0a0a0b', text: '#a1a1aa', heading: '#f4f4f5', muted: '#71717a', accent: '#7c3aed', border: '#27272a', card: '#18181b', tagBg: '#2e1065' },
}

function renderSection(section: PortfolioSection, colors: ThemeColors): string {
  switch (section.type) {
    case 'HERO': {
      const cta = section.ctaText
        ? `<a href="${esc(section.ctaLink ?? '#')}" class="cta">${esc(section.ctaText)}</a>`
        : ''
      return `<div class="section hero"><h1>${esc(section.headline)}</h1><p>${esc(section.subheadline)}</p>${cta}</div>`
    }
    case 'ABOUT': {
      const highlights = section.highlights?.length
        ? `<ul class="highlights">${section.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>`
        : ''
      return `<div class="section about"><h2>About</h2><p>${esc(section.bio)}</p>${highlights}</div>`
    }
    case 'PROJECTS': {
      const cards = section.items
        .map((p) => {
          const tags = p.technologies.map((t) => `<span class="tech-tag">${esc(t)}</span>`).join('')
          return `<div class="project-card"><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div class="tech-tags">${tags}</div></div>`
        })
        .join('')
      return `<div class="section"><h2>Projects</h2>${cards}</div>`
    }
    case 'SKILLS': {
      const cats = section.categories
        .map((c) => {
          const pills = c.skills.map((s) => `<span class="skill-pill">${esc(s)}</span>`).join('')
          return `<div class="skill-cat"><h3>${esc(c.name)}</h3><div class="skill-list">${pills}</div></div>`
        })
        .join('')
      return `<div class="section"><h2>Skills</h2>${cats}</div>`
    }
    case 'CONTACT': {
      const links: string[] = []
      if (section.email) links.push(`<a href="mailto:${esc(section.email)}">${esc(section.email)}</a>`)
      if (section.github) links.push(`<a href="${esc(section.github)}">GitHub</a>`)
      if (section.linkedin) links.push(`<a href="${esc(section.linkedin)}">LinkedIn</a>`)
      if (section.twitter) links.push(`<a href="${esc(section.twitter)}">Twitter</a>`)
      if (section.website) links.push(`<a href="${esc(section.website)}">Website</a>`)
      const msg = section.message ? `<p style="margin-top:1rem;color:${colors.muted}">${esc(section.message)}</p>` : ''
      return `<div class="section contact"><h2>Contact</h2>${msg}<div class="contact-links">${links.join('')}</div></div>`
    }
    case 'FOOTER':
      return `<div class="footer">${esc(section.text)}</div>`
    default:
      return ''
  }
}

function skeletonHtml(colors: ThemeColors): string {
  return `
  <div class="section hero">
    <div class="skeleton" style="width:60%;height:2.5rem;margin:0 auto 1rem"></div>
    <div class="skeleton" style="width:80%;height:1rem;margin:0 auto 0.5rem"></div>
    <div class="skeleton" style="width:50%;height:1rem;margin:0 auto"></div>
  </div>
  <div class="section">
    <div class="skeleton" style="width:30%;height:1.5rem;margin-bottom:1rem"></div>
    <div class="skeleton" style="width:100%;height:0.875rem;margin-bottom:0.5rem"></div>
    <div class="skeleton" style="width:90%;height:0.875rem;margin-bottom:0.5rem"></div>
    <div class="skeleton" style="width:70%;height:0.875rem"></div>
  </div>`
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
