import React, { useState, useMemo, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  Info,
  Sliders,
  CheckCircle2,
  Layers,
  Crosshair,
  Printer,
  Sparkles,
  Zap,
} from 'lucide-react';

interface GsiExcavabilityChartProps {
  currentGsi: number;
  currentUcs: number;
  pointLoadIs50?: number;
  onUpdateGsi: (val: number) => void;
  lang: 'fa' | 'en';
}

// Empirical Case Study points plotted on the GSI chart
export interface GsiCasePoint {
  id: string;
  type: 'blasting' | 'hammer' | 'ripper_d8_d9' | 'ripper_d7' | 'digger';
  label: string;
  nameEn: string;
  nameFa: string;
  structure: string; // S1..S6
  discontinuity: string; // D1..D5
  gsiApprox: number;
  equipmentEn: string;
  equipmentFa: string;
  uRel: number; // 0..5 (x-axis in grid columns D1..D5)
  vRel: number; // 0..6 (y-axis in grid rows S1..S6)
}

const GSI_CASE_STUDIES: GsiCasePoint[] = [
  // Blasting (Square)
  {
    id: 'B1',
    type: 'blasting',
    label: 'B1',
    nameEn: 'Blasting Case 1',
    nameFa: 'مورد آتشباری ۱',
    structure: 'S2',
    discontinuity: 'D3',
    gsiApprox: 80,
    equipmentEn: 'Production Drilling & Blasting',
    equipmentFa: 'چالزنی و آتشباری کامل',
    uRel: 2.26,
    vRel: 1.25,
  },
  {
    id: 'B2',
    type: 'blasting',
    label: 'B2',
    nameEn: 'Blasting Case 2',
    nameFa: 'مورد آتشباری ۲',
    structure: 'S2',
    discontinuity: 'D2',
    gsiApprox: 81,
    equipmentEn: 'Heavy Production Blasting',
    equipmentFa: 'آتشباری سنگین با خرج ویژه',
    uRel: 1.62,
    vRel: 1.15,
  },
  {
    id: 'B3',
    type: 'blasting',
    label: 'B3',
    nameEn: 'Blasting Case 3',
    nameFa: 'مورد آتشباری ۳',
    structure: 'S2',
    discontinuity: 'D2',
    gsiApprox: 75,
    equipmentEn: 'Drill & Blast (Blocky Granite)',
    equipmentFa: 'چالزنی و انفجار (گرانیت بلوکی)',
    uRel: 1.65,
    vRel: 1.68,
  },
  {
    id: 'B4',
    type: 'blasting',
    label: 'B4',
    nameEn: 'Blasting Case 4',
    nameFa: 'مورد آتشباری ۴',
    structure: 'S3',
    discontinuity: 'D2',
    gsiApprox: 71,
    equipmentEn: 'Production Blasting (Massive Sandstone)',
    equipmentFa: 'آتشباری تولیدی (ماسته‌سنگ مقاوم)',
    uRel: 1.78,
    vRel: 2.12,
  },

  // Hammer (Triangle)
  {
    id: 'H1',
    type: 'hammer',
    label: 'H1',
    nameEn: 'Hammer Case 1',
    nameFa: 'مورد چکش هیدرولیکی ۱',
    structure: 'S3',
    discontinuity: 'D3',
    gsiApprox: 73,
    equipmentEn: 'Heavy Hydraulic Breaker (4.5 ton)',
    equipmentFa: 'پیکور هیدرولیکی سنگین ۴.۵ تن',
    uRel: 2.44,
    vRel: 1.95,
  },
  {
    id: 'H2',
    type: 'hammer',
    label: 'H2',
    nameEn: 'Hammer Case 2',
    nameFa: 'مورد چکش هیدرولیکی ۲',
    structure: 'S3',
    discontinuity: 'D2',
    gsiApprox: 69,
    equipmentEn: 'Hydraulic Breaker on Excavator',
    equipmentFa: 'چکش هیدرولیکی نصب بر بیل',
    uRel: 1.55,
    vRel: 2.38,
  },
  {
    id: 'H3',
    type: 'hammer',
    label: 'H3',
    nameEn: 'Hammer Case 3',
    nameFa: 'مورد چکش هیدرولیکی ۳',
    structure: 'S3',
    discontinuity: 'D2',
    gsiApprox: 65,
    equipmentEn: 'Medium Hydraulic Rock Breaker',
    equipmentFa: 'چکش هیدرولیکی متوسط',
    uRel: 1.62,
    vRel: 2.70,
  },

  // Ripper D8-D9 (Solid Circle)
  {
    id: 'R1',
    type: 'ripper_d8_d9',
    label: 'R1',
    nameEn: 'CAT D8/D9 Ripper Case 1',
    nameFa: 'مورد ریپرزنی سنگین R1',
    structure: 'S3',
    discontinuity: 'D3',
    gsiApprox: 65,
    equipmentEn: 'Caterpillar D8/D9 Heavy Ripper',
    equipmentFa: 'بولدوزر سنگین کاترپیلار D8/D9 با ریپر',
    uRel: 2.28,
    vRel: 2.68,
  },
  {
    id: 'R2',
    type: 'ripper_d8_d9',
    label: 'R2',
    nameEn: 'CAT D8/D9 Ripper Case 2',
    nameFa: 'مورد ریپرزنی سنگین R2',
    structure: 'S3',
    discontinuity: 'D3',
    gsiApprox: 67,
    equipmentEn: 'CAT D9R Single Shank Ripper',
    equipmentFa: 'بولدوزر D9R با ریپر تک‌شاخه',
    uRel: 2.56,
    vRel: 2.52,
  },
  {
    id: 'R3',
    type: 'ripper_d8_d9',
    label: 'R3',
    nameEn: 'CAT D8/D9 Ripper Case 3',
    nameFa: 'مورد ریپرزنی سنگین R3',
    structure: 'S3',
    discontinuity: 'D4',
    gsiApprox: 65,
    equipmentEn: 'CAT D8T Multi-shank Ripper',
    equipmentFa: 'بولدوزر D8T با ریپر چندشاخه',
    uRel: 3.52,
    vRel: 2.72,
  },
  {
    id: 'R4',
    type: 'ripper_d8_d9',
    label: 'R4',
    nameEn: 'CAT D8/D9 Ripper Case 4',
    nameFa: 'مورد ریپرزنی سنگین R4',
    structure: 'S3',
    discontinuity: 'D4',
    gsiApprox: 64,
    equipmentEn: 'Caterpillar D8 Continuous Ripping',
    equipmentFa: 'ریپرزنی پیوسته کاترپیلار D8',
    uRel: 2.78,
    vRel: 2.80,
  },
  {
    id: 'R5',
    type: 'ripper_d8_d9',
    label: 'R5',
    nameEn: 'CAT D8/D9 Ripper Case 5',
    nameFa: 'مورد ریپرزنی سنگین R5',
    structure: 'S3',
    discontinuity: 'D4',
    gsiApprox: 71,
    equipmentEn: 'CAT D9 Heavy Ripper + Pre-splitting',
    equipmentFa: 'ریپر سنگین D9 با کمک پیش‌شکافی',
    uRel: 3.32,
    vRel: 2.15,
  },
  {
    id: 'R6',
    type: 'ripper_d8_d9',
    label: 'R6',
    nameEn: 'CAT D8/D9 Ripper Case 6',
    nameFa: 'مورد ریپرزنی سنگین R6',
    structure: 'S4',
    discontinuity: 'D4',
    gsiApprox: 56,
    equipmentEn: 'CAT D8 Ripper (Seamy Rock)',
    equipmentFa: 'ریپرزنی با D8 در سنگ لایه‌ای',
    uRel: 3.32,
    vRel: 3.65,
  },
  {
    id: 'R7',
    type: 'ripper_d8_d9',
    label: 'R7',
    nameEn: 'CAT D8/D9 Ripper Case 7',
    nameFa: 'مورد ریپرزنی سنگین R7',
    structure: 'S4',
    discontinuity: 'D3',
    gsiApprox: 55,
    equipmentEn: 'CAT D8 Ripping in Folded Schist',
    equipmentFa: 'شخم‌زدن سنگ دگرگونی با D8',
    uRel: 2.50,
    vRel: 3.75,
  },
  {
    id: 'R8',
    type: 'ripper_d8_d9',
    label: 'R8',
    nameEn: 'CAT D8/D9 Ripper Case 8',
    nameFa: 'مورد ریپرزنی سنگین R8',
    structure: 'S3',
    discontinuity: 'D4',
    gsiApprox: 67,
    equipmentEn: 'CAT D9L Single Shank Penetration',
    equipmentFa: 'ریپرزنی عمیق D9L در توده‌سنگ بلوکی',
    uRel: 3.58,
    vRel: 2.50,
  },
  {
    id: 'R9',
    type: 'ripper_d8_d9',
    label: 'R9',
    nameEn: 'CAT D8/D9 Ripper Case 9',
    nameFa: 'مورد ریپرزنی سنگین R9',
    structure: 'S4',
    discontinuity: 'D3',
    gsiApprox: 62,
    equipmentEn: 'CAT D8 Ripping (Weathered Sandstone)',
    equipmentFa: 'ریپرزنی D8 در ماسه‌سنگ هوازده',
    uRel: 2.05,
    vRel: 3.30,
  },

  // Ripper D7 (Half-filled Circle)
  {
    id: 'R10',
    type: 'ripper_d7',
    label: 'R10',
    nameEn: 'CAT D7 Medium Ripper Case 10',
    nameFa: 'مورد ریپرزنی متوسط R10',
    structure: 'S5',
    discontinuity: 'D3',
    gsiApprox: 48,
    equipmentEn: 'Caterpillar D7 Medium Ripper (Economic Ripping)',
    equipmentFa: 'بولدوزر متوسط کاترپیلار D7 (ریپرزنی اقتصادی)',
    uRel: 2.65,
    vRel: 4.72,
  },

  // Digger (Open Circle)
  {
    id: 'D1',
    type: 'digger',
    label: 'D1',
    nameEn: 'Direct Digger Case 1',
    nameFa: 'مورد حفاری مستقیم بیل D1',
    structure: 'S5',
    discontinuity: 'D4',
    gsiApprox: 46,
    equipmentEn: 'Hydraulic Excavator (Direct Digging with Bucket)',
    equipmentFa: 'بیل مکانیکی هیدرولیک (کندن مستقیم با باکت)',
    uRel: 3.65,
    vRel: 4.85,
  },
  {
    id: 'D2',
    type: 'digger',
    label: 'D2',
    nameEn: 'Direct Digger Case 2',
    nameFa: 'مورد حفاری مستقیم بیل D2',
    structure: 'S5',
    discontinuity: 'D4',
    gsiApprox: 47,
    equipmentEn: 'Direct Backhoe Digging (Disintegrated Rock)',
    equipmentFa: 'بارگیری مستقیم بیل بدون نیاز به ریپر',
    uRel: 2.92,
    vRel: 4.78,
  },
];

