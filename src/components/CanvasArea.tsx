import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowDown, ArrowUp, Check, ChevronDown, ChevronUp, Copy, GripVertical, Maximize, Minus, Plus, Sparkles, Star, Trash2,
} from 'lucide-react';
import {
  Block, BlockType, CanvasElement, DESIGN_WIDTH, ProjectState, SelectionState, ToolMode, VIEWPORT_LABEL, VIEWPORT_WIDTH, ViewportMode,
} from '../types';
import ElementLayer from './ElementLayer';
import { luminance, safeSrc, toEmbedUrl } from '../utils/exportHtml';

interface Props {
  project: ProjectState;
  viewport: ViewportMode;
  zoom: number;
  setZoom: (z: number) => void;
  fitTick: number;
  tool: ToolMode;
  selection: SelectionState;
  setSelection: (s: SelectionState) => void;
  onUpdateBlock: (id: string, patch: Partial<Block>) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onMoveBlock: (id: string, dir: 'up' | 'down') => void;
  onReorderBlocks: (blocks: Block[]) => void;
  onAddBlock: (t: BlockType) => void;
  onUpdateElement: (id: string, patch: Partial<CanvasElement>) => void;
  onCreateElement: (spec: { tool: ToolMode; x: number; y: number; width: number; height: number }) => void;
  isPreviewMode: boolean;
}

const RADIUS_CLS: Record<string, string> = { none: 'rounded-none', md: 'rounded-lg', xl: 'rounded-2xl', '3xl': 'rounded-3xl', full: 'rounded-full' };
const MAXW_CLS: Record<string, string> = { full: 'max-w-full', '7xl': 'max-w-7xl', '5xl': 'max-w-5xl', '4xl': 'max-w-4xl', '3xl': 'max-w-3xl', '2xl': 'max-w-2xl' };
const FILTERS: Record<string, string> = {
  grayscale: 'grayscale(100%)', blur: 'blur(4px)', sepia: 'sepia(80%)',
  vintage: 'sepia(40%) contrast(120%) saturate(110%) hue-rotate(-10deg)',
  warm: 'saturate(130%) contrast(105%) sepia(8%)', cool: 'hue-rotate(12deg) saturate(95%) brightness(105%)',
};
const ASPECT: Record<string, string> = { square: '1 / 1', video: '16 / 9', portrait: '3 / 4', wide: '21 / 9' };
const DIRS: Record<string, string> = { 'to-r': 'to right', 'to-b': 'to bottom', 'to-br': 'to bottom right', 'to-tr': 'to top right' };
const DRAW_TOOLS: ToolMode[] = ['text', 'rect', 'ellipse'];
const MIN_HEIGHT: Record<ViewportMode, number> = { desktop: 700, laptop: 640, tablet: 1024, mobile: 760 };

const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return !!el && (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable);
};

