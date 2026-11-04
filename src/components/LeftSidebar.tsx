import React, { useState } from 'react';
import {
  ArrowDown, ArrowUp, Box, Circle, Component, CreditCard, Eye, EyeOff, HelpCircle, Image as ImageIcon, LayoutTemplate, Layers, Lock, Mail,
  Minimize, Minus, MessageSquare, Navigation, PlayCircle, Search, Sparkles, Square, SquareEqual, ToggleRight, Trash2, TrendingUp, Type, Unlock, Users, Grid,
} from 'lucide-react';
import { BlockType, CanvasElement, ProjectState, SelectionState } from '../types';
import { ElementKind } from '../utils/elements';

interface Props {
  project: ProjectState;
  selection: SelectionState;
  setSelection: (s: SelectionState) => void;
  onUpdateBlock: (id: string, patch: Record<string, unknown>) => void;
  onUpdateElement: (id: string, patch: Partial<CanvasElement>) => void;
  onMoveBlock: (id: string, dir: 'up' | 'down') => void;
  onDeleteBlock: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onReorderElement: (id: string, dir: 'forward' | 'backward') => void;
  onAddElement: (kind: ElementKind) => void;
  onAddBlock: (type: BlockType) => void;
}

const ELEMENTS: { kind: ElementKind; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { kind: 'text', label: 'Text', icon: Type },
  { kind: 'image', label: 'Image', icon: ImageIcon },
  { kind: 'button', label: 'Button', icon: Sparkles },
  { kind: 'rect', label: 'Rectangle', icon: Square },
  { kind: 'ellipse', label: 'Ellipse', icon: Circle },
  { kind: 'line', label: 'Line', icon: Minus },
  { kind: 'container', label: 'Container', icon: Box },
];

const BLOCKS: { type: BlockType; label: string; icon: React.ComponentType<{ size?: number }>; cat: string; isNew?: boolean }[] = [
  { type: 'navbar', label: 'Navbar', icon: Navigation, cat: 'Layout' },
  { type: 'footer', label: 'Footer', icon: ToggleRight, cat: 'Layout' },
  { type: 'hero_section', label: 'Hero', icon: LayoutTemplate, cat: 'Sections' },
  { type: 'text_block', label: 'Text', icon: Type, cat: 'Sections' },
  { type: 'stats_block', label: 'Stats', icon: TrendingUp, cat: 'Sections' },
  { type: 'features_grid', label: 'Features', icon: SquareEqual, cat: 'Sections' },
  { type: 'testimonials', label: 'Reviews', icon: MessageSquare, cat: 'Sections' },
  { type: 'pricing_cards', label: 'Pricing', icon: CreditCard, cat: 'Sections' },
  { type: 'faq_block', label: 'FAQ', icon: HelpCircle, cat: 'Sections' },
  { type: 'team_block', label: 'Team', icon: Users, cat: 'Sections' },
  { type: 'logo_bar', label: 'Logos', icon: Grid, cat: 'Sections' },
  { type: 'cta_block', label: 'CTA', icon: Sparkles, cat: 'Sections' },
  { type: 'contact_form', label: 'Form', icon: Mail, cat: 'Sections' },
  { type: 'image_block', label: 'Image', icon: ImageIcon, cat: 'Media' },
  { type: 'video_embed', label: 'Video', icon: PlayCircle, cat: 'Media' },
  { type: 'divider', label: 'Divider', icon: Minimize, cat: 'Utility' },
  { type: 'spacer', label: 'Spacer', icon: Layers, cat: 'Utility' },
];

const elementIcon = (el: CanvasElement) => {
  if (el.type === 'text') return Type;
  if (el.type === 'image') return ImageIcon;
  if (el.type === 'button') return Sparkles;
  if (el.type === 'container') return Box;
  return el.shape === 'ellipse' ? Circle : el.shape === 'line' ? Minus : Square;
};

function LayerRow({ icon: Icon, name, selected, hidden, locked, onClick, onRename, onToggleHidden, onToggleLock, children }: {
  icon: React.ComponentType<{ size?: number }>; name: string; selected: boolean; hidden?: boolean; locked?: boolean;
  onClick: () => void; onRename: (n: string) => void; onToggleHidden: () => void; onToggleLock?: () => void; children?: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const commit = () => { const t = draft.trim(); if (t && t !== name) onRename(t); setEditing(false); };
  return (
    <div className={`layer-row ${selected ? 'selected' : ''}`} onClick={onClick} style={{ opacity: hidden ? 0.45 : 1 }}>
      <Icon size={12} />
      {editing ? (
        <input autoFocus value={draft} maxLength={40} onChange={e => setDraft(e.target.value)} onBlur={commit} onClick={e => e.stopPropagation()}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }} className="fig-input" style={{ height: 20, padding: '0 4px' }} />
      ) : (
        <span title="Double-click to rename" onDoubleClick={() => { setDraft(name); setEditing(true); }} style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      )}
      <div className="layer-actions" style={{ display: 'flex', alignItems: 'center' }}>
        {children}
        {onToggleLock && <button className="fig-icon-btn" style={{ width: 20, height: 20 }} title={locked ? 'Unlock' : 'Lock'} onClick={e => { e.stopPropagation(); onToggleLock(); }}>{locked ? <Lock size={10} /> : <Unlock size={10} />}</button>}
        <button className="fig-icon-btn" style={{ width: 20, height: 20 }} title={hidden ? 'Show' : 'Hide'} onClick={e => { e.stopPropagation(); onToggleHidden(); }}>{hidden ? <EyeOff size={10} /> : <Eye size={10} />}</button>
      </div>
    </div>
  );
}

