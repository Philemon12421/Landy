import React, { useState } from 'react';
import { ProjectState, Block, StyleConfig, SelectionState, BlockType } from '../types';
import {
  Trash2, Copy, ArrowUp, ArrowDown, Layers, AlignLeft, AlignCenter, AlignRight,
  Check, Sparkles, Search, Plus, ChevronDown, ChevronRight, ChevronUp,
  LayoutTemplate, SquareEqual, MessageSquare, CreditCard, Mail, Image,
  PlayCircle, Navigation, Minimize, ToggleRight, PlusCircle, Palette,
  Type, Users, HelpCircle, TrendingUp, Grid, Settings2, Eye
} from 'lucide-react';

interface Props {
  project: ProjectState;
  onChangeStyle: (s: StyleConfig) => void;
  selection: SelectionState;
  setSelection: (s: SelectionState) => void;
  onUpdateBlock: (id: string, u: Partial<Block>) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onMoveBlock: (id: string, dir: 'up' | 'down') => void;
  onAddBlock: (t: BlockType) => void;
}

const FONTS = [
  { label: 'Inter',           value: 'Inter, system-ui, sans-serif' },
  { label: 'Poppins',         value: "'Poppins', sans-serif" },
  { label: 'Space Grotesk',   value: "'Space Grotesk', sans-serif" },
  { label: 'DM Sans',         value: "'DM Sans', sans-serif" },
  { label: 'Syne',            value: "'Syne', sans-serif" },
  { label: 'Playfair Display',value: "'Playfair Display', serif" },
  { label: 'Georgia',         value: 'Georgia, serif' },
  { label: 'Roboto',          value: "'Roboto', sans-serif" },
  { label: 'Courier New',     value: "'Courier New', monospace" },
];

const BG_SWATCHES   = ['#ffffff','#f8fafc','#0f172a','#1e293b','#020617','#fef08a','#fff7ed','#ecfdf5','#fdf4ff','#eff6ff'];
const BRAND_SWATCHES = ['#4f46e5','#2563eb','#7c3aed','#0ea5e9','#10b981','#f59e0b','#ef4444','#ec4899','#000000','#f97316'];

/* Small reusable atoms */
const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-2 py-1" style={{ minHeight: 28 }}>
    <span style={{ fontSize: 11, color: '#888', width: 64, flexShrink: 0 }}>{label}</span>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

