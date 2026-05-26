import React, { useState } from 'react';
import { ProjectState, Block, StyleConfig, SelectionState, BlockType } from '../types';
import { 
  Trash2, Copy, ArrowUp, ArrowDown, Layers, 
  Settings, AlignLeft, AlignCenter, AlignRight, Check, Sparkles,
  Search, LayoutTemplate, SquareEqual, MessageSquare, CreditCard, Mail, 
  Image, Video, Navigation, Minimize, PlayCircle, ToggleRight, Plus, PlusCircle
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

interface ComponentOption {
  type: BlockType;
  label: string;
  description: string;
  category: 'header_footer' | 'marketing' | 'structure' | 'rich_media';
  icon: React.ComponentType<{ className?: string }>;
}

export default function RightPropertiesPanel({
  project,
  onChangeStyle,
  selection,
  setSelection,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveBlock,
  onAddBlock
}: RightPropertiesPanelProps) {
  // Tabs states when no block is selected: 'blocks' | 'settings' | 'layers'
  const [activeTab, setActiveTab] = useState<'blocks' | 'settings' | 'layers'>('blocks');
  // Subtabs state when a block is selected: 'content' | 'appearance'
  const [blockTab, setBlockTab] = useState<'content' | 'appearance'>('content');

  // Search and filter inside Layout blocks library
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Header/Footer' | 'Marketing' | 'Rich Media' | 'Structure'>('All');

  const selectedBlock = project.blocks.find(b => b.id === selection.blockId);

  // Default color palette suggestions
  const bgSuggestions = ['#ffffff', '#f8fafc', '#f1f5f9', '#0f172a', '#1e293b', '#fef08a', '#ffedd5', '#ecfdf5', '#020617'];
  const brandSuggestions = ['#4f46e5', '#2563eb', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#000000'];

  const handleGlobalThemeChange = (themeName: StyleConfig['theme']) => {
    const updatedStyle = { ...project.style, theme: themeName };
    if (themeName === 'cosmic_dark') {
      updatedStyle.background = '#020617';
    } else if (themeName === 'neo_brutalist') {
      updatedStyle.background = '#ffffff';
      updatedStyle.radius = '0px';
      updatedStyle.shadows = 'heavy';
    } else {
      updatedStyle.background = '#ffffff';
      updatedStyle.radius = '12px';
    }
    onChangeStyle(updatedStyle);
  };

  const componentOptions: ComponentOption[] = [
    {
      type: 'navbar',
      label: 'Navbar',
      description: 'Top navigation with brand links & primary button CTA.',
      category: 'header_footer',
      icon: Navigation
    },
    {
      type: 'hero_section',
      label: 'Headline Hero',
      description: 'Dynamic title, paragraph, image showcase, and button CTAs.',
      category: 'marketing',
      icon: LayoutTemplate
    },
    {
      type: 'features_grid',
      label: 'Features Grid',
      description: 'Highlight key product offerings in a responsive 3-column deck.',
      category: 'marketing',
      icon: SquareEqual
    },
    {
      type: 'testimonials',
      label: 'Testimonials Deck',
      description: 'Elegant customer quote frames with avatars and social proof grids.',
      category: 'marketing',
      icon: MessageSquare
    },
    {
      type: 'pricing_cards',
      label: 'Pricing plans',
      description: 'Three tiered packages presenting bullet checks and primary purchase prompts.',
      category: 'marketing',
      icon: CreditCard
    },
    {
      type: 'contact_form',
      label: 'Lead Capture Form',
      description: 'Prebuilt input form fields capturing email, names and responses.',
      category: 'structure',
      icon: Mail
    },
    {
      type: 'cta_block',
      label: 'Call to Action',
      description: 'High-focus attention banner urging immediate clicks.',
      category: 'marketing',
      icon: Sparkles
    },
    {
      type: 'image_block',
      label: 'Image showcase',
      description: 'Fluid image frame with caption logs, custom borders & spacing.',
      category: 'rich_media',
      icon: Image
    },
    {
      type: 'video_embed',
      label: 'Video Frame',
      description: 'YouTube player embedding ensuring products context.',
      category: 'rich_media',
      icon: PlayCircle
    },
    {
      type: 'divider',
      label: 'Divider Line',
      description: 'Solid spacing separator dividing adjacent layout blocks.',
      category: 'structure',
      icon: Minimize
    },
    {
      type: 'spacer',
      label: 'Layout Spacer',
      description: 'Empty spacing padding ensuring clean breathing canvas space.',
      category: 'structure',
      icon: Layers
    },
    {
      type: 'footer',
      label: 'Bottom Footer',
      description: 'Sublinks log, copyrights disclaimer, and brand signatures.',
      category: 'header_footer',
      icon: ToggleRight
    }
  ];

  // Filters logic
  const filteredOptions = componentOptions.filter(opt => {
    const matchesSearch = opt.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          opt.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCategory = true;
    if (activeCategory === 'Header/Footer') {
      matchesCategory = opt.category === 'header_footer';
    } else if (activeCategory === 'Marketing') {
      matchesCategory = opt.category === 'marketing';
    } else if (activeCategory === 'Rich Media') {
      matchesCategory = opt.category === 'rich_media';
    } else if (activeCategory === 'Structure') {
      matchesCategory = opt.category === 'structure';
    }
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-80 border-l border-slate-200 bg-white flex flex-col h-full select-none shadow-sm" id="builder-right-panel">
      
      {/* Dynamic Header State */}
      {selectedBlock ? (
        <div className="p-4 border-b border-slate-100 flex flex-col gap-2 shrink-0 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] bg-indigo-150 bg-indigo-100 text-indigo-700 font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider animate-pulse">
                Active Component
              </span>
              <h3 className="font-extrabold text-slate-800 text-xs truncate max-w-[12rem] mt-1.5 capitalize">
                {selectedBlock.name}
              </h3>
            </div>
            <button 
              onClick={() => setSelection({ blockId: null, elementId: null })}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 shadow-sm px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              ← Back
            </button>
          </div>

          {/* Block Section level sub-tabs */}
          <div className="flex border border-slate-200 bg-slate-100/50 p-0.5 rounded-xl text-[10px] font-bold uppercase tracking-wider mt-2.5">
            <button
              onClick={() => setBlockTab('content')}
              className={`flex-1 py-1.5 text-center rounded-lg transition-all ${
                blockTab === 'content'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Configure Details
            </button>
            <button
              onClick={() => setBlockTab('appearance')}
              className={`flex-1 py-1.5 text-center rounded-lg transition-all ${
                blockTab === 'appearance'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Style Appearance
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-b border-slate-100 shrink-0 bg-slate-50/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">
              Control Station
            </h3>
            <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 text-slate-500 font-mono rounded">v2.0</span>
          </div>
          
          {/* Unified Core Multi-Tabs */}
          <div className="flex bg-slate-100/80 p-0.5 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('blocks')}
              className={`flex-1 py-1.5 text-center rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'blocks'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40 font-extrabold'
                  : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" /> Blocks
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-1.5 text-center rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'settings'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40 font-extrabold'
                  : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> Styling
            </button>
            
            <button
              onClick={() => setActiveTab('layers')}
              className={`flex-1 py-1.5 text-center rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'layers'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40 font-extrabold'
                  : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Stack
            </button>
          </div>
        </div>
      )}

      {/* Editing Core Body Scroll content */}
      <div className="flex-1 overflow-y-auto p-4 content-scrollbar">
        
        {/* CASE A: A Block is Selected */}
        {selectedBlock ? (
          <div className="space-y-5 animate-fade-in">
            {blockTab === 'content' ? (
              <div className="space-y-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Inline Text Bindings
                </span>

                {/* Navbar custom brandName edit */}
                {(selectedBlock.type === 'navbar' || selectedBlock.type === 'footer') && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Company / Brand Label</label>
                    <input
                      type="text"
                      value={selectedBlock.content.brandName || ''}
                      onChange={(e) => onUpdateBlock(selectedBlock.id, {
                        content: { ...selectedBlock.content, brandName: e.target.value }
                      })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                )}

                {/* Main block texts title */}
                {typeof selectedBlock.content.title !== 'undefined' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Main Header Text (H1/H2)</label>
                    <textarea
                      rows={3}
                      value={selectedBlock.content.title || ''}
                      onChange={(e) => onUpdateBlock(selectedBlock.id, {
                        content: { ...selectedBlock.content, title: e.target.value }
                      })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium leading-relaxed"
                    />
                  </div>
                )}

                {/* Subtitle tag element */}
                {typeof selectedBlock.content.subtitle !== 'undefined' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Mini Eyebrow Label</label>
                    <input
                      type="text"
                      value={selectedBlock.content.subtitle || ''}
                      onChange={(e) => onUpdateBlock(selectedBlock.id, {
                        content: { ...selectedBlock.content, subtitle: e.target.value }
                      })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                )}

                {/* Multi-line Description texts */}
                {typeof selectedBlock.content.description !== 'undefined' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Paragraph Content Text</label>
                    <textarea
                      rows={4}
                      value={selectedBlock.content.description || ''}
                      onChange={(e) => onUpdateBlock(selectedBlock.id, {
                        content: { ...selectedBlock.content, description: e.target.value }
                      })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium leading-relaxed"
                    />
                  </div>
                )}

                {/* Prim CTA Button and URL anchor binds */}
                {typeof selectedBlock.content.primaryBtnText !== 'undefined' && (
                  <div className="space-y-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Primary Button Trigger</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-5o0 text-slate-500 font-semibold">Label</label>
                        <input
                          type="text"
                          value={selectedBlock.content.primaryBtnText || ''}
                          onChange={(e) => onUpdateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, primaryBtnText: e.target.value }
                          })}
                          className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded text-slate-850 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-semibold">Anchor Link</label>
                        <input
                          type="text"
                          value={selectedBlock.content.primaryBtnUrl || ''}
                          onChange={(e) => onUpdateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, primaryBtnUrl: e.target.value }
                          })}
                          className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded text-slate-850 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sec CTA Buttons */}
                {typeof selectedBlock.content.secondaryBtnText !== 'undefined' && (
                  <div className="space-y-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Secondary Button</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-semibold">Label</label>
                        <input
                          type="text"
                          value={selectedBlock.content.secondaryBtnText || ''}
                          onChange={(e) => onUpdateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, secondaryBtnText: e.target.value }
                          })}
                          className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded text-slate-850 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-semibold">Anchor Link</label>
                        <input
                          type="text"
                          value={selectedBlock.content.secondaryBtnUrl || ''}
                          onChange={(e) => onUpdateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, secondaryBtnUrl: e.target.value }
                          })}
                          className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded text-slate-850 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Media Image parameters */}
                {typeof selectedBlock.content.imageUrl !== 'undefined' && (
                  <div className="space-y-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Visual Image Asset</span>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-semibold">Image Source URL</label>
                        <input
                          type="text"
                          value={selectedBlock.content.imageUrl || ''}
                          onChange={(e) => onUpdateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, imageUrl: e.target.value }
                          })}
                          className="w-full text-[11px] p-1.5 bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 truncate"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-semibold">Alternative Accessibility Label</label>
                        <input
                          type="text"
                          value={selectedBlock.content.imageAlt || ''}
                          onChange={(e) => onUpdateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, imageAlt: e.target.value }
                          })}
                          className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Video URL params */}
                {typeof selectedBlock.content.videoUrl !== 'undefined' && (
                  <div className="space-y-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Video Clip Link</span>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-semibold">YouTube Iframe Embed Link</label>
                      <input
                        type="text"
                        value={selectedBlock.content.videoUrl || ''}
                        onChange={(e) => onUpdateBlock(selectedBlock.id, {
                          content: { ...selectedBlock.content, videoUrl: e.target.value }
                        })}
                        className="w-full text-[11px] p-1.5 bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 truncate"
                      />
                    </div>
                  </div>
                )}

                {/* Dividers style selector */}
                {selectedBlock.type === 'divider' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Divider Border Style</label>
                    <div className="grid grid-cols-3 gap-1.5 text-xs text-center pt-1">
                      {(['solid', 'dashed', 'dotted'] as const).map(styleVar => (
                        <button
                          key={styleVar}
                          onClick={() => onUpdateBlock(selectedBlock.id, {
                            content: { ...selectedBlock.content, dividerStyle: styleVar }
                          })}
                          className={`py-1.5 rounded-lg border capitalize font-semibold transition-all cursor-pointer ${
                            selectedBlock.content.dividerStyle === styleVar 
                              ? 'bg-slate-900 border-slate-900 text-white shadow' 
                              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          {styleVar}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spacers height config */}
                {selectedBlock.type === 'spacer' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                      <label>Spacer Height</label>
                      <span className="font-mono text-indigo-600 font-bold">{selectedBlock.content.spacerHeight || 48}px</span>
                    </div>
                    <input
                      type="range"
                      min={16}
                      max={160}
                      step={8}
                      value={selectedBlock.content.spacerHeight || 48}
                      onChange={(e) => onUpdateBlock(selectedBlock.id, {
                        content: { ...selectedBlock.content, spacerHeight: parseInt(e.target.value) }
                      })}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                )}

                {/* Footers copyright */}
                {selectedBlock.type === 'footer' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Copyright Statement</label>
                    <input
                      type="text"
                      value={selectedBlock.content.copyright || ''}
                      onChange={(e) => onUpdateBlock(selectedBlock.id, {
                        content: { ...selectedBlock.content, copyright: e.target.value }
                      })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-550 font-medium"
                    />
                  </div>
                )}
              </div>
            ) : (
              // CASE: Block tab: Appearance
              <div className="space-y-5 animate-fade-in">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Adjust Look and Spacing
                </span>

                {/* Padding sliders */}
                <div className="space-y-3.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Block Spacing Padding</span>
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-650">
                        <span>Top Padding</span>
                        <span className="font-mono text-indigo-600 font-bold">{selectedBlock.styles.paddingTop}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={160}
                        step={8}
                        value={selectedBlock.styles.paddingTop}
                        onChange={(e) => onUpdateBlock(selectedBlock.id, {
                          styles: { ...selectedBlock.styles, paddingTop: parseInt(e.target.value) }
                        })}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-650">
                        <span>Bottom Padding</span>
                        <span className="font-mono text-indigo-600 font-bold">{selectedBlock.styles.paddingBottom}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={160}
                        step={8}
                        value={selectedBlock.styles.paddingBottom}
                        onChange={(e) => onUpdateBlock(selectedBlock.id, {
                          styles: { ...selectedBlock.styles, paddingBottom: parseInt(e.target.value) }
                        })}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Alignment buttons */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Text Layout Alignment</label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 border border-slate-200 rounded-xl">
                    {(['left', 'center', 'right'] as const).map(align => (
                      <button
                        key={align}
                        onClick={() => onUpdateBlock(selectedBlock.id, {
                          styles: { ...selectedBlock.styles, align: align }
                        })}
                        className={`py-1.5 text-center rounded-lg font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                          selectedBlock.styles.align === align
                            ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {align === 'left' ? <AlignLeft className="w-4 h-4" /> : align === 'center' ? <AlignCenter className="w-4 h-4" /> : <AlignRight className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section specific Background Color suggestions */}
                <div className="space-y-2.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Background Fill</span>
                    <input
                      type="color"
                      value={selectedBlock.styles.bgColor.startsWith('#') ? selectedBlock.styles.bgColor : '#ffffff'}
                      onChange={(e) => onUpdateBlock(selectedBlock.id, {
                        styles: { ...selectedBlock.styles, bgColor: e.target.value }
                      })}
                      className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 shrink-0"
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {bgSuggestions.map(colorVal => (
                      <button
                        key={colorVal}
                        onClick={() => onUpdateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, bgColor: colorVal } })}
                        className={`w-full h-6 rounded-md border text-center relative flex justify-center items-center transition-all cursor-pointer ${
                          selectedBlock.styles.bgColor === colorVal ? 'border-indigo-600 scale-110 shadow-sm' : 'border-slate-200 hover:scale-105'
                        }`}
                        style={{ backgroundColor: colorVal }}
                      >
                        {selectedBlock.styles.bgColor === colorVal && (
                          <Check className={`w-3.5 h-3.5 ${colorVal === '#0f172a' || colorVal === '#020617' || colorVal === '#1e293b' ? 'text-white' : 'text-slate-900'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand highlight custom button / highlight colors */}
                <div className="space-y-2.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brand Highlight Accents</span>
                    <input
                      type="color"
                      value={selectedBlock.styles.brandColor.startsWith('#') ? selectedBlock.styles.brandColor : '#4f46e5'}
                      onChange={(e) => onUpdateBlock(selectedBlock.id, {
                        styles: { ...selectedBlock.styles, brandColor: e.target.value }
                      })}
                      className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 shrink-0"
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {brandSuggestions.map(colorVal => (
                      <button
                        key={colorVal}
                        onClick={() => onUpdateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, brandColor: colorVal } })}
                        className={`w-full h-6 rounded-md border text-center relative flex justify-center items-center transition-all cursor-pointer ${
                          selectedBlock.styles.brandColor === colorVal ? 'border-indigo-600 scale-110 shadow-sm' : 'border-slate-200 hover:scale-105'
                        }`}
                        style={{ backgroundColor: colorVal }}
                      >
                        {selectedBlock.styles.brandColor === colorVal && (
                          <Check className={`w-3.5 h-3.5 ${colorVal === '#000000' ? 'text-white' : 'text-slate-900'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section specific Typography custom color */}
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Typography Font Color</span>
                  <div className="flex gap-2 items-center pt-1">
                    <input
                      type="color"
                      value={selectedBlock.styles.textColor}
                      onChange={(e) => onUpdateBlock(selectedBlock.id, {
                        styles: { ...selectedBlock.styles, textColor: e.target.value }
                      })}
                      className="w-8 h-8 rounded-lg border border-slate-200 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={selectedBlock.styles.textColor}
                      onChange={(e) => onUpdateBlock(selectedBlock.id, {
                        styles: { ...selectedBlock.styles, textColor: e.target.value }
                      })}
                      className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg font-mono font-bold uppercase text-slate-800"
                    />
                  </div>
                </div>

                {/* Corner radius config option */}
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Corner Roundness</span>
                  <div className="grid grid-cols-4 gap-1.5 text-[10px] font-bold text-center pt-1">
                    {(['none', 'md', 'xl', '3xl'] as const).map(radi => (
                      <button
                        key={radi}
                        onClick={() => onUpdateBlock(selectedBlock.id, {
                          styles: { ...selectedBlock.styles, borderRadius: radi }
                        })}
                        className={`py-1.5 rounded-lg border capitalize transition-all cursor-pointer ${
                          selectedBlock.styles.borderRadius === radi 
                            ? 'bg-slate-900 border-slate-900 text-white shadow' 
                            : 'bg-white hover:bg-slate-50 text-slate-650 border-slate-250 border-slate-200'
                        }`}
                      >
                        {radi}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Local Actions for duplicate and deletions */}
                <div className="pt-4 border-t border-slate-150 flex gap-2">
                  <button
                    onClick={() => onDuplicateBlock(selectedBlock.id)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Duplicate
                  </button>
                  <button
                    onClick={() => {
                      onDeleteBlock(selectedBlock.id);
                      setSelection({ blockId: null, elementId: null });
                    }}
                    className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-650 text-red-600 border border-red-200/40 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* NO block selected -> Tab based contents (Blocks, Styles, Layers) */
          <div className="space-y-5 animate-fade-in">
            
            {/* TAB 1: ADD BLOCKS LIBRARY */}
            {activeTab === 'blocks' && (
              <div className="space-y-4">
                <div className="flex border-b border-slate-100 text-[10px] font-bold uppercase tracking-wide shrink-0 overflow-x-auto scrollbar-none gap-2 pb-1.5">
                  {(['All', 'Header/Footer', 'Marketing', 'Rich Media', 'Structure'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveCategory(tab)}
                      className={`px-2 py-1 text-[10px] rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
                        activeCategory === tab 
                          ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 font-bold shadow-sm' 
                          : 'border-slate-150 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {tab.replace('/', ' & ')}
                    </button>
                  ))}
                </div>

                {/* Sub search input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search sections (e.g. Hero)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium placeholder:text-slate-400"
                  />
                </div>

                {/* Vertical scrollable options list */}
                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  {filteredOptions.length === 0 ? (
                    <div className="text-center py-8">
                      <Layers className="w-8 h-8 text-slate-350 mx-auto mb-1 opacity-50" />
                      <p className="text-[11px] text-slate-400 font-bold">No elements match search</p>
                    </div>
                  ) : (
                    filteredOptions.map((opt) => {
                      const IconComponent = opt.icon;
                      return (
                        <div
                          key={opt.type}
                          onClick={() => {
                            onAddBlock(opt.type);
                            // Highlight element when added
                          }}
                          className="group p-2.5 border border-slate-100 hover:border-indigo-500 bg-white hover:bg-indigo-50/35 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer relative overflow-hidden active:scale-98"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 -translate-x-2 group-hover:translate-x-0 transition-transform" />
                          
                          <div className="w-8 h-8 bg-slate-50 group-hover:bg-indigo-100 rounded-lg flex items-center justify-center text-slate-600 group-hover:text-indigo-600 transition-colors shrink-0">
                            <IconComponent className="w-4 h-4" />
                          </div>

                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-extrabold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                                {opt.label}
                              </h4>
                              <span className="text-[7.5px] bg-slate-100 px-1 py-0.2 text-slate-400 font-mono tracking-wide uppercase rounded font-bold group-hover:bg-indigo-100/50 group-hover:text-indigo-600">
                                + Add
                              </span>
                            </div>
                            <p className="text-[10px] leading-snug text-slate-400 font-medium line-clamp-2">
                              {opt.description}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-3 border border-indigo-100/50 bg-indigo-50/20 rounded-xl text-[10px] text-indigo-805 text-slate-500 leading-relaxed font-normal">
                  <span className="font-black text-indigo-700">Quick Insertion:</span> Single tap any block above to append it directly into your funnel, then customize content and padding inline on top of the live canvas.
                </div>
              </div>
            )}

            {/* TAB 2: GLOBAL STYLING / PRESETS */}
            {activeTab === 'settings' && (
              <div className="space-y-5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Global Token Settings
                </span>

                {/* Theme presetter switcher */}
                <div className="space-y-2.5 p-3.5 bg-indigo-50/30 border border-indigo-100/60 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <Sparkles className="w-4 h-4 text-indigo-500 animate-spin-slow" />
                    <span>Visual Tone Preset Profiles</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
                    Adjusts alignments, border styling, backgrounds and colors instantly.
                  </p>
                  
                  <div className="space-y-1.5 pt-1">
                    {([
                      { id: 'minimal_modern', label: 'Minimal Modern', desc: 'Warm neutrals, Inter sans-serif, soft layout edges' },
                      { id: 'glassmorphism', label: 'Frosted Glass', desc: 'Semi-transparent layers, backdrop filters' },
                      { id: 'neo_brutalist', label: 'Neo-Brutalist', desc: 'Stark black borders & heavy contrast shadow box offsets' },
                      { id: 'cosmic_dark', label: 'Cosmic Dark', desc: 'Astral dark backgrounds and deep starry contrasts' }
                    ] as const).map(thm => (
                      <button
                        key={thm.id}
                        onClick={() => handleGlobalThemeChange(thm.id)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                          project.style.theme === thm.id
                            ? 'border-indigo-600 bg-white text-indigo-900 font-bold shadow-sm'
                            : 'border-slate-100 bg-slate-50/55 hover:border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className="font-bold flex items-center justify-between">
                          <span>{thm.label}</span>
                          {project.style.theme === thm.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        </div>
                        <p className="text-[9px] font-normal leading-normal text-slate-400 mt-0.5">{thm.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Base wallpaper color background picker */}
                <div className="space-y-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Base Canvas wallpaper background</span>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="color"
                      value={project.style.background}
                      onChange={(e) => onChangeStyle({ ...project.style, background: e.target.value })}
                      className="w-8 h-8 rounded-lg border border-slate-200 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={project.style.background}
                      onChange={(e) => onChangeStyle({ ...project.style, background: e.target.value })}
                      className="flex-1 text-xs px-2.5 py-1.5 cursor-text bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {bgSuggestions.slice(0, 10).map(bg => (
                      <div
                        key={bg}
                        onClick={() => onChangeStyle({ ...project.style, background: bg })}
                        className={`h-5 rounded-md border cursor-pointer transition-transform hover:scale-105 relative flex items-center justify-center ${
                          project.style.background === bg ? 'border-indigo-600 shadow' : 'border-slate-200'
                        }`}
                        style={{ backgroundColor: bg }}
                      >
                        {project.style.background === bg && (
                          <Check className={`w-3 h-3 ${bg === '#0f172a' || bg === '#020617' || bg === '#1e293b' ? 'text-white' : 'text-slate-800'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Global Corner radius rounded corners */}
                <div className="space-y-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Default Global Corners</span>
                  <div className="grid grid-cols-4 gap-1.5 text-[11px] font-bold text-center pt-1">
                    {(['none', '6px', '12px', '24px'] as const).map(radPreset => (
                      <button
                        key={radPreset}
                        onClick={() => onChangeStyle({ ...project.style, radius: radPreset })}
                        className={`py-1.5 rounded-lg border capitalize transition-all cursor-pointer ${
                          project.style.radius === radPreset 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                            : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {radPreset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Global shadows config option */}
                <div className="space-y-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Default Global shadows</span>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold text-center pt-1">
                    {(['none', 'soft_elevation', 'heavy'] as const).map(shadPreset => (
                      <button
                        key={shadPreset}
                        onClick={() => onChangeStyle({ ...project.style, shadows: shadPreset })}
                        className={`py-1.5 rounded-lg border capitalize transition-all cursor-pointer ${
                          project.style.shadows === shadPreset 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                            : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {shadPreset.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PROJECT LAYERS LIST */}
            {activeTab === 'layers' && (
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Active Page Stack ({project.blocks.length} elements)
                </span>

                {project.blocks.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                    <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-60" />
                    <span className="text-[11px] text-slate-400 font-bold block">Page funnel has no elements</span>
                    <button
                      onClick={() => setActiveTab('blocks')}
                      className="mt-3 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 outline-none border border-indigo-200/40 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                    >
                      + Insert a Block
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                    {project.blocks.map((blk, idx) => (
                      <div
                        key={blk.id}
                        onClick={() => setSelection({ blockId: blk.id, elementId: null })}
                        className="p-3 border border-slate-200 bg-white hover:border-indigo-500 rounded-xl flex items-center justify-between cursor-pointer transition-all group active:scale-98 shadow-sm hover:shadow"
                      >
                        <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                          <h4 className="font-extrabold text-xs text-slate-800 capitalize truncate">
                            {blk.name.replace('_', ' ')}
                          </h4>
                          <p className="text-[8.5px] font-mono text-slate-400 uppercase tracking-wide">
                            {blk.type} • {blk.styles.bgColor}
                          </p>
                        </div>

                        {/* Order & deleting operations */}
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveBlock(blk.id, 'up');
                            }}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30 cursor-pointer"
                            title="Move section up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            type="button"
                            disabled={idx === project.blocks.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveBlock(blk.id, 'down');
                            }}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30 cursor-pointer"
                            title="Move section down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <div className="w-px h-3.5 bg-slate-200 mx-1" />

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteBlock(blk.id);
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 hover:text-red-650 rounded cursor-pointer"
                            title="Remove section"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-[9.5px] text-slate-400 leading-normal bg-slate-50/50 p-2 border border-slate-100 rounded-xl">
                  <span className="font-bold text-slate-600">Tip:</span> Single tap any active list element above to select the block and adjust text, images, link triggers, spacing padding and background structures.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
