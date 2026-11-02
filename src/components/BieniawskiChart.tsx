import React, { useState, useRef, useMemo } from 'react';
import { CalculationResult } from '../types';
import { ROCK_CLASSES, getAnchorsForRmr } from '../utils/rmrCalculation';
import {
  Activity,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  MousePointerClick,
  FileText,
  Sliders,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface BieniawskiChartProps {
  result: CalculationResult;
  onSelectPoint: (span: number, rmr: number) => void;
  lang: 'fa' | 'en';
}

// Digitized anchor points from Bieniawski (1989) stand-up time chart
// Monotonically ordered to guarantee continuous, seamless C1 curves without kinks or inflections
const UPPER_ANCHOR_POINTS: { t: number; s: number }[] = [
  { t: 0.056, s: 0.90 },
  { t: 0.167, s: 1.45 },
  { t: 0.40, s: 2.00 },   // Boundary 20 Top intersection
  { t: 1.0, s: 2.80 },
  { t: 4.0, s: 3.90 },
  { t: 10.0, s: 4.80 },
  { t: 30.0, s: 6.00 },   // Boundary 40 Top intersection
  { t: 100.0, s: 8.50 },
  { t: 300.0, s: 11.50 },
  { t: 800.0, s: 14.50 }, // Boundary 60 Top intersection
  { t: 2000.0, s: 16.80 },
  { t: 5000.0, s: 18.70 },
  { t: 10000.0, s: 20.00 }, // Boundary 80 Top intersection (Plateau limit)
  { t: 40000.0, s: 20.00 },
  { t: 200000.0, s: 20.00 },
];

const LOWER_ANCHOR_POINTS: { t: number; s: number }[] = [
  { t: 0.056, s: 0.35 },
  { t: 0.30, s: 0.44 },
  { t: 1.0, s: 0.58 },
  { t: 3.0, s: 0.80 },    // Boundary 20 Bottom intersection
  { t: 10.0, s: 0.88 },
  { t: 60.0, s: 1.00 },   // Boundary 40 Bottom intersection
  { t: 250.0, s: 1.25 },
  { t: 1000.0, s: 1.60 }, // Boundary 60 Bottom intersection
  { t: 5000.0, s: 1.85 },
  { t: 20000.0, s: 2.00 }, // Boundary 80 Bottom intersection
  { t: 60000.0, s: 2.00 },
  { t: 200000.0, s: 2.00 },
];

// Exact intersections of dividing boundary lines
const BOUNDARIES = {
  line20: {
    top: { t: 0.40, s: 2.00 },
    bot: { t: 3.00, s: 0.80 },
  },
  line40: {
    top: { t: 30.0, s: 6.00 },
    bot: { t: 60.0, s: 1.00 },
  },
  line60: {
    top: { t: 800.0, s: 14.50 },
    bot: { t: 1000.0, s: 1.60 },
  },
  line80: {
    top: { t: 10000.0, s: 20.00 },
    bot: { t: 20000.0, s: 2.00 },
  },
};

/**
 * Creates a Fritsch-Carlson Monotone Cubic Spline interpolator.
 * Guarantees strict monotonicity, continuous C1 derivatives, and prevents any overshoot,
 * inflection ripples, or kinks between points.
 */
function createMonotoneSpline(xs: number[], ys: number[]): (x: number) => number {
  const n = xs.length;
  const deltas: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    deltas.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  }
  const m = new Array<number>(n);
  m[0] = deltas[0];
  m[n - 1] = deltas[n - 2];
  for (let i = 1; i < n - 1; i++) {
    m[i] = (deltas[i - 1] + deltas[i]) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    if (Math.abs(deltas[i]) < 1e-9) {
      m[i] = 0;
      m[i + 1] = 0;
    } else {
      const alpha = m[i] / deltas[i];
      const beta = m[i + 1] / deltas[i];
      const s = alpha * alpha + beta * beta;
      if (s > 9) {
        const tau = 3 / Math.sqrt(s);
        m[i] = tau * alpha * deltas[i];
        m[i + 1] = tau * beta * deltas[i];
      }
    }
  }
  return function (x: number): number {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (i < n - 2 && xs[i + 1] <= x) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;
    return h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1];
  };
}