const FigInput = ({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    className="fig-input w-full" style={{ fontSize: 11, height: 26 }} />
);

const FigTextArea = ({ value, onChange, rows = 3, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
    className="fig-input w-full" style={{ fontSize: 11, resize: 'vertical' }} />
);

const FigSelect = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
  <div className="relative">
    <select value={value} onChange={e => onChange(e.target.value)} className="fig-select w-full pr-5" style={{ fontSize: 11, height: 26 }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <ChevronDown size={10} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', color: '#666', pointerEvents: 'none' }} />
  </div>
);

const SectionWrap = ({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid #3a3a3a' }}>
      <button onClick={() => setOpen(v => !v)}
        className="fig-section-header w-full text-left"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
        {open ? <ChevronDown size={12} style={{ color: '#666' }} /> : <ChevronRight size={12} style={{ color: '#666' }} />}
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
};

const SwatchRow = ({ colors, selected, onPick, onCustom }: { colors: string[]; selected: string; onPick: (c: string) => void; onCustom: (c: string) => void }) => (
  <div className="flex items-center gap-1.5 flex-wrap">
    <input type="color" value={selected.startsWith('#') ? selected : '#ffffff'} onChange={e => onCustom(e.target.value)}
      style={{ width: 20, height: 20, borderRadius: 3, cursor: 'pointer', flexShrink: 0 }} />
    {colors.map(c => (
      <button key={c} onClick={() => onPick(c)} className="color-chip" style={{ backgroundColor: c, outline: selected === c ? '2px solid #18a0fb' : 'none', outlineOffset: 1 }} />
    ))}
  </div>
);

/* ── Block library config ─────────────────────────────────── */
const BLOCKS = [
  { type: 'navbar'       as BlockType, label: 'Navbar',         icon: Navigation,     cat: 'Layout' },
  { type: 'footer'       as BlockType, label: 'Footer',         icon: ToggleRight,    cat: 'Layout' },
  { type: 'hero_section' as BlockType, label: 'Hero',           icon: LayoutTemplate, cat: 'Sections' },
  { type: 'text_block'   as BlockType, label: 'Text',           icon: Type,           cat: 'Sections', isNew: true },
  { type: 'stats_block'  as BlockType, label: 'Stats',          icon: TrendingUp,     cat: 'Sections', isNew: true },
  { type: 'features_grid'as BlockType, label: 'Features',       icon: SquareEqual,    cat: 'Sections' },
  { type: 'testimonials' as BlockType, label: 'Testimonials',   icon: MessageSquare,  cat: 'Sections' },
  { type: 'pricing_cards'as BlockType, label: 'Pricing',        icon: CreditCard,     cat: 'Sections' },
  { type: 'faq_block'    as BlockType, label: 'FAQ',            icon: HelpCircle,     cat: 'Sections', isNew: true },
  { type: 'team_block'   as BlockType, label: 'Team',           icon: Users,          cat: 'Sections', isNew: true },
  { type: 'logo_bar'     as BlockType, label: 'Logo Bar',       icon: Grid,           cat: 'Sections', isNew: true },
  { type: 'cta_block'    as BlockType, label: 'CTA',            icon: Sparkles,       cat: 'Sections' },
  { type: 'contact_form' as BlockType, label: 'Form',           icon: Mail,           cat: 'Sections' },
  { type: 'image_block'  as BlockType, label: 'Image',          icon: Image,          cat: 'Media' },
  { type: 'video_embed'  as BlockType, label: 'Video',          icon: PlayCircle,     cat: 'Media' },
  { type: 'divider'      as BlockType, label: 'Divider',        icon: Minimize,       cat: 'Utility' },
  { type: 'spacer'       as BlockType, label: 'Spacer',         icon: Layers,         cat: 'Utility' },
];

export default function RightPropertiesPanel({ project, onChangeStyle, selection, setSelection, onUpdateBlock, onDeleteBlock, onDuplicateBlock, onMoveBlock, onAddBlock }: Props) {
  const [tab, setTab] = useState<'blocks' | 'layers' | 'design'>('blocks');
  const [blockTab, setBlockTab] = useState<'content' | 'style' | 'layout'>('content');
  const [search, setSearch] = useState('');
  const sel = project.blocks.find(b => b.id === selection.blockId);

  const upd  = (content: any) => sel && onUpdateBlock(sel.id, { content: { ...sel.content, ...content } });
  const updS = (styles:  any) => sel && onUpdateBlock(sel.id, { styles:  { ...sel.styles,  ...styles  } });

  const filtered = BLOCKS.filter(b =>
    b.label.toLowerCase().includes(search.toLowerCase()) ||
    b.cat.toLowerCase().includes(search.toLowerCase())
  );
  const cats = [...new Set(filtered.map(b => b.cat))];

  /* ── Content panel per block type ─────────────────────── */
  const renderContent = () => {
    if (!sel) return null;

    if (sel.type === 'text_block') return (
      <div className="space-y-3">
        <FigTextArea value={sel.content.textContent || ''} onChange={v => upd({ textContent: v })} rows={5} placeholder="Your text…" />
        <Row label="Tag">
          <FigSelect value={sel.content.textTag || 'p'} onChange={v => upd({ textTag: v })}
            options={[{value:'p',label:'Paragraph'},{value:'h1',label:'H1'},{value:'h2',label:'H2'},{value:'h3',label:'H3'},{value:'h4',label:'H4'},{value:'blockquote',label:'Blockquote'}]} />
        </Row>
        <Row label="Size">
          <div className="flex items-center gap-2">
            <FigInput value={String(sel.content.textFontSize || 16)} onChange={v => upd({ textFontSize: +v })} />
            <span style={{ fontSize: 10, color: '#666' }}>px</span>
          </div>
        </Row>
        <Row label="Weight">
          <FigSelect value={sel.content.textFontWeight || '400'} onChange={v => upd({ textFontWeight: v })}
            options={[{value:'400',label:'Regular'},{value:'500',label:'Medium'},{value:'600',label:'Semibold'},{value:'700',label:'Bold'},{value:'800',label:'Extrabold'},{value:'900',label:'Black'}]} />
        </Row>
        <Row label="Line H">
          <input type="range" min={1} max={3} step={0.1} value={sel.content.textLineHeight || 1.8} onChange={e => upd({ textLineHeight: +e.target.value })} />
        </Row>
        <Row label="Tracking">
          <input type="range" min={-10} max={30} step={1} value={sel.content.textLetterSpacing || 0} onChange={e => upd({ textLetterSpacing: +e.target.value })} />
        </Row>
        <Row label="Decor">
          <FigSelect value={sel.content.textDecoration || 'none'} onChange={v => upd({ textDecoration: v })}
            options={[{value:'none',label:'None'},{value:'underline',label:'Underline'},{value:'line-through',label:'Strike'}]} />
        </Row>
        <Row label="Case">
          <FigSelect value={sel.content.textTransform || 'none'} onChange={v => upd({ textTransform: v })}
            options={[{value:'none',label:'As typed'},{value:'uppercase',label:'UPPER'},{value:'lowercase',label:'lower'},{value:'capitalize',label:'Capitalize'}]} />
        </Row>
      </div>
    );

    if (sel.type === 'navbar') return (
      <div className="space-y-3">
        <Row label="Brand"><FigInput value={sel.content.brandName || ''} onChange={v => upd({ brandName: v })} /></Row>
        <div style={{ borderTop: '1px solid #3a3a3a', paddingTop: 8 }}>
          <p className="section-label mb-2">Nav Links</p>
          {(sel.content.links || []).map((lnk, i) => (
            <div key={i} className="flex gap-1.5 items-center mb-1.5">
              <input value={lnk.label} placeholder="Label" onChange={e => { const l = [...(sel.content.links||[])]; l[i]={...l[i],label:e.target.value}; upd({links:l}); }} className="fig-input flex-1" style={{fontSize:11,height:26}} />
              <input value={lnk.url} placeholder="#link" onChange={e => { const l = [...(sel.content.links||[])]; l[i]={...l[i],url:e.target.value}; upd({links:l}); }} className="fig-input flex-1" style={{fontSize:11,height:26}} />
              <button onClick={() => upd({links:(sel.content.links||[]).filter((_,li)=>li!==i)})} style={{color:'#ef4444',fontSize:14,background:'none',border:'none',cursor:'pointer',flexShrink:0}}>✕</button>
            </div>
          ))}
          <button onClick={() => upd({links:[...(sel.content.links||[]),{label:'Link',url:'#'}]})} className="w-full flex items-center justify-center gap-1 py-1.5 rounded text-[11px] font-medium" style={{background:'#3a3a3a',color:'#aaa',border:'none',cursor:'pointer',marginTop:4}}>
            <Plus size={11} /> Add link
          </button>
        </div>
        <Row label="CTA text"><FigInput value={sel.content.primaryBtnText || ''} onChange={v => upd({ primaryBtnText: v })} /></Row>
        <Row label="CTA url"><FigInput value={sel.content.primaryBtnUrl || ''} onChange={v => upd({ primaryBtnUrl: v })} placeholder="https://…" /></Row>
      </div>
    );

    if (sel.type === 'hero_section') return (
      <div className="space-y-3">
        <Row label="Eyebrow"><FigInput value={sel.content.subtitle || ''} onChange={v => upd({ subtitle: v })} placeholder="Tag line" /></Row>
        <div><p style={{fontSize:11,color:'#888',marginBottom:4}}>Headline</p><FigTextArea value={sel.content.title || ''} onChange={v => upd({ title: v })} rows={3} /></div>
        <div><p style={{fontSize:11,color:'#888',marginBottom:4}}>Description</p><FigTextArea value={sel.content.description || ''} onChange={v => upd({ description: v })} rows={3} /></div>
        <div style={{borderTop:'1px solid #3a3a3a',paddingTop:8}}>
          <p className="section-label mb-2">Primary Button</p>
          <div className="flex gap-1.5 mb-1.5">
            <input placeholder="Label" value={sel.content.primaryBtnText||''} onChange={e=>upd({primaryBtnText:e.target.value})} className="fig-input flex-1" style={{fontSize:11,height:26}} />
            <input placeholder="URL" value={sel.content.primaryBtnUrl||''} onChange={e=>upd({primaryBtnUrl:e.target.value})} className="fig-input flex-1" style={{fontSize:11,height:26}} />
          </div>
          <FigSelect value={sel.content.primaryBtnStyle||'filled'} onChange={v=>upd({primaryBtnStyle:v})} options={[{value:'filled',label:'Filled'},{value:'outline',label:'Outline'},{value:'ghost',label:'Ghost'}]} />
        </div>
        <div style={{borderTop:'1px solid #3a3a3a',paddingTop:8}}>
          <p className="section-label mb-2">Secondary Button</p>
          <div className="flex gap-1.5 mb-1.5">
            <input placeholder="Label" value={sel.content.secondaryBtnText||''} onChange={e=>upd({secondaryBtnText:e.target.value})} className="fig-input flex-1" style={{fontSize:11,height:26}} />
            <input placeholder="URL" value={sel.content.secondaryBtnUrl||''} onChange={e=>upd({secondaryBtnUrl:e.target.value})} className="fig-input flex-1" style={{fontSize:11,height:26}} />
          </div>
          <FigSelect value={sel.content.secondaryBtnStyle||'outline'} onChange={v=>upd({secondaryBtnStyle:v})} options={[{value:'filled',label:'Filled'},{value:'outline',label:'Outline'},{value:'ghost',label:'Ghost'}]} />
        </div>
        <div style={{borderTop:'1px solid #3a3a3a',paddingTop:8}}>
          <p className="section-label mb-2">Hero Image</p>
          <FigInput value={sel.content.imageUrl||''} onChange={v=>upd({imageUrl:v})} placeholder="https://…" />
        </div>
      </div>
    );

    if (sel.type === 'stats_block') return (
      <div className="space-y-3">
        <Row label="Title"><FigInput value={sel.content.title||''} onChange={v=>upd({title:v})} /></Row>
        <Row label="Eyebrow"><FigInput value={sel.content.subtitle||''} onChange={v=>upd({subtitle:v})} /></Row>
        <div style={{borderTop:'1px solid #3a3a3a',paddingTop:8}}>
          <p className="section-label mb-2">Stats ({(sel.content.stats||[]).length})</p>
          {(sel.content.stats||[]).map((s:any,i:number)=>(
            <div key={i} className="mb-2 p-2 rounded" style={{background:'#333',border:'1px solid #444'}}>
              <div className="flex justify-between mb-1.5"><span style={{fontSize:10,color:'#888'}}>Stat {i+1}</span><button onClick={()=>{const ss=(sel.content.stats||[]).filter((_:any,si:number)=>si!==i);upd({stats:ss});}} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:12}}>✕</button></div>
              <div className="flex gap-1.5 mb-1">
                <input placeholder="Prefix" value={s.prefix||''} onChange={e=>{const ss=[...(sel.content.stats||[])];ss[i]={...ss[i],prefix:e.target.value};upd({stats:ss});}} className="fig-input" style={{fontSize:11,height:24,width:'30%'}} />
                <input placeholder="Value*" value={s.value} onChange={e=>{const ss=[...(sel.content.stats||[])];ss[i]={...ss[i],value:e.target.value};upd({stats:ss});}} className="fig-input" style={{fontSize:11,height:24,flex:1,fontWeight:600}} />
                <input placeholder="Suffix" value={s.suffix||''} onChange={e=>{const ss=[...(sel.content.stats||[])];ss[i]={...ss[i],suffix:e.target.value};upd({stats:ss});}} className="fig-input" style={{fontSize:11,height:24,width:'30%'}} />
              </div>
              <input placeholder="Label" value={s.label} onChange={e=>{const ss=[...(sel.content.stats||[])];ss[i]={...ss[i],label:e.target.value};upd({stats:ss});}} className="fig-input w-full" style={{fontSize:11,height:24}} />
            </div>
          ))}
          <button onClick={()=>upd({stats:[...(sel.content.stats||[]),{value:'99',label:'Metric',suffix:'+'}]})} className="w-full flex items-center justify-center gap-1 py-1.5 rounded text-[11px]" style={{background:'#3a3a3a',color:'#aaa',border:'none',cursor:'pointer'}}>
            <Plus size={11} /> Add stat
          </button>
        </div>
      </div>
    );

    if (sel.type === 'features_grid') return (
      <div className="space-y-3">
        <Row label="Title"><FigInput value={sel.content.title||''} onChange={v=>upd({title:v})} /></Row>
        <Row label="Eyebrow"><FigInput value={sel.content.subtitle||''} onChange={v=>upd({subtitle:v})} /></Row>
        <div><p style={{fontSize:11,color:'#888',marginBottom:4}}>Description</p><FigTextArea value={sel.content.description||''} onChange={v=>upd({description:v})} rows={2} /></div>
        <div style={{borderTop:'1px solid #3a3a3a',paddingTop:8}}>
          <p className="section-label mb-2">Features ({(sel.content.features||[]).length})</p>
          {(sel.content.features||[]).map((f:any,i:number)=>(
            <div key={i} className="mb-2 p-2 rounded" style={{background:'#333',border:'1px solid #444'}}>
              <div className="flex justify-between mb-1.5"><span style={{fontSize:10,color:'#888'}}>#{i+1}</span><button onClick={()=>upd({features:(sel.content.features||[]).filter((_:any,fi:number)=>fi!==i)})} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:12}}>✕</button></div>
              <input placeholder="Title" value={f.title} onChange={e=>{const ff=[...(sel.content.features||[])];ff[i]={...ff[i],title:e.target.value};upd({features:ff});}} className="fig-input w-full mb-1" style={{fontSize:11,height:24}} />
              <textarea placeholder="Description" rows={2} value={f.description} onChange={e=>{const ff=[...(sel.content.features||[])];ff[i]={...ff[i],description:e.target.value};upd({features:ff});}} className="fig-input w-full" style={{fontSize:11,resize:'none'}} />
            </div>
          ))}
          <button onClick={()=>upd({features:[...(sel.content.features||[]),{icon:'Star',title:'Feature',description:'Description.'}]})} className="w-full flex items-center justify-center gap-1 py-1.5 rounded text-[11px]" style={{background:'#3a3a3a',color:'#aaa',border:'none',cursor:'pointer'}}>
            <Plus size={11} /> Add feature
          </button>
        </div>
      </div>
    );

    if (sel.type === 'testimonials') return (
      <div className="space-y-3">
        <Row label="Title"><FigInput value={sel.content.title||''} onChange={v=>upd({title:v})} /></Row>
        <Row label="Eyebrow"><FigInput value={sel.content.subtitle||''} onChange={v=>upd({subtitle:v})} /></Row>
        <div style={{borderTop:'1px solid #3a3a3a',paddingTop:8}}>
          {(sel.content.testimonials||[]).map((t:any,i:number)=>(
            <div key={i} className="mb-2 p-2 rounded" style={{background:'#333',border:'1px solid #444'}}>
              <div className="flex justify-between mb-1.5"><span style={{fontSize:10,color:'#888'}}>Review {i+1}</span><button onClick={()=>upd({testimonials:(sel.content.testimonials||[]).filter((_:any,ti:number)=>ti!==i)})} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:12}}>✕</button></div>
              <textarea rows={2} placeholder="Quote" value={t.quote} onChange={e=>{const ts=[...(sel.content.testimonials||[])];ts[i]={...ts[i],quote:e.target.value};upd({testimonials:ts});}} className="fig-input w-full mb-1" style={{fontSize:11,resize:'none'}} />
              <div className="flex gap-1.5 mb-1">
                <input placeholder="Name" value={t.author} onChange={e=>{const ts=[...(sel.content.testimonials||[])];ts[i]={...ts[i],author:e.target.value};upd({testimonials:ts});}} className="fig-input flex-1" style={{fontSize:11,height:24}} />
                <input placeholder="Role" value={t.role} onChange={e=>{const ts=[...(sel.content.testimonials||[])];ts[i]={...ts[i],role:e.target.value};upd({testimonials:ts});}} className="fig-input flex-1" style={{fontSize:11,height:24}} />
              </div>
              <input placeholder="Avatar URL" value={t.avatarUrl} onChange={e=>{const ts=[...(sel.content.testimonials||[])];ts[i]={...ts[i],avatarUrl:e.target.value};upd({testimonials:ts});}} className="fig-input w-full" style={{fontSize:11,height:24}} />
            </div>
          ))}
          <button onClick={()=>upd({testimonials:[...(sel.content.testimonials||[]),{quote:'Great!',author:'Name',role:'Role',avatarUrl:''}]})} className="w-full flex items-center justify-center gap-1 py-1.5 rounded text-[11px]" style={{background:'#3a3a3a',color:'#aaa',border:'none',cursor:'pointer'}}>
            <Plus size={11} /> Add review
          </button>
        </div>
      </div>
    );

    if (sel.type === 'pricing_cards') return (
      <div className="space-y-3">
        <Row label="Title"><FigInput value={sel.content.title||''} onChange={v=>upd({title:v})} /></Row>
        <Row label="Eyebrow"><FigInput value={sel.content.subtitle||''} onChange={v=>upd({subtitle:v})} /></Row>
        <div><p style={{fontSize:11,color:'#888',marginBottom:4}}>Description</p><FigTextArea value={sel.content.description||''} onChange={v=>upd({description:v})} rows={2} /></div>
        <div style={{borderTop:'1px solid #3a3a3a',paddingTop:8}}>
          {(sel.content.pricingPlans||[]).map((p:any,i:number)=>(
            <div key={i} className="mb-2 p-2 rounded" style={{background:'#333',border:'1px solid #444'}}>
              <div className="flex justify-between items-center mb-1.5">
                <label className="flex items-center gap-1.5 cursor-pointer" style={{fontSize:10,color:'#888'}}>
                  <input type="checkbox" checked={!!p.popular} onChange={e=>{const pp=[...(sel.content.pricingPlans||[])];pp[i]={...pp[i],popular:e.target.checked};upd({pricingPlans:pp});}} /> Popular
                </label>
                <button onClick={()=>upd({pricingPlans:(sel.content.pricingPlans||[]).filter((_:any,pi:number)=>pi!==i)})} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:12}}>✕</button>
              </div>
              <div className="grid grid-cols-3 gap-1 mb-1">
                <input placeholder="Name" value={p.name} onChange={e=>{const pp=[...(sel.content.pricingPlans||[])];pp[i]={...pp[i],name:e.target.value};upd({pricingPlans:pp});}} className="fig-input" style={{fontSize:11,height:24}} />
                <input placeholder="Price" value={p.price} onChange={e=>{const pp=[...(sel.content.pricingPlans||[])];pp[i]={...pp[i],price:e.target.value};upd({pricingPlans:pp});}} className="fig-input" style={{fontSize:11,height:24}} />
                <input placeholder="Period" value={p.period} onChange={e=>{const pp=[...(sel.content.pricingPlans||[])];pp[i]={...pp[i],period:e.target.value};upd({pricingPlans:pp});}} className="fig-input" style={{fontSize:11,height:24}} />
              </div>
              <textarea rows={3} placeholder="Features (one per line)" value={(p.features||[]).join('\n')} onChange={e=>{const pp=[...(sel.content.pricingPlans||[])];pp[i]={...pp[i],features:e.target.value.split('\n').filter(Boolean)};upd({pricingPlans:pp});}} className="fig-input w-full mb-1" style={{fontSize:11,resize:'none'}} />
              <input placeholder="Button text" value={p.btnText} onChange={e=>{const pp=[...(sel.content.pricingPlans||[])];pp[i]={...pp[i],btnText:e.target.value};upd({pricingPlans:pp});}} className="fig-input w-full" style={{fontSize:11,height:24}} />
            </div>
          ))}
          <button onClick={()=>upd({pricingPlans:[...(sel.content.pricingPlans||[]),{name:'Plan',price:'$0',period:'mo',features:['Feature 1'],btnText:'Get Started'}]})} className="w-full flex items-center justify-center gap-1 py-1.5 rounded text-[11px]" style={{background:'#3a3a3a',color:'#aaa',border:'none',cursor:'pointer'}}>
            <Plus size={11} /> Add plan
          </button>
        </div>
      </div>
    );

    if (sel.type === 'faq_block') return (
      <div className="space-y-3">
        <Row label="Title"><FigInput value={sel.content.title||''} onChange={v=>upd({title:v})} /></Row>
        <Row label="Eyebrow"><FigInput value={sel.content.subtitle||''} onChange={v=>upd({subtitle:v})} /></Row>
        <div style={{borderTop:'1px solid #3a3a3a',paddingTop:8}}>
          {(sel.content.faqs||[]).map((f:any,i:number)=>(
            <div key={i} className="mb-2 p-2 rounded" style={{background:'#333',border:'1px solid #444'}}>
              <div className="flex justify-between mb-1.5"><span style={{fontSize:10,color:'#888'}}>Q{i+1}</span><button onClick={()=>upd({faqs:(sel.content.faqs||[]).filter((_:any,fi:number)=>fi!==i)})} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:12}}>✕</button></div>
              <input placeholder="Question" value={f.question} onChange={e=>{const ff=[...(sel.content.faqs||[])];ff[i]={...ff[i],question:e.target.value};upd({faqs:ff});}} className="fig-input w-full mb-1" style={{fontSize:11,height:24}} />
              <textarea rows={2} placeholder="Answer" value={f.answer} onChange={e=>{const ff=[...(sel.content.faqs||[])];ff[i]={...ff[i],answer:e.target.value};upd({faqs:ff});}} className="fig-input w-full" style={{fontSize:11,resize:'none'}} />
            </div>
          ))}
          <button onClick={()=>upd({faqs:[...(sel.content.faqs||[]),{question:'Question?',answer:'Answer.'}]})} className="w-full flex items-center justify-center gap-1 py-1.5 rounded text-[11px]" style={{background:'#3a3a3a',color:'#aaa',border:'none',cursor:'pointer'}}>
            <Plus size={11} /> Add FAQ
          </button>
        </div>
      </div>
    );

    if (sel.type === 'team_block') return (
      <div className="space-y-3">
        <Row label="Title"><FigInput value={sel.content.title||''} onChange={v=>upd({title:v})} /></Row>
        <Row label="Eyebrow"><FigInput value={sel.content.subtitle||''} onChange={v=>upd({subtitle:v})} /></Row>
        <div style={{borderTop:'1px solid #3a3a3a',paddingTop:8}}>
          {(sel.content.team||[]).map((m:any,i:number)=>(
            <div key={i} className="mb-2 p-2 rounded" style={{background:'#333',border:'1px solid #444'}}>
              <div className="flex justify-between mb-1.5"><span style={{fontSize:10,color:'#888'}}>Member {i+1}</span><button onClick={()=>upd({team:(sel.content.team||[]).filter((_:any,ti:number)=>ti!==i)})} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:12}}>✕</button></div>
              <input placeholder="Name" value={m.name} onChange={e=>{const t=[...(sel.content.team||[])];t[i]={...t[i],name:e.target.value};upd({team:t});}} className="fig-input w-full mb-1" style={{fontSize:11,height:24}} />
              <input placeholder="Role" value={m.role} onChange={e=>{const t=[...(sel.content.team||[])];t[i]={...t[i],role:e.target.value};upd({team:t});}} className="fig-input w-full mb-1" style={{fontSize:11,height:24}} />
              <textarea rows={2} placeholder="Bio" value={m.bio} onChange={e=>{const t=[...(sel.content.team||[])];t[i]={...t[i],bio:e.target.value};upd({team:t});}} className="fig-input w-full mb-1" style={{fontSize:11,resize:'none'}} />
              <input placeholder="Avatar URL" value={m.avatarUrl} onChange={e=>{const t=[...(sel.content.team||[])];t[i]={...t[i],avatarUrl:e.target.value};upd({team:t});}} className="fig-input w-full" style={{fontSize:11,height:24}} />
            </div>
          ))}
          <button onClick={()=>upd({team:[...(sel.content.team||[]),{name:'Name',role:'Role',bio:'',avatarUrl:''}]})} className="w-full flex items-center justify-center gap-1 py-1.5 rounded text-[11px]" style={{background:'#3a3a3a',color:'#aaa',border:'none',cursor:'pointer'}}>
            <Plus size={11} /> Add member
          </button>
        </div>
      </div>
    );

    if (sel.type === 'logo_bar') return (
      <div className="space-y-3">
        <Row label="Title"><FigInput value={sel.content.logoBarTitle||''} onChange={v=>upd({logoBarTitle:v})} /></Row>
        <div style={{borderTop:'1px solid #3a3a3a',paddingTop:8}}>
          {(sel.content.logos||[]).map((logo:any,i:number)=>(
            <div key={i} className="flex gap-1.5 items-center mb-1.5">
              <input placeholder="Name" value={logo.name} onChange={e=>{const l=[...(sel.content.logos||[])];l[i]={...l[i],name:e.target.value};upd({logos:l});}} className="fig-input" style={{fontSize:11,height:24,width:'30%'}} />
              <input placeholder="Logo URL" value={logo.logoUrl} onChange={e=>{const l=[...(sel.content.logos||[])];l[i]={...l[i],logoUrl:e.target.value};upd({logos:l});}} className="fig-input flex-1" style={{fontSize:11,height:24}} />
              <button onClick={()=>upd({logos:(sel.content.logos||[]).filter((_:any,li:number)=>li!==i)})} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:12}}>✕</button>
            </div>
          ))}
          <button onClick={()=>upd({logos:[...(sel.content.logos||[]),{name:'Brand',logoUrl:''}]})} className="w-full flex items-center justify-center gap-1 py-1.5 rounded text-[11px]" style={{background:'#3a3a3a',color:'#aaa',border:'none',cursor:'pointer'}}>
            <Plus size={11} /> Add logo
          </button>
        </div>
      </div>
    );

    if (sel.type === 'cta_block') return (
      <div className="space-y-3">
        <div><p style={{fontSize:11,color:'#888',marginBottom:4}}>Headline</p><FigTextArea value={sel.content.title||''} onChange={v=>upd({title:v})} rows={2} /></div>
        <div><p style={{fontSize:11,color:'#888',marginBottom:4}}>Description</p><FigTextArea value={sel.content.description||''} onChange={v=>upd({description:v})} rows={2} /></div>
        <Row label="Primary"><FigInput value={sel.content.primaryBtnText||''} onChange={v=>upd({primaryBtnText:v})} /></Row>
        <Row label="URL"><FigInput value={sel.content.primaryBtnUrl||''} onChange={v=>upd({primaryBtnUrl:v})} /></Row>
        <Row label="Secondary"><FigInput value={sel.content.secondaryBtnText||''} onChange={v=>upd({secondaryBtnText:v})} /></Row>
      </div>
    );

    if (sel.type === 'contact_form') return (
      <div className="space-y-3">
        <Row label="Title"><FigInput value={sel.content.title||''} onChange={v=>upd({title:v})} /></Row>
        <div><p style={{fontSize:11,color:'#888',marginBottom:4}}>Description</p><FigTextArea value={sel.content.description||''} onChange={v=>upd({description:v})} rows={2} /></div>
        <Row label="Btn text"><FigInput value={sel.content.formBtnText||''} onChange={v=>upd({formBtnText:v})} /></Row>
        <div style={{borderTop:'1px solid #3a3a3a',paddingTop:8}}>
          <p className="section-label mb-2">Fields ({(sel.content.formFields||[]).length})</p>
          {(sel.content.formFields||[]).map((f:any,i:number)=>(
            <div key={i} className="mb-2 p-2 rounded" style={{background:'#333',border:'1px solid #444'}}>
              <div className="flex justify-between mb-1.5"><span style={{fontSize:10,color:'#888'}}>Field {i+1}</span><button onClick={()=>upd({formFields:(sel.content.formFields||[]).filter((_:any,fi:number)=>fi!==i)})} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:12}}>✕</button></div>
              <div className="flex gap-1.5 mb-1">
                <input placeholder="Label" value={f.label} onChange={e=>{const ff=[...(sel.content.formFields||[])];ff[i]={...ff[i],label:e.target.value};upd({formFields:ff});}} className="fig-input flex-1" style={{fontSize:11,height:24}} />
                <select value={f.type} onChange={e=>{const ff=[...(sel.content.formFields||[])];ff[i]={...ff[i],type:e.target.value};upd({formFields:ff});}} className="fig-select" style={{fontSize:11,height:24,width:80}}>
                  <option value="text">Text</option><option value="email">Email</option><option value="tel">Phone</option><option value="textarea">Area</option>
                </select>
              </div>
              <input placeholder="Placeholder" value={f.placeholder} onChange={e=>{const ff=[...(sel.content.formFields||[])];ff[i]={...ff[i],placeholder:e.target.value};upd({formFields:ff});}} className="fig-input w-full" style={{fontSize:11,height:24}} />
            </div>
          ))}
          <button onClick={()=>upd({formFields:[...(sel.content.formFields||[]),{label:'Field',placeholder:'Enter…',type:'text'}]})} className="w-full flex items-center justify-center gap-1 py-1.5 rounded text-[11px]" style={{background:'#3a3a3a',color:'#aaa',border:'none',cursor:'pointer'}}>
            <Plus size={11} /> Add field
          </button>
        </div>
      </div>
    );

    if (sel.type === 'image_block') return (
      <div className="space-y-3">
        <Row label="URL"><FigInput value={sel.content.imageUrl||''} onChange={v=>upd({imageUrl:v})} placeholder="https://…" /></Row>
        <Row label="Upload">
          <div className="relative">
            <input type="file" accept="image/*" onChange={e=>{const file=e.target.files?.[0];if(file){const r=new FileReader();r.onloadend=()=>upd({imageUrl:r.result as string});r.readAsDataURL(file);}}} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
            <div className="fig-input text-[11px] text-center py-1" style={{cursor:'pointer',color:'#888'}}>📂 Choose file</div>
          </div>
        </Row>
        <Row label="Alt"><FigInput value={sel.content.imageAlt||''} onChange={v=>upd({imageAlt:v})} placeholder="Alt text" /></Row>
        <Row label="Caption"><FigInput value={sel.content.description||''} onChange={v=>upd({description:v})} /></Row>
        <Row label="Ratio">
          <FigSelect value={sel.content.imageAspectRatio||'auto'} onChange={v=>upd({imageAspectRatio:v})} options={[{value:'auto',label:'Auto'},{value:'square',label:'Square'},{value:'video',label:'16:9'},{value:'portrait',label:'Portrait'},{value:'wide',label:'Wide'}]} />
        </Row>
        <Row label="Filter">
          <FigSelect value={sel.content.imageFilter||'none'} onChange={v=>upd({imageFilter:v})} options={[{value:'none',label:'None'},{value:'grayscale',label:'Grayscale'},{value:'sepia',label:'Sepia'},{value:'vintage',label:'Vintage'},{value:'warm',label:'Warm'},{value:'cool',label:'Cool'}]} />
        </Row>
      </div>
    );

    if (sel.type === 'video_embed') return (
      <div className="space-y-3">
        <Row label="Title"><FigInput value={sel.content.title||''} onChange={v=>upd({title:v})} /></Row>
        <div><p style={{fontSize:11,color:'#888',marginBottom:4}}>Embed URL</p>
          <FigInput value={sel.content.videoUrl||''} onChange={v=>upd({videoUrl:v})} placeholder="https://youtube.com/embed/…" />
          <p style={{fontSize:10,color:'#666',marginTop:4}}>Use embed URL format</p>
        </div>
      </div>
    );

    if (sel.type === 'footer') return (
      <div className="space-y-3">
        <Row label="Brand"><FigInput value={sel.content.brandName||''} onChange={v=>upd({brandName:v})} /></Row>
        <Row label="Copyright"><FigInput value={sel.content.copyright||''} onChange={v=>upd({copyright:v})} /></Row>
        <div style={{borderTop:'1px solid #3a3a3a',paddingTop:8}}>
          <p className="section-label mb-2">Links</p>
          {(sel.content.links||[]).map((lnk:any,i:number)=>(
            <div key={i} className="flex gap-1.5 items-center mb-1.5">
              <input value={lnk.label} onChange={e=>{const l=[...(sel.content.links||[])];l[i]={...l[i],label:e.target.value};upd({links:l});}} className="fig-input flex-1" style={{fontSize:11,height:26}} placeholder="Label" />
              <input value={lnk.url} onChange={e=>{const l=[...(sel.content.links||[])];l[i]={...l[i],url:e.target.value};upd({links:l});}} className="fig-input flex-1" style={{fontSize:11,height:26}} placeholder="URL" />
              <button onClick={()=>upd({links:(sel.content.links||[]).filter((_:any,li:number)=>li!==i)})} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:12}}>✕</button>
            </div>
          ))}
          <button onClick={()=>upd({links:[...(sel.content.links||[]),{label:'Link',url:'#'}]})} className="w-full flex items-center justify-center gap-1 py-1.5 rounded text-[11px]" style={{background:'#3a3a3a',color:'#aaa',border:'none',cursor:'pointer'}}>
            <Plus size={11} /> Add link
          </button>
        </div>
      </div>
    );

    if (sel.type === 'divider') return (
      <Row label="Style">
        <FigSelect value={sel.content.dividerStyle||'solid'} onChange={v=>upd({dividerStyle:v})} options={[{value:'solid',label:'Solid'},{value:'dashed',label:'Dashed'},{value:'dotted',label:'Dotted'}]} />
      </Row>
    );

    if (sel.type === 'spacer') return (
      <div>
        <Row label="Height">
          <div className="flex items-center gap-2">
            <FigInput value={String(sel.content.spacerHeight||48)} onChange={v=>upd({spacerHeight:+v})} type="number" />
            <span style={{fontSize:10,color:'#666'}}>px</span>
          </div>
        </Row>
        <input type="range" min={8} max={240} step={8} value={sel.content.spacerHeight||48} onChange={e=>upd({spacerHeight:+e.target.value})} className="mt-2" />
      </div>
    );

    return <p style={{fontSize:11,color:'#666',padding:'8px 0'}}>No content options for this block.</p>;
  };

  /* ── Style panel ──────────────────────────────────────────── */
  const renderStyle = () => {
    if (!sel) return null;
    return (
      <div>
        <SectionWrap title="Fill">
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="color-chip" style={{backgroundColor: sel.styles.bgColor, width:24, height:24}} />
              <input type="color" value={sel.styles.bgColor} onChange={e=>updS({bgColor:e.target.value})} style={{width:24,height:24}} />
              <FigInput value={sel.styles.bgColor} onChange={v=>updS({bgColor:v})} />
            </div>
            <SwatchRow colors={BG_SWATCHES} selected={sel.styles.bgColor} onPick={c=>updS({bgColor:c})} onCustom={c=>updS({bgColor:c})} />
          </div>
          <div className="fig-divider-h" />
          <div className="flex items-center justify-between mb-2">
            <span style={{fontSize:11,color:'#888'}}>Gradient</span>
            <button onClick={()=>updS({useGradient:!sel.styles.useGradient})} style={{width:32,height:16,borderRadius:8,background:sel.styles.useGradient?'#18a0fb':'#3a3a3a',border:'none',cursor:'pointer',position:'relative',flexShrink:0,transition:'background .15s'}}>
              <span style={{position:'absolute',top:2,left:sel.styles.useGradient?16:2,width:12,height:12,borderRadius:'50%',background:'#fff',transition:'left .15s'}} />
            </button>
          </div>
          {sel.styles.useGradient && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <p style={{fontSize:10,color:'#666',marginBottom:4}}>From</p>
                  <div className="flex gap-1.5 items-center">
                    <input type="color" value={sel.styles.gradientFrom||'#4f46e5'} onChange={e=>updS({gradientFrom:e.target.value})} style={{width:22,height:22}} />
                    <FigInput value={sel.styles.gradientFrom||'#4f46e5'} onChange={v=>updS({gradientFrom:v})} />
                  </div>
                </div>
                <div className="flex-1">
                  <p style={{fontSize:10,color:'#666',marginBottom:4}}>To</p>
                  <div className="flex gap-1.5 items-center">
                    <input type="color" value={sel.styles.gradientTo||'#7c3aed'} onChange={e=>updS({gradientTo:e.target.value})} style={{width:22,height:22}} />
                    <FigInput value={sel.styles.gradientTo||'#7c3aed'} onChange={v=>updS({gradientTo:v})} />
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                {([['to-r','→'],['to-b','↓'],['to-br','↘'],['to-tr','↗']] as const).map(([v,ico])=>(
                  <button key={v} onClick={()=>updS({gradientDirection:v})} style={{flex:1,padding:'4px',borderRadius:4,border:'1px solid',borderColor:sel.styles.gradientDirection===v?'#18a0fb':'#3a3a3a',background:sel.styles.gradientDirection===v?'#18a0fb22':'transparent',color:'#ccc',cursor:'pointer',fontSize:14}}>{ico}</button>
                ))}
              </div>
            </div>
          )}
        </SectionWrap>

        <SectionWrap title="Typography">
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-2">
              <input type="color" value={sel.styles.textColor} onChange={e=>updS({textColor:e.target.value})} style={{width:22,height:22}} />
              <FigInput value={sel.styles.textColor} onChange={v=>updS({textColor:v})} />
            </div>
          </div>
          <Row label="Font">
            <FigSelect value={sel.styles.fontFamily||''} onChange={v=>updS({fontFamily:v})} options={[{value:'',label:'Global default'},...FONTS.map(f=>({value:f.value,label:f.label}))]} />
          </Row>
          <Row label="Align">
            <div className="flex gap-1">
              {(['left','center','right'] as const).map(a=>(
                <button key={a} onClick={()=>updS({align:a})} className="fig-icon-btn" style={{flex:1,background:sel.styles.align===a?'#18a0fb22':'transparent',border:'1px solid',borderColor:sel.styles.align===a?'#18a0fb':'transparent'}}>
                  {a==='left'?<AlignLeft size={12}/>:a==='center'?<AlignCenter size={12}/>:<AlignRight size={12}/>}
                </button>
              ))}
            </div>
          </Row>
        </SectionWrap>

        <SectionWrap title="Accent color">
          <div className="flex items-center gap-2 mb-2">
            <input type="color" value={sel.styles.brandColor} onChange={e=>updS({brandColor:e.target.value})} style={{width:22,height:22}} />
            <FigInput value={sel.styles.brandColor} onChange={v=>updS({brandColor:v})} />
          </div>
          <SwatchRow colors={BRAND_SWATCHES} selected={sel.styles.brandColor} onPick={c=>updS({brandColor:c})} onCustom={c=>updS({brandColor:c})} />
        </SectionWrap>

        <SectionWrap title="Stroke / Border">
          <Row label="Width">
            <div className="flex items-center gap-2">
              <FigInput value={String(sel.styles.borderWidth||0)} onChange={v=>updS({borderWidth:+v})} type="number" />
              <span style={{fontSize:10,color:'#666'}}>px</span>
            </div>
          </Row>
          {(sel.styles.borderWidth||0)>0 && <>
            <Row label="Color">
              <div className="flex gap-1.5">
                <input type="color" value={sel.styles.borderColor||'#ffffff'} onChange={e=>updS({borderColor:e.target.value})} style={{width:22,height:22}} />
                <FigInput value={sel.styles.borderColor||'#ffffff'} onChange={v=>updS({borderColor:v})} />
              </div>
            </Row>
            <Row label="Style">
              <FigSelect value={sel.styles.borderStyle||'solid'} onChange={v=>updS({borderStyle:v})} options={[{value:'solid',label:'Solid'},{value:'dashed',label:'Dashed'},{value:'dotted',label:'Dotted'}]} />
            </Row>
          </>}
          <Row label="Radius">
            <FigSelect value={sel.styles.borderRadius||'xl'} onChange={v=>updS({borderRadius:v})} options={[{value:'none',label:'None'},{value:'md',label:'Small'},{value:'xl',label:'Medium'},{value:'3xl',label:'Large'},{value:'full',label:'Full'}]} />
          </Row>
        </SectionWrap>

        <SectionWrap title="Shadow">
          <div className="flex gap-1">
            {(['none','soft','heavy'] as const).map(s=>(
              <button key={s} onClick={()=>updS({shadow:s})} style={{flex:1,padding:'4px 0',borderRadius:4,border:'1px solid',borderColor:sel.styles.shadow===s?'#18a0fb':'#3a3a3a',background:sel.styles.shadow===s?'#18a0fb22':'transparent',color:sel.styles.shadow===s?'#18a0fb':'#888',cursor:'pointer',fontSize:11,fontWeight:500}}>{s}</button>
            ))}
          </div>
        </SectionWrap>
      </div>
    );
  };

  /* ── Layout panel ─────────────────────────────────────────── */
  const renderLayout = () => {
    if (!sel) return null;
    return (
      <div>
        <SectionWrap title="Spacing">
          <Row label="Pad top">
            <div className="flex items-center gap-2">
              <FigInput value={String(sel.styles.paddingTop)} onChange={v=>updS({paddingTop:+v})} type="number" />
              <span style={{fontSize:10,color:'#666'}}>px</span>
            </div>
          </Row>
          <input type="range" min={0} max={200} step={8} value={sel.styles.paddingTop} onChange={e=>updS({paddingTop:+e.target.value})} className="mt-1 mb-2" />
          <Row label="Pad btm">
            <div className="flex items-center gap-2">
              <FigInput value={String(sel.styles.paddingBottom)} onChange={v=>updS({paddingBottom:+v})} type="number" />
              <span style={{fontSize:10,color:'#666'}}>px</span>
            </div>
          </Row>
          <input type="range" min={0} max={200} step={8} value={sel.styles.paddingBottom} onChange={e=>updS({paddingBottom:+e.target.value})} className="mt-1" />
        </SectionWrap>
        <SectionWrap title="Content Width">
          <FigSelect value={sel.styles.maxWidth||'7xl'} onChange={v=>updS({maxWidth:v})} options={[{value:'7xl',label:'Full (1280px)'},{value:'5xl',label:'Wide (1024px)'},{value:'4xl',label:'Medium (896px)'},{value:'3xl',label:'Narrow (768px)'},{value:'2xl',label:'Compact (672px)'}]} />
        </SectionWrap>
        <SectionWrap title="Actions">
          <div className="flex gap-2">
            <button onClick={()=>sel&&onDuplicateBlock(sel.id)} className="fig-btn-secondary flex-1 flex items-center justify-center gap-1.5 text-[11px]">
              <Copy size={12} /> Clone
            </button>
            <button onClick={()=>{sel&&onDeleteBlock(sel.id);setSelection({blockId:null,elementId:null});}} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-semibold" style={{background:'#450a0a',color:'#fca5a5',border:'none',cursor:'pointer'}}>
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </SectionWrap>
      </div>
    );
  };

  /* ── Design (global) panel ────────────────────────────────── */
  const renderDesign = () => (
    <div>
      <SectionWrap title="Theme">
        <div className="space-y-1">
          {([{id:'minimal_modern',label:'Minimal Modern'},{id:'glassmorphism',label:'Glassmorphism'},{id:'neo_brutalist',label:'Neo-Brutalist'},{id:'cosmic_dark',label:'Cosmic Dark'}] as const).map(t=>(
            <button key={t.id} onClick={()=>{const s={...project.style,theme:t.id};if(t.id==='cosmic_dark')s.background='#020617';else if(t.id==='neo_brutalist'){s.background='#ffffff';s.radius='0px';}else{s.background='#ffffff';s.radius='12px';}onChangeStyle(s);}} className="w-full flex items-center justify-between py-2 px-2.5 rounded-md text-[12px]" style={{background:project.style.theme===t.id?'#18a0fb22':'transparent',border:'1px solid',borderColor:project.style.theme===t.id?'#18a0fb':'transparent',color:project.style.theme===t.id?'#18a0fb':'#aaa',cursor:'pointer'}}>
              <span>{t.label}</span>
              {project.style.theme===t.id&&<Check size={12} />}
            </button>
          ))}
        </div>
      </SectionWrap>

      <SectionWrap title="Canvas Background">
        <div className="flex items-center gap-2 mb-2">
          <input type="color" value={project.style.background} onChange={e=>onChangeStyle({...project.style,background:e.target.value})} style={{width:22,height:22}} />
          <FigInput value={project.style.background} onChange={v=>onChangeStyle({...project.style,background:v})} />
        </div>
        <SwatchRow colors={BG_SWATCHES} selected={project.style.background} onPick={c=>onChangeStyle({...project.style,background:c})} onCustom={c=>onChangeStyle({...project.style,background:c})} />
      </SectionWrap>

      <SectionWrap title="Global Font">
        <FigSelect value={project.style.fontFamily} onChange={v=>onChangeStyle({...project.style,fontFamily:v})} options={FONTS.map(f=>({value:f.value,label:f.label}))} />
      </SectionWrap>

      <SectionWrap title="Default Radius">
        <div className="flex gap-1">
          {(['none','6px','12px','24px'] as const).map(r=>(
            <button key={r} onClick={()=>onChangeStyle({...project.style,radius:r})} style={{flex:1,padding:'4px 0',borderRadius:4,border:'1px solid',borderColor:project.style.radius===r?'#18a0fb':'#3a3a3a',background:project.style.radius===r?'#18a0fb22':'transparent',color:project.style.radius===r?'#18a0fb':'#888',cursor:'pointer',fontSize:10}}>{r==='none'?'None':r}</button>
          ))}
        </div>
      </SectionWrap>
    </div>
  );

  /* ── Layers panel ─────────────────────────────────────────── */
  const renderLayers = () => (
    <div>
      {project.blocks.length === 0 ? (
        <div style={{textAlign:'center',padding:'32px 16px',color:'#555'}}>
          <Layers size={28} style={{margin:'0 auto 8px',opacity:.4}} />
          <p style={{fontSize:12,fontWeight:500}}>No blocks on canvas</p>
        </div>
      ) : (
        project.blocks.map((blk, idx) => (
          <div key={blk.id} onClick={()=>setSelection({blockId:blk.id,elementId:null})}
            className={`layer-row ${selection.blockId===blk.id?'selected':''}`}>
            <div style={{width:12,height:12,borderRadius:2,backgroundColor:blk.styles.bgColor,border:'1px solid rgba(255,255,255,.1)',flexShrink:0}} />
            <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11}}>{blk.name}</span>
            <div className="flex items-center gap-0" style={{opacity:0,transition:'opacity .1s'}} onMouseEnter={e=>(e.currentTarget.style.opacity='1')} onMouseLeave={e=>(e.currentTarget.style.opacity='0')}>
              <button disabled={idx===0} onClick={e=>{e.stopPropagation();onMoveBlock(blk.id,'up');}} className="fig-icon-btn" style={{width:20,height:20}}><ArrowUp size={10}/></button>
              <button disabled={idx===project.blocks.length-1} onClick={e=>{e.stopPropagation();onMoveBlock(blk.id,'down');}} className="fig-icon-btn" style={{width:20,height:20}}><ArrowDown size={10}/></button>
              <button onClick={e=>{e.stopPropagation();onDeleteBlock(blk.id);}} className="fig-icon-btn" style={{width:20,height:20,color:'#ef4444'}}><Trash2 size={10}/></button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  /* ── Main render ──────────────────────────────────────────── */
  return (
    <div className="panel-chrome flex flex-col h-full select-none" style={{ width: 240, minWidth: 240, maxWidth: 240 }}>

      {/* Panel header tabs */}
      {sel ? (
        <>
          {/* Back + block name */}
          <div style={{padding:'8px 12px',borderBottom:'1px solid #3a3a3a',background:'#252525'}}>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={()=>setSelection({blockId:null,elementId:null})} style={{background:'none',border:'none',cursor:'pointer',color:'#888',display:'flex',alignItems:'center',gap:4,fontSize:11,padding:0}}>
                ← back
              </button>
              <span style={{fontSize:10,padding:'2px 6px',borderRadius:3,background:'#18a0fb22',color:'#18a0fb',fontWeight:600}}>{sel.type.replace(/_/g,' ')}</span>
            </div>
            <p style={{fontSize:12,fontWeight:700,color:'#e5e5e5',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{sel.name}</p>
          </div>
          {/* Sub-tabs */}
          <div style={{display:'flex',borderBottom:'1px solid #3a3a3a',background:'#252525'}}>
            {(['content','style','layout'] as const).map(t=>(
              <button key={t} onClick={()=>setBlockTab(t)} className={`fig-tab flex-1 capitalize ${blockTab===t?'active':''}`}>{t}</button>
            ))}
          </div>
          {/* Panel body */}
          <div className="flex-1 overflow-y-auto">
            <div style={{padding:'10px 12px 16px'}}>
              {blockTab==='content'&&renderContent()}
              {blockTab==='style'&&renderStyle()}
              {blockTab==='layout'&&renderLayout()}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Top-level tabs */}
          <div style={{display:'flex',borderBottom:'1px solid #3a3a3a',background:'#252525'}}>
            {([{k:'blocks',icon:PlusCircle,label:'Add'},{k:'layers',icon:Layers,label:'Layers'},{k:'design',icon:Palette,label:'Design'}] as const).map(({k,icon:Icon,label})=>(
              <button key={k} onClick={()=>setTab(k as any)} className={`fig-tab flex-1 flex items-center justify-center gap-1 ${tab===k?'active':''}`}>
                <Icon size={12}/><span>{label}</span>
              </button>
            ))}
          </div>

          {/* Search (blocks tab only) */}
          {tab==='blocks'&&(
            <div style={{padding:'8px 10px',borderBottom:'1px solid #3a3a3a'}}>
              <div style={{position:'relative'}}>
                <Search size={11} style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',color:'#555'}} />
                <input type="text" placeholder="Search blocks…" value={search} onChange={e=>setSearch(e.target.value)} className="fig-input w-full" style={{paddingLeft:26,fontSize:11,height:28}} />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {tab==='blocks'&&(
              <div>
                {cats.map(cat=>(
                  <div key={cat}>
                    <div style={{padding:'8px 12px 4px',fontSize:10,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'0.08em'}}>{cat}</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4,padding:'0 8px 8px'}}>
                      {filtered.filter(b=>b.cat===cat).map(opt=>{
                        const Icon=opt.icon;
                        return (
                          <button key={opt.type} onClick={()=>onAddBlock(opt.type)}
                            style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'8px 4px',borderRadius:6,border:'1px solid #3a3a3a',background:'#333',cursor:'pointer',transition:'all .1s',position:'relative'}}
                            onMouseEnter={e=>{e.currentTarget.style.background='#18a0fb22';e.currentTarget.style.borderColor='#18a0fb44';}}
                            onMouseLeave={e=>{e.currentTarget.style.background='#333';e.currentTarget.style.borderColor='#3a3a3a';}}>
                            {(opt as any).isNew&&<span style={{position:'absolute',top:3,right:3,fontSize:7,fontWeight:800,background:'#10b981',color:'#fff',padding:'1px 3px',borderRadius:2,textTransform:'uppercase'}}>NEW</span>}
                            <Icon size={16} style={{color:'#888'}} />
                            <span style={{fontSize:10,color:'#aaa',fontWeight:500,textAlign:'center',lineHeight:1.2}}>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tab==='layers'&&renderLayers()}
            {tab==='design'&&<div style={{padding:'8px 0'}}>{renderDesign()}</div>}
          </div>
        </>
      )}
    </div>
  );
}
