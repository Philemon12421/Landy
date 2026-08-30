import React from 'react';
import { Type, Image as ImageIcon, Sparkles, LayoutTemplate, Square, Circle, Minus, Box } from 'lucide-react';
import { ElementType, BlockType } from '../types';

interface LeftSidebarProps {
  onAddElement: (type: ElementType) => void;
  onAddBlock: (type: BlockType) => void;
}

export default function LeftSidebar({ onAddElement, onAddBlock }: LeftSidebarProps) {
  const elements: { type: ElementType; label: string; icon: React.ReactNode }[] = [
    { type: 'text', label: 'Text', icon: <Type className="w-4 h-4" /> },
    { type: 'image', label: 'Image', icon: <ImageIcon className="w-4 h-4" /> },
    { type: 'button', label: 'Button', icon: <Sparkles className="w-4 h-4" /> },
    { type: 'shape', label: 'Rectangle', icon: <Square className="w-4 h-4" /> },
    { type: 'shape', label: 'Circle', icon: <Circle className="w-4 h-4" /> },
    { type: 'shape', label: 'Line', icon: <Minus className="w-4 h-4" /> },
    { type: 'container', label: 'Container', icon: <Box className="w-4 h-4" /> },
  ];

  const components: { type: BlockType; label: string; icon: React.ReactNode }[] = [
    { type: 'navbar', label: 'Navbar', icon: <LayoutTemplate className="w-4 h-4" /> },
    { type: 'hero_section', label: 'Hero', icon: <LayoutTemplate className="w-4 h-4" /> },
    { type: 'features_grid', label: 'Features', icon: <LayoutTemplate className="w-4 h-4" /> },
    { type: 'pricing_cards', label: 'Pricing', icon: <LayoutTemplate className="w-4 h-4" /> },
    { type: 'testimonials', label: 'Testimonials', icon: <LayoutTemplate className="w-4 h-4" /> },
    { type: 'footer', label: 'Footer', icon: <LayoutTemplate className="w-4 h-4" /> },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 h-full flex flex-col pt-16 z-40 relative">
      <div className="p-4 border-b border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Elements</h3>
        <div className="grid grid-cols-2 gap-2">
          {elements.map((el, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-white cursor-pointer border border-transparent hover:border-slate-600 transition-all"
              onClick={() => onAddElement(el.type)}
            >
              {el.icon}
              <span className="text-[10px] mt-1.5 font-medium">{el.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Sections</h3>
        <div className="flex flex-col gap-2">
          {components.map((comp) => (
            <div
              key={comp.type}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 hover:text-white cursor-pointer border border-transparent hover:border-slate-600 transition-all group"
              onClick={() => onAddBlock(comp.type)}
            >
              <div className="p-1.5 bg-slate-950 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {comp.icon}
              </div>
              <span className="text-xs font-semibold">{comp.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
