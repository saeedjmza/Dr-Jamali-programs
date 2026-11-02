/**
 * Unified Groundwater Hydrogeological Model & Cross-System Mappings
 *
 * Harmonizes groundwater conditions across:
 * 1. Bieniawski (1989) RMR: Groundwater rating (0 to 15)
 * 2. Barton et al. (1974, 2002) Q-system: Joint Water Reduction Factor Jw (0.05 to 1.0)
 * 3. General descriptive state: 'dry' | 'damp' | 'wet' | 'dripping' | 'flowing'
 */

export type GroundwaterConditionKey = 'dry' | 'damp' | 'wet' | 'dripping' | 'flowing';

export interface GroundwaterConditionInfo {
  key: GroundwaterConditionKey;
  rmrRating: number; // 0 to 15
  jwValue: number;   // 0.05 to 1.0
  inflowRangeFa: string;
  inflowRangeEn: string;
  waterPressureRatio: string; // Joint water pressure / major principal stress
  labelFa: string;
  labelEn: string;
  shortLabelFa: string;
  shortLabelEn: string;
  descriptionFa: string;
  descriptionEn: string;
  color: string;
  drainageMeasureFa: string;
  drainageMeasureEn: string;
}

export const GROUNDWATER_CONDITIONS: Record<GroundwaterConditionKey, GroundwaterConditionInfo> = {
  dry: {
    key: 'dry',
    rmrRating: 15,
    jwValue: 1.0,
    inflowRangeFa: 'کاملاً خشک یا جریان ناچیز (< ۵ lit/min)',
    inflowRangeEn: 'Completely dry or minor inflow (< 5 l/min)',
    waterPressureRatio: '< 0.1 (صفر)',
    labelFa: 'کاملاً خشک (RMR: ۱۵ | Jw: ۱.۰)',
    labelEn: 'Completely Dry (RMR: 15 | Jw: 1.0)',
    shortLabelFa: 'خشک',
    shortLabelEn: 'Dry',
    descriptionFa: 'حفاری کاملاً خشک، بدون نشت آب یا جریان جزئی کمتر از ۵ لیتر بر دقیقه.',
    descriptionEn: 'Dry excavations or minor inflow <5 l/min with zero significant water pressure.',
    color: '#10b981', // emerald-500
    drainageMeasureFa: 'بدون نیاز به زهکشی ویژه',
    drainageMeasureEn: 'No special drainage required',
  },
  damp: {
    key: 'damp',
    rmrRating: 10,
    jwValue: 0.66,
    inflowRangeFa: 'مرطوب و نم‌دار (۵ تا ۲۵ lit/min)',
    inflowRangeEn: 'Damp / medium inflow (5 - 25 l/min)',
    waterPressureRatio: '0.1 - 0.2',
    labelFa: 'مرطوب و نم‌دار (RMR: ۱۰ | Jw: ۰.۶۶)',
    labelEn: 'Damp / Moist (RMR: 10 | Jw: 0.66)',
    shortLabelFa: 'مرطوب',
    shortLabelEn: 'Damp',
    descriptionFa: 'درزه‌ها و دیواره‌های نم‌دار با لکه‌های رطوبت و جریان یا فشار آب متوسط با شسته‌شدن گهگاهی درزه‌ها.',
    descriptionEn: 'Damp rock surfaces with medium inflow and occasional joint wash-out.',
    color: '#06b6d4', // cyan-500
    drainageMeasureFa: 'چال‌های زهکشی متناوب و هدایت آب سطحی کف',
    drainageMeasureEn: 'Intermittent drainage relief holes and ditch diversion',
  },
  wet: {
    key: 'wet',
    rmrRating: 7,
    jwValue: 0.5,
    inflowRangeFa: 'خیس با آبدهی ملایم (۲۵ تا ۱۲۵ lit/min)',
    inflowRangeEn: 'Wet / large inflow (25 - 125 l/min)',
    waterPressureRatio: '0.2 - 0.5',
    labelFa: 'خیس با آبدهی درزه‌ها (RMR: ۷ | Jw: ۰.۵)',
    labelEn: 'Wet / Large Inflow (RMR: 7 | Jw: 0.5)',
    shortLabelFa: 'خیس',
    shortLabelEn: 'Wet',
    descriptionFa: 'آبدهی محسوس یا فشار آب در سنگ با درزه‌های نسبتاً تمیز، ریزش مداوم قطرات در سینه کار.',
    descriptionEn: 'Large inflow or water pressure in unfilled joints; active water trickling.',
    color: '#3b82f6', // blue-500
    drainageMeasureFa: 'حفر لوله‌های زهکش سوراخ‌دار (Weep holes) و لایه‌های زهکش نواری پشت شاتکریت',
    drainageMeasureEn: 'Radial perforated weep holes and strip drains behind shotcrete',
  },
  dripping: {
    key: 'dripping',
    rmrRating: 4,
    jwValue: 0.33,
    inflowRangeFa: 'چکه‌کنان شدید با شستشوی درزه (> ۱۲۵ lit/min)',
    inflowRangeEn: 'Dripping / intense inflow (> 125 l/min)',
    waterPressureRatio: '0.5 - 1.0',
    labelFa: 'چکه‌کنان شدید (RMR: ۴ | Jw: ۰.۳۳)',
    labelEn: 'Dripping / Outwash (RMR: 4 | Jw: 0.33)',
    shortLabelFa: 'چکه‌کنان',
    shortLabelEn: 'Dripping',
    descriptionFa: 'جریان مداوم و چکه‌کنان متمرکز با فشار آب بالا و شسته‌شدن شدید مواد پرکننده درزه‌ها.',
    descriptionEn: 'Intense dripping and high water inflow causing outwash of clay joint infillings.',
    color: '#8b5cf6', // purple-500
    drainageMeasureFa: 'چال‌های زهکشی عمیق پیشرو (Sub-horizontal boreholes) و تزریق تحکیمی آب‌بند',
    drainageMeasureEn: 'Deep sub-horizontal face drainage holes and pre-grouting',
  },
  flowing: {
    key: 'flowing',
    rmrRating: 0,
    jwValue: 0.1, // or 0.05
    inflowRangeFa: 'جاری تحت فشار بحرانی و فوران (> ۲۵۰ lit/min)',
    inflowRangeEn: 'Flowing / extreme water burst (> 250 l/min)',
    waterPressureRatio: '> 1.0',
    labelFa: 'جاری و تحت فشار بالا (RMR: ۰ | Jw: ۰.۱)',
    labelEn: 'Flowing / High Inflow (RMR: 0 | Jw: 0.1)',
    shortLabelFa: 'جاری و پرفشار',
    shortLabelEn: 'Flowing',
    descriptionFa: 'آبدهی بسیار شدید، فوران آب از درزه‌ها تحت گرادیان هیدرولیکی بالا و شستشوی سنگ.',
    descriptionEn: 'Continuous severe flowing water under high piezometric head; face instability risk.',
    color: '#ef4444', // red-500
    drainageMeasureFa: 'تزریق سنگین آب‌بند پلی‌یورتان/سیمانی پیشرو و زون‌های زهکشی چتر پیشرو (Pipe canopy & dewatering)',
    drainageMeasureEn: 'Extensive pre-grouting (PU/microfine cement) and umbrella depressurization',
  },
};

