import React, { useState } from 'react';
import { ViewportMode, ProjectState } from '../types';
import { 
  Monitor, Laptop, Tablet, Smartphone, Undo2, Redo2, Eye, EyeOff, 
  Download, Share2, Sparkles, AlertCircle, Check, Code, FileCode
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
}

export default function TopBar({
  viewport,
  setViewport,
  zoom,
  setZoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isPreviewMode,
  setIsPreviewMode,
  project,
  onPublishClick
}: TopBarProps) {
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [exportModalContent, setExportModalContent] = useState<{ title: string; code: string; type: 'html' | 'react' } | null>(null);
  const [copied, setCopied] = useState(false);

  // Compile Static HTML with Tailwind support
  const generateStaticHTML = (proj: ProjectState): string => {
    const blocksHTML = proj.blocks.map(block => {
      const radiusClass = getRadiusTailwind(block.styles.borderRadius);
      const shadowClass = getShadowTailwind(block.styles.shadow);
      const alignClass = `text-${block.styles.align}`;
      const paddingClass = `pt-[${block.styles.paddingTop}px] pb-[${block.styles.paddingBottom}px]`;

      const blockStyleAttr = `style="background-color: ${block.styles.bgColor}; color: ${block.styles.textColor}; font-family: ${proj.style.fontFamily};"`;

      if (block.type === 'navbar') {
        return `
    <nav ${blockStyleAttr} class="w-full border-b border-slate-200/40 relative z-40 ${shadowClass} md:px-12 px-6 py-[${block.styles.paddingTop}px]">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <span class="font-extrabold text-xl tracking-tight" style="color: ${block.styles.brandColor};">${block.content.brandName || 'Landy'}</span>
        <div class="hidden md:flex items-center gap-8 text-sm font-medium">
          ${(block.content.links || []).map(l => `<a href="${l.url}" class="hover:opacity-85 transition-opacity">${l.label}</a>`).join('\n          ')}
        </div>
        ${block.content.primaryBtnText ? `
        <a href="${block.content.primaryBtnUrl || '#'}" class="px-5 py-2 text-xs font-semibold ${radiusClass} transition-all" style="background-color: ${block.styles.brandColor}; color: #ffffff;">
          ${block.content.primaryBtnText}
        </a>` : ''}
      </div>
    </nav>`;
      }

      if (block.type === 'hero_section') {
        const hasMedia = block.content.imageUrl || block.content.videoUrl;
        return `
    <section ${blockStyleAttr} class="relative overflow-hidden w-full ${paddingClass} md:px-12 px-6">
      <div class="max-w-7xl mx-auto grid grid-cols-1 ${hasMedia ? 'lg:grid-cols-2 gap-12' : ''} items-center ${alignClass}">
        <div class="space-y-6">
          ${block.content.subtitle ? `<span class="px-3 py-1 text-xs font-extrabold uppercase tracking-wide rounded-full" style="background-color: ${block.styles.brandColor}22; color: ${block.styles.brandColor};">${block.content.subtitle}</span>` : ''}
          <h1 class="text-4xl md:text-5xl font-black tracking-tight leading-tight">${block.content.title || 'Landing Headline'}</h1>
          <p class="text-base leading-relaxed opacity-90">${block.content.description || ''}</p>
          <div class="pt-2 flex flex-wrap items-center gap-4 ${block.styles.align === 'center' ? 'justify-center' : block.styles.align === 'right' ? 'justify-end' : 'justify-start'}">
            ${block.content.primaryBtnText ? `
            <a href="${block.content.primaryBtnUrl || '#'}" class="px-6 py-3 font-semibold text-sm ${radiusClass} transition-all hover:-translate-y-0.5" style="background-color: ${block.styles.brandColor}; color: #ffffff;">
              ${block.content.primaryBtnText}
            </a>` : ''}
            ${block.content.secondaryBtnText ? `
            <a href="${block.content.secondaryBtnUrl || '#'}" class="px-6 py-3 font-semibold text-sm border hover:-translate-y-0.5 transition-all ${radiusClass}" style="border-color: ${block.styles.textColor}33;">
              ${block.content.secondaryBtnText}
            </a>` : ''}
          </div>
        </div>
        ${block.content.imageUrl ? `
        <div class="flex justify-center flex-1">
          <img src="${block.content.imageUrl}" alt="${block.content.imageAlt || 'Hero visual'}" class="w-full h-auto max-h-[480px] object-cover ${radiusClass} ${shadowClass}" />
        </div>` : ''}
      </div>
    </section>`;
      }

      if (block.type === 'features_grid') {
        return `
    <section ${blockStyleAttr} class="w-full ${paddingClass} md:px-12 px-6">
      <div class="max-w-7xl mx-auto space-y-12">
        <div class="max-w-3xl ${block.styles.align === 'center' ? 'mx-auto text-center' : block.styles.align === 'right' ? 'ml-auto text-right' : 'text-left'}">
          ${block.content.subtitle ? `<span class="text-xs font-extrabold uppercase tracking-widest block mb-2" style="color: ${block.styles.brandColor};">${block.content.subtitle}</span>` : ''}
          <h2 class="text-3xl font-extrabold tracking-tight">${block.content.title || 'Essential Features'}</h2>
          ${block.content.description ? `<p class="mt-3 text-sm opacity-85 leading-relaxed">${block.content.description}</p>` : ''}
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${(block.content.features || []).map(feat => `
          <div class="p-6 border rounded-xl hover:shadow-md transition-all space-y-3" style="border-color: ${block.styles.textColor}15;">
            <div class="w-10 h-10 flex items-center justify-center rounded-lg" style="background-color: ${block.styles.brandColor}15; color: ${block.styles.brandColor}; font-weight: bold; font-family: monospace;">
              ✦
            </div>
            <h3 class="font-bold text-base">${feat.title}</h3>
            <p class="text-xs opacity-90 leading-relaxed">${feat.description}</p>
          </div>`).join('\n          ')}
        </div>
      </div>
    </section>`;
      }

      if (block.type === 'testimonials') {
        return `
    <section ${blockStyleAttr} class="w-full ${paddingClass} md:px-12 px-6">
      <div class="max-w-7xl mx-auto space-y-12 text-center">
        <div class="max-w-2xl mx-auto">
          ${block.content.subtitle ? `<span class="text-xs font-bold uppercase tracking-widest block mb-1" style="color: ${block.styles.brandColor};">${block.content.subtitle}</span>` : ''}
          <h2 class="text-3xl font-extrabold tracking-tight">${block.content.title || 'Client Success'}</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          ${(block.content.testimonials || []).map(test => `
          <div class="bg-white/40 p-8 border rounded-2xl flex flex-col justify-between text-left space-y-6 backdrop-blur-sm" style="border-color: ${block.styles.textColor}10;">
            <p class="text-sm italic leading-relaxed">"${test.quote}"</p>
            <div class="flex items-center gap-3">
              <img src="${test.avatarUrl}" alt="${test.author}" class="w-10 h-10 rounded-full object-cover" />
              <div>
                <h4 class="text-xs font-bold">${test.author}</h4>
                <p class="text-[10px] opacity-75">${test.role}</p>
              </div>
            </div>
          </div>`).join('\n          ')}
        </div>
      </div>
    </section>`;
      }

      if (block.type === 'pricing_cards') {
        return `
    <section ${blockStyleAttr} class="w-full ${paddingClass} md:px-12 px-6">
      <div class="max-w-7xl mx-auto space-y-12">
        <div class="max-w-3xl mx-auto text-center space-y-3">
          ${block.content.subtitle ? `<span class="text-xs font-bold uppercase tracking-widest block" style="color: ${block.styles.brandColor};">${block.content.subtitle}</span>` : ''}
          <h2 class="text-3xl font-extrabold tracking-tight">${block.content.title || 'Simple Plans'}</h2>
          ${block.content.description ? `<p class="text-sm opacity-80">${block.content.description}</p>` : ''}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${(block.content.pricingPlans || []).map(plan => `
          <div class="border p-8 rounded-2xl flex flex-col justify-between relative ${plan.popular ? 'ring-2 ring-offset-4' : ''}" style="border-color: ${block.styles.textColor}15; ${plan.popular ? `ring-color: ${block.styles.brandColor}` : ''}">
            ${plan.popular ? `<span class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">MOST POPULAR</span>` : ''}
            <div class="space-y-4">
              <h3 class="font-bold text-lg text-slate-800">${plan.name}</h3>
              <div class="flex items-baseline gap-1">
                <span class="text-3xl font-extrabold">${plan.price}</span>
                <span class="text-xs opacity-75">${plan.period}</span>
              </div>
              <ul class="space-y-2.5 text-xs">
                ${plan.features.map(f => `<li class="flex items-center gap-2">✓ <span>${f}</span></li>`).join('\n                ')}
              </ul>
            </div>
            <a href="#" class="w-full mt-8 py-2.5 text-xs font-bold text-center ${radiusClass} transition-all block" style="background-color: ${plan.popular ? block.styles.brandColor : 'transparent'}; color: ${plan.popular ? '#ffffff' : block.styles.textColor}; border: 1px solid ${block.styles.textColor}22;">
              ${plan.btnText}
            </a>
          </div>`).join('\n          ')}
        </div>
      </div>
    </section>`;
      }

      if (block.type === 'contact_form') {
        return `
    <section ${blockStyleAttr} class="w-full ${paddingClass} md:px-12 px-6">
      <div class="max-w-xl mx-auto text-center space-y-6">
        <div>
          <h2 class="text-3xl font-extrabold tracking-tight">${block.content.title || 'Get in touch'}</h2>
          <p class="text-xs opacity-80 mt-2">${block.content.description || ''}</p>
        </div>
        <form class="text-left space-y-4" onsubmit="event.preventDefault(); alert('Lead inquiry submitted successfully!');">
          ${(block.content.formFields || []).map(f => `
          <div class="space-y-1">
            <label class="text-xs font-bold block opacity-85">${f.label}</label>
            ${f.type === 'textarea' ? `
            <textarea placeholder="${f.placeholder}" class="w-full p-2.5 text-xs border rounded-lg bg-white/70 focus:outline-none focus:border-blue-500" rows="3"></textarea>
            ` : `
            <input type="${f.type}" placeholder="${f.placeholder}" class="w-full p-2.5 text-xs border rounded-lg bg-white/70 focus:outline-none focus:border-blue-500" />
            `}
          </div>`).join('\n          ')}
          <button type="submit" class="w-full py-3 ${radiusClass} text-xs font-semibold text-white shadow-md hover:-translate-y-0.5 transition-all" style="background-color: ${block.styles.brandColor};">
            ${block.content.formBtnText || 'Submit Form'}
          </button>
        </form>
      </div>
    </section>`;
      }

      if (block.type === 'cta_block') {
        return `
    <section ${blockStyleAttr} class="w-full ${paddingClass} md:px-12 px-6">
      <div class="max-w-4xl mx-auto text-center space-y-6">
        <h2 class="text-3xl font-black tracking-tight">${block.content.title || 'Get Started Now'}</h2>
        <p class="text-sm opacity-90 max-w-2xl mx-auto">${block.content.description || ''}</p>
        <div class="pt-4 flex justify-center gap-4">
          <a href="${block.content.primaryBtnUrl || '#'}" class="px-6 py-3 font-bold text-xs ${radiusClass} hover:opacity-90 shadow-md transition-all" style="background-color: ${block.styles.brandColor}; color: #ffffff;">
            ${block.content.primaryBtnText || 'Join Free'}
          </a>
        </div>
      </div>
    </section>`;
      }

      if (block.type === 'image_block') {
        return `
    <section ${blockStyleAttr} class="w-full ${paddingClass} md:px-12 px-6 text-center">
      <div class="max-w-4xl mx-auto space-y-4">
        <img src="${block.content.imageUrl}" alt="${block.content.imageAlt || 'Gallery Frame'}" class="w-full h-auto object-cover rounded-xl ${shadowClass}" />
        <p class="text-xs opacity-75">${block.content.description || ''}</p>
      </div>
    </section>`;
      }

      if (block.type === 'video_embed') {
        return `
    <section ${blockStyleAttr} class="w-full ${paddingClass} md:px-12 px-6 text-center">
      <div class="max-w-4xl mx-auto space-y-4">
        <h3 class="font-bold text-lg">${block.content.title || 'Video Breakdown'}</h3>
        <p class="text-xs opacity-80">${block.content.description || ''}</p>
        <div class="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200/40">
          <iframe src="${block.content.videoUrl}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
        </div>
      </div>
    </section>`;
      }

      if (block.type === 'divider') {
        const borderStyle = block.content.dividerStyle === 'dashed' ? 'border-dashed' : block.content.dividerStyle === 'dotted' ? 'border-dotted' : 'border-solid';
        return `
    <div ${blockStyleAttr} class="w-full md:px-12 px-6">
      <hr class="w-full border-t ${borderStyle}" style="border-color: ${block.styles.textColor}25;" />
    </div>`;
      }

      if (block.type === 'spacer') {
        return `
    <div ${blockStyleAttr} class="w-full" style="height: ${block.content.spacerHeight || 48}px;"></div>`;
      }

      if (block.type === 'footer') {
        return `
    <footer ${blockStyleAttr} class="w-full ${paddingClass} md:px-12 px-6 border-t border-slate-200/20">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-medium">
        <span>${block.content.brandName || 'Landy'}</span>
        <span>${block.content.copyright || ''}</span>
        <div class="flex items-center gap-6">
          ${(block.content.links || []).map(l => `<a href="${l.url}" class="hover:underline opacity-80">${l.label}</a>`).join('\n          ')}
        </div>
      </div>
    </footer>`;
      }

      return `<!-- Unknown component block: ${block.type} -->`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${proj.name}</title>
  <!-- Load Tailwind Play CDN for immediate preview and styling support -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', system-ui, sans-serif;
      margin: 0;
      padding: 0;
      scroll-behavior: smooth;
    }
  </style>
</head>
<body style="background-color: ${proj.style.background};">
  
  <div class="w-full font-sans">
    ${blocksHTML}
  </div>

</body>
</html>`;
  };

  // Compile full exportable React code
  const generateReactCode = (proj: ProjectState): string => {
    return `import React from 'react';
/* 
  Landy Landing Page Component File - ${proj.name}
  Designed visually utilizing minimalist grids. 
  Dependencies required: lucide-react, tails-classes
*/
import { Sparkles, Layers, Smartphone, Code2, History, CloudUpload } from 'lucide-react';

export default function RenderedLanding() {
  return (
    <div className="w-full min-h-screen font-sans" style={{ backgroundColor: '${proj.style.background}' }}>
      ${proj.blocks.map(b => {
        if (b.type === 'navbar') {
          return `
      {/* Navbar segment */}
      <nav className="w-full relative z-40 relative px-6 md:px-12 py-4 shadow-sm" style={{ backgroundColor: '${b.styles.bgColor}', color: '${b.styles.textColor}' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-extrabold text-xl font-sans" style={{ color: '${b.styles.brandColor}' }}>${b.content.brandName || 'Landy'}</span>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            ${(b.content.links || []).map(l => `<a href="${l.url}" className="hover:opacity-80">${l.label}</a>`).join('\n            ')}
          </div>
          ${b.content.primaryBtnText ? `
          <a href="${b.content.primaryBtnUrl || '#'}" className="px-5 py-2 text-xs font-semibold rounded-lg text-white" style={{ backgroundColor: '${b.styles.brandColor}' }}>
            ${b.content.primaryBtnText}
          </a>` : ''}
        </div>
      </nav>`;
        }
        if (b.type === 'hero_section') {
          return `
      {/* Hero segment */}
      <section className="relative w-full px-6 md:px-12 py-20" style={{ backgroundColor: '${b.styles.bgColor}', color: '${b.styles.textColor}' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            ${b.content.subtitle ? `<span className="px-3 py-1 text-xs font-extrabold uppercase rounded-full" style={{ backgroundColor: '${b.styles.brandColor}22', color: '${b.styles.brandColor}' }}>${b.content.subtitle}</span>` : ''}
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">${b.content.title}</h1>
            <p className="text-base opacity-90 leading-relaxed">${b.content.description}</p>
            <div className="flex flex-wrap gap-4 pt-2">
              ${b.content.primaryBtnText ? `<a href="${b.content.primaryBtnUrl || '#'}" className="px-6 py-3 font-semibold text-xs rounded-xl text-white" style={{ backgroundColor: '${b.styles.brandColor}' }}>${b.content.primaryBtnText}</a>` : ''}
              ${b.content.secondaryBtnText ? `<a href="${b.content.secondaryBtnUrl || '#'}" className="px-6 py-3 font-semibold text-xs rounded-xl border" style={{ borderColor: '${b.styles.textColor}33' }}>${b.content.secondaryBtnText}</a>` : ''}
            </div>
          </div>
          ${b.content.imageUrl ? `<img src="${b.content.imageUrl}" alt="Hero graphics" className="w-full h-auto rounded-2xl shadow-lg border shrink-0 border-slate-100" />` : ''}
        </div>
      </section>`;
        }
        if (b.type === 'features_grid') {
          return `
      {/* Feature deck */}
      <section className="w-full px-6 md:px-12 py-16" style={{ backgroundColor: '${b.styles.bgColor}', color: '${b.styles.textColor}' }}>
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-extrabold tracking-tight">${b.content.title}</h2>
            <p className="text-sm opacity-80 mt-2">${b.content.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${(b.content.features || []).map(f => `
            <div className="p-6 border rounded-2xl space-y-3" style={{ borderColor: '${b.styles.textColor}15' }}>
              <div className="w-9 h-9 flex items-center justify-center rounded-xl font-bold bg-blue-50 text-blue-600">✦</div>
              <h3 className="font-bold text-sm">${f.title}</h3>
              <p className="text-xs opacity-80 leading-relaxed">${f.description}</p>
            </div>`).join('\n            ')}
          </div>
        </div>
      </section>`;
        }
        if (b.type === 'testimonials') {
          return `
      {/* Testimonials */}
      <section className="w-full px-6 md:px-12 py-16" style={{ backgroundColor: '${b.styles.bgColor}', color: '${b.styles.textColor}' }}>
        <div className="max-w-5xl mx-auto space-y-10 text-center">
          <h2 className="text-3xl font-black tracking-tight">${b.content.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            ${(b.content.testimonials || []).map(t => `
            <div className="p-8 border rounded-2xl text-left bg-white/40 backdrop-blur-sm shadow-sm">
              <p className="text-xs italic">"${t.quote}"</p>
              <div className="flex items-center gap-3 mt-4">
                <img src="${t.avatarUrl}" alt="author" className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-xs">${t.author}</h4>
                  <p className="text-[10px] opacity-70">${t.role}</p>
                </div>
              </div>
            </div>`).join('\n            ')}
          </div>
        </div>
      </section>`;
        }
        if (b.type === 'pricing_cards') {
          return `
      {/* Pricing segments */}
      <section className="w-full px-6 md:px-12 py-16" style={{ backgroundColor: '${b.styles.bgColor}', color: '${b.styles.textColor}' }}>
        <div className="max-w-7xl mx-auto space-y-10 text-center">
          <h2 className="text-3xl font-extrabold">${b.content.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${(b.content.pricingPlans || []).map(p => `
            <div className="p-8 border rounded-2xl flex flex-col justify-between ${p.popular ? 'ring-2 ring-indigo-505' : ''}">
              <div className="space-y-4 text-left">
                <h3 className="text-base font-bold">${p.name}</h3>
                <div className="text-2xl font-extrabold">${p.price} <span className="text-xs font-normal opacity-70">/{p.period}</span></div>
                <ul className="space-y-2 text-xs">
                  ${p.features.map(f => `<li>✓ {f}</li>`).join('\n                  ')}
                </ul>
              </div>
              <button className="w-full mt-6 py-2 rounded-xl text-xs font-semibold border block">
                {p.btnText}
              </button>
            </div>`).join('\n            ')}
          </div>
        </div>
      </section>`;
        }
        if (b.type === 'contact_form') {
          return `
      {/* Capture Forms */}
      <section className="w-full px-6 md:px-12 py-16" style={{ backgroundColor: '${b.styles.bgColor}', color: '${b.styles.textColor}' }}>
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold">{b.content.title}</h2>
            <p className="text-xs opacity-75">{b.content.description}</p>
          </div>
          <form className="space-y-4">
            ${(b.content.formFields || []).map(f => `
            <div className="space-y-1">
              <label className="text-[11px] font-bold opacity-80">${f.label}</label>
              ${f.type === 'textarea' ? `
              <textarea placeholder="${f.placeholder}" className="w-full p-2 border rounded-lg bg-white/50 text-xs" rows={3}></textarea>` : `
              <input type="${f.type}" placeholder="${f.placeholder}" className="w-full p-2 border rounded-lg bg-white/50 text-xs" />`}
            </div>`).join('\n            ')}
            <button type="button" className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold">${b.content.formBtnText || 'Submit'}</button>
          </form>
        </div>
      </section>`;
        }
        return `      {/* Spacer / Divider segment / Other */}
      <div style={{ backgroundColor: '${b.styles.bgColor}', height: '${b.type === 'spacer' ? (b.content.spacerHeight || 48) : '2'}px' }} />`;
      }).join('\n')}
    </div>
  );
}
`;
  };

  const getRadiusTailwind = (r: string) => {
    switch (r) {
      case 'none': return 'rounded-none';
      case 'md': return 'rounded-md';
      case 'xl': return 'rounded-2xl';
      case '3xl': return 'rounded-3xl';
      case 'full': return 'rounded-full';
      default: return 'rounded-xl';
    }
  };

  const getShadowTailwind = (s: string) => {
    switch (s) {
      case 'none': return 'shadow-none';
      case 'soft': return 'shadow-sm';
      case 'heavy': return 'shadow-xl';
      default: return 'shadow-none';
    }
  };

  const triggerExport = (format: 'html' | 'react') => {
    const code = format === 'html' ? generateStaticHTML(project) : generateReactCode(project);
    setExportModalContent({
      title: format === 'html' ? 'Export HTML Template' : 'Export React Developer Code',
      code,
      type: format
    });
    setShowExportDropdown(false);
  };

  const handleCopyCode = () => {
    if (exportModalContent) {
      navigator.clipboard.writeText(exportModalContent.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDownloadFile = () => {
    if (exportModalContent) {
      const element = document.createElement("a");
      const file = new Blob([exportModalContent.code], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = exportModalContent.type === 'html' ? 'landy-landing.html' : 'RenderedLanding.tsx';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <header className="h-[56px] min-h-[56px] border-b border-slate-200 bg-white flex items-center justify-between px-4 select-none relative z-50 animate-fade-in">
      
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-base tracking-tight">
          L
        </div>
        <div>
          <h1 className="text-sm font-extrabold tracking-tight text-slate-800">Landy</h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide">No-Code Builder</p>
        </div>
      </div>

      {/* Undo/Redo & Device switch buttons */}
      {!isPreviewMode && (
        <div className="hidden md:flex items-center border border-slate-200 bg-slate-50 rounded-xl p-1 gap-1">
          <button 
            onClick={onUndo} 
            disabled={!canUndo}
            title="Undo project change (Ctrl+Z)"
            className={`p-1.5 rounded-lg transition-colors ${
              canUndo ? 'text-slate-600 hover:bg-white hover:shadow-sm' : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onRedo} 
            disabled={!canRedo}
            title="Redo project change (Ctrl+Shift+Z)"
            className={`p-1.5 rounded-lg transition-colors ${
              canRedo ? 'text-slate-600 hover:bg-white hover:shadow-sm' : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-200 mx-1" />

          {/* Device Frames Selector */}
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              viewport === 'desktop' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Monitor className="w-4 h-4" /> Desk
          </button>
          <button
            onClick={() => setViewport('laptop')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              viewport === 'laptop' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Laptop className="w-4 h-4" /> Laptop
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              viewport === 'tablet' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Tablet className="w-4 h-4" /> Tablet
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              viewport === 'mobile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Smartphone className="w-4 h-4" /> Mobile
          </button>
        </div>
      )}

      {/* Preview, Export and Publish Timeline menu alignment */}
      <div className="flex items-center gap-2">
        
        {/* Zoom selector */}
        {!isPreviewMode && (
          <div className="flex items-center border border-slate-200 bg-slate-50 px-2 py-1 rounded-xl gap-2 text-xs font-bold text-slate-500 mr-2">
            <button onClick={() => setZoom(Math.max(40, zoom - 10))} className="hover:text-slate-800 disabled:opacity-40" disabled={zoom <= 50}>-</button>
            <span className="w-8 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(120, zoom + 10))} className="hover:text-slate-800 disabled:opacity-40" disabled={zoom >= 110}>+</button>
          </div>
        )}

        {/* Live Preview Toggle */}
        <button
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            isPreviewMode 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10' 
              : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {isPreviewMode ? (
            <>
              <EyeOff className="w-4 h-4" /> Build Canvas
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" /> Live Preview
            </>
          )}
        </button>

        {/* Export center dropdown */}
        {!isPreviewMode && (
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            
            {showExportDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 p-2 w-56 shadow-xl animate-scale-in">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-3 py-1.5 mb-1">Developer Exporters</span>
                
                <button
                  onClick={() => triggerExport('html')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all font-semibold"
                >
                  <Code className="w-4 h-4 text-emerald-500" /> Precompiled HTML & CSS
                </button>
                
                <button
                  onClick={() => triggerExport('react')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all font-semibold"
                >
                  <FileCode className="w-4 h-4 text-indigo-505 text-indigo-500" /> React TypeScript Component
                </button>
              </div>
            )}
          </div>
        )}

        {/* Timeline publish center */}
        {!isPreviewMode && (
          <button
            onClick={onPublishClick}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all hover:translate-y-[-1px]"
          >
            <Share2 className="w-4 h-4 animate-pulse" /> Publish
          </button>
        )}

      </div>

      {/* Code Viewer Export modal overlay */}
      {exportModalContent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 text-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden">
            
            <div className="px-5 py-4 bg-slate-950 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm tracking-tight">{exportModalContent.title}</h3>
              </div>
              <button 
                onClick={() => setExportModalContent(null)}
                className="text-xs px-2.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                Close View
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-[#0a0f1d] font-mono text-[11px] leading-relaxed text-slate-300">
              <pre className="whitespace-pre-wrap selection:bg-indigo-500/35 overflow-x-auto">{exportModalContent.code}</pre>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />
                {exportModalContent.type === 'html' 
                  ? 'Includes Tailwind CDN. Safe for drag/drop anywhere or saving to static servers.' 
                  : 'Import this block cleanly into existing React bundles. Requires Tailwind CSS.'}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    copied 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" /> Copied!
                    </>
                  ) : (
                    'Copy to Clipboard'
                  )}
                </button>

                <button
                  onClick={handleDownloadFile}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Download File
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </header>
  );
}
