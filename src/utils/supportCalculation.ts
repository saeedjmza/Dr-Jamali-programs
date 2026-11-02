/**
 * Geotechnical Support Calculation Models
 * Methods: RMR (Bieniawski 1989), Q (Barton/NGI), GSI (Hoek et al.),
 * RQD (Deere et al. 1969), Russo et al. (1998)
 */

import {
  RqdSupportResult,
  RussoSupportResult,
  RussoSupportMitigation,
  GsiSupportResult,
  RockClassInfo,
  QCalculationResult,
} from '../types';
import { ROCK_CLASSES } from './rmrCalculation';

/**
 * 1. RQD Support Estimation (Deere et al. 1969 & Merritt 1972)
 * Relates Rock Quality Designation (RQD) to tunnel support requirements
 * and Terzaghi-Deere Rock Load Height Hp = (100 - RQD)/100 * Span
 */
export function calculateRqdSupport(rqd: number, span: number): RqdSupportResult {
  const safeRqd = Math.max(0, Math.min(100, rqd));
  const safeSpan = Math.max(1, span);

  // Terzaghi / Deere Rock Load Height (Hp) in meters
  // Hp ranges from 0 to 1.0 * Span for jointed rock
  const rockLoadHeightHp = Number((((100 - safeRqd) / 100) * safeSpan).toFixed(2));
  const unitWeight = 25; // kN/m3
  const rockLoadPressurePv = Number((rockLoadHeightHp * unitWeight).toFixed(1));

  if (safeRqd >= 90) {
    return {
      rqd: safeRqd,
      span: safeSpan,
      categoryFa: 'بسیار عالی (Excellent Quality)',
      categoryEn: 'Excellent (RQD 90-100%)',
      qualityGrade: 'I',
      color: '#10b981',
      rockLoadHeightHp,
      rockLoadPressurePv,
      rockBoltsFa: 'بدون نیاز به راک‌بولت عمومی؛ فقط بولت‌گذاری موردی (Spot Bolting) برای قطعات لق',
      rockBoltsEn: 'No systematic bolting required; occasional spot bolts for loose blocks',
      shotcreteFa: 'بدون شاتکریت (در صورت حساسیت به هواخوردگی لایه نازک ۳۰ میلی‌متری محافظتی)',
      shotcreteEn: 'None required; local 30mm seal if slaking susceptible',
      steelSetsFa: 'بدون نیاز به قاب فولادی',
      steelSetsEn: 'None',
      recommendationFa: 'توده‌سنگ کاملاً یکپارچه با پایداری عالی؛ حفاری تمام‌مقطع با آتشباری کنترل‌شده',
      recommendationEn: 'Massive intact rock with excellent stability; full face excavation with smooth blasting',
    };
  } else if (safeRqd >= 75) {
    return {
      rqd: safeRqd,
      span: safeSpan,
      categoryFa: 'خوب (Good Quality)',
      categoryEn: 'Good (RQD 75-90%)',
      qualityGrade: 'II',
      color: '#34d399',
      rockLoadHeightHp,
      rockLoadPressurePv,
      rockBoltsFa: 'بولت‌های موضعی یا شبکه‌ای با فاصله ۲.۰ الی ۲.۵ متر با طول تقریبی ' + (2 + 0.15 * safeSpan).toFixed(1) + ' متر',
      rockBoltsEn: 'Pattern or local rock bolts spaced 2.0-2.5m, length approx ' + (2 + 0.15 * safeSpan).toFixed(1) + 'm',
      shotcreteFa: 'شاتکریت موضعی در سقف به ضخامت ۳۰ الی ۵۰ میلی‌متر',
      shotcreteEn: 'Local shotcrete in crown 30-50mm',
      steelSetsFa: 'بدون نیاز به قاب‌های فولادی',
      steelSetsEn: 'None',
      recommendationFa: 'حفاری تمام‌مقطع با پیشروی ۲ الی ۳ متر؛ نصب نگهداری در فاصله ۱۰ تا ۲۰ متری جبهه‌کار',
      recommendationEn: 'Full face excavation with 2-3m advance; install support within 10-20m from face',
    };
  } else if (safeRqd >= 50) {
    return {
      rqd: safeRqd,
      span: safeSpan,
      categoryFa: 'متوسط (Fair Quality)',
      categoryEn: 'Fair (RQD 50-75%)',
      qualityGrade: 'III',
      color: '#f59e0b',
      rockLoadHeightHp,
      rockLoadPressurePv,
      rockBoltsFa: 'بولت‌گذاری سیستماتیک الگویی با فاصله ۱.۵ الی ۲.۰ متر در سقف و دیواره‌ها به طول ' + (2.5 + 0.15 * safeSpan).toFixed(1) + ' متر',
      rockBoltsEn: 'Systematic pattern bolts 1.5-2.0m spacing in crown and walls, length ' + (2.5 + 0.15 * safeSpan).toFixed(1) + 'm',
      shotcreteFa: 'شاتکریت به ضخامت ۵۰ الی ۱۰۰ میلی‌متر در تاج و ۳۰ میلی‌متر در دیواره‌ها به همراه توری سیمی',
      shotcreteEn: 'Shotcrete 50-100mm in crown, 30mm in sidewalls with welded wire mesh',
      steelSetsFa: 'معمولاً بدون قاب فولادی (تنها در صورت وجود زون‌های گسله موضعی قاب سبک)',
      steelSetsEn: 'Generally none, light ribs only in local sheared sections',
      recommendationFa: 'حفاری نیمه‌مقطع (پله‌ای) با پیشروی ۱.۵ تا ۲.۰ متر؛ نصب بلادرنگ شاتکریت اولیه',
      recommendationEn: 'Top heading and bench with 1.5-2.0m advance; apply sealing shotcrete immediately',
    };
  } else if (safeRqd >= 25) {
    return {
      rqd: safeRqd,
      span: safeSpan,
      categoryFa: 'ضعیف (Poor Quality)',
      categoryEn: 'Poor (RQD 25-50%)',
      qualityGrade: 'IV',
      color: '#f97316',
      rockLoadHeightHp,
      rockLoadPressurePv,
      rockBoltsFa: 'بولت‌گذاری سیستماتیک متراکم با فواصل ۱.۰ الی ۱.۲ متر در سقف و دیواره‌ها با تزریق کامل',
      rockBoltsEn: 'Dense pattern bolts 1.0-1.2m spacing, fully grouted with steel faceplates',
      shotcreteFa: 'شاتکریت مسلح الیافی یا دو لایه مش به ضخامت ۱۰۰ الی ۱۵۰ میلی‌متر',
      shotcreteEn: 'Fiber reinforced shotcrete or 2 mesh layers, thickness 100-150mm',
      steelSetsFa: 'قاب‌های فولادی سبک تا متوسط با فاصله ۱.۲ الی ۱.۵ متر با میل‌مهار پایه‌ها',
      steelSetsEn: 'Light to medium steel ribs spaced 1.2-1.5m with base plates',
      recommendationFa: 'حفاری طاق و پله با پیشروی محدود ۱.۰ متری؛ الزام به نصب سیستم نگهداری بلافاصله پس از آتشباری',
      recommendationEn: 'Top heading and bench with 1.0m rounds; immediate support installation after blast',
    };
  } else {
    return {
      rqd: safeRqd,
      span: safeSpan,
      categoryFa: 'بسیار ضعیف و خردشده (Very Poor Quality)',
      categoryEn: 'Very Poor (RQD 0-25%)',
      qualityGrade: 'V',
      color: '#ef4444',
      rockLoadHeightHp,
      rockLoadPressurePv,
      rockBoltsFa: 'بولت‌گذاری سنگین با تزریق رزین/سیمان به همراه فورپولینگ (پیش‌نگهداری چتری سقف)',
      rockBoltsEn: 'Heavy pattern grouted bolts with spiling/forepoling umbrellas',
      shotcreteFa: 'شاتکریت ضخیم ۱۵۰ الی ۲۵۰ میلی‌متر در سقف، دیواره‌ها و آب‌بندی جبهه‌کار با مش دوبل',
      shotcreteEn: 'Heavy shotcrete 150-250mm with double mesh and face sealing',
      steelSetsFa: 'قاب‌های فولادی سنگین (HEB/IPN) با فاصله ۰.۶ الی ۰.۸ متر به همراه کف‌بند صلب (Invert Strut)',
      steelSetsEn: 'Heavy steel sets (HEB) spaced 0.6-0.8m with immediate closed invert strut',
      recommendationFa: 'حفاری چندمرحله‌ای (Multiple Drifts) با پیشروی کمتر از ۱ متر و پیش‌تزریق یا فورپولینگ',
      recommendationEn: 'Multi-drift sequential excavation with forepoling and rapid invert closure',
    };
  }
}

