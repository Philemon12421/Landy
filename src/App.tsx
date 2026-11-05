import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import {
  Block, BlockType, CanvasElement, ProjectState, SelectionState, StyleConfig, ToolMode, VIEWPORT_WIDTH, ViewportMode,
} from './types';
import { INITIAL_PROJECT, createBlockByType } from './utils/defaultBlocks';
import { ElementKind, cloneElement, createElement, uid } from './utils/elements';
import TopBar from './components/TopBar';
import CanvasArea from './components/CanvasArea';
import LeftSidebar from './components/LeftSidebar';
import InspectorPanel from './components/InspectorPanel';
import StatusBar from './components/StatusBar';
import PublicGalleryModal from './components/PublicGalleryModal';
import PublishModal from './components/PublishModal';

const STORAGE_KEY = 'landy_v5';
const NONE: SelectionState = { blockId: null, elementId: null };

const loadProject = (): ProjectState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('landy_v4');
    if (raw) {
      const p = JSON.parse(raw);
      if (p && Array.isArray(p.blocks) && p.style) {
        const elements: CanvasElement[] = (Array.isArray(p.elements) ? p.elements : []).map((e: CanvasElement) => ({ ...e, width: e.width ?? 160, height: e.height ?? 48 }));
        return { ...INITIAL_PROJECT, ...p, elements };
      }
    }
  } catch { /* fall through to the starter project */ }
  return { ...INITIAL_PROJECT, elements: [] };
};

type Toast = { id: string; msg: string; type: 'ok' | 'err' | 'info' };
type Clip = { kind: 'block'; data: Block } | { kind: 'element'; data: CanvasElement } | null;

/* ── Error boundary so a rendering bug never leaves a blank screen ─── */
class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error('Landy crashed:', error); }
  render() {
    if (!this.state.error) return (this as any).props.children;
    return (
      <div style={{ height: '100dvh', display: 'grid', placeItems: 'center', background: '#16161a', color: '#e5e5e5', padding: 24, textAlign: 'center' }}>
        <div style={{ maxWidth: 420 }}>
          <AlertTriangle size={32} style={{ color: '#fbbf24', margin: '0 auto 12px' }} />
          <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ fontSize: 13, color: '#9a9aa6', lineHeight: 1.6, marginBottom: 16 }}>Your work is saved in this browser. Reload to continue. If the problem persists, reset the project.</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn3d-brand" onClick={() => window.location.reload()}>Reload</button>
            <button className="btn3d" onClick={() => { if (window.confirm('This permanently deletes your saved project. Continue?')) { localStorage.removeItem(STORAGE_KEY); window.location.reload(); } }}>Reset project</button>
          </div>
        </div>
      </div>
    );
  }
}

