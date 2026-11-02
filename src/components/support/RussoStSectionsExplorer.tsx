import React, { useState, useEffect } from 'react';
import { RussoSupportResult } from '../../types';
import { Shield, AlertTriangle, Hammer, CheckCircle2, ArrowRight, Layers, Sparkles, Activity } from 'lucide-react';

interface RussoStSectionsExplorerProps {
  russoResult: RussoSupportResult;
  lang: 'fa' | 'en';
}

export interface StSectionDefinition {
  id: string;
  code: string;
  nameFa: string;
  nameEn: string;
  hazardCode: string;
  hazardTitleFa: string;
  hazardTitleEn: string;
  domain: 'elastic' | 'elastic_plastic' | 'plastic' | 'brittle_failure' | 'collapse';
  color: string;
  criteriaFa: string;
  criteriaEn: string;
  icRange: string;
  rmrRange: string;
  gsiRange: string;
  strainDelta0Fa: string;
  strainDelta0En: string;
  plasticRadiusRpRoFa: string;
  plasticRadiusRpRoEn: string;
  mechanismFa: string;
  mechanismEn: string;
  excavationMethodFa: string;
  excavationMethodEn: string;
  advanceRate: string;
  shortTagFa: string;
  shortTagEn: string;
  mitigationMaFa: string[];
  mitigationMaEn: string[];
  mitigationMbFa: string[];
  mitigationMbEn: string[];
  profileType: 'horseshoe' | 'horseshoe_wedges' | 'horseshoe_spalling' | 'horseshoe_yielding' | 'horseshoe_caving' | 'horseshoe_squeezing' | 'circular_extreme' | 'horseshoe_cataclastic';
  activeSpecs: {
    rockbolts: string;
    shotcrete: string;
    steelSets: string;
    invert: string;
    special: string;
  };
}

