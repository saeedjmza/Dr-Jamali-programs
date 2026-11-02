/**
 * Bieniawski (1989) Geomechanics Classification (RMR) & Stand-up Time Calculation Engine
 */

import { RockClassInfo, CalculationResult, PresetScenario } from '../types';

export const ROCK_CLASSES: Record<number, RockClassInfo> = {
  1: {
    id: 1,
    code: 'I',
    nameFa: 'سنگ بسیار خوب (Class I: Very Good Rock)',
    nameEn: 'Class I: Very Good Rock',
    rmrRange: [81, 100],
    color: '#10b981', // Emerald 500
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#059669',
    textColor: '#34d399',
    cohesionKPa: '> 400 kPa',
    frictionAngleDeg: '> 45°',
    excavationMethodFa: 'تمام مقطع (Full face)، پیشروی ۳ متری در هر گام انفجار',
    excavationMethodEn: 'Full face, 3m advance',
    rockBoltsFa: 'به طور کلی نیازی به راک‌بولت نیست مگر به صورت موضعی (Spot bolting)',
    rockBoltsEn: 'Generally no support required except for occasional spot bolting',
    shotcreteFa: 'بدون نیاز به شاتکریت',
    shotcreteEn: 'None required',
    steelSetsFa: 'بدون نیاز به قاب فلزی',
    steelSetsEn: 'None required',
  },
  2: {
    id: 2,
    code: 'II',
    nameFa: 'سنگ خوب (Class II: Good Rock)',
    nameEn: 'Class II: Good Rock',
    rmrRange: [61, 80],
    color: '#3b82f6', // Blue 500
    bgColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#2563eb',
    textColor: '#60a5fa',
    cohesionKPa: '300 - 400 kPa',
    frictionAngleDeg: '35° - 45°',
    excavationMethodFa: 'تمام مقطع با پیشروی ۱ تا ۱.۵ متری، تکمیل نگهداری در فاصله ۲۰ متری از سینه کار',
    excavationMethodEn: 'Full face, 1.0 to 1.5m advance; complete support 20m from face',
    rockBoltsFa: 'راک‌بولت‌های موضعی یا با الگوی با فاصله ۲.۵ متر در سقف (طول ۳ متر)',
    rockBoltsEn: 'Locally bolts in crown 3m long, spaced 2.5m with occasional wire mesh',
    shotcreteFa: 'شاتکریت به ضخامت ۵۰ میلی‌متر در سقف در صورت نیاز',
    shotcreteEn: '50mm in crown where required',
    steelSetsFa: 'بدون نیاز به قاب فلزی',
    steelSetsEn: 'None required',
  },
  3: {
    id: 3,
    code: 'III',
    nameFa: 'سنگ متوسط (Class III: Fair Rock)',
    nameEn: 'Class III: Fair Rock',
    rmrRange: [41, 60],
    color: '#eab308', // Yellow/Amber 500
    bgColor: 'rgba(234, 179, 8, 0.15)',
    borderColor: '#ca8a04',
    textColor: '#facc15',
    cohesionKPa: '200 - 300 kPa',
    frictionAngleDeg: '25° - 35°',
    excavationMethodFa: 'حفاری طاق و پله (Top heading and bench)، پیشروی ۱.۵ تا ۳ متر در طاق، نصب نگهداری بلافاصله پس از آتشباری و در فاصله حداکثر ۱۰ متری',
    excavationMethodEn: 'Top heading and bench: 1.5 to 3.0m advance in top heading; install support after each blast, max 10m from face',
    rockBoltsFa: 'بولت‌های سیستماتیک به طول ۴ متر با فاصله ۱.۵ تا ۲ متر در سقف و دیواره‌ها همراه با مش سیمی در سقف',
    rockBoltsEn: 'Systematic bolts 4m long, spaced 1.5 - 2.0m in crown and walls with wire mesh in crown',
    shotcreteFa: '۵۰ تا ۱۰۰ میلی‌متر در سقف و ۳۰ میلی‌متر در دیواره‌ها',
    shotcreteEn: '50 to 100mm in crown and 30mm in sides',
    steelSetsFa: 'به طور کلی نیازی نیست مگر در مقاطع بحرانی',
    steelSetsEn: 'None required',
  },
  4: {
    id: 4,
    code: 'IV',
    nameFa: 'سنگ ضعیف (Class IV: Poor Rock)',
    nameEn: 'Class IV: Poor Rock',
    rmrRange: [21, 40],
    color: '#f97316', // Orange 500
    bgColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: '#ea580c',
    textColor: '#fb923c',
    cohesionKPa: '100 - 200 kPa',
    frictionAngleDeg: '15° - 25°',
    excavationMethodFa: 'طاق و پله با گام پیشروی ۱ تا ۱.۵ متر در طاق؛ نصب نگهداری همزمان با حفاری در فاصله حداکثر ۱۰ متری از سینه کار',
    excavationMethodEn: 'Top heading and bench: 1.0 to 1.5m advance in top heading; install support concurrently with excavation',
    rockBoltsFa: 'بولت‌های سیستماتیک به طول ۴ تا ۵ متر با فاصله ۱ تا ۱.۵ متر در سقف و دیوارها به همراه مش سیمی کامل',
    rockBoltsEn: 'Systematic bolts 4 - 5m long, spaced 1 - 1.5m in crown and walls with wire mesh',
    shotcreteFa: '۱۰۰ تا ۱۵۰ میلی‌متر در سقف و ۱۰۰ میلی‌متر در دیواره‌ها',
    shotcreteEn: '100 to 150mm in crown and 100mm in sides',
    steelSetsFa: 'قاب‌های فلزی سبک با فواصل ۱.۵ متری در صورت نیاز',
    steelSetsEn: 'Light ribs spaced 1.5m where required',
  },
  5: {
    id: 5,
    code: 'V',
    nameFa: 'سنگ بسیار ضعیف (Class V: Very Poor Rock)',
    nameEn: 'Class V: Very Poor Rock',
    rmrRange: [0, 20],
    color: '#ef4444', // Red 500
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#dc2626',
    textColor: '#f87171',
    cohesionKPa: '< 100 kPa',
    frictionAngleDeg: '< 15°',
    excavationMethodFa: 'حفاری چندمرحله‌ای (Multiple drifts)، پیشروی ۰.۵ تا ۱.۵ متر با نگهداری پیشرو (فورپولینگ / Spiling) و شاتکریت آنی در سینه کار',
    excavationMethodEn: 'Multiple drifts: 0.5 to 1.5m advance; install support concurrently with excavation, shotcrete as soon as possible after blasting',
    rockBoltsFa: 'بولت‌های سیستماتیک به طول ۵ تا ۶ متر با فاصله ۱ تا ۱.۲ متر در سقف و دیواره‌ها به همراه مش و بتن کف‌بند (Invert)',
    rockBoltsEn: 'Systematic bolts 5 - 6m long, spaced 1 - 1.2m in crown and walls with wire mesh; bolt invert',
    shotcreteFa: '۱۵۰ تا ۲۰۰ میلی‌متر در سقف، ۱۵۰ میلی‌متر در دیواره‌ها و ۵۰ میلی‌متر در سینه کار',
    shotcreteEn: '150 to 200mm in crown, 150mm in sides, and 50mm on face',
    steelSetsFa: 'قاب‌های فولادی متوسط تا سنگین با فواصل ۰.۷۵ متر با صفحات مهاری و بستن فوری کف‌بند (Invert strut)',
    steelSetsEn: 'Medium to heavy ribs spaced 0.75m with steel lagging and invert struts',
  },
};

