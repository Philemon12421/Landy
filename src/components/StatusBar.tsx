import React, { useState, useEffect } from 'react';
import { ProjectState } from '../types';
import { HardDrive, CheckCircle2, Loader2, Cpu, Database, Activity, RefreshCw } from 'lucide-react';

interface StatusBarProps {
  project: ProjectState;
  onRenameProject: (name: string) => void;
  isSaving: boolean;
}

export default function StatusBar({ project, onRenameProject, isSaving }: StatusBarProps) {
  const [nodeCount, setNodeCount] = useState(0);
  const [fileSize, setFileSize] = useState('0.0 KB');
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(project.name);
  const [fpsDisplay] = useState('60');

  useEffect(() => {
    setDraftName(project.name);
  }, [project.name]);

  useEffect(() => {
    const count = project.blocks.length * 14 + 10;
    setNodeCount(count);
    const bytes = JSON.stringify(project).length;
    const kb = bytes / 1024;
    setFileSize(kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(2)} MB`);
  }, [project]);

  const handleNameCommit = () => {
    const trimmed = draftName.trim();
    if (trimmed) onRenameProject(trimmed);
    else setDraftName(project.name);
    setIsEditingName(false);
  };

  return (
    <div className="h-9 min-h-[2.25rem] bg-slate-900 border-t border-slate-800 text-slate-400 flex items-center justify-between px-3 md:px-4 text-[11px] font-sans select-none z-50 relative shrink-0">

      {/* Left — project name */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest hidden sm:block shrink-0">Project</span>
        {isEditingName ? (
          <input
            autoFocus
            value={draftName}
            maxLength={48}
            onChange={e => setDraftName(e.target.value)}
            onBlur={handleNameCommit}
            onKeyDown={e => {
              if (e.key === 'Enter') handleNameCommit();
              if (e.key === 'Escape') { setDraftName(project.name); setIsEditingName(false); }
            }}
            className="bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:outline-none px-2 py-0.5 rounded-md font-semibold text-slate-200 text-xs w-40 transition-all"
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            title="Click to rename"
            className="font-semibold text-slate-300 hover:text-white text-xs truncate max-w-[120px] sm:max-w-[200px] hover:bg-slate-800 px-2 py-0.5 rounded-md transition-colors text-left"
          >
            {project.name || 'Untitled'}
          </button>
        )}
      </div>

      {/* Center — save status */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50">
        {isSaving ? (
          <>
            <Loader2 className="w-3 h-3 text-indigo-400 animate-spin shrink-0" />
            <span className="text-[10px] text-slate-400 hidden sm:block">Saving…</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="text-[10px] text-slate-400 hidden sm:block">Saved locally</span>
          </>
        )}
      </div>

      {/* Right — stats */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Database className="w-3 h-3 text-slate-600" />
          <span className="text-[10px]">
            <span className="text-slate-400 font-semibold">{fileSize}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <Cpu className="w-3 h-3 text-slate-600" />
          <span className="text-[10px]">
            <span className="text-slate-400 font-semibold">{project.blocks.length}</span>
            <span className="text-slate-600 ml-1">blocks</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[10px] text-slate-500">
            <span className="text-emerald-400 font-bold">{fpsDisplay}</span>
            <span className="text-slate-600 ml-1">fps</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-600 border-l border-slate-800 pl-4">
          <span className="capitalize">{project.style.theme.replace('_', ' ')}</span>
        </div>
      </div>
    </div>
  );
}
