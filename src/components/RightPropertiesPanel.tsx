import React, { useState, useCallback, useRef } from 'react';
import { ProjectState, Block, StyleConfig, SelectionState, BlockType } from '../types';

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

interface ComponentOption {
  type: BlockType;
  label: string;
  description: string;
  category: 'header_footer' | 'marketing' | 'structure' | 'rich_media' | 'content';
  isNew?: boolean;
}

const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { label: 'Poppins', value: "'Poppins', sans-serif" },
  { label: 'Roboto', value: "'Roboto', sans-serif" },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif" },
  { label: 'DM Sans', value: "'DM Sans', sans-serif" },
  { label: 'Syne', value: "'Syne', sans-serif" },
  { label: 'Geist', value: "'Geist', system-ui, sans-serif" },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: "'Courier New', monospace" },
];

const BG_SWATCHES = ['#ffffff', '#f8fafc', '#f1f5f9', '#0f172a', '#1e293b', '#fef08a', '#ffedd5', '#ecfdf5', '#020617', '#fdf4ff', '#eff6ff', '#fff7ed'];
const BRAND_SWATCHES = ['#4f46e5', '#2563eb', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#000000', '#0ea5e9', '#f97316', '#84cc16', '#14b8a6'];

// Free stock photos from Unsplash (no API key needed for direct URLs)
const STOCK_PHOTOS = {
  'Business': [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80',
  ],
  'People': [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80',
  ],
  'Abstract': [
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
    'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80',
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
  ],
  'Nature': [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80',
  ],
  'Tech': [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
  ],
  'Products': [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80',
  ],
};

// Stock photo picker component
const StockPhotoPicker = ({ onSelect }: { onSelect: (url: string) => void }) => {
  const [activeCategory, setActiveCategory] = useState('Business');
  const categories = Object.keys(STOCK_PHOTOS);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-2 py-1 text-[9px] font-bold rounded-lg border transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'}`}>
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {(STOCK_PHOTOS[activeCategory as keyof typeof STOCK_PHOTOS] || []).map((url, i) => (
          <div key={i} className="relative group cursor-pointer rounded-lg overflow-hidden aspect-video"
            onClick={() => onSelect(url)}>
            <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] font-bold bg-indigo-600 px-2 py-1 rounded-lg transition-all">
                Use Photo
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-slate-400 text-center">Photos by Unsplash · Free to use</p>
    </div>
  );
};

// YouTube URL → embed URL converter
const convertToEmbedUrl = (url: string): string => {
  if (!url) return '';
  // Already an embed URL
  if (url.includes('youtube.com/embed/') || url.includes('youtu.be/embed/')) return url;
  // YouTube watch URL
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`;
  return url;
};

// Template presets for different page types
const PAGE_TEMPLATES = [
  {
    label: 'Book Launch', type: 'book',
    desc: 'Perfect for selling books, ebooks, and courses',
    blocks: ['navbar', 'hero_section', 'features_grid', 'testimonials', 'pricing_cards', 'cta_block', 'footer'] as BlockType[]
  },
  {
    label: 'Affiliate Page', type: 'affiliate',
    desc: 'Product review & affiliate marketing',
    blocks: ['navbar', 'hero_section', 'stats_block', 'features_grid', 'testimonials', 'faq_block', 'cta_block', 'footer'] as BlockType[]
  },
  {
    label: 'SaaS Product', type: 'saas',
    desc: 'Software as a Service landing page',
    blocks: ['navbar', 'hero_section', 'logo_bar', 'features_grid', 'pricing_cards', 'testimonials', 'cta_block', 'footer'] as BlockType[]
  },
  {
    label: 'Portfolio', type: 'portfolio',
    desc: 'Showcase your work and projects',
    blocks: ['navbar', 'hero_section', 'image_block', 'team_block', 'testimonials', 'contact_form', 'footer'] as BlockType[]
  },
  {
    label: 'Product Page', type: 'product',
    desc: 'E-commerce style product landing',
    blocks: ['navbar', 'hero_section', 'stats_block', 'features_grid', 'testimonials', 'faq_block', 'pricing_cards', 'footer'] as BlockType[]
  },
  {
    label: 'Lead Capture', type: 'lead',
    desc: 'Collect emails and leads',
    blocks: ['navbar', 'hero_section', 'features_grid', 'contact_form', 'footer'] as BlockType[]
  },
];

export default function RightPropertiesPanel({
  project, onChangeStyle, selection, setSelection, onUpdateBlock,
  onDeleteBlock, onDuplicateBlock, onMoveBlock, onAddBlock
}: RightPropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'blocks' | 'settings' | 'layers'>('blocks');
  const [blockTab, setBlockTab] = useState<'content' | 'appearance' | 'advanced'>('content');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ spacing: true, colors: true });
  const [showStockPhotos, setShowStockPhotos] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (key: string) => setExpandedSections(p => ({ ...p, [key]: !p[key] }));
  const selectedBlock = project.blocks.find(b => b.id === selection.blockId);

  const componentOptions: ComponentOption[] = [
    { type: 'navbar', label: 'Navbar', description: 'Top navigation with brand, links & CTA.', category: 'header_footer' },
    { type: 'hero_section', label: 'Hero Section', description: 'Bold headline, description & CTA buttons.', category: 'marketing' },
    { type: 'text_block', label: 'Text Block', description: 'Rich editable text, headings, blockquotes.', category: 'content', isNew: true },
    { type: 'stats_block', label: 'Stats / Numbers', description: 'Showcase metrics and key statistics.', category: 'marketing', isNew: true },
    { type: 'logo_bar', label: 'Logo Bar', description: 'Trusted by / partner logos showcase.', category: 'marketing', isNew: true },
    { type: 'features_grid', label: 'Features Grid', description: '3-column feature cards with icons.', category: 'marketing' },
    { type: 'testimonials', label: 'Testimonials', description: 'Customer quotes with star ratings.', category: 'marketing' },
    { type: 'pricing_cards', label: 'Pricing Plans', description: 'Tiered pricing with feature lists.', category: 'marketing' },
    { type: 'faq_block', label: 'FAQ', description: 'Accordion frequently asked questions.', category: 'content', isNew: true },
    { type: 'team_block', label: 'Team Section', description: 'Team member cards with avatars.', category: 'content', isNew: true },
    { type: 'cta_block', label: 'Call to Action', description: 'Full-width attention banner.', category: 'marketing' },
    { type: 'contact_form', label: 'Contact Form', description: 'Lead capture form with fields.', category: 'structure' },
    { type: 'image_block', label: 'Image', description: 'Image with filters, borders & captions.', category: 'rich_media' },
    { type: 'video_embed', label: 'Video Embed', description: 'YouTube, Vimeo, or Loom video.', category: 'rich_media' },
    { type: 'divider', label: 'Divider', description: 'Solid, dashed, or dotted separator.', category: 'structure' },
    { type: 'spacer', label: 'Spacer', description: 'Adjustable blank vertical space.', category: 'structure' },
    { type: 'footer', label: 'Footer', description: 'Brand, copyright & page links.', category: 'header_footer' },
  ];

  const categoryMap: Record<string, string> = {
    'All': 'All', 'Header/Footer': 'header_footer', 'Marketing': 'marketing',
    'Content': 'content', 'Rich Media': 'rich_media', 'Structure': 'structure'
  };
  const tabs = Object.keys(categoryMap);

  const filtered = componentOptions.filter(opt => {
    const matchSearch = opt.label.toLowerCase().includes(searchTerm.toLowerCase()) || opt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = activeCategory === 'All' || opt.category === categoryMap[activeCategory];
    return matchSearch && matchCat;
  });

  const SectionHeader = ({ title, sKey }: { title: string; sKey: string }) => (
    <button onClick={() => toggleSection(sKey)} className="w-full flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest py-1 mb-2 hover:text-slate-600 transition-colors">
      <span>{title}</span>
      <span className="text-[9px] font-bold normal-case tracking-normal text-slate-400">{expandedSections[sKey] ? 'Hide' : 'Show'}</span>
    </button>
  );

  const ColorSwatch = ({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) => (
    <button onClick={onClick}
      className={`w-full h-6 rounded-md border transition-all cursor-pointer hover:scale-110 ${selected ? 'border-indigo-600 scale-110 shadow-sm ring-1 ring-indigo-400' : 'border-slate-200'}`}
      style={{ backgroundColor: color }}
    />
  );

  // Image upload handler
  const handleImageUpload = (file: File, onUrl: (url: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => onUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const renderBlockContent = () => {
    if (!selectedBlock) return null;
    const b = selectedBlock;
    const upd = (content: Partial<typeof b.content>) => onUpdateBlock(b.id, { content: { ...b.content, ...content } });
    const updS = (styles: Partial<typeof b.styles>) => onUpdateBlock(b.id, { styles: { ...b.styles, ...styles } });

    if (blockTab === 'content') return (
      <div className="space-y-4">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Content Editor</p>

        {/* ── TEXT BLOCK ── */}
        {b.type === 'text_block' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 block">Text Content</label>
              <textarea rows={6} value={b.content.textContent || ''}
                onChange={e => upd({ textContent: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">HTML Tag</label>
                <select value={b.content.textTag || 'p'} onChange={e => upd({ textTag: e.target.value as any })}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg">
                  <option value="p">Paragraph</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                  <option value="h4">Heading 4</option>
                  <option value="blockquote">Blockquote</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Font Weight</label>
                <select value={b.content.textFontWeight || '400'} onChange={e => upd({ textFontWeight: e.target.value as any })}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg">
                  <option value="400">Regular</option>
                  <option value="500">Medium</option>
                  <option value="600">Semibold</option>
                  <option value="700">Bold</option>
                  <option value="800">Extrabold</option>
                  <option value="900">Black</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>Font Size</span><span className="font-mono text-indigo-600">{b.content.textFontSize || 16}px</span>
              </div>
              <input type="range" min={11} max={96} step={1} value={b.content.textFontSize || 16}
                onChange={e => upd({ textFontSize: +e.target.value })} className="w-full accent-indigo-600" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>Line Height</span><span className="font-mono text-indigo-600">{b.content.textLineHeight || 1.8}</span>
              </div>
              <input type="range" min={1} max={3} step={0.1} value={b.content.textLineHeight || 1.8}
                onChange={e => upd({ textLineHeight: +e.target.value })} className="w-full accent-indigo-600" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>Letter Spacing</span><span className="font-mono text-indigo-600">{b.content.textLetterSpacing || 0}</span>
              </div>
              <input type="range" min={-10} max={30} step={1} value={b.content.textLetterSpacing || 0}
                onChange={e => upd({ textLetterSpacing: +e.target.value })} className="w-full accent-indigo-600" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Decoration</label>
                <select value={b.content.textDecoration || 'none'} onChange={e => upd({ textDecoration: e.target.value as any })}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg">
                  <option value="none">None</option>
                  <option value="underline">Underline</option>
                  <option value="line-through">Strikethrough</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Transform</label>
                <select value={b.content.textTransform || 'none'} onChange={e => upd({ textTransform: e.target.value as any })}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg">
                  <option value="none">Default</option>
                  <option value="uppercase">UPPERCASE</option>
                  <option value="lowercase">lowercase</option>
                  <option value="capitalize">Capitalize</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── STATS BLOCK ── */}
        {b.type === 'stats_block' && (
          <div className="space-y-4">
            <InputField label="Section Title" value={b.content.title || ''} onChange={v => upd({ title: v })} />
            <InputField label="Eyebrow Label" value={b.content.subtitle || ''} onChange={v => upd({ subtitle: v })} />
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 block">Stats Items</label>
              {(b.content.stats || []).map((stat, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    <input placeholder="Prefix" value={stat.prefix || ''} onChange={e => { const s = [...(b.content.stats || [])]; s[i] = { ...s[i], prefix: e.target.value }; upd({ stats: s }); }} className="text-[11px] p-1.5 bg-white border border-slate-200 rounded" />
                    <input placeholder="Value *" value={stat.value} onChange={e => { const s = [...(b.content.stats || [])]; s[i] = { ...s[i], value: e.target.value }; upd({ stats: s }); }} className="text-[11px] p-1.5 bg-white border border-slate-200 rounded font-bold" />
                    <input placeholder="Suffix" value={stat.suffix || ''} onChange={e => { const s = [...(b.content.stats || [])]; s[i] = { ...s[i], suffix: e.target.value }; upd({ stats: s }); }} className="text-[11px] p-1.5 bg-white border border-slate-200 rounded" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <input placeholder="Label" value={stat.label} onChange={e => { const s = [...(b.content.stats || [])]; s[i] = { ...s[i], label: e.target.value }; upd({ stats: s }); }} className="flex-1 text-[11px] p-1.5 bg-white border border-slate-200 rounded" />
                    <button onClick={() => { const s = (b.content.stats || []).filter((_, si) => si !== i); upd({ stats: s }); }} className="p-1 text-red-500 bg-red-50 rounded hover:bg-red-100 text-[10px] font-bold">Remove</button>
                  </div>
                </div>
              ))}
              <button onClick={() => upd({ stats: [...(b.content.stats || []), { value: '100', label: 'New Metric', suffix: '+' }] })}
                className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded-lg hover:bg-indigo-100 transition-colors">
                + Add Stat
              </button>
            </div>
          </div>
        )}

        {/* ── FAQ BLOCK ── */}
        {b.type === 'faq_block' && (
          <div className="space-y-4">
            <InputField label="Title" value={b.content.title || ''} onChange={v => upd({ title: v })} />
            <InputField label="Eyebrow" value={b.content.subtitle || ''} onChange={v => upd({ subtitle: v })} />
            <TextAreaField label="Description" value={b.content.description || ''} onChange={v => upd({ description: v })} />
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 block">FAQ Items</label>
              {(b.content.faqs || []).map((faq, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400">Question {i + 1}</span>
                    <button onClick={() => { const f = (b.content.faqs || []).filter((_, fi) => fi !== i); upd({ faqs: f }); }} className="p-1 text-red-500 bg-red-50 rounded text-[10px] font-bold hover:bg-red-100">Remove</button>
                  </div>
                  <input placeholder="Question" value={faq.question} onChange={e => { const f = [...(b.content.faqs || [])]; f[i] = { ...f[i], question: e.target.value }; upd({ faqs: f }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  <textarea placeholder="Answer" rows={2} value={faq.answer} onChange={e => { const f = [...(b.content.faqs || [])]; f[i] = { ...f[i], answer: e.target.value }; upd({ faqs: f }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg resize-none" />
                </div>
              ))}
              <button onClick={() => upd({ faqs: [...(b.content.faqs || []), { question: 'New question?', answer: 'Answer here.' }] })}
                className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded-lg hover:bg-indigo-100 transition-colors">
                + Add FAQ
              </button>
            </div>
          </div>
        )}

        {/* ── TEAM BLOCK ── */}
        {b.type === 'team_block' && (
          <div className="space-y-4">
            <InputField label="Title" value={b.content.title || ''} onChange={v => upd({ title: v })} />
            <InputField label="Eyebrow" value={b.content.subtitle || ''} onChange={v => upd({ subtitle: v })} />
            <TextAreaField label="Description" value={b.content.description || ''} onChange={v => upd({ description: v })} />
            <div className="space-y-2">
              {(b.content.team || []).map((member, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[9px] font-bold text-slate-400">Member {i + 1}</span>
                    <button onClick={() => { const t = (b.content.team || []).filter((_, ti) => ti !== i); upd({ team: t }); }} className="p-1 text-red-500 bg-red-50 rounded text-[10px] font-bold">Remove</button>
                  </div>
                  {member.avatarUrl && <img src={member.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />}
                  <input placeholder="Name" value={member.name} onChange={e => { const t = [...(b.content.team || [])]; t[i] = { ...t[i], name: e.target.value }; upd({ team: t }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  <input placeholder="Role / Title" value={member.role} onChange={e => { const t = [...(b.content.team || [])]; t[i] = { ...t[i], role: e.target.value }; upd({ team: t }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  <textarea placeholder="Short bio" rows={2} value={member.bio} onChange={e => { const t = [...(b.content.team || [])]; t[i] = { ...t[i], bio: e.target.value }; upd({ team: t }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg resize-none" />
                  <input placeholder="Avatar URL" value={member.avatarUrl} onChange={e => { const t = [...(b.content.team || [])]; t[i] = { ...t[i], avatarUrl: e.target.value }; upd({ team: t }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                </div>
              ))}
              <button onClick={() => upd({ team: [...(b.content.team || []), { name: 'Team Member', role: 'Role', bio: 'Bio here.', avatarUrl: '' }] })}
                className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded-lg hover:bg-indigo-100 transition-colors">
                + Add Member
              </button>
            </div>
          </div>
        )}

        {/* ── LOGO BAR ── */}
        {b.type === 'logo_bar' && (
          <div className="space-y-4">
            <InputField label="Title / Label" value={b.content.logoBarTitle || ''} onChange={v => upd({ logoBarTitle: v })} />
            <div className="space-y-2">
              {(b.content.logos || []).map((logo, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input placeholder="Name" value={logo.name} onChange={e => { const l = [...(b.content.logos || [])]; l[i] = { ...l[i], name: e.target.value }; upd({ logos: l }); }} className="w-1/3 text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  <input placeholder="Logo URL" value={logo.logoUrl} onChange={e => { const l = [...(b.content.logos || [])]; l[i] = { ...l[i], logoUrl: e.target.value }; upd({ logos: l }); }} className="flex-1 text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  <button onClick={() => { const l = (b.content.logos || []).filter((_, li) => li !== i); upd({ logos: l }); }} className="p-1 text-red-500 bg-red-50 rounded text-[10px] font-bold">Remove</button>
                </div>
              ))}
              <button onClick={() => upd({ logos: [...(b.content.logos || []), { name: 'Brand', logoUrl: '' }] })}
                className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded-lg hover:bg-indigo-100 transition-colors">
                + Add Logo
              </button>
            </div>
          </div>
        )}

        {/* ── NAVBAR ── */}
        {b.type === 'navbar' && (
          <div className="space-y-4">
            <InputField label="Brand Name" value={b.content.brandName || ''} onChange={v => upd({ brandName: v })} />
            <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 block">Nav Links</span>
              {(b.content.links || []).map((lnk, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={lnk.label} placeholder="Label" onChange={e => { const l = [...(b.content.links || [])]; l[i] = { ...l[i], label: e.target.value }; upd({ links: l }); }} className="w-1/2 text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  <input value={lnk.url} placeholder="#anchor" onChange={e => { const l = [...(b.content.links || [])]; l[i] = { ...l[i], url: e.target.value }; upd({ links: l }); }} className="w-1/2 text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  <button onClick={() => { const l = (b.content.links || []).filter((_, li) => li !== i); upd({ links: l }); }} className="p-1 bg-red-50 text-red-500 rounded text-[10px] font-bold">Remove</button>
                </div>
              ))}
              <button onClick={() => upd({ links: [...(b.content.links || []), { label: 'New Link', url: '#' }] })}
                className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-white border border-slate-200 rounded-lg hover:bg-indigo-50 transition-colors">
                + Add Link
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">CTA Label</label>
                <input value={b.content.primaryBtnText || ''} onChange={e => upd({ primaryBtnText: e.target.value })} className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">CTA URL</label>
                <input value={b.content.primaryBtnUrl || ''} onChange={e => upd({ primaryBtnUrl: e.target.value })} className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg" />
              </div>
            </div>
          </div>
        )}

        {/* ── HERO ── */}
        {b.type === 'hero_section' && (
          <div className="space-y-4">
            <InputField label="Eyebrow Tag" value={b.content.subtitle || ''} onChange={v => upd({ subtitle: v })} />
            <TextAreaField label="Main Headline" value={b.content.title || ''} onChange={v => upd({ title: v })} rows={3} />
            <TextAreaField label="Description" value={b.content.description || ''} onChange={v => upd({ description: v })} rows={3} />
            <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 block">Primary Button</span>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Label" value={b.content.primaryBtnText || ''} onChange={e => upd({ primaryBtnText: e.target.value })} className="text-xs p-2 bg-white border border-slate-200 rounded-lg" />
                <input placeholder="URL" value={b.content.primaryBtnUrl || ''} onChange={e => upd({ primaryBtnUrl: e.target.value })} className="text-xs p-2 bg-white border border-slate-200 rounded-lg" />
              </div>
              <select value={b.content.primaryBtnStyle || 'filled'} onChange={e => upd({ primaryBtnStyle: e.target.value as any })} className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg">
                <option value="filled">Filled</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost / Arrow</option>
              </select>
            </div>
            <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 block">Secondary Button</span>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Label" value={b.content.secondaryBtnText || ''} onChange={e => upd({ secondaryBtnText: e.target.value })} className="text-xs p-2 bg-white border border-slate-200 rounded-lg" />
                <input placeholder="URL" value={b.content.secondaryBtnUrl || ''} onChange={e => upd({ secondaryBtnUrl: e.target.value })} className="text-xs p-2 bg-white border border-slate-200 rounded-lg" />
              </div>
            </div>
            {/* Enhanced Hero Image Section */}
            <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 block">Hero Image</span>
              {b.content.imageUrl && (
                <img src={b.content.imageUrl} alt="" className="w-full h-24 object-cover rounded-xl mb-2" />
              )}
              <input placeholder="Paste image URL..." value={b.content.imageUrl || ''} onChange={e => upd({ imageUrl: e.target.value })} className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg" />
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center justify-center py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 cursor-pointer hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, url => upd({ imageUrl: url })); }} />
                </label>
                <button onClick={() => setShowStockPhotos(v => !v)}
                  className={`py-2 border rounded-lg text-[10px] font-bold transition-colors ${showStockPhotos ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'}`}>
                  Stock Photos
                </button>
              </div>
              {showStockPhotos && (
                <div className="pt-2">
                  <StockPhotoPicker onSelect={url => { upd({ imageUrl: url }); setShowStockPhotos(false); }} />
                </div>
              )}
              <input placeholder="Alt text (for SEO)" value={b.content.imageAlt || ''} onChange={e => upd({ imageAlt: e.target.value })} className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg" />
            </div>
          </div>
        )}

        {/* ── FEATURES GRID ── */}
        {b.type === 'features_grid' && (
          <div className="space-y-4">
            <InputField label="Title" value={b.content.title || ''} onChange={v => upd({ title: v })} />
            <InputField label="Eyebrow" value={b.content.subtitle || ''} onChange={v => upd({ subtitle: v })} />
            <TextAreaField label="Description" value={b.content.description || ''} onChange={v => upd({ description: v })} />
            <div className="space-y-2">
              {(b.content.features || []).map((feat, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400">Feature {i + 1}</span>
                    <button onClick={() => { const f = (b.content.features || []).filter((_, fi) => fi !== i); upd({ features: f }); }} className="p-1 bg-red-50 text-red-500 rounded text-[10px] font-bold">Remove</button>
                  </div>
                  <input placeholder="Title" value={feat.title} onChange={e => { const f = [...(b.content.features || [])]; f[i] = { ...f[i], title: e.target.value }; upd({ features: f }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  <textarea placeholder="Description" rows={2} value={feat.description} onChange={e => { const f = [...(b.content.features || [])]; f[i] = { ...f[i], description: e.target.value }; upd({ features: f }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg resize-none" />
                </div>
              ))}
              <button onClick={() => upd({ features: [...(b.content.features || []), { icon: 'Star', title: 'New Feature', description: 'Describe this feature.' }] })}
                className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded-lg hover:bg-indigo-100 transition-colors">
                + Add Feature
              </button>
            </div>
          </div>
        )}

        {/* ── TESTIMONIALS ── */}
        {b.type === 'testimonials' && (
          <div className="space-y-4">
            <InputField label="Title" value={b.content.title || ''} onChange={v => upd({ title: v })} />
            <InputField label="Eyebrow" value={b.content.subtitle || ''} onChange={v => upd({ subtitle: v })} />
            <div className="space-y-2">
              {(b.content.testimonials || []).map((t, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[9px] font-bold text-slate-400">Review {i + 1}</span>
                    <button onClick={() => { const ts = (b.content.testimonials || []).filter((_, ti) => ti !== i); upd({ testimonials: ts }); }} className="p-1 bg-red-50 text-red-500 rounded text-[10px] font-bold">Remove</button>
                  </div>
                  <textarea rows={3} placeholder="Quote" value={t.quote} onChange={e => { const ts = [...(b.content.testimonials || [])]; ts[i] = { ...ts[i], quote: e.target.value }; upd({ testimonials: ts }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg resize-none" />
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Author name" value={t.author} onChange={e => { const ts = [...(b.content.testimonials || [])]; ts[i] = { ...ts[i], author: e.target.value }; upd({ testimonials: ts }); }} className="text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                    <input placeholder="Role" value={t.role} onChange={e => { const ts = [...(b.content.testimonials || [])]; ts[i] = { ...ts[i], role: e.target.value }; upd({ testimonials: ts }); }} className="text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  </div>
                  <input placeholder="Avatar URL" value={t.avatarUrl} onChange={e => { const ts = [...(b.content.testimonials || [])]; ts[i] = { ...ts[i], avatarUrl: e.target.value }; upd({ testimonials: ts }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                </div>
              ))}
              <button onClick={() => upd({ testimonials: [...(b.content.testimonials || []), { quote: 'Great product!', author: 'Customer Name', role: 'Job Title', avatarUrl: '' }] })}
                className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded-lg hover:bg-indigo-100 transition-colors">
                + Add Testimonial
              </button>
            </div>
          </div>
        )}

        {/* ── PRICING ── */}
        {b.type === 'pricing_cards' && (
          <div className="space-y-4">
            <InputField label="Title" value={b.content.title || ''} onChange={v => upd({ title: v })} />
            <InputField label="Eyebrow" value={b.content.subtitle || ''} onChange={v => upd({ subtitle: v })} />
            <TextAreaField label="Description" value={b.content.description || ''} onChange={v => upd({ description: v })} />
            <div className="space-y-2">
              {(b.content.pricingPlans || []).map((plan, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[9px] font-bold text-slate-400">{plan.name || `Plan ${i + 1}`}</span>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-[9px] font-bold text-slate-400 cursor-pointer">
                        <input type="checkbox" checked={!!plan.popular} onChange={e => { const p = [...(b.content.pricingPlans || [])]; p[i] = { ...p[i], popular: e.target.checked }; upd({ pricingPlans: p }); }} /> Popular
                      </label>
                      <button onClick={() => { const p = (b.content.pricingPlans || []).filter((_, pi) => pi !== i); upd({ pricingPlans: p }); }} className="p-1 bg-red-50 text-red-500 rounded text-[10px] font-bold">Remove</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <input placeholder="Name" value={plan.name} onChange={e => { const p = [...(b.content.pricingPlans || [])]; p[i] = { ...p[i], name: e.target.value }; upd({ pricingPlans: p }); }} className="text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                    <input placeholder="Price" value={plan.price} onChange={e => { const p = [...(b.content.pricingPlans || [])]; p[i] = { ...p[i], price: e.target.value }; upd({ pricingPlans: p }); }} className="text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                    <input placeholder="Period" value={plan.period} onChange={e => { const p = [...(b.content.pricingPlans || [])]; p[i] = { ...p[i], period: e.target.value }; upd({ pricingPlans: p }); }} className="text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  </div>
                  <textarea placeholder="Features (one per line)" rows={3} value={(plan.features || []).join('\n')} onChange={e => { const p = [...(b.content.pricingPlans || [])]; p[i] = { ...p[i], features: e.target.value.split('\n').filter(Boolean) }; upd({ pricingPlans: p }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg resize-none" />
                  <input placeholder="Button label" value={plan.btnText} onChange={e => { const p = [...(b.content.pricingPlans || [])]; p[i] = { ...p[i], btnText: e.target.value }; upd({ pricingPlans: p }); }} className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                </div>
              ))}
              <button onClick={() => upd({ pricingPlans: [...(b.content.pricingPlans || []), { name: 'Plan', price: '$0', period: 'mo', features: ['Feature 1'], btnText: 'Get Started' }] })}
                className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded-lg hover:bg-indigo-100 transition-colors">
                + Add Plan
              </button>
            </div>
          </div>
        )}

        {/* ── CTA BLOCK ── */}
        {b.type === 'cta_block' && (
          <div className="space-y-4">
            <TextAreaField label="Headline" value={b.content.title || ''} onChange={v => upd({ title: v })} rows={2} />
            <TextAreaField label="Description" value={b.content.description || ''} onChange={v => upd({ description: v })} />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Primary CTA" value={b.content.primaryBtnText || ''} onChange={e => upd({ primaryBtnText: e.target.value })} className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg" />
              <input placeholder="CTA URL" value={b.content.primaryBtnUrl || ''} onChange={e => upd({ primaryBtnUrl: e.target.value })} className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Secondary CTA" value={b.content.secondaryBtnText || ''} onChange={e => upd({ secondaryBtnText: e.target.value })} className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg" />
              <input placeholder="URL" value={b.content.secondaryBtnUrl || ''} onChange={e => upd({ secondaryBtnUrl: e.target.value })} className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg" />
            </div>
          </div>
        )}

        {/* ── CONTACT FORM ── */}
        {b.type === 'contact_form' && (
          <div className="space-y-4">
            <InputField label="Title" value={b.content.title || ''} onChange={v => upd({ title: v })} />
            <TextAreaField label="Description" value={b.content.description || ''} onChange={v => upd({ description: v })} />
            <InputField label="Button Text" value={b.content.formBtnText || ''} onChange={v => upd({ formBtnText: v })} />
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 block">Form Fields</label>
              {(b.content.formFields || []).map((f, i) => (
                <div key={i} className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[9px] text-slate-400 font-bold">Field {i + 1}</span>
                    <button onClick={() => { const ff = (b.content.formFields || []).filter((_, fi) => fi !== i); upd({ formFields: ff }); }} className="p-0.5 bg-red-50 text-red-500 rounded text-[10px] font-bold">Remove</button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <input placeholder="Label" value={f.label} onChange={e => { const ff = [...(b.content.formFields || [])]; ff[i] = { ...ff[i], label: e.target.value }; upd({ formFields: ff }); }} className="col-span-2 text-[11px] p-1.5 bg-white border border-slate-200 rounded" />
                    <select value={f.type} onChange={e => { const ff = [...(b.content.formFields || [])]; ff[i] = { ...ff[i], type: e.target.value as any }; upd({ formFields: ff }); }} className="text-[10px] p-1.5 bg-white border border-slate-200 rounded">
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="tel">Phone</option>
                      <option value="textarea">Textarea</option>
                    </select>
                  </div>
                  <input placeholder="Placeholder text" value={f.placeholder} onChange={e => { const ff = [...(b.content.formFields || [])]; ff[i] = { ...ff[i], placeholder: e.target.value }; upd({ formFields: ff }); }} className="w-full text-[11px] p-1.5 bg-white border border-slate-200 rounded" />
                </div>
              ))}
              <button onClick={() => upd({ formFields: [...(b.content.formFields || []), { label: 'New Field', placeholder: 'Enter value...', type: 'text' }] })}
                className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded-lg hover:bg-indigo-100 transition-colors">
                + Add Field
              </button>
            </div>
          </div>
        )}

        {/* ── IMAGE BLOCK (enhanced) ── */}
        {b.type === 'image_block' && (
          <div className="space-y-4">
            {b.content.imageUrl && (
              <div className="relative">
                <img src={b.content.imageUrl} alt="" className="w-full h-32 object-cover rounded-xl" />
                <button onClick={() => upd({ imageUrl: '' })} className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-lg hover:bg-red-600 transition-colors">
                  Remove
                </button>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 block">Image URL</label>
              <input value={b.content.imageUrl || ''} onChange={e => upd({ imageUrl: e.target.value })} placeholder="https://..." className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="border border-dashed border-indigo-200 rounded-xl p-3 text-center relative bg-white hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors cursor-pointer">
                <input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) handleImageUpload(file, url => upd({ imageUrl: url })); }} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                <span className="text-[10px] font-bold text-indigo-600">Upload</span>
              </label>
              <button onClick={() => setShowStockPhotos(v => !v)}
                className={`border rounded-xl p-3 text-center transition-colors cursor-pointer ${showStockPhotos ? 'bg-indigo-600 text-white border-indigo-600' : 'border-dashed border-indigo-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30'}`}>
                <span className={`text-[10px] font-bold ${showStockPhotos ? 'text-white' : 'text-indigo-600'}`}>Stock Photos</span>
              </button>
            </div>
            {showStockPhotos && (
              <StockPhotoPicker onSelect={url => { upd({ imageUrl: url }); setShowStockPhotos(false); }} />
            )}
            <InputField label="Alt Text (SEO)" value={b.content.imageAlt || ''} onChange={v => upd({ imageAlt: v })} />
            <TextAreaField label="Caption" value={b.content.description || ''} onChange={v => upd({ description: v })} rows={2} />
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 block">Filter Effect</label>
              <div className="grid grid-cols-3 gap-1">
                {(['none', 'grayscale', 'sepia', 'vintage', 'warm', 'cool'] as const).map(f => (
                  <button key={f} onClick={() => upd({ imageFilter: f })}
                    className={`py-1 rounded border capitalize text-[9px] font-bold transition-all ${b.content.imageFilter === f ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── VIDEO EMBED (enhanced with auto-convert) ── */}
        {b.type === 'video_embed' && (
          <div className="space-y-4">
            <InputField label="Title" value={b.content.title || ''} onChange={v => upd({ title: v })} />
            <TextAreaField label="Description" value={b.content.description || ''} onChange={v => upd({ description: v })} rows={2} />
            <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-indigo-700 block">Paste any video link</span>
              <p className="text-[9px] text-slate-400 leading-relaxed">Works with YouTube, Vimeo, and Loom. We'll convert it automatically.</p>
              <div className="flex gap-2">
                <input
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  onClick={() => {
                    const embed = convertToEmbedUrl(videoUrl);
                    upd({ videoUrl: embed });
                    setVideoUrl('');
                  }}
                  className="px-3 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
              {b.content.videoUrl && (
                <div className="text-[9px] text-emerald-600 font-bold">
                  Video set: {b.content.videoUrl.substring(0, 40)}...
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 block">Or paste embed URL directly</label>
              <input value={b.content.videoUrl || ''} onChange={e => upd({ videoUrl: e.target.value })} placeholder="https://youtube.com/embed/..." className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        {b.type === 'footer' && (
          <div className="space-y-4">
            <InputField label="Brand Name" value={b.content.brandName || ''} onChange={v => upd({ brandName: v })} />
            <InputField label="Copyright Text" value={b.content.copyright || ''} onChange={v => upd({ copyright: v })} />
            <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 block">Footer Links</span>
              {(b.content.links || []).map((lnk, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={lnk.label} placeholder="Label" onChange={e => { const l = [...(b.content.links || [])]; l[i] = { ...l[i], label: e.target.value }; upd({ links: l }); }} className="flex-1 text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  <input value={lnk.url} placeholder="URL" onChange={e => { const l = [...(b.content.links || [])]; l[i] = { ...l[i], url: e.target.value }; upd({ links: l }); }} className="flex-1 text-[11px] p-2 bg-white border border-slate-200 rounded-lg" />
                  <button onClick={() => { const l = (b.content.links || []).filter((_, li) => li !== i); upd({ links: l }); }} className="p-1 bg-red-50 text-red-500 rounded text-[10px] font-bold">Remove</button>
                </div>
              ))}
              <button onClick={() => upd({ links: [...(b.content.links || []), { label: 'Link', url: '#' }] })}
                className="w-full py-1.5 text-[10px] font-bold text-indigo-600 bg-white border border-slate-200 rounded-lg hover:bg-indigo-50 transition-colors">
                + Add Link
              </button>
            </div>
          </div>
        )}

        {/* ── DIVIDER ── */}
        {b.type === 'divider' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 block">Style</label>
            <div className="grid grid-cols-3 gap-2">
              {(['solid', 'dashed', 'dotted'] as const).map(s => (
                <button key={s} onClick={() => upd({ dividerStyle: s })}
                  className={`py-2 rounded-xl border capitalize font-semibold text-xs transition-all ${b.content.dividerStyle === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── SPACER ── */}
        {b.type === 'spacer' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <label>Height</label>
              <span className="font-mono text-indigo-600">{b.content.spacerHeight || 48}px</span>
            </div>
            <input type="range" min={8} max={240} step={8} value={b.content.spacerHeight || 48}
              onChange={e => upd({ spacerHeight: +e.target.value })} className="w-full accent-indigo-600" />
          </div>
        )}
      </div>
    );

    if (blockTab === 'appearance') return (
      <div className="space-y-5">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Visual Appearance</p>

        {/* Spacing */}
        <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <SectionHeader title="Spacing & Padding" sKey="spacing" />
          {expandedSections.spacing && (
            <div className="space-y-3">
              {[['paddingTop', 'Top Padding'], ['paddingBottom', 'Bottom Padding']].map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                    <span>{label}</span>
                    <span className="font-mono text-indigo-600 font-bold">{(b.styles as any)[key]}px</span>
                  </div>
                  <input type="range" min={0} max={200} step={8} value={(b.styles as any)[key]}
                    onChange={e => updS({ [key]: +e.target.value })} className="w-full accent-indigo-600" />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block">Max Content Width</label>
                <select value={b.styles.maxWidth || '7xl'} onChange={e => updS({ maxWidth: e.target.value as any })}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg">
                  <option value="7xl">Full (1280px)</option>
                  <option value="5xl">Wide (1024px)</option>
                  <option value="4xl">Medium (896px)</option>
                  <option value="3xl">Narrow (768px)</option>
                  <option value="2xl">Compact (672px)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Alignment */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Text Alignment</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-xl">
            {(['left', 'center', 'right'] as const).map(a => (
              <button key={a} onClick={() => updS({ align: a })}
                className={`py-2 rounded-lg text-[10px] font-bold capitalize transition-all ${b.styles.align === a ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <SectionHeader title="Colors" sKey="colors" />
          {expandedSections.colors && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400">Background</span>
                  <input type="color" value={b.styles.bgColor.startsWith('#') ? b.styles.bgColor : '#ffffff'}
                    onChange={e => updS({ bgColor: e.target.value })} className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200" />
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {BG_SWATCHES.slice(0, 12).map(c => <ColorSwatch key={c} color={c} selected={b.styles.bgColor === c} onClick={() => updS({ bgColor: c })} />)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400">Brand / Accent</span>
                  <input type="color" value={b.styles.brandColor.startsWith('#') ? b.styles.brandColor : '#4f46e5'}
                    onChange={e => updS({ brandColor: e.target.value })} className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200" />
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {BRAND_SWATCHES.map(c => <ColorSwatch key={c} color={c} selected={b.styles.brandColor === c} onClick={() => updS({ brandColor: c })} />)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="color" value={b.styles.textColor} onChange={e => updS({ textColor: e.target.value })} className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer" />
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 block">Text Color</label>
                  <input type="text" value={b.styles.textColor} onChange={e => updS({ textColor: e.target.value })}
                    className="w-full text-xs px-2 py-1 border border-slate-200 bg-white rounded font-mono" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gradient */}
        <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gradient Background</span>
            <button onClick={() => updS({ useGradient: !b.styles.useGradient })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${b.styles.useGradient ? 'bg-indigo-600' : 'bg-slate-300'}`}>
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow-sm ${b.styles.useGradient ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
          {b.styles.useGradient && (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                {[['From', 'gradientFrom', '#4f46e5'], ['To', 'gradientTo', '#7c3aed']].map(([label, key, def]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400">{label}</label>
                    <div className="flex gap-1">
                      <input type="color" value={(b.styles as any)[key] || def} onChange={e => updS({ [key]: e.target.value })} className="w-8 h-7 rounded border border-slate-200 cursor-pointer" />
                      <input type="text" value={(b.styles as any)[key] || def} onChange={e => updS({ [key]: e.target.value })} className="flex-1 text-[10px] p-1 border border-slate-200 bg-white rounded font-mono" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1">
                {([['to-r', 'Right'], ['to-b', 'Down'], ['to-br', 'Diag \u2198'], ['to-tr', 'Diag \u2197']] as const).map(([val, label]) => (
                  <button key={val} onClick={() => updS({ gradientDirection: val as any })}
                    className={`py-1.5 text-[9px] font-bold rounded border transition-all ${b.styles.gradientDirection === val ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Typography */}
        <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Typography</span>
          <select value={b.styles.fontFamily || project.style.fontFamily} onChange={e => updS({ fontFamily: e.target.value })}
            className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg">
            <option value="">Use Global Default</option>
            {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>

        {/* Border */}
        <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Border & Radius</span>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>Border Width</span>
              <span className="font-mono text-indigo-600">{b.styles.borderWidth || 0}px</span>
            </div>
            <input type="range" min={0} max={8} step={1} value={b.styles.borderWidth || 0}
              onChange={e => updS({ borderWidth: +e.target.value })} className="w-full accent-indigo-600" />
          </div>
          <div className="grid grid-cols-4 gap-1 pt-1">
            {(['none', 'md', 'xl', '3xl'] as const).map(r => (
              <button key={r} onClick={() => updS({ borderRadius: r })}
                className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all capitalize ${b.styles.borderRadius === r ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button onClick={() => onDuplicateBlock(b.id)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors">
            Duplicate
          </button>
          <button onClick={() => { onDeleteBlock(b.id); setSelection({ blockId: null, elementId: null }); }}
            className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl border border-red-200/40 transition-colors">
            Delete
          </button>
        </div>
      </div>
    );

    return (
      <div className="space-y-4">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Advanced Options</p>
        <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Shadow</span>
          <div className="grid grid-cols-3 gap-1">
            {(['none', 'soft', 'heavy'] as const).map(s => (
              <button key={s} onClick={() => updS({ shadow: s })}
                className={`py-1.5 rounded-lg border text-[10px] font-bold capitalize transition-all ${b.styles.shadow === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-2xl text-[10px] text-amber-700 leading-relaxed">
          <strong className="font-black block mb-1">Block ID</strong>
          <code className="font-mono text-[9px] break-all opacity-70">{b.id}</code>
        </div>
      </div>
    );
  };

  return (
    <div className="w-72 xl:w-80 border-r border-slate-200 bg-white flex flex-col h-full select-none shadow-sm" id="builder-left-panel">

      {/* Header */}
      {selectedBlock ? (
        <div className="p-4 border-b border-slate-100 flex flex-col gap-2 shrink-0 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] bg-indigo-100 text-indigo-700 font-black uppercase px-2 py-0.5 rounded-full tracking-wider">Editing</span>
              <h3 className="font-black text-slate-800 text-xs truncate max-w-[13rem] mt-1 capitalize">{selectedBlock.name}</h3>
            </div>
            <button onClick={() => setSelection({ blockId: null, elementId: null })}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 shadow-sm px-2.5 py-1 rounded-lg transition-colors cursor-pointer">
              Back
            </button>
          </div>
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 gap-0.5">
            {(['content', 'appearance', 'advanced'] as const).map(t => (
              <button key={t} onClick={() => setBlockTab(t)}
                className={`flex-1 py-1.5 text-center rounded-lg transition-all text-[9px] font-black uppercase tracking-wide capitalize ${blockTab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 border-b border-slate-100 shrink-0 bg-slate-50/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">Builder Panel</h3>
            <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 text-slate-500 font-mono rounded">v4.0</span>
          </div>
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 gap-0.5">
            {[{ key: 'blocks', label: 'Blocks' }, { key: 'settings', label: 'Theme' }, { key: 'layers', label: 'Layers' }].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key as any)}
                className={`flex-1 py-1.5 rounded-lg transition-all text-[9px] font-black uppercase tracking-wide ${activeTab === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-500'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {selectedBlock ? (
          <div className="animate-fade-in">{renderBlockContent()}</div>
        ) : (
          <>
            {/* BLOCKS TAB */}
            {activeTab === 'blocks' && (
              <div className="space-y-3">
                {/* Quick Templates */}
                <div className="p-3 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl space-y-2">
                  <button onClick={() => setShowTemplates(v => !v)}
                    className="w-full flex items-center justify-between text-xs font-black text-indigo-800">
                    <span>Quick Page Templates</span>
                    <span className="text-[9px] font-bold normal-case tracking-normal text-indigo-500">{showTemplates ? 'Hide' : 'Show'}</span>
                  </button>
                  {showTemplates && (
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {PAGE_TEMPLATES.map(tpl => (
                        <button key={tpl.type}
                          onClick={() => {
                            tpl.blocks.forEach(type => onAddBlock(type));
                            setShowTemplates(false);
                          }}
                          className="p-2 bg-white rounded-xl border border-indigo-100 text-left hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                          <span className="text-[10px] font-black text-slate-700 group-hover:text-indigo-700 block">{tpl.label}</span>
                          <span className="text-[9px] text-slate-400 leading-snug">{tpl.desc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category filter */}
                <div className="flex flex-wrap gap-1 pb-1">
                  {tabs.map(t => (
                    <button key={t} onClick={() => setActiveCategory(t)}
                      className={`px-2 py-1 text-[9px] font-bold rounded-lg border whitespace-nowrap transition-all ${activeCategory === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300'}`}>
                      {t}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input type="text" placeholder="Search blocks..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-0.5">
                  {filtered.map(opt => (
                    <div key={opt.type} onClick={() => onAddBlock(opt.type)}
                      className="group p-2.5 border border-slate-100 hover:border-indigo-400 bg-white hover:bg-indigo-50/30 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer relative overflow-hidden hover:shadow-sm">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-xs text-slate-800 group-hover:text-indigo-700 transition-colors">{opt.label}</h4>
                          {opt.isNew && <span className="text-[7px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider">NEW</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug mt-0.5 line-clamp-1">{opt.description}</p>
                      </div>
                      <span className="text-[8px] font-black text-slate-300 group-hover:text-indigo-500 pt-0.5">+</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SETTINGS / THEME TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Global Design Tokens</p>

                <div className="p-3 bg-indigo-50/40 border border-indigo-100/60 rounded-2xl space-y-3">
                  <div className="text-xs font-black text-indigo-900">Visual Themes</div>
                  {([
                    { id: 'minimal_modern', label: 'Minimal Modern', desc: 'Clean, spacious, neutral' },
                    { id: 'glassmorphism', label: 'Frosted Glass', desc: 'Translucent, blurred surfaces' },
                    { id: 'neo_brutalist', label: 'Neo-Brutalist', desc: 'Bold borders, heavy shadows' },
                    { id: 'cosmic_dark', label: 'Cosmic Dark', desc: 'Deep dark, starry palette' }
                  ] as const).map(thm => (
                    <button key={thm.id} onClick={() => {
                      const s = { ...project.style, theme: thm.id };
                      if (thm.id === 'cosmic_dark') s.background = '#020617';
                      else if (thm.id === 'neo_brutalist') { s.background = '#ffffff'; s.radius = '0px'; s.shadows = 'heavy'; }
                      else { s.background = '#ffffff'; s.radius = '12px'; }
                      onChangeStyle(s);
                    }}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${project.style.theme === thm.id ? 'border-indigo-600 bg-white font-bold shadow-sm' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 text-slate-500'}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{thm.label}</span>
                        {project.style.theme === thm.id && <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wide">Selected</span>}
                      </div>
                      <p className="text-[9px] font-normal text-slate-400 mt-0.5">{thm.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Global Font</span>
                  <select value={project.style.fontFamily} onChange={e => onChangeStyle({ ...project.style, fontFamily: e.target.value })}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg">
                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Canvas Background</span>
                  <div className="flex items-center gap-2">
                    <input type="color" value={project.style.background} onChange={e => onChangeStyle({ ...project.style, background: e.target.value })} className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer" />
                    <input type="text" value={project.style.background} onChange={e => onChangeStyle({ ...project.style, background: e.target.value })} className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg font-mono font-bold text-slate-800" />
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {BG_SWATCHES.map(c => (
                      <div key={c} onClick={() => onChangeStyle({ ...project.style, background: c })}
                        className={`h-5 rounded border cursor-pointer transition-all hover:scale-110 ${project.style.background === c ? 'border-indigo-600 ring-1 ring-indigo-400' : 'border-slate-200'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Corner Radius</span>
                  <div className="grid grid-cols-4 gap-1">
                    {(['none', '6px', '12px', '24px'] as const).map(r => (
                      <button key={r} onClick={() => onChangeStyle({ ...project.style, radius: r })}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all ${project.style.radius === r ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LAYERS TAB */}
            {activeTab === 'layers' && (
              <div className="space-y-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Page Layers ({project.blocks.length})</p>
                {project.blocks.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                    <p className="text-xs text-slate-400 font-bold">No blocks yet</p>
                    <button onClick={() => setActiveTab('blocks')} className="mt-3 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200/40 font-bold px-3 py-1.5 rounded-xl transition-all">
                      Add Block
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {project.blocks.map((blk, idx) => (
                      <div key={blk.id} onClick={() => setSelection({ blockId: blk.id, elementId: null })}
                        className="p-2.5 border border-slate-200 bg-white hover:border-indigo-400 rounded-xl flex items-center justify-between cursor-pointer transition-all group shadow-sm hover:shadow hover:-translate-y-px">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-[9px] font-mono text-slate-400 w-4 shrink-0">{idx + 1}</span>
                          <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: blk.styles.bgColor }} />
                          <h4 className="font-bold text-xs text-slate-700 truncate capitalize">{blk.name}</h4>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button disabled={idx === 0} onClick={e => { e.stopPropagation(); onMoveBlock(blk.id, 'up'); }} className="px-1.5 py-1 text-[9px] font-bold text-slate-500 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer">Up</button>
                          <button disabled={idx === project.blocks.length - 1} onClick={e => { e.stopPropagation(); onMoveBlock(blk.id, 'down'); }} className="px-1.5 py-1 text-[9px] font-bold text-slate-500 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer">Down</button>
                          <button onClick={e => { e.stopPropagation(); onDeleteBlock(blk.id); }} className="px-1.5 py-1 text-[9px] font-bold text-red-500 hover:bg-red-50 rounded cursor-pointer">Delete</button>
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

const InputField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="space-y-1">
    <label className="text-[11px] font-bold text-slate-600 block">{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)}
      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium transition-shadow hover:border-slate-300" />
  </div>
);

const TextAreaField = ({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) => (
  <div className="space-y-1">
    <label className="text-[11px] font-bold text-slate-600 block">{label}</label>
    <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)}
      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium leading-relaxed resize-none transition-shadow hover:border-slate-300" />
  </div>
);
