import React, { useState, useEffect, useCallback } from 'react';
import { CommunityTemplate, ProjectState } from '../types';
import { Search, Globe, Download, X, CheckCircle, RefreshCw, LayoutGrid, List, ChevronDown } from 'lucide-react';

interface Props { onClose: () => void; onImport: (p: ProjectState) => void; }

const CATS = ['All','SaaS','Portfolio','Agency','E-commerce','Crypto','Personal','General'];

export default function PublicGalleryModal({ onClose, onImport }: Props) {
  const [templates, setTemplates] = useState<CommunityTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState<'newest'|'oldest'>('newest');
  const [view, setView] = useState<'grid'|'list'>('grid');
  const [preview, setPreview] = useState<CommunityTemplate|null>(null);
  const [clonedId, setClonedId] = useState<string|null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(`/api/gallery?search=${encodeURIComponent(search)}&category=${cat}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setTemplates([...data].sort((a: CommunityTemplate, b: CommunityTemplate) => {
        const da = new Date(a.createdAt||0).getTime(), db = new Date(b.createdAt||0).getTime();
        return sort === 'newest' ? db - da : da - db;
      }));
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [search, cat, sort]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);

  const clone = (tpl: CommunityTemplate) => {
    onImport(tpl.projectData); setClonedId(tpl.id);
    setTimeout(() => { setClonedId(null); onClose(); }, 1200);
  };

  const fmt = (iso?: string) => iso ? new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—';

  /* Color strip from blocks */
  const strip = (tpl: CommunityTemplate) => [...new Set((tpl.projectData?.blocks||[]).slice(0,6).map(b=>b.styles.bgColor))].slice(0,5);

  return (
    <div className="fig-modal-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="fig-modal flex flex-col w-full animate-scale-in" style={{maxWidth:960,height:'85vh'}}>

        {/* Header */}
        <div className="fig-modal-header shrink-0">
          <div className="flex items-center gap-2.5">
            <Globe size={15} style={{color:'#18a0fb'}} />
            <span style={{fontSize:13,fontWeight:700,color:'#e5e5e5'}}>Community Gallery</span>
            <span style={{fontSize:10,padding:'2px 6px',borderRadius:3,background:'#3a3a3a',color:'#888'}}>
              {loading ? '…' : `${templates.length} templates`}
            </span>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#666',cursor:'pointer',padding:4}}><X size={14}/></button>
        </div>

        {/* Filter bar */}
        <div className="shrink-0 flex items-center gap-2 px-3 py-2 flex-wrap" style={{borderBottom:'1px solid #3a3a3a',background:'#252525'}}>
          <div style={{position:'relative',flex:'1 1 160px',minWidth:0}}>
            <Search size={11} style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',color:'#555'}} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" className="fig-input w-full" style={{paddingLeft:24,height:28,fontSize:11}} />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {CATS.map(c=>(
              <button key={c} onClick={()=>setCat(c)} style={{padding:'3px 8px',borderRadius:4,border:'1px solid',borderColor:cat===c?'#18a0fb':'#3a3a3a',background:cat===c?'#18a0fb22':'transparent',color:cat===c?'#18a0fb':'#888',fontSize:10,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap',transition:'all .1s'}}>{c}</button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {/* sort */}
            <div style={{position:'relative'}}>
              <select value={sort} onChange={e=>setSort(e.target.value as any)} className="fig-select" style={{height:28,fontSize:10,paddingRight:20}}>
                <option value="newest">Newest</option><option value="oldest">Oldest</option>
              </select>
              <ChevronDown size={9} style={{position:'absolute',right:5,top:'50%',transform:'translateY(-50%)',color:'#666',pointerEvents:'none'}} />
            </div>
            {/* view toggle */}
            <div className="flex" style={{background:'#3a3a3a',borderRadius:4,padding:2,gap:2}}>
              {([['grid',<LayoutGrid size={11}/>],['list',<List size={11}/>]] as const).map(([v,ico])=>(
                <button key={v} onClick={()=>setView(v)} style={{padding:'3px 5px',borderRadius:3,border:'none',background:view===v?'#555':'transparent',color:view===v?'#e5e5e5':'#888',cursor:'pointer',display:'flex',alignItems:'center'}}>{ico}</button>
              ))}
            </div>
            <button onClick={load} disabled={loading} style={{padding:5,borderRadius:4,background:'#3a3a3a',border:'none',color:'#888',cursor:'pointer'}}>
              <RefreshCw size={11} style={{animation:loading?'spin 0.8s linear infinite':undefined}} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* List / grid */}
          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:12,color:'#555'}}>
                <div style={{width:28,height:28,border:'2px solid #3a3a3a',borderTopColor:'#18a0fb',borderRadius:'50%',animation:'spin 0.8s linear infinite'}} />
                <span style={{fontSize:11}}>Loading gallery…</span>
              </div>
            ) : error ? (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:8,color:'#555',textAlign:'center'}}>
                <X size={24} style={{opacity:.3}} />
                <p style={{fontSize:12,fontWeight:600,color:'#888'}}>Failed to load</p>
                <p style={{fontSize:11,color:'#555'}}>{error}</p>
                <button onClick={load} className="fig-btn-primary" style={{marginTop:8,fontSize:11}}>Retry</button>
              </div>
            ) : templates.length === 0 ? (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:8,color:'#555',textAlign:'center'}}>
                <Globe size={28} style={{opacity:.2}} />
                <p style={{fontSize:12,fontWeight:600,color:'#888'}}>No templates found</p>
                {(search||cat!=='All')&&<button onClick={()=>{setSearch('');setCat('All');}} className="fig-btn-secondary" style={{fontSize:11,marginTop:4}}>Clear filters</button>}
              </div>
            ) : view === 'grid' ? (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:8}}>
                {templates.map(tpl=>(
                  <button key={tpl.id} onClick={()=>setPreview(p=>p?.id===tpl.id?null:tpl)}
                    style={{background:preview?.id===tpl.id?'#18a0fb0d':'#333',border:'1px solid',borderColor:preview?.id===tpl.id?'#18a0fb':'#3a3a3a',borderRadius:6,padding:12,cursor:'pointer',textAlign:'left',transition:'all .12s'}}>
                    {/* color strip */}
                    <div style={{display:'flex',gap:2,height:3,borderRadius:2,overflow:'hidden',marginBottom:8}}>
                      {strip(tpl).map((c,i)=><div key={i} style={{flex:1,background:c}} />)}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:4,marginBottom:4}}>
                      <span style={{fontSize:8,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',padding:'1px 5px',borderRadius:3,background:'#18a0fb22',color:'#18a0fb'}}>{tpl.category}</span>
                      <span style={{fontSize:9,color:'#555',marginLeft:'auto'}}>{fmt(tpl.createdAt)}</span>
                    </div>
                    <p style={{fontSize:11,fontWeight:700,color:'#ccc',marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tpl.component_name}</p>
                    <p style={{fontSize:10,color:'#666',lineHeight:1.4,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{tpl.description}</p>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:8,paddingTop:6,borderTop:'1px solid #3a3a3a'}}>
                      <span style={{fontSize:9,color:'#555',fontFamily:'monospace'}}>{tpl.projectData?.blocks?.length||0} blocks</span>
                      <button onClick={e=>{e.stopPropagation();clone(tpl);}} disabled={clonedId!==null}
                        style={{padding:'3px 8px',borderRadius:4,background:clonedId===tpl.id?'#14532d':'#18a0fb22',color:clonedId===tpl.id?'#4ade80':'#18a0fb',border:'1px solid',borderColor:clonedId===tpl.id?'#166534':'#18a0fb44',fontSize:10,fontWeight:700,cursor:'pointer'}}>
                        {clonedId===tpl.id?'✓ Done':'Clone'}
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:4}}>
                {templates.map(tpl=>(
                  <div key={tpl.id} onClick={()=>setPreview(p=>p?.id===tpl.id?null:tpl)}
                    style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:preview?.id===tpl.id?'#18a0fb0d':'#333',border:'1px solid',borderColor:preview?.id===tpl.id?'#18a0fb':'#3a3a3a',borderRadius:6,cursor:'pointer',transition:'all .12s'}}>
                    {/* mini palette */}
                    <div style={{width:28,height:28,borderRadius:4,overflow:'hidden',display:'grid',gridTemplateColumns:'1fr 1fr',flexShrink:0}}>
                      {strip(tpl).slice(0,4).map((c,i)=><div key={i} style={{background:c}} />)}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <span style={{fontSize:11,fontWeight:700,color:'#ccc',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tpl.component_name}</span>
                        <span style={{fontSize:8,fontWeight:700,textTransform:'uppercase',padding:'1px 4px',borderRadius:3,background:'#18a0fb22',color:'#18a0fb',flexShrink:0}}>{tpl.category}</span>
                      </div>
                      <p style={{fontSize:10,color:'#666',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginTop:2}}>{tpl.description}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-4" style={{color:'#555',fontSize:10,flexShrink:0}}>
                      <span style={{fontFamily:'monospace'}}>{tpl.projectData?.blocks?.length||0} blocks</span>
                      <span>{fmt(tpl.createdAt)}</span>
                    </div>
                    <button onClick={e=>{e.stopPropagation();clone(tpl);}} disabled={clonedId!==null}
                      style={{padding:'4px 10px',borderRadius:4,background:clonedId===tpl.id?'#14532d':'#18a0fb',color:'#fff',border:'none',fontSize:10,fontWeight:700,cursor:'pointer',flexShrink:0}}>
                      {clonedId===tpl.id?'✓':'Clone'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview pane */}
          {preview && (
            <div className="flex flex-col shrink-0 animate-slide-left overflow-y-auto" style={{width:220,background:'#252525',borderLeft:'1px solid #3a3a3a'}}>
              <div className="flex items-center justify-between px-3 py-2 shrink-0" style={{borderBottom:'1px solid #3a3a3a'}}>
                <span style={{fontSize:11,fontWeight:700,color:'#aaa'}}>Details</span>
                <button onClick={()=>setPreview(null)} style={{background:'none',border:'none',color:'#666',cursor:'pointer',padding:2}}><X size={12}/></button>
              </div>
              <div style={{padding:12,flex:1}}>
                <span style={{fontSize:8,fontWeight:800,textTransform:'uppercase',letterSpacing:'.08em',padding:'2px 6px',borderRadius:3,background:'#18a0fb22',color:'#18a0fb',display:'inline-block',marginBottom:8}}>{preview.category}</span>
                <p style={{fontSize:12,fontWeight:800,color:'#e5e5e5',lineHeight:1.3,marginBottom:4}}>{preview.component_name}</p>
                <p style={{fontSize:10,color:'#666',lineHeight:1.5,marginBottom:12}}>{preview.description}</p>

                {/* palette */}
                <p style={{fontSize:9,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Colors</p>
                <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:12}}>
                  {[...new Set([...(preview.projectData?.blocks?.slice(0,6).map(b=>b.styles.bgColor)||[]),(preview.projectData?.blocks?.slice(0,4).map(b=>b.styles.brandColor)||[])])].slice(0,10).map((c,i)=>(
                    <div key={i} style={{width:16,height:16,borderRadius:3,background:c,border:'1px solid rgba(255,255,255,.1)'}} title={c} />
                  ))}
                </div>

                {/* design tokens */}
                <p style={{fontSize:9,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Design System</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4,marginBottom:12}}>
                  {[['Theme',preview.projectData?.style?.theme?.replace(/_/g,' ')],['Font',preview.projectData?.style?.fontFamily?.split(',')[0].replace(/['"]/g,'').trim()],['Radius',preview.projectData?.style?.radius],['Shadow',preview.projectData?.style?.shadows?.replace(/_/g,' ')]].map(([k,v])=>(
                    <div key={k} style={{background:'#2c2c2c',border:'1px solid #3a3a3a',borderRadius:4,padding:'5px 7px'}}>
                      <span style={{fontSize:9,color:'#555',display:'block'}}>{k}</span>
                      <span style={{fontSize:10,fontWeight:600,color:'#aaa',display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v||'—'}</span>
                    </div>
                  ))}
                </div>

                {/* block list */}
                <p style={{fontSize:9,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Blocks ({preview.projectData?.blocks?.length||0})</p>
                <div style={{display:'flex',flexDirection:'column',gap:2}}>
                  {(preview.projectData?.blocks||[]).map((blk,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:6,padding:'3px 6px',background:'#2c2c2c',borderRadius:3}}>
                      <span style={{fontSize:9,color:'#555',fontFamily:'monospace',width:12,flexShrink:0}}>{i+1}</span>
                      <div style={{width:8,height:8,borderRadius:2,background:blk.styles.bgColor,flexShrink:0,border:'1px solid rgba(255,255,255,.1)'}} />
                      <span style={{fontSize:10,color:'#888',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textTransform:'capitalize'}}>{blk.type.replace(/_/g,' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{padding:12,borderTop:'1px solid #3a3a3a',flexShrink:0}}>
                <button onClick={()=>clone(preview)} disabled={clonedId!==null}
                  className="fig-btn-primary w-full flex items-center justify-center gap-2" style={{fontSize:11}}>
                  {clonedId===preview.id?<><CheckCircle size={12}/>Imported!</>:<><Download size={12}/>Import to Canvas</>}
                </button>
                <p style={{fontSize:9,color:'#555',textAlign:'center',marginTop:6,lineHeight:1.4}}>Replaces canvas (undoable)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