/**
 * Russo et al. (2014) Mitigation measures database (Table 3 in paper)
 */
export const RUSSO_MITIGATIONS_DATABASE: Record<string, RussoSupportMitigation> = {
  Ma1: {
    code: 'Ma1',
    category: 'Ma',
    titleFa: 'لق‌گیری و شاتکریت آب‌بند سینه کار',
    titleEn: 'Scaling & face sealing shotcrete',
    descFa: 'لق‌گیری سیستماتیک بلوک‌های ناپایدار و پاشش شاتکریت ۳۰ تا ۵۰ میلی‌متر جهت آب‌بندی و پایداری موقت سینه کار',
    descEn: 'Systematic scaling of loose blocks and application of 30-50mm sealing shotcrete on the tunnel face',
  },
  Ma2: {
    code: 'Ma2',
    category: 'Ma',
    titleFa: 'زه‌کشی پیشاپیش سینه کار',
    titleEn: 'Drainage ahead of face',
    descFa: 'حفر گمانه‌های زه‌کشی ساب‌افقی پیشاپیش جبهه‌کار جهت افت فشار آب منفذی و جلوگیری از هجوم آب تحت فشار',
    descEn: 'Sub-horizontal borehole drainage ahead of the tunnel face to depressurize water inflow',
  },
  Ma3: {
    code: 'Ma3',
    category: 'Ma',
    titleFa: 'تسطیح و مسلح‌سازی سینه کار با فایبرگلاس',
    titleEn: 'Face reinforcement with fiberglass elements',
    descFa: 'نصب میخ‌های فایبرگلاس سازه‌ای در سینه کار جهت کنترل اکستروژن (جلوآمدگی) و افزایش پایداری هسته خاکی',
    descEn: 'Structural fiberglass nails/dowels installed at tunnel face to prevent face extrusion',
  },
  Ma4: {
    code: 'Ma4',
    category: 'Ma',
    titleFa: 'پیش‌نگهداری چتری فورپولینگ با لوله‌های فولادی',
    titleEn: 'Core pre-confinement / Pipe umbrella forepoling',
    descFa: 'اجرای چتر لوله‌های فولادی قطر ۱۱۴ تا ۱۴۰ میلی‌متر تزریق‌شده در طاق سقف با هم‌پوشانی طولی جهت ایجاد سقف محافظ',
    descEn: 'Grout-injected steel pipe umbrella canopy (114-140mm) over crown before excavating round',
  },
  Ma5: {
    code: 'Ma5',
    category: 'Ma',
    titleFa: 'میله‌های رانشی و میکروپایل‌های سقفی (Spiles)',
    titleEn: 'Crown spiling / sub-horizontal micropiles',
    descFa: 'کوبیدن یا حفر میله‌های فولادی آجدار ۲۵ تا ۳۲ میلی‌متر (Spiling) در طاق جهت محافظت در برابر ریزش‌های سقفی در گام بعدی',
    descEn: 'Drilled or driven steel spiles (25-32mm) in crown perimeter ahead of excavation face',
  },
  Ma6: {
    code: 'Ma6',
    category: 'Ma',
    titleFa: 'تزریق تحکیمی شیمیایی یا سیمانی پیشاپیش',
    titleEn: 'Chemical / cementitious pre-grouting',
    descFa: 'تزریق پیشاپیش دوغاب میکروسیمان یا رزین‌های پلی‌اورتان/سیلیکات در توده‌سنگ خردشده جهت همگرایی و چسبندگی ذرات',
    descEn: 'Microfine cement or polyurethane resin pre-injection into fractured rock mass ahead of tunnel',
  },
  Ma7: {
    code: 'Ma7',
    category: 'Ma',
    titleFa: 'چتر ستون‌های جت گروتینگ',
    titleEn: 'Sub-horizontal jet grouting canopy',
    descFa: 'اجرای ستون‌های ساب‌افقی جت گروتینگ در زمین‌های کاملاً خردشده با چسبندگی صفر و آبدار',
    descEn: 'Sub-horizontal jet-grouted column canopy in cohesionless water-bearing cataclastic ground',
  },
  Ma8: {
    code: 'Ma8',
    category: 'Ma',
    titleFa: 'آتشباری تنش‌زدایی و شیارهای تخلیه تنش',
    titleEn: 'Destressing blasting / stress relief holes',
    descFa: 'چال‌های موازی تنش‌زدایی یا انفجار رهایش تنش در سینه کار جهت انتقال تمرکز تنش مماسی به عمق و پیشگیری از پرتاب سنگ',
    descEn: 'Drilled relief holes or destress blasting to shift extreme tangential stress peaks deeper into rock mass',
  },
  Mb1: {
    code: 'Mb1',
    category: 'Mb',
    titleFa: 'بستن سریع قوس اینورت در فاصله کوتاه از جبهه‌کار',
    titleEn: 'Rapid structural invert arch closure',
    descFa: 'اجرای بتن‌ریزی اینورت قوسی سازه‌ای در فاصله کمتر از یک تا ۱.۵ برابر دهانه تونل برای بستن رینگ تنش',
    descEn: 'Structural concrete invert arch closure within 1.0-1.5 excavation spans from working face',
  },
  Mb2: {
    code: 'Mb2',
    category: 'Mb',
    titleFa: 'مقطع سازه‌ای با رینگ دایروی بسته کامل',
    titleEn: 'Full ring closed circular / rounded profile',
    descFa: 'طراحی هندسه مقطع حفاری به شکل دایروی یا نعل‌اسبی متقارن جهت توزیع یکنواخت فشارهای هیدرواستاتیک بالا',
    descEn: 'Circular or rounded cross-section geometry with continuous closed support ring',
  },
  Mb3: {
    code: 'Mb3',
    category: 'Mb',
    titleFa: 'بولت‌گذاری موضعی یا الگوی سبک مهار گوه‌ها',
    titleEn: 'Spot or light pattern bolting',
    descFa: 'نصب راک‌بولت‌های اصطکاکی یا تزریقی در مواضع محتمل لغزش گوه‌ها به طول ۲ تا ۳ متر',
    descEn: 'Spot or light pattern rockbolts (2.0-3.0m) to anchor structurally detached rock wedges',
  },
  Mb4: {
    code: 'Mb4',
    category: 'Mb',
    titleFa: 'قاب‌های فولادی تسلیم‌پذیر لغزنده (TH Arches)',
    titleEn: 'Yielding sliding steel arches (TH sets)',
    descFa: 'نصب قاب‌های پروفیل TH با اتصالات لغزنده اصطکاکی جهت تسلیم کنترل‌شده و مهار فشردگی سنگ بدون کمانش',
    descEn: 'Sliding friction-clamped TH steel sets allowing controlled deformation under severe squeezing',
  },
  Mb5: {
    code: 'Mb5',
    category: 'Mb',
    titleFa: 'قاب‌های فولادی سنگین نوردشده یا خرپای مشبک',
    titleEn: 'Steel arches / lattice girders',
    descFa: 'قاب‌های فولادی استاندارد (HEB/IPN) یا خرپای مشبک فولادی مدفون در شاتکریت با فواصل ۰.۸ تا ۱.۵ متر',
    descEn: 'Standard steel arches (HEB/IPN) or lattice girders embedded in shotcrete lining',
  },
  Mb6: {
    code: 'Mb6',
    category: 'Mb',
    titleFa: 'بولت‌های دینامیکی تسلیم‌پذیر و مش ضد پرتاب سنگ',
    titleEn: 'Yielding dynamic bolts & wire mesh for spalling',
    descFa: 'راک‌بولت‌های جاذب انرژی تسلیم‌پذیر (D-Bolt/Swellex) با پلیت‌های تقویت‌شده و توری مش فولادی مقاوم به شوک دینامیکی',
    descEn: 'Energy-absorbing yielding rock bolts (D-bolts, Swellex) and heavy mesh to contain rockburst ejections',
  },
  Mb7: {
    code: 'Mb7',
    category: 'Mb',
    titleFa: 'شاتکریت مسلح به الیاف فولادی سازه‌ای (SFR)',
    titleEn: 'Fiber-reinforced shotcrete (SFR)',
    descFa: 'پاشش شاتکریت مسلح به الیاف فولادی با شکل‌پذیری بالا و جذب انرژی به ضخامت ۵۰ تا ۲۰۰ میلی‌متر',
    descEn: 'Structural steel fiber reinforced shotcrete (50-200mm) providing high ductile residual strength',
  },
  Mb8: {
    code: 'Mb8',
    category: 'Mb',
    titleFa: 'پوشش تغییرشکل‌پذیر با المان‌های جاذب انرژی',
    titleEn: 'Heavy ductile energy-absorbing lining',
    descFa: 'پوشش با المان‌های تسلیم‌پذیر تراکم‌پذیر (مانند HiDCon یا لوله‌های جاذب بار) جهت مستهلک کردن بارهای بسیار بالا',
    descEn: 'Heavy ductile support incorporating crushable compressible elements to absorb extreme convergence',
  },
};

