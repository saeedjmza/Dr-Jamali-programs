/**
 * Barton Q-System Geomechanics & Stand-up Time Calculation Engine
 * Reference: Barton, Lien & Lunde (1974), Barton (2002), Grimstad & Barton (1993)
 */

import { QClassId, QClassInfo, QCalculationResult, EsrOption, QParameterState, QSupportDetailed } from '../types';
import { formatStandUpTime } from './rmrCalculation';

export const Q_CLASSES: Record<QClassId, QClassInfo> = {
  1: {
    id: 1,
    nameFa: 'بسیار استثنایی خوب (Exceptionally Good)',
    nameEn: 'Exceptionally Good',
    qRange: [400, 1000],
    descriptionFa: 'توده سنگ یکپارچه، بدون درزه یا درزه‌های بسیار ناچیز و کاملاً قفل‌شده تحت تنش مطلوب',
    descriptionEn: 'Massive, intact rock mass with virtually no joints or tightly interlocking joints',
    color: '#059669', // Emerald 600
    bgColor: 'rgba(5, 150, 105, 0.15)',
    borderColor: '#10b981',
    textColor: '#34d399',
    supportCategoryFa: 'رده ۱: بدون نیاز به نگهداری (Unsupported)',
    supportCategoryEn: 'Category 1: Unsupported',
  },
  2: {
    id: 2,
    nameFa: 'فوق‌العاده خوب (Extremely Good)',
    nameEn: 'Extremely Good',
    qRange: [100, 400],
    descriptionFa: 'سنگ بسیار باکیفیت و مستحکم با درزه‌های پراکنده و زبر و خشک',
    descriptionEn: 'Very high quality rock mass with scattered rough, tight and dry joints',
    color: '#10b981', // Emerald 500
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#059669',
    textColor: '#6ee7b7',
    supportCategoryFa: 'رده ۱: بدون نیاز به نگهداری مگر نگهداری موضعی نقطه‌ای',
    supportCategoryEn: 'Category 1: Unsupported / Spot bolting',
  },
  3: {
    id: 3,
    nameFa: 'بسیار خوب (Very Good)',
    nameEn: 'Very Good',
    qRange: [40, 100],
    descriptionFa: 'توده سنگ با درزه‌داری اندک تا متوسط و زبری بالا و مقاومت زیاد',
    descriptionEn: 'Rock mass with slight jointing, high roughness and high shear strength',
    color: '#06b6d4', // Cyan 500
    bgColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: '#0891b2',
    textColor: '#67e8f9',
    supportCategoryFa: 'رده ۲: راک‌بولت‌های موضعی نقطه‌ای (Spot Bolting, sb)',
    supportCategoryEn: 'Category 2: Spot Bolting (sb)',
  },
  4: {
    id: 4,
    nameFa: 'خوب (Good)',
    nameEn: 'Good',
    qRange: [10, 40],
    descriptionFa: 'سنگ با کیفیت خوب، دو دسته درزه با سطوح موج‌دار و بدون لایه هوازده',
    descriptionEn: 'Good rock mass, 2 joint sets, undulating surfaces without soft coatings',
    color: '#3b82f6', // Blue 500
    bgColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#2563eb',
    textColor: '#93c5fd',
    supportCategoryFa: 'رده ۳: راک‌بولت‌های سیستماتیک با فواصل ۲.۵ تا ۳ متر (Systematic Bolting, B)',
    supportCategoryEn: 'Category 3: Systematic Bolting, spacing 2.5 - 3.0m',
  },
  5: {
    id: 5,
    nameFa: 'متوسط (Fair)',
    nameEn: 'Fair',
    qRange: [4, 10],
    descriptionFa: 'توده سنگ معمولی با ۲ تا ۳ دسته درزه، درزه‌های با زبری متوسط و رطوبت کم',
    descriptionEn: 'Fair rock, 2-3 joint sets, moderate roughness and low moisture',
    color: '#eab308', // Amber/Yellow 500
    bgColor: 'rgba(234, 179, 8, 0.15)',
    borderColor: '#ca8a04',
    textColor: '#fde047',
    supportCategoryFa: 'رده ۴: راک‌بولت سیستماتیک با فاصله ۱.۵ تا ۲ متر + شاتکریت الیافی ۲۵ تا ۵0mm در سقف',
    supportCategoryEn: 'Category 4: Systematic bolting 1.5 - 2.0m + Fiber shotcrete 25-50mm',
  },
  6: {
    id: 6,
    nameFa: 'ضعیف (Poor)',
    nameEn: 'Poor',
    qRange: [1, 4],
    descriptionFa: 'توده سنگ با درزه‌داری شدید (۳ دسته درزه یا بیشتر)، پرشدگی‌های رسی نازک و آبدهی موضعی',
    descriptionEn: 'Poor rock, >3 joint sets, thin clay coatings and minor water inflow',
    color: '#f97316', // Orange 500
    bgColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: '#ea580c',
    textColor: '#fdba74',
    supportCategoryFa: 'رده ۵: شاتکریت الیافی ۵۰ تا ۹۰ میلی‌متر + راک‌بولت سیستماتیک با فاصله ۱.۳ تا ۱.۸ متر',
    supportCategoryEn: 'Category 5: Fiber shotcrete 50-90mm + Systematic bolting 1.3 - 1.8m',
  },
  7: {
    id: 7,
    nameFa: 'بسیار ضعیف (Very Poor)',
    nameEn: 'Very Poor',
    qRange: [0.1, 1],
    descriptionFa: 'سنگ خردشده یا هوازده، سطوح صیقلی، گل‌سنگ یا رس فراوان و نشت آب تحت فشار',
    descriptionEn: 'Very poor, slickensided or heavily sheared, swelling clay and water pressure',
    color: '#ef4444', // Red 500
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#dc2626',
    textColor: '#fca5a5',
    supportCategoryFa: 'رده ۶: شاتکریت الیافی ۹۰ تا ۱۲۰ میلی‌متر + راک‌بولت سیستماتیک با فاصله ۱.۰ تا ۱.۳ متر',
    supportCategoryEn: 'Category 6: Fiber shotcrete 90-120mm + Bolting 1.0 - 1.3m',
  },
  8: {
    id: 8,
    nameFa: 'فوق‌العاده ضعیف (Extremely Poor)',
    nameEn: 'Extremely Poor',
    qRange: [0.01, 0.1],
    descriptionFa: 'پهنه گسلی خردشده و فشرده، خمیره رسی ضخیم، تورم شدید یا تنش‌های مچاله‌کننده',
    descriptionEn: 'Fault crush zone, thick clay gouge, strong squeezing or swelling stresses',
    color: '#b91c1c', // Red 700
    bgColor: 'rgba(185, 28, 28, 0.15)',
    borderColor: '#991b1b',
    textColor: '#f87171',
    supportCategoryFa: 'رده ۷ و ۸: شاتکریت الیافی ۱۲۰ تا ۱۵۰ میلی‌متر + قاب‌های شاتکریتی تقویت‌شده (RRS) + بولت با فاصله ۱ متر',
    supportCategoryEn: 'Category 7-8: Fiber shotcrete 120-150mm + Reinforced Ribs of Shotcrete (RRS) + Bolting 1.0m',
  },
  9: {
    id: 9,
    nameFa: 'بسیار استثنایی ضعیف (Exceptionally Poor)',
    nameEn: 'Exceptionally Poor',
    qRange: [0.001, 0.01],
    descriptionFa: 'خاک‌مانند، گل روان گسلی، جریان شدید آب و هجوم مواد روان به داخل مقطع',
    descriptionEn: 'Earth-like, running ground, flowing fault gouge with high water influx',
    color: '#881337', // Rose 900
    bgColor: 'rgba(136, 19, 55, 0.2)',
    borderColor: '#9f1239',
    textColor: '#fda4af',
    supportCategoryFa: 'رده ۹: لاینینگ بتنی مسلح قالبی یا قاب‌های سنگین با بستن آنی کف‌بند و پیش‌نگهداری (فورپولینگ)',
    supportCategoryEn: 'Category 9: Cast concrete lining or heavy steel ribs with immediate invert and spiling',
  },
};

/**
 * Standard ESR (Excavation Support Ratio) options
 */
export const ESR_OPTIONS: EsrOption[] = [
  {
    value: 3.0,
    labelFa: 'فضاهای موقت معدنی (ESR = 3 - 5)',
    labelEn: 'Temporary Mine Openings (ESR = 3 - 5)',
    descriptionFa: 'کارگاه‌های استخراج و راه‌روهای موقت معدنی با دسترسی کنترل‌شده',
    descriptionEn: 'Temporary mine drifts, stopes, sublevels with controlled access',
  },
  {
    value: 1.6,
    labelFa: 'فضاهای دائم معدنی و تونل‌های آب‌بر (ESR = 1.6)',
    labelEn: 'Permanent Mine Openings & Water Tunnels (ESR = 1.6)',
    descriptionFa: 'تونل‌های آب‌بر نیروگاه‌های برق‌آبی، گالری‌های پیشگام و مسیرهای دسترسی دائم معدنی',
    descriptionEn: 'Water tunnels for hydro (non-pressure), pilot tunnels, permanent drifts',
  },
  {
    value: 1.3,
    labelFa: 'تونل‌های فرعی، مخازن و پناهگاه‌ها (ESR = 1.3)',
    labelEn: 'Minor Road/Rail Tunnels, Storage Caverns (ESR = 1.3)',
    descriptionFa: 'تونل‌های جاده‌ای فرعی، تصفیه‌خانه‌ها، مغارهای ذخیره‌سازی نفت و گاز و شفت‌های دسترسی',
    descriptionEn: 'Minor road & railway tunnels, surge chambers, access tunnels, storage caverns',
  },
  {
    value: 1.0,
    labelFa: 'تونل‌های اصلی جاده‌ای و نیروگاه‌ها (ESR = 1.0)',
    labelEn: 'Major Road/Railway & Powerhouses (ESR = 1.0)',
    descriptionFa: 'تونل‌های اصلی آزادراهی و ریلی کشور، مغارهای بزرگ نیروگاه برقابی و تقاطع‌های پرتردد',
    descriptionEn: 'Major highway and railway tunnels, underground powerhouses, civil defence chambers',
  },
  {
    value: 0.8,
    labelFa: 'ایستگاه‌های مترو و فضاهای عمومی (ESR = 0.8)',
    labelEn: 'Metro Stations & Public Facilities (ESR = 0.8)',
    descriptionFa: 'ایستگاه‌های متروی شهری، سالن‌های ورزشی زیرزمینی، کارخانه‌ها و نیروگاه‌های اتمی زیرزمینی',
    descriptionEn: 'Underground railway stations, public assembly facilities, nuclear power stations',
  },
];

