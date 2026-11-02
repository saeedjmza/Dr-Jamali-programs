/**
 * Geotechnical Rock Excavability, Rippability & Drillability Calculation Models
 * Methods:
 * 1. Franklin et al. (1971) - Fracture Spacing Index vs Point Load Strength Index
 * 2. GSI Method (Hoek & Karzulovic 2000) - Geological Strength Index & Rock Mass Strength
 * 3. Isaksson (2002) - Drillability and Blastability Model in Tunneling
 * 4. Weaver (1975) - Rippability Rating Chart (RRC)
 */

import {
  FranklinResult,
  GsiExcavabilityResult,
  IsakssonResult,
  WeaverInputState,
  WeaverResult,
} from '../types';

// Franklin (1971) Empirical Boundary Curves & Points
// Curve A: Dig vs Rip boundary [If in meters, Is in MPa]
export const FRANKLIN_CURVE_A_DATA: [number, number][] = [
  [8.0, 0.09],
  [6.0, 0.095],
  [3.0, 0.11],
  [2.0, 0.12],
  [1.0, 0.145],
  [0.6, 0.18],
  [0.3, 0.24],
  [0.2, 0.28],
  [0.1, 0.38],
  [0.06, 0.48],
  [0.03, 0.72],
  [0.02, 0.95],
  [0.01, 1.8],
  [0.00632, 2.8],
];

// Curve B: Rip vs Blasting boundary [If in meters, Is in MPa]
export const FRANKLIN_CURVE_B_DATA: [number, number][] = [
  [8.0, 0.27],
  [6.0, 0.28],
  [3.0, 0.33],
  [2.0, 0.36],
  [1.0, 0.44],
  [0.62, 0.52], // Branch point for Line C
  [0.4, 0.65],
  [0.2, 0.85],
  [0.1, 1.35],
  [0.06, 2.2],
  [0.04, 4.5],
  [0.035, 10.0],
  [0.032, 20.0],
  [0.030, 30.0],
];

// Line C: Blast to Fracture vs Blast to Loosen [Is in MPa, If in meters]
export const FRANKLIN_BRANCH_POINT = { is: 0.52, if: 0.62 };
export const FRANKLIN_LINE_C_RIGHT = { is: 30.0, if: 0.50 };

/**
 * Log-linear interpolation for Curve A (Finds boundary Is for a given If)
 */
export function getFranklinCurveAIs(ifVal: number): number {
  const logIf = Math.log10(Math.max(0.00632, Math.min(8.0, ifVal)));
  // FRANKLIN_CURVE_A_DATA is descending by If
  for (let i = 0; i < FRANKLIN_CURVE_A_DATA.length - 1; i++) {
    const logIf0 = Math.log10(FRANKLIN_CURVE_A_DATA[i][0]);
    const logIf1 = Math.log10(FRANKLIN_CURVE_A_DATA[i + 1][0]);
    const logIs0 = Math.log10(FRANKLIN_CURVE_A_DATA[i][1]);
    const logIs1 = Math.log10(FRANKLIN_CURVE_A_DATA[i + 1][1]);
    if (logIf <= logIf0 && logIf >= logIf1) {
      const t = (logIf - logIf0) / (logIf1 - logIf0);
      const logIs = logIs0 + t * (logIs1 - logIs0);
      return Math.pow(10, logIs);
    }
  }
  return FRANKLIN_CURVE_A_DATA[FRANKLIN_CURVE_A_DATA.length - 1][1];
}

/**
 * Log-linear interpolation for Curve B (Finds boundary Is for a given If)
 */
export function getFranklinCurveBIs(ifVal: number): number {
  const logIf = Math.log10(Math.max(0.03, Math.min(8.0, ifVal)));
  for (let i = 0; i < FRANKLIN_CURVE_B_DATA.length - 1; i++) {
    const logIf0 = Math.log10(FRANKLIN_CURVE_B_DATA[i][0]);
    const logIf1 = Math.log10(FRANKLIN_CURVE_B_DATA[i + 1][0]);
    const logIs0 = Math.log10(FRANKLIN_CURVE_B_DATA[i][1]);
    const logIs1 = Math.log10(FRANKLIN_CURVE_B_DATA[i + 1][1]);
    if (logIf <= logIf0 && logIf >= logIf1) {
      const t = (logIf - logIf0) / (logIf1 - logIf0);
      const logIs = logIs0 + t * (logIs1 - logIs0);
      return Math.pow(10, logIs);
    }
  }
  return FRANKLIN_CURVE_B_DATA[FRANKLIN_CURVE_B_DATA.length - 1][1];
}