/**
 * 2. Russo (2014) Method - "An update of the 'multiple graph' approach for the
 * preliminary assessment of the excavation behaviour in rock tunnelling"
 * Tunnelling and Underground Space Technology 41 (2014) 74–81.
 *
 * Implements the full 4-Quadrant Multiple Graph approach:
 * - Graph 1: Rock mass fabric (GSI, JP, Vb, jC)
 * - Graph 2: Rock mass strength (Scm = Sc * s^a) & Spalling / Rockburst boundary (IF > 8, Sc >= 60, GSI >= 60)
 * - Graph 3: Competency Index IC = Scm / (2*gamma*H) & face extrusion strain delta_0 & plastic radius Rp/R0
 * - Graph 4: Excavation Behaviour & Section Types (ST = A, B, C1, C2, C3, C4, D, E, F) and Hazards (H1, H2, H3, H4)
 */
export function calculateRussoSupport(
  gsi: number,
  span: number,
  depth: number = 250,
  ucs: number = 65,
  unitWeight: number = 25,
  kRatio: number = 1.0,
  brittlenessIndexIf: number = 10
): RussoSupportResult {
  const safeGsi = Math.max(5, Math.min(95, gsi));
  const safeSpan = Math.max(1, span);
  const safeDepth = Math.max(10, depth);
  const safeUcs = Math.max(2, ucs);
  const safeGamma = Math.max(15, unitWeight);
  const safeK = Math.max(0.3, Math.min(3.0, kRatio));
  const safeIf = Math.max(2, brittlenessIndexIf);

  // Hoek-Brown 2002 parameters
  const sHoek = Math.exp((safeGsi - 100) / 9);
  const aHoek = 0.5 + (Math.exp(-safeGsi / 15) - Math.exp(-20 / 3)) / 6;
  const jpParameter = Number(Math.pow(sHoek, aHoek).toFixed(4));

  // Rock mass compressive strength Scm (MPa)
  const rockMassStrengthScm = Number((safeUcs * Math.pow(sHoek, aHoek)).toFixed(2));

  // In situ vertical stress sigma_v (MPa)
  const verticalStressSigmaV = Number(((safeGamma * safeDepth) / 1000).toFixed(2));

  // Maximum boundary tangential stress sigma_theta (MPa)
  // For hydrostatic k=1: sigma_theta = 2 * sigma_v
  // For anisotropic k: sigma_theta_max = (3 - k) * sigma_v (at tunnel crown for k < 1) or (3k - 1)*sigma_v
  let tangentialStressSigmaTheta: number;
  if (safeK === 1.0) {
    tangentialStressSigmaTheta = Number((2 * verticalStressSigmaV).toFixed(2));
  } else if (safeK < 1.0) {
    tangentialStressSigmaTheta = Number(((3 - safeK) * verticalStressSigmaV).toFixed(2));
  } else {
    tangentialStressSigmaTheta = Number(((3 * safeK - 1) * verticalStressSigmaV).toFixed(2));
  }
  tangentialStressSigmaTheta = Math.max(0.1, tangentialStressSigmaTheta);

  // Competency Index IC = Scm / sigma_theta
  const competencyIndexIc = Number((rockMassStrengthScm / tangentialStressSigmaTheta).toFixed(2));

  // Stress to intact strength ratio (for brittle failure / spalling / rockburst assessment)
  const stressStrengthRatio = Number((tangentialStressSigmaTheta / safeUcs).toFixed(2));

  // Radial extrusion deformation at tunnel face delta_0 (%) (Eq. 12 in Russo 2014)
  const radialDeformationDelta0 = Number(
    (0.006 * Math.pow(Math.max(0.01, competencyIndexIc), -1.45)).toFixed(2)
  );

  // Normalized plastic radius Rp / R0 (Eq. 13 in Russo 2014)
  const plasticRadiusRatio = Number(
    (0.99 * Math.pow(Math.max(0.01, competencyIndexIc), -0.44)).toFixed(2)
  );

  // Approximate correlation to RMR (Eq. 9-10 in Russo 2014)
  const estimatedRmr = Math.min(100, Math.max(5, Math.round(0.65 * safeGsi + 20)));

  // Section Type & Hazard determination based on Russo 2014 decision matrix
  let classCode: 'A' | 'B' | 'C1' | 'C2' | 'C3' | 'C4' | 'D' | 'E' | 'F';
  let sectionType: string;
  let classNameFa: string;
  let classNameEn: string;
  let hazardCode: 'H1' | 'H2' | 'H3' | 'H4';
  let hazardNameFa: string;
  let hazardNameEn: string;
  let hazardDescFa: string;
  let hazardDescEn: string;
  let behaviorFa: string;
  let behaviorEn: string;
  let behaviorDomain: 'elastic' | 'elastic_plastic' | 'plastic' | 'brittle_failure' | 'collapse';
  let color: string;
  let mitigationCodes: string[];
  let excavationMethodFa: string;
  let excavationMethodEn: string;
  let advanceRate: string;
  let radialBolting: string;
  let radialBoltingFa: string = '';
  let radialBoltingEn: string = '';
  let shotcreteLining: string;
  let shotcreteLiningFa: string = '';
  let shotcreteLiningEn: string = '';
  let steelRibs: string;
  let steelRibsFa: string = '';
  let steelRibsEn: string = '';
  let invertRequirement: string;
  let invertRequirementFa: string = '';
  let invertRequirementEn: string = '';
  let safetyConsiderationsFa: string;
  let safetyConsiderationsEn: string;

  // 1. Check for immediate collapse / cataclastic rock mass (Domain f / Fe)
  if (safeGsi < 25 || estimatedRmr <= 20) {
    classCode = 'F';
    sectionType = 'ST = F / Fe';
    classNameFa = 'رده F / Fe - ناپایداری شدید گرانشی و خطر ریزش فوری سینه کار (Cataclastic / Flowing Ground)';
    classNameEn = 'ST = F / Fe - Severe gravity-driven instability & flowing ground';
    hazardCode = 'H4';
    hazardNameFa = 'مخاطره H4: ریزش گسترده گرانشی و جریان گل/سنگ خردشده (Caving & Flowing Ground)';
    hazardNameEn = 'Hazard H4: Massive gravity caving & flowing / running ground';
    hazardDescFa = 'توده‌سنگ کاتاکلاستیک گسله با مقاومت پیوستگی ناچیز تحت فشار آب و روباره؛ خطر حفرات گنبدی (Chimneying)';
    hazardDescEn = 'Completely crushed fault gouge with near-zero cohesion; immediate face ravelling under water pressure';
    behaviorDomain = 'collapse';
    color = '#dc2626';
    mitigationCodes = ['Ma1', 'Ma2', 'Ma3', 'Ma4', 'Ma5', 'Ma6', 'Mb1', 'Mb2', 'Mb5', 'Mb7', 'Mb8'];
    advanceRate = '0.5 - 0.8 m';
    excavationMethodFa = 'حفاری مقطعی با پیش‌تحکیم کامل جبهه‌کار (چتر فورپولینگ لوله‌ای و میخ‌کوبی فایبرگلاس در سینه کار)';
    excavationMethodEn = 'Sectorial excavation with full pre-confinement (steel pipe umbrella & face fiberglass nails)';
    radialBoltingFa = 'فورپولینگ لوله‌ای قطر ۱۱۴ میلی‌متر به طول ۱۲-۱۵ متر با هم‌پوشانی ۴ متری و بولت‌های شعاعی تزریقی در پیرامون';
    radialBoltingEn = 'Pipe forepoling Ø114mm L=12-15m with 4m overlap + systematic grouted radial rockbolts';
    shotcreteLiningFa = 'شاتکریت مسلح ضخیم ۲۰۰ الی ۲۵۰ میلی‌متر در چند لایه بلافاصله پس از بازشدگی به همراه آب‌بندی جبهه‌کار';
    shotcreteLiningEn = 'Multi-layer fiber shotcrete 200-250 mm immediately after excavation + face sealing shotcrete';
    steelRibsFa = 'قاب‌های فولادی سنگین صلب (HEB 160-200) با فاصله متراکم ۰.۶ الی ۰.۸ متر';
    steelRibsEn = 'Heavy rigid steel ribs (HEB 160-200) at 0.6-0.8 m close spacing';
    invertRequirementFa = 'بستن حلقه اینورت صلب بتنی همزمان با طاق در فاصله کمتر از ۵ متر از جبهه‌کار (Mb1)';
    invertRequirementEn = 'Immediate rigid concrete invert arch closure within 5 m of the face (Mb1)';
    radialBolting = radialBoltingFa;
    shotcreteLining = shotcreteLiningFa;
    steelRibs = steelRibsFa;
    invertRequirement = invertRequirementFa;
    safetyConsiderationsFa = 'پایش مداوم اکستروژن سینه کار با اکستنسومتر طولی و زه‌کشی پیشاپیش جهت افت فشار آب زیرزمینی';
    safetyConsiderationsEn = 'Continuous face extrusion monitoring and sub-horizontal dewatering to control hydraulic gradients';
  }
  // 2. Check for brittle failure / spalling / rockburst in hard, brittle, overstressed rock
  else if (safeIf > 8 && safeUcs >= 60 && safeGsi >= 60 && stressStrengthRatio >= 0.6) {
    if (stressStrengthRatio > 0.8) {
      // Severe spalling / heavy rockburst (ST = C4)
      classCode = 'C4';
      sectionType = 'ST = C4';
      classNameFa = 'رده C4 - گسیختگی ترد بسیار شدید، پرتاب سنگ و ضربه صوتی سنگین (Severe Rockburst)';
      classNameEn = 'ST = C4 - Sudden violent brittle failure & severe rockburst with ejection';
      hazardCode = 'H2';
      hazardNameFa = 'مخاطره H2: گسیختگی ترد ناگهانی و پرتاب شدید قطعات سنگ (Violent Rockburst)';
      hazardNameEn = 'Hazard H2: Sudden and violent brittle failure associated with rock block ejection';
      hazardDescFa = 'توده‌سنگ بسیار سخت و شکننده تحت تنش مماسی بسیار بالا (σθ/σc > 0.8)؛ انرژی کشسانی بالا منجر به کمانش و پرتاب خشونت‌بار سنگ';
      hazardDescEn = 'Highly overstressed brittle hard rock mass with extreme tangential stress; dynamic block ejection';
      behaviorDomain = 'brittle_failure';
      color = '#b91c1c';
      mitigationCodes = ['Ma1', 'Ma5', 'Ma8', 'Mb5', 'Mb6', 'Mb7', 'Mb8'];
      advanceRate = '1.0 - 1.5 m';
      excavationMethodFa = 'حفاری مقطعی با آتشباری ملایم کنترل‌شده به همراه چال‌های تنش‌زدایی پیشاپیش (Destressing Holes)';
      excavationMethodEn = 'Controlled smooth blasting with advance destress drillholes to displace stress concentrations';
      radialBoltingFa = 'بولت‌های تسلیم‌پذیر جاذب انرژی با ظرفیت تغییرشکل دینامیکی بالا (D-Bolt / Swellex) با فواصل متراکم ۱.۰ متری';
      radialBoltingEn = 'Energy-absorbing yielding rockbolts (D-Bolt / Swellex) with high dynamic capacity at 1.0 m spacing';
      shotcreteLiningFa = 'شاتکریت الیافی ۱۵۰ الی ۲۰۰ میلی‌متر با توری مش فولادی پرمقاومت متصل به سر راک‌بولت‌ها با واشرهای پهن';
      shotcreteLiningEn = 'Steel fiber shotcrete 150-200 mm + high-tensile wire mesh anchored with wide bearing plates';
      steelRibsFa = 'قاب‌های تسلیم‌پذیر مجهز به المان‌های جاذب شوک یا قاب‌های سنگین مهارشده';
      steelRibsEn = 'Yielding steel arches with energy absorbers or heavy anchored lattice sets';
      invertRequirementFa = 'کف‌بند بتنی مسلح فوری جهت جلوگیری از جهش و خردشدگی کف تونل (Floor Burst)';
      invertRequirementEn = 'Immediate reinforced concrete invert strut to prevent floor burst heave';
      radialBolting = radialBoltingFa;
      shotcreteLining = shotcreteLiningFa;
      steelRibs = steelRibsFa;
      invertRequirement = invertRequirementFa;
      safetyConsiderationsFa = 'الزام به پایش میکروزلزله‌نگاری (Microseismic Network) جهت پیش‌بینی مکان‌های انباشت تنش و خطر پرتاب';
      safetyConsiderationsEn = 'Real-time microseismic monitoring to detect stress-induced fracturing and rockburst precursors';
    } else {
      // Moderate spalling / rockburst (ST = C3)
      classCode = 'C3';
      sectionType = 'ST = C3';
      classNameFa = 'رده C3 - گسیختگی ترد موضعی، پوسته‌شدن و سنگ‌پریدگی ملایم (Moderate Spalling / Rockburst)';
      classNameEn = 'ST = C3 - Sudden brittle failure & moderate spalling / rockburst';
      hazardCode = 'H2';
      hazardNameFa = 'مخاطره H2: پوسته‌شدن انفجاری و گسیختگی ترد توده‌سنگ سخت (Moderate Spalling)';
      hazardNameEn = 'Hazard H2: Stress-induced brittle spalling in overstressed hard rock';
      hazardDescFa = 'ورقه‌ای شدن و شکست ترد جداره‌ها در سنگ سخت و متراکم تحت تنش برشی بالا (0.6 <= σθ/σc <= 0.8)';
      hazardDescEn = 'Brittle shear slabbing and shallow spalling under high tangential stress concentration';
      behaviorDomain = 'brittle_failure';
      color = '#ea580c';
      mitigationCodes = ['Ma1', 'Mb6', 'Mb7'];
      advanceRate = '1.5 - 2.5 m';
      excavationMethodFa = 'حفاری تمام‌مقطع یا دو مرحله‌ای با پرهیز از آتشباری سنگین در جداره‌ها';
      excavationMethodEn = 'Full face or top heading with smooth perimeter blasting';
      radialBoltingFa = 'بولت‌های تسلیم‌پذیر دینامیکی (Swellex / D-Bolt) با فاصله ۱.۲ الی ۱.۵ متر جهت مهار پوسته‌های سنگ';
      radialBoltingEn = 'Dynamic yielding bolts (Swellex / D-Bolt) at 1.2-1.5 m spacing to pin detached slabs';
      shotcreteLiningFa = 'شاتکریت مسلح به الیاف فولادی ۸۰ الی ۱۲۰ میلی‌متر همراه با توری سیمی مهارشده';
      shotcreteLiningEn = 'Steel fiber reinforced shotcrete 80-120 mm + pinned wire mesh';
      steelRibsFa = 'معمولاً بدون نیاز به قاب سنگین؛ استفاده از قاب سبک موضعی در صورت توسعه شکست';
      steelRibsEn = 'No heavy steel ribs required; localized light lattice arches if fracturing develops';
      invertRequirementFa = 'کف بتنی معمولی';
      invertRequirementEn = 'Standard concrete flat invert';
      radialBolting = radialBoltingFa;
      shotcreteLining = shotcreteLiningFa;
      steelRibs = steelRibsFa;
      invertRequirement = invertRequirementFa;
      safetyConsiderationsFa = 'بازرسی چشمی ایجاد صداهای ناشی از آزادسازی تنش (Pinging / Popping) در سنگ و پوسته‌شدن سقف';
      safetyConsiderationsEn = 'Acoustic monitoring of rock noise and visual inspection of sidewall spalling';
    }
  }
  // 3. Elastic domain (IC > 1.0)
  else if (competencyIndexIc > 1.0) {
    if (safeGsi >= 75 || estimatedRmr >= 75) {
      // Stable rock mass (ST = A)
      classCode = 'A';
      sectionType = 'ST = A';
      classNameFa = 'رده A - توده‌سنگ کاملاً پایدار با رفتار الاستیک خطی (Sound Rock Mass)';
      classNameEn = 'ST = A - Stable rock mass with elastic response upon excavation';
      hazardCode = 'H1';
      hazardNameFa = 'مخاطره H1: پایدار؛ تنها احتمال ریزش موضعی بلوک‌های لق سقف (Minor Local Rockfall)';
      hazardNameEn = 'Hazard H1: Gravity-driven: Stable, only occasional minor block detachment';
      hazardDescFa = 'توده‌سنگ یکپارچه و فشرده با ناپیوستگی‌های قفل‌شده؛ تنش القایی کمتر از مقاومت توده‌سنگ (IC > 1.0) بدون زون پلاستیک';
      hazardDescEn = 'Massive rock with tightly interlocked joints; induced stress well below strength with negligible deformation';
      behaviorDomain = 'elastic';
      color = '#10b981';
      mitigationCodes = ['Ma1', 'Mb3'];
      advanceRate = '3.5 - 5.0 m';
      excavationMethodFa = 'حفاری تمام‌مقطع (Full Face) با آتشباری کنترل‌شده، پیشروی سریع با گام بلند';
      excavationMethodEn = 'Full face excavation with smooth blasting, rapid round advance';
      radialBoltingFa = 'بولت‌گذاری موردی (Spot Bolting) با طول ۲.۵ تا ۳.۰ متر تنها در صورت مشاهده بلوک‌های ناپایدار موضعی';
      radialBoltingEn = 'Occasional spot bolting (L = 2.5-3.0 m) only where isolated loose blocks are identified';
      shotcreteLiningFa = 'بدون نیاز به شاتکریت پیوسته (پاشش موضعی لایه نازک ۳۰-۵۰ میلی‌متری محافظتی در مقاطع هوازده)';
      shotcreteLiningEn = 'No continuous shotcrete needed (thin 30-50 mm protective sealing only in weathered spots)';
      steelRibsFa = 'عدم نیاز به قاب فولادی';
      steelRibsEn = 'No steel arches or ribs required';
      invertRequirementFa = 'کف بدون نیاز به بتن سازه‌ای اینورت';
      invertRequirementEn = 'Standard unreinforced flat invert';
      radialBolting = radialBoltingFa;
      shotcreteLining = shotcreteLiningFa;
      steelRibs = steelRibsFa;
      invertRequirement = invertRequirementFa;
      safetyConsiderationsFa = 'لق‌گیری دقیق و بازرسی چشمی پس از آتشباری جهت اطمینان از عدم وجود بلوک‌های ناپایدار در تاج تونل';
      safetyConsiderationsEn = 'Visual inspection and thorough scaling of crown blocks following each blast round';
    } else {
      // Rock wedge instability (ST = B)
      classCode = 'B';
      sectionType = 'ST = B';
      classNameFa = 'رده B - ناپایداری گوه‌ها و بلوک‌های ساختاری کنترل‌شده با درزه‌ها (Wedge Instability)';
      classNameEn = 'ST = B - Rock wedge instability in good quality rock';
      hazardCode = 'H1';
      hazardNameFa = 'مخاطره H1: لغزش و سقوط گوه‌های سنگی از سقف و دیواره‌ها (Wedge Fallout)';
      hazardNameEn = 'Hazard H1: Gravity-driven block/wedge detachment along persistent discontinuities';
      hazardDescFa = 'رفتار کلی الاستیک اما تقاطع دسته‌درزه‌ها بلوک‌های قابل جابه‌جایی ایجاد می‌کند؛ ریزش گوه‌ها تحت وزن خود';
      hazardDescEn = 'Elastic rock mass behavior, but structural joint planes form kinematically removable rock wedges';
      behaviorDomain = 'elastic';
      color = '#06b6d4';
      mitigationCodes = ['Ma1', 'Mb3'];
      advanceRate = '2.5 - 3.5 m';
      excavationMethodFa = 'حفاری تمام‌مقطع یا نیم‌مقطع طاق و پله، گام پیشروی ۲.۵ الی ۳.۵ متر با آتشباری ملایم';
      excavationMethodEn = 'Full face or top heading, advance round 2.5-3.5m with smooth blasting';
      radialBoltingFa = 'بولت‌گذاری الگویی یا موضعی با فواصل ۱.۸ الی ۲.۲ متر و طول متناسب با عمق گوه‌ها (' + (2.5 + 0.15 * safeSpan).toFixed(1) + ' متر)';
      radialBoltingEn = 'Pattern or spot rockbolting at 1.8-2.2 m spacing, length L = ' + (2.5 + 0.15 * safeSpan).toFixed(1) + ' m';
      shotcreteLiningFa = 'شاتکریت مسلح به توری فولادی یا الیاف به ضخامت ۵۰ الی ۸۰ میلی‌متر جهت دوخت درزه‌ها';
      shotcreteLiningEn = 'Fiber reinforced shotcrete 50-80 mm to seal joint apertures and support structural wedges';
      steelRibsFa = 'عدم نیاز به قاب فولادی (تنها در مواضع زون‌های درزه‌دار فشرده موضعی)';
      steelRibsEn = 'No steel ribs needed (light sets only in dense localized sheared zones)';
      invertRequirementFa = 'کف بتنی معمولی بدون نیاز به اینورت قوس‌دار فشاری';
      invertRequirementEn = 'Standard concrete invert without structural invert arch';
      radialBolting = radialBoltingFa;
      shotcreteLining = shotcreteLiningFa;
      steelRibs = steelRibsFa;
      invertRequirement = invertRequirementFa;
      safetyConsiderationsFa = 'مهاربندی فوری بلوک‌های نمایان پس از هر انفجار پیش از حفر چال‌های گام بعد';
      safetyConsiderationsEn = 'Immediate rockbolt anchoring of exposed rock wedges before drilling subsequent round';
    }
  }
  // 4. Elastic-Plastic domain (0.40 <= IC < 1.0)
  else if (competencyIndexIc >= 0.40) {
    if (estimatedRmr >= 40 || safeGsi >= 40) {
      // Fair rock mass, moderate plastic zone (ST = C1)
      classCode = 'C1';
      sectionType = 'ST = C1';
      classNameFa = 'رده C1 - تمایل بارز به ریزش سنگ و توسعه ملایم زون پلاستیک (Pronounced Rockfall in Fair Rock)';
      classNameEn = 'ST = C1 - Pronounced tendency to rockfall with moderate plastic zone';
      hazardCode = 'H1';
      hazardNameFa = 'مخاطره H1: ریزش سنگ و تسلیم برشی ملایم پیرامون حفاری (Rockfall & Yielding)';
      hazardNameEn = 'Hazard H1: Wedge detachment combined with moderate plastic yielding';
      hazardDescFa = 'توده‌سنگ متوسط با تشکیل زون پلاستیک ملایم (Rp/Ro = ۱ تا ۲، کرنش زیر ۰.۵٪)؛ همگرایی کنترل‌پذیر';
      hazardDescEn = 'Fair quality rock mass with moderate plastic zone development (Rp/Ro = 1-2, strain < 0.5%)';
      behaviorDomain = 'elastic_plastic';
      color = '#f59e0b';
      mitigationCodes = ['Ma1', 'Mb5', 'Mb7'];
      advanceRate = '1.5 - 2.5 m';
      excavationMethodFa = 'حفاری دو مرحله‌ای (Top Heading & Bench)، گام پیشروی ۱.۵ الی ۲.۵ متر در سقف';
      excavationMethodEn = 'Top heading and bench excavation, advance 1.5-2.5m per round';
      radialBoltingFa = 'بولت‌گذاری سیستماتیک الگویی با فواصل ۱.۲ الی ۱.۵ متر و طول ' + (2.5 + 0.15 * safeSpan).toFixed(1) + ' متر با تزریق کامل';
      radialBoltingEn = 'Fully grouted systematic rockbolts at 1.2-1.5 m spacing, length L = ' + (2.5 + 0.15 * safeSpan).toFixed(1) + ' m';
      shotcreteLiningFa = 'شاتکریت مسلح الیافی (SFR) به ضخامت ۸۰ الی ۱۲۰ میلی‌متر در سقف و دیواره‌ها';
      shotcreteLiningEn = 'Steel fiber reinforced shotcrete (SFR) 80-120 mm in crown and sidewalls';
      steelRibsFa = 'خرپای مشبک (Lattice Girder) یا قاب سبک در مواضع با تراکم درزه بالا با فواصل ۱.۵ متر';
      steelRibsEn = 'Lattice girders or lightweight steel ribs at 1.5 m spacing in heavily jointed zones';
      invertRequirementFa = 'کف بتنی در فاصله حداکثر ۲.۵ برابر دهانه تونل';
      invertRequirementEn = 'Concrete invert placed within 2.5 times tunnel span from the face';
      radialBolting = radialBoltingFa;
      shotcreteLining = shotcreteLiningFa;
      steelRibs = steelRibsFa;
      invertRequirement = invertRequirementFa;
      safetyConsiderationsFa = 'پایش همگرایی دیواره‌ها و سقف با تار همگرایی سنج (Convergence Array Monitoring)';
      safetyConsiderationsEn = 'Routine convergence array monitoring to verify stabilization rate of perimeter';
    } else {
      // Poor rock mass, reduced self-supporting capacity (ST = C2)
      classCode = 'C2';
      sectionType = 'ST = C2';
      classNameFa = 'رده C2 - ناپایداری گرانشی و کاهش ظرفیت خودپایداری توده‌سنگ ضعیف (Gravity Instability in Poor Rock)';
      classNameEn = 'ST = C2 - Gravity-driven instability & reduced self-support in poor rock';
      hazardCode = 'H4';
      hazardNameFa = 'مخاطره H4: ریزش گرانشی، ریزش گنبدی و توده‌سنگ سست (Caving & Chimneying)';
      hazardNameEn = 'Hazard H4: Gravity-driven caving and roof chimneying in weak fractured rock';
      hazardDescFa = 'توده‌سنگ ضعیف با زون پلاستیک گسترده‌تر؛ کاهش شدید زمان خودپایداری و نیاز به نگهداری فوری سقف';
      hazardDescEn = 'Poor rock mass with reduced self-supporting capacity and rapid roof loosening';
      behaviorDomain = 'elastic_plastic';
      color = '#f97316';
      mitigationCodes = ['Ma1', 'Ma5', 'Mb5', 'Mb7'];
      advanceRate = '1.0 - 1.5 m';
      excavationMethodFa = 'حفاری دو مرحله‌ای طاق و پله با گام‌های محدود ۱.۰ تا ۱.۵ متری به همراه میله‌های رانشی سقف (Spiling)';
      excavationMethodEn = 'Top heading and bench with short 1.0-1.5m rounds supported by advance crown spiling';
      radialBoltingFa = 'بولت‌های تزریقی سیستماتیک با فواصل متراکم ۱.۰ تا ۱.۲ متر و طول ' + (3.0 + 0.15 * safeSpan).toFixed(1) + ' متر';
      radialBoltingEn = 'Fully grouted systematic rockbolts at dense 1.0-1.2 m spacing, length L = ' + (3.0 + 0.15 * safeSpan).toFixed(1) + ' m';
      shotcreteLiningFa = 'شاتکریت الیافی ۱۰۰ الی ۱۵۰ میلی‌متر در دو لایه همراه با لایه آب‌بند فوری سینه کار';
      shotcreteLiningEn = 'Fiber shotcrete 100-150 mm in two layers + immediate face sealing shotcrete';
      steelRibsFa = 'قاب‌های فولادی سنگین نوردشده (HEB 120-140) با فواصل ۱.۰ الی ۱.۲ متر';
      steelRibsEn = 'Heavy rolled steel arches (HEB 120-140) at 1.0-1.2 m spacing';
      invertRequirementFa = 'اجرای اینورت قوسی سازه‌ای در فاصله کمتر از ۱.۵ تا ۲ برابر دهانه از جبهه‌کار';
      invertRequirementEn = 'Structural curved invert arch closed within 1.5-2 spans from the advancing face';
      radialBolting = radialBoltingFa;
      shotcreteLining = shotcreteLiningFa;
      steelRibs = steelRibsFa;
      invertRequirement = invertRequirementFa;
      safetyConsiderationsFa = 'نصب فوری نگهداری اولیه در فاصله حداکثر یک گام از سینه کار جهت جلوگیری از فروریزش طاق';
      safetyConsiderationsEn = 'Immediate primary support installation within one round of advancing face';
    }
  }
  // 5. Plastic domain - Severe Squeezing (0.20 <= IC < 0.40)
  else if (competencyIndexIc >= 0.20) {
    classCode = 'D';
    sectionType = 'ST = D';
    classNameFa = 'رده D - تغییرشکل پلاستیک سنگین و پدیده فشردگی شدید (Severe Squeezing)';
    classNameEn = 'ST = D - Plastic/viscous deformations & severe squeezing';
    hazardCode = 'H3';
    hazardNameFa = 'مخاطره H3: فشردگی شدید و توسعه زون پلاستیک عمیق (Severe Squeezing Deformations)';
    hazardNameEn = 'Hazard H3: Stress-induced plastic deformations and significant radial convergences';
    hazardDescFa = 'توده‌سنگ تسلیم‌شده تحت تنش برشی بالا؛ همگرایی ۲ تا ۵ درصد و توسعه زون پلاستیک تا ۲-۴ برابر شعاع (Rp/Ro = 2-4)';
    hazardDescEn = 'Overstressed rock mass resulting in significant face extrusion and tunnel convergence (2-5%)';
    behaviorDomain = 'plastic';
    color = '#e11d48';
    mitigationCodes = ['Ma1', 'Ma3', 'Ma4', 'Ma5', 'Mb4', 'Mb5', 'Mb7'];
    advanceRate = '0.8 - 1.2 m';
    excavationMethodFa = 'حفاری مقطعی چندبخشی با گام کوتاه ۰.۸ الی ۱.۲ متر با تعبیه شیارهای تغییرشکل طولی در شاتکریت';
    excavationMethodEn = 'Sectorial excavation with 0.8-1.2m rounds and longitudinal shotcrete deformation slots';
    radialBoltingFa = 'بولت‌های تسلیم‌پذیر اصطکاکی (Swellex / D-Bolt) با فواصل ۱.۰ متری به طول ' + (3.5 + 0.2 * safeSpan).toFixed(1) + ' متر';
    radialBoltingEn = 'Yielding friction bolts (Swellex / D-Bolt) at 1.0 m spacing, length L = ' + (3.5 + 0.2 * safeSpan).toFixed(1) + ' m';
    shotcreteLiningFa = 'شاتکریت انعطاف‌پذیر با الیاف سازه‌ای به ضخامت ۱۵۰ الی ۲۰۰ میلی‌متر با درزهای بازدهی طولی (Slots)';
    shotcreteLiningEn = 'Structural fiber shotcrete 150-200 mm with longitudinal deformation yield slots';
    steelRibsFa = 'قاب‌های فولادی تسلیم‌پذیر لغزنده (TH Arches با بست‌های اصطکاکی) با فاصله ۱.۰ متر';
    steelRibsEn = 'Yielding sliding steel arches (TH arches with friction clamps) at 1.0 m spacing';
    invertRequirementFa = 'اجرای اینورت قوسی صلب و بستن رینگ نگهداری در فاصله کمتر از یک برابر دهانه (Mb1)';
    invertRequirementEn = 'Rigid curved invert arch closure within less than 1.0 tunnel span from face (Mb1)';
    radialBolting = radialBoltingFa;
    shotcreteLining = shotcreteLiningFa;
    steelRibs = steelRibsFa;
    invertRequirement = invertRequirementFa;
    safetyConsiderationsFa = 'پایش مداوم نرخ همگرایی و اطمینان از عملکرد بست‌های لغزنده قاب‌های TH جهت جلوگیری از کمانش صلب';
    safetyConsiderationsEn = 'Real-time convergence rate monitoring to ensure controlled yielding of sliding arch clamps';
  }
  // 6. Very severe squeezing (IC < 0.20)
  else {
    classCode = 'E';
    sectionType = 'ST = E';
    classNameFa = 'رده E - تغییرشکل پلاستیک بسیار بحرانی و فشردگی فوق‌العاده شدید (Very Severe Squeezing)';
    classNameEn = 'ST = E - Intense plastic deformations & very severe squeezing';
    hazardCode = 'H3';
    hazardNameFa = 'مخاطره H3: فشردگی بسیار شدید و اکستروژن گسترده سینه کار (Very Severe Squeezing)';
    hazardNameEn = 'Hazard H3: Extreme plastic/viscous flow, massive convergences (> 5-10%)';
    hazardDescFa = 'توده‌سنگ ضعیف و خردشده تحت تنش برشی فوق‌العاده بالا؛ زون پلاستیک بیش از ۴ برابر شعاع (Rp/Ro > 4) و همگرایی بیش از ۵ تا ۱۰٪';
    hazardDescEn = 'Intense plastic yielding with huge tunnel convergence and high face extrusion under extreme overburden';
    behaviorDomain = 'plastic';
    color = '#be123c';
    mitigationCodes = ['Ma1', 'Ma2', 'Ma3', 'Ma4', 'Ma6', 'Mb1', 'Mb2', 'Mb4', 'Mb5', 'Mb7'];
    advanceRate = '0.6 - 1.0 m';
    excavationMethodFa = 'حفاری مقطعی با تحکیم پیشاپیش هسته سینه کار با میخ‌کوبی فایبرگلاس و هندسه مقطع دایروی (Mb2)';
    excavationMethodEn = 'Sequential drift excavation with face core fiberglass bolting and circular profile (Mb2)';
    radialBoltingFa = 'بولت‌های با شکل‌پذیری بسیار بالا (High-yield capacity) با فاصله متراکم ۰.۸-۱.۰ متر و طول ' + (4.0 + 0.25 * safeSpan).toFixed(1) + ' متر';
    radialBoltingEn = 'High-yield dynamic bolts at dense 0.8-1.0 m spacing, length L = ' + (4.0 + 0.25 * safeSpan).toFixed(1) + ' m';
    shotcreteLiningFa = 'شاتکریت سنگین ۲۰۰ الی ۲۵۰ میلی‌متر در چند لایه با الیاف سازه‌ای و المان‌های تراکم‌پذیر جاذب بار (HiDCon)';
    shotcreteLiningEn = 'Heavy multi-layer fiber shotcrete 200-250 mm with compressible yielding elements (HiDCon)';
    steelRibsFa = 'قاب‌های بسیار سنگین تسلیم‌پذیر TH یا قاب‌های صلب با اتصالات تراکم‌پذیر با فواصل ۰.۷۵ متر';
    steelRibsEn = 'Heavy yielding TH steel sets or rigid arches with compressible yield joints at 0.75 m spacing';
    invertRequirementFa = 'احداث اینورت قوسی فوری و بستن رینگ مقطع به طور همزمان با سقف در فاصله کمتر از ۵ متر (Mb1)';
    invertRequirementEn = 'Immediate curved invert arch ring closure within 5 m of face advancing concurrently (Mb1)';
    radialBolting = radialBoltingFa;
    shotcreteLining = shotcreteLiningFa;
    steelRibs = steelRibsFa;
    invertRequirement = invertRequirementFa;
    safetyConsiderationsFa = 'الزام قطعی به تحکیم پیشاپیش جبهه‌کار با فایبرگلاس جهت جلوگیری از اکستروژن و انحراف هندسی مقطع';
    safetyConsiderationsEn = 'Mandatory sub-horizontal face pre-reinforcement to prevent extrusion and maintain tunnel alignment';
  }

  // Populate mitigations detailed objects
  const mitigations: RussoSupportMitigation[] = mitigationCodes
    .map((code) => RUSSO_MITIGATIONS_DATABASE[code])
    .filter(Boolean);

  return {
    gsi: safeGsi,
    span: safeSpan,
    depth: safeDepth,
    ucs: safeUcs,
    unitWeight: safeGamma,
    kRatio: safeK,
    brittlenessIndexIf: safeIf,
    sHoek,
    aHoek,
    jpParameter,
    rockMassStrengthScm,
    verticalStressSigmaV,
    tangentialStressSigmaTheta,
    competencyIndexIc,
    stressStrengthRatio,
    radialDeformationDelta0,
    plasticRadiusRatio,
    estimatedRmr,
    classCode,
    sectionType,
    classNameFa,
    classNameEn,
    hazardCode,
    hazardNameFa,
    hazardNameEn,
    hazardDescFa,
    hazardDescEn,
    behaviorFa,
    behaviorEn,
    behaviorDomain,
    color,
    mitigationCodes,
    mitigations,
    excavationMethodFa,
    excavationMethodEn,
    advanceRate,
    radialBolting,
    radialBoltingFa,
    radialBoltingEn,
    shotcreteLining,
    shotcreteLiningFa,
    shotcreteLiningEn,
    steelRibs,
    steelRibsFa,
    steelRibsEn,
    invertRequirement,
    invertRequirementFa,
    invertRequirementEn,
    safetyConsiderationsFa,
    safetyConsiderationsEn,
  };
}

