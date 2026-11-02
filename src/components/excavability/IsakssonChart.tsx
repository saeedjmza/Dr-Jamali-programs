import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  Flame,
  Pickaxe,
  Info,
  Sliders,
  CheckCircle2,
  Crosshair,
  FileText,
  Sparkles,
  AlertTriangle,
  Gauge,
  HelpCircle,
} from 'lucide-react';

export type AbrasivityLevel = 'low' | 'medium' | 'high' | 'very_high';

export interface IsakssonChartProps {
  currentUcs: number; // MPa
  onUpdateUcs: (val: number) => void;
  lang: 'fa' | 'en';
}

interface RockPreset {
  id: string;
  nameFa: string;
  nameEn: string;
  ucs: number;
  abrasivity: AbrasivityLevel;
  caiApprox: number;
  descFa: string;
}

export const IsakssonChart: React.FC<IsakssonChartProps> = ({
  currentUcs,
  onUpdateUcs,
  lang,
}) => {
  const isFa = lang === 'fa';
  const svgRef = useRef<SVGSVGElement | null>(null);

  // View style: 'paper' (faithful reproduction of scanned publication) or 'engineering' (color-coded dark UI)
  const [viewTheme, setViewTheme] = useState<'paper' | 'engineering'>('paper');

  // Abrasivity state: low (0), medium (1), high (2), very_high (3)
  const [abrasivity, setAbrasivity] = useState<AbrasivityLevel>('medium');
  const [caiValue, setCaiValue] = useState<number>(2.0); // Cerchar Abrasivity Index (0.5 to 4.5)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(true);

  // SVG Chart Boundaries
  const SVG_WIDTH = 680;
  const SVG_HEIGHT = 500;

  const X_AXIS_START = 100; // x = 0 MPa
  const X_AXIS_END = 580; // x = 400 MPa
  const X_SPAN_PX = X_AXIS_END - X_AXIS_START; // 480 px for 400 MPa -> 1.2 px/MPa
  const X_ARROW_END = 625;

  const Y_BOTTOM = 390; // Level 'کم' (Low)
  const Y_MEDIUM = 300; // Level 'متوسط' (Medium)
  const Y_HIGH = 210; // Level 'زیاد' (High)
  const Y_VERY_HIGH = 120; // Level 'خیلی زیاد' (Very High)
  const Y_ARROW_TOP = 70; // Top of Y axis

  // Mapping Abrasivity enum to numerical continuous value [0..3]
  const getAbrasivityNum = useCallback((level: AbrasivityLevel): number => {
    switch (level) {
      case 'low':
        return 0.0;
      case 'medium':
        return 1.0;
      case 'high':
        return 2.0;
      case 'very_high':
        return 3.0;
    }
  }, []);

  const numAbrasivity = useMemo(() => {
    return getAbrasivityNum(abrasivity);
  }, [abrasivity, getAbrasivityNum]);

  // Coordinate transforms
  const getSvgX = useCallback(
    (ucsVal: number) => {
      const safe = Math.max(0, Math.min(420, ucsVal));
      return X_AXIS_START + (safe / 400) * X_SPAN_PX;
    },
    [X_AXIS_START, X_SPAN_PX]
  );

  const getSvgY = useCallback(
    (abrVal: number) => {
      // abrVal ranges 0 (low) to 3 (very high)
      const clamped = Math.max(0, Math.min(3, abrVal));
      // Y decreases as abrVal increases
      return Y_BOTTOM - (clamped / 3) * (Y_BOTTOM - Y_VERY_HIGH);
    },
    [Y_BOTTOM, Y_VERY_HIGH]
  );

  // Curve 1: Roadheader upper limit boundary σ_c as function of abrasivity [0..3]
  // In the chart:
  // at abr <= 1.0: 110 MPa (vertical)
  // at abr = 2.0: ~88 MPa (curving left)
  // at abr = 3.0: ~76 MPa (curving left)
  const getRoadheaderLimit = useCallback((abr: number): number => {
    if (abr <= 1.0) {
      return 110;
    }
    if (abr <= 2.0) {
      // Smooth transition from 110 to 88
      const t = abr - 1.0;
      return 110 - t * 22;
    }
    // From 2.0 to 3.0: 88 to 76
    const t = abr - 2.0;
    return 88 - t * 12;
  }, []);

  // Curve 2: Drill & Blast upper limit boundary σ_c as function of abrasivity [0..3]
  // In the chart:
  // at abr <= 1.0: 380 MPa (vertical)
  // at abr > 1.0: diagonal slope from (380, medium) to (330, very high)
  const getBlastLimit = useCallback((abr: number): number => {
    if (abr <= 1.0) {
      return 380;
    }
    const t = (abr - 1.0) / 2.0; // 0 to 1
    return 380 - t * 50; // 380 down to 330
  }, []);

  // Critical points for SVG paths
  const p0_low_x = getSvgX(0); // 100
  const p0_low_y = Y_BOTTOM; // 390
  const p0_top_y = Y_VERY_HIGH; // 120

  const p_rh_bottom_x = getSvgX(110); // ~232
  const p_rh_medium_x = getSvgX(110); // ~232
  const p_rh_high_x = getSvgX(88); // ~205.6
  const p_rh_top_x = getSvgX(76); // ~191.2

  const p_db_bottom_x = getSvgX(380); // ~556
  const p_db_medium_x = getSvgX(380); // ~556
  const p_db_top_x = getSvgX(330); // ~496

  // Path for Roadheader zone (Horizontal hatching)
  // Starts at (0, bottom) -> (110, bottom) -> (110, medium) -> curve to (88, high) -> curve to (76, top) -> (0, top) -> close
  const roadheaderPath = `
    M ${p0_low_x},${p0_low_y}
    L ${p_rh_bottom_x},${p0_low_y}
    L ${p_rh_medium_x},${Y_MEDIUM}
    C ${p_rh_medium_x},${Y_MEDIUM - 35} ${p_rh_high_x + 5},${Y_HIGH + 35} ${p_rh_high_x},${Y_HIGH}
    C ${p_rh_high_x - 5},${Y_HIGH - 35} ${p_rh_top_x + 3},${Y_VERY_HIGH + 35} ${p_rh_top_x},${Y_VERY_HIGH}
    L ${p0_low_x},${p0_top_y}
    Z
  `;

  // Path for Drill and Blast zone (Diagonal hatching)
  // Left border abuts Roadheader zone:
  // Starts at (110, bottom) -> (380, bottom) -> (380, medium) -> slanting to (330, top) ->
  // (76, top) -> down along the roadheader curve back to (110, bottom)
  const drillBlastPath = `
    M ${p_rh_bottom_x},${p0_low_y}
    L ${p_db_bottom_x},${p0_low_y}
    L ${p_db_medium_x},${Y_MEDIUM}
    L ${p_db_top_x},${Y_VERY_HIGH}
    L ${p_rh_top_x},${Y_VERY_HIGH}
    C ${p_rh_top_x + 3},${Y_VERY_HIGH + 35} ${p_rh_high_x - 5},${Y_HIGH - 35} ${p_rh_high_x},${Y_HIGH}
    C ${p_rh_high_x + 5},${Y_HIGH + 35} ${p_rh_medium_x},${Y_MEDIUM - 35} ${p_rh_medium_x},${Y_MEDIUM}
    Z
  `;

  // Determine current project zone
  const currentRhLimit = getRoadheaderLimit(numAbrasivity);
  const currentDbLimit = getBlastLimit(numAbrasivity);

  const isRoadheaderZone = currentUcs <= currentRhLimit;
  const isDrillBlastZone = currentUcs > currentRhLimit && currentUcs <= currentDbLimit;
  const isExtremeZone = currentUcs > currentDbLimit;

  // Diagnostics & Machinery recommendation
  const diagnostic = useMemo(() => {
    if (isRoadheaderZone) {
      const pickWearClassFa =
        abrasivity === 'very_high'
          ? 'بسیار شدید (سایش ناخن بحرانی، نیاز به بازرسی ساعتی)'
          : abrasivity === 'high'
          ? 'بالا (تعویض مکرر ناخن‌های برشی در هر شیفت)'
          : abrasivity === 'medium'
          ? 'متوسط و قابل قبول با ناخن‌های تنگستن کاربید سنگین'
          : 'بسیار کم و سایش ناچیز؛ راندمان اقتصادی حداکثری';

      const pickWearClassEn =
        abrasivity === 'very_high'
          ? 'Very High (Critical pick wear, hourly inspection needed)'
          : abrasivity === 'high'
          ? 'High (Frequent pick replacement each shift)'
          : abrasivity === 'medium'
          ? 'Medium and acceptable with heavy-duty tungsten carbide picks'
          : 'Very Low; negligible wear and maximum economic efficiency';

      const estAdvanceFa = currentUcs < 40 ? '۱۵ تا ۲۵ m³/h' : currentUcs < 75 ? '۸ تا ۱۵ m³/h' : '۴ تا ۸ m³/h';
      const estAdvanceEn = currentUcs < 40 ? '15 - 25 m³/h' : currentUcs < 75 ? '8 - 15 m³/h' : '4 - 8 m³/h';

      const pickWearRate =
        abrasivity === 'very_high'
          ? '۰٫۸ تا ۱٫۵ ناخن بر مترمکعب'
          : abrasivity === 'high'
          ? '۰٫۳ تا ۰٫۷ ناخن بر مترمکعب'
          : abrasivity === 'medium'
          ? '۰٫۱ تا ۰٫۳ ناخن بر مترمکعب'
          : 'کمتر از ۰٫۰۵ ناخن بر مترمکعب';

      return {
        zone: 'roadheader',
        titleFa: 'محدوده مجاز و اقتصادی رودهدر (Roadheader Excavation)',
        titleEn: 'Roadheader Applicable Zone',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        textColor: 'text-amber-400',
        descFa:
          'مقاومت فشاری و سایندگی توده‌سنگ در محدوده مجاز حفر مکانیکی با رودهدر (ماشین کله‌گاوی نقطه‌زن) قرار دارد. پروفیل حفاری دقیق، بدون ارتعاشات تخریبی ناشی از آتشباری و حداقل میزان اضافه حفاری (Overbreak) حاصل می‌شود.',
        descEn:
          'Rock compressive strength and abrasivity permit mechanical roadheader cutting with acceptable pick consumption and high profile accuracy.',
        pickWearClass: pickWearClassFa,
        pickWearClassFa,
        pickWearClassEn,
        pickWearRate,
        estAdvance: estAdvanceFa,
        estAdvanceFa,
        estAdvanceEn,
        recommendedEquipmentFa:
          currentUcs > 70
            ? 'رودهدر فوق‌سنگین بوم‌دار (Heavy Duty Roadheader با توان کله‌برشی بیش از ۳۰۰ کیلووات و ناخن‌های مخروطی ۷۰ میلی‌متری)'
            : 'رودهدر استاندارد تونلی (Medium/Heavy Roadheader با توان ۲۰۰ تا ۳۰۰ کیلووات)',
        recommendedEquipmentEn:
          currentUcs > 70
            ? 'Heavy-duty boom roadheader (>300 kW cutterhead power, 70mm conical picks)'
            : 'Standard tunneling roadheader (200 - 300 kW power)',
      };
    } else if (isDrillBlastZone) {
      const drillabilityFa =
        currentUcs > 200
          ? 'چالزنی سنگین؛ مصرف بالای مته، راد و هوا/آب شستشو'
          : 'چالزنی استاندارد و سرعت نفوذ نرمال جامبو دریل';
      const drillabilityEn =
        currentUcs > 200
          ? 'Heavy drilling; high bit/rod consumption'
          : 'Standard drilling with normal penetration rate';

      return {
        zone: 'drill_blast',
        titleFa: 'محدوده استاندارد چالزنی و آتشباری (Drill & Blast Zone)',
        titleEn: 'Drill & Blast Standard Zone',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        textColor: 'text-rose-400',
        descFa:
          'به دلیل مقاومت فشاری بالا (σc > حد برش رودهدر) و/یا سایندگی شدید، استفاده از رودهدر از نظر اقتصادی و فنی غیرقابل توجیه است (سایش فاجعه‌بار ناخن‌ها و افت شدید سرعت نفوذ). روش استاندارد، بهینه و اقتصادی در این گستره، چالزنی با جامبودریل و آتشباری کنترل‌شده (Smooth Blasting) است.',
        descEn:
          'Due to high compressive strength and excessive tool wear, roadheader excavation is uneconomic. Conventional Drill & Blast is the recommended method.',
        pickWearClass: 'سایش سرمته چالزنی: ' + drillabilityFa,
        pickWearClassFa: 'سایش سرمته چالزنی: ' + drillabilityFa,
        pickWearClassEn: 'Drill bit wear: ' + drillabilityEn,
        pickWearRate: currentUcs > 200 ? 'تعویض مته هر ۶۰ تا ۱۲۰ متر چالزنی' : 'تعویض مته هر ۱۲۰ تا ۲۵۰ متر چالزنی',
        estAdvance: '۱٫۸ تا ۳٫۵ متر پیشروی در هر راند آتشباری',
        estAdvanceFa: '۱٫۸ تا ۳٫۵ متر پیشروی در هر راند آتشباری',
        estAdvanceEn: '1.8 - 3.5 m advance per blast round',
        recommendedEquipmentFa:
          'جامبو دریل هیدرولیکی دو یا سه بازو (Jumbo Drill) + ماده منفجره امولسیون/آنفو + بولدوزر و لودر تونلی بارگیری',
        recommendedEquipmentEn:
          '2 or 3-boom hydraulic jumbo drill + emulsion/ANFO explosives + tunneling mucking loader',
      };
    } else {
      return {
        zone: 'extreme',
        titleFa: 'فراتر از محدوده متداول (سنگ‌های فرابسیار سخت و ساینده)',
        titleEn: 'Extreme Rock Strength / High Wear Boundary',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        textColor: 'text-purple-400',
        descFa:
          'مقاومت فشاری تک‌محوری سنگ بیش از ۳۳۰ الی ۳۸۰ مگاپاسکال بوده و نیازمند آرایش چالزنی فوق فشرده، متراژ چالزنی ویژه بالا (SD > 3.0 m/m³) و خرج‌های سنگین تقویتی کف و برش است. در صورت تونل‌زنی مکانیزه بلند، تنها TBM با دیسک‌کاتر‌های فولادی سنگین ۱۷ یا ۱۹ اینچی کارایی دارد.',
        descEn:
          'Rock exceeds standard excavability envelopes; requires ultra-dense blast patterns or specialized hard-rock TBM cutters.',
        pickWearClass: 'سایش سرمته فوق‌العاده سریع (کمتر از ۵۰ متر به ازای هر سرمته)',
        pickWearClassFa: 'سایش سرمته فوق‌العاده سریع (کمتر از ۵۰ متر به ازای هر سرمته)',
        pickWearClassEn: 'Extremely high bit wear (< 50 m per drill bit)',
        pickWearRate: 'مستهلک شدن مداوم ادوات حفاری',
        estAdvance: 'پیشروی کند و نیازمند الگوهای برش بادبزنی یا گُوه‌ای تقویتی',
        estAdvanceFa: 'پیشروی کند و نیازمند الگوهای برش بادبزنی یا گُوه‌ای تقویتی',
        estAdvanceEn: 'Slow advance; requires reinforced wedge cut patterns',
        recommendedEquipmentFa:
          'سرمته‌های کاربید تنگستن فوق‌سخت با زاویه حمله ویژه، ژل‌های دینامیت تقویتی و چکش‌های ضربه‌ای سنگین',
        recommendedEquipmentEn:
          'Ultra-hard tungsten carbide drill bits, high-energy dynamite booster cartridges, and heavy breakers',
      };
    }
  }, [isRoadheaderZone, isDrillBlastZone, abrasivity, currentUcs]);

  // Click on SVG to interactively position UCS & Abrasivity
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixel to viewBox
    const scaleX = SVG_WIDTH / rect.width;
    const scaleY = SVG_HEIGHT / rect.height;
    const vbX = clickX * scaleX;
    const vbY = clickY * scaleY;

    // Calculate UCS from vbX
    const ucsCandidate = Math.max(0, Math.min(400, ((vbX - X_AXIS_START) / X_SPAN_PX) * 400));
    onUpdateUcs(Math.round(ucsCandidate));

    // Calculate Abrasivity level from vbY
    // vbY spans Y_BOTTOM (390) down to Y_VERY_HIGH (120)
    const normalizedY = (Y_BOTTOM - vbY) / (Y_BOTTOM - Y_VERY_HIGH); // 0 at bottom, 1 at top
    const abrContinuous = Math.max(0, Math.min(3, normalizedY * 3));

    if (abrContinuous < 0.6) {
      setAbrasivity('low');
      setCaiValue(1.0);
    } else if (abrContinuous < 1.6) {
      setAbrasivity('medium');
      setCaiValue(2.0);
    } else if (abrContinuous < 2.5) {
      setAbrasivity('high');
      setCaiValue(3.0);
    } else {
      setAbrasivity('very_high');
      setCaiValue(4.0);
    }
  };

  // Preset rock scenarios
  const rockPresets: RockPreset[] = [
    {
      id: 'marl',
      nameFa: 'مارن و شیل رسوبی سست (Soft Marl)',
      nameEn: 'Soft Marl / Shale',
      ucs: 25,
      abrasivity: 'low',
      caiApprox: 0.8,
      descFa: 'حفر مداوم و پرسرعت با رودهدر سبک یا متوسط با حداقل سایش ناخن',
    },
    {
      id: 'sandstone_med',
      nameFa: 'ماسه‌سنگ سیلیسی با پیوند متوسط',
      nameEn: 'Siliceous Sandstone',
      ucs: 70,
      abrasivity: 'high',
      caiApprox: 3.1,
      descFa: 'نزدیک به مرز بحرانی برش رودهدر؛ نیازمند بررسی دقیق هزینه تعویض ناخن',
    },
    {
      id: 'limestone_hard',
      nameFa: 'سنگ‌آهک متراکم کارستی (Dense Limestone)',
      nameEn: 'Dense Limestone',
      ucs: 135,
      abrasivity: 'medium',
      caiApprox: 1.8,
      descFa: 'فراتر از حد برش رودهدر؛ چالزنی و آتشباری استاندارد اقتصادی‌ترین گزینه',
    },
    {
      id: 'granite_hard',
      nameFa: 'گرانیت سخت و ساینده (Hard Granite)',
      nameEn: 'Hard Granite',
      ucs: 220,
      abrasivity: 'very_high',
      caiApprox: 4.2,
      descFa: 'چالزنی سنگین با جامبودریل؛ مصرف مته بالا؛ آتشباری با خرج ویژه q > 1.8',
    },
    {
      id: 'quartzite_ultra',
      nameFa: 'کوارتزیت یکپارچه فوق‌سخت (Massive Quartzite)',
      nameEn: 'Massive Quartzite',
      ucs: 350,
      abrasivity: 'very_high',
      caiApprox: 4.8,
      descFa: 'سقف مقاومت سنگ برای آتشباری؛ نیازمند چال‌های متراکم و خرج‌های تقویتی',
    },
  ];

  const applyPreset = (preset: RockPreset) => {
    onUpdateUcs(preset.ucs);
    setAbrasivity(preset.abrasivity);
    setCaiValue(preset.caiApprox);
  };

  // Color schemes for Paper vs Engineering modes
  const isPaper = viewTheme === 'paper';

  const chartBg = isPaper ? 'bg-white' : 'bg-slate-950';
  const axisColor = isPaper ? '#1e293b' : '#94a3b8';
  const tickTextColor = isPaper ? '#334155' : '#cbd5e1';
  const hatchStrokeRh = isPaper ? '#0f172a' : '#f59e0b';
  const hatchStrokeDb = isPaper ? '#0f172a' : '#f43f5e';
  const polyFillRh = isPaper ? 'rgba(255,255,255,0.01)' : 'rgba(245, 158, 11, 0.08)';
  const polyFillDb = isPaper ? 'rgba(255,255,255,0.01)' : 'rgba(244, 63, 94, 0.08)';

  // Current project point in SVG coordinates
  const currentProjectSvgX = getSvgX(currentUcs);
  const currentProjectSvgY = getSvgY(numAbrasivity);

  return (
    <div className="space-y-4">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-slate-100">
              {isFa
                ? 'نمودار انتخاب روش حفاری رودهدر در برابر آتشباری (روش Isakson)'
                : 'Isakson Excavability Chart: Roadheader vs. Drill & Blast'}
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            {isFa
              ? 'بازسازی دقیق نمودار پیوست: مرز کاربرد فنی-اقتصادی ماشین رودهدر بر اساس مقاومت فشاری تک‌محوری (σc) و سایندگی سنگ'
              : 'Exact reconstruction of Isakson selection envelope based on UCS (σc) and Abrasivity levels.'}
          </p>
        </div>

        {/* Action Toggles: Paper Mode vs Engineering Dark */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setViewTheme('paper')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                isPaper
                  ? 'bg-slate-100 text-slate-900 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isFa ? 'نمای مقاله اصلی (Paper)' : 'Original Paper'}</span>
            </button>
            <button
              onClick={() => setViewTheme('engineering')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                !isPaper
                  ? 'bg-rose-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isFa ? 'نمای مهندسی تیره' : 'Dark Engineering'}</span>
            </button>
          </div>

          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title={isFa ? 'نمایش/مخفی‌سازی راهنمای فنی' : 'Toggle technical guide'}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Chart Canvas & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left / Center Column: SVG Chart (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div
            className={`w-full relative rounded-2xl border ${
              isPaper
                ? 'border-slate-300 bg-white shadow-xl shadow-slate-200/50'
                : 'border-slate-800 bg-slate-950 shadow-2xl'
            } overflow-hidden p-2 sm:p-4`}
          >
            {/* Paper texture badge if in paper mode */}
            {isPaper && (
              <div className="absolute top-3 left-4 text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                Isakson / Bilgin & Gehring (2002) Standard Envelope
              </div>
            )}

            {/* Click instruction hint */}
            <div
              className={`text-center text-[11px] mb-2 ${
                isPaper ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {isFa
                ? '💡 می‌توانید با کلیک روی هر نقطه از نمودار، مقاومت فشاری و رده سایندگی پروژه را مستقیماً تنظیم نمایید.'
                : '💡 Click anywhere on the chart to interactively set rock UCS (σc) and Abrasivity.'}
            </div>

            {/* SVG Visual Representation */}
            <svg
              ref={svgRef}
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              onClick={handleSvgClick}
              className="w-full h-auto cursor-crosshair select-none"
              style={{ maxHeight: '540px' }}
            >
              <defs>
                {/* 1. Horizontal Hatching for Roadheader (رودهدر) - exactly matching the attached paper drawing */}
                <pattern
                  id="isaksson-roadheader-hatch"
                  width="10"
                  height="7"
                  patternUnits="userSpaceOnUse"
                >
                  <line
                    x1="0"
                    y1="3.5"
                    x2="10"
                    y2="3.5"
                    stroke={hatchStrokeRh}
                    strokeWidth={isPaper ? '1.4' : '1.3'}
                  />
                </pattern>

                {/* 2. 45-degree Diagonal Hatching for Drill and Blast (چالزنی و آتشباری) - matching the drawing */}
                <pattern
                  id="isaksson-blast-hatch"
                  width="12"
                  height="12"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="12"
                    stroke={hatchStrokeDb}
                    strokeWidth={isPaper ? '1.4' : '1.3'}
                  />
                </pattern>

                {/* Arrowhead marker for axes */}
                <marker
                  id="axis-arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill={axisColor} />
                </marker>

                {/* Arrowhead marker for zone labels */}
                <marker
                  id="label-arrow-down"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="8"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 1 0 L 5 8 L 9 0 z" fill={isPaper ? '#0f172a' : '#f87171'} />
                </marker>
              </defs>

              {/* Optional Subtle Grid lines in Engineering mode */}
              {!isPaper && (
                <g stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3">
                  <line x1={X_AXIS_START} y1={Y_MEDIUM} x2={X_AXIS_END} y2={Y_MEDIUM} />
                  <line x1={X_AXIS_START} y1={Y_HIGH} x2={X_AXIS_END} y2={Y_HIGH} />
                  <line x1={X_AXIS_START} y1={Y_VERY_HIGH} x2={X_AXIS_END} y2={Y_VERY_HIGH} />
                  <line x1={getSvgX(50)} y1={Y_BOTTOM} x2={getSvgX(50)} y2={Y_VERY_HIGH} />
                  <line x1={getSvgX(100)} y1={Y_BOTTOM} x2={getSvgX(100)} y2={Y_VERY_HIGH} />
                  <line x1={getSvgX(200)} y1={Y_BOTTOM} x2={getSvgX(200)} y2={Y_VERY_HIGH} />
                  <line x1={getSvgX(300)} y1={Y_BOTTOM} x2={getSvgX(300)} y2={Y_VERY_HIGH} />
                </g>
              )}

              {/* Zone 1: Roadheader Polygon (Horizontal Hatching) */}
              <path
                d={roadheaderPath}
                fill={polyFillRh}
                stroke="none"
              />
              <path
                d={roadheaderPath}
                fill="url(#isaksson-roadheader-hatch)"
                stroke={isPaper ? '#0f172a' : '#f59e0b'}
                strokeWidth={isPaper ? '1.8' : '1.5'}
              />

              {/* Zone 2: Drill & Blast Polygon (Diagonal 45-deg Hatching) */}
              <path
                d={drillBlastPath}
                fill={polyFillDb}
                stroke="none"
              />
              <path
                d={drillBlastPath}
                fill="url(#isaksson-blast-hatch)"
                stroke={isPaper ? '#0f172a' : '#f43f5e'}
                strokeWidth={isPaper ? '1.8' : '1.5'}
              />

              {/* AXIS LINES */}
              {/* Vertical Y-Axis (سایندگی) */}
              <line
                x1={X_AXIS_START}
                y1={Y_BOTTOM}
                x2={X_AXIS_START}
                y2={Y_ARROW_TOP}
                stroke={axisColor}
                strokeWidth="2"
                markerEnd="url(#axis-arrow)"
              />

              {/* Horizontal X-Axis (مقاومت فشاری) */}
              <line
                x1={X_AXIS_START}
                y1={Y_BOTTOM}
                x2={X_ARROW_END}
                y2={Y_BOTTOM}
                stroke={axisColor}
                strokeWidth="2"
                markerEnd="url(#axis-arrow)"
              />

              {/* Y-AXIS LABELS & TICKS (سایندگی) */}
              {/* Y Axis Title at Top */}
              <text
                x={X_AXIS_START}
                y={Y_ARROW_TOP - 20}
                textAnchor="middle"
                fontSize="15"
                fontWeight="bold"
                fill={isPaper ? '#0f172a' : '#f8fafc'}
                fontFamily="Vazirmatn, Tahoma, sans-serif"
              >
                {isFa ? 'سایندگی' : 'Abrasivity'}
              </text>
              <text
                x={X_AXIS_START}
                y={Y_ARROW_TOP - 5}
                textAnchor="middle"
                fontSize="10"
                fill={isPaper ? '#64748b' : '#94a3b8'}
                fontFamily="sans-serif"
              >
                (Abrasivity Index)
              </text>

              {/* Y-Axis Level 4: خیلی زیاد */}
              <line
                x1={X_AXIS_START - 6}
                y1={Y_VERY_HIGH}
                x2={X_AXIS_START}
                y2={Y_VERY_HIGH}
                stroke={axisColor}
                strokeWidth="1.5"
              />
              <text
                x={X_AXIS_START - 14}
                y={Y_VERY_HIGH + 5}
                textAnchor="end"
                fontSize="13"
                fontWeight="bold"
                fill={abrasivity === 'very_high' ? (isPaper ? '#b91c1c' : '#f87171') : tickTextColor}
                fontFamily="Vazirmatn, Tahoma, sans-serif"
              >
                {isFa ? 'خیلی زیاد' : 'Very High'}
              </text>

              {/* Y-Axis Level 3: زیاد */}
              <line
                x1={X_AXIS_START - 6}
                y1={Y_HIGH}
                x2={X_AXIS_START}
                y2={Y_HIGH}
                stroke={axisColor}
                strokeWidth="1.5"
              />
              <text
                x={X_AXIS_START - 14}
                y={Y_HIGH + 5}
                textAnchor="end"
                fontSize="13"
                fontWeight="bold"
                fill={abrasivity === 'high' ? (isPaper ? '#b91c1c' : '#f87171') : tickTextColor}
                fontFamily="Vazirmatn, Tahoma, sans-serif"
              >
                {isFa ? 'زیاد' : 'High'}
              </text>

              {/* Y-Axis Level 2: متوسط */}
              <line
                x1={X_AXIS_START - 6}
                y1={Y_MEDIUM}
                x2={X_AXIS_START}
                y2={Y_MEDIUM}
                stroke={axisColor}
                strokeWidth="1.5"
              />
              <text
                x={X_AXIS_START - 14}
                y={Y_MEDIUM + 5}
                textAnchor="end"
                fontSize="13"
                fontWeight="bold"
                fill={abrasivity === 'medium' ? (isPaper ? '#b91c1c' : '#f87171') : tickTextColor}
                fontFamily="Vazirmatn, Tahoma, sans-serif"
              >
                {isFa ? 'متوسط' : 'Medium'}
              </text>

              {/* Y-Axis Level 1: کم */}
              <line
                x1={X_AXIS_START - 6}
                y1={Y_BOTTOM}
                x2={X_AXIS_START}
                y2={Y_BOTTOM}
                stroke={axisColor}
                strokeWidth="1.5"
              />
              <text
                x={X_AXIS_START - 14}
                y={Y_BOTTOM + 5}
                textAnchor="end"
                fontSize="13"
                fontWeight="bold"
                fill={abrasivity === 'low' ? (isPaper ? '#b91c1c' : '#f87171') : tickTextColor}
                fontFamily="Vazirmatn, Tahoma, sans-serif"
              >
                {isFa ? 'کم' : 'Low'}
              </text>

              {/* X-AXIS LABELS & TICKS (مقاومت فشاری) */}
              {[
                { ucs: 0, label: '0' },
                { ucs: 50, label: '50' },
                { ucs: 100, label: '100' },
                { ucs: 200, label: '200' },
                { ucs: 300, label: '300' },
                { ucs: 400, label: '400' },
              ].map((tick) => {
                const px = getSvgX(tick.ucs);
                return (
                  <g key={tick.ucs}>
                    <line
                      x1={px}
                      y1={Y_BOTTOM}
                      x2={px}
                      y2={Y_BOTTOM + 6}
                      stroke={axisColor}
                      strokeWidth="1.5"
                    />
                    <text
                      x={px}
                      y={Y_BOTTOM + 22}
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="bold"
                      fill={tickTextColor}
                      fontFamily="Arial, sans-serif"
                    >
                      {tick.label}
                    </text>
                  </g>
                );
              })}

              {/* X-Axis Main Title: مقاومت فشاری σc [Mpa] */}
              <text
                x={X_AXIS_END}
                y={Y_BOTTOM + 55}
                textAnchor="end"
                fontSize="16"
                fontWeight="bold"
                fill={isPaper ? '#0f172a' : '#f8fafc'}
                fontFamily="Vazirmatn, Tahoma, sans-serif"
              >
                {isFa ? 'مقاومت فشاری σc [MPa]' : 'Compressive Strength σc [MPa]'}
              </text>

              {/* CALLOUT ARROWS & TITLES MATCHING THE REFERENCE IMAGE */}
              {/* 1. Roadheader Label & Arrow */}
              <g>
                <text
                  x={145}
                  y={68}
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="bold"
                  fill={isPaper ? '#0f172a' : '#fbbf24'}
                  fontFamily="Vazirmatn, Tahoma, sans-serif"
                >
                  {isFa ? 'رودهدر' : 'Roadheader'}
                </text>
                <line
                  x1={145}
                  y1={75}
                  x2={145}
                  y2={114}
                  stroke={isPaper ? '#0f172a' : '#fbbf24'}
                  strokeWidth="1.8"
                  markerEnd="url(#label-arrow-down)"
                />
              </g>

              {/* 2. Drill & Blast Label & Arrow */}
              <g>
                <text
                  x={335}
                  y={68}
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="bold"
                  fill={isPaper ? '#0f172a' : '#fb7185'}
                  fontFamily="Vazirmatn, Tahoma, sans-serif"
                >
                  {isFa ? 'چالزنی و آتشباری' : 'Drill & Blast'}
                </text>
                <line
                  x1={335}
                  y1={75}
                  x2={335}
                  y2={114}
                  stroke={isPaper ? '#0f172a' : '#fb7185'}
                  strokeWidth="1.8"
                  markerEnd="url(#label-arrow-down)"
                />
              </g>

              {/* CURRENT PROJECT ROCK MARKER (PULSING TARGET) */}
              <g>
                {/* Dashed projections to axes */}
                <line
                  x1={X_AXIS_START}
                  y1={currentProjectSvgY}
                  x2={currentProjectSvgX}
                  y2={currentProjectSvgY}
                  stroke={isPaper ? '#dc2626' : '#38bdf8'}
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                />
                <line
                  x1={currentProjectSvgX}
                  y1={Y_BOTTOM}
                  x2={currentProjectSvgX}
                  y2={currentProjectSvgY}
                  stroke={isPaper ? '#dc2626' : '#38bdf8'}
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                />

                {/* Outer animated ring */}
                <circle
                  cx={currentProjectSvgX}
                  cy={currentProjectSvgY}
                  r="13"
                  fill={isPaper ? 'rgba(220, 38, 38, 0.2)' : 'rgba(56, 189, 248, 0.25)'}
                  stroke={isPaper ? '#dc2626' : '#38bdf8'}
                  strokeWidth="1.5"
                  className="animate-ping origin-center"
                />

                {/* Main pointer circle */}
                <circle
                  cx={currentProjectSvgX}
                  cy={currentProjectSvgY}
                  r="7.5"
                  fill={isPaper ? '#dc2626' : '#0284c7'}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />

                {/* Small Center point */}
                <circle
                  cx={currentProjectSvgX}
                  cy={currentProjectSvgY}
                  r="2.5"
                  fill="#ffffff"
                />

                {/* Floating pill label showing project parameters */}
                <g
                  transform={`translate(${
                    currentProjectSvgX > 400
                      ? currentProjectSvgX - 165
                      : currentProjectSvgX + 15
                  }, ${currentProjectSvgY > 300 ? currentProjectSvgY - 42 : currentProjectSvgY - 20})`}
                >
                  <rect
                    width="150"
                    height="38"
                    rx="8"
                    fill={isPaper ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.95)'}
                    stroke={isPaper ? '#dc2626' : '#38bdf8'}
                    strokeWidth="1.5"
                    className="shadow-md"
                  />
                  <text
                    x="75"
                    y="16"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#f8fafc"
                    fontFamily="Vazirmatn, sans-serif"
                  >
                    {isFa ? 'توده‌سنگ پروژه جاری' : 'Current Project Rock'}
                  </text>
                  <text
                    x="75"
                    y="30"
                    textAnchor="middle"
                    fontSize="10"
                    fontFamily="sans-serif"
                    fill="#38bdf8"
                    fontWeight="bold"
                  >
                    σc = {currentUcs} MPa | {isFa ? 'سایندگی: ' + (abrasivity === 'low' ? 'کم' : abrasivity === 'medium' ? 'متوسط' : abrasivity === 'high' ? 'زیاد' : 'خیلی زیاد') : `Abrasivity: ${abrasivity}`}
                  </text>
                </g>
              </g>
            </svg>
          </div>

          {/* Quick Legend under chart */}
          <div
            className={`w-full mt-3 p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
              isPaper
                ? 'bg-slate-50 border-slate-200 text-slate-700'
                : 'bg-slate-900/80 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-3.5 inline-block border border-slate-700 bg-[repeating-linear-gradient(0deg,#0f172a,#0f172a_1px,transparent_1px,transparent_4px)]"></span>
              <span className="font-medium">
                {isFa ? 'هاشور افقی: محدوده کاربرد رودهدر (Roadheader)' : 'Horizontal Lines: Roadheader'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-3.5 inline-block border border-slate-700 bg-[repeating-linear-gradient(45deg,#0f172a,#0f172a_1px,transparent_1px,transparent_4px)]"></span>
              <span className="font-medium">
                {isFa ? 'هاشور مورب ۴۵ درجه: چالزنی و آتشباری (Drill & Blast)' : 'Diagonal Lines: Drill & Blast'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-500 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span>{isFa ? 'دایره قرمز: موقعیت توده‌سنگ پروژه' : 'Red Dot: Project Location'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Parameters & Live Decision Engine (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Result Card: Selected Excavation Method */}
          <div
            className={`p-4 rounded-2xl border shadow-lg space-y-3 ${
              isRoadheaderZone
                ? 'bg-amber-950/20 border-amber-500/40'
                : isDrillBlastZone
                ? 'bg-rose-950/20 border-rose-500/40'
                : 'bg-purple-950/20 border-purple-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">
                {isFa ? 'روش استخراج بهینه بر اساس Isakson:' : 'Isakson Recommended Method:'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${diagnostic.badgeColor}`}>
                {isRoadheaderZone ? (isFa ? 'رودهدر' : 'Roadheader') : isDrillBlastZone ? (isFa ? 'آتشباری' : 'Drill & Blast') : (isFa ? 'سنگ ویژه' : 'Special Rock')}
              </span>
            </div>

            <div className={`text-base font-bold flex items-center gap-2 ${diagnostic.textColor}`}>
              {isRoadheaderZone ? <Pickaxe className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
              <h4>{isFa ? diagnostic.titleFa : diagnostic.titleEn}</h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isFa ? diagnostic.descFa : diagnostic.descEn}
            </p>

            {/* Technical Metrics for this selection */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{isFa ? 'سایش ابزار برشی/سرمته:' : 'Tool Wear:'}</span>
                <span className="font-semibold text-slate-200 text-right max-w-[60%]">
                  {isFa ? diagnostic.pickWearClassFa : diagnostic.pickWearClassEn}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{isFa ? 'نرخ پیشروی تخمینی:' : 'Est. Advance Rate:'}</span>
                <span className="font-mono font-bold text-emerald-400">
                  {isFa ? diagnostic.estAdvanceFa : diagnostic.estAdvanceEn}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] space-y-1">
                <span className="text-slate-400 font-medium block">
                  {isFa ? 'تجهیزات پیشنهادی عملیات حفاری:' : 'Recommended Machinery:'}
                </span>
                <span className="text-slate-200 leading-normal block">
                  {isFa ? diagnostic.recommendedEquipmentFa : diagnostic.recommendedEquipmentEn}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Parameters Sliders */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4" />
              <h4 className="text-xs font-bold text-slate-200">
                {isFa ? 'تنظیم متغیرهای ورودی نمودار' : 'Adjust Chart Inputs'}
              </h4>
            </div>

            {/* 1. UCS Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{isFa ? 'مقاومت فشاری تک‌محوری (σc):' : 'UCS (σc):'}</span>
                <span className="font-mono font-bold text-rose-400">{currentUcs} MPa</span>
              </div>
              <input
                type="range"
                min="5"
                max="395"
                step="5"
                value={currentUcs}
                onChange={(e) => onUpdateUcs(Number(e.target.value))}
                className="w-full accent-rose-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 MPa</span>
                <span>{isFa ? `مرز رودهدر (~${currentRhLimit} MPa)` : `Roadheader limit (~${currentRhLimit} MPa)`}</span>
                <span>400 MPa</span>
              </div>
            </div>

            {/* 2. Abrasivity (سایندگی) Selector */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{isFa ? 'درجه سایندگی سنگ:' : 'Rock Abrasivity:'}</span>
                <span className="font-bold text-amber-400">
                  {abrasivity === 'low'
                    ? (isFa ? 'کم (CAI < 1.5)' : 'Low (CAI < 1.5)')
                    : abrasivity === 'medium'
                    ? (isFa ? 'متوسط (CAI 1.5 - 2.5)' : 'Medium (CAI 1.5 - 2.5)')
                    : abrasivity === 'high'
                    ? (isFa ? 'زیاد (CAI 2.5 - 3.5)' : 'High (CAI 2.5 - 3.5)')
                    : (isFa ? 'خیلی زیاد (CAI > 3.5)' : 'Very High (CAI > 3.5)')}
                </span>
              </div>

              {/* 4 Discrete Buttons corresponding to the 4 Y-axis levels */}
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: 'very_high', labelFa: 'خیلی زیاد', labelEn: 'Very High', cai: 4.0, subFa: 'کوارتز > 40%', subEn: 'Quartz > 40%' },
                    { id: 'high', labelFa: 'زیاد', labelEn: 'High', cai: 3.0, subFa: 'کوارتز 20-40%', subEn: 'Quartz 20-40%' },
                    { id: 'medium', labelFa: 'متوسط', labelEn: 'Medium', cai: 2.0, subFa: 'کوارتز 10-20%', subEn: 'Quartz 10-20%' },
                    { id: 'low', labelFa: 'کم', labelEn: 'Low', cai: 1.0, subFa: 'کوارتز < 10%', subEn: 'Quartz < 10%' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setAbrasivity(item.id);
                      setCaiValue(item.cai);
                    }}
                    className={`p-2 rounded-xl text-xs flex flex-col items-center justify-center transition-all border ${
                      abrasivity === item.id
                        ? 'bg-rose-500/20 border-rose-500 text-rose-200 font-bold shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>{isFa ? item.labelFa : item.labelEn}</span>
                    <span className="text-[10px] text-slate-500">{isFa ? item.subFa : item.subEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Preset Rocks */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 block">
                {isFa ? 'پیش‌تنظیم‌های سنگ‌های شاخص (Presets):' : 'Typical Rock Presets:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {rockPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors"
                  >
                    {isFa ? preset.nameFa.split(' ')[0] : preset.nameEn} ({preset.ucs} MPa)
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Technical Guide & Background */}
      {showTechnicalDetails && (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <Info className="w-4 h-4" />
            <span>
              {isFa
                ? 'مبانی مهندسی و راهنمای تفسیری نمودار Isakson (مرز رودهدر در برابر آتشباری)'
                : 'Engineering Fundamentals of the Isakson Roadheader Selection Envelope'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 leading-relaxed text-slate-300">
            <div className="space-y-1.5">
              <strong className="text-slate-100 block">
                {isFa ? '۱. چرا محدوده رودهدر با افزایش سایندگی کاهش می‌یابد؟' : '1. Why does Roadheader envelope narrow with abrasivity?'}
              </strong>
              <p className="text-slate-400">
                {isFa
                  ? 'در سنگ‌های کم‌سایندگی (مانند شیل‌ها و سنگ‌آهک‌های رسی)، ماشین رودهدر سنگین می‌تواند تا مقاومت فشاری تک‌محوری ۱۱۰ مگاپاسکال را با موفقیت و هزینه ناخن منطقی حفر کند. اما با افزایش مقدار کانی‌های ساینده (به‌ویژه کوارتز آزاد و شاخص CAI > 2.5)، دمای کله‌برشی به شدت بالا رفته و مغزی تنگستن کاربید ناخن‌ها دچار سایش حرارتی و شکستگی می‌شود. به همین علت مرز مجاز برش مکانیکی از ۱۱۰ به کمتر از ۷۵ مگاپاسکال افت می‌کند.'
                  : 'In low-abrasivity rocks (such as shales and argillaceous limestones), heavy roadheaders can cut up to UCS = 110 MPa with acceptable pick consumption costs. However, as abrasive mineral content increases (especially free quartz with CAI > 2.5), cutterhead temperatures rise dramatically and tungsten carbide pick inserts experience rapid thermal wear and fracture, narrowing the cutting limit to below 75 MPa.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <strong className="text-slate-100 block">
                {isFa ? '۲. مزیت‌های روش چالزنی و آتشباری در گستره سختی بالا:' : '2. Advantages of Drill & Blast in Hard Formations:'}
              </strong>
              <p className="text-slate-400">
                {isFa
                  ? 'در روش چالزنی و آتشباری، انرژی شیمیایی ماده منفجره عمل خردایش سنگ را انجام می‌دهد، نه نیروی مکانیکی بوم دستگاه؛ از این رو این روش محدودیتی در مقاومت سنگ ندارد و تا مقاومت‌های ۳۳۰ الی ۳۸۰ مگاپاسکال به عنوان روش اولویت‌دار و مطمئن تونل‌سازی در سنگ سخت اعمال می‌گردد.'
                  : 'In Drill & Blast, the chemical detonation energy fragments the rock mass rather than mechanical boom thrust; hence, it is not fundamentally limited by high intact rock strength, remaining the primary reliable excavation method for hard rocks up to 330–380 MPa.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