/**
 * Calculates dividing If boundary between Blast to fracture and Blast to loosen
 */
export function getFranklinLineCIf(isVal: number): number {
  const safeIs = Math.max(FRANKLIN_BRANCH_POINT.is, Math.min(30.0, isVal));
  const logIs0 = Math.log10(FRANKLIN_BRANCH_POINT.is);
  const logIs1 = Math.log10(FRANKLIN_LINE_C_RIGHT.is);
  const logIf0 = Math.log10(FRANKLIN_BRANCH_POINT.if);
  const logIf1 = Math.log10(FRANKLIN_LINE_C_RIGHT.if);
  const t = (Math.log10(safeIs) - logIs0) / (logIs1 - logIs0);
  const logIf = logIf0 + t * (logIf1 - logIf0);
  return Math.pow(10, logIf);
}

/**
 * 1. Franklin et al. (1971) Rock Excavability Method
 * Franklin, Broch & Walton (1971) "Logging the mechanical character of rock"
 * Exactly recreates the 4 regions:
 * 1. Dig
 * 2. Rip
 * 3. Blast to loosen
 * 4. Blast to fracture
 */
export function calculateFranklinExcavability(
  fractureSpacingIf: number,
  pointLoadIs50: number
): FranklinResult {
  const safeIf = Math.max(0.01, Math.min(6.0, fractureSpacingIf));
  const safeIs = Math.max(0.03, Math.min(30.0, pointLoadIs50));

  const equivalentUcs = Number((safeIs * 24).toFixed(1)); // Approx UCS = 24 * Is(50)
  const fractureFrequency = Number((1 / safeIf).toFixed(1)); // fractures/m
  const excavabilityIndexIex = Number((safeIs * safeIf).toFixed(3));

  // Determine strength grade on X-axis
  let strengthGrade: 'VL' | 'L' | 'M' | 'H' | 'VH' | 'EH';
  if (safeIs < 0.1) strengthGrade = 'VL';
  else if (safeIs < 0.3) strengthGrade = 'L';
  else if (safeIs < 1.0) strengthGrade = 'M';
  else if (safeIs < 3.0) strengthGrade = 'H';
  else if (safeIs < 10.0) strengthGrade = 'VH';
  else strengthGrade = 'EH';

  // Determine fracture spacing grade on Y-axis
  let spacingGrade: 'VL' | 'L' | 'M' | 'H' | 'VH' | 'EH';
  if (safeIf < 0.06) spacingGrade = 'VL';
  else if (safeIf < 0.2) spacingGrade = 'L';
  else if (safeIf < 0.6) spacingGrade = 'M';
  else if (safeIf < 2.0) spacingGrade = 'H';
  else if (safeIf < 6.0) spacingGrade = 'VH';
  else spacingGrade = 'EH';

  // Exact boundary comparison
  const boundaryIsA = getFranklinCurveAIs(safeIf);
  const boundaryIsB = getFranklinCurveBIs(safeIf);

  let category: 'dig' | 'rip' | 'blast_to_loosen' | 'blast_to_fracture';
  let categoryNameFa: string;
  let categoryNameEn: string;
  let excavationMethodFa: string;
  let excavationMethodEn: string;
  let equipmentFa: string;
  let equipmentEn: string;
  let color: string;
  let descriptionFa: string;
  let descriptionEn: string;

  if (safeIs <= boundaryIsA) {
    // 1. Dig
    category = 'dig';
    categoryNameFa = 'حفاری مستقیم (Dig)';
    categoryNameEn = 'Dig';
    color = '#10b981'; // Emerald
    excavationMethodFa = 'حفاری مستقیم مکانیکی (Dig) بدون نیاز به ریپرزنی یا آتشباری';
    excavationMethodEn = 'Direct Mechanical Digging (Dig - No ripping or blasting needed)';
    equipmentFa = 'بیل مکانیکی هیدرولیکی، لودر چرخ‌لاستیکی یا زنجیری، بکهولودر معمولی';
    equipmentEn = 'Standard hydraulic excavators, backhoes, wheel/track loaders';
    descriptionFa =
      'توده‌سنگ به شدت خردشده یا با مقاومت بسیار پایین؛ قابلیت بارگیری و کنده‌کاری مستقیم با باکت بیل مکانیکی بدون عملیات شخم‌زدن یا انفجار.';
    descriptionEn =
      'Heavily jointed or very weak rock mass; can be directly excavated by standard backhoe buckets without ripping or blasting.';
  } else if (safeIs <= boundaryIsB) {
    // 2. Rip
    category = 'rip';
    categoryNameFa = 'ریپرزنی مکانیکی (Rip)';
    categoryNameEn = 'Rip';
    color = '#06b6d4'; // Cyan
    excavationMethodFa = 'ریپرزنی مکانیکی (Rip) با بولدوزر و شخم‌زدن لایه‌ها';
    excavationMethodEn = 'Mechanical Ripping (Rip - Heavy bulldozer with rippers)';
    equipmentFa = 'بولدوزرهای سنگین (CAT D8 / D9 / D10) با ریپر تک‌شاخه یا چندشاخه، چکش هیدرولیکی سنگین';
    equipmentEn = 'Heavy bulldozers (e.g. CAT D8/D9/D10) with single/multi shanks, heavy rock breakers';
    descriptionFa =
      'توده‌سنگ درزه‌دار با مقاومت متوسط تا بالا؛ ریپر تراکتور به داخل ناپیوستگی‌ها نفوذ کرده و توده‌سنگ را پیش از بارگیری متلاشی می‌نماید.';
    descriptionEn =
      'Jointed rock with moderate strength; ripper readily penetrates along joint planes to dislodge the ground for mucking.';
  } else {
    // Blasting Zone: check if above or below Line C
    const boundaryIfC = getFranklinLineCIf(safeIs);
    if (safeIf > boundaryIfC) {
      // 4. Blast to fracture
      category = 'blast_to_fracture';
      categoryNameFa = 'آتشباری برای خردایش (Blast to fracture)';
      categoryNameEn = 'Blast to fracture';
      color = '#ef4444'; // Rose / Red
      excavationMethodFa = 'آتشباری کامل جهت خردایش و شکستن سنگ (Blast to fracture)';
      excavationMethodEn = 'Production Blasting to Fracture (Blast to fracture)';
      equipmentFa = 'دستگاه حفاری چالزنی دورانی یا ضربه‌ای (Jumbo Drill / Top Hammer)، خرج ویژه کامل انفجاری (0.4–0.9 kg/m³)';
      equipmentEn = 'Production drill rigs / Jumbos, full blast design with commercial explosives (0.4-0.9 kg/m³)';
      descriptionFa =
        'توده‌سنگ یکپارچه و مقاوم با فاصله‌داری درزه‌ها بیش از ۰.۶ متر؛ برای شکستن ماتریس سنگ و تبدیل آن به ابعاد بارگیری، اجرای الگوی کامل چالزنی و آتشباری انفجاری الزامی است.';
      descriptionEn =
        'Massive, high-strength rock mass (spacing > 0.6 m); full blast pattern is mandatory to shatter the rock matrix into loadable sizing.';
    } else {
      // 3. Blast to loosen
      category = 'blast_to_loosen';
      categoryNameFa = 'آتشباری برای سست‌سازی (Blast to loosen)';
      categoryNameEn = 'Blast to loosen';
      color = '#f59e0b'; // Amber / Orange
      excavationMethodFa = 'آتشباری سبک جهت سست‌سازی و لق‌کردن بلوک‌ها (Blast to loosen)';
      excavationMethodEn = 'Blasting to Loosen (Blast to loosen - Light loosening blast)';
      equipmentFa = 'دریل‌واگن یا جامبودریل سبک با الگوی چالزنی فاصله باز، خرج ویژه سبک (0.15–0.30 kg/m³)، ریپر سنگین D9/D10';
      equipmentEn = 'Light drill rig, wide-spaced loosening blast pattern, light powder factor (0.15-0.30 kg/m³), heavy rippers';
      descriptionFa =
        'فاصله‌داری درزه‌ها کمتر از ۰.۶ متر است اما مقاومت سنگ بالا یا بلوک‌ها قفل‌شده هستند؛ آتشباری سبک تنها برای باز کردن درزه‌ها و لق‌سازی بلوک‌ها جهت ریپرزنی و بارگیری کافی است.';
      descriptionEn =
        'Fracture spacing under 0.6 m with high strength; light blasting loosens blocks along existing joints without heavy crushing.';
    }
  }

  return {
    fractureSpacingIf: safeIf,
    fractureFrequency,
    pointLoadIs50: safeIs,
    equivalentUcs,
    excavabilityIndexIex,
    excavationMethodFa,
    excavationMethodEn,
    equipmentFa,
    equipmentEn,
    category,
    categoryNameFa,
    categoryNameEn,
    color,
    descriptionFa,
    descriptionEn,
    pointLogIf: Number(Math.log10(safeIf).toFixed(3)),
    pointLogIs: Number(Math.log10(safeIs).toFixed(3)),
    strengthGrade,
    spacingGrade,
  };
}