export const ST_SECTIONS_DATABASE: Record<string, StSectionDefinition> = {
  A: {
    id: 'A',
    code: 'ST = A',
    nameFa: 'مقطع ST = A (توده‌سنگ یکپارچه و پایدار)',
    nameEn: 'ST = A (Sound / Stable Rock Mass)',
    shortTagFa: 'پایدار',
    shortTagEn: 'Sound Rock',
    hazardCode: 'H1',
    hazardTitleFa: 'پایدار؛ خطر ناچیز ریزش موضعی بلوک‌های سست',
    hazardTitleEn: 'Gravity-driven: Stable, occasional minor block detachment',
    domain: 'elastic',
    color: '#10b981',
    criteriaFa: 'IC ≥ 1.0 و RMR ≥ 75 (GSI ≥ 75)؛ تنش القایی بسیار کمتر از مقاومت توده‌سنگ',
    criteriaEn: 'IC ≥ 1.0 and RMR ≥ 75 (GSI ≥ 75); Induced stress well below strength',
    icRange: 'IC ≥ 1.0',
    rmrRange: '75 - 100',
    gsiRange: '75 - 100',
    strainDelta0Fa: '< 0.05 % (ناچیز)',
    strainDelta0En: '< 0.05 % (Negligible)',
    plasticRadiusRpRoFa: '1.0 (بدون زون پلاستیک)',
    plasticRadiusRpRoEn: '1.0 (No plastic zone)',
    mechanismFa: 'پاسخ الاستیک کامل؛ بدون توسعه تسلیم برشی در محیط حفاری و پایداری ذاتی فضای زیرزمینی.',
    mechanismEn: 'Pure elastic behavior; zero shear yield around perimeter and inherent subterranean stability.',
    excavationMethodFa: 'حفاری تمام‌مقطع (Full-Face) با آتشباری کنترل‌شده و پیشروی سریع با گام بلند.',
    excavationMethodEn: 'Full-face excavation with smooth perimeter blasting and rapid advance.',
    advanceRate: '3.5 - 5.0 m',
    mitigationMaFa: ['Ma1: زه‌کشی موضعی در صورت حضور آب زیرزمینی'],
    mitigationMaEn: ['Ma1: Localized drainage in case of groundwater seepage'],
    mitigationMbFa: ['Mb3: راک‌بولت موضعی موردی (Spot Bolting L=2.5-3.0m)', 'Mb7: پاشش لایه نازک شاتکریت ۳۰-۵۰ میلی‌متری تنها در نواحی هوازده'],
    mitigationMbEn: ['Mb3: Occasional spot bolting (L=2.5-3.0m)', 'Mb7: Thin shotcrete layer (30-50 mm) in weathered zones'],
    profileType: 'horseshoe',
    activeSpecs: {
      rockbolts: 'تنها بولت موضعی موردی (Spot)',
      shotcrete: 'بدون شاتکریت یا موضعی ۳۰-۵۰ mm',
      steelSets: 'بدون قاب فولادی',
      invert: 'کف سنگ طبیعی تسطیح‌شده',
      special: 'حفاری تمام‌مقطع با پیشروی ۳.۵-۵ m',
    },
  },
  B: {
    id: 'B',
    code: 'ST = B',
    nameFa: 'مقطع ST = B (ناپایداری گوه‌ها و بلوک‌های ساختاری)',
    nameEn: 'ST = B (Kinematically Unstable Wedges)',
    shortTagFa: 'گوه‌ای',
    shortTagEn: 'Wedges',
    hazardCode: 'H1',
    hazardTitleFa: 'سقوط و لغزش گوه‌های ساختاری از سقف و دیواره‌ها',
    hazardTitleEn: 'Gravity-driven: Discontinuity-controlled block/wedge detachment',
    domain: 'elastic',
    color: '#06b6d4',
    criteriaFa: 'IC ≥ 1.0 و 50 ≤ RMR < 75 (50 ≤ GSI < 75)؛ رفتار ماتریس الاستیک اما درزه‌های متقاطع ناپایدارکننده',
    criteriaEn: 'IC ≥ 1.0 and 50 ≤ RMR < 75; Elastic matrix, kinematically removable rock wedges',
    icRange: 'IC ≥ 1.0',
    rmrRange: '50 - 75',
    gsiRange: '50 - 75',
    strainDelta0Fa: '< 0.1 %',
    strainDelta0En: '< 0.1 %',
    plasticRadiusRpRoFa: '1.0 - 1.1 (بلوک‌های ساختاری)',
    plasticRadiusRpRoEn: '1.0 - 1.1 (Structural blocks)',
    mechanismFa: 'توده‌سنگ سالم اما درزه‌دار؛ تشکیل گوه‌های هندسی قابل جابه‌جایی که تحت نیروی وزن خود سقوط می‌کنند.',
    mechanismEn: 'Sound rock mass intersected by joint sets forming discrete removable wedges falling under gravity.',
    excavationMethodFa: 'حفاری تمام‌مقطع یا نیم‌مقطع طاق و پله، گام پیشروی ۲.۵ الی ۳.۵ متر.',
    excavationMethodEn: 'Full face or top heading and bench, advance 2.5-3.5m per round.',
    advanceRate: '2.5 - 3.5 m',
    mitigationMaFa: ['Ma1: پایش راستای دسته‌درزه‌ها و شناسایی گوه‌های بزرگ'],
    mitigationMaEn: ['Ma1: Structural joint set mapping and large wedge identification'],
    mitigationMbFa: ['Mb1/Mb3: بولت‌گذاری الگویی و موضعی با فواصل ۱.۸-۲.۲ متر', 'Mb7: شاتکریت الیافی ۵۰ الی ۸۰ میلی‌متر برای دوخت درزه‌ها'],
    mitigationMbEn: ['Mb1/Mb3: Systematic and spot rockbolts at 1.8-2.2 m spacing', 'Mb7: Fiber shotcrete 50-80 mm to seal joint apertures'],
    profileType: 'horseshoe_wedges',
    activeSpecs: {
      rockbolts: 'بولت‌های الگویی دوخت گوه‌ها (L=3m @ 2m)',
      shotcrete: 'شاتکریت الیافی ۵۰-۸۰ mm درزگیر',
      steelSets: 'بدون قاب یا خرپای سبک',
      invert: 'کف بتنی غیرمسلح',
      special: 'پایش دسته‌درزه‌ها و مهار گوه‌ها',
    },
  },
  C1: {
    id: 'C1',
    code: 'ST = C1',
    nameFa: 'مقطع ST = C1 (توده‌سنگ متوسط با تسلیم پلاستیک ملایم)',
    nameEn: 'ST = C1 (Minor Yielding & Pronounced Rockfall)',
    shortTagFa: 'تسلیم ملایم',
    shortTagEn: 'Minor Yield',
    hazardCode: 'H1',
    hazardTitleFa: 'ریزش سنگ و توسعه زون پلاستیک محدود پیرامون حفاری',
    hazardTitleEn: 'Moderate plastic yielding combined with structural detachment',
    domain: 'elastic_plastic',
    color: '#f59e0b',
    criteriaFa: '0.40 ≤ IC < 1.0 و 40 ≤ RMR < 75؛ زون پلاستیک محدود و تغییرشکل ملایم',
    criteriaEn: '0.40 ≤ IC < 1.0 and 40 ≤ RMR < 75; Shallow plastic zone with moderate convergences',
    icRange: '0.40 ≤ IC < 1.0',
    rmrRange: '40 - 75',
    gsiRange: '40 - 75',
    strainDelta0Fa: '0.1 - 0.5 %',
    strainDelta0En: '0.1 - 0.5 %',
    plasticRadiusRpRoFa: '1.1 - 1.8',
    plasticRadiusRpRoEn: '1.1 - 1.8',
    mechanismFa: 'توسعه تنش‌های مماسی فراتر از مقاومت برشی توده‌سنگ؛ تشکیل پوسته پلاستیک و همگرایی قابل کنترل.',
    mechanismEn: 'Stress concentration exceeds rock mass shear strength; limited yield zone and controllable convergence.',
    excavationMethodFa: 'حفاری دو مرحله‌ای طاق و پله (Top Heading & Bench)، گام ۱.۵ تا ۲.۵ متر.',
    excavationMethodEn: 'Top heading and bench excavation, advance 1.5-2.5m.',
    advanceRate: '1.5 - 2.5 m',
    mitigationMaFa: ['Ma1: شناسایی پهنه‌های خردشده موضعی'],
    mitigationMaEn: ['Ma1: Identification of localized sheared or fractured zones'],
    mitigationMbFa: ['Mb1: راک‌بولت‌های تزریقی سراسری با فواصل ۱.۲-۱.۵ متر (L=3-4m)', 'Mb4: خرپاهای مشبک سبک (Lattice Girders)', 'Mb7: شاتکریت الیافی ۸۰ الی ۱۲۰ میلی‌متر'],
    mitigationMbEn: ['Mb1: Fully grouted systematic rockbolts at 1.2-1.5 m spacing (L=3-4m)', 'Mb4: Lightweight lattice girders', 'Mb7: Fiber shotcrete 80-120 mm'],
    profileType: 'horseshoe_yielding',
    activeSpecs: {
      rockbolts: 'راک‌بولت تزریقی سراسری L=3-4m @ 1.2-1.5m',
      shotcrete: 'شاتکریت الیافی مسلح ۸۰-۱۲۰ mm',
      steelSets: 'خرپاهای مشبک سبک (Lattice Girder)',
      invert: 'تسطیح بتنی با اینورت مسطح',
      special: 'حفاری دو مرحله‌ای طاق و پله',
    },
  },
  C1_SPALLING: {
    id: 'C1_SPALLING',
    code: 'ST = C1 (* Spalling)',
    nameFa: 'مقطع ST = C1 ویژه (گسیختگی ترد، پوسته‌شدن و پرتاب سنگ / Rockburst)',
    nameEn: 'ST = C1 (* Severe Spalling & Violent Rockburst)',
    shortTagFa: 'شکست ترد',
    shortTagEn: 'Spalling/Burst',
    hazardCode: 'H2',
    hazardTitleFa: 'گسیختگی ترد ناگهانی، کمانش ورقه‌ای و پرتاب انفجاری قطعات سنگ',
    hazardTitleEn: 'Hazard H2: Sudden violent brittle failure, strainburst & rock ejection',
    domain: 'brittle_failure',
    color: '#dc2626',
    criteriaFa: '0.40 ≤ IC < 1.0, RMR ≥ 60, GSI ≥ 60, σc ≥ 60 MPa, IF > 8, σθ/σc ≥ 0.6؛ توده‌سنگ شکننده سخت تحت تنش برجا زیاد',
    criteriaEn: '0.40 ≤ IC < 1.0, RMR ≥ 60, σc ≥ 60 MPa, tangential stress ratio σθ/σc ≥ 0.6 in brittle hard rock',
    icRange: '0.40 ≤ IC < 1.0',
    rmrRange: '60 - 100',
    gsiRange: '60 - 90',
    strainDelta0Fa: 'ناگهانی دینامیکی',
    strainDelta0En: 'Dynamic strainburst',
    plasticRadiusRpRoFa: 'پوسته‌شدن شکننده (Brittle Slabbing)',
    plasticRadiusRpRoEn: 'Brittle Slabbing',
    mechanismFa: 'آزادسازی انفجاری انرژی الاستیک ذخیره‌شده در سنگ بسیار سخت؛ تشکیل شکستگی‌های کششی موازی جداره و پرتاب سنگ.',
    mechanismEn: 'Explosive release of elastic strain energy in stiff brittle rock; dynamic tensile slabbing and ejection.',
    excavationMethodFa: 'آتشباری ملایم کنترل‌شده (Smooth Blasting) با حفر چال‌های تنش‌زدایی پیشاپیش (Destressing Holes).',
    excavationMethodEn: 'Smooth perimeter blasting combined with face destressing relief holes to displace stress peaks.',
    advanceRate: '1.0 - 1.5 m',
    mitigationMaFa: ['Ma8: حفر چال‌های تنش‌زدایی پیشاپیش سینه کار (Advance Destressing Holes)', 'Ma1: کنترل خطوط آتشباری'],
    mitigationMaEn: ['Ma8: Advance destressing relief holes ahead of face', 'Ma1: Controlled smooth perimeter blasting'],
    mitigationMbFa: ['Mb6: بولت‌های تسلیم‌پذیر جاذب انرژی با ظرفیت دینامیکی بالا (D-Bolts / Swellex)', 'Mb7: شاتکریت الیافی ۱۵۰-۲۰۰ میلی‌متر با توری مش فولادی متصل به واشرهای پهن', 'Mb8: قاب‌های تسلیم‌پذیر ضدضربه'],
    mitigationMbEn: ['Mb6: Dynamic energy-absorbing yieldable bolts (D-Bolts / Swellex)', 'Mb7: Heavy fiber shotcrete 150-200 mm with steel mesh and oversized plates', 'Mb8: Yieldable crash-resistant steel sets'],
    profileType: 'horseshoe_spalling',
    activeSpecs: {
      rockbolts: 'بولت‌های تسلیم‌پذیر جاذب دینامیکی D-Bolt',
      shotcrete: 'شاتکریت پرطاقت ۱۵۰-۲۰۰ mm + مش سنگین',
      steelSets: 'قاب‌های تسلیم‌پذیر ضربه‌گیر',
      invert: 'اینورت بتنی تقویت‌شده',
      special: 'چال‌های تنش‌زدایی پیشاپیش سینه کار',
    },
  },
  C2: {
    id: 'C2',
    code: 'ST = C2',
    nameFa: 'مقطع ST = C2 (ریزش گرانشی، توده‌سنگ ضعیف و ریزش گنبدی سقف)',
    nameEn: 'ST = C2 (Gravity Caving & Reduced Self-Support)',
    shortTagFa: 'ریزش گنبدی',
    shortTagEn: 'Caving',
    hazardCode: 'H4',
    hazardTitleFa: 'ریزش گرانشی، ریزش گنبدی سقف (Chimneying) و کاهش زمان خودپایداری',
    hazardTitleEn: 'Hazard H4: Gravity caving, roof ravelling and chimneying in weak rock',
    domain: 'elastic_plastic',
    color: '#ea580c',
    criteriaFa: '0.40 ≤ IC < 1.0 و 20 ≤ RMR < 40 (25 ≤ GSI < 40)؛ توده‌سنگ خردشده با زمان خودپایداری کم',
    criteriaEn: '0.40 ≤ IC < 1.0 and 20 ≤ RMR < 40; Reduced self-supporting time and rapid unraveling',
    icRange: '0.40 ≤ IC < 1.0',
    rmrRange: '20 - 40',
    gsiRange: '25 - 40',
    strainDelta0Fa: '0.5 - 1.5 %',
    strainDelta0En: '0.5 - 1.5 %',
    plasticRadiusRpRoFa: '1.8 - 2.5',
    plasticRadiusRpRoEn: '1.8 - 2.5',
    mechanismFa: 'گسست پیوند بین‌بلوکی تحت وزن خود سنگ؛ ریزش متوالی از تاج و ایجاد حفرات قوسی به سمت بالا.',
    mechanismEn: 'Loss of inter-block cohesion under gravity; progressive unraveling of the crown forming upward chimneys.',
    excavationMethodFa: 'حفاری مقطعی با گام کوتاه ۱.۰ تا ۱.۵ متر و میله‌های رانشی پیش‌نگهدارنده در طاق (Spiling).',
    excavationMethodEn: 'Top heading and bench with short 1.0-1.5m rounds and advance crown spiling.',
    advanceRate: '1.0 - 1.5 m',
    mitigationMaFa: ['Ma5: میله‌های رانشی پیش‌نگهدارنده در تاج (Crown Spiling Bars)', 'Ma7: آب‌بندی فوری سینه کار با شاتکریت'],
    mitigationMaEn: ['Ma5: Advance crown spiling bars ahead of excavation', 'Ma7: Immediate face sealing with shotcrete flash coat'],
    mitigationMbFa: ['Mb5: قاب‌های فولادی نوردشده سنگین (HEB 120-140) با فواصل ۱.۰ متر', 'Mb7: شاتکریت مسلح الیافی ۱۰۰ الی ۱۵۰ میلی‌متر در ۲ لایه', 'Mb1: احداث اینورت سازه‌ای در فاصله کوتاه'],
    mitigationMbEn: ['Mb5: Heavy rolled steel sets (HEB 120-140) at 1.0 m spacing', 'Mb7: Fiber-reinforced shotcrete 100-150 mm in 2 layers', 'Mb1: Structural invert arch closure close to face'],
    profileType: 'horseshoe_caving',
    activeSpecs: {
      rockbolts: 'بولت‌های تزریقی + میله‌های Spiling پیشرو',
      shotcrete: 'شاتکریت مسلح الیافی ۱۰۰-۱۵۰ mm',
      steelSets: 'قاب‌های فولادی سنگین نوردشده HEB 120-140',
      invert: 'اینورت قوسی سازه‌ای در فاصله کوتاه',
      special: 'پیش‌نگهداری طاق با میله‌های Spiling',
    },
  },
  D: {
    id: 'D',
    code: 'ST = D',
    nameFa: 'مقطع ST = D (فشردگی شدید / Severe Squeezing)',
    nameEn: 'ST = D (Severe Squeezing & Plastic Convergence)',
    shortTagFa: 'فشردگی شدید',
    shortTagEn: 'Severe Squeezing',
    hazardCode: 'H3',
    hazardTitleFa: 'فشردگی شدید، همگرایی ۲ الی ۵ درصد و بارگذاری سنگین بر سیستم نگهداری',
    hazardTitleEn: 'Hazard H3: Stress-induced squeezing, 2-5% convergence and high rock pressure',
    domain: 'plastic',
    color: '#e11d48',
    criteriaFa: '0.20 ≤ IC < 0.40 و RMR > 20؛ تنش برجا بسیار زیاد یا مقاومت توده‌سنگ کم',
    criteriaEn: '0.20 ≤ IC < 0.40 and RMR > 20; High overburden resulting in severe squeezing',
    icRange: '0.20 ≤ IC < 0.40',
    rmrRange: '20 - 100',
    gsiRange: '20 - 75',
    strainDelta0Fa: '1.5 - 4.5 % (فشردگی شدید)',
    strainDelta0En: '1.5 - 4.5 % (Severe Squeezing)',
    plasticRadiusRpRoFa: '2.5 - 4.0',
    plasticRadiusRpRoEn: '2.5 - 4.0',
    mechanismFa: 'تغییرشکل ویسکوپلاستیک وابسته به زمان؛ تسلیم عمیق پیرامون تونل و فشار سنگین همگرا به سمت داخل.',
    mechanismEn: 'Time-dependent viscoplastic flow; deep yielding around tunnel causing heavy inward convergence.',
    excavationMethodFa: 'حفاری مقطعی چندبخشی با گام کوتاه ۰.۸-۱.۲ متر و تعبیه درزهای تغییرشکل طولی (Slots).',
    excavationMethodEn: 'Sectorial excavation with 0.8-1.2m rounds and longitudinal deformation slots in shotcrete.',
    advanceRate: '0.8 - 1.2 m',
    mitigationMaFa: ['Ma3: میخ‌کوبی فایبرگلاس در جبهه‌کار جهت مهار اکستروژن', 'Ma5: لوله‌های پیشرو در تاج (Forepoling)'],
    mitigationMaEn: ['Ma3: Face fiberglass dowels to constrain extrusion', 'Ma5: Forepoling canopy ahead of crown'],
    mitigationMbFa: ['Mb4: قاب‌های فولادی تسلیم‌پذیر لغزنده (TH Arches با بست‌های اصطکاکی)', 'Mb3: شاتکریت با درزهای بازدهی طولی ۱۵۰-۲۰۰ میلی‌متر', 'Mb1: بستن رینگ نگهداری با اینورت صلب در فاصله کمتر از دهانه'],
    mitigationMbEn: ['Mb4: Yieldable sliding steel sets (TH arches with friction clamps)', 'Mb3: Shotcrete lining with longitudinal deformation slots (150-200 mm)', 'Mb1: Rapid invert ring closure at distance < span'],
    profileType: 'horseshoe_squeezing',
    activeSpecs: {
      rockbolts: 'بولت‌های شعاعی بلند + میخ‌کوبی فایبرگلاس پیشانی',
      shotcrete: 'شاتکریت با درزهای تغییرشکل طولی (Slots)',
      steelSets: 'قاب‌های لغزنده تسلیم‌پذیر TH با بست اصطکاکی',
      invert: 'اینورت صلب قوسی با بستن سریع رینگ',
      special: 'شکاف‌های تسلیم طولی جهت تخلیه کرنش',
    },
  },
  E: {
    id: 'E',
    code: 'ST = E',
    nameFa: 'مقطع ST = E (فشردگی فوق‌العاده شدید و جریان پلاستیک بحرانی)',
    nameEn: 'ST = E (Very Severe Squeezing & Visco-Plastic Flow)',
    shortTagFa: 'فشردگی بحرانی',
    shortTagEn: 'Very Severe',
    hazardCode: 'H3',
    hazardTitleFa: 'فشردگی بحرانی، همگرایی بیش از ۵ تا ۱۰ درصد، اکستروژن سینه کار و بالاآمدگی کف',
    hazardTitleEn: 'Hazard H3: Extreme plastic flow, > 5-10% convergences, massive face extrusion',
    domain: 'plastic',
    color: '#be123c',
    criteriaFa: 'IC < 0.20 و RMR > 20؛ روباره بسیار عمیق یا سنگ ضعیف با مقاومت ناچیز',
    criteriaEn: 'IC < 0.20 and RMR > 20; Extreme overburden or highly weakened sheared rock mass',
    icRange: 'IC < 0.20',
    rmrRange: '20 - 100',
    gsiRange: '10 - 65',
    strainDelta0Fa: '> 5.0 - 10.0 % (فشردگی بحرانی)',
    strainDelta0En: '> 5.0 - 10.0 % (Critical Squeezing)',
    plasticRadiusRpRoFa: '> 4.0 (زون پلاستیک عمیق)',
    plasticRadiusRpRoEn: '> 4.0 (Deep Plastic Zone)',
    mechanismFa: 'جریان موم‌سان و پلاستیک گسترده سنگ تحت تنش برشی بحرانی؛ مچاله‌شدن سیستم نگهداری صلب بدون المان‌های جاذب.',
    mechanismEn: 'Massive plastic flow under extreme deviatoric stress; immediate crushing of rigid support without yield elements.',
    excavationMethodFa: 'حفاری زنجیره‌ای با هندسه مقطع دایروی (Circular Profile) و پیش‌تحکیم کامل هسته سینه کار.',
    excavationMethodEn: 'Sequential drift excavation with circular profile and complete face core pre-confinement.',
    advanceRate: '0.6 - 1.0 m',
    mitigationMaFa: ['Ma2/Ma3: تحکیم متراکم سینه کار با بولت‌های فایبرگلاس (Face Bolting L=15-18m)', 'Ma4: چتر پیش‌تحکیم لوله‌ای (Pipe Umbrella Canopy)'],
    mitigationMaEn: ['Ma2/Ma3: High-density face fiberglass bolting (Face Bolting L=15-18m)', 'Ma4: Steel pipe umbrella canopy ahead of crown'],
    mitigationMbFa: ['Mb2: هندسه مقطع دایروی بسته', 'Mb8: شاتکریت مسلح ضخیم با المان‌های تراکم‌پذیر جاذب بار (HiDCon)', 'Mb4: قاب‌های تسلیم‌پذیر بسیار سنگین TH', 'Mb1: بستن فوری اینورت دایروی در ۵ متری جبهه‌کار'],
    mitigationMbEn: ['Mb2: Closed circular cross-section geometry', 'Mb8: Thick reinforced shotcrete with compressible yield elements (HiDCon)', 'Mb4: Extra heavy TH yieldable arch sets', 'Mb1: Immediate circular invert ring closure within 5m of face'],
    profileType: 'circular_extreme',
    activeSpecs: {
      rockbolts: 'بولت‌های بلند شعاعی ۳۶۰ درجه + فایبرگلاس هسته',
      shotcrete: 'شاتکریت ضخیم با المان‌های فشرده‌شونده HiDCon',
      steelSets: 'قوس‌های دایروی بسیار سنگین TH با اتصالات لغزنده',
      invert: 'اینورت دایروی بسته باربر در ۵ متری سینه کار',
      special: 'مقطع کاملاً دایروی (Mb2) + پیش‌تحکیم کامل هسته',
    },
  },
  F: {
    id: 'F',
    code: 'ST = F',
    nameFa: 'مقطع ST = F (توده‌سنگ کاتاکلاستیک گسله، ریزش فوری و زمین روان)',
    nameEn: 'ST = F (Cataclastic Fault Gouge & Flowing Ground)',
    shortTagFa: 'خردشده گسله',
    shortTagEn: 'Cataclastic Fault',
    hazardCode: 'H4',
    hazardTitleFa: 'ریزش آواری گسترده، ریزش فوری سینه کار و جریان رسوبات خردشده گسله',
    hazardTitleEn: 'Hazard H4: Immediate face collapse, running/flowing cohesionless fault ground',
    domain: 'collapse',
    color: '#991b1b',
    criteriaFa: 'RMR ≤ 20 یا GSI < 25؛ ماده گسله کاملاً خردشده با چسبندگی صفر تحت بار آب زیرزمینی',
    criteriaEn: 'RMR ≤ 20 or GSI < 25; Completely crushed fault gouge with near-zero cohesion',
    icRange: 'متغیر / بحرانی',
    rmrRange: '0 - 20',
    gsiRange: '5 - 25',
    strainDelta0Fa: 'فروپاشی آنی (Ravelling)',
    strainDelta0En: 'Instant Ravelling / Collapse',
    plasticRadiusRpRoFa: 'ناپایداری کلی بدون خودپایداری',
    plasticRadiusRpRoEn: 'General Instability / Zero Stand-up',
    mechanismFa: 'توده‌سنگ کاتاکلاستیک بدون مقاومت کششی یا برشی موثر؛ گسیختگی گرانشی فوری و ورود گل و لای به داخل فضای کار.',
    mechanismEn: 'Completely fragmented cataclastic rock mass; zero stand-up time with immediate ravelling under hydrostatic head.',
    excavationMethodFa: 'پیش‌تحکیم سنگین پیشاپیش (Pre-confinement) با چتر لوله‌ای سنگین و حفر مقاطع کوچک با گام زیر ۰.۸ متر.',
    excavationMethodEn: 'Heavy advance pre-confinement with steel pipe umbrella, sub-drifts with advance rounds < 0.8m.',
    advanceRate: '0.5 - 0.8 m',
    mitigationMaFa: ['Ma1/Ma6: تزریق نفوذی سیمان میکرو و مواد شیمیایی جهت چسبندگی ذرات', 'Ma3: چتر فورپولینگ لوله‌ای قطر ۱۱۴ میلی‌متر با همپوشانی ۴ متری', 'Ma2: میخ‌کوبی متراکم سینه کار با فایبرگلاس', 'Ma4: زه‌کشی پیشاپیش زیرافقی'],
    mitigationMaEn: ['Ma1/Ma6: Permeation micro-cement and chemical grouting for cohesion', 'Ma3: Heavy steel pipe umbrella canopy (114mm dia with 4m overlap)', 'Ma2: High-density face fiberglass nailing', 'Ma4: Advance sub-horizontal face drainage'],
    mitigationMbFa: ['Mb5: قاب‌های صلب فولادی سنگین (HEB 160-200) با فاصله متراکم ۰.۶ متر', 'Mb7: شاتکریت ضخیم ۲۰۰-۲۵۰ میلی‌متر بلافاصله پس از بازشدگی', 'Mb1: اینورت بتنی مسلح همزمان با طاق'],
    mitigationMbEn: ['Mb5: Heavy rigid steel arches (HEB 160-200) at 0.6 m spacing', 'Mb7: Thick shotcrete 200-250 mm applied immediately upon opening', 'Mb1: Heavy structural reinforced invert concurrent with heading'],
    profileType: 'horseshoe_cataclastic',
    activeSpecs: {
      rockbolts: 'میخ‌کوبی متراکم فایبرگلاس پیشانی + تزریق دوغاب',
      shotcrete: 'شاتکریت سنگین ۲۰۰-۲۵۰ mm مسلح',
      steelSets: 'قاب‌های صلب سنگین HEB 160-200 @ 0.6m',
      invert: 'اینورت بتنی مسلح سنگین همزمان با کلاهک',
      special: 'چتر فورپولینگ لوله‌ای Ø114mm (Pipe Umbrella)',
    },
  },
};