/**
 * Bieniawski (1989) Empirical Support Guidelines Validity Conditions (Table 4)
 * Valid exclusively for:
 * - Horseshoe-shaped tunnel profile
 * - 10 m span
 * - Vertical stress < 25 MPa (overburden depth < ~900 m)
 * - Drill and blast construction method
 */
export const RMR_SUPPORT_VALIDITY_NOTE = {
  fa: 'این روش برای تونل نعل اسبی با دهانه ۱۰ متر، تنش قائم کمتر از ۲۵ مگاپاسکال و روش ساخت حفاری و انفجار معتبر است.',
  en: 'This method is valid for horseshoe-shaped tunnels with a 10 m span, vertical stress of less than 25 MPa, and drill & blast construction method.',
  shortFa: 'معتبر برای تونل نعل‌اسبی، دهانه ۱۰ متر، تنش قائم < ۲۵ مگاپاسکال و حفاری و انفجار',
  shortEn: 'Valid for 10m horseshoe tunnel, vertical stress < 25 MPa & drill and blast',
  conditions: {
    shapeFa: 'تونل نعل‌اسبی (Horseshoe)',
    shapeEn: 'Horseshoe tunnel',
    spanFa: 'دهانه ۱۰ متر (Span = 10 m)',
    spanEn: '10 m span',
    stressFa: 'تنش قائم کمتر از ۲۵ مگاپاسکال (σv < 25 MPa)',
    stressEn: 'Vertical stress < 25 MPa',
    methodFa: 'روش حفاری و انفجار (Drill & Blast)',
    methodEn: 'Drill and blast method',
  },
};

