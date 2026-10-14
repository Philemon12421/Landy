import React, { useState, useEffect, useCallback } from 'react';
import { CommunityTemplate, ProjectState } from '../types';
import {
  Search, Globe, Download, Eye, Sparkles, X, CheckCircle,
  RefreshCw, Tag, Clock, LayoutGrid, List, ChevronRight
} from 'lucide-react';

interface PublicGalleryModalProps {
  onClose: () => void;
  onImport: (project: ProjectState) => void;
}

const CATEGORIES = ['All', 'SaaS', 'Portfolio', 'Agency', 'E-commerce', 'Crypto', 'Personal', 'General'];

export default function PublicGalleryModal({ onClose, onImport }: PublicGalleryModalProps) {
  const [templates, setTemplates] = useState<CommunityTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [clonedId, setClonedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<CommunityTemplate | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/gallery?search=${encodeURIComponent(search)}&category=${category}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      const sorted = [...data].sort((a: CommunityTemplate, b: CommunityTemplate) => {
        const da = new Date(a.createdAt || 0).getTime();
        const db = new Date(b.createdAt || 0).getTime();
        return sortBy === 'newest' ? db - da : da - db;
      });
      setTemplates(sorted);
    } catch (err: any) {
      setError(err.message || 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }, [search, category, sortBy]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleClone = (tpl: CommunityTemplate) => {
    onImport(tpl.projectData);
    setClonedId(tpl.id);
    setTimeout(() => { setClonedId(null); onClose(); }, 1200);
  };

  const BlockPill = ({ type }: { type: string }) => (
    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-mono rounded capitalize">
      {type.replace('_', ' ')}
    </span>
  );

  const ThemeColor = ({ color }: { color: string }) => (
    <span className="inline-block w-3 h-3 rounded-full border border-white/20 shadow-sm shrink-0" style={{ backgroundColor: color }} />
  );

  const formatDate = (iso?: string) => {
    if (!iso) return 'Community';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 md:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 animate-scale-in">

        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/15 p-2 rounded-xl border border-blue-400/20">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">Community Gallery</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {loading ? 'Loading…' : `${templates.length} template${templates.length !== 1 ? 's' : ''} available`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-4 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-2.5 shrink-0">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search templates…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category pills */}
            <div className="flex gap-1 overflow-x-auto scrollbar-none">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
                    category === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-[10px] font-bold p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>

            {/* View toggle */}
            <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchTemplates}
              disabled={loading}
              className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden min-h-0">

          {/* Template list / grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />
                <span className="text-xs font-medium">Loading community designs…</span>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-3">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Could not load gallery</p>
                  <p className="text-xs text-slate-400 mt-1">{error}</p>
                </div>
                <button
                  onClick={fetchTemplates}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                >
                  Try again
                </button>
              </div>
            ) : templates.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Sparkles className="w-10 h-10 text-slate-300 mb-3" />
                <h4 className="font-bold text-slate-600 text-sm">No templates found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  {search || category !== 'All'
                    ? 'Try clearing filters or searching for something else.'
                    : 'Be the first to publish a design to the gallery!'}
                </p>
                {(search || category !== 'All') && (
                  <button
                    onClick={() => { setSearch(''); setCategory('All'); }}
                    className="mt-3 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {templates.map(tpl => (
                  <TemplateCard
                    key={tpl.id}
                    tpl={tpl}
                    isSelected={preview?.id === tpl.id}
                    isCloned={clonedId === tpl.id}
                    onSelect={() => setPreview(prev => prev?.id === tpl.id ? null : tpl)}
                    onClone={() => handleClone(tpl)}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map(tpl => (
                  <TemplateListRow
                    key={tpl.id}
                    tpl={tpl}
                    isSelected={preview?.id === tpl.id}
                    isCloned={clonedId === tpl.id}
                    onSelect={() => setPreview(prev => prev?.id === tpl.id ? null : tpl)}
                    onClone={() => handleClone(tpl)}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Preview pane */}
          {preview && (
            <div className="w-72 xl:w-80 border-l border-slate-100 flex flex-col bg-white shrink-0 animate-slide-in-right overflow-y-auto">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">Preview</h4>
                <button onClick={() => setPreview(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 space-y-5 flex-1">
                {/* Meta */}
                <div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[9px] font-black uppercase rounded-full tracking-wider">
                    {preview.category}
                  </span>
                  <h4 className="font-black text-slate-800 text-sm mt-2 leading-snug">{preview.component_name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatDate(preview.createdAt)}
                  </p>
                </div>

                {/* Description */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                  {preview.description}
                </div>

                {/* Color palette */}
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Color Palette</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {[...new Set(preview.projectData?.blocks?.slice(0, 8).map(b => b.styles.bgColor))].map((c, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border border-white shadow-sm ring-1 ring-slate-200" style={{ backgroundColor: c }} title={c} />
                    ))}
                    {[...new Set(preview.projectData?.blocks?.slice(0, 4).map(b => b.styles.brandColor))].map((c, i) => (
                      <div key={`b-${i}`} className="w-6 h-6 rounded-full border border-white shadow-sm ring-1 ring-slate-200" style={{ backgroundColor: c }} title={c} />
                    ))}
                  </div>
                </div>

                {/* Design system */}
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Design System</p>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    {[
                      ['Theme', preview.projectData?.style?.theme?.replace('_', ' ')],
                      ['Font', preview.projectData?.style?.fontFamily?.split(',')[0].replace(/['"]/g, '').trim()],
                      ['Radius', preview.projectData?.style?.radius],
                      ['Shadow', preview.projectData?.style?.shadows?.replace('_', ' ')],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                        <span className="text-slate-400 block">{k}</span>
                        <span className="font-bold text-slate-700 capitalize truncate block">{v || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blocks list */}
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                    Block Stack ({preview.projectData?.blocks?.length || 0})
                  </p>
                  <div className="space-y-1">
                    {(preview.projectData?.blocks || []).map((blk, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] text-slate-600 py-1.5 px-2 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="w-4 h-4 bg-slate-200 text-slate-500 text-[8px] font-black flex items-center justify-center rounded shrink-0">{i + 1}</span>
                        <span className="font-medium capitalize flex-1 truncate">{blk.type.replace(/_/g, ' ')}</span>
                        <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: blk.styles.bgColor }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clone action */}
              <div className="p-4 border-t border-slate-100 shrink-0">
                <button
                  onClick={() => handleClone(preview)}
                  disabled={clonedId !== null}
                  className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md ${
                    clonedId === preview.id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-0.5 hover:shadow-lg'
                  } disabled:opacity-60`}
                >
                  {clonedId === preview.id ? (
                    <><CheckCircle className="w-4 h-4" /> Imported!</>
                  ) : (
                    <><Download className="w-4 h-4" /> Import to Canvas</>
                  )}
                </button>
                <p className="text-[9px] text-slate-400 text-center mt-2 leading-tight">
                  Loads the full design. Your current canvas will be replaced (undoable).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────── */

interface CardProps {
  tpl: CommunityTemplate;
  isSelected: boolean;
  isCloned: boolean;
  onSelect: () => void;
  onClone: () => void;
  formatDate: (s?: string) => string;
}

function TemplateCard({ tpl, isSelected, isCloned, onSelect, onClone, formatDate }: CardProps) {
  // Generate a mini color palette preview from the template blocks
  const colors = [...new Set([
    ...(tpl.projectData?.blocks?.slice(0, 5).map(b => b.styles.bgColor) || []),
    ...(tpl.projectData?.blocks?.slice(0, 3).map(b => b.styles.brandColor) || []),
  ])].slice(0, 5);

  return (
    <div
      onClick={onSelect}
      className={`group relative bg-white border rounded-xl p-4 transition-all duration-200 cursor-pointer flex flex-col gap-3 ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-100 shadow-md'
          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Color strip preview */}
      <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden">
        {colors.map((c, i) => (
          <div key={i} className="flex-1" style={{ backgroundColor: c }} />
        ))}
        {colors.length === 0 && <div className="flex-1 bg-slate-100" />}
      </div>

      {/* Meta */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase rounded tracking-wider ${
            tpl.category === 'SaaS' ? 'bg-indigo-50 text-indigo-600' :
            tpl.category === 'Portfolio' ? 'bg-amber-50 text-amber-600' :
            tpl.category === 'Agency' ? 'bg-emerald-50 text-emerald-600' :
            'bg-slate-100 text-slate-600'
          }`}>
            {tpl.category}
          </span>
          <span className="text-[9px] text-slate-400 shrink-0">{formatDate(tpl.createdAt)}</span>
        </div>
        <h4 className="font-black text-slate-800 text-xs leading-snug group-hover:text-blue-600 transition-colors line-clamp-1">
          {tpl.component_name}
        </h4>
        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {tpl.description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-auto">
        <span className="text-[9px] text-slate-400 font-mono">
          {tpl.projectData?.blocks?.length || 0} blocks
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onSelect(); }}
            className="px-2 py-1 hover:bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 flex items-center gap-1 transition-colors"
          >
            <Eye className="w-3 h-3" /> Details
          </button>
          <button
            onClick={e => { e.stopPropagation(); onClone(); }}
            disabled={isCloned}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all ${
              isCloned
                ? 'bg-emerald-500 text-white'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
            } disabled:opacity-60`}
          >
            {isCloned ? <><CheckCircle className="w-3 h-3" /> Done</> : <><Download className="w-3 h-3" /> Clone</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplateListRow({ tpl, isSelected, isCloned, onSelect, onClone, formatDate }: CardProps) {
  return (
    <div
      onClick={onSelect}
      className={`group flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50/30 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Color dot */}
      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-100">
        <div className="w-full h-full grid grid-cols-2">
          {(tpl.projectData?.blocks?.slice(0, 4).map(b => b.styles.bgColor) || ['#f8fafc','#f1f5f9','#fff','#f8fafc']).slice(0, 4).map((c, i) => (
            <div key={i} style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-black text-xs text-slate-800 group-hover:text-blue-600 transition-colors truncate">{tpl.component_name}</h4>
          <span className={`shrink-0 px-1.5 py-0.5 text-[8px] font-black uppercase rounded tracking-wider ${
            tpl.category === 'SaaS' ? 'bg-indigo-50 text-indigo-600' :
            tpl.category === 'Portfolio' ? 'bg-amber-50 text-amber-600' :
            'bg-slate-100 text-slate-500'
          }`}>{tpl.category}</span>
        </div>
        <p className="text-[10px] text-slate-400 truncate mt-0.5">{tpl.description}</p>
      </div>

      {/* Meta */}
      <div className="hidden sm:flex items-center gap-4 shrink-0 text-[10px] text-slate-400">
        <span className="font-mono">{tpl.projectData?.blocks?.length || 0} blocks</span>
        <span>{formatDate(tpl.createdAt)}</span>
      </div>

      {/* Action */}
      <button
        onClick={e => { e.stopPropagation(); onClone(); }}
        disabled={isCloned}
        className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all ${
          isCloned
            ? 'bg-emerald-500 text-white'
            : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
        } disabled:opacity-60`}
      >
        {isCloned ? <CheckCircle className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{isCloned ? 'Imported' : 'Clone'}</span>
      </button>

      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-slate-500 transition-colors" />
    </div>
  );
}
