import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const REGISTRY_FILE = path.join(process.cwd(), 'templates_registry.json');
const SITES_DIR = path.join(process.cwd(), 'published_sites');

app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(express.json({ limit: '50mb' }));

/* ════════════════════════════════════════════════════════════
   Community gallery (unchanged behaviour)
   ════════════════════════════════════════════════════════════ */
const loadTemplates = () => {
  try {
    if (fs.existsSync(REGISTRY_FILE)) return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error loading public registry: ', err);
  }
  return [];
};

const saveTemplates = (templates: any[]) => {
  try {
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(templates, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to public registry: ', err);
  }
};

const seedInitialTemplates = () => {
  if (loadTemplates().length > 0) return;
  const now = new Date().toISOString();
  saveTemplates([
    {
      id: 'seed-saas',
      component_name: 'SaaS Launch Pro Template',
      description: 'An elegant minimal modern SaaS template optimized for email capture and a product feature grid.',
      category: 'SaaS',
      createdAt: now,
      projectData: {
        name: 'SaaS Alpha Launch',
        style: { background: '#ffffff', theme: 'minimal_modern', fontFamily: 'Inter, system-ui', uiStyle: 'canva_like_clean_editor', radius: '12px', shadows: 'soft_elevation', spacingSystem: '8px_grid', animationSpeed: '150ms' },
        blocks: [
          { id: 'nav-seed', type: 'navbar', name: 'Navigation', styles: { paddingTop: 16, paddingBottom: 16, bgColor: '#ffffff', textColor: '#0f172a', brandColor: '#2563eb', borderRadius: 'none', shadow: 'soft', align: 'left' }, content: { brandName: 'AlphaCore', links: [{ label: 'Product', url: '#features' }, { label: 'Pricing', url: '#pricing' }], primaryBtnText: 'Start Trial', primaryBtnUrl: '#' } },
          { id: 'hero-seed', type: 'hero_section', name: 'Hero', styles: { paddingTop: 96, paddingBottom: 96, bgColor: '#f8fafc', textColor: '#0f172a', brandColor: '#2563eb', borderRadius: 'xl', shadow: 'none', align: 'center' }, content: { title: 'Unify your workspace. Focus on creation.', subtitle: 'Next-Gen Workspace', description: 'The single workspace for developer teams. Build and share visual documents, manage API variables, and deploy without context switching.', primaryBtnText: 'Get Started Free', primaryBtnUrl: '#', secondaryBtnText: 'Book a Demo', secondaryBtnUrl: '#' } },
          { id: 'cta-seed', type: 'cta_block', name: 'Call to Action', styles: { paddingTop: 48, paddingBottom: 48, bgColor: '#2563eb', textColor: '#ffffff', brandColor: '#ffffff', borderRadius: 'xl', shadow: 'heavy', align: 'center' }, content: { title: 'Ready to modernize your operations?', description: 'Join over 4,000 engineering teams who already migrated their wikis to AlphaCore.', primaryBtnText: 'Get Started Free', primaryBtnUrl: '#' } },
        ],
      },
    },
    {
      id: 'seed-portfolio',
      component_name: 'Neo-Brutalist Creator Portfolio',
      description: 'A striking high-contrast brutalist layout with heavy shadows and bright accents for visual creators.',
      category: 'Portfolio',
      createdAt: now,
      projectData: {
        name: 'Bold Creator Hub',
        style: { background: '#ffffff', theme: 'neo_brutalist', fontFamily: 'Inter, system-ui', uiStyle: 'canva_like_clean_editor', radius: '0px', shadows: 'heavy', spacingSystem: '8px_grid', animationSpeed: '100ms' },
        blocks: [
          { id: 'hero-portfolio', type: 'hero_section', name: 'Hero', styles: { paddingTop: 80, paddingBottom: 80, bgColor: '#fef08a', textColor: '#000000', brandColor: '#000000', borderRadius: 'none', shadow: 'heavy', align: 'left' }, content: { title: 'IMPECCABLE INTERFACES. ABSOLUTE SPEED.', subtitle: 'CREATIVE DESIGN DIRECTOR', description: 'Crafting unapologetic user experiences, motion guides and responsive front-end applications for industry champions.', primaryBtnText: 'VIEW CASE STUDIES', primaryBtnUrl: '#work', secondaryBtnText: 'DISCUSS A PROJECT', secondaryBtnUrl: '#contact' } },
          { id: 'feat-portfolio', type: 'features_grid', name: 'Capabilities', styles: { paddingTop: 64, paddingBottom: 64, bgColor: '#ffffff', textColor: '#000000', brandColor: '#000000', borderRadius: 'none', shadow: 'heavy', align: 'center' }, content: { title: 'CORE FOCUS', description: 'A structural overview of capabilities engineered for visual differentiation.', features: [{ icon: 'Sparkles', title: 'Art Direction', description: 'Cohesive theme engineering, bold typography and colour systems that command attention.' }, { icon: 'Code2', title: 'Technical Execution', description: 'Lean builds, fast loading and clean, maintainable code.' }] } },
        ],
      },
    },
  ]);
};
seedInitialTemplates();

app.get('/api/gallery', (req, res) => {
  const templates = loadTemplates();
  const search = typeof req.query.search === 'string' ? req.query.search.toLowerCase() : '';
  const category = typeof req.query.category === 'string' ? req.query.category : '';
  let filtered = templates;
  if (search) {
    filtered = filtered.filter((t: any) =>
      t.component_name.toLowerCase().includes(search) || t.description.toLowerCase().includes(search) || t.category.toLowerCase().includes(search));
  }
  if (category && category !== 'All') filtered = filtered.filter((t: any) => t.category.toLowerCase() === category.toLowerCase());
  res.json(filtered);
});

app.post('/api/gallery', (req, res) => {
  try {
    const { component_name, description, category, projectData } = req.body;
    if (!component_name || !description || !category || !projectData) {
      return res.status(400).json({ error: 'Missing required fields: component_name, description, category, or projectData.' });
    }
    const templates = loadTemplates();
    const newTemplate = {
      id: 'template-' + Date.now() + Math.random().toString(36).substring(2, 6),
      component_name: String(component_name).slice(0, 80),
      description: String(description).slice(0, 400),
      category, projectData, createdAt: new Date().toISOString(),
    };
    templates.unshift(newTemplate);
    saveTemplates(templates);
    res.status(201).json({ success: true, template: newTemplate });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error while saving template.' });
  }
});

/* ════════════════════════════════════════════════════════════
   Live site publishing
   POST   /api/sites           create or update a site
   GET    /api/sites/:slug     check whether an address is taken
   DELETE /api/sites/:slug     unpublish (needs the edit token)
   GET    /p/:slug             the published page itself
   ════════════════════════════════════════════════════════════ */
fs.mkdirSync(SITES_DIR, { recursive: true });

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,46}[a-z0-9]$/;
const RESERVED = new Set(['api', 'admin', 'assets', 'src', 'static', 'www', 'app', 'p', 'login', 'dashboard']);
const MAX_HTML_BYTES = 5 * 1024 * 1024;