/**
 * 2. GSI Excavability Method (Hoek & Karzulovic 2000 / Bieniawski & Grandori)
 * Relates GSI and intact UCS to rock mass strength and excavation techniques (TBM vs Drill & Blast vs Ripping)
 */
export function calculateGsiExcavability(gsi: number, ucs: number): GsiExcavabilityResult {
  const safeGsi = Math.max(5, Math.min(95, gsi));
  const safeUcs = Math.max(2, Math.min(300, ucs));

  // Rock mass compressive strength Scm
  const s = Math.exp((safeGsi - 100) / 9);
  const a = 0.5 + (Math.exp(-safeGsi / 15) - Math.exp(-20 / 3)) / 6;
  const rockMassStrengthScm = Number((safeUcs * Math.pow(s, a)).toFixed(2));

  // Specific energy of excavation SE (MJ/m3) (empirically derived)
  // SE ranges from 0.5 MJ/m3 for weak fractured rock to > 40 MJ/m3 for massive granite
  const specificEnergySE = Number(
    (0.4 + 0.05 * rockMassStrengthScm + 0.002 * Math.pow(safeUcs, 1.2)).toFixed(2)
  );

  let excavabilityClassFa: string;
  let excavabilityClassEn: string;
  let color: string;
  let machineryFa: string;
  let machineryEn: string;
  let tbmFeasibilityFa: string;
  let tbmFeasibilityEn: string;
  let drillAndBlastRecommendationFa: string;
  let drillAndBlastRecommendationEn: string;

  if (safeGsi < 30 || rockMassStrengthScm < 1.0) {
    excavabilityClassFa = 'حفاری مکانیکی مستقیم و آسان (Easy Mechanical Excavation)';
    excavabilityClassEn = 'Easy Mechanical Excavation';
    color = '#10b981';
    machineryFa = 'بیل هیدرولیکی استاندارد، رودهدر سبک (Light Roadheader) یا ترنچر';
    machineryEn = 'Standard hydraulic excavator, light roadheader or trenchers';
    tbmFeasibilityFa = 'مناسب برای EPB TBM یا شیلد خاکی در صورت وجود شرایط آبدار؛ خطر ریزش در TBM باز (Open TBM)';
    tbmFeasibilityEn = 'Suitable for Closed Shield / EPB TBM; high collapse risk for Open TBM';
    drillAndBlastRecommendationFa = 'آتشباری به هیچ وجه توصیه نمی‌شود؛ خطر ناپایداری شدید و آوربریک غیرقابل کنترل';
    drillAndBlastRecommendationEn = 'Blasting is not recommended; severe overbreak and instability';
  } else if (safeGsi < 50 && safeUcs < 50) {
    excavabilityClassFa = 'ریپرزنی پیوسته یا حفر مکانیکی با رودهدر (Rippable / Roadheader Excavation)';
    excavabilityClassEn = 'Rippable / Heavy Roadheader Excavation';
    color = '#06b6d4';
    machineryFa = 'بولدوزر سنگین مجهز به ریپر تک‌شاخه، رودهدر سنگین (Heavy Duty Roadheader)';
    machineryEn = 'Heavy bulldozer with single shank ripper, heavy-duty boom roadheader';
    tbmFeasibilityFa = 'بسیار ایده‌آل برای دستگاه TBM با نرخ نفوذ و پیشروی بسیار بالا';
    tbmFeasibilityEn = 'Highly feasible for TBM with high penetration rates and low disc cutter wear';
    drillAndBlastRecommendationFa = 'آتشباری با خرج سبک و شبکه‌بندی چال‌های نزدیک با کنترل دقیق ارتعاشات';
    drillAndBlastRecommendationEn = 'Light smooth blasting with low powder factor';
  } else if (safeGsi < 70 && safeUcs < 100) {
    excavabilityClassFa = 'حفاری با آتشباری کنترل‌شده یا ماشین‌آلات بسیار پرقدرت (Drill & Blast / Hard Rock TBM)';
    excavabilityClassEn = 'Drill & Blast / Hard Rock TBM';
    color = '#f59e0b';
    machineryFa = 'آتشباری با چالزنی هیدرولیک (Jumbo Drill) یا TBM سنگ سخت گیرپردار (Gripper TBM)';
    machineryEn = 'Standard drill and blast with hydraulic jumbo or hard rock Gripper TBM';
    tbmFeasibilityFa = 'شرایط ایده‌آل برای Open Gripper TBM؛ عملکرد پایدار و نگهداری همزمان سقف';
    tbmFeasibilityEn = 'Optimal conditions for Gripper TBM with steady cutter wear';
    drillAndBlastRecommendationFa = 'روش استاندارد حفاری و آتشباری با پیشروی ۲.۵ الی ۳.۵ متر و استفاده از امولسیون';
    drillAndBlastRecommendationEn = 'Standard D&B with 2.5-3.5m advance and emulsion explosives';
  } else {
    excavabilityClassFa = 'سنگ سخت و یکپارچه؛ آتشباری سنگین یا دیسک‌کاترهای پرتوان (Very Hard Rock Excavation)';
    excavabilityClassEn = 'Very Hard Rock Excavation';
    color = '#ef4444';
    machineryFa = 'آتشباری پرانرژی با دینامیت/امولسیون سنگین؛ دیسک‌کاترهای ۱۹ اینچ TBM با بار بالا';
    machineryEn = 'High-energy blasting / 19-inch high-load TBM disc cutters';
    tbmFeasibilityFa = 'امکان‌پذیر اما با استهلاک و سایش شدید دیسک‌کاترها و کاهش سرعت پیشروی لحظه‌ای';
    tbmFeasibilityEn = 'Feasible with high disc cutter consumption and reduced instantaneous penetration';
    drillAndBlastRecommendationFa = 'الزام به چالزنی دقیق پیرامونی (Smooth Blasting) با چال‌های راه‌نما (Reamer Holes) و خرج ویژه';
    drillAndBlastRecommendationEn = 'Smooth blasting with large diameter reamer relief holes';
  }

  return {
    gsi: safeGsi,
    ucs: safeUcs,
    rockMassStrengthScm,
    excavabilityClassFa,
    excavabilityClassEn,
    color,
    machineryFa,
    machineryEn,
    specificEnergySE,
    tbmFeasibilityFa,
    tbmFeasibilityEn,
    drillAndBlastRecommendationFa,
    drillAndBlastRecommendationEn,
  };
}

