import React, { useState } from 'react';
import { ProjectState, Block, StyleConfig, SelectionState, BlockType } from '../types';
import {
  Trash2, Copy, ArrowUp, ArrowDown, Layers, Settings, AlignLeft, AlignCenter, AlignRight,
  Check, Sparkles, Search, LayoutTemplate, SquareEqual, MessageSquare, CreditCard, Mail,
  Image, PlayCircle, Navigation, Minimize, ToggleRight, Plus, PlusCircle, Palette,
  Type, Users, HelpCircle, TrendingUp, Grid, ChevronDown, ChevronUp
} from 'lucide-react';

interface RightPropertiesPanelProps {
  project: ProjectState;
  onChangeStyle: (style: StyleConfig) => void;
  selection: SelectionState;
  setSelection: (sel: SelectionState) => void;
  onUpdateBlock: (blockId: string, updated: Partial<Block>) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onAddBlock: (type: BlockType) => void;
}

const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { label: 'Poppins', value: "'Poppins', sans-serif" },
  { label: 'Roboto', value: "'Roboto', sans-serif" },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif" },
  { label: 'DM Sans', value: "'DM Sans', sans-serif" },
  { label: 'Syne', value: "'Syne', sans-serif" },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: "'Courier New', monospace" },
];

const BG_SWATCHES = ['#ffffff','#f8fafc','#f1f5f9','#0f172a','#1e293b','#fef08a','#ffedd5','#ecfdf5','#020617','#fdf4ff','#eff6ff','#fff7ed'];
const BRAND_SWATCHES = ['#4f46e5','#2563eb','#10b981','#ef4444','#f59e0b','#8b5cf6','#ec4899','#000000','#0ea5e9','#f97316','#84cc16','#14b8a6'];

const InputField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="space-y-1">
    <label className="text-[11px] font-bold text-slate-600 block">{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)}
      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium" />
  </div>
);

const TextAreaField = ({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) => (
  <div className="space-y-1">
    <label className="text-[11px] font-bold text-slate-600 block">{label}</label>
    <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)}
      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium leading-relaxed resize-none" />
  </div>
);

