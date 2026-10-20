import React, { useState, useEffect, useCallback } from 'react';
import { ProjectState, Block, StyleConfig, ViewportMode, SelectionState, BlockType } from './types';
import { INITIAL_PROJECT, createBlockByType } from './utils/defaultBlocks';
import TopBar from './components/TopBar';
import CanvasArea from './components/CanvasArea';
import RightPropertiesPanel from './components/RightPropertiesPanel';
import StatusBar from './components/StatusBar';
import PublicGalleryModal from './components/PublicGalleryModal';
import { Globe, Keyboard, X, Check, Share2, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function App() {
  const [project, setProject] = useState<ProjectState>(() => {
    try { const s = localStorage.getItem('landy_v4'); if (s) return JSON.parse(s); } catch {}
    return INITIAL_PROJECT;
  });
  const [past, setPast] = useState<ProjectState[]>([]);
  const [future, setFuture] = useState<ProjectState[]>([]);
  const [viewport, setViewport] = useState<ViewportMode>('laptop');
  const [zoom, setZoom] = useState(100);
  const [selection, setSelection] = useState<SelectionState>({ blockId: null, elementId: null });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedBlock, setCopiedBlock] = useState<Block | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [pubName, setPubName] = useState('');
  const [pubDesc, setPubDesc] = useState('');
  const [pubCat, setPubCat] = useState('SaaS');
  const [publishing, setPublishing] = useState(false);
  const [pubOk, setPubOk] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  type Toast = { id: string; msg: string; type: 'ok'|'err'|'info' };
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((msg: string, type: Toast['type'] = 'ok') => {
    const id = `${Date.now()}${Math.random()}`;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 2800);
  }, []);

  useEffect(() => { setHasMounted(true); }, []);

  /* auto-save */
  useEffect(() => {
    if (!hasMounted) return;
    setIsSaving(true);
    const t = setTimeout(() => {
      try { localStorage.setItem('landy_v4', JSON.stringify(project)); }
      catch { toast('Could not save — storage full', 'err'); }
      setIsSaving(false);
    }, 900);
    return () => clearTimeout(t);
  }, [project, hasMounted]);

  const push = useCallback((next: ProjectState) => {
    setPast(p => [...p.slice(-49), project]); setFuture([]); setProject(next);
  }, [project]);

  const undo = useCallback(() => {
    if (!past.length) return;
    setFuture(f => [project, ...f]); setProject(past[past.length-1]); setPast(p => p.slice(0,-1));
    setSelection({ blockId: null, elementId: null });
  }, [past, project]);

  const redo = useCallback(() => {
    if (!future.length) return;
    setPast(p => [...p, project]); setProject(future[0]); setFuture(f => f.slice(1));
    setSelection({ blockId: null, elementId: null });
  }, [future, project]);

  const addBlock = useCallback((type: BlockType) => {
    const id = `${type}-${Date.now()}`;
    const b = createBlockByType(type, id);
    if (project.style.theme === 'neo_brutalist')  { b.styles.borderRadius = 'none'; b.styles.shadow = 'heavy'; }
    if (project.style.theme === 'cosmic_dark')    { b.styles.bgColor = '#0f172a'; b.styles.textColor = '#f8fafc'; }
    push({ ...project, blocks: [...project.blocks, b] });
    setSelection({ blockId: id, elementId: null });
    setShowMobilePanel(false);
  }, [project, push]);

  const updateBlock = useCallback((blockId: string, updated: Partial<Block>) => {
    const blocks = project.blocks.map(b => b.id !== blockId ? b : {
      ...b, ...updated,
      styles:  { ...b.styles,  ...(updated.styles  || {}) },
      content: { ...b.content, ...(updated.content || {}) }
    });
    setPast(p => [...p.slice(-49), project]); setFuture([]); setProject({ ...project, blocks });
  }, [project]);

  const deleteBlock = useCallback((id: string) => {
    push({ ...project, blocks: project.blocks.filter(b => b.id !== id) });
    toast('Block removed', 'info');
  }, [project, push, toast]);

  const duplicateBlock = useCallback((id: string) => {
    const idx = project.blocks.findIndex(b => b.id === id); if (idx === -1) return;
    const clone: Block = { ...JSON.parse(JSON.stringify(project.blocks[idx])), id: `${project.blocks[idx].type}-${Date.now()}` };
    const next = [...project.blocks]; next.splice(idx + 1, 0, clone);
    push({ ...project, blocks: next }); setSelection({ blockId: clone.id, elementId: null });
  }, [project, push]);

  const moveBlock = useCallback((id: string, dir: 'up'|'down') => {
    const idx = project.blocks.findIndex(b => b.id === id); if (idx === -1) return;
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === project.blocks.length - 1) return;
    const next = [...project.blocks]; const sw = dir === 'up' ? idx - 1 : idx + 1;
    [next[idx], next[sw]] = [next[sw], next[idx]];
    push({ ...project, blocks: next });
  }, [project, push]);

  const reorder = useCallback((blocks: Block[]) => push({ ...project, blocks }), [project, push]);

  const changeStyle = useCallback((style: StyleConfig) => {
    const aligned = project.blocks.map(b => {
      const s = { ...b };
      if (style.theme === 'neo_brutalist')  s.styles = { ...s.styles, borderRadius: 'none', shadow: 'heavy' };
      else if (style.theme === 'cosmic_dark') s.styles = { ...s.styles, borderRadius: 'xl', bgColor: s.styles.bgColor === '#ffffff' ? '#0f172a' : s.styles.bgColor, textColor: ['#0f172a','#1e293b'].includes(s.styles.textColor) ? '#f8fafc' : s.styles.textColor };
      else s.styles = { ...s.styles, borderRadius: 'xl' };
      return s;
    });
    push({ ...project, style, blocks: aligned });
  }, [project, push]);

  const rename = useCallback((name: string) => setProject(p => ({ ...p, name })), []);

  /* keyboard shortcuts */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT' || (active as HTMLElement).hasAttribute('contenteditable'))) return;
      const mac = navigator.platform.toUpperCase().includes('MAC');
      const mod = mac ? e.metaKey : e.ctrlKey;

      if (e.key === 'Escape') { e.preventDefault(); setSelection({ blockId: null, elementId: null }); return; }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selection.blockId) { e.preventDefault(); deleteBlock(selection.blockId); setSelection({ blockId: null, elementId: null }); return; }
      if (mod && e.key.toLowerCase() === 'c' && selection.blockId) { e.preventDefault(); const b = project.blocks.find(b => b.id === selection.blockId); if (b) { setCopiedBlock(b); toast('Copied', 'info'); } return; }
      if (mod && e.key.toLowerCase() === 'v' && copiedBlock) { e.preventDefault(); const clone: Block = { ...JSON.parse(JSON.stringify(copiedBlock)), id: `${copiedBlock.type}-${Date.now()}` }; push({ ...project, blocks: [...project.blocks, clone] }); setSelection({ blockId: clone.id, elementId: null }); return; }
      if (mod && !e.shiftKey && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); return; }
      if ((mod && e.shiftKey && e.key.toLowerCase() === 'z') || (mod && e.key.toLowerCase() === 'y')) { e.preventDefault(); redo(); return; }
      if (mod && e.key.toLowerCase() === 'd' && selection.blockId) { e.preventDefault(); duplicateBlock(selection.blockId); return; }
      if (!mod && !e.shiftKey && !e.altKey) {
        const map: Record<string, BlockType> = { h:'hero_section', n:'navbar', f:'features_grid', t:'text_block', i:'image_block', b:'cta_block', p:'pricing_cards', s:'stats_block', q:'faq_block', m:'team_block' };
        const bt = map[e.key.toLowerCase()];
        if (bt) { e.preventDefault(); addBlock(bt); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selection, project, copiedBlock, undo, redo, deleteBlock, duplicateBlock, addBlock, push, toast]);

  const publish = async (e: React.FormEvent) => {
    e.preventDefault(); if (!pubName || !pubDesc) return;
    try {
      setPublishing(true);
      const res = await fetch('/api/gallery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ component_name: pubName, description: pubDesc, category: pubCat, projectData: project }) });
      if (!res.ok) throw new Error();
      setPubOk(true);
      setTimeout(() => { setShowPublish(false); setPubOk(false); setPubName(''); setPubDesc(''); }, 2000);
    } catch { toast('Publish failed', 'err'); }
    finally { setPublishing(false); }
  };

  const Panel = () => (
    <RightPropertiesPanel project={project} onChangeStyle={changeStyle} selection={selection} setSelection={setSelection}
      onUpdateBlock={updateBlock} onDeleteBlock={deleteBlock} onDuplicateBlock={duplicateBlock}
      onMoveBlock={moveBlock} onAddBlock={addBlock} />
  );

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100dvh', background: '#1e1e1e', fontFamily: "'Inter', system-ui, sans-serif" }}>

      <TopBar viewport={viewport} setViewport={setViewport} zoom={zoom} setZoom={setZoom}
        canUndo={past.length > 0} canRedo={future.length > 0} onUndo={undo} onRedo={redo}
        isPreviewMode={isPreviewMode} setIsPreviewMode={setIsPreviewMode}
        project={project} onPublishClick={() => setShowPublish(true)}
        onShowShortcuts={() => setShowShortcuts(true)}
        onShowGallery={() => setShowGallery(true)}
        onShowMobilePanel={() => setShowMobilePanel(true)} />

      <div className="flex flex-1 overflow-hidden min-h-0 relative">
        {/* Desktop left panel */}
        {!isPreviewMode && <div className="hidden md:flex"><Panel /></div>}

        {/* Mobile panel overlay */}
        {!isPreviewMode && showMobilePanel && (
          <div className="md:hidden fixed inset-0 z-50 flex" onClick={() => setShowMobilePanel(false)}>
            <div style={{ background: 'rgba(0,0,0,.65)', position: 'absolute', inset: 0 }} />
            <div className="relative z-10 flex flex-col h-full shadow-2xl" style={{ width: 240, background: '#2c2c2c', borderRight: '1px solid #3a3a3a' }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-3 py-2 shrink-0" style={{ borderBottom: '1px solid #3a3a3a' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#ccc' }}>Builder Panel</span>
                <button onClick={() => setShowMobilePanel(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 4 }}><X size={14} /></button>
              </div>
              <div className="flex-1 overflow-hidden"><Panel /></div>
            </div>
          </div>
        )}

        <CanvasArea project={project} viewport={viewport} zoom={zoom} selection={selection} setSelection={setSelection}
          onUpdateBlock={updateBlock} onDeleteBlock={deleteBlock} onDuplicateBlock={duplicateBlock}
          onMoveBlock={moveBlock} onReorderBlocks={reorder} isPreviewMode={isPreviewMode} onAddBlock={addBlock} />
      </div>

      <StatusBar project={project} onRenameProject={rename} isSaving={isSaving} />

      {/* Toast stack */}
      <div className="fixed bottom-10 right-3 z-50 flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 280 }}>
        {toasts.map(t => (
          <div key={t.id} className="fig-toast pointer-events-auto animate-slide-up">
            {t.type === 'ok'   && <CheckCircle2 size={13} style={{ color: '#22c55e', flexShrink: 0 }} />}
            {t.type === 'err'  && <AlertTriangle size={13} style={{ color: '#f87171', flexShrink: 0 }} />}
            {t.type === 'info' && <Info size={13} style={{ color: '#60a5fa', flexShrink: 0 }} />}
            <span style={{ fontSize: 11 }}>{t.msg}</span>
          </div>
        ))}
      </div>

      {/* Gallery modal */}
      {showGallery && (
        <PublicGalleryModal onClose={() => setShowGallery(false)}
          onImport={imp => { setPast(p => [...p.slice(-49), project]); setFuture([]); setProject(imp); toast('Template imported', 'ok'); }} />
      )}

      {/* Publish modal */}
      {showPublish && (
        <div className="fig-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowPublish(false); }}>
          <div className="fig-modal w-full" style={{ maxWidth: 440 }}>
            <div className="fig-modal-header">
              <div className="flex items-center gap-2">
                <Share2 size={15} style={{ color: '#18a0fb' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Publish to Gallery</span>
              </div>
              <button onClick={() => setShowPublish(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 4 }}><X size={14} /></button>
            </div>
            {pubOk ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#14532d22', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={22} style={{ color: '#22c55e' }} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5', marginBottom: 4 }}>Published!</p>
                <p style={{ fontSize: 11, color: '#666' }}>Your design is live in the community gallery.</p>
              </div>
            ) : (
              <form onSubmit={publish} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 11, color: '#666', lineHeight: 1.6 }}>Share your layout with the community. Others can clone and customize it for free.</p>
                <div>
                  <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Template Name *</label>
                  <input required value={pubName} onChange={e => setPubName(e.target.value)} placeholder="e.g. SaaS Dark Launch" className="fig-input w-full" style={{ height: 32, fontSize: 12 }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description *</label>
                  <textarea required rows={3} value={pubDesc} onChange={e => setPubDesc(e.target.value)} placeholder="Describe the design style and use case…" className="fig-input w-full" style={{ fontSize: 12, resize: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</label>
                  <div className="relative">
                    <select value={pubCat} onChange={e => setPubCat(e.target.value)} className="fig-select w-full" style={{ height: 32, fontSize: 12, paddingRight: 24 }}>
                      {['SaaS','Portfolio','Agency','E-commerce','Crypto','Personal','General'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowPublish(false)} className="fig-btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={publishing} className="fig-btn-primary flex-1 flex items-center justify-center gap-2">
                    {publishing ? <><span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Publishing…</> : 'Publish'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Shortcuts modal */}
      {showShortcuts && (
        <div className="fig-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
          <div className="fig-modal w-full" style={{ maxWidth: 420 }}>
            <div className="fig-modal-header">
              <span style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Keyboard Shortcuts</span>
              <button onClick={() => setShowShortcuts(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 4 }}><X size={14} /></button>
            </div>
            <div style={{ padding: 16, display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Canvas</p>
                {[['Esc','Deselect'],['Del / ⌫','Delete block'],['⌘ C','Copy'],['⌘ V','Paste'],['⌘ Z','Undo'],['⌘ ⇧ Z','Redo'],['⌘ D','Duplicate']].map(([k,v])=>(
                  <div key={k} className="flex items-center justify-between py-1" style={{ borderBottom: '1px solid #2a2a2a' }}>
                    <span className="kbd">{k}</span>
                    <span style={{ fontSize: 10, color: '#666' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ width: 1, background: '#2a2a2a', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Quick Add</p>
                {[['H','Hero'],['N','Navbar'],['F','Features'],['T','Text'],['I','Image'],['B','CTA'],['P','Pricing'],['S','Stats'],['Q','FAQ'],['M','Team']].map(([k,v])=>(
                  <div key={k} className="flex items-center justify-between py-1" style={{ borderBottom: '1px solid #2a2a2a' }}>
                    <span className="kbd">{k}</span>
                    <span style={{ fontSize: 10, color: '#666' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
