import React, { useState } from 'react';
import { RussoSupportResult } from '../../types';
import { Eye, Layers, Compass, ZoomIn, Info, CheckCircle2 } from 'lucide-react';

interface RussoFourQuadrantPlateProps {
  russoResult: RussoSupportResult;
  onUpdateGsi?: (gsi: number) => void;
  onUpdateDepth?: (depth: number) => void;
  onUpdateUcs?: (ucs: number) => void;
  lang: 'fa' | 'en';
}

export const RussoFourQuadrantPlate: React.FC<RussoFourQuadrantPlateProps> = ({
  russoResult,
  onUpdateGsi,
  onUpdateDepth,
  onUpdateUcs,
  lang,
}) => {
  const isFa = lang === 'fa';
  const [themeMode, setThemeMode] = useState<'paper' | 'dark'>('paper');
  const [showLiveTrace, setShowLiveTrace] = useState<boolean>(true);

  // Core values
  const currentGsi = russoResult.gsi;
  const currentDepth = russoResult.depth;
  const currentUcs = russoResult.ucs;
  const currentScm = russoResult.rockMassStrengthScm;
  const currentIc = russoResult.competencyIndexIc;
  const currentRmr = russoResult.estimatedRmr;

  // Coordinate functions (ViewBox: 0 0 1020 895)
  // Quad III (Top-Left): x in [85, 535], y in [80, 430]
  // Quad IV (Top-Right): x in [535, 970], y in [80, 430]
  // Quad II (Bottom-Left): x in [85, 535], y in [430, 770]
  // Quad I (Bottom-Right): x in [535, 970], y in [430, 770]

  const xScm = (scm: number) => {
    const clamped = Math.max(0.1, Math.min(100, scm));
    const logVal = Math.log10(clamped); // -1 to 2
    return 85 + ((logVal + 1) / 3) * (535 - 85);
  };

  const yIc = (ic: number) => {
    const clamped = Math.max(0.01, Math.min(10, ic));
    const logVal = Math.log10(clamped); // -2 to 1
    return 430 - ((logVal + 2) / 3) * (430 - 80);
  };

  const yGsi = (gsi: number) => {
    const clamped = Math.max(0, Math.min(100, gsi));
    return 770 - (clamped / 100) * (770 - 430);
  };

  const xRmr = (rmr: number) => {
    const clamped = Math.max(0, Math.min(100, rmr));
    return 535 + ((100 - clamped) / 100) * (970 - 535);
  };

  const xJc = (jc: number) => {
    const clamped = Math.max(0, Math.min(10, jc));
    return 535 + ((10 - clamped) / 10) * (970 - 535);
  };

  // Color palette depending on theme
  const isPaper = themeMode === 'paper';
  const bgFill = isPaper ? '#fbfbfa' : '#090d16';
  const plateBorder = isPaper ? '#1e293b' : '#334155';
  const axisColor = isPaper ? '#0f172a' : '#94a3b8';
  const gridColor = isPaper ? '#e2e8f0' : '#1e293b';
  const textDark = isPaper ? '#0f172a' : '#f8fafc';
  const textMuted = isPaper ? '#334155' : '#94a3b8';
  const curveColor = isPaper ? '#1e293b' : '#64748b';
  const magentaLine = isPaper ? '#c026d3' : '#e879f9';
  const blueZoneLine = isPaper ? '#2563eb' : '#38bdf8';
  const redHatchColor = isPaper ? '#dc2626' : '#f87171';
  const purpleHatchColor = isPaper ? '#7c3aed' : '#a78bfa';

  // Overburden lines for Quad III: IC = Scm / (0.05 * H)
  const overburdenCurves = [
    { H: 50, label: 'H=50m' },
    { H: 100, label: '100' },
    { H: 200, label: '200' },
    { H: 300, label: '300' },
    { H: 500, label: '500' },
    { H: 750, label: '750' },
    { H: 1000, label: '1000' },
    { H: 2000, label: '2000' },
  ];

  // Intact strength curves for Quad II: Scm = Sc * s^a
  const ucsCurves = [
    { ucs: 10, label: 'σc=10MPa' },
    { ucs: 20, label: '20' },
    { ucs: 30, label: '30' },
    { ucs: 40, label: '40' },
    { ucs: 50, label: '50' },
    { ucs: 70, label: '70' },
    { ucs: 100, label: '100' },
    { ucs: 150, label: '150' },
    { ucs: 200, label: '200' },
  ];

  // Block volume curves for Quad I
  const vbCurves = [
    { name: 'Vb=10m3', baseGsi: 92, label: 'Vb=10m3' },
    { name: '1m3', baseGsi: 82, label: '1m3' },
    { name: '100dm3', baseGsi: 72, label: '100dm3' },
    { name: '10dm3', baseGsi: 62, label: '10dm3' },
    { name: '1dm3', baseGsi: 50, label: '1dm3' },
    { name: '100cm3', baseGsi: 38, label: '100cm3' },
    { name: '10cm3', baseGsi: 28, label: '10cm3' },
    { name: 'Vb=1cm3', baseGsi: 18, label: 'Vb=1cm3' },
  ];

  // Joint conditions vertical annotations for Quad I
  const jcDescriptors = [
    { jc: 9.8, label: 'Small, rough fissures' },
    { jc: 6.0, label: 'Undulating, rough short joints' },
    { jc: 3.0, label: 'Undulating, rough joints' },
    { jc: 1.8, label: 'Slightly undulating, rough joints' },
    { jc: 1.0, label: 'Smooth, planar joints' },
    { jc: 0.6, label: 'Weathered joint walls' },
    { jc: 0.25, label: 'Clay coated joints' },
  ];

  // Interactive click on chart
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 1020;
    const clickY = ((e.clientY - rect.top) / rect.height) * 895;

    // Click in Quad IV (RMR area) -> estimate GSI
    if (clickX >= 535 && clickX <= 970 && clickY >= 80 && clickY <= 430) {
      const clickedRmr = 100 - ((clickX - 535) / (970 - 535)) * 100;
      const mappedGsi = Math.max(5, Math.min(95, Math.round((clickedRmr - 20) / 0.65)));
      onUpdateGsi?.(mappedGsi);
    }
    // Click in Quad II or I (GSI area)
    else if (clickY >= 430 && clickY <= 770) {
      const clickedGsi = Math.round(((770 - clickY) / (770 - 430)) * 100);
      onUpdateGsi?.(Math.max(5, Math.min(100, clickedGsi)));
    }
  };

  return (
    <div className="space-y-3">
      {/* Control bar above plate */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>{isFa ? 'بازسازی اصیل نمودار ۴ بخشی روسو (Russo Multiple Graph):' : 'Authentic Russo 4-Quadrant Graph Facsimile:'}</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold">
            ST = {russoResult.sectionType.replace('ST = ', '')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme selector */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setThemeMode('paper')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                themeMode === 'paper'
                  ? 'bg-slate-100 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="پوسته اصیل مقاله (کاغذی علمی)"
            >
              {isFa ? '📄 پوسته مأخذ اصلی (سفید)' : '📄 Authentic Paper'}
            </button>
            <button
              onClick={() => setThemeMode('dark')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                themeMode === 'dark'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="پوسته تیره مهندسی مدرن"
            >
              {isFa ? '🌙 تیره مدرن' : '🌙 Modern Dark'}
            </button>
          </div>

          {/* Live trace toggle */}
          <button
            onClick={() => setShowLiveTrace(!showLiveTrace)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
              showLiveTrace
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isFa ? 'نقطه کار پروژه' : 'Live Project Point'}</span>
          </button>
        </div>
      </div>

      {/* THE 4-QUADRANT MASTER SVG */}
      <div className={`relative w-full rounded-2xl border ${isPaper ? 'border-slate-300 shadow-xl' : 'border-slate-800 shadow-2xl'} overflow-hidden transition-all duration-300 p-2 sm:p-4`} style={{ backgroundColor: bgFill }}>
        <svg
          viewBox="0 0 1020 895"
          dir="ltr"
          className="w-full h-auto select-none cursor-crosshair font-sans"
          style={{ maxHeight: '760px' }}
          onClick={handleSvgClick}
        >
          <defs>
            {/* Red Hatching Pattern for Severe Spalling / Rockburst */}
            <pattern id="russoRedHatch" width="8" height="8" patternUnits="userSpaceOnUse">
              <line x1="4" y1="0" x2="4" y2="8" stroke={redHatchColor} strokeWidth="1.2" />
            </pattern>

            {/* Purple Diagonal Hatching for Improbable Condition */}
            <pattern id="russoPurpleHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke={purpleHatchColor} strokeWidth="1.2" strokeOpacity="0.75" />
            </pattern>

            {/* Cross-hatching pattern for Caving C2/F */}
            <pattern id="russoCavingHatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="12" stroke={blueZoneLine} strokeWidth="1" strokeOpacity="0.5" />
              <line x1="0" y1="0" x2="12" y2="0" stroke={blueZoneLine} strokeWidth="1" strokeOpacity="0.5" />
            </pattern>

            {/* Working Point Glowing Filter */}
            <filter id="traceGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#818cf8" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* BACKGROUND CANVAS */}
          <rect x="0" y="0" width="1020" height="895" fill={bgFill} />

          {/* CHART OUTER FRAME */}
          <rect x="85" y="80" width="885" height="690" fill="none" stroke={plateBorder} strokeWidth="2.5" />

          {/* MAIN DIVIDING AXES (CENTER CROSS) */}
          <line x1="535" y1="80" x2="535" y2="770" stroke={plateBorder} strokeWidth="2.2" />
          <line x1="85" y1="430" x2="970" y2="430" stroke={plateBorder} strokeWidth="2.2" />

          {/* ========================================================================= */}
          {/* 1. TOP QUADRANT TITLES (GENEROUS PADDING, ZERO COLLISION WITH TICKS)       */}
          {/* ========================================================================= */}

          {/* Top-Left: Quadrant III */}
          <text x="85" y="24" fill={textDark} fontSize="12" fontWeight="bold" letterSpacing="0.2">
            III - Rock mass strength (σcm) + in situ stress (2·γ·H) = Competency (IC)
          </text>
          <text x="85" y="42" fill={textMuted} fontSize="10" fontWeight="600">
            {isFa ? 'ربع ۳: شاخص شایستگی توده‌سنگ (IC) بر مبنای نسبت مقاومت به تنش روباره' : 'Quad III: Rock Mass Competency Index from strength-to-stress ratio'}
          </text>

          {/* Top-Right: Quadrant IV */}
          <text x="535" y="24" fill={isPaper ? '#b91c1c' : '#f87171'} fontSize="12" fontWeight="bold" letterSpacing="0.2">
            IV - Competency (IC) + self-supporting capacity (RMR) = Excavation behaviour
          </text>
          <text x="535" y="42" fill={textMuted} fontSize="10" fontWeight="600">
            {isFa ? 'ربع ۴: ماتریس مخاطرات حفاری و تعیین رده مقطع نگهداری روسو (ST)' : 'Quad IV: Excavation behaviour matrix & Russo Section Types (ST)'}
          </text>

          {/* ========================================================================= */}
          {/* 2. QUADRANT III (TOP-LEFT): COMPETENCY INDEX IC & ISO-OVERBURDEN CURVES   */}
          {/* ========================================================================= */}

          {/* Quad III Ticks and Axes */}
          {/* Left Y-axis IC Logarithmic Ticks */}
          {[0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0].map((icVal) => {
            const y = yIc(icVal);
            const isMajor = icVal === 0.01 || icVal === 0.1 || icVal === 1.0 || icVal === 10.0;
            return (
              <g key={`ic-tick-${icVal}`}>
                <line x1={isMajor ? 76 : 80} y1={y} x2="85" y2={y} stroke={axisColor} strokeWidth={isMajor ? 1.5 : 0.8} />
                {isMajor && (
                  <text x="73" y={y + 4} fill={textDark} fontSize="10" fontWeight="bold" textAnchor="end" fontFamily="monospace">
                    {icVal >= 1 ? icVal.toFixed(0) : icVal.toString()}
                  </text>
                )}
              </g>
            );
          })}
          {/* Y-axis Label */}
          <text x="32" y="255" fill={textDark} fontSize="11" fontWeight="bold" transform="rotate(-90 32 255)" textAnchor="middle">
            IC = σcm / (2γH)
          </text>

          {/* Bottom Axis Scm Ticks in Quad III */}
          {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((scmVal) => {
            const x = xScm(scmVal);
            const isMajor = scmVal === 0.1 || scmVal === 1.0 || scmVal === 10.0 || scmVal === 100.0;
            return (
              <line key={`scm-tick-top-${scmVal}`} x1={x} y1="426" x2={x} y2={isMajor ? 434 : 430} stroke={axisColor} strokeWidth={isMajor ? 1.5 : 0.8} />
            );
          })}

          {/* Simplified Assumptions Box */}
          <rect x="92" y="88" width="135" height="42" fill={isPaper ? '#ffffff' : '#0f172a'} stroke={isPaper ? '#94a3b8' : '#334155'} strokeWidth="1" rx="4" />
          <text x="98" y="102" fill={textDark} fontSize="9.5" fontStyle="italic" fontWeight="bold">
            Simplified assumptions:
          </text>
          <text x="98" y="118" fill={textDark} fontSize="9.5" fontFamily="monospace">
            γ=0.025MN/m³, k=1
          </text>
          <text x="145" y="145" fill={textDark} fontSize="10" fontStyle="italic" fontWeight="600">
            Iso-overburden (H) curves
          </text>

          {/* Diagonal Iso-Overburden Lines H: IC = Scm / (0.05 * H) */}
          {overburdenCurves.map((item) => {
            const scmStart = Math.max(0.1, 0.0005 * item.H);
            const icStart = scmStart / (0.05 * item.H);
            const scmEnd = Math.min(100, 0.5 * item.H);
            const icEnd = scmEnd / (0.05 * item.H);

            const x1 = xScm(scmStart);
            const y1 = yIc(icStart);
            const x2 = xScm(scmEnd);
            const y2 = yIc(icEnd);

            return (
              <g key={`h-curve-${item.H}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={curveColor} strokeWidth="1.1" />
                <rect x={x2 - 32} y={y2 - 11} width="30" height="12" fill={bgFill} fillOpacity="0.82" rx="2" />
                <text
                  x={x2 - 4}
                  y={y2 - 2}
                  fill={textDark}
                  fontSize="8.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {item.label}
                </text>
              </g>
            );
          })}

          {/* Magenta Horizontal Dashed Lines dividing Elastic / Plastic Domains */}
          {/* IC = 1.0 Boundary */}
          <line x1="85" y1={yIc(1.0)} x2="535" y2={yIc(1.0)} stroke={magentaLine} strokeWidth="1.8" strokeDasharray="6 4" />
          {/* IC = 0.40 Boundary (c -> d) */}
          <line x1="85" y1={yIc(0.40)} x2="535" y2={yIc(0.40)} stroke={magentaLine} strokeWidth="1.4" strokeDasharray="4 4" />
          {/* IC = 0.20 Boundary (d -> e) */}
          <line x1="85" y1={yIc(0.20)} x2="535" y2={yIc(0.20)} stroke={magentaLine} strokeWidth="1.4" strokeDasharray="4 4" />

          {/* Domain Annotations on Quad III */}
          <text x="370" y={yIc(1.0) - 24} fill="#7c3aed" fontSize="10" fontWeight="bold">
            a, b
          </text>
          <text x="370" y={yIc(1.0) - 10} fill="#2563eb" fontSize="10.5" fontWeight="bold">
            Elastic Domain
          </text>
          {/* Upward arrow */}
          <path d={`M 475 ${yIc(1.0) - 6} L 475 ${yIc(1.0) - 34} M 472 ${yIc(1.0) - 30} L 475 ${yIc(1.0) - 36} L 478 ${yIc(1.0) - 30}`} stroke={magentaLine} strokeWidth="1.6" fill="none" />

          <text x="370" y={yIc(1.0) + 18} fill="#c026d3" fontSize="10.5" fontWeight="bold">
            Plastic Domain
          </text>
          {/* Downward arrow */}
          <path d={`M 475 ${yIc(1.0) + 20} L 475 ${yIc(1.0) + 48} M 472 ${yIc(1.0) + 44} L 475 ${yIc(1.0) + 50} L 478 ${yIc(1.0) + 44}`} stroke={magentaLine} strokeWidth="1.6" fill="none" />

          <text x="465" y={(yIc(1.0) + yIc(0.40)) / 2 + 4} fill={textMuted} fontSize="10" fontWeight="bold">
            c
          </text>
          <text x="465" y={(yIc(0.40) + yIc(0.20)) / 2 + 4} fill={textMuted} fontSize="10" fontWeight="bold">
            d
          </text>
          <text x="465" y={(yIc(0.20) + 430) / 2 + 4} fill={textMuted} fontSize="10" fontWeight="bold">
            e
          </text>

          {/* Center Vertical Axis IC Ticks (between Quad III and Quad IV) */}
          {[0.01, 0.02, 0.05, 0.1, 0.2, 0.4, 1.0, 2.0, 5.0, 10.0].map((icVal) => {
            const y = yIc(icVal);
            const isMajor = icVal === 0.01 || icVal === 0.1 || icVal === 0.2 || icVal === 0.4 || icVal === 1.0 || icVal === 10.0;
            return (
              <g key={`ic-center-tick-${icVal}`}>
                <line x1="530" y1={y} x2="540" y2={y} stroke={axisColor} strokeWidth={isMajor ? 1.5 : 0.8} />
                {isMajor && (
                  <text x="527" y={y + 3.5} fill={textDark} fontSize="8.5" fontWeight="bold" textAnchor="end" fontFamily="monospace">
                    {icVal >= 1 ? icVal.toFixed(0) : icVal.toString()}
                  </text>
                )}
              </g>
            );
          })}

          {/* ========================================================================= */}
          {/* 3. QUADRANT IV (TOP-RIGHT): POTENTIAL HAZARDS & ST EXCAVATION BEHAVIOUR   */}
          {/* ========================================================================= */}

          {/* Top Axis: RMR running 100 to 0 from LEFT to RIGHT */}
          {[100, 80, 60, 40, 20, 0].map((rmrVal) => {
            const x = xRmr(rmrVal);
            return (
              <g key={`rmr-tick-${rmrVal}`}>
                <line x1={x} y1="74" x2={x} y2="80" stroke={axisColor} strokeWidth="1.6" />
                <text x={x} y="70" fill={textDark} fontSize="10.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  {rmrVal}
                </text>
              </g>
            );
          })}
          {/* Intermediate RMR Ticks */}
          {[90, 70, 50, 30, 10].map((rmrVal) => (
            <line key={`rmr-sub-${rmrVal}`} x1={xRmr(rmrVal)} y1="77" x2={xRmr(rmrVal)} y2="80" stroke={axisColor} strokeWidth="0.8" />
          ))}
          {/* RMR Top Header Label */}
          <text x="752" y="56" fill={textDark} fontSize="11" fontWeight="bold" textAnchor="middle">
            RMR (Bieniawski)
          </text>

          {/* Sub-Header: Individuation of potential hazards */}
          <rect x="635" y="92" width="234" height="20" fill={bgFill} fillOpacity="0.88" rx="4" />
          <text x="752" y="106" fill={textDark} fontSize="10.5" fontStyle="italic" fontWeight="600" textAnchor="middle">
            Individuation of potential hazards
          </text>

          {/* Horizontal Magenta line continued into Quad IV at IC = 1.0 */}
          <line x1="535" y1={yIc(1.0)} x2="970" y2={yIc(1.0)} stroke={magentaLine} strokeWidth="1.8" strokeDasharray="6 4" />

          {/* Horizontal dividing line at IC = 0.40 across C1/C2 and D */}
          <line x1="535" y1={yIc(0.40)} x2={xRmr(20)} y2={yIc(0.40)} stroke="#2563eb" strokeWidth="1.4" strokeDasharray="5 3" />

          {/* Horizontal dividing line at IC = 0.20 across D and E */}
          <line x1="535" y1={yIc(0.20)} x2={xRmr(20)} y2={yIc(0.20)} stroke="#2563eb" strokeWidth="1.4" strokeDasharray="5 3" />

          {/* Vertical dividing line at RMR = 20 from IC=1.0 down to bottom (bounding Zone F) */}
          <line x1={xRmr(20)} y1={yIc(1.0)} x2={xRmr(20)} y2="430" stroke="#2563eb" strokeWidth="1.4" strokeDasharray="5 3" />

          {/* Vertical dividing line at RMR = 40 between C1 and C2 */}
          <line x1={xRmr(40)} y1={yIc(1.0)} x2={xRmr(40)} y2={yIc(0.40)} stroke="#2563eb" strokeWidth="1.4" strokeDasharray="5 3" />

          {/* Vertical dividing line at RMR = 60 between Spalling and C1 */}
          <line x1={xRmr(60)} y1={yIc(1.0)} x2={xRmr(60)} y2={yIc(0.40)} stroke="#b91c1c" strokeWidth="1.4" strokeDasharray="5 3" />

          {/* --- ZONE A: STABLE (a) --- */}
          {/* RMR in [75, 100], IC >= 1.0 */}
          <rect
            x={xRmr(100)}
            y={80}
            width={xRmr(75) - xRmr(100)}
            height={yIc(1.0) - 80}
            fill="#3b82f6"
            fillOpacity={isPaper ? 0.06 : 0.15}
            stroke="#2563eb"
            strokeWidth="1.5"
            strokeDasharray="5 3"
          />
          <text x={(xRmr(100) + xRmr(75)) / 2} y="125" fill="#2563eb" fontSize="10.5" fontWeight="bold" textAnchor="middle">
            Stable (a)
          </text>
          <text x={(xRmr(100) + xRmr(75)) / 2} y="160" fill="#1d4ed8" fontSize="24" fontWeight="bold" textAnchor="middle">
            A
          </text>

          {/* --- ZONE B: INSTABLE WEDGES (b) --- */}
          {/* RMR in [50, 75], IC >= 1.0 */}
          <rect
            x={xRmr(75)}
            y={80}
            width={xRmr(50) - xRmr(75)}
            height={yIc(1.0) - 80}
            fill="#06b6d4"
            fillOpacity={isPaper ? 0.06 : 0.15}
            stroke="#2563eb"
            strokeWidth="1.5"
            strokeDasharray="5 3"
          />
          <text x={(xRmr(75) + xRmr(50)) / 2} y="125" fill={isPaper ? '#c026d3' : '#e879f9'} fontSize="10.5" fontWeight="bold" textAnchor="middle">
            Instable Wedges (b)
          </text>
          <text x={(xRmr(75) + xRmr(50)) / 2} y="160" fill="#0284c7" fontSize="24" fontWeight="bold" textAnchor="middle">
            B
          </text>

          {/* --- TOP-RIGHT IMPROBABLE CONDITION ZONE --- */}
          {/* RMR in [0, 50], IC >= 1.0 */}
          <rect
            x={xRmr(50)}
            y={80}
            width={xRmr(0) - xRmr(50)}
            height={yIc(1.0) - 80}
            fill="url(#russoPurpleHatch)"
            stroke="#7c3aed"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <rect x={835} y={95} width="85" height="30" fill={bgFill} rx="3" fillOpacity="0.88" />
          <text x="877" y="108" fill="#6d28d9" fontSize="9.5" fontStyle="italic" fontWeight="bold" textAnchor="middle">
            [improbable]
          </text>
          <text x="877" y="121" fill="#6d28d9" fontSize="9.5" fontStyle="italic" fontWeight="bold" textAnchor="middle">
            [condition]
          </text>

          {/* --- SEVERE SPALLING & ROCKBURST (*) RED BOX --- */}
          {/* RMR approx 100 down to 60, IC from 1.0 down to 0.40 */}
          <g>
            {/* Box frame */}
            <rect
              x={535}
              y={yIc(1.0)}
              width={xRmr(60) - 535}
              height={yIc(0.40) - yIc(1.0)}
              fill="url(#russoRedHatch)"
              stroke="#b91c1c"
              strokeWidth="2.2"
              strokeDasharray="6 3"
            />
            {/* Diagonal boundary dividing upper-right Minor C1 from main burst zone */}
            <line x1={535} y1={yIc(1.0)} x2={xRmr(60)} y2={yIc(0.40)} stroke="#b91c1c" strokeWidth="1.6" strokeDasharray="4 3" />

            {/* Minor C1 upper wedge */}
            <rect x={645} y={yIc(0.85)} width="54" height="18" fill={bgFill} fillOpacity="0.9" rx="3" stroke="#b91c1c" strokeWidth="0.8" />
            <text x={672} y={yIc(0.85) + 13} fill="#b91c1c" fontSize="10" fontStyle="italic" fontWeight="bold" textAnchor="middle">
              Minor C1
            </text>

            {/* Main Red Text: Severe Spalling, Rockburst (*) */}
            <rect x={542} y={(yIc(1.0) + yIc(0.40)) / 2 - 20} width="96" height="40" fill={bgFill} fillOpacity="0.92" rx="4" stroke="#b91c1c" strokeWidth="1" />
            <text x={590} y={(yIc(1.0) + yIc(0.40)) / 2 - 6} fill="#b91c1c" fontSize="10.5" fontWeight="bold" textAnchor="middle">
              Severe Spalling
            </text>
            <text x={590} y={(yIc(1.0) + yIc(0.40)) / 2 + 10} fill="#b91c1c" fontSize="10" fontWeight="bold" textAnchor="middle">
              Rockburst (*)
            </text>

            {/* Downward dashed arrows from Spalling box into D */}
            <path d={`M 575 ${yIc(0.40)} L 575 ${yIc(0.40) + 14} M 572 ${yIc(0.40) + 10} L 575 ${yIc(0.40) + 15} L 578 ${yIc(0.40) + 10}`} stroke={textDark} strokeWidth="1.6" fill="none" />
            <path d={`M 645 ${yIc(0.40)} L 645 ${yIc(0.40) + 14} M 642 ${yIc(0.40) + 10} L 645 ${yIc(0.40) + 15} L 648 ${yIc(0.40) + 10}`} stroke={textDark} strokeWidth="1.6" fill="none" />
          </g>

          {/* --- ZONE C1: OVERSTRESSING & YIELDING --- */}
          {/* RMR in [40, 60], IC in [0.40, 1.0] */}
          <g>
            <rect
              x={xRmr(60)}
              y={yIc(1.0)}
              width={xRmr(40) - xRmr(60)}
              height={yIc(0.40) - yIc(1.0)}
              fill="#f59e0b"
              fillOpacity={isPaper ? 0.05 : 0.12}
              stroke="#f59e0b"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
            <text x={(xRmr(60) + xRmr(40)) / 2} y={(yIc(1.0) + yIc(0.40)) / 2 + 8} fill={textDark} fontSize="26" fontWeight="bold" textAnchor="middle">
              C1
            </text>

            {/* Four arrows radiating from C1 */}
            {/* Green dashed arrow up-right to B */}
            <path d={`M 760 ${(yIc(1.0) + yIc(0.40)) / 2 - 10} L 780 ${yIc(1.0) - 15} M 774 ${yIc(1.0) - 15} L 780 ${yIc(1.0) - 15} L 782 ${yIc(1.0) - 22}`} stroke="#16a34a" strokeWidth="1.6" strokeDasharray="3 2" fill="none" />
            {/* Black arrow left to Spalling */}
            <path d={`M 718 ${(yIc(1.0) + yIc(0.40)) / 2} L 702 ${(yIc(1.0) + yIc(0.40)) / 2} M 707 ${(yIc(1.0) + yIc(0.40)) / 2 - 4} L 701 ${(yIc(1.0) + yIc(0.40)) / 2} L 707 ${(yIc(1.0) + yIc(0.40)) / 2 + 4}`} stroke={textDark} strokeWidth="1.6" strokeDasharray="3 2" fill="none" />
            {/* Black arrow right to C2 */}
            <path d={`M 776 ${(yIc(1.0) + yIc(0.40)) / 2} L 792 ${(yIc(1.0) + yIc(0.40)) / 2} M 787 ${(yIc(1.0) + yIc(0.40)) / 2 - 4} L 793 ${(yIc(1.0) + yIc(0.40)) / 2} L 787 ${(yIc(1.0) + yIc(0.40)) / 2 + 4}`} stroke={textDark} strokeWidth="1.6" strokeDasharray="3 2" fill="none" />
            {/* Black arrow down to D */}
            <path d={`M 750 ${(yIc(1.0) + yIc(0.40)) / 2 + 14} L 750 ${yIc(0.40) + 12} M 746 ${yIc(0.40) + 8} L 750 ${yIc(0.40) + 13} L 754 ${yIc(0.40) + 8}`} stroke={textDark} strokeWidth="1.6" strokeDasharray="3 2" fill="none" />
          </g>

          {/* --- ZONE C2 & CAVING --- */}
          {/* RMR in [20, 40], IC in [0.40, 1.0] */}
          <g>
            <rect
              x={xRmr(40)}
              y={yIc(1.0)}
              width={xRmr(20) - xRmr(40)}
              height={yIc(0.40) - yIc(1.0)}
              fill="url(#russoCavingHatch)"
              stroke="#2563eb"
              strokeWidth="1.4"
              strokeDasharray="4 3"
            />
            <text x={(xRmr(40) + xRmr(20)) / 2} y={(yIc(1.0) + yIc(0.40)) / 2} fill={textDark} fontSize="22" fontWeight="bold" textAnchor="middle">
              C2
            </text>
            <text x={(xRmr(40) + xRmr(20)) / 2} y={(yIc(1.0) + yIc(0.40)) / 2 + 16} fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle">
              Caving
            </text>
            {/* Arrow right into F */}
            <path d={`M ${xRmr(20) - 10} ${(yIc(1.0) + yIc(0.40)) / 2} L ${xRmr(20) + 12} ${(yIc(1.0) + yIc(0.40)) / 2} M ${xRmr(20) + 7} ${(yIc(1.0) + yIc(0.40)) / 2 - 4} L ${xRmr(20) + 13} ${(yIc(1.0) + yIc(0.40)) / 2} L ${xRmr(20) + 7} ${(yIc(1.0) + yIc(0.40)) / 2 + 4}`} stroke={textDark} strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
          </g>

          {/* --- ZONE D: SEVERE SQUEEZING (IC in [0.20, 0.40]) --- */}
          <g>
            <rect
              x={535}
              y={yIc(0.40)}
              width={xRmr(20) - 535}
              height={yIc(0.20) - yIc(0.40)}
              fill="#f59e0b"
              fillOpacity={isPaper ? 0.05 : 0.12}
              stroke="#2563eb"
              strokeWidth="1.5"
              strokeDasharray="5 3"
            />
            <text x="705" y={(yIc(0.40) + yIc(0.20)) / 2 + 7} fill="#1d4ed8" fontSize="20" fontWeight="bold" textAnchor="middle">
              D
            </text>
            <text x="815" y={(yIc(0.40) + yIc(0.20)) / 2 + 5} fill="#1e40af" fontSize="11" fontStyle="italic" fontWeight="bold" textAnchor="middle">
              severe
            </text>
          </g>

          {/* --- ZONE E: VERY SEVERE SQUEEZING (IC < 0.20) --- */}
          <g>
            <rect
              x={535}
              y={yIc(0.20)}
              width={xRmr(20) - 535}
              height={430 - yIc(0.20)}
              fill="#ef4444"
              fillOpacity={isPaper ? 0.06 : 0.15}
              stroke="#2563eb"
              strokeWidth="1.5"
              strokeDasharray="5 3"
            />
            <text x="705" y={(yIc(0.20) + 430) / 2 + 8} fill="#1d4ed8" fontSize="24" fontWeight="bold" textAnchor="middle">
              E
            </text>
            <text x="815" y={(yIc(0.20) + 430) / 2 + 6} fill="#1e40af" fontSize="12" fontStyle="italic" fontWeight="bold" textAnchor="middle">
              very severe
            </text>
          </g>

          {/* Squeezing (**) Badge in Quad IV */}
          <g>
            <rect
              x="542"
              y={(yIc(0.40) + 430) / 2 - 12}
              width="96"
              height="24"
              fill={bgFill}
              fillOpacity="0.94"
              rx="4"
              stroke="#dc2626"
              strokeWidth="1.3"
              strokeDasharray="3 2"
            />
            <text
              x="590"
              y={(yIc(0.40) + 430) / 2 + 4}
              fill="#dc2626"
              fontSize="10.5"
              fontWeight="bold"
              textAnchor="middle"
            >
              Squeezing (**)
            </text>
          </g>

          {/* --- ZONE F: CATACLASTIC / CRUSHED (RMR in [0, 20], IC < 1.0) --- */}
          <g>
            <rect
              x={xRmr(20)}
              y={yIc(1.0)}
              width={970 - xRmr(20)}
              height={430 - yIc(1.0)}
              fill="url(#russoPurpleHatch)"
              stroke="#2563eb"
              strokeWidth="1.4"
              strokeDasharray="4 3"
            />
            <text x={(xRmr(20) + 970) / 2} y={(yIc(1.0) + 430) / 2 - 4} fill={textDark} fontSize="26" fontWeight="bold" textAnchor="middle">
              F
            </text>
            <text x={(xRmr(20) + 970) / 2} y={(yIc(1.0) + 430) / 2 + 16} fill="#dc2626" fontSize="10" fontStyle="italic" fontWeight="bold" textAnchor="middle">
              Cataclastic
            </text>
          </g>

          {/* --- CURVED RIBBON ARROW CONNECTING RMR TO GSI (IMPROBABLE CONDITION) --- */}
          <g>
            <path
              d="M 660 415 C 615 415 545 435 545 460 C 545 472 565 470 565 455"
              fill="none"
              stroke={isPaper ? '#64748b' : '#94a3b8'}
              strokeWidth="12"
              strokeLinecap="round"
              opacity="0.35"
            />
            <path
              d="M 660 415 C 615 415 545 435 545 460 C 545 472 565 470 565 455"
              fill="none"
              stroke={isPaper ? '#334155' : '#cbd5e1'}
              strokeWidth="1.5"
            />
            {/* Arrow head */}
            <polygon points="570,450 558,456 566,464" fill={isPaper ? '#334155' : '#cbd5e1'} />
            <rect x="550" y="385" width="72" height="26" fill={bgFill} fillOpacity="0.92" rx="3" />
            <text x="586" y="396" fill={textDark} fontSize="8.5" fontStyle="italic" fontWeight="bold" textAnchor="middle">
              [improbable]
            </text>
            <text x="586" y="407" fill={textDark} fontSize="8.5" fontStyle="italic" fontWeight="bold" textAnchor="middle">
              [condition]
            </text>
          </g>

          {/* ========================================================================= */}
          {/* 4. QUADRANT II (BOTTOM-LEFT): INTACT STRENGTH σc & GSI MATRIX            */}
          {/* ========================================================================= */}

          {/* Left Vertical Axis: GSI (0 to 100) */}
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((gsiVal) => {
            const y = yGsi(gsiVal);
            return (
              <g key={`gsi-left-tick-${gsiVal}`}>
                <line x1="77" y1={y} x2="85" y2={y} stroke={axisColor} strokeWidth="1.5" />
                <text x="73" y={y + 3.5} fill={textDark} fontSize="10" fontWeight="bold" textAnchor="end" fontFamily="monospace">
                  {gsiVal}
                </text>
              </g>
            );
          })}
          {/* GSI Left Axis Label */}
          <text x="32" y="600" fill={textDark} fontSize="12" fontWeight="bold" transform="rotate(-90 32 600)" textAnchor="middle">
            GSI
          </text>

          {/* Center Vertical Axis Ticks (Shared with Quad I) */}
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((gsiVal) => {
            const y = yGsi(gsiVal);
            return (
              <g key={`gsi-center-tick-${gsiVal}`}>
                <line x1="530" y1={y} x2="540" y2={y} stroke={axisColor} strokeWidth="1.2" />
                <text x="526" y={y + 3} fill={textDark} fontSize="8.5" fontWeight="bold" textAnchor="end" fontFamily="monospace">
                  {gsiVal}
                </text>
              </g>
            );
          })}
          <text x="512" y="600" fill={textDark} fontSize="11" fontWeight="bold" transform="rotate(-90 512 600)" textAnchor="middle">
            GSI
          </text>

          {/* Bottom Horizontal Axis: Scm (0.1 to 100 MPa) */}
          {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((scmVal) => {
            const x = xScm(scmVal);
            const isMajor = scmVal === 0.1 || scmVal === 1.0 || scmVal === 10.0 || scmVal === 100.0;
            return (
              <g key={`scm-bottom-tick-${scmVal}`}>
                <line x1={x} y1="770" x2={x} y2={isMajor ? 778 : 774} stroke={axisColor} strokeWidth={isMajor ? 1.5 : 0.8} />
                {isMajor && (
                  <text x={x} y="792" fill={textDark} fontSize="10.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    {scmVal >= 1 ? scmVal.toFixed(0) : scmVal.toString()}
                  </text>
                )}
              </g>
            );
          })}
          {/* Scm Bottom Axis Label */}
          <text x="310" y="812" fill={textDark} fontSize="11" fontWeight="bold" textAnchor="middle">
            σcm: Rock Mass Strength (MPa)
          </text>

          {/* Intact Strength Iso-Curves: Scm = Sc * s^a */}
          {ucsCurves.map((item) => {
            const points: string[] = [];
            for (let g = 10; g <= 100; g += 2) {
              const s = Math.exp((g - 100) / 9);
              const a = 0.5 + (Math.exp(-g / 15) - Math.exp(-20 / 3)) / 6;
              const scm = item.ucs * Math.pow(s, a);
              if (scm >= 0.08 && scm <= 100) {
                points.push(`${xScm(scm).toFixed(1)},${yGsi(g).toFixed(1)}`);
              }
            }
            if (points.length < 2) return null;

            const endPoint = points[points.length - 1].split(',');
            const labelX = parseFloat(endPoint[0]);
            const labelY = parseFloat(endPoint[1]);

            return (
              <g key={`ucs-curve-${item.ucs}`}>
                <path d={`M ${points.join(' L ')}`} fill="none" stroke={curveColor} strokeWidth="1.1" />
                {/* Curve labels with protective background */}
                <rect x={labelX - 22} y={labelY - 11} width="22" height="12" fill={bgFill} fillOpacity="0.85" rx="2" />
                <text
                  x={labelX - 3}
                  y={labelY - 2}
                  fill={textDark}
                  fontSize="8.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
          {/* Label below curves */}
          <text x="375" y="740" fill={textDark} fontSize="10.5" fontWeight="bold">
            Iso-intact strength curves (σc in MPa)
          </text>

          {/* Red Dashed Region: Susceptible to spalling / rockburst */}
          <g>
            {/* Horizontal line at GSI = 60 */}
            <line x1={xScm(2.2)} y1={yGsi(60)} x2={xScm(100)} y2={yGsi(60)} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="5 3" />
            {/* Vertical line from GSI=60 to 100 */}
            <line x1={xScm(2.2)} y1={yGsi(60)} x2={xScm(12)} y2={yGsi(100)} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="5 3" />
            <rect x="360" y={yGsi(48) - 12} width="144" height="42" fill={bgFill} fillOpacity="0.92" rx="4" stroke="#dc2626" strokeWidth="0.8" strokeDasharray="3 2" />
            <text x="432" y={yGsi(48)} fill="#dc2626" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              (*) Susceptible to
            </text>
            <text x="432" y={yGsi(48) + 12} fill="#dc2626" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              spalling / rockburst
            </text>
            <text x="432" y={yGsi(48) + 24} fill="#dc2626" fontSize="9" fontWeight="bold" textAnchor="middle">
              region for brittle rocks
            </text>
            {/* Example red reference crosshair at GSI=60 */}
            <line x1={xScm(1)} y1={yGsi(60)} x2={xScm(40)} y2={yGsi(60)} stroke="#dc2626" strokeWidth="1.2" strokeDasharray="4 2" />
            <line x1={xScm(12)} y1={yGsi(40)} x2={xScm(12)} y2={yGsi(75)} stroke="#dc2626" strokeWidth="1.2" strokeDasharray="4 2" />
          </g>

          {/* ========================================================================= */}
          {/* 5. QUADRANT I (BOTTOM-RIGHT): ROCK BLOCK VOLUME Vb & JOINT CONDITIONS jC */}
          {/* ========================================================================= */}

          {/* Bottom Horizontal Axis: jC (10 to 0 from LEFT to RIGHT) */}
          {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((jcVal) => {
            const x = xJc(jcVal);
            return (
              <g key={`jc-bottom-tick-${jcVal}`}>
                <line x1={x} y1="770" x2={x} y2="778" stroke={axisColor} strokeWidth="1.5" />
                <text x={x} y="792" fill={textDark} fontSize="10.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  {jcVal}
                </text>
              </g>
            );
          })}
          {/* jC Bottom Axis Label */}
          <text x="752" y="812" fill={textDark} fontSize="11" fontWeight="bold" textAnchor="middle">
            jC: Joint Condition Rating
          </text>

          {/* Top Axis of Quad I: jC ticks */}
          {[10, 8, 6, 4, 2, 0].map((jcVal) => (
            <line key={`jc-top-tick-${jcVal}`} x1={xJc(jcVal)} y1="426" x2={xJc(jcVal)} y2="430" stroke={axisColor} strokeWidth="1" />
          ))}
          <text x="752" y="422" fill={textDark} fontSize="11" fontWeight="bold" textAnchor="middle">
            jC
          </text>

          {/* Iso-Block Volume Curves Vb: GSI(jC, Vb) */}
          {vbCurves.map((item) => {
            const points: string[] = [];
            for (let j = 0.2; j <= 10; j += 0.2) {
              const dropFactor = j >= 3 ? (10 - j) * 1.1 : 7 * 1.1 + Math.pow(3 - j, 1.2) * 12;
              const g = Math.max(5, Math.min(95, item.baseGsi - dropFactor));
              points.push(`${xJc(j).toFixed(1)},${yGsi(g).toFixed(1)}`);
            }
            const pathData = `M ${points.join(' L ')}`;
            const labelX = xJc(3.5);
            const labelY = yGsi(item.baseGsi - (10 - 3.5) * 1.1) - 4;

            return (
              <g key={`vb-curve-${item.name}`}>
                <path d={pathData} fill="none" stroke={curveColor} strokeWidth="1.1" />
                <rect x={labelX - 18} y={labelY - 10} width="36" height="12" fill={bgFill} fillOpacity="0.85" rx="2" />
                <text
                  x={labelX}
                  y={labelY}
                  fill={textDark}
                  fontSize="8.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
          {/* Title on Vb curves */}
          <text x="555" y="460" fill={textDark} fontSize="10.5" fontWeight="bold">
            Iso-rock block volume Vb
          </text>

          {/* Vertical Dashed Blue Lines for Joint Conditions jC with Rotated Text */}
          {jcDescriptors.map((item) => {
            const x = xJc(item.jc);
            return (
              <g key={`jc-desc-${item.jc}`}>
                <line x1={x} y1="430" x2={x} y2="770" stroke="#2563eb" strokeWidth="1.2" strokeDasharray="4 3" />
                <g transform={`rotate(-90 ${x - 4} 630)`}>
                  <rect x={x - 4 - 65} y="622" width="130" height="16" fill={bgFill} fillOpacity="0.9" rx="3" stroke={isPaper ? '#cbd5e1' : '#1e293b'} strokeWidth="0.8" />
                  <text
                    x={x - 4}
                    y="634"
                    fill="#1d4ed8"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {item.label}
                  </text>
                </g>
              </g>
            );
          })}

          {/* ========================================================================= */}
          {/* 6. LIVE WORKING POINT & CROSSHAIR INTERACTION                             */}
          {/* ========================================================================= */}
          {showLiveTrace && (
            <g className="transition-all duration-300">
              {/* Point 1 in Quad II: (Scm, GSI) */}
              {(() => {
                const p1X = xScm(currentScm);
                const p1Y = yGsi(currentGsi);
                const p1Label = `σcm = ${currentScm} MPa`;
                const p1Width = p1Label.length * 7 + 22;
                const p1Height = 22;
                const p1BoxX = p1X + p1Width + 10 > 525 ? p1X - p1Width - 10 : p1X + 10;
                const p1BoxY = p1Y - p1Height - 4 < 435 ? p1Y + 6 : p1Y - p1Height - 4;

                return (
                  <g>
                    <line x1={p1X} y1="430" x2={p1X} y2={p1Y} stroke="#818cf8" strokeWidth="1.4" strokeDasharray="4 3" />
                    <line x1="85" y1={p1Y} x2={p1X} y2={p1Y} stroke="#818cf8" strokeWidth="1.4" strokeDasharray="4 3" />
                    <circle cx={p1X} cy={p1Y} r="5" fill="#6366f1" stroke="#ffffff" strokeWidth="2" filter="url(#traceGlow)" />
                    <rect
                      x={p1BoxX}
                      y={p1BoxY}
                      width={p1Width}
                      height={p1Height}
                      fill={isPaper ? '#ffffff' : '#090d16'}
                      fillOpacity="0.94"
                      rx="4"
                      stroke="#6366f1"
                      strokeWidth="1.3"
                    />
                    <text
                      x={p1BoxX + p1Width / 2}
                      y={p1BoxY + 15}
                      fill={isPaper ? '#1e1b4b' : '#c7d2fe'}
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {p1Label}
                    </text>
                  </g>
                );
              })()}

              {/* Path from Quad II to Quad III: Vertical line at Scm */}
              <line x1={xScm(currentScm)} y1={yGsi(currentGsi)} x2={xScm(currentScm)} y2={yIc(currentIc)} stroke="#6366f1" strokeWidth="1.8" strokeDasharray="3 3" />

              {/* Point 2 in Quad III: (Scm, IC) */}
              {(() => {
                const p2X = xScm(currentScm);
                const p2Y = yIc(currentIc);
                const p2Label = `IC = ${currentIc} (H = ${currentDepth}m)`;
                const p2Width = p2Label.length * 6.8 + 20;
                const p2Height = 22;
                const p2BoxX = p2X - p2Width - 10 < 88 ? p2X + 10 : p2X - p2Width - 10;
                const p2BoxY = p2Y - p2Height - 4 < 88 ? p2Y + 6 : p2Y - p2Height - 4;

                return (
                  <g>
                    <line x1={p2X} y1={p2Y} x2="535" y2={p2Y} stroke="#818cf8" strokeWidth="1.4" strokeDasharray="4 3" />
                    <circle cx={p2X} cy={p2Y} r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="2" filter="url(#traceGlow)" />
                    <rect
                      x={p2BoxX}
                      y={p2BoxY}
                      width={p2Width}
                      height={p2Height}
                      fill={isPaper ? '#ffffff' : '#090d16'}
                      fillOpacity="0.94"
                      rx="4"
                      stroke="#0d9488"
                      strokeWidth="1.3"
                    />
                    <text
                      x={p2BoxX + p2Width / 2}
                      y={p2BoxY + 15}
                      fill={isPaper ? '#0f172a' : '#5eead4'}
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {p2Label}
                    </text>
                  </g>
                );
              })()}

              {/* Path from Quad III to Quad IV: Horizontal line at IC */}
              <line x1={xScm(currentScm)} y1={yIc(currentIc)} x2={xRmr(currentRmr)} y2={yIc(currentIc)} stroke="#6366f1" strokeWidth="2" strokeDasharray="4 3" />

              {/* Point 3 in Quad IV: (RMR, IC) -> Pinpoints Active Section with Exact Fit Badge */}
              {(() => {
                const ptX = xRmr(currentRmr);
                const ptY = yIc(currentIc);
                const labelText = russoResult.sectionType;
                const cardWidth = Math.max(140, labelText.length * 7.6 + 26);
                const cardHeight = 28;
                const cardX = ptX + cardWidth + 12 > 965 ? ptX - cardWidth - 10 : ptX + 10;
                const cardY = ptY - cardHeight - 6 < 88 ? ptY + 8 : ptY - cardHeight - 6;

                return (
                  <g>
                    <circle cx={ptX} cy={ptY} r="14" fill="#e11d48" fillOpacity="0.25" className="animate-ping" />
                    <circle cx={ptX} cy={ptY} r="6" fill="#e11d48" stroke="#ffffff" strokeWidth="2.5" filter="url(#traceGlow)" />
                    {/* Floating output box perfectly sized to section text */}
                    <rect
                      x={cardX}
                      y={cardY}
                      width={cardWidth}
                      height={cardHeight}
                      fill={isPaper ? '#ffffff' : '#090d16'}
                      fillOpacity="0.95"
                      rx="6"
                      stroke="#e11d48"
                      strokeWidth="1.8"
                      filter="url(#traceGlow)"
                    />
                    <text
                      x={cardX + cardWidth / 2}
                      y={cardY + 18}
                      fill="#e11d48"
                      fontSize="11.5"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      {labelText}
                    </text>
                  </g>
                );
              })()}

              {/* Point in Quad I: (jC, GSI) */}
              <g>
                <line x1={535} y1={yGsi(currentGsi)} x2={xJc(4.5)} y2={yGsi(currentGsi)} stroke="#818cf8" strokeWidth="1.4" strokeDasharray="4 3" />
                <circle cx={xJc(4.5)} cy={yGsi(currentGsi)} r="5" fill="#a855f7" stroke="#ffffff" strokeWidth="2" filter="url(#traceGlow)" />
                <rect
                  x={xJc(4.5) + 6}
                  y={yGsi(currentGsi) + 2}
                  width="72"
                  height="20"
                  fill={isPaper ? '#ffffff' : '#090d16'}
                  fillOpacity="0.9"
                  rx="4"
                  stroke="#a855f7"
                  strokeWidth="1.2"
                />
                <text x={xJc(4.5) + 42} y={yGsi(currentGsi) + 16} fill={isPaper ? '#1e1b4b' : '#e9d5ff'} fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  GSI={currentGsi}
                </text>
              </g>
            </g>
          )}

          {/* ========================================================================= */}
          {/* 7. BOTTOM QUADRANT HEADINGS (QUAD II & QUAD I) & FOOTNOTES                 */}
          {/* ========================================================================= */}

          {/* Bottom-Left: Quadrant II */}
          <text x="85" y="836" fill={textDark} fontSize="12" fontWeight="bold" letterSpacing="0.2">
            II - Intact strength (σc) + rock mass fabric (GSI) = Rock mass strength (σcm)
          </text>
          <text x="85" y="851" fill={textMuted} fontSize="10" fontWeight="600">
            {isFa ? 'ربع ۲: محاسبه مقاومت توده‌سنگ بر پایه مقاومت سنگ بکر و شاخص GSI' : 'Quad II: Rock mass strength based on intact strength and GSI'}
          </text>

          {/* Bottom-Right: Quadrant I */}
          <text x="535" y="836" fill={isPaper ? '#b91c1c' : '#f87171'} fontSize="12" fontWeight="bold" letterSpacing="0.2">
            I - Rock block volume (Vb) + joints conditions (jC) = Rock mass fabric (GSI)
          </text>
          <text x="535" y="851" fill={textMuted} fontSize="10" fontWeight="600">
            {isFa ? 'ربع ۱: تخمین شاخص GSI از حجم بلوک‌های سنگی و شرایط درزه‌ها' : 'Quad I: Geological Strength Index from block volume and joint condition'}
          </text>

          {/* Footnotes at bottom */}
          <text x="85" y="870" fill="#dc2626" fontSize="9" fontStyle="italic" fontWeight="600">
            (*) only for the susceptible region, otherwise the development of plastic region and moderate radial convergences are more probable
          </text>
          <text x="85" y="885" fill={textDark} fontSize="9" fontStyle="italic" fontWeight="600">
            (**) depending also on the length of potential proned zone (silo effect): for short zones included in good rock, caving behaviour is most likely
          </text>
        </svg>
      </div>

      {/* Explanatory notes below chart */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            {isFa
              ? 'راهنمای تعاملی: با کلیک مستقیم بر روی هر ربع نمودار، مقادیر GSI و RMR بلافاصله تغییر کرده و موقعیت نقطه کار ژئوتکنیکی و مقطع ST در کل چرخه ۴ بخشی به‌روزرسانی می‌شود.'
              : 'Interactive hint: Clicking on any quadrant dynamically adjusts the geotechnical working point (GSI & RMR), tracing through all 4 quadrants in real-time.'}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 font-mono text-[11px] text-slate-400">
          <span>σcm: <strong className="text-purple-300">{currentScm} MPa</strong></span>
          <span>IC: <strong className="text-emerald-300">{currentIc}</strong></span>
          <span>ST: <strong className="text-rose-400">{russoResult.sectionType}</strong></span>
        </div>
      </div>
    </div>
  );
};