const ColorSwatch = ({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) => (
  <button onClick={onClick} className={`w-full h-6 rounded-md border transition-all cursor-pointer flex items-center justify-center ${selected ? 'border-indigo-600 scale-110 shadow-sm' : 'border-slate-200 hover:scale-105'}`} style={{ backgroundColor: color }}>
    {selected && <Check className={`w-3 h-3 ${['#ffffff','#f8fafc','#f1f5f9','#fef08a','#ffedd5','#ecfdf5','#fdf4ff','#eff6ff','#fff7ed'].includes(color) ? 'text-slate-800' : 'text-white'}`} />}
  </button>
);

export default function RightPropertiesPanel({ project, onChangeStyle, selection, setSelection, onUpdateBlock, onDeleteBlock, onDuplicateBlock, onMoveBlock, onAddBlock }: RightPropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'blocks' | 'settings' | 'layers'>('blocks');
  const [blockTab, setBlockTab] = useState<'content' | 'appearance' | 'advanced'>('content');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ spacing: true, colors: true });

  const toggleSection = (key: string) => setExpandedSections(p => ({ ...p, [key]: !p[key] }));
  const selectedBlock = project.blocks.find(b => b.id === selection.blockId);

  const componentOptions = [
    { type: 'navbar' as BlockType, label: 'Navbar', description: 'Navigation with links & CTA.', category: 'header_footer', icon: Navigation },
    { type: 'hero_section' as BlockType, label: 'Hero Section', description: 'Headline, subtitle & CTA buttons.', category: 'marketing', icon: LayoutTemplate },
    { type: 'text_block' as BlockType, label: 'Text Block', description: 'Rich editable text, headings, quotes.', category: 'content', icon: Type, isNew: true },
    { type: 'stats_block' as BlockType, label: 'Stats / Numbers', description: 'Key metrics and statistics.', category: 'marketing', icon: TrendingUp, isNew: true },
    { type: 'logo_bar' as BlockType, label: 'Logo Bar', description: 'Partner/client logos showcase.', category: 'marketing', icon: Grid, isNew: true },
    { type: 'features_grid' as BlockType, label: 'Features Grid', description: '3-column feature cards.', category: 'marketing', icon: SquareEqual },
    { type: 'testimonials' as BlockType, label: 'Testimonials', description: 'Customer quotes with ratings.', category: 'marketing', icon: MessageSquare },
    { type: 'pricing_cards' as BlockType, label: 'Pricing Plans', description: 'Tiered pricing with features.', category: 'marketing', icon: CreditCard },
    { type: 'faq_block' as BlockType, label: 'FAQ', description: 'Accordion FAQ section.', category: 'content', icon: HelpCircle, isNew: true },
    { type: 'team_block' as BlockType, label: 'Team Section', description: 'Team member cards.', category: 'content', icon: Users, isNew: true },
    { type: 'cta_block' as BlockType, label: 'Call to Action', description: 'Full-width attention banner.', category: 'marketing', icon: Sparkles },
    { type: 'contact_form' as BlockType, label: 'Contact Form', description: 'Lead capture form.', category: 'structure', icon: Mail },
    { type: 'image_block' as BlockType, label: 'Image', description: 'Image with filters & captions.', category: 'rich_media', icon: Image },
    { type: 'video_embed' as BlockType, label: 'Video Embed', description: 'YouTube or iframe embed.', category: 'rich_media', icon: PlayCircle },
    { type: 'divider' as BlockType, label: 'Divider', description: 'Separator line.', category: 'structure', icon: Minimize },
    { type: 'spacer' as BlockType, label: 'Spacer', description: 'Adjustable blank space.', category: 'structure', icon: Layers },
    { type: 'footer' as BlockType, label: 'Footer', description: 'Brand, copyright & links.', category: 'header_footer', icon: ToggleRight },
  ];

  const categoryMap: Record<string, string> = { 'All': 'All', 'Header/Footer': 'header_footer', 'Marketing': 'marketing', 'Content': 'content', 'Media': 'rich_media', 'Structure': 'structure' };
  const filtered = componentOptions.filter(opt => {
    const matchSearch = opt.label.toLowerCase().includes(searchTerm.toLowerCase()) || opt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = activeCategory === 'All' || opt.category === categoryMap[activeCategory];
    return matchSearch && matchCat;
  });

  const SectionHeader = ({ title, sKey }: { title: string; sKey: string }) => (
    <button onClick={() => toggleSection(sKey)} className="w-full flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest py-1 mb-2">
      <span>{title}</span>
      {expandedSections[sKey] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
    </button>
  );

  const renderContent = () => {
    if (!selectedBlock) return null;
    const b = selectedBlock;
    const upd = (content: any) => onUpdateBlock(b.id, { content: { ...b.content, ...content } });
    const updS = (styles: any) => onUpdateBlock(b.id, { styles: { ...b.styles, ...styles } });

    if (blockTab === 'content') return (
      <div className="space-y-4">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Content Editor</p>

        {b.type === 'text_block' && (
          <div className="space-y-4">
            <TextAreaField label="Text Content" value={b.content.textContent || ''} onChange={v => upd({ textContent: v })} rows={6} />
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-[10px] font-bold text-slate-500 block mb-1">HTML Tag</label>
                <select value={b.content.textTag || 'p'} onChange={e => upd({ textTag: e.target.value })} className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg">
                  <option value="p">Paragraph</option><option value="h1">H1</option><option value="h2">H2</option><option value="h3">H3</option><option value="h4">H4</option><option value="blockquote">Blockquote</option>
                </select></div>
              <div><label className="text-[10px] font-bold text-slate-500 block mb-1">Weight</label>
                <select value={b.content.textFontWeight || '400'} onChange={e => upd({ textFontWeight: e.target.value })} className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg">
                  <option value="400">Regular</option><option value="500">Medium</option><option value="600">Semibold</option><option value="700">Bold</option><option value="800">Extrabold</option><option value="900">Black</option>
                </select></div>
            </div>
            <div><div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1"><span>Font Size</span><span className="text-indigo-600 font-mono">{b.content.textFontSize || 16}px</span></div>
              <input type="range" min={11} max={96} step={1} value={b.content.textFontSize || 16} onChange={e => upd({ textFontSize: +e.target.value })} className="w-full accent-indigo-600" /></div>
            <div><div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1"><span>Line Height</span><span className="text-indigo-600 font-mono">{b.content.textLineHeight || 1.8}</span></div>
              <input type="range" min={1} max={3} step={0.1} value={b.content.textLineHeight || 1.8} onChange={e => upd({ textLineHeight: +e.target.value })} className="w-full accent-indigo-600" /></div>
            <div><div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1"><span>Letter Spacing</span><span className="text-indigo-600 font-mono">{b.content.textLetterSpacing || 0}</span></div>
              <input type="range" min={-10} max={30} step={1} value={b.content.textLetterSpacing || 0} onChange={e => upd({ textLetterSpacing: +e.target.value })} className="w-full accent-indigo-600" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-[10px] font-bold text-slate-500 block mb-1">Decoration</label>
                <select value={b.content.textDecoration || 'none'} onChange={e => upd({ textDecoration: e.target.value })} className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg">
                  <option value="none">None</option><option value="underline">Underline</option><option value="line-through">Strike</option>
                </select></div>
              <div><label className="text-[10px] font-bold text-slate-500 block mb-1">Transform</label>
                <select value={b.content.textTransform || 'none'} onChange={e => upd({ textTransform: e.target.value })} className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg">
                  <option value="none">Default</option><option value="uppercase">UPPERCASE</option><option value="lowercase">lowercase</option><option value="capitalize">Capitalize</option>
                </select></div>
            </div>
          </div>
        )}

        {b.type === 'stats_block' && (
          <div className="space-y-4">
            <InputField label="Title" value={b.content.title || ''} onChange={v => upd({ title: v })} />
            <InputField label="Eyebrow" value={b.content.subtitle || ''} onChange={v => upd({ subtitle: v })} />
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 block">Stats</label>
              {(b.content.stats || []).map((stat: any, i: number) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between"><span className="text-[9px] text-slate-400 font-bold">Stat {i+1}</span>
                    <button onClick={() => { const s = (b.content.stats || []).filter((_: any, si: number) => si !== i); upd({ stats: s }); }} className="p-1 bg-red-50 text-red-500 rounded text-xs">✕</button></div>
                  <div className="grid grid-cols-3 gap-1">
                    <input placeholder="Prefix" value={stat.prefix || ''} onChange={e => { const s = [...(b.content.stats || [])]; s[i] = { ...s[i], prefix: e.target.value }; upd({ stats: s }); }} className="text-[11px] p-1.5 bg-white border border-slate-200 rounded" />
                    <input placeholder="Value" value={stat.value} onChange={e => { const s = [...(b.content.stats || [])]; s[i] = { ...s[i], value: e.target.value }; upd({ stats: s }); }} className="text-[11px] p-1.5 bg-white border border-slate-200 rounded font-bold" />
                    <input placeholder="Suffix" value={stat.suffix || ''} onChange={e => { const s = [...(b.content.stats || [])]; s[i] = { ...s[i], suffix: e.target.value }; upd({ stats: s }); }} className="text-[11px] p-1.5 bg-white border border-slate-200 rounded" />
                  </div>
                  <input placeholder="Label" value={stat.label} onChange={e => { const s = [...(b.content.stats || [])]; s[i] = { ...s[i], label: e.target.value }; upd({ stats: s }); }} className="w-full text-[11px] p-1.5 bg-white border border-slate-200 rounded" />
                </div>
              ))}
              <button onClick={() => upd({ stats: [...(b.content.stats || []), { value: '100', label: 'Metric', suffix: '+' }] })} className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded-lg flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add Stat</button>
            </div>
          </div>
        )}

        {b.type === 'faq_block' && (
          <div className="space-y-4">
            <InputField label="Title" value={b.content.title || ''} onChange={v => upd({ title: v })} />
            <InputField label="Eyebrow" value={b.content.subtitle || ''} onChange={v => upd({ subtitle: v })} />
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 block">FAQ Items</label>
              {(b.content.faqs || []).map((faq: any, i: number) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between"><span className="text-[9px] text-slate-400 font-bold">FAQ {i+1}</span>
                    <button onClick={() => { const f = (b.content.faqs || []).filter((_: any, fi: number) => fi !== i); upd({ faqs: f }); }} className="p-1 bg-red-50 text-red-500 rounded text-xs">✕</button></div>
                  <input placeholder="Question" value={faq.question} onChange={e => { const f = [...(b.content.faqs || [])]; f[i] = { ...f[i], question: e.target.value }; upd({ faqs: f }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  <textarea rows={2} placeholder="Answer" value={faq.answer} onChange={e => { const f = [...(b.content.faqs || [])]; f[i] = { ...f[i], answer: e.target.value }; upd({ faqs: f }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg resize-none" />
                </div>
              ))}
              <button onClick={() => upd({ faqs: [...(b.content.faqs || []), { question: 'Question?', answer: 'Answer.' }] })} className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded-lg flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add FAQ</button>
            </div>
          </div>
        )}

        {b.type === 'team_block' && (
          <div className="space-y-4">
            <InputField label="Title" value={b.content.title || ''} onChange={v => upd({ title: v })} />
            <InputField label="Eyebrow" value={b.content.subtitle || ''} onChange={v => upd({ subtitle: v })} />
            <div className="space-y-2">
              {(b.content.team || []).map((member: any, i: number) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between"><span className="text-[9px] text-slate-400 font-bold">Member {i+1}</span>
                    <button onClick={() => { const t = (b.content.team || []).filter((_: any, ti: number) => ti !== i); upd({ team: t }); }} className="p-1 bg-red-50 text-red-500 rounded text-xs">✕</button></div>
                  <input placeholder="Name" value={member.name} onChange={e => { const t = [...(b.content.team || [])]; t[i] = { ...t[i], name: e.target.value }; upd({ team: t }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  <input placeholder="Role" value={member.role} onChange={e => { const t = [...(b.content.team || [])]; t[i] = { ...t[i], role: e.target.value }; upd({ team: t }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  <textarea rows={2} placeholder="Bio" value={member.bio} onChange={e => { const t = [...(b.content.team || [])]; t[i] = { ...t[i], bio: e.target.value }; upd({ team: t }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg resize-none" />
                  <input placeholder="Avatar URL" value={member.avatarUrl} onChange={e => { const t = [...(b.content.team || [])]; t[i] = { ...t[i], avatarUrl: e.target.value }; upd({ team: t }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                </div>
              ))}
              <button onClick={() => upd({ team: [...(b.content.team || []), { name: 'Name', role: 'Role', bio: '', avatarUrl: '' }] })} className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded-lg flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add Member</button>
            </div>
          </div>
        )}

        {b.type === 'logo_bar' && (
          <div className="space-y-4">
            <InputField label="Title Text" value={b.content.logoBarTitle || ''} onChange={v => upd({ logoBarTitle: v })} />
            <div className="space-y-2">
              {(b.content.logos || []).map((logo: any, i: number) => (
                <div key={i} className="flex gap-2 items-center">
                  <input placeholder="Name" value={logo.name} onChange={e => { const l = [...(b.content.logos || [])]; l[i] = { ...l[i], name: e.target.value }; upd({ logos: l }); }} className="w-1/3 text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  <input placeholder="Logo URL" value={logo.logoUrl} onChange={e => { const l = [...(b.content.logos || [])]; l[i] = { ...l[i], logoUrl: e.target.value }; upd({ logos: l }); }} className="flex-1 text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  <button onClick={() => { const l = (b.content.logos || []).filter((_: any, li: number) => li !== i); upd({ logos: l }); }} className="p-1 bg-red-50 text-red-500 rounded text-xs">✕</button>
                </div>
              ))}
              <button onClick={() => upd({ logos: [...(b.content.logos || []), { name: 'Brand', logoUrl: '' }] })} className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded-lg flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add Logo</button>
            </div>
          </div>
        )}

        {b.type === 'navbar' && (
          <div className="space-y-4">
            <InputField label="Brand Name" value={b.content.brandName || ''} onChange={v => upd({ brandName: v })} />
            <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 block">Nav Links</span>
              {(b.content.links || []).map((lnk: any, i: number) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={lnk.label} placeholder="Label" onChange={e => { const l = [...(b.content.links || [])]; l[i] = { ...l[i], label: e.target.value }; upd({ links: l }); }} className="w-1/2 text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  <input value={lnk.url} placeholder="#link" onChange={e => { const l = [...(b.content.links || [])]; l[i] = { ...l[i], url: e.target.value }; upd({ links: l }); }} className="w-1/2 text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  <button onClick={() => { const l = (b.content.links || []).filter((_: any, li: number) => li !== i); upd({ links: l }); }} className="p-1 bg-red-50 text-red-500 rounded text-xs">✕</button>
                </div>
              ))}
              <button onClick={() => upd({ links: [...(b.content.links || []), { label: 'Link', url: '#' }] })} className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-white border border-slate-200 rounded-lg flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add Link</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <InputField label="CTA Label" value={b.content.primaryBtnText || ''} onChange={v => upd({ primaryBtnText: v })} />
              <InputField label="CTA URL" value={b.content.primaryBtnUrl || ''} onChange={v => upd({ primaryBtnUrl: v })} />
            </div>
          </div>
        )}

        {b.type === 'hero_section' && (
          <div className="space-y-4">
            <InputField label="Eyebrow Tag" value={b.content.subtitle || ''} onChange={v => upd({ subtitle: v })} />
            <TextAreaField label="Headline" value={b.content.title || ''} onChange={v => upd({ title: v })} rows={3} />
            <TextAreaField label="Description" value={b.content.description || ''} onChange={v => upd({ description: v })} />
            <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 block">Primary Button</span>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Label" value={b.content.primaryBtnText || ''} onChange={e => upd({ primaryBtnText: e.target.value })} className="text-xs p-2 bg-white border border-slate-200 rounded-lg" />
                <input placeholder="URL" value={b.content.primaryBtnUrl || ''} onChange={e => upd({ primaryBtnUrl: e.target.value })} className="text-xs p-2 bg-white border border-slate-200 rounded-lg" />
              </div>
              <select value={b.content.primaryBtnStyle || 'filled'} onChange={e => upd({ primaryBtnStyle: e.target.value })} className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg">
                <option value="filled">Filled</option><option value="outline">Outline</option><option value="ghost">Ghost</option>
              </select>
            </div>
            <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 block">Secondary Button</span>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Label" value={b.content.secondaryBtnText || ''} onChange={e => upd({ secondaryBtnText: e.target.value })} className="text-xs p-2 bg-white border border-slate-200 rounded-lg" />
                <input placeholder="URL" value={b.content.secondaryBtnUrl || ''} onChange={e => upd({ secondaryBtnUrl: e.target.value })} className="text-xs p-2 bg-white border border-slate-200 rounded-lg" />
              </div>
              <select value={b.content.secondaryBtnStyle || 'outline'} onChange={e => upd({ secondaryBtnStyle: e.target.value })} className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg">
                <option value="filled">Filled</option><option value="outline">Outline</option><option value="ghost">Ghost</option>
              </select>
            </div>
            <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 block">Hero Image (optional)</span>
              <input placeholder="Image URL" value={b.content.imageUrl || ''} onChange={e => upd({ imageUrl: e.target.value })} className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg" />
            </div>
          </div>
        )}

        {b.type === 'features_grid' && (
          <div className="space-y-4">
            <InputField label="Title" value={b.content.title || ''} onChange={v => upd({ title: v })} />
            <InputField label="Eyebrow" value={b.content.subtitle || ''} onChange={v => upd({ subtitle: v })} />
            <TextAreaField label="Description" value={b.content.description || ''} onChange={v => upd({ description: v })} />
            <div className="space-y-2">
              {(b.content.features || []).map((feat: any, i: number) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between"><span className="text-[9px] text-slate-400 font-bold">Feature {i+1}</span>
                    <button onClick={() => { const f = (b.content.features || []).filter((_: any, fi: number) => fi !== i); upd({ features: f }); }} className="p-1 bg-red-50 text-red-500 rounded text-xs">✕</button></div>
                  <input placeholder="Title" value={feat.title} onChange={e => { const f = [...(b.content.features || [])]; f[i] = { ...f[i], title: e.target.value }; upd({ features: f }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  <textarea rows={2} placeholder="Description" value={feat.description} onChange={e => { const f = [...(b.content.features || [])]; f[i] = { ...f[i], description: e.target.value }; upd({ features: f }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg resize-none" />
                </div>
              ))}
              <button onClick={() => upd({ features: [...(b.content.features || []), { icon: 'Star', title: 'Feature', description: 'Description.' }] })} className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded-lg flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add Feature</button>
            </div>
          </div>
        )}

        {b.type === 'testimonials' && (
          <div className="space-y-4">
            <InputField label="Title" value={b.content.title || ''} onChange={v => upd({ title: v })} />
            <InputField label="Eyebrow" value={b.content.subtitle || ''} onChange={v => upd({ subtitle: v })} />
            <div className="space-y-2">
              {(b.content.testimonials || []).map((t: any, i: number) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between"><span className="text-[9px] text-slate-400 font-bold">Review {i+1}</span>
                    <button onClick={() => { const ts = (b.content.testimonials || []).filter((_: any, ti: number) => ti !== i); upd({ testimonials: ts }); }} className="p-1 bg-red-50 text-red-500 rounded text-xs">✕</button></div>
                  <textarea rows={3} placeholder="Quote" value={t.quote} onChange={e => { const ts = [...(b.content.testimonials || [])]; ts[i] = { ...ts[i], quote: e.target.value }; upd({ testimonials: ts }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg resize-none" />
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Author" value={t.author} onChange={e => { const ts = [...(b.content.testimonials || [])]; ts[i] = { ...ts[i], author: e.target.value }; upd({ testimonials: ts }); }} className="text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                    <input placeholder="Role" value={t.role} onChange={e => { const ts = [...(b.content.testimonials || [])]; ts[i] = { ...ts[i], role: e.target.value }; upd({ testimonials: ts }); }} className="text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  </div>
                  <input placeholder="Avatar URL" value={t.avatarUrl} onChange={e => { const ts = [...(b.content.testimonials || [])]; ts[i] = { ...ts[i], avatarUrl: e.target.value }; upd({ testimonials: ts }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                </div>
              ))}
              <button onClick={() => upd({ testimonials: [...(b.content.testimonials || []), { quote: 'Great!', author: 'Name', role: 'Role', avatarUrl: '' }] })} className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded-lg flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add Review</button>
            </div>
          </div>
        )}

        {b.type === 'pricing_cards' && (
          <div className="space-y-4">
            <InputField label="Title" value={b.content.title || ''} onChange={v => upd({ title: v })} />
            <InputField label="Eyebrow" value={b.content.subtitle || ''} onChange={v => upd({ subtitle: v })} />
            <TextAreaField label="Description" value={b.content.description || ''} onChange={v => upd({ description: v })} rows={2} />
            <div className="space-y-2">
              {(b.content.pricingPlans || []).map((plan: any, i: number) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 cursor-pointer">
                      <input type="checkbox" checked={!!plan.popular} onChange={e => { const p = [...(b.content.pricingPlans || [])]; p[i] = { ...p[i], popular: e.target.checked }; upd({ pricingPlans: p }); }} /> Popular
                    </label>
                    <button onClick={() => { const p = (b.content.pricingPlans || []).filter((_: any, pi: number) => pi !== i); upd({ pricingPlans: p }); }} className="p-1 bg-red-50 text-red-500 rounded text-xs">✕</button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <input placeholder="Name" value={plan.name} onChange={e => { const p = [...(b.content.pricingPlans || [])]; p[i] = { ...p[i], name: e.target.value }; upd({ pricingPlans: p }); }} className="text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                    <input placeholder="Price" value={plan.price} onChange={e => { const p = [...(b.content.pricingPlans || [])]; p[i] = { ...p[i], price: e.target.value }; upd({ pricingPlans: p }); }} className="text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                    <input placeholder="Period" value={plan.period} onChange={e => { const p = [...(b.content.pricingPlans || [])]; p[i] = { ...p[i], period: e.target.value }; upd({ pricingPlans: p }); }} className="text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  </div>
                  <textarea placeholder="Features (one per line)" rows={3} value={(plan.features || []).join('\n')} onChange={e => { const p = [...(b.content.pricingPlans || [])]; p[i] = { ...p[i], features: e.target.value.split('\n').filter(Boolean) }; upd({ pricingPlans: p }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg resize-none" />
                  <input placeholder="Button text" value={plan.btnText} onChange={e => { const p = [...(b.content.pricingPlans || [])]; p[i] = { ...p[i], btnText: e.target.value }; upd({ pricingPlans: p }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                </div>
              ))}
              <button onClick={() => upd({ pricingPlans: [...(b.content.pricingPlans || []), { name: 'Plan', price: '$0', period: 'mo', features: ['Feature'], btnText: 'Get Started' }] })} className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded-lg flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add Plan</button>
            </div>
          </div>
        )}

        {b.type === 'cta_block' && (<div className="space-y-4"><TextAreaField label="Headline" value={b.content.title || ''} onChange={v => upd({ title: v })} rows={2} /><TextAreaField label="Description" value={b.content.description || ''} onChange={v => upd({ description: v })} /><div className="grid grid-cols-2 gap-2"><input placeholder="Primary CTA" value={b.content.primaryBtnText || ''} onChange={e => upd({ primaryBtnText: e.target.value })} className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg" /><input placeholder="URL" value={b.content.primaryBtnUrl || ''} onChange={e => upd({ primaryBtnUrl: e.target.value })} className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg" /></div><div className="grid grid-cols-2 gap-2"><input placeholder="Secondary" value={b.content.secondaryBtnText || ''} onChange={e => upd({ secondaryBtnText: e.target.value })} className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg" /><input placeholder="URL" value={b.content.secondaryBtnUrl || ''} onChange={e => upd({ secondaryBtnUrl: e.target.value })} className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg" /></div></div>)}

        {b.type === 'contact_form' && (<div className="space-y-4"><InputField label="Title" value={b.content.title || ''} onChange={v => upd({ title: v })} /><TextAreaField label="Description" value={b.content.description || ''} onChange={v => upd({ description: v })} /><InputField label="Button Text" value={b.content.formBtnText || ''} onChange={v => upd({ formBtnText: v })} /><div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 block">Fields</label>{(b.content.formFields || []).map((f: any, i: number) => (<div key={i} className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5"><div className="flex justify-between"><span className="text-[9px] text-slate-400 font-bold">Field {i+1}</span><button onClick={() => { const ff = (b.content.formFields || []).filter((_: any, fi: number) => fi !== i); upd({ formFields: ff }); }} className="p-0.5 bg-red-50 text-red-500 rounded text-xs">✕</button></div><div className="grid grid-cols-3 gap-1.5"><input placeholder="Label" value={f.label} onChange={e => { const ff = [...(b.content.formFields || [])]; ff[i] = { ...ff[i], label: e.target.value }; upd({ formFields: ff }); }} className="col-span-2 text-[11px] p-1.5 bg-white border border-slate-200 rounded" /><select value={f.type} onChange={e => { const ff = [...(b.content.formFields || [])]; ff[i] = { ...ff[i], type: e.target.value }; upd({ formFields: ff }); }} className="text-[10px] p-1.5 bg-white border border-slate-200 rounded"><option value="text">Text</option><option value="email">Email</option><option value="tel">Phone</option><option value="textarea">Textarea</option></select></div><input placeholder="Placeholder" value={f.placeholder} onChange={e => { const ff = [...(b.content.formFields || [])]; ff[i] = { ...ff[i], placeholder: e.target.value }; upd({ formFields: ff }); }} className="w-full text-[11px] p-1.5 bg-white border border-slate-200 rounded" /></div>))}<button onClick={() => upd({ formFields: [...(b.content.formFields || []), { label: 'Field', placeholder: 'Value...', type: 'text' }] })} className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded-lg flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add Field</button></div></div>)}

        {b.type === 'image_block' && (<div className="space-y-4"><InputField label="Image URL" value={b.content.imageUrl || ''} onChange={v => upd({ imageUrl: v })} /><div className="border border-dashed border-indigo-200 rounded-xl p-3 text-center relative bg-white hover:border-indigo-400 transition-colors cursor-pointer"><input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) { const r = new FileReader(); r.onloadend = () => upd({ imageUrl: r.result as string }); r.readAsDataURL(file); } }} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" /><span className="text-[10px] font-bold text-indigo-600">📂 Upload from device</span></div><InputField label="Alt Text" value={b.content.imageAlt || ''} onChange={v => upd({ imageAlt: v })} /><TextAreaField label="Caption" value={b.content.description || ''} onChange={v => upd({ description: v })} rows={2} /><div><label className="text-[10px] font-bold text-slate-500 block mb-1">Filter</label><select value={b.content.imageFilter || 'none'} onChange={e => upd({ imageFilter: e.target.value })} className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"><option value="none">None</option><option value="grayscale">Grayscale</option><option value="sepia">Sepia</option><option value="vintage">Vintage</option><option value="warm">Warm</option><option value="cool">Cool</option><option value="blur">Blur</option></select></div></div>)}

        {b.type === 'video_embed' && (<div className="space-y-4"><InputField label="Title" value={b.content.title || ''} onChange={v => upd({ title: v })} /><TextAreaField label="Description" value={b.content.description || ''} onChange={v => upd({ description: v })} rows={2} /><div><label className="text-[11px] font-bold text-slate-600 block mb-1">Embed URL</label><input value={b.content.videoUrl || ''} onChange={e => upd({ videoUrl: e.target.value })} placeholder="https://youtube.com/embed/..." className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl" /><p className="text-[9px] text-slate-400 mt-1">Use embed URL format: youtube.com/embed/VIDEO_ID</p></div></div>)}

        {b.type === 'footer' && (<div className="space-y-4"><InputField label="Brand Name" value={b.content.brandName || ''} onChange={v => upd({ brandName: v })} /><InputField label="Copyright" value={b.content.copyright || ''} onChange={v => upd({ copyright: v })} /><div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl"><span className="text-[10px] font-bold text-slate-400 block">Footer Links</span>{(b.content.links || []).map((lnk: any, i: number) => (<div key={i} className="flex gap-2 items-center"><input value={lnk.label} onChange={e => { const l = [...(b.content.links || [])]; l[i] = { ...l[i], label: e.target.value }; upd({ links: l }); }} className="flex-1 text-[11px] p-2 bg-white border border-slate-200 rounded-lg" /><input value={lnk.url} onChange={e => { const l = [...(b.content.links || [])]; l[i] = { ...l[i], url: e.target.value }; upd({ links: l }); }} className="flex-1 text-[11px] p-2 bg-white border border-slate-200 rounded-lg" /><button onClick={() => { const l = (b.content.links || []).filter((_: any, li: number) => li !== i); upd({ links: l }); }} className="p-1 bg-red-50 text-red-500 rounded text-xs">✕</button></div>))}<button onClick={() => upd({ links: [...(b.content.links || []), { label: 'Link', url: '#' }] })} className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-white border border-slate-200 rounded-lg flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add Link</button></div></div>)}

        {b.type === 'divider' && (<div><label className="text-xs font-bold text-slate-600 block mb-2">Style</label><div className="grid grid-cols-3 gap-2">{(['solid','dashed','dotted'] as const).map(s => (<button key={s} onClick={() => upd({ dividerStyle: s })} className={`py-2 rounded-xl border capitalize font-semibold text-xs transition-all ${b.content.dividerStyle === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>{s}</button>))}</div></div>)}

        {b.type === 'spacer' && (<div><div className="flex justify-between text-xs font-bold text-slate-600 mb-2"><label>Height</label><span className="font-mono text-indigo-600">{b.content.spacerHeight || 48}px</span></div><input type="range" min={8} max={240} step={8} value={b.content.spacerHeight || 48} onChange={e => upd({ spacerHeight: +e.target.value })} className="w-full accent-indigo-600" /></div>)}
      </div>
    );

    if (blockTab === 'appearance') return (
      <div className="space-y-5">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Appearance</p>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <SectionHeader title="Spacing" sKey="spacing" />
          {expandedSections.spacing && (
            <div className="space-y-3">
              {[['paddingTop', 'Top Padding'], ['paddingBottom', 'Bottom Padding']].map(([key, lbl]) => (
                <div key={key}><div className="flex justify-between text-[11px] text-slate-500 font-semibold mb-1"><span>{lbl}</span><span className="font-mono text-indigo-600">{(b.styles as any)[key]}px</span></div>
                  <input type="range" min={0} max={200} step={8} value={(b.styles as any)[key]} onChange={e => updS({ [key]: +e.target.value })} className="w-full accent-indigo-600" /></div>
              ))}
              <div><label className="text-[10px] font-bold text-slate-500 block mb-1">Max Width</label>
                <select value={b.styles.maxWidth || '7xl'} onChange={e => updS({ maxWidth: e.target.value })} className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg">
                  <option value="7xl">Full (1280px)</option><option value="5xl">Wide (1024px)</option><option value="4xl">Medium (896px)</option><option value="3xl">Narrow (768px)</option><option value="2xl">Compact (672px)</option>
                </select></div>
            </div>
          )}
        </div>
        <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Alignment</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-xl">
            {(['left','center','right'] as const).map(a => (<button key={a} onClick={() => updS({ align: a })} className={`py-2 rounded-lg flex items-center justify-center transition-all ${b.styles.align === a ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{a === 'left' ? <AlignLeft className="w-4 h-4" /> : a === 'center' ? <AlignCenter className="w-4 h-4" /> : <AlignRight className="w-4 h-4" />}</button>))}
          </div></div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
          <SectionHeader title="Colors" sKey="colors" />
          {expandedSections.colors && (<>
            <div><div className="flex justify-between items-center mb-2"><span className="text-[10px] font-bold text-slate-400">Background</span><input type="color" value={b.styles.bgColor} onChange={e => updS({ bgColor: e.target.value })} className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200" /></div><div className="grid grid-cols-6 gap-1">{BG_SWATCHES.map(c => <ColorSwatch key={c} color={c} selected={b.styles.bgColor === c} onClick={() => updS({ bgColor: c })} />)}</div></div>
            <div><div className="flex justify-between items-center mb-2"><span className="text-[10px] font-bold text-slate-400">Brand/Accent</span><input type="color" value={b.styles.brandColor} onChange={e => updS({ brandColor: e.target.value })} className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200" /></div><div className="grid grid-cols-6 gap-1">{BRAND_SWATCHES.map(c => <ColorSwatch key={c} color={c} selected={b.styles.brandColor === c} onClick={() => updS({ brandColor: c })} />)}</div></div>
            <div className="flex items-center gap-2"><input type="color" value={b.styles.textColor} onChange={e => updS({ textColor: e.target.value })} className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer" /><div className="flex-1"><label className="text-[10px] font-bold text-slate-400 block">Text Color</label><input type="text" value={b.styles.textColor} onChange={e => updS({ textColor: e.target.value })} className="w-full text-xs px-2 py-1 border border-slate-200 bg-white rounded font-mono" /></div></div>
          </>)}
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gradient BG</span>
            <button onClick={() => updS({ useGradient: !b.styles.useGradient })} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${b.styles.useGradient ? 'bg-indigo-600' : 'bg-slate-300'}`}><span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow-sm ${b.styles.useGradient ? 'translate-x-4' : 'translate-x-0.5'}`} /></button>
          </div>
          {b.styles.useGradient && (<div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-[9px] font-bold text-slate-400 block mb-1">From</label><div className="flex gap-1"><input type="color" value={b.styles.gradientFrom || '#4f46e5'} onChange={e => updS({ gradientFrom: e.target.value })} className="w-8 h-7 rounded border border-slate-200" /><input type="text" value={b.styles.gradientFrom || '#4f46e5'} onChange={e => updS({ gradientFrom: e.target.value })} className="flex-1 text-[10px] p-1 border border-slate-200 bg-white rounded font-mono" /></div></div>
              <div><label className="text-[9px] font-bold text-slate-400 block mb-1">To</label><div className="flex gap-1"><input type="color" value={b.styles.gradientTo || '#7c3aed'} onChange={e => updS({ gradientTo: e.target.value })} className="w-8 h-7 rounded border border-slate-200" /><input type="text" value={b.styles.gradientTo || '#7c3aed'} onChange={e => updS({ gradientTo: e.target.value })} className="flex-1 text-[10px] p-1 border border-slate-200 bg-white rounded font-mono" /></div></div>
            </div>
            <div><label className="text-[9px] font-bold text-slate-400 block mb-1">Direction</label><div className="grid grid-cols-4 gap-1">{([['to-r','→'],['to-b','↓'],['to-br','↘'],['to-tr','↗']] as const).map(([v, ico]) => (<button key={v} onClick={() => updS({ gradientDirection: v })} className={`py-1.5 text-sm rounded border transition-all ${b.styles.gradientDirection === v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200'}`}>{ico}</button>))}</div></div>
          </div>)}
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Font Family</span>
          <select value={b.styles.fontFamily || ''} onChange={e => updS({ fontFamily: e.target.value })} className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg">
            <option value="">Global Default</option>{FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Border</span>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1"><span>Width</span><span className="font-mono text-indigo-600">{b.styles.borderWidth || 0}px</span></div>
          <input type="range" min={0} max={8} step={1} value={b.styles.borderWidth || 0} onChange={e => updS({ borderWidth: +e.target.value })} className="w-full accent-indigo-600" />
          <div><label className="text-[10px] font-bold text-slate-400 block mb-1">Corner Radius</label><div className="grid grid-cols-4 gap-1">{(['none','md','xl','3xl'] as const).map(r => (<button key={r} onClick={() => updS({ borderRadius: r })} className={`py-1.5 rounded-lg border text-[10px] font-bold capitalize transition-all ${b.styles.borderRadius === r ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>{r}</button>))}</div></div>
        </div>
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button onClick={() => onDuplicateBlock(b.id)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"><Copy className="w-3.5 h-3.5" /> Duplicate</button>
          <button onClick={() => { onDeleteBlock(b.id); setSelection({ blockId: null, elementId: null }); }} className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-red-200/40"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
        </div>
      </div>
    );

    return (
      <div className="space-y-4">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Advanced</p>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Shadow</span>
          <div className="grid grid-cols-3 gap-1">{(['none','soft','heavy'] as const).map(s => (<button key={s} onClick={() => updS({ shadow: s })} className={`py-1.5 rounded-lg border text-[10px] font-bold capitalize transition-all ${b.styles.shadow === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>{s}</button>))}</div>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[10px] text-amber-700"><strong className="font-black block mb-1">Block ID</strong><code className="font-mono text-[9px] break-all opacity-70">{b.id}</code></div>
      </div>
    );
  };

  return (
    <div className="w-72 xl:w-80 border-r border-slate-200 bg-white flex flex-col h-full select-none shadow-sm">
      {selectedBlock ? (
        <div className="p-4 border-b border-slate-100 flex flex-col gap-2 shrink-0 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div><span className="text-[9px] bg-indigo-100 text-indigo-700 font-black uppercase px-2 py-0.5 rounded-full tracking-wider">Editing</span><h3 className="font-black text-slate-800 text-xs truncate max-w-[13rem] mt-1 capitalize">{selectedBlock.name}</h3></div>
            <button onClick={() => setSelection({ blockId: null, elementId: null })} className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 shadow-sm px-2.5 py-1 rounded-lg cursor-pointer">← Back</button>
          </div>
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 gap-0.5">
            {(['content','appearance','advanced'] as const).map(t => (<button key={t} onClick={() => setBlockTab(t)} className={`flex-1 py-1.5 rounded-lg transition-all text-[9px] font-black uppercase tracking-wide capitalize ${blockTab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{t}</button>))}
          </div>
        </div>
      ) : (
        <div className="p-4 border-b border-slate-100 shrink-0 bg-slate-50/20">
          <div className="flex items-center justify-between mb-3"><h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">Builder Panel</h3><span className="text-[8px] px-1.5 py-0.5 bg-slate-100 text-slate-500 font-mono rounded">v3.0</span></div>
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 gap-0.5">
            {[{key:'blocks',icon:PlusCircle,label:'Blocks'},{key:'settings',icon:Palette,label:'Theme'},{key:'layers',icon:Layers,label:'Layers'}].map(({key,icon:Icon,label}) => (<button key={key} onClick={() => setActiveTab(key as any)} className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all text-[9px] font-black uppercase tracking-wide ${activeTab === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-500'}`}><Icon className="w-3 h-3" />{label}</button>))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {selectedBlock ? <div className="animate-fade-in">{renderContent()}</div> : (
          <>
            {activeTab === 'blocks' && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {Object.keys(categoryMap).map(t => (<button key={t} onClick={() => setActiveCategory(t)} className={`px-2 py-1 text-[9px] font-bold rounded-lg border whitespace-nowrap transition-all ${activeCategory === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600'}`}>{t}</button>))}
                </div>
                <div className="relative"><Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="text" placeholder="Search blocks..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div className="space-y-1.5 max-h-[55vh] overflow-y-auto">
                  {filtered.map(opt => {
                    const Icon = opt.icon;
                    return (<div key={opt.type} onClick={() => onAddBlock(opt.type)} className="group p-2.5 border border-slate-100 hover:border-indigo-400 bg-white hover:bg-indigo-50/30 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                      <div className="w-8 h-8 bg-slate-50 group-hover:bg-indigo-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:text-indigo-600 transition-colors shrink-0"><Icon className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5"><h4 className="font-black text-xs text-slate-800 group-hover:text-indigo-700">{opt.label}</h4>{(opt as any).isNew && <span className="text-[7px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full uppercase">NEW</span>}</div>
                        <p className="text-[10px] text-slate-400 leading-snug mt-0.5 line-clamp-1">{opt.description}</p>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 group-hover:text-indigo-400 pt-0.5">+</span>
                    </div>);
                  })}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Global Design Tokens</p>
                <div className="p-3 bg-indigo-50/40 border border-indigo-100/60 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-indigo-900"><Sparkles className="w-4 h-4 text-indigo-500" /> Themes</div>
                  {([{id:'minimal_modern',label:'Minimal Modern',desc:'Clean, spacious'},{id:'glassmorphism',label:'Frosted Glass',desc:'Translucent surfaces'},{id:'neo_brutalist',label:'Neo-Brutalist',desc:'Bold borders'},{id:'cosmic_dark',label:'Cosmic Dark',desc:'Deep dark palette'}] as const).map(thm => (<button key={thm.id} onClick={() => { const s = { ...project.style, theme: thm.id }; if (thm.id === 'cosmic_dark') s.background = '#020617'; else if (thm.id === 'neo_brutalist') { s.background = '#ffffff'; s.radius = '0px'; s.shadows = 'heavy'; } else { s.background = '#ffffff'; s.radius = '12px'; } onChangeStyle(s); }} className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${project.style.theme === thm.id ? 'border-indigo-600 bg-white font-bold shadow-sm' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 text-slate-500'}`}><div className="flex justify-between items-center"><span className="font-bold">{thm.label}</span>{project.style.theme === thm.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}</div><p className="text-[9px] font-normal text-slate-400 mt-0.5">{thm.desc}</p></button>))}
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Global Font</span>
                  <select value={project.style.fontFamily} onChange={e => onChangeStyle({ ...project.style, fontFamily: e.target.value })} className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg">{FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</select>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Canvas Background</span>
                  <div className="flex items-center gap-2"><input type="color" value={project.style.background} onChange={e => onChangeStyle({ ...project.style, background: e.target.value })} className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer" /><input type="text" value={project.style.background} onChange={e => onChangeStyle({ ...project.style, background: e.target.value })} className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg font-mono font-bold text-slate-800" /></div>
                  <div className="grid grid-cols-6 gap-1">{BG_SWATCHES.map(c => <div key={c} onClick={() => onChangeStyle({ ...project.style, background: c })} className={`h-5 rounded border cursor-pointer transition-transform hover:scale-110 flex items-center justify-center ${project.style.background === c ? 'border-indigo-600' : 'border-slate-200'}`} style={{ backgroundColor: c }}>{project.style.background === c && <Check className={`w-3 h-3 ${['#0f172a','#020617','#1e293b'].includes(c) ? 'text-white' : 'text-slate-800'}`} />}</div>)}</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Default Corners</span>
                  <div className="grid grid-cols-4 gap-1">{(['none','6px','12px','24px'] as const).map(r => (<button key={r} onClick={() => onChangeStyle({ ...project.style, radius: r })} className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all ${project.style.radius === r ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>{r}</button>))}</div>
                </div>
              </div>
            )}

            {activeTab === 'layers' && (
              <div className="space-y-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Page Layers ({project.blocks.length})</p>
                {project.blocks.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl"><Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" /><p className="text-xs text-slate-400 font-bold">No blocks yet</p><button onClick={() => setActiveTab('blocks')} className="mt-3 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200/40 font-bold px-3 py-1.5 rounded-xl">+ Add Block</button></div>
                ) : (
                  <div className="space-y-1.5">
                    {project.blocks.map((blk, idx) => (
                      <div key={blk.id} onClick={() => setSelection({ blockId: blk.id, elementId: null })} className="p-2.5 border border-slate-200 bg-white hover:border-indigo-400 rounded-xl flex items-center justify-between cursor-pointer transition-all group shadow-sm">
                        <div className="flex items-center gap-2 min-w-0 flex-1"><span className="text-[9px] font-mono text-slate-400 w-4 shrink-0">{idx+1}</span><div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: blk.styles.bgColor }} /><h4 className="font-bold text-xs text-slate-700 truncate capitalize">{blk.name}</h4></div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button disabled={idx===0} onClick={e => { e.stopPropagation(); onMoveBlock(blk.id,'up'); }} className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"><ArrowUp className="w-3 h-3" /></button>
                          <button disabled={idx===project.blocks.length-1} onClick={e => { e.stopPropagation(); onMoveBlock(blk.id,'down'); }} className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"><ArrowDown className="w-3 h-3" /></button>
                          <button onClick={e => { e.stopPropagation(); onDeleteBlock(blk.id); }} className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