/**
 * Key anchor points digitized from Bieniawski (1989) Stand-up Time Chart
 * RMR values: 0, 20, 40, 60, 80, 100
 */
interface RmrAnchor {
  rmr: number;
  top: { timeHours: number; spanMeters: number }; // Intersection with upper curve
  bottom: { timeHours: number; spanMeters: number }; // Intersection with lower curve
}

const RMR_ANCHORS: RmrAnchor[] = [
  {
    rmr: 0,
    top: { timeHours: 0.02, spanMeters: 0.7 },
    bottom: { timeHours: 0.08, spanMeters: 0.35 },
  },
  {
    rmr: 20,
    top: { timeHours: 0.4, spanMeters: 2.0 },
    bottom: { timeHours: 3.0, spanMeters: 0.8 },
  },
  {
    rmr: 40,
    top: { timeHours: 30.0, spanMeters: 6.0 },
    bottom: { timeHours: 60.0, spanMeters: 1.0 },
  },
  {
    rmr: 60,
    top: { timeHours: 800.0, spanMeters: 14.5 },
    bottom: { timeHours: 1000.0, spanMeters: 1.6 },
  },
  {
    rmr: 80,
    top: { timeHours: 10000.0, spanMeters: 20.0 },
    bottom: { timeHours: 20000.0, spanMeters: 2.0 },
  },
  {
    rmr: 100,
    top: { timeHours: 175200.0, spanMeters: 20.0 }, // ~20 years
    bottom: { timeHours: 300000.0, spanMeters: 2.0 },
  },
];

/**
 * Upper envelope curve points for drawing and interpolation
 */
export const UPPER_ENVELOPE_POINTS: { timeHours: number; spanMeters: number }[] = [
  { timeHours: 0.015, spanMeters: 0.6 },
  { timeHours: 0.05, spanMeters: 0.9 },
  { timeHours: 0.167, spanMeters: 1.45 }, // 10 minutes
  { timeHours: 0.4, spanMeters: 2.0 }, // RMR 20
  { timeHours: 1.0, spanMeters: 2.8 }, // 1 hour
  { timeHours: 4.0, spanMeters: 3.9 },
  { timeHours: 10.0, spanMeters: 4.8 }, // 10 hours
  { timeHours: 30.0, spanMeters: 6.0 }, // RMR 40 (1.25 days)
  { timeHours: 100.0, spanMeters: 8.5 }, // 4.1 days
  { timeHours: 300.0, spanMeters: 11.5 },
  { timeHours: 800.0, spanMeters: 14.5 }, // RMR 60 (~1 month)
  { timeHours: 2000.0, spanMeters: 16.8 },
  { timeHours: 5000.0, spanMeters: 18.7 },
  { timeHours: 10000.0, spanMeters: 20.0 }, // RMR 80 (~1.14 years)
  { timeHours: 40000.0, spanMeters: 20.0 },
  { timeHours: 100000.0, spanMeters: 20.0 },
  { timeHours: 200000.0, spanMeters: 20.0 },
];

/**
 * Lower envelope curve points for drawing and interpolation
 */
export const LOWER_ENVELOPE_POINTS: { timeHours: number; spanMeters: number }[] = [
  { timeHours: 0.05, spanMeters: 0.3 },
  { timeHours: 0.3, spanMeters: 0.4 },
  { timeHours: 1.0, spanMeters: 0.55 },
  { timeHours: 3.0, spanMeters: 0.8 }, // RMR 20
  { timeHours: 10.0, spanMeters: 0.88 },
  { timeHours: 60.0, spanMeters: 1.0 }, // RMR 40
  { timeHours: 250.0, spanMeters: 1.25 },
  { timeHours: 1000.0, spanMeters: 1.6 }, // RMR 60
  { timeHours: 5000.0, spanMeters: 1.85 },
  { timeHours: 20000.0, spanMeters: 2.0 }, // RMR 80
  { timeHours: 100000.0, spanMeters: 2.0 },
  { timeHours: 200000.0, spanMeters: 2.0 },
];