export const BieniawskiChart: React.FC<BieniawskiChartProps> = ({
  result,
  onSelectPoint,
  lang,
}) => {
  const isFa = lang === 'fa';
  const svgRef = useRef<SVGSVGElement | null>(null);

  // User presentation modes
  const [theme, setTheme] = useState<'paper' | 'engineering'>('paper');
  const [showIsoRmrCurve, setShowIsoRmrCurve] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showRegions, setShowRegions] = useState<boolean>(true);

  const [hoverPoint, setHoverPoint] = useState<{
    x: number;
    y: number;
    t: number;
    s: number;
  } | null>(null);

  // SVG Dimension & Layout Constants
  const width = 940;
  const height = 620;
  const margin = { top: 76, right: 46, bottom: 68, left: 74 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Logarithmic domain
  // X (Hours): 0.056 h (~3.3 minutes) to 200,000 h (~22.8 years)
  const minLogT = -1.25;
  const maxLogT = 5.30;
  // Y (Span in meters): 0.5 m to 20 m
  const minLogS = Math.log10(0.5); // -0.30103
  const maxLogS = Math.log10(20.0); // 1.30103

  // Conversion coordinates
  const scaleX = (logT: number): number => {
    return margin.left + ((logT - minLogT) / (maxLogT - minLogT)) * plotWidth;
  };

  const scaleY = (logS: number): number => {
    return (
      margin.top +
      plotHeight -
      ((logS - minLogS) / (maxLogS - minLogS)) * plotHeight
    );
  };

  const unscaleX = (pixelX: number): number => {
    const ratio = (pixelX - margin.left) / plotWidth;
    const logT = minLogT + ratio * (maxLogT - minLogT);
    return Math.pow(10, logT);
  };

  const unscaleY = (pixelY: number): number => {
    const ratio = (margin.top + plotHeight - pixelY) / plotHeight;
    const logS = minLogS + ratio * (maxLogS - minLogS);
    return Math.pow(10, logS);
  };

  const toSvgCoords = (t: number, s: number) => {
    const logT = Math.log10(Math.max(0.01, t));
    const logS = Math.log10(Math.max(0.2, s));
    return {
      x: scaleX(logT),
      y: scaleY(logS),
    };
  };

  // Monotone Cubic Spline functions for Upper and Lower Envelopes
  const splineUpper = useMemo(() => {
    const xs = UPPER_ANCHOR_POINTS.map((p) => Math.log10(p.t));
    const ys = UPPER_ANCHOR_POINTS.map((p) => Math.log10(p.s));
    return createMonotoneSpline(xs, ys);
  }, []);

  const splineLower = useMemo(() => {
    const xs = LOWER_ANCHOR_POINTS.map((p) => Math.log10(p.t));
    const ys = LOWER_ANCHOR_POINTS.map((p) => Math.log10(p.s));
    return createMonotoneSpline(xs, ys);
  }, []);

  // Dense evaluation (300 points) to guarantee flawless C1 continuity without breaks or polygonal edges
  const { upperSampled, lowerSampled, upperCurvePath, lowerCurvePath } = useMemo(() => {
    const NUM_SAMPLES = 300;
    const upPts: { t: number; s: number; x: number; y: number }[] = [];
    const loPts: { t: number; s: number; x: number; y: number }[] = [];

    for (let i = 0; i < NUM_SAMPLES; i++) {
      const frac = i / (NUM_SAMPLES - 1);
      const logT = minLogT + frac * (maxLogT - minLogT);
      const t = Math.pow(10, logT);

      const logSu = splineUpper(logT);
      const su = Math.pow(10, logSu);
      const upCoord = toSvgCoords(t, su);
      upPts.push({ t, s: su, x: upCoord.x, y: upCoord.y });

      const logSl = splineLower(logT);
      const sl = Math.pow(10, logSl);
      const loCoord = toSvgCoords(t, sl);
      loPts.push({ t, s: sl, x: loCoord.x, y: loCoord.y });
    }

    const upPath =
      `M ${upPts[0].x.toFixed(1)},${upPts[0].y.toFixed(1)} ` +
      upPts
        .slice(1)
        .map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        .join(' ');

    const loPath =
      `M ${loPts[0].x.toFixed(1)},${loPts[0].y.toFixed(1)} ` +
      loPts
        .slice(1)
        .map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        .join(' ');

    return {
      upperSampled: upPts,
      lowerSampled: loPts,
      upperCurvePath: upPath,
      lowerCurvePath: loPath,
    };
  }, [splineUpper, splineLower, plotWidth, plotHeight]);

  // Dividing boundary coordinates
  const b20_top = toSvgCoords(BOUNDARIES.line20.top.t, BOUNDARIES.line20.top.s);
  const b20_bot = toSvgCoords(BOUNDARIES.line20.bot.t, BOUNDARIES.line20.bot.s);

  const b40_top = toSvgCoords(BOUNDARIES.line40.top.t, BOUNDARIES.line40.top.s);
  const b40_bot = toSvgCoords(BOUNDARIES.line40.bot.t, BOUNDARIES.line40.bot.s);

  const b60_top = toSvgCoords(BOUNDARIES.line60.top.t, BOUNDARIES.line60.top.s);
  const b60_bot = toSvgCoords(BOUNDARIES.line60.bot.t, BOUNDARIES.line60.bot.s);

  const b80_top = toSvgCoords(BOUNDARIES.line80.top.t, BOUNDARIES.line80.top.s);
  const b80_bot = toSvgCoords(BOUNDARIES.line80.bot.t, BOUNDARIES.line80.bot.s);

  // Dense polygon paths for smooth regions that strictly follow the exact sampled envelope curves
  const classPolygons = useMemo(() => {
    // Class V: Very Poor (Left to line 20)
    const upperV = upperSampled.filter((p) => p.t < BOUNDARIES.line20.top.t);
    const lowerV = lowerSampled.filter((p) => p.t < BOUNDARIES.line20.bot.t);
    const pathV = [
      `M ${upperSampled[0].x.toFixed(1)},${upperSampled[0].y.toFixed(1)}`,
      ...upperV.slice(1).map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
      `L ${b20_top.x.toFixed(1)},${b20_top.y.toFixed(1)}`,
      `L ${b20_bot.x.toFixed(1)},${b20_bot.y.toFixed(1)}`,
      ...[...lowerV].reverse().map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
      'Z',
    ].join(' ');

    // Class IV: Poor (Line 20 to line 40)
    const upperIV = upperSampled.filter(
      (p) => p.t >= BOUNDARIES.line20.top.t && p.t <= BOUNDARIES.line40.top.t
    );
    const lowerIV = lowerSampled.filter(
      (p) => p.t >= BOUNDARIES.line20.bot.t && p.t <= BOUNDARIES.line40.bot.t
    );
    const pathIV = [
      `M ${b20_top.x.toFixed(1)},${b20_top.y.toFixed(1)}`,
      ...upperIV.map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
      `L ${b40_top.x.toFixed(1)},${b40_top.y.toFixed(1)}`,
      `L ${b40_bot.x.toFixed(1)},${b40_bot.y.toFixed(1)}`,
      ...[...lowerIV].reverse().map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
      `L ${b20_bot.x.toFixed(1)},${b20_bot.y.toFixed(1)}`,
      'Z',
    ].join(' ');

    // Class III: Fair (Line 40 to line 60)
    const upperIII = upperSampled.filter(
      (p) => p.t >= BOUNDARIES.line40.top.t && p.t <= BOUNDARIES.line60.top.t
    );
    const lowerIII = lowerSampled.filter(
      (p) => p.t >= BOUNDARIES.line40.bot.t && p.t <= BOUNDARIES.line60.bot.t
    );
    const pathIII = [
      `M ${b40_top.x.toFixed(1)},${b40_top.y.toFixed(1)}`,
      ...upperIII.map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
      `L ${b60_top.x.toFixed(1)},${b60_top.y.toFixed(1)}`,
      `L ${b60_bot.x.toFixed(1)},${b60_bot.y.toFixed(1)}`,
      ...[...lowerIII].reverse().map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
      `L ${b40_bot.x.toFixed(1)},${b40_bot.y.toFixed(1)}`,
      'Z',
    ].join(' ');

    // Class II: Good (Line 60 to line 80)
    const upperII = upperSampled.filter(
      (p) => p.t >= BOUNDARIES.line60.top.t && p.t <= BOUNDARIES.line80.top.t
    );
    const lowerII = lowerSampled.filter(
      (p) => p.t >= BOUNDARIES.line60.bot.t && p.t <= BOUNDARIES.line80.bot.t
    );
    const pathII = [
      `M ${b60_top.x.toFixed(1)},${b60_top.y.toFixed(1)}`,
      ...upperII.map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
      `L ${b80_top.x.toFixed(1)},${b80_top.y.toFixed(1)}`,
      `L ${b80_bot.x.toFixed(1)},${b80_bot.y.toFixed(1)}`,
      ...[...lowerII].reverse().map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
      `L ${b60_bot.x.toFixed(1)},${b60_bot.y.toFixed(1)}`,
      'Z',
    ].join(' ');

    // Class I: Very Good (Line 80 to right edge)
    const upperI = upperSampled.filter((p) => p.t >= BOUNDARIES.line80.top.t);
    const lowerI = lowerSampled.filter((p) => p.t >= BOUNDARIES.line80.bot.t);
    const lastUpper = upperSampled[upperSampled.length - 1];
    const lastLower = lowerSampled[lowerSampled.length - 1];
    const pathI = [
      `M ${b80_top.x.toFixed(1)},${b80_top.y.toFixed(1)}`,
      ...upperI.map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
      `L ${lastUpper.x.toFixed(1)},${lastUpper.y.toFixed(1)}`,
      `L ${lastLower.x.toFixed(1)},${lastLower.y.toFixed(1)}`,
      ...[...lowerI].reverse().map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
      `L ${b80_bot.x.toFixed(1)},${b80_bot.y.toFixed(1)}`,
      'Z',
    ].join(' ');

    return { pathV, pathIV, pathIII, pathII, pathI };
  }, [
    upperSampled,
    lowerSampled,
    b20_top,
    b20_bot,
    b40_top,
    b40_bot,
    b60_top,
    b60_bot,
    b80_top,
    b80_bot,
  ]);

  // Current calculation point on chart
  const curT = Math.max(0.01, result.standUpTimeHours);
  const curS = result.span;
  const currentPos = toSvgCoords(curT, curS);

  // Dynamic RMR Iso-line
  const currentRmrAnchors = getAnchorsForRmr(result.rmr);
  const currentRmrTop = toSvgCoords(
    currentRmrAnchors.top.timeHours,
    currentRmrAnchors.top.spanMeters
  );
  const currentRmrBot = toSvgCoords(
    currentRmrAnchors.bottom.timeHours,
    currentRmrAnchors.bottom.spanMeters
  );

  // Top Axis: Category groups and exact time ticks matching reference image
  const topGroups = [
    { label: 'minutes', xMin: scaleX(Math.log10(0.08)), xMax: scaleX(Math.log10(0.8)) },
    { label: 'hours', xMin: scaleX(Math.log10(1.0)), xMax: scaleX(Math.log10(20.0)) },
    { label: 'days', xMin: scaleX(Math.log10(24.0)), xMax: scaleX(Math.log10(480.0)) },
    { label: 'months', xMin: scaleX(Math.log10(730.0)), xMax: scaleX(Math.log10(7300.0)) },
    { label: 'years', xMin: scaleX(Math.log10(8760.0)), xMax: scaleX(Math.log10(175200.0)) },
  ];

  // Specific tick marks for the top axis (clean, non-overlapping)
  const topTicks: { t: number; label: string }[] = [
    // minutes
    { t: 10 / 60, label: '10' },
    { t: 30 / 60, label: '30' },
    { t: 1.0, label: '1' },
    // hours
    { t: 10.0, label: '10' },
    { t: 24.0, label: '1' },
    // days
    { t: 48.0, label: '2' },
    { t: 72.0, label: '3' },
    { t: 120.0, label: '5' },
    { t: 240.0, label: '10' },
    { t: 480.0, label: '20' },
    { t: 730.0, label: '1' },
    // months
    { t: 1460.0, label: '2' },
    { t: 2190.0, label: '3' },
    { t: 2920.0, label: '4' },
    { t: 3650.0, label: '5' },
    { t: 7300.0, label: '10' },
    // years
    { t: 8760.0 * 2, label: '2' },
    { t: 8760.0 * 3, label: '3' },
    { t: 8760.0 * 4, label: '4' },
    { t: 8760.0 * 5, label: '5' },
    { t: 8760.0 * 10, label: '10' },
    { t: 8760.0 * 20, label: '20' },
  ];

  // Bottom Axis (Hours decade ticks)
  const bottomDecades = [
    { logT: 0, label: '1' },
    { logT: 1, label: '10' },
    { logT: 2, label: '10²' },
    { logT: 3, label: '10³' },
    { logT: 4, label: '10⁴' },
    { logT: 5, label: '10⁵' },
  ];

  // Y-axis ticks (Span in meters)
  const yTicks = [
    { s: 0.5, label: '0.5' },
    { s: 1.0, label: '1' },
    { s: 2.0, label: '2' },
    { s: 3.0, label: '3' },
    { s: 4.0, label: '4' },
    { s: 5.0, label: '5' },
    { s: 6.0, label: '6' },
    { s: 8.0, label: '8' },
    { s: 10.0, label: '10' },
    { s: 15.0, label: '15' },
    { s: 20.0, label: '20' },
  ];

  // Fine log grid lines
  const gridLinesX: number[] = [];
  for (let dec = -1; dec <= 5; dec++) {
    for (let mul = 1; mul <= 9; mul++) {
      const val = mul * Math.pow(10, dec);
      const logV = Math.log10(val);
      if (logV >= minLogT && logV <= maxLogT) {
        gridLinesX.push(logV);
      }
    }
  }

  const gridLinesY: number[] = [
    0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0, 10.0, 15.0, 20.0,
  ].map((val) => Math.log10(val));

  // Click & Drag handler to set Unsupported Span interactively
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleFactorX = width / rect.width;
    const scaleFactorY = height / rect.height;
    const viewX = clickX * scaleFactorX;
    const viewY = clickY * scaleFactorY;

    if (
      viewX >= margin.left &&
      viewX <= width - margin.right &&
      viewY >= margin.top &&
      viewY <= height - margin.bottom
    ) {
      const pickedSpan = Math.round(unscaleY(viewY) * 10) / 10;
      const validSpan = Math.max(0.5, Math.min(20, pickedSpan));
      onSelectPoint(validSpan, result.rmr);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleFactorX = width / rect.width;
    const scaleFactorY = height / rect.height;
    const viewX = clickX * scaleFactorX;
    const viewY = clickY * scaleFactorY;

    if (
      viewX >= margin.left &&
      viewX <= width - margin.right &&
      viewY >= margin.top &&
      viewY <= height - margin.bottom
    ) {
      const t = unscaleX(viewX);
      const s = unscaleY(viewY);
      setHoverPoint({ x: viewX, y: viewY, t, s });
    } else {
      setHoverPoint(null);
    }
  };

  // Preset excavation spans
  const presets = [
    { labelFa: 'معدن (۲.۵m)', labelEn: 'Mine Drift (2.5m)', span: 2.5 },
    { labelFa: 'تونل آب (۴.۰m)', labelEn: 'Water Tunnel (4.0m)', span: 4.0 },
    { labelFa: 'مترو (۶.۵m)', labelEn: 'Metro (6.5m)', span: 6.5 },
    { labelFa: 'بزرگراه (۱۰.۰m)', labelEn: 'Highway (10.0m)', span: 10.0 },
    { labelFa: 'مغار بزرگ (۱۸.۰m)', labelEn: 'Powerhouse (18.0m)', span: 18.0 },
  ];

  // Theme-specific colors
  const isPaper = theme === 'paper';
  const colors = {
    containerBg: isPaper ? 'bg-white border-slate-300 shadow-xl' : 'bg-slate-900/95 border-slate-800 shadow-2xl',
    canvasBg: isPaper ? '#ffffff' : '#070b14',
    majorLine: isPaper ? '#000000' : '#f8fafc',
    boundaryLine: isPaper ? '#000000' : '#94a3b8',
    gridSub: isPaper ? '#e2e8f0' : '#1e293b',
    gridMajor: isPaper ? '#cbd5e1' : '#334155',
    axisText: isPaper ? '#0f172a' : '#cbd5e1',
    axisTitle: isPaper ? '#000000' : '#f1f5f9',
    rockText: isPaper ? '#000000' : '#f8fafc',
    borderRect: isPaper ? '#000000' : '#64748b',
    rmrLabelBg: isPaper ? '#ffffff' : '#090d16',
    rmrLabelText: isPaper ? '#000000' : '#38bdf8',
  };

  return (
    <div
      id="bieniawski-standup-chart-component"
      className={`rounded-2xl p-4 sm:p-5 border flex flex-col relative transition-all duration-200 ${colors.containerBg}`}
    >
      {/* Top Header & Theme Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b pb-3 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm ${
              isPaper
                ? 'bg-slate-100 border-slate-300 text-slate-900'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            }`}
          >
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3
                className={`text-sm sm:text-base font-extrabold tracking-tight ${
                  isPaper ? 'text-slate-900' : 'text-slate-100'
                }`}
              >
                {isFa
                  ? 'نمودار مرجع زمان خودپایداری در برابر دهانه بدون نگهداری (Bieniawski 1989)'
                  : 'Bieniawski Stand-up Time vs. Unsupported Span Chart (1989)'}
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                  isPaper
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {isPaper ? 'نسخه مقاله اصلی (Scan View)' : 'نسخه مدرن مهندسی'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isFa
                ? 'شبیه‌سازی کامل، پیوسته و یکپارچه بدون انکسار خطوط و با چیدمان استاندارد متون'
                : 'Exact high-precision replica with smooth C1 spline envelopes and pristine typography'}
            </p>
          </div>
        </div>

        {/* View Controls & Theme Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs flex-wrap">
          {/* Theme Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800">
            <button
              onClick={() => setTheme('paper')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                theme === 'paper'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-300 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isFa ? 'نمای مقاله اصلی' : 'Paper Edition'}</span>
            </button>
            <button
              onClick={() => setTheme('engineering')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                theme === 'engineering'
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isFa ? 'نمای مهندسی تیره' : 'Dark Mode'}</span>
            </button>
          </div>

          {/* Iso-RMR toggle */}
          <button
            onClick={() => setShowIsoRmrCurve(!showIsoRmrCurve)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              showIsoRmrCurve
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
            }`}
            title={isFa ? 'نمایش منحنی ویژه RMR پروژه' : 'Toggle project RMR curve'}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isFa ? `منحنی RMR=${result.rmr}` : `RMR=${result.rmr}`}</span>
          </button>

          {/* Rock Classes fill toggle */}
          <button
            onClick={() => setShowRegions(!showRegions)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              showRegions
                ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-600 dark:text-indigo-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isFa ? 'پهنه‌ها' : 'Classes'}</span>
          </button>

          {/* Grid toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              showGrid
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-600 dark:text-cyan-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isFa ? 'شبکه' : 'Grid'}</span>
          </button>
        </div>
      </div>

      {/* Quick Span Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs mb-3">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <Sliders className="w-3.5 h-3.5 text-amber-500" />
          <span>{isFa ? 'پیش‌تنظیم دهانه پروژه:' : 'Excavation Span Presets:'}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {presets.map((preset) => (
            <button
              key={preset.span}
              onClick={() => onSelectPoint(preset.span, result.rmr)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                Math.abs(curS - preset.span) < 0.2
                  ? 'bg-amber-500 text-white shadow-sm font-bold'
                  : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400'
              }`}
            >
              {isFa ? preset.labelFa : preset.labelEn}
            </button>
          ))}
          <span className="text-slate-400 text-[11px] font-mono px-1">
            {isFa ? `دهانه فعلی: ${curS} m` : `Current Span: ${curS} m`}
          </span>
        </div>
      </div>

      {/* Project Rock Mass Data Box (کادر توده‌سنگ پروژه) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 text-xs mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            {isFa ? 'کادر توده‌سنگ پروژه:' : 'Project Rock Mass Box:'}
          </span>
          <span
            className="px-2.5 py-0.5 rounded-md text-[11px] font-bold text-white shadow-xs"
            style={{ backgroundColor: result.rockClass.color }}
          >
            {isFa ? result.rockClass.nameFa : result.rockClass.nameEn}
          </span>
        </div>
        <div className="flex items-center gap-4 flex-wrap text-slate-700 dark:text-slate-300 font-mono text-[11px]">
          <div>
            <span className="text-slate-500">{isFa ? 'رتبه RMR:' : 'RMR:'} </span>
            <strong className="text-amber-600 dark:text-amber-400 text-xs">{result.rmr}</strong>
          </div>
          <div>
            <span className="text-slate-500">{isFa ? 'دهانه حفاری (Span):' : 'Excavation Span:'} </span>
            <strong className="text-slate-900 dark:text-slate-100 text-xs">{curS.toFixed(1)} m</strong>
          </div>
          <div>
            <span className="text-slate-500">{isFa ? 'زمان خودپایداری:' : 'Stand-up Time:'} </span>
            <strong className="text-cyan-600 dark:text-cyan-400 text-xs">
              {isFa ? result.formattedTimeFa : result.formattedTimeEn}
            </strong>
          </div>
          <div>
            <span className="text-slate-500">{isFa ? 'حداکثر دهانه مجاز:' : 'Max Allowable Span:'} </span>
            <strong className="text-purple-600 dark:text-purple-400 text-xs">{result.maxAllowableSpan} m</strong>
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 relative select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair block"
          onClick={handleSvgClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverPoint(null)}
        >
          <defs>
            {/* Gradients for Engineering theme */}
            <linearGradient id="gradVeryPoor" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="gradPoor" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="gradFair" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="gradGood" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="gradVeryGood" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.08" />
            </linearGradient>

            {/* Paper Theme Delicate Shading / Pattern */}
            <pattern id="paperHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#cbd5e1" strokeWidth="0.8" />
            </pattern>

            {/* Neon Glow Filter for Dark Mode */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Graph Background */}
          <rect
            x={margin.left}
            y={margin.top}
            width={plotWidth}
            height={plotHeight}
            fill={colors.canvasBg}
          />

          {/* Logarithmic Sub-Grid Lines */}
          {showGrid && (
            <g className={isPaper ? 'opacity-40' : 'opacity-25'}>
              {gridLinesX.map((lx, idx) => (
                <line
                  key={`gx-${idx}`}
                  x1={scaleX(lx)}
                  y1={margin.top}
                  x2={scaleX(lx)}
                  y2={margin.top + plotHeight}
                  stroke={colors.gridSub}
                  strokeWidth="0.7"
                />
              ))}
              {gridLinesY.map((ly, idx) => (
                <line
                  key={`gy-${idx}`}
                  x1={margin.left}
                  y1={scaleY(ly)}
                  x2={margin.left + plotWidth}
                  y2={scaleY(ly)}
                  stroke={colors.gridSub}
                  strokeWidth="0.7"
                />
              ))}
            </g>
          )}

          {/* Primary Decade Grid Lines */}
          {showGrid && (
            <g className={isPaper ? 'opacity-70' : 'opacity-45'}>
              {bottomDecades.map((tick, idx) => (
                <line
                  key={`ptick-x-${idx}`}
                  x1={scaleX(tick.logT)}
                  y1={margin.top}
                  x2={scaleX(tick.logT)}
                  y2={margin.top + plotHeight}
                  stroke={colors.gridMajor}
                  strokeWidth="1.1"
                />
              ))}
              {yTicks.map((tick, idx) => (
                <line
                  key={`ptick-y-${idx}`}
                  x1={margin.left}
                  y1={scaleY(Math.log10(tick.s))}
                  x2={margin.left + plotWidth}
                  y2={scaleY(Math.log10(tick.s))}
                  stroke={colors.gridMajor}
                  strokeWidth={tick.s === 1 || tick.s === 2 || tick.s === 10 || tick.s === 20 ? '1.2' : '0.8'}
                />
              ))}
            </g>
          )}

          {/* 5 Rock Mass Class Regions (Shaded Polygons) */}
          {showRegions && (
            <g id="rock-mass-class-zones">
              {/* Class V: Very Poor */}
              <path
                d={classPolygons.pathV}
                fill={isPaper ? 'rgba(239, 68, 68, 0.04)' : 'url(#gradVeryPoor)'}
                stroke="none"
              />
              {/* Class IV: Poor */}
              <path
                d={classPolygons.pathIV}
                fill={isPaper ? 'rgba(249, 115, 22, 0.04)' : 'url(#gradPoor)'}
                stroke="none"
              />
              {/* Class III: Fair */}
              <path
                d={classPolygons.pathIII}
                fill={isPaper ? 'rgba(234, 179, 8, 0.04)' : 'url(#gradFair)'}
                stroke="none"
              />
              {/* Class II: Good */}
              <path
                d={classPolygons.pathII}
                fill={isPaper ? 'rgba(59, 130, 246, 0.04)' : 'url(#gradGood)'}
                stroke="none"
              />
              {/* Class I: Very Good */}
              <path
                d={classPolygons.pathI}
                fill={isPaper ? 'rgba(16, 185, 129, 0.04)' : 'url(#gradVeryGood)'}
                stroke="none"
              />
            </g>
          )}

          {/* Upper Envelope Curve: Continuous, smooth C1 spline */}
          <path
            d={upperCurvePath}
            fill="none"
            stroke={colors.majorLine}
            strokeWidth={isPaper ? '2.4' : '2.8'}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Lower Envelope Curve: Continuous, smooth C1 spline */}
          <path
            d={lowerCurvePath}
            fill="none"
            stroke={colors.majorLine}
            strokeWidth={isPaper ? '2.4' : '2.8'}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Rock Class Dividing Boundary Lines */}
          <g id="class-dividing-lines">
            {/* Line 20 */}
            <line
              x1={b20_top.x}
              y1={b20_top.y}
              x2={b20_bot.x}
              y2={b20_bot.y}
              stroke={colors.boundaryLine}
              strokeWidth={isPaper ? '2.0' : '2.2'}
            />
            {/* Line 40 */}
            <line
              x1={b40_top.x}
              y1={b40_top.y}
              x2={b40_bot.x}
              y2={b40_bot.y}
              stroke={colors.boundaryLine}
              strokeWidth={isPaper ? '2.0' : '2.2'}
            />
            {/* Line 60 */}
            <line
              x1={b60_top.x}
              y1={b60_top.y}
              x2={b60_bot.x}
              y2={b60_bot.y}
              stroke={colors.boundaryLine}
              strokeWidth={isPaper ? '2.0' : '2.2'}
            />
            {/* Line 80 */}
            <line
              x1={b80_top.x}
              y1={b80_top.y}
              x2={b80_bot.x}
              y2={b80_bot.y}
              stroke={colors.boundaryLine}
              strokeWidth={isPaper ? '2.0' : '2.2'}
            />
          </g>

          {/* RMR Boundary Value Numbers (20, 40, 60, 80) positioned with knockout */}
          <g id="rmr-boundary-numbers" className="font-bold text-xs select-none">
            {/* Line 20 Top */}
            <text
              x={b20_top.x - 7}
              y={b20_top.y + 1}
              fill={colors.rmrLabelText}
              fontSize="11.5"
              fontWeight="bold"
              textAnchor="end"
              stroke={colors.canvasBg}
              strokeWidth="4"
              paintOrder="stroke"
              strokeLinejoin="round"
            >
              20
            </text>
            {/* Line 20 Bottom */}
            <text
              x={b20_bot.x + 8}
              y={b20_bot.y + 8}
              fill={colors.rmrLabelText}
              fontSize="11.5"
              fontWeight="bold"
              textAnchor="start"
              stroke={colors.canvasBg}
              strokeWidth="4"
              paintOrder="stroke"
              strokeLinejoin="round"
            >
              20
            </text>

            {/* Line 40 Top */}
            <text
              x={b40_top.x - 7}
              y={b40_top.y - 4}
              fill={colors.rmrLabelText}
              fontSize="11.5"
              fontWeight="bold"
              textAnchor="end"
              stroke={colors.canvasBg}
              strokeWidth="4"
              paintOrder="stroke"
              strokeLinejoin="round"
            >
              40
            </text>
            {/* Line 40 Bottom */}
            <text
              x={b40_bot.x + 8}
              y={b40_bot.y + 8}
              fill={colors.rmrLabelText}
              fontSize="11.5"
              fontWeight="bold"
              textAnchor="start"
              stroke={colors.canvasBg}
              strokeWidth="4"
              paintOrder="stroke"
              strokeLinejoin="round"
            >
              40
            </text>

            {/* Line 60 Top */}
            <text
              x={b60_top.x - 7}
              y={b60_top.y - 4}
              fill={colors.rmrLabelText}
              fontSize="11.5"
              fontWeight="bold"
              textAnchor="end"
              stroke={colors.canvasBg}
              strokeWidth="4"
              paintOrder="stroke"
              strokeLinejoin="round"
            >
              60
            </text>
            {/* Line 60 Bottom */}
            <text
              x={b60_bot.x + 8}
              y={b60_bot.y + 8}
              fill={colors.rmrLabelText}
              fontSize="11.5"
              fontWeight="bold"
              textAnchor="start"
              stroke={colors.canvasBg}
              strokeWidth="4"
              paintOrder="stroke"
              strokeLinejoin="round"
            >
              60
            </text>

            {/* Line 80 Bottom */}
            <text
              x={b80_bot.x + 8}
              y={b80_bot.y + 8}
              fill={colors.rmrLabelText}
              fontSize="11.5"
              fontWeight="bold"
              textAnchor="start"
              stroke={colors.canvasBg}
              strokeWidth="4"
              paintOrder="stroke"
              strokeLinejoin="round"
            >
              80
            </text>
          </g>

          {/* Center Class Region Text Labels (Faithfully Replicated from Reference Image) */}
          <g
            id="class-region-labels"
            className="select-none pointer-events-none text-center font-bold tracking-normal"
            style={{
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {/* 1. VERY POOR ROCK (5) */}
            <text
              x={scaleX(Math.log10(0.24))}
              y={scaleY(Math.log10(1.0))}
              fill={colors.rockText}
              fontSize="12.5"
              fontWeight="bold"
              textAnchor="middle"
            >
              <tspan x={scaleX(Math.log10(0.24))} dy="0">VERY</tspan>
              <tspan x={scaleX(Math.log10(0.24))} dy="14">POOR</tspan>
              <tspan x={scaleX(Math.log10(0.24))} dy="14">ROCK</tspan>
              <tspan x={scaleX(Math.log10(0.24))} dy="16" fontSize="13.5">5</tspan>
            </text>

            {/* 2. POOR ROCK (4) */}
            <text
              x={scaleX(Math.log10(5.0))}
              y={scaleY(Math.log10(2.8))}
              fill={colors.rockText}
              fontSize="13.5"
              fontWeight="bold"
              textAnchor="middle"
            >
              <tspan x={scaleX(Math.log10(5.0))} dy="0">POOR</tspan>
              <tspan x={scaleX(Math.log10(5.0))} dy="15">ROCK</tspan>
              <tspan x={scaleX(Math.log10(5.0))} dy="17" fontSize="14">4</tspan>
            </text>

            {/* 3. FAIR ROCK (3) */}
            <text
              x={scaleX(Math.log10(180.0))}
              y={scaleY(Math.log10(5.2))}
              fill={colors.rockText}
              fontSize="13.5"
              fontWeight="bold"
              textAnchor="middle"
            >
              <tspan x={scaleX(Math.log10(180.0))} dy="0">FAIR</tspan>
              <tspan x={scaleX(Math.log10(180.0))} dy="15">ROCK</tspan>
              <tspan x={scaleX(Math.log10(180.0))} dy="17" fontSize="14">3</tspan>
            </text>

            {/* 4. GOOD ROCK (2) */}
            <text
              x={scaleX(Math.log10(2800.0))}
              y={scaleY(Math.log10(8.6))}
              fill={colors.rockText}
              fontSize="13.5"
              fontWeight="bold"
              textAnchor="middle"
            >
              <tspan x={scaleX(Math.log10(2800.0))} dy="0">GOOD</tspan>
              <tspan x={scaleX(Math.log10(2800.0))} dy="15">ROCK</tspan>
              <tspan x={scaleX(Math.log10(2800.0))} dy="17" fontSize="14">2</tspan>
            </text>

            {/* 5. VERY GOOD ROCK (1) */}
            <text
              x={scaleX(Math.log10(55000.0))}
              y={scaleY(Math.log10(9.2))}
              fill={colors.rockText}
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
            >
              <tspan x={scaleX(Math.log10(55000.0))} dy="0">VERY</tspan>
              <tspan x={scaleX(Math.log10(55000.0))} dy="14">GOOD</tspan>
              <tspan x={scaleX(Math.log10(55000.0))} dy="14">ROCK</tspan>
              <tspan x={scaleX(Math.log10(55000.0))} dy="16" fontSize="13.5">1</tspan>
            </text>
          </g>

          {/* Dynamic User's Current RMR Line */}
          {showIsoRmrCurve && (
            <g id="user-current-rmr-line">
              <line
                x1={currentRmrTop.x}
                y1={currentRmrTop.y}
                x2={currentRmrBot.x}
                y2={currentRmrBot.y}
                stroke={isPaper ? '#0284c7' : '#38bdf8'}
                strokeWidth={isPaper ? '2.2' : '2.6'}
                strokeDasharray="5,3"
              />
              <circle
                cx={currentRmrTop.x}
                cy={currentRmrTop.y}
                r="3.5"
                fill={isPaper ? '#0284c7' : '#38bdf8'}
              />
              <circle
                cx={currentRmrBot.x}
                cy={currentRmrBot.y}
                r="3.5"
                fill={isPaper ? '#0284c7' : '#38bdf8'}
              />
            </g>
          )}

          {/* Outer Border of the Plot Area */}
          <rect
            x={margin.left}
            y={margin.top}
            width={plotWidth}
            height={plotHeight}
            fill="none"
            stroke={colors.borderRect}
            strokeWidth="1.6"
          />

          {/* TOP AXIS: Group Categories & Ticks */}
          <g id="top-axis-header">
            {/* Category Labels: minutes, hours, days, months, years */}
            {topGroups.map((grp, idx) => (
              <text
                key={`grp-${idx}`}
                x={(grp.xMin + grp.xMax) / 2}
                y={margin.top - 32}
                fill={colors.axisTitle}
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                className="tracking-wide"
              >
                {grp.label}
              </text>
            ))}

            {/* Tick Numbers and Lines */}
            {topTicks.map((tick, idx) => {
              const x = scaleX(Math.log10(tick.t));
              if (x < margin.left - 2 || x > margin.left + plotWidth + 2) return null;
              return (
                <g key={`top-tick-${idx}`}>
                  {/* Upward small tick line */}
                  <line
                    x1={x}
                    y1={margin.top - 8}
                    x2={x}
                    y2={margin.top}
                    stroke={colors.borderRect}
                    strokeWidth="1.2"
                  />
                  {/* Tick Number Label */}
                  <text
                    x={x}
                    y={margin.top - 12}
                    fill={colors.axisText}
                    fontSize="9.5"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {tick.label}
                  </text>
                </g>
              );
            })}
          </g>

          {/* BOTTOM AXIS: Stand-up time (h) */}
          <g id="bottom-axis">
            {bottomDecades.map((tick, idx) => {
              const x = scaleX(tick.logT);
              return (
                <g key={`bot-decade-${idx}`}>
                  {/* Downward tick mark */}
                  <line
                    x1={x}
                    y1={margin.top + plotHeight}
                    x2={x}
                    y2={margin.top + plotHeight + 8}
                    stroke={colors.borderRect}
                    strokeWidth="1.4"
                  />
                  {/* Tick label */}
                  <text
                    x={x}
                    y={margin.top + plotHeight + 22}
                    fill={colors.axisTitle}
                    fontSize="11.5"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {tick.label}
                  </text>
                </g>
              );
            })}

            {/* Bottom Axis Title */}
            <text
              x={margin.left + plotWidth / 2}
              y={margin.top + plotHeight + 48}
              fill={colors.axisTitle}
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
              className="tracking-wide"
            >
              {isFa ? 'Stand-up time (h) — زمان خودپایداری (ساعت)' : 'Stand-up time (h)'}
            </text>
          </g>

          {/* LEFT AXIS: Unsupported span (m) */}
          <g id="left-axis">
            {yTicks.map((tick, idx) => {
              const y = scaleY(Math.log10(tick.s));
              return (
                <g key={`y-tick-${idx}`}>
                  {/* Leftward tick mark */}
                  <line
                    x1={margin.left - 7}
                    y1={y}
                    x2={margin.left}
                    y2={y}
                    stroke={colors.borderRect}
                    strokeWidth="1.3"
                  />
                  {/* Value label */}
                  <text
                    x={margin.left - 11}
                    y={y + 4}
                    fill={colors.axisTitle}
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    {tick.label}
                  </text>
                </g>
              );
            })}

            {/* Left Axis Rotated Title */}
            <text
              x={-(margin.top + plotHeight / 2)}
              y={margin.left - 48}
              transform="rotate(-90)"
              fill={colors.axisTitle}
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
              className="tracking-wide"
            >
              {isFa
                ? 'Unsupported span (m) — دهانه بدون نگهداری (متر)'
                : 'Unsupported span (m)'}
            </text>
          </g>

          {/* User's Project Calculation Result Target Point */}
          <g id="project-active-result">
            {/* Projection dashed lines */}
            <line
              x1={margin.left}
              y1={currentPos.y}
              x2={currentPos.x}
              y2={currentPos.y}
              stroke="#f59e0b"
              strokeWidth="1.6"
              strokeDasharray="4,3"
            />
            <line
              x1={currentPos.x}
              y1={currentPos.y}
              x2={currentPos.x}
              y2={margin.top + plotHeight}
              stroke="#f59e0b"
              strokeWidth="1.6"
              strokeDasharray="4,3"
            />

            {/* Pulsing ring */}
            <circle
              cx={currentPos.x}
              cy={currentPos.y}
              r="14"
              fill="rgba(245, 158, 11, 0.25)"
              stroke="#f59e0b"
              strokeWidth="1.5"
              className="animate-ping opacity-75 origin-center"
            />

            {/* Target marker */}
            <circle
              cx={currentPos.x}
              cy={currentPos.y}
              r="7"
              fill={result.rockClass.color}
              stroke="#ffffff"
              strokeWidth="2.2"
              filter={isPaper ? undefined : 'url(#neonGlow)'}
            />
            <circle cx={currentPos.x} cy={currentPos.y} r="2.5" fill="#ffffff" />

            {/* Project Rock Mass Data Box on Point (Adaptive Centering & Spatial Alignment) */}
            {(() => {
              const tipWidth = 196;
              const tipHeight = 56;
              const isRightSide = currentPos.x > margin.left + plotWidth - tipWidth - 30;
              const tipOffsetX = isRightSide ? -(tipWidth + 14) : 16;
              const isTopSide = currentPos.y < margin.top + tipHeight + 20;
              const tipOffsetY = isTopSide ? 14 : -(tipHeight + 14);

              // Connector line coordinates
              const leaderX2 = isRightSide ? -2 : 2;
              const leaderY2 = isTopSide ? 6 : -6;
              const cardCornerX = isRightSide ? tipWidth : 0;
              const cardCornerY = isTopSide ? 0 : tipHeight;

              const cleanTimeFa = result.formattedTimeFa.split('(')[0].trim();
              const cleanTimeEn = result.formattedTimeEn.split('(')[0].trim();

              return (
                <g className="pointer-events-none select-none">
                  {/* Dashed connector leader from marker to box */}
                  <line
                    x1={currentPos.x + leaderX2}
                    y1={currentPos.y + leaderY2}
                    x2={currentPos.x + tipOffsetX + cardCornerX}
                    y2={currentPos.y + tipOffsetY + cardCornerY}
                    stroke="#f59e0b"
                    strokeWidth="1.3"
                    strokeDasharray="3,2"
                    opacity="0.8"
                  />

                  {/* Floating Box Container */}
                  <g
                    transform={`translate(${currentPos.x + tipOffsetX}, ${currentPos.y + tipOffsetY})`}
                    dir="ltr"
                    style={{ direction: 'ltr' }}
                  >
                    <rect
                      x="0"
                      y="0"
                      width={tipWidth}
                      height={tipHeight}
                      rx="8"
                      fill={isPaper ? '#0f172a' : '#070b14'}
                      fillOpacity="0.96"
                      stroke={result.rockClass.color || '#f59e0b'}
                      strokeWidth="1.8"
                      filter="drop-shadow(0 4px 12px rgba(0,0,0,0.5))"
                    />

                    {/* Card Title (Centered) */}
                    <text
                      x={tipWidth / 2}
                      y="18"
                      textAnchor="middle"
                      fill="#f59e0b"
                      fontSize="11"
                      fontWeight="bold"
                      direction={isFa ? 'rtl' : 'ltr'}
                      style={{ direction: isFa ? 'rtl' : 'ltr', unicodeBidi: 'plaintext' }}
                    >
                      {isFa ? '📍 توده‌سنگ پروژه' : '📍 Project Rock Mass'}
                    </text>

                    {/* Metric 1: Span & RMR (Centered) */}
                    <text
                      x={tipWidth / 2}
                      y="33"
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="10"
                      fontWeight="600"
                      className="font-mono"
                    >
                      {isFa
                        ? `دهانه: ${curS.toFixed(1)} متر | رتبه: ${result.rmr}`
                        : `Span: ${curS.toFixed(1)} m | RMR: ${result.rmr}`}
                    </text>

                    {/* Metric 2: Stand-up Time (Centered) */}
                    <text
                      x={tipWidth / 2}
                      y="47"
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="10"
                      fontWeight="600"
                      direction={isFa ? 'rtl' : 'ltr'}
                      style={{ direction: isFa ? 'rtl' : 'ltr', unicodeBidi: 'plaintext' }}
                    >
                      {isFa ? `خودپایداری: ${cleanTimeFa}` : `Stand-up: ${cleanTimeEn}`}
                    </text>
                  </g>
                </g>
              );
            })()}
          </g>

          {/* Interactive Hover Point */}
          {hoverPoint && (
            <g className="pointer-events-none select-none">
              <line
                x1={hoverPoint.x}
                y1={margin.top}
                x2={hoverPoint.x}
                y2={margin.top + plotHeight}
                stroke="#94a3b8"
                strokeWidth="0.9"
                strokeDasharray="3,3"
              />
              <line
                x1={margin.left}
                y1={hoverPoint.y}
                x2={margin.left + plotWidth}
                y2={hoverPoint.y}
                stroke="#94a3b8"
                strokeWidth="0.9"
                strokeDasharray="3,3"
              />
              <circle
                cx={hoverPoint.x}
                cy={hoverPoint.y}
                r="4.5"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Floating helper hint */}
        <div className="absolute bottom-2.5 left-2.5 bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pointer-events-none backdrop-blur-sm shadow-sm">
          <MousePointerClick className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            {isFa
              ? 'روی هر نقطه از نمودار کلیک کنید تا دهانه حفاری و زمان خودپایداری تنظیم شود'
              : 'Click on the chart canvas to adjust unsupported span'}
          </span>
        </div>
      </div>

      {/* Rock Classes Summary Footnote */}
      <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        {Object.values(ROCK_CLASSES).map((rc) => {
          const isSelected = result.rockClass.id === rc.id;
          return (
            <div
              key={rc.id}
              className={`p-2 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                  : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800/80 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: rc.color }}
                />
                <span className="font-bold text-slate-900 dark:text-slate-200">
                  {isFa ? `کلاس ${rc.code}` : `Class ${rc.code}`}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-auto font-mono">
                  RMR {rc.rmrRange[0]}-{rc.rmrRange[1]}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate font-medium">
                {isFa ? rc.nameFa.split('(')[0] : rc.nameEn.split(':')[1]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
