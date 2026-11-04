import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { ProjectState, SelectionState } from '../types';

interface Props { project: ProjectState; isSaving: boolean; lastSaved: Date | null; zoom: number; selection: SelectionState; }

const formatSize = (bytes: number) => (bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(2)} MB`);

export default function StatusBar({ project, isSaving, lastSaved, zoom, selection }: Props) {
  const [size, setSize] = useState('0 B');
  useEffect(() => {
    const t = setTimeout(() => setSize(formatSize(new Blob([JSON.stringify(project)]).size)), 400);
    return () => clearTimeout(t);
  }, [project]);

  const selected = selection.blockId ? project.blocks.find(b => b.id === selection.blockId)?.name : selection.elementId ? (project.elements || []).find(e => e.id === selection.elementId)?.name || 'Layer' : null;
  const stat = (label: string, value: string | number) => <span style={{ fontSize: 10 }}><span style={{ color: '#5c5c66' }}>{label} </span><span style={{ color: '#9a9aa6', fontWeight: 600 }}>{value}</span></span>;

  return (
    <div className="flex shrink-0 select-none items-center justify-between px-3" style={{ height: 28, background: 'linear-gradient(180deg,#1c1c20,#16161a)', borderTop: '1px solid #0c0c0f', boxShadow: '0 -1px 0 rgba(255,255,255,.04)', fontSize: 11, color: '#6a6a74' }}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5" role="status" aria-live="polite">
          {isSaving ? <Loader2 size={11} className="animate-spin" style={{ color: '#18a0fb' }} /> : <CheckCircle2 size={11} style={{ color: '#22c55e' }} />}
          <span style={{ fontSize: 10, color: isSaving ? '#43b7ff' : '#7a7a86' }}>
            {isSaving ? 'Saving…' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'All changes saved'}
          </span>
        </div>
        {selected && <><span className="toolbar-sep" style={{ height: 12, margin: 0 }} /><span style={{ fontSize: 10, color: '#9a9aa6' }}>Selected: <b style={{ color: '#d0d0d8' }}>{selected}</b></span></>}
      </div>
      <div className="hidden items-center gap-4 md:flex">
        {stat('Sections', project.blocks.length)}
        {stat('Layers', (project.elements || []).length)}
        {stat('Size', size)}
        {stat('Zoom', `${zoom}%`)}
      </div>
    </div>
  );
}