/**
 * Interpolates top and bottom anchor boundaries for an arbitrary RMR [0, 100]
 */
export function getAnchorsForRmr(rmr: number): {
  top: { timeHours: number; spanMeters: number; logT: number; logS: number };
  bottom: { timeHours: number; spanMeters: number; logT: number; logS: number };
} {
  const clampedRmr = Math.max(0, Math.min(100, rmr));

  let lowerIdx = 0;
  for (let i = 0; i < RMR_ANCHORS.length - 1; i++) {
    if (clampedRmr >= RMR_ANCHORS[i].rmr && clampedRmr <= RMR_ANCHORS[i + 1].rmr) {
      lowerIdx = i;
      break;
    }
  }

  const p1 = RMR_ANCHORS[lowerIdx];
  const p2 = RMR_ANCHORS[lowerIdx + 1];
  const ratio = (clampedRmr - p1.rmr) / (p2.rmr - p1.rmr);

  // Linear interpolation in log space
  const logT_top1 = Math.log10(p1.top.timeHours);
  const logS_top1 = Math.log10(p1.top.spanMeters);
  const logT_top2 = Math.log10(p2.top.timeHours);
  const logS_top2 = Math.log10(p2.top.spanMeters);

  const logT_bot1 = Math.log10(p1.bottom.timeHours);
  const logS_bot1 = Math.log10(p1.bottom.spanMeters);
  const logT_bot2 = Math.log10(p2.bottom.timeHours);
  const logS_bot2 = Math.log10(p2.bottom.spanMeters);

  const logT_top = logT_top1 + ratio * (logT_top2 - logT_top1);
  const logS_top = logS_top1 + ratio * (logS_top2 - logS_top1);

  const logT_bot = logT_bot1 + ratio * (logT_bot2 - logT_bot1);
  const logS_bot = logS_bot1 + ratio * (logS_bot2 - logS_bot1);

  return {
    top: {
      timeHours: Math.pow(10, logT_top),
      spanMeters: Math.pow(10, logS_top),
      logT: logT_top,
      logS: logS_top,
    },
    bottom: {
      timeHours: Math.pow(10, logT_bot),
      spanMeters: Math.pow(10, logS_bot),
      logT: logT_bot,
      logS: logS_bot,
    },
  };
}

/**
 * Gets the Rock Class object based on RMR
 */
export function getRockClass(rmr: number): RockClassInfo {
  if (rmr > 80) return ROCK_CLASSES[1];
  if (rmr > 60) return ROCK_CLASSES[2];
  if (rmr > 40) return ROCK_CLASSES[3];
  if (rmr > 20) return ROCK_CLASSES[4];
  return ROCK_CLASSES[5];
}

/**
 * Converts hours to a human-readable duration in Persian and English
 */
