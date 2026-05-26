import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const REGISTRY_FILE = path.join(process.cwd(), 'templates_registry.json');

app.use(express.json({ limit: '50mb' }));

// Helper to load templates
const loadTemplates = () => {
  try {
    if (fs.existsSync(REGISTRY_FILE)) {
      const data = fs.readFileSync(REGISTRY_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading public registry: ', err);
  }
  return [];
};

// Helper to save templates
const saveTemplates = (templates: any[]) => {
  try {
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(templates, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to public registry: ', err);
  }
};

// Seed initial elegant community templates on server startup if registry is empty
const seedInitialTemplates = () => {
  const current = loadTemplates();
  if (current.length === 0) {
    const seed = [
      {
        id: 'seed-saas',
        component_name: 'SaaS Launch Pro Template',
        description: 'An elegant minimal modern dark-accented SaaS template optimized for email capture and product features grid.',
        category: 'SaaS',
        createdAt: new Date().toISOString(),
        projectData: {
          name: 'SaaS Alpha Launch',
          style: {
            background: '#ffffff',
            theme: 'minimal_modern',
            fontFamily: 'Inter, system-ui',
            uiStyle: 'canva_like_clean_editor',
            radius: '12px',
            shadows: 'soft_elevation',
            spacingSystem: '8px_grid',
            animationSpeed: '150ms'
          },
          blocks: [
            {
              id: 'nav-seed',
              type: 'navbar',
              name: 'Modern Clean Navigation',
              styles: { paddingTop: 16, paddingBottom: 16, bgColor: '#ffffff', textColor: '#0f172a', brandColor: '#2563eb', borderRadius: 'none', shadow: 'soft', align: 'left' },
              content: { brandName: 'AlphaCore', links: [{ label: 'Product', url: '#features' }, { label: 'Pricing Plan', url: '#pricing' }], primaryBtnText: 'Start Trial', primaryBtnUrl: '#' }
            },
            {
              id: 'hero-seed',
              type: 'hero_section',
              name: 'Elegant Headline Hero',
              styles: { paddingTop: 96, paddingBottom: 96, bgColor: '#f8fafc', textColor: '#0f172a', brandColor: '#2563eb', borderRadius: 'xl', shadow: 'none', align: 'center' },
              content: {
                title: 'Unify your workspace. Focus on creation.',
                subtitle: 'Next-Gen Workspace',
                description: 'The single workspace for developer teams. Build and share visual documents, manage local API variables, and deploy code structures seamlessly without terminal context switches.',
                primaryBtnText: 'Get Started Free',
                primaryBtnUrl: '#',
                secondaryBtnText: 'Claim Playground Slot',
                secondaryBtnUrl: '#'
              }
            },
            {
              id: 'cta-seed',
              type: 'cta_block',
              name: 'Minimal Call-to-Action',
              styles: { paddingTop: 48, paddingBottom: 48, bgColor: '#2563eb', textColor: '#ffffff', brandColor: '#ffffff', borderRadius: 'xl', shadow: 'heavy', align: 'center' },
              content: {
                title: 'Ready to modernize your operations?',
                description: 'Join over 4,000+ top engineering teams who already migrated their wikis to AlphaCore.',
                primaryBtnText: 'Get Started Free',
                primaryBtnUrl: '#'
              }
            }
          ]
        }
      },
      {
        id: 'seed-portfolio',
        component_name: 'Neo-Brutalist Creator Portfolio',
        description: 'A striking high-contrast brutalist layout with heavy shadows and bright accents designed for visual creators.',
        category: 'Portfolio',
        createdAt: new Date().toISOString(),
        projectData: {
          name: 'Bold Creator Hub',
          style: {
            background: '#ffffff',
            theme: 'neo_brutalist',
            fontFamily: 'Inter, system-ui',
            uiStyle: 'canva_like_clean_editor',
            radius: '0px',
            shadows: 'heavy',
            spacingSystem: '8px_grid',
            animationSpeed: '100ms'
          },
          blocks: [
            {
              id: 'hero-portfolio',
              type: 'hero_section',
              name: 'Elegant Headline Hero',
              styles: { paddingTop: 80, paddingBottom: 80, bgColor: '#fef08a', textColor: '#000000', brandColor: '#000000', borderRadius: 'none', shadow: 'heavy', align: 'left' },
              content: {
                title: 'IMPECCABLE INTERFACES. ABSOLUTE SPEED.',
                subtitle: 'CREATIVE DESIGN DIRECTOR',
                description: 'Crafting unapologetic user experiences, motion guides, and responsive frontend applications for industry champions.',
                primaryBtnText: 'VIEW CASE STUDIES',
                primaryBtnUrl: '#work',
                secondaryBtnText: 'DISCUSS PROJECT',
                secondaryBtnUrl: '#contact'
              }
            },
            {
              id: 'feat-portfolio',
              type: 'features_grid',
              name: 'Multi-Column Feature Grid',
              styles: { paddingTop: 64, paddingBottom: 64, bgColor: '#ffffff', textColor: '#000000', brandColor: '#000000', borderRadius: 'none', shadow: 'heavy', align: 'center' },
              content: {
                title: 'CORE OPERATIONAL FOCUS',
                description: 'A structural overview of capabilities engineered to drive visual differentiation.',
                features: [
                  { icon: 'Sparkles', title: 'Art Direction', description: 'Cohesive theme engineering, bold typographies, and color systems designed to command intense visual focus.' },
                  { icon: 'Code2', title: 'Technical Execution', description: 'Next-level state optimization, zero-dependency builds, and lightning-fast loading speeds.' }
                ]
              }
            }
          ]
        }
      }
    ];
    saveTemplates(seed);
  }
};

seedInitialTemplates();

// API: Get all public templates
app.get('/api/gallery', (req, res) => {
  const templates = loadTemplates();
  // Support simple searching/filtering by name, category, description
  const search = typeof req.query.search === 'string' ? req.query.search.toLowerCase() : '';
  const category = typeof req.query.category === 'string' ? req.query.category : '';

  let filtered = templates;
  if (search) {
    filtered = filtered.filter(t => 
      t.component_name.toLowerCase().includes(search) || 
      t.description.toLowerCase().includes(search) || 
      t.category.toLowerCase().includes(search)
    );
  }
  if (category && category !== 'All') {
    filtered = filtered.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }

  res.json(filtered);
});

// API: Publish a new component template
app.post('/api/gallery', (req, res) => {
  try {
    const { component_name, description, category, projectData } = req.body;

    if (!component_name || !description || !category || !projectData) {
      return res.status(400).json({ error: 'Missing required fields: component_name, description, category, or projectData.' });
    }

    const templates = loadTemplates();

    const newTemplate = {
      id: 'template-' + Date.now() + Math.random().toString(36).substring(2, 6),
      component_name,
      description,
      category,
      projectData,
      createdAt: new Date().toISOString()
    };

    templates.unshift(newTemplate); // add to top
    saveTemplates(templates);

    res.status(201).json({ success: true, template: newTemplate });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error while saving template.' });
  }
});

// Configure Vite middleware or static files based on environment
async function init() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static compiled assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Landy FullStack] Server listening on http://0.0.0.0:${PORT}`);
  });
}

init();
