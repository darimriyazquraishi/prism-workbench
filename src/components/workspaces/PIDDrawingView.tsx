import React, { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  Compass, 
  Tag
} from 'lucide-react';

interface DetectedComponent {
  tag: string;
  type: 'Pump' | 'Valve' | 'Control Valve' | 'Piping Line' | 'Instrument';
  coords: { x: number; y: number; width: number; height: number };
  spec: string;
  designPressure: string;
  operatingTemp: string;
  nominalThickness: string;
  lastInspection: string;
  status: 'Normal' | 'Degraded' | 'Inspection Required';
  aiObservation: string;
}

const detectedComponents: DetectedComponent[] = [
  {
    tag: 'P-102',
    type: 'Pump',
    coords: { x: 22, y: 48, width: 14, height: 16 },
    spec: 'Centrifugal Crude Charge Pump (API 610)',
    designPressure: '28.5 kg/cm²',
    operatingTemp: '165 °C',
    nominalThickness: '8.2 mm',
    lastInspection: '12-Jan-2026',
    status: 'Inspection Required',
    aiObservation: 'Suction nozzle wall degradation noted in Report 001. Secondary mechanical seal vibration in normal range.'
  },
  {
    tag: 'CV-101',
    type: 'Control Valve',
    coords: { x: 42, y: 40, width: 12, height: 14 },
    spec: 'Globe Control Valve (Fail Open - FO)',
    designPressure: '22.0 kg/cm²',
    operatingTemp: '160 °C',
    nominalThickness: '6.0 mm',
    lastInspection: '05-Feb-2026',
    status: 'Normal',
    aiObservation: 'Positioner calibration verified. Upstream line velocity normal.'
  },
  {
    tag: 'V-14',
    type: 'Valve',
    coords: { x: 62, y: 32, width: 12, height: 14 },
    spec: 'Pressure Safety Relief Valve (PSV Set: 32 kg/cm²)',
    designPressure: '35.0 kg/cm²',
    operatingTemp: '180 °C',
    nominalThickness: '7.5 mm',
    lastInspection: '20-Jan-2026',
    status: 'Normal',
    aiObservation: 'Discharge line to flare header clear. Bursting disc intact.'
  },
  {
    tag: 'Line 04-CR-102-A1A',
    type: 'Piping Line',
    coords: { x: 18, y: 70, width: 65, height: 8 },
    spec: '4" ASTM A106 Gr. B Carbon Steel Schedule 40',
    designPressure: '24.0 kg/cm²',
    operatingTemp: '170 °C',
    nominalThickness: '5.0 mm (Retirement: 3.0 mm)',
    lastInspection: '15-Feb-2026',
    status: 'Degraded',
    aiObservation: 'CRITICAL: Ultrasonic scan shows wall thinning to 3.8 mm. Calculated corrosion rate 0.343 mm/yr, remaining life 2.33 years.'
  },
  {
    tag: 'TI-104',
    type: 'Instrument',
    coords: { x: 78, y: 22, width: 10, height: 12 },
    spec: 'Duplex RTD Temperature Transmitter (4-20mA HART)',
    designPressure: 'N/A',
    operatingTemp: '0-300 °C range',
    nominalThickness: 'Thermowell 6.0 mm',
    lastInspection: '10-Feb-2026',
    status: 'Normal',
    aiObservation: 'Thermowell resonance calculation compliant with ASME PTC 19.3 TW-2016.'
  }
];

