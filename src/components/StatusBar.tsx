import React, { useState, useEffect } from 'react';
import { ProjectState } from '../types';
import { HardDrive, CheckCircle2, RefreshCw, Cpu, Database } from 'lucide-react';

interface StatusBarProps {
  project: ProjectState;
  onRenameProject: (newName: string) => void;
  isSaving: boolean;
}

export default function StatusBar({ project, onRenameProject, isSaving }: StatusBarProps) {
  const [nodeCount, setNodeCount] = useState(0);
  const [fileFootprint, setFileFootprint] = useState('0.0 kb');

  useEffect(() => {
    // Dynamically calculate approximate DOM Nodes & HTML footprint size
    const blocksCount = project.blocks.length;
    const approximateNodes = blocksCount * 14 + 10;
    setNodeCount(approximateNodes);

    // Dynamic footprint calculation (in kb) based on blocks complexity
    let sizeBytes = JSON.stringify(project).length;
    let sizeKb = (sizeBytes / 1024).toFixed(2);
    setFileFootprint(`${sizeKb} KB`);
  }, [project]);

  return (
    <div className="h-[36px] min-h-[36px] bg-slate-900 border-t border-slate-800 text-slate-400 flex items-center justify-between px-4 text-[11px] font-sans select-none z-50 relative">
      
      {/* Left Column: Rename inside status bar */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project:</span>
        <input
          type="text"
          value={project.name}
          maxLength={40}
          onChange={(e) => onRenameProject(e.target.value)}
          placeholder="Unnamed Landing Project"
          title="Click to rename project"
          className="bg-transparent hover:bg-slate-800/80 focus:bg-slate-800 border-0 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 px-2 py-0.5 rounded-md font-semibold text-slate-200 text-xs w-48 transition-all truncate"
        />
      </div>

      {/* Middle Column: Auto Save Status Indicator */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 p-1 px-2.5 rounded-full bg-slate-800/40 border border-slate-800 text-xs font-semibold text-slate-300">
          {isSaving ? (
            <>
              <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
              <span className="text-[10px] text-slate-400">Saving project details...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-slate-300">Autosaved to LocalStorage</span>
            </>
          )}
        </div>
      </div>

      {/* Right Column: Performance Specs / DOM stats */}
      <div className="hidden sm:flex items-center gap-5">
        
        {/* Footprint estimation */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span>Footprint: <strong className="text-slate-200 font-mono">{fileFootprint}</strong></span>
        </div>

        {/* DOM node weights */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-slate-500 animate-pulse" />
          <span>DOM Nodes: <strong className="text-slate-200 font-mono">{nodeCount}</strong></span>
        </div>

        {/* Target Frame rate standard marker */}
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1" />
          <span>FPS: <strong className="text-emerald-400">60 FPS</strong></span>
        </div>

      </div>

    </div>
  );
}