export default function CanvasArea(props: Props) {
  const {
    project, viewport, zoom, setZoom, fitTick, tool, selection, setSelection,
    onUpdateBlock, onDeleteBlock, onDuplicateBlock, onMoveBlock, onReorderBlocks, onAddBlock,
    onUpdateElement, onCreateElement, isPreviewMode,
  } = props;

  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [pan, setPan] = useState({ x: 120, y: 80 });
  const [space, setSpace] = useState(false);
  const [panning, setPanning] = useState(false);
  const [draw, setDraw] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [previewW, setPreviewW] = useState(1200);
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({});
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  const [armedId, setArmedId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [overPos, setOverPos] = useState<'top' | 'bottom'>('top');

  const zoomRef = useRef(zoom); zoomRef.current = zoom;
  const panRef = useRef(pan); panRef.current = pan;
  const prevZoom = useRef(zoom);
  const anchor = useRef<{ x: number; y: number } | null>(null);
  const skipAdjust = useRef(false);
  const justPanned = useRef(false);

  const z = zoom / 100;
  const frameW = VIEWPORT_WIDTH[viewport];
  const isDevice = viewport === 'mobile' || viewport === 'tablet';
  const inv = Math.min(2.5, 1 / Math.max(z, 0.05));

  /* ── Fit to screen ─────────────────────────────────────── */
  const fit = useCallback(() => {
    const wrap = wrapRef.current, frame = frameRef.current;
    if (!wrap || !frame) return;
    const padX = window.innerWidth >= 768 ? 270 : 16;
    const availW = Math.max(200, wrap.clientWidth - padX * 2 - 24);
    const availH = Math.max(200, wrap.clientHeight - 130);
    const fw = frame.offsetWidth, fh = frame.offsetHeight;
    const byHeight = isDevice ? availH / fh : Infinity;
    const next = Math.max(0.25, Math.min(1, availW / fw, byHeight));
    const rounded = Math.round(next * 100) / 100;
    skipAdjust.current = true;
    setZoom(Math.round(rounded * 100));
    setPan({ x: (wrap.clientWidth - fw * rounded) / 2, y: 70 });
  }, [isDevice, setZoom]);

  useEffect(() => {
    if (isPreviewMode) return;
    const t = setTimeout(fit, 60);
    return () => clearTimeout(t);
  }, [viewport, fitTick, isPreviewMode]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Keep the viewport anchor fixed while zooming (cursor for wheel, centre for buttons) */
  useLayoutEffect(() => {
    const prev = prevZoom.current;
    if (prev === zoom) return;
    prevZoom.current = zoom;
    if (skipAdjust.current) { skipAdjust.current = false; anchor.current = null; return; }
    const wrap = wrapRef.current;
    const a = anchor.current || { x: (wrap?.clientWidth || 0) / 2, y: (wrap?.clientHeight || 0) / 2 };
    const k = zoom / prev;
    setPan(p => ({ x: a.x - (a.x - p.x) * k, y: a.y - (a.y - p.y) * k }));
    anchor.current = null;
  }, [zoom]);

  /* Wheel: pan, Ctrl/⌘+wheel: zoom toward the cursor */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || isPreviewMode) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const r = el.getBoundingClientRect();
        anchor.current = { x: e.clientX - r.left, y: e.clientY - r.top };
        const next = Math.min(400, Math.max(10, Math.round(zoomRef.current * Math.exp(-e.deltaY * 0.0025))));
        if (next !== zoomRef.current) setZoom(next);
      } else {
        setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isPreviewMode, setZoom]);

  /* Hold Space for a temporary hand tool */
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.code === 'Space' && !isTyping(e.target)) { e.preventDefault(); setSpace(true); } };
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') setSpace(false); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  /* Dimension badge for the selected section */
  useEffect(() => {
    if (!selection.blockId || isPreviewMode) { setDims(null); return; }
    const el = document.getElementById(`cb-${selection.blockId}`);
    if (!el) { setDims(null); return; }
    const measure = () => setDims({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [selection.blockId, isPreviewMode, project.blocks, viewport]);

  /* Preview width (for scaling free-form layers) */
  useEffect(() => {
    const el = previewRef.current;
    if (!el || !isPreviewMode) return;
    const ro = new ResizeObserver(() => setPreviewW(el.clientWidth));
    ro.observe(el);
    setPreviewW(el.clientWidth);
    return () => ro.disconnect();
  }, [isPreviewMode, viewport]);

  /* ── Pointer handling ──────────────────────────────────── */
  const handMode = tool === 'hand' || space;

  const onPointerDown = (e: React.PointerEvent) => {
    if (!(handMode && e.button === 0) && e.button !== 1) return;
    e.preventDefault();
    const start = { x: e.clientX, y: e.clientY, px: panRef.current.x, py: panRef.current.y };
    setPanning(true);
    justPanned.current = false;
    const move = (ev: PointerEvent) => {
      if (Math.abs(ev.clientX - start.x) + Math.abs(ev.clientY - start.y) > 3) justPanned.current = true;
      setPan({ x: start.px + ev.clientX - start.x, y: start.py + ev.clientY - start.y });
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); setPanning(false); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const toContent = (cx: number, cy: number) => {
    const r = contentRef.current!.getBoundingClientRect();
    const k = zoomRef.current / 100;
    return { x: (cx - r.left) / k, y: (cy - r.top) / k };
  };

  const onContentPointerDownCapture = (e: React.PointerEvent) => {
    if (!DRAW_TOOLS.includes(tool) || space || e.button !== 0 || !contentRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const s = toContent(e.clientX, e.clientY);
    setDraw({ x: s.x, y: s.y, w: 0, h: 0 });
    const move = (ev: PointerEvent) => {
      const c = toContent(ev.clientX, ev.clientY);
      setDraw({ x: Math.min(s.x, c.x), y: Math.min(s.y, c.y), w: Math.abs(c.x - s.x), h: Math.abs(c.y - s.y) });
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      const c = toContent(ev.clientX, ev.clientY);
      const w = Math.abs(c.x - s.x), h = Math.abs(c.y - s.y);
      const click = w < 6 && h < 6;
      const def = tool === 'text' ? { w: 240, h: 48 } : { w: 160, h: 120 };
      onCreateElement({
        tool,
        x: click ? s.x : Math.min(s.x, c.x), y: click ? s.y : Math.min(s.y, c.y),
        width: click ? def.w : w, height: click ? def.h : h,
      });
      setDraw(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const clearSelection = () => setSelection({ blockId: null, elementId: null });

  /* ── Block rendering helpers ───────────────────────────── */
  const themeSection = (b: Block): React.CSSProperties => {
    const s = b.styles;
    const base: React.CSSProperties = { color: s.textColor, fontFamily: s.fontFamily || project.style.fontFamily };
    if (s.useGradient) base.background = `linear-gradient(${DIRS[s.gradientDirection || 'to-r']}, ${s.gradientFrom || '#4f46e5'}, ${s.gradientTo || '#7c3aed'})`;
    else base.backgroundColor = s.bgColor;
    if (s.borderWidth && s.borderWidth > 0) { base.borderWidth = s.borderWidth; base.borderStyle = s.borderStyle && s.borderStyle !== 'none' ? s.borderStyle : 'solid'; base.borderColor = s.borderColor || '#e2e8f0'; }
    if (project.style.theme === 'neo_brutalist') return { ...base, borderBottom: '3px solid #000' };
    if (project.style.theme === 'glassmorphism') return { ...base, backdropFilter: 'blur(16px)' };
    return base;
  };

  const card = (b: Block, extraStyle: React.CSSProperties = {}, extraCls = ''): { className: string; style: React.CSSProperties } => {
    const r = RADIUS_CLS[b.styles.borderRadius] || 'rounded-2xl';
    const theme = project.style.theme;
    if (theme === 'neo_brutalist') return { className: `p-6 bg-white text-slate-950 border-2 border-black shadow-[4px_4px_0_0_#000] rounded-none ${extraCls}`, style: extraStyle };
    return {
      className: `p-6 border transition-all ${r} ${theme === 'glassmorphism' ? 'backdrop-blur-md shadow-xl' : ''} ${extraCls}`,
      style: { background: 'color-mix(in srgb, currentColor 5%, transparent)', borderColor: 'color-mix(in srgb, currentColor 14%, transparent)', ...extraStyle },
    };
  };

  const edit = (b: Block, field: string, multiline = false) => {
    if (isPreviewMode) return {};
    return {
      contentEditable: true as const,
      suppressContentEditableWarning: true,
      onBlur: (e: React.FocusEvent<HTMLElement>) => {
        const v = e.currentTarget.innerText.replace(/\n+$/, '');
        if (v !== ((b.content as Record<string, unknown>)[field] ?? '')) onUpdateBlock(b.id, { content: { [field]: v } as Block['content'] });
      },
      onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
        e.stopPropagation();
        if (e.key === 'Escape' || (e.key === 'Enter' && !multiline)) { e.preventDefault(); e.currentTarget.blur(); }
      },
    };
  };

  const button = (text: string, style: string, brand: string, r: string, onDark = false) => {
    const on = luminance(brand) > 0.55 ? '#0f172a' : '#fff';
    if (style === 'outline') return <span className={`inline-block border-2 px-6 py-3 text-xs font-bold ${r}`} style={{ borderColor: onDark ? 'rgba(255,255,255,.45)' : brand, color: onDark ? 'inherit' : brand }}>{text}</span>;
    if (style === 'ghost') return <span className={`inline-block px-4 py-3 text-xs font-bold ${r}`} style={{ color: brand }}>{text} →</span>;
    return <span className={`inline-block px-6 py-3 text-xs font-bold shadow-md ${r}`} style={{ background: brand, color: on }}>{text}</span>;
  };

  const renderBlock = (b: Block) => {
    const { brandColor: brand, textColor: text } = b.styles;
    const r = RADIUS_CLS[b.styles.borderRadius] || 'rounded-2xl';
    const mw = MAXW_CLS[b.styles.maxWidth || '7xl'];
    const align = b.styles.align === 'center' ? 'text-center' : b.styles.align === 'right' ? 'text-right' : 'text-left';
    const flex = b.styles.align === 'center' ? 'justify-center' : b.styles.align === 'right' ? 'justify-end' : 'justify-start';
    const c = b.content;

    const head = (center = false, withDesc = true) => {
      const mid = center || b.styles.align === 'center';
      return (
        <div className={`max-w-3xl space-y-3 ${mid ? 'mx-auto text-center' : ''}`}>
          {c.subtitle && <span {...edit(b, 'subtitle')} className="block cursor-text text-xs font-black uppercase tracking-widest" style={{ color: brand }}>{c.subtitle}</span>}
          {c.title !== undefined && <h2 {...edit(b, 'title')} className="cursor-text text-2xl font-black tracking-tight @3xl:text-4xl" style={{ color: text }}>{c.title}</h2>}
          {withDesc && c.description && <p {...edit(b, 'description', true)} className="cursor-text text-sm leading-relaxed opacity-70">{c.description}</p>}
        </div>
      );
    };

    switch (b.type) {
      case 'navbar':
        return (
          <div className={`${mw} mx-auto flex flex-wrap items-center justify-between gap-4`}>
            <span {...edit(b, 'brandName')} className="cursor-text text-xl font-black tracking-tight" style={{ color: brand }}>{c.brandName || 'Brand'}</span>
            <nav className="hidden flex-1 items-center justify-center gap-6 text-xs font-semibold @3xl:flex">
              {(c.links || []).map((l, i) => <a key={i} href="#" onClick={e => e.preventDefault()} className="opacity-75 transition-opacity hover:opacity-100" style={{ color: text }}>{l.label}</a>)}
            </nav>
            {c.primaryBtnText && <span {...edit(b, 'primaryBtnText')} className={`hidden cursor-text px-4 py-2 text-xs font-bold @min-[640px]:inline-block ${r}`} style={{ background: brand, color: luminance(brand) > 0.55 ? '#0f172a' : '#fff' }}>{c.primaryBtnText}</span>}
            <div className="flex flex-col gap-1 @3xl:hidden" aria-hidden="true">{[0, 1, 2].map(i => <span key={i} className="h-0.5 w-5 rounded" style={{ background: text }} />)}</div>
          </div>
        );

      case 'hero_section':
        return (
          <div className={`${mw} mx-auto grid grid-cols-1 items-center ${c.imageUrl ? 'gap-12 @5xl:grid-cols-2 @5xl:gap-16' : ''} ${align}`}>
            <div className="space-y-6">
              {c.subtitle && <div className={`flex ${flex}`}><span {...edit(b, 'subtitle')} className={`cursor-text px-3 py-1 text-[10px] font-black uppercase tracking-widest ${r}`} style={{ background: `${brand}22`, color: brand }}>{c.subtitle}</span></div>}
              <h1 {...edit(b, 'title')} className="cursor-text text-3xl font-black leading-tight tracking-tight @min-[640px]:text-4xl @3xl:text-5xl" style={{ color: text }}>{c.title}</h1>
              <p {...edit(b, 'description', true)} className={`max-w-2xl cursor-text text-sm leading-relaxed opacity-75 @3xl:text-base ${b.styles.align === 'center' ? 'mx-auto' : ''}`}>{c.description}</p>
              <div className={`flex flex-wrap gap-3 pt-1 ${flex}`}>
                {c.primaryBtnText && button(c.primaryBtnText, c.primaryBtnStyle || 'filled', brand, r)}
                {c.secondaryBtnText && button(c.secondaryBtnText, c.secondaryBtnStyle || 'outline', brand, r)}
              </div>
            </div>
            {safeSrc(c.imageUrl) && <img src={safeSrc(c.imageUrl)} alt={c.imageAlt || ''} referrerPolicy="no-referrer" draggable={false} className={`max-h-[460px] w-full object-cover ${r}`} />}
          </div>
        );

      case 'text_block': {
        const Tag = (['h1', 'h2', 'h3', 'h4', 'p', 'blockquote'].includes(c.textTag || '') ? c.textTag : 'p') as React.ElementType;
        const quote = c.textTag === 'blockquote';
        return (
          <div className={`${mw} mx-auto ${align}`}>
            <Tag {...edit(b, 'textContent', true)} className="cursor-text whitespace-pre-wrap" style={{
              fontSize: c.textFontSize || 16, fontWeight: c.textFontWeight || '400', lineHeight: c.textLineHeight || 1.8,
              letterSpacing: `${(c.textLetterSpacing || 0) / 100}em`, textDecoration: c.textDecoration || 'none', textTransform: c.textTransform || 'none',
              color: text, ...(quote ? { borderLeft: `4px solid ${brand}`, paddingLeft: '1.5rem', fontStyle: 'italic', opacity: 0.85 } : {}),
            }}>{c.textContent || 'Click to edit text…'}</Tag>
          </div>
        );
      }

      case 'stats_block':
        return (
          <div className={`${mw} mx-auto`}>
            {(c.subtitle || c.title) && <div className="mb-12">{head(true, false)}</div>}
            <div className="grid grid-cols-2 gap-6 @3xl:grid-cols-4 @3xl:gap-10">
              {(c.stats || []).map((s, i) => (
                <div key={i} className="space-y-2 text-center">
                  <div className="text-3xl font-black tracking-tight @3xl:text-5xl" style={{ color: brand }}>{s.prefix}{s.value}{s.suffix}</div>
                  <div className="text-xs font-semibold uppercase tracking-wider opacity-60">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'logo_bar':
        return (
          <div className={`${mw} mx-auto space-y-6 text-center`}>
            {c.logoBarTitle && <p className="text-xs font-semibold uppercase tracking-widest opacity-50">{c.logoBarTitle}</p>}
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale transition-all hover:opacity-80 @3xl:gap-12">
              {(c.logos || []).filter(l => safeSrc(l.logoUrl)).map((l, i) => (
                <img key={i} src={safeSrc(l.logoUrl)} alt={l.name} referrerPolicy="no-referrer" draggable={false} className="h-7 w-auto object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ))}
            </div>
          </div>
        );

      case 'features_grid':
        return (
          <div className={`${mw} mx-auto space-y-12`}>
            {head()}
            <div className="grid grid-cols-1 gap-6 @min-[640px]:grid-cols-2 @5xl:grid-cols-3">
              {(c.features || []).map((f, i) => (
                <div key={i} {...card(b)}>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${brand}22`, color: brand }}><Star className="h-5 w-5" /></div>
                  <h3 className="mb-2 text-sm font-extrabold">{f.title}</h3>
                  <p className="text-xs leading-relaxed opacity-75">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className={`${mw} mx-auto space-y-12`}>
            {head(true, false)}
            <div className="grid grid-cols-1 gap-5 @3xl:grid-cols-2">
              {(c.testimonials || []).map((t, i) => (
                <div key={i} {...card(b)}>
                  <div className="mb-3 text-sm" style={{ color: '#fbbf24' }}>★★★★★</div>
                  <p className="mb-4 text-xs italic leading-relaxed opacity-90 @3xl:text-sm">“{t.quote}”</p>
                  <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid color-mix(in srgb, currentColor 14%, transparent)' }}>
                    {safeSrc(t.avatarUrl)
                      ? <img src={safeSrc(t.avatarUrl)} alt={t.author} referrerPolicy="no-referrer" draggable={false} className="h-9 w-9 flex-shrink-0 rounded-full object-cover" />
                      : <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-black text-white" style={{ background: brand }}>{(t.author || '?')[0]}</span>}
                    <div><h4 className="text-xs font-black">{t.author}</h4><span className="text-[10px] opacity-60">{t.role}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'pricing_cards': {
        const n = c.pricingPlans?.length || 0;
        return (
          <div className={`${mw} mx-auto space-y-12`}>
            {head(true)}
            <div className={`grid grid-cols-1 gap-5 ${n >= 3 ? '@3xl:grid-cols-3' : '@3xl:grid-cols-2 mx-auto max-w-3xl'}`}>
              {(c.pricingPlans || []).map((p, i) => (
                <div key={i} {...card(b, p.popular ? { outline: `2px solid ${brand}` } : {}, `relative ${p.popular ? 'z-10' : ''}`)}>
                  {p.popular && <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white ${r}`} style={{ background: brand }}>Popular</span>}
                  <h3 className="mb-3 text-[10px] font-black uppercase tracking-widest opacity-60">{p.name}</h3>
                  <div className="mb-4 flex items-baseline gap-1"><span className="text-4xl font-black">{p.price}</span><span className="text-xs opacity-50">/{p.period}</span></div>
                  <ul className="mb-6 space-y-2.5">
                    {(p.features || []).map((f, fi) => <li key={fi} className="flex items-start gap-2 text-xs"><Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: brand }} /><span className="opacity-90">{f}</span></li>)}
                  </ul>
                  <div className={`w-full border-2 py-3 text-center text-xs font-black ${r}`} style={{ background: p.popular ? brand : 'transparent', color: p.popular ? (luminance(brand) > 0.55 ? '#0f172a' : '#fff') : 'inherit', borderColor: brand }}>{p.btnText}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'contact_form':
        return (
          <div className={`${mw} mx-auto space-y-8 text-center`}>
            <div className="space-y-3">
              <h2 {...edit(b, 'title')} className="cursor-text text-2xl font-black tracking-tight @3xl:text-4xl">{c.title}</h2>
              {c.description && <p {...edit(b, 'description', true)} className="mx-auto max-w-md cursor-text text-sm leading-relaxed opacity-70">{c.description}</p>}
            </div>
            <div {...card(b, {}, 'mx-auto max-w-lg space-y-4 text-left')}>
              {(c.formFields || []).map((f, i) => (
                <div key={i} className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider opacity-60">{f.label}</label>
                  {f.type === 'textarea'
                    ? <div className="min-h-[76px] rounded-xl border p-3 text-xs opacity-60" style={{ borderColor: 'color-mix(in srgb, currentColor 18%, transparent)' }}>{f.placeholder}</div>
                    : <div className="rounded-xl border p-3 text-xs opacity-60" style={{ borderColor: 'color-mix(in srgb, currentColor 18%, transparent)' }}>{f.placeholder}</div>}
                </div>
              ))}
              <div className={`w-full py-3.5 text-center text-xs font-black ${r}`} style={{ background: brand, color: luminance(brand) > 0.55 ? '#0f172a' : '#fff' }}>{c.formBtnText || 'Submit'}</div>
            </div>
          </div>
        );

      case 'cta_block': {
        const txt = luminance(brand) < 0.55 ? brand : b.styles.bgColor;
        return (
          <div className={`${mw} mx-auto space-y-6 text-center`}>
            <h2 {...edit(b, 'title')} className="cursor-text text-2xl font-black tracking-tight @3xl:text-4xl">{c.title}</h2>
            <p {...edit(b, 'description', true)} className="mx-auto max-w-xl cursor-text text-sm leading-relaxed opacity-90">{c.description}</p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {c.primaryBtnText && <span className={`inline-block bg-white px-6 py-3 text-xs font-black shadow-lg ${r}`} style={{ color: txt }}>{c.primaryBtnText}</span>}
              {c.secondaryBtnText && button(c.secondaryBtnText, 'outline', brand, r, true)}
            </div>
          </div>
        );
      }

      case 'image_block':
        return (
          <div className={`${mw} mx-auto space-y-4 text-center`}>
            {safeSrc(c.imageUrl)
              ? <img src={safeSrc(c.imageUrl)} alt={c.imageAlt || ''} referrerPolicy="no-referrer" draggable={false} className={`max-h-[560px] w-full ${r}`}
                  style={{ objectFit: c.imageFit || 'cover', aspectRatio: ASPECT[c.imageAspectRatio || ''], filter: FILTERS[c.imageFilter || ''], border: c.imageBorderWidth ? `${c.imageBorderWidth}px solid ${c.imageBorderColor || '#e2e8f0'}` : undefined }} />
              : <div className={`flex h-48 w-full items-center justify-center border-2 border-dashed ${r}`} style={{ borderColor: 'color-mix(in srgb, currentColor 22%, transparent)' }}><span className="text-sm font-medium opacity-50">Add an image in the Content tab →</span></div>}
            {c.description && <p className="text-xs italic opacity-55">{c.description}</p>}
          </div>
        );

      case 'video_embed': {
        const src = toEmbedUrl(c.videoUrl);
        return (
          <div className={`${mw} mx-auto space-y-4 text-center`}>
            {c.title && <h3 className="text-base font-black">{c.title}</h3>}
            {c.description && <p className="text-xs opacity-70">{c.description}</p>}
            <div className={`aspect-video w-full overflow-hidden border ${r}`} style={{ borderColor: 'color-mix(in srgb, currentColor 18%, transparent)' }}>
              {src
                ? <iframe src={src} title={c.title || 'Video'} className="h-full w-full" allowFullScreen style={{ pointerEvents: isPreviewMode ? 'auto' : 'none' }} />
                : <div className="flex h-full w-full items-center justify-center bg-black/5"><span className="text-sm opacity-50">Paste a YouTube or Vimeo link →</span></div>}
            </div>
          </div>
        );
      }

      case 'faq_block':
        return (
          <div className={`${mw} mx-auto space-y-10`}>
            {head(true, false)}
            <div className="mx-auto max-w-2xl space-y-3">
              {(c.faqs || []).map((f, i) => {
                const key = `${b.id}-${i}`, open = !!openFaqs[key];
                return (
                  <div key={i} {...card(b, {}, 'cursor-pointer')} onClick={() => setOpenFaqs(p => ({ ...p, [key]: !p[key] }))}>
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="flex-1 text-sm font-bold">{f.question}</h4>
                      {open ? <ChevronUp className="h-4 w-4 flex-shrink-0 opacity-50" /> : <ChevronDown className="h-4 w-4 flex-shrink-0 opacity-50" />}
                    </div>
                    {open && <p className="mt-3 pt-3 text-xs leading-relaxed opacity-75" style={{ borderTop: '1px solid color-mix(in srgb, currentColor 14%, transparent)' }}>{f.answer}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'team_block':
        return (
          <div className={`${mw} mx-auto space-y-12`}>
            {head()}
            <div className="grid grid-cols-1 gap-5 @min-[640px]:grid-cols-2 @5xl:grid-cols-3">
              {(c.team || []).map((m, i) => (
                <div key={i} {...card(b, {}, 'text-center')}>
                  {safeSrc(m.avatarUrl)
                    ? <img src={safeSrc(m.avatarUrl)} alt={m.name} referrerPolicy="no-referrer" draggable={false} className="mx-auto mb-4 h-16 w-16 rounded-full object-cover" style={{ boxShadow: `0 0 0 2px ${brand}` }} />
                    : <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-xl font-black text-white" style={{ background: brand }}>{(m.name || '?')[0]}</div>}
                  <h3 className="text-sm font-black">{m.name}</h3>
                  <p className="mb-3 mt-0.5 text-xs font-bold" style={{ color: brand }}>{m.role}</p>
                  <p className="text-xs leading-relaxed opacity-70">{m.bio}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'divider':
        return <hr className="w-full border-0" style={{ borderTop: `1px ${c.dividerStyle || 'solid'} currentColor`, opacity: 0.2 }} />;
      case 'spacer':
        return <div style={{ height: c.spacerHeight || 48 }} className="w-full" />;

      case 'footer':
        return (
          <div className={`${mw} mx-auto flex flex-col flex-wrap items-center justify-between gap-4 text-xs font-medium @3xl:flex-row`}>
            <span {...edit(b, 'brandName')} className="cursor-text text-base font-black" style={{ color: brand }}>{c.brandName}</span>
            <span {...edit(b, 'copyright')} className="cursor-text opacity-55">{c.copyright}</span>
            <div className="flex flex-wrap gap-4 opacity-55">{(c.links || []).map((l, i) => <a key={i} href="#" onClick={e => e.preventDefault()}>{l.label}</a>)}</div>
          </div>
        );

      default:
        return <div className="py-4 text-center text-xs opacity-40">Unknown block: {b.type}</div>;
    }
  };

  const sectionPad = (b: Block): React.CSSProperties => ({ paddingTop: b.styles.paddingTop, paddingBottom: b.styles.paddingBottom });
  const sectionCls = 'w-full px-4 @min-[640px]:px-8 @3xl:px-12 @5xl:px-16';
  const visibleBlocks = project.blocks.filter(b => !b.hidden);

  /* ══ Preview mode ═════════════════════════════════════════ */
  if (isPreviewMode) {
    const width = isDevice ? VIEWPORT_WIDTH[viewport] : undefined;
    const s = Math.min(1, previewW / DESIGN_WIDTH);
    const off = Math.max(0, (previewW - DESIGN_WIDTH) / 2);
    return (
      <div id="preview-viewport" className="absolute inset-0 overflow-y-auto" style={{ background: isDevice ? '#16161a' : project.style.background }}>
        <div ref={previewRef} className="@container relative mx-auto overflow-x-clip" style={{ width: width || '100%', maxWidth: '100%', minHeight: '100%', background: project.style.background, fontFamily: project.style.fontFamily, boxShadow: isDevice ? '0 0 80px rgba(0,0,0,.6)' : undefined }}>
          {visibleBlocks.map(b => <div key={b.id} style={themeSection(b)}><div style={sectionPad(b)} className={sectionCls}>{renderBlock(b)}</div></div>)}
          {(project.elements || []).length > 0 && (
            <div className="pointer-events-none absolute left-0 top-0" style={{ width: DESIGN_WIDTH, height: 0, transformOrigin: '0 0', transform: `translateX(${off}px) scale(${s})` }}>
              <ElementLayer elements={project.elements || []} selectedId={null} zoom={100} frameWidth={DESIGN_WIDTH} readOnly />
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ══ Editor mode ══════════════════════════════════════════ */
  const cursor = panning ? 'grabbing' : handMode ? 'grab' : DRAW_TOOLS.includes(tool) ? 'crosshair' : 'default';
  const frameClass = viewport === 'mobile' ? 'device-frame-mobile' : viewport === 'tablet' ? 'device-frame-tablet' : 'device-frame-laptop';
  const host = project.publishedSlug ? `${window.location.host}/p/${project.publishedSlug}` : 'yourdomain.com';

  return (
    <div
      ref={wrapRef}
      id="landy-canvas"
      className="absolute inset-0 select-none overflow-hidden"
      style={{ cursor, touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onClick={() => { if (justPanned.current) { justPanned.current = false; return; } clearSelection(); }}
    >
      <div className="grid-layer" style={{ backgroundSize: `${Math.max(8, 24 * z)}px ${Math.max(8, 24 * z)}px`, backgroundPosition: `${pan.x}px ${pan.y}px`, opacity: z < 0.35 ? 0.4 : 1 }} />

      <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${z})`, transformOrigin: '0 0', willChange: 'transform' }}>
        <div className="frame-label" style={{ transform: `scale(${inv})`, transformOrigin: 'left bottom' }}>
          {VIEWPORT_LABEL[viewport]} · {frameW}
        </div>

        <div ref={frameRef} className={`frame ${frameClass}`} style={{ width: frameW }} onClick={e => e.stopPropagation()}>
          {!isDevice && (
            <div className="frame-chrome" aria-hidden="true">
              <span className="dot" style={{ background: '#ff5f57' }} /><span className="dot" style={{ background: '#febc2e' }} /><span className="dot" style={{ background: '#28c840' }} />
              <div className="url">🔒 {host}</div>
            </div>
          )}
          {viewport === 'mobile' && <div style={{ height: 34, background: project.style.background }} />}

          <div
            ref={contentRef}
            className="@container relative"
            style={{ background: project.style.background, fontFamily: project.style.fontFamily, minHeight: MIN_HEIGHT[viewport] }}
            onPointerDownCapture={onContentPointerDownCapture}
            onClick={e => { if (e.target === e.currentTarget) clearSelection(); }}
          >
            {visibleBlocks.length === 0 && (
              <div className="flex flex-col items-center justify-center p-10 text-center" style={{ minHeight: 420, color: '#6b7280' }}>
                <Sparkles className="mb-3 h-8 w-8" style={{ color: '#18a0fb', opacity: 0.6 }} />
                <p className="mb-1 text-sm font-bold">Your page is empty</p>
                <p className="mb-5 max-w-[240px] text-xs">Add sections from the Assets panel, or start with one of these:</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['navbar', 'hero_section', 'features_grid', 'cta_block'] as const).map(t => (
                    <button key={t} onClick={() => onAddBlock(t)} className="btn3d" style={{ textTransform: 'capitalize' }}>+ {t.split('_')[0]}</button>
                  ))}
                </div>
              </div>
            )}

            {project.blocks.map((block, idx) => {
              if (block.hidden) return null;
              const sel = selection.blockId === block.id;
              return (
                <div
                  key={block.id}
                  id={`cb-${block.id}`}
                  className="cb group relative"
                  draggable={armedId === block.id}
                  onClick={e => { e.stopPropagation(); if (!handMode) setSelection({ blockId: block.id, elementId: null }); }}
                  onDragStart={e => { setDraggedId(block.id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', block.id); }}
                  onDragEnd={() => { setDraggedId(null); setOverIdx(null); setArmedId(null); }}
                  onDragOver={e => {
                    if (!draggedId || draggedId === block.id) return;
                    e.preventDefault();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setOverIdx(idx);
                    setOverPos(e.clientY - rect.top < rect.height / 2 ? 'top' : 'bottom');
                  }}
                  onDrop={e => {
                    if (!draggedId) return;
                    e.preventDefault();
                    const from = project.blocks.findIndex(x => x.id === draggedId);
                    if (from === -1) return;
                    const next = [...project.blocks];
                    const [moved] = next.splice(from, 1);
                    let to = next.findIndex(x => x.id === block.id);
                    if (overPos === 'bottom') to += 1;
                    next.splice(to, 0, moved);
                    onReorderBlocks(next);
                    setDraggedId(null); setOverIdx(null); setArmedId(null);
                  }}
                  style={{ ...themeSection(block), opacity: draggedId === block.id ? 0.25 : 1, outline: sel ? `${2 / z}px solid #18a0fb` : undefined, outlineOffset: -1 }}
                >
                  {draggedId && overIdx === idx && <div className="drop-indicator" style={{ [overPos]: 0 }} />}

                  {sel && (
                    <>
                      <div className="fig-label-tag" style={{ transform: `scale(${inv})`, transformOrigin: 'top left' }}>{block.name}</div>
                      {dims && <div style={{ position: 'absolute', right: 0, bottom: 0, zIndex: 40, padding: '2px 8px', borderRadius: '6px 0 0 0', background: '#18a0fb', color: '#fff', fontSize: 10, fontWeight: 700, pointerEvents: 'none', transform: `scale(${inv})`, transformOrigin: 'bottom right' }}>{dims.w} × {dims.h}</div>}
                    </>
                  )}

                  <div className="block-toolbar absolute right-2 top-2 z-40 opacity-0 transition-opacity group-hover:opacity-100" style={{ transform: `scale(${inv})`, transformOrigin: 'top right', opacity: sel ? 1 : undefined }}>
                    <button title="Drag to reorder" className="fig-icon-btn" style={{ width: 24, height: 24, cursor: 'grab' }} onMouseDown={() => setArmedId(block.id)} onMouseUp={() => setArmedId(null)} onClick={e => e.stopPropagation()}><GripVertical size={12} /></button>
                    <span style={{ fontSize: 9, color: '#8c8c96', padding: '0 6px', fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase' }}>{block.type.replace(/_/g, ' ')}</span>
                    <button title="Move up" disabled={idx === 0} className="fig-icon-btn" style={{ width: 24, height: 24 }} onClick={e => { e.stopPropagation(); onMoveBlock(block.id, 'up'); }}><ArrowUp size={12} /></button>
                    <button title="Move down" disabled={idx === project.blocks.length - 1} className="fig-icon-btn" style={{ width: 24, height: 24 }} onClick={e => { e.stopPropagation(); onMoveBlock(block.id, 'down'); }}><ArrowDown size={12} /></button>
                    <button title="Duplicate (Ctrl+D)" className="fig-icon-btn" style={{ width: 24, height: 24 }} onClick={e => { e.stopPropagation(); onDuplicateBlock(block.id); }}><Copy size={12} /></button>
                    <button title="Delete" className="fig-icon-btn" style={{ width: 24, height: 24, color: '#f87171' }} onClick={e => { e.stopPropagation(); onDeleteBlock(block.id); if (sel) clearSelection(); }}><Trash2 size={12} /></button>
                  </div>

                  <div style={sectionPad(block)} className={sectionCls}>{renderBlock(block)}</div>
                </div>
              );
            })}

            <ElementLayer
              elements={project.elements || []}
              selectedId={selection.elementId}
              zoom={zoom}
              frameWidth={frameW}
              passive={handMode || DRAW_TOOLS.includes(tool)}
              onSelect={id => setSelection({ blockId: null, elementId: id })}
              onUpdate={onUpdateElement}
            />
            {draw && <div style={{ position: 'absolute', left: draw.x, top: draw.y, width: draw.w, height: draw.h, border: `${1.5 / z}px solid #18a0fb`, background: 'rgba(24,160,251,.12)', zIndex: 30, pointerEvents: 'none' }} />}
          </div>
        </div>
      </div>

      {/* Floating zoom control */}
      <div className="float-chip" style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 35 }} onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
        <button className="fig-icon-btn" title="Zoom out" onClick={() => setZoom(Math.max(10, zoom - 10))}><Minus size={13} /></button>
        <button className="zoom-display" style={{ background: 'none', border: 0, cursor: 'pointer' }} title="Reset to 100%" onClick={() => setZoom(100)}>{zoom}%</button>
        <button className="fig-icon-btn" title="Zoom in" onClick={() => setZoom(Math.min(400, zoom + 10))}><Plus size={13} /></button>
        <span className="toolbar-sep" style={{ height: 18, margin: '0 2px' }} />
        <button className="fig-icon-btn" title="Fit to screen (Shift+1)" onClick={fit}><Maximize size={13} /></button>
      </div>
    </div>
  );
}