export function formatStandUpTime(hours: number): {
  fa: string;
  en: string;
  category: 'minutes' | 'hours' | 'days' | 'months' | 'years';
  breakdown: {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    totalHours: number;
  };
} {
  const totalHours = hours;
  const totalMinutes = hours * 60;

  if (hours <= 0 || !isFinite(hours)) {
    return {
      fa: 'ناپایدار آنی (کمتر از ۱ دقیقه)',
      en: 'Immediate Collapse (< 1 min)',
      category: 'minutes',
      breakdown: { years: 0, months: 0, days: 0, hours: 0, minutes: 0, totalHours: 0 },
    };
  }

  // Calculate units
  const years = Math.floor(hours / 8760);
  const remAfterYears = hours % 8760;
  const months = Math.floor(remAfterYears / 730);
  const remAfterMonths = remAfterYears % 730;
  const days = Math.floor(remAfterMonths / 24);
  const remAfterDays = remAfterMonths % 24;
  const h = Math.floor(remAfterDays);
  const m = Math.round((remAfterDays - h) * 60);

  let category: 'minutes' | 'hours' | 'days' | 'months' | 'years' = 'hours';
  let faStr = '';
  let enStr = '';

  if (hours >= 8760) {
    category = 'years';
    const yrVal = (hours / 8760).toFixed(1);
    const yrNum = parseFloat(yrVal);
    faStr = `${yrNum.toLocaleString('fa-IR')} سال (${Math.round(hours).toLocaleString('fa-IR')} ساعت)`;
    enStr = `${yrVal} years (${Math.round(hours).toLocaleString()} hours)`;
  } else if (hours >= 720) {
    category = 'months';
    const moVal = (hours / 720).toFixed(1);
    const moNum = parseFloat(moVal);
    faStr = `${moNum.toLocaleString('fa-IR')} ماه (${Math.round(hours).toLocaleString('fa-IR')} ساعت)`;
    enStr = `${moVal} months (${Math.round(hours).toLocaleString()} hours)`;
  } else if (hours >= 24) {
    category = 'days';
    const dayVal = (hours / 24).toFixed(1);
    const dayNum = parseFloat(dayVal);
    const dayInt = Math.floor(hours / 24);
    const hourRem = Math.round(hours % 24);
    if (hourRem > 0 && dayInt < 10) {
      faStr = `${dayInt.toLocaleString('fa-IR')} روز و ${hourRem.toLocaleString('fa-IR')} ساعت (${hours.toFixed(1).toLocaleString()} ساعت)`;
      enStr = `${dayInt} days and ${hourRem} hours (${hours.toFixed(1)} h)`;
    } else {
      faStr = `${dayNum.toLocaleString('fa-IR')} روز (${Math.round(hours).toLocaleString('fa-IR')} ساعت)`;
      enStr = `${dayVal} days (${Math.round(hours).toLocaleString()} h)`;
    }
  } else if (hours >= 1) {
    category = 'hours';
    const hrVal = hours.toFixed(1);
    const hrNum = parseFloat(hrVal);
    const minPart = Math.round((hours % 1) * 60);
    if (minPart > 0 && hours < 5) {
      faStr = `${Math.floor(hours).toLocaleString('fa-IR')} ساعت و ${minPart.toLocaleString('fa-IR')} دقیقه`;
      enStr = `${Math.floor(hours)} hours and ${minPart} min`;
    } else {
      faStr = `${hrNum.toLocaleString('fa-IR')} ساعت`;
      enStr = `${hrVal} hours`;
    }
  } else {
    category = 'minutes';
    const minVal = Math.max(1, Math.round(totalMinutes));
    faStr = `${minVal.toLocaleString('fa-IR')} دقیقه (${(hours * 3600).toFixed(0).toLocaleString()} ثانیه)`;
    enStr = `${minVal} minutes (${(hours * 3600).toFixed(0)} sec)`;
  }

  return {
    fa: faStr,
    en: enStr,
    category,
    breakdown: {
      years,
      months,
      days,
      hours: h,
      minutes: m,
      totalHours,
    },
  };
}

/**
 * Main Stand-up Time Calculator Function
 * Implements the full Bieniawski (1989) correlation
 */
