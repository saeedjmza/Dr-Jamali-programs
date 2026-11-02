import React, { useState, useRef, useEffect } from 'react';
import {
  FlyschClassType,
  FLYSCH_CLASSES,
  SurfaceQualityType,
} from '../../../utils/gsiCalculation';

interface FlyschGsiChartProps {
  selectedGsi: number;
  onSelectGsi: (gsi: number) => void;
  selectedFlyschClass: FlyschClassType;
  onSelectFlyschClass: (flyschClass: FlyschClassType, gsi: number) => void;
  rockType: 'General' | 'Flysch';
  onChangeRockType: (type: 'General' | 'Flysch') => void;
}

export const FlyschGsiChart: React.FC<FlyschGsiChartProps> = ({
  selectedGsi,
  onSelectGsi,
  selectedFlyschClass,
  onSelectFlyschClass,
  rockType,
  onChangeRockType,
}) => {
  const [inputVal, setInputVal] = useState<string>(String(selectedGsi));
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const colWidth = 100;
  const rowHeight = 118;
  const totalSvgWidth = 500;
  const totalSvgHeight = 472;

  // Flysch occurrence cloud bands
  const flyschBands: {
    id: FlyschClassType;
    label: string;
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    gsi: number;
  }[] = [
    { id: 'A', label: 'A', cx: 190, cy: 59, rx: 42, ry: 48, gsi: 60 },
    { id: 'B', label: 'B', cx: 160, cy: 177, rx: 28, ry: 46, gsi: 50 },
    { id: 'C', label: 'C', cx: 215, cy: 177, rx: 26, ry: 46, gsi: 45 },
    { id: 'D', label: 'D', cx: 275, cy: 177, rx: 26, ry: 46, gsi: 40 },
    { id: 'E', label: 'E', cx: 335, cy: 177, rx: 28, ry: 46, gsi: 35 },
    { id: 'F', label: 'F', cx: 370, cy: 295, rx: 45, ry: 48, gsi: 24 },
    { id: 'G', label: 'G', cx: 310, cy: 413, rx: 34, ry: 48, gsi: 25 },
    { id: 'H', label: 'H', cx: 410, cy: 413, rx: 36, ry: 48, gsi: 15 },
  ];

  const activeBand =
    flyschBands.find((b) => b.id === selectedFlyschClass) ?? flyschBands[0];

  // Continuous marker position
  const [markerPos, setMarkerPos] = useState<{ x: number; y: number }>(() => ({
    x: activeBand.cx,
    y: activeBand.cy,
  }));

  useEffect(() => {
    setInputVal(String(selectedGsi));
  }, [selectedGsi]);

  const surfaceColumns: { id: SurfaceQualityType; label: string }[] = [
    { id: 'very_good', label: 'VERY GOOD' },
    { id: 'good', label: 'GOOD' },
    { id: 'fair', label: 'FAIR' },
    { id: 'poor', label: 'POOR' },
    { id: 'very_poor', label: 'VERY POOR' },
  ];

  // Map any continuous point on Flysch chart to GSI and class
  const processPointSelection = (clientX: number, clientY: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();

    const scaleX = totalSvgWidth / rect.width;
    const scaleY = totalSvgHeight / rect.height;

    const svgX = Math.max(0, Math.min(totalSvgWidth, (clientX - rect.left) * scaleX));
    const svgY = Math.max(0, Math.min(totalSvgHeight, (clientY - rect.top) * scaleY));

    // Calculate continuous GSI based on diagonal contour gradient
    const u = svgX / totalSvgWidth;
    const v = svgY / totalSvgHeight;
    const p = 0.52 * u + 0.48 * v;
    const calcGsi = Math.round(Math.max(5, Math.min(80, 82 - 74 * p)));

    // Detect Flysch Class
    let detectedClass: FlyschClassType = 'A';
    if (svgY < 118) {
      detectedClass = 'A';
    } else if (svgY < 236) {
      if (svgX < 190) detectedClass = 'B';
      else if (svgX < 245) detectedClass = 'C';
      else if (svgX < 305) detectedClass = 'D';
      else detectedClass = 'E';
    } else if (svgY < 354) {
      detectedClass = 'F';
    } else {
      if (svgX < 360) detectedClass = 'G';
      else detectedClass = 'H';
    }

    setMarkerPos({ x: svgX, y: svgY });
    setInputVal(String(calcGsi));
    onSelectFlyschClass(detectedClass, calcGsi);
    onSelectGsi(calcGsi);
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
      const clamped = Math.max(5, Math.min(80, val));
      onSelectGsi(clamped);
      setInputVal(String(clamped));

      const classes = Object.values(FLYSCH_CLASSES);
      let closest = classes[0];
      let minDiff = Math.abs(clamped - closest.typicalGsi);
      for (const fc of classes) {
        const diff = Math.abs(clamped - fc.typicalGsi);
        if (diff < minDiff) {
          minDiff = diff;
          closest = fc;
        }
      }
      onSelectFlyschClass(closest.id, clamped);

      // Move marker toward representative band
      const b = flyschBands.find((fb) => fb.id === closest.id);
      if (b) {
        setMarkerPos({ x: b.cx, y: b.cy });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApplyInput();
    }
  };

  const handleSelectBand = (band: (typeof flyschBands)[0]) => {
    setMarkerPos({ x: band.cx, y: band.cy });
    setInputVal(String(band.gsi));
    onSelectFlyschClass(band.id, band.gsi);
    onSelectGsi(band.gsi);
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
            <label htmlFor="flyschRockTypeSelect" className="font-bold text-black cursor-pointer">
              Rock Type:
            </label>
            <select
              id="flyschRockTypeSelect"
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
            <label htmlFor="flyschGsiInputBox" className="font-bold text-black cursor-pointer">
              GSI Selection:
            </label>
            <input
              id="flyschGsiInputBox"
              type="number"
              min={5}
              max={80}
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
          Selected Flysch = Class {selectedFlyschClass} (GSI = {selectedGsi})
        </div>
      </div>

      {/* Main Hoek, Marinos & Benissi Flysch GSI Chart */}
      <div className="overflow-x-auto p-1 bg-white">
        <div className="min-w-[920px] border border-black bg-white">
          {/* Top Axis: SURFACE CONDITIONS OF DISCONTINUITIES */}
          <div className="grid grid-cols-12 border-b border-black">
            {/* Corner header above composition */}
            <div className="col-span-6 border-r border-black p-2 flex items-center justify-center font-bold text-xs bg-[#f4f4f4] tracking-wider">
              COMPOSITION AND STRUCTURE
            </div>

            {/* Surface Conditions Header */}
            <div className="col-span-6 flex flex-col">
              <div className="text-center font-bold text-xs py-1 border-b border-black tracking-wider bg-white">
                SURFACE CONDITIONS OF DISCONTINUITIES
              </div>

              {/* 5 Surface Columns */}
              <div className="grid grid-cols-5 text-center text-[10px] font-bold divide-x divide-black bg-white">
                {surfaceColumns.map((col) => (
                  <div key={col.id} className="py-1">
                    {col.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Body: Left Composition Rows (A to H) + Right Flysch Contour Chart */}
          <div className="grid grid-cols-12">
            {/* Left 6 cols: Composition & Structure Classes */}
            <div className="col-span-6 border-r border-black divide-y divide-black bg-white text-black text-[9.5px]">
              {/* Row 1: Class A */}
              <div
                onClick={() => handleSelectBand(flyschBands[0])}
                className={`h-[118px] p-2 flex items-center gap-3 cursor-pointer transition-colors ${
                  selectedFlyschClass === 'A' ? 'bg-blue-50' : 'hover:bg-slate-50'
                }`}
              >
                {/* Sketch: Thick bedded blocky sandstone */}
                <div className="w-20 h-20 shrink-0 border border-black bg-white overflow-hidden">
                  <svg viewBox="0 0 80 80" className="w-full h-full">
                    <rect width="80" height="80" fill="#ffffff" />
                    <line x1="0" y1="26" x2="80" y2="26" stroke="#000000" strokeWidth="1.5" />
                    <line x1="0" y1="54" x2="80" y2="54" stroke="#000000" strokeWidth="1.5" />
                    <line x1="22" y1="0" x2="20" y2="26" stroke="#000000" strokeWidth="1" />
                    <line x1="58" y1="0" x2="60" y2="26" stroke="#000000" strokeWidth="1" />
                    <line x1="38" y1="26" x2="36" y2="54" stroke="#000000" strokeWidth="1" />
                    <line x1="18" y1="54" x2="16" y2="80" stroke="#000000" strokeWidth="1" />
                    <line x1="62" y1="54" x2="64" y2="80" stroke="#000000" strokeWidth="1" />
                  </svg>
                </div>

                <div className="leading-tight">
                  <span className="font-bold text-[10px] block mb-0.5">
                    A. Thick bedded, very blocky sandstone
                  </span>
                  <p className="text-[9px] text-black">
                    The effect of pelitic coatings on the bedding planes is minimized by the confinement of the rock mass. In shallow tunnels or slopes these bedding planes may cause structurally controlled instability.
                  </p>
                </div>
              </div>

              {/* Row 2: Classes B, C, D, E */}
              <div className="h-[118px] p-1 grid grid-cols-4 gap-1 divide-x divide-black">
                {/* Class B */}
                <div
                  onClick={() => handleSelectBand(flyschBands[1])}
                  className={`p-1 flex flex-col items-center text-center justify-between cursor-pointer ${
                    selectedFlyschClass === 'B' ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-11 border border-black bg-white overflow-hidden">
                    <svg viewBox="0 0 50 45" className="w-full h-full">
                      <rect width="50" height="45" fill="#ffffff" />
                      <line x1="0" y1="12" x2="50" y2="12" stroke="#000000" strokeWidth="1.2" />
                      <line x1="0" y1="15" x2="50" y2="15" stroke="#000000" strokeWidth="0.8" strokeDasharray="2 1" />
                      <line x1="0" y1="28" x2="50" y2="28" stroke="#000000" strokeWidth="1.2" />
                      <line x1="0" y1="31" x2="50" y2="31" stroke="#000000" strokeWidth="0.8" strokeDasharray="2 1" />
                      <line x1="20" y1="0" x2="15" y2="45" stroke="#000000" strokeWidth="0.8" />
                      <line x1="38" y1="0" x2="35" y2="45" stroke="#000000" strokeWidth="0.8" />
                    </svg>
                  </div>
                  <div className="text-[8.5px] leading-tight mt-0.5">
                    <strong className="block">B. Sandstone</strong>
                    <span>with thin inter-layers of siltstone</span>
                  </div>
                </div>

                {/* Class C */}
                <div
                  onClick={() => handleSelectBand(flyschBands[2])}
                  className={`p-1 flex flex-col items-center text-center justify-between cursor-pointer ${
                    selectedFlyschClass === 'C' ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-11 border border-black bg-white overflow-hidden">
                    <svg viewBox="0 0 50 45" className="w-full h-full">
                      <rect width="50" height="45" fill="#ffffff" />
                      <rect x="0" y="8" width="50" height="6" fill="#888888" />
                      <rect x="0" y="24" width="50" height="6" fill="#888888" />
                      <line x1="18" y1="0" x2="18" y2="45" stroke="#000000" strokeWidth="0.8" />
                      <line x1="35" y1="0" x2="35" y2="45" stroke="#000000" strokeWidth="0.8" />
                    </svg>
                  </div>
                  <div className="text-[8.5px] leading-tight mt-0.5">
                    <strong className="block">C. Sandstone</strong>
                    <span>and siltstone in similar amounts</span>
                  </div>
                </div>

                {/* Class D */}
                <div
                  onClick={() => handleSelectBand(flyschBands[3])}
                  className={`p-1 flex flex-col items-center text-center justify-between cursor-pointer ${
                    selectedFlyschClass === 'D' ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-11 border border-black bg-white overflow-hidden">
                    <svg viewBox="0 0 50 45" className="w-full h-full">
                      <rect width="50" height="45" fill="#888888" />
                      <line x1="0" y1="14" x2="50" y2="14" stroke="#ffffff" strokeWidth="2" />
                      <line x1="0" y1="32" x2="50" y2="32" stroke="#ffffff" strokeWidth="2" />
                      <line x1="12" y1="0" x2="24" y2="45" stroke="#000000" strokeWidth="0.8" />
                      <line x1="32" y1="0" x2="40" y2="45" stroke="#000000" strokeWidth="0.8" />
                    </svg>
                  </div>
                  <div className="text-[8.5px] leading-tight mt-0.5">
                    <strong className="block">D. Siltstone</strong>
                    <span>or silty shale with sandstone layers</span>
                  </div>
                </div>

                {/* Class E */}
                <div
                  onClick={() => handleSelectBand(flyschBands[4])}
                  className={`p-1 flex flex-col items-center text-center justify-between cursor-pointer ${
                    selectedFlyschClass === 'E' ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-11 border border-black bg-white overflow-hidden">
                    <svg viewBox="0 0 50 45" className="w-full h-full">
                      <rect width="50" height="45" fill="#aaaaaa" />
                      <line x1="0" y1="10" x2="50" y2="10" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 2" />
                      <line x1="0" y1="25" x2="50" y2="25" stroke="#ffffff" strokeWidth="1" strokeDasharray="6 3" />
                      <line x1="0" y1="38" x2="50" y2="38" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 2" />
                    </svg>
                  </div>
                  <div className="text-[8.5px] leading-tight mt-0.5">
                    <strong className="block">E. Weak siltstone</strong>
                    <span>or clayey shale with sandstone layers</span>
                  </div>
                </div>
              </div>

              {/* Row 3: Class F with Explanatory Box and Tectonic Arrows */}
              <div className="h-[118px] p-2 flex items-center gap-2">
                {/* Left Note Box */}
                <div className="w-1/2 p-1.5 border border-black bg-[#fafafa] text-[8px] leading-tight text-black">
                  <p>
                    <strong>C, D, E and G</strong> - may be more or less folded than illustrated but this does not change the strength. Tectonic deformation, faulting and loss of continuity moves these categories to <strong>F and H</strong>.
                  </p>
                </div>

                {/* Arrows pointing down to F */}
                <div className="flex flex-col items-center justify-center font-mono font-bold text-xs text-black">
                  <span>►►</span>
                </div>

                {/* Class F */}
                <div
                  onClick={() => handleSelectBand(flyschBands[5])}
                  className={`w-1/2 h-full p-1 flex items-center gap-2 cursor-pointer ${
                    selectedFlyschClass === 'F' ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-14 h-14 shrink-0 border border-black bg-white overflow-hidden">
                    <svg viewBox="0 0 60 60" className="w-full h-full">
                      <rect width="60" height="60" fill="#ffffff" />
                      <path
                        d="M 2 12 Q 25 3 45 18 T 58 10 M 2 28 Q 20 40 40 24 T 58 35 M 2 45 Q 25 30 50 48"
                        fill="none"
                        stroke="#000000"
                        strokeWidth="1.2"
                      />
                      <polygon points="15,16 28,14 26,22 13,24" fill="#666666" />
                      <polygon points="35,26 48,22 46,32 33,34" fill="#666666" />
                      <polygon points="12,38 24,34 22,44 8,46" fill="#666666" />
                    </svg>
                  </div>
                  <div className="text-[8px] leading-tight">
                    <strong className="block text-black">F. Tectonically deformed,</strong>
                    <span className="text-black">
                      intensively folded/faulted, sheared clayey shale or siltstone with broken and deformed sandstone layers forming an almost chaotic structure
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 4: Classes G and H */}
              <div className="h-[118px] p-2 flex items-center justify-between gap-2">
                {/* Class G */}
                <div
                  onClick={() => handleSelectBand(flyschBands[6])}
                  className={`w-5/12 h-full p-1 flex items-center gap-2 cursor-pointer ${
                    selectedFlyschClass === 'G' ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-14 h-14 shrink-0 border border-black bg-white overflow-hidden">
                    <svg viewBox="0 0 60 60" className="w-full h-full">
                      <rect width="60" height="60" fill="#888888" />
                      <line x1="0" y1="10" x2="60" y2="10" stroke="#ffffff" strokeWidth="1" />
                      <line x1="0" y1="20" x2="60" y2="20" stroke="#ffffff" strokeWidth="1" />
                      <line x1="0" y1="30" x2="60" y2="30" stroke="#ffffff" strokeWidth="1" />
                      <line x1="0" y1="40" x2="60" y2="40" stroke="#ffffff" strokeWidth="1" />
                      <line x1="0" y1="50" x2="60" y2="50" stroke="#ffffff" strokeWidth="1" />
                    </svg>
                  </div>
                  <div className="text-[8.5px] leading-tight">
                    <strong className="block text-black">G. Undisturbed silty</strong>
                    <span className="text-black">or clayey shale with or without a few very thin sandstone layers</span>
                  </div>
                </div>

                {/* Arrow pointing G -> H */}
                <div className="font-mono font-bold text-xs text-black">
                  <span>════►</span>
                </div>

                {/* Class H */}
                <div
                  onClick={() => handleSelectBand(flyschBands[7])}
                  className={`w-5/12 h-full p-1 flex items-center gap-2 cursor-pointer ${
                    selectedFlyschClass === 'H' ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-14 h-14 shrink-0 border border-black bg-white overflow-hidden">
                    <svg viewBox="0 0 60 60" className="w-full h-full">
                      <rect width="60" height="60" fill="#ffffff" />
                      <path
                        d="M 2 8 C 15 20, 25 5, 58 12 M 2 24 C 20 15, 30 35, 58 20 M 2 40 C 15 50, 35 30, 58 45"
                        fill="none"
                        stroke="#000000"
                        strokeWidth="1.2"
                      />
                      <ellipse cx="18" cy="32" rx="8" ry="4" fill="#888888" />
                      <ellipse cx="42" cy="36" rx="10" ry="5" fill="#888888" />
                    </svg>
                  </div>
                  <div className="text-[8.5px] leading-tight">
                    <strong className="block text-black">H. Tectonically deformed</strong>
                    <span className="text-black">
                      silty or clayey shale forming a chaotic structure with pockets of clay. Thin layers transformed into small rock pieces.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 6 cols: Flysch GSI Contour SVG Chart with Hatched Zones & Occurrence Cloud Bands */}
            <div className="col-span-6 relative bg-white select-none">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${totalSvgWidth} ${totalSvgHeight}`}
                className="w-full h-[472px] cursor-crosshair bg-white block"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
              >
                <defs>
                  {/* Diagonal Hatching Pattern for N/A Zones */}
                  <pattern
                    id="hatchPatternFlyschBlack"
                    width="10"
                    height="10"
                    patternTransform="rotate(45 0 0)"
                    patternUnits="userSpaceOnUse"
                  >
                    <line x1="0" y1="0" x2="0" y2="10" stroke="#000000" strokeWidth="0.8" />
                  </pattern>

                  {/* Gradient for dark cloud occurrence bands */}
                  <radialGradient id="flyschCloudGradOriginal">
                    <stop offset="0%" stopColor="#111111" stopOpacity="0.9" />
                    <stop offset="60%" stopColor="#444444" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#888888" stopOpacity="0.1" />
                  </radialGradient>
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

                {/* Horizontal Row Grid Lines (4 rows) */}
                {[1, 2, 3].map((i) => (
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

                {/* ============================================================ */}
                {/* HATCHED N/A AREAS EXACTLY AS IN IMAGE 2                       */}
                {/* ============================================================ */}
                {/* Row 1 N/A: left of A and right of A */}
                <rect x="0" y="0" width="100" height="118" fill="url(#hatchPatternFlyschBlack)" stroke="#000000" strokeWidth="0.8" />
                <rect x="290" y="0" width="210" height="118" fill="url(#hatchPatternFlyschBlack)" stroke="#000000" strokeWidth="0.8" />

                {/* Row 2 N/A: left of B and right of E */}
                <rect x="0" y="118" width="100" height="118" fill="url(#hatchPatternFlyschBlack)" stroke="#000000" strokeWidth="0.8" />
                <rect x="400" y="118" width="100" height="118" fill="url(#hatchPatternFlyschBlack)" stroke="#000000" strokeWidth="0.8" />

                {/* Row 3 N/A: left of F (Very Good, Good, Fair) */}
                <rect x="0" y="236" width="270" height="118" fill="url(#hatchPatternFlyschBlack)" stroke="#000000" strokeWidth="0.8" />

                {/* Row 4 N/A: left of G & H (Very Good, Good) */}
                <rect x="0" y="354" width="220" height="118" fill="url(#hatchPatternFlyschBlack)" stroke="#000000" strokeWidth="0.8" />

                {/* ============================================================ */}
                {/* DIAGONAL GSI CONTOUR LINES: 70, 60, 50, 40, 30, 20, 10       */}
                {/* All isolines run from bottom-left to top-right ('/')         */}
                {/* ============================================================ */}

                {/* 70 Contour */}
                <path d="M 50,118 L 140,0" fill="none" stroke="#000000" strokeWidth="1.8" />
                <text x="85" y="45" fill="#000000" fontSize="12" fontWeight="bold">
                  70
                </text>

                {/* 60 Contour */}
                <path d="M 90,180 L 200,0" fill="none" stroke="#000000" strokeWidth="1.8" />
                <text x="135" y="80" fill="#000000" fontSize="12" fontWeight="bold">
                  60
                </text>

                {/* 50 Contour */}
                <path d="M 130,236 L 265,0" fill="none" stroke="#000000" strokeWidth="1.8" />
                <text x="185" y="115" fill="#000000" fontSize="12" fontWeight="bold">
                  50
                </text>

                {/* 40 Contour */}
                <path d="M 180,310 L 335,0" fill="none" stroke="#000000" strokeWidth="1.8" />
                <text x="245" y="150" fill="#000000" fontSize="12" fontWeight="bold">
                  40
                </text>

                {/* 30 Contour */}
                <path d="M 230,420 L 410,0" fill="none" stroke="#000000" strokeWidth="1.8" />
                <text x="305" y="205" fill="#000000" fontSize="12" fontWeight="bold">
                  30
                </text>

                {/* 20 Contour */}
                <path d="M 290,472 L 485,0" fill="none" stroke="#000000" strokeWidth="1.8" />
                <text x="375" y="255" fill="#000000" fontSize="12" fontWeight="bold">
                  20
                </text>

                {/* 10 Contour */}
                <path d="M 380,472 L 500,180" fill="none" stroke="#000000" strokeWidth="1.8" />
                <text x="435" y="330" fill="#000000" fontSize="12" fontWeight="bold">
                  10
                </text>

                {/* Shaded Occurrence Cloud Bands for Flysch Classes A, B, C, D, E, F, G, H */}
                {flyschBands.map((band) => {
                  const isSelected = selectedFlyschClass === band.id;
                  return (
                    <g key={band.id}>
                      {/* Dark Cloud Gradient Ellipse */}
                      <ellipse
                        cx={band.cx}
                        cy={band.cy}
                        rx={band.rx}
                        ry={band.ry}
                        fill="url(#flyschCloudGradOriginal)"
                        stroke={isSelected ? '#2563eb' : '#000000'}
                        strokeWidth={isSelected ? 2.5 : 1}
                      />

                      {/* White Letter Label in Center of Cloud */}
                      <text
                        x={band.cx}
                        y={band.cy + 5}
                        fill="#ffffff"
                        fontSize="16"
                        fontWeight="bold"
                        fontStyle="italic"
                        textAnchor="middle"
                        filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.9))"
                      >
                        {band.label}
                      </text>
                    </g>
                  );
                })}

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

        {/* Footer legend matching image 2 verbatim */}
        <div className="p-1.5 border-t border-black bg-[#fafafa] flex items-center gap-2 font-mono text-[10px] text-black">
          <span className="font-bold">═════► :</span>
          <span>Means deformation after tectonic disturbance</span>
        </div>
      </div>
    </div>
  );
};
