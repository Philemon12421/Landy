import React, { useRef, useState, useEffect } from 'react';
import { ProjectState, Block, SelectionState, BlockType } from '../types';
import { ArrowUp, ArrowDown, Trash2, Copy, Sparkles, Star, Check, ChevronDown, ChevronUp } from 'lucide-react';

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
  project, viewport, zoom, selection, setSelection,
  onUpdateBlock, onDeleteBlock, onDuplicateBlock, onMoveBlock,
  onReorderBlocks, isPreviewMode, onAddBlock
}: CanvasAreaProps) {
  const [dimensions, setDimensions] = useState<{w:number;h:number}|null>(null);
  const [draggedId, setDraggedId] = useState<string|null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number|null>(null);
  const [dragOverPos, setDragOverPos] = useState<'top'|'bottom'>('top');
  const [openFaqs, setOpenFaqs] = useState<Record<string,number|null>>({});

  useEffect(() => {
    if (!selection.blockId || isPreviewMode) { setDimensions(null); return; }
    const measure = () => {
      const el = document.getElementById(`cb-${selection.blockId}`);
      if (el) setDimensions({ w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) });
    };
    measure();
    const el = document.getElementById(`cb-${selection.blockId}`);
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [selection.blockId, isPreviewMode, viewport, zoom, project.blocks]);

  const vw = () => ({ desktop:'100%', laptop:'1280px', tablet:'768px', mobile:'390px' }[viewport]);
  const vh = () => ({ mobile:'844px', tablet:'1024px', desktop:'auto', laptop:'auto' }[viewport]);

  const rcls = (r: string) => ({ none:'rounded-none', md:'rounded-lg', xl:'rounded-2xl', '3xl':'rounded-3xl', full:'rounded-full' }[r] || 'rounded-2xl');
  const mwcls = (mw?: string) => ({ full:'max-w-full', '5xl':'max-w-5xl', '4xl':'max-w-4xl', '3xl':'max-w-3xl', '2xl':'max-w-2xl' }[mw||''] || 'max-w-7xl');

  const sectionBg = (b: Block): React.CSSProperties => {
    const base: React.CSSProperties = {
      color: b.styles.textColor,
      fontFamily: b.styles.fontFamily || project.style.fontFamily,
    };
    if (b.styles.useGradient) {
      const dir = ({ 'to-r':'to right','to-b':'to bottom','to-br':'to bottom right','to-tr':'to top right' }[b.styles.gradientDirection||'to-r']);
      return { ...base, background: `linear-gradient(${dir}, ${b.styles.gradientFrom||'#4f46e5'}, ${b.styles.gradientTo||'#7c3aed'})` };
    }
    return { ...base, backgroundColor: b.styles.bgColor,
      ...(b.styles.borderWidth&&b.styles.borderWidth>0?{borderWidth:`${b.styles.borderWidth}px`,borderStyle:b.styles.borderStyle||'solid',borderColor:b.styles.borderColor||'#e2e8f0'}:{}) };
  };

  const themeSection = (b: Block): React.CSSProperties => {
    const base = sectionBg(b);
    if (project.style.theme==='neo_brutalist') return {...base, borderBottom:'3px solid #000'};
    if (project.style.theme==='glassmorphism') return {...base, backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.1)'};
    return {...base, borderBottom:'1px solid rgba(0,0,0,0.04)'};
  };

  const cardCls = (b: Block) => {
    const r = rcls(b.styles.borderRadius||project.style.radius);
    if (project.style.theme==='neo_brutalist') return `p-6 bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all rounded-none`;
    if (project.style.theme==='glassmorphism') return `p-6 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl ${r}`;
    if (project.style.theme==='cosmic_dark') return `p-6 bg-white/5 border border-white/10 hover:border-white/20 transition-all ${r}`;
    return `p-6 bg-white/90 border border-black/[0.07] hover:border-black/[0.12] shadow-sm hover:shadow transition-all ${r}`;
  };

  const txt = (b: Block, field: string, val: string) => {
    onUpdateBlock(b.id, { content: { ...b.content, [field]: val } });
  };

  const edt = (b: Block, field: string) => !isPreviewMode ? {
    contentEditable: true as const,
    suppressContentEditableWarning: true,
    onBlur: (e: React.FocusEvent<HTMLElement>) => txt(b, field, e.currentTarget.textContent || ''),
  } : {};

  const renderBtn = (text: string, brand: string, style: string = 'filled', textClr: string = '#fff', r: string = 'rounded-xl') => {
    if (style === 'outline') return <span className={`px-6 py-3 font-bold text-xs border-2 inline-block ${r}`} style={{borderColor:brand,color:brand}}>{text}</span>;
    if (style === 'ghost') return <span className={`px-4 py-3 font-bold text-xs inline-block ${r}`} style={{color:brand}}>{text} →</span>;
    return <span className={`px-6 py-3 font-bold text-xs text-white shadow-md inline-block ${r}`} style={{backgroundColor:brand,color:textClr}}>{text}</span>;
  };

  const renderBlock = (b: Block) => {
    const brand = b.styles.brandColor || '#4f46e5';
    const text  = b.styles.textColor  || '#0f172a';
    const r     = rcls(b.styles.borderRadius || project.style.radius);
    const mw    = mwcls(b.styles.maxWidth);
    const align = b.styles.align === 'center' ? 'text-center' : b.styles.align === 'right' ? 'text-right' : 'text-left';
    const flex  = b.styles.align === 'center' ? 'justify-center' : b.styles.align === 'right' ? 'justify-end' : 'justify-start';

    switch (b.type) {

      case 'navbar': return (
        <div className={`${mw} mx-auto flex items-center justify-between gap-4 flex-wrap`}>
          <span {...edt(b,'brandName')} className="font-black text-xl tracking-tight cursor-text" style={{color:brand}}>{b.content.brandName||'Brand'}</span>
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold flex-1 justify-center">
            {(b.content.links||[]).map((l,i)=>(
              <a key={i} href={l.url} onClick={e=>!isPreviewMode&&e.preventDefault()} style={{color:text,opacity:.75}} className="hover:opacity-100 transition-opacity">{l.label}</a>
            ))}
          </nav>
          {b.content.primaryBtnText&&(
            <span {...edt(b,'primaryBtnText')} className={`px-4 py-2 text-xs font-bold text-white cursor-text hidden sm:inline-block ${r}`} style={{backgroundColor:brand}}>
              {b.content.primaryBtnText}
            </span>
          )}
          <div className="md:hidden flex flex-col gap-1">
            {[0,1,2].map(i=><span key={i} className="w-5 h-px rounded" style={{backgroundColor:text}} />)}
          </div>
        </div>
      );

      case 'hero_section': return (
        <div className={`${mw} mx-auto grid grid-cols-1 ${b.content.imageUrl?'lg:grid-cols-2 gap-12 lg:gap-16':''} items-center ${align}`}>
          <div className="space-y-6">
            {b.content.subtitle&&(
              <div className={`flex ${flex}`}>
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${r}`} style={{background:`${brand}18`,color:brand}}>{b.content.subtitle}</span>
              </div>
            )}
            <h1 {...edt(b,'title')} className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight cursor-text" style={{color:text}}>
              {b.content.title}
            </h1>
            <p {...edt(b,'description')} className="text-sm md:text-base leading-relaxed opacity-75 cursor-text max-w-2xl" style={{margin:b.styles.align==='center'?'0 auto':undefined}}>
              {b.content.description}
            </p>
            <div className={`flex flex-wrap gap-3 pt-1 ${flex}`}>
              {b.content.primaryBtnText&&renderBtn(b.content.primaryBtnText, brand, b.content.primaryBtnStyle||'filled', '#fff', r)}
              {b.content.secondaryBtnText&&renderBtn(b.content.secondaryBtnText, brand, b.content.secondaryBtnStyle||'outline', text, r)}
            </div>
          </div>
          {b.content.imageUrl&&(
            <div className="flex justify-center mt-8 lg:mt-0">
              <img src={b.content.imageUrl} alt={b.content.imageAlt||''} referrerPolicy="no-referrer" className={`w-full max-h-[460px] object-cover ${r}`} />
            </div>
          )}
        </div>
      );

      case 'text_block': {
        const Tag = (b.content.textTag||'p') as any;
        return (
          <div className={`${mw} mx-auto ${align}`}>
            <Tag {...edt(b,'textContent')} className="cursor-text whitespace-pre-wrap"
              style={{
                fontSize:`${b.content.textFontSize||16}px`,
                fontWeight:b.content.textFontWeight||'400',
                lineHeight:b.content.textLineHeight||1.8,
                letterSpacing:`${(b.content.textLetterSpacing||0)/100}em`,
                textDecoration:b.content.textDecoration||'none',
                textTransform:b.content.textTransform||'none',
                color:text,
                borderLeft:b.content.textTag==='blockquote'?`4px solid ${brand}`:undefined,
                paddingLeft:b.content.textTag==='blockquote'?'1.5rem':undefined,
                fontStyle:b.content.textTag==='blockquote'?'italic':undefined,
                opacity:b.content.textTag==='blockquote'?.8:1,
              }}>
              {b.content.textContent||'Click to edit text…'}
            </Tag>
          </div>
        );
      }

      case 'stats_block': return (
        <div className={`${mw} mx-auto`}>
          {(b.content.subtitle||b.content.title)&&(
            <div className={`mb-12 ${align}`}>
              {b.content.subtitle&&<span className="text-xs font-black uppercase tracking-widest block mb-2" style={{color:brand}}>{b.content.subtitle}</span>}
              {b.content.title&&<h2 className="text-2xl md:text-4xl font-black tracking-tight" style={{color:text}}>{b.content.title}</h2>}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {(b.content.stats||[]).map((s,i)=>(
              <div key={i} className="text-center space-y-2">
                <div className="text-3xl md:text-5xl font-black tracking-tight" style={{color:brand}}>{s.prefix}{s.value}{s.suffix}</div>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-55" style={{color:text}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      );

      case 'logo_bar': return (
        <div className={`${mw} mx-auto text-center space-y-6`}>
          {b.content.logoBarTitle&&<p className="text-xs font-semibold uppercase tracking-widest opacity-40" style={{color:text}}>{b.content.logoBarTitle}</p>}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-50 grayscale hover:opacity-70 transition-all">
            {(b.content.logos||[]).map((logo,i)=>(
              <img key={i} src={logo.logoUrl} alt={logo.name} referrerPolicy="no-referrer" className="h-7 w-auto object-contain"
                onError={e=>{(e.target as HTMLImageElement).style.display='none';}} />
            ))}
          </div>
        </div>
      );

      case 'features_grid': return (
        <div className={`${mw} mx-auto space-y-12`}>
          <div className={`max-w-3xl ${b.styles.align==='center'?'mx-auto text-center':''} space-y-3`}>
            {b.content.subtitle&&<span className="text-xs font-black uppercase tracking-widest block" style={{color:brand}}>{b.content.subtitle}</span>}
            <h2 {...edt(b,'title')} className="text-2xl md:text-4xl font-black tracking-tight cursor-text" style={{color:text}}>{b.content.title}</h2>
            {b.content.description&&<p className="text-sm opacity-70 leading-relaxed">{b.content.description}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(b.content.features||[]).map((f,i)=>(
              <div key={i} className={cardCls(b)}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{background:`${brand}18`,color:brand}}><Star className="w-5 h-5"/></div>
                <h3 className="font-extrabold text-sm mb-2">{f.title}</h3>
                <p className="text-xs leading-relaxed opacity-75">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      );

      case 'testimonials': return (
        <div className={`${mw} mx-auto space-y-12`}>
          <div className="max-w-2xl mx-auto text-center space-y-3">
            {b.content.subtitle&&<span className="text-xs font-black uppercase tracking-widest block" style={{color:brand}}>{b.content.subtitle}</span>}
            <h2 className="text-2xl md:text-4xl font-black tracking-tight" style={{color:text}}>{b.content.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(b.content.testimonials||[]).map((t,i)=>(
              <div key={i} className={cardCls(b)}>
                <div className="flex mb-3" style={{color:'#fbbf24',fontSize:'0.875rem'}}>★★★★★</div>
                <p className="text-xs md:text-sm italic leading-relaxed opacity-90 mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4" style={{borderTop:'1px solid rgba(0,0,0,.06)'}}>
                  <img src={t.avatarUrl} alt={t.author} referrerPolicy="no-referrer" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  <div><h4 className="text-xs font-black">{t.author}</h4><span className="text-[10px] opacity-55">{t.role}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      case 'pricing_cards': return (
        <div className={`${mw} mx-auto space-y-12`}>
          <div className="max-w-2xl mx-auto text-center space-y-3">
            {b.content.subtitle&&<span className="text-xs font-black uppercase tracking-widest block" style={{color:brand}}>{b.content.subtitle}</span>}
            <h2 className="text-2xl md:text-4xl font-black tracking-tight" style={{color:text}}>{b.content.title}</h2>
            {b.content.description&&<p className="text-sm opacity-65">{b.content.description}</p>}
          </div>
          <div className={`grid grid-cols-1 ${(b.content.pricingPlans?.length||0)>=3?'md:grid-cols-3':'md:grid-cols-2 max-w-3xl mx-auto'} gap-5`}>
            {(b.content.pricingPlans||[]).map((p,i)=>(
              <div key={i} className={`${cardCls(b)} relative ${p.popular?'ring-2 ring-indigo-500 scale-[1.02] z-10':''}`}>
                {p.popular&&<span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-white text-[9px] font-black uppercase tracking-widest ${r}`} style={{backgroundColor:brand}}>Popular</span>}
                <h3 className="font-black text-[10px] uppercase tracking-widest opacity-50 mb-3">{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black">{p.price}</span>
                  <span className="text-xs opacity-40">/{p.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {p.features.map((f,fi)=>(
                    <li key={fi} className="flex items-start gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{color:brand}}/><span className="opacity-85">{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 text-xs font-black transition-all ${r}`} style={{background:p.popular?brand:'transparent',color:p.popular?'#fff':text,border:`2px solid ${brand}`}}>{p.btnText}</button>
              </div>
            ))}
          </div>
        </div>
      );

      case 'contact_form': return (
        <div className={`${mw} mx-auto text-center space-y-8`}>
          <div className="space-y-3">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight" style={{color:text}}>{b.content.title}</h2>
            {b.content.description&&<p className="text-sm opacity-65 max-w-md mx-auto leading-relaxed">{b.content.description}</p>}
          </div>
          <div className={`${cardCls(b)} text-left space-y-4 max-w-lg mx-auto`}>
            {(b.content.formFields||[]).map((f,i)=>(
              <div key={i} className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider opacity-50 block">{f.label}</label>
                {f.type==='textarea'
                  ?<textarea placeholder={f.placeholder} rows={3} disabled className="w-full p-3 text-xs border border-black/[0.08] bg-black/[0.03] rounded-xl font-medium resize-none"/>
                  :<input type={f.type} placeholder={f.placeholder} disabled className="w-full p-3 text-xs border border-black/[0.08] bg-black/[0.03] rounded-xl font-medium"/>}
              </div>
            ))}
            <button type="button" className={`w-full py-3.5 text-white font-black text-xs ${r}`} style={{backgroundColor:brand}}>{b.content.formBtnText||'Submit'}</button>
          </div>
        </div>
      );

      case 'cta_block': return (
        <div className={`${mw} mx-auto text-center space-y-6`}>
          <h2 {...edt(b,'title')} className="text-2xl md:text-4xl font-black tracking-tight cursor-text" style={{color:text}}>{b.content.title}</h2>
          <p {...edt(b,'description')} className="text-sm max-w-xl mx-auto leading-relaxed opacity-90 cursor-text">{b.content.description}</p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            {b.content.primaryBtnText&&<span className={`px-6 py-3 font-black text-xs inline-block ${r}`} style={{backgroundColor:b.styles.bgColor==='#4f46e5'||b.styles.useGradient?'rgba(255,255,255,0.95)':'#fff',color:brand,boxShadow:'0 4px 14px rgba(0,0,0,.15)'}}>{b.content.primaryBtnText}</span>}
            {b.content.secondaryBtnText&&<span className={`px-6 py-3 font-bold text-xs border-2 inline-block ${r}`} style={{borderColor:'rgba(255,255,255,.3)',color:text}}>{b.content.secondaryBtnText}</span>}
          </div>
        </div>
      );

      case 'image_block': return (
        <div className={`${mw} mx-auto text-center space-y-4`}>
          {b.content.imageUrl
            ?<img src={b.content.imageUrl} alt={b.content.imageAlt||''} referrerPolicy="no-referrer" className={`w-full max-h-[460px] object-cover ${r}`}
                style={{filter:b.content.imageFilter&&b.content.imageFilter!=='none'?getFilter(b.content.imageFilter):undefined}} />
            :<div className={`w-full h-48 border-2 border-dashed flex items-center justify-center ${r}`} style={{borderColor:'rgba(0,0,0,.15)',background:'rgba(0,0,0,.03)'}}>
              <span className="text-sm font-medium opacity-40">Add image URL in the panel →</span>
            </div>}
          {b.content.description&&<p className="text-xs opacity-50 italic">{b.content.description}</p>}
        </div>
      );

      case 'video_embed': return (
        <div className={`${mw} mx-auto text-center space-y-4`}>
          <h3 className="font-black text-base" style={{color:text}}>{b.content.title}</h3>
          {b.content.description&&<p className="text-xs opacity-65">{b.content.description}</p>}
          <div className={`aspect-video w-full overflow-hidden border ${r}`} style={{borderColor:'rgba(0,0,0,.1)'}}>
            {b.content.videoUrl
              ?<iframe src={b.content.videoUrl} className="w-full h-full" title="Video" allowFullScreen/>
              :<div className="w-full h-full bg-black/5 flex items-center justify-center"><span className="text-sm opacity-40">Add embed URL in the panel →</span></div>}
          </div>
        </div>
      );

      case 'faq_block': return (
        <div className={`${mw} mx-auto space-y-10`}>
          <div className={`max-w-2xl ${b.styles.align==='center'?'mx-auto text-center':''} space-y-3`}>
            {b.content.subtitle&&<span className="text-xs font-black uppercase tracking-widest block" style={{color:brand}}>{b.content.subtitle}</span>}
            <h2 className="text-2xl md:text-4xl font-black tracking-tight" style={{color:text}}>{b.content.title}</h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {(b.content.faqs||[]).map((faq,i)=>{
              const key=`${b.id}-${i}`; const open=openFaqs[key]===i;
              return (
                <div key={i} className={`${cardCls(b)} cursor-pointer`}
                  onClick={()=>setOpenFaqs(p=>({...p,[key]:open?null:i}))}>
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-bold text-sm flex-1">{faq.question}</h4>
                    {open?<ChevronUp className="w-4 h-4 opacity-40 flex-shrink-0"/>:<ChevronDown className="w-4 h-4 opacity-40 flex-shrink-0"/>}
                  </div>
                  {open&&<p className="text-xs leading-relaxed opacity-70 mt-3 pt-3" style={{borderTop:'1px solid rgba(0,0,0,.06)'}}>{faq.answer}</p>}
                </div>
              );
            })}
          </div>
        </div>
      );

      case 'team_block': return (
        <div className={`${mw} mx-auto space-y-12`}>
          <div className={`max-w-2xl ${b.styles.align==='center'?'mx-auto text-center':''} space-y-3`}>
            {b.content.subtitle&&<span className="text-xs font-black uppercase tracking-widest block" style={{color:brand}}>{b.content.subtitle}</span>}
            <h2 className="text-2xl md:text-4xl font-black tracking-tight" style={{color:text}}>{b.content.title}</h2>
            {b.content.description&&<p className="text-sm opacity-65">{b.content.description}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(b.content.team||[]).map((m,i)=>(
              <div key={i} className={`${cardCls(b)} text-center`}>
                {m.avatarUrl
                  ?<img src={m.avatarUrl} alt={m.name} referrerPolicy="no-referrer" className="w-16 h-16 rounded-full object-cover mx-auto mb-4 ring-2" style={{ringColor:brand}}/>
                  :<div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center font-black text-xl text-white" style={{background:`${brand}cc`}}>{m.name[0]||'?'}</div>}
                <h3 className="font-black text-sm">{m.name}</h3>
                <p className="text-xs font-bold mt-0.5 mb-3" style={{color:brand}}>{m.role}</p>
                <p className="text-xs opacity-65 leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      );

      case 'divider': return (
        <hr className={`w-full ${b.content.dividerStyle==='dashed'?'border-dashed':b.content.dividerStyle==='dotted'?'border-dotted':'border-solid'}`}
          style={{borderColor:`${text}20`}} />
      );

      case 'spacer': return <div style={{height:`${b.content.spacerHeight||48}px`}} className="w-full" />;

      case 'footer': return (
        <div className={`${mw} mx-auto flex flex-col md:flex-row items-center justify-between gap-4 flex-wrap text-xs font-medium`}>
          <span {...edt(b,'brandName')} className="font-black text-base cursor-text" style={{color:brand}}>{b.content.brandName}</span>
          <span {...edt(b,'copyright')} className="cursor-text opacity-45">{b.content.copyright}</span>
          <div className="flex flex-wrap gap-4 opacity-45">
            {(b.content.links||[]).map((l,i)=>(
              <a key={i} href={l.url} onClick={e=>!isPreviewMode&&e.preventDefault()} className="hover:opacity-100 transition-opacity">{l.label}</a>
            ))}
          </div>
        </div>
      );

      default: return <div className="text-xs opacity-30 text-center py-4">Unknown: {b.type}</div>;
    }
  };

  /* ── Preview mode ─────────────────────────────────────────── */
  if (isPreviewMode) {
    return (
      <div id="preview-viewport" className="flex-1 w-full min-h-screen overflow-y-auto scroll-smooth"
        style={{backgroundColor:project.style.background,fontFamily:project.style.fontFamily}}>
        {project.blocks.map(b=>(
          <div key={b.id} style={themeSection(b)}>
            <div style={{paddingTop:`${b.styles.paddingTop}px`,paddingBottom:`${b.styles.paddingBottom}px`}} className="w-full px-4 sm:px-8 md:px-12 lg:px-16">
              {renderBlock(b)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ── Editor mode ──────────────────────────────────────────── */
  return (
    <div id="landy-canvas" className="flex-1 overflow-auto flex justify-center items-start p-8 md:p-12 min-h-0 relative"
      onClick={()=>setSelection({blockId:null,elementId:null})}>

      {/* Zoom indicator */}
      {zoom !== 100 && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full text-xs font-bold pointer-events-none"
          style={{background:'rgba(0,0,0,.7)',color:'#fff',backdropFilter:'blur(8px)'}}>
          {zoom}%
        </div>
      )}

      {/* Device frame */}
      <div
        className={`flex flex-col overflow-hidden transition-all duration-300 mx-auto ${
          viewport==='mobile' ? 'device-frame-mobile' :
          viewport==='tablet' ? 'device-frame-tablet' :
          'device-frame-laptop'
        }`}
        style={{
          width: vw(),
          height: vh(),
          transform: `scale(${zoom/100})`,
          transformOrigin: 'top center',
          background: project.style.background,
          maxHeight: viewport==='desktop'||viewport==='laptop' ? 'none' : undefined,
          minHeight: viewport==='desktop'||viewport==='laptop' ? '400px' : undefined,
        }}
        onClick={e=>e.stopPropagation()}
      >
        {/* Device notch */}
        {(viewport==='mobile'||viewport==='tablet')&&(
          <div className="flex justify-center items-center py-2 shrink-0" style={{background:'#111'}}>
            <div className="w-16 h-3.5 rounded-full" style={{background:'#0a0a0a'}} />
          </div>
        )}

        {/* Blocks */}
        <div className="flex-1 overflow-y-auto" style={{backgroundColor:project.style.background}}>
          {project.blocks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{minHeight:400}}>
              <Sparkles className="w-8 h-8 mb-3" style={{color:'#18a0fb',opacity:.5}} />
              <p style={{fontSize:13,fontWeight:700,color:'#555',marginBottom:4}}>Canvas is empty</p>
              <p style={{fontSize:11,color:'#444',maxWidth:220,marginBottom:20}}>Add blocks from the left panel to start building</p>
              <div className="grid grid-cols-2 gap-2" style={{maxWidth:240}}>
                {(['navbar','hero_section','features_grid','cta_block'] as const).map(t=>(
                  <button key={t} onClick={()=>onAddBlock(t)} style={{padding:'6px 12px',background:'#2c2c2c',border:'1px solid #3a3a3a',borderRadius:6,color:'#aaa',fontSize:11,fontWeight:500,cursor:'pointer'}}>
                    + {t.split('_')[0]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            project.blocks.map((block, idx) => {
              const isSel = selection.blockId === block.id;
              const isGhost = draggedId === block.id;

              return (
                <div
                  key={block.id}
                  id={`cb-${block.id}`}
                  onClick={e => { e.stopPropagation(); setSelection({ blockId: block.id, elementId: null }); }}
                  draggable
                  onDragStart={e => { setDraggedId(block.id); e.dataTransfer.effectAllowed = 'move'; }}
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
                    const si = project.blocks.findIndex(b => b.id === draggedId);
                    if (si === -1) return;
                    const next = [...project.blocks];
                    const [moved] = next.splice(si, 1);
                    let ti = project.blocks.findIndex(b => b.id === block.id);
                    if (dragOverPos === 'bottom') ti++;
                    next.splice(ti, 0, moved);
                    onReorderBlocks(next);
                    setDraggedId(null); setDragOverIdx(null);
                  }}
                  style={{
                    ...themeSection(block),
                    position: 'relative',
                    cursor: 'grab',
                    opacity: isGhost ? 0.2 : 1,
                    outline: isSel ? '2px solid #18a0fb' : 'none',
                    outlineOffset: '-1px',
                    transition: 'opacity 0.15s',
                  }}
                  className="group"
                >
                  {/* Drop line */}
                  {draggedId && dragOverIdx === idx && (
                    <div className="drop-indicator" style={{ top: dragOverPos === 'top' ? 0 : 'auto', bottom: dragOverPos === 'bottom' ? 0 : 'auto' }} />
                  )}

                  {/* Selection label */}
                  {isSel && (
                    <>
                      <div className="fig-label-tag">{block.name}</div>
                      {/* Handles */}
                      {[{top:-3,left:-3},{top:-3,right:-3},{bottom:-3,left:-3},{bottom:-3,right:-3}].map((pos,i)=>(
                        <div key={i} className="sel-handle" style={pos as any} />
                      ))}
                      {/* Dimensions badge */}
                      {dimensions && (
                        <div style={{position:'absolute',bottom:-24,right:0,background:'#18a0fb',color:'#fff',fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:'0 0 3px 3px',whiteSpace:'nowrap',pointerEvents:'none',zIndex:40}}>
                          {dimensions.w} × {dimensions.h}
                        </div>
                      )}
                    </>
                  )}

                  {/* Hover toolbar */}
                  <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-40 rounded-md overflow-hidden"
                    style={{background:'rgba(0,0,0,.75)',backdropFilter:'blur(8px)'}}>
                    <span style={{fontSize:9,color:'#888',padding:'0 6px',fontFamily:'monospace',textTransform:'uppercase'}}>{block.type.replace(/_/g,' ')}</span>
                    <div style={{width:1,height:16,background:'rgba(255,255,255,.15)'}} />
                    {[
                      { icon: <ArrowUp size={12}/>, title:'Up',    onClick:()=>onMoveBlock(block.id,'up'),   disabled:idx===0 },
                      { icon: <ArrowDown size={12}/>, title:'Down', onClick:()=>onMoveBlock(block.id,'down'), disabled:idx===project.blocks.length-1 },
                      { icon: <Copy size={12}/>, title:'Duplicate', onClick:()=>onDuplicateBlock(block.id) },
                      { icon: <Trash2 size={12}/>, title:'Delete', onClick:()=>{onDeleteBlock(block.id);if(isSel)setSelection({blockId:null,elementId:null});}, danger:true },
                    ].map((btn,i)=>(
                      <button key={i} title={btn.title}
                        disabled={(btn as any).disabled}
                        onClick={e=>{e.stopPropagation();btn.onClick();}}
                        style={{background:'transparent',border:'none',cursor:(btn as any).disabled?'not-allowed':'pointer',padding:'5px 6px',color:(btn as any).danger?'#f87171':'#ccc',opacity:(btn as any).disabled?.3:1,display:'flex',alignItems:'center'}}
                        onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.1)';}}
                        onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
                        {btn.icon}
                      </button>
                    ))}
                  </div>

                  {/* Content */}
                  <div style={{paddingTop:`${block.styles.paddingTop}px`,paddingBottom:`${block.styles.paddingBottom}px`}}
                    className="w-full px-4 sm:px-8 md:px-12">
                    {renderBlock(block)}
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

function getFilter(f: string): string {
  return ({ grayscale:'grayscale(100%)',blur:'blur(4px)',sepia:'sepia(80%)',vintage:'sepia(40%) contrast(120%) saturate(110%) hue-rotate(-10deg)',warm:'saturate(130%) contrast(105%) sepia(8%)',cool:'hue-rotate(12deg) saturate(95%) brightness(105%)' }[f] || 'none');
}
