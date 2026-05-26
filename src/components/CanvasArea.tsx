import React, { useRef } from 'react';
import { ProjectState, Block, SelectionState, BlockType } from '../types';
import { 
  ArrowUp, ArrowDown, Trash2, Copy, Sparkles, Navigation, 
  Layers, CheckCircle, Image as ImageIcon, PlayCircle, Eye, Mail, Star, Check
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
  isPreviewMode,
  onAddBlock
}: CanvasAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Translate width based on viewport frame selection
  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'laptop': return '1280px';
      case 'desktop': return '100%';
      default: return '100%';
    }
  };

  const getViewportHeight = () => {
    switch (viewport) {
      case 'mobile': return '680px';
      case 'tablet': return '900px';
      default: return 'auto';
    }
  };

  const radiusClass = (r: string) => {
    switch (r) {
      case 'none': return 'rounded-none';
      case 'md': return 'rounded-md';
      case 'xl': return 'rounded-2xl';
      case '3xl': return 'rounded-3xl';
      case 'full': return 'rounded-full';
      default: return 'rounded-xl';
    }
  };

  const shadowClass = (s: string) => {
    switch (s) {
      case 'none': return 'shadow-none';
      case 'soft': return 'shadow-md';
      case 'heavy': return 'shadow-2xl';
      default: return 'shadow-lg';
    }
  };

  const getThemedCardClass = (block: Block) => {
    const isNeon = project.style.theme === 'neo_brutalist';
    const isGlass = project.style.theme === 'glassmorphism';
    const isCosmic = project.style.theme === 'cosmic_dark';

    const roundnessPreset = radiusClass(block.styles.borderRadius || project.style.radius);

    if (isNeon) {
      return `p-6 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none text-slate-950`;
    }

    if (isGlass) {
      return `p-6 bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl hover:bg-white/15 transition-all ${roundnessPreset}`;
    }

    if (isCosmic) {
      return `p-6 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:shadow-lg transition-all text-slate-100 ${roundnessPreset}`;
    }

    // Default: Minimal Modern
    return `p-6 bg-white border border-slate-100/90 hover:border-slate-200 shadow-sm hover:shadow transition-all text-slate-800 ${roundnessPreset}`;
  };

  const getImageCustomStyles = (block: Block, defaultUrl: string) => {
    const customUrl = block.content.imageUrl || defaultUrl;
    const aspect = block.content.imageAspectRatio || 'auto';
    const fit = block.content.imageFit || 'cover';
    const filter = block.content.imageFilter || 'none';
    const borderWidth = typeof block.content.imageBorderWidth !== 'undefined' ? Number(block.content.imageBorderWidth) : 0;
    const borderColor = block.content.imageBorderColor || '#cbd5e1';

    let filterStyle = '';
    if (filter === 'grayscale') filterStyle = 'grayscale(100%)';
    else if (filter === 'blur') filterStyle = 'blur(5px)';
    else if (filter === 'sepia') filterStyle = 'sepia(80%)';
    else if (filter === 'vintage') filterStyle = 'sepia(40%) contrast(125%) saturate(120%) hue-rotate(-10deg)';
    else if (filter === 'warm') filterStyle = 'saturate(130%) contrast(105%) sepia(8%)';
    else if (filter === 'cool') filterStyle = 'hue-rotate(12deg) saturate(95%) brightness(105%)';

    const aspectClasses: Record<string, string> = {
      'auto': 'aspect-auto h-auto',
      'square': 'aspect-square',
      'video': 'aspect-video',
      'portrait': 'aspect-[3/4]',
      'wide': 'aspect-[21/9]'
    };

    const fitClasses: Record<string, string> = {
      'cover': 'object-cover',
      'contain': 'object-contain bg-slate-50/50',
      'fill': 'object-fill'
    };

    const aspectClass = aspectClasses[aspect] || 'aspect-auto h-auto';
    const fitClass = fitClasses[fit] || 'object-cover';
    const roundness = radiusClass(block.styles.borderRadius || project.style.radius);
    const shadow = shadowClass(block.styles.shadow || project.style.shadows);

    return {
      src: customUrl,
      className: `w-full max-h-[460px] border transition-all duration-300 ${aspectClass} ${fitClass} ${roundness} ${shadow}`,
      style: {
        filter: filterStyle || undefined,
        borderWidth: borderWidth > 0 ? `${borderWidth}px` : undefined,
        borderStyle: borderWidth > 0 ? 'solid' : undefined,
        borderColor: borderWidth > 0 ? borderColor : undefined,
      }
    };
  };

  const handleTextChange = (blockId: string, field: string, newValue: string) => {
    const block = project.blocks.find(b => b.id === blockId);
    if (block) {
      onUpdateBlock(blockId, {
        content: {
          ...block.content,
          [field]: newValue
        }
      });
    }
  };

  // Styles based on theme
  const getThemeSectionStyles = (block: Block) => {
    const isNeon = project.style.theme === 'neo_brutalist';
    const isGlass = project.style.theme === 'glassmorphism';
    
    if (isNeon) {
      return {
        borderBottom: '4px solid #000000',
        borderRadius: '0px',
        backgroundColor: block.styles.bgColor,
        color: block.styles.textColor,
        fontFamily: project.style.fontFamily
      };
    }

    if (isGlass) {
      return {
        backdropFilter: 'blur(16px)',
        backgroundColor: `${block.styles.bgColor}22`, // semi-transparent hex
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        color: block.styles.textColor,
        fontFamily: project.style.fontFamily
      };
    }

    // Default: Minimal modern
    return {
      backgroundColor: block.styles.bgColor,
      color: block.styles.textColor,
      fontFamily: project.style.fontFamily,
      borderBottom: '1px solid rgba(226, 232, 240, 0.5)'
    };
  };

  // Central render block content helper to avoid code duplication across views
  const renderBlockContent = (block: Block) => {
    const brandColor = block.styles.brandColor || '#4f46e5';
    const textColor = block.styles.textColor || '#1e293b';

    switch (block.type) {
      case 'navbar':
        return (
          <div className="max-w-7xl mx-auto flex items-center justify-between py-2">
            <span 
              contentEditable={!isPreviewMode}
              suppressContentEditableWarning
              onBlur={(e) => handleTextChange(block.id, 'brandName', e.currentTarget.textContent || '')}
              className="font-black text-xl tracking-tight cursor-text focus:outline-dashed focus:outline-indigo-500 focus:outline-2 focus:bg-indigo-50/50 px-1 py-0.5 rounded transition-colors"
              style={{ color: brandColor }}
            >
              {block.content.brandName || 'Landy'}
            </span>
            
            <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider" style={{ color: block.styles.textColor || '#1e293b' }}>
              {(block.content.links || []).map((link, lidx) => (
                <a
                  key={lidx}
                  href={link.url || '#'}
                  className="hover:opacity-75 transition-all duration-150"
                  onClick={(e) => {
                    if (!isPreviewMode) e.preventDefault();
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {block.content.primaryBtnText && (
              <span
                contentEditable={!isPreviewMode}
                suppressContentEditableWarning
                onBlur={(e) => handleTextChange(block.id, 'primaryBtnText', e.currentTarget.textContent || '')}
                className={`px-5 py-2 text-xs font-bold text-white shadow-sm cursor-text focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-opacity active:opacity-90 ${radiusClass(block.styles.borderRadius || project.style.radius)}`}
                style={{ backgroundColor: brandColor }}
              >
                {block.content.primaryBtnText}
              </span>
            )}
          </div>
        );

      case 'hero_section':
        return (
          <div className={`max-w-7xl mx-auto grid grid-cols-1 ${block.content.imageUrl ? 'lg:grid-cols-2 gap-12 lg:gap-16' : ''} items-center text-${block.styles.align}`}>
            <div className="space-y-6">
              {block.content.subtitle && (
                <div className={`flex ${block.styles.align === 'center' ? 'justify-center' : block.styles.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                  <span 
                    contentEditable={!isPreviewMode}
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange(block.id, 'subtitle', e.currentTarget.textContent || '')}
                    className="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full cursor-text"
                    style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                  >
                    {block.content.subtitle}
                  </span>
                </div>
              )}
              
              <h1 
                contentEditable={!isPreviewMode}
                suppressContentEditableWarning
                onBlur={(e) => handleTextChange(block.id, 'title', e.currentTarget.textContent || '')}
                className="text-3xl md:text-5xl lg:text-5xl font-black tracking-tight leading-tight cursor-text focus:bg-slate-50/70 p-1 rounded-xl transition-colors"
                style={{ color: block.styles.textColor }}
              >
                {block.content.title}
              </h1>

              <p 
                contentEditable={!isPreviewMode}
                suppressContentEditableWarning
                onBlur={(e) => handleTextChange(block.id, 'description', e.currentTarget.textContent || '')}
                className="text-sm md:text-base leading-relaxed opacity-80 cursor-text focus:bg-slate-50/70 p-1 rounded-xl transition-colors"
              >
                {block.content.description}
              </p>

              <div className={`pt-2 flex flex-wrap items-center gap-4 ${
                block.styles.align === 'center' ? 'justify-center' : block.styles.align === 'right' ? 'justify-end' : 'justify-start'
              }`}>
                {block.content.primaryBtnText && (
                  <span
                    contentEditable={!isPreviewMode}
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange(block.id, 'primaryBtnText', e.currentTarget.textContent || '')}
                    className={`px-6 py-3 font-extrabold text-xs text-white shadow-md cursor-text hover:bg-opacity-90 active:scale-95 transition-all ${radiusClass(block.styles.borderRadius || project.style.radius)}`}
                    style={{ backgroundColor: brandColor }}
                  >
                    {block.content.primaryBtnText}
                  </span>
                )}
                {block.content.secondaryBtnText && (
                  <span
                    contentEditable={!isPreviewMode}
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange(block.id, 'secondaryBtnText', e.currentTarget.textContent || '')}
                    className={`px-6 py-3 font-bold text-xs border bg-white/50 backdrop-blur-sm cursor-text hover:bg-white active:scale-95 transition-all ${radiusClass(block.styles.borderRadius || project.style.radius)}`}
                    style={{ borderColor: `${textColor}25`, color: textColor }}
                  >
                    {block.content.secondaryBtnText}
                  </span>
                )}
              </div>
            </div>

            {block.content.imageUrl && (
              <div className="flex justify-center">
                <img 
                  alt={block.content.imageAlt || 'Hero Banner'}
                  referrerPolicy="no-referrer"
                  {...getImageCustomStyles(block, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80')}
                />
              </div>
            )}
          </div>
        );

      case 'features_grid':
        return (
          <div className="max-w-7xl mx-auto space-y-12">
            <div className={`max-w-3xl ${block.styles.align === 'center' ? 'mx-auto text-center' : block.styles.align === 'right' ? 'ml-auto text-right' : 'text-left'} space-y-2`}>
              {block.content.subtitle && (
                <span className="text-xs font-black uppercase tracking-widest block" style={{ color: brandColor }}>
                  {block.content.subtitle}
                </span>
              )}
              <h2 
                contentEditable={!isPreviewMode}
                suppressContentEditableWarning
                onBlur={(e) => handleTextChange(block.id, 'title', e.currentTarget.textContent || '')}
                className="text-2xl md:text-4xl font-black tracking-tight cursor-text focus:bg-slate-50 p-1 rounded-xl transition-colors"
                style={{ color: block.styles.textColor }}
              >
                {block.content.title}
              </h2>
              {block.content.description && (
                <p className="text-xs md:text-sm opacity-75 leading-relaxed max-w-2xl mx-auto">
                  {block.content.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {(block.content.features || []).map((feat, fidx) => (
                <div 
                  key={fidx} 
                  className={getThemedCardClass(block)}
                >
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm" style={{ backgroundColor: `${brandColor}12`, color: brandColor }}>
                      <Star className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-sm">{feat.title}</h3>
                    <p className="text-xs leading-relaxed opacity-85">{feat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="max-w-2xl mx-auto text-center space-y-2">
              {block.content.subtitle && (
                <span className="text-xs font-black uppercase tracking-widest block" style={{ color: brandColor }}>
                  {block.content.subtitle}
                </span>
              )}
              <h2 className="text-2xl md:text-4xl font-black tracking-tight" style={{ color: block.styles.textColor }}>{block.content.title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {(block.content.testimonials || []).map((test, tid) => (
                <div 
                  key={tid} 
                  className={getThemedCardClass(block)}
                >
                  <p className="text-xs md:text-sm italic leading-relaxed opacity-90">"{test.quote}"</p>
                  <div className="flex items-center gap-3 border-t border-slate-55/15 pt-4 mt-4">
                    <img 
                      src={test.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'} 
                      alt={test.author} 
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover shadow-sm border border-slate-100/10" 
                    />
                    <div>
                      <h4 className="text-xs font-black">{test.author}</h4>
                      <span className="text-[10px] opacity-75 font-bold block">{test.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'pricing_cards':
        return (
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="max-w-2xl mx-auto text-center space-y-2">
              {block.content.subtitle && (
                <span className="text-xs font-black uppercase tracking-widest block" style={{ color: brandColor }}>
                  {block.content.subtitle}
                </span>
              )}
              <h2 className="text-2xl md:text-4xl font-black tracking-tight" style={{ color: block.styles.textColor }}>{block.content.title}</h2>
              {block.content.description && <p className="text-xs opacity-75 font-medium">{block.content.description}</p>}
            </div>

            <div className={`grid grid-cols-1 ${block.content.pricingPlans?.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : block.content.pricingPlans?.length === 1 ? 'max-w-md mx-auto grid-cols-1' : 'md:grid-cols-3'} gap-6 pt-4`}>
              {(block.content.pricingPlans || []).map((plan, pidx) => {
                const isNeon = project.style.theme === 'neo_brutalist';
                const popularRing = plan.popular ? (isNeon ? 'ring-3 ring-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]' : 'ring-2 ring-indigo-600 scale-102 z-10 shadow-lg') : '';
                return (
                  <div 
                    key={pidx} 
                    className={`${getThemedCardClass(block)} relative overflow-hidden transition-all ${popularRing}`}
                  >
                    {plan.popular && (
                      <span 
                        className="absolute top-2 right-2 px-3 py-1 text-white rounded text-[8.5px] font-black tracking-widest uppercase shadow-sm"
                        style={{ backgroundColor: brandColor }}
                      >
                        POPULAR
                      </span>
                    )}
                    
                    <div className="space-y-5">
                      <h3 className="font-extrabold text-[10px] opacity-60 uppercase tracking-widest">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black">{plan.price}</span>
                        <span className="text-[10px] opacity-60 font-bold uppercase">/{plan.period}</span>
                      </div>
                      
                      <div className="w-full h-px bg-slate-150/10" />

                      <ul className="space-y-3.5 text-xs font-medium">
                        {(plan.features || []).map((feat, f_idx) => (
                          <li key={f_idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: brandColor }} />
                            <span className="opacity-95">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button 
                      className="w-full mt-8 py-3 bg-slate-50/10 hover:bg-slate-100/20 border border-slate-100/15 transition-all text-xs font-extrabold rounded-xl"
                      style={{ color: block.styles.textColor }}
                    >
                      {plan.btnText}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'contact_form':
        return (
          <div className="max-w-xl mx-auto space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: block.styles.textColor }}>{block.content.title}</h2>
              {block.content.description && <p className="text-xs leading-relaxed opacity-75 font-medium">{block.content.description}</p>}
            </div>

            <div className={`${getThemedCardClass(block)} text-left space-y-4 shadow-md`}>
              {(block.content.formFields || []).map((field, f_idx) => (
                <div key={f_idx} className="space-y-1">
                  <label className="text-[10px] font-bold opacity-60 uppercase tracking-wider block">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea 
                      placeholder={field.placeholder} 
                      rows={2} 
                      className="w-full p-3 text-xs border border-slate-200/20 bg-slate-50/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-inherit" 
                      disabled 
                    />
                  ) : (
                    <input 
                      type={field.type} 
                      placeholder={field.placeholder} 
                      className="w-full p-3 text-xs border border-slate-200/20 bg-slate-50/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-inherit" 
                      disabled 
                    />
                  )}
                </div>
              ))}
              <button 
                type="button" 
                className={`w-full py-3.5 mt-2 text-white font-extrabold rounded-xl text-xs shadow-md transition-opacity active:opacity-90 cursor-pointer`}
                style={{ backgroundColor: brandColor }}
              >
                {block.content.formBtnText || 'Submit Message'}
              </button>
            </div>
          </div>
        );

      case 'cta_block':
        return (
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 
              contentEditable={!isPreviewMode}
              suppressContentEditableWarning
              onBlur={(e) => handleTextChange(block.id, 'title', e.currentTarget.textContent || '')}
              className="text-2xl md:text-4xl font-black tracking-tight cursor-text focus:bg-white/20 p-1 rounded-xl transition-colors"
              style={{ color: block.styles.textColor }}
            >
              {block.content.title}
            </h2>
            
            <p 
              contentEditable={!isPreviewMode}
              suppressContentEditableWarning
              onBlur={(e) => handleTextChange(block.id, 'description', e.currentTarget.textContent || '')}
              className="text-xs md:text-sm max-w-2xl mx-auto leading-relaxed opacity-95 cursor-text focus:bg-white/20 p-1 rounded-xl transition-colors"
            >
              {block.content.description}
            </p>

            {block.content.primaryBtnText && (
              <div className="pt-2">
                <span
                  contentEditable={!isPreviewMode}
                  suppressContentEditableWarning
                  onBlur={(e) => handleTextChange(block.id, 'primaryBtnText', e.currentTarget.textContent || '')}
                  className={`px-6 py-3 font-black text-xs inline-block shadow-lg cursor-text hover:opacity-90 active:scale-95 transition-all ${radiusClass(block.styles.borderRadius || project.style.radius)}`}
                  style={{ backgroundColor: brandColor, color: block.styles.bgColor }}
                >
                  {block.content.primaryBtnText}
                </span>
              </div>
            )}
          </div>
        );

      case 'image_block':
        return (
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <img 
              alt={block.content.imageAlt || 'Gallery Showcase'} 
              referrerPolicy="no-referrer"
              {...getImageCustomStyles(block, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80')}
            />
            {block.content.description && (
              <p className="text-xs opacity-60 italic font-medium">
                {block.content.description}
              </p>
            )}
          </div>
        );

      case 'video_embed':
        return (
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800">{block.content.title}</h3>
            {block.content.description && <p className="text-xs text-slate-500 font-medium">{block.content.description}</p>}
            <div className={`aspect-video w-full overflow-hidden shadow-md border border-slate-200 ${radiusClass(block.styles.borderRadius || project.style.radius)}`}>
              <iframe 
                src={block.content.videoUrl} 
                className="w-full h-full bg-black" 
                title="Iframe Video player component"
              />
            </div>
          </div>
        );

      case 'divider':
        return (
          <hr 
            className={`w-full ${
              block.content.dividerStyle === 'dashed' 
                ? 'border-dashed' 
                : block.content.dividerStyle === 'dotted' 
                  ? 'border-dotted' 
                  : 'border-solid'
            }`}
            style={{ borderColor: `${textColor}25` }}
          />
        );

      case 'spacer':
        return (
          <div style={{ height: `${block.content.spacerHeight || 48}px` }} className="w-full" />
        );

      case 'footer':
        return (
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-semibold text-slate-500">
            <span className="font-black text-sm tracking-tight text-slate-800">{block.content.brandName}</span>
            <span 
              contentEditable={!isPreviewMode}
              suppressContentEditableWarning
              onBlur={(e) => handleTextChange(block.id, 'copyright', e.currentTarget.textContent || '')}
              className="font-bold cursor-text focus:outline-none"
            >
              {block.content.copyright}
            </span>
            
            <div className="flex gap-6 uppercase tracking-wider text-[10px]">
              {(block.content.links || []).map((l, index) => (
                <span key={index} className="hover:underline cursor-pointer">{l.label}</span>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // If in PREVIEW MODE, render a completely borderless, continuous site preview
  if (isPreviewMode) {
    return (
      <div 
        className="flex-1 w-full min-h-screen select-text overflow-y-auto scroll-smooth pb-24"
        id="production-mode-viewport"
        style={{ 
          backgroundColor: project.style.background,
          fontFamily: project.style.fontFamily
        }}
      >
        <div className="w-full flex flex-col">
          {project.blocks.map((block, idx) => (
            <div 
              key={block.id} 
              style={{
                ...getThemeSectionStyles(block),
                animationDelay: `${idx * 120}ms`,
                animationFillMode: 'both'
              }}
              className="w-full animate-fade-in-up opacity-0"
            >
              <div 
                style={{ 
                  paddingTop: `${block.styles.paddingTop}px`, 
                  paddingBottom: `${block.styles.paddingBottom}px` 
                }}
                className="w-full md:px-16 px-8 max-w-7xl mx-auto"
              >
                {renderBlockContent(block)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Active EDITOR WORKSPACE returning styled responsive frame simulator
  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto bg-slate-100 p-8 flex justify-center items-start min-h-0 relative select-text"
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
        backgroundSize: '20px 20px'
      }}
      id="builder-canvas-wrapper"
    >
      
      {/* Simulation responsive outer laptop body */}
      <div 
        className={`w-full transition-all duration-300 mx-auto flex flex-col shadow-xl ${
          viewport === 'mobile' || viewport === 'tablet'
            ? 'bg-slate-900 border-[14px] border-slate-950 shadow-2xl rounded-[36px] overflow-hidden'
            : 'border border-slate-200 bg-white rounded-2xl overflow-hidden'
        }`}
        style={{ 
          maxWidth: getViewportWidth(), 
          height: getViewportHeight(),
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center'
        }}
      >
        
        {/* Device interactive speaker / notch frame bar */}
        {(viewport === 'mobile' || viewport === 'tablet') && (
          <div className="h-7 w-full bg-slate-950 flex justify-center items-center shrink-0">
            <div className="w-16 h-3.5 bg-slate-900 rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            </div>
          </div>
        )}

        {/* Real Live Editable Blocks Area container */}
        <div 
          className="flex-1 flex flex-col overflow-y-auto relative"
          style={{ backgroundColor: project.style.background }}
          id="editor-canvas-workspace-scroll"
        >
          {project.blocks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-[60vh] text-slate-400">
              <Sparkles className="w-10 h-10 text-indigo-400 mb-3 animate-pulse" />
              <h4 className="font-extrabold text-slate-800 text-sm">Your Canva Landing is Clear</h4>
              <p className="text-xs text-slate-450 max-w-xs mt-1 text-slate-400">
                Browse blocks under the <strong>Library tab</strong> in the right-side control station to begin building!
              </p>
              
              <div className="grid grid-cols-2 gap-2 mt-6 max-w-sm">
                {(['navbar', 'hero_section', 'features_grid', 'cta_block'] as const).map(bt => (
                  <button
                    key={bt}
                    onClick={() => onAddBlock(bt)}
                    className="px-3.5 py-2 bg-white hover:bg-indigo-50 hover:text-indigo-650 text-indigo-600 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:border-indigo-200"
                  >
                    + Add {bt.split('_')[0]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            project.blocks.map((block, idx) => {
              const isSelected = selection.blockId === block.id;

              return (
                <div
                  key={block.id}
                  id={`canvas-section-node-sec_${block.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelection({ blockId: block.id, elementId: null });
                  }}
                  className={`group relative transition-all ${
                    isSelected 
                      ? 'z-20' 
                      : 'hover:ring-2 hover:ring-indigo-100 hover:ring-offset-1 rounded-sm'
                  }`}
                  style={getThemeSectionStyles(block)}
                >
                  
                  {/* Canva Selection Outline Handles */}
                  {isSelected && (
                    <div className="absolute -inset-1 border-2 border-indigo-600 pointer-events-none z-30 animate-fade-in shadow-sm rounded">
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full" />
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full" />
                      <div className="absolute -top-6.5 left-3 bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-md whitespace-nowrap uppercase tracking-widest leading-none">
                        {block.name.slice(0, 24)}
                      </div>
                    </div>
                  )}

                  {/* Canvas block overlay editor controller triggers */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-40 bg-slate-900 text-white rounded-xl p-1 shadow-md text-[10px] font-bold">
                    <span className="text-slate-400 font-mono tracking-wide capitalize px-2 text-[9px] shrink-0">
                      {block.type.replace('_', ' ')}
                    </span>
                    
                    <div className="w-px h-3.5 bg-slate-700" />
                    
                    <button
                      title="Move Section Up"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveBlock(block.id, 'up');
                      }}
                      className="p-1.5 hover:bg-slate-800 text-slate-200 rounded-lg disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      title="Move Section Down"
                      disabled={idx === project.blocks.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveBlock(block.id, 'down');
                      }}
                      className="p-1.5 hover:bg-slate-800 text-slate-200 rounded-lg disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      title="Duplicate Section"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateBlock(block.id);
                      }}
                      className="p-1.5 hover:bg-slate-800 text-slate-200 rounded-lg cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      title="Delete Section"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBlock(block.id);
                        if (isSelected) setSelection({ blockId: null, elementId: null });
                      }}
                      className="p-1.5 hover:bg-red-650 hover:text-red-400 text-red-500 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Rendering active template content */}
                  <div 
                    style={{ 
                      paddingTop: `${block.styles.paddingTop}px`, 
                      paddingBottom: `${block.styles.paddingBottom}px` 
                    }}
                    className="w-full md:px-12 px-6"
                  >
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
