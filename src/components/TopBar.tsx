import React, { useState } from 'react';
import { ViewportMode, ProjectState } from '../types';
import {
  Monitor, Tablet, Smartphone, Undo2, Redo2, Eye, EyeOff,
  Download, Share2, AlertCircle, Check, Code, FileCode,
  ZoomIn, ZoomOut, Menu, ChevronDown, Laptop, Globe, Keyboard,
  Play, MousePointer2, Hand, Frame, Component
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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportModal, setExportModal] = useState<{ title: string; code: string; type: 'html' | 'react' } | null>(null);
  const [copied, setCopied] = useState(false);

  /* ── HTML export generator ─────────────────────────────── */
  const generateHTML = (proj: ProjectState): string => {
    const fontName = proj.style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;500;600;700;800;900&display=swap`;

    const blocksHTML = proj.blocks.map(block => {
      const bg = block.styles.useGradient
        ? `background:linear-gradient(to right,${block.styles.gradientFrom||'#4f46e5'},${block.styles.gradientTo||'#7c3aed'});`
        : `background-color:${block.styles.bgColor};`;
      const style = `${bg}color:${block.styles.textColor};font-family:${block.styles.fontFamily||proj.style.fontFamily};`;
      const pad = `padding-top:${block.styles.paddingTop}px;padding-bottom:${block.styles.paddingBottom}px;padding-left:clamp(1rem,5vw,4rem);padding-right:clamp(1rem,5vw,4rem);`;
      const brand = block.styles.brandColor || '#4f46e5';
      const rr = (r: string) => ({ none:'0',md:'8px',xl:'16px','3xl':'24px',full:'9999px' }[r] || '12px');
      const rad = rr(block.styles.borderRadius || '');

      if (block.type === 'navbar') return `
<nav style="${style}${pad}position:sticky;top:0;z-index:100;backdrop-filter:blur(10px);">
  <div style="max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
    <span style="font-weight:900;font-size:1.25rem;color:${brand};">${block.content.brandName||'Brand'}</span>
    <nav style="display:flex;align-items:center;gap:2rem;font-size:0.8125rem;font-weight:500;">
      ${(block.content.links||[]).map(l=>`<a href="${l.url}" style="color:${block.styles.textColor};text-decoration:none;opacity:.8;transition:opacity .15s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=.8">${l.label}</a>`).join('')}
    </nav>
    ${block.content.primaryBtnText?`<a href="${block.content.primaryBtnUrl||'#'}" style="padding:.5rem 1.25rem;background:${brand};color:#fff;border-radius:${rad};font-weight:700;font-size:.8125rem;text-decoration:none;transition:opacity .15s;" onmouseover="this.style.opacity=.85" onmouseout="this.style.opacity=1">${block.content.primaryBtnText}</a>`:''}
  </div>
</nav>`;

      if (block.type === 'hero_section') return `
<section style="${style}${pad}">
  <div style="max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1fr ${block.content.imageUrl?'1fr':''};gap:3rem;align-items:center;text-align:${block.styles.align};">
    <div>
      ${block.content.subtitle?`<span style="display:inline-block;padding:.25rem .75rem;background:${brand}20;color:${brand};font-size:.6875rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;border-radius:9999px;margin-bottom:1.25rem;">${block.content.subtitle}</span>`:''}
      <h1 style="font-size:clamp(2.25rem,5vw,3.75rem);font-weight:900;line-height:1.05;letter-spacing:-.03em;margin:0 0 1.25rem;">${block.content.title||''}</h1>
      <p style="font-size:1.0625rem;opacity:.75;line-height:1.7;max-width:40rem;${block.styles.align==='center'?'margin:0 auto 2rem;':'margin:0 0 2rem;'}">${block.content.description||''}</p>
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;justify-content:${block.styles.align==='center'?'center':block.styles.align==='right'?'flex-end':'flex-start'};">
        ${block.content.primaryBtnText?`<a href="${block.content.primaryBtnUrl||'#'}" style="padding:.875rem 2rem;background:${brand};color:#fff;border-radius:${rad};font-weight:700;font-size:.875rem;text-decoration:none;box-shadow:0 4px 14px ${brand}40;">${block.content.primaryBtnText}</a>`:''}
        ${block.content.secondaryBtnText?`<a href="${block.content.secondaryBtnUrl||'#'}" style="padding:.875rem 2rem;border:2px solid ${brand};color:${brand};border-radius:${rad};font-weight:600;font-size:.875rem;text-decoration:none;">${block.content.secondaryBtnText}</a>`:''}
      </div>
    </div>
    ${block.content.imageUrl?`<img src="${block.content.imageUrl}" alt="${block.content.imageAlt||''}" style="width:100%;height:auto;border-radius:${rad};object-fit:cover;max-height:480px;" />`:''}
  </div>
</section>`;

      if (block.type === 'text_block') { const tag=block.content.textTag||'p'; return `
<section style="${style}${pad}">
  <div style="max-width:48rem;${block.styles.align==='center'?'margin:0 auto;':''}text-align:${block.styles.align};">
    <${tag} style="font-size:${block.content.textFontSize||16}px;font-weight:${block.content.textFontWeight||400};line-height:${block.content.textLineHeight||1.8};letter-spacing:${(block.content.textLetterSpacing||0)/100}em;text-decoration:${block.content.textDecoration||'none'};text-transform:${block.content.textTransform||'none'};color:${block.styles.textColor};${tag==='blockquote'?`border-left:4px solid ${brand};padding-left:1.5rem;font-style:italic;opacity:.85;`:''}margin:0;">${block.content.textContent||''}</${tag}>
  </div>
</section>`; }

      if (block.type === 'stats_block') return `
<section style="${style}${pad}">
  <div style="max-width:1280px;margin:0 auto;">
    ${block.content.title?`<h2 style="font-size:2rem;font-weight:900;text-align:center;margin-bottom:3rem;letter-spacing:-.02em;">${block.content.title}</h2>`:''}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:2rem;text-align:center;">
      ${(block.content.stats||[]).map(s=>`<div><div style="font-size:clamp(2rem,5vw,3.5rem);font-weight:900;color:${brand};letter-spacing:-.03em;">${s.prefix||''}${s.value}${s.suffix||''}</div><div style="font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;opacity:.55;margin-top:.5rem;">${s.label}</div></div>`).join('')}
    </div>
  </div>
</section>`;

      if (block.type === 'features_grid') return `
<section style="${style}${pad}">
  <div style="max-width:1280px;margin:0 auto;">
    <div style="max-width:44rem;${block.styles.align==='center'?'margin:0 auto;text-align:center;':''}margin-bottom:3rem;">
      ${block.content.subtitle?`<span style="font-size:.6875rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:${brand};display:block;margin-bottom:.5rem;">${block.content.subtitle}</span>`:''}
      <h2 style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:900;letter-spacing:-.02em;margin:0 0 .75rem;">${block.content.title||''}</h2>
      ${block.content.description?`<p style="font-size:.9375rem;opacity:.7;line-height:1.7;margin:0;">${block.content.description}</p>`:''}
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;">
      ${(block.content.features||[]).map(f=>`<div style="padding:1.5rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:${rad};transition:border-color .2s;" onmouseover="this.style.borderColor='${brand}44'" onmouseout="this.style.borderColor='rgba(255,255,255,.08)'"><div style="width:2.5rem;height:2.5rem;border-radius:.625rem;background:${brand}18;display:flex;align-items:center;justify-content:center;margin-bottom:1rem;color:${brand};font-size:1.25rem;">✦</div><h3 style="font-weight:800;font-size:.9375rem;margin:0 0 .5rem;">${f.title}</h3><p style="font-size:.8125rem;opacity:.75;line-height:1.65;margin:0;">${f.description}</p></div>`).join('')}
    </div>
  </div>
</section>`;

      if (block.type === 'testimonials') return `
<section style="${style}${pad}">
  <div style="max-width:1280px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:3rem;">
      ${block.content.subtitle?`<span style="font-size:.6875rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:${brand};display:block;margin-bottom:.5rem;">${block.content.subtitle}</span>`:''}
      <h2 style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:900;letter-spacing:-.02em;margin:0;">${block.content.title||''}</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;">
      ${(block.content.testimonials||[]).map(t=>`<div style="padding:1.75rem;border:1px solid rgba(255,255,255,.08);border-radius:${rad};"><div style="color:#fbbf24;font-size:1rem;margin-bottom:.75rem;letter-spacing:.05em;">★★★★★</div><p style="font-size:.9375rem;font-style:italic;line-height:1.7;opacity:.9;margin:0 0 1.25rem;">"${t.quote}"</p><div style="display:flex;align-items:center;gap:.75rem;border-top:1px solid rgba(255,255,255,.06);padding-top:1.25rem;"><img src="${t.avatarUrl}" alt="${t.author}" style="width:2.5rem;height:2.5rem;border-radius:50%;object-fit:cover;" /><div><div style="font-weight:800;font-size:.8125rem;">${t.author}</div><div style="font-size:.6875rem;opacity:.55;margin-top:.1rem;">${t.role}</div></div></div></div>`).join('')}
    </div>
  </div>
</section>`;

      if (block.type === 'pricing_cards') return `
<section style="${style}${pad}">
  <div style="max-width:1200px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:3rem;">
      ${block.content.subtitle?`<span style="font-size:.6875rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:${brand};display:block;margin-bottom:.5rem;">${block.content.subtitle}</span>`:''}
      <h2 style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:900;letter-spacing:-.02em;margin:0 0 .5rem;">${block.content.title||''}</h2>
      ${block.content.description?`<p style="font-size:.9375rem;opacity:.65;">${block.content.description}</p>`:''}
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem;max-width:900px;margin:0 auto;">
      ${(block.content.pricingPlans||[]).map(p=>`<div style="padding:2rem;border:${p.popular?`2px solid ${brand}`:'1px solid rgba(255,255,255,.1)'};border-radius:${rad};position:relative;${p.popular?`box-shadow:0 0 0 4px ${brand}22;`:''}">
        ${p.popular?`<span style="position:absolute;top:-.875rem;left:50%;transform:translateX(-50%);background:${brand};color:#fff;padding:.25rem .875rem;border-radius:9999px;font-size:.625rem;font-weight:800;text-transform:uppercase;white-space:nowrap;">MOST POPULAR</span>`:''}
        <div style="font-size:.625rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;opacity:.5;margin-bottom:.75rem;">${p.name}</div>
        <div style="margin-bottom:1.5rem;"><span style="font-size:2.75rem;font-weight:900;letter-spacing:-.03em;">${p.price}</span><span style="font-size:.8125rem;opacity:.45;margin-left:.25rem;">/${p.period}</span></div>
        <ul style="list-style:none;padding:0;margin:0 0 1.5rem;font-size:.8125rem;">
          ${p.features.map(f=>`<li style="padding:.4rem 0;display:flex;gap:.5rem;align-items:flex-start;border-bottom:1px solid rgba(255,255,255,.05);"><span style="color:${brand};font-weight:700;flex-shrink:0;">✓</span>${f}</li>`).join('')}
        </ul>
        <a href="#" style="display:block;text-align:center;padding:.75rem;background:${p.popular?brand:'transparent'};color:${p.popular?'#fff':block.styles.textColor};border:2px solid ${brand};border-radius:${rad};font-weight:700;font-size:.8125rem;text-decoration:none;">${p.btnText}</a>
      </div>`).join('')}
    </div>
  </div>
</section>`;

      if (block.type === 'faq_block') return `
<section style="${style}${pad}">
  <div style="max-width:44rem;margin:0 auto;">
    ${block.content.title?`<h2 style="font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;text-align:center;margin-bottom:2.5rem;letter-spacing:-.02em;">${block.content.title}</h2>`:''}
    ${(block.content.faqs||[]).map(f=>`<details style="border:1px solid rgba(255,255,255,.08);border-radius:${rad};padding:1rem 1.25rem;margin-bottom:.75rem;"><summary style="font-weight:700;font-size:.9375rem;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;">${f.question}<span style="font-size:1.25rem;opacity:.4;font-weight:300;flex-shrink:0;margin-left:1rem;">+</span></summary><p style="margin:.875rem 0 0;font-size:.875rem;opacity:.7;line-height:1.7;">${f.answer}</p></details>`).join('')}
  </div>
</section>`;

      if (block.type === 'team_block') return `
<section style="${style}${pad}">
  <div style="max-width:1280px;margin:0 auto;">
    ${block.content.title?`<h2 style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:900;text-align:center;margin-bottom:3rem;letter-spacing:-.02em;">${block.content.title}</h2>`:''}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem;">
      ${(block.content.team||[]).map(m=>`<div style="padding:1.75rem;border:1px solid rgba(255,255,255,.08);border-radius:${rad};text-align:center;"><img src="${m.avatarUrl}" alt="${m.name}" style="width:4rem;height:4rem;border-radius:50%;object-fit:cover;margin:0 auto 1rem;" /><h3 style="font-weight:900;font-size:.9375rem;margin:0 0 .25rem;">${m.name}</h3><div style="font-size:.75rem;font-weight:700;color:${brand};margin-bottom:.75rem;">${m.role}</div><p style="font-size:.8125rem;opacity:.65;line-height:1.6;margin:0;">${m.bio}</p></div>`).join('')}
    </div>
  </div>
</section>`;

      if (block.type === 'logo_bar') return `
<section style="${style}${pad}text-align:center;">
  ${block.content.logoBarTitle?`<p style="font-size:.6875rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;opacity:.4;margin-bottom:2rem;">${block.content.logoBarTitle}</p>`:''}
  <div style="display:flex;flex-wrap:wrap;gap:2rem 3rem;align-items:center;justify-content:center;opacity:.5;filter:grayscale(100%);">
    ${(block.content.logos||[]).map(l=>`<img src="${l.logoUrl}" alt="${l.name}" style="height:1.75rem;width:auto;object-fit:contain;" />`).join('')}
  </div>
</section>`;

      if (block.type === 'contact_form') return `
<section style="${style}${pad}text-align:center;">
  <div style="max-width:32rem;margin:0 auto;">
    <h2 style="font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.75rem;letter-spacing:-.02em;">${block.content.title||''}</h2>
    <p style="opacity:.65;margin-bottom:2rem;font-size:.9375rem;">${block.content.description||''}</p>
    <form style="text-align:left;" onsubmit="event.preventDefault();this.innerHTML='<p style=text-align:center;padding:2rem;font-weight:700;color:${brand}>Message sent! ✓</p>'">
      ${(block.content.formFields||[]).map(f=>`<div style="margin-bottom:1rem;"><label style="display:block;font-size:.6875rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;opacity:.5;margin-bottom:.4rem;">${f.label}</label>${f.type==='textarea'?`<textarea placeholder="${f.placeholder}" rows="3" style="width:100%;padding:.625rem .875rem;border:1px solid rgba(255,255,255,.12);border-radius:.5rem;background:rgba(255,255,255,.04);color:inherit;font-family:inherit;font-size:.875rem;resize:vertical;box-sizing:border-box;" onfocus="this.style.borderColor='${brand}'" onblur="this.style.borderColor='rgba(255,255,255,.12)'"></textarea>`:`<input type="${f.type}" placeholder="${f.placeholder}" style="width:100%;padding:.625rem .875rem;border:1px solid rgba(255,255,255,.12);border-radius:.5rem;background:rgba(255,255,255,.04);color:inherit;font-family:inherit;font-size:.875rem;box-sizing:border-box;" onfocus="this.style.borderColor='${brand}'" onblur="this.style.borderColor='rgba(255,255,255,.12)'" />`}</div>`).join('')}
      <button type="submit" style="width:100%;padding:.875rem;background:${brand};color:#fff;border:none;border-radius:${rad};font-weight:700;font-size:.875rem;cursor:pointer;margin-top:.5rem;font-family:inherit;">${block.content.formBtnText||'Send Message'}</button>
    </form>
  </div>
</section>`;

      if (block.type === 'cta_block') return `
<section style="${style}${pad}text-align:center;">
  <div style="max-width:56rem;margin:0 auto;">
    <h2 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:900;letter-spacing:-.03em;margin:0 0 1rem;">${block.content.title||''}</h2>
    <p style="font-size:1.0625rem;opacity:.85;max-width:42rem;margin:0 auto 2.5rem;line-height:1.7;">${block.content.description||''}</p>
    <div style="display:flex;gap:.875rem;justify-content:center;flex-wrap:wrap;">
      ${block.content.primaryBtnText?`<a href="${block.content.primaryBtnUrl||'#'}" style="padding:.875rem 2rem;background:#fff;color:${block.styles.bgColor};border-radius:${rad};font-weight:800;font-size:.9375rem;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.2);">${block.content.primaryBtnText}</a>`:''}
      ${block.content.secondaryBtnText?`<a href="${block.content.secondaryBtnUrl||'#'}" style="padding:.875rem 2rem;border:2px solid rgba(255,255,255,.35);color:inherit;border-radius:${rad};font-weight:600;font-size:.9375rem;text-decoration:none;">${block.content.secondaryBtnText}</a>`:''}
    </div>
  </div>
</section>`;

      if (block.type === 'image_block') return `
<section style="${style}${pad}text-align:center;">
  <div style="max-width:64rem;margin:0 auto;">
    ${block.content.imageUrl?`<img src="${block.content.imageUrl}" alt="${block.content.imageAlt||''}" style="width:100%;height:auto;max-height:520px;object-fit:cover;border-radius:${rad};" />`:''}
    ${block.content.description?`<p style="font-size:.8125rem;opacity:.5;font-style:italic;margin-top:.875rem;">${block.content.description}</p>`:''}
  </div>
</section>`;

      if (block.type === 'video_embed') return `
<section style="${style}${pad}text-align:center;">
  <div style="max-width:56rem;margin:0 auto;">
    ${block.content.title?`<h3 style="font-weight:900;font-size:1.5rem;margin-bottom:1rem;letter-spacing:-.02em;">${block.content.title}</h3>`:''}
    <div style="position:relative;padding-bottom:56.25%;border-radius:${rad};overflow:hidden;border:1px solid rgba(255,255,255,.1);">
      <iframe src="${block.content.videoUrl||''}" style="position:absolute;inset:0;width:100%;height:100%;border:none;" allowfullscreen></iframe>
    </div>
  </div>
</section>`;

      if (block.type === 'divider') return `<div style="${style}padding:.5rem clamp(1rem,5vw,4rem);"><hr style="border:none;border-top:1px ${block.content.dividerStyle||'solid'} rgba(255,255,255,.12);" /></div>`;
      if (block.type === 'spacer') return `<div style="background:${block.styles.bgColor};height:${block.content.spacerHeight||48}px;"></div>`;

      if (block.type === 'footer') return `
<footer style="${style}${pad}border-top:1px solid rgba(255,255,255,.07);">
  <div style="max-width:1280px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;">
    <span style="font-weight:900;font-size:1.0625rem;color:${brand};">${block.content.brandName||'Brand'}</span>
    <span style="font-size:.8125rem;opacity:.4;">${block.content.copyright||''}</span>
    <div style="display:flex;gap:1.5rem;">${(block.content.links||[]).map(l=>`<a href="${l.url}" style="color:inherit;font-size:.8125rem;opacity:.45;text-decoration:none;transition:opacity .15s;" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='.45'">${l.label}</a>`).join('')}</div>
  </div>
</footer>`;
      return '';
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${proj.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${fontUrl}" rel="stylesheet" />
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{font-family:${proj.style.fontFamily};background:${proj.style.background};color:#e5e5e5;line-height:1.5}
    img{max-width:100%;display:block}
    details summary::-webkit-details-marker{display:none}
    @media(max-width:768px){section,nav,footer{padding-left:1.25rem!important;padding-right:1.25rem!important}}
  </style>
</head>
<body>
${blocksHTML}
</body>
</html>`;
  };

  const triggerExport = (fmt: 'html' | 'react') => {
    setExportModal({ title: fmt === 'html' ? 'Export HTML' : 'Export React', code: fmt === 'html' ? generateHTML(project) : `// React export for: ${project.name}\n// Use the HTML export for full production code\nexport default function LandingPage() {\n  return <div>{/* ${project.blocks.length} blocks */}</div>;\n}`, type: fmt });
    setShowExportMenu(false);
  };

  const handleCopy = () => { if (exportModal) { navigator.clipboard.writeText(exportModal.code); setCopied(true); setTimeout(() => setCopied(false), 1500); } };
  const handleDownload = () => {
    if (!exportModal) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([exportModal.code], { type: 'text/plain' }));
    a.download = exportModal.type === 'html' ? 'landing.html' : 'LandingPage.tsx';
    a.click();
  };

  const viewports = [
    { id: 'desktop', icon: Monitor, label: 'Desktop' },
    { id: 'laptop', icon: Laptop, label: 'Laptop' },
    { id: 'tablet', icon: Tablet, label: 'Tablet' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile' },
  ] as const;

  return (
    <>
      <header className="figma-toolbar flex items-center justify-between px-3 select-none shrink-0" style={{ height: 48 }}>

        {/* ── Left: Logo + tools ──────────────────────────── */}
        <div className="flex items-center gap-1">
          {/* Mobile panel trigger */}
          <button onClick={onShowMobilePanel} className="fig-icon-btn md:hidden">
            <Menu size={15} />
          </button>

          {/* Logo mark */}
          <div className="flex items-center gap-2 mr-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center font-black text-white text-sm"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>L</div>
            <span className="hidden lg:block text-xs font-bold text-white/80">Landy</span>
          </div>

          <div className="toolbar-sep" />

          {/* Cursor / Hand tool (cosmetic, Figma-style) */}
          {!isPreviewMode && (
            <>
              <button className="fig-icon-btn active" title="Select (V)"><MousePointer2 size={14} /></button>
              <button className="fig-icon-btn" title="Hand tool (H)"><Hand size={14} /></button>
              <button className="fig-icon-btn" title="Frame (F)"><Frame size={14} /></button>
              <div className="toolbar-sep" />
            </>
          )}

          {/* Undo / Redo */}
          {!isPreviewMode && (
            <>
              <button onClick={onUndo} disabled={!canUndo} className="fig-icon-btn" title="Undo (Ctrl+Z)">
                <Undo2 size={14} />
              </button>
              <button onClick={onRedo} disabled={!canRedo} className="fig-icon-btn" title="Redo (Ctrl+Shift+Z)">
                <Redo2 size={14} />
              </button>
              <div className="toolbar-sep hidden md:block" />
            </>
          )}

          {/* Viewport chips — desktop only */}
          {!isPreviewMode && (
            <div className="hidden md:flex items-center gap-0.5">
              {viewports.map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => setViewport(id as ViewportMode)}
                  className={`fig-chip ${viewport === id ? 'active' : ''}`}
                  title={label}>
                  <Icon size={13} />
                  <span className="hidden lg:inline text-[11px]">{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Center: project name ─────────────────────────── */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
          <span className="text-[13px] font-semibold text-white/70 max-w-[160px] truncate">
            {project.name || 'Untitled'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#3a3a3a', color: '#888' }}>
            {project.style.theme.replace('_', ' ')}
          </span>
        </div>

        {/* ── Right: zoom + actions ────────────────────────── */}
        <div className="flex items-center gap-1.5">

          {/* Zoom */}
          {!isPreviewMode && (
            <div className="hidden md:flex items-center gap-0.5 px-2 py-1 rounded-md" style={{ background: '#3a3a3a' }}>
              <button onClick={() => setZoom(Math.max(25, zoom - 10))} disabled={zoom <= 25} className="fig-icon-btn" style={{ width: 20, height: 20 }}>
                <ZoomOut size={11} />
              </button>
              <span className="zoom-display" style={{ fontSize: 11, color: '#bbb', minWidth: 36, textAlign: 'center' }}>{zoom}%</span>
              <button onClick={() => setZoom(Math.min(200, zoom + 10))} disabled={zoom >= 200} className="fig-icon-btn" style={{ width: 20, height: 20 }}>
                <ZoomIn size={11} />
              </button>
            </div>
          )}

          <div className="toolbar-sep hidden md:block" />

          {/* Gallery */}
          {!isPreviewMode && (
            <button onClick={onShowGallery} className="fig-icon-btn has-tooltip relative" title="Community Gallery">
              <Globe size={14} />
              <span className="fig-tooltip">Gallery</span>
            </button>
          )}

          {/* Shortcuts */}
          {!isPreviewMode && (
            <button onClick={onShowShortcuts} className="fig-icon-btn hidden md:flex has-tooltip relative" title="Keyboard shortcuts">
              <Keyboard size={14} />
              <span className="fig-tooltip">Shortcuts</span>
            </button>
          )}

          <div className="toolbar-sep" />

          {/* Preview */}
          <button onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
              isPreviewMode
                ? 'text-white'
                : 'text-white/70 hover:text-white'
            }`}
            style={{ background: isPreviewMode ? '#18a0fb' : '#3a3a3a' }}
          >
            {isPreviewMode ? <><EyeOff size={13} /> Edit</> : <><Play size={12} /> Preview</>}
          </button>

          {/* Export */}
          {!isPreviewMode && (
            <div className="relative">
              <button onClick={() => setShowExportMenu(v => !v)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-white/70 hover:text-white transition-all"
                style={{ background: '#3a3a3a' }}>
                <Download size={13} />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown size={11} />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 rounded-lg border overflow-hidden z-50 animate-scale-in"
                  style={{ background: '#2c2c2c', borderColor: '#3a3a3a', minWidth: 180, boxShadow: '0 8px 32px rgba(0,0,0,.6)' }}>
                  <div className="px-3 py-2" style={{ borderBottom: '1px solid #3a3a3a' }}>
                    <p className="section-label">Export as</p>
                  </div>
                  <button onClick={() => triggerExport('html')}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-[12px] font-medium transition-colors"
                    style={{ color: '#ccc' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#333')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <Code size={14} style={{ color: '#4ade80' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#e5e5e5' }}>HTML + CSS</div>
                      <div style={{ fontSize: 10, color: '#666', marginTop: 1 }}>Production-ready file</div>
                    </div>
                  </button>
                  <button onClick={() => triggerExport('react')}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-[12px] font-medium transition-colors"
                    style={{ color: '#ccc' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#333')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <FileCode size={14} style={{ color: '#60a5fa' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#e5e5e5' }}>React Component</div>
                      <div style={{ fontSize: 10, color: '#666', marginTop: 1 }}>TypeScript + Tailwind</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Publish */}
          {!isPreviewMode && (
            <button onClick={onPublishClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 2px 8px rgba(124,58,237,.4)' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '.9'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
              <Share2 size={13} />
              <span className="hidden sm:inline">Publish</span>
            </button>
          )}
        </div>
      </header>

      {/* Export code modal */}
      {exportModal && (
        <div className="fig-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setExportModal(null); }}>
          <div className="fig-modal w-full animate-scale-in" style={{ maxWidth: 860, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="fig-modal-header">
              <div className="flex items-center gap-2.5">
                <Code size={16} style={{ color: '#18a0fb' }} />
                <span className="font-bold text-sm text-white">{exportModal.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono" style={{ background: '#3a3a3a', color: '#888' }}>
                  {exportModal.code.length.toLocaleString()} chars
                </span>
              </div>
              <button onClick={() => setExportModal(null)} className="fig-icon-btn text-[11px] px-2" style={{ width: 'auto' }}>
                Close ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-relaxed"
              style={{ background: '#0d1117', color: '#c9d1d9' }}>
              <pre className="whitespace-pre-wrap break-words">{exportModal.code}</pre>
            </div>
            <div className="flex items-center justify-between gap-3 p-3" style={{ borderTop: '1px solid #3a3a3a', background: '#252525', flexWrap: 'wrap' }}>
              <div className="flex items-center gap-1.5 text-[10px]" style={{ color: '#666' }}>
                <AlertCircle size={12} style={{ color: '#18a0fb', flexShrink: 0 }} />
                {exportModal.type === 'html' ? 'Self-contained HTML — works in any browser.' : 'Requires React + Tailwind CSS.'}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleCopy} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${copied ? '' : ''}`}
                  style={{ background: copied ? '#166534' : '#3a3a3a', color: copied ? '#4ade80' : '#ccc' }}>
                  {copied ? <><Check size={12} /> Copied!</> : 'Copy Code'}
                </button>
                <button onClick={handleDownload} className="fig-btn-primary flex items-center gap-1.5 text-[11px]">
                  <Download size={12} /> Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
