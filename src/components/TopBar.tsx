import React, { useMemo, useState } from 'react';
import {
  Check, ChevronDown, Circle, Code, Download, ExternalLink, Eye, FileCode, Globe, Hand, Keyboard, Laptop, Menu, Monitor,
  MousePointer2, Redo2, Share2, Smartphone, Square, Tablet, Type, Undo2, X,
} from 'lucide-react';
import { ProjectState, ToolMode, ViewportMode } from '../types';
import { generateHtml, generateReact, slugify } from '../utils/exportHtml';

interface Props {
  viewport: ViewportMode; setViewport: (v: ViewportMode) => void;
  tool: ToolMode; setTool: (t: ToolMode) => void;
  canUndo: boolean; canRedo: boolean; onUndo: () => void; onRedo: () => void;
  isPreviewMode: boolean; setIsPreviewMode: (p: boolean) => void;
  project: ProjectState; onRename: (n: string) => void;
  publishedUrl?: string;
  onPublishClick: () => void; onShowShortcuts: () => void; onShowGallery: () => void; onShowMobilePanel: () => void;
}

const TOOLS: { id: ToolMode; icon: React.ComponentType<{ size?: number }>; label: string; key: string }[] = [
  { id: 'move', icon: MousePointer2, label: 'Move', key: 'V' },
  { id: 'hand', icon: Hand, label: 'Hand', key: 'H' },
  { id: 'text', icon: Type, label: 'Text', key: 'T' },
  { id: 'rect', icon: Square, label: 'Rectangle', key: 'R' },
  { id: 'ellipse', icon: Circle, label: 'Ellipse', key: 'O' },
];
const VIEWPORTS: { id: ViewportMode; icon: React.ComponentType<{ size?: number }>; label: string }[] = [
  { id: 'desktop', icon: Monitor, label: 'Desktop' }, { id: 'laptop', icon: Laptop, label: 'Laptop' },
  { id: 'tablet', icon: Tablet, label: 'Tablet' }, { id: 'mobile', icon: Smartphone, label: 'Mobile' },
];

