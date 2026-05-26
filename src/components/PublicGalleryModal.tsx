import React, { useState, useEffect } from 'react';
import { CommunityTemplate, ProjectState } from '../types';
import { Search, Globe, ChevronRight, Download, Eye, Sparkles, X, PlusCircle, CheckCircle } from 'lucide-react';

interface PublicGalleryModalProps {
  onClose: () => void;
  onImport: (project: ProjectState) => void;
}

export default function PublicGalleryModal({ onClose, onImport }: PublicGalleryModalProps) {
  const [templates, setTemplates] = useState<CommunityTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [clonedId, setClonedId] = useState<string | null>(null);

  // For previewing a templates' composition in a mini-view
  const [previewTemplate, setPreviewTemplate] = useState<CommunityTemplate | null>(null);

  const categories = ['All', 'SaaS', 'Portfolio', 'Agency', 'E-commerce', 'Crypto', 'Personal', 'General'];

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/gallery?search=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`);
      if (!res.ok) throw new Error('Could not load public templates');
      const data = await res.json();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || 'Unknown network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [searchQuery, selectedCategory]);

  const handleClone = (template: CommunityTemplate) => {
    onImport(template.projectData);
    setClonedId(template.id);
    setTimeout(() => {
      setClonedId(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" id="public-gallery-modal">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-400/20">
              <Globe className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg tracking-tight">Landy Community Gallery</h3>
              <p className="text-xs text-slate-400">Discover, preview and clone high-converting landing designs built by creators</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search, Filter, Content Body Grid */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main List Column */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50 border-r border-slate-100">
            {/* Filter timeline */}
            <div className="p-4 bg-white border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter components, design stacks, keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              {/* Category picker */}
              <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

            </div>

            {/* Gallery Timeline list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />
                  <span className="text-sm font-medium">Synchronizing community deck...</span>
                </div>
              ) : error ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <p className="text-red-500 font-medium mb-1">Failed to connect to JSON Registry</p>
                  <p className="text-sm text-slate-400">{error}</p>
                  <button onClick={fetchTemplates} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
                    Retry Connection
                  </button>
                </div>
              ) : templates.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl border border-dashed border-slate-200">
                  <Sparkles className="w-10 h-10 text-slate-300 mb-2" />
                  <h4 className="font-semibold text-slate-700">No template matches</h4>
                  <p className="text-sm text-slate-400 max-w-sm mt-1">Be the very first to publish a custom landing stack to this public timeline gallery!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((tpl) => (
                    <div 
                      key={tpl.id}
                      onClick={() => setPreviewTemplate(tpl)}
                      className={`group relative bg-white border rounded-xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        previewTemplate?.id === tpl.id 
                          ? 'border-blue-500 ring-2 ring-blue-100 shadow-md'
                          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-semibold text-slate-600 uppercase rounded-md tracking-wider">
                            {tpl.category}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {tpl.createdAt ? new Date(tpl.createdAt).toLocaleDateString() : 'Community'}
                          </span>
                        </div>

                        <h4 className="font-semibold text-slate-800 text-sm tracking-tight group-hover:text-blue-600 transition-colors">
                          {tpl.component_name}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 min-h-[2rem]">
                          {tpl.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                        <div className="text-[10px] text-slate-400 font-mono">
                          {tpl.projectData?.blocks?.length || 0} layout blocks
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewTemplate(tpl);
                            }}
                            className="p-1 px-2 hover:bg-slate-100 rounded-md text-[11px] font-medium text-slate-600 flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClone(tpl);
                            }}
                            disabled={clonedId !== null}
                            className={`p-1 px-2.5 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                              clonedId === tpl.id
                                ? 'bg-emerald-500 text-white'
                                : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                            }`}
                          >
                            {clonedId === tpl.id ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 text-white" /> Cloned
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5" /> Clone
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Preview Pane Details Column */}
          <div className="w-80 border-l border-slate-100 flex flex-col bg-white">
            {previewTemplate ? (
              <div className="p-5 flex-1 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <div className="mb-2">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase rounded-full tracking-wider">
                      {previewTemplate.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 text-base leading-tight">
                      {previewTemplate.component_name}
                    </h4>
                    <span className="text-xs text-slate-400 block mt-1">
                      Published anonymously
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-600 border border-slate-100">
                    <span className="font-semibold text-slate-700 block mb-1">Developer Specs:</span>
                    {previewTemplate.description}
                  </div>

                  {/* Block layout stacks detail */}
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider mb-2">
                      Structured Content Blocks
                    </span>
                    <div className="space-y-1.5">
                      {previewTemplate.projectData?.blocks?.map((blk, idx) => (
                        <div key={blk.id || idx} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-100 p-2 rounded-lg">
                          <span className="w-4 h-4 bg-slate-200 font-mono text-[9px] font-bold text-slate-500 flex items-center justify-center rounded">
                            {idx + 1}
                          </span>
                          <span className="font-medium capitalize">{blk.type.replace('_', ' ')}</span>
                          <span className="text-[10px] text-slate-400 font-mono ml-auto">{blk.styles?.bgColor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 bg-slate-50/50 p-2.5 rounded-lg border border-slate-200/50 text-xs">
                    <span className="text-slate-500 font-medium">Design System:</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 mt-1">
                      <div>Theme: <span className="font-semibold font-mono">{previewTemplate.projectData?.style?.theme}</span></div>
                      <div>Fonts: <span className="font-semibold font-mono">{previewTemplate.projectData?.style?.fontFamily.split(',')[0]}</span></div>
                      <div>Radius: <span className="font-semibold font-mono">{previewTemplate.projectData?.style?.radius}</span></div>
                      <div>Shadow: <span className="font-semibold font-mono">{previewTemplate.projectData?.style?.shadows}</span></div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-6 md:mt-0">
                  <button
                    onClick={() => handleClone(previewTemplate)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Import and Overlay Canvas
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2 leading-tight">
                    This will load the design composition, allowing editable adjustments to colors and sections.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 flex-1 flex flex-col items-center justify-center text-center text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                  <Globe className="w-5 h-5 text-slate-300" />
                </div>
                <h5 className="font-semibold text-slate-700 text-xs">No Template Selected</h5>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[15rem]">
                  Select a template card from the timeline to see section layouts, colors, and blocks.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