/**
 * 3. Isaksson (2002) Drillability & Blastability Method
 * Quantifies specific charge q (kg/m3), specific drilling (m/m3),
 * advance per round and blastability index based on UCS, joint frequency Jv & density.
 */
export function calculateIsakssonExcavability(
  ucs: number,
  jointSpacingM: number,
  rockDensity: number = 2.65,
  tunnelSpan: number = 6.0
): IsakssonResult {
  const safeUcs = Math.max(5, Math.min(300, ucs));
  const safeSpacing = Math.max(0.02, Math.min(5.0, jointSpacingM));
  const safeDensity = Math.max(1.8, Math.min(3.5, rockDensity));
  const safeSpan = Math.max(2, tunnelSpan);

  // Volumetric joint count Jv = approx 3 / spacing
  const jointFrequencyJv = Number((3 / safeSpacing).toFixed(1));

  // Isaksson Blastability Model:
  // Specific charge q (kg/m3) is a function of rock compressive strength, density, jointing and tunnel cross section area
  // Area approx A = pi * (span/2)^2 for horseshoe tunnel
  const area = Math.PI * Math.pow(safeSpan / 2, 2) * 0.9;

  // Base specific charge (Langefors & Kihlström / Isaksson 2002)
  // Higher UCS -> higher explosive demand; Higher Jv (fractured) -> easier fragmentation
  let specificChargeQ =
    0.75 + (safeUcs / 120) * 0.45 - (Math.min(30, jointFrequencyJv) / 30) * 0.25 + 0.15 * (safeDensity - 2.5);
  // Scale correction for tunnel cross-section area (smaller tunnels require higher specific charge)
  const areaFactor = Math.pow(40 / Math.max(10, area), 0.25);
  specificChargeQ = Number(Math.max(0.6, Math.min(3.5, specificChargeQ * areaFactor)).toFixed(2));

  // Specific drilling SD (m drilled per m3 of rock excavated)
  // Usually between 1.2 to 3.5 m/m3
  const specificDrillingSD = Number(
    Math.max(1.1, Math.min(4.0, (specificChargeQ * 1.6) / 0.9)).toFixed(2)
  );

  // Drilling Rate Index (DRI) estimation (NTNU / Isaksson)
  // Lower UCS & higher jointing -> easier drillability (higher DRI)
  let driEstimate = 85 - (safeUcs / 250) * 55 + (jointFrequencyJv > 10 ? 10 : 0);
  driEstimate = Number(Math.max(20, Math.min(90, driEstimate)).toFixed(0));

  let drillabilityClassFa: string;
  let drillabilityClassEn: string;
  let bitWearRate: string;
  let bitWearRateFa: string;
  let bitWearRateEn: string;

  if (driEstimate >= 65) {
    drillabilityClassFa = 'چالزنی بسیار آسان و سریع (Very High Drillability)';
    drillabilityClassEn = 'Very High Drillability (DRI > 65)';
    bitWearRateFa = 'بیش از ۲۵۰ متر به ازای هر سرمته (سایش اندک)';
    bitWearRateEn = '> 250 m per drill bit (Low abrasive wear)';
    bitWearRate = bitWearRateFa;
  } else if (driEstimate >= 45) {
    drillabilityClassFa = 'چالزنی متوسط و متعارف (Medium Drillability)';
    drillabilityClassEn = 'Medium Drillability (DRI 45-65)';
    bitWearRateFa = '۱۰۰ الی ۲۵۰ متر به ازای هر سرمته';
    bitWearRateEn = '100 - 250 m per drill bit';
    bitWearRate = bitWearRateFa;
  } else {
    drillabilityClassFa = 'چالزنی دشوار و سنگ ساینده (Low Drillability / High Abrasivity)';
    drillabilityClassEn = 'Low Drillability (DRI < 45)';
    bitWearRateFa = 'کمتر از ۱۰۰ متر به ازای هر سرمته (سایش بالا و تعویض مکرر)';
    bitWearRateEn = '< 100 m per drill bit (High wear, frequent replacement)';
    bitWearRate = bitWearRateFa;
  }

  // Blastability category
  let blastabilityClassFa: string;
  let blastabilityClassEn: string;
  let overbreakRiskFa: string;
  let overbreakRiskEn: string;
  let advancePerRound: number;

  if (jointFrequencyJv > 15) {
    blastabilityClassFa = 'خردایش آسان، نیاز به ماده منفجره کم (Easy Fragmentation)';
    blastabilityClassEn = 'Easy Fragmentation';
    overbreakRiskFa = 'ریسک بالای اضافه حفاری (Overbreak) به علت لغزش درزه‌های سقف و دیواره‌ها';
    overbreakRiskEn = 'High overbreak risk due to joint detachment';
    advancePerRound = Number(Math.min(3.0, Math.max(1.5, safeSpan * 0.4)).toFixed(1));
  } else if (jointFrequencyJv > 5) {
    blastabilityClassFa = 'آتشباری استاندارد و خردایش مطلوب (Optimal Blastability)';
    blastabilityClassEn = 'Optimal Blastability';
    overbreakRiskFa = 'ریسک متوسط اضافه حفاری؛ با آتشباری کنترلی پیرامونی قابل مهار است';
    overbreakRiskEn = 'Moderate overbreak risk; controllable with smooth contour blasting';
    advancePerRound = Number(Math.min(4.5, Math.max(2.5, safeSpan * 0.6)).toFixed(1));
  } else {
    blastabilityClassFa = 'آتشباری سخت؛ خطر تولید قلوه‌سنگ‌های درشت (Coarse Fragmentation)';
    blastabilityClassEn = 'Difficult Fragmentation / Boulder Risk';
    overbreakRiskFa = 'حداقل اضافه حفاری؛ مقطع حفر شده بسیار صلب و با خط شکست تمیز';
    overbreakRiskEn = 'Minimal overbreak; very clean perimeter profile';
    advancePerRound = Number(Math.min(5.0, Math.max(3.0, safeSpan * 0.7)).toFixed(1));
  }

  const explosiveTypeFa =
    specificChargeQ > 1.8
      ? 'امولسیون پرسرعت / دینامیت ژلاتینی در چال‌های کف و برش + ANFO در چال‌های میانی'
      : 'آنفو (ANFO) در چال‌های تولیدی + خرج لوله‌ای سبک (Gurit) در چال‌های پیرامونی';
  const explosiveTypeEn =
    specificChargeQ > 1.8
      ? 'High VOD Emulsion/Gelatin dynamite in cut & lifters + ANFO in production holes'
      : 'Bulk ANFO in production holes + low-density decoupled contour charges (Gurit)';

  return {
    ucs: safeUcs,
    jointFrequencyJv,
    jointSpacingM: safeSpacing,
    rockDensity: safeDensity,
    tunnelSpan: safeSpan,
    specificChargeQ,
    specificDrillingSD,
    driEstimate,
    drillabilityClassFa,
    drillabilityClassEn,
    blastabilityClassFa,
    blastabilityClassEn,
    advancePerRound,
    bitWearRate,
    bitWearRateFa,
    bitWearRateEn,
    overbreakRiskFa,
    overbreakRiskEn,
    explosiveTypeFa,
    explosiveTypeEn,
  };
}

