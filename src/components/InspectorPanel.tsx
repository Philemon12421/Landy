import React, { useRef } from 'react';
import {
  AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowUp, Copy, Eye, EyeOff, Lock, Trash2, Unlock,
} from 'lucide-react';
import { Block, BlockType, CanvasElement, ProjectState, SelectionState, StyleConfig } from '../types';
import RightPropertiesPanel from './RightPropertiesPanel';

const FONTS = [
  { label: 'Page default', value: '' },
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { label: 'Poppins', value: "'Poppins', sans-serif" },
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif" },
  { label: 'DM Sans', value: "'DM Sans', sans-serif" },
  { label: 'Syne', value: "'Syne', sans-serif" },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Roboto', value: "'Roboto', sans-serif" },
  { label: 'Georgia', value: 'Georgia, serif' },
];
const SWATCHES = ['#18a0fb', '#4f46e5', '#7c3aed', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#111827', '#ffffff'];

interface Props {
  project: ProjectState;
  selection: SelectionState;
  frameWidth: number;
  setSelection: (s: SelectionState) => void;
  onChangeStyle: (s: StyleConfig) => void;
  onUpdateBlock: (id: string, patch: Partial<Block>) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onMoveBlock: (id: string, dir: 'up' | 'down') => void;
  onAddBlock: (t: BlockType) => void;
  onUpdateElement: (id: string, patch: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onReorderElement: (id: string, dir: 'forward' | 'backward') => void;
}

const Num = ({ label, value, onChange, min, max, step = 1 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) => (
  <label className="num">
    <span>{label}</span>
    <input type="number" value={Math.round(value * 100) / 100} min={min} max={max} step={step} onChange={e => { const v = parseFloat(e.target.value); if (!Number.isNaN(v)) onChange(v); }} />
  </label>
);

const Sec = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid #1c1c20' }}>
    <div className="section-label" style={{ marginBottom: 8 }}>{title}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
  </div>
);

const ColorField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <div style={{ fontSize: 10, color: '#8c8c96', marginBottom: 4 }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'} onChange={e => onChange(e.target.value)} style={{ width: 26, height: 26, flexShrink: 0 }} aria-label={`${label} colour`} />
      <input className="fig-input" value={value} onChange={e => onChange(e.target.value)} style={{ height: 26, fontFamily: 'ui-monospace, monospace' }} />
    </div>
    <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
      {SWATCHES.map(c => <button key={c} className={`color-chip ${value.toLowerCase() === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => onChange(c)} aria-label={c} />)}
    </div>
  </div>
);

function ElementInspector({ el, frameWidth, p }: { el: CanvasElement; frameWidth: number; p: Props }) {
  const upd = (patch: Partial<CanvasElement>) => p.onUpdateElement(el.id, patch);
  const fileRef = useRef<HTMLInputElement>(null);
  const hasText = el.type === 'text' || el.type === 'button';
  const hasFill = el.type === 'shape' || el.type === 'button' || el.type === 'container';
  const sizeLabel = (el.type === 'text' ? 'Text' : el.type === 'button' ? 'Button' : el.type === 'image' ? 'Image' : el.type === 'container' ? 'Container' : el.shape === 'ellipse' ? 'Ellipse' : el.shape === 'line' ? 'Line' : 'Rectangle');

  return (
    <div className="panel-chrome flex h-full select-none flex-col">
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #1c1c20', background: 'rgba(0,0,0,.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <button onClick={() => p.setSelection({ blockId: null, elementId: null })} style={{ background: 'none', border: 0, color: '#8c8c96', fontSize: 11, cursor: 'pointer', padding: 0 }}>← Back</button>
          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(24,160,251,.18)', color: '#43b7ff', fontWeight: 700 }}>{sizeLabel}</span>
          <div style={{ marginLeft: 'auto', display: 'flex' }}>
            <button className="fig-icon-btn" title={el.locked ? 'Unlock' : 'Lock'} onClick={() => upd({ locked: !el.locked })}>{el.locked ? <Lock size={13} /> : <Unlock size={13} />}</button>
            <button className="fig-icon-btn" title={el.hidden ? 'Show' : 'Hide'} onClick={() => upd({ hidden: !el.hidden })}>{el.hidden ? <EyeOff size={13} /> : <Eye size={13} />}</button>
          </div>
        </div>
        <input className="fig-input" value={el.name || ''} placeholder="Layer name" maxLength={40} onChange={e => upd({ name: e.target.value })} style={{ height: 28, fontWeight: 600 }} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <Sec title="Position & size">
          <div style={{ display: 'flex', gap: 4 }}>
            {([['left', AlignLeft, () => upd({ x: 0 })], ['centre', AlignCenter, () => upd({ x: Math.round((frameWidth - el.width) / 2) })], ['right', AlignRight, () => upd({ x: Math.round(frameWidth - el.width) })]] as const).map(([t, Icon, fn]) => (
              <button key={t} className="btn3d" style={{ flex: 1, padding: 0 }} title={`Align ${t} in frame`} onClick={fn}><Icon size={13} /></button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <Num label="X" value={el.x} onChange={v => upd({ x: Math.round(v) })} />
            <Num label="Y" value={el.y} onChange={v => upd({ y: Math.round(v) })} />
            <Num label="W" value={el.width} min={2} onChange={v => upd({ width: Math.max(2, Math.round(v)) })} />
            <Num label="H" value={el.height} min={1} onChange={v => upd({ height: Math.max(1, Math.round(v)) })} />
            <Num label="∠" value={el.rotation || 0} min={-360} max={360} onChange={v => upd({ rotation: v })} />
            <Num label="◐" value={Math.round((el.opacity ?? 1) * 100)} min={0} max={100} onChange={v => upd({ opacity: Math.min(1, Math.max(0, v / 100)) })} />
          </div>
        </Sec>

        {hasText && (
          <Sec title="Text">
            <textarea className="fig-input" rows={el.type === 'text' ? 3 : 1} value={el.content || ''} onChange={e => upd({ content: e.target.value })} style={{ resize: 'vertical' }} />
            <div style={{ position: 'relative' }}>
              <select className="fig-select" value={el.fontFamily || ''} onChange={e => upd({ fontFamily: e.target.value || undefined })} style={{ height: 26 }}>
                {FONTS.map(f => <option key={f.label} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <Num label="Aa" value={el.fontSize || 16} min={8} max={200} onChange={v => upd({ fontSize: Math.round(v) })} />
              <select className="fig-select" value={String(el.fontWeight || 400)} onChange={e => upd({ fontWeight: Number(e.target.value) })} style={{ height: 26 }}>
                {[[400, 'Regular'], [500, 'Medium'], [600, 'Semibold'], [700, 'Bold'], [800, 'Extrabold'], [900, 'Black']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            {el.type === 'text' && (
              <div className="seg" style={{ alignSelf: 'flex-start' }}>
                {(['left', 'center', 'right'] as const).map(a => (
                  <button key={a} className={`seg-btn ${(el.align || 'left') === a ? 'active' : ''}`} title={`Align ${a}`} onClick={() => upd({ align: a })}>
                    {a === 'left' ? <AlignLeft size={13} /> : a === 'center' ? <AlignCenter size={13} /> : <AlignRight size={13} />}
                  </button>
                ))}
              </div>
            )}
            <ColorField label="Text colour" value={el.color || '#111827'} onChange={v => upd({ color: v })} />
            {el.type === 'button' && (
              <div>
                <div style={{ fontSize: 10, color: '#8c8c96', marginBottom: 4 }}>Link</div>
                <input className="fig-input" value={el.url || ''} placeholder="https://… or #contact" onChange={e => upd({ url: e.target.value })} style={{ height: 26 }} />
              </div>
            )}
          </Sec>
        )}

        {el.type === 'image' && (
          <Sec title="Image">
            <input className="fig-input" value={el.url?.startsWith('data:') ? '(uploaded image)' : el.url || ''} placeholder="https://…" readOnly={!!el.url?.startsWith('data:')} onChange={e => upd({ url: e.target.value })} style={{ height: 26 }} />
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={e => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 2 * 1024 * 1024) { alert('Please choose an image under 2 MB so your page stays fast.'); return; }
              const r = new FileReader(); r.onload = () => upd({ url: String(r.result) }); r.readAsDataURL(f); e.target.value = '';
            }} />
            <button className="btn3d" onClick={() => fileRef.current?.click()}>Upload image…</button>
          </Sec>
        )}

        {hasFill && (
          <Sec title="Fill">
            <ColorField label="Fill" value={el.fill || '#18a0fb'} onChange={v => upd({ fill: v })} />
          </Sec>
        )}

        {el.type !== 'text' && (
          <Sec title="Stroke & corners">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <Num label="▭" value={el.strokeWidth || 0} min={0} max={32} onChange={v => upd({ strokeWidth: Math.max(0, Math.round(v)) })} />
              {el.shape !== 'ellipse' && <Num label="◜" value={el.radius || 0} min={0} max={999} onChange={v => upd({ radius: Math.max(0, Math.round(v)) })} />}
            </div>
            {(el.strokeWidth || 0) > 0 && <ColorField label="Stroke colour" value={el.stroke || '#111827'} onChange={v => upd({ stroke: v })} />}
          </Sec>
        )}

        <Sec title="Arrange">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <button className="btn3d" onClick={() => p.onReorderElement(el.id, 'forward')}><ArrowUp size={12} /> Forward</button>
            <button className="btn3d" onClick={() => p.onReorderElement(el.id, 'backward')}><ArrowDown size={12} /> Backward</button>
            <button className="btn3d" onClick={() => p.onDuplicateElement(el.id)}><Copy size={12} /> Duplicate</button>
            <button className="btn3d btn3d-danger" onClick={() => p.onDeleteElement(el.id)}><Trash2 size={12} /> Delete</button>
          </div>
          <p style={{ fontSize: 10, color: '#6a6a74', lineHeight: 1.5 }}>Tip: double-click text to edit it. Hold Shift while resizing a corner to keep proportions, and Alt while dragging to turn snapping off.</p>
        </Sec>
      </div>
    </div>
  );
}

export default function InspectorPanel(p: Props) {
  const el = p.selection.elementId ? (p.project.elements || []).find(e => e.id === p.selection.elementId) : undefined;
  if (el) return <ElementInspector el={el} frameWidth={p.frameWidth} p={p} />;
  return (
    <RightPropertiesPanel
      project={p.project} onChangeStyle={p.onChangeStyle} selection={p.selection} setSelection={p.setSelection}
      onUpdateBlock={p.onUpdateBlock} onDeleteBlock={p.onDeleteBlock} onDuplicateBlock={p.onDuplicateBlock}
      onMoveBlock={p.onMoveBlock} onAddBlock={p.onAddBlock}
    />
  );
}
