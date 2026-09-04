import React, { useState } from 'react';
import { Image as ImageIcon, Download, Maximize2, X, ExternalLink } from 'lucide-react';

export const PerplexityImagesView: React.FC = () => {
  const [selectedImg, setSelectedImg] = useState<{ title: string; src: string; desc: string } | null>(null);

  const images = [
    {
      title: 'P&ID Schematic Diagram 001',
      src: '/images/pid_schematic.svg',
      desc: 'Piping and Instrumentation Diagram: High-Pressure Separator Loop, automated control valves & pressure sensors.',
      tag: 'Schematic'
    },
    {
      title: 'Sales Pipeline Win Distribution',
      src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      desc: 'Quarterly pipeline conversion and win rate analysis chart across 8 enterprise leads.',
      tag: 'Analytics'
    },
    {
      title: 'Thermal Heat Exchanger Architecture',
      src: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      desc: 'Industrial mechanical layout for catalytic cracking unit and secondary cooling towers.',
      tag: 'Blueprint'
    },
    {
      title: 'System Component Traceability Graph',
      src: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80',
      desc: 'Local air-gap verification and isolated container communication network map.',
      tag: 'Architecture'
    }
  ];

  return (
    <div className="h-full flex flex-col bg-[#191A1A] text-[#F3F3EE] p-6 overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-[#242627] pb-5">
          <h1 className="text-2xl font-serif text-white font-normal">Media &amp; Images</h1>
          <p className="text-xs text-[#858A8E] mt-1">
            Visual artefacts, engineering schematics, and analysis diagrams extracted from the session.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {images.map((img, idx) => (
            <div 
              key={idx}
              className="bg-[#202222] border border-[#2E3133] hover:border-[#3D4143] rounded-2xl overflow-hidden group transition-all flex flex-col justify-between shadow-sm cursor-pointer"
              onClick={() => setSelectedImg(img)}
            >
              <div className="h-48 bg-[#161717] relative overflow-hidden flex items-center justify-center">
                <img 
                  src={img.src} 
                  alt={img.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  onError={(e) => {
                    // Fallback to stylized SVG placeholder if external URL is blocked in air-gap
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250" fill="%23202222"><rect width="100%" height="100%" fill="%231E2021"/><text x="50%" y="50%" fill="%2320B8CD" font-family="monospace" font-size="14" text-anchor="middle" dominant-baseline="middle">🖼️ Visual Artefact Ready</text></svg>';
                  }}
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-[#20B8CD] border border-white/10">
                  {img.tag}
                </span>
              </div>

              <div className="p-4 space-y-1.5">
                <h3 className="text-sm font-medium text-white group-hover:text-[#20B8CD] transition-colors">
                  {img.title}
                </h3>
                <p className="text-xs text-[#858A8E] line-clamp-2 leading-relaxed">
                  {img.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Zoom */}
      {selectedImg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1D1E] border border-[#2E3133] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#27292A] flex items-center justify-between">
              <span className="text-sm font-medium text-white">{selectedImg.title}</span>
              <button 
                onClick={() => setSelectedImg(null)}
                className="p-1.5 rounded-lg hover:bg-[#282A2C] text-[#858A8E] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-[#141515]">
              <img src={selectedImg.src} alt={selectedImg.title} className="max-h-[60vh] object-contain rounded-xl" />
            </div>
            <div className="p-4 border-t border-[#27292A] text-xs text-[#A2A8AB]">
              {selectedImg.desc}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
