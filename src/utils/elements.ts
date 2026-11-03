import { CanvasElement } from '../types';

export type ElementKind = 'text' | 'image' | 'button' | 'rect' | 'ellipse' | 'line' | 'container';

export const uid = (prefix = 'el') => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function createElement(kind: ElementKind, x = 120, y = 120, w?: number, h?: number): CanvasElement {
  const base = { id: uid('el'), x: Math.round(x), y: Math.round(y) };
  switch (kind) {
    case 'text':
      return { ...base, type: 'text', name: 'Text', width: w ?? 240, height: h ?? 48, content: 'Type something', fontSize: 20, fontWeight: 500, color: '#111827', align: 'left' };
    case 'button':
      return { ...base, type: 'button', name: 'Button', width: w ?? 160, height: h ?? 48, content: 'Click me', fill: '#4f46e5', color: '#ffffff', radius: 10, fontSize: 14, fontWeight: 700, url: '#' };
    case 'image':
      return { ...base, type: 'image', name: 'Image', width: w ?? 240, height: h ?? 160, url: '', radius: 8 };
    case 'ellipse':
      return { ...base, type: 'shape', shape: 'ellipse', name: 'Ellipse', width: w ?? 140, height: h ?? 140, fill: '#18a0fb' };
    case 'line':
      return { ...base, type: 'shape', shape: 'line', name: 'Line', width: w ?? 200, height: 2, fill: '#111827' };
    case 'container':
      return { ...base, type: 'container', name: 'Container', width: w ?? 260, height: h ?? 180, fill: 'transparent', stroke: '#18a0fb', strokeWidth: 1, radius: 8 };
    default:
      return { ...base, type: 'shape', shape: 'rect', name: 'Rectangle', width: w ?? 160, height: h ?? 120, fill: '#18a0fb', radius: 8 };
  }
}

export const cloneElement = (el: CanvasElement): CanvasElement => ({ ...el, id: uid('el'), x: el.x + 16, y: el.y + 16, name: el.name ? `${el.name} copy` : undefined });