export function calculateStandUpTime(spanMeters: number, rmr: number): CalculationResult {
  const span = Math.max(0.2, Math.min(25, spanMeters));
  const rmrVal = Math.max(0, Math.min(100, rmr));
  const rockClass = getRockClass(rmrVal);

  const { top, bottom } = getAnchorsForRmr(rmrVal);
  const maxAllowableSpan = top.spanMeters;
  const minSpan = bottom.spanMeters;

  const logS = Math.log10(span);
  const logS_top = top.logS;
  const logS_bot = bottom.logS;
  const logT_top = top.logT;
  const logT_bot = bottom.logT;

  let standUpTimeHours: number;
  let status: 'safe' | 'warning' | 'critical' | 'impossible' = 'safe';
  let isFeasible = true;
  let statusMessageFa = '';
  let statusMessageEn = '';

  if (span > maxAllowableSpan * 1.05) {
    // Span is clearly above the upper envelope: impossible unsupported span
    standUpTimeHours = 0.001; // ~3.6 seconds
    status = 'impossible';
    isFeasible = false;
    statusMessageFa = `قطر دهانه (${span} متر) از حداکثر دهانه خودایستای مجاز برای RMR=${rmrVal} (${maxAllowableSpan.toFixed(1)} متر) بیشتر است. ریزش آنی محتمل است و پیش‌نگهداری (فورپولینگ) و شاتکریت فوری الزامی است.`;
    statusMessageEn = `Span (${span}m) exceeds maximum allowable unsupported span for RMR=${rmrVal} (${maxAllowableSpan.toFixed(1)}m). Immediate collapse likely. Pre-support / forepoling mandatory.`;
  } else if (span > maxAllowableSpan) {
    // Exactly bordering envelope
    standUpTimeHours = top.timeHours;
    status = 'critical';
    statusMessageFa = `دهانه در مرز بحرانی منحنی خودایستایی قرار دارد. زمان خودایستایی بسیار محدود است.`;
    statusMessageEn = `Span is near the critical boundary of stand-up time envelope.`;
  } else if (span < minSpan) {
    // Below bottom line: exceptionally stable
    // Extrapolate gently along the RMR slope
    const u = (logS - logS_bot) / (logS_top - logS_bot);
    const logT = logT_bot + u * (logT_top - logT_bot);
    standUpTimeHours = Math.pow(10, logT);
    status = 'safe';
    statusMessageFa = `دهانه در محدوده بسیار ایمن و پایدار با زمان خودایستایی طولانی قرار دارد.`;
    statusMessageEn = `Span is in very safe and stable region with extended stand-up time.`;
  } else {
    // Normal region between bottom and top bounds
    const u = (logS - logS_bot) / (logS_top - logS_bot);
    const logT = logT_bot + u * (logT_top - logT_bot);
    standUpTimeHours = Math.pow(10, logT);

    if (standUpTimeHours < 1) {
      status = 'warning';
      statusMessageFa = `زمان خودایستایی کوتاه (کمتر از ۱ ساعت)؛ نگهداری اولیه باید بلافاصله پس از آتشباری نصب گردد.`;
      statusMessageEn = `Short stand-up time (< 1 hr); primary support must be installed immediately after blasting.`;
    } else if (standUpTimeHours < 24) {
      status = 'warning';
      statusMessageFa = `زمان خودایستایی متوسط (کمتر از ۲۴ ساعت)؛ اجرای سیستم نگهداری در شیفت کاری الزامی است.`;
      statusMessageEn = `Moderate stand-up time (< 24 hrs); install support during current shift.`;
    } else {
      status = 'safe';
      statusMessageFa = `پایداری مناسب توده سنگ؛ فرصت کافی جهت نصب نگهداری منظم بر اساس طراحی مهندسی.`;
      statusMessageEn = `Adequate rock mass stability; sufficient time for systematic support installation.`;
    }
  }

  const timeFormatted = formatStandUpTime(standUpTimeHours);

  return {
    span,
    rmr: rmrVal,
    standUpTimeHours,
    standUpTimeSeconds: standUpTimeHours * 3600,
    formattedTimeFa: timeFormatted.fa,
    formattedTimeEn: timeFormatted.en,
    timeUnitCategory: timeFormatted.category,
    timeBreakdown: timeFormatted.breakdown,
    rockClass,
    isFeasible,
    maxAllowableSpan,
    minSpanAtEnvelope: minSpan,
    status,
    statusMessageFa,
    statusMessageEn,
    pointLogX: Math.log10(Math.max(0.01, standUpTimeHours)),
    pointLogY: Math.log10(span),
  };
}

/**
 * Standard preset geotechnical scenarios
 */
/**
 * Bieniawski (1989) Table 1 (Parameter A.2): Converts RQD (%) to RMR rating (3 to 20)
 */
export function rqdToRmrRating(rqd: number): number {
  const safeRqd = Math.max(0, Math.min(100, rqd));
  if (safeRqd >= 90) return 20;
  if (safeRqd >= 75) return 17;
  if (safeRqd >= 50) return 13;
  if (safeRqd >= 25) return 8;
  return 3;
}

/**
 * Converts Bieniawski RMR RQD rating back to a representative RQD percentage (%)
 */
export function rmrRatingToRqd(rating: number): number {
  switch (rating) {
    case 20: return 95;
    case 17: return 85;
    case 13: return 65;
    case 8: return 40;
    case 3:
    default: return 15;
  }
}

/**
 * Bieniawski (1989) Table 1 (Parameter A.1): Converts Intact Rock UCS (MPa) to RMR rating (0 to 15)
 */