/**
 * Parameter options for the Q-System Wizard
 */
export const Q_PARAMETER_OPTIONS = {
  // 1. RQD (0 - 100)
  rqdPresets: [
    { value: 10, labelFa: 'خیلی ضعیف (< ۲۵٪)', labelEn: 'Very Poor (<25%)' },
    { value: 35, labelFa: 'ضعیف (۲۵ - ۵۰٪)', labelEn: 'Poor (25-50%)' },
    { value: 65, labelFa: 'متوسط (۵۰ - ۷۵٪)', labelEn: 'Fair (50-75%)' },
    { value: 85, labelFa: 'خوب (۷۵ - ۹۰٪)', labelEn: 'Good (75-90%)' },
    { value: 95, labelFa: 'عالی (۹۰ - ۱۰۰٪)', labelEn: 'Excellent (90-100%)' },
  ],

  // 2. Jn (Joint Set Number)
  jnOptions: [
    { value: 0.5, labelFa: 'سنگ یکپارچه و بدون درزه (Jn = 0.5 - 1.0)', labelEn: 'Massive, no or few joints (Jn = 0.5-1.0)' },
    { value: 2.0, labelFa: 'یک دسته درزه (Jn = 2.0)', labelEn: 'One joint set (Jn = 2.0)' },
    { value: 3.0, labelFa: 'یک دسته درزه + درزه‌های تصادفی (Jn = 3.0)', labelEn: 'One joint set plus random (Jn = 3.0)' },
    { value: 4.0, labelFa: 'دو دسته درزه (Jn = 4.0)', labelEn: 'Two joint sets (Jn = 4.0)' },
    { value: 6.0, labelFa: 'دو دسته درزه + درزه‌های تصادفی (Jn = 6.0)', labelEn: 'Two joint sets plus random (Jn = 6.0)' },
    { value: 9.0, labelFa: 'سه دسته درزه (Jn = 9.0)', labelEn: 'Three joint sets (Jn = 9.0)' },
    { value: 12.0, labelFa: 'سه دسته درزه + درزه‌های تصادفی (Jn = 12.0)', labelEn: 'Three joint sets plus random (Jn = 12.0)' },
    { value: 15.0, labelFa: 'چهار دسته درزه یا درزه‌داری شدید (Jn = 15.0)', labelEn: 'Four or more joint sets, heavily jointed (Jn = 15.0)' },
    { value: 20.0, labelFa: 'سنگ کاملاً خردشده و شبیه خاک (Jn = 20.0)', labelEn: 'Crushed rock, earth-like (Jn = 20.0)' },
  ],

  // 3. Jr (Joint Roughness Number)
  jrOptions: [
    { value: 4.0, labelFa: 'درزه‌های ناپیوسته و بریده‌بریده (Jr = 4.0)', labelEn: 'Discontinuous joints (Jr = 4.0)' },
    { value: 3.0, labelFa: 'زبر یا نامنظم و موج‌دار (Jr = 3.0)', labelEn: 'Rough or irregular, undulating (Jr = 3.0)' },
    { value: 2.0, labelFa: 'صاف و موج‌دار (Jr = 2.0)', labelEn: 'Smooth, undulating (Jr = 2.0)' },
    { value: 1.5, labelFa: 'صیقلی و موج‌دار / یا زبر و مسطح (Jr = 1.5)', labelEn: 'Slickensided undulating or rough planar (Jr = 1.5)' },
    { value: 1.0, labelFa: 'صاف و مسطح (Jr = 1.0)', labelEn: 'Smooth, planar (Jr = 1.0)' },
    { value: 0.5, labelFa: 'صیقلی، لغزنده و کاملاً مسطح (Jr = 0.5)', labelEn: 'Slickensided, planar (Jr = 0.5)' },
  ],

  // 4. Ja (Joint Alteration Number)
  jaOptions: [
    { value: 0.75, labelFa: 'دیواره‌های کاملاً جوش‌خورده و سخت (Ja = 0.75)', labelEn: 'Tightly healed, hard, non-softening (Ja = 0.75)' },
    { value: 1.0, labelFa: 'دیواره دست‌نخورده، فقط لکه سطحی (Ja = 1.0)', labelEn: 'Unaltered joint walls, surface staining only (Ja = 1.0)' },
    { value: 2.0, labelFa: 'کمی هوازده، بدون مواد نرم‌شونده (Ja = 2.0)', labelEn: 'Slightly altered, non-softening coatings (Ja = 2.0)' },
    { value: 3.0, labelFa: 'پوشش سیلتی یا ماسه‌ای با مقدار کم رس (Ja = 3.0)', labelEn: 'Silty or sandy-clay coatings (Ja = 3.0)' },
    { value: 4.0, labelFa: 'پوشش رسی نرم‌شونده یا با اصطکاک کم (Ja = 4.0)', labelEn: 'Softening or low-friction clay coatings (Ja = 4.0)' },
    { value: 6.0, labelFa: 'لایه ضخیم رس غیرمتورم شنی یا سیلتی (Ja = 6.0)', labelEn: 'Sand or silt thick clay zones (Ja = 6.0)' },
    { value: 8.0, labelFa: 'لایه ضخیم رس متراکم نرم‌شونده (Ja = 8.0)', labelEn: 'Continuous thick clay zones (Ja = 8.0)' },
    { value: 13.0, labelFa: 'لایه ضخیم رس شدیداً متورم‌شونده (Ja = 13.0)', labelEn: 'Swelling clay zones, continuous (Ja = 13.0)' },
  ],

  // 5. Jw (Joint Water Reduction Factor)
  jwOptions: [
    { value: 1.0, labelFa: 'حفاری خشک یا جریان جزئی کمتر از ۵ لیتر/دقیقه (Jw = 1.0)', labelEn: 'Dry excavations or minor inflow <5 l/min (Jw = 1.0)' },
    { value: 0.66, labelFa: 'جریان یا فشار آب متوسط با شسته‌شدن گهگاهی درزه‌ها (Jw = 0.66)', labelEn: 'Medium inflow with occasional outwash (Jw = 0.66)' },
    { value: 0.5, labelFa: 'آبدهی زیاد یا فشار بالا در سنگ با درزه‌های تمیز (Jw = 0.5)', labelEn: 'Large inflow or high pressure in unfilled joints (Jw = 0.5)' },
    { value: 0.33, labelFa: 'آبدهی زیاد با شسته‌شدن شدید پرکننده درزه‌ها (Jw = 0.33)', labelEn: 'Large inflow with considerable outwash of infilling (Jw = 0.33)' },
    { value: 0.2, labelFa: 'آبدهی بسیار زیاد و فشار آب استثنایی اولیه (Jw = 0.2)', labelEn: 'Exceptionally high inflow decaying with time (Jw = 0.2)' },
    { value: 0.05, labelFa: 'آبدهی استثنایی پایدار و بدون افت فشار (Jw = 0.05)', labelEn: 'Exceptionally high inflow continuing without decay (Jw = 0.05)' },
  ],

  // 6. SRF (Stress Reduction Factor)
  srfOptions: [
    { value: 1.0, labelFa: 'تنش متوسط در عمق معقول (۱۰ < σc/σ1 < ۲۰۰) (SRF = 1.0)', labelEn: 'Medium stress at reasonable depth (SRF = 1.0)' },
    { value: 0.5, labelFa: 'تنش اندک در عمق کم و سنگ بدون روباره زیاد (SRF = 0.5)', labelEn: 'Low stress near surface (SRF = 0.5)' },
    { value: 2.5, labelFa: 'تنش‌های کم‌عمق با بازشدگی درزه‌ها یا مناطق تکتونیکی (SRF = 2.5)', labelEn: 'Open joints near surface / tectonic stress (SRF = 2.5)' },
    { value: 5.0, labelFa: 'تنش بالا و احتمال رخداد پوسته‌ریزی (۵ < σc/σ1 < ۱۰) (SRF = 5.0)', labelEn: 'High stress, slabbing & spalling (SRF = 5.0)' },
    { value: 10.0, labelFa: 'تنش مچاله‌کننده یا سنگ‌پرانی متوسط (۲.۵ < σc/σ1 < ۵) (SRF = 10.0)', labelEn: 'Heavy rockburst / moderate squeezing (SRF = 10.0)' },
    { value: 15.0, labelFa: 'فشار مچاله‌کننده یا سنگ‌پرانی شدید (σc/σ1 < ۲.۵) (SRF = 15.0)', labelEn: 'Heavy rockbursting / severe squeezing (SRF = 15.0)' },
    { value: 5.0, labelFa: 'گذر از زون گسلی محتوی رس بدون تورم (SRF = 5.0)', labelEn: 'Weakness zone with non-swelling clay (SRF = 5.0)' },
    { value: 10.0, labelFa: 'گذر از پهنه گسلی محتوی رس شدیداً متورم‌شونده (SRF = 10.0)', labelEn: 'Weakness zone with swelling clay (SRF = 10.0)' },
  ],
};

/**
 * Calculates Q index from 6 parameters
 */
export function calculateQValue(params: QParameterState): number {
  const rqd = Math.max(10, Math.min(100, params.rqd));
  const jn = Math.max(0.5, params.jn);
  const jr = Math.max(0.5, params.jr);
  const ja = Math.max(0.75, params.ja);
  const jw = Math.max(0.05, params.jw);
  const srf = Math.max(0.5, params.srf);

  const q = (rqd / jn) * (jr / ja) * (jw / srf);
  // Clamp between 0.001 and 1000
  return Math.max(0.001, Math.min(1000, q));
}

