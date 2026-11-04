import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, Copy, Download, ExternalLink, Globe, Loader2, Rocket, Share2, Trash2, X } from 'lucide-react';
import { ProjectState } from '../types';
import { generateHtml, slugify } from '../utils/exportHtml';

interface Props {
  project: ProjectState;
  onClose: () => void;
  onSitePublished: (slug: string | undefined) => void;
  onGalleryPublished: () => void;
  toast: (msg: string, type?: 'ok' | 'err' | 'info') => void;
}

const TOKENS_KEY = 'landy_site_tokens';
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,46}[a-z0-9]$/;
const CATEGORIES = ['SaaS', 'Portfolio', 'Agency', 'E-commerce', 'Crypto', 'Personal', 'General'];
type Status = 'idle' | 'checking' | 'available' | 'taken' | 'owned' | 'invalid' | 'offline';

const readTokens = (): Record<string, string> => { try { return JSON.parse(localStorage.getItem(TOKENS_KEY) || '{}'); } catch { return {}; } };
const label: React.CSSProperties = { display: 'block', marginBottom: 5, fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8c8c96' };

export default function PublishModal({ project, onClose, onSitePublished, onGalleryPublished, toast }: Props) {
  const [tab, setTab] = useState<'site' | 'gallery'>('site');
  const [siteName, setSiteName] = useState(project.name);
  const [slug, setSlug] = useState(project.publishedSlug || slugify(project.name));
  const [touched, setTouched] = useState(!!project.publishedSlug);
  const [status, setStatus] = useState<Status>('idle');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [live, setLive] = useState<string | null>(project.publishedSlug ? `${window.location.origin}/p/${project.publishedSlug}` : null);

  const [gName, setGName] = useState(project.name);
  const [gDesc, setGDesc] = useState('');
  const [gCat, setGCat] = useState('SaaS');
  const [gBusy, setGBusy] = useState(false);
  const [gDone, setGDone] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  /* Debounced availability check */
  useEffect(() => {
    if (!slug) { setStatus('idle'); return; }
    if (!SLUG_RE.test(slug)) { setStatus('invalid'); return; }
    setStatus('checking');
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/sites/${slug}`, { signal: ctl.signal });
        if (r.status === 404) setStatus('available');
        else if (r.ok) setStatus(readTokens()[slug] ? 'owned' : 'taken');
        else setStatus('offline');
      } catch (e) { if ((e as Error).name !== 'AbortError') setStatus('offline'); }
    }, 350);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [slug]);

  const finalName = siteName.trim() || project.name;
  const canPublish = !busy && (status === 'available' || status === 'owned');

  const publish = async () => {
    setBusy(true); setError('');
    try {
      const tokens = readTokens();
      const res = await fetch('/api/sites', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name: finalName, html: generateHtml({ ...project, name: finalName }), token: tokens[slug] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Publishing failed (${res.status}).`);
      if (data.token) { tokens[slug] = data.token; localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens)); }
      setLive(`${window.location.origin}/p/${slug}`);
      setStatus('owned');
      onSitePublished(slug);
      toast('Your site is live', 'ok');
    } catch (e) {
      const msg = (e as Error).message;
      setError(/fetch|network/i.test(msg) ? 'Could not reach the publishing server. You can still download the HTML file below.' : msg);
    } finally { setBusy(false); }
  };

  const unpublish = async () => {
    if (!window.confirm('Take this site offline? The address will become available again.')) return;
    setBusy(true); setError('');
    try {
      const res = await fetch(`/api/sites/${project.publishedSlug || slug}`, { method: 'DELETE', headers: { 'x-edit-token': readTokens()[project.publishedSlug || slug] || '' } });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Could not unpublish.'); }
      const tokens = readTokens(); delete tokens[project.publishedSlug || slug]; localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
      setLive(null); onSitePublished(undefined); setStatus('available'); toast('Site taken offline', 'info');
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };

  const copyLink = async () => {
    if (!live) return;
    try { await navigator.clipboard.writeText(live); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { window.prompt('Copy your link:', live); }
  };
  const download = () => {
    const a = document.createElement('a');
    const url = URL.createObjectURL(new Blob([generateHtml({ ...project, name: finalName })], { type: 'text/html;charset=utf-8' }));
    a.href = url; a.download = `${slugify(finalName) || 'landing-page'}.html`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const publishGallery = async (e: React.FormEvent) => {
    e.preventDefault(); setGBusy(true);
    try {
      const res = await fetch('/api/gallery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ component_name: gName.trim(), description: gDesc.trim(), category: gCat, projectData: { ...project, publishedSlug: undefined } }) });
      if (!res.ok) throw new Error();
      setGDone(true); onGalleryPublished(); setTimeout(onClose, 1600);
    } catch { toast('Could not publish to the gallery. Please try again.', 'err'); } finally { setGBusy(false); }
  };

  const hint: Record<Status, { text: string; colour: string }> = {
    idle: { text: 'Choose an address for your site.', colour: '#7a7a86' },
    checking: { text: 'Checking availability…', colour: '#7a7a86' },
    available: { text: 'This address is available.', colour: '#4ade80' },
    owned: { text: 'This is your site. Publishing will update it.', colour: '#43b7ff' },
    taken: { text: 'That address is already taken.', colour: '#f87171' },
    invalid: { text: 'Use 3–48 lowercase letters, numbers or hyphens.', colour: '#f87171' },
    offline: { text: 'Cannot reach the publishing server.', colour: '#fbbf24' },
  };

  return (
    <div className="fig-modal-backdrop" role="dialog" aria-modal="true" aria-label="Publish" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fig-modal w-full" style={{ maxWidth: 480 }}>
        <div className="fig-modal-header">
          <div className="flex items-center gap-2"><Rocket size={15} style={{ color: '#a07bff' }} /><span style={{ fontSize: 13, fontWeight: 700, color: '#ececf0' }}>Publish</span></div>
          <button className="fig-icon-btn" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>

        <div style={{ padding: '14px 16px 0' }}>
          <div className="seg" style={{ width: '100%' }}>
            <button className={`seg-btn ${tab === 'site' ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => setTab('site')}><Globe size={13} />Live website</button>
            <button className={`seg-btn ${tab === 'gallery' ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => setTab('gallery')}><Share2 size={13} />Community gallery</button>
          </div>
        </div>

        {tab === 'site' ? (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {live && (
              <div style={{ padding: 12, borderRadius: 10, background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.3)' }}>
                <div className="flex items-center gap-2" style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', marginBottom: 8 }}><span className="live-dot" aria-hidden="true" />Your site is live</div>
                <div className="fig-input" style={{ height: 30, display: 'flex', alignItems: 'center', fontFamily: 'ui-monospace, monospace', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{live}</div>
                <div className="flex gap-2" style={{ marginTop: 10 }}>
                  <button className="btn3d" style={{ flex: 1 }} onClick={copyLink}>{copied ? <><Check size={12} />Copied</> : <><Copy size={12} />Copy link</>}</button>
                  <a className="btn3d-brand" style={{ flex: 1, textDecoration: 'none' }} href={live} target="_blank" rel="noopener noreferrer"><ExternalLink size={12} />Open site</a>
                </div>
              </div>
            )}
            <div>
              <label style={label} htmlFor="site-name">Site title</label>
              <input id="site-name" className="fig-input" style={{ height: 32, fontSize: 12 }} value={siteName} maxLength={60} onChange={e => { setSiteName(e.target.value); if (!touched) setSlug(slugify(e.target.value)); }} />
            </div>
            <div>
              <label style={label} htmlFor="site-slug">Web address</label>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 11, color: '#7a7a86', whiteSpace: 'nowrap' }}>{window.location.host}/p/</span>
                <input id="site-slug" className="fig-input" style={{ height: 32, fontSize: 12, fontFamily: 'ui-monospace, monospace' }} value={slug} maxLength={48} spellCheck={false} onChange={e => { setTouched(true); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); }} />
              </div>
              <p role="status" style={{ marginTop: 6, fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, color: hint[status].colour }}>
                {status === 'checking' && <Loader2 size={11} className="animate-spin" />}{hint[status].text}
              </p>
            </div>
            {error && <div role="alert" style={{ display: 'flex', gap: 8, padding: 10, borderRadius: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5', fontSize: 11, lineHeight: 1.5 }}><AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />{error}</div>}
            <div className="flex gap-2">
              <button className="btn3d" style={{ height: 34 }} onClick={download}><Download size={13} />Download HTML</button>
              <button className="btn3d-brand violet" style={{ flex: 1, height: 34 }} disabled={!canPublish} onClick={publish}>
                {busy ? <Loader2 size={13} className="animate-spin" /> : <Rocket size={13} />}{live ? 'Update live site' : 'Publish site'}
              </button>
            </div>
            {live && <button onClick={unpublish} disabled={busy} style={{ alignSelf: 'center', background: 'none', border: 0, color: '#f87171', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><Trash2 size={11} />Take this site offline</button>}
            <p style={{ fontSize: 10, color: '#6a6a74', lineHeight: 1.5 }}>Published pages are served in a sandbox. Anyone with the link can view your site. Changes you make later go live only when you press “Update live site”.</p>
          </div>
        ) : gDone ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(34,197,94,.12)', margin: '0 auto 12px', display: 'grid', placeItems: 'center' }}><Check size={22} style={{ color: '#22c55e' }} /></div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#ececf0' }}>Added to the gallery</p>
          </div>
        ) : (
          <form onSubmit={publishGallery} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 11, color: '#7a7a86', lineHeight: 1.6 }}>Share your layout as a template. Anyone can clone and customise it.</p>
            <div><label style={label} htmlFor="g-name">Template name</label><input id="g-name" required className="fig-input" style={{ height: 32, fontSize: 12 }} value={gName} maxLength={80} onChange={e => setGName(e.target.value)} /></div>
            <div><label style={label} htmlFor="g-desc">Description</label><textarea id="g-desc" required rows={3} className="fig-input" style={{ fontSize: 12, resize: 'none' }} value={gDesc} maxLength={400} placeholder="Who is it for, and what does the design feel like?" onChange={e => setGDesc(e.target.value)} /></div>
            <div><label style={label} htmlFor="g-cat">Category</label><select id="g-cat" className="fig-select" style={{ height: 32, fontSize: 12 }} value={gCat} onChange={e => setGCat(e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div className="flex gap-2" style={{ marginTop: 4 }}>
              <button type="button" className="btn3d" style={{ flex: 1, height: 34 }} onClick={onClose}>Cancel</button>
              <button type="submit" className="btn3d-brand" style={{ flex: 1, height: 34 }} disabled={gBusy}>{gBusy ? <Loader2 size={13} className="animate-spin" /> : null}Share template</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
