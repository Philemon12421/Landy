<div align="center">
<img src="https://readme-typing-svg.demolab.com?font=Inter&size=22&pause=1000&color=6366F1&center=true&vCenter=true&width=600&lines=Drag.+Drop.+Ship.;Build+landing+pages+visually;No+code+required+%E2%80%94+ever." alt="Typing SVG" />

<br/>

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-black?style=for-the-badge)

</div>

---

## ✨ What is Landy?

**Landy** is a visual, drag-and-drop landing page builder. Add sections, edit content inline, restyle everything from a live properties panel, preview across devices, and export clean **HTML + Tailwind** or a **React/TypeScript** component — no code editor required.

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:6366F1,100:8B5CF6&height=3&width=800" />
</div>

## 🚀 Features

| | |
|---|---|
| 🧩 **17+ block types** | Navbar, Hero, Stats, Features, Testimonials, Pricing, FAQ, Team, Contact Form, Video, and more |
| 🎨 **4 built-in themes** | Minimal Modern, Frosted Glass, Neo-Brutalist, Cosmic Dark |
| 🖱️ **Live canvas editing** | Click-to-edit text, drag-to-reorder, floating block toolbar, real-time dimension overlay |
| 📱 **Responsive preview** | Desktop, laptop, tablet, and mobile viewports with zoom control |
| 🖼️ **Built-in stock photos** | Curated Unsplash categories, plus direct upload or URL |
| 🎬 **Smart video embeds** | Paste a YouTube / Vimeo / Loom link — auto-converts to embed |
| ↩️ **Undo / redo** | Full history stack while you build |
| 📤 **One-click export** | Static HTML + Tailwind, or a ready-to-drop React component |
| 🌈 **Full style control** | Gradients, shadows, radius, spacing, typography, per-block overrides |

## 🏗️ Architecture

```
src/
├── components/
│   ├── TopBar.tsx               # Viewport switcher, undo/redo, export, publish
│   ├── CanvasArea.tsx           # The editable canvas — renders & manages all blocks
│   ├── RightPropertiesPanel.tsx # Block library, content editor, theme settings, layers
│   ├── StatusBar.tsx            # Notifications & build status
│   └── PublicGalleryModal.tsx   # Template / community gallery
├── types.ts                     # ProjectState, Block, StyleConfig, SelectionState
└── utils/
    └── defaultBlocks.ts         # Factory functions for new block instances
```

<div align="center">

```mermaid
flowchart LR
    A[RightPropertiesPanel] -- add / edit block --> B[ProjectState]
    B --> C[CanvasArea]
    C -- select / reorder / drag --> B
    B --> D[TopBar]
    D -- export --> E["HTML / React output"]
```

</div>

## 🛠️ Getting Started

```bash
# clone it
git clone https://github.com/Philemon12421/landy.git
cd landy

# install
npm install

# run
npm run dev
```

## 📤 Export Formats

<table>
<tr><td width="50%">

**Static HTML**
```html
<script src="https://cdn.tailwindcss.com"></script>
<!-- Drop-in, zero build step -->
```

</td><td width="50%">

**React Component**
```tsx
import RenderedLanding from './RenderedLanding';
// Drop into any Tailwind project
```

</td></tr>
</table>

## 🗺️ Roadmap

- [ ] Insert-at-position for the between-block "+" adder
- [ ] Nested / grouped blocks
- [ ] Per-breakpoint style overrides
- [ ] Reusable custom blocks (symbols)
- [ ] Deeper undo/redo history
- [ ] Team collaboration / real-time editing

## 🤝 Contributing

Contributions, issues, and feature requests are welcome — check the [issues page](https://github.com/Philemon12421/landy/issues).

## 📄 License

Distributed under the MIT License.

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer" width="100%"/>
</div>
