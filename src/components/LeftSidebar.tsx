import React, { useState } from 'react';
import { Type, Image as ImageIcon, Sparkles, LayoutTemplate, Square, Circle, Minus, Box, Layers, ArrowUp, ArrowDown, Trash2, Search, Component, Palette, Navigation, ToggleRight, TrendingUp, SquareEqual, MessageSquare, CreditCard, HelpCircle, Users, Grid, Mail, PlayCircle, Minimize } from 'lucide-react';
import { ElementType, BlockType, ProjectState, SelectionState } from '../types';

interface LeftSidebarProps {
  project: ProjectState;
  selection: SelectionState;
  setSelection: (s: SelectionState) => void;
  onMoveBlock: (id: string, dir: 'up' | 'down') => void;
  onDeleteBlock: (id: string) => void;
  onAddElement: (type: ElementType) => void;
  onAddBlock: (type: BlockType) => void;
}

const ELEMENTS = [
  { type: 'text'      as ElementType, label: 'Text',      icon: Type },
  { type: 'image'     as ElementType, label: 'Image',     icon: ImageIcon },
  { type: 'button'    as ElementType, label: 'Button',    icon: Sparkles },
  { type: 'shape'     as ElementType, label: 'Rectangle', icon: Square },
  { type: 'shape'     as ElementType, label: 'Circle',    icon: Circle },
  { type: 'shape'     as ElementType, label: 'Line',      icon: Minus },
  { type: 'container' as ElementType, label: 'Container', icon: Box },
];

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
  { type: 'image_block'  as BlockType, label: 'Image',          icon: ImageIcon,      cat: 'Media' },
  { type: 'video_embed'  as BlockType, label: 'Video',          icon: PlayCircle,     cat: 'Media' },
  { type: 'divider'      as BlockType, label: 'Divider',        icon: Minimize,       cat: 'Utility' },
  { type: 'spacer'       as BlockType, label: 'Spacer',         icon: Layers,         cat: 'Utility' },
];

export default function LeftSidebar({ project, selection, setSelection, onMoveBlock, onDeleteBlock, onAddElement, onAddBlock }: LeftSidebarProps) {
  const [tab, setTab] = useState<'layers' | 'assets'>('layers');
  const [search, setSearch] = useState('');

  const filteredBlocks = BLOCKS.filter(b =>
    b.label.toLowerCase().includes(search.toLowerCase()) ||
    b.cat.toLowerCase().includes(search.toLowerCase())
  );

  const filteredElements = ELEMENTS.filter(e =>
    e.label.toLowerCase().includes(search.toLowerCase())
  );

  const cats = [...new Set(filteredBlocks.map(b => b.cat))];

  return (
    <div className="panel-chrome flex flex-col h-full select-none z-40 relative" style={{ width: 240, minWidth: 240, maxWidth: 240 }}>
      {/* Top-level tabs */}
      <div style={{display:'flex',borderBottom:'1px solid #3a3a3a',background:'#252525'}}>
        {([{k:'layers',icon:Layers,label:'Layers'},{k:'assets',icon:Component,label:'Assets'}] as const).map(({k,icon:Icon,label})=>(
          <button key={k} onClick={()=>setTab(k as any)} className={`fig-tab flex-1 flex items-center justify-center gap-1 ${tab===k?'active':''}`}>
            <Icon size={12}/><span>{label}</span>
          </button>
        ))}
      </div>

      {tab === 'assets' && (
        <div style={{padding:'8px 10px',borderBottom:'1px solid #3a3a3a'}}>
          <div style={{position:'relative'}}>
            <Search size={11} style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',color:'#555'}} />
            <input type="text" placeholder="Search components..." value={search} onChange={e=>setSearch(e.target.value)} className="fig-input w-full" style={{paddingLeft:26,fontSize:11,height:28}} />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {tab === 'layers' && (
          <div>
            {project.blocks.length === 0 ? (
              <div style={{textAlign:'center',padding:'32px 16px',color:'#555'}}>
                <Layers size={28} style={{margin:'0 auto 8px',opacity:.4}} />
                <p style={{fontSize:12,fontWeight:500}}>No blocks on canvas</p>
              </div>
            ) : (
              project.blocks.map((blk, idx) => (
                <div key={blk.id} onClick={()=>setSelection({blockId:blk.id,elementId:null})}
                  className={`layer-row group ${selection.blockId===blk.id?'selected':''}`}>
                  <div style={{width:12,height:12,borderRadius:2,backgroundColor:blk.styles.bgColor,border:'1px solid rgba(255,255,255,.1)',flexShrink:0}} />
                  <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11}}>{blk.name}</span>
                  <div className="layer-actions flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button disabled={idx===0} onClick={e=>{e.stopPropagation();onMoveBlock(blk.id,'up');}} className="fig-icon-btn" style={{width:20,height:20}}><ArrowUp size={10}/></button>
                    <button disabled={idx===project.blocks.length-1} onClick={e=>{e.stopPropagation();onMoveBlock(blk.id,'down');}} className="fig-icon-btn" style={{width:20,height:20}}><ArrowDown size={10}/></button>
                    <button onClick={e=>{e.stopPropagation();onDeleteBlock(blk.id);}} className="fig-icon-btn" style={{width:20,height:20,color:'#ef4444'}}><Trash2 size={10}/></button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'assets' && (
          <div>
            {filteredElements.length > 0 && (
              <div>
                <div style={{padding:'8px 12px 4px',fontSize:10,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'0.08em'}}>Elements</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4,padding:'0 8px 8px'}}>
                  {filteredElements.map(opt=>{
                    const Icon=opt.icon;
                    return (
                      <button key={opt.type} onClick={()=>onAddElement(opt.type)}
                        style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'8px 4px',borderRadius:6,border:'1px solid #3a3a3a',background:'#333',cursor:'pointer',transition:'all .1s',position:'relative'}}
                        onMouseEnter={e=>{e.currentTarget.style.background='#18a0fb22';e.currentTarget.style.borderColor='#18a0fb44';}}
                        onMouseLeave={e=>{e.currentTarget.style.background='#333';e.currentTarget.style.borderColor='#3a3a3a';}}>
                        <Icon size={16} style={{color:'#888'}} />
                        <span style={{fontSize:10,color:'#aaa',fontWeight:500,textAlign:'center',lineHeight:1.2}}>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {cats.map(cat=>(
              <div key={cat}>
                <div style={{padding:'8px 12px 4px',fontSize:10,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'0.08em'}}>{cat}</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4,padding:'0 8px 8px'}}>
                  {filteredBlocks.filter(b=>b.cat===cat).map(opt=>{
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
      </div>
    </div>
  );
}