/**
 * 3. GSI Squeezing & Support Demand Method (Hoek, Kaiser & Bawden 1995 / Hoek 2000)
 * Evaluates in-situ vertical stress vs rock mass strength Scm and determines support pressure Pi
 */
export function calculateGsiSupport(
  gsi: number,
  span: number,
  depth: number = 250,
  ucs: number = 50,
  unitWeight: number = 26
): GsiSupportResult {
  const safeGsi = Math.max(5, Math.min(95, gsi));
  const safeSpan = Math.max(1, span);
  const safeDepth = Math.max(10, depth);
  const safeUcs = Math.max(2, ucs);

  // In-situ vertical overburden stress p0 (MPa)
  const verticalStressP0 = Number(((unitWeight * safeDepth) / 1000).toFixed(2));

  // Hoek-Brown parameters (D = 0 undisturbed assumed)
  const s = Math.exp((safeGsi - 100) / 9);
  const a = 0.5 + (Math.exp(-safeGsi / 15) - Math.exp(-20 / 3)) / 6;

  // Unconfined compressive strength of rock mass Scm (Hoek 2002)
  const rockMassStrengthScm = Number((safeUcs * Math.pow(s, a)).toFixed(2));

  // Stress-Strength ratio Scm / p0
  const ratio = rockMassStrengthScm / Math.max(0.1, verticalStressP0);
  const stressStrengthRatio = Number(ratio.toFixed(2));

  // Strain calculation (Hoek & Marinos 2000)
  // epsilon = 0.15 * (1 - pi/p0) / (Scm / p0) or empirical approximation
  let strainPercent = 0.15 / Math.max(0.1, ratio);
  strainPercent = Number(Math.min(15, Math.max(0.1, strainPercent)).toFixed(1));

  let behaviorCategoryFa: string;
  let behaviorCategoryEn: string;
  let squeezingSeverity: 'none' | 'minor' | 'severe' | 'very_severe';
  let color: string;
  let requiredSupportPressurePi: number; // MPa
  let supportTypeFa: string;
  let supportTypeEn: string;
  let boltsFa: string;
  let boltsEn: string;
  let shotcreteFa: string;
  let shotcreteEn: string;
  let ribsFa: string;
  let ribsEn: string;

  if (ratio > 2.0) {
    squeezingSeverity = 'none';
    color = '#10b981';
    behaviorCategoryFa = 'بدون تغییرشکل پلاستیک شدید (پایدار / بدون فشردگی)';
    behaviorCategoryEn = 'Elastic / No squeezing problems';
    requiredSupportPressurePi = Number((0.05 * verticalStressP0).toFixed(3));
    supportTypeFa = 'نگهداری سبک ساختاری / مهار گوه‌ها';
    supportTypeEn = 'Light structural support';
    boltsFa = 'بولت‌های نقطه‌ای یا الگوی سبک ۲.۵ متری';
    boltsEn = 'Spot bolts or light 2.5m pattern';
    shotcreteFa = 'شاتکریت نازک ۳۰ الی ۵۰ میلی‌متر';
    shotcreteEn = 'Shotcrete 30-50mm';
    ribsFa = 'عدم نیاز به قاب فولادی';
    ribsEn = 'None';
  } else if (ratio > 1.0) {
    squeezingSeverity = 'minor';
    color = '#06b6d4';
    behaviorCategoryFa = 'فشردگی ملایم (Minor Squeezing)؛ کرنش کمتر از ۲.۵٪';
    behaviorCategoryEn = 'Minor squeezing (strain < 2.5%)';
    requiredSupportPressurePi = Number((0.12 * verticalStressP0).toFixed(3));
    supportTypeFa = 'نگهداری الگویی استاندارد';
    supportTypeEn = 'Systematic patterned support';
    boltsFa = 'بولت‌گذاری شعاعی با فاصله ۱.۵ الی ۲.۰ متر و طول ' + (2.5 + 0.15 * safeSpan).toFixed(1) + ' متر';
    boltsEn = 'Radial pattern bolts 1.5-2.0m spacing, length ' + (2.5 + 0.15 * safeSpan).toFixed(1) + 'm';
    shotcreteFa = 'شاتکریت الیافی ۵۰ الی ۱۰۰ میلی‌متر';
    shotcreteEn = 'Fiber reinforced shotcrete 50-100mm';
    ribsFa = 'قاب‌های سبک در صورت وجود مقاطع درزه‌دار';
    ribsEn = 'Light steel sets if needed in jointed zones';
  } else if (ratio > 0.4) {
    squeezingSeverity = 'severe';
    color = '#f59e0b';
    behaviorCategoryFa = 'فشردگی شدید توده‌سنگ (Severe Squeezing)؛ کرنش ۲.۵ تا ۵٪';
    behaviorCategoryEn = 'Severe squeezing (strain 2.5% to 5%)';
    requiredSupportPressurePi = Number((0.25 * verticalStressP0).toFixed(3));
    supportTypeFa = 'نگهداری تسلیم‌پذیر تقویت‌شده (Yielding & Ductile Support)';
    supportTypeEn = 'Heavy yielding support';
    boltsFa = 'بولت‌های اصطکاکی با قابلیت ازدیاد طول بالا (Swellex / D-Bolt) به طول ' + (3.5 + 0.2 * safeSpan).toFixed(1) + ' متر با فاصله ۱.۲ متر';
    boltsEn = 'Yielding/friction rock bolts (Swellex/D-Bolt) 1.2m spacing, length ' + (3.5 + 0.2 * safeSpan).toFixed(1) + 'm';
    shotcreteFa = 'شاتکریت الیافی ۱۵۰ الی ۲۰۰ میلی‌متر با شیارهای تغییرشکل طولی';
    shotcreteEn = 'Fiber shotcrete 150-200mm with longitudinal deformation slots';
    ribsFa = 'قاب‌های سنگین با اتصالات لغزنده اصطکاکی (TH Sets / Sliding Arches)';
    ribsEn = 'Heavy sliding yieldable steel arches';
  } else {
    squeezingSeverity = 'very_severe';
    color = '#ef4444';
    behaviorCategoryFa = 'فشردگی بسیار بحرانی (Very Severe Squeezing)؛ کرنش بیش از ۵ تا ۱۰٪';
    behaviorCategoryEn = 'Very severe squeezing (strain > 5-10%)';
    requiredSupportPressurePi = Number((0.45 * verticalStressP0).toFixed(3));
    supportTypeFa = 'نگهداری فوق سنگین با رینگ کامل و فورپولینگ پیشاپیش';
    supportTypeEn = 'Ultra-heavy closed ring with pre-reinforcement';
    boltsFa = 'بولت‌های تسلیم‌پذیر متراکم ۱.۰ متری به همراه فورپولینگ چتری در سقف';
    boltsEn = 'Dense yielding bolts at 1.0m with spiling/forepoling umbrella';
    shotcreteFa = 'شاتکریت سنگین ۲۰۰ الی ۲۵۰ میلی‌متر در چند لایه با الیاف فولادی و میکروسیلیس';
    shotcreteEn = 'Heavy 200-250mm multi-layer fiber shotcrete';
    ribsFa = 'قاب‌های فولادی سنگین صلب با فاصله ۰.۷۵ متر و بستن فوری اینورت کروی';
    ribsEn = 'Heavy steel ribs at 0.75m with immediate structural invert ring';
  }

  return {
    gsi: safeGsi,
    span: safeSpan,
    depth: safeDepth,
    unitWeight,
    ucs: safeUcs,
    verticalStressP0,
    rockMassStrengthScm,
    stressStrengthRatio,
    behaviorCategoryFa,
    behaviorCategoryEn,
    color,
    squeezingSeverity,
    strainPercent,
    requiredSupportPressurePi,
    supportTypeFa,
    supportTypeEn,
    boltsFa,
    boltsEn,
    shotcreteFa,
    shotcreteEn,
    ribsFa,
    ribsEn,
  };
}

/**
 * Cross-Comparison Summary Model
 */
export interface ComprehensiveSupportSummary {
  rmrRockClass: RockClassInfo;
  qResult: QCalculationResult;
  gsiResult: GsiSupportResult;
  rqdResult: RqdSupportResult;
  russoResult: RussoSupportResult;
}
