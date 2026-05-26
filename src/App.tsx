import React, { useState, useEffect, useCallback } from 'react';
import { ProjectState, Block, StyleConfig, ViewportMode, SelectionState, BlockType, CommunityTemplate } from './types';
import { 
  INITIAL_PROJECT, createBlockByType 
} from './utils/defaultBlocks';
import TopBar from './components/TopBar';
import CanvasArea from './components/CanvasArea';
import RightPropertiesPanel from './components/RightPropertiesPanel';
import StatusBar from './components/StatusBar';
import PublicGalleryModal from './components/PublicGalleryModal';
import { 
  Sparkles, Keyboard, HelpCircle, X, Check, Globe, Share2, Info, LayoutList, CheckCircle2, AlertTriangle
} from 'lucide-react';

export default function App() {
  // Master Project State loaded from LocalStorage if possible
  const [project, setProject] = useState<ProjectState>(() => {
    try {
      const saved = localStorage.getItem('landy_canvas_doc');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not restore local project, loading INITIAL_PROJECT');
    }
    return INITIAL_PROJECT;
  });

  // Historical stacks for Infinite Undo/Redo Actions
  const [past, setPast] = useState<ProjectState[]>([]);
  const [future, setFuture] = useState<ProjectState[]>([]);

  // Editor states
  const [viewport, setViewport] = useState<ViewportMode>('laptop');
  const [zoom, setZoom] = useState<number>(100);
  const [selection, setSelection] = useState<SelectionState>({ blockId: null, elementId: null });
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copiedBlock, setCopiedBlock] = useState<Block | null>(null);

  // Modals controllers
  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);
  const [showPublishOverlay, setShowPublishOverlay] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);

  // Timeline publish form fields
  const [pubName, setPubName] = useState('');
  const [pubDesc, setPubDesc] = useState('');
  const [pubCategory, setPubCategory] = useState('SaaS');
  const [publishing, setPublishing] = useState(false);
  const [pubSuccess, setPubSuccess] = useState(false);

  // Notification Toast states
  interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  }, []);

  // Track mounting state
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Auto-save tracker synchronizing state to LocalStorage
  useEffect(() => {
    if (!hasMounted) return;

    setIsSaving(true);
    const timer = setTimeout(() => {
      try {
        const payload = JSON.stringify(project);
        localStorage.setItem('landy_canvas_doc', payload);
        addToast('Document progression autosaved successfully', 'success');
      } catch (err) {
        console.error('Failed to autosave project state to LocalStorage: ', err);
        addToast('LocalStorage quota limit reached. Design could not be saved!', 'error');
      }
      setIsSaving(false);
    }, 900);
    return () => clearTimeout(timer);
  }, [project, hasMounted, addToast]);

  // Push new project change onto Undo stack safely
  const updateProject = useCallback((nextState: ProjectState) => {
    setPast(prev => [...prev.slice(-39), project]); // Limit stack cache depth to top 40 states
    setFuture([]);
    setProject(nextState);
  }, [project]);

  // Undo trigger action
  const handleUndo = useCallback(() => {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    setFuture(f => [project, ...f]);
    setPast(past.slice(0, past.length - 1));
    setProject(prev);
    setSelection({ blockId: null, elementId: null });
  }, [past, project]);

  // Redo trigger action
  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setPast(p => [...p, project]);
    setFuture(future.slice(1));
    setProject(next);
    setSelection({ blockId: null, elementId: null });
  }, [future, project]);

  // Insert block callback
  const handleAddBlock = useCallback((type: BlockType) => {
    const randomId = `${type}-${Date.now()}`;
    const newBlock = createBlockByType(type, randomId);
    
    // Set custom visual styles based on current visual theme
    if (project.style.theme === 'neo_brutalist') {
      newBlock.styles.borderRadius = 'none';
      newBlock.styles.shadow = 'heavy';
      newBlock.styles.bgColor = '#ffffff';
    } else if (project.style.theme === 'cosmic_dark') {
      newBlock.styles.bgColor = '#0f172a';
      newBlock.styles.textColor = '#f8fafc';
    } else if (project.style.theme === 'glassmorphism') {
      newBlock.styles.borderRadius = 'xl';
      newBlock.styles.bgColor = '#ffffff';
    }

    const updatedBlocks = [...project.blocks, newBlock];
    updateProject({ ...project, blocks: updatedBlocks });
    setSelection({ blockId: randomId, elementId: null });
  }, [project, updateProject]);

  // Update Section block parameters
  const handleUpdateBlock = useCallback((blockId: string, updated: Partial<Block>) => {
    const updatedBlocks = project.blocks.map(b => {
      if (b.id !== blockId) return b;
      
      const merged: Block = {
        ...b,
        ...updated,
        styles: { ...b.styles, ...updated.styles },
        content: { ...b.content, ...updated.content }
      };
      return merged;
    });

    // Save states
    setPast(prev => [...prev.slice(-39), project]);
    setFuture([]);
    setProject({ ...project, blocks: updatedBlocks });
  }, [project]);

  // Delete Section block
  const handleDeleteBlock = useCallback((blockId: string) => {
    const filtered = project.blocks.filter(b => b.id !== blockId);
    updateProject({ ...project, blocks: filtered });
  }, [project, updateProject]);

  // Duplicate Section block
  const handleDuplicateBlock = useCallback((blockId: string) => {
    const targetIdx = project.blocks.findIndex(b => b.id === blockId);
    if (targetIdx === -1) return;

    const targetBlock = project.blocks[targetIdx];
    const cloned: Block = {
      ...JSON.parse(JSON.stringify(targetBlock)),
      id: `${targetBlock.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };

    const nextBlocks = [...project.blocks];
    nextBlocks.splice(targetIdx + 1, 0, cloned);
    updateProject({ ...project, blocks: nextBlocks });
    setSelection({ blockId: cloned.id, elementId: null });
  }, [project, updateProject]);

  // Reorder Block position (Up / Down)
  const handleMoveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    const idx = project.blocks.findIndex(b => b.id === blockId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === project.blocks.length - 1) return;

    const nextBlocks = [...project.blocks];
    const temp = nextBlocks[idx];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    nextBlocks[idx] = nextBlocks[swapIdx];
    nextBlocks[swapIdx] = temp;

    updateProject({ ...project, blocks: nextBlocks });
  }, [project, updateProject]);

  // Bulk re-ordering from Drag and drop
  const handleReorderBlocks = useCallback((nextBlocks: Block[]) => {
    updateProject({ ...project, blocks: nextBlocks });
  }, [project, updateProject]);

  // Toggle visual theme
  const handleChangeGlobalStyle = useCallback((newStyle: StyleConfig) => {
    // Realign existing blocks elements to maintain strict visual consistency
    const alignedBlocks = project.blocks.map(blk => {
      const copy = { ...blk };
      if (newStyle.theme === 'neo_brutalist') {
        copy.styles.borderRadius = 'none';
        copy.styles.shadow = 'heavy';
      } else if (newStyle.theme === 'cosmic_dark') {
        copy.styles.borderRadius = 'xl';
        copy.styles.bgColor = blk.styles.bgColor === '#ffffff' ? '#0f172a' : blk.styles.bgColor;
        copy.styles.textColor = blk.styles.textColor === '#0f172a' || blk.styles.textColor === '#1e293b' ? '#f8fafc' : blk.styles.textColor;
      } else {
        copy.styles.borderRadius = 'xl';
      }
      return copy;
    });

    updateProject({
      ...project,
      style: newStyle,
      blocks: alignedBlocks
    });
  }, [project, updateProject]);

  // Rename page target
  const handleRenameProject = useCallback((newName: string) => {
    setProject(prev => ({ ...prev, name: newName }));
  }, []);

  // Keyboard Shortcuts Bindings Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing global shortcut commands if typing inside text containers
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.hasAttribute('contenteditable')
      );
      if (isInputFocused) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;

      // Deselect Element: Escape Key
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelection({ blockId: null, elementId: null });
        return;
      }

      // Delete Element: Backspace or Delete Key
      if ((e.key === 'Delete' || e.key === 'Backspace') && selection.blockId) {
        e.preventDefault();
        handleDeleteBlock(selection.blockId);
        setSelection({ blockId: null, elementId: null });
        return;
      }

      // Copy Component: Ctrl+C / Cmd+C
      if (modifierKey && e.key.toLowerCase() === 'c' && selection.blockId) {
        e.preventDefault();
        const active = project.blocks.find(b => b.id === selection.blockId);
        if (active) {
          setCopiedBlock(active);
        }
        return;
      }

      // Paste Component: Ctrl+V / Cmd+V
      if (modifierKey && e.key.toLowerCase() === 'v' && copiedBlock) {
        e.preventDefault();
        const cloned: Block = {
          ...JSON.parse(JSON.stringify(copiedBlock)),
          id: `${copiedBlock.type}-${Date.now()}`
        };
        const updated = [...project.blocks, cloned];
        updateProject({ ...project, blocks: updated });
        setSelection({ blockId: cloned.id, elementId: null });
        return;
      }

      // Unconditional Undo: Ctrl+Z / Cmd+Z
      if (modifierKey && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Unconditional Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((modifierKey && e.shiftKey && e.key.toLowerCase() === 'z') || (modifierKey && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Duplicate Element: Ctrl+D / Cmd+D
      if (modifierKey && e.key.toLowerCase() === 'd' && selection.blockId) {
        e.preventDefault();
        handleDuplicateBlock(selection.blockId);
        return;
      }

      // Direct Keyboard Inserters: T, R, I, B
      if (!modifierKey && !e.shiftKey && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 't') {
          e.preventDefault();
          handleAddBlock('spacer');
          return;
        }
        if (key === 'r') {
          e.preventDefault();
          handleAddBlock('features_grid');
          return;
        }
        if (key === 'i') {
          e.preventDefault();
          handleAddBlock('image_block');
          return;
        }
        if (key === 'b') {
          e.preventDefault();
          handleAddBlock('cta_block');
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, project, copiedBlock, handleUndo, handleRedo, handleDeleteBlock, handleDuplicateBlock, handleAddBlock, updateProject]);

  // Publish active design configuration payload to community express board API
  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubName || !pubDesc) return;

    try {
      setPublishing(true);
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          component_name: pubName,
          description: pubDesc,
          category: pubCategory,
          projectData: project
        })
      });

      if (!res.ok) throw new Error('Could not publish to Timeline registry');
      
      setPubSuccess(true);
      setTimeout(() => {
        setShowPublishOverlay(false);
        setPubSuccess(false);
        setPubName('');
        setPubDesc('');
        // Immediately fetch the update in timeline gallery modal if user opens it
      }, 1500);
    } catch (err) {
      alert('An error occurred during submission. The server timeline file may be read-only in this playground node.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. Header Control Cockpit */}
      <TopBar 
        viewport={viewport}
        setViewport={setViewport}
        zoom={zoom}
        setZoom={setZoom}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        isPreviewMode={isPreviewMode}
        setIsPreviewMode={setIsPreviewMode}
        project={project}
        onPublishClick={() => setShowPublishOverlay(true)}
      />

      {/* 2. Primary Editor Body */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        
        {/* Left Side Style parameters */}
        {!isPreviewMode && (
          <RightPropertiesPanel 
            project={project}
            onChangeStyle={handleChangeGlobalStyle}
            selection={selection}
            setSelection={setSelection}
            onUpdateBlock={handleUpdateBlock}
            onDeleteBlock={handleDeleteBlock}
            onDuplicateBlock={handleDuplicateBlock}
            onMoveBlock={handleMoveBlock}
            onAddBlock={handleAddBlock}
          />
        )}

        {/* Central interactive grid representation */}
        <CanvasArea 
          project={project}
          viewport={viewport}
          zoom={zoom}
          selection={selection}
          setSelection={setSelection}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
          onDuplicateBlock={handleDuplicateBlock}
          onMoveBlock={handleMoveBlock}
          onReorderBlocks={handleReorderBlocks}
          isPreviewMode={isPreviewMode}
          onAddBlock={handleAddBlock}
        />

        {/* Floating Utilities Hub widgets */}
        <div className="absolute bottom-4 right-4 z-40 flex items-center gap-2">
          
          <button
            onClick={() => setShowGalleryModal(true)}
            title="Browse Public Timeline Designs"
            className="px-3.5 py-2.5 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-xl flex items-center gap-2 hover:bg-slate-800 transition-all text-xs font-bold"
          >
            <Globe className="w-4 h-4 text-blue-400" /> Public Canvas Deck
          </button>

          {!isPreviewMode && (
            <button
              onClick={() => setShowShortcutsModal(true)}
              title="Show Keyboard Hotkeys"
              className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl shadow-lg transition-colors"
            >
              <Keyboard className="w-4.5 h-4.5" />
            </button>
          )}

        </div>

      </div>

      {/* Floating Active Status Toasts Stack */}
      <div className="fixed bottom-14 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`p-3.5 px-4 rounded-xl shadow-2xl border flex items-center gap-3 pointer-events-auto backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-fade-in-up ${
              toast.type === 'error'
                ? 'bg-rose-950/95 border-rose-800/90 text-rose-100 shadow-rose-950/20'
                : toast.type === 'success'
                ? 'bg-slate-900/95 border-emerald-800/80 text-emerald-100 shadow-slate-950/40'
                : 'bg-slate-950/95 border-slate-800 text-slate-100'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
            )}
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-normal">{toast.message}</span>
              <span className="text-[9px] opacity-50 font-semibold font-mono">Just now</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Bottom Status sync Bar */}
      <StatusBar 
        project={project}
        onRenameProject={handleRenameProject}
        isSaving={isSaving}
      />

      {/* MODAL 1: Public Community timeline Gallery */}
      {showGalleryModal && (
        <PublicGalleryModal 
          onClose={() => setShowGalleryModal(false)}
          onImport={(importedProject) => {
            // overlay on top of current canvas
            setPast(prev => [...prev.slice(-39), project]);
            setFuture([]);
            setProject(importedProject);
          }}
        />
      )}

      {/* MODAL 2: Publish Component Dialog */}
      {showPublishOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-scale-in">
            
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm tracking-tight">Publish to Timeline Gallery</h3>
              </div>
              <button onClick={() => setShowPublishOverlay(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {pubSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-800">Published Successfully!</h4>
                <p className="text-xs text-slate-400">Other design editors can now discover and clone your layout instantly from the Timeline Gallery.</p>
              </div>
            ) : (
              <form onSubmit={handlePublishSubmit} className="p-5 space-y-4 text-xs text-slate-600">
                <p className="leading-relaxed">
                  Publishing exports your current layout blocks design system and text nodes directly onto the public timeline. Other builders can customize and adapt it without logs or login.
                </p>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Landing Page Name / Title</label>
                  <input
                    type="text"
                    required
                    value={pubName}
                    onChange={(e) => setPubName(e.target.value)}
                    placeholder="e.g., Ultimate Productivity Workspace Launch"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Developer Description / Tech specs</label>
                  <textarea
                    required
                    rows={3}
                    value={pubDesc}
                    onChange={(e) => setPubDesc(e.target.value)}
                    placeholder="Brief description of who this model layout is built for, visual themes, styling..."
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Component Categories</label>
                  <select
                    value={pubCategory}
                    onChange={(e) => setPubCategory(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none font-semibold"
                  >
                    {['SaaS', 'Portfolio', 'Agency', 'E-commerce', 'Crypto', 'Personal', 'General'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPublishOverlay(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={publishing}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1"
                  >
                    {publishing ? 'Publishing...' : 'Publish Layout'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* MODAL 3: Keyboard Shortcuts Info panel */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in p-5 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-blue-400" />
                <h4 className="font-extrabold text-sm tracking-tight">Interactive Keymaps cheatsheet</h4>
              </div>
              <button onClick={() => setShowShortcutsModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Global Canvas Shortcuts</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-medium font-mono">
                  <div className="flex justify-between bg-slate-950 p-1.5 rounded"><span>Delete / Backs</span><span>Remove Sect</span></div>
                  <div className="flex justify-between bg-slate-950 p-1.5 rounded"><span>Escape</span><span>Deselect</span></div>
                  <div className="flex justify-between bg-[#0e162b] p-1.5 border border-indigo-900/30 rounded"><span>Ctrl + C</span><span>Copy Item</span></div>
                  <div className="flex justify-between bg-[#0e162b] p-1.5 border border-indigo-900/30 rounded"><span>Ctrl + V</span><span>Paste Item</span></div>
                  <div className="flex justify-between bg-slate-950 p-1.5 rounded"><span>Ctrl + Z</span><span>Undo Last</span></div>
                  <div className="flex justify-between bg-slate-950 p-1.5 rounded"><span>Ctrl + Shift+Z</span><span>Redo Last</span></div>
                  <div className="flex justify-between bg-slate-950 p-1.5 rounded"><span>Ctrl + D</span><span>Duplicate</span></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Instant Element Insertion keys</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-medium font-mono">
                  <div className="flex justify-between bg-slate-950 p-1.5 rounded"><span>Key T</span><span>Add Spacer</span></div>
                  <div className="flex justify-between bg-slate-950 p-1.5 rounded"><span>Key R</span><span>Add FeatureGrid</span></div>
                  <div className="flex justify-between bg-slate-950 p-1.5 rounded"><span>Key I</span><span>Add ImageBlock</span></div>
                  <div className="flex justify-between bg-slate-950 p-1.5 rounded"><span>Key B</span><span>Add CTA Block</span></div>
                </div>
              </div>

            </div>

            <div className="text-[10px] text-slate-500 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 leading-normal text-center">
              Global insertions do not fire when editing text boxes to prevent unwanted component additions. Double click any title to change labels!
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