function Editor() {
  const [project, setProjectState] = useState<ProjectState>(loadProject);
  const projectRef = useRef(project);
  const pastRef = useRef<ProjectState[]>([]);
  const futureRef = useRef<ProjectState[]>([]);
  const lastKey = useRef(''); const lastTime = useRef(0);
  const [, setHistVer] = useState(0);

  const [viewport, setViewport] = useState<ViewportMode>('laptop');
  const [zoom, setZoom] = useState(100);
  const [fitTick, setFitTick] = useState(0);
  const [tool, setTool] = useState<ToolMode>('move');
  const [selection, setSelection] = useState<SelectionState>(NONE);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const selRef = useRef(selection); selRef.current = selection;
  const clipRef = useRef<Clip>(null);
  const saveWarned = useRef(false);

  const toast = useCallback((msg: string, type: Toast['type'] = 'ok') => {
    const id = uid('t');
    setToasts(p => [...p.slice(-3), { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 2800);
  }, []);

  /* ── History: every change goes through apply() ───────── */
  const commit = (next: ProjectState) => { projectRef.current = next; setProjectState(next); };
  const apply = useCallback((fn: (p: ProjectState) => ProjectState, key?: string) => {
    const prev = projectRef.current;
    const next = fn(prev);
    if (next === prev) return;
    const now = Date.now();
    // Rapid edits with the same key (typing, dragging, sliders) collapse into one undo step.
    if (!(key && lastKey.current === key && now - lastTime.current < 900)) pastRef.current = [...pastRef.current.slice(-79), prev];
    lastKey.current = key || ''; lastTime.current = now;
    futureRef.current = [];
    commit(next);
    setHistVer(v => v + 1);
  }, []);

  const undo = useCallback(() => {
    const prev = pastRef.current.pop();
    if (!prev) return;
    futureRef.current.unshift(projectRef.current);
    lastKey.current = ''; commit(prev); setSelection(NONE); setHistVer(v => v + 1);
  }, []);
  const redo = useCallback(() => {
    const next = futureRef.current.shift();
    if (!next) return;
    pastRef.current.push(projectRef.current);
    lastKey.current = ''; commit(next); setSelection(NONE); setHistVer(v => v + 1);
  }, []);

  /* ── Persistence ──────────────────────────────────────── */
  const saveNow = useCallback((silent = true) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projectRef.current));
      setLastSaved(new Date()); saveWarned.current = false;
      if (!silent) toast('Saved to this browser', 'ok');
    } catch {
      if (!saveWarned.current) { saveWarned.current = true; toast('Could not save: browser storage is full. Try removing large uploaded images.', 'err'); }
    }
  }, [toast]);

  useEffect(() => {
    setIsSaving(true);
    const t = setTimeout(() => { saveNow(); setIsSaving(false); }, 700);
    return () => clearTimeout(t);
  }, [project, saveNow]);

  useEffect(() => { document.title = `${project.name || 'Untitled'} — Landy`; }, [project.name]);
  useEffect(() => { (window as unknown as { __landyReady?: () => void }).__landyReady?.(); }, []);

  /* ── Block actions ────────────────────────────────────── */
  const addBlock = useCallback((type: BlockType) => {
    const id = uid(type);
    const b = createBlockByType(type, id);
    const theme = projectRef.current.style.theme;
    if (theme === 'neo_brutalist') { b.styles.borderRadius = 'none'; b.styles.shadow = 'heavy'; }
    if (theme === 'cosmic_dark') { b.styles.bgColor = '#0f172a'; b.styles.textColor = '#f8fafc'; }
    apply(p => {
      const at = selRef.current.blockId ? p.blocks.findIndex(x => x.id === selRef.current.blockId) : -1;
      const blocks = [...p.blocks];
      blocks.splice(at >= 0 ? at + 1 : blocks.length, 0, b);
      return { ...p, blocks };
    });
    setSelection({ blockId: id, elementId: null });
    setShowDrawer(false);
  }, [apply]);

  const updateBlock = useCallback((id: string, patch: Partial<Block>) => {
    apply(p => ({
      ...p,
      blocks: p.blocks.map(b => (b.id !== id ? b : { ...b, ...patch, styles: { ...b.styles, ...(patch.styles || {}) }, content: { ...b.content, ...(patch.content || {}) } })),
    }), `blk:${id}`);
  }, [apply]);

  const deleteBlock = useCallback((id: string) => {
    apply(p => ({ ...p, blocks: p.blocks.filter(b => b.id !== id) }));
    setSelection(s => (s.blockId === id ? NONE : s));
  }, [apply]);

  const duplicateBlock = useCallback((id: string) => {
    const src = projectRef.current.blocks.find(b => b.id === id);
    if (!src) return;
    const clone: Block = { ...JSON.parse(JSON.stringify(src)), id: uid(src.type) };
    apply(p => { const i = p.blocks.findIndex(b => b.id === id); const blocks = [...p.blocks]; blocks.splice(i + 1, 0, clone); return { ...p, blocks }; });
    setSelection({ blockId: clone.id, elementId: null });
  }, [apply]);

  const moveBlock = useCallback((id: string, dir: 'up' | 'down') => {
    apply(p => {
      const i = p.blocks.findIndex(b => b.id === id), j = dir === 'up' ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= p.blocks.length) return p;
      const blocks = [...p.blocks]; [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      return { ...p, blocks };
    });
  }, [apply]);

  const reorderBlocks = useCallback((blocks: Block[]) => apply(p => ({ ...p, blocks })), [apply]);

  const changeStyle = useCallback((style: StyleConfig) => {
    apply(p => ({
      ...p, style,
      blocks: p.blocks.map(b => {
        if (style.theme === 'neo_brutalist') return { ...b, styles: { ...b.styles, borderRadius: 'none' as const, shadow: 'heavy' as const } };
        if (style.theme === 'cosmic_dark') return { ...b, styles: { ...b.styles, borderRadius: 'xl' as const, bgColor: b.styles.bgColor === '#ffffff' ? '#0f172a' : b.styles.bgColor, textColor: ['#0f172a', '#1e293b'].includes(b.styles.textColor) ? '#f8fafc' : b.styles.textColor } };
        return { ...b, styles: { ...b.styles, borderRadius: 'xl' as const } };
      }),
    }), 'style');
  }, [apply]);

  /* ── Free-form element actions ────────────────────────── */
  const addElementRaw = useCallback((el: CanvasElement) => {
    apply(p => ({ ...p, elements: [...(p.elements || []), el] }));
    setSelection({ blockId: null, elementId: el.id });
  }, [apply]);

  const addElementKind = useCallback((kind: ElementKind) => {
    const n = (projectRef.current.elements || []).length % 8;
    addElementRaw(createElement(kind, 96 + n * 24, 96 + n * 24));
    setShowDrawer(false);
  }, [addElementRaw]);

  const createFromTool = useCallback((spec: { tool: ToolMode; x: number; y: number; width: number; height: number }) => {
    const kind: ElementKind = spec.tool === 'text' ? 'text' : spec.tool === 'ellipse' ? 'ellipse' : 'rect';
    addElementRaw(createElement(kind, spec.x, spec.y, spec.width, spec.height));
    setTool('move');
  }, [addElementRaw]);

  const updateElement = useCallback((id: string, patch: Partial<CanvasElement>) => {
    apply(p => ({ ...p, elements: (p.elements || []).map(e => (e.id === id ? { ...e, ...patch } : e)) }), `el:${id}`);
  }, [apply]);

  const deleteElement = useCallback((id: string) => {
    apply(p => ({ ...p, elements: (p.elements || []).filter(e => e.id !== id) }));
    setSelection(s => (s.elementId === id ? NONE : s));
  }, [apply]);

  const duplicateElement = useCallback((id: string) => {
    const src = (projectRef.current.elements || []).find(e => e.id === id);
    if (src) addElementRaw(cloneElement(src));
  }, [addElementRaw]);

  const reorderElement = useCallback((id: string, dir: 'forward' | 'backward') => {
    apply(p => {
      const els = [...(p.elements || [])];
      const i = els.findIndex(e => e.id === id), j = dir === 'forward' ? i + 1 : i - 1;
      if (i < 0 || j < 0 || j >= els.length) return p;
      [els[i], els[j]] = [els[j], els[i]];
      return { ...p, elements: els };
    });
  }, [apply]);

  const rename = useCallback((name: string) => apply(p => ({ ...p, name }), 'rename'), [apply]);

  const setPublishedSlug = useCallback((slug: string | undefined) => {
    commit({ ...projectRef.current, publishedSlug: slug });
  }, []);

  /* ── Keyboard shortcuts (registered once, always call latest handlers) ── */
  const api = useRef({} as Record<string, (...a: never[]) => void>);
  api.current = {
    undo, redo, saveNow: () => saveNow(false), addBlock: addBlock as never, fit: () => setFitTick(t => t + 1), zoom: ((z: number) => setZoom(z)) as never,
    deleteSelected: () => { const s = selRef.current; if (s.elementId) deleteElement(s.elementId); else if (s.blockId) deleteBlock(s.blockId); },
    copy: () => {
      const s = selRef.current, p = projectRef.current;
      if (s.elementId) { const e = (p.elements || []).find(x => x.id === s.elementId); if (e) { clipRef.current = { kind: 'element', data: e }; toast('Copied', 'info'); } }
      else if (s.blockId) { const b = p.blocks.find(x => x.id === s.blockId); if (b) { clipRef.current = { kind: 'block', data: b }; toast('Copied', 'info'); } }
    },
    paste: () => {
      const c = clipRef.current; if (!c) return;
      if (c.kind === 'element') addElementRaw(cloneElement(c.data));
      else { const clone: Block = { ...JSON.parse(JSON.stringify(c.data)), id: uid(c.data.type) }; apply(p => ({ ...p, blocks: [...p.blocks, clone] })); setSelection({ blockId: clone.id, elementId: null }); }
    },
    duplicate: () => { const s = selRef.current; if (s.elementId) duplicateElement(s.elementId); else if (s.blockId) duplicateBlock(s.blockId); },
    nudge: ((dx: number, dy: number) => { const id = selRef.current.elementId; const e = (projectRef.current.elements || []).find(x => x.id === id); if (e && !e.locked) updateElement(e.id, { x: e.x + dx, y: e.y + dy }); }) as never,
  } as never;

  useEffect(() => {
    const QUICK: Record<string, BlockType> = { KeyH: 'hero_section', KeyN: 'navbar', KeyF: 'features_grid', KeyT: 'text_block', KeyI: 'image_block', KeyB: 'cta_block', KeyP: 'pricing_cards', KeyS: 'stats_block', KeyQ: 'faq_block', KeyM: 'team_block' };
    const TOOLS: Record<string, ToolMode> = { v: 'move', h: 'hand', t: 'text', r: 'rect', o: 'ellipse' };
    const onKey = (e: KeyboardEvent) => {
      const A = api.current as Record<string, (...a: unknown[]) => void>;
      const mod = e.metaKey || e.ctrlKey, k = e.key.toLowerCase();
      if (mod && k === 's') { e.preventDefault(); A.saveNow(); return; }
      const t = e.target as HTMLElement | null;
      if (t && (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable)) return;

      if (e.key === 'Escape') { setTool('move'); setSelection(NONE); setShowShortcuts(false); return; }
      if (e.key === '?') { setShowShortcuts(true); return; }
      if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? A.redo() : A.undo(); return; }
      if (mod && k === 'y') { e.preventDefault(); A.redo(); return; }
      if (mod && k === 'c') { A.copy(); return; }
      if (mod && k === 'v') { e.preventDefault(); A.paste(); return; }
      if (mod && k === 'd') { e.preventDefault(); A.duplicate(); return; }
      if (mod && (k === '=' || k === '+')) { e.preventDefault(); setZoom(z => Math.min(400, z + 10)); return; }
      if (mod && k === '-') { e.preventDefault(); setZoom(z => Math.max(10, z - 10)); return; }
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); A.deleteSelected(); return; }
      if (e.shiftKey && e.code === 'Digit1') { e.preventDefault(); A.fit(); return; }
      if (e.shiftKey && e.code === 'Digit0') { e.preventDefault(); setZoom(100); return; }
      if (e.key.startsWith('Arrow') && selRef.current.elementId) {
        e.preventDefault();
        const d = e.shiftKey ? 10 : 1;
        A.nudge(e.key === 'ArrowLeft' ? -d : e.key === 'ArrowRight' ? d : 0, e.key === 'ArrowUp' ? -d : e.key === 'ArrowDown' ? d : 0);
        return;
      }
      if (mod || e.altKey) return;
      if (e.shiftKey && QUICK[e.code]) { e.preventDefault(); A.addBlock(QUICK[e.code]); return; }
      if (!e.shiftKey && TOOLS[k]) { e.preventDefault(); setTool(TOOLS[k]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const inspector = (
    <InspectorPanel
      project={project} selection={selection} frameWidth={VIEWPORT_WIDTH[viewport]} setSelection={setSelection}
      onChangeStyle={changeStyle} onUpdateBlock={updateBlock} onDeleteBlock={deleteBlock} onDuplicateBlock={duplicateBlock}
      onMoveBlock={moveBlock} onAddBlock={addBlock} onUpdateElement={updateElement} onDeleteElement={deleteElement}
      onDuplicateElement={duplicateElement} onReorderElement={reorderElement}
    />
  );
  const left = (
    <LeftSidebar
      project={project} selection={selection} setSelection={setSelection}
      onUpdateBlock={updateBlock as never} onUpdateElement={updateElement} onMoveBlock={moveBlock}
      onDeleteBlock={deleteBlock} onDeleteElement={deleteElement} onReorderElement={reorderElement}
      onAddElement={addElementKind} onAddBlock={addBlock}
    />
  );

  const publishedUrl = project.publishedSlug ? `${window.location.origin}/p/${project.publishedSlug}` : undefined;

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100dvh', background: '#16161a' }}>
      <TopBar
        viewport={viewport} setViewport={setViewport} tool={tool} setTool={setTool}
        canUndo={pastRef.current.length > 0} canRedo={futureRef.current.length > 0} onUndo={undo} onRedo={redo}
        isPreviewMode={isPreviewMode} setIsPreviewMode={v => { setIsPreviewMode(v); if (v) setSelection(NONE); }}
        project={project} onRename={rename} publishedUrl={publishedUrl}
        onPublishClick={() => setShowPublish(true)} onShowShortcuts={() => setShowShortcuts(true)}
        onShowGallery={() => setShowGallery(true)} onShowMobilePanel={() => setShowDrawer(true)}
      />

      <main className="relative min-h-0 flex-1 overflow-hidden">
        <CanvasArea
          project={project} viewport={viewport} zoom={zoom} setZoom={setZoom} fitTick={fitTick} tool={tool}
          selection={selection} setSelection={setSelection}
          onUpdateBlock={updateBlock} onDeleteBlock={deleteBlock} onDuplicateBlock={duplicateBlock} onMoveBlock={moveBlock}
          onReorderBlocks={reorderBlocks} onAddBlock={addBlock} onUpdateElement={updateElement} onCreateElement={createFromTool}
          isPreviewMode={isPreviewMode}
        />

        {!isPreviewMode && (
          <>
            <aside className="float-panel left" aria-label="Layers and assets">{left}</aside>
            <aside className="float-panel right panel-chrome-right" aria-label="Properties">{inspector}</aside>
          </>
        )}

        {!isPreviewMode && showDrawer && (
          <div className="fixed inset-0 z-50 flex md:hidden" onClick={() => setShowDrawer(false)}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.65)' }} />
            <div className="relative z-10 flex h-full flex-col" style={{ width: 300, maxWidth: '88vw', background: '#28282c', boxShadow: '0 0 60px rgba(0,0,0,.7)' }} onClick={e => e.stopPropagation()}>
              <div className="flex shrink-0 items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid #1c1c20' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#ccc' }}>{selection.blockId || selection.elementId ? 'Properties' : 'Add & layers'}</span>
                <button className="fig-icon-btn" onClick={() => setShowDrawer(false)} aria-label="Close panel"><X size={14} /></button>
              </div>
              <div className="min-h-0 flex-1">{selection.blockId || selection.elementId ? inspector : left}</div>
            </div>
          </div>
        )}
      </main>

      <StatusBar project={project} isSaving={isSaving} lastSaved={lastSaved} zoom={zoom} selection={selection} />

      <div className="pointer-events-none fixed bottom-10 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className="fig-toast pointer-events-auto">
            {t.type === 'ok' && <CheckCircle2 size={14} style={{ color: '#22c55e', flexShrink: 0 }} />}
            {t.type === 'err' && <AlertTriangle size={14} style={{ color: '#f87171', flexShrink: 0 }} />}
            {t.type === 'info' && <Info size={14} style={{ color: '#60a5fa', flexShrink: 0 }} />}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      {showGallery && (
        <PublicGalleryModal
          onClose={() => setShowGallery(false)}
          onImport={imp => { apply(() => ({ ...INITIAL_PROJECT, ...imp, elements: imp.elements || [], publishedSlug: undefined })); setSelection(NONE); setFitTick(t => t + 1); toast('Template imported. Undo (Ctrl+Z) restores your previous page.', 'ok'); }}
        />
      )}

      {showPublish && (
        <PublishModal project={project} onClose={() => setShowPublish(false)} onSitePublished={setPublishedSlug} onGalleryPublished={() => toast('Shared to the community gallery', 'ok')} toast={toast} />
      )}

      {showShortcuts && (
        <div className="fig-modal-backdrop" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
          <div className="fig-modal w-full" style={{ maxWidth: 640 }}>
            <div className="fig-modal-header">
              <span style={{ fontSize: 13, fontWeight: 700, color: '#ececf0' }}>Keyboard shortcuts</span>
              <button className="fig-icon-btn" onClick={() => setShowShortcuts(false)} aria-label="Close"><X size={15} /></button>
            </div>
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 20 }}>
              {([
                ['Tools', [['V', 'Move'], ['H', 'Hand (or hold Space)'], ['T', 'Text'], ['R', 'Rectangle'], ['O', 'Ellipse'], ['Esc', 'Back to Move']]],
                ['Edit', [['Ctrl Z', 'Undo'], ['Ctrl ⇧ Z', 'Redo'], ['Ctrl C / V', 'Copy / paste'], ['Ctrl D', 'Duplicate'], ['Del', 'Delete'], ['Arrows', 'Nudge layer'], ['Ctrl S', 'Save now']]],
                ['View', [['Scroll', 'Pan'], ['Ctrl Scroll', 'Zoom'], ['⇧ 1', 'Fit to screen'], ['⇧ 0', '100%'], ['Ctrl + / −', 'Zoom']]],
                ['Add section', [['⇧ H', 'Hero'], ['⇧ N', 'Navbar'], ['⇧ F', 'Features'], ['⇧ T', 'Text'], ['⇧ I', 'Image'], ['⇧ B', 'Call to action'], ['⇧ P', 'Pricing'], ['⇧ S', 'Stats'], ['⇧ Q', 'FAQ'], ['⇧ M', 'Team']]],
              ] as const).map(([title, rows]) => (
                <div key={title}>
                  <p className="section-label" style={{ marginBottom: 8 }}>{title}</p>
                  {rows.map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-2" style={{ padding: '4px 0', borderBottom: '1px solid #1f1f23' }}>
                      <span className="kbd">{k}</span><span style={{ fontSize: 11, color: '#8c8c96', textAlign: 'right' }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return <ErrorBoundary><Editor /></ErrorBoundary>;
}