export const PIDDrawingView: React.FC = () => {
  const [zoom, setZoom] = useState(100);
  const [selectedTag, setSelectedTag] = useState<DetectedComponent>(detectedComponents[0]);
  const [showOverlays, setShowOverlays] = useState(true);

  return (
    <div className="h-full flex flex-col space-y-4 font-sans text-sm overflow-hidden">
      {/* 1. TOP DRAWING CONTROL TOOLBAR */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 select-none flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono font-bold text-[var(--text-primary)] text-sm">
            <Compass className="w-5 h-5 text-[#569cd6]" />
            <span>P&amp;ID Schematic:</span>
            <span className="text-[#9cdcfe]">MRPL-CDU5-PID-04-102 (Rev. C)</span>
          </div>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--status-healthy)] border border-[var(--border-subtle)]">
            Vision Model: Qwen2.5-VL Local
          </span>
        </div>

        {/* Viewport Zoom & Overlays */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded p-1">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 15))}
              className="p-1.5 hover:bg-[var(--border-subtle)] rounded text-[var(--text-primary)]"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-[var(--text-primary)] font-bold min-w-[50px] text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 15))}
              className="p-1.5 hover:bg-[var(--border-subtle)] rounded text-[var(--text-primary)]"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="p-1.5 hover:bg-[var(--border-subtle)] rounded text-[var(--text-primary)] border-l border-[var(--border-subtle)]"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`px-3 py-1.5 rounded-md border font-semibold flex items-center gap-1.5 transition-all ${
              showOverlays
                ? 'bg-[var(--accent-fuchsia)] text-[var(--text-primary)] border-[var(--accent-fuchsia)]'
                : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Show AI Overlays</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 2-PANE WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Dominant Schematic Canvas (8 Cols) */}
        <div className="lg:col-span-8 bg-[#181818] border border-[var(--border-subtle)] rounded-lg relative overflow-hidden flex flex-col shadow-sm">
          <div className="h-8 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-4 flex items-center justify-between font-mono text-xs text-[var(--text-secondary)] flex-shrink-0">
            <span>DRAWING: 04-CR-102-PID (CAD Blueprint)</span>
            <span className="text-[var(--status-healthy)] font-semibold">5 Detected Assets (Click to Inspect)</span>
          </div>

          <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#141414] select-none relative">
            <div 
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
              className="transition-transform duration-100 ease-out relative w-[760px] h-[480px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg p-6 shadow-2xl flex flex-col justify-between"
            >
              {/* CAD Blueprint Title Block */}
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 text-xs font-mono">
                <div>
                  <span className="text-[#569cd6] font-bold block text-sm">MRPL REFINERY OPERATIONS</span>
                  <span className="text-[var(--text-primary)]">CRUDE DISTILLATION UNIT (CDU-5) PIPING SCHEMATIC</span>
                </div>
                <div className="text-right text-[var(--text-secondary)]">
                  <span>SCALE: NONE (SCHEMATIC)</span>
                  <span className="block text-[var(--status-healthy)] font-semibold">STATUS: IN-SERVICE</span>
                </div>
              </div>

              {/* Piping Vectors */}
              <div className="relative flex-1 my-4 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full stroke-[#555555] stroke-[2] fill-none">
                  <path d="M 60 220 L 220 220 L 220 180 L 360 180 L 520 180 L 680 220" />
                  <path d="M 220 180 L 220 100 L 520 100 L 520 180" strokeDasharray="4 4" stroke="#666666" />
                  <path d="M 360 180 L 360 80 L 460 80" stroke="#007acc" strokeWidth="2" />
                  <path d="M 520 100 L 620 100 L 620 60" stroke="#cca700" strokeWidth="2" />
                </svg>

                <div className="absolute left-24 top-[210px] text-[var(--text-secondary)] font-mono text-xs font-semibold">&gt; CRUDE IN</div>
                <div className="absolute right-12 top-[210px] text-[var(--text-secondary)] font-mono text-xs font-semibold">TO HEATER &gt;</div>

                {/* Overlays */}
                {showOverlays && detectedComponents.map((comp) => {
                  const isSelected = selectedTag.tag === comp.tag;
                  const isDegraded = comp.status === 'Degraded';

                  return (
                    <div
                      key={comp.tag}
                      onClick={() => setSelectedTag(comp)}
                      style={{
                        left: `${comp.coords.x}%`,
                        top: `${comp.coords.y}%`,
                        width: `${comp.coords.width}%`,
                        height: `${comp.coords.height}%`
                      }}
                      className={`absolute cursor-pointer rounded-md transition-all flex flex-col items-center justify-center p-1.5 font-mono text-xs ${
                        isSelected
                          ? 'bg-[#264f78] border-2 border-[var(--accent-fuchsia)] text-[var(--text-primary)] shadow-xl scale-105 z-20 font-bold'
                          : isDegraded
                          ? 'bg-[#332a00] border-2 border-[#cca700] text-[#ffeb80] animate-pulse z-10 font-bold'
                          : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-fuchsia)] z-10'
                      }`}
                    >
                      <span>{comp.tag}</span>
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase">{comp.type}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2 text-xs font-mono text-[var(--text-secondary)]">
                <span>CONFIDENTIAL — PROPRIETARY ENGINEERING SCHEMATIC</span>
                <span>AIR-GAP VERIFIED INFERENCE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Asset Inspector (4 Cols) */}
        <div className="lg:col-span-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-5 flex flex-col space-y-4 overflow-y-auto font-mono text-xs shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 text-sm uppercase font-bold text-[var(--text-primary)]">
            <span className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#569cd6]" />
              Asset Properties
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
              selectedTag.status === 'Degraded' 
                ? 'bg-[#332a00] text-[#cca700] border border-[#cca700]' 
                : 'bg-[#1f3a2b] text-[var(--status-healthy)] border border-[#2e5d44]'
            }`}>
              {selectedTag.status}
            </span>
          </div>

          <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-[#9cdcfe]">{selectedTag.tag}</span>
              <span className="text-xs text-[var(--text-secondary)]">{selectedTag.type}</span>
            </div>
            <div className="text-xs text-[var(--text-primary)] font-sans leading-relaxed">{selectedTag.spec}</div>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            <span className="text-[var(--text-secondary)] uppercase font-bold">Design Parameters:</span>
            <div className="grid grid-cols-2 gap-2 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg p-3 text-[var(--text-primary)]">
              <div>
                <span className="text-[var(--text-secondary)] block text-[10px]">DESIGN PRESSURE:</span>
                <span className="font-semibold text-[var(--text-primary)]">{selectedTag.designPressure}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block text-[10px]">OPERATING TEMP:</span>
                <span className="font-semibold text-[var(--text-primary)]">{selectedTag.operatingTemp}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block text-[10px]">NOMINAL THICKNESS:</span>
                <span className="font-semibold text-[var(--text-primary)]">{selectedTag.nominalThickness}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block text-[10px]">LAST SURVEY:</span>
                <span className="font-semibold text-[var(--text-primary)]">{selectedTag.lastInspection}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-[var(--text-secondary)] uppercase font-bold">
              AI Vision Model Findings (Qwen2.5-VL):
            </span>
            <div className={`p-3 rounded-lg font-sans text-xs leading-relaxed border ${
              selectedTag.status === 'Degraded'
                ? 'bg-[#332a00] border-[#cca700] text-[#ffeb80]'
                : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-primary)]'
            }`}>
              {selectedTag.aiObservation}
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] font-sans">
            * ASME P&amp;ID standards compliant. Field engineering stamp mandatory before turnaround modifications.
          </div>
        </div>
      </div>
    </div>
  );
};
