import React, { useRef, useState, useEffect, useMemo } from 'react';
import { extractExactQSupportParameters, ExtractedSupportParameters } from '../../utils/qCalculation';

interface FiberReinforcedQChartProps {
  currentQ: number;
  de: number; // Span / ESR
  boltLength: number;
  onPointChange?: (newQ: number, newDe: number) => void;
  language: 'fa' | 'en';
}

export const FiberReinforcedQChart: React.FC<FiberReinforcedQChartProps> = ({
  currentQ,
  de,
  boltLength,
  onPointChange,
  language,
}) => {
  const isFa = language === 'fa';
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // SVG dimensions
  const svgWidth = 960;
  const svgHeight = 620;
  const margin = { top: 75, right: 85, bottom: 65, left: 75 };
  const plotWidth = svgWidth - margin.left - margin.right; // 800
  const plotHeight = svgHeight - margin.top - margin.bottom; // 480

  // Log scale ranges:
  // Q from 0.001 to 1000 (6 decades, -3 to +3)
  // De from 1 to 100 (2 decades, 0 to 2)
  const minLogQ = -3;
  const maxLogQ = 3;
  const minLogDe = 0;
  const maxLogDe = 2;

  const qToX = (q: number) => {
    const clamped = Math.max(0.001, Math.min(1000, q));
    const logQ = Math.log10(clamped);
    return margin.left + ((logQ - minLogQ) / (maxLogQ - minLogQ)) * plotWidth;
  };

  const deToY = (valDe: number) => {
    const clamped = Math.max(1, Math.min(100, valDe));
    const logDe = Math.log10(clamped);
    return margin.top + plotHeight - ((logDe - minLogDe) / (maxLogDe - minLogDe)) * plotHeight;
  };

  const xToQ = (x: number) => {
    const clampedX = Math.max(margin.left, Math.min(margin.left + plotWidth, x));
    const ratio = (clampedX - margin.left) / plotWidth;
    const logQ = minLogQ + ratio * (maxLogQ - minLogQ);
    return Math.pow(10, logQ);
  };

  const yToDe = (y: number) => {
    const clampedY = Math.max(margin.top, Math.min(margin.top + plotHeight, y));
    const ratio = (margin.top + plotHeight - clampedY) / plotHeight;
    const logDe = minLogDe + ratio * (maxLogDe - minLogDe);
    return Math.pow(10, logDe);
  };

  // Exact extracted parameters from central calculation engine
  const supportParams: ExtractedSupportParameters = useMemo(() => {
    return extractExactQSupportParameters(currentQ, de);
  }, [currentQ, de]);

  const handleInteraction = (clientX: number, clientY: number) => {
    if (!svgRef.current || !onPointChange) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = ((clientX - rect.left) / rect.width) * svgWidth;
    const clickY = ((clientY - rect.top) / rect.height) * svgHeight;

    const calculatedQ = xToQ(clickX);
    const calculatedDe = yToDe(clickY);

    const roundedQ =
      calculatedQ < 0.01
        ? Number(calculatedQ.toFixed(4))
        : calculatedQ < 1
        ? Number(calculatedQ.toFixed(3))
        : calculatedQ < 10
        ? Number(calculatedQ.toFixed(2))
        : Number(calculatedQ.toFixed(1));

    const roundedDe = Number(calculatedDe.toFixed(1));

    onPointChange(roundedQ, roundedDe);
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsDragging(true);
    handleInteraction(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) {
      handleInteraction(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (isDragging && e.touches.length > 0) {
      handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    const handleGlobalUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchend', handleGlobalUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, []);

  // Top header quality categories from Image 1:
  // G: 0.001 - 0.01 (Exceptionally poor)
  // F: 0.01 - 0.1 (Extremely poor)
  // E: 0.1 - 1.0 (Very poor)
  // D: 1.0 - 4.0 (Poor)
  // C: 4.0 - 10.0 (Fair)
  // B: 10.0 - 40.0 (Good)
  // A: 40.0 - 1000.0 (Very good)
  const qualityCategories = [
    { letter: 'G', titleEn: 'Exceptionally poor', titleFa: 'به‌طور استثنایی ضعیف', q1: 0.001, q2: 0.01 },
    { letter: 'F', titleEn: 'Extremely poor', titleFa: 'فوق‌العاده ضعیف', q1: 0.01, q2: 0.1 },
    { letter: 'E', titleEn: 'Very poor', titleFa: 'بسیار ضعیف', q1: 0.1, q2: 1.0 },
    { letter: 'D', titleEn: 'Poor', titleFa: 'ضعیف', q1: 1.0, q2: 4.0 },
    { letter: 'C', titleEn: 'Fair', titleFa: 'متوسط', q1: 4.0, q2: 10.0 },
    { letter: 'B', titleEn: 'Good', titleFa: 'خوب', q1: 10.0, q2: 40.0 },
    { letter: 'A', titleEn: 'Very good', titleFa: 'بسیار خوب', q1: 40.0, q2: 1000.0 },
  ];

  // Grid tick definitions
  const qMajorTicks = [0.001, 0.004, 0.01, 0.04, 0.1, 0.4, 1, 4, 10, 40, 100, 400, 1000];
  const deTicks = [1, 2, 3, 5, 10, 20, 50, 100];
  const boltTicks = [
    { deVal: 1.0, label: '1.5' },
    { deVal: 2.7, label: '2.4' },
    { deVal: 6.7, label: '3.0' },
    { deVal: 20.0, label: '5.0' },
    { deVal: 33.3, label: '7.0' },
    { deVal: 60.0, label: '11.0' },
    { deVal: 100.0, label: '20.0' },
  ];

  // Colors matching the original NGI chart in Image 1
  const zoneColors = {
    zone9: '#d4e8f7', // Light sky blue (in-situ cast concrete)
    zone8: '#ba4234', // Terracotta dark red
    zone7: '#cf5a3b', // Warm terracotta orange
    zone6: '#df743c', // Deep orange
    zone5: '#ea9342', // Amber orange
    zone4: '#f2b34e', // Golden amber
    zone3: '#f7cb58', // Warm yellow
    zone2: '#fae674', // Pale yellow (Spot bolting)
    zone1: '#d4e8f7', // Light sky blue (Unsupported)
  };

  // Build polygon points for color zones based on boundary curves
  // Each line is c = log10(De) - 0.40*log10(Q)
  // Q = 10^((log10(De) - c) / 0.40)
  const qFromDeAndC = (valDe: number, c: number) => {
    const logQ = (Math.log10(valDe) - c) / 0.40;
    return Math.max(0.001, Math.min(1000, Math.pow(10, logQ)));
  };

  // Helper to generate path for a diagonal band between c1 and c2
  const makeBandPolygon = (cLeft: number, cRight: number, deMin: number, deMax: number) => {
    const deSteps = [deMin, Math.sqrt(deMin * deMax), deMax];
    const leftPoints = deSteps.map(deVal => `${qToX(qFromDeAndC(deVal, cLeft))},${deToY(deVal)}`);
    const rightPoints = [...deSteps].reverse().map(deVal => `${qToX(qFromDeAndC(deVal, cRight))},${deToY(deVal)}`);
    return `${leftPoints.join(' ')} ${rightPoints.join(' ')}`;
  };

  // Coordinate of current point
  const currentX = qToX(currentQ);
  const currentY = deToY(de);

  return (
    <div className="w-full flex flex-col gap-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* 1. Header & Title Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="font-extrabold text-lg text-slate-900">
              {isFa
                ? 'نمودار سیستم نگهداری تجربی Q (NGI - شاتکریت الیاف‌دار Sfr)'
                : 'Empirical Q-System Support Chart (NGI - Fibre-reinforced Sfr)'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isFa
              ? 'شبیه‌سازی کامل، دقیق و هندسی بر اساس سیستم بارتون ۲۰۰۷ / ۲۰۱۴ با قابلیت استخراج بلادرنگ ضخامت شاتکریت، طول بولت و فواصل'
              : 'Complete geometric simulation based on Barton NGI 2007/2014 with real-time extraction of shotcrete thickness, bolt length, and spacing'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md border border-amber-300">
            {isFa ? `رده نگهداری فعال: (${supportParams.category})` : `Active Support Category: (${supportParams.category})`}
          </span>
          <span className="bg-blue-100 text-blue-900 px-2.5 py-1 rounded-md border border-blue-300 font-mono">
            Q = {currentQ} | De = {de}
          </span>
        </div>
      </div>

      {/* 2. Interactive SVG Chart */}
      <div className="relative w-full overflow-x-auto bg-white rounded-2xl border border-slate-300 shadow-md p-2 sm:p-4">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none cursor-crosshair drop-shadow-sm"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          style={{ minWidth: '780px' }}
        >
          <defs>
            {/* Soft grid pattern for decades */}
            <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.25" />
            </filter>
            <linearGradient id="unsupportedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4e8f7" />
              <stop offset="100%" stopColor="#e7f3fc" />
            </linearGradient>

            {/* Clip path strictly restricting Zones 1 to 8 and isolines below the Average bolt spacing with Sfr curve */}
            <clipPath id="clip-below-sfr-curve">
              <path
                d={`
                  M ${qToX(0.001)} ${deToY(1.0)}
                  L ${qToX(1000.0)} ${deToY(1.0)}
                  L ${qToX(1000.0)} ${deToY(100.0)}
                  L ${qToX(40.0)} ${deToY(100.0)}
                  C ${qToX(10.0)} ${deToY(86.0)}, ${qToX(1.0)} ${deToY(68.0)}, ${qToX(0.1)} ${deToY(50.0)}
                  C ${qToX(0.02)} ${deToY(38.0)}, ${qToX(0.005)} ${deToY(30.0)}, ${qToX(0.001)} ${deToY(25.0)}
                  Z
                `}
              />
            </clipPath>
          </defs>

          {/* BACKGROUND */}
          <rect
            x={margin.left}
            y={margin.top}
            width={plotWidth}
            height={plotHeight}
            fill="#ffffff"
          />

          {/* ========================================================================= */}
          {/* TOP HEADER BAR: ROCK MASS QUALITY AND ROCK SUPPORT (Matching Image 1)     */}
          {/* ========================================================================= */}
          <g id="top-quality-header">
            {/* Top Outer Box */}
            <rect
              x={margin.left}
              y={14}
              width={plotWidth}
              height={46}
              fill="#f1f5f9"
              stroke="#334155"
              strokeWidth="1.4"
            />
            {/* Top Title */}
            <text
              x={margin.left + plotWidth / 2}
              y={27}
              textAnchor="middle"
              className="text-[11px] font-bold fill-slate-800 tracking-wider uppercase"
            >
              {isFa ? 'کیفیت توده سنگ و سیستم نگهداری سنگ (ROCK MASS QUALITY AND ROCK SUPPORT)' : 'ROCK MASS QUALITY AND ROCK SUPPORT'}
            </text>
            <line
              x1={margin.left}
              y1={32}
              x2={margin.left + plotWidth}
              y2={32}
              stroke="#334155"
              strokeWidth="1.2"
            />

            {/* 7 Quality Categories (G, F, E, D, C, B, A) */}
            {qualityCategories.map((cat, idx) => {
              const xStart = qToX(cat.q1);
              const xEnd = qToX(cat.q2);
              const xMid = (xStart + xEnd) / 2;
              const isCurrent = currentQ >= cat.q1 && currentQ < cat.q2;

              return (
                <g key={cat.letter}>
                  {idx > 0 && (
                    <line
                      x1={xStart}
                      y1={32}
                      x2={xStart}
                      y2={60}
                      stroke="#475569"
                      strokeWidth="1.1"
                    />
                  )}
                  {/* Category letter badge */}
                  <rect
                    x={xMid - 8}
                    y={34}
                    width={16}
                    height={12}
                    rx={2}
                    fill={isCurrent ? '#f59e0b' : '#334155'}
                  />
                  <text
                    x={xMid}
                    y={43}
                    textAnchor="middle"
                    className="text-[9.5px] font-black fill-white"
                  >
                    {cat.letter}
                  </text>
                  {/* Category descriptive title */}
                  <text
                    x={xMid}
                    y={56}
                    textAnchor="middle"
                    className={`text-[8px] font-semibold ${
                      isCurrent ? 'fill-amber-800 font-bold' : 'fill-slate-750'
                    }`}
                  >
                    {isFa ? cat.titleFa : cat.titleEn}
                  </text>
                </g>
              );
            })}
          </g>

          {/* ========================================================================= */}
          {/* COLORED SUPPORT ZONES (POLYGONS SIMULATING IMAGE 1 EXACTLY)                */}
          {/* ========================================================================= */}
          <g id="support-zones">
            {/* Zones 1 to 8: Strictly clipped below the Average bolt spacing with Sfr curve */}
            <g clipPath="url(#clip-below-sfr-curve)">
              {/* Zone 1: Unsupported (Bottom right sky blue) */}
              <polygon
                points={`
                  ${qToX(0.1)},${deToY(1.0)} 
                  ${qToX(1.0)},${deToY(2.0)} 
                  ${qToX(10.0)},${deToY(5.0)} 
                  ${qToX(40.0)},${deToY(8.7)} 
                  ${qToX(100.0)},${deToY(12.6)} 
                  ${qToX(1000.0)},${deToY(31.7)} 
                  ${qToX(1000.0)},${deToY(1.0)}
                `}
                fill={zoneColors.zone1}
                opacity="0.9"
              />

              {/* Zone 2: Spot Bolting (Pale yellow) */}
              <polygon
                points={`
                  ${qToX(0.05)},${deToY(1.0)} 
                  ${qToX(1.0)},${deToY(3.31)} 
                  ${qToX(10.0)},${deToY(8.32)} 
                  ${qToX(100.0)},${deToY(20.9)} 
                  ${qToX(1000.0)},${deToY(52.5)} 
                  ${qToX(1000.0)},${deToY(31.7)} 
                  ${qToX(100.0)},${deToY(12.6)} 
                  ${qToX(40.0)},${deToY(8.7)} 
                  ${qToX(10.0)},${deToY(5.0)} 
                  ${qToX(1.0)},${deToY(2.0)} 
                  ${qToX(0.1)},${deToY(1.0)}
                `}
                fill={zoneColors.zone2}
                opacity="0.95"
              />

              {/* Zone 3: Systematic Bolting (Bright warm yellow) between 5cm and 6cm lines */}
              <polygon
                points={makeBandPolygon(0.52, 0.67, 1.0, 100)}
                fill={zoneColors.zone3}
                opacity="0.95"
              />

              {/* Zone 4: Systematic Bolting + Plain/Thin Sfr (Golden amber) between 6cm and 9cm lines */}
              <polygon
                points={makeBandPolygon(0.67, 1.16, 1.0, 100)}
                fill={zoneColors.zone4}
                opacity="0.95"
              />

              {/* Zone 5: 9-12 cm Sfr + Bolting (Amber orange) between 9cm and 12cm lines */}
              <polygon
                points={makeBandPolygon(1.16, 1.44, 1.0, 100)}
                fill={zoneColors.zone5}
                opacity="0.95"
              />

              {/* Zone 6: 12-15 cm Sfr + Bolting (Deep orange) between 12cm and 15cm lines */}
              <polygon
                points={makeBandPolygon(1.44, 1.72, 1.0, 100)}
                fill={zoneColors.zone6}
                opacity="0.95"
              />

              {/* Zone 7: 15-25 cm Sfr + Bolting (Terracotta orange) between 15cm and 25cm lines */}
              <polygon
                points={makeBandPolygon(1.72, 2.15, 1.0, 100)}
                fill={zoneColors.zone7}
                opacity="0.95"
              />

              {/* Zone 8: Over 25 cm Sfr + RRS + Bolting (Terracotta dark red) */}
              <polygon
                points={`
                  ${qToX(0.001)},${deToY(1.0)} 
                  ${qToX(0.001)},${deToY(100.0)} 
                  ${qToX(0.422)},${deToY(100.0)} 
                  ${qToX(0.001)},${deToY(8.91)}
                `}
                fill={zoneColors.zone8}
                opacity="0.95"
              />
            </g>

            {/* Zone 9: Unified Single Region above the "Average bolt spacing with Sfr" curve */}
            <path
              d={`
                M ${qToX(0.001)} ${deToY(25.0)}
                C ${qToX(0.005)} ${deToY(30.0)}, ${qToX(0.02)} ${deToY(38.0)}, ${qToX(0.1)} ${deToY(50.0)}
                C ${qToX(1.0)} ${deToY(68.0)}, ${qToX(10)} ${deToY(86.0)}, ${qToX(40)} ${deToY(100.0)}
                L ${qToX(0.001)} ${deToY(100.0)}
                Z
              `}
              fill={zoneColors.zone9}
              opacity="0.95"
            />
          </g>

          {/* ========================================================================= */}
          {/* GRID LINES & TICK MARKS                                                   */}
          {/* ========================================================================= */}
          <g id="grid-lines" stroke="#94a3b8" strokeWidth="0.55" opacity="0.6">
            {/* Decade Sub-ticks & vertical grid lines */}
            {[0.001, 0.01, 0.1, 1, 10, 100].map((decadeBase) => (
              <React.Fragment key={`sub-${decadeBase}`}>
                {[2, 3, 4, 5, 6, 7, 8, 9].map((mult) => {
                  const val = decadeBase * mult;
                  if (val > 1000) return null;
                  const x = qToX(val);
                  return (
                    <line
                      key={`vtick-${val}`}
                      x1={x}
                      y1={margin.top}
                      x2={x}
                      y2={margin.top + plotHeight}
                      stroke="#cbd5e1"
                      strokeDasharray="2 3"
                    />
                  );
                })}
              </React.Fragment>
            ))}

            {/* Horizontal sub-ticks for De */}
            {[1, 10].map((decadeBase) => (
              <React.Fragment key={`subDe-${decadeBase}`}>
                {[2, 3, 4, 5, 6, 7, 8, 9].map((mult) => {
                  const val = decadeBase * mult;
                  if (val > 100) return null;
                  const y = deToY(val);
                  return (
                    <line
                      key={`htick-${val}`}
                      x1={margin.left}
                      y1={y}
                      x2={margin.left + plotWidth}
                      y2={y}
                      stroke="#cbd5e1"
                      strokeDasharray="2 3"
                    />
                  );
                })}
              </React.Fragment>
            ))}

            {/* Major Q vertical grid lines */}
            {qMajorTicks.map((val) => (
              <line
                key={`qline-${val}`}
                x1={qToX(val)}
                y1={margin.top}
                x2={qToX(val)}
                y2={margin.top + plotHeight}
                stroke="#64748b"
                strokeWidth={val === 0.01 || val === 0.1 || val === 1 || val === 10 || val === 100 ? '1.0' : '0.6'}
                opacity="0.8"
              />
            ))}

            {/* Major De horizontal grid lines */}
            {deTicks.map((val) => (
              <line
                key={`deline-${val}`}
                x1={margin.left}
                y1={deToY(val)}
                x2={margin.left + plotWidth}
                y2={deToY(val)}
                stroke="#64748b"
                strokeWidth={val === 1 || val === 10 || val === 100 ? '1.0' : '0.6'}
                opacity="0.8"
              />
            ))}
          </g>

          {/* ========================================================================= */}
          {/* DIAGONAL SHOTCRETE THICKNESS ISOLINES (Crimson/Maroon lines matching Img 1) */}
          {/* ========================================================================= */}
          <g id="shotcrete-thickness-isolines" clipPath="url(#clip-below-sfr-curve)">
            {/* 25 cm line (c = 2.15) */}
            <line
              x1={qToX(0.001)}
              y1={deToY(8.91)}
              x2={qToX(0.422)}
              y2={deToY(100.0)}
              stroke="#801919"
              strokeWidth="2.2"
            />
            {/* 15 cm line (c = 1.72) */}
            <line
              x1={qToX(0.001)}
              y1={deToY(3.31)}
              x2={qToX(5.01)}
              y2={deToY(100.0)}
              stroke="#801919"
              strokeWidth="2.2"
            />
            {/* 12 cm line (c = 1.44) */}
            <line
              x1={qToX(0.001)}
              y1={deToY(1.74)}
              x2={qToX(25.1)}
              y2={deToY(100.0)}
              stroke="#801919"
              strokeWidth="2.2"
            />
            {/* 9 cm line (c = 1.16) */}
            <line
              x1={qToX(0.00126)}
              y1={deToY(1.0)}
              x2={qToX(125.9)}
              y2={deToY(100.0)}
              stroke="#801919"
              strokeWidth="2.2"
            />
            {/* 6 cm line (c = 0.67) */}
            <line
              x1={qToX(0.021)}
              y1={deToY(1.0)}
              x2={qToX(1000)}
              y2={deToY(74.1)}
              stroke="#801919"
              strokeWidth="2.2"
            />
            {/* 5 cm line (c = 0.52) */}
            <line
              x1={qToX(0.050)}
              y1={deToY(1.0)}
              x2={qToX(1000)}
              y2={deToY(52.5)}
              stroke="#801919"
              strokeWidth="2.2"
            />

            {/* Thickness Label Badges (Angled along the lines with white bg box) */}
            {[
              { text: '25 cm', q: 0.021, de: 30 },
              { text: '15 cm', q: 0.247, de: 30 },
              { text: '12 cm', q: 1.24, de: 30 },
              { text: '9 cm', q: 6.19, de: 30 },
              { text: '6 cm', q: 66.0, de: 25 },
              { text: '5 cm', q: 89.1, de: 20 },
            ].map((lbl) => {
              const lx = qToX(lbl.q);
              const ly = deToY(lbl.de);
              return (
                <g
                  key={lbl.text}
                  transform={`translate(${lx}, ${ly}) rotate(-36)`}
                  filter="url(#shadow)"
                >
                  <rect
                    x="-18"
                    y="-8"
                    width="36"
                    height="16"
                    rx="3"
                    fill="#ffffff"
                    stroke="#801919"
                    strokeWidth="1.2"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    className="text-[10px] font-black fill-[#801919]"
                  >
                    {lbl.text}
                  </text>
                </g>
              );
            })}
          </g>

          {/* ========================================================================= */}
          {/* PURPLE DASHED ENERGY ABSORPTION LINES (E = 1000 J and E = 700 J)          */}
          {/* ========================================================================= */}
          <g id="energy-lines" stroke="#7e22ce" strokeWidth="1.8" strokeDasharray="5 3.5" clipPath="url(#clip-below-sfr-curve)">
            {/* E = 1000 J upper line (Zone 7 / 8) */}
            <line
              x1={qToX(0.001)}
              y1={deToY(5.6)}
              x2={qToX(1.3)}
              y2={deToY(100.0)}
            />
            {/* E = 1000 J second line (Zone 6 / 7) */}
            <line
              x1={qToX(0.001)}
              y1={deToY(2.4)}
              x2={qToX(11.2)}
              y2={deToY(100.0)}
            />
            {/* E = 700 J line (Zone 5) */}
            <line
              x1={qToX(0.001)}
              y1={deToY(1.26)}
              x2={qToX(56.2)}
              y2={deToY(100.0)}
            />
            {/* E = 700 J line (Zone 4) */}
            <line
              x1={qToX(0.005)}
              y1={deToY(1.0)}
              x2={qToX(501)}
              y2={deToY(100.0)}
            />

            {/* Text badges for Energy Absorption */}
            {[
              { text: 'E = 1000 J', q: 0.04, de: 25 },
              { text: 'E = 1000 J', q: 0.35, de: 25 },
              { text: 'E = 700 J', q: 1.8, de: 25 },
              { text: 'E = 700 J', q: 16.0, de: 25 },
            ].map((elbl, i) => (
              <g
                key={`elbl-${i}`}
                transform={`translate(${qToX(elbl.q)}, ${deToY(elbl.de)}) rotate(-36)`}
              >
                <rect
                  x="-22"
                  y="-6"
                  width="44"
                  height="13"
                  rx="2"
                  fill="#ffffff"
                  stroke="#7e22ce"
                  strokeWidth="0.8"
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  className="text-[8.5px] font-bold fill-[#6b21a8]"
                >
                  {elbl.text}
                </text>
              </g>
            ))}
          </g>

          {/* ========================================================================= */}
          {/* VERTICAL RRS LINES & LABELS (Centre to Centre spacing)                     */}
          {/* ========================================================================= */}
          <g id="rrs-vertical-lines">
            {[
              { qVal: 0.001, text: 'RRS c/c 1.0 m', yStart: 1.0, yEnd: 26 },
              { qVal: 0.004, text: 'RRS c/c 1.7 m', yStart: 1.0, yEnd: 32 },
              { qVal: 0.01, text: 'RRS c/c 2.3 m', yStart: 1.0, yEnd: 36 },
              { qVal: 0.04, text: 'RRS c/c 2.9 m', yStart: 1.0, yEnd: 38 },
              { qVal: 0.1, text: 'RRS c/c 4.0 m', yStart: 1.0, yEnd: 42 },
            ].map((rrsLine) => {
              const x = qToX(rrsLine.qVal);
              const y1 = deToY(rrsLine.yStart);
              const y2 = deToY(rrsLine.yEnd);
              return (
                <g key={rrsLine.text}>
                  <line
                    x1={x}
                    y1={y1}
                    x2={x}
                    y2={y2}
                    stroke="#1e293b"
                    strokeWidth="1.4"
                    strokeDasharray="4 2.5"
                  />
                  {/* Vertical rotated text label */}
                  <g transform={`translate(${x - 5}, ${(y1 + y2) / 2}) rotate(-90)`}>
                    <rect
                      x="-38"
                      y="-7"
                      width="76"
                      height="14"
                      rx="2"
                      fill="#ffffff"
                      opacity="0.9"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      className="text-[9px] font-black fill-slate-900 tracking-tight"
                    >
                      {rrsLine.text}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* RRS Badges in Zone 8, 7, 6 */}
            <g transform={`translate(${qToX(0.004)}, ${deToY(12)})`}>
              <rect x="-24" y="-10" width="48" height="20" rx="4" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" filter="url(#shadow)" />
              <text x="0" y="4" textAnchor="middle" className="text-[11px] font-black fill-slate-900">RRS-C</text>
            </g>
            <g transform={`translate(${qToX(0.018)}, ${deToY(9)})`}>
              <rect x="-24" y="-10" width="48" height="20" rx="4" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" filter="url(#shadow)" />
              <text x="0" y="4" textAnchor="middle" className="text-[11px] font-black fill-slate-900">RRS-B</text>
            </g>
            <g transform={`translate(${qToX(0.06)}, ${deToY(7)})`}>
              <rect x="-24" y="-10" width="48" height="20" rx="4" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" filter="url(#shadow)" />
              <text x="0" y="4" textAnchor="middle" className="text-[11px] font-black fill-slate-900">RRS-A</text>
            </g>
          </g>

          {/* ========================================================================= */}
          {/* BOLT SPACING CURVES (Top boundary with Sfr & Bottom boundary without Sfr)  */}
          {/* ========================================================================= */}
          <g id="bolt-spacing-contours">
            {/* Top boundary curve: Average bolt spacing with Sfr */}
            <path
              d={`
                M ${qToX(0.001)} ${deToY(25.0)}
                C ${qToX(0.005)} ${deToY(30.0)}, ${qToX(0.02)} ${deToY(38.0)}, ${qToX(0.1)} ${deToY(50.0)}
                C ${qToX(1.0)} ${deToY(68.0)}, ${qToX(10)} ${deToY(86.0)}, ${qToX(40)} ${deToY(100.0)}
              `}
              fill="none"
              stroke="#1e293b"
              strokeWidth="2.2"
            />
            {/* Top curve title */}
            <text
              x={qToX(0.05)}
              y={deToY(46) - 8}
              transform={`rotate(-22, ${qToX(0.05)}, ${deToY(46)})`}
              className="text-[10px] font-bold fill-slate-900 bg-white"
            >
              Average bolt spacing with Sfr
            </text>

            {/* Top curve spacing tick marks and labels */}
            {[
              { qVal: 0.002, label: '1.0 m', highlight: false },
              { qVal: 0.006, label: '1.2 m', highlight: false },
              { qVal: 0.015, label: '1.3 m', highlight: false },
              { qVal: 0.05, label: '1.5 m', highlight: false },
              { qVal: 0.2, label: '1.6 m', highlight: false },
              { qVal: 1.0, label: '1.7 m', highlight: true },
              { qVal: 4.0, label: '2.1 m', highlight: false },
              { qVal: 10.0, label: '2.3 m', highlight: true },
              { qVal: 40.0, label: '2.5 m', highlight: false },
            ].map((pt) => {
              const yVal = Math.min(100, 25 * Math.pow(pt.qVal / 0.001, 0.13));
              const cx = qToX(pt.qVal);
              const cy = deToY(yVal);
              return (
                <g key={`top-s-${pt.label}`} transform={`translate(${cx}, ${cy})`}>
                  <circle r={pt.highlight ? '3.5' : '2.5'} fill={pt.highlight ? '#d97706' : '#1e293b'} />
                  <rect
                    x="-15"
                    y="-17"
                    width="30"
                    height="13"
                    rx="2"
                    fill="#ffffff"
                    stroke={pt.highlight ? '#d97706' : '#94a3b8'}
                    strokeWidth={pt.highlight ? '1.4' : '0.6'}
                    opacity="0.95"
                  />
                  <text
                    x="0"
                    y="-8"
                    textAnchor="middle"
                    className={`text-[8.5px] font-black ${pt.highlight ? 'fill-amber-700' : 'fill-slate-900'}`}
                  >
                    {pt.label}
                  </text>
                </g>
              );
            })}

            {/* Bottom boundary curve: Average bolt spacing without Sfr */}
            <path
              d={`
                M ${qToX(0.1)} ${deToY(1.0)}
                C ${qToX(0.5)} ${deToY(1.5)}, ${qToX(2.0)} ${deToY(2.6)}, ${qToX(10)} ${deToY(5.0)}
                C ${qToX(40)} ${deToY(8.7)}, ${qToX(100)} ${deToY(12.6)}, ${qToX(1000)} ${deToY(31.7)}
              `}
              fill="none"
              stroke="#1e293b"
              strokeWidth="2.2"
            />
            {/* Bottom curve title */}
            <text
              x={qToX(5)}
              y={deToY(4.5) + 16}
              transform={`rotate(-18, ${qToX(5)}, ${deToY(4.5)})`}
              className="text-[10px] font-bold fill-slate-900"
            >
              Average bolt spacing without Sfr
            </text>

            {/* Bottom curve spacing tick marks and labels */}
            {[
              { qVal: 0.7, label: '1.0 m', highlight: false },
              { qVal: 1.0, label: '1.1 m', highlight: true },
              { qVal: 4.0, label: '1.6 m', highlight: false },
              { qVal: 10.0, label: '2.0 m', highlight: true },
              { qVal: 40.0, label: '2.8 m', highlight: false },
              { qVal: 100.0, label: '3.5 m', highlight: false },
              { qVal: 200.0, label: '4.0 m', highlight: false },
            ].map((pt) => {
              const yVal = Math.min(35, 2.0 * Math.pow(pt.qVal, 0.40));
              const cx = qToX(pt.qVal);
              const cy = deToY(yVal);
              return (
                <g key={`bot-s-${pt.label}`} transform={`translate(${cx}, ${cy})`}>
                  <circle r={pt.highlight ? '3.5' : '2.5'} fill={pt.highlight ? '#d97706' : '#1e293b'} />
                  <rect
                    x="-15"
                    y="6"
                    width="30"
                    height="13"
                    rx="2"
                    fill="#ffffff"
                    stroke={pt.highlight ? '#d97706' : '#94a3b8'}
                    strokeWidth={pt.highlight ? '1.4' : '0.6'}
                    opacity="0.95"
                  />
                  <text
                    x="0"
                    y="15.5"
                    textAnchor="middle"
                    className={`text-[8.5px] font-black ${pt.highlight ? 'fill-amber-700' : 'fill-slate-900'}`}
                  >
                    {pt.label}
                  </text>
                </g>
              );
            })}
          </g>

          {/* ========================================================================= */}
          {/* CIRCLED CATEGORY NUMBERS (1 to 9) EXACTLY POSITIONED AS IN IMAGE 1        */}
          {/* ========================================================================= */}
          <g id="circled-category-numbers">
            {[
              { num: 9, q: 0.035, de: 65, active: supportParams.category === 9 },
              { num: 8, q: 0.006, de: 16, active: supportParams.category === 8 },
              { num: 7, q: 0.035, de: 13, active: supportParams.category === 7 },
              { num: 6, q: 0.16, de: 12, active: supportParams.category === 6 },
              { num: 5, q: 1.0, de: 20, active: supportParams.category === 5 },
              { num: 4, q: 4.0, de: 15, active: supportParams.category === 4 },
              { num: 3, q: 10.0, de: 10, active: supportParams.category === 3 },
              { num: 2, q: 35.0, de: 5.0, active: supportParams.category === 2 },
              { num: 1, q: 50.0, de: 1.5, active: supportParams.category === 1 },
            ].map((circ) => {
              const cx = qToX(circ.q);
              const cy = deToY(circ.de);
              return (
                <g key={`circ-${circ.num}`} transform={`translate(${cx}, ${cy})`} filter="url(#shadow)">
                  <circle
                    r="12"
                    fill={circ.active ? '#f59e0b' : '#ffffff'}
                    stroke={circ.active ? '#b45309' : '#1e293b'}
                    strokeWidth={circ.active ? '2.5' : '1.8'}
                  />
                  <text
                    x="0"
                    y="4.5"
                    textAnchor="middle"
                    className={`text-[12px] font-black ${
                      circ.active ? 'fill-slate-950 font-extrabold' : 'fill-slate-900'
                    }`}
                  >
                    {circ.num}
                  </text>
                </g>
              );
            })}

            {/* Category 9 descriptive title in the unified upper region */}
            <g id="zone-9-annotation" pointerEvents="none">
              <text
                x={qToX(0.035)}
                y={deToY(65) + 24}
                textAnchor="middle"
                className="text-[10.5px] font-black fill-sky-950 tracking-wider"
              >
                {isFa ? 'ارزیابی ویژه / پوشش بتن درجا (CCA)' : 'Special evaluation / Cast concrete (CCA)'}
              </text>
              <text
                x={qToX(0.035)}
                y={deToY(65) + 36}
                textAnchor="middle"
                className="text-[8.5px] font-semibold fill-sky-900/80"
              >
                {isFa
                  ? 'رده ۹ یکپارچه (کل محدوده بالای خط فواصل بولت با شاتکریت الیافی)'
                  : 'Unified Category 9 (Area above Average Bolt Spacing with Sfr)'}
              </text>
            </g>
          </g>

          {/* ========================================================================= */}
          {/* AXES BORDER & SCALE TICK LABELS                                           */}
          {/* ========================================================================= */}
          {/* Outer frame */}
          <rect
            x={margin.left}
            y={margin.top}
            width={plotWidth}
            height={plotHeight}
            fill="none"
            stroke="#1e293b"
            strokeWidth="1.6"
          />

          {/* X Axis Bottom (Rock mass quality Q) */}
          <g id="x-axis-bottom">
            {qMajorTicks.map((val) => {
              const x = qToX(val);
              return (
                <g key={`x-tick-${val}`}>
                  <line
                    x1={x}
                    y1={margin.top + plotHeight}
                    x2={x}
                    y2={margin.top + plotHeight + 6}
                    stroke="#1e293b"
                    strokeWidth="1.4"
                  />
                  <text
                    x={x}
                    y={margin.top + plotHeight + 20}
                    textAnchor="middle"
                    className="text-[10px] font-mono font-bold fill-slate-800"
                  >
                    {val >= 1 ? val : val.toString()}
                  </text>
                </g>
              );
            })}

            {/* X Axis Title */}
            <text
              x={margin.left + plotWidth / 2}
              y={margin.top + plotHeight + 42}
              textAnchor="middle"
              className="text-[12px] font-extrabold fill-slate-900 tracking-wide"
            >
              {isFa ? 'کیفیت توده‌سنگ (Rock mass quality Q)' : 'Rock mass quality Q'}
            </text>
          </g>

          {/* Y Axis Left (Span or height in m / ESR) */}
          <g id="y-axis-left">
            {deTicks.map((val) => {
              const y = deToY(val);
              return (
                <g key={`y-tick-${val}`}>
                  <line
                    x1={margin.left - 6}
                    y1={y}
                    x2={margin.left}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth="1.4"
                  />
                  <text
                    x={margin.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] font-mono font-bold fill-slate-800"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Y Left Axis Title (Rotated) */}
            <text
              x={-(margin.top + plotHeight / 2)}
              y={margin.left - 48}
              transform="rotate(-90)"
              textAnchor="middle"
              className="text-[11px] font-extrabold fill-slate-900"
            >
              {isFa ? 'دهانه یا ارتفاع به متر / ESR (Span or height in m / ESR)' : 'Span or height in m / ESR'}
            </text>
          </g>

          {/* Y Axis Right (Bolt length in m for ESR = 1) */}
          <g id="y-axis-right">
            {boltTicks.map((tick) => {
              const y = deToY(tick.deVal);
              return (
                <g key={`bolt-tick-${tick.label}`}>
                  <line
                    x1={margin.left + plotWidth}
                    y1={y}
                    x2={margin.left + plotWidth + 6}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth="1.4"
                  />
                  <text
                    x={margin.left + plotWidth + 10}
                    y={y + 4}
                    textAnchor="start"
                    className="text-[10px] font-mono font-bold fill-slate-800"
                  >
                    {tick.label}
                  </text>
                </g>
              );
            })}

            {/* Y Right Axis Title (Rotated) */}
            <text
              x={margin.top + plotHeight / 2}
              y={-(margin.left + plotWidth + 50)}
              transform="rotate(90)"
              textAnchor="middle"
              className="text-[11px] font-extrabold fill-slate-900"
            >
              {isFa ? 'طول بولت به متر برای ESR = 1 (Bolt length in m for ESR = 1)' : 'Bolt length in m for ESR = 1'}
            </text>
          </g>

          {/* ========================================================================= */}
          {/* INTERACTIVE CROSSHAIRS & ACTIVE TARGET POINT MARKER                       */}
          {/* ========================================================================= */}
          <g id="active-marker">
            {/* Dashed Crosshairs extending to both axes */}
            <line
              x1={margin.left}
              y1={currentY}
              x2={margin.left + plotWidth}
              y2={currentY}
              stroke="#dc2626"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.85"
            />
            <line
              x1={currentX}
              y1={margin.top}
              x2={currentX}
              y2={margin.top + plotHeight}
              stroke="#dc2626"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.85"
            />

            {/* Axis projection indicators */}
            {/* On X Axis */}
            <rect
              x={currentX - 25}
              y={margin.top + plotHeight + 1}
              width="50"
              height="15"
              rx="2"
              fill="#dc2626"
            />
            <text
              x={currentX}
              y={margin.top + plotHeight + 12}
              textAnchor="middle"
              className="text-[9px] font-mono font-black fill-white"
            >
              Q={currentQ}
            </text>

            {/* On Y Left Axis */}
            <rect
              x={margin.left - 38}
              y={currentY - 7.5}
              width="36"
              height="15"
              rx="2"
              fill="#dc2626"
            />
            <text
              x={margin.left - 20}
              y={currentY + 3.5}
              textAnchor="middle"
              className="text-[9px] font-mono font-black fill-white"
            >
              {de}
            </text>

            {/* Target Reticle at (currentX, currentY) */}
            <circle
              cx={currentX}
              cy={currentY}
              r="14"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2.5"
              strokeDasharray="3 2"
              className="animate-spin"
              style={{ transformOrigin: `${currentX}px ${currentY}px`, animationDuration: '8s' }}
            />
            <circle
              cx={currentX}
              cy={currentY}
              r="6.5"
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth="2"
              filter="url(#shadow)"
            />
            <circle cx={currentX} cy={currentY} r="2" fill="#ffffff" />

            {/* Floating Point Tag */}
            <g
              transform={`translate(${
                currentX + (currentX > margin.left + plotWidth - 140 ? -130 : 15)
              }, ${currentY + (currentY < margin.top + 50 ? 40 : -35)})`}
              filter="url(#shadow)"
            >
              <rect
                x="0"
                y="0"
                width="125"
                height="32"
                rx="6"
                fill="#1e293b"
                fillOpacity="0.95"
                stroke="#f59e0b"
                strokeWidth="1.5"
              />
              <text x="62" y="14" textAnchor="middle" className="text-[10px] font-bold fill-white">
                Category ({supportParams.category})
              </text>
              <text
                x="62"
                y="26"
                textAnchor="middle"
                className="text-[9px] font-mono font-semibold fill-amber-300"
              >
                {supportParams.continuousThicknessCm > 0
                  ? `t = ${supportParams.continuousThicknessCm} cm | s = ${supportParams.boltSpacingWithSfrM} m`
                  : `s = ${supportParams.boltSpacingWithoutSfrM} m`}
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* 3. REAL-TIME EXTRACTED SUPPORT PARAMETERS INSPECTOR */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h4 className="font-extrabold text-base text-slate-100">
                {isFa
                  ? 'پنل استخراج بلادرنگ مشخصات سیستم نگهداری (Extractable Support Parameters)'
                  : 'Real-Time Support Parameters Extraction Inspector'}
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isFa
                ? 'استخراج ریاضی و هندسی تمامی پارامترها از موقعیت دقیق نقطه روی خطوط تراز شاتکریت، طول بولت و کانتورهای فاصله'
                : 'Geometric and mathematical extraction of all parameters from isolines, bolt length, and spacing contours'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{isFa ? 'برای جابجایی نقطه کلیک کنید یا بکشید' : 'Click/Drag on chart to inspect'}</span>
          </div>
        </div>

        {/* Extraction Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* Card 1: Shotcrete Thickness */}
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 flex flex-col justify-between">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{isFa ? 'ضخامت شاتکریت الیاف‌دار' : 'Shotcrete Thickness (Sfr)'}</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                {supportParams.continuousThicknessCm > 0 ? `${supportParams.continuousThicknessCm} cm` : 'None'}
              </span>
            </div>
            <div className="my-1">
              <div className="text-2xl font-black text-white font-mono">
                {supportParams.category === 9
                  ? isFa
                    ? 'لاینینگ بتن درجا (CCA)'
                    : 'Cast Concrete (CCA)'
                  : supportParams.continuousThicknessMm > 0
                  ? `${supportParams.continuousThicknessMm} mm`
                  : isFa
                  ? 'بدون نیاز به شاتکریت'
                  : 'No shotcrete required'}
              </div>
              <div className="text-xs font-semibold text-slate-300 mt-1">
                {isFa ? supportParams.shotcreteThicknessRangeFa : supportParams.shotcreteThicknessRangeMm}
              </div>
            </div>
            {/* Visual thickness progress indicator */}
            <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (supportParams.continuousThicknessCm / 25) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Card 2: Bolt Length */}
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 flex flex-col justify-between">
            <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{isFa ? 'طول پیچ‌سنگ (راک‌بولت)' : 'Rock Bolt Length (L)'}</span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono">
                L = 2 + 0.15·(B/ESR)
              </span>
            </div>
            <div className="my-1">
              <div className="text-2xl font-black text-white font-mono">
                {supportParams.boltLengthM > 0
                  ? de === 10
                    ? '3.0 - 3.5 m'
                    : `${supportParams.boltLengthM} m`
                  : 'Spot / None'}
              </div>
              <div className="text-xs text-slate-300 mt-1">
                {isFa
                  ? `سقف: ${supportParams.boltLengthRoofM} متر | دیواره: ${supportParams.boltLengthWallM} متر`
                  : `Roof: ${supportParams.boltLengthRoofM} m | Wall: ${supportParams.boltLengthWallM} m`}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-mono">
              {isFa ? 'محاسبه استاندارد سقف: ' : 'Standard roof formula: '}
              <span className="text-sky-300 font-bold">{supportParams.boltLengthRoofM} m</span>
              {de === 10 && <span className="text-amber-300 text-[10px] ml-1 mr-1">({isFa ? 'دیواره: ۳ متر' : 'wall: 3 m'})</span>}
            </div>
          </div>

          {/* Card 3: Bolt Spacing */}
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 flex flex-col justify-between">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{isFa ? 'فواصل راک‌بولت‌ها' : 'Average Bolt Spacing'}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                Ø20 mm
              </span>
            </div>
            <div className="my-1 space-y-1.5">
              {/* With Sfr */}
              <div
                className={`p-2 rounded-lg flex items-center justify-between transition-colors ${
                  supportParams.category >= 3 && supportParams.category <= 8
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-white'
                    : 'bg-slate-900/60 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      supportParams.category >= 3 && supportParams.category <= 8
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-slate-600'
                    }`}
                  />
                  <span className="text-xs font-semibold">
                    {isFa ? 'با شاتکریت الیاف‌دار (With Sfr):' : 'With Sfr:'}
                  </span>
                </div>
                <span className="font-mono font-black text-base text-emerald-300">
                  {supportParams.boltSpacingWithSfrM} m
                </span>
              </div>

              {/* Without Sfr */}
              <div
                className={`p-2 rounded-lg flex items-center justify-between transition-colors ${
                  supportParams.category === 2
                    ? 'bg-amber-500/20 border border-amber-500/40 text-white'
                    : 'bg-slate-900/60 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      supportParams.category === 2 ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                  <span className="text-xs font-semibold">
                    {isFa ? 'بدون شاتکریت (Without Sfr):' : 'Without Sfr:'}
                  </span>
                </div>
                <span className="font-mono font-black text-base text-amber-300">
                  {supportParams.boltSpacingWithoutSfrM} m
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              {isFa
                ? supportParams.category === 9
                  ? 'رده ۹ یکپارچه: ارزیابی ویژه ژئوتکنیکی / لاینینگ بتن درجا (CCA) و بولت‌گذاری متراکم'
                  : supportParams.category >= 3
                  ? 'رده فعال نیازمند شاتکریت الیافی است (With Sfr)'
                  : supportParams.category === 2
                  ? 'رده فعال بولت‌گذاری تک یا شبکه‌ای بدون شاتکریت است'
                  : 'بدون نیاز به نگهداری منظم'
                : supportParams.category === 9
                ? 'Category 9: Special evaluation / Cast concrete lining (CCA) with dense bolting'
                : supportParams.boltSpacingTextEn}
            </div>
          </div>

          {/* Card 4: Energy & RRS */}
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 flex flex-col justify-between">
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{isFa ? 'جذب انرژی و قاب RRS' : 'Energy (E) & RRS'}</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">
                {supportParams.category === 9 ? 'CCA' : supportParams.energyAbsorptionJ ? `${supportParams.energyAbsorptionJ} J` : 'None'}
              </span>
            </div>
            <div className="my-1">
              <div className="text-xl font-black text-white font-mono">
                {supportParams.category === 9
                  ? isFa ? 'طراحی ویژه / CCA' : 'Special / CCA'
                  : supportParams.rrsType !== 'None' ? supportParams.rrsType : isFa ? 'عدم نیاز به RRS' : 'No RRS'}
              </div>
              <div className="text-xs text-slate-300 mt-1 font-mono">
                {supportParams.category === 9
                  ? isFa ? 'بسته شدن سریع اینورت' : 'Quick Invert Closure'
                  : supportParams.rrsSpacingM ? `c/c ${supportParams.rrsSpacingM} m` : '-'}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 truncate">
              {isFa ? supportParams.rrsRebarDescriptionFa : supportParams.rrsRebarDescriptionEn}
            </div>
          </div>
        </div>
      </div>

      {/* 4. COMPLETE SUPPORT CATEGORIES & SPECIFICATIONS TABLE (Image 2 Verbatim) */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-md overflow-hidden">
        {/* Table Title Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <h4 className="font-extrabold text-sm sm:text-base">
            {isFa
              ? 'جدول مشخصات و رده‌های سیستم نگهداری تجربی Q (Barton et al., NGI)'
              : 'Table of Support Categories & Concrete Rib Specifications (Barton NGI)'}
          </h4>
          <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-mono">
            {isFa ? 'شاتکریت تقویت‌شده با الیاف فولادی (Sfr)' : 'Steel Fibre Reinforced Sprayed Concrete (Sfr)'}
          </span>
        </div>

        {/* Master Specifications Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-800 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-900 border-b-2 border-slate-300 font-black">
                <th className="p-3 text-start border-r border-slate-300 w-16">{isFa ? 'رده' : 'Cat.'}</th>
                <th className="p-3 text-start border-r border-slate-300">{isFa ? 'شرح سیستم نگهداری' : 'Support Description'}</th>
                <th className="p-3 text-center border-r border-slate-300 w-28">{isFa ? 'ضخامت شاتکریت' : 'Thickness'}</th>
                <th className="p-3 text-center border-r border-slate-300 w-28">{isFa ? 'فواصل بولت' : 'Bolt Spacing'}</th>
                <th className="p-3 text-center border-r border-slate-300 w-28">{isFa ? 'جذب انرژی (E)' : 'Energy (E)'}</th>
                <th className="p-3 text-center w-36">{isFa ? 'مشخصات قاب RRS' : 'RRS Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Category 1 */}
              <tr className={`transition-colors ${supportParams.category === 1 ? 'bg-amber-100 font-bold' : 'hover:bg-slate-50'}`}>
                <td className="p-3 font-mono font-black text-center border-r border-slate-200">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-900">1</span>
                </td>
                <td className="p-3 border-r border-slate-200">
                  {isFa ? '۱- بدون نیاز به سیستم نگهداری (Unsupported)' : '1- Unsupported'}
                </td>
                <td className="p-3 text-center font-mono border-r border-slate-200">-</td>
                <td className="p-3 text-center font-mono border-r border-slate-200">-</td>
                <td className="p-3 text-center font-mono border-r border-slate-200">-</td>
                <td className="p-3 text-center font-mono">-</td>
              </tr>

              {/* Category 2 */}
              <tr className={`transition-colors ${supportParams.category === 2 ? 'bg-amber-100 font-bold' : 'hover:bg-slate-50'}`}>
                <td className="p-3 font-mono font-black text-center border-r border-slate-200">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-900">2</span>
                </td>
                <td className="p-3 border-r border-slate-200">
                  {isFa ? '۲- بولت‌زنی موضعی (Spot bolting)' : '2- Spot bolting, sb'}
                </td>
                <td className="p-3 text-center font-mono border-r border-slate-200">-</td>
                <td className="p-3 text-center font-mono border-r border-slate-200">موضعی (Spot)</td>
                <td className="p-3 text-center font-mono border-r border-slate-200">-</td>
                <td className="p-3 text-center font-mono">-</td>
              </tr>

              {/* Category 3 */}
              <tr className={`transition-colors ${supportParams.category === 3 ? 'bg-amber-100 font-bold' : 'hover:bg-slate-50'}`}>
                <td className="p-3 font-mono font-black text-center border-r border-slate-200">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-900">3</span>
                </td>
                <td className="p-3 border-r border-slate-200">
                  {isFa ? '۳- بولت‌زنی سیستماتیک (Systematic bolting)' : '3- Systematic bolting, B'}
                </td>
                <td className="p-3 text-center font-mono border-r border-slate-200">-</td>
                <td className="p-3 text-center font-mono border-r border-slate-200">2.1 - 4.0 m</td>
                <td className="p-3 text-center font-mono border-r border-slate-200">-</td>
                <td className="p-3 text-center font-mono">-</td>
              </tr>

              {/* Category 4 */}
              <tr className={`transition-colors ${supportParams.category === 4 ? 'bg-amber-100 font-bold' : 'hover:bg-slate-50'}`}>
                <td className="p-3 font-mono font-black text-center border-r border-slate-200">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-900">4</span>
                </td>
                <td className="p-3 border-r border-slate-200">
                  {isFa
                    ? '۴- بولت‌زنی سیستماتیک به همراه ۴ تا ۱۰ سانتیمتر شاتکریت ساده (غیرمسلح)'
                    : '4- Systematic bolting + 4-10 cm unreinforced sprayed concrete, B+S'}
                </td>
                <td className="p-3 text-center font-mono border-r border-slate-200">4 - 10 cm</td>
                <td className="p-3 text-center font-mono border-r border-slate-200">1.8 - 2.5 m</td>
                <td className="p-3 text-center font-mono border-r border-slate-200">-</td>
                <td className="p-3 text-center font-mono">-</td>
              </tr>

              {/* Category 5 */}
              <tr className={`transition-colors ${supportParams.category === 5 ? 'bg-amber-100 font-bold' : 'hover:bg-slate-50'}`}>
                <td className="p-3 font-mono font-black text-center border-r border-slate-200">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-900">5</span>
                </td>
                <td className="p-3 border-r border-slate-200">
                  {isFa
                    ? '۵- ۵ تا ۹ سانتیمتر شاتکریت مسلح به فیبر به همراه بولت‌زنی'
                    : '5- 5-9 cm fibre reinforced sprayed concrete + bolting, Sfr+B'}
                </td>
                <td className="p-3 text-center font-mono border-r border-slate-200">5 - 9 cm</td>
                <td className="p-3 text-center font-mono border-r border-slate-200">1.5 - 2.1 m</td>
                <td className="p-3 text-center font-mono border-r border-slate-200">500 - 700 J</td>
                <td className="p-3 text-center font-mono">-</td>
              </tr>

              {/* Category 6 */}
              <tr className={`transition-colors ${supportParams.category === 6 ? 'bg-amber-100 font-bold' : 'hover:bg-slate-50'}`}>
                <td className="p-3 font-mono font-black text-center border-r border-slate-200">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-900">6</span>
                </td>
                <td className="p-3 border-r border-slate-200">
                  {isFa
                    ? '۶- ۹ تا ۱۲ سانتیمتر شاتکریت مسلح به فیبر به همراه بولت‌زنی'
                    : '6- 9-12 cm fibre reinforced sprayed concrete + bolting, Sfr+B'}
                </td>
                <td className="p-3 text-center font-mono border-r border-slate-200">9 - 12 cm</td>
                <td className="p-3 text-center font-mono border-r border-slate-200">1.3 - 1.7 m</td>
                <td className="p-3 text-center font-mono border-r border-slate-200">700 - 1000 J</td>
                <td className="p-3 text-center font-mono">RRS-A (c/c 4.0 m)</td>
              </tr>

              {/* Category 7 */}
              <tr className={`transition-colors ${supportParams.category === 7 ? 'bg-amber-100 font-bold' : 'hover:bg-slate-50'}`}>
                <td className="p-3 font-mono font-black text-center border-r border-slate-200">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-900">7</span>
                </td>
                <td className="p-3 border-r border-slate-200">
                  {isFa
                    ? '۷- ۱۲ تا ۱۵ سانتیمتر شاتکریت مسلح به فیبر به همراه بولت‌زنی'
                    : '7- 12-15 cm fibre reinforced sprayed concrete + bolting, Sfr+B'}
                </td>
                <td className="p-3 text-center font-mono border-r border-slate-200">12 - 15 cm</td>
                <td className="p-3 text-center font-mono border-r border-slate-200">1.2 - 1.5 m</td>
                <td className="p-3 text-center font-mono border-r border-slate-200">1000 J</td>
                <td className="p-3 text-center font-mono">RRS-B (c/c 2.3-2.9 m)</td>
              </tr>

              {/* Category 8 */}
              <tr className={`transition-colors ${supportParams.category === 8 ? 'bg-amber-100 font-bold' : 'hover:bg-slate-50'}`}>
                <td className="p-3 font-mono font-black text-center border-r border-slate-200">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-900">8</span>
                </td>
                <td className="p-3 border-r border-slate-200">
                  {isFa
                    ? '۸- بیش از ۱۵ سانتیمتر شاتکریت مسلح به فیبر با قاب‌های مسلح شاتکریتی و بولت‌زنی'
                    : '8- >15 cm fibre reinforced sprayed concrete with reinforced ribs of sprayed concrete and bolting, Sfr+RRS+B'}
                </td>
                <td className="p-3 text-center font-mono border-r border-slate-200">&gt; 15 cm</td>
                <td className="p-3 text-center font-mono border-r border-slate-200">1.0 - 1.3 m</td>
                <td className="p-3 text-center font-mono border-r border-slate-200">1000 J</td>
                <td className="p-3 text-center font-mono">RRS-C (c/c 1.0-1.7 m)</td>
              </tr>

              {/* Category 9 */}
              <tr className={`transition-colors ${supportParams.category === 9 ? 'bg-amber-100 font-bold' : 'hover:bg-slate-50'}`}>
                <td className="p-3 font-mono font-black text-center border-r border-slate-200">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-900">9</span>
                </td>
                <td className="p-3 border-r border-slate-200">
                  {isFa
                    ? '۹- پوشش بتنی درجا (لاینینگ بتن مسلح قالب‌بندی‌شده)'
                    : '9- Special design / In-situ cast concrete lining, CCA'}
                </td>
                <td className="p-3 text-center font-mono border-r border-slate-200">طراحی ویژه</td>
                <td className="p-3 text-center font-mono border-r border-slate-200">طراحی ویژه</td>
                <td className="p-3 text-center font-mono border-r border-slate-200">1000 J + لاینینگ</td>
                <td className="p-3 text-center font-mono">لاینینگ بتنی درجا</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* RRS Specifications Table (Right Column from Image 2) */}
        <div className="p-4 bg-slate-50 border-t border-slate-300">
          <h5 className="font-extrabold text-xs text-slate-800 mb-2 uppercase">
            {isFa ? 'مشخصات قاب‌های مسلح شاتکریتی (RRS)' : 'Reinforced Ribs of Sprayed Concrete (RRS) Specifications'}
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="font-black text-slate-900 flex items-center justify-between">
                <span>RRS-A</span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono">c/c 4.0 m</span>
              </div>
              <p className="text-slate-600 mt-1">
                {isFa ? 'دهانه ۵ متر: تک لایه Si30/6 Ø16-20' : 'Span 5 m: Si30/6 Ø16-20'}
              </p>
              <p className="text-slate-600">
                {isFa ? 'دهانه ۱۰ و ۲۰ متر: دولایه D40/6+4' : 'Span 10 & 20 m: D40/6+4'}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="font-black text-slate-900 flex items-center justify-between">
                <span>RRS-B</span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono">c/c 2.3 - 2.9 m</span>
              </div>
              <p className="text-slate-600 mt-1">
                {isFa ? 'دهانه ۵ متر: تک لایه Si30/6 Ø16-20' : 'Span 5 m: Si30/6 Ø16-20'}
              </p>
              <p className="text-slate-600">
                {isFa ? 'دهانه ۱۰ و ۲۰ متر: دولایه D40/6+4 یا D55/6+4' : 'Span 10 & 20 m: D40/6+4 or D55/6+4'}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="font-black text-slate-900 flex items-center justify-between">
                <span>RRS-C</span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono">c/c 1.0 - 1.7 m</span>
              </div>
              <p className="text-slate-600 mt-1">
                {isFa ? 'دهانه ۵ متر: تک لایه Si30/6' : 'Span 5 m: Si30/6'}
              </p>
              <p className="text-slate-600">
                {isFa ? 'دهانه ۱۰ و ۲۰ متر: دولایه سنگین D55/6+4' : 'Span 10 & 20 m: Heavy D55/6+4'}
              </p>
            </div>
          </div>
        </div>

        {/* Footnotes and Abbreviations from Image 2 */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 text-[11px] text-slate-600 leading-relaxed">
          <div className="font-bold text-slate-700 mb-1">{isFa ? 'علائم و یادداشت‌های فنی:' : 'Notes and Abbreviations:'}</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div><strong>B:</strong> {isFa ? 'بولت‌زنی (Bolting)' : 'Bolting'}</div>
            <div><strong>Sfr:</strong> {isFa ? 'شاتکریت تقویت‌شده با الیاف' : 'Steel fibre reinforced sprayed concrete'}</div>
            <div><strong>E:</strong> {isFa ? 'میزان جذب انرژی (ژول)' : 'Energy absorption (Joules)'}</div>
            <div><strong>RRS:</strong> {isFa ? 'قاب‌های مسلح شاتکریتی' : 'Reinforced ribs of sprayed concrete'}</div>
            <div><strong>ESR:</strong> {isFa ? 'نسبت تکیه‌گاه حفاری' : 'Excavation Support Ratio'}</div>
            <div><strong>Si30/6:</strong> {isFa ? 'تک‌لایه ۶ آرماتور، ضخامت ۳۰cm' : 'Single layer 6 rebars, 30 cm thickness'}</div>
            <div><strong>D40/6+4:</strong> {isFa ? 'دولایه ۶+۴ آرماتور، ضخامت ۴۰cm' : 'Double layer 6+4 rebars, 40 cm thickness'}</div>
            <div><strong>c/c:</strong> {isFa ? 'فاصله مرکز به مرکز' : 'Centre to centre distance'}</div>
          </div>
          <p className="mt-2 text-[10px] text-slate-500 italic">
            {isFa
              ? '* برای رده‌های نگهداری ۷ تا ۹: توصیه‌های نگهداری سنگ جنبه راهنما و نشانگر دارند و ارزیابی‌های مهندسی زمین‌شناسی و مکانیک سنگ دقیق بر اساس فصل ۴.۷ الزامی است.'
              : '* For support category 7-9: The recommendations on rock support design should be regarded as indicative. Engineering geological and rock mechanical assessments should also be conducted.'}
          </p>
        </div>
      </div>
    </div>
  );
};
