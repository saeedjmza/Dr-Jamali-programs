import React, { useRef, useState, useCallback } from 'react';
import {
  Pickaxe,
  Truck,
  Flame,
  Info,
  Sliders,
  CheckCircle2,
  Crosshair,
  Maximize2,
} from 'lucide-react';
import { FranklinResult } from '../../types';
import {
  FRANKLIN_CURVE_A_DATA,
  FRANKLIN_CURVE_B_DATA,
  FRANKLIN_BRANCH_POINT,
  FRANKLIN_LINE_C_RIGHT,
} from '../../utils/excavabilityCalculation';

interface FranklinChartProps {
  franklinResult: FranklinResult;
  fractureSpacingIf: number;
  pointLoadIs50: number;
  onUpdateIf: (val: number) => void;
  onUpdateIs: (val: number) => void;
  lang: 'fa' | 'en';
}

export const FranklinChart: React.FC<FranklinChartProps> = ({
  franklinResult,
  fractureSpacingIf,
  pointLoadIs50,
  onUpdateIf,
  onUpdateIs,
  lang,
}) => {
  const isFa = lang === 'fa';
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverCoord, setHoverCoord] = useState<{ is: number; if: number } | null>(null);

  // Chart Coordinate Dimensions
  // SVG ViewBox: 0 0 640 540
  const CHART_LEFT = 95;
  const CHART_RIGHT = 605;
  const CHART_TOP = 85;
  const CHART_BOTTOM = 465;
  const CHART_WIDTH = CHART_RIGHT - CHART_LEFT; // 510
  const CHART_HEIGHT = CHART_BOTTOM - CHART_TOP; // 380

  // Logarithmic domain definition
  // X-axis: Is(50) from 0.03 to 30.0 MPa (3 decades span: 10^-1.523 to 10^1.477)
  const LOG_X_MIN = Math.log10(0.03); // ~ -1.52288
  const LOG_X_MAX = Math.log10(30.0); // ~ 1.47712
  const LOG_X_SPAN = LOG_X_MAX - LOG_X_MIN; // 3.0

  // Y-axis: Fracture spacing If from ~0.00632 to 8.0 m (3.1 decades span: 10^-2.20 to 10^0.90)
  const LOG_Y_MIN = -2.20; // 0.00631 m
  const LOG_Y_MAX = 0.90; // ~7.94 m
  const LOG_Y_SPAN = LOG_Y_MAX - LOG_Y_MIN; // 3.10

  // Transform functions between data and SVG pixel coordinates
  const getSvgX = useCallback(
    (isVal: number) => {
      const safeIs = Math.max(0.03, Math.min(30.0, isVal));
      const logIs = Math.log10(safeIs);
      return CHART_LEFT + ((logIs - LOG_X_MIN) / LOG_X_SPAN) * CHART_WIDTH;
    },
    [CHART_LEFT, CHART_WIDTH, LOG_X_MIN, LOG_X_SPAN]
  );

  const getSvgY = useCallback(
    (ifVal: number) => {
      const safeIf = Math.max(0.00632, Math.min(8.0, ifVal));
      const logIf = Math.log10(safeIf);
      return CHART_BOTTOM - ((logIf - LOG_Y_MIN) / LOG_Y_SPAN) * CHART_HEIGHT;
    },
    [CHART_BOTTOM, CHART_HEIGHT, LOG_Y_MIN, LOG_Y_SPAN]
  );

  // Inverse transform from SVG coordinates back to data values
  const getDataFromSvg = useCallback(
    (pixelX: number, pixelY: number) => {
      const clampedX = Math.max(CHART_LEFT, Math.min(CHART_RIGHT, pixelX));
      const clampedY = Math.max(CHART_TOP, Math.min(CHART_BOTTOM, pixelY));

      const logIs = LOG_X_MIN + ((clampedX - CHART_LEFT) / CHART_WIDTH) * LOG_X_SPAN;
      const logIf = LOG_Y_MIN + ((CHART_BOTTOM - clampedY) / CHART_HEIGHT) * LOG_Y_SPAN;

      const isVal = Number(Math.pow(10, logIs).toFixed(2));
      const ifVal = Number(Math.pow(10, logIf).toFixed(3));

      return {
        is: Math.max(0.03, Math.min(30.0, isVal)),
        if: Math.max(0.01, Math.min(6.0, ifVal)),
      };
    },
    [CHART_LEFT, CHART_RIGHT, CHART_TOP, CHART_BOTTOM, CHART_WIDTH, CHART_HEIGHT, LOG_X_MIN, LOG_X_SPAN, LOG_Y_MIN, LOG_Y_SPAN]
  );

  // Handle click on chart to quickly position the state
  const handleChartClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 640 / rect.width;
    const scaleY = 540 / rect.height;
    const pixelX = (e.clientX - rect.left) * scaleX;
    const pixelY = (e.clientY - rect.top) * scaleY;

    if (
      pixelX >= CHART_LEFT - 10 &&
      pixelX <= CHART_RIGHT + 10 &&
      pixelY >= CHART_TOP - 10 &&
      pixelY <= CHART_BOTTOM + 10
    ) {
      const data = getDataFromSvg(pixelX, pixelY);
      onUpdateIs(data.is);
      onUpdateIf(data.if);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 640 / rect.width;
    const scaleY = 540 / rect.height;
    const pixelX = (e.clientX - rect.left) * scaleX;
    const pixelY = (e.clientY - rect.top) * scaleY;

    if (
      pixelX >= CHART_LEFT &&
      pixelX <= CHART_RIGHT &&
      pixelY >= CHART_TOP &&
      pixelY <= CHART_BOTTOM
    ) {
      setHoverCoord(getDataFromSvg(pixelX, pixelY));
    } else {
      setHoverCoord(null);
    }
  };

  // Catmull-Rom to Cubic Bezier smooth spline generator
  const getSmoothBezierSegments = (pts: { x: number; y: number }[]): string => {
    if (pts.length < 2) return '';
    let str = '';
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      str += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return str;
  };

  // Exact reverse of the Cubic Bezier spline
  const getReverseBezierSegments = (pts: { x: number; y: number }[]): string => {
    if (pts.length < 2) return '';
    let str = '';
    for (let i = pts.length - 1; i > 0; i--) {
      const p3 = i < pts.length - 1 ? pts[i + 1] : pts[i];
      const p2 = pts[i];
      const p1 = pts[i - 1];
      const p0 = i > 1 ? pts[i - 2] : p1;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      str += ` C ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
    }
    return str;
  };

  // Map Curve A and Curve B points into SVG coordinate points
  const curveAPts = FRANKLIN_CURVE_A_DATA.map(([ifVal, isVal]) => ({
    x: Number(getSvgX(isVal).toFixed(1)),
    y: Number(getSvgY(ifVal).toFixed(1)),
  }));

  const curveBPts = FRANKLIN_CURVE_B_DATA.map(([ifVal, isVal]) => ({
    x: Number(getSvgX(isVal).toFixed(1)),
    y: Number(getSvgY(ifVal).toFixed(1)),
  }));

  // Branch point on Curve B (at If = 0.6 m)
  const branchIndexInB = FRANKLIN_CURVE_B_DATA.findIndex(
    ([ifVal]) => ifVal === FRANKLIN_BRANCH_POINT.if
  );
  const curveB_upper = curveBPts.slice(0, branchIndexInB + 1);
  const curveB_lower = curveBPts.slice(branchIndexInB);

  const branchPt = curveBPts[branchIndexInB];
  const lineCRightSvgX = Number(getSvgX(FRANKLIN_LINE_C_RIGHT.is).toFixed(1));
  const lineCRightSvgY = Number(getSvgY(FRANKLIN_LINE_C_RIGHT.if).toFixed(1));

  // Build Continuous Smooth Bezier Stroke Paths
  const curveAPath = `M ${curveAPts[0].x},${curveAPts[0].y} ` + getSmoothBezierSegments(curveAPts);
  const curveBPath = `M ${curveBPts[0].x},${curveBPts[0].y} ` + getSmoothBezierSegments(curveBPts);
  const lineCPath = `M ${branchPt.x},${branchPt.y} L ${lineCRightSvgX},${lineCRightSvgY}`;

  // 1. Dig Zone Polygon (Smooth)
  const digPolygon = `M ${CHART_LEFT},${CHART_BOTTOM} ` +
    `L ${CHART_LEFT},${CHART_TOP} ` +
    `L ${curveAPts[0].x},${CHART_TOP} ` +
    `L ${curveAPts[0].x},${curveAPts[0].y} ` +
    getSmoothBezierSegments(curveAPts) +
    ` L ${curveAPts[curveAPts.length - 1].x},${CHART_BOTTOM} Z`;

  // 2. Rip Zone Polygon (Smooth, bounded between Curve A and Curve B)
  const ripPolygon = `M ${curveAPts[curveAPts.length - 1].x},${CHART_BOTTOM} ` +
    `L ${curveAPts[curveAPts.length - 1].x},${curveAPts[curveAPts.length - 1].y} ` +
    getReverseBezierSegments(curveAPts) +
    ` L ${curveAPts[0].x},${CHART_TOP} ` +
    `L ${curveBPts[0].x},${CHART_TOP} ` +
    `L ${curveBPts[0].x},${curveBPts[0].y} ` +
    getSmoothBezierSegments(curveBPts) +
    ` L ${curveBPts[curveBPts.length - 1].x},${CHART_BOTTOM} Z`;

  // 3. Blast to Loosen Polygon (Smooth, below branch line and right of lower Curve B)
  const blastToLoosenPolygon = `M ${branchPt.x},${branchPt.y} ` +
    `L ${lineCRightSvgX},${branchPt.y} ` +
    `L ${CHART_RIGHT},${CHART_BOTTOM} ` +
    `L ${curveBPts[curveBPts.length - 1].x},${CHART_BOTTOM} ` +
    `L ${curveBPts[curveBPts.length - 1].x},${curveBPts[curveBPts.length - 1].y} ` +
    getReverseBezierSegments(curveB_lower) +
    ` Z`;

  // 4. Blast to Fracture Polygon (Smooth, above branch line and right of upper Curve B)
  const blastToFracturePolygon = `M ${curveBPts[0].x},${curveBPts[0].y} ` +
    getSmoothBezierSegments(curveB_upper) +
    ` L ${lineCRightSvgX},${branchPt.y} ` +
    `L ${CHART_RIGHT},${CHART_TOP} ` +
    `L ${curveBPts[0].x},${CHART_TOP} Z`;

  // Position of current user point
  const currentSvgX = getSvgX(pointLoadIs50);
  const currentSvgY = getSvgY(fractureSpacingIf);

  // X Axis Ticks
  const xTicks = [
    { val: 0.03, label: '0.03', grade: 'VL' },
    { val: 0.1, label: '0.1', grade: 'L' },
    { val: 0.3, label: '0.3', grade: 'M' },
    { val: 1.0, label: '1.0', grade: 'H' },
    { val: 3.0, label: '3.0', grade: 'VH' },
    { val: 10.0, label: '10.0', grade: 'EH' },
    { val: 30.0, label: '30.0', grade: '' },
  ];

  // Y Axis Ticks
  const yTicks = [
    { val: 0.02, label: '0.02', grade: 'VL' },
    { val: 0.06, label: '0.06', grade: 'L' },
    { val: 0.2, label: '0.2', grade: 'M' },
    { val: 0.6, label: '0.6', grade: 'H' },
    { val: 2.0, label: '2', grade: 'VH' },
    { val: 6.0, label: '6', grade: 'EH' },
  ];

  // Category Color Map
  const zoneColors = {
    dig: {
      fill: '#10b981',
      stroke: '#059669',
      glow: 'rgba(16, 185, 129, 0.25)',
      active: franklinResult.category === 'dig',
    },
    rip: {
      fill: '#06b6d4',
      stroke: '#0891b2',
      glow: 'rgba(6, 182, 212, 0.25)',
      active: franklinResult.category === 'rip',
    },
    blast_to_loosen: {
      fill: '#f59e0b',
      stroke: '#d97706',
      glow: 'rgba(245, 158, 11, 0.25)',
      active: franklinResult.category === 'blast_to_loosen',
    },
    blast_to_fracture: {
      fill: '#ef4444',
      stroke: '#dc2626',
      glow: 'rgba(239, 68, 68, 0.25)',
      active: franklinResult.category === 'blast_to_fracture',
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Active Classification Result */}
      <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
            style={{ backgroundColor: `${franklinResult.color}20`, border: `1.5px solid ${franklinResult.color}` }}
          >
            {franklinResult.category === 'dig' && <Pickaxe className="w-6 h-6 text-emerald-400" />}
            {franklinResult.category === 'rip' && <Truck className="w-6 h-6 text-cyan-400" />}
            {franklinResult.category === 'blast_to_loosen' && <Flame className="w-6 h-6 text-amber-400" />}
            {franklinResult.category === 'blast_to_fracture' && <Flame className="w-6 h-6 text-rose-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">
                {isFa ? 'نتیجه برآورد قابلیت حفاری فرانکلین (۱۹۷۱):' : 'Franklin (1971) Assessment:'}
              </span>
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase text-white shadow"
                style={{ backgroundColor: franklinResult.color }}
              >
                {franklinResult.categoryNameEn}
              </span>
            </div>
            <h3 className="text-base font-black text-slate-100 mt-0.5">
              {isFa ? franklinResult.categoryNameFa : franklinResult.categoryNameEn}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Presets */}
          <button
            onClick={() => {
              onUpdateIs(0.08);
              onUpdateIf(0.05);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
          >
            {isFa ? 'نمونه: Dig (حفاری مستقیم)' : 'Preset: Dig'}
          </button>
          <button
            onClick={() => {
              onUpdateIs(0.5);
              onUpdateIf(0.2);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
          >
            {isFa ? 'نمونه: Rip (ریپرزنی)' : 'Preset: Rip'}
          </button>
          <button
            onClick={() => {
              onUpdateIs(3.0);
              onUpdateIf(0.2);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
          >
            {isFa ? 'نمونه: Blast to loosen' : 'Preset: Blast to loosen'}
          </button>
          <button
            onClick={() => {
              onUpdateIs(6.0);
              onUpdateIf(1.5);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
          >
            {isFa ? 'نمونه: Blast to fracture' : 'Preset: Blast to fracture'}
          </button>
        </div>
      </div>

      {/* Main Interactive Diagram & Controls Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Top: Reconstructed SVG Chart (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800/90 shadow-2xl relative">
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">
                {isFa ? 'نمودار لاگ-لاگ فرانکلین (Franklin 1971)' : 'Franklin (1971) Log-Log Excavability Chart'}
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {isFa ? 'کلیک روی نمودار برای جابجایی نقطه' : 'Click on diagram to set point'}
              </span>
            </div>
            {hoverCoord && (
              <div className="font-mono text-[11px] text-amber-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                Is = {hoverCoord.is} MPa | If = {hoverCoord.if} m
              </div>
            )}
          </div>

          {/* SVG Canvas */}
          <div className="w-full relative overflow-hidden select-none bg-slate-950 rounded-xl border border-slate-800/80">
            <svg
              ref={svgRef}
              viewBox="0 0 640 540"
              className="w-full h-auto cursor-crosshair"
              dir="ltr"
              style={{ direction: 'ltr' }}
              onClick={handleChartClick}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => {
                setIsHovered(false);
                setHoverCoord(null);
              }}
            >
              <defs>
                {/* Patterns and Gradients for Regions */}
                <pattern id="grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="0.8" fill="#334155" />
                </pattern>
                <filter id="glow-point" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={franklinResult.color} floodOpacity="0.8" />
                </filter>
              </defs>

              {/* Chart Base Background Grid */}
              <rect
                x={CHART_LEFT}
                y={CHART_TOP}
                width={CHART_WIDTH}
                height={CHART_HEIGHT}
                fill="#090d16"
                stroke="#334155"
                strokeWidth="1.5"
              />
              <rect
                x={CHART_LEFT}
                y={CHART_TOP}
                width={CHART_WIDTH}
                height={CHART_HEIGHT}
                fill="url(#grid-dots)"
                opacity="0.6"
              />

              {/* 1. DIG REGION POLYGON */}
              <path
                d={digPolygon}
                fill={zoneColors.dig.fill}
                fillOpacity={zoneColors.dig.active ? 0.32 : 0.16}
                stroke={zoneColors.dig.stroke}
                strokeWidth="1"
                className="transition-all duration-300 hover:fill-opacity-30 cursor-pointer"
              />

              {/* 2. RIP REGION POLYGON */}
              <path
                d={ripPolygon}
                fill={zoneColors.rip.fill}
                fillOpacity={zoneColors.rip.active ? 0.32 : 0.16}
                stroke={zoneColors.rip.stroke}
                strokeWidth="1"
                className="transition-all duration-300 hover:fill-opacity-30 cursor-pointer"
              />

              {/* 3. BLAST TO LOOSEN POLYGON */}
              <path
                d={blastToLoosenPolygon}
                fill={zoneColors.blast_to_loosen.fill}
                fillOpacity={zoneColors.blast_to_loosen.active ? 0.32 : 0.16}
                stroke={zoneColors.blast_to_loosen.stroke}
                strokeWidth="1"
                className="transition-all duration-300 hover:fill-opacity-30 cursor-pointer"
              />

              {/* 4. BLAST TO FRACTURE POLYGON */}
              <path
                d={blastToFracturePolygon}
                fill={zoneColors.blast_to_fracture.fill}
                fillOpacity={zoneColors.blast_to_fracture.active ? 0.32 : 0.16}
                stroke={zoneColors.blast_to_fracture.stroke}
                strokeWidth="1"
                className="transition-all duration-300 hover:fill-opacity-30 cursor-pointer"
              />

              {/* BOUNDARY CURVES (Thick black / distinct lines matching the original paper) */}
              {/* Curve A: Dig / Rip */}
              <path
                d={curveAPath}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Curve B: Rip / Blasting */}
              <path
                d={curveBPath}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Line C: Blast to fracture / Blast to loosen */}
              <path
                d={lineCPath}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              {/* REGION LABELS (Typed cleanly inside the regions as in Franklin 1971) */}
              {/* Label: Dig */}
              <g transform="translate(145, 410)">
                <text
                  x="0"
                  y="0"
                  fill="#ffffff"
                  fontSize="18"
                  fontWeight="bold"
                  letterSpacing="0.5"
                  className="font-sans drop-shadow-md"
                >
                  Dig
                </text>
                <text x="0" y="15" fill="#6ee7b7" fontSize="10" fontWeight="500">
                  {isFa ? 'حفاری مستقیم مکانیکی' : 'Direct Digging'}
                </text>
              </g>

              {/* Label: Rip */}
              <g transform="translate(285, 340)">
                <text
                  x="0"
                  y="0"
                  fill="#ffffff"
                  fontSize="20"
                  fontWeight="bold"
                  letterSpacing="0.5"
                  className="font-sans drop-shadow-md"
                >
                  Rip
                </text>
                <text x="0" y="16" fill="#67e8f9" fontSize="10" fontWeight="500">
                  {isFa ? 'ریپرزنی با بولدوزر' : 'Mechanical Ripping'}
                </text>
              </g>

              {/* Label: Blast to loosen */}
              <g transform="translate(460, 310)">
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="17"
                  fontWeight="bold"
                  className="font-sans drop-shadow-md"
                >
                  Blast to
                </text>
                <text
                  x="0"
                  y="20"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="17"
                  fontWeight="bold"
                  className="font-sans drop-shadow-md"
                >
                  loosen
                </text>
                <text x="0" y="36" textAnchor="middle" fill="#fcd34d" fontSize="9.5" fontWeight="500">
                  {isFa ? 'آتشباری برای سست‌سازی' : 'Loosening Blasting'}
                </text>
              </g>

              {/* Label: Blast to fracture */}
              <g transform="translate(420, 140)">
                <text
                  x="0"
                  y="0"
                  fill="#ffffff"
                  fontSize="18"
                  fontWeight="bold"
                  className="font-sans drop-shadow-md"
                >
                  Blast to
                </text>
                <text
                  x="0"
                  y="22"
                  fill="#ffffff"
                  fontSize="18"
                  fontWeight="bold"
                  className="font-sans drop-shadow-md"
                >
                  fracture
                </text>
                <text x="0" y="38" fill="#fca5a5" fontSize="10" fontWeight="500">
                  {isFa ? 'آتشباری برای خردایش و شکستن' : 'Production Blasting to Fracture'}
                </text>
              </g>

              {/* TOP LEGEND BOX (Franklin 1971 legend: Rock Strength / Fracture Spacing Grades) */}
              <g transform="translate(125, 18)" dir="ltr" style={{ direction: 'ltr' }}>
                <rect
                  x="0"
                  y="0"
                  width="430"
                  height="48"
                  rx="8"
                  fill="#090e1a"
                  fillOpacity="0.95"
                  stroke="#334155"
                  strokeWidth="1.2"
                />
                {/* Column 1 */}
                <text
                  x="18"
                  y="20"
                  fontSize="10.5"
                  fill="#cbd5e1"
                  direction="ltr"
                  textAnchor="start"
                  style={{ direction: 'ltr' }}
                >
                  <tspan fontWeight="bold" fill="#f59e0b">EH</tspan>
                  <tspan dx="7" fill="#cbd5e1">Extremely high</tspan>
                </text>
                <text
                  x="18"
                  y="38"
                  fontSize="10.5"
                  fill="#cbd5e1"
                  direction="ltr"
                  textAnchor="start"
                  style={{ direction: 'ltr' }}
                >
                  <tspan fontWeight="bold" fill="#f59e0b">H</tspan>
                  <tspan dx="7" fill="#cbd5e1">High</tspan>
                </text>

                {/* Column 2 */}
                <text
                  x="162"
                  y="20"
                  fontSize="10.5"
                  fill="#cbd5e1"
                  direction="ltr"
                  textAnchor="start"
                  style={{ direction: 'ltr' }}
                >
                  <tspan fontWeight="bold" fill="#f59e0b">VH</tspan>
                  <tspan dx="7" fill="#cbd5e1">Very high</tspan>
                </text>
                <text
                  x="162"
                  y="38"
                  fontSize="10.5"
                  fill="#cbd5e1"
                  direction="ltr"
                  textAnchor="start"
                  style={{ direction: 'ltr' }}
                >
                  <tspan fontWeight="bold" fill="#f59e0b">M</tspan>
                  <tspan dx="7" fill="#cbd5e1">Medium</tspan>
                </text>

                {/* Column 3 */}
                <text
                  x="305"
                  y="20"
                  fontSize="10.5"
                  fill="#cbd5e1"
                  direction="ltr"
                  textAnchor="start"
                  style={{ direction: 'ltr' }}
                >
                  <tspan fontWeight="bold" fill="#f59e0b">L</tspan>
                  <tspan dx="7" fill="#cbd5e1">Low</tspan>
                </text>
                <text
                  x="305"
                  y="38"
                  fontSize="10.5"
                  fill="#cbd5e1"
                  direction="ltr"
                  textAnchor="start"
                  style={{ direction: 'ltr' }}
                >
                  <tspan fontWeight="bold" fill="#f59e0b">VL</tspan>
                  <tspan dx="7" fill="#cbd5e1">Very low</tspan>
                </text>
              </g>

              {/* AXES TICKS AND LABELS */}
              {/* X-AXIS (Bottom) */}
              <line
                x1={CHART_LEFT}
                y1={CHART_BOTTOM}
                x2={CHART_RIGHT}
                y2={CHART_BOTTOM}
                stroke="#cbd5e1"
                strokeWidth="2"
              />

              {xTicks.map((tick, i) => {
                const tx = getSvgX(tick.val);
                const isCurrentNearest = franklinResult.strengthGrade === tick.grade;
                return (
                  <g key={`xtick-${i}`} transform={`translate(${tx}, ${CHART_BOTTOM})`}>
                    {/* Tick line */}
                    <line x1="0" y1="0" x2="0" y2="8" stroke="#cbd5e1" strokeWidth="1.5" />

                    {/* Grade abbreviation (VL, L, M, H, VH, EH) positioned above number */}
                    {tick.grade && (
                      <text
                        x="0"
                        y="20"
                        textAnchor="middle"
                        fill={isCurrentNearest ? '#f59e0b' : '#94a3b8'}
                        fontSize="11"
                        fontWeight={isCurrentNearest ? 'bold' : '600'}
                      >
                        {tick.grade}
                      </text>
                    )}

                    {/* Numeric value */}
                    <text
                      x="0"
                      y="36"
                      textAnchor="middle"
                      fill={isCurrentNearest ? '#fbbf24' : '#e2e8f0'}
                      fontSize="12"
                      fontWeight="bold"
                      className="font-mono"
                    >
                      {tick.label}
                    </text>
                  </g>
                );
              })}

              {/* X-Axis Title */}
              <text
                x={CHART_LEFT + CHART_WIDTH / 2}
                y={CHART_BOTTOM + 58}
                textAnchor="middle"
                fill="#f1f5f9"
                fontSize="14"
                fontWeight="bold"
                className="tracking-wide"
              >
                Point load strength, MN/m²
              </text>
              {isFa && (
                <text
                  x={CHART_LEFT + CHART_WIDTH / 2}
                  y={CHART_BOTTOM + 73}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="11"
                >
                  مقاومت بار نقطه‌ای Is(50) (مگاپاسکال)
                </text>
              )}

              {/* Y-AXIS (Left) */}
              <line
                x1={CHART_LEFT}
                y1={CHART_TOP}
                x2={CHART_LEFT}
                y2={CHART_BOTTOM}
                stroke="#cbd5e1"
                strokeWidth="2"
              />

              {yTicks.map((tick, i) => {
                const ty = getSvgY(tick.val);
                const isCurrentNearest = franklinResult.spacingGrade === tick.grade;
                return (
                  <g key={`ytick-${i}`} transform={`translate(${CHART_LEFT}, ${ty})`}>
                    {/* Tick mark */}
                    <line x1="-8" y1="0" x2="0" y2="0" stroke="#cbd5e1" strokeWidth="1.5" />

                    {/* Value */}
                    <text
                      x="-14"
                      y="4"
                      textAnchor="end"
                      fill={isCurrentNearest ? '#fbbf24' : '#e2e8f0'}
                      fontSize="12"
                      fontWeight="bold"
                      className="font-mono"
                    >
                      {tick.label}
                    </text>

                    {/* Grade abbreviation (VL, L, M, H, VH, EH) */}
                    <text
                      x="-14"
                      y="18"
                      textAnchor="end"
                      fill={isCurrentNearest ? '#f59e0b' : '#94a3b8'}
                      fontSize="10"
                      fontWeight={isCurrentNearest ? 'bold' : '600'}
                    >
                      {tick.grade}
                    </text>
                  </g>
                );
              })}

              {/* Y-Axis Title (Rotated) */}
              <g transform={`translate(24, ${CHART_TOP + CHART_HEIGHT / 2}) rotate(-90)`}>
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize="14"
                  fontWeight="bold"
                  className="tracking-wide"
                >
                  Fracture spacing per metre
                </text>
                {isFa && (
                  <text x="0" y="16" textAnchor="middle" fill="#94a3b8" fontSize="11">
                    فاصله‌داری ناپیوستگی‌ها / درزه‌ها (متر)
                  </text>
                )}
              </g>

              {/* CROSSHAIR PROJECTION LINES TO AXES */}
              <line
                x1={CHART_LEFT}
                y1={currentSvgY}
                x2={currentSvgX}
                y2={currentSvgY}
                stroke={franklinResult.color}
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.75"
              />
              <line
                x1={currentSvgX}
                y1={currentSvgY}
                x2={currentSvgX}
                y2={CHART_BOTTOM}
                stroke={franklinResult.color}
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.75"
              />

              {/* Ticks on crosshair projection */}
              <circle cx={CHART_LEFT} cy={currentSvgY} r="3.5" fill={franklinResult.color} />
              <circle cx={currentSvgX} cy={CHART_BOTTOM} r="3.5" fill={franklinResult.color} />

              {/* CURRENT POINT MARKER (Animated & Highlighted) */}
              <g transform={`translate(${currentSvgX}, ${currentSvgY})`}>
                {/* Outer pulsing ring */}
                <circle
                  cx="0"
                  cy="0"
                  r="14"
                  fill={franklinResult.color}
                  fillOpacity="0.25"
                  className="animate-ping"
                />
                {/* Glow ring */}
                <circle
                  cx="0"
                  cy="0"
                  r="10"
                  fill={franklinResult.color}
                  fillOpacity="0.4"
                  filter="url(#glow-point)"
                />
                {/* Inner solid marker */}
                <circle cx="0" cy="0" r="6" fill="#ffffff" stroke={franklinResult.color} strokeWidth="3" />

                {/* Point Label / Floating Tooltip with Adaptive Centering */}
                {(() => {
                  const tipWidth = 172;
                  const tipHeight = 48;
                  const tipOffsetX = currentSvgX > 440 ? -(tipWidth + 14) : 16;
                  const tipOffsetY = currentSvgY < 140 ? 14 : -(tipHeight + 12);

                  return (
                    <g
                      transform={`translate(${tipOffsetX}, ${tipOffsetY})`}
                      dir="ltr"
                      style={{ direction: 'ltr' }}
                    >
                      <rect
                        x="0"
                        y="0"
                        width={tipWidth}
                        height={tipHeight}
                        rx="8"
                        fill="#0b1329"
                        fillOpacity="0.96"
                        stroke={franklinResult.color}
                        strokeWidth="1.8"
                        filter="drop-shadow(0 4px 12px rgba(0,0,0,0.65))"
                      />
                      {/* Title: Always centered inside card */}
                      <text
                        x={tipWidth / 2}
                        y="20"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="12"
                        fontWeight="bold"
                        direction={isFa ? 'rtl' : 'ltr'}
                        style={{ direction: isFa ? 'rtl' : 'ltr', unicodeBidi: 'plaintext' }}
                      >
                        {isFa ? 'توده‌سنگ پروژه' : 'Project Rock Mass'}
                      </text>
                      {/* Metric specs: Always centered inside card */}
                      <text
                        x={tipWidth / 2}
                        y="38"
                        textAnchor="middle"
                        fill="#fcd34d"
                        fontSize="10.5"
                        fontWeight="600"
                        className="font-mono"
                        direction="ltr"
                        style={{ direction: 'ltr' }}
                      >
                        Is={pointLoadIs50} MPa | If={fractureSpacingIf} m
                      </text>
                    </g>
                  );
                })()}
              </g>
            </svg>
          </div>

          <p className="mt-2 text-center text-[11px] text-slate-400">
            {isFa
              ? '💡 با کلیک مستقیم در هر نقطه از نمودار یا با کشیدن اسلایدرهای زیر، موقعیت و روش استخراج بلافاصله به‌روزرسانی می‌شود.'
              : '💡 Click anywhere on the diagram or use the sliders to dynamically reposition the rock mass.'}
          </p>
        </div>

        {/* Right / Bottom: Interactive Controls & Geotechnical Analysis (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Sliders Box */}
          <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 border-b border-slate-800 pb-2.5">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>{isFa ? 'تنظیم متغیرهای ورودی فرانکلین:' : 'Franklin Input Sliders:'}</span>
            </div>

            {/* Slider 1: Point Load Is(50) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">
                  {isFa ? 'مقاومت بار نقطه‌ای Is(50):' : 'Point Load Index Is(50):'}
                </span>
                <span className="font-mono font-bold text-orange-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  {pointLoadIs50} MPa
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>{isFa ? 'رده مقاومت:' : 'Strength Grade:'} <strong className="text-slate-200">{franklinResult.strengthGrade}</strong></span>
                <span className="text-purple-300 font-mono">UCS ≈ {franklinResult.equivalentUcs} MPa</span>
              </div>
              <input
                type="range"
                min="0.03"
                max="30.0"
                step="0.05"
                value={pointLoadIs50}
                onChange={(e) => onUpdateIs(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.03 (VL)</span>
                <span>1.0 (H)</span>
                <span>10.0 (EH)</span>
                <span>30.0</span>
              </div>
            </div>

            {/* Slider 2: Fracture Spacing If */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">
                  {isFa ? 'فاصله‌داری درزه‌ها (If):' : 'Fracture Spacing (If):'}
                </span>
                <span className="font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  {fractureSpacingIf} m
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>{isFa ? 'رده فاصله‌داری:' : 'Spacing Grade:'} <strong className="text-slate-200">{franklinResult.spacingGrade}</strong></span>
                <span className="text-emerald-300 font-mono">
                  {franklinResult.fractureFrequency} {isFa ? 'درزه/متر' : 'joints/m'}
                </span>
              </div>
              <input
                type="range"
                min="0.01"
                max="6.0"
                step="0.01"
                value={fractureSpacingIf}
                onChange={(e) => onUpdateIf(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.01m (VL)</span>
                <span>0.2m (M)</span>
                <span>0.6m (H)</span>
                <span>6.0m (EH)</span>
              </div>
            </div>
          </div>

          {/* Excavation Details Card */}
          <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              <span>{isFa ? 'مشخصات فنی ناحیه استخراج:' : 'Zone Technical Specs:'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{isFa ? 'شاخص قابلیت حفر:' : 'Excavability Index:'}</span>
                <span className="font-mono font-bold text-amber-400">
                  Iex = Is × If = {franklinResult.excavabilityIndexIex}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-900 pt-1.5">
                <span className="text-slate-400">{isFa ? 'روش برگزیده:' : 'Method:'}</span>
                <span className="font-semibold text-slate-200" style={{ color: franklinResult.color }}>
                  {franklinResult.categoryNameEn}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span>{isFa ? 'تفسیر ژئوتکنیکی:' : 'Geotechnical Interpretation:'}</span>
              </div>
              <p>{isFa ? franklinResult.descriptionFa : franklinResult.descriptionEn}</p>
            </div>

            {/* Equipment */}
            <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-amber-400 mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                <span>{isFa ? 'ماشین‌آلات و تجهیزات متناسب:' : 'Appropriate Machinery:'}</span>
              </div>
              <p className="font-medium text-slate-200">{isFa ? franklinResult.equipmentFa : franklinResult.equipmentEn}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Reference Table of the 4 Franklin Zones */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-x-auto text-xs">
        <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-orange-400" />
          <span>
            {isFa
              ? 'معیارهای ۴گانه طبقه‌بندی استخراج توده‌سنگ فرانکلین و همکاران (Franklin et al. 1971)'
              : 'The 4 Franklin (1971) Rock Excavation Classes & Specifications'}
          </span>
        </h4>

        <table className={`w-full ${isFa ? 'text-right' : 'text-left'} border-collapse`}>
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/60">
              <th className="p-3">{isFa ? 'ناحیه استخراج' : 'Excavation Zone'}</th>
              <th className="p-3">{isFa ? 'محدوده شاخص بار نقطه‌ای Is(50)' : 'Point Load Is(50) Range'}</th>
              <th className="p-3">{isFa ? 'فاصله‌داری درزه‌ها (If)' : 'Fracture Spacing (If)'}</th>
              <th className="p-3">{isFa ? 'روش و تجهیزات اجرایی' : 'Method & Machinery'}</th>
              <th className="p-3 text-center">{isFa ? 'وضعیت پروژه' : 'Status'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {/* 1. Dig */}
            <tr className={`transition-colors ${franklinResult.category === 'dig' ? 'bg-emerald-500/10' : 'hover:bg-slate-800/40'}`}>
              <td className="p-3 font-bold text-emerald-400 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>{isFa ? 'Dig (حفاری مستقیم)' : 'Dig (Direct Digging)'}</span>
              </td>
              <td className="p-3 font-mono">Is &lt; 0.1 - 0.5 MPa (VL to L)</td>
              <td className="p-3 font-mono">{isFa ? 'If < 0.06m یا مقاومت بسیار پایین' : 'If < 0.06m or very low strength'}</td>
              <td className="p-3">{isFa ? 'بیل‌های هیدرولیکی استاندارد و لودرهای چرخ‌لاستیکی بدون نیاز به ریپر' : 'Standard hydraulic excavators and wheel loaders without rippers'}</td>
              <td className="p-3 text-center">
                {franklinResult.category === 'dig' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> {isFa ? 'منطبق' : 'Active'}
                  </span>
                ) : (
                  <span className="text-slate-600">-</span>
                )}
              </td>
            </tr>

            {/* 2. Rip */}
            <tr className={`transition-colors ${franklinResult.category === 'rip' ? 'bg-cyan-500/10' : 'hover:bg-slate-800/40'}`}>
              <td className="p-3 font-bold text-cyan-400 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>{isFa ? 'Rip (ریپرزنی)' : 'Rip (Mechanical Ripping)'}</span>
              </td>
              <td className="p-3 font-mono">Is = 0.1 - 2.5 MPa (L to H)</td>
              <td className="p-3 font-mono">If = 0.03 - 0.6 m (L to M)</td>
              <td className="p-3">{isFa ? 'بولدوزرهای سنگین CAT D8 / D9 / D10 با ریپر تک‌شاخه یا چندشاخه، چکش هیدرولیک' : 'Heavy crawler bulldozers (CAT D8/D9/D10) with single/multi shank rippers, hydraulic breakers'}</td>
              <td className="p-3 text-center">
                {franklinResult.category === 'rip' ? (
                  <span className="inline-flex items-center gap-1 text-cyan-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> {isFa ? 'منطبق' : 'Active'}
                  </span>
                ) : (
                  <span className="text-slate-600">-</span>
                )}
              </td>
            </tr>

            {/* 3. Blast to loosen */}
            <tr className={`transition-colors ${franklinResult.category === 'blast_to_loosen' ? 'bg-amber-500/10' : 'hover:bg-slate-800/40'}`}>
              <td className="p-3 font-bold text-amber-400 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>{isFa ? 'Blast to loosen (سست‌سازی)' : 'Blast to Loosen (Loosening)'}</span>
              </td>
              <td className="p-3 font-mono">Is &gt; 1.0 - 30.0 MPa (H to EH)</td>
              <td className="p-3 font-mono">{isFa ? 'If < 0.6 m (درزه‌داری فشرده با سنگ سخت)' : 'If < 0.6 m (closely spaced joints with hard rock)'}</td>
              <td className="p-3">{isFa ? 'آتشباری سبک با خرج ویژه کم (0.15–0.30 kg/m³) جهت باز کردن درزه‌ها و لق کردن بلوک‌ها' : 'Light blasting with low specific charge (0.15–0.30 kg/m³) to loosen blocks along discontinuities'}</td>
              <td className="p-3 text-center">
                {franklinResult.category === 'blast_to_loosen' ? (
                  <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> {isFa ? 'منطبق' : 'Active'}
                  </span>
                ) : (
                  <span className="text-slate-600">-</span>
                )}
              </td>
            </tr>

            {/* 4. Blast to fracture */}
            <tr className={`transition-colors ${franklinResult.category === 'blast_to_fracture' ? 'bg-rose-500/10' : 'hover:bg-slate-800/40'}`}>
              <td className="p-3 font-bold text-rose-400 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span>{isFa ? 'Blast to fracture (خردایش)' : 'Blast to Fracture (Production Blasting)'}</span>
              </td>
              <td className="p-3 font-mono">Is &gt; 0.5 - 30.0 MPa (M to EH)</td>
              <td className="p-3 font-mono">{isFa ? 'If > 0.6 m (H, VH, EH بلوک‌های یکپارچه)' : 'If > 0.6 m (H, VH, EH massive blocks)'}</td>
              <td className="p-3">{isFa ? 'الگوی کامل چالزنی و آتشباری انفجاری با خرج ویژه کامل (0.4–0.9 kg/m³) جهت خردایش ماتریس' : 'Full drill & blast pattern with full specific charge (0.4–0.9 kg/m³) to break rock matrix'}</td>
              <td className="p-3 text-center">
                {franklinResult.category === 'blast_to_fracture' ? (
                  <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> {isFa ? 'منطبق' : 'Active'}
                  </span>
                ) : (
                  <span className="text-slate-600">-</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