/**
 * Retrieves Q class object
 */
export function getQClass(q: number): QClassInfo {
  if (q >= 400) return Q_CLASSES[1];
  if (q >= 100) return Q_CLASSES[2];
  if (q >= 40) return Q_CLASSES[3];
  if (q >= 10) return Q_CLASSES[4];
  if (q >= 4) return Q_CLASSES[5];
  if (q >= 1) return Q_CLASSES[6];
  if (q >= 0.1) return Q_CLASSES[7];
  if (q >= 0.01) return Q_CLASSES[8];
  return Q_CLASSES[9];
}

/**
 * Converts Q to equivalent RMR:
 * - Bieniawski correlation: RMR = 9 * ln(Q) + 44
 * - Barton (2002) correlation: RMR = 15 * log10(Q) + 50
 */
export function qToEquivalentRmr(q: number): { rmrBieniawski: number; rmrBarton: number } {
  const safeQ = Math.max(0.001, Math.min(1000, q));
  const rmrBieniawski = Math.max(0, Math.min(100, Math.round(9 * Math.log(safeQ) + 44)));
  const rmrBarton = Math.max(0, Math.min(100, Math.round(15 * Math.log10(safeQ) + 50)));
  return { rmrBieniawski, rmrBarton };
}

/**
 * Converts RMR to equivalent Q:
 * Q = exp((RMR - 44) / 9)
 */
export function rmrToEquivalentQ(rmr: number): number {
  const clampedRmr = Math.max(0, Math.min(100, rmr));
  const q = Math.exp((clampedRmr - 44) / 9);
  return Math.max(0.001, Math.min(1000, parseFloat(q.toFixed(3))));
}

/**
 * Calculates Barton Grimstad Support Guidelines
 */
export function getBartonSupportGuidelines(
  q: number,
  de: number,
  span: number,
  esr: number
): {
  guidelineFa: { category: string; boltSpacing: string; shotcreteThickness: string; summary: string };
  guidelineEn: { category: string; boltSpacing: string; shotcreteThickness: string; summary: string };
} {
  const boltLength = Math.max(1.5, parseFloat((2 + 0.15 * (span / esr)).toFixed(1)));

  if (q >= 100) {
    return {
      guidelineFa: {
        category: 'رده ۱: بدون نگهداری یا نگهداری موضعی (Unsupported)',
        boltSpacing: 'در صورت نیاز به صورت موضعی با طول ' + boltLength + ' متر',
        shotcreteThickness: 'بدون شاتکریت',
        summary: `توده سنگ خودایستاست. نگهداری سیستماتیک لازم نیست.`,
      },
      guidelineEn: {
        category: 'Category 1: Unsupported / Spot Bolting',
        boltSpacing: `Spot bolting if needed (L = ${boltLength}m)`,
        shotcreteThickness: 'None',
        summary: 'Rock mass is naturally self-supporting. No systematic support required.',
      },
    };
  }

  if (q >= 10) {
    return {
      guidelineFa: {
        category: 'رده ۲ و ۳: راک‌بولت سیستماتیک (Systematic Bolting)',
        boltSpacing: `بولت با طول ${boltLength} متر و فواصل ۲.۲ تا ۳.۰ متر`,
        shotcreteThickness: de > 10 ? 'شاتکریت موضعی یا ۲۵ تا ۵۰ میلی‌متر' : 'بدون شاتکریت مگر موضعی',
        summary: `نگهداری سبک با راک‌بولت‌های اصطکاکی یا رزینی.`,
      },
      guidelineEn: {
        category: 'Category 2-3: Systematic Bolting (sb / B)',
        boltSpacing: `Rock bolts L = ${boltLength}m, spacing 2.2 - 3.0m`,
        shotcreteThickness: de > 10 ? 'Spot or 25-50mm shotcrete' : 'None except locally',
        summary: 'Light support utilizing systematic rock bolts.',
      },
    };
  }

  if (q >= 4) {
    return {
      guidelineFa: {
        category: 'رده ۴: راک‌بولت سیستماتیک + شاتکریت الیافی نازک',
        boltSpacing: `بولت با طول ${boltLength} متر و فواصل ۱.۷ تا ۲.۳ متر`,
        shotcreteThickness: 'شاتکریت الیافی (Fiber-reinforced) به ضخامت ۴۰ تا ۵۰ میلی‌متر',
        summary: `ترکیب بهینه بولتینگ منظم با یک لایه شاتکریت الیافی در سقف.`,
      },
      guidelineEn: {
        category: 'Category 4: Systematic Bolting + Thin Fiber Shotcrete',
        boltSpacing: `Rock bolts L = ${boltLength}m, spacing 1.7 - 2.3m`,
        shotcreteThickness: 'Fiber-reinforced shotcrete 40 - 50 mm',
        summary: 'Balanced support combining systematic bolting and crown fiber shotcrete.',
      },
    };
  }

  if (q >= 1) {
    return {
      guidelineFa: {
        category: 'رده ۵: شاتکریت الیافی متوسط + بولت سیستماتیک',
        boltSpacing: `بولت با طول ${boltLength} متر و فواصل ۱.۳ تا ۱.۸ متر`,
        shotcreteThickness: 'شاتکریت الیافی ۵۰ تا ۹۰ میلی‌متر در سقف و دیواره‌ها',
        summary: `نگهداری الاستیک مقاوم با شاتکریت الیافی ساختاری و بولت‌کاری پیوسته.`,
      },
      guidelineEn: {
        category: 'Category 5: Fiber Shotcrete + Systematic Bolting',
        boltSpacing: `Rock bolts L = ${boltLength}m, spacing 1.3 - 1.8m`,
        shotcreteThickness: 'Fiber-reinforced shotcrete 50 - 90 mm',
        summary: 'Durable reinforced support with structural fiber shotcrete and tight bolting.',
      },
    };
  }

  if (q >= 0.1) {
    return {
      guidelineFa: {
        category: 'رده ۶: شاتکریت الیافی ضخیم + بولت متراکم',
        boltSpacing: `بولت با طول ${boltLength} متر و فواصل ۱.۰ تا ۱.۴ متر به همراه مش در صورت نیاز`,
        shotcreteThickness: 'شاتکریت الیافی ۹۰ تا ۱۲۰ میلی‌متر در تمام پیرامون',
        summary: `اجرای سریع شاتکریت پس از انفجار و نصب نگهداری در سینه کار الزامی است.`,
      },
      guidelineEn: {
        category: 'Category 6: Thick Fiber Shotcrete + Dense Bolting',
        boltSpacing: `Rock bolts L = ${boltLength}m, spacing 1.0 - 1.4m`,
        shotcreteThickness: 'Fiber-reinforced shotcrete 90 - 120 mm',
        summary: 'Prompt shotcrete application after excavation and close-face bolting mandatory.',
      },
    };
  }

  if (q >= 0.01) {
    return {
      guidelineFa: {
        category: 'رده ۷ و ۸: شاتکریت ضخیم + دنده‌های تقویت‌شده شاتکریتی (RRS)',
        boltSpacing: `بولت متراکم به طول ${boltLength} متر با فاصله ۰.۸ تا ۱.۱ متر + بولت‌های کف`,
        shotcreteThickness: 'شاتکریت ۱۲۰ تا ۱۵۰ میلی‌متر با دنده‌های مسلح شاتکریتی (RRS)',
        summary: `سنگ شدیداً ضعیف؛ نیاز به پیش‌نگهداری، بستن کف‌بند و اجرای شاتکریت تقویتی RRS.`,
      },
      guidelineEn: {
        category: 'Category 7-8: Reinforced Ribs of Shotcrete (RRS) & Heavy Bolting',
        boltSpacing: `Dense bolting L = ${boltLength}m, spacing 0.8 - 1.1m + invert bolts`,
        shotcreteThickness: 'Shotcrete 120 - 150 mm with Reinforced Ribs of Shotcrete (RRS)',
        summary: 'Extremely poor ground; forepoling, prompt invert closure and RRS ribs required.',
      },
    };
  }

  return {
    guidelineFa: {
      category: 'رده ۹: لاینینگ بتنی مسلح قالبی یا قاب‌های سنگین با بستن سریع کف',
      boltSpacing: 'بولت‌های پیشرو / فورپولینگ و بولت‌کاری کامل تمام مقطع و سینه کار',
      shotcreteThickness: 'شاتکریت بیش از ۱۵۰ میلی‌متر یا بتن‌ریزی قالبی کامل',
      summary: 'خطر هجوم زمین روان یا فروریزش آنی؛ حفاری قطعه‌ای با نگهداری پیشرو اجباری است.',
    },
    guidelineEn: {
      category: 'Category 9: Heavy Cast Concrete Lining / Heavy Steel Arches',
      boltSpacing: 'Spiling / forepoling pipes and face stabilization',
      shotcreteThickness: 'Shotcrete >150mm or full cast-in-place reinforced lining',
      summary: 'Running ground or catastrophic collapse risk; multi-drift excavation mandatory.',
    },
  };
}

/**
 * Returns the effective dimension De along the upper boundary curve:
 * "Average bolt spacing with Sfr"
 * Monotonically connects:
 * (0.001, 25) -> (0.01, 34) -> (0.1, 50) -> (1.0, 68) -> (10.0, 86) -> (40.0, 100)
 */
export function getTopSfrBoundaryDe(q: number): number {
  if (q <= 0.001) return 25.0;
  if (q >= 40.0) return 100.0;
  const logQ = Math.log10(q);
  if (logQ <= -2) {
    const t = (logQ - (-3)) / (-2 - (-3));
    return 25 + t * (34 - 25);
  } else if (logQ <= -1) {
    const t = (logQ - (-2)) / (-1 - (-2));
    return 34 + t * (50 - 34);
  } else if (logQ <= 0) {
    const t = (logQ - (-1)) / (0 - (-1));
    return 50 + t * (68 - 50);
  } else if (logQ <= 1) {
    const t = logQ;
    return 68 + t * (86 - 68);
  } else {
    const t = (logQ - 1) / (1.60206 - 1);
    return 86 + t * (100 - 86);
  }
}