export const RussoStSectionsExplorer: React.FC<RussoStSectionsExplorerProps> = ({
  russoResult,
  lang,
}) => {
  const isFa = lang === 'fa';

  // Map russoResult.classCode and sectionType to our section database keys
  const getInitialActiveSection = (): string => {
    if (russoResult.sectionType === 'C1*' || russoResult.classCode === 'C1_SPALLING' || russoResult.classCode === 'C4' || (russoResult.classCode === 'C3' && russoResult.behaviorDomain === 'brittle_failure')) {
      return 'C1_SPALLING';
    }
    if (russoResult.sectionType && russoResult.sectionType in ST_SECTIONS_DATABASE) {
      return russoResult.sectionType;
    }
    if (russoResult.classCode in ST_SECTIONS_DATABASE) {
      return russoResult.classCode;
    }
    return 'C1';
  };

  const calculatedKey = getInitialActiveSection();
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>(calculatedKey);

  // Auto-sync active tab when calculated section changes
  useEffect(() => {
    setSelectedSectionKey(calculatedKey);
  }, [calculatedKey]);

  const activeSection = ST_SECTIONS_DATABASE[selectedSectionKey] || ST_SECTIONS_DATABASE[calculatedKey] || ST_SECTIONS_DATABASE['C1'];

  return (
    <div className="space-y-4">
      {/* SECTION TABS SELECTOR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
        {Object.entries(ST_SECTIONS_DATABASE).map(([key, item]) => {
          const isSelected = key === selectedSectionKey;
          const isCalculated = key === calculatedKey;

          return (
            <button
              key={key}
              onClick={() => setSelectedSectionKey(key)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500/40'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              {isCalculated && (
                <span className="absolute -top-2 right-1 flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold shadow animate-pulse">
                  {isFa ? 'پروژه' : 'Active'}
                </span>
              )}

              <span
                className="font-mono text-sm font-bold tracking-tight"
                style={{ color: item.color }}
              >
                {item.code.replace('ST = ', '')}
              </span>
              <span className="text-[10px] text-slate-300 font-medium truncate w-full mt-0.5">
                {isFa ? item.shortTagFa : item.shortTagEn}
              </span>
            </button>
          );
        })}
      </div>

      {/* DETAILED SECTION HERO BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold tracking-wider text-white shadow"
              style={{ backgroundColor: activeSection.color }}
            >
              {activeSection.code}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs border border-slate-700">
              {activeSection.hazardCode}
            </span>
            {selectedSectionKey === calculatedKey && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isFa ? 'منطبق بر پارامترهای طراحی پروژه حاضر' : 'Matches Current Project Input'}</span>
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-100 mt-1">
            {isFa ? activeSection.nameFa : activeSection.nameEn}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isFa ? activeSection.hazardTitleFa : activeSection.hazardTitleEn}
          </p>
        </div>

        {/* Rapid Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-slate-500 text-[10px]">{isFa ? 'شاخص صلاحیت IC' : 'Competency IC'}</div>
            <div className="font-mono font-bold text-emerald-400 mt-0.5">{activeSection.icRange}</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-slate-500 text-[10px]">{isFa ? 'محدوده RMR' : 'RMR Range'}</div>
            <div className="font-mono font-bold text-blue-400 mt-0.5">{activeSection.rmrRange}</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-slate-500 text-[10px]">{isFa ? 'محدوده GSI' : 'GSI Range'}</div>
            <div className="font-mono font-bold text-purple-400 mt-0.5">{activeSection.gsiRange}</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-slate-500 text-[10px]">{isFa ? 'گام پیشروی' : 'Round Length'}</div>
            <div className="font-mono font-bold text-amber-400 mt-0.5">{activeSection.advanceRate}</div>
          </div>
        </div>
      </div>

      {/* MAIN TECHNICAL PANEL: TUNNEL CROSS-SECTION & SUPPORT MEASURES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT/TOP: TECHNICAL TUNNEL CROSS-SECTION SVG & COMPREHENSIVE VISUAL LEGEND */}
        <div className="lg:col-span-6 rounded-2xl bg-slate-950 border border-slate-800 p-3.5 flex flex-col justify-between shadow-lg space-y-3">
          {/* TOP SECTION BADGE & HAZARD TITLE (Clean Responsive HTML Banner - Zero Overlap) */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-white shadow-sm shrink-0"
                  style={{ backgroundColor: activeSection.color }}
                >
                  {activeSection.code}
                </span>
                <span className="px-2 py-1 rounded-lg bg-slate-800 text-sky-400 font-mono text-xs font-bold border border-slate-700 shrink-0">
                  {activeSection.hazardCode}
                </span>
                <span className="text-slate-100 font-bold text-xs sm:text-sm">
                  {isFa ? activeSection.nameFa : activeSection.nameEn}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0">
                Rp/Ro: {isFa ? activeSection.plasticRadiusRpRoFa : activeSection.plasticRadiusRpRoEn}
              </span>
            </div>

            {/* Clear Geotechnical Hazard Description Callout */}
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-amber-300 ml-1">{isFa ? 'خطر ژئوتکنیکی حاکم:' : 'Primary Geotechnical Hazard:'}</strong>
                <span>{isFa ? activeSection.hazardTitleFa : activeSection.hazardTitleEn}</span>
              </div>
            </div>
          </div>

          {/* SVG RENDERING OF TUNNEL SECTION */}
          <div className="w-full flex items-center justify-center py-1">
            <svg
              viewBox="0 0 520 370"
              dir="ltr"
              className="w-full h-auto max-w-[480px] select-none font-sans"
            >
              <defs>
                {/* Arrow markers for convergence vectors */}
                <marker id="stArrowRed" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill="#f43f5e" />
                </marker>
                <marker id="stArrowCyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill="#38bdf8" />
                </marker>
                {/* Geological rock hatching */}
                <pattern id="stRockPattern" width="16" height="16" patternTransform="rotate(30 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="16" stroke="#334155" strokeWidth="0.8" strokeOpacity="0.4" />
                </pattern>
                {/* Plastic yield zone hatching */}
                <pattern id="stYieldHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="8" stroke={activeSection.color} strokeWidth="1.3" strokeOpacity="0.4" />
                </pattern>
                {/* Fault gouge crushed pattern */}
                <pattern id="stGougeHatch" width="12" height="12" patternUnits="userSpaceOnUse">
                  <circle cx="3" cy="3" r="1.2" fill="#ef4444" fillOpacity="0.4" />
                  <circle cx="9" cy="9" r="1.2" fill="#ef4444" fillOpacity="0.4" />
                  <line x1="0" y1="6" x2="12" y2="6" stroke="#7f1d1d" strokeWidth="0.6" strokeOpacity="0.5" />
                </pattern>
              </defs>

              {/* Rock Mass Background */}
              <rect x="8" y="8" width="504" height="354" fill="#090d16" stroke="#1e293b" strokeWidth="1.5" rx="12" />
              <rect x="8" y="8" width="504" height="354" fill={activeSection.id === 'F' ? 'url(#stGougeHatch)' : 'url(#stRockPattern)'} rx="12" />

              {/* TUNNEL GEOMETRY & MECHANISM ACCORDING TO ST SECTION */}
              {activeSection.profileType === 'circular_extreme' ? (
                // ================= ST = E: CIRCULAR PROFILE FOR EXTREME SQUEEZING =================
                <g>
                  {/* Outer deep plastic zone */}
                  <circle cx="260" cy="205" r="142" fill="url(#stYieldHatch)" stroke={activeSection.color} strokeWidth="1.8" strokeDasharray="5 3" />

                  {/* Squeezing convergence inward vectors (8 radial arrows) */}
                  {[-135, -90, -45, 0, 45, 90, 135, 180].map((deg) => {
                    const rad = (deg * Math.PI) / 180;
                    const x1 = 260 + 134 * Math.cos(rad);
                    const y1 = 205 + 134 * Math.sin(rad);
                    const x2 = 260 + 102 * Math.cos(rad);
                    const y2 = 205 + 102 * Math.sin(rad);
                    return (
                      <line key={`sq-arrow-${deg}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f43f5e" strokeWidth="2.2" markerEnd="url(#stArrowRed)" />
                    );
                  })}

                  {/* Heavy Radial Pattern Rockbolts (12 around perimeter) */}
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
                    const rad = (deg * Math.PI) / 180;
                    const x1 = 260 + 88 * Math.cos(rad);
                    const y1 = 205 + 88 * Math.sin(rad);
                    const x2 = 260 + 138 * Math.cos(rad);
                    const y2 = 205 + 138 * Math.sin(rad);
                    // Plate perpendicular
                    const px1 = x1 - 5 * Math.sin(rad);
                    const py1 = y1 + 5 * Math.cos(rad);
                    const px2 = x1 + 5 * Math.sin(rad);
                    const py2 = y1 - 5 * Math.cos(rad);
                    return (
                      <g key={`bolt-circ-${deg}`}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#38bdf8" strokeWidth="2.2" />
                        <line x1={px1} y1={py1} x2={px2} y2={py2} stroke="#ffffff" strokeWidth="3" />
                        <circle cx={x2} cy={y2} r="2.5" fill="#38bdf8" />
                      </g>
                    );
                  })}

                  {/* Thick Shotcrete Circular Ring */}
                  <circle cx="260" cy="205" r="88" fill="#1e293b" stroke="#64748b" strokeWidth="14" />

                  {/* HiDCon Compressible Yielding Elements (embedded in shotcrete) */}
                  <circle cx="260" cy="205" r="88" fill="none" stroke="#f59e0b" strokeWidth="14" strokeDasharray="24 45" />

                  {/* Steel Sets (TH Yieldable heavy circular ring) */}
                  <circle cx="260" cy="205" r="84" fill="none" stroke="#f97316" strokeWidth="3" />

                  {/* Tunnel Opening Interior */}
                  <circle cx="260" cy="205" r="80" fill="#020617" />

                  {/* Face reinforcement fiberglass dowels (shown at tunnel center) */}
                  <g opacity="0.85">
                    {[-30, -10, 10, 30].map((offset) => (
                      <line
                        key={`face-fiber-${offset}`}
                        x1={240 + offset}
                        y1={175}
                        x2={240 + offset}
                        y2={235}
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeDasharray="4 3"
                      />
                    ))}
                  </g>

                  {/* Centered Tunnel Information Card */}
                  <rect x="215" y="188" width="90" height="34" fill="#020617" fillOpacity="0.92" rx="6" stroke="#334155" />
                  <text x="260" y="204" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    {activeSection.code}
                  </text>
                  <text x="260" y="217" fill="#be123c" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    Circular • Mb2
                  </text>
                </g>
              ) : (
                // ================= HORSESHOE PROFILES (ST = A, B, C1, C1*, C2, D, F) =================
                <g>
                  {/* Plastic Zone Boundary for Yielding/Squeezing/Caving */}
                  {(activeSection.id === 'C1' || activeSection.id === 'C2' || activeSection.id === 'D' || activeSection.id === 'F') && (
                    <path
                      d="M 140 280 C 130 155 180 88 260 88 C 340 88 390 155 380 280 Z"
                      fill="url(#stYieldHatch)"
                      stroke={activeSection.color}
                      strokeWidth="1.6"
                      strokeDasharray="5 3"
                    />
                  )}

                  {/* Specific Instability Geometries */}
                  {/* ST = B: INTERSECTING JOINT SETS FORMING ROOF & SIDEWALL WEDGES */}
                  {activeSection.id === 'B' && (
                    <g>
                      {/* Joint planes intersecting */}
                      <line x1="160" y1="240" x2="330" y2="100" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="5 3" opacity="0.6" />
                      <line x1="360" y1="240" x2="190" y2="100" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="5 3" opacity="0.6" />
                      {/* Roof wedge polygon */}
                      <polygon points="215,160 260,115 305,160" fill="#0284c7" fillOpacity="0.45" stroke="#38bdf8" strokeWidth="2" />
                      {/* Sidewall left wedge */}
                      <polygon points="180,215 155,240 180,265" fill="#0284c7" fillOpacity="0.45" stroke="#38bdf8" strokeWidth="2" />
                      {/* Wedge labels */}
                      <rect x="220" y="96" width="80" height="18" rx="4" fill="#020617" fillOpacity="0.88" stroke="#38bdf8" strokeWidth="0.8" />
                      <text x="260" y="109" fill="#38bdf8" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                        {isFa ? 'گوه سقف' : 'Roof Wedge'}
                      </text>
                    </g>
                  )}

                  {/* ST = C1_SPALLING: BRITTLE TENSILE SLABBING SPALLS & DYNAMIC BURST */}
                  {activeSection.id === 'C1_SPALLING' && (
                    <g>
                      {/* Outer spalling slabs */}
                      <path d="M 210 135 Q 260 120 310 135" fill="none" stroke="#ef4444" strokeWidth="3.5" strokeDasharray="10 5" />
                      <path d="M 195 150 Q 260 136 325 150" fill="none" stroke="#dc2626" strokeWidth="3.5" strokeDasharray="14 6" />
                      {/* Sidewall buckling slabs */}
                      <path d="M 168 205 Q 160 240 168 275" fill="none" stroke="#ef4444" strokeWidth="3.5" strokeDasharray="12 5" />
                      <path d="M 352 205 Q 360 240 352 275" fill="none" stroke="#ef4444" strokeWidth="3.5" strokeDasharray="12 5" />
                      {/* Stress concentration indicators */}
                      <text x="145" y="245" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">σθ ⇈</text>
                      <text x="375" y="245" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">σθ ⇈</text>
                    </g>
                  )}

                  {/* ST = C2: GRAVITY CAVING CHIMNEY */}
                  {activeSection.id === 'C2' && (
                    <g>
                      {/* Chimney caving cavity extending upwards */}
                      <path d="M 215 140 Q 260 65 305 140 Z" fill="#b45309" fillOpacity="0.45" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
                      {/* Detached falling rock fragments */}
                      <rect x="250" y="95" width="14" height="10" rx="2" fill="#78350f" stroke="#f59e0b" strokeWidth="1" transform="rotate(15 257 100)" />
                      <rect x="238" y="115" width="12" height="9" rx="2" fill="#78350f" stroke="#f59e0b" strokeWidth="1" transform="rotate(-20 244 119)" />
                      <rect x="268" y="122" width="10" height="8" rx="2" fill="#78350f" stroke="#f59e0b" strokeWidth="1" transform="rotate(25 273 126)" />
                      {/* Spiling bars driven forward above crown */}
                      <line x1="205" y1="160" x2="235" y2="75" stroke="#eab308" strokeWidth="2.5" strokeDasharray="5 2" />
                      <line x1="260" y1="145" x2="260" y2="58" stroke="#eab308" strokeWidth="2.5" strokeDasharray="5 2" />
                      <line x1="315" y1="160" x2="285" y2="75" stroke="#eab308" strokeWidth="2.5" strokeDasharray="5 2" />
                    </g>
                  )}

                  {/* ST = D: SQUEEZING CONVERGENCE VECTORS */}
                  {activeSection.id === 'D' && (
                    <g>
                      {/* Inward convergence vectors with arrowheads */}
                      <line x1="135" y1="210" x2="168" y2="210" stroke="#f43f5e" strokeWidth="2.5" markerEnd="url(#stArrowRed)" />
                      <line x1="385" y1="210" x2="352" y2="210" stroke="#f43f5e" strokeWidth="2.5" markerEnd="url(#stArrowRed)" />
                      <line x1="260" y1="88" x2="260" y2="128" stroke="#f43f5e" strokeWidth="2.5" markerEnd="url(#stArrowRed)" />
                      <line x1="175" y1="120" x2="202" y2="148" stroke="#f43f5e" strokeWidth="2.5" markerEnd="url(#stArrowRed)" />
                      <line x1="345" y1="120" x2="318" y2="148" stroke="#f43f5e" strokeWidth="2.5" markerEnd="url(#stArrowRed)" />
                    </g>
                  )}

                  {/* ST = F: HEAVY STEEL PIPE UMBRELLA CANOPY & FACE FIBERGLASS */}
                  {activeSection.id === 'F' && (
                    <g>
                      {/* Pipe umbrella canopy arch */}
                      <path d="M 145 165 Q 260 72 375 165" fill="none" stroke="#e11d48" strokeWidth="6" strokeDasharray="10 5" />
                      {/* Forepoling pipe circles */}
                      {[155, 185, 220, 260, 300, 335, 365].map((px) => {
                        const t = (px - 145) / (375 - 145);
                        const py = (1 - t) * (1 - t) * 165 + 2 * (1 - t) * t * 72 + t * t * 165;
                        return (
                          <circle key={`pipe-${px}`} cx={px} cy={py} r="4.5" fill="#fecdd3" stroke="#be123c" strokeWidth="1.5" />
                        );
                      })}
                      {/* Face fiberglass bolts */}
                      <line x1="230" y1="185" x2="290" y2="185" stroke="#10b981" strokeWidth="3" strokeDasharray="5 3" />
                      <line x1="230" y1="215" x2="290" y2="215" stroke="#10b981" strokeWidth="3" strokeDasharray="5 3" />
                      <line x1="230" y1="245" x2="290" y2="245" stroke="#10b981" strokeWidth="3" strokeDasharray="5 3" />
                    </g>
                  )}

                  {/* TUNNEL CAVITY (Standard Horseshoe Arch Opening) */}
                  <path
                    d="M 180 280 L 180 210 C 180 148 215 140 260 140 C 305 140 340 148 340 210 L 340 280 Z"
                    fill="#020617"
                    stroke="#475569"
                    strokeWidth="3"
                  />

                  {/* SHOTCRETE LINING BAND */}
                  {activeSection.id !== 'A' && (
                    <path
                      d="M 182 280 L 182 210 C 182 150 216 142 260 142 C 304 142 338 150 338 210 L 338 280"
                      fill="none"
                      stroke={activeSection.id === 'D' ? '#eab308' : '#94a3b8'}
                      strokeWidth={activeSection.id === 'F' ? 12 : activeSection.id === 'C1_SPALLING' ? 9 : 6}
                      strokeDasharray={activeSection.id === 'D' ? '28 14' : undefined}
                    />
                  )}

                  {/* STEEL RIBS (HEB Sets or Sliding TH Arches) */}
                  {(activeSection.id === 'C2' || activeSection.id === 'D' || activeSection.id === 'F' || activeSection.id === 'C1_SPALLING') && (
                    <g>
                      <path
                        d="M 186 280 L 186 212 C 186 155 218 146 260 146 C 302 146 334 155 334 212 L 334 280"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="3.5"
                      />
                      {/* Sliding friction clamp joints for TH arches in D */}
                      {activeSection.id === 'D' && (
                        <g fill="#f97316">
                          <rect x="210" y="155" width="8" height="6" rx="1.5" />
                          <rect x="302" y="155" width="8" height="6" rx="1.5" />
                        </g>
                      )}
                    </g>
                  )}

                  {/* RADIAL ROCKBOLTS (Pattern Bolts with Bearing Plates) */}
                  {activeSection.id !== 'A' && (
                    <g>
                      {/* Crown Bolt (Top apex) */}
                      <g>
                        <line x1="260" y1="140" x2="260" y2="78" stroke={activeSection.id === 'C1_SPALLING' ? '#ef4444' : '#38bdf8'} strokeWidth="2.2" />
                        <line x1="254" y1="140" x2="266" y2="140" stroke="#ffffff" strokeWidth="3" />
                        <circle cx="260" cy="78" r="2.5" fill={activeSection.id === 'C1_SPALLING' ? '#ef4444' : '#38bdf8'} />
                      </g>
                      {/* Left Shoulder Bolt */}
                      <g>
                        <line x1="220" y1="150" x2="190" y2="92" stroke={activeSection.id === 'C1_SPALLING' ? '#ef4444' : '#38bdf8'} strokeWidth="2.2" />
                        <line x1="216" y1="148" x2="224" y2="152" stroke="#ffffff" strokeWidth="3" />
                        <circle cx="190" cy="92" r="2.5" fill={activeSection.id === 'C1_SPALLING' ? '#ef4444' : '#38bdf8'} />
                      </g>
                      {/* Right Shoulder Bolt */}
                      <g>
                        <line x1="300" y1="150" x2="330" y2="92" stroke={activeSection.id === 'C1_SPALLING' ? '#ef4444' : '#38bdf8'} strokeWidth="2.2" />
                        <line x1="296" y1="152" x2="304" y2="148" stroke="#ffffff" strokeWidth="3" />
                        <circle cx="330" cy="92" r="2.5" fill={activeSection.id === 'C1_SPALLING' ? '#ef4444' : '#38bdf8'} />
                      </g>
                      {/* Left Springline Bolt */}
                      <g>
                        <line x1="182" y1="195" x2="122" y2="165" stroke={activeSection.id === 'C1_SPALLING' ? '#ef4444' : '#38bdf8'} strokeWidth="2.2" />
                        <line x1="181" y1="191" x2="183" y2="199" stroke="#ffffff" strokeWidth="3" />
                        <circle cx="122" cy="165" r="2.5" fill={activeSection.id === 'C1_SPALLING' ? '#ef4444' : '#38bdf8'} />
                      </g>
                      {/* Right Springline Bolt */}
                      <g>
                        <line x1="338" y1="195" x2="398" y2="165" stroke={activeSection.id === 'C1_SPALLING' ? '#ef4444' : '#38bdf8'} strokeWidth="2.2" />
                        <line x1="337" y1="191" x2="339" y2="199" stroke="#ffffff" strokeWidth="3" />
                        <circle cx="398" cy="165" r="2.5" fill={activeSection.id === 'C1_SPALLING' ? '#ef4444' : '#38bdf8'} />
                      </g>
                      {/* Left Lower Sidewall Bolt */}
                      <g>
                        <line x1="180" y1="245" x2="115" y2="245" stroke={activeSection.id === 'C1_SPALLING' ? '#ef4444' : '#38bdf8'} strokeWidth="2.2" />
                        <line x1="180" y1="240" x2="180" y2="250" stroke="#ffffff" strokeWidth="3" />
                        <circle cx="115" cy="245" r="2.5" fill={activeSection.id === 'C1_SPALLING' ? '#ef4444' : '#38bdf8'} />
                      </g>
                      {/* Right Lower Sidewall Bolt */}
                      <g>
                        <line x1="340" y1="245" x2="405" y2="245" stroke={activeSection.id === 'C1_SPALLING' ? '#ef4444' : '#38bdf8'} strokeWidth="2.2" />
                        <line x1="340" y1="240" x2="340" y2="250" stroke="#ffffff" strokeWidth="3" />
                        <circle cx="405" cy="245" r="2.5" fill={activeSection.id === 'C1_SPALLING' ? '#ef4444' : '#38bdf8'} />
                      </g>
                    </g>
                  )}

                  {/* ST = A Spot Bolting Indicator */}
                  {activeSection.id === 'A' && (
                    <g opacity="0.6">
                      <line x1="260" y1="140" x2="260" y2="85" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4 2" />
                      <line x1="255" y1="140" x2="265" y2="140" stroke="#ffffff" strokeWidth="2.5" />
                      <circle cx="260" cy="85" r="2" fill="#38bdf8" />
                    </g>
                  )}

                  {/* INVERT SUPPORT (Flat or Reinforced Curved Invert Arch) */}
                  {(activeSection.id === 'C2' || activeSection.id === 'D' || activeSection.id === 'F') ? (
                    <g>
                      {/* Structural Curved Invert Arch */}
                      <path d="M 180 280 Q 260 315 340 280" fill="none" stroke="#64748b" strokeWidth="9" />
                      <path d="M 180 280 Q 260 315 340 280" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4" />
                    </g>
                  ) : (
                    // Flat rock/concrete floor
                    <line x1="180" y1="280" x2="340" y2="280" stroke="#475569" strokeWidth="3.5" />
                  )}

                  {/* Inside Tunnel Centered Info Card */}
                  <rect x="215" y="208" width="90" height="34" fill="#020617" fillOpacity="0.92" rx="6" stroke="#334155" />
                  <text x="260" y="224" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    {activeSection.code}
                  </text>
                  <text x="260" y="237" fill={activeSection.color} fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    {activeSection.hazardCode}
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* DEDICATED RESPONSIVE LEGEND & TECHNICAL COMPONENTS GUIDE */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[11px] font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isFa ? 'لژند و راهنمای المان‌های سیستم نگهداری (Visual Legend):' : 'Support Elements Legend & Specs:'}</span>
              </span>
              <span className="text-slate-400 font-normal">
                {isFa ? 'بر اساس مقطع انتخابی' : 'Configured for active ST'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {/* 1. Rockbolts */}
              <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-900 shrink-0 border border-slate-700 mt-0.5">
                  <div className="relative w-4 h-1.5 bg-sky-400 flex items-center justify-end">
                    <div className="w-0.5 h-3 bg-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sky-400">{isFa ? 'راک‌بولت‌ها / بولت تسلیم‌پذیر' : 'Rockbolts / D-Bolts'}</div>
                  <div className="text-slate-300 text-[10.5px] leading-snug break-words mt-0.5">{activeSection.activeSpecs.rockbolts}</div>
                </div>
              </div>

              {/* 2. Shotcrete */}
              <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-900 shrink-0 border border-slate-700 mt-0.5">
                  <div className="w-4 h-2.5 rounded-sm bg-slate-400 border border-slate-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-300">{isFa ? 'شاتکریت مسلح الیافی S(fr)' : 'Fiber Shotcrete'}</div>
                  <div className="text-slate-300 text-[10.5px] leading-snug break-words mt-0.5">{activeSection.activeSpecs.shotcrete}</div>
                </div>
              </div>

              {/* 3. Steel Sets */}
              <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-900 shrink-0 border border-slate-700 mt-0.5">
                  <div className="w-3.5 h-2.5 border-t-2 border-orange-500 rounded-t-sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-orange-400">{isFa ? 'قاب‌های فولادی (HEB / TH)' : 'Steel Arches (HEB / TH)'}</div>
                  <div className="text-slate-300 text-[10.5px] leading-snug break-words mt-0.5">{activeSection.activeSpecs.steelSets}</div>
                </div>
              </div>

              {/* 4. Invert */}
              <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-900 shrink-0 border border-slate-700 mt-0.5">
                  <div className="w-3.5 h-2 border-b-2 border-slate-400 rounded-b-sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-400">{isFa ? 'اینورت سازه‌ای (Invert Arch)' : 'Structural Invert'}</div>
                  <div className="text-slate-300 text-[10.5px] leading-snug break-words mt-0.5">{activeSection.activeSpecs.invert}</div>
                </div>
              </div>

              {/* 5. Special Pre-confinement */}
              <div className="col-span-1 sm:col-span-2 flex items-start gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-center w-6 h-6 rounded bg-purple-950/40 shrink-0 border border-purple-800 mt-0.5">
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-purple-300">{isFa ? 'اقدامات ویژه و پیش‌تحکیم سینه کار (Ma)' : 'Special Face & Pre-confinement (Ma)'}</div>
                  <div className="text-slate-300 text-[10.5px] leading-snug break-words mt-0.5">{activeSection.activeSpecs.special}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Excavation Mechanism Description */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>{isFa ? 'سازوکار رفتاری و ژئوتکنیکی حین بازشدگی:' : 'Geotechnical Failure Mechanism:'}</span>
            </span>
            <p className="leading-relaxed text-[11.5px] text-slate-300">
              {isFa ? activeSection.mechanismFa : activeSection.mechanismEn}
            </p>
          </div>
        </div>

        {/* RIGHT/BOTTOM: DETAILED SUPPORT SPECIFICATIONS & MITIGATIONS TABLE */}
        <div className="lg:col-span-6 space-y-3 flex flex-col justify-between">
          {/* Geotechnical Thresholds Table */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 shadow-md">
            <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
              <span>{isFa ? 'معیارهای مرزی رده‌بندی روسو (Russo 2014 Thresholds):' : 'Russo (2014) Decision Boundaries:'}</span>
              <span className="font-mono text-[11px] text-indigo-400 font-bold">{isFa ? activeSection.criteriaFa : activeSection.criteriaEn}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-[11px]">{isFa ? 'کرنش شعاعی سینه کار δ0' : 'Face Extrusion Strain δ0'}</span>
                <div className="font-mono font-bold text-slate-200 mt-0.5">{isFa ? activeSection.strainDelta0Fa : activeSection.strainDelta0En}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-[11px]">{isFa ? 'شعاع زون پلاستیک Rp/Ro' : 'Plastic Radius Ratio Rp/Ro'}</span>
                <div className="font-mono font-bold text-slate-200 mt-0.5">{isFa ? activeSection.plasticRadiusRpRoFa : activeSection.plasticRadiusRpRoEn}</div>
              </div>
              <div className="col-span-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-[11px]">{isFa ? 'روش و الگوی اجرای حفاری' : 'Excavation Methodology'}</span>
                <div className="font-medium text-slate-200 mt-0.5">
                  {isFa ? activeSection.excavationMethodFa : activeSection.excavationMethodEn}
                </div>
              </div>
            </div>
          </div>

          {/* TABLE 3 MITIGATIONS BREAKDOWN: Ma & Mb */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-2.5 shadow-md">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-800/70">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200">
                {isFa ? 'تدابیر کاهنده ریسک و سیستم نگهداری (Russo Table 3):' : 'Table 3 Mitigations Catalog (Ma & Mb):'}
              </h4>
            </div>

            {/* Ma: Pre-confinement ahead of face */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>{isFa ? 'اقدامات پیش‌تحکیم و بهبود در پیشانی کار (Ma - Pre-confinement):' : 'Ma: Pre-confinement measures ahead of the face:'}</span>
              </div>
              <div className="space-y-1 pl-3 pr-1">
                {(isFa ? activeSection.mitigationMaFa : activeSection.mitigationMaEn).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                    <ArrowRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mb: Primary radial support behind face */}
            <div className="space-y-1 pt-1 border-t border-slate-900">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>{isFa ? 'سیستم نگهداری اولیه شعاعی در پیرامون حفاری (Mb - Primary Support):' : 'Mb: Primary radial support behind the face:'}</span>
              </div>
              <div className="space-y-1 pl-3 pr-1">
                {(isFa ? activeSection.mitigationMbFa : activeSection.mitigationMbEn).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