export default function TopBar(p: Props) {
  const [menu, setMenu] = useState(false);
  const [exportFmt, setExportFmt] = useState<'html' | 'react' | null>(null);
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => (exportFmt === 'html' ? generateHtml(p.project) : exportFmt === 'react' ? generateReact(p.project) : ''), [exportFmt, p.project]);
  const base = slugify(p.project.name) || 'landing-page';

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600); }
    catch { window.prompt('Copy the code below:', code.slice(0, 2000)); }
  };
  const download = () => {
    const a = document.createElement('a');
    const url = URL.createObjectURL(new Blob([code], { type: 'text/plain;charset=utf-8' }));
    a.href = url; a.download = exportFmt === 'html' ? `${base}.html` : 'LandingPage.tsx';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };
  const openPreview = () => {
    const url = URL.createObjectURL(new Blob([generateHtml(p.project)], { type: 'text/html' }));
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  return (
    <>
      <header className="figma-toolbar flex shrink-0 select-none items-center justify-between gap-2 px-3">
        <div className="flex items-center gap-2">
          <button className="fig-icon-btn md:hidden" onClick={p.onShowMobilePanel} aria-label="Open panels"><Menu size={16} /></button>
          <div className="flex items-center gap-2" style={{ marginRight: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 900, fontSize: 15, background: 'linear-gradient(135deg,#a07bff,#2563eb)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.4), 0 2px 0 #3b1d8f, 0 6px 12px rgba(124,58,237,.45)' }}>L</div>
            <span className="hidden text-xs font-extrabold lg:block" style={{ color: '#e8e8ee', letterSpacing: '-.01em' }}>Landy</span>
          </div>

          {!p.isPreviewMode && (
            <>
              <div className="seg" role="toolbar" aria-label="Tools">
                {TOOLS.map(t => (
                  <button key={t.id} className={`seg-btn accent ${p.tool === t.id ? 'active' : ''}`} title={`${t.label} (${t.key})`} aria-label={t.label} aria-pressed={p.tool === t.id} onClick={() => p.setTool(t.id)}><t.icon size={14} /></button>
                ))}
              </div>
              <div className="seg">
                <button className="seg-btn" disabled={!p.canUndo} title="Undo (Ctrl+Z)" aria-label="Undo" onClick={p.onUndo}><Undo2 size={14} /></button>
                <button className="seg-btn" disabled={!p.canRedo} title="Redo (Ctrl+Shift+Z)" aria-label="Redo" onClick={p.onRedo}><Redo2 size={14} /></button>
              </div>
              <div className="seg hidden md:flex" role="radiogroup" aria-label="Preview size">
                {VIEWPORTS.map(v => (
                  <button key={v.id} role="radio" aria-checked={p.viewport === v.id} className={`seg-btn ${p.viewport === v.id ? 'active' : ''}`} title={v.label} onClick={() => p.setViewport(v.id)}><v.icon size={14} /><span className="hidden xl:inline">{v.label}</span></button>
                ))}
              </div>
            </>
          )}
        </div>

        <input className="name-input hidden lg:block" value={p.project.name} maxLength={48} aria-label="Project name" onChange={e => p.onRename(e.target.value)} onBlur={e => { if (!e.target.value.trim()) p.onRename('Untitled page'); }} />

        <div className="flex items-center gap-2">
          {!p.isPreviewMode && (
            <div className="seg hidden md:flex">
              <button className="seg-btn" title="Community gallery" aria-label="Community gallery" onClick={p.onShowGallery}><Globe size={14} /></button>
              <button className="seg-btn" title="Keyboard shortcuts (?)" aria-label="Keyboard shortcuts" onClick={p.onShowShortcuts}><Keyboard size={14} /></button>
            </div>
          )}
          <button className={`btn3d ${p.isPreviewMode ? 'btn3d-brand' : ''}`} onClick={() => p.setIsPreviewMode(!p.isPreviewMode)} aria-pressed={p.isPreviewMode}>
            <Eye size={13} />{p.isPreviewMode ? 'Back to editing' : 'Preview'}
          </button>
          {!p.isPreviewMode && (
            <>
              <div style={{ position: 'relative' }}>
                <button className="btn3d" onClick={() => setMenu(v => !v)} aria-haspopup="menu" aria-expanded={menu}><Download size={13} /><span className="hidden sm:inline">Export</span><ChevronDown size={11} /></button>
                {menu && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 45 }} onClick={() => setMenu(false)} />
                    <div className="fig-modal animate-scale-in" role="menu" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 50, width: 230, borderRadius: 12 }}>
                      {([['html', Code, '#4ade80', 'HTML + CSS', 'One self-contained file'], ['react', FileCode, '#60a5fa', 'React component', 'TSX you can drop into an app']] as const).map(([fmt, Icon, colour, title, sub]) => (
                        <button key={fmt} role="menuitem" onClick={() => { setExportFmt(fmt); setMenu(false); }} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '10px 12px', border: 0, background: 'transparent', color: '#ddd', textAlign: 'left', cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.06)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <Icon size={16} style={{ color: colour }} /><div><div style={{ fontSize: 12, fontWeight: 600 }}>{title}</div><div style={{ fontSize: 10, color: '#7a7a86' }}>{sub}</div></div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button className="btn3d-brand violet" style={{ height: 32 }} onClick={p.onPublishClick}>
                {p.publishedUrl ? <span className="live-dot" aria-hidden="true" /> : <Share2 size={13} />}
                <span>{p.publishedUrl ? 'Published' : 'Publish'}</span>
              </button>
            </>
          )}
        </div>
      </header>

      {exportFmt && (
        <div className="fig-modal-backdrop" role="dialog" aria-modal="true" aria-label="Export code" onClick={e => { if (e.target === e.currentTarget) setExportFmt(null); }}>
          <div className="fig-modal flex w-full flex-col" style={{ maxWidth: 880, maxHeight: '86vh' }}>
            <div className="fig-modal-header">
              <div className="flex items-center gap-3">
                <div className="seg">
                  {(['html', 'react'] as const).map(f => <button key={f} className={`seg-btn ${exportFmt === f ? 'active' : ''}`} onClick={() => setExportFmt(f)}>{f === 'html' ? 'HTML' : 'React'}</button>)}
                </div>
                <span style={{ fontSize: 10, color: '#7a7a86', fontFamily: 'ui-monospace, monospace' }}>{(code.length / 1024).toFixed(1)} KB</span>
              </div>
              <button className="fig-icon-btn" onClick={() => setExportFmt(null)} aria-label="Close"><X size={15} /></button>
            </div>
            <pre style={{ flex: 1, overflow: 'auto', margin: 0, padding: 16, background: '#0d1117', color: '#c9d1d9', fontSize: 11, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{code}</pre>
            <div className="flex flex-wrap items-center justify-between gap-3 p-3" style={{ borderTop: '1px solid #1c1c20', background: '#26262a' }}>
              <span style={{ fontSize: 10, color: '#7a7a86' }}>{exportFmt === 'html' ? 'Responsive, accessible and ready to host anywhere.' : 'Needs React 17+. No Tailwind required.'}</span>
              <div className="flex gap-2">
                <button className="btn3d" onClick={openPreview}><ExternalLink size={12} />Open in new tab</button>
                <button className="btn3d" onClick={copy}>{copied ? <><Check size={12} />Copied</> : 'Copy'}</button>
                <button className="btn3d-brand" onClick={download}><Download size={12} />Download</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
