import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { CanvasElement } from '../types';
import { safeSrc } from '../utils/exportHtml';

type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
const HANDLES: Handle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const CURSOR: Record<Handle, string> = { nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize', n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize' };

const handlePos = (h: Handle, s: number): React.CSSProperties => {
  const o = -s / 2;
  const p: React.CSSProperties = { position: 'absolute', width: s, height: s };
  if (h.includes('n')) p.top = o;
  if (h.includes('s')) p.bottom = o;
  if (h.includes('w')) p.left = o;
  if (h.includes('e')) p.right = o;
  if (h === 'n' || h === 's') { p.left = '50%'; p.marginLeft = o; }
  if (h === 'e' || h === 'w') { p.top = '50%'; p.marginTop = o; }
  return p;
};

const snap = (values: number[], targets: number[], threshold: number) => {
  let best: { d: number; t: number } | null = null;
  for (const v of values) for (const t of targets) {
    const d = t - v;
    if (Math.abs(d) <= threshold && (!best || Math.abs(d) < Math.abs(best.d))) best = { d, t };
  }
  return best;
};

interface Props {
  elements: CanvasElement[];
  selectedId: string | null;
  zoom: number;
  frameWidth: number;
  /** Preview / published rendering: no selection, no pointer events. */
  readOnly?: boolean;
  /** Hand or drawing tool is active: elements should not intercept the pointer. */
  passive?: boolean;
  onSelect?: (id: string | null) => void;
  onUpdate?: (id: string, patch: Partial<CanvasElement>) => void;
}