export function ucsToRmrRating(ucs: number): number {
  const safeUcs = Math.max(0, ucs);
  if (safeUcs >= 250) return 15;
  if (safeUcs >= 100) return 12;
  if (safeUcs >= 50) return 7;
  if (safeUcs >= 25) return 4;
  if (safeUcs >= 5) return 2;
  if (safeUcs >= 1) return 1;
  return 0;
}

/**
 * Converts Bieniawski RMR UCS rating back to a representative UCS value (MPa)
 */
export function rmrRatingToUcs(rating: number): number {
  switch (rating) {
    case 15: return 260;
    case 12: return 150;
    case 7: return 75;
    case 4: return 35;
    case 2: return 15;
    case 1: return 3;
    case 0:
    default: return 0.8;
  }
}

/**
 * Bieniawski (1989) Table 1 (Parameter A.3): Converts Discontinuity Spacing (meters) to RMR rating (5 to 20)
 */
export function spacingToRmrRating(spacingM: number): number {
  const safeSpacing = Math.max(0.001, spacingM);
  if (safeSpacing > 2.0) return 20;
  if (safeSpacing >= 0.6) return 15;
  if (safeSpacing >= 0.2) return 10;
  if (safeSpacing >= 0.06) return 8;
  return 5;
}

/**
 * Converts Bieniawski RMR Spacing rating back to representative spacing (meters)
 */
export function rmrRatingToSpacing(rating: number): number {
  switch (rating) {
    case 20: return 2.5;
    case 15: return 1.0;
    case 10: return 0.35;
    case 8: return 0.12;
    case 5:
    default: return 0.04;
  }
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'zagros-tunnel',
    titleFa: 'تونل انتقال آب زاگرس (شیل و مارن خردشده)',
    titleEn: 'Zagros Water Transfer Tunnel (Crushed Shale)',
    descriptionFa: 'دهانه ۴ متری در توده سنگ ضعیف رده IV با هوازدگی و درزه‌داری زیاد',
    descriptionEn: '4m span in Class IV poor rock with intense jointing',
    span: 4.0,
    rmr: 28,
    categoryFa: 'پروژه‌های آبی',
  },
  {
    id: 'tehran-metro',
    titleFa: 'ایستگاه مترو تهران (کنگلومرا و سنگ ضعیف تا متوسط)',
    titleEn: 'Tehran Metro Station (Conglomerate / Weak Rock)',
    descriptionFa: 'دهانه بزرگ ۹.۵ متری در سنگ با کیفیت متوسط رده III',
    descriptionEn: '9.5m large span in Class III fair rock',
    span: 9.5,
    rmr: 52,
    categoryFa: 'حمل و نقل شهری',
  },
  {
    id: 'road-tunnel-alborz',
    titleFa: 'تونل دوقلوی جاده‌ای البرز (ماسه سنگ و آهک)',
    titleEn: 'Alborz Twin Highway Tunnel (Sandstone & Limestone)',
    descriptionFa: 'دهانه استاندارد ۱۱ متری جاده‌ای در سنگ خوب رده II',
    descriptionEn: '11m standard highway span in Class II good rock',
    span: 11.0,
    rmr: 68,
    categoryFa: 'راه‌سازی و آزادراه',
  },
  {
    id: 'deep-mine-drift',
    titleFa: 'دویل و راهروی معدن عمیق (گرانیت سخت)',
    titleEn: 'Deep Mine Drift (Sound Massive Granite)',
    descriptionFa: 'دهانه ۳ متری در سنگ بسیار خوب و مستحکم رده I',
    descriptionEn: '3m drift in Class I massive strong granite',
    span: 3.0,
    rmr: 88,
    categoryFa: 'معدن‌کاری زیرزمینی',
  },
  {
    id: 'fault-zone-tunnel',
    titleFa: 'گذر از پهنه گسلی خردشده (سنگ بسیار ضعیف)',
    titleEn: 'Fault Crush Zone Passage (Very Poor Rock)',
    descriptionFa: 'دهانه ۲.۵ متری با RMR بحرانی ۱۵ (کلاس V)',
    descriptionEn: '2.5m span passing fault gouge (Class V, RMR=15)',
    span: 2.5,
    rmr: 15,
    categoryFa: 'شرایط بحرانی',
  },
];