// 21 columns in the reference bottom table
const ROCK_MASS_COLUMNS = [
  'S1',
  'S2D1',
  'S2D2',
  'S2D3',
  'S2D4',
  'S2D5',
  'S3D1',
  'S3D2',
  'S3D3',
  'S3D4',
  'S3D5',
  'S4D1',
  'S4D2',
  'S4D3',
  'S4D4',
  'S4D5',
  'S5D1',
  'S5D2',
  'S5D3',
  'S5D4',
  'S5D5',
] as const;

export const GsiExcavabilityChart: React.FC<GsiExcavabilityChartProps> = ({
  currentGsi,
  currentUcs,
  pointLoadIs50 = 2.5,
  onUpdateGsi,
  lang,
}) => {
  const isFa = lang === 'fa';
  const svgRef = useRef<SVGSVGElement | null>(null);

  // View state: 'paper' (original classic publication) vs 'dark' (high-tech geotechnical UI)
  const [themeMode, setThemeMode] = useState<'paper' | 'dark'>('dark');
  const [hoveredPoint, setHoveredPoint] = useState<GsiCasePoint | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ s: number; d: number } | null>(null);

  // SVG Coordinate Geometry
  // Total viewBox: 1000 x 860
  const CHART_WIDTH = 1000;
  const CHART_HEIGHT = 860;

  // Header Box
  const HEADER_X = 20;
  const HEADER_Y = 16;
  const HEADER_W = 365;
  const HEADER_H = 158;

  // Grid Dimensions (5 columns D1..D5 x 6 rows S1..S6)
  const GRID_LEFT = 415;
  const GRID_TOP = 180;
  const GRID_WIDTH = 565; // ~113px per column
  const GRID_HEIGHT = 540; // 90px per row
  const COL_W = GRID_WIDTH / 5; // 113
  const ROW_H = GRID_HEIGHT / 6; // 90

  // Structure Labels
  const STRUCT_X = 20;
  const STRUCT_W = 365;

  // Derive active (S, D) cell from currentGsi if not manually clicked
  const activeCell = useMemo(() => {
    if (selectedCell) return selectedCell;

    // Closest (S, D) from currentGsi
    // S index: 0..5 (S1..S6), D index: 0..4 (D1..D5)
    if (currentGsi >= 85) return { s: 0, d: 1 }; // S1, D2
    if (currentGsi >= 75) return { s: 1, d: 1 }; // S2, D2
    if (currentGsi >= 65) return { s: 2, d: 1 }; // S3, D2
    if (currentGsi >= 55) return { s: 2, d: 2 }; // S3, D3
    if (currentGsi >= 45) return { s: 3, d: 2 }; // S4, D3
    if (currentGsi >= 35) return { s: 4, d: 2 }; // S5, D3
    if (currentGsi >= 25) return { s: 4, d: 3 }; // S5, D4
    return { s: 5, d: 3 }; // S6, D4
  }, [currentGsi, selectedCell]);

  // Compute active rock mass column code for the table (e.g. 'S3D2' or 'S1')
  const activeColumnCode = useMemo(() => {
    const sCode = `S${activeCell.s + 1}`;
    const dCode = `D${activeCell.d + 1}`;
    if (sCode === 'S1') return 'S1';
    return `${sCode}${dCode}`;
  }, [activeCell]);

  // Determine excavation methods for current cell based on Tsiambaos & Saroglou / Hoek table
  const activeMethods = useMemo(() => {
    const col = activeColumnCode;
    const isDrillAndBlast = ['S1', 'S2D1', 'S2D2', 'S2D3'].includes(col);
    const isRipperD8D9 = [
      'S2D3',
      'S2D4',
      'S2D5',
      'S3D1',
      'S3D2',
      'S3D3',
      'S3D4',
      'S4D2',
      'S4D3',
    ].includes(col);
    const isRipperD7 = ['S3D3', 'S3D4', 'S3D5'].includes(col);
    const isDigging = ['S4D4', 'S4D5', 'S5D3', 'S5D4', 'S5D5'].includes(col);

    return {
      isDrillAndBlast,
      isRipperD8D9,
      isRipperD7,
      isDigging,
    };
  }, [activeColumnCode]);

  // Current Project Rock Mass X/Y coordinate inside SVG grid
  const projectMarkerPos = useMemo(() => {
    // Interpolate inside active cell with slight centering
    const u = activeCell.d + 0.5;
    const v = activeCell.s + 0.5;
    const x = GRID_LEFT + (u / 5) * GRID_WIDTH;
    const y = GRID_TOP + (v / 6) * GRID_HEIGHT;
    return { x, y };
  }, [activeCell, GRID_LEFT, GRID_TOP, GRID_WIDTH, GRID_HEIGHT]);

  // Calculate GSI Diagonal Contours (90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10)
  const contourLevels = [90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10];

  const contourPaths = useMemo(() => {
    return contourLevels.map((val) => {
      // GSI formula: 100 - (10.4 * u + (9.2 - 0.35 * u) * v) = val
      // => v = (100 - val - 10.4 * u) / (9.2 - 0.35 * u)
      const points: { x: number; y: number }[] = [];

      // Sample u from 0 to 5 in fine steps
      const steps = 30;
      for (let i = 0; i <= steps; i++) {
        const u = (i / steps) * 5.0;
        const denom = 9.2 - 0.35 * u;
        if (denom <= 0) continue;
        const v = (100 - val - 10.4 * u) / denom;

        if (v >= -0.05 && v <= 6.05) {
          const clampedV = Math.max(0, Math.min(6, v));
          const clampedU = Math.max(0, Math.min(5, u));
          const x = GRID_LEFT + (clampedU / 5) * GRID_WIDTH;
          const y = GRID_TOP + (clampedV / 6) * GRID_HEIGHT;
          points.push({ x, y });
        }
      }

      if (points.length < 2) return null;

      let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x.toFixed(1)},${points[i].y.toFixed(1)}`;
      }

      // Determine label anchor point
      const labelPt = points[0];
      const endPt = points[points.length - 1];

      return {
        val,
        path: d,
        labelPt,
        endPt,
      };
    }).filter(Boolean);
  }, [GRID_LEFT, GRID_TOP, GRID_WIDTH, GRID_HEIGHT]);

  // Handle cell click on GSI grid
  const handleGridCellClick = (sIdx: number, dIdx: number) => {
    // Disallow N/A cells
    if ((sIdx === 0 && dIdx >= 3) || (sIdx === 5 && dIdx <= 1)) {
      return;
    }
    setSelectedCell({ s: sIdx, d: dIdx });

    // Approximate GSI midpoint for this cell
    const u = dIdx + 0.5;
    const v = sIdx + 0.5;
    const approxGsi = Math.round(100 - (10.4 * u + (9.2 - 0.35 * u) * v));
    const safeGsi = Math.max(10, Math.min(95, approxGsi));
    onUpdateGsi(safeGsi);
  };

  // Preset structure definitions with detailed titles & descriptions
  const STRUCTURE_ROWS = [
    {
      code: 'S1',
      title: 'INTACT OR MASSIVE',
      titleFa: 'سنگ دست‌نخورده یا یکپارچه',
      desc: 'intact rock specimens or massive in situ rock with few widely spaced discontinuities',
      descFa: 'نمونه‌های سنگی دست‌نخورده یا توده‌سنگ یکپارچه با درزه‌های بسیار دور از هم',
    },
    {
      code: 'S2',
      title: 'BLOCKY',
      titleFa: 'بلوکی (قفل‌شده)',
      desc: 'well interlocked undisturbed rock mass consisting of cubical blocks formed by three intersecting discontinuity sets',
      descFa: 'توده‌سنگ کاملاً درهم‌قفل‌شده متشکل از بلوک‌های مکعبی با ۳ دسته ناپیوستگی متقاطع',
    },
    {
      code: 'S3',
      title: 'VERY BLOCKY',
      titleFa: 'بسیار بلوکی',
      desc: 'interlocked, partially disturbed mass with multi-faceted angular blocks formed by 4 or more joint sets',
      descFa: 'بلوک‌های زاویه‌دار چندوجهی با درهم‌قفل‌شدگی متوسط ناشی از ۴ دسته درزه یا بیشتر',
    },
    {
      code: 'S4',
      title: 'BLOCKY/DISTURBED/SEAMY',
      titleFa: 'بلوکی / به هم ریخته / لایه‌ای',
      desc: 'folded with angular blocks formed by many intersecting discontinuity sets. Persistence of bedding planes or schistosity',
      descFa: 'چین‌خورده با بلوک‌های زاویه‌دار؛ تداوم صفحات لایه‌بندی یا شیستوزیته ضعیف',
    },
    {
      code: 'S5',
      title: 'DISINTEGRATED',
      titleFa: 'متلاشی‌شده / خردشده',
      desc: 'poorly interlocked, heavily broken rock mass with mixture of angular and rounded rock pieces',
      descFa: 'توده‌سنگ به‌شدت خردشده با درهم‌قفل‌شدگی بسیار ضعیف و مخلوطی از قطعات زاویه‌دار و گردشده',
    },
    {
      code: 'S6',
      title: 'LAMINATED/SHEARED',
      titleFa: 'لایه‌لایه / برشی‌شده',
      desc: 'Lack of blockiness due to close spacing of weak schistosity or shear planes',
      descFa: 'فقدان ساختار بلوکی به دلیل فاصله بسیار نزدیک صفحات شیستوزیته یا سطوح برشی',
    },
  ];

  // Surface condition columns
  const SURFACE_COLS = [
    {
      code: 'D1',
      title: 'VERY GOOD',
      titleFa: 'بسیار خوب',
      desc: 'Very rough, fresh unweathered surfaces',
      descFa: 'سطوح بسیار ناهموار، تازه و هوانزدگی‌نیافته',
    },
    {
      code: 'D2',
      title: 'GOOD',
      titleFa: 'خوب',
      desc: 'Rough, slightly weathered, iron stained surfaces',
      descFa: 'سطوح ناهموار، کمی هوازده با آثار زنگ‌آهن',
    },
    {
      code: 'D3',
      title: 'FAIR',
      titleFa: 'متوسط',
      desc: 'Smooth, moderately weathered and altered surfaces',
      descFa: 'سطوح صیقلی/صاف، هوازدگی و دگرسانی متوسط',
    },
    {
      code: 'D4',
      title: 'POOR',
      titleFa: 'ضعیف',
      desc: 'Slickensided, highly weathered surfaces with compact coatings or fillings or angular fragments',
      descFa: 'سطوح لغزشی (خش‌دار)، هوازدگی شدید با پوشش یا پرشدگی متراکم',
    },
    {
      code: 'D5',
      title: 'VERY POOR',
      titleFa: 'بسیار ضعیف',
      desc: 'Slickensided, highly weathered surfaces with soft clay coatings or fillings',
      descFa: 'سطوح لغزشی به‌شدت هوازده با پرشدگی یا لایه رسی نرم',
    },
  ];

  // Theme palettes
  const isDark = themeMode === 'dark';
  const c = {
    bg: isDark ? '#090d16' : '#ffffff',
    cardBg: isDark ? '#0f172a' : '#f8fafc',
    border: isDark ? '#334155' : '#000000',
    borderLight: isDark ? '#1e293b' : '#94a3b8',
    textMain: isDark ? '#f8fafc' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#334155',
    textSub: isDark ? '#64748b' : '#475569',
    contour: isDark ? '#64748b' : '#334155',
    contourText: isDark ? '#cbd5e1' : '#0f172a',
    naFill: isDark ? '#1e293b' : '#e2e8f0',
    tableHeaderBg: isDark ? '#1e293b' : '#f1f5f9',
    tableMarkBg: isDark ? '#334155' : '#cbd5e1',
    accent: '#f59e0b',
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300">
      {/* Top Toolbar: Interactive Controls & Theme Switcher */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{isFa ? 'شبیه‌سازی کامل نمودار GSI و روش حفاری (Hoek & Marinos 2000)' : 'GSI Rock Mass Excavability Matrix (Hoek & Marinos 2000)'}</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
                GSI = {currentGsi}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isFa
                ? 'تطبیق دقیق ساختار توده‌سنگ (S1–S6)، وضعیت ناپیوستگی‌ها (D1–D5) و ماشین‌آلات پیشنهادی'
                : 'Exact simulation of GSI matrix, discontinuity conditions, and recommended excavation machinery'}
            </p>
          </div>
        </div>

        {/* View Mode Switcher & GSI Quick Input */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setThemeMode('dark')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                themeMode === 'dark'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isFa ? 'نمای مهندسی تیره' : 'Dark Geotechnical UI'}
            </button>
            <button
              onClick={() => setThemeMode('paper')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                themeMode === 'paper'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-1">
                <Printer className="w-3.5 h-3.5" />
                <span>{isFa ? 'نمای چاپ مقاله (سفید)' : 'Paper Mode'}</span>
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-slate-400">GSI:</span>
            <input
              type="range"
              min="10"
              max="95"
              step="1"
              value={currentGsi}
              onChange={(e) => {
                setSelectedCell(null);
                onUpdateGsi(Number(e.target.value));
              }}
              className="w-20 sm:w-28 accent-purple-500 cursor-pointer"
            />
            <span className="font-mono text-xs font-bold text-purple-300 w-6 text-center">
              {currentGsi}
            </span>
          </div>
        </div>
      </div>

      {/* Main GSI Diagram Container */}
      <div
        className={`w-full rounded-2xl border transition-all duration-300 shadow-2xl p-2 sm:p-4 ${
          isDark
            ? 'bg-slate-950 border-slate-800 text-slate-100'
            : 'bg-white border-slate-400 text-slate-900 shadow-slate-300'
        }`}
      >
        <div className="w-full max-w-[1180px] mx-auto">
          {/* Main SVG Vector Canvas */}
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="w-full h-auto"
            dir="ltr"
            style={{ direction: 'ltr' }}
          >
            <defs>
              {/* Hatch Pattern for N/A cells */}
              <pattern
                id="gsi-na-hatch"
                width="12"
                height="12"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="12"
                  stroke={isDark ? '#475569' : '#94a3b8'}
                  strokeWidth="1.5"
                />
              </pattern>

              {/* Rock Texture: S1 (Intact / Massive) */}
              <pattern id="tex-s1" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill={isDark ? '#0f172a' : '#ffffff'} />
                <line x1="10" y1="70" x2="70" y2="10" stroke={isDark ? '#64748b' : '#334155'} strokeWidth="1.2" />
                <line x1="30" y1="75" x2="75" y2="30" stroke={isDark ? '#64748b' : '#334155'} strokeWidth="0.8" strokeDasharray="3 3" />
              </pattern>

              {/* Rock Texture: S2 (Blocky) */}
              <pattern id="tex-s2" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill={isDark ? '#0f172a' : '#ffffff'} />
                <path d="M 0 0 L 20 0 L 20 20 L 0 20 Z" fill="none" stroke={isDark ? '#64748b' : '#334155'} strokeWidth="1" />
                <line x1="0" y1="20" x2="20" y2="0" stroke={isDark ? '#475569' : '#64748b'} strokeWidth="0.8" />
              </pattern>

              {/* Rock Texture: S3 (Very Blocky Angular) */}
              <pattern id="tex-s3" width="30" height="30" patternUnits="userSpaceOnUse">
                <rect width="30" height="30" fill={isDark ? '#0f172a' : '#ffffff'} />
                <path
                  d="M 5 0 L 18 10 L 10 25 L 0 15 Z M 18 10 L 30 5 L 28 22 L 10 25 Z"
                  fill="none"
                  stroke={isDark ? '#64748b' : '#334155'}
                  strokeWidth="1.2"
                />
              </pattern>

              {/* Rock Texture: S4 (Seamy / Folded) */}
              <pattern id="tex-s4" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="40" fill={isDark ? '#0f172a' : '#ffffff'} />
                <path
                  d="M 0 10 Q 20 0, 40 10 M 0 22 Q 20 12, 40 22 M 0 34 Q 20 24, 40 34"
                  fill="none"
                  stroke={isDark ? '#64748b' : '#334155'}
                  strokeWidth="1.2"
                />
                <line x1="12" y1="0" x2="18" y2="40" stroke={isDark ? '#475569' : '#64748b'} strokeWidth="1" />
                <line x1="28" y1="0" x2="32" y2="40" stroke={isDark ? '#475569' : '#64748b'} strokeWidth="1" />
              </pattern>

              {/* Rock Texture: S5 (Disintegrated) */}
              <pattern id="tex-s5" width="30" height="30" patternUnits="userSpaceOnUse">
                <rect width="30" height="30" fill={isDark ? '#0f172a' : '#ffffff'} />
                <circle cx="8" cy="8" r="4" fill="none" stroke={isDark ? '#64748b' : '#334155'} strokeWidth="1.2" />
                <circle cx="22" cy="12" r="5" fill="none" stroke={isDark ? '#64748b' : '#334155'} strokeWidth="1.2" />
                <circle cx="12" cy="22" r="4.5" fill="none" stroke={isDark ? '#64748b' : '#334155'} strokeWidth="1.2" />
                <circle cx="24" cy="24" r="3" fill="none" stroke={isDark ? '#64748b' : '#334155'} strokeWidth="1" />
              </pattern>

              {/* Rock Texture: S6 (Laminated / Sheared) */}
              <pattern id="tex-s6" width="30" height="15" patternUnits="userSpaceOnUse">
                <rect width="30" height="15" fill={isDark ? '#0f172a' : '#ffffff'} />
                <path
                  d="M 0 3 Q 15 0, 30 3 M 0 7 Q 15 4, 30 7 M 0 11 Q 15 8, 30 11"
                  fill="none"
                  stroke={isDark ? '#64748b' : '#334155'}
                  strokeWidth="1.2"
                />
              </pattern>

              {/* Marker Glow Filter */}
              <filter id="gsi-target-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* 1. TOP-LEFT HEADER BOX (Exact match of Hoek & Marinos 2000 publication text) */}
            <g id="header-box">
              <rect
                x={HEADER_X}
                y={HEADER_Y}
                width={HEADER_W}
                height={HEADER_H}
                fill={c.cardBg}
                stroke={c.border}
                strokeWidth="1.6"
              />
              {/* Title inside header box */}
              <text
                x={HEADER_X + 12}
                y={HEADER_Y + 20}
                fontSize="11.5"
                fontWeight="bold"
                fill={c.textMain}
                fontFamily="system-ui, sans-serif"
              >
                GEOLOGICAL STRENGTH INDEX FOR
              </text>
              <text
                x={HEADER_X + 12}
                y={HEADER_Y + 34}
                fontSize="11.5"
                fontWeight="bold"
                fill={c.textMain}
                fontFamily="system-ui, sans-serif"
              >
                JOINTED ROCKS (Hoek and Marinos, 2000)
              </text>

              {/* Explanatory Paragraph 1 */}
              <foreignObject
                x={HEADER_X + 12}
                y={HEADER_Y + 38}
                width={HEADER_W - 24}
                height={HEADER_H - 42}
              >
                <div
                  className="text-[8.5px] leading-[1.32] text-justify font-sans"
                  style={{ color: c.textMuted }}
                >
                  <p className="mb-1">
                    From the lithology, structure and surface conditions of the discontinuities, estimate
                    the average value of GSI. Do not try to be too precise. Quoting a range from 33 to 37 is
                    more realistic than stating that GSI = 35. Note that the table does not apply to structurally
                    controlled failures. Where weak planar structural planes are present in an unfavourable orientation
                    with respect to the excavation face, these will dominate the rock mass behaviour.
                  </p>
                  <p>
                    The shear strength of surfaces in rocks that are prone to deterioration as a result of
                    changes in moisture content will be reduced if water is present. When working with rocks
                    in the fair to very poor categories, a shift to the right may be made for wet conditions.
                    Water pressure is dealt with by effective stress analysis.
                  </p>
                </div>
              </foreignObject>
            </g>

            {/* 2. TOP-RIGHT SURFACE CONDITION HEADER COLUMNS (D1 to D5) */}
            <g id="surface-conditions-headers">
              {/* Vertical label "SURFACE CONDITIONS" on left of headers */}
              <g transform={`translate(${GRID_LEFT - 18}, ${GRID_TOP - 80}) rotate(-90)`}>
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill={c.textMain}
                  letterSpacing="1.5"
                  fontFamily="system-ui, sans-serif"
                >
                  SURFACE CONDITIONS
                </text>
              </g>

              {/* Horizontal banner: "DECREASING SURFACE QUALITY ────────►" */}
              <rect
                x={GRID_LEFT}
                y={HEADER_Y}
                width={GRID_WIDTH}
                height={24}
                fill={c.cardBg}
                stroke={c.border}
                strokeWidth="1.4"
              />
              <text
                x={GRID_LEFT + 15}
                y={HEADER_Y + 16}
                fontSize="10"
                fontWeight="bold"
                fill={c.textMain}
                fontFamily="system-ui, sans-serif"
              >
                DECREASING SURFACE QUALITY ──────────────────────────────►
              </text>

              {/* 5 Column Boxes (D1 to D5) */}
              {SURFACE_COLS.map((col, idx) => {
                const colX = GRID_LEFT + idx * COL_W;
                const colY = HEADER_Y + 24;
                const colH = GRID_TOP - colY;
                const isColActive = activeCell.d === idx;

                return (
                  <g key={col.code} id={`col-header-${col.code}`}>
                    <rect
                      x={colX}
                      y={colY}
                      width={COL_W}
                      height={colH}
                      fill={isColActive ? (isDark ? '#1e1b4b' : '#ede9fe') : c.cardBg}
                      stroke={isColActive ? '#8b5cf6' : c.border}
                      strokeWidth={isColActive ? 2 : 1.2}
                      className="transition-colors duration-200"
                    />
                    {/* Column Tag & Name */}
                    <text
                      x={colX + COL_W / 2}
                      y={colY + 18}
                      textAnchor="middle"
                      fontSize="10.5"
                      fontWeight="bold"
                      fill={isColActive ? '#a855f7' : c.textMain}
                      fontFamily="system-ui, sans-serif"
                    >
                      {col.title}
                    </text>

                    {/* Column Description */}
                    <foreignObject
                      x={colX + 5}
                      y={colY + 26}
                      width={COL_W - 10}
                      height={colH - 30}
                    >
                      <div
                        className="text-[8.5px] leading-[1.25] text-center font-sans px-1"
                        style={{ color: isColActive ? (isDark ? '#e9d5ff' : '#6b21a8') : c.textMuted }}
                      >
                        {col.desc}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </g>

            {/* 3. STRUCTURE HEADER BAR & DOWNWARD ARROW BANNER */}
            <g id="structure-banner">
              {/* Header Box Label "STRUCTURE" */}
              <rect
                x={HEADER_X}
                y={HEADER_Y + HEADER_H}
                width={HEADER_W}
                height={22}
                fill={c.cardBg}
                stroke={c.border}
                strokeWidth="1.4"
              />
              <text
                x={HEADER_X + HEADER_W / 2}
                y={HEADER_Y + HEADER_H + 15}
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill={c.textMain}
                fontFamily="system-ui, sans-serif"
              >
                STRUCTURE
              </text>

              {/* Vertical Banner beside the grid: "DECREASING INTERLOCKING OF ROCK PIECES" */}
              <g transform={`translate(${GRID_LEFT - 18}, ${GRID_TOP + GRID_HEIGHT / 2}) rotate(-90)`}>
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="bold"
                  fill={c.textMain}
                  letterSpacing="1"
                  fontFamily="system-ui, sans-serif"
                >
                  DECREASING INTERLOCKING OF ROCK PIECES
                </text>
              </g>

              {/* Downward Arrow pointing down beside the vertical banner */}
              <line
                x1={GRID_LEFT - 32}
                y1={GRID_TOP + 20}
                x2={GRID_LEFT - 32}
                y2={GRID_TOP + GRID_HEIGHT - 20}
                stroke={c.textMain}
                strokeWidth="1.5"
              />
              <polygon
                points={`${GRID_LEFT - 37},${GRID_TOP + GRID_HEIGHT - 20} ${GRID_LEFT - 27},${GRID_TOP + GRID_HEIGHT - 20} ${GRID_LEFT - 32},${GRID_TOP + GRID_HEIGHT - 5}`}
                fill={c.textMain}
              />
            </g>

            {/* 4. LEFT STRUCTURE CARDS (S1 to S6) */}
            <g id="structure-rows">
              {STRUCTURE_ROWS.map((row, idx) => {
                const rowY = GRID_TOP + idx * ROW_H;
                const isRowActive = activeCell.s === idx;

                return (
                  <g
                    key={row.code}
                    id={`struct-row-${row.code}`}
                    className="cursor-pointer"
                    onClick={() => handleGridCellClick(idx, activeCell.d)}
                  >
                    {/* Left code tag (S1..S6) */}
                    <text
                      x={STRUCT_X - 10}
                      y={rowY + ROW_H / 2 + 5}
                      fontSize="14"
                      fontWeight="bold"
                      fill={isRowActive ? '#f59e0b' : c.textMain}
                      fontFamily="system-ui, sans-serif"
                    >
                      {row.code}
                    </text>

                    {/* Outer row bounding box */}
                    <rect
                      x={STRUCT_X}
                      y={rowY}
                      width={STRUCT_W}
                      height={ROW_H}
                      fill={isRowActive ? (isDark ? '#1e1b4b' : '#ede9fe') : c.cardBg}
                      stroke={isRowActive ? '#8b5cf6' : c.border}
                      strokeWidth={isRowActive ? 2 : 1.2}
                      className="transition-colors duration-200"
                    />

                    {/* Geological Rock Mass Sketch Drawing */}
                    <rect
                      x={STRUCT_X + 6}
                      y={rowY + 6}
                      width={78}
                      height={ROW_H - 12}
                      fill={`url(#tex-s${idx + 1})`}
                      stroke={c.border}
                      strokeWidth="1"
                    />

                    {/* Row Title & Full Geological Description */}
                    <foreignObject
                      x={STRUCT_X + 90}
                      y={rowY + 6}
                      width={STRUCT_W - 96}
                      height={ROW_H - 12}
                    >
                      <div className="h-full flex flex-col justify-center px-1 font-sans">
                        <div
                          className="text-[9.5px] font-bold uppercase tracking-tight mb-0.5"
                          style={{ color: isRowActive ? '#a855f7' : c.textMain }}
                        >
                          {row.title}
                        </div>
                        <div
                          className="text-[8.5px] leading-[1.25] text-justify"
                          style={{ color: isRowActive ? (isDark ? '#e9d5ff' : '#581c87') : c.textMuted }}
                        >
                          {row.desc}
                        </div>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </g>

            {/* 5. MAIN 6x5 GSI GRID MATRIX */}
            <g id="gsi-matrix-grid">
              {/* Grid Background Base */}
              <rect
                x={GRID_LEFT}
                y={GRID_TOP}
                width={GRID_WIDTH}
                height={GRID_HEIGHT}
                fill={c.bg}
                stroke={c.border}
                strokeWidth="1.8"
              />

              {/* Cell Rectangles with Clickable Hitboxes */}
              {STRUCTURE_ROWS.map((_, sIdx) =>
                SURFACE_COLS.map((_, dIdx) => {
                  const cellX = GRID_LEFT + dIdx * COL_W;
                  const cellY = GRID_TOP + sIdx * ROW_H;
                  const isNa =
                    (sIdx === 0 && dIdx >= 3) || (sIdx === 5 && dIdx <= 1);
                  const isSelected = activeCell.s === sIdx && activeCell.d === dIdx;

                  return (
                    <g key={`cell-${sIdx}-${dIdx}`}>
                      <rect
                        x={cellX}
                        y={cellY}
                        width={COL_W}
                        height={ROW_H}
                        fill={
                          isNa
                            ? 'url(#gsi-na-hatch)'
                            : isSelected
                            ? isDark
                              ? '#3b0764'
                              : '#f3e8ff'
                            : 'transparent'
                        }
                        fillOpacity={isSelected ? 0.35 : 1}
                        stroke={isSelected ? '#c084fc' : c.borderLight}
                        strokeWidth={isSelected ? 2 : 0.75}
                        className={isNa ? 'cursor-not-allowed' : 'cursor-pointer transition-colors duration-150'}
                        onClick={() => handleGridCellClick(sIdx, dIdx)}
                      />

                      {/* N/A Watermark */}
                      {isNa && (
                        <text
                          x={cellX + COL_W / 2}
                          y={cellY + ROW_H / 2 + 4}
                          textAnchor="middle"
                          fontSize="13"
                          fontWeight="bold"
                          fill={isDark ? '#94a3b8' : '#64748b'}
                          fontFamily="system-ui, sans-serif"
                        >
                          N/A
                        </text>
                      )}
                    </g>
                  );
                })
              )}

              {/* Diagonal GSI Contours (Lines & Labels) */}
              <g id="gsi-contours">
                {contourPaths.map((item) => {
                  if (!item) return null;
                  return (
                    <g key={`contour-${item.val}`}>
                      {/* Contour line */}
                      <path
                        d={item.path}
                        fill="none"
                        stroke={c.contour}
                        strokeWidth={item.val % 10 === 0 ? 1.4 : 0.9}
                      />

                      {/* Contour Label: along curve or borders */}
                      {item.val >= 50 ? (
                        // Placed at left side
                        <g transform={`translate(${item.labelPt.x + 8}, ${item.labelPt.y - 4})`}>
                          <text
                            x="0"
                            y="0"
                            fontSize="9"
                            fontWeight="bold"
                            fill={c.contourText}
                            fontFamily="system-ui, sans-serif"
                          >
                            {item.val}
                          </text>
                        </g>
                      ) : (
                        // Placed at bottom side
                        <g transform={`translate(${item.endPt.x - 14}, ${item.endPt.y - 6})`}>
                          <text
                            x="0"
                            y="0"
                            fontSize="9"
                            fontWeight="bold"
                            fill={c.contourText}
                            fontFamily="system-ui, sans-serif"
                          >
                            {item.val}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Bottom Contour Labels along the bottom axis (45, 40, 35, 30, 25, 20, 15, 10) */}
              <g id="bottom-contour-numbers" transform={`translate(0, ${GRID_TOP + GRID_HEIGHT + 14})`}>
                {[
                  { val: 45, x: GRID_LEFT + 0.18 * GRID_WIDTH },
                  { val: 40, x: GRID_LEFT + 0.32 * GRID_WIDTH },
                  { val: 35, x: GRID_LEFT + 0.45 * GRID_WIDTH },
                  { val: 30, x: GRID_LEFT + 0.58 * GRID_WIDTH },
                  { val: 25, x: GRID_LEFT + 0.70 * GRID_WIDTH },
                  { val: 20, x: GRID_LEFT + 0.81 * GRID_WIDTH },
                  { val: 15, x: GRID_LEFT + 0.91 * GRID_WIDTH },
                  { val: 10, x: GRID_LEFT + 0.98 * GRID_WIDTH },
                ].map((item) => (
                  <text
                    key={`b-contour-${item.val}`}
                    x={item.x}
                    y="0"
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="bold"
                    fill={c.textMain}
                    fontFamily="system-ui, sans-serif"
                  >
                    {item.val}
                  </text>
                ))}
              </g>

              {/* 6. EMPIRICAL CASE STUDY PLOTTED POINTS (B1..B4, H1..H3, R1..R10, D1..D2) */}
              <g id="empirical-case-points">
                {GSI_CASE_STUDIES.map((pt) => {
                  const px = GRID_LEFT + (pt.uRel / 5) * GRID_WIDTH;
                  const py = GRID_TOP + (pt.vRel / 6) * GRID_HEIGHT;
                  const isHovered = hoveredPoint?.id === pt.id;

                  return (
                    <g
                      key={pt.id}
                      className="cursor-pointer transition-transform duration-150 hover:scale-125"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      {/* Case Point Symbol */}
                      {pt.type === 'blasting' && (
                        // Square □
                        <rect
                          x={px - 5}
                          y={py - 5}
                          width={10}
                          height={10}
                          fill={isDark ? '#0f172a' : '#ffffff'}
                          stroke={isDark ? '#f8fafc' : '#000000'}
                          strokeWidth="1.6"
                        />
                      )}

                      {pt.type === 'hammer' && (
                        // Triangle △
                        <polygon
                          points={`${px},${py - 6} ${px - 6},${py + 5} ${px + 6},${py + 5}`}
                          fill={isDark ? '#0f172a' : '#ffffff'}
                          stroke={isDark ? '#f8fafc' : '#000000'}
                          strokeWidth="1.6"
                        />
                      )}

                      {pt.type === 'ripper_d8_d9' && (
                        // Solid circle ●
                        <circle
                          cx={px}
                          cy={py}
                          r="5"
                          fill={isDark ? '#f8fafc' : '#000000'}
                          stroke={isDark ? '#000000' : '#ffffff'}
                          strokeWidth="1"
                        />
                      )}

                      {pt.type === 'ripper_d7' && (
                        // Half-filled circle ◐
                        <g>
                          <circle
                            cx={px}
                            cy={py}
                            r="5"
                            fill={isDark ? '#0f172a' : '#ffffff'}
                            stroke={isDark ? '#f8fafc' : '#000000'}
                            strokeWidth="1.4"
                          />
                          <path
                            d={`M ${px} ${py - 5} A 5 5 0 0 0 ${px} ${py + 5} Z`}
                            fill={isDark ? '#f8fafc' : '#000000'}
                          />
                        </g>
                      )}

                      {pt.type === 'digger' && (
                        // Open circle ○
                        <circle
                          cx={px}
                          cy={py}
                          r="5.5"
                          fill="none"
                          stroke={isDark ? '#f8fafc' : '#000000'}
                          strokeWidth="1.6"
                        />
                      )}

                      {/* Point Label (e.g. B1, R4, D2) */}
                      <text
                        x={px + 7}
                        y={py + 3}
                        fontSize="9.5"
                        fontWeight="bold"
                        fill={isDark ? '#f1f5f9' : '#0f172a'}
                        fontFamily="system-ui, sans-serif"
                      >
                        {pt.label}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* 7. CURRENT PROJECT ROCK MASS MARKER */}
              <g
                id="current-project-marker"
                transform={`translate(${projectMarkerPos.x}, ${projectMarkerPos.y})`}
              >
                {/* Pulsing halo */}
                <circle
                  cx="0"
                  cy="0"
                  r="14"
                  fill="#f59e0b"
                  fillOpacity="0.25"
                  className="animate-ping"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="9"
                  fill="#f59e0b"
                  fillOpacity="0.4"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="4.5"
                  fill="#ffffff"
                  stroke="#d97706"
                  strokeWidth="2"
                  filter="url(#gsi-target-glow)"
                />

                {/* Floating Project Tooltip Box */}
                <g
                  transform={`translate(${
                    projectMarkerPos.x > 700 ? -165 : 14
                  }, ${projectMarkerPos.y > 600 ? -52 : 8})`}
                >
                  <rect
                    x="0"
                    y="0"
                    width="156"
                    height="46"
                    rx="8"
                    fill={isDark ? '#0b1329' : '#0f172a'}
                    fillOpacity="0.96"
                    stroke="#f59e0b"
                    strokeWidth="1.6"
                    filter="drop-shadow(0 4px 10px rgba(0,0,0,0.5))"
                  />
                  <text
                    x="78"
                    y="18"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10.5"
                    fontWeight="bold"
                    direction={isFa ? 'rtl' : 'ltr'}
                    style={{ direction: isFa ? 'rtl' : 'ltr' }}
                  >
                    {isFa ? 'توده‌سنگ پروژه' : 'Project Rock Mass'}
                  </text>
                  <text
                    x="78"
                    y="34"
                    textAnchor="middle"
                    fill="#fbbf24"
                    fontSize="9.5"
                    fontWeight="600"
                    className="font-mono"
                  >
                    {activeColumnCode} | GSI = {currentGsi}
                  </text>
                </g>
              </g>
            </g>

            {/* 8. COLUMN IDENTIFIERS BELOW GRID (D1 to D5) */}
            <g id="column-footers" transform={`translate(0, ${GRID_TOP + GRID_HEIGHT + 36})`}>
              {SURFACE_COLS.map((col, idx) => (
                <text
                  key={`footer-${col.code}`}
                  x={GRID_LEFT + (idx + 0.5) * COL_W}
                  y="0"
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="bold"
                  fill={activeCell.d === idx ? '#f59e0b' : c.textMain}
                  fontFamily="system-ui, sans-serif"
                >
                  {col.code}
                </text>
              ))}
            </g>

            {/* 9. LEGEND BOX (Exact match of Hoek & Marinos 2000 excavability chart) */}
            <g id="chart-legend" transform={`translate(75, ${GRID_TOP + GRID_HEIGHT + 15})`}>
              <rect
                x="0"
                y="0"
                width="310"
                height="62"
                rx="6"
                fill={c.cardBg}
                stroke={c.border}
                strokeWidth="1.3"
              />

              {/* Column 1 of Legend */}
              <g transform="translate(18, 16)">
                {/* Square: Blasting */}
                <rect x="0" y="0" width="9" height="9" fill={c.cardBg} stroke={c.textMain} strokeWidth="1.4" />
                <text x="18" y="8" fontSize="10" fontWeight="bold" fill={c.textMain}>
                  Blasting
                </text>

                {/* Triangle: Hammer */}
                <polygon points="4.5,16 0,25 9,25" fill={c.cardBg} stroke={c.textMain} strokeWidth="1.4" />
                <text x="18" y="24" fontSize="10" fontWeight="bold" fill={c.textMain}>
                  Hammer
                </text>

                {/* Solid Circle: Ripper (D8-D9) */}
                <circle cx="4.5" cy="38" r="4.5" fill={c.textMain} />
                <text x="18" y="41" fontSize="10" fontWeight="bold" fill={c.textMain}>
                  Ripper (D8-D9)
                </text>
              </g>

              {/* Column 2 of Legend */}
              <g transform="translate(170, 16)">
                {/* Half-filled circle: Ripper (D7) */}
                <g>
                  <circle cx="4.5" cy="8" r="4.5" fill={c.cardBg} stroke={c.textMain} strokeWidth="1.4" />
                  <path d="M 4.5 3.5 A 4.5 4.5 0 0 0 4.5 12.5 Z" fill={c.textMain} />
                </g>
                <text x="18" y="11" fontSize="10" fontWeight="bold" fill={c.textMain}>
                  Ripper (D7)
                </text>

                {/* Open circle: Digger */}
                <circle cx="4.5" cy="24" r="4.5" fill="none" stroke={c.textMain} strokeWidth="1.5" />
                <text x="18" y="27" fontSize="10" fontWeight="bold" fill={c.textMain}>
                  Digger
                </text>
              </g>
            </g>
          </svg>

          {/* Hovered Empirical Case Study Info Card */}
          {hoveredPoint && (
            <div className="mt-2 p-3 rounded-xl bg-slate-900 border border-purple-500/50 shadow-xl flex items-center justify-between gap-4 text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center font-mono">
                  {hoveredPoint.label}
                </span>
                <div>
                  <div className="font-bold text-slate-100">
                    {isFa ? hoveredPoint.nameFa : hoveredPoint.nameEn} (GSI ≈ {hoveredPoint.gsiApprox})
                  </div>
                  <div className="text-slate-400">
                    {isFa ? hoveredPoint.equipmentFa : hoveredPoint.equipmentEn}
                  </div>
                </div>
              </div>
              <div className="text-right font-mono text-[11px] text-amber-400">
                Structure: {hoveredPoint.structure} | Surface: {hoveredPoint.discontinuity}
              </div>
            </div>
          )}

          {/* 10. REFERENCE EXCAVATION METHOD TABLE (Exact match of attached image) */}
          <div className="mt-6 border-t pt-5" style={{ borderColor: c.borderLight }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-amber-400" />
                <span>
                  {isFa
                    ? 'جدول تعیین روش حفاری بر اساس مقاومت سنگ بکر و تیپ توده‌سنگ (GSI)'
                    : 'Excavation Method Decision Table based on Intact Strength & GSI Rock Mass Type'}
                </span>
              </div>
              <div className="text-[11px] text-amber-400 font-mono">
                {isFa ? 'ستون فعال توده‌سنگ:' : 'Active Rock Mass Type:'}{' '}
                <span className="font-bold underline px-1 bg-amber-500/10 rounded">
                  {activeColumnCode}
                </span>
              </div>
            </div>

            {/* The 23-column Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <table className="w-full text-[10px] sm:text-[11px] border-collapse text-center">
                <thead>
                  {/* Top Super Header */}
                  <tr className="bg-slate-900 text-slate-200 border-b border-slate-700">
                    <th
                      rowSpan={2}
                      className="p-2 border-r border-slate-700 font-bold whitespace-nowrap min-w-[90px]"
                    >
                      Intact rock
                      <br />
                      strength
                    </th>
                    <th
                      rowSpan={2}
                      className="p-2 border-r border-slate-700 font-bold whitespace-nowrap min-w-[120px]"
                    >
                      Method of
                      <br />
                      excavation
                    </th>
                    <th colSpan={21} className="p-2 font-bold text-center">
                      Rock mass type based on GSI (Structure-Discontinuity condition)
                    </th>
                  </tr>

                  {/* Sub Header (21 Columns) */}
                  <tr className="bg-slate-950 text-slate-300 border-b border-slate-700 font-mono text-[9px] sm:text-[10px]">
                    {ROCK_MASS_COLUMNS.map((col) => {
                      const isColActive = activeColumnCode === col;
                      return (
                        <th
                          key={col}
                          className={`py-1.5 px-1 border-r border-slate-800 transition-all ${
                            isColActive
                              ? 'bg-amber-500/30 text-amber-300 font-bold ring-2 ring-amber-400'
                              : ''
                          }`}
                        >
                          {col}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800 font-sans">
                  {/* Row 1: Drill & Blast or hammer */}
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td
                      rowSpan={4}
                      className="p-2 border-r border-slate-700 font-bold font-mono text-xs bg-slate-900/60"
                    >
                      Is(50) &lt; 3 MPa
                    </td>
                    <td className="p-2 text-left font-medium border-r border-slate-700 whitespace-nowrap bg-slate-900/40">
                      Drill &amp; Blast
                      <br />
                      or hammer
                    </td>
                    {ROCK_MASS_COLUMNS.map((col) => {
                      const isColActive = activeColumnCode === col;
                      const hasMark = ['S1', 'S2D1', 'S2D2', 'S2D3'].includes(col);
                      return (
                        <td
                          key={`dnb-${col}`}
                          className={`p-1.5 border-r border-slate-800/60 font-bold ${
                            hasMark ? 'bg-slate-700/80 text-white font-mono' : ''
                          } ${isColActive ? 'ring-2 ring-amber-400 font-black' : ''}`}
                        >
                          {hasMark ? 'X' : ''}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 2: Ripper (D8, D9) */}
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-2 text-left font-medium border-r border-slate-700 whitespace-nowrap bg-slate-900/40">
                      Ripper (D8, D9)
                    </td>
                    {ROCK_MASS_COLUMNS.map((col) => {
                      const isColActive = activeColumnCode === col;
                      const hasMark = [
                        'S2D3',
                        'S2D4',
                        'S2D5',
                        'S3D1',
                        'S3D2',
                        'S3D3',
                        'S3D4',
                        'S4D2',
                        'S4D3',
                      ].includes(col);
                      return (
                        <td
                          key={`rip89-${col}`}
                          className={`p-1.5 border-r border-slate-800/60 font-bold ${
                            hasMark ? 'bg-slate-700/80 text-white font-mono' : ''
                          } ${isColActive ? 'ring-2 ring-amber-400 font-black' : ''}`}
                        >
                          {hasMark ? 'X' : ''}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 3: Ripper (D7) */}
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-2 text-left font-medium border-r border-slate-700 whitespace-nowrap bg-slate-900/40">
                      Ripper (D7)
                    </td>
                    {ROCK_MASS_COLUMNS.map((col) => {
                      const isColActive = activeColumnCode === col;
                      const hasMark = ['S3D3', 'S3D4', 'S3D5'].includes(col);
                      return (
                        <td
                          key={`rip7-${col}`}
                          className={`p-1.5 border-r border-slate-800/60 font-bold ${
                            hasMark ? 'bg-slate-700/80 text-white font-mono' : ''
                          } ${isColActive ? 'ring-2 ring-amber-400 font-black' : ''}`}
                        >
                          {hasMark ? 'X' : ''}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 4: Digging */}
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-2 text-left font-medium border-r border-slate-700 whitespace-nowrap bg-slate-900/40">
                      Digging
                    </td>
                    {ROCK_MASS_COLUMNS.map((col) => {
                      const isColActive = activeColumnCode === col;
                      const hasMark = ['S4D4', 'S4D5', 'S5D3', 'S5D4', 'S5D5'].includes(col);
                      return (
                        <td
                          key={`dig-${col}`}
                          className={`p-1.5 border-r border-slate-800/60 font-bold ${
                            hasMark ? 'bg-slate-700/80 text-white font-mono' : ''
                          } ${isColActive ? 'ring-2 ring-amber-400 font-black' : ''}`}
                        >
                          {hasMark ? 'X' : ''}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Diagnostic Recommendation Summary */}
          <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-400">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-100">
                  {isFa ? 'روش پیشنهادی برای پروژه:' : 'Recommended Method for Project:'}
                </span>{' '}
                <span className="text-amber-300 font-semibold">
                  {activeMethods.isDrillAndBlast && (isFa ? 'چالزنی و آتشباری یا چکش هیدرولیکی (D&B / Hammer)' : 'Drill & Blast or Hammer')}
                  {activeMethods.isRipperD8D9 && (isFa ? ' / ریپرزنی سنگین با بولدوزر CAT D8-D9' : ' / Heavy Ripping with CAT D8-D9')}
                  {activeMethods.isRipperD7 && (isFa ? ' / ریپرزنی با بولدوزر CAT D7' : ' / Medium Ripping with CAT D7')}
                  {activeMethods.isDigging && (isFa ? ' / کندن مستقیم مکانیکی با باکت بیل (Digging)' : ' / Direct Mechanical Digging')}
                  {!activeMethods.isDrillAndBlast &&
                    !activeMethods.isRipperD8D9 &&
                    !activeMethods.isRipperD7 &&
                    !activeMethods.isDigging &&
                    (isFa ? 'ریپرزنی با تجهیزات سنگین یا آتشباری ملایم' : 'Heavy Ripping or Controlled Blasting')}
                </span>
              </div>
            </div>

            <div className="text-slate-400 text-[11px] font-mono">
              UCS = {currentUcs} MPa | Is(50) ≈ {pointLoadIs50} MPa | GSI = {currentGsi}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