/**
 * Maps an RMR groundwater rating (0 to 15) to standard condition key
 */
export function rmrRatingToGroundwaterKey(rating: number): GroundwaterConditionKey {
  if (rating >= 13) return 'dry';
  if (rating >= 9) return 'damp';
  if (rating >= 6) return 'wet';
  if (rating >= 3) return 'dripping';
  return 'flowing';
}

/**
 * Maps a Barton Jw factor (0.05 to 1.0) to standard condition key
 */
export function jwToGroundwaterKey(jw: number): GroundwaterConditionKey {
  if (jw >= 0.85) return 'dry';
  if (jw >= 0.6) return 'damp';
  if (jw >= 0.45) return 'wet';
  if (jw >= 0.25) return 'dripping';
  return 'flowing';
}

/**
 * Converts a condition key to exact RMR groundwater rating (15, 10, 7, 4, 0)
 */
export function groundwaterKeyToRmrRating(key: GroundwaterConditionKey): number {
  return GROUNDWATER_CONDITIONS[key]?.rmrRating ?? 10;
}

/**
 * Converts a condition key to Barton Jw factor (1.0, 0.66, 0.5, 0.33, 0.1)
 */
export function groundwaterKeyToJw(key: GroundwaterConditionKey): number {
  return GROUNDWATER_CONDITIONS[key]?.jwValue ?? 0.66;
}
