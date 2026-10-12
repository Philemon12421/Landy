import React, { useState, useEffect, useCallback } from 'react';
import { ProjectState, Block, StyleConfig, ViewportMode, SelectionState, BlockType } from './types';
import { INITIAL_PROJECT, createBlockByType } from './utils/defaultBlocks';
import TopBar from './components/TopBar';
import CanvasArea from './components/CanvasArea';
import RightPropertiesPanel from './components/RightPropertiesPanel';
import StatusBar from './components/StatusBar';
import PublicGalleryModal from './components/PublicGalleryModal';
import {
  Sparkles, Keyboard, X, Check, Globe, Share2, CheckCircle2, AlertTriangle, Info
} from 'lucide-react';

export default function App() {
  const [project, setProject] = useState<ProjectState>(() => {
    try {
      const saved = localStorage.getItem('landy_canvas_doc');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_PROJECT;
  });

  const [past, setPast] = useState<ProjectState[]>([]);
  const [future, setFuture] = useState<ProjectState[]>([]);
  const [viewport, setViewport] = useState<ViewportMode>('laptop');
  const [zoom, setZoom] = useState<number>(100);
  const [selection, setSelection] = useState<SelectionState>({ blockId: null, elementId: null });
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copiedBlock, setCopiedBlock] = useState<Block | null>(null);
  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);
  const [showPublishOverlay, setShowPublishOverlay] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [pubName, setPubName] = useState('');
  const [pubDesc, setPubDesc] = useState('');
  const [pubCategory, setPubCategory] = useState('SaaS');
  const [publishing, setPublishing] = useState(false);
  const [pubSuccess, setPubSuccess] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);

  interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  useEffect(() => { setHasMounted(true); }, []);

  useEffect(() => {
    if (!hasMounted) return;
    setIsSaving(true);
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('landy_canvas_doc', JSON.stringify(project));
        addToast('Auto-saved', 'success');
      } catch {
        addToast('Failed to save', 'error');
      }
      setIsSaving(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [project, hasMounted, addToast]);

  const updateProject = useCallback((next: ProjectState) => {
    setPast(prev => [...prev.slice(-49), project]);
    setFuture([]);
    setProject(next);
  }, [project]);

  const handleUndo = useCallback(() => {
    if (!past.length) return;
    const prev = past[past.length - 1];
    setFuture(f => [project, ...f]);
    setPast(past.slice(0, -1));
    setProject(prev);
    setSelection({ blockId: null, elementId: null });
  }, [past, project]);

  const handleRedo = useCallback(() => {
    if (!future.length) return;
    const next = future[0];
    setPast(p => [...p, project]);
    setFuture(future.slice(1));
    setProject(next);
    setSelection({ blockId: null, elementId: null });
  }, [future, project]);

  const handleAddBlock = useCallback((type: BlockType) => {
    const id = `${type}-${Date.now()}`;
    const block = createBlockByType(type, id);
    if (project.style.theme === 'neo_brutalist') {
      block.styles.borderRadius = 'none';
      block.styles.shadow = 'heavy';
    } else if (project.style.theme === 'cosmic_dark') {
      block.styles.bgColor = '#0f172a';
      block.styles.textColor = '#f8fafc';
    } else if (project.style.theme === 'glassmorphism') {
      block.styles.borderRadius = 'xl';
    }
    updateProject({ ...project, blocks: [...project.blocks, block] });
    setSelection({ blockId: id, elementId: null });
    setShowMobilePanel(false);
  }, [project, updateProject]);

  const handleUpdateBlock = useCallback((blockId: string, updated: Partial<Block>) => {
    const blocks = project.blocks.map(b => {
      if (b.id !== blockId) return b;
      return { ...b, ...updated, styles: { ...b.styles, ...(updated.styles || {}) }, content: { ...b.content, ...(updated.content || {}) } };
    });
    setPast(prev => [...prev.slice(-49), project]);
    setFuture([]);
    setProject({ ...project, blocks });
  }, [project]);

  const handleDeleteBlock = useCallback((blockId: string) => {
    updateProject({ ...project, blocks: project.blocks.filter(b => b.id !== blockId) });
    addToast('Block deleted', 'info');
  }, [project, updateProject, addToast]);

  const handleDuplicateBlock = useCallback((blockId: string) => {
    const idx = project.blocks.findIndex(b => b.id === blockId);
    if (idx === -1) return;
    const src = project.blocks[idx];
    const clone: Block = { ...JSON.parse(JSON.stringify(src)), id: `${src.type}-${Date.now()}` };
    const next = [...project.blocks];
    next.splice(idx + 1, 0, clone);
    updateProject({ ...project, blocks: next });
    setSelection({ blockId: clone.id, elementId: null });
  }, [project, updateProject]);

  const handleMoveBlock = useCallback((blockId: string, dir: 'up' | 'down') => {
    const idx = project.blocks.findIndex(b => b.id === blockId);
    if (idx === -1 || (dir === 'up' && idx === 0) || (dir === 'down' && idx === project.blocks.length - 1)) return;
    const next = [...project.blocks];
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    updateProject({ ...project, blocks: next });
  }, [project, updateProject]);

  const handleReorderBlocks = useCallback((blocks: Block[]) => {
    updateProject({ ...project, blocks });
  }, [project, updateProject]);

  const handleChangeGlobalStyle = useCallback((newStyle: StyleConfig) => {
    const aligned = project.blocks.map(blk => {
      const b = { ...blk };
      if (newStyle.theme === 'neo_brutalist') b.styles = { ...b.styles, borderRadius: 'none', shadow: 'heavy' };
      else if (newStyle.theme === 'cosmic_dark') b.styles = { ...b.styles, borderRadius: 'xl', bgColor: b.styles.bgColor === '#ffffff' ? '#0f172a' : b.styles.bgColor, textColor: ['#0f172a', '#1e293b'].includes(b.styles.textColor) ? '#f8fafc' : b.styles.textColor };
      else b.styles = { ...b.styles, borderRadius: 'xl' };
      return b;
    });
    updateProject({ ...project, style: newStyle, blocks: aligned });
  }, [project, updateProject]);

  const handleRenameProject = useCallback((name: string) => {
    setProject(prev => ({ ...prev, name }));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT' || (active as HTMLElement).hasAttribute('contenteditable'));
      if (isTyping) return;

      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (e.key === 'Escape') { e.preventDefault(); setSelection({ blockId: null, elementId: null }); return; }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selection.blockId) { e.preventDefault(); handleDeleteBlock(selection.blockId); setSelection({ blockId: null, elementId: null }); return; }
      if (mod && e.key.toLowerCase() === 'c' && selection.blockId) { e.preventDefault(); const b = project.blocks.find(b => b.id === selection.blockId); if (b) { setCopiedBlock(b); addToast('Block copied', 'info'); } return; }
      if (mod && e.key.toLowerCase() === 'v' && copiedBlock) { e.preventDefault(); const clone: Block = { ...JSON.parse(JSON.stringify(copiedBlock)), id: `${copiedBlock.type}-${Date.now()}` }; updateProject({ ...project, blocks: [...project.blocks, clone] }); setSelection({ blockId: clone.id, elementId: null }); return; }
      if (mod && !e.shiftKey && e.key.toLowerCase() === 'z') { e.preventDefault(); handleUndo(); return; }
      if ((mod && e.shiftKey && e.key.toLowerCase() === 'z') || (mod && e.key.toLowerCase() === 'y')) { e.preventDefault(); handleRedo(); return; }
      if (mod && e.key.toLowerCase() === 'd' && selection.blockId) { e.preventDefault(); handleDuplicateBlock(selection.blockId); return; }

      if (!mod && !e.shiftKey && !e.altKey) {
        const map: Record<string, BlockType> = { h: 'hero_section', n: 'navbar', f: 'features_grid', t: 'text_block', i: 'image_block', b: 'cta_block', p: 'pricing_cards', s: 'stats_block' };
        const bt = map[e.key.toLowerCase()];
        if (bt) { e.preventDefault(); handleAddBlock(bt); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, project, copiedBlock, handleUndo, handleRedo, handleDeleteBlock, handleDuplicateBlock, handleAddBlock, updateProject, addToast]);

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubName || !pubDesc) return;
    try {
      setPublishing(true);
      const res = await fetch('/api/gallery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ component_name: pubName, description: pubDesc, category: pubCategory, projectData: project }) });
      if (!res.ok) throw new Error();
      setPubSuccess(true);
      setTimeout(() => { setShowPublishOverlay(false); setPubSuccess(false); setPubName(''); setPubDesc(''); }, 1800);
    } catch {
      addToast('Publish failed', 'error');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <TopBar
        viewport={viewport} setViewport={setViewport} zoom={zoom} setZoom={setZoom}
        canUndo={past.length > 0} canRedo={future.length > 0}
        onUndo={handleUndo} onRedo={handleRedo}
        isPreviewMode={isPreviewMode} setIsPreviewMode={setIsPreviewMode}
        project={project} onPublishClick={() => setShowPublishOverlay(true)}
        onShowShortcuts={() => setShowShortcutsModal(true)}
        onShowGallery={() => setShowGalleryModal(true)}
        onShowMobilePanel={() => setShowMobilePanel(true)}
      />

      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {!isPreviewMode && (
          <>
            <div className="hidden md:flex">
              <RightPropertiesPanel project={project} onChangeStyle={handleChangeGlobalStyle} selection={selection} setSelection={setSelection} onUpdateBlock={handleUpdateBlock} onDeleteBlock={handleDeleteBlock} onDuplicateBlock={handleDuplicateBlock} onMoveBlock={handleMoveBlock} onAddBlock={handleAddBlock} />
            </div>
            {showMobilePanel && (
              <div className="md:hidden fixed inset-0 z-50 flex">
                <div className="bg-black/50 absolute inset-0" onClick={() => setShowMobilePanel(false)} />
                <div className="relative z-10 w-80 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl">
                  <div className="p-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <span className="font-black text-slate-800 text-sm">Builder Panel</span>
                    <button onClick={() => setShowMobilePanel(false)} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <RightPropertiesPanel project={project} onChangeStyle={handleChangeGlobalStyle} selection={selection} setSelection={setSelection} onUpdateBlock={handleUpdateBlock} onDeleteBlock={handleDeleteBlock} onDuplicateBlock={handleDuplicateBlock} onMoveBlock={handleMoveBlock} onAddBlock={handleAddBlock} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <CanvasArea project={project} viewport={viewport} zoom={zoom} selection={selection} setSelection={setSelection} onUpdateBlock={handleUpdateBlock} onDeleteBlock={handleDeleteBlock} onDuplicateBlock={handleDuplicateBlock} onMoveBlock={handleMoveBlock} onReorderBlocks={handleReorderBlocks} isPreviewMode={isPreviewMode} onAddBlock={handleAddBlock} />

        {!isPreviewMode && (
          <div className="absolute bottom-4 right-4 z-40 flex items-center gap-2">
            <button onClick={() => setShowGalleryModal(true)} className="px-3 py-2 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-xl flex items-center gap-2 hover:bg-slate-800 transition-all text-xs font-bold">
              <Globe className="w-3.5 h-3.5 text-blue-400" /><span className="hidden sm:inline">Gallery</span>
            </button>
            <button onClick={() => setShowShortcutsModal(true)} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl shadow-lg transition-colors">
              <Keyboard className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="fixed bottom-10 right-4 z-50 flex flex-col gap-2 max-w-xs pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`p-3 px-4 rounded-xl shadow-2xl border flex items-center gap-3 pointer-events-auto ${t.type === 'error' ? 'bg-rose-950/95 border-rose-800 text-rose-100' : t.type === 'success' ? 'bg-slate-900/95 border-emerald-800/80 text-emerald-100' : 'bg-slate-950/95 border-slate-800 text-slate-100'}`}>
            {t.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : t.type === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" /> : <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            <span className="text-xs font-bold">{t.message}</span>
          </div>
        ))}
      </div>

      <StatusBar project={project} onRenameProject={handleRenameProject} isSaving={isSaving} />

      {showGalleryModal && <PublicGalleryModal onClose={() => setShowGalleryModal(false)} onImport={imported => { setPast(prev => [...prev.slice(-49), project]); setFuture([]); setProject(imported); addToast('Template imported', 'success'); }} />}

      {showPublishOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2"><Share2 className="w-5 h-5 text-blue-400" /><h3 className="font-bold text-sm">Publish to Gallery</h3></div>
              <button onClick={() => setShowPublishOverlay(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"><X className="w-5 h-5" /></button>
            </div>
            {pubSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 mx-auto flex items-center justify-center"><Check className="w-6 h-6" /></div>
                <h4 className="font-black text-slate-800">Published!</h4>
                <p className="text-xs text-slate-400">Your layout is now in the Community Gallery.</p>
              </div>
            ) : (
              <form onSubmit={handlePublishSubmit} className="p-5 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">Share your design with the community — others can clone and customize it freely.</p>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-700">Template Name *</label><input required value={pubName} onChange={e => setPubName(e.target.value)} placeholder="e.g. SaaS Launch Dark" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-700">Description *</label><textarea required rows={3} value={pubDesc} onChange={e => setPubDesc(e.target.value)} placeholder="Describe the design style and use case..." className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-700">Category</label><select value={pubCategory} onChange={e => setPubCategory(e.target.value)} className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none">{['SaaS', 'Portfolio', 'Agency', 'E-commerce', 'Crypto', 'Personal', 'General'].map(c => <option key={c}>{c}</option>)}</select></div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setShowPublishOverlay(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold text-xs">Cancel</button>
                  <button type="submit" disabled={publishing} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5">
                    {publishing ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Publishing...</> : 'Publish Layout'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showShortcutsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2"><Keyboard className="w-5 h-5 text-blue-400" /><h4 className="font-black text-sm">Keyboard Shortcuts</h4></div>
              <button onClick={() => setShowShortcutsModal(false)} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Canvas</span>
                {[['Escape','Deselect'],['Delete / Backspace','Remove block'],['Ctrl/⌘ C','Copy'],['Ctrl/⌘ V','Paste'],['Ctrl/⌘ Z','Undo'],['Ctrl/⌘ Shift Z','Redo'],['Ctrl/⌘ D','Duplicate']].map(([k,v]) => (
                  <div key={k} className="flex justify-between bg-slate-950 px-2.5 py-1.5 rounded-lg"><span className="font-mono text-[10px] text-slate-300">{k}</span><span className="text-[10px] text-slate-500">{v}</span></div>
                ))}
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Quick Add</span>
                {[['H','Hero'],['N','Navbar'],['F','Features'],['T','Text Block'],['I','Image'],['B','CTA'],['P','Pricing'],['S','Stats']].map(([k,v]) => (
                  <div key={k} className="flex justify-between bg-slate-950 px-2.5 py-1.5 rounded-lg"><span className="font-mono text-[10px] text-slate-300">{k}</span><span className="text-[10px] text-slate-500">{v}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