/**
 * Accurate Determination of Barton & Grimstad (NGI) Support Category (1 to 9)
 * Based on empirical (Q, De) domain boundaries from calibrated NGI charts.
 * Characteristic slope m = 0.40 in log10(De) vs log10(Q) space:
 * c = log10(De) - 0.40 * log10(Q)
 * 
 * Category 9 corresponds to the entire region above the "Average bolt spacing with Sfr" curve.
 * Benchmark calibrations:
 * - Q=10, De=10 -> Category 3 (Sfr 5-6 cm, L=3-3.5m, s_without_sfr=2.0m, s_with_sfr=2.3m)
 * - Q=1, De=20  -> Category 5 (Sfr 9-12 cm, L=5.0m, s_without_sfr=1.1m, s_with_sfr=1.7m)
 */
export function determineBartonCategory(q: number, de: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 {
  const safeQ = Math.max(0.001, Math.min(1000, q));
  const safeDe = Math.max(1, Math.min(100, de));

  // Category 9: Special evaluation / Cast concrete lining (CCA)
  // The entire region above the "Average bolt spacing with Sfr" curve
  const topBoundaryDe = getTopSfrBoundaryDe(safeQ);
  if (safeDe >= topBoundaryDe && safeQ <= 40) {
    return 9;
  }

  const logQ = Math.log10(safeQ);
  const logDe = Math.log10(safeDe);

  // Intercept parameter along the thickness lines: c = log10(De) - 0.40 * log10(Q)
  // 25 cm line: c ~ 2.15
  // 15 cm line: c ~ 1.72
  // 12 cm line: c ~ 1.44
  // 9 cm line:  c ~ 1.16
  // 6 cm line:  c ~ 0.67
  // 5 cm line:  c ~ 0.52
  const c = logDe - 0.40 * logQ;

  // Lower unsupported boundary (Barton 2.0 * Q^0.40)
  const unsupportedDe = 2.0 * Math.pow(safeQ, 0.40);

  if (c > 2.15) {
    return 8; // Category 8: Sfr >25 cm + RRS-C
  }
  if (c > 1.72) {
    return 7; // Category 7: Sfr 15-25 cm + RRS-B
  }
  if (c > 1.44) {
    return 6; // Category 6: Sfr 12-15 cm + RRS-A
  }
  if (c > 1.16) {
    return 5; // Category 5: Sfr 9-12 cm, Sfr (E700) + B
  }
  if (c > 0.67) {
    return 4; // Category 4: Sfr 6-9 cm, Sfr (E700) + B
  }
  if (c > 0.52) {
    return 3; // Category 3: Sfr 5-6 cm, B + (Sfr)
  }

  // Region under 5 cm line:
  if (safeDe < unsupportedDe && safeQ >= 0.1) {
    return 1; // Category 1: Unsupported
  }

  return 2; // Category 2: Spot bolting, sb
}

/**
 * High-precision quantitative parameter extraction from the calibrated NGI chart
 */
export interface ExtractedSupportParameters {
  category: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  categoryTitleEn: string;
  categoryTitleFa: string;
  shotcreteThicknessRangeMm: string;
  shotcreteThicknessRangeFa: string;
  continuousThicknessMm: number;
  continuousThicknessCm: number;
  boltLengthM: number;
  boltLengthRoofM: number;
  boltLengthWallM: number;
  boltSpacingM: number;
  boltSpacingWithSfrM: number;
  boltSpacingWithoutSfrM: number;
  boltSpacingTextEn: string;
  boltSpacingTextFa: string;
  energyAbsorptionJ: number | null;
  rrsType: 'RRS-A' | 'RRS-B' | 'RRS-C' | 'None' | 'Special';
  rrsSpacingM: number | null;
  rrsRebarDescriptionEn: string;
  rrsRebarDescriptionFa: string;
}

export function extractExactQSupportParameters(q: number, de: number): ExtractedSupportParameters {
  const safeQ = Math.max(0.001, Math.min(1000, q));
  const safeDe = Math.max(1, Math.min(100, de));
  const logQ = Math.log10(safeQ);
  const logDe = Math.log10(safeDe);

  const category = determineBartonCategory(safeQ, safeDe);

  // Bolt lengths:
  // Roof: L = 2 + 0.15 * De (for De=20, L=5.0m; for De=10, L=3.5m)
  // Wall: L = 2 + 0.10 * De (for De=20, L=4.0m; for De=10, L=3.0m)
  const boltLengthRoofM = Number((2.0 + 0.15 * safeDe).toFixed(1));
  const boltLengthWallM = Number((2.0 + 0.10 * safeDe).toFixed(1));
  // Standard executive length: For De=10 -> 3.0m to 3.5m; For De=20 -> 5.0m
  const boltLengthM = safeDe <= 12 ? boltLengthWallM : boltLengthRoofM;

  // Intercept parameter along the thickness lines: c = log10(De) - 0.40 * log10(Q)
  const c = logDe - 0.40 * logQ;
  let continuousThicknessMm = 0;
  if (c <= 0.52) {
    continuousThicknessMm = 0;
  } else if (c <= 0.67) {
    // 50 mm to 60 mm (5 to 6 cm)
    continuousThicknessMm = Math.round(50 + ((c - 0.52) / (0.67 - 0.52)) * 10);
  } else if (c <= 1.16) {
    // 60 mm to 90 mm (6 to 9 cm)
    continuousThicknessMm = Math.round(60 + ((c - 0.67) / (1.16 - 0.67)) * 30);
  } else if (c <= 1.44) {
    // 90 mm to 120 mm (9 to 12 cm)
    continuousThicknessMm = Math.round(90 + ((c - 1.16) / (1.44 - 1.16)) * 30);
  } else if (c <= 1.72) {
    // 120 mm to 150 mm (12 to 15 cm)
    continuousThicknessMm = Math.round(120 + ((c - 1.44) / (1.72 - 1.44)) * 30);
  } else if (c <= 2.15) {
    // 150 mm to 250 mm (15 to 25 cm)
    continuousThicknessMm = Math.round(150 + ((c - 1.72) / (2.15 - 1.72)) * 100);
  } else {
    // > 250 mm (> 25 cm)
    continuousThicknessMm = Math.round(250 + (c - 2.15) * 120);
  }
  const continuousThicknessCm = Number((continuousThicknessMm / 10).toFixed(1));

  // Precise bolt spacing formulas calibrated against user and NGI specifications:
  // 1) With Sfr:
  //    At Q=1 -> 1.70 m; At Q=10 -> 2.30 m
  const boltSpacingWithSfrM = Number(
    Math.max(1.0, Math.min(2.5, 1.70 * Math.pow(safeQ, 0.131))).toFixed(2)
  );

  // 2) Without Sfr:
  //    At Q=1 -> 1.10 m; At Q=10 -> 2.00 m
  const boltSpacingWithoutSfrM = Number(
    Math.max(0.8, Math.min(4.0, 1.10 * Math.pow(safeQ, 0.260))).toFixed(2)
  );

  // Active recommended spacing depending on whether Sfr is applied in category
  let boltSpacingM = boltSpacingWithSfrM;
  if (category === 1) {
    boltSpacingM = 0;
  } else if (category === 2) {
    boltSpacingM = boltSpacingWithoutSfrM;
  } else if (category >= 3 && category <= 8) {
    boltSpacingM = boltSpacingWithSfrM;
  } else if (category === 9) {
    boltSpacingM = 1.0;
  }

  // Energy absorption
  let energyAbsorptionJ: number | null = null;
  if (category === 6 || category === 7 || category === 8) {
    energyAbsorptionJ = 1000;
  } else if (category === 4 || category === 5) {
    energyAbsorptionJ = 700;
  } else if (category === 3) {
    energyAbsorptionJ = 500;
  }

  // RRS parameters
  let rrsType: 'RRS-A' | 'RRS-B' | 'RRS-C' | 'None' | 'Special' = 'None';
  let rrsSpacingM: number | null = null;
  let rrsRebarDescriptionEn = 'None';
  let rrsRebarDescriptionFa = 'بدون نیاز به ریب‌های مسلح شاتکریتی';

  if (category === 6) {
    rrsType = 'RRS-A';
  } else if (category === 7) {
    rrsType = 'RRS-B';
  } else if (category === 8) {
    rrsType = 'RRS-C';
  } else if (category === 9) {
    rrsType = 'Special';
  }

  if (rrsType !== 'None') {
    if (safeQ <= 0.002) rrsSpacingM = 1.0;
    else if (safeQ <= 0.007) rrsSpacingM = 1.7;
    else if (safeQ <= 0.025) rrsSpacingM = 2.3;
    else if (safeQ <= 0.07) rrsSpacingM = 2.9;
    else rrsSpacingM = 4.0;

    if (rrsType === 'RRS-A') {
      if (safeDe <= 15) {
        rrsRebarDescriptionEn = `Si30/6 Ø16-Ø20 (Single layer 6 rebars, 30cm Sfr, c/c ${rrsSpacingM}m)`;
        rrsRebarDescriptionFa = `یک لایه ۶ میلگرد Ø16-20 با شاتکریت ۳۰cm در فواصل ${rrsSpacingM} متری`;
      } else {
        rrsRebarDescriptionEn = `D40/6+4 Ø16-20 (Double layer, 40cm Sfr, c/c ${rrsSpacingM}m)`;
        rrsRebarDescriptionFa = `دو لایه آرماتور (۶+۴) Ø16-20 با شاتکریت ۴۰cm در فواصل ${rrsSpacingM} متری`;
      }
    } else if (rrsType === 'RRS-B') {
      if (safeDe <= 8) {
        rrsRebarDescriptionEn = `Si35/6 Ø16-20 (Single layer, 35cm Sfr, c/c ${rrsSpacingM}m)`;
        rrsRebarDescriptionFa = `یک لایه ۶ میلگرد Ø16-20 با شاتکریت ۳۵cm در فواصل ${rrsSpacingM} متری`;
      } else if (safeDe <= 15) {
        rrsRebarDescriptionEn = `D45/6+4 Ø16-20 (Double layer, 45cm Sfr, c/c ${rrsSpacingM}m)`;
        rrsRebarDescriptionFa = `دو لایه آرماتور (۶+۴) Ø16-20 با شاتکریت ۴۵cm در فواصل ${rrsSpacingM} متری`;
      } else {
        rrsRebarDescriptionEn = `D55/6+4 Ø20 (Double layer, 55cm Sfr, c/c ${rrsSpacingM}m)`;
        rrsRebarDescriptionFa = `دو لایه آرماتور دوبل Ø20 با شاتکریت ۵۵cm در فواصل ${rrsSpacingM} متری`;
      }
    } else if (rrsType === 'RRS-C') {
      if (safeDe <= 8) {
        rrsRebarDescriptionEn = `D40/6+4 Ø16-20 (Double layer, 40cm Sfr, c/c ${rrsSpacingM}m)`;
        rrsRebarDescriptionFa = `دو لایه آرماتور (۶+۴) Ø16-20 با شاتکریت ۴۰cm در فواصل ${rrsSpacingM} متری`;
      } else if (safeDe <= 15) {
        rrsRebarDescriptionEn = `D55/6+4 Ø20 (Double layer, 55cm Sfr, c/c ${rrsSpacingM}m)`;
        rrsRebarDescriptionFa = `دو لایه آرماتور دوبل Ø20 با شاتکریت ۵۵cm در فواصل ${rrsSpacingM} متری`;
      } else {
        rrsRebarDescriptionEn = 'Special evaluation (Span > 20m, Heavy multi-layer RRS / Invert closure)';
        rrsRebarDescriptionFa = 'ارزیابی ویژه ژئوتکنیکی و لاینینگ بتنی یکپارچه با بسته شدن سریع اینورت';
      }
    } else {
      rrsRebarDescriptionEn = 'Special evaluation';
      rrsRebarDescriptionFa = 'ارزیابی و تحلیل ویژه ساختاری';
    }
  }

  const categoryTitles: Record<number, { en: string; fa: string; rangeEn: string; rangeFa: string }> = {
    1: {
      en: 'Unsupported or spot bolting',
      fa: '۱- بدون نیاز به نگهداری یا بولت‌زنی موضعی',
      rangeEn: 'None (0 mm)',
      rangeFa: 'بدون شاتکریت (۰ میلی‌متر)',
    },
    2: {
      en: 'Spot bolting',
      fa: '۲- بولت‌زنی موضعی (نقطه‌ای)',
      rangeEn: 'None or local flash (0-30 mm)',
      rangeFa: 'بدون شاتکریت (یا پاشش موضعی ۰-۳۰ میلی‌متر)',
    },
    3: {
      en: 'Systematic bolting, fibre reinforced sprayed concrete, 5-6 cm, B + Sfr',
      fa: '۳- بولت‌زنی سیستماتیک، شاتکریت تقویت‌شده با فیبر ۵ تا ۶ سانتیمتر (B + Sfr)',
      rangeEn: '50 - 60 mm (5 - 6 cm)',
      rangeFa: '۵۰ تا ۶۰ میلی‌متر (۵ الی ۶ سانتی‌متر)',
    },
    4: {
      en: 'Fibre reinforced sprayed concrete and bolting, 6-9 cm, Sfr (E700) + B',
      fa: '۴- شاتکریت تقویت‌شده با فیبر و بولت‌زنی، ۶ تا ۹ سانتیمتر (Sfr E700 + B)',
      rangeEn: '60 - 90 mm (6 - 9 cm)',
      rangeFa: '۶۰ تا ۹۰ میلی‌متر (۶ الی ۹ سانتی‌متر)',
    },
    5: {
      en: 'Fibre reinforced sprayed concrete and bolting, 9-12 cm, Sfr (E700) + B',
      fa: '۵- شاتکریت تقویت‌شده با فیبر و بولت‌زنی، ۹ تا ۱۲ سانتیمتر (Sfr E700 + B)',
      rangeEn: '90 - 120 mm (9 - 12 cm)',
      rangeFa: '۹۰ تا ۱۲۰ میلی‌متر (۹ الی ۱۲ سانتی‌متر)',
    },
    6: {
      en: 'Fibre reinforced sprayed concrete and bolting, 12-15 cm + reinforced ribs of sprayed concrete and bolting, Sfr (E1000) + B + RRS-A',
      fa: '۶- شاتکریت تقویت‌شده با فیبر و بولت‌زنی، ۱۲ تا ۱۵ سانتی‌متر + قاب‌های شاتکریت مسلح (Sfr E1000 + B + RRS-A)',
      rangeEn: '120 - 150 mm (12 - 15 cm)',
      rangeFa: '۱۲۰ تا ۱۵۰ میلی‌متر (۱۲ الی ۱۵ سانتی‌متر)',
    },
    7: {
      en: 'Fibre reinforced sprayed concrete >15 cm + reinforced ribs of sprayed concrete and bolting, Sfr (E1000) + B + RRS-B',
      fa: '۷- شاتکریت تقویت‌شده با فیبر > ۱۵ سانتیمتر + قاب‌های شاتکریت مسلح و بولت‌زنی (Sfr E1000 + B + RRS-B)',
      rangeEn: '> 150 mm (> 15 cm)',
      rangeFa: 'بیش از ۱۵۰ میلی‌متر (> ۱۵ سانتی‌متر)',
    },
    8: {
      en: 'Fibre reinforced sprayed concrete >25 cm + double layer of reinforced ribs of sprayed concrete and bolting, Sfr (E1000) + B + RRS-C',
      fa: '۸- شاتکریت تقویت‌شده با فیبر > ۲۵ سانتیمتر + دولایه قاب‌های شاتکریت مسلح و بولت‌زنی (Sfr E1000 + B + RRS-C)',
      rangeEn: '> 250 mm (> 25 cm)',
      rangeFa: 'بیش از ۲۵۰ میلی‌متر (> ۲۵ سانتی‌متر)',
    },
    9: {
      en: 'Special evaluation',
      fa: '۹- ارزیابی ویژه ژئوتکنیکی و سازه‌ای',
      rangeEn: 'Special / Cast concrete lining',
      rangeFa: 'طراحی ویژه / لاینینگ بتن درجا',
    },
  };

  const catMeta = categoryTitles[category];

  const boltSpacingTextEn = `With Sfr: ${boltSpacingWithSfrM} m | Without Sfr: ${boltSpacingWithoutSfrM} m`;
  const boltSpacingTextFa = `با شاتکریت الیافی: ${boltSpacingWithSfrM} متر | بدون شاتکریت: ${boltSpacingWithoutSfrM} متر`;

  return {
    category,
    categoryTitleEn: catMeta.en,
    categoryTitleFa: catMeta.fa,
    shotcreteThicknessRangeMm: catMeta.rangeEn,
    shotcreteThicknessRangeFa: catMeta.rangeFa,
    continuousThicknessMm,
    continuousThicknessCm,
    boltLengthM,
    boltLengthRoofM,
    boltLengthWallM,
    boltSpacingM,
    boltSpacingWithSfrM,
    boltSpacingWithoutSfrM,
    boltSpacingTextEn,
    boltSpacingTextFa,
    energyAbsorptionJ,
    rrsType,
    rrsSpacingM,
    rrsRebarDescriptionEn,
    rrsRebarDescriptionFa,
  };
}

/**
 * Detailed Support Estimation for Fiber Reinforced Shotcrete (Sfr) matching the official NGI chart
 */
export function getBartonSupportDetailed(q: number, span: number, esr: number = 1.0): QSupportDetailed {
  const safeQ = Math.max(0.001, Math.min(1000, q));
  const safeSpan = Math.max(0.5, Math.min(30, span));
  const safeEsr = Math.max(0.5, Math.min(5.0, esr));
  const de = Number((safeSpan / safeEsr).toFixed(2));
  const extracted = extractExactQSupportParameters(safeQ, de);
  const boltLength = extracted.boltLengthM;
  const category = extracted.category;

  switch (category) {
    case 1:
      return {
        category: 1,
        categoryLabelFa: 'رده ۱: بدون نگهداری یا بولت‌زنی موضعی (Unsupported or spot bolting)',
        categoryLabelEn: 'Category 1: Unsupported or spot bolting',
        boltLength,
        de,
        sfr: {
          thicknessMm: 0,
          thicknessRangeFa: extracted.shotcreteThicknessRangeFa,
          thicknessRangeEn: extracted.shotcreteThicknessRangeMm,
          boltSpacingFa: extracted.boltSpacingTextFa,
          boltSpacingEn: extracted.boltSpacingTextEn,
          energyAbsorptionFa: 'بدون نیاز به جذب انرژی دینامیکی',
          energyAbsorptionEn: 'None required',
          rrsTypeFa: 'بدون نیاز به ریب‌های مسلح شاتکریتی',
          rrsTypeEn: 'None required',
          fiberDosageFa: 'عدم نیاز به الیاف',
          fiberDosageEn: 'None',
          summaryFa: 'توده‌سنگ کاملاً خودایستا بوده و نیازی به نصب شاتکریت الیافی یا راک‌بولت عمومی ندارد (تنها لق‌گیری موضعی).',
          summaryEn: 'Rock mass is inherently self-supporting. Unsupported or occasional spot bolting.',
        },
        plain: {
          thicknessMm: 0,
          thicknessRangeFa: 'بدون شاتکریت (۰ میلی‌متر)',
          thicknessRangeEn: 'None (0 mm)',
          boltSpacingFa: 'بدون بولت سیستماتیک',
          boltSpacingEn: 'None',
          meshTypeFa: 'بدون نیاز به توری سیمی یا مش',
          meshTypeEn: 'No wire mesh required',
          steelSetsFa: 'بدون نیاز به قاب فلزی',
          steelSetsEn: 'None',
          summaryFa: 'حفاری تمام‌مقطع بدون نیاز به نگهداری سازه‌ای.',
          summaryEn: 'Full face excavation without support.',
        },
        comparisonSummaryFa: 'سنگ پایدار بوده و نیازی به صرف هزینه برای بتن‌پاشی یا توری فولادی نیست.',
        comparisonSummaryEn: 'The rock mass is stable and unsupported.',
      };

    case 2:
      return {
        category: 2,
        categoryLabelFa: 'رده ۲: بولت‌زنی موضعی نقطه‌ای (Spot bolting)',
        categoryLabelEn: 'Category 2: Spot bolting',
        boltLength,
        de,
        sfr: {
          thicknessMm: 0,
          thicknessRangeFa: extracted.shotcreteThicknessRangeFa,
          thicknessRangeEn: extracted.shotcreteThicknessRangeMm,
          boltSpacingFa: `بولت‌گذاری موضعی با طول ${boltLength} متر (فواصل ۲.۵ تا ۴.۰ متر در صورت نیاز)`,
          boltSpacingEn: `Spot bolts L = ${boltLength}m where needed (spacing 2.5 - 4.0m)`,
          energyAbsorptionFa: 'بدون نیاز به جذب انرژی دینامیکی',
          energyAbsorptionEn: 'None required',
          rrsTypeFa: 'بدون نیاز به دنده‌های RRS',
          rrsTypeEn: 'None',
          fiberDosageFa: 'در صورت شاتکریت موضعی ضد هوازدگی: ۲۰-۳۰ کیلوگرم بر مترمکعب الیاف فولادی',
          fiberDosageEn: 'Local sealing only: 20-30 kg/m³ steel fibers',
          summaryFa: 'مهار موضعی بلوک‌ها و گوه‌های ناپایدار با راک‌بولت‌های نقطه‌ای؛ بدون نیاز به پوشش پیوسته شاتکریت الیافی.',
          summaryEn: 'Spot bolting of isolated wedges; no continuous fiber shotcrete required.',
        },
        plain: {
          thicknessMm: 0,
          thicknessRangeFa: 'بدون شاتکریت عمومی',
          thicknessRangeEn: 'None',
          boltSpacingFa: `بولت‌های موضعی بدون شاتکریت (طول ${boltLength}m)`,
          boltSpacingEn: `Spot bolts without shotcrete`,
          meshTypeFa: 'بدون نیاز به مش سیمی',
          meshTypeEn: 'No wire mesh',
          steelSetsFa: 'بدون قاب فلزی',
          steelSetsEn: 'None',
          summaryFa: 'مهاربندی تک‌بلوک‌ها با راک‌بولت‌های نقطه‌ای.',
          summaryEn: 'Spot rock bolts for localized detached key blocks.',
        },
        comparisonSummaryFa: 'پایداری کلی بسیار خوب است و راک‌بولت‌های نقطه‌ای به تنهایی پاسخگو هستند.',
        comparisonSummaryEn: 'Overall stability is high; spot bolting alone is sufficient.',
      };

    case 3:
      return {
        category: 3,
        categoryLabelFa: 'رده ۳: راک‌بولت سیستماتیک + ۵-۶ سانتی‌متر شاتکریت الیافی (B + Sfr 5-6 cm)',
        categoryLabelEn: 'Category 3: Systematic bolting, fibre reinforced sprayed concrete, 5-6 cm, B + Sfr',
        boltLength,
        de,
        sfr: {
          thicknessMm: extracted.continuousThicknessMm || 55,
          thicknessRangeFa: extracted.shotcreteThicknessRangeFa,
          thicknessRangeEn: extracted.shotcreteThicknessRangeMm,
          boltSpacingFa: `بولت‌گذاری سیستماتیک با طول ${boltLength} متر و فواصل ${extracted.boltSpacingM} متری (Ø20 mm)`,
          boltSpacingEn: `Systematic bolting L = ${boltLength}m, spacing ${extracted.boltSpacingM}m (Ø20 mm)`,
          energyAbsorptionFa: 'E = 500 ژول (آزمون پنل استاندارد اروپایی)',
          energyAbsorptionEn: 'E = 500 J (Standard panel toughness)',
          rrsTypeFa: 'بدون نیاز به ریب‌های مسلح RRS',
          rrsTypeEn: 'None required',
          fiberDosageFa: '۳۰ الی ۳۵ کیلوگرم بر مترمکعب الیاف فولادی دو سر قلاب‌دار',
          fiberDosageEn: '30 - 35 kg/m³ steel fibers',
          summaryFa: 'یک لایه شاتکریت مسلح به الیاف فولادی به ضخامت ۵ الی ۶ سانتی‌متر همراه با شبکه منظم راک‌بولت‌های سیستماتیک.',
          summaryEn: 'Systematic bolting with 5-6 cm steel fiber reinforced shotcrete (B + Sfr).',
        },
        plain: {
          thicknessMm: 50,
          thicknessRangeFa: 'شاتکریت نازک ۵۰ میلی‌متر',
          thicknessRangeEn: '50 mm shotcrete',
          boltSpacingFa: `بولت‌های سیستماتیک با فواصل ۲.۰ تا ۲.۵ متر`,
          boltSpacingEn: `Bolting spaced 2.0 - 2.5m`,
          meshTypeFa: 'بدون مش یا توری موضعی',
          meshTypeEn: 'Spot mesh only',
          steelSetsFa: 'بدون نیاز به قاب فلزی',
          steelSetsEn: 'None',
          summaryFa: 'بولت‌گذاری سیستماتیک همراه با شاتکریت محافظ.',
          summaryEn: 'Pattern bolting with protective shotcrete.',
        },
        comparisonSummaryFa: 'شاتکریت الیافی ۵-۶ سانتی‌متری بلافاصله بعد از آتشباری قوس اولیه پایداری را تأمین می‌کند.',
        comparisonSummaryEn: 'Sfr 5-6 cm provides early structural support combined with systematic bolts.',
      };

    case 4:
      return {
        category: 4,
        categoryLabelFa: 'رده ۴: شاتکریت الیافی ۶-۹ سانتی‌متر + بولت‌زنی سیستماتیک Sfr (E700) + B',
        categoryLabelEn: 'Category 4: Fibre reinforced sprayed concrete and bolting, 6-9 cm, Sfr (E700) + B',
        boltLength,
        de,
        sfr: {
          thicknessMm: extracted.continuousThicknessMm || 75,
          thicknessRangeFa: extracted.shotcreteThicknessRangeFa,
          thicknessRangeEn: extracted.shotcreteThicknessRangeMm,
          boltSpacingFa: `بولت‌های الگویی با طول ${boltLength} متر و فواصل ${extracted.boltSpacingM} متری (Ø20 mm)`,
          boltSpacingEn: `Pattern bolts L = ${boltLength}m, spacing ${extracted.boltSpacingM}m (Ø20 mm)`,
          energyAbsorptionFa: 'E = 700 ژول (کلاس جذب انرژی متوسط-بالا NGI)',
          energyAbsorptionEn: 'E = 700 J (High energy absorption class)',
          rrsTypeFa: 'بدون نیاز به ریب‌های شاتکریتی مسلح RRS',
          rrsTypeEn: 'None required',
          fiberDosageFa: '۳۵ الی ۴۵ کیلوگرم بر مترمکعب الیاف فولادی سازه‌ای',
          fiberDosageEn: '35 - 45 kg/m³ structural steel fibers',
          summaryFa: 'شاتکریت مسلح به الیاف فولادی ۶ تا ۹ سانتی‌متری با ظرفیت جذب انرژی ۷۰۰ ژول همراه با راک‌بولت‌های شبکه‌ای.',
          summaryEn: '6-9 cm fiber-reinforced sprayed concrete (E700) with pattern bolting.',
        },
        plain: {
          thicknessMm: 80,
          thicknessRangeFa: '۵۰ الی ۱۰۰ میلی‌متر شاتکریت معمولی',
          thicknessRangeEn: '50 - 100 mm plain shotcrete',
          boltSpacingFa: `بولت‌ها با فواصل ۱.۶ تا ۲.۰ متر`,
          boltSpacingEn: `Bolts spaced 1.6 - 2.0m`,
          meshTypeFa: 'مش سیمی سبک',
          meshTypeEn: 'Light wire mesh',
          steelSetsFa: 'بدون نیاز به قاب فلزی',
          steelSetsEn: 'None',
          summaryFa: 'شاتکریت سنتی با توری مش سیمی.',
          summaryEn: 'Conventional shotcrete with wire mesh.',
        },
        comparisonSummaryFa: 'حذف مش سیمی دستی در این رده خطرات ایمنی نصب در سقف تازه باز شده را کاملاً برطرف می‌سازد.',
        comparisonSummaryEn: 'Sfr eliminates hazardous wire mesh rigging under newly exposed rock surfaces.',
      };

    case 5:
      return {
        category: 5,
        categoryLabelFa: 'رده ۵: شاتکریت الیافی ۹-۱۲ سانتی‌متر + بولت‌زنی Sfr (E700) + B',
        categoryLabelEn: 'Category 5: Fibre reinforced sprayed concrete and bolting, 9-12 cm, Sfr (E700) + B',
        boltLength,
        de,
        sfr: {
          thicknessMm: extracted.continuousThicknessMm || 105,
          thicknessRangeFa: extracted.shotcreteThicknessRangeFa,
          thicknessRangeEn: extracted.shotcreteThicknessRangeMm,
          boltSpacingFa: `بولت‌گذاری با فواصل ${extracted.boltSpacingM} متری با طول ${boltLength} متر (Ø20 mm)`,
          boltSpacingEn: `Pattern bolts spaced ${extracted.boltSpacingM}m (L = ${boltLength}m, Ø20 mm)`,
          energyAbsorptionFa: 'E = 700 ژول',
          energyAbsorptionEn: 'E = 700 J',
          rrsTypeFa: 'بدون نیاز به دنده‌های RRS',
          rrsTypeEn: 'None required',
          fiberDosageFa: '۴۰ الی ۵۰ کیلوگرم بر مترمکعب الیاف فولادی پرمقاومت',
          fiberDosageEn: '40 - 50 kg/m³ high-tensile steel fibers',
          summaryFa: 'شاتکریت الیافی ساختاری ۹ تا ۱۲ سانتی‌متر با جذب انرژی ۷۰۰ ژول و بولت‌کاری منظم در سرتاسر مقطع.',
          summaryEn: '9-12 cm fiber-reinforced shotcrete (E700) and pattern bolting across crown and walls.',
        },
        plain: {
          thicknessMm: 120,
          thicknessRangeFa: '۱۰۰ الی ۱۵۰ میلی‌متر شاتکریت معمولی',
          thicknessRangeEn: '100 - 150 mm plain shotcrete',
          boltSpacingFa: `بولت‌ها با فواصل ۱.۲ تا ۱.۵ متر`,
          boltSpacingEn: `Bolts spaced 1.2 - 1.5m`,
          meshTypeFa: 'یک لایه مش فولادی سنگین جوش‌شده',
          meshTypeEn: 'Heavy welded wire mesh',
          steelSetsFa: 'بدون قاب فلزی',
          steelSetsEn: 'None',
          summaryFa: 'شاتکریت ساده با مش فولادی سنگین.',
          summaryEn: 'Plain shotcrete with heavy welded wire mesh.',
        },
        comparisonSummaryFa: 'پرت شاتکریت از بالای ۲۰٪ در مش‌بندی سنتی به کمتر از ۷٪ با شاتکریت الیافی کاهش می‌یابد.',
        comparisonSummaryEn: 'Rebound drops from >20% with wire mesh to <7% using steel fiber shotcrete.',
      };

    case 6:
      return {
        category: 6,
        categoryLabelFa: 'رده ۶: شاتکریت الیافی ۱۲-۱۵ سانتی‌متر + قاب‌های شاتکریت مسلح RRS-A و بولت‌زنی (Sfr E1000 + B + RRS-A)',
        categoryLabelEn: 'Category 6: Fibre reinforced sprayed concrete 12-15 cm + RRS-A + bolting, Sfr (E1000) + B + RRS-A',
        boltLength,
        de,
        sfr: {
          thicknessMm: extracted.continuousThicknessMm || 135,
          thicknessRangeFa: extracted.shotcreteThicknessRangeFa,
          thicknessRangeEn: extracted.shotcreteThicknessRangeMm,
          boltSpacingFa: `بولت‌کاری متراکم با فواصل ${extracted.boltSpacingM} متری با طول ${boltLength} متر`,
          boltSpacingEn: `Dense bolts spaced ${extracted.boltSpacingM}m (L = ${boltLength}m)`,
          energyAbsorptionFa: 'E = 1000 ژول (کلاس حداکثر شکل‌پذیری و جذب انرژی ضربه)',
          energyAbsorptionEn: 'E = 1000 J (Maximum toughness class C)',
          rrsTypeFa: `قاب‌های شاتکریت مسلح ${extracted.rrsType} در فواصل ${extracted.rrsSpacingM} متری: ${extracted.rrsRebarDescriptionFa}`,
          rrsTypeEn: `${extracted.rrsType} ribs (c/c ${extracted.rrsSpacingM}m): ${extracted.rrsRebarDescriptionEn}`,
          fiberDosageFa: '۴۵ الی ۵۵ کیلوگرم بر مترمکعب الیاف فولادی پرطاقت',
          fiberDosageEn: '45 - 55 kg/m³ high toughness steel fibers',
          summaryFa: 'شاتکریت الیافی پرطاقت ۱۲ تا ۱۵ سانتی‌متر با جذب انرژی ۱۰۰۰ ژول همراه با قاب‌های مسلح شاتکریتی RRS-A.',
          summaryEn: '12-15 cm Sfr (E1000) integrated with reinforced ribs of sprayed concrete (RRS-A) and systematic bolting.',
        },
        plain: {
          thicknessMm: 150,
          thicknessRangeFa: '۱۵۰ میلی‌متر شاتکریت دولایه با مش دوبل',
          thicknessRangeEn: '150 mm shotcrete with double mesh',
          boltSpacingFa: `بولت‌ها با فواصل ۱.۰ تا ۱.۳ متر`,
          boltSpacingEn: `Bolts spaced 1.0 - 1.3m`,
          meshTypeFa: 'دو لایه مش فولادی Ø6mm',
          meshTypeEn: 'Double layer mesh Ø6mm',
          steelSetsFa: 'خرپاهای مشبک (Lattice Girders)',
          steelSetsEn: 'Lattice girders',
          summaryFa: 'شاتکریت دو قشره سنتی با ۲ سفره مش سنگین.',
          summaryEn: 'Double mesh conventional shotcrete.',
        },
        comparisonSummaryFa: 'ریب‌های شاتکریتی مسلح (RRS-A) جایگزین قاب‌های فولادی سنتی شده و باربری یکپارچه ایجاد می‌کنند.',
        comparisonSummaryEn: 'RRS-A ribs replace steel sets, creating continuous monolithic load transfer.',
      };

    case 7:
      return {
        category: 7,
        categoryLabelFa: 'رده ۷: شاتکریت الیافی بیش از ۱۵ سانتی‌متر + قاب‌های مسلح RRS-B و بولت‌زنی (Sfr E1000 + B + RRS-B)',
        categoryLabelEn: 'Category 7: Fibre reinforced sprayed concrete >15 cm + RRS-B + bolting, Sfr (E1000) + B + RRS-B',
        boltLength,
        de,
        sfr: {
          thicknessMm: extracted.continuousThicknessMm || 175,
          thicknessRangeFa: extracted.shotcreteThicknessRangeFa,
          thicknessRangeEn: extracted.shotcreteThicknessRangeMm,
          boltSpacingFa: `بولت‌کاری فوق‌متراکم با فواصل ${extracted.boltSpacingM} متری با طول ${boltLength} متر`,
          boltSpacingEn: `Dense bolts spaced ${extracted.boltSpacingM}m (L = ${boltLength}m)`,
          energyAbsorptionFa: 'E = 1000 ژول',
          energyAbsorptionEn: 'E = 1000 J',
          rrsTypeFa: `قاب‌های شاتکریت مسلح سنگین ${extracted.rrsType} در فواصل ${extracted.rrsSpacingM} متری: ${extracted.rrsRebarDescriptionFa}`,
          rrsTypeEn: `${extracted.rrsType} ribs (c/c ${extracted.rrsSpacingM}m): ${extracted.rrsRebarDescriptionEn}`,
          fiberDosageFa: '۵۰ الی ۵۵ کیلوگرم بر مترمکعب الیاف فولادی سازه‌ای',
          fiberDosageEn: '50 - 55 kg/m³ structural steel fibers',
          summaryFa: 'شاتکریت الیافی سنگین به ضخامت بیش از ۱۵ سانتی‌متر با ریب‌های تقویتی RRS-B جهت کنترل فشارها و همگرایی‌های شدید.',
          summaryEn: 'Thick Sfr >15 cm with reinforced ribs RRS-B and dense bolting for severe ground conditions.',
        },
        plain: {
          thicknessMm: 200,
          thicknessRangeFa: '۲۰۰ میلی‌متر شاتکریت سه لایه با مش دوبل سنگین',
          thicknessRangeEn: '200 mm shotcrete with heavy double mesh',
          boltSpacingFa: `بولت‌ها با فواصل ۰.۸ تا ۱.۱ متر`,
          boltSpacingEn: `Bolts spaced 0.8 - 1.1m`,
          meshTypeFa: 'دو لایه مش سنگین Ø8mm',
          meshTypeEn: 'Double heavy mesh Ø8mm',
          steelSetsFa: 'قاب‌های فولادی نوردشده HEB 120/140',
          steelSetsEn: 'Rolled steel sets HEB 120/140',
          summaryFa: 'شاتکریت فوق‌ضخیم سنتی با قاب‌های فلزی سنگین.',
          summaryEn: 'Heavy conventional shotcrete with steel sets.',
        },
        comparisonSummaryFa: 'ترکیب Sfr + RRS-B مانع از ایجاد حباب و فضای خالی پشت تیرهای فولادی سنگین می‌شود.',
        comparisonSummaryEn: 'Sfr + RRS-B avoids dangerous void formation behind rolled steel arches.',
      };

    case 8:
      return {
        category: 8,
        categoryLabelFa: 'رده ۸: شاتکریت الیافی بیش از ۲۵ سانتی‌متر + دولایه قاب‌های مسلح RRS-C و بولت‌زنی (Sfr E1000 + B + RRS-C)',
        categoryLabelEn: 'Category 8: Fibre reinforced sprayed concrete >25 cm + double layer RRS-C + bolting, Sfr (E1000) + B + RRS-C',
        boltLength,
        de,
        sfr: {
          thicknessMm: extracted.continuousThicknessMm || 260,
          thicknessRangeFa: extracted.shotcreteThicknessRangeFa,
          thicknessRangeEn: extracted.shotcreteThicknessRangeMm,
          boltSpacingFa: `بولت‌کاری فوق متراکم با فواصل ${extracted.boltSpacingM} متری با طول ${boltLength} متر`,
          boltSpacingEn: `Ultra-dense bolts spaced ${extracted.boltSpacingM}m (L = ${boltLength}m)`,
          energyAbsorptionFa: 'E = 1000 ژول',
          energyAbsorptionEn: 'E = 1000 J',
          rrsTypeFa: `دولایه قاب‌های مسلح شاتکریتی سنگین ${extracted.rrsType} در فواصل ${extracted.rrsSpacingM} متری: ${extracted.rrsRebarDescriptionFa}`,
          rrsTypeEn: `Double layer ${extracted.rrsType} ribs (c/c ${extracted.rrsSpacingM}m): ${extracted.rrsRebarDescriptionEn}`,
          fiberDosageFa: '۵۵ الی ۶۵ کیلوگرم بر مترمکعب الیاف فولادی پرطاقت',
          fiberDosageEn: '55 - 65 kg/m³ high toughness steel fibers',
          summaryFa: 'نگهداری فوق‌سنگین با شاتکریت مسلح الیافی به ضخامت بیش از ۲۵ سانتی‌متر همراه با دولایه ریب مسلح RRS-C در پهنه‌های گسلی و سنگ‌های مچاله‌شونده.',
          summaryEn: 'Heavy support with >25 cm Sfr and double-layer reinforced ribs RRS-C for squeezing rock or fault zones.',
        },
        plain: {
          thicknessMm: 250,
          thicknessRangeFa: 'بیش از ۲۵۰ میلی‌متر بتن‌پاشی سنتی چندمرحله‌ای',
          thicknessRangeEn: '>250 mm multi-stage plain shotcrete',
          boltSpacingFa: `بولت‌های فشرده فواصل ۰.۸ تا ۱.۰ متر`,
          boltSpacingEn: `Dense bolts spaced 0.8 - 1.0m`,
          meshTypeFa: 'سه لایه مش سنگین Ø10mm',
          meshTypeEn: 'Triple layer heavy wire mesh',
          steelSetsFa: 'قاب‌های فولادی سنگین نوردشده HEB 160 با اینورت',
          steelSetsEn: 'Heavy steel sets HEB 160 with invert',
          summaryFa: 'قاب‌های صلب سنگین با بتن‌پاشی ضخیم سنتی.',
          summaryEn: 'Heavy steel arches with multi-layer plain shotcrete.',
        },
        comparisonSummaryFa: 'سیستم Sfr + RRS-C انعطاف و شکل‌پذیری بسیار بهتری تحت بارهای فشاری عظیم تکتونیکی فراهم می‌آورد.',
        comparisonSummaryEn: 'Sfr + RRS-C provides ductile yield capability under extreme tectonic squeezing.',
      };

    case 9:
    default:
      return {
        category: 9,
        categoryLabelFa: 'رده ۹: ارزیابی و تحلیل ویژه ژئوتکنیکی و سازه‌ای (Special evaluation)',
        categoryLabelEn: 'Category 9: Special evaluation',
        boltLength,
        de,
        sfr: {
          thicknessMm: 300,
          thicknessRangeFa: extracted.shotcreteThicknessRangeFa,
          thicknessRangeEn: extracted.shotcreteThicknessRangeMm,
          boltSpacingFa: 'بولت‌های پیشرو / فورپولینگ لوله‌ای چتری، میخ‌کوبی سینه کار و نگهداری ویژه پیرامون',
          boltSpacingEn: 'Pipe umbrella forepoling, face nails and specialized peripheral bolting',
          energyAbsorptionFa: 'E > 1000 ژول',
          energyAbsorptionEn: 'E > 1000 J',
          rrsTypeFa: 'طراحی ویژه مهندسی ژئوتکنیک و لاینینگ بتنی مسلح درجا (CCA)',
          rrsTypeEn: 'Special engineering assessment & Cast Concrete Lining (CCA)',
          fiberDosageFa: 'طراحی اختصاصی مخلوط بتن الیافی',
          fiberDosageEn: 'Special mix design',
          summaryFa: 'شرایط بحرانی توده‌سنگ؛ توصیه‌های طراحی اولیه صرفاً راهنما بوده و نیازمند تحلیل عددی ویژه تنش-کرنش و ارزیابی ژئومکانیکی دقیق است.',
          summaryEn: 'Critical conditions; recommendations are indicative. Specialized rock mechanics and engineering assessments required.',
        },
        plain: {
          thicknessMm: 350,
          thicknessRangeFa: 'لاینینگ بتن مسلح قالبی درجا (CCA) به ضخامت ۳۰۰ الی ۵۰۰ میلی‌متر',
          thicknessRangeEn: 'Cast-in-place reinforced concrete lining (CCA) 300 - 500 mm',
          boltSpacingFa: 'فورپولینگ لوله‌ای چتری و میخ‌کوبی سینه کار',
          boltSpacingEn: 'Pipe umbrella and fiberglass face nails',
          meshTypeFa: 'آرماتوربندی دوبل سنگین میلگرد Ø16-20mm',
          meshTypeEn: 'Double layer rebar cages Ø16-20mm',
          steelSetsFa: 'قاب‌های فولادی فوق‌سنگین HEB 180-200 با اینورت فوری',
          steelSetsEn: 'Extra-heavy steel sets HEB 180-200 with immediate invert',
          summaryFa: 'لاینینگ یکپارچه قالبی بتن مسلح با تثبیت‌های پیشرو.',
          summaryEn: 'Full structural cast-in-place concrete lining.',
        },
        comparisonSummaryFa: 'در این رده نیازمند ارزیابی ویژه و مدل‌سازی ژئومکانیکی و نصب ابزاردقیق پایش همگرایی است.',
        comparisonSummaryEn: 'Special evaluation and numerical convergence modeling are mandatory.',
      };
  }
}

/**
 * 4. Stability Ratio and Status
 */
export function calculateQStandUpTime(
  spanMeters: number,
  qValue: number,
  esrValue: number = 1.0
): QCalculationResult {
  const span = Math.max(0.5, Math.min(25, spanMeters));
  const q = Math.max(0.001, Math.min(1000, qValue));
  const esr = Math.max(0.5, Math.min(5.0, esrValue));

  const equivalentDimension = span / esr;
  const maxUnsupportedDe = 2 * Math.pow(q, 0.4);
  const maxUnsupportedSpan = 2 * esr * Math.pow(q, 0.4);

  const stabilityRatio = maxUnsupportedSpan / span;
  const isSelfSupporting = span <= maxUnsupportedSpan;

  // Barton equivalent RMR
  const { rmrBieniawski, rmrBarton } = qToEquivalentRmr(q);
  const qClass = getQClass(q);

  // Stand-up Time calculation:
  // Derived from Barton & Bieniawski calibrated empirical data:
  // Stand-up time t (hours) is proportional to (Q^1.4 * ESR) / (Span^2.5) with boundary calibration
  let standUpTimeHours: number;
  let status: 'safe' | 'warning' | 'critical' | 'impossible' = 'safe';
  let statusMessageFa = '';
  let statusMessageEn = '';

  if (span > maxUnsupportedSpan * 1.25) {
    // Impossible unsupported span
    standUpTimeHours = 0.002; // ~7 seconds
    status = 'impossible';
    statusMessageFa = `قطر دهانه (${span} متر) بسیار بزرگتر از حداکثر دهانه خودایستای بارتون (${maxUnsupportedSpan.toFixed(1)} متر) است. بازشدگی بدون نگهداری غیرممکن و منجر به فروریزش آنی می‌گردد.`;
    statusMessageEn = `Span (${span}m) significantly exceeds Barton's maximum unsupported span (${maxUnsupportedSpan.toFixed(1)}m). Immediate collapse expected.`;
  } else if (span > maxUnsupportedSpan) {
    // Above unsupported limit: brief stand-up time
    const ratio = span / maxUnsupportedSpan;
    // Decays sharply
    standUpTimeHours = Math.max(0.01, 0.5 / Math.pow(ratio, 4));
    status = 'critical';
    statusMessageFa = `دهانه بالاتر از خط خودایستایی بارتون (S_max = ${maxUnsupportedSpan.toFixed(1)}m) قرار دارد. زمان خودایستایی بسیار کوتاه است و نگهداری اولیه فوری الزامی است.`;
    statusMessageEn = `Span is above Barton's unsupported envelope (${maxUnsupportedSpan.toFixed(1)}m). Stand-up time is critically short.`;
  } else {
    // Within or near unsupported envelope
    // Empirical stand-up time function for Q:
    // log10(t_hours) = 3.5 * log10(Q) - 3.2 * log10(De) + 2.1
    const logT = 3.2 * Math.log10(q) - 2.8 * Math.log10(equivalentDimension) + 2.2;
    standUpTimeHours = Math.max(0.05, Math.pow(10, logT));

    // Cap at reasonable maximum (e.g. 50 years ~ 438,000 hours)
    if (standUpTimeHours > 438000) {
      standUpTimeHours = 438000;
    }

    if (stabilityRatio >= 1.5) {
      status = 'safe';
      statusMessageFa = `دهانه کاملاً در ناحیه پایدار و خودایستا قرار دارد (ضریب خودپایداری = ${stabilityRatio.toFixed(2)}). پایداری طولانی‌مدت تضمین شده است.`;
      statusMessageEn = `Excavation is safely inside the unsupported stable envelope (Stability Ratio = ${stabilityRatio.toFixed(2)}).`;
    } else if (stabilityRatio >= 1.0) {
      status = 'safe';
      statusMessageFa = `دهانه در محدوده خودایستای مجاز بارتون قرار دارد (S_max = ${maxUnsupportedSpan.toFixed(1)}m). زمان کافی برای اجرای سیستم نگهداری مهندسی وجود دارد.`;
      statusMessageEn = `Excavation is within Barton's allowable unsupported span (${maxUnsupportedSpan.toFixed(1)}m).`;
    } else {
      status = 'warning';
      statusMessageFa = `دهانه در نزدیکی حد پایداری قرار دارد؛ پایش مداوم و نصب سیستم نگهداری در شیفت جاری الزامی است.`;
      statusMessageEn = `Span is near the stability threshold; support installation during the current shift is required.`;
    }
  }

  const timeFormatted = formatStandUpTime(standUpTimeHours);
  const boltLength = Math.max(1.5, parseFloat((2 + 0.15 * (span / esr)).toFixed(1)));
  const { guidelineFa, guidelineEn } = getBartonSupportGuidelines(q, equivalentDimension, span, esr);
  const supportDetailed = getBartonSupportDetailed(q, span, esr);

  return {
    span,
    qValue: q,
    esr,
    equivalentDimension: parseFloat(equivalentDimension.toFixed(2)),
    maxUnsupportedSpan: parseFloat(maxUnsupportedSpan.toFixed(2)),
    maxUnsupportedDe: parseFloat(maxUnsupportedDe.toFixed(2)),
    stabilityRatio: parseFloat(stabilityRatio.toFixed(2)),
    isSelfSupporting,
    standUpTimeHours,
    standUpTimeSeconds: standUpTimeHours * 3600,
    formattedTimeFa: timeFormatted.fa,
    formattedTimeEn: timeFormatted.en,
    timeUnitCategory: timeFormatted.category,
    timeBreakdown: timeFormatted.breakdown,
    qClass,
    status,
    statusMessageFa,
    statusMessageEn,
    equivalentRmrBieniawski: rmrBieniawski,
    equivalentRmrBarton: rmrBarton,
    boltLength,
    supportGuidelineFa: guidelineFa,
    supportGuidelineEn: guidelineEn,
    supportDetailed,
    pointLogQ: Math.log10(q),
    pointLogDe: Math.log10(equivalentDimension),
  };
}
