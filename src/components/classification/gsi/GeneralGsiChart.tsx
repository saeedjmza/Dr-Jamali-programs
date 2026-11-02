import React, { useState, useRef, useEffect } from 'react';
import {
  RockStructureType,
  SurfaceQualityType,
  GSI_MATRIX,
} from '../../../utils/gsiCalculation';

interface GeneralGsiChartProps {
  selectedGsi: number;
  onSelectGsi: (gsi: number) => void;
  selectedStructure: RockStructureType;
  selectedSurface: SurfaceQualityType;
  onSelectStructureAndSurface: (
    struct: RockStructureType,
    surf: SurfaceQualityType,
    gsi: number
  ) => void;
  rockType: 'General' | 'Flysch';
  onChangeRockType: (type: 'General' | 'Flysch') => void;
}

export const GeneralGsiChart: React.FC<GeneralGsiChartProps> = ({
  selectedGsi,
  onSelectGsi,
  selectedStructure,
  selectedSurface,
  onSelectStructureAndSurface,
  rockType,
  onChangeRockType,
}) => {
  const [inputVal, setInputVal] = useState<string>(String(selectedGsi));
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // SVG internal coordinate dimensions
  const colWidth = 100;
  const rowHeight = 80;
  const totalSvgWidth = 500; // 5 columns * 100
  const totalSvgHeight = 480; // 6 rows * 80

  // Continuous marker position
  const [markerPos, setMarkerPos] = useState<{ x: number; y: number }>(() => {
    // Initial position based on selected GSI along median diagonal
    const t = Math.max(0, Math.min(1, (98 - selectedGsi) / 93));
    return {
      x: Math.round(t * (totalSvgWidth - 80) + 40),
      y: Math.round(t * (totalSvgHeight - 80) + 40),
    };
  });

  useEffect(() => {
    setInputVal(String(selectedGsi));
  }, [selectedGsi]);

  // Structures (Rows) exactly from Hoek & Marinos (2000)
  const structures: {
    id: RockStructureType;
    title: string;
    desc: string;
    renderThumb: () => React.ReactNode;
  }[] = [
    {
      id: 'intact_massive',
      title: 'INTACT OR MASSIVE',
      desc: 'intact rock specimens or massive in situ rock with few widely spaced discontinuities',
      renderThumb: () => (
        <svg viewBox="0 0 80 60" className="w-full h-full bg-white">
          <rect width="80" height="60" fill="#ffffff" stroke="#000000" strokeWidth="1" />
          <line x1="12" y1="52" x2="68" y2="12" stroke="#000000" strokeWidth="1.2" strokeDasharray="24 6 15" />
          <line x1="25" y1="58" x2="48" y2="40" stroke="#000000" strokeWidth="1" />
        </svg>
      ),
    },
    {
      id: 'blocky',
      title: 'BLOCKY',
      desc: 'well interlocked undisturbed rock mass consisting of cubical blocks formed by three intersecting discontinuity sets',
      renderThumb: () => (
        <svg viewBox="0 0 80 60" className="w-full h-full bg-white">
          <rect width="80" height="60" fill="#ffffff" stroke="#000000" strokeWidth="1" />
          <defs>
            <pattern id="blockyPatternEng" width="14" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(22)">
              <line x1="0" y1="0" x2="14" y2="0" stroke="#000000" strokeWidth="1" />
              <line x1="0" y1="0" x2="0" y2="12" stroke="#000000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="80" height="60" fill="url(#blockyPatternEng)" />
        </svg>
      ),
    },
    {
      id: 'very_blocky',
      title: 'VERY BLOCKY',
      desc: 'interlocked, partially disturbed mass with multi-faceted angular blocks formed by 4 or more joint sets',
      renderThumb: () => (
        <svg viewBox="0 0 80 60" className="w-full h-full bg-white">
          <rect width="80" height="60" fill="#ffffff" stroke="#000000" strokeWidth="1" />
          <path
            d="M 5 15 L 75 45 M 10 55 L 70 8 M 25 5 L 45 55 M 60 5 L 15 50 M 5 35 L 75 25 M 35 12 L 68 48 M 8 42 L 52 16"
            stroke="#000000"
            strokeWidth="1"
          />
        </svg>
      ),
    },
    {
      id: 'blocky_disturbed',
      title: 'BLOCKY/DISTURBED/SEAMY',
      desc: 'folded with angular blocks formed by many intersecting discontinuity sets. Persistence of bedding planes or schistosity',
      renderThumb: () => (
        <svg viewBox="0 0 80 60" className="w-full h-full bg-white">
          <rect width="80" height="60" fill="#ffffff" stroke="#000000" strokeWidth="1" />
          <path d="M 0 16 Q 25 5 50 18 T 80 12" fill="none" stroke="#000000" strokeWidth="1.4" />
          <path d="M 0 32 Q 25 21 50 34 T 80 28" fill="none" stroke="#000000" strokeWidth="1.4" />
          <path d="M 0 48 Q 25 37 50 50 T 80 44" fill="none" stroke="#000000" strokeWidth="1.4" />
          <line x1="18" y1="10" x2="15" y2="50" stroke="#000000" strokeWidth="0.9" />
          <line x1="36" y1="12" x2="42" y2="52" stroke="#000000" strokeWidth="0.9" />
          <line x1="62" y1="8" x2="58" y2="48" stroke="#000000" strokeWidth="0.9" />
        </svg>
      ),
    },
    {
      id: 'disintegrated',
      title: 'DISINTEGRATED',
      desc: 'poorly interlocked, heavily broken rock mass with mixture of angular and rounded rock pieces',
      renderThumb: () => (
        <svg viewBox="0 0 80 60" className="w-full h-full bg-white">
          <rect width="80" height="60" fill="#ffffff" stroke="#000000" strokeWidth="1" />
          <g stroke="#000000" strokeWidth="0.9" fill="none">
            <polygon points="5,8 18,5 24,14 12,18" />
            <polygon points="26,6 42,8 38,20 25,16" />
            <polygon points="45,5 60,7 65,18 48,22" />
            <polygon points="63,8 76,12 74,24 64,20" />
            <polygon points="8,22 22,20 20,34 6,30" />
            <polygon points="24,22 36,24 38,36 22,38" />
            <polygon points="40,24 55,22 58,36 42,38" />
            <polygon points="60,24 74,26 72,40 58,38" />
            <polygon points="6,34 20,38 18,52 4,48" />
            <polygon points="22,40 38,38 36,52 20,54" />
            <polygon points="40,40 56,38 54,54 38,52" />
            <polygon points="58,40 76,42 74,54 56,54" />
          </g>
        </svg>
      ),
    },
    {
      id: 'laminated_sheared',
      title: 'LAMINATED/SHEARED',
      desc: 'Lack of blockiness due to close spacing of weak schistosity or shear planes',
      renderThumb: () => (
        <svg viewBox="0 0 80 60" className="w-full h-full bg-white">
          <rect width="80" height="60" fill="#ffffff" stroke="#000000" strokeWidth="1" />
          <path
            d="M 2 8 C 20 4, 35 12, 78 7 M 2 16 C 18 12, 38 20, 78 15 M 2 24 C 22 20, 42 28, 78 23 M 2 32 C 16 28, 36 36, 78 31 M 2 40 C 24 36, 44 44, 78 39 M 2 48 C 18 44, 38 52, 78 47 M 2 54 C 22 50, 42 58, 78 53"
            fill="none"
            stroke="#000000"
            strokeWidth="1.1"
          />
        </svg>
      ),
    },
  ];

  // Surface conditions (Columns) verbatim from original Hoek & Marinos 2000
  const surfaceColumns: {
    id: SurfaceQualityType;
    label: string;
    description: string;
  }[] = [
    {
      id: 'very_good',
      label: 'VERY GOOD',
      description: 'Very rough, fresh, unweathered surfaces',
    },
    {
      id: 'good',
      label: 'GOOD',
      description: 'Rough, slightly weathered, iron stained surfaces',
    },
    {
      id: 'fair',
      label: 'FAIR',
      description: 'Smooth, moderately weathered or altered surfaces',
    },
    {
      id: 'poor',
      label: 'POOR',
      description: 'Slickensided, highly weathered surfaces with compact coatings or fillings or angular fragments',
    },
    {
      id: 'very_poor',
      label: 'VERY POOR',
      description: 'Slickensided, highly weathered surfaces with soft clay coatings or fillings',
    },
  ];

  // Map arbitrary SVG (x, y) point to GSI value and corresponding structure/surface
  const processPointSelection = (clientX: number, clientY: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();

    const scaleX = totalSvgWidth / rect.width;
    const scaleY = totalSvgHeight / rect.height;

    const svgX = Math.max(0, Math.min(totalSvgWidth, (clientX - rect.left) * scaleX));
    const svgY = Math.max(0, Math.min(totalSvgHeight, (clientY - rect.top) * scaleY));

    // Calculate exact GSI based on Hoek & Marinos isoline geometry
    // Contours slope from bottom-left to top-right (forward-slash '/').
    // Gradient points from top-left (100) down-right to bottom-right (5).
    const u = svgX / totalSvgWidth;  // 0 to 1
    const v = svgY / totalSvgHeight; // 0 to 1

    // Projection parameter along the gradient diagonal
    const t = 0.52 * u + 0.48 * v;
    const calculatedGsi = Math.round(Math.max(5, Math.min(100, 98 - 93 * t)));

    // Determine row (structure) and col (surface quality)
    const rowIndex = Math.min(5, Math.floor(svgY / rowHeight));
    const colIndex = Math.min(4, Math.floor(svgX / colWidth));

    const struct = structures[rowIndex].id;
    const surf = surfaceColumns[colIndex].id;

    setMarkerPos({ x: svgX, y: svgY });
    setInputVal(String(calculatedGsi));
    onSelectStructureAndSurface(struct, surf, calculatedGsi);
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsDragging(true);
    processPointSelection(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) {
      processPointSelection(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleApplyInput = () => {
    const val = parseInt(inputVal, 10);
    if (!isNaN(val)) {
      const clamped = Math.max(5, Math.min(100, val));
      onSelectGsi(clamped);
      setInputVal(String(clamped));

      // Move marker along median diagonal
      const t = Math.max(0, Math.min(1, (98 - clamped) / 93));
      const mx = Math.round(t * (totalSvgWidth - 80) + 40);
      const my = Math.round(t * (totalSvgHeight - 80) + 40);
      setMarkerPos({ x: mx, y: my });

      const rowIndex = Math.min(5, Math.floor(my / rowHeight));
      const colIndex = Math.min(4, Math.floor(mx / colWidth));
      onSelectStructureAndSurface(structures[rowIndex].id, surfaceColumns[colIndex].id, clamped);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApplyInput();
    }
  };

  const handleSelectSpecificCell = (stId: RockStructureType, surfId: SurfaceQualityType) => {
    const sIndex = structures.findIndex((s) => s.id === stId);
    const cIndex = surfaceColumns.findIndex((c) => c.id === surfId);
    const targetRow = sIndex >= 0 ? sIndex : 1;
    const targetCol = cIndex >= 0 ? cIndex : 1;

    const cx = targetCol * colWidth + colWidth / 2;
    const cy = targetRow * rowHeight + rowHeight / 2;

    const u = cx / totalSvgWidth;
    const v = cy / totalSvgHeight;
    const t = 0.52 * u + 0.48 * v;
    const cellGsi = Math.round(Math.max(5, Math.min(100, 98 - 93 * t)));

    setMarkerPos({ x: cx, y: cy });
    setInputVal(String(cellGsi));
    onSelectStructureAndSurface(stId, surfId, cellGsi);
  };

  return (
    <div
      className="bg-[#ece9d8] text-black font-sans border-2 border-[#7a7a7a] shadow-md select-none rounded-none text-left"
      dir="ltr"
      onMouseUp={handleMouseUp}
    >
      {/* Top Application Bar (RocLab Classic Dialog Toolbar) */}
      <div className="bg-[#ece9d8] px-3 py-2 border-b border-[#9c9c9c] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-6">
          {/* Rock Type Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="rockTypeSelect" className="font-bold text-black cursor-pointer">
              Rock Type:
            </label>
            <select
              id="rockTypeSelect"
              value={rockType}
              onChange={(e) => onChangeRockType(e.target.value as 'General' | 'Flysch')}
              className="bg-white border border-[#7f9db9] text-black px-2 py-0.5 font-sans text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-inner cursor-pointer"
            >
              <option value="General">General</option>
              <option value="Flysch">Flysch</option>
            </select>
          </div>

          {/* GSI Selection Input & OK Button */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="gsiInputBox" className="font-bold text-black cursor-pointer">
              GSI Selection:
            </label>
            <input
              id="gsiInputBox"
              type="number"
              min={5}
              max={100}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-14 bg-white border border-[#7f9db9] text-black px-1.5 py-0.5 text-xs text-center font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-inner"
            />
            <button
              onClick={handleApplyInput}
              className="px-3 py-0.5 bg-[#ece9d8] hover:bg-[#dedede] active:bg-[#c8c8c8] text-black font-semibold text-xs border border-[#707070] shadow-sm rounded-none cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>

        {/* Selected Output Feedback */}
        <div className="text-xs font-mono font-bold text-blue-900 bg-white px-2 py-0.5 border border-[#7f9db9]">
          Selected GSI = {selectedGsi}
        </div>
      </div>

      {/* Main Hoek & Marinos Chart Table */}
      <div className="overflow-x-auto p-1 bg-white">
        <div className="min-w-[840px] border border-black bg-white">
          {/* Top Axis: SURFACE CONDITIONS */}
          <div className="grid grid-cols-12 border-b border-black">
            {/* Corner header above Structure */}
            <div className="col-span-5 border-r border-black p-2 flex items-center justify-center font-bold text-xs bg-[#f4f4f4] tracking-wider">
              STRUCTURE
            </div>

            {/* Surface Conditions Header Banner */}
            <div className="col-span-7 flex flex-col">
              <div className="text-center font-bold text-xs py-1 border-b border-black tracking-wider bg-white">
                SURFACE CONDITIONS
              </div>

              {/* Arrow Banner: DECREASING SURFACE QUALITY ===> */}
              <div className="flex items-center justify-between px-3 py-0.5 border-b border-black text-[10px] font-bold bg-[#fafafa]">
                <span>DECREASING SURFACE QUALITY</span>
                <span className="font-mono text-xs font-black tracking-widest">═════════════►</span>
              </div>

              {/* 5 Surface Columns */}
              <div className="grid grid-cols-5 text-center text-[10px] divide-x divide-black bg-white">
                {surfaceColumns.map((col) => (
                  <div
                    key={col.id}
                    onClick={() => handleSelectSpecificCell(selectedStructure, col.id)}
                    className={`p-1 cursor-pointer transition-colors ${
                      selectedSurface === col.id ? 'bg-blue-100 font-bold' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-[10px] leading-tight mb-0.5">{col.label}</div>
                    <div className="text-[8.5px] leading-tight text-slate-600 line-clamp-3">
                      {col.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Body: Left Structure Rows + Right Contour SVG Chart */}
          <div className="grid grid-cols-12">
            {/* Left 5 cols: Structure Descriptions & Sketches */}
            <div className="col-span-5 border-r border-black divide-y divide-black bg-white">
              {structures.map((st) => {
                const isSelected = selectedStructure === st.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => handleSelectSpecificCell(st.id, selectedSurface)}
                    className={`h-[80px] p-1.5 flex items-center gap-2 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Sketch Thumbnail */}
                    <div className="w-16 h-14 shrink-0 border border-black overflow-hidden bg-white">
                      {st.renderThumb()}
                    </div>

                    {/* Text description verbatim */}
                    <div className="text-[9.5px] leading-tight overflow-hidden">
                      <span className="font-bold text-black">{st.title}</span>
                      <span className="text-black"> - {st.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right 7 cols: Hoek & Marinos GSI Contour SVG Chart */}
            <div className="col-span-7 relative bg-white select-none">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${totalSvgWidth} ${totalSvgHeight}`}
                className="w-full h-[480px] cursor-crosshair bg-white block"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
              >
                <defs>
                  {/* Diagonal Hatching Pattern for N/A Zones */}
                  <pattern
                    id="hatchPatternGeneralBlack"
                    width="10"
                    height="10"
                    patternTransform="rotate(45 0 0)"
                    patternUnits="userSpaceOnUse"
                  >
                    <line x1="0" y1="0" x2="0" y2="10" stroke="#000000" strokeWidth="0.8" />
                  </pattern>
                </defs>

                {/* Vertical Column Grid Lines (5 columns) */}
                {[1, 2, 3, 4].map((i) => (
                  <line
                    key={`v-${i}`}
                    x1={i * colWidth}
                    y1={0}
                    x2={i * colWidth}
                    y2={totalSvgHeight}
                    stroke="#000000"
                    strokeWidth="0.8"
                  />
                ))}

                {/* Horizontal Row Grid Lines (6 rows) */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <line
                    key={`h-${i}`}
                    x1={0}
                    y1={i * rowHeight}
                    x2={totalSvgWidth}
                    y2={i * rowHeight}
                    stroke="#000000"
                    strokeWidth="0.8"
                  />
                ))}

                {/* Hatched N/A Zone 1: Top-Right Corner */}
                {/* Intact/Massive and Blocky with Poor & Very Poor surfaces */}
                <polygon
                  points="280,0 500,0 500,180"
                  fill="url(#hatchPatternGeneralBlack)"
                  stroke="#000000"
                  strokeWidth="1.2"
                />
                <text x="430" y="55" fill="#000000" fontSize="13" fontWeight="bold" textAnchor="middle">
                  N/A
                </text>

                {/* Hatched N/A Zone 2: Bottom-Left Corner */}
                {/* Laminated/Sheared and Disintegrated with Very Good & Good surfaces */}
                <polygon
                  points="0,320 0,480 220,480"
                  fill="url(#hatchPatternGeneralBlack)"
                  stroke="#000000"
                  strokeWidth="1.2"
                />
                <text x="70" y="440" fill="#000000" fontSize="13" fontWeight="bold" textAnchor="middle">
                  N/A
                </text>

                {/* ============================================================ */}
                {/* DIAGONAL CONTOUR CURVES (ISOLINES OF CONSTANT GSI)            */}
                {/* Hoek & Marinos 2000: Curves run from bottom-left to top-right */}
                {/* ============================================================ */}

                {/* 90 Contour */}
                <path d="M 0,75 Q 40,40 90,0" fill="none" stroke="#000000" strokeWidth="1.8" />
                <text x="40" y="32" fill="#000000" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                  90
                </text>

                {/* 80 Contour */}
                <path d="M 0,150 Q 80,85 180,0" fill="none" stroke="#000000" strokeWidth="1.8" />
                <text x="80" y="70" fill="#000000" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                  80
                </text>

                {/* 70 Contour */}
                <path d="M 0,230 Q 120,125 260,0" fill="none" stroke="#000000" strokeWidth="1.8" />
                <text x="120" y="115" fill="#000000" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                  70
                </text>

                {/* 60 Contour */}
                <path d="M 0,310 Q 160,170 340,0" fill="none" stroke="#000000" strokeWidth="1.8" />
                <text x="160" y="160" fill="#000000" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                  60
                </text>

                {/* 50 Contour */}
                <path d="M 0,390 Q 200,210 420,0" fill="none" stroke="#000000" strokeWidth="1.8" />
                <text x="200" y="205" fill="#000000" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                  50
                </text>

                {/* 40 Contour */}
                <path d="M 40,480 Q 260,250 500,90" fill="none" stroke="#000000" strokeWidth="1.8" />
                <text x="250" y="255" fill="#000000" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                  40
                </text>

                {/* 30 Contour */}
                <path d="M 140,480 Q 320,310 500,180" fill="none" stroke="#000000" strokeWidth="1.8" />
                <text x="305" y="305" fill="#000000" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                  30
                </text>

                {/* 20 Contour */}
                <path d="M 240,480 Q 380,365 500,270" fill="none" stroke="#000000" strokeWidth="1.8" />
                <text x="360" y="355" fill="#000000" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                  20
                </text>

                {/* 10 Contour */}
                <path d="M 340,480 Q 430,420 500,370" fill="none" stroke="#000000" strokeWidth="1.8" />
                <text x="415" y="410" fill="#000000" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                  10
                </text>

                {/* Transparent overlay ensuring 100% of points are clickable and draggable */}
                <rect
                  x="0"
                  y="0"
                  width={totalSvgWidth}
                  height={totalSvgHeight}
                  fill="transparent"
                  pointerEvents="all"
                />

                {/* Active Selection Target / Crosshair */}
                <g transform={`translate(${markerPos.x}, ${markerPos.y})`} pointerEvents="none">
                  <circle r="18" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="3 2" />
                  <ellipse rx="14" ry="9" fill="#3b82f6" fillOpacity="0.28" stroke="#1d4ed8" strokeWidth="1.5" />
                  <line x1="-8" y1="0" x2="8" y2="0" stroke="#1d4ed8" strokeWidth="1.2" />
                  <line x1="0" y1="-6" x2="0" y2="6" stroke="#1d4ed8" strokeWidth="1.2" />
                  <circle r="2.5" fill="#1d4ed8" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
