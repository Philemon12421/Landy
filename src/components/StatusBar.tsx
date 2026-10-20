import React, { useState, useEffect } from 'react';
import { ProjectState } from '../types';
import { CheckCircle2, Loader2, Cpu, Database, Circle } from 'lucide-react';

interface StatusBarProps {
  project: ProjectState;
  onRenameProject: (name: string) => void;
  isSaving: boolean;
}

export default function StatusBar({ project, onRenameProject, isSaving }: StatusBarProps) {
  const [fileSize, setFileSize] = useState('0 KB');
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(project.name);

  useEffect(() => { setDraft(project.name); }, [project.name]);

  useEffect(() => {
    const bytes = JSON.stringify(project).length;
    setFileSize(bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes/1024).toFixed(1)} KB` : `${(bytes/1048576).toFixed(2)} MB`);
  }, [project]);

  const commit = () => {
    const t = draft.trim();
    if (t) onRenameProject(t); else setDraft(project.name);
    setIsEditing(false);
  };

  return (
    <div className="shrink-0 flex items-center justify-between px-3 select-none"
      style={{ height: 28, background: '#1a1a1a', borderTop: '1px solid #2a2a2a', fontSize: 11, color: '#666' }}>

      {/* Left — save status + project name */}
      <div className="flex items-center gap-3">
        {/* Save indicator */}
        <div className="flex items-center gap-1.5">
          {isSaving
            ? <Loader2 size={10} style={{ color: '#18a0fb', animation: 'spin 0.8s linear infinite' }} />
            : <Circle size={8} style={{ color: '#22c55e', fill: '#22c55e' }} />
          }
          <span style={{ fontSize: 10, color: isSaving ? '#18a0fb' : '#555' }}>
            {isSaving ? 'Saving…' : 'Saved'}
          </span>
        </div>

        <span style={{ width: 1, height: 12, background: '#2a2a2a', display: 'inline-block' }} />

        {/* Editable project name */}
        {isEditing ? (
          <input
            autoFocus value={draft} maxLength={48}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(project.name); setIsEditing(false); } }}
            style={{ background: '#2a2a2a', border: '1px solid #18a0fb', borderRadius: 3, color: '#e5e5e5', fontSize: 11, padding: '1px 6px', outline: 'none', width: 160 }}
          />
        ) : (
          <button onClick={() => setIsEditing(true)} title="Click to rename"
            style={{ background: 'none', border: 'none', cursor: 'text', color: '#888', fontSize: 11, padding: '0 4px', borderRadius: 3 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.color = '#ccc'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#888'; }}>
            {project.name || 'Untitled'}
          </button>
        )}
      </div>

      {/* Right — stats */}
      <div className="hidden md:flex items-center gap-4">
        <span style={{ color: '#444', fontSize: 10 }}>
          {project.style.theme.replace(/_/g, ' ')}
        </span>
        <span style={{ width: 1, height: 10, background: '#2a2a2a', display: 'inline-block' }} />
        <span style={{ fontSize: 10 }}>
          <span style={{ color: '#555' }}>blocks </span>
          <span style={{ color: '#888', fontWeight: 600 }}>{project.blocks.length}</span>
        </span>
        <span style={{ fontSize: 10 }}>
          <span style={{ color: '#555' }}>size </span>
          <span style={{ color: '#888', fontWeight: 600 }}>{fileSize}</span>
        </span>
        <span style={{ fontSize: 10 }}>
          <span style={{ color: '#22c55e', fontWeight: 700 }}>● </span>
          <span style={{ color: '#555' }}>60 fps</span>
        </span>
      </div>
    </div>
  );
}
