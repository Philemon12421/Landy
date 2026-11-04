import { Block, CanvasElement, DESIGN_WIDTH, ProjectState } from '../types';

/* ── Safety helpers ─────────────────────────────────────────── */
export const esc = (s: unknown): string =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const num = (v: unknown, d = 0) => { const x = Number(v); return Number.isFinite(x) ? x : d; };

/** Allows http(s), mailto, tel, anchors and relative paths. Blocks javascript:, data: and friends. */
export const safeHref = (u?: string, fallback = '#'): string => {
  const v = (u || '').trim();
  if (!v) return fallback;
  if (/^(https?:\/\/|mailto:|tel:|#|\/)/i.test(v)) return v;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return fallback;
  return v;
};

export const safeSrc = (u?: string): string => {
  const v = (u || '').trim();
  if (!v) return '';
  if (/^(https?:\/\/|\/|data:image\/(png|jpe?g|gif|webp|avif|svg\+xml);)/i.test(v)) return v;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return '';
  return v;
};

/** Converts YouTube / Vimeo page URLs into embeddable URLs. Returns '' for anything unsafe. */
export const toEmbedUrl = (raw?: string): string => {
  const u = (raw || '').trim();
  if (!u) return '';
  let m = u.match(/(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;
  return /^https:\/\//i.test(u) ? u : '';
};

export const luminance = (hex: string): number => {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex || '').trim());
  if (!m) return 0.5;
  let h = m[1];
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const readableOn = (bg: string) => (luminance(bg) > 0.5 ? '#0f172a' : '#ffffff');
export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48);

/* ── Style maps ─────────────────────────────────────────────── */
const RADIUS: Record<string, string> = { none: '0', md: '8px', xl: '16px', '3xl': '24px', full: '9999px' };
const SHADOW: Record<string, string> = { none: 'none', soft: '0 6px 18px rgba(0,0,0,.10)', heavy: '0 24px 48px rgba(0,0,0,.22)' };
const DIRS: Record<string, string> = { 'to-r': 'to right', 'to-b': 'to bottom', 'to-br': 'to bottom right', 'to-tr': 'to top right' };
const MAXW: Record<string, string> = { full: '100%', '7xl': '80rem', '5xl': '64rem', '4xl': '56rem', '3xl': '48rem', '2xl': '42rem' };
const ASPECT: Record<string, string> = { square: '1/1', video: '16/9', portrait: '3/4', wide: '21/9' };
const FILTERS: Record<string, string> = {
  grayscale: 'grayscale(100%)', blur: 'blur(4px)', sepia: 'sepia(80%)',
  vintage: 'sepia(40%) contrast(120%) saturate(110%) hue-rotate(-10deg)',
  warm: 'saturate(130%) contrast(105%) sepia(8%)', cool: 'hue-rotate(12deg) saturate(95%) brightness(105%)',
};
const GOOGLE_FONTS = ['Inter', 'Poppins', 'Space Grotesk', 'DM Sans', 'Syne', 'Playfair Display', 'Roboto'];
const TEXT_TAGS = ['h1', 'h2', 'h3', 'h4', 'p', 'blockquote'];
const cssSafe = (s: string) => s.replace(/[<>{};]/g, '');

const BASE_CSS = `
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;line-height:1.5;-webkit-font-smoothing:antialiased;overflow-x:hidden}
img,iframe{max-width:100%}img{display:block}a{color:inherit}
h1,h2,h3,h4,p,blockquote,ul,figure{margin:0}
.page{position:relative;overflow-x:clip}
.s{position:relative;padding-inline:clamp(1rem,5vw,4rem)}
.c{margin-inline:auto;width:100%}
.eyebrow{display:block;margin-bottom:.5rem;font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--brand)}
.head{max-width:44rem;margin-bottom:3rem}.head.center,.al-center .head{margin-inline:auto;text-align:center}
.h2{font-size:clamp(1.75rem,4vw,2.75rem);font-weight:900;letter-spacing:-.02em;line-height:1.1;margin-bottom:.75rem}
.lead{opacity:.72;line-height:1.7;max-width:42rem}.al-center .lead{margin-inline:auto}
.btn{display:inline-block;padding:.85rem 1.75rem;border:2px solid transparent;border-radius:var(--r);font-weight:700;font-size:.9rem;text-decoration:none;transition:transform .15s,opacity .15s}
.btn:hover{transform:translateY(-1px);opacity:.92}
.row{display:flex;flex-wrap:wrap;gap:.75rem}.al-center .row{justify-content:center}.al-right .row{justify-content:flex-end}
.grid{display:grid;gap:1.5rem}
.card{padding:1.5rem;border-radius:var(--r);border:1px solid rgba(128,128,128,.25);border:1px solid color-mix(in srgb,currentColor 14%,transparent);background:color-mix(in srgb,currentColor 4%,transparent);box-shadow:var(--sh)}
.nav{position:sticky;top:0;z-index:50;backdrop-filter:saturate(1.4) blur(10px)}
.nav .c{display:flex;align-items:center;justify-content:space-between;gap:1rem}
.brand{font-weight:900;font-size:1.25rem;color:var(--brand);text-decoration:none;letter-spacing:-.02em}
.links{display:flex;gap:1.75rem;font-size:.85rem;font-weight:600}.links a{text-decoration:none;opacity:.8}.links a:hover{opacity:1}
.nav .btn{padding:.55rem 1.1rem;font-size:.8rem}
.menu{display:none;position:relative}.menu summary{list-style:none;cursor:pointer;font-size:1.5rem;line-height:1;padding:.25rem .5rem}.menu summary::-webkit-details-marker{display:none}
.drop{position:absolute;right:0;top:calc(100% + .5rem);min-width:13rem;display:flex;flex-direction:column;gap:.5rem;padding:.9rem;border-radius:12px;background:var(--navbg);border:1px solid rgba(128,128,128,.3);box-shadow:0 12px 32px rgba(0,0,0,.18)}
.drop a{text-decoration:none;font-weight:600;font-size:.9rem}
.two{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center}
.hero-title{font-size:clamp(2.25rem,5vw,3.75rem);font-weight:900;line-height:1.05;letter-spacing:-.03em;margin-bottom:1.25rem}
.pill{display:inline-block;padding:.3rem .8rem;margin-bottom:1.25rem;border-radius:9999px;font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--brand);background:rgba(128,128,255,.14);background:color-mix(in srgb,var(--brand) 14%,transparent)}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:2rem;text-align:center}
.stat b{display:block;font-size:clamp(2rem,5vw,3.25rem);font-weight:900;letter-spacing:-.03em;color:var(--brand)}
.stat span{font-size:.75rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;opacity:.6}
.cols{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}.cols-2{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.ico{display:grid;place-items:center;width:2.5rem;height:2.5rem;margin-bottom:1rem;border-radius:.65rem;color:var(--brand);background:rgba(128,128,255,.14);background:color-mix(in srgb,var(--brand) 14%,transparent);font-size:1.1rem}
.card h3{font-weight:800;font-size:.95rem;margin-bottom:.5rem}.card p{font-size:.85rem;opacity:.78;line-height:1.65}
.stars{color:#fbbf24;letter-spacing:.1em;margin-bottom:.75rem}
.who{display:flex;align-items:center;gap:.75rem;margin-top:1.25rem;padding-top:1.25rem;border-top:1px solid rgba(128,128,128,.2)}
.who img,.avatar{width:2.5rem;height:2.5rem;border-radius:50%;object-fit:cover;flex-shrink:0}
.who b{display:block;font-size:.8rem}.who small{opacity:.6;font-size:.7rem}
.avatar{width:4rem;height:4rem;display:grid;place-items:center;margin:0 auto 1rem;color:#fff;background:var(--brand);font-weight:800;font-size:1.25rem}
.plans{grid-template-columns:repeat(auto-fit,minmax(250px,1fr));max-width:64rem;margin-inline:auto}
.plan{position:relative}.plan.pop{border:2px solid var(--brand)}
.badge{position:absolute;top:-.8rem;left:50%;transform:translateX(-50%);padding:.2rem .8rem;border-radius:9999px;background:var(--brand);color:#fff;font-size:.65rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}
.price{font-size:2.75rem;font-weight:900;letter-spacing:-.03em}.price small{font-size:.8rem;opacity:.5;font-weight:500}
.plan ul{list-style:none;padding:0;margin:1.25rem 0 1.5rem;font-size:.85rem}.plan li{display:flex;gap:.5rem;padding:.4rem 0}.plan li::before{content:"\\2713";color:var(--brand);font-weight:800}
.plan .btn{display:block;text-align:center}
details.q{padding:1rem 1.25rem;margin-bottom:.75rem;border-radius:var(--r);border:1px solid rgba(128,128,128,.25);border:1px solid color-mix(in srgb,currentColor 14%,transparent)}
details.q summary{display:flex;justify-content:space-between;gap:1rem;list-style:none;cursor:pointer;font-weight:700}
details.q summary::-webkit-details-marker{display:none}details.q .plus{transition:transform .2s;opacity:.5}details.q[open] .plus{transform:rotate(45deg)}
details.q p{margin-top:.8rem;font-size:.9rem;opacity:.75;line-height:1.7}
.logos{display:flex;flex-wrap:wrap;gap:2rem 3rem;align-items:center;justify-content:center;opacity:.55;filter:grayscale(1)}.logos img{height:1.75rem;width:auto;object-fit:contain}
.kicker{margin-bottom:2rem;font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.5}
.f{max-width:32rem;margin-inline:auto;text-align:left}.f label{display:block;margin:.9rem 0 .35rem;font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:.6}
.f input,.f textarea{width:100%;padding:.65rem .85rem;border-radius:.6rem;border:1px solid rgba(128,128,128,.35);background:rgba(128,128,128,.08);color:inherit;font:inherit}
.f input:focus,.f textarea:focus{outline:2px solid var(--brand);outline-offset:1px}
.f .btn{width:100%;margin-top:1.25rem;border:0;cursor:pointer;font-family:inherit}
.ok{margin-top:1rem;text-align:center;font-weight:700;color:var(--brand)}
.video{position:relative;aspect-ratio:16/9;overflow:hidden;border-radius:var(--r);border:1px solid rgba(128,128,128,.25)}.video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.foot{display:flex;flex-wrap:wrap;gap:1rem;align-items:center;justify-content:space-between;font-size:.85rem}.foot .links{gap:1.25rem;opacity:.7}
@media(max-width:768px){.two{grid-template-columns:1fr}.links,.nav .btn.cta{display:none}.menu{display:block}.head{margin-bottom:2rem}}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}`;

const OVERLAY_JS = `(function(){var l=document.getElementById('landy-layers');if(!l)return;var w=+l.dataset.w;function f(){var v=document.documentElement.clientWidth,s=Math.min(1,v/w),o=Math.max(0,(v-w)/2);l.style.transform='translateX('+o+'px) scale('+s+')'}f();addEventListener('resize',f)})();`;

/* ── Builders ───────────────────────────────────────────────── */
function sectionStyle(b: Block, p: ProjectState): string {
  const s = b.styles;
  const bg = s.useGradient
    ? `background:linear-gradient(${DIRS[s.gradientDirection || 'to-r']},${s.gradientFrom || '#4f46e5'},${s.gradientTo || '#7c3aed'});`
    : `background:${s.bgColor};`;
  const border = s.borderWidth ? `border:${num(s.borderWidth)}px ${s.borderStyle && s.borderStyle !== 'none' ? s.borderStyle : 'solid'} ${s.borderColor || '#e2e8f0'};` : '';
  return `${bg}${border}color:${s.textColor};font-family:${s.fontFamily || p.style.fontFamily};padding-block:${num(s.paddingTop)}px ${num(s.paddingBottom)}px;--brand:${s.brandColor};--navbg:${s.bgColor};--r:${RADIUS[s.borderRadius] || '16px'};--sh:${SHADOW[s.shadow] || 'none'};`;
}

function renderBlock(b: Block, p: ProjectState, anchor: string): string {
  const c = b.content;
  const brand = b.styles.brandColor;
  const wrap = (tag: string, inner: string, cls = '') =>
    `<${tag} id="${esc(anchor)}" class="s al-${esc(b.styles.align)} ${cls}" style="${esc(sectionStyle(b, p))}"><div class="c" style="max-width:${MAXW[b.styles.maxWidth || '7xl']}">${inner}</div></${tag}>`;
  const head = (center = false, desc = true) =>
    `<div class="head${center ? ' center' : ''}">${c.subtitle ? `<span class="eyebrow">${esc(c.subtitle)}</span>` : ''}${c.title ? `<h2 class="h2">${esc(c.title)}</h2>` : ''}${desc && c.description ? `<p class="lead">${esc(c.description)}</p>` : ''}</div>`;
  const button = (text?: string, url?: string, style = 'filled', extra = '') => {
    if (!text) return '';
    const st = style === 'outline' ? 'border-color:var(--brand);color:var(--brand)' : style === 'ghost' ? 'color:var(--brand)' : `background:var(--brand);color:${readableOn(brand)}`;
    return `<a class="btn${extra}" href="${esc(safeHref(url))}" style="${esc(st)}">${esc(text)}${style === 'ghost' ? ' →' : ''}</a>`;
  };

  switch (b.type) {
    case 'navbar': {
      const links = (c.links || []).map(l => `<a href="${esc(safeHref(l.url))}">${esc(l.label)}</a>`).join('');
      const cta = button(c.primaryBtnText, c.primaryBtnUrl, 'filled', ' cta');
      return `<header id="${esc(anchor)}" class="s nav" style="${esc(sectionStyle(b, p))}"><div class="c" style="max-width:${MAXW[b.styles.maxWidth || '7xl']}"><a class="brand" href="#top">${esc(c.brandName || 'Brand')}</a><nav class="links" aria-label="Primary">${links}</nav>${cta}<details class="menu"><summary aria-label="Open menu">☰</summary><div class="drop">${links}${button(c.primaryBtnText, c.primaryBtnUrl, 'filled')}</div></details></div></header>`;
    }
    case 'hero_section': {
      const img = safeSrc(c.imageUrl);
      return wrap('section', `<div class="${img ? 'two' : ''}"><div>${c.subtitle ? `<span class="pill">${esc(c.subtitle)}</span>` : ''}<h1 class="hero-title">${esc(c.title)}</h1><p class="lead">${esc(c.description)}</p><div class="row" style="margin-top:2rem">${button(c.primaryBtnText, c.primaryBtnUrl, c.primaryBtnStyle || 'filled')}${button(c.secondaryBtnText, c.secondaryBtnUrl, c.secondaryBtnStyle || 'outline')}</div></div>${img ? `<img src="${esc(img)}" alt="${esc(c.imageAlt)}" style="width:100%;max-height:480px;object-fit:cover;border-radius:var(--r);box-shadow:var(--sh)">` : ''}</div>`);
    }
    case 'text_block': {
      const tag = TEXT_TAGS.includes(c.textTag || '') ? (c.textTag as string) : 'p';
      const quote = tag === 'blockquote' ? `border-left:4px solid ${brand};padding-left:1.5rem;font-style:italic;opacity:.85;` : '';
      const st = `font-size:${num(c.textFontSize, 16)}px;font-weight:${esc(c.textFontWeight || '400')};line-height:${num(c.textLineHeight, 1.8)};letter-spacing:${num(c.textLetterSpacing) / 100}em;text-decoration:${esc(c.textDecoration || 'none')};text-transform:${esc(c.textTransform || 'none')};white-space:pre-wrap;${quote}`;
      return wrap('section', `<${tag} style="${esc(st)}">${esc(c.textContent)}</${tag}>`);
    }
    case 'stats_block':
      return wrap('section', `${head(true, false)}<div class="stats">${(c.stats || []).map(s => `<div class="stat"><b>${esc(s.prefix)}${esc(s.value)}${esc(s.suffix)}</b><span>${esc(s.label)}</span></div>`).join('')}</div>`);
    case 'logo_bar':
      return wrap('section', `${c.logoBarTitle ? `<p class="kicker" style="text-align:center">${esc(c.logoBarTitle)}</p>` : ''}<div class="logos">${(c.logos || []).filter(l => safeSrc(l.logoUrl)).map(l => `<img src="${esc(safeSrc(l.logoUrl))}" alt="${esc(l.name)}" loading="lazy">`).join('')}</div>`);
    case 'features_grid':
      return wrap('section', `${head()}<div class="grid cols">${(c.features || []).map(f => `<div class="card"><div class="ico" aria-hidden="true">✦</div><h3>${esc(f.title)}</h3><p>${esc(f.description)}</p></div>`).join('')}</div>`);
    case 'testimonials':
      return wrap('section', `${head(true, false)}<div class="grid cols-2">${(c.testimonials || []).map(t => `<figure class="card"><div class="stars" aria-hidden="true">★★★★★</div><blockquote style="font-style:italic;line-height:1.7;opacity:.9">“${esc(t.quote)}”</blockquote><figcaption class="who">${safeSrc(t.avatarUrl) ? `<img src="${esc(safeSrc(t.avatarUrl))}" alt="${esc(t.author)}" loading="lazy">` : `<span class="avatar" style="margin:0;width:2.5rem;height:2.5rem;font-size:.9rem">${esc((t.author || '?')[0])}</span>`}<div><b>${esc(t.author)}</b><small>${esc(t.role)}</small></div></figcaption></figure>`).join('')}</div>`);
    case 'pricing_cards':
      return wrap('section', `${head(true)}<div class="grid plans">${(c.pricingPlans || []).map(pl => `<div class="card plan${pl.popular ? ' pop' : ''}">${pl.popular ? '<span class="badge">Most popular</span>' : ''}<div style="font-size:.65rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;opacity:.55;margin-bottom:.5rem">${esc(pl.name)}</div><div class="price">${esc(pl.price)}<small> /${esc(pl.period)}</small></div><ul>${(pl.features || []).map(f => `<li>${esc(f)}</li>`).join('')}</ul><a class="btn" href="#contact" style="${esc(pl.popular ? `background:var(--brand);color:${readableOn(brand)}` : 'border-color:var(--brand);color:var(--brand)')}">${esc(pl.btnText)}</a></div>`).join('')}</div>`);
    case 'faq_block':
      return wrap('section', `${head(true, false)}<div style="max-width:44rem;margin-inline:auto">${(c.faqs || []).map(f => `<details class="q"><summary>${esc(f.question)}<span class="plus" aria-hidden="true">+</span></summary><p>${esc(f.answer)}</p></details>`).join('')}</div>`);
    case 'team_block':
      return wrap('section', `${head()}<div class="grid cols">${(c.team || []).map(m => `<div class="card" style="text-align:center">${safeSrc(m.avatarUrl) ? `<img class="avatar" src="${esc(safeSrc(m.avatarUrl))}" alt="${esc(m.name)}" loading="lazy">` : `<span class="avatar">${esc((m.name || '?')[0])}</span>`}<h3>${esc(m.name)}</h3><div style="font-size:.75rem;font-weight:700;color:var(--brand);margin-bottom:.75rem">${esc(m.role)}</div><p>${esc(m.bio)}</p></div>`).join('')}</div>`);
    case 'contact_form': {
      const target = /^[^\s@"<>]+@[^\s@"<>]+\.[^\s@"<>]+$/.test((c.formEmailTarget || '').trim()) ? (c.formEmailTarget || '').trim() : '';
      const fields = (c.formFields || []).map((f, i) => {
        const name = `field_${i}_${slugify(f.label) || 'x'}`;
        const ctl = f.type === 'textarea' ? `<textarea name="${name}" rows="4" placeholder="${esc(f.placeholder)}"></textarea>` : `<input name="${name}" type="${['text', 'email', 'tel'].includes(f.type) ? f.type : 'text'}" placeholder="${esc(f.placeholder)}">`;
        return `<label for="${name}">${esc(f.label)}</label>${ctl.replace('name=', `id="${name}" name=`)}`;
      }).join('');
      const form = target
        ? `<form class="f" action="https://formsubmit.co/${esc(target)}" method="POST">${fields}<input type="hidden" name="_subject" value="New message from ${esc(p.name)}"><button class="btn" type="submit" style="background:var(--brand);color:${readableOn(brand)}">${esc(c.formBtnText || 'Send message')}</button></form>`
        : `<form class="f" onsubmit="event.preventDefault();this.querySelector('.ok').hidden=false">${fields}<button class="btn" type="submit" style="background:var(--brand);color:${readableOn(brand)}">${esc(c.formBtnText || 'Send message')}</button><p class="ok" hidden>Thanks! (Demo form — set a delivery email in Landy to receive messages.)</p></form>`;
      return wrap('section', `<div class="head center">${c.title ? `<h2 class="h2">${esc(c.title)}</h2>` : ''}${c.description ? `<p class="lead">${esc(c.description)}</p>` : ''}</div>${form}`);
    }
    case 'cta_block': {
      const txt = luminance(brand) < 0.55 ? brand : b.styles.bgColor;
      return wrap('section', `<h2 class="h2" style="font-size:clamp(2rem,5vw,3.25rem);letter-spacing:-.03em">${esc(c.title)}</h2><p class="lead" style="opacity:.88;margin-bottom:2rem">${esc(c.description)}</p><div class="row">${c.primaryBtnText ? `<a class="btn" href="${esc(safeHref(c.primaryBtnUrl))}" style="background:#fff;color:${esc(txt)};box-shadow:0 6px 18px rgba(0,0,0,.2)">${esc(c.primaryBtnText)}</a>` : ''}${c.secondaryBtnText ? `<a class="btn" href="${esc(safeHref(c.secondaryBtnUrl))}" style="border-color:rgba(255,255,255,.4);color:inherit">${esc(c.secondaryBtnText)}</a>` : ''}</div>`, 'cta');
    }
    case 'image_block': {
      const src = safeSrc(c.imageUrl);
      if (!src) return '';
      const st = `width:100%;max-height:560px;object-fit:${esc(c.imageFit || 'cover')};border-radius:var(--r);box-shadow:var(--sh);${ASPECT[c.imageAspectRatio || ''] ? `aspect-ratio:${ASPECT[c.imageAspectRatio || '']};` : ''}${FILTERS[c.imageFilter || ''] ? `filter:${FILTERS[c.imageFilter || '']};` : ''}${num(c.imageBorderWidth) ? `border:${num(c.imageBorderWidth)}px solid ${c.imageBorderColor || '#e2e8f0'};` : ''}`;
      return wrap('section', `<figure><img src="${esc(src)}" alt="${esc(c.imageAlt)}" style="${esc(st)}" loading="lazy">${c.description ? `<figcaption style="margin-top:.8rem;font-size:.8rem;opacity:.55;font-style:italic;text-align:center">${esc(c.description)}</figcaption>` : ''}</figure>`);
    }
    case 'video_embed': {
      const src = toEmbedUrl(c.videoUrl);
      return wrap('section', `${c.title ? `<h3 style="font-weight:900;font-size:1.5rem;margin-bottom:.5rem;text-align:center">${esc(c.title)}</h3>` : ''}${c.description ? `<p class="lead" style="margin:0 auto 1.5rem;text-align:center">${esc(c.description)}</p>` : ''}${src ? `<div class="video"><iframe src="${esc(src)}" title="${esc(c.title || 'Video')}" loading="lazy" allow="accelerometer;autoplay;clipboard-write;encrypted-media;picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>` : ''}`);
    }
    case 'divider':
      return `<div class="s" style="${esc(sectionStyle(b, p))}"><hr style="border:0;border-top:1px ${esc(c.dividerStyle || 'solid')} currentColor;opacity:.2;margin:0"></div>`;
    case 'spacer':
      return `<div aria-hidden="true" style="background:${esc(b.styles.bgColor)};height:${num(c.spacerHeight, 48)}px"></div>`;
    case 'footer':
      return `<footer id="${esc(anchor)}" class="s" style="${esc(sectionStyle(b, p))}"><div class="c foot" style="max-width:${MAXW[b.styles.maxWidth || '7xl']}"><strong style="font-size:1.05rem;color:var(--brand)">${esc(c.brandName)}</strong><span style="opacity:.55">${esc(c.copyright)}</span><nav class="links" aria-label="Footer">${(c.links || []).map(l => `<a href="${esc(safeHref(l.url))}">${esc(l.label)}</a>`).join('')}</nav></div></footer>`;
    default:
      return '';
  }
}

function renderElement(e: CanvasElement): string {
  if (e.hidden) return '';
  const base = `position:absolute;left:${num(e.x)}px;top:${num(e.y)}px;width:${num(e.width)}px;height:${num(e.height)}px;opacity:${num(e.opacity, 1)};${e.rotation ? `transform:rotate(${num(e.rotation)}deg);` : ''}`;
  const stroke = e.strokeWidth ? `border:${num(e.strokeWidth)}px solid ${e.stroke || '#000'};` : '';
  const font = `font-size:${num(e.fontSize, 16)}px;font-weight:${num(e.fontWeight, 400)};${e.fontFamily ? `font-family:${cssSafe(e.fontFamily)};` : ''}`;
  switch (e.type) {
    case 'text':
      return `<div style="${esc(`${base}${font}color:${e.color || 'inherit'};text-align:${e.align || 'left'};white-space:pre-wrap;line-height:1.3;`)}">${esc(e.content)}</div>`;
    case 'button':
      return `<a href="${esc(safeHref(e.url))}" style="${esc(`${base}${font}display:flex;align-items:center;justify-content:center;background:${e.fill || '#4f46e5'};color:${e.color || '#fff'};border-radius:${num(e.radius, 8)}px;text-decoration:none;${stroke}`)}">${esc(e.content)}</a>`;
    case 'image': {
      const src = safeSrc(e.url);
      return src ? `<img src="${esc(src)}" alt="${esc(e.name)}" loading="lazy" style="${esc(`${base}object-fit:cover;border-radius:${num(e.radius)}px;${stroke}`)}">` : '';
    }
    case 'container':
      return `<div style="${esc(`${base}background:${e.fill || 'transparent'};border-radius:${num(e.radius)}px;${stroke}`)}"></div>`;
    default:
      return `<div style="${esc(`${base}background:${e.fill || '#18a0fb'};border-radius:${e.shape === 'ellipse' ? '50%' : `${num(e.radius)}px`};${stroke}`)}"></div>`;
  }
}

export interface PageParts { css: string; body: string; fontsHref: string; hasLayers: boolean; title: string; description: string; favicon: string; }

export function buildParts(p: ProjectState): PageParts {
  const used = new Set<string>();
  const anchorMap: Record<string, string> = { features_grid: 'features', pricing_cards: 'pricing', team_block: 'about', contact_form: 'contact', testimonials: 'testimonials', faq_block: 'faq', hero_section: 'top' };
  const anchorFor = (b: Block) => {
    const a = anchorMap[b.type];
    if (a && !used.has(a)) { used.add(a); return a; }
    return b.id.replace(/[^a-zA-Z0-9_-]/g, '');
  };
  const blocks = p.blocks.filter(b => !b.hidden);
  const blocksHtml = blocks.map(b => renderBlock(b, p, anchorFor(b))).join('\n');
  const layers = (p.elements || []).map(renderElement).filter(Boolean);
  const body = `${blocksHtml}${layers.length ? `\n<div id="landy-layers" data-w="${DESIGN_WIDTH}" style="position:absolute;top:0;left:0;width:${DESIGN_WIDTH}px;height:0;transform-origin:0 0;z-index:5">${layers.join('')}</div>` : ''}`;

  const families = new Set<string>();
  const collect = (ff?: string) => { const n = (ff || '').split(',')[0].replace(/['"]/g, '').trim(); if (GOOGLE_FONTS.includes(n)) families.add(n); };
  collect(p.style.fontFamily); p.blocks.forEach(b => collect(b.styles.fontFamily)); (p.elements || []).forEach(e => collect(e.fontFamily));
  const fontsHref = families.size ? `https://fonts.googleapis.com/css2?${[...families].map(f => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700;800;900`).join('&')}&display=swap` : '';

  const hero = blocks.find(b => b.type === 'hero_section');
  const brand = (hero || blocks[0])?.styles.brandColor || '#4f46e5';
  const initial = (p.name.trim()[0] || 'L').toUpperCase();
  const favicon = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${esc(brand)}"/><text x="16" y="23" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#fff" text-anchor="middle">${esc(initial)}</text></svg>`)}`;
  const css = `body{font-family:${cssSafe(p.style.fontFamily)};background:${cssSafe(p.style.background)};color:#0f172a}${BASE_CSS}`;
  return { css, body, fontsHref, hasLayers: layers.length > 0, title: p.name || 'Landing page', description: (hero?.content.description || '').slice(0, 160), favicon };
}

export function generateHtml(p: ProjectState): string {
  const x = buildParts(p);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(x.title)}</title>
<meta name="description" content="${esc(x.description)}">
<meta property="og:title" content="${esc(x.title)}">
<meta property="og:description" content="${esc(x.description)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="${esc(p.style.background)}">
<link rel="icon" href="${x.favicon}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${x.fontsHref ? `<link rel="stylesheet" href="${esc(x.fontsHref)}">` : ''}
<style>${x.css}</style>
</head>
<body>
<div class="page">
${x.body}
</div>
${x.hasLayers ? `<script>${OVERLAY_JS}</script>` : ''}
</body>
</html>`;
}

export function generateReact(p: ProjectState): string {
  const x = buildParts(p);
  return `// ${x.title} — generated by Landy.
// Renders the exported markup inside a React component. Drop it into any React app.
import { useEffect } from 'react';

const CSS = ${JSON.stringify(x.css)};
const HTML = ${JSON.stringify(x.body)};
${x.fontsHref ? `const FONTS_HREF = ${JSON.stringify(x.fontsHref)};\n` : ''}
export default function LandingPage() {
  useEffect(() => {
    document.title = ${JSON.stringify(x.title)};
${x.fontsHref ? `    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONTS_HREF;
    document.head.appendChild(link);
` : ''}${x.hasLayers ? `    const layers = document.getElementById('landy-layers');
    const fit = () => {
      if (!layers) return;
      const w = Number(layers.dataset.w);
      const v = document.documentElement.clientWidth;
      layers.style.transform = 'translateX(' + Math.max(0, (v - w) / 2) + 'px) scale(' + Math.min(1, v / w) + ')';
    };
    fit();
    window.addEventListener('resize', fit);
` : ''}    return () => {
${x.fontsHref ? '      link.remove();\n' : ''}${x.hasLayers ? "      window.removeEventListener('resize', fit);\n" : ''}    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="page" dangerouslySetInnerHTML={{ __html: HTML }} />
    </>
  );
}
`;
}