export default function LeftSidebar(p: Props) {
  const [tab, setTab] = useState<'layers' | 'assets'>('layers');
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();
  const blocks = BLOCKS.filter(b => !q || b.label.toLowerCase().includes(q) || b.cat.toLowerCase().includes(q));
  const elements = ELEMENTS.filter(e => !q || e.label.toLowerCase().includes(q));
  const cats = [...new Set(blocks.map(b => b.cat))];
  const els = p.project.elements || [];
  const iconBtn = { width: 20, height: 20 } as const;

  return (
    <div className="panel-chrome flex h-full select-none flex-col">
      <div style={{ display: 'flex', borderBottom: '1px solid #1c1c20', background: 'rgba(0,0,0,.18)' }}>
        {([{ k: 'layers', icon: Layers, label: 'Layers' }, { k: 'assets', icon: Component, label: 'Assets' }] as const).map(({ k, icon: Icon, label }) => (
          <button key={k} onClick={() => setTab(k)} className={`fig-tab flex flex-1 items-center justify-center gap-1 ${tab === k ? 'active' : ''}`}><Icon size={12} />{label}</button>
        ))}
      </div>

      {tab === 'assets' && (
        <div style={{ padding: '8px 10px', borderBottom: '1px solid #1c1c20' }}>
          <div style={{ position: 'relative' }}>
            <Search size={11} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
            <input type="text" placeholder="Search assets…" value={search} onChange={e => setSearch(e.target.value)} className="fig-input" style={{ paddingLeft: 26, height: 28 }} />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-3">
        {tab === 'layers' && (
          <div>
            <div style={{ padding: '10px 14px 4px' }} className="section-label">Page · {p.project.blocks.length} sections</div>
            {p.project.blocks.length === 0 && <p style={{ padding: '14px 14px', fontSize: 11, color: '#666' }}>No sections yet. Open the Assets tab to add one.</p>}
            {p.project.blocks.map((b, i) => (
              <LayerRow key={b.id} icon={LayoutTemplate} name={b.name} selected={p.selection.blockId === b.id} hidden={b.hidden}
                onClick={() => p.setSelection({ blockId: b.id, elementId: null })}
                onRename={n => p.onUpdateBlock(b.id, { name: n })}
                onToggleHidden={() => p.onUpdateBlock(b.id, { hidden: !b.hidden })}>
                <button className="fig-icon-btn" style={iconBtn} disabled={i === 0} title="Move up" onClick={e => { e.stopPropagation(); p.onMoveBlock(b.id, 'up'); }}><ArrowUp size={10} /></button>
                <button className="fig-icon-btn" style={iconBtn} disabled={i === p.project.blocks.length - 1} title="Move down" onClick={e => { e.stopPropagation(); p.onMoveBlock(b.id, 'down'); }}><ArrowDown size={10} /></button>
                <button className="fig-icon-btn" style={{ ...iconBtn, color: '#f87171' }} title="Delete" onClick={e => { e.stopPropagation(); p.onDeleteBlock(b.id); }}><Trash2 size={10} /></button>
              </LayerRow>
            ))}

            <div style={{ padding: '14px 14px 4px' }} className="section-label">Free-form · {els.length}</div>
            {els.length === 0 && <p style={{ padding: '2px 14px', fontSize: 11, color: '#666' }}>Press T or R and drag on the canvas, or add from Assets.</p>}
            {[...els].reverse().map((el, ri) => {
              const i = els.length - 1 - ri;
              return (
                <LayerRow key={el.id} icon={elementIcon(el)} name={el.name || el.type} selected={p.selection.elementId === el.id} hidden={el.hidden} locked={el.locked}
                  onClick={() => p.setSelection({ blockId: null, elementId: el.id })}
                  onRename={n => p.onUpdateElement(el.id, { name: n })}
                  onToggleHidden={() => p.onUpdateElement(el.id, { hidden: !el.hidden })}
                  onToggleLock={() => p.onUpdateElement(el.id, { locked: !el.locked })}>
                  <button className="fig-icon-btn" style={iconBtn} disabled={i === els.length - 1} title="Bring forward" onClick={e => { e.stopPropagation(); p.onReorderElement(el.id, 'forward'); }}><ArrowUp size={10} /></button>
                  <button className="fig-icon-btn" style={iconBtn} disabled={i === 0} title="Send backward" onClick={e => { e.stopPropagation(); p.onReorderElement(el.id, 'backward'); }}><ArrowDown size={10} /></button>
                  <button className="fig-icon-btn" style={{ ...iconBtn, color: '#f87171' }} title="Delete" onClick={e => { e.stopPropagation(); p.onDeleteElement(el.id); }}><Trash2 size={10} /></button>
                </LayerRow>
              );
            })}
          </div>
        )}

        {tab === 'assets' && (
          <div>
            {elements.length > 0 && (
              <>
                <div style={{ padding: '10px 14px 6px' }} className="section-label">Elements</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, padding: '0 10px 8px' }}>
                  {elements.map(({ kind, label, icon: Icon }) => (
                    <button key={kind} className="tile" onClick={() => p.onAddElement(kind)}><Icon size={16} /><span>{label}</span></button>
                  ))}
                </div>
              </>
            )}
            {cats.map(cat => (
              <div key={cat}>
                <div style={{ padding: '10px 14px 6px' }} className="section-label">{cat}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, padding: '0 10px 8px' }}>
                  {blocks.filter(b => b.cat === cat).map(({ type, label, icon: Icon }) => (
                    <button key={type} className="tile" onClick={() => p.onAddBlock(type)}><Icon size={16} /><span>{label}</span></button>
                  ))}
                </div>
              </div>
            ))}
            {elements.length === 0 && blocks.length === 0 && <p style={{ padding: 16, fontSize: 11, color: '#666', textAlign: 'center' }}>Nothing matches “{search}”.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