/**
 * 4. Weaver (1975) Rippability Rating Chart (RRC)
 * Evaluates 6 physical parameters to give total score (0 to 100)
 * Recommends bulldozer tractor class (D7 to D10) or blasting
 */
export function calculateWeaverRippability(input: WeaverInputState): WeaverResult {
  const { seismicVelocityVp, ucs, weatheringGrade, jointSpacing, continuity, gouge } = input;

  // 1. Seismic Velocity Vp (km/s) Rating (0 to 26)
  let seismicScore = 0;
  if (seismicVelocityVp < 0.7) seismicScore = 26;
  else if (seismicVelocityVp <= 1.2) seismicScore = 24;
  else if (seismicVelocityVp <= 1.5) seismicScore = 18;
  else if (seismicVelocityVp <= 1.85) seismicScore = 12;
  else if (seismicVelocityVp <= 2.15) seismicScore = 6;
  else seismicScore = 0;

  // 2. Rock Hardness / UCS (MPa) Rating (0 to 10)
  let hardnessScore = 0;
  if (ucs < 3) hardnessScore = 10;
  else if (ucs <= 10) hardnessScore = 8;
  else if (ucs <= 25) hardnessScore = 5;
  else if (ucs <= 70) hardnessScore = 2;
  else hardnessScore = 0;

  // 3. Weathering Rating (0 to 9)
  let weatheringScore = 0;
  if (weatheringGrade === 5) weatheringScore = 9; // completely weathered
  else if (weatheringGrade === 4) weatheringScore = 7; // highly weathered
  else if (weatheringGrade === 3) weatheringScore = 5; // moderately weathered
  else if (weatheringGrade === 2) weatheringScore = 3; // slightly weathered
  else weatheringScore = 0; // unweathered

  // 4. Joint Spacing Rating (5 to 30)
  let spacingScore = 5;
  if (jointSpacing < 0.05) spacingScore = 30;
  else if (jointSpacing <= 0.1) spacingScore = 25;
  else if (jointSpacing <= 0.3) spacingScore = 20;
  else if (jointSpacing <= 1.0) spacingScore = 15;
  else if (jointSpacing <= 3.0) spacingScore = 10;
  else spacingScore = 5;

  // 5. Joint Continuity Rating (0 to 15)
  let continuityScore = 0;
  if (continuity === 'non_continuous') continuityScore = 15;
  else if (continuity === 'continuous_gouge') continuityScore = 5;
  else continuityScore = 0; // continuous with no gouge

  // 6. Joint Gouge / Infilling Rating (0 to 10)
  let gougeScore = 0;
  if (gouge === 'soft') gougeScore = 10;
  else if (gouge === 'hard') gougeScore = 5;
  else gougeScore = 0; // none

  const totalRating =
    seismicScore + hardnessScore + weatheringScore + spacingScore + continuityScore + gougeScore;

  let classCode: 'I' | 'II' | 'III' | 'IV' | 'V';
  let classNameFa: string;
  let classNameEn: string;
  let rippabilityDescriptionFa: string;
  let rippabilityDescriptionEn: string;
  let tractorRecommendationFa: string;
  let tractorRecommendationEn: string;
  let color: string;

  if (totalRating >= 90) {
    classCode = 'I';
    classNameFa = 'کلاس I - بسیار آسان برای ریپرزنی (Very Easy Ripping)';
    classNameEn = 'Class I - Very Easy Ripping';
    rippabilityDescriptionFa = 'توده‌سنگ کاملاً هوازده، سست و پردرزه؛ مقاومت برشی ناچیز';
    rippabilityDescriptionEn = 'Completely weathered or highly fractured rock mass';
    tractorRecommendationFa = 'بولدوزر سبک چرخ‌زنجیری نظیر کاترپیلار CAT D7 با ریپر چندشاخه';
    tractorRecommendationEn = 'Caterpillar D7 or equivalent with multi-shank ripper';
    color = '#10b981';
  } else if (totalRating >= 70) {
    classCode = 'II';
    classNameFa = 'کلاس II - ریپرزنی آسان (Easy Ripping)';
    classNameEn = 'Class II - Easy Ripping';
    rippabilityDescriptionFa = 'ریپرزنی با راندمان بالا و سهولت بدون فشار بر ادوات ماشین';
    rippabilityDescriptionEn = 'High-productivity ripping with minimal tractor stress';
    tractorRecommendationFa = 'بولدوزر کاترپیلار CAT D7 الی CAT D8 با ریپر ۲ یا ۳ شاخه';
    tractorRecommendationEn = 'Caterpillar D7 to D8 with 2 or 3-shank ripper';
    color = '#06b6d4';
  } else if (totalRating >= 50) {
    classCode = 'III';
    classNameFa = 'کلاس III - ریپرزنی متوسط تا سخت (Moderate Ripping)';
    classNameEn = 'Class III - Moderate Ripping';
    rippabilityDescriptionFa = 'نیازمند کشش و توان بالای بولدوزر؛ سایش متوسط دندانه‌های ریپر';
    rippabilityDescriptionEn = 'Requires high tractor drawbar pull; moderate ripper tip wear';
    tractorRecommendationFa = 'بولدوزر سنگین کاترپیلار CAT D8 الی CAT D9 با تک‌ریپر پرقدرت';
    tractorRecommendationEn = 'Caterpillar D8 or D9 with single heavy-duty shank';
    color = '#f59e0b';
  } else if (totalRating >= 30) {
    classCode = 'IV';
    classNameFa = 'کلاس IV - ریپرزنی بسیار دشوار (Difficult / Hard Ripping)';
    classNameEn = 'Class IV - Hard to Marginal Ripping';
    rippabilityDescriptionFa = 'در مرز قابلیت ریپرزنی؛ شکستگی دندانه‌های ریپر و استهلاک شدید تراکتور؛ نیازمند پیش‌ترخیص موضعی';
    rippabilityDescriptionEn = 'Marginal rippability; high machine wear and severe tooth breakage';
    tractorRecommendationFa = 'بولدوزر فوق سنگین کاترپیلار CAT D9 / CAT D10 یا CAT D11 با تک‌ریپر شیارزن سنگین';
    tractorRecommendationEn = 'Caterpillar D9, D10 or D11 with heavy single-shank ripper';
    color = '#f97316';
  } else {
    classCode = 'V';
    classNameFa = 'کلاس V - غیرقابل ریپرزنی / الزام به آتشباری (Blasting Mandatory)';
    classNameEn = 'Class V - Non-Rippable (Blasting Required)';
    rippabilityDescriptionFa = 'عملیات ریپرزنی عملاً ناممکن و غیر اقتصادی بوده و به ادوات ماشین آسیب قطعی می‌رساند. انفجار الزامی است.';
    rippabilityDescriptionEn = 'Mechanical ripping is impossible; catastrophic wear. Blasting is strictly mandatory.';
    tractorRecommendationFa = 'آتشباری و انفجار با دینامیت/آنفو؛ عدم کارایی بولدوزرها';
    tractorRecommendationEn = 'Drill and blast required; ripping tractors not feasible';
    color = '#ef4444';
  }

  return {
    totalRating,
    classCode,
    classNameFa,
    classNameEn,
    rippabilityDescriptionFa,
    rippabilityDescriptionEn,
    tractorRecommendationFa,
    tractorRecommendationEn,
    color,
    scores: {
      seismic: seismicScore,
      hardness: hardnessScore,
      weathering: weatheringScore,
      jointSpacing: spacingScore,
      continuity: continuityScore,
      gouge: gougeScore,
    },
  };
}