export default function ElementLayer({ elements, selectedId, zoom, frameWidth, readOnly, passive, onSelect, onUpdate }: Props) {
  const z = Math.max(0.05, zoom / 100);
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});
  const [editing, setEditing] = useState<string | null>(null);

  const startDrag = (e: React.PointerEvent, el: CanvasElement, mode: 'move' | Handle) => {
    if (e.button !== 0 || readOnly || !onSelect || !onUpdate) return;
    e.stopPropagation();
    onSelect(el.id);
    if (el.locked || editing === el.id) return;
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY;
    const o = { x: el.x, y: el.y, w: el.width, h: el.height };
    const others = elements.filter(s => s.id !== el.id && !s.hidden);
    const threshold = 6 / z;

    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - sx) / z, dy = (ev.clientY - sy) / z;
      if (mode === 'move') {
        let nx = o.x + dx, ny = o.y + dy;
        const g: { x?: number; y?: number } = {};
        if (!ev.altKey) {
          const tx = [0, frameWidth / 2, frameWidth, ...others.flatMap(s => [s.x, s.x + s.width / 2, s.x + s.width])];
          const ty = [0, ...others.flatMap(s => [s.y, s.y + s.height / 2, s.y + s.height])];
          const bx = snap([nx, nx + o.w / 2, nx + o.w], tx, threshold);
          if (bx) { nx += bx.d; g.x = bx.t; }
          const by = snap([ny, ny + o.h / 2, ny + o.h], ty, threshold);
          if (by) { ny += by.d; g.y = by.t; }
        }
        setGuides(g);
        onUpdate(el.id, { x: Math.round(nx), y: Math.round(ny) });
        return;
      }
      let { x, y, w, h } = { x: o.x, y: o.y, w: o.w, h: o.h };
      if (mode.includes('e')) w = o.w + dx;
      if (mode.includes('w')) { w = o.w - dx; x = o.x + dx; }
      if (mode.includes('s')) h = o.h + dy;
      if (mode.includes('n')) { h = o.h - dy; y = o.y + dy; }
      if (ev.shiftKey && mode.length === 2) {
        const nh = w / (o.w / o.h);
        if (mode.includes('n')) y = o.y + o.h - nh;
        h = nh;
      }
      if (w < 8) { if (mode.includes('w')) x = o.x + o.w - 8; w = 8; }
      if (h < 2) { if (mode.includes('n')) y = o.y + o.h - 2; h = 2; }
      onUpdate(el.id, { x: Math.round(x), y: Math.round(y), width: Math.round(w), height: Math.round(h) });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setGuides({});
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const body = (el: CanvasElement, isEditing: boolean) => {
    const stroke = el.strokeWidth ? `${el.strokeWidth}px solid ${el.stroke || '#000'}` : undefined;
    const font: React.CSSProperties = { fontSize: el.fontSize || 16, fontWeight: el.fontWeight || 400, fontFamily: el.fontFamily || undefined };
    const commit = (e: React.FocusEvent<HTMLElement>) => { onUpdate?.(el.id, { content: e.currentTarget.innerText }); setEditing(null); };
    const editProps = {
      key: isEditing ? 'editing' : 'view',
      contentEditable: isEditing,
      suppressContentEditableWarning: true,
      onBlur: isEditing ? commit : undefined,
      onKeyDown: isEditing ? (e: React.KeyboardEvent<HTMLElement>) => { e.stopPropagation(); if (e.key === 'Escape') e.currentTarget.blur(); } : undefined,
      ref: isEditing ? (node: HTMLElement | null) => {
        if (node && document.activeElement !== node) {
          node.focus();
          const r = document.createRange(); r.selectNodeContents(node);
          const s = window.getSelection(); s?.removeAllRanges(); s?.addRange(r);
        }
      } : undefined,
    };
    switch (el.type) {
      case 'text':
        return <div {...editProps} style={{ ...font, width: '100%', height: '100%', padding: 2, color: el.color || '#111827', textAlign: el.align || 'left', whiteSpace: 'pre-wrap', lineHeight: 1.3, outline: 'none', cursor: isEditing ? 'text' : undefined }}>{el.content}</div>;
      case 'button':
        return <div {...editProps} style={{ ...font, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: el.fill || '#4f46e5', color: el.color || '#fff', borderRadius: el.radius ?? 8, border: stroke, outline: 'none', textAlign: 'center' }}>{el.content}</div>;
      case 'image': {
        const src = safeSrc(el.url);
        return src
          ? <img src={src} alt={el.name || ''} draggable={false} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: el.radius, border: stroke, display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#eceef2', border: '1px dashed #9aa0ab', borderRadius: el.radius, color: '#6b7280', fontSize: 11 }}><ImageIcon size={18} />Add an image URL</div>;
      }
      case 'container':
        return <div style={{ width: '100%', height: '100%', background: el.fill || 'transparent', border: stroke || '1px dashed #18a0fb', borderRadius: el.radius }} />;
      default:
        return <div style={{ width: '100%', height: '100%', background: el.fill || '#18a0fb', borderRadius: el.shape === 'ellipse' ? '50%' : el.radius, border: stroke }} />;
    }
  };

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
      {elements.filter(el => !el.hidden).map(el => {
        const selected = !readOnly && selectedId === el.id;
        const isEditing = editing === el.id;
        const interactive = !readOnly && !passive;
        return (
          <div
            key={el.id}
            className={interactive ? 'landy-el' : undefined}
            onPointerDown={interactive ? e => startDrag(e, el, 'move') : undefined}
            onClick={interactive ? e => e.stopPropagation() : undefined}
            onDoubleClick={interactive && (el.type === 'text' || el.type === 'button') && !el.locked ? () => setEditing(el.id) : undefined}
            style={{
              position: 'absolute', left: el.x, top: el.y, width: el.width, height: el.height,
              opacity: el.opacity ?? 1, transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
              pointerEvents: interactive ? 'auto' : 'none', touchAction: 'none',
              cursor: el.locked ? 'default' : isEditing ? 'text' : 'move', userSelect: isEditing ? 'text' : 'none',
              outline: selected ? `${2 / z}px solid #18a0fb` : undefined,
            }}
          >
            {body(el, isEditing)}
            {selected && !isEditing && !el.locked && HANDLES.map(h => (
              <div
                key={h}
                onPointerDown={e => startDrag(e, el, h)}
                style={{ ...handlePos(h, 9 / z), cursor: CURSOR[h], background: '#fff', border: `${1.5 / z}px solid #18a0fb`, borderRadius: 2 / z, pointerEvents: 'auto', touchAction: 'none', zIndex: 5 }}
              />
            ))}
            {selected && !isEditing && (
              <div style={{ position: 'absolute', left: '50%', top: `calc(100% + ${8 / z}px)`, transform: 'translateX(-50%)', padding: `${2 / z}px ${6 / z}px`, borderRadius: 4 / z, background: '#18a0fb', color: '#fff', fontSize: 10 / z, fontWeight: 700, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                {Math.round(el.width)} × {Math.round(el.height)}
              </div>
            )}
          </div>
        );
      })}
      {guides.x !== undefined && <div style={{ position: 'absolute', left: guides.x, top: 0, bottom: 0, width: 1 / z, background: '#ff3d71', pointerEvents: 'none' }} />}
      {guides.y !== undefined && <div style={{ position: 'absolute', top: guides.y, left: 0, right: 0, height: 1 / z, background: '#ff3d71', pointerEvents: 'none' }} />}
    </div>
  );
}
