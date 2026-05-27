import React, { useRef, useState, useEffect } from 'react';
import { ProjectState, Block, SelectionState, BlockType } from '../types';
import {
  ArrowUp, ArrowDown, Trash2, Copy, Sparkles, Star, Check,
  ChevronDown, ChevronUp
} from 'lucide-react';

interface CanvasAreaProps {
  project: ProjectState;
  viewport: 'desktop' | 'laptop' | 'tablet' | 'mobile';
  zoom: number;
  selection: SelectionState;
  setSelection: (sel: SelectionState) => void;
  onUpdateBlock: (blockId: string, updated: Partial<Block>) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onReorderBlocks?: (blocks: Block[]) => void;
  isPreviewMode: boolean;
  onAddBlock: (type: BlockType) => void;
}

export default function CanvasArea({
  project,
  viewport,
  zoom,
  selection,
  setSelection,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveBlock,
  onReorderBlocks,
  isPreviewMode,
  onAddBlock
}: CanvasAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [dragOverPos, setDragOverPos] = useState<'top' | 'bottom'>('top');
  // FAQ open state for preview
  const [openFaqIdx, setOpenFaqIdx] = useState<Record<string, number | null>>({});

  useEffect(() => {
    if (!selection.blockId || isPreviewMode) { setDimensions(null); return; }
    const measure = () => {
      const el = document.getElementById(`canvas-block-${selection.blockId}`);
      if (el) setDimensions({ width: Math.round(el.getBoundingClientRect().width), height: Math.round(el.getBoundingClientRect().height) });
    };
    measure();
    const el = document.getElementById(`canvas-block-${selection.blockId}`);
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [selection.blockId, isPreviewMode, viewport, zoom, project.blocks]);

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile': return '390px';
      case 'tablet': return '768px';
      case 'laptop': return '1280px';
      default: return '100%';
    }
  };

  const getViewportHeight = () => {
    switch (viewport) {
      case 'mobile': return '844px';
      case 'tablet': return '1024px';
      default: return 'auto';
    }
  };

  const rcls = (r: string) => {
    switch (r) {
      case 'none': return 'rounded-none';
      case 'md': return 'rounded-lg';
      case 'xl': return 'rounded-2xl';
      case '3xl': return 'rounded-3xl';
      case 'full': return 'rounded-full';
      default: return 'rounded-xl';
    }
  };

  const scls = (s: string) => {
    switch (s) {
      case 'none': return 'shadow-none';
      case 'soft': return 'shadow-md';
      case 'heavy': return 'shadow-2xl';
      default: return 'shadow-lg';
    }
  };

  const maxWCls = (mw?: string) => {
    switch (mw) {
      case 'full': return 'max-w-full';
      case '5xl': return 'max-w-5xl';
      case '4xl': return 'max-w-4xl';
      case '3xl': return 'max-w-3xl';
      case '2xl': return 'max-w-2xl';
      default: return 'max-w-7xl';
    }
  };

  const getSectionBg = (block: Block): React.CSSProperties => {
    if (block.styles.useGradient) {
      const dirMap: Record<string, string> = {
        'to-r': 'to right',
        'to-b': 'to bottom',
        'to-br': 'to bottom right',
        'to-tr': 'to top right'
      };
      const dir = dirMap[block.styles.gradientDirection || 'to-r'] || 'to right';
      return {
        background: `linear-gradient(${dir}, ${block.styles.gradientFrom || '#4f46e5'}, ${block.styles.gradientTo || '#7c3aed'})`,
        color: block.styles.textColor,
        fontFamily: block.styles.fontFamily || project.style.fontFamily
      };
    }
    return {
      backgroundColor: block.styles.bgColor,
      color: block.styles.textColor,
      fontFamily: block.styles.fontFamily || project.style.fontFamily,
      ...(block.styles.borderWidth && block.styles.borderWidth > 0 ? {
        borderWidth: `${block.styles.borderWidth}px`,
        borderStyle: block.styles.borderStyle || 'solid',
        borderColor: block.styles.borderColor || '#e2e8f0'
      } : {})
    };
  };

  const getThemeSectionStyles = (block: Block): React.CSSProperties => {
    const isNeon = project.style.theme === 'neo_brutalist';
    const isGlass = project.style.theme === 'glassmorphism';
    const base = getSectionBg(block);

    if (isNeon) return { ...base, borderBottom: '3px solid #000', fontFamily: block.styles.fontFamily || project.style.fontFamily };
    if (isGlass) return { ...base, backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.12)' };
    return { ...base, borderBottom: '1px solid rgba(226,232,240,0.4)' };
  };

  const getCardClass = (block: Block) => {
    const isNeon = project.style.theme === 'neo_brutalist';
    const isGlass = project.style.theme === 'glassmorphism';
    const isCosmic = project.style.theme === 'cosmic_dark';
    const r = rcls(block.styles.borderRadius || project.style.radius);

    if (isNeon) return `p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all rounded-none`;
    if (isGlass) return `p-6 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl ${r}`;
    if (isCosmic) return `p-6 bg-slate-900 border border-slate-700 hover:border-slate-600 transition-all ${r}`;
    return `p-6 bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow transition-all ${r}`;
  };

  const handleTextChange = (blockId: string, field: string, value: string) => {
    const block = project.blocks.find(b => b.id === blockId);
    if (block) onUpdateBlock(blockId, { content: { ...block.content, [field]: value } });
  };

  const renderBtn = (text: string, brandColor: string, style: 'filled' | 'outline' | 'ghost' = 'filled', textColor: string = '#fff', rClass: string = 'rounded-xl') => {
    if (style === 'outline') return (
      <span className={`px-6 py-3 font-bold text-xs border-2 transition-all inline-block ${rClass}`}
        style={{ borderColor: brandColor, color: brandColor, backgroundColor: 'transparent' }}>
        {text}
      </span>
    );
    if (style === 'ghost') return (
      <span className={`px-6 py-3 font-bold text-xs transition-all inline-block ${rClass}`}
        style={{ color: brandColor, backgroundColor: 'transparent' }}>
        {text} →
      </span>
    );
    return (
      <span className={`px-6 py-3 font-bold text-xs text-white shadow-md transition-all inline-block ${rClass}`}
        style={{ backgroundColor: brandColor, color: textColor }}>
        {text}
      </span>
    );
  };

  const renderBlockContent = (block: Block) => {
    const brand = block.styles.brandColor || '#4f46e5';
    const text = block.styles.textColor || '#0f172a';
    const rClass = rcls(block.styles.borderRadius || project.style.radius);
    const mwClass = maxWCls(block.styles.maxWidth);
    const alignClass = block.styles.align === 'center' ? 'text-center' : block.styles.align === 'right' ? 'text-right' : 'text-left';
    const flexAlign = block.styles.align === 'center' ? 'justify-center' : block.styles.align === 'right' ? 'justify-end' : 'justify-start';

    switch (block.type) {

      case 'navbar':
        return (
          <div className={`${mwClass} mx-auto flex items-center justify-between gap-4 flex-wrap`}>
            <span
              contentEditable={!isPreviewMode}
              suppressContentEditableWarning
              onBlur={e => handleTextChange(block.id, 'brandName', e.currentTarget.textContent || '')}
              className="font-black text-xl tracking-tight cursor-text focus:outline-dashed focus:outline-2 focus:outline-indigo-500 px-1 rounded"
              style={{ color: brand }}
            >
              {block.content.brandName || 'Brand'}
            </span>

            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold flex-1 justify-center">
              {(block.content.links || []).map((link, i) => (
                <a key={i} href={link.url} onClick={e => !isPreviewMode && e.preventDefault()}
                  className="hover:opacity-70 transition-opacity" style={{ color: text }}>
                  {link.label}
                </a>
              ))}
            </nav>

            {block.content.primaryBtnText && (
              <span
                contentEditable={!isPreviewMode}
                suppressContentEditableWarning
                onBlur={e => handleTextChange(block.id, 'primaryBtnText', e.currentTarget.textContent || '')}
                className={`px-4 py-2 text-xs font-bold text-white cursor-text focus:outline-none hidden sm:inline-block ${rClass}`}
                style={{ backgroundColor: brand }}
              >
                {block.content.primaryBtnText}
              </span>
            )}
            {/* Mobile menu indicator */}
            <div className="md:hidden flex flex-col gap-1 cursor-pointer">
              <span className="w-5 h-0.5 rounded" style={{ backgroundColor: text }} />
              <span className="w-5 h-0.5 rounded" style={{ backgroundColor: text }} />
              <span className="w-5 h-0.5 rounded" style={{ backgroundColor: text }} />
            </div>
          </div>
        );

      case 'hero_section':
        return (
          <div className={`${mwClass} mx-auto grid grid-cols-1 ${block.content.imageUrl ? 'lg:grid-cols-2 gap-12 lg:gap-16' : ''} items-center ${alignClass}`}>
            <div className="space-y-6">
              {block.content.subtitle && (
                <div className={`flex ${flexAlign}`}>
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${rClass}`}
                    style={{ backgroundColor: `${brand}18`, color: brand }}>
                    {block.content.subtitle}
                  </span>
                </div>
              )}
              <h1
                contentEditable={!isPreviewMode}
                suppressContentEditableWarning
                onBlur={e => handleTextChange(block.id, 'title', e.currentTarget.textContent || '')}
                className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight cursor-text focus:outline-none focus:bg-black/5 rounded-lg px-1"
                style={{ color: text }}
              >
                {block.content.title}
              </h1>
              <p
                contentEditable={!isPreviewMode}
                suppressContentEditableWarning
                onBlur={e => handleTextChange(block.id, 'description', e.currentTarget.textContent || '')}
                className="text-sm md:text-base leading-relaxed opacity-75 cursor-text focus:outline-none focus:bg-black/5 rounded px-1 max-w-2xl"
                style={{ margin: block.styles.align === 'center' ? '0 auto' : undefined }}
              >
                {block.content.description}
              </p>
              <div className={`flex flex-wrap gap-3 pt-2 ${flexAlign}`}>
                {block.content.primaryBtnText && renderBtn(block.content.primaryBtnText, brand, block.content.primaryBtnStyle as any || 'filled', '#fff', rClass)}
                {block.content.secondaryBtnText && renderBtn(block.content.secondaryBtnText, brand, block.content.secondaryBtnStyle as any || 'outline', text, rClass)}
              </div>
            </div>
            {block.content.imageUrl && (
              <div className="flex justify-center mt-8 lg:mt-0">
                <img src={block.content.imageUrl} alt={block.content.imageAlt || 'Hero'} referrerPolicy="no-referrer"
                  className={`w-full max-h-[460px] object-cover ${rClass} ${scls(block.styles.shadow)}`} />
              </div>
            )}
          </div>
        );

      case 'text_block': {
        const Tag = (block.content.textTag || 'p') as any;
        const maxWMap: Record<string, string> = { '3xl': '48rem', '2xl': '42rem', '4xl': '56rem', 'full': '100%' };
        const mw = maxWMap[block.content.textMaxWidth || '3xl'] || '48rem';
        return (
          <div className={`${mwClass} mx-auto ${alignClass}`}>
            <Tag
              contentEditable={!isPreviewMode}
              suppressContentEditableWarning
              onBlur={(e: React.FocusEvent<HTMLElement>) => handleTextChange(block.id, 'textContent', e.currentTarget.textContent || '')}
              className="cursor-text focus:outline-none focus:bg-black/5 rounded-lg px-1 whitespace-pre-wrap"
              style={{
                fontSize: `${block.content.textFontSize || 16}px`,
                fontWeight: block.content.textFontWeight || '400',
                lineHeight: block.content.textLineHeight || 1.8,
                letterSpacing: `${(block.content.textLetterSpacing || 0) / 100}em`,
                textDecoration: block.content.textDecoration || 'none',
                textTransform: block.content.textTransform || 'none',
                color: text,
                maxWidth: mw,
                margin: block.styles.align === 'center' ? '0 auto' : undefined,
                borderLeft: block.content.textTag === 'blockquote' ? `4px solid ${brand}` : undefined,
                paddingLeft: block.content.textTag === 'blockquote' ? '1.5rem' : undefined,
                fontStyle: block.content.textTag === 'blockquote' ? 'italic' : undefined,
                opacity: block.content.textTag === 'blockquote' ? 0.85 : 1,
              }}
            >
              {block.content.textContent || 'Click to edit text...'}
            </Tag>
          </div>
        );
      }

      case 'stats_block':
        return (
          <div className={`${mwClass} mx-auto`}>
            {(block.content.subtitle || block.content.title) && (
              <div className={`mb-12 ${alignClass}`}>
                {block.content.subtitle && (
                  <span className="text-xs font-black uppercase tracking-widest block mb-2" style={{ color: brand }}>{block.content.subtitle}</span>
                )}
                {block.content.title && (
                  <h2 className="text-2xl md:text-4xl font-black tracking-tight" style={{ color: text }}>{block.content.title}</h2>
                )}
              </div>
            )}
            <div className={`grid ${block.content.statsLayout === 'grid' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-4'} gap-6 md:gap-8`}>
              {(block.content.stats || []).map((stat, i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="text-3xl md:text-5xl font-black tracking-tight" style={{ color: brand }}>
                    {stat.prefix}{stat.value}{stat.suffix}
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: text }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'logo_bar':
        return (
          <div className={`${mwClass} mx-auto text-center space-y-6`}>
            {block.content.logoBarTitle && (
              <p className="text-xs font-semibold uppercase tracking-widest opacity-50" style={{ color: text }}>{block.content.logoBarTitle}</p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60 grayscale hover:opacity-80 transition-all">
              {(block.content.logos || []).map((logo, i) => (
                <div key={i} className="flex items-center gap-2">
                  <img src={logo.logoUrl} alt={logo.name} referrerPolicy="no-referrer"
                    className="h-7 w-auto object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <span className="text-sm font-black tracking-tight hidden" style={{ color: text }}>{logo.name}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'features_grid':
        return (
          <div className={`${mwClass} mx-auto space-y-12`}>
            <div className={`max-w-3xl ${block.styles.align === 'center' ? 'mx-auto text-center' : ''} space-y-3`}>
              {block.content.subtitle && <span className="text-xs font-black uppercase tracking-widest block" style={{ color: brand }}>{block.content.subtitle}</span>}
              <h2
                contentEditable={!isPreviewMode}
                suppressContentEditableWarning
                onBlur={e => handleTextChange(block.id, 'title', e.currentTarget.textContent || '')}
                className="text-2xl md:text-4xl font-black tracking-tight cursor-text"
                style={{ color: text }}
              >
                {block.content.title}
              </h2>
              {block.content.description && <p className="text-sm opacity-70 leading-relaxed">{block.content.description}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(block.content.features || []).map((feat, i) => (
                <div key={i} className={getCardClass(block)}>
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${brand}15`, color: brand }}>
                      <Star className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-sm">{feat.title}</h3>
                    <p className="text-xs leading-relaxed opacity-80">{feat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className={`${mwClass} mx-auto space-y-12`}>
            <div className="max-w-2xl mx-auto text-center space-y-3">
              {block.content.subtitle && <span className="text-xs font-black uppercase tracking-widest block" style={{ color: brand }}>{block.content.subtitle}</span>}
              <h2 className="text-2xl md:text-4xl font-black tracking-tight" style={{ color: text }}>{block.content.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(block.content.testimonials || []).map((t, i) => (
                <div key={i} className={getCardClass(block)}>
                  <div className="flex mb-3 gap-0.5">
                    {[...Array(5)].map((_, si) => <span key={si} style={{ color: '#fbbf24' }}>★</span>)}
                  </div>
                  <p className="text-xs md:text-sm italic leading-relaxed opacity-90 mb-4">"{t.quote}"</p>
                  <div className="flex items-center gap-3 border-t border-slate-100/20 pt-4">
                    <img src={t.avatarUrl} alt={t.author} referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-black">{t.author}</h4>
                      <span className="text-[10px] opacity-60 font-medium">{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'pricing_cards':
        return (
          <div className={`${mwClass} mx-auto space-y-12`}>
            <div className="max-w-2xl mx-auto text-center space-y-3">
              {block.content.subtitle && <span className="text-xs font-black uppercase tracking-widest block" style={{ color: brand }}>{block.content.subtitle}</span>}
              <h2 className="text-2xl md:text-4xl font-black tracking-tight" style={{ color: text }}>{block.content.title}</h2>
              {block.content.description && <p className="text-sm opacity-70">{block.content.description}</p>}
            </div>
            <div className={`grid grid-cols-1 ${(block.content.pricingPlans?.length || 0) >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 max-w-3xl mx-auto'} gap-6`}>
              {(block.content.pricingPlans || []).map((plan, i) => (
                <div key={i} className={`${getCardClass(block)} relative ${plan.popular ? 'ring-2 ring-indigo-600 scale-[1.02] z-10' : ''}`}>
                  {plan.popular && (
                    <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-white text-[9px] font-black uppercase tracking-widest ${rClass}`}
                      style={{ backgroundColor: brand }}>MOST POPULAR</span>
                  )}
                  <h3 className="font-black text-xs uppercase tracking-widest opacity-60 mb-3">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-xs opacity-50 font-medium">/{plan.period}</span>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: brand }} />
                        <span className="opacity-90">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-3 text-xs font-black transition-all ${rClass}`}
                    style={{ backgroundColor: plan.popular ? brand : 'transparent', color: plan.popular ? '#fff' : text, border: `2px solid ${brand}` }}>
                    {plan.btnText}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contact_form':
        return (
          <div className={`${mwClass} mx-auto text-center space-y-8`}>
            <div className="space-y-3">
              <h2 className="text-2xl md:text-4xl font-black tracking-tight" style={{ color: text }}>{block.content.title}</h2>
              {block.content.description && <p className="text-sm opacity-70 max-w-md mx-auto leading-relaxed">{block.content.description}</p>}
            </div>
            <div className={`${getCardClass(block)} text-left space-y-4 max-w-lg mx-auto shadow-lg`}>
              {(block.content.formFields || []).map((field, i) => (
                <div key={i} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider opacity-60 block">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea placeholder={field.placeholder} rows={3} disabled
                      className="w-full p-3 text-xs border border-slate-200/20 bg-slate-50/10 focus:outline-none rounded-xl font-medium resize-none" />
                  ) : (
                    <input type={field.type} placeholder={field.placeholder} disabled
                      className="w-full p-3 text-xs border border-slate-200/20 bg-slate-50/10 focus:outline-none rounded-xl font-medium" />
                  )}
                </div>
              ))}
              <button type="button" className={`w-full py-3.5 mt-2 text-white font-black text-xs ${rClass} transition-opacity`}
                style={{ backgroundColor: brand }}>
                {block.content.formBtnText || 'Submit'}
              </button>
            </div>
          </div>
        );

      case 'cta_block':
        return (
          <div className={`${mwClass} mx-auto text-center space-y-6`}>
            <h2
              contentEditable={!isPreviewMode}
              suppressContentEditableWarning
              onBlur={e => handleTextChange(block.id, 'title', e.currentTarget.textContent || '')}
              className="text-2xl md:text-4xl font-black tracking-tight cursor-text"
              style={{ color: text }}
            >
              {block.content.title}
            </h2>
            <p
              contentEditable={!isPreviewMode}
              suppressContentEditableWarning
              onBlur={e => handleTextChange(block.id, 'description', e.currentTarget.textContent || '')}
              className="text-sm max-w-xl mx-auto leading-relaxed opacity-90 cursor-text"
            >
              {block.content.description}
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              {block.content.primaryBtnText && renderBtn(block.content.primaryBtnText, block.styles.bgColor === '#4f46e5' || block.styles.bgColor.startsWith('#') ? '#fff' : brand, 'filled', block.styles.bgColor, rClass)}
              {block.content.secondaryBtnText && (
                <span className={`px-6 py-3 font-bold text-xs border-2 border-white/30 cursor-text transition-all inline-block ${rClass}`} style={{ color: text }}>
                  {block.content.secondaryBtnText}
                </span>
              )}
            </div>
          </div>
        );

      case 'image_block':
        return (
          <div className={`${mwClass} mx-auto text-center space-y-4`}>
            {block.content.imageUrl ? (
              <img src={block.content.imageUrl} alt={block.content.imageAlt || ''} referrerPolicy="no-referrer"
                className={`w-full object-cover ${rClass} ${scls(block.styles.shadow)}`}
                style={{ maxHeight: '460px', filter: block.content.imageFilter && block.content.imageFilter !== 'none' ? getFilterStyle(block.content.imageFilter) : undefined }} />
            ) : (
              <div className={`w-full h-48 bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center ${rClass}`}>
                <span className="text-slate-400 text-sm font-medium">Add image URL in the panel →</span>
              </div>
            )}
            {block.content.description && <p className="text-xs opacity-60 italic">{block.content.description}</p>}
          </div>
        );

      case 'video_embed':
        return (
          <div className={`${mwClass} mx-auto text-center space-y-4`}>
            <h3 className="font-black text-base" style={{ color: text }}>{block.content.title}</h3>
            {block.content.description && <p className="text-xs opacity-70">{block.content.description}</p>}
            <div className={`aspect-video w-full overflow-hidden ${rClass} border border-slate-200/30`}>
              {block.content.videoUrl ? (
                <iframe src={block.content.videoUrl} className="w-full h-full" title="Video" allowFullScreen />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                  <span className="text-slate-400 text-sm">Add video URL in the panel →</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'faq_block': {
        const faqKey = block.id;
        return (
          <div className={`${mwClass} mx-auto space-y-10`}>
            <div className={`max-w-2xl ${block.styles.align === 'center' ? 'mx-auto text-center' : ''} space-y-3`}>
              {block.content.subtitle && <span className="text-xs font-black uppercase tracking-widest block" style={{ color: brand }}>{block.content.subtitle}</span>}
              <h2 className="text-2xl md:text-4xl font-black tracking-tight" style={{ color: text }}>{block.content.title}</h2>
              {block.content.description && <p className="text-sm opacity-70">{block.content.description}</p>}
            </div>
            <div className="max-w-2xl mx-auto space-y-3">
              {(block.content.faqs || []).map((faq, i) => {
                const isOpen = openFaqIdx[faqKey] === i;
                return (
                  <div key={i} className={`${getCardClass(block)} cursor-pointer select-none`}
                    onClick={() => setOpenFaqIdx(prev => ({ ...prev, [faqKey]: isOpen ? null : i }))}>
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-bold text-sm flex-1">{faq.question}</h4>
                      {isOpen ? <ChevronUp className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" /> : <ChevronDown className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />}
                    </div>
                    {isOpen && <p className="text-xs leading-relaxed opacity-75 mt-3 pt-3 border-t border-slate-100/20">{faq.answer}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'team_block':
        return (
          <div className={`${mwClass} mx-auto space-y-12`}>
            <div className={`max-w-2xl ${block.styles.align === 'center' ? 'mx-auto text-center' : ''} space-y-3`}>
              {block.content.subtitle && <span className="text-xs font-black uppercase tracking-widest block" style={{ color: brand }}>{block.content.subtitle}</span>}
              <h2 className="text-2xl md:text-4xl font-black tracking-tight" style={{ color: text }}>{block.content.title}</h2>
              {block.content.description && <p className="text-sm opacity-70">{block.content.description}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(block.content.team || []).map((member, i) => (
                <div key={i} className={`${getCardClass(block)} text-center`}>
                  <img src={member.avatarUrl} alt={member.name} referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-4 ring-2 ring-white/20" />
                  <h3 className="font-black text-sm">{member.name}</h3>
                  <p className="text-xs font-bold mt-0.5 mb-3" style={{ color: brand }}>{member.role}</p>
                  <p className="text-xs opacity-70 leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'divider':
        return <hr className={`w-full ${block.content.dividerStyle === 'dashed' ? 'border-dashed' : block.content.dividerStyle === 'dotted' ? 'border-dotted' : 'border-solid'}`}
          style={{ borderColor: `${text}25` }} />;

      case 'spacer':
        return <div style={{ height: `${block.content.spacerHeight || 48}px` }} className="w-full" />;

      case 'footer':
        return (
          <div className={`${mwClass} mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium flex-wrap`}>
            <span
              contentEditable={!isPreviewMode}
              suppressContentEditableWarning
              onBlur={e => handleTextChange(block.id, 'brandName', e.currentTarget.textContent || '')}
              className="font-black text-base tracking-tight cursor-text"
              style={{ color: brand }}
            >
              {block.content.brandName}
            </span>
            <span
              contentEditable={!isPreviewMode}
              suppressContentEditableWarning
              onBlur={e => handleTextChange(block.id, 'copyright', e.currentTarget.textContent || '')}
              className="cursor-text opacity-60"
            >
              {block.content.copyright}
            </span>
            <div className="flex flex-wrap gap-4 opacity-60">
              {(block.content.links || []).map((l, i) => (
                <a key={i} href={l.url} onClick={e => !isPreviewMode && e.preventDefault()} className="hover:opacity-100 transition-opacity">{l.label}</a>
              ))}
            </div>
          </div>
        );

      default:
        return <div className="text-xs opacity-40 text-center py-4">Unknown block type: {block.type}</div>;
    }
  };

  // Preview mode
  if (isPreviewMode) {
    return (
      <div className="flex-1 w-full min-h-screen overflow-y-auto scroll-smooth"
        style={{ backgroundColor: project.style.background, fontFamily: project.style.fontFamily }}>
        {project.blocks.map((block, idx) => (
          <div key={block.id} style={getThemeSectionStyles(block)}>
            <div style={{ paddingTop: `${block.styles.paddingTop}px`, paddingBottom: `${block.styles.paddingBottom}px` }}
              className="w-full px-4 sm:px-8 md:px-12 lg:px-16">
              {renderBlockContent(block)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Editor mode
  return (
    <div ref={containerRef}
      className="flex-1 overflow-y-auto bg-slate-100 p-4 md:p-8 flex justify-center items-start min-h-0 relative"
      style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
    >
      <div
        className={`w-full transition-all duration-300 mx-auto flex flex-col shadow-xl overflow-hidden ${
          viewport === 'mobile' || viewport === 'tablet'
            ? 'bg-slate-900 border-[12px] border-slate-950 shadow-2xl rounded-[32px]'
            : 'border border-slate-200 bg-white rounded-2xl'
        }`}
        style={{
          maxWidth: getViewportWidth(),
          height: getViewportHeight(),
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center'
        }}
      >
        {(viewport === 'mobile' || viewport === 'tablet') && (
          <div className="h-6 w-full bg-slate-950 flex justify-center items-center flex-shrink-0">
            <div className="w-14 h-3 bg-slate-900 rounded-full" />
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-y-auto"
          style={{ backgroundColor: project.style.background }}>

          {project.blocks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-[60vh]">
              <Sparkles className="w-10 h-10 text-indigo-400 mb-3 animate-pulse" />
              <h4 className="font-black text-slate-800 text-sm mb-1">Canvas is empty</h4>
              <p className="text-xs text-slate-400 max-w-xs mb-6">Add blocks from the left panel to start building your landing page.</p>
              <div className="grid grid-cols-2 gap-2 max-w-xs">
                {(['navbar', 'hero_section', 'features_grid', 'cta_block'] as const).map(bt => (
                  <button key={bt} onClick={() => onAddBlock(bt)}
                    className="px-3 py-2 bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wide transition-all hover:border-indigo-200 cursor-pointer">
                    + {bt.split('_')[0]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            project.blocks.map((block, idx) => {
              const isSelected = selection.blockId === block.id;
              const isGhost = draggedId === block.id;

              return (
                <div
                  key={block.id}
                  id={`canvas-block-${block.id}`}
                  onClick={e => { e.stopPropagation(); setSelection({ blockId: block.id, elementId: null }); }}
                  draggable
                  onDragStart={e => {
                    setDraggedId(block.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragEnd={() => { setDraggedId(null); setDragOverIdx(null); }}
                  onDragOver={e => {
                    if (!draggedId || draggedId === block.id) return;
                    e.preventDefault();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setDragOverIdx(idx);
                    setDragOverPos((e.clientY - rect.top) < rect.height / 2 ? 'top' : 'bottom');
                  }}
                  onDrop={e => {
                    if (!draggedId || !onReorderBlocks) return;
                    e.preventDefault();
                    const srcIdx = project.blocks.findIndex(b => b.id === draggedId);
                    if (srcIdx === -1) return;
                    const next = [...project.blocks];
                    const [moved] = next.splice(srcIdx, 1);
                    let tgt = project.blocks.findIndex(b => b.id === block.id);
                    if (dragOverPos === 'bottom') tgt += 1;
                    next.splice(tgt, 0, moved);
                    onReorderBlocks(next);
                    setDraggedId(null); setDragOverIdx(null);
                  }}
                  className={`group relative transition-all duration-150 cursor-grab active:cursor-grabbing ${
                    isSelected ? 'z-20' : 'hover:ring-2 hover:ring-indigo-200 hover:ring-offset-1'
                  } ${isGhost ? 'opacity-25 scale-[0.99]' : ''}`}
                  style={getThemeSectionStyles(block)}
                >
                  {/* Drop indicator */}
                  {draggedId && dragOverIdx === idx && (
                    <div className={`absolute left-0 right-0 h-1 bg-indigo-500 z-50 pointer-events-none ${dragOverPos === 'top' ? 'top-0' : 'bottom-0'}`} />
                  )}

                  {/* Selection handles */}
                  {isSelected && (
                    <div className="absolute -inset-0.5 border-2 border-indigo-600 pointer-events-none z-30 rounded-sm">
                      {/* Corner dots */}
                      {['-top-1.5 -left-1.5', '-top-1.5 -right-1.5', '-bottom-1.5 -left-1.5', '-bottom-1.5 -right-1.5'].map((pos, i) => (
                        <div key={i} className={`absolute ${pos} w-3 h-3 bg-white border-2 border-indigo-600 rounded-full`} />
                      ))}
                      {/* Label */}
                      <div className="absolute -top-7 left-0 bg-indigo-600 text-white text-[9px] font-black px-2 py-1 rounded-t-md whitespace-nowrap uppercase tracking-wider leading-none">
                        {block.name}
                      </div>
                      {/* Dimensions */}
                      {dimensions && (
                        <div className="absolute -bottom-7 right-0 bg-slate-900 text-white text-[9px] font-mono px-2 py-1 rounded-b-md flex items-center gap-1.5">
                          <span className="text-emerald-400 font-bold">{dimensions.width}×{dimensions.height}px</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Block toolbar */}
                  <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-40 bg-slate-900 text-white rounded-xl px-1 py-1 shadow-lg">
                    <span className="text-slate-400 font-mono text-[9px] px-1.5 capitalize">{block.type.replace(/_/g, ' ')}</span>
                    <div className="w-px h-3 bg-slate-700" />
                    <button title="Up" disabled={idx === 0} onClick={e => { e.stopPropagation(); onMoveBlock(block.id, 'up'); }}
                      className="p-1.5 hover:bg-slate-800 rounded-lg disabled:opacity-30 cursor-pointer"><ArrowUp className="w-3 h-3" /></button>
                    <button title="Down" disabled={idx === project.blocks.length - 1} onClick={e => { e.stopPropagation(); onMoveBlock(block.id, 'down'); }}
                      className="p-1.5 hover:bg-slate-800 rounded-lg disabled:opacity-30 cursor-pointer"><ArrowDown className="w-3 h-3" /></button>
                    <button title="Duplicate" onClick={e => { e.stopPropagation(); onDuplicateBlock(block.id); }}
                      className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer"><Copy className="w-3 h-3" /></button>
                    <button title="Delete" onClick={e => { e.stopPropagation(); onDeleteBlock(block.id); if (isSelected) setSelection({ blockId: null, elementId: null }); }}
                      className="p-1.5 hover:bg-red-900 text-red-400 rounded-lg cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                  </div>

                  {/* Block content */}
                  <div style={{
                    paddingTop: `${block.styles.paddingTop}px`,
                    paddingBottom: `${block.styles.paddingBottom}px`
                  }} className="w-full px-4 sm:px-8 md:px-12">
                    {renderBlockContent(block)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function getFilterStyle(filter: string): string {
  const map: Record<string, string> = {
    grayscale: 'grayscale(100%)',
    blur: 'blur(4px)',
    sepia: 'sepia(80%)',
    vintage: 'sepia(40%) contrast(120%) saturate(110%) hue-rotate(-10deg)',
    warm: 'saturate(130%) contrast(105%) sepia(8%)',
    cool: 'hue-rotate(12deg) saturate(95%) brightness(105%)'
  };
  return map[filter] || 'none';
}
