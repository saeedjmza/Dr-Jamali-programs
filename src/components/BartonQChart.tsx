import React, { useRef, useState, useMemo, useEffect } from 'react';
import { QCalculationResult } from '../types';
import {
  Maximize2,
  Minimize2,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  Compass,
  Sparkles,
  Info,
} from 'lucide-react';

interface BartonQChartProps {
  result: QCalculationResult;
  onUpdatePoint: (newSpan: number, newQ: number) => void;
  lang: 'fa' | 'en';
}

export const BartonQChart: React.FC<BartonQChartProps> = ({
  result,
  onUpdatePoint,
  lang,
}) => {
  const isFa = lang === 'fa';
  const svgRef = useRef<SVGSVGElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number; q: number; de: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // SVG Coordinate Box
  const viewBoxWidth = 850;
  const viewBoxHeight = 520;
  const padding = { top: 45, right: 35, bottom: 65, left: 75 };

  const plotWidth = viewBoxWidth - padding.left - padding.right;
  const plotHeight = viewBoxHeight - padding.top - padding.bottom;

  // Log Limits
  // X: Q from 0.001 to 1000 (6 log cycles: 10^-3 to 10^3)
  const minLogQ = -3;
  const maxLogQ = 3;
  // Y: De (m) from 0.5 to 60 (log: log10(0.5) ~ -0.301 to log10(60) ~ 1.778)
  const minLogDe = Math.log10(0.5);
  const maxLogDe = Math.log10(60);

  // Mapping functions: Log value -> SVG pixel
  const scaleX = (logQ: number) => {
    return padding.left + ((logQ - minLogQ) / (maxLogQ - minLogQ)) * plotWidth;
  };

  const scaleY = (logDe: number) => {
    // Inverted Y: higher De is near top
    return padding.top + plotHeight - ((logDe - minLogDe) / (maxLogDe - minLogDe)) * plotHeight;
  };

  // Inverse mapping: SVG pixel -> (Q, De)
  const invertX = (px: number) => {
    const clampedPx = Math.max(padding.left, Math.min(padding.left + plotWidth, px));
    const logQ = minLogQ + ((clampedPx - padding.left) / plotWidth) * (maxLogQ - minLogQ);
    return Math.pow(10, logQ);
  };

  const invertY = (py: number) => {
    const clampedPy = Math.max(padding.top, Math.min(padding.top + plotHeight, py));
    const logDe = minLogDe + ((padding.top + plotHeight - clampedPy) / plotHeight) * (maxLogDe - minLogDe);
    return Math.pow(10, logDe);
  };

  // Generate curve for Maximum Unsupported Span (De_max = 2 * Q^0.4)
  const unsupportedCurvePoints = useMemo(() => {
    const points: { x: number; y: number; q: number; de: number }[] = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const logQ = minLogQ + (i / steps) * (maxLogQ - minLogQ);
      const q = Math.pow(10, logQ);
      const de = 2 * Math.pow(q, 0.4);
      if (de >= 0.5 && de <= 60) {
        const logDe = Math.log10(de);
        points.push({
          x: scaleX(logQ),
          y: scaleY(logDe),
          q,
          de,
        });
      }
    }
    return points;
  }, [plotWidth, plotHeight]);

  // Unsupported line SVG Path string
  const unsupportedPathStr = useMemo(() => {
    if (unsupportedCurvePoints.length === 0) return '';
    return unsupportedCurvePoints
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');
  }, [unsupportedCurvePoints]);

  // Area under the unsupported curve (Stable / Unsupported Zone)
  const unsupportedAreaPathStr = useMemo(() => {
    if (unsupportedCurvePoints.length === 0) return '';
    const first = unsupportedCurvePoints[0];
    const last = unsupportedCurvePoints[unsupportedCurvePoints.length - 1];
    const bottomY = scaleY(minLogDe);

    return `M ${first.x.toFixed(1)} ${bottomY.toFixed(1)} ` +
      unsupportedCurvePoints.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
      ` L ${last.x.toFixed(1)} ${bottomY.toFixed(1)} Z`;
  }, [unsupportedCurvePoints]);

  // Current operating point on chart
  const currentPointPx = useMemo(() => {
    const logQ = Math.log10(Math.max(0.001, Math.min(1000, result.qValue)));
    const logDe = Math.log10(Math.max(0.5, Math.min(60, result.equivalentDimension)));
    return {
      x: scaleX(logQ),
      y: scaleY(logDe),
    };
  }, [result.qValue, result.equivalentDimension, plotWidth, plotHeight]);

  // Gridlines and Ticks
  const qTicks = [
    { q: 0.001, label: '0.001', log: -3 },
    { q: 0.01, label: '0.01', log: -2 },
    { q: 0.1, label: '0.1', log: -1 },
    { q: 1.0, label: '1.0', log: 0 },
    { q: 10.0, label: '10', log: 1 },
    { q: 100.0, label: '100', log: 2 },
    { q: 1000.0, label: '1000', log: 3 },
  ];

  const deTicks = [
    { de: 0.5, label: '0.5' },
    { de: 1.0, label: '1' },
    { de: 2.0, label: '2' },
    { de: 5.0, label: '5' },
    { de: 10.0, label: '10' },
    { de: 20.0, label: '20' },
    { de: 50.0, label: '50' },
  ];

  // Mouse / Touch Event Handlers
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    setIsDragging(true);
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * viewBoxWidth;
    const py = ((e.clientY - rect.top) / rect.height) * viewBoxHeight;

    const newQ = invertX(px);
    const newDe = invertY(py);
    const newSpan = newDe * result.esr;

    onUpdatePoint(
      parseFloat(Math.max(0.5, Math.min(20, newSpan)).toFixed(1)),
      parseFloat(newQ.toFixed(2))
    );
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * viewBoxWidth;
    const py = ((e.clientY - rect.top) / rect.height) * viewBoxHeight;

    const q = invertX(px);
    const de = invertY(py);

    setHoverPos({ x: px, y: py, q, de });

    if (isDragging) {
      const newSpan = de * result.esr;
      onUpdatePoint(
        parseFloat(Math.max(0.5, Math.min(20, newSpan)).toFixed(1)),
        parseFloat(q.toFixed(2))
      );
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      id="barton-q-chart-panel"
      className={`bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col space-y-4 transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 overflow-auto' : ''
      }`}
    >
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{isFa ? 'نمودار خودایستایی شاخص Q بارتون' : 'Barton Q-System Stand-up Envelope'}</span>
              <span className="text-[11px] font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/60">
                De = 2 × Q^0.4
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isFa
                ? 'ابعاد معادل دهانه (De = Span / ESR) در برابر کیفیت سنگ (Q)'
                : 'Equivalent Dimension (De) vs Rock Mass Quality (Q)'}
            </p>
          </div>
        </div>

        {/* Legend & Fullscreen control */}
        <div className="flex items-center gap-2 text-xs">
          <div className="hidden sm:flex items-center gap-3 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/50 inline-block" />
              <span className="text-slate-300">{isFa ? 'ناحیه خودایستا (Unsupported)' : 'Unsupported'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-400 inline-block" />
              <span className="text-slate-300">{isFa ? 'مرز بحرانی دهانه' : 'Max Span Line'}</span>
            </div>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isFullscreen ? 'خروج از تمام صفحه' : 'تمام صفحه'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Project Rock Mass Header Info Box */}
      <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200 text-xs">
            {isFa ? 'کادر توده‌سنگ پروژه:' : 'Project Rock Mass Box:'}
          </span>
          <span
            className="px-2.5 py-0.5 rounded-md text-[11px] font-bold text-white shadow-xs"
            style={{ backgroundColor: result.qClass.color }}
          >
            {isFa ? result.qClass.nameFa : result.qClass.nameEn}
          </span>
        </div>
        <div className="flex items-center gap-4 flex-wrap text-slate-300 font-mono text-[11px]">
          <div>
            <span className="text-slate-400">{isFa ? 'شاخص Q بارتون:' : 'Barton Q:'} </span>
            <strong className="text-teal-400 text-xs">
              {result.qValue < 0.1 ? result.qValue.toFixed(3) : result.qValue.toFixed(2)}
            </strong>
          </div>
          <div>
            <span className="text-slate-400">{isFa ? 'دهانه حفاری (Span):' : 'Excavation Span:'} </span>
            <strong className="text-slate-100 text-xs">{result.span.toFixed(1)} m</strong>
          </div>
          <div>
            <span className="text-slate-400">{isFa ? 'ابعاد معادل De:' : 'Equivalent Dim (De):'} </span>
            <strong className="text-cyan-400 text-xs">
              {result.equivalentDimension.toFixed(2)} m (ESR = {result.esr})
            </strong>
          </div>
          <div>
            <span className="text-slate-400">{isFa ? 'حداکثر دهانه خودایستا:' : 'Max Unsupported Span:'} </span>
            <strong className="text-purple-400 text-xs">{result.maxUnsupportedSpan.toFixed(2)} m</strong>
          </div>
          <div>
            <span className="text-slate-400">{isFa ? 'وضعیت پایداری:' : 'Stability Status:'} </span>
            <strong className={`text-xs ${result.isSelfSupporting ? 'text-emerald-400' : 'text-rose-400'}`}>
              {result.isSelfSupporting
                ? isFa ? '✓ خودایستا و پایدار' : '✓ Unsupported Stable'
                : isFa ? '⚠ نیازمند سیستم نگهداری' : '⚠ Support Required'}
            </strong>
          </div>
        </div>
      </div>

      {/* SVG Chart Stage */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-slate-950/90 rounded-xl border border-slate-800 overflow-hidden select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-full cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            setIsHovering(false);
            setIsDragging(false);
          }}
        >
          <defs>
            {/* Stable zone gradient */}
            <linearGradient id="stableZoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.08" />
            </linearGradient>

            {/* Supported zone pattern */}
            <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#334155" strokeWidth="0.8" opacity="0.4" />
            </pattern>

            {/* Glowing filter for active point */}
            <filter id="qGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            fill="#020617"
          />

          {/* Supported Zone (Top Background Hatch) */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            fill="url(#diagonalHatch)"
          />

          {/* Stable / Unsupported Zone (Area Under Curve) */}
          {unsupportedAreaPathStr && (
            <path
              d={unsupportedAreaPathStr}
              fill="url(#stableZoneGrad)"
              stroke="none"
            />
          )}

          {/* Gridlines - X Log Ticks */}
          {qTicks.map((tick) => {
            const x = scaleX(tick.log);
            return (
              <g key={tick.q}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + plotHeight}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray={tick.q === 1.0 ? 'none' : '3 3'}
                />
                <text
                  x={x}
                  y={padding.top + plotHeight + 18}
                  fill="#94a3b8"
                  fontSize="11"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Minor Log Ticks for Q */}
          {[-3, -2, -1, 0, 1, 2].map((baseLog) => {
            return [2, 3, 4, 5, 6, 7, 8, 9].map((mult) => {
              const val = mult * Math.pow(10, baseLog);
              const logVal = Math.log10(val);
              if (logVal >= maxLogQ) return null;
              const x = scaleX(logVal);
              return (
                <line
                  key={val}
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + plotHeight}
                  stroke="#0f172a"
                  strokeWidth="0.75"
                />
              );
            });
          })}

          {/* Gridlines - Y De Ticks */}
          {deTicks.map((tick) => {
            const y = scaleY(Math.log10(tick.de));
            return (
              <g key={tick.de}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + plotWidth}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize="11"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Plot Border */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            fill="none"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Critical Unsupported Boundary Curve (De_max = 2 * Q^0.4) */}
          {unsupportedPathStr && (
            <g>
              <path
                d={unsupportedPathStr}
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d={unsupportedPathStr}
                fill="none"
                stroke="#34d399"
                strokeWidth="1.5"
                strokeDasharray="5 3"
              />
            </g>
          )}

          {/* Zone Labels on Chart */}
          <g>
            {/* Stable Unsupported Label */}
            <text
              x={scaleX(1.5)}
              y={scaleY(Math.log10(1.5))}
              fill="#34d399"
              fontSize="12"
              fontWeight="bold"
              opacity="0.85"
            >
              {isFa ? '✓ محدوده خودایستا و پایدار' : '✓ Unsupported Stable Zone'}
            </text>
            <text
              x={scaleX(1.5)}
              y={scaleY(Math.log10(1.5)) + 14}
              fill="#6ee7b7"
              fontSize="9.5"
              fontFamily="monospace"
              opacity="0.7"
            >
              (De &lt; 2 × Q^0.4)
            </text>

            {/* Supported Zone Label */}
            <text
              x={scaleX(-1.5)}
              y={scaleY(Math.log10(15))}
              fill="#f87171"
              fontSize="12"
              fontWeight="bold"
              opacity="0.85"
            >
              {isFa ? '⚠ نیازمند سیستم نگهداری (Supported)' : '⚠ Support Required Zone'}
            </text>
          </g>

          {/* Axis Titles */}
          {/* X Axis Label */}
          <text
            x={padding.left + plotWidth / 2}
            y={viewBoxHeight - 15}
            fill="#e2e8f0"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
          >
            {isFa
              ? 'شاخص کیفیت توده سنگ بارتون (Rock Mass Quality, Q)'
              : 'Rock Mass Quality Index (Barton Q)'}
          </text>

          {/* Y Axis Label */}
          <text
            x={-(padding.top + plotHeight / 2)}
            y={22}
            fill="#e2e8f0"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            transform="rotate(-90)"
          >
            {isFa
              ? 'ابعاد معادل دهانه De = Span / ESR (متر)'
              : 'Equivalent Dimension De = Span / ESR (m)'}
          </text>

          {/* Operational Crosshair Guidelines */}
          <line
            x1={currentPointPx.x}
            y1={padding.top}
            x2={currentPointPx.x}
            y2={padding.top + plotHeight}
            stroke={result.qClass.borderColor}
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.65"
          />
          <line
            x1={padding.left}
            y1={currentPointPx.y}
            x2={padding.left + plotWidth}
            y2={currentPointPx.y}
            stroke={result.qClass.borderColor}
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.65"
          />

          {/* Active Operating Point */}
          <g>
            {/* Halo Pulsing Ring */}
            <circle
              cx={currentPointPx.x}
              cy={currentPointPx.y}
              r="14"
              fill={result.qClass.color}
              opacity="0.25"
              className="animate-ping"
            />
            {/* Outer Ring */}
            <circle
              cx={currentPointPx.x}
              cy={currentPointPx.y}
              r="8"
              fill="#0f172a"
              stroke={result.qClass.borderColor}
              strokeWidth="2.5"
            />
            {/* Center Dot */}
            <circle
              cx={currentPointPx.x}
              cy={currentPointPx.y}
              r="4.5"
              fill={result.qClass.color}
              filter="url(#qGlow)"
            />
          </g>

          {/* Project Rock Mass Data Box on Point (Adaptive Centering & Spatial Alignment) */}
          {(() => {
            const tipWidth = 220;
            const tipHeight = 74;
            const isRightSide = currentPointPx.x <= viewBoxWidth - padding.right - tipWidth - 25;
            const tipOffsetX = isRightSide ? 18 : -(tipWidth + 18);
            const isTopSide = currentPointPx.y < padding.top + tipHeight + 20;
            const tipOffsetY = isTopSide ? 14 : -(tipHeight + 14);

            // Leader connector line coordinates
            const leaderX1 = currentPointPx.x + (isRightSide ? 8 : -8);
            const leaderY1 = currentPointPx.y + (isTopSide ? 6 : -6);
            const cardCornerX = isRightSide ? 0 : tipWidth;
            const cardCornerY = isTopSide ? 0 : tipHeight;

            return (
              <g className="pointer-events-none select-none">
                {/* Dashed connector leader from marker to box */}
                <line
                  x1={leaderX1}
                  y1={leaderY1}
                  x2={currentPointPx.x + tipOffsetX + cardCornerX}
                  y2={currentPointPx.y + tipOffsetY + cardCornerY}
                  stroke="#14b8a6"
                  strokeWidth="1.4"
                  strokeDasharray="3,2"
                  opacity="0.8"
                />

                {/* Floating Box Container */}
                <g
                  transform={`translate(${currentPointPx.x + tipOffsetX}, ${currentPointPx.y + tipOffsetY})`}
                  dir="ltr"
                  style={{ direction: 'ltr' }}
                >
                  <rect
                    x="0"
                    y="0"
                    width={tipWidth}
                    height={tipHeight}
                    rx="8"
                    fill="#020617"
                    fillOpacity="0.96"
                    stroke={result.qClass.borderColor || '#14b8a6'}
                    strokeWidth="1.8"
                    filter="drop-shadow(0 4px 12px rgba(0,0,0,0.5))"
                  />

                  {/* Card Title (Centered) */}
                  <text
                    x={tipWidth / 2}
                    y="18"
                    textAnchor="middle"
                    fill="#2dd4bf"
                    fontSize="11"
                    fontWeight="bold"
                    direction={isFa ? 'rtl' : 'ltr'}
                    style={{ direction: isFa ? 'rtl' : 'ltr', unicodeBidi: 'plaintext' }}
                  >
                    {isFa ? '📍 توده‌سنگ پروژه' : '📍 Project Rock Mass'}
                  </text>

                  {/* Metric 1: Q & De (Centered) */}
                  <text
                    x={tipWidth / 2}
                    y="34"
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="10"
                    fontWeight="600"
                    className="font-mono"
                  >
                    Q = {result.qValue < 0.1 ? result.qValue.toFixed(3) : result.qValue.toFixed(2)} | De = {result.equivalentDimension.toFixed(2)} m
                  </text>

                  {/* Metric 2: Span & ESR (Centered) */}
                  <text
                    x={tipWidth / 2}
                    y="49"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9.5"
                    className="font-mono"
                  >
                    {isFa
                      ? `دهانه: ${result.span.toFixed(1)}m (ESR = ${result.esr})`
                      : `Span: ${result.span.toFixed(1)}m (ESR = ${result.esr})`}
                  </text>

                  {/* Metric 3: Stability Status (Centered) */}
                  <text
                    x={tipWidth / 2}
                    y="64"
                    textAnchor="middle"
                    fill={result.isSelfSupporting ? '#34d399' : '#f87171'}
                    fontSize="10"
                    fontWeight="bold"
                    direction={isFa ? 'rtl' : 'ltr'}
                    style={{ direction: isFa ? 'rtl' : 'ltr', unicodeBidi: 'plaintext' }}
                  >
                    {result.isSelfSupporting
                      ? isFa ? `✓ خودایستا (Smax = ${result.maxUnsupportedSpan.toFixed(1)}m)` : `✓ Self-supporting (Smax = ${result.maxUnsupportedSpan.toFixed(1)}m)`
                      : isFa ? `⚠ نیازمند نگهداری (Smax = ${result.maxUnsupportedSpan.toFixed(1)}m)` : `⚠ Support required (Smax = ${result.maxUnsupportedSpan.toFixed(1)}m)`}
                  </text>
                </g>
              </g>
            );
          })()}

          {/* Interactive Mouse Hover Crosshair */}
          {isHovering && hoverPos && !isDragging && (
            <g opacity="0.5" pointerEvents="none">
              <line
                x1={hoverPos.x}
                y1={padding.top}
                x2={hoverPos.x}
                y2={padding.top + plotHeight}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <line
                x1={padding.left}
                y1={hoverPos.y}
                x2={padding.left + plotWidth}
                y2={hoverPos.y}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Chart Footer Quick Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between min-h-[64px]">
          <span className="text-[10px] text-slate-400">{isFa ? 'شاخص Q بارتون:' : 'Barton Q Index:'}</span>
          <span className="font-mono font-bold text-slate-100 text-sm mt-1" style={{ color: result.qClass.textColor }}>
            {result.qValue < 0.1 ? result.qValue.toFixed(3) : result.qValue.toFixed(2)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between min-h-[64px]">
          <span className="text-[10px] text-slate-400">{isFa ? 'ابعاد معادل De:' : 'Equivalent Dim (De):'}</span>
          <span className="font-mono font-bold text-amber-400 text-sm mt-1">
            {result.equivalentDimension} m
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between min-h-[64px]">
          <span className="text-[10px] text-slate-400">{isFa ? 'حداکثر دهانه خودایستا:' : 'Max Unsupported Span:'}</span>
          <span className="font-mono font-bold text-emerald-400 text-sm mt-1">
            {result.maxUnsupportedSpan} m
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between min-h-[64px]">
          <span className="text-[10px] text-slate-400">{isFa ? 'نسبت پایداری دهانه:' : 'Stability Ratio:'}</span>
          <span
            className={`font-mono font-bold text-sm mt-1 ${
              result.stabilityRatio >= 1.0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {result.stabilityRatio} {result.stabilityRatio >= 1.0 ? (isFa ? '(ایمن)' : '(Safe)') : (isFa ? '(بحرانی)' : '(Critical)')}
          </span>
        </div>
      </div>
    </div>
  );
};
