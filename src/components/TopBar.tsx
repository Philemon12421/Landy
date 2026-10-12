import React, { useState } from 'react';
import { ViewportMode, ProjectState } from '../types';
import {
  Monitor, Laptop, Tablet, Smartphone, Undo2, Redo2, Eye, EyeOff,
  Download, Share2, AlertCircle, Check, Code, FileCode, Menu, Keyboard, Globe
} from 'lucide-react';

interface TopBarProps {
  viewport: ViewportMode;
  setViewport: (v: ViewportMode) => void;
  zoom: number;
  setZoom: (z: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isPreviewMode: boolean;
  setIsPreviewMode: (p: boolean) => void;
  project: ProjectState;
  onPublishClick: () => void;
  onShowShortcuts: () => void;
  onShowGallery: () => void;
  onShowMobilePanel: () => void;
}

export default function TopBar({
  viewport, setViewport, zoom, setZoom,
  canUndo, canRedo, onUndo, onRedo,
  isPreviewMode, setIsPreviewMode,
  project, onPublishClick,
  onShowShortcuts, onShowGallery, onShowMobilePanel
}: TopBarProps) {
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [exportModal, setExportModal] = useState<{ title: string; code: string; type: 'html' | 'react' } | null>(null);
  const [copied, setCopied] = useState(false);

  const getRadius = (r: string) => {
    switch (r) {
      case 'none': return 'rounded-none';
      case 'md': return 'rounded-md';
      case 'xl': return 'rounded-2xl';
      case '3xl': return 'rounded-3xl';
      default: return 'rounded-xl';
    }
  };

  const generateHTML = (proj: ProjectState): string => {
    const fontImport = proj.style.fontFamily.includes('Inter')
      ? "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
      : `https://fonts.googleapis.com/css2?family=${proj.style.fontFamily.split(',')[0].replace(/['"]/g, '').trim().replace(/ /g, '+')}:wght@400;500;600;700;800;900&display=swap`;

    const blocksHTML = proj.blocks.map(block => {
      const bg = block.styles.useGradient
        ? `background: linear-gradient(to right, ${block.styles.gradientFrom || '#4f46e5'}, ${block.styles.gradientTo || '#7c3aed'});`
        : `background-color: ${block.styles.bgColor};`;
      const sectionStyle = `${bg} color: ${block.styles.textColor}; font-family: ${block.styles.fontFamily || proj.style.fontFamily};`;
      const padStyle = `padding-top: ${block.styles.paddingTop}px; padding-bottom: ${block.styles.paddingBottom}px;`;
      const brand = block.styles.brandColor || '#4f46e5';
      const rClass = getRadius(block.styles.borderRadius || proj.style.radius);
      const mwClass = block.styles.maxWidth === 'full' ? 'max-w-full' : `max-w-${block.styles.maxWidth || '7xl'}`;

      if (block.type === 'navbar') {
        return `
  <nav style="${sectionStyle} padding: ${block.styles.paddingTop}px 3rem ${block.styles.paddingBottom}px;">
    <div style="max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
      <span style="font-weight:900;font-size:1.25rem;color:${brand};">${block.content.brandName || 'Brand'}</span>
      <nav style="display:flex;align-items:center;gap:1.5rem;font-size:0.75rem;font-weight:600;">
        ${(block.content.links || []).map(l => `<a href="${l.url}" style="color:${block.styles.textColor};text-decoration:none;opacity:0.85;">${l.label}</a>`).join('\n        ')}
      </nav>
      ${block.content.primaryBtnText ? `<a href="${block.content.primaryBtnUrl || '#'}" style="padding:0.5rem 1.25rem;background:${brand};color:#fff;border-radius:0.5rem;font-weight:700;font-size:0.75rem;text-decoration:none;">${block.content.primaryBtnText}</a>` : ''}
    </div>
  </nav>`;
      }

      if (block.type === 'hero_section') {
        return `
  <section style="${sectionStyle} ${padStyle} padding-left:3rem;padding-right:3rem;">
    <div style="max-width:1280px;margin:0 auto;text-align:${block.styles.align};">
      ${block.content.subtitle ? `<span style="display:inline-block;padding:0.25rem 0.75rem;background:${brand}18;color:${brand};font-size:0.625rem;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;border-radius:9999px;margin-bottom:1rem;">${block.content.subtitle}</span>` : ''}
      <h1 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:900;line-height:1.1;margin:0 0 1.5rem;">${block.content.title || ''}</h1>
      <p style="font-size:1rem;opacity:0.75;line-height:1.7;max-width:42rem;${block.styles.align === 'center' ? 'margin:0 auto 2rem;' : 'margin:0 0 2rem;'}">${block.content.description || ''}</p>
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;justify-content:${block.styles.align === 'center' ? 'center' : block.styles.align === 'right' ? 'flex-end' : 'flex-start'};">
        ${block.content.primaryBtnText ? `<a href="${block.content.primaryBtnUrl || '#'}" style="padding:0.75rem 1.5rem;background:${brand};color:#fff;border-radius:0.75rem;font-weight:700;font-size:0.75rem;text-decoration:none;">${block.content.primaryBtnText}</a>` : ''}
        ${block.content.secondaryBtnText ? `<a href="${block.content.secondaryBtnUrl || '#'}" style="padding:0.75rem 1.5rem;border:2px solid ${brand};color:${brand};border-radius:0.75rem;font-weight:700;font-size:0.75rem;text-decoration:none;">${block.content.secondaryBtnText}</a>` : ''}
      </div>
    </div>
  </section>`;
      }

      if (block.type === 'text_block') {
        const tag = block.content.textTag || 'p';
        const isQuote = tag === 'blockquote';
        return `
  <section style="${sectionStyle} ${padStyle} padding-left:3rem;padding-right:3rem;">
    <div style="max-width:${block.styles.maxWidth === '2xl' ? '42rem' : block.styles.maxWidth === '4xl' ? '56rem' : '48rem'};${block.styles.align === 'center' ? 'margin:0 auto;' : ''}text-align:${block.styles.align};">
      <${tag} style="font-size:${block.content.textFontSize || 16}px;font-weight:${block.content.textFontWeight || 400};line-height:${block.content.textLineHeight || 1.8};letter-spacing:${(block.content.textLetterSpacing || 0) / 100}em;text-decoration:${block.content.textDecoration || 'none'};text-transform:${block.content.textTransform || 'none'};color:${block.styles.textColor};${isQuote ? `border-left:4px solid ${brand};padding-left:1.5rem;font-style:italic;opacity:0.85;` : ''}margin:0;">${block.content.textContent || ''}</${tag}>
    </div>
  </section>`;
      }

      if (block.type === 'stats_block') {
        return `
  <section style="${sectionStyle} ${padStyle} padding-left:3rem;padding-right:3rem;">
    <div style="max-width:1280px;margin:0 auto;">
      ${block.content.title ? `<h2 style="font-size:2rem;font-weight:900;text-align:center;margin-bottom:3rem;">${block.content.title}</h2>` : ''}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:2rem;text-align:center;">
        ${(block.content.stats || []).map(s => `
        <div>
          <div style="font-size:clamp(2rem,5vw,3rem);font-weight:900;color:${brand};">${s.prefix || ''}${s.value}${s.suffix || ''}</div>
          <div style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;opacity:0.6;margin-top:0.5rem;">${s.label}</div>
        </div>`).join('')}
      </div>
    </div>
  </section>`;
      }

      if (block.type === 'features_grid') {
        return `
  <section style="${sectionStyle} ${padStyle} padding-left:3rem;padding-right:3rem;">
    <div style="max-width:1280px;margin:0 auto;">
      <div style="max-width:48rem;${block.styles.align === 'center' ? 'margin:0 auto;text-align:center;' : ''}margin-bottom:3rem;">
        ${block.content.subtitle ? `<span style="font-size:0.625rem;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:${brand};display:block;margin-bottom:0.5rem;">${block.content.subtitle}</span>` : ''}
        <h2 style="font-size:2rem;font-weight:900;margin:0 0 0.75rem;">${block.content.title || ''}</h2>
        ${block.content.description ? `<p style="font-size:0.875rem;opacity:0.7;line-height:1.7;margin:0;">${block.content.description}</p>` : ''}
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;">
        ${(block.content.features || []).map(f => `
        <div style="padding:1.5rem;background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:1rem;">
          <div style="width:2.5rem;height:2.5rem;border-radius:0.75rem;background:${brand}15;display:flex;align-items:center;justify-content:center;margin-bottom:1rem;color:${brand};font-weight:900;">✦</div>
          <h3 style="font-weight:800;font-size:0.875rem;margin:0 0 0.5rem;">${f.title}</h3>
          <p style="font-size:0.75rem;opacity:0.8;line-height:1.6;margin:0;">${f.description}</p>
        </div>`).join('')}
      </div>
    </div>
  </section>`;
      }

      if (block.type === 'testimonials') {
        return `
  <section style="${sectionStyle} ${padStyle} padding-left:3rem;padding-right:3rem;">
    <div style="max-width:1280px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:3rem;">
        ${block.content.subtitle ? `<span style="font-size:0.625rem;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:${brand};display:block;margin-bottom:0.5rem;">${block.content.subtitle}</span>` : ''}
        <h2 style="font-size:2rem;font-weight:900;margin:0;">${block.content.title || ''}</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;">
        ${(block.content.testimonials || []).map(t => `
        <div style="padding:1.5rem;background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:1rem;">
          <div style="color:#fbbf24;margin-bottom:0.75rem;">★★★★★</div>
          <p style="font-size:0.875rem;font-style:italic;line-height:1.7;margin:0 0 1rem;opacity:0.9;">"${t.quote}"</p>
          <div style="display:flex;align-items:center;gap:0.75rem;border-top:1px solid rgba(0,0,0,0.06);padding-top:1rem;">
            <img src="${t.avatarUrl}" alt="${t.author}" style="width:2.5rem;height:2.5rem;border-radius:50%;object-fit:cover;" />
            <div>
              <div style="font-weight:800;font-size:0.75rem;">${t.author}</div>
              <div style="font-size:0.625rem;opacity:0.6;">${t.role}</div>
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </section>`;
      }

      if (block.type === 'pricing_cards') {
        return `
  <section style="${sectionStyle} ${padStyle} padding-left:3rem;padding-right:3rem;">
    <div style="max-width:1280px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:3rem;">
        ${block.content.subtitle ? `<span style="font-size:0.625rem;font-weight:900;text-transform:uppercase;color:${brand};display:block;margin-bottom:0.5rem;">${block.content.subtitle}</span>` : ''}
        <h2 style="font-size:2rem;font-weight:900;margin:0;">${block.content.title || ''}</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem;max-width:900px;margin:0 auto;">
        ${(block.content.pricingPlans || []).map(p => `
        <div style="padding:2rem;background:#fff;border:${p.popular ? `2px solid ${brand}` : '1px solid rgba(0,0,0,0.08)'};border-radius:1rem;position:relative;">
          ${p.popular ? `<span style="position:absolute;top:-0.75rem;left:50%;transform:translateX(-50%);background:${brand};color:#fff;padding:0.25rem 1rem;border-radius:9999px;font-size:0.625rem;font-weight:900;text-transform:uppercase;">POPULAR</span>` : ''}
          <h3 style="font-size:0.625rem;font-weight:900;text-transform:uppercase;opacity:0.5;margin:0 0 0.75rem;">${p.name}</h3>
          <div style="font-size:2.5rem;font-weight:900;margin-bottom:1.5rem;">${p.price}<span style="font-size:0.75rem;opacity:0.5;font-weight:500;">/${p.period}</span></div>
          <ul style="list-style:none;padding:0;margin:0 0 1.5rem;font-size:0.75rem;">
            ${p.features.map(f => `<li style="padding:0.5rem 0;border-bottom:1px solid rgba(0,0,0,0.05);display:flex;gap:0.5rem;align-items:flex-start;"><span style="color:${brand};font-weight:900;">✓</span>${f}</li>`).join('')}
          </ul>
          <a href="#" style="display:block;text-align:center;padding:0.75rem;background:${p.popular ? brand : 'transparent'};color:${p.popular ? '#fff' : block.styles.textColor};border:2px solid ${brand};border-radius:0.75rem;font-weight:800;font-size:0.75rem;text-decoration:none;">${p.btnText}</a>
        </div>`).join('')}
      </div>
    </div>
  </section>`;
      }

      if (block.type === 'faq_block') {
        return `
  <section style="${sectionStyle} ${padStyle} padding-left:3rem;padding-right:3rem;">
    <div style="max-width:42rem;margin:0 auto;">
      ${block.content.title ? `<h2 style="font-size:2rem;font-weight:900;text-align:center;margin-bottom:2rem;">${block.content.title}</h2>` : ''}
      <div>
        ${(block.content.faqs || []).map((faq, i) => `
        <details style="background:#fff;border:1px solid rgba(0,0,0,0.08);border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:0.75rem;">
          <summary style="font-weight:700;font-size:0.875rem;cursor:pointer;list-style:none;">${faq.question}</summary>
          <p style="margin:0.75rem 0 0;font-size:0.75rem;opacity:0.75;line-height:1.7;">${faq.answer}</p>
        </details>`).join('')}
      </div>
    </div>
  </section>`;
      }

      if (block.type === 'team_block') {
        return `
  <section style="${sectionStyle} ${padStyle} padding-left:3rem;padding-right:3rem;">
    <div style="max-width:1280px;margin:0 auto;">
      ${block.content.title ? `<h2 style="font-size:2rem;font-weight:900;text-align:center;margin-bottom:3rem;">${block.content.title}</h2>` : ''}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;">
        ${(block.content.team || []).map(m => `
        <div style="padding:1.5rem;background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:1rem;text-align:center;">
          <img src="${m.avatarUrl}" alt="${m.name}" style="width:4rem;height:4rem;border-radius:50%;object-fit:cover;margin:0 auto 1rem;" />
          <h3 style="font-weight:900;font-size:0.875rem;margin:0 0 0.25rem;">${m.name}</h3>
          <div style="font-size:0.75rem;font-weight:700;color:${brand};margin-bottom:0.75rem;">${m.role}</div>
          <p style="font-size:0.75rem;opacity:0.7;line-height:1.6;margin:0;">${m.bio}</p>
        </div>`).join('')}
      </div>
    </div>
  </section>`;
      }

      if (block.type === 'logo_bar') {
        return `
  <section style="${sectionStyle} ${padStyle} padding-left:3rem;padding-right:3rem;text-align:center;">
    ${block.content.logoBarTitle ? `<p style="font-size:0.625rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;opacity:0.45;margin-bottom:2rem;">${block.content.logoBarTitle}</p>` : ''}
    <div style="display:flex;flex-wrap:wrap;gap:2rem 3rem;align-items:center;justify-content:center;opacity:0.5;filter:grayscale(100%);">
      ${(block.content.logos || []).map(l => `<img src="${l.logoUrl}" alt="${l.name}" style="height:1.75rem;width:auto;object-fit:contain;" />`).join('\n      ')}
    </div>
  </section>`;
      }

      if (block.type === 'contact_form') {
        return `
  <section style="${sectionStyle} ${padStyle} padding-left:3rem;padding-right:3rem;text-align:center;">
    <div style="max-width:32rem;margin:0 auto;">
      <h2 style="font-size:2rem;font-weight:900;margin-bottom:0.75rem;">${block.content.title || ''}</h2>
      <p style="font-size:0.875rem;opacity:0.7;margin-bottom:2rem;">${block.content.description || ''}</p>
      <form style="background:#fff;padding:2rem;border-radius:1rem;border:1px solid rgba(0,0,0,0.06);text-align:left;" onsubmit="event.preventDefault();alert('Message sent!');">
        ${(block.content.formFields || []).map(f => `
        <div style="margin-bottom:1rem;">
          <label style="display:block;font-size:0.625rem;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;opacity:0.5;margin-bottom:0.4rem;">${f.label}</label>
          ${f.type === 'textarea' ? `<textarea placeholder="${f.placeholder}" rows="3" style="width:100%;padding:0.625rem 0.75rem;border:1px solid #e2e8f0;border-radius:0.625rem;font-size:0.75rem;font-family:inherit;resize:vertical;box-sizing:border-box;"></textarea>` : `<input type="${f.type}" placeholder="${f.placeholder}" style="width:100%;padding:0.625rem 0.75rem;border:1px solid #e2e8f0;border-radius:0.625rem;font-size:0.75rem;font-family:inherit;box-sizing:border-box;" />`}
        </div>`).join('')}
        <button type="submit" style="width:100%;padding:0.875rem;background:${brand};color:#fff;border:none;border-radius:0.75rem;font-weight:800;font-size:0.75rem;cursor:pointer;margin-top:0.5rem;">${block.content.formBtnText || 'Send Message'}</button>
      </form>
    </div>
  </section>`;
      }

      if (block.type === 'cta_block') {
        return `
  <section style="${sectionStyle} ${padStyle} padding-left:3rem;padding-right:3rem;text-align:center;">
    <div style="max-width:56rem;margin:0 auto;">
      <h2 style="font-size:clamp(1.75rem,4vw,3rem);font-weight:900;margin-bottom:1rem;">${block.content.title || ''}</h2>
      <p style="font-size:1rem;opacity:0.9;max-width:42rem;margin:0 auto 2rem;line-height:1.7;">${block.content.description || ''}</p>
      <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
        ${block.content.primaryBtnText ? `<a href="${block.content.primaryBtnUrl || '#'}" style="padding:0.875rem 1.75rem;background:#fff;color:${block.styles.bgColor};border-radius:0.75rem;font-weight:800;font-size:0.875rem;text-decoration:none;">${block.content.primaryBtnText}</a>` : ''}
        ${block.content.secondaryBtnText ? `<a href="${block.content.secondaryBtnUrl || '#'}" style="padding:0.875rem 1.75rem;border:2px solid rgba(255,255,255,0.35);color:inherit;border-radius:0.75rem;font-weight:700;font-size:0.875rem;text-decoration:none;">${block.content.secondaryBtnText}</a>` : ''}
      </div>
    </div>
  </section>`;
      }

      if (block.type === 'image_block') {
        return `
  <section style="${sectionStyle} ${padStyle} padding-left:3rem;padding-right:3rem;text-align:center;">
    <div style="max-width:56rem;margin:0 auto;">
      ${block.content.imageUrl ? `<img src="${block.content.imageUrl}" alt="${block.content.imageAlt || ''}" style="width:100%;height:auto;max-height:460px;object-fit:cover;border-radius:1rem;" />` : ''}
      ${block.content.description ? `<p style="font-size:0.75rem;opacity:0.6;font-style:italic;margin-top:0.75rem;">${block.content.description}</p>` : ''}
    </div>
  </section>`;
      }

      if (block.type === 'video_embed') {
        return `
  <section style="${sectionStyle} ${padStyle} padding-left:3rem;padding-right:3rem;text-align:center;">
    <div style="max-width:56rem;margin:0 auto;">
      ${block.content.title ? `<h3 style="font-weight:900;font-size:1.25rem;margin-bottom:1rem;">${block.content.title}</h3>` : ''}
      <div style="position:relative;padding-bottom:56.25%;border-radius:1rem;overflow:hidden;">
        <iframe src="${block.content.videoUrl || ''}" style="position:absolute;inset:0;width:100%;height:100%;border:none;" allowfullscreen></iframe>
      </div>
    </div>
  </section>`;
      }

      if (block.type === 'divider') {
        return `<div style="${sectionStyle} padding:0.5rem 3rem;"><hr style="border:none;border-top:1px ${block.content.dividerStyle || 'solid'} ${block.styles.textColor}25;" /></div>`;
      }

      if (block.type === 'spacer') {
        return `<div style="background:${block.styles.bgColor};height:${block.content.spacerHeight || 48}px;"></div>`;
      }

      if (block.type === 'footer') {
        return `
  <footer style="${sectionStyle} ${padStyle} padding-left:3rem;padding-right:3rem;border-top:1px solid rgba(255,255,255,0.08);">
    <div style="max-width:1280px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;">
      <span style="font-weight:900;font-size:1rem;color:${brand};">${block.content.brandName || 'Brand'}</span>
      <span style="font-size:0.75rem;opacity:0.5;">${block.content.copyright || ''}</span>
      <div style="display:flex;gap:1.5rem;">
        ${(block.content.links || []).map(l => `<a href="${l.url}" style="color:inherit;font-size:0.75rem;opacity:0.6;text-decoration:none;">${l.label}</a>`).join('\n        ')}
      </div>
    </div>
  </footer>`;
      }

      return `<!-- ${block.type} -->`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${proj.name}</title>
  <link href="${fontImport}" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; padding: 0; font-family: ${proj.style.fontFamily}; background: ${proj.style.background}; }
    img { max-width: 100%; display: block; }
    @media (max-width: 768px) {
      nav div { flex-wrap: wrap; }
      section { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
      footer { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
    }
  </style>
</head>
<body>
${blocksHTML}
</body>
</html>`;
  };

  const triggerExport = (fmt: 'html' | 'react') => {
    const code = fmt === 'html' ? generateHTML(project) : `// React export\n// Copy the JSX from your Landy project\nexport default function LandingPage() {\n  return (\n    <div>\n      {/* ${project.blocks.length} blocks — use Landy HTML export for full code */}\n    </div>\n  );\n}`;
    setExportModal({ title: fmt === 'html' ? 'HTML Export' : 'React Export', code, type: fmt });
    setShowExportDropdown(false);
  };

  const handleCopy = () => {
    if (exportModal) { navigator.clipboard.writeText(exportModal.code); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  };

  const handleDownload = () => {
    if (!exportModal) return;
    const a = document.createElement('a');
    const blob = new Blob([exportModal.code], { type: 'text/plain' });
    a.href = URL.createObjectURL(blob);
    a.download = exportModal.type === 'html' ? 'landing.html' : 'LandingPage.tsx';
    a.click();
  };

  return (
    <header className="h-14 min-h-[3.5rem] border-b border-slate-200 bg-white flex items-center justify-between px-3 md:px-4 select-none relative z-50">

      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile panel toggle */}
        {!isPreviewMode && (
          <button onClick={onShowMobilePanel} className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors mr-1">
            <Menu className="w-4 h-4 text-slate-600" />
          </button>
        )}
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white text-sm shrink-0">L</div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-black tracking-tight text-slate-800 leading-none">Landy</h1>
          <p className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">No-Code Builder</p>
        </div>
      </div>

      {/* Center controls — hide on small screens */}
      {!isPreviewMode && (
        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 gap-0.5">
          {/* Undo/Redo */}
          <button onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)"
            className={`p-1.5 rounded-lg transition-colors ${canUndo ? 'text-slate-600 hover:bg-white hover:shadow-sm' : 'text-slate-300 cursor-not-allowed'}`}>
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)"
            className={`p-1.5 rounded-lg transition-colors ${canRedo ? 'text-slate-600 hover:bg-white hover:shadow-sm' : 'text-slate-300 cursor-not-allowed'}`}>
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-slate-200 mx-1" />

          {/* Viewport selectors */}
          {([['desktop', Monitor, 'Desk'], ['laptop', Laptop, 'Laptop'], ['tablet', Tablet, 'Tablet'], ['mobile', Smartphone, 'Mobile']] as const).map(([vp, Icon, label]) => (
            <button key={vp} onClick={() => setViewport(vp as ViewportMode)}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${viewport === vp ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Icon className="w-3.5 h-3.5" /><span className="hidden lg:inline">{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Zoom — desktop only */}
        {!isPreviewMode && (
          <div className="hidden lg:flex items-center bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl gap-1.5 text-xs font-bold text-slate-500">
            <button onClick={() => setZoom(Math.max(40, zoom - 10))} disabled={zoom <= 40} className="hover:text-slate-800 disabled:opacity-30 w-4 text-center">−</button>
            <span className="w-7 text-center font-mono">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(130, zoom + 10))} disabled={zoom >= 130} className="hover:text-slate-800 disabled:opacity-30 w-4 text-center">+</button>
          </div>
        )}

        {/* Shortcuts button — desktop */}
        {!isPreviewMode && (
          <button onClick={onShowShortcuts} title="Keyboard shortcuts" className="hidden md:flex p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl transition-colors">
            <Keyboard className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Gallery — desktop */}
        {!isPreviewMode && (
          <button onClick={onShowGallery} className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors text-xs font-bold">
            <Globe className="w-3.5 h-3.5 text-blue-500" /><span className="hidden lg:inline">Gallery</span>
          </button>
        )}

        {/* Preview toggle */}
        <button onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${isPreviewMode ? 'bg-indigo-600 text-white shadow-md' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          {isPreviewMode ? <><EyeOff className="w-3.5 h-3.5" /><span className="hidden sm:inline">Edit</span></> : <><Eye className="w-3.5 h-3.5" /><span className="hidden sm:inline">Preview</span></>}
        </button>

        {/* Export */}
        {!isPreviewMode && (
          <div className="relative">
            <button onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="px-2.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 shadow-sm transition-all">
              <Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">Export</span>
            </button>
            {showExportDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 p-2 w-52 shadow-xl z-50">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-2 py-1 mb-1">Export Format</span>
                <button onClick={() => triggerExport('html')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl font-semibold">
                  <Code className="w-4 h-4 text-emerald-500" /> HTML + CSS File
                </button>
                <button onClick={() => triggerExport('react')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl font-semibold">
                  <FileCode className="w-4 h-4 text-indigo-500" /> React Component
                </button>
              </div>
            )}
          </div>
        )}

        {/* Publish */}
        {!isPreviewMode && (
          <button onClick={onPublishClick}
            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all hover:-translate-y-px">
            <Share2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Publish</span>
          </button>
        )}
      </div>

      {/* Export modal */}
      {exportModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 text-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden">
            <div className="px-5 py-4 bg-slate-950 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">{exportModal.title}</h3>
                <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                  {exportModal.code.length.toLocaleString()} chars
                </span>
              </div>
              <button onClick={() => setExportModal(null)} className="text-xs px-2.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Close</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-[#080d1a] font-mono text-[11px] leading-relaxed text-slate-300">
              <pre className="whitespace-pre-wrap break-words">{exportModal.code}</pre>
            </div>
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <AlertCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                {exportModal.type === 'html' ? 'Production-ready HTML with inline styles. Works anywhere.' : 'Copy into your React project. Requires Tailwind CSS.'}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleCopy} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${copied ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}>
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : 'Copy Code'}
                </button>
                <button onClick={handleDownload} className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