interface SiteRecord { slug: string; name: string; html: string; tokenHash: string; createdAt: string; updatedAt: string; }

const siteFile = (slug: string) => path.join(SITES_DIR, `${slug}.json`);
const hash = (t: string) => crypto.createHash('sha256').update(t).digest('hex');
const readSite = (slug: string): SiteRecord | null => {
  try { return JSON.parse(fs.readFileSync(siteFile(slug), 'utf-8')); } catch { return null; }
};
const writeSite = (rec: SiteRecord) => {
  const tmp = `${siteFile(rec.slug)}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(rec), 'utf-8');
  fs.renameSync(tmp, siteFile(rec.slug));
};
const tokenMatches = (rec: SiteRecord, token: unknown) => {
  if (typeof token !== 'string' || !token) return false;
  const a = Buffer.from(hash(token));
  const b = Buffer.from(rec.tokenHash);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// Small in-memory limiter: 20 write requests per IP per minute.
const hits = new Map<string, { n: number; t: number }>();
const limited = (req: Request, res: Response, next: NextFunction) => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const h = hits.get(key);
  if (!h || now - h.t > 60_000) { hits.set(key, { n: 1, t: now }); return next(); }
  h.n += 1;
  if (h.n > 20) return res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
  next();
};

app.get('/api/sites/:slug', (req, res) => {
  const { slug } = req.params;
  if (!SLUG_RE.test(slug) || RESERVED.has(slug)) return res.status(400).json({ error: 'Invalid address.' });
  const rec = readSite(slug);
  if (!rec) return res.status(404).json({ error: 'Not found.' });
  res.json({ slug, name: rec.name, updatedAt: rec.updatedAt });
});

app.post('/api/sites', limited, (req, res) => {
  try {
    const { slug, name, html, token } = req.body || {};
    if (typeof slug !== 'string' || !SLUG_RE.test(slug) || RESERVED.has(slug)) {
      return res.status(400).json({ error: 'Choose an address of 3–48 characters using lowercase letters, numbers and hyphens.' });
    }
    if (typeof html !== 'string' || !html.trim()) return res.status(400).json({ error: 'There is no page content to publish.' });
    if (Buffer.byteLength(html, 'utf-8') > MAX_HTML_BYTES) return res.status(413).json({ error: 'This page is too large to publish (5 MB limit). Try using smaller images.' });

    const now = new Date().toISOString();
    const existing = readSite(slug);
    if (existing) {
      if (!tokenMatches(existing, token)) return res.status(409).json({ error: 'That address is already taken. Please choose another.' });
      writeSite({ ...existing, name: String(name || existing.name).slice(0, 80), html, updatedAt: now });
      return res.json({ success: true, slug, url: `/p/${slug}`, updatedAt: now });
    }
    const newToken = crypto.randomBytes(24).toString('hex');
    writeSite({ slug, name: String(name || slug).slice(0, 80), html, tokenHash: hash(newToken), createdAt: now, updatedAt: now });
    res.status(201).json({ success: true, slug, url: `/p/${slug}`, token: newToken, updatedAt: now });
  } catch (err: any) {
    console.error('Publish failed:', err);
    res.status(500).json({ error: 'Something went wrong while publishing. Please try again.' });
  }
});

app.delete('/api/sites/:slug', limited, (req, res) => {
  const { slug } = req.params;
  if (!SLUG_RE.test(slug)) return res.status(400).json({ error: 'Invalid address.' });
  const rec = readSite(slug);
  if (!rec) return res.status(404).json({ error: 'Not found.' });
  if (!tokenMatches(rec, req.header('x-edit-token'))) return res.status(403).json({ error: 'You do not have permission to unpublish this site.' });
  try { fs.unlinkSync(siteFile(slug)); } catch { /* already gone */ }
  res.json({ success: true });
});

app.get('/p/:slug', (req, res) => {
  const { slug } = req.params;
  const rec = SLUG_RE.test(slug) ? readSite(slug) : null;
  if (!rec) {
    return res.status(404).type('html').send('<!DOCTYPE html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found</title><body style="font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0;background:#0e0e12;color:#e5e5e5;text-align:center"><div><h1 style="font-size:3rem;margin:0">404</h1><p style="opacity:.7">This page has not been published, or it was taken down.</p></div></body>');
  }
  res.set({
    'Content-Type': 'text/html; charset=utf-8',
    // Sandboxing gives user-published pages an opaque origin, so they can never read the editor's storage.
    'Content-Security-Policy': 'sandbox allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'public, max-age=60',
  });
  res.send(rec.html);
});

/* ════════════════════════════════════════════════════════════
   Frontend
   ════════════════════════════════════════════════════════════ */
async function init() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`[Landy] Server listening on http://0.0.0.0:${PORT}`));
}

init();
