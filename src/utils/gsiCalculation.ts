/**
 * Geological Strength Index (GSI) & Hoek-Brown Criterion Calculation Engine
 * References:
 * - Hoek & Brown (1997), Hoek, Carranza-Torres & Corkum (2002)
 * - Hoek & Diederichs (2006)
 * - Sonmez & Ulusay (1999), Cai et al. (2004)
 */

export type RockStructureType =
  | 'intact_massive'
  | 'blocky'
  | 'very_blocky'
  | 'blocky_disturbed'
  | 'disintegrated'
  | 'laminated_sheared';

export type SurfaceQualityType =
  | 'very_good'
  | 'good'
  | 'fair'
  | 'poor'
  | 'very_poor';

export type FlyschClassType =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H';

export interface FlyschClassInfo {
  id: FlyschClassType;
  group: 'sandstone' | 'sandstone_siltstone' | 'disturbed_f' | 'shale_gh';
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
  gsiRange: [number, number];
  typicalGsi: number;
  typicalSurface: SurfaceQualityType;
}

export const FLYSCH_CLASSES: Record<FlyschClassType, FlyschClassInfo> = {
  A: {
    id: 'A',
    group: 'sandstone',
    titleFa: 'A. ماسه‌سنگ با لایه‌بندی ضخیم و بسیار بلوکی',
    titleEn: 'A. Thick bedded, very blocky sandstone',
    descFa:
      'اثر پوشش‌های رسی بر صفحات لایه‌بندی به دلیل تنش محصورکنندگی توده‌سنگ به حداقل می‌رسد. در تونل‌های کم‌عمق یا شیروانی‌ها ممکن است ناپایداری‌های کنترل‌شده ساختاری ایجاد کند.',
    descEn:
      'The effect of pelitic coatings on the bedding planes is minimized by the confinement of the rock mass. In shallow tunnels or slopes these bedding planes may cause structurally controlled instability.',
    gsiRange: [50, 70],
    typicalGsi: 60,
    typicalSurface: 'good',
  },
  B: {
    id: 'B',
    group: 'sandstone_siltstone',
    titleFa: 'B. ماسه‌سنگ با میان‌لایه‌های نازک سیلت‌استون',
    titleEn: 'B. Sandstone with thin inter-layers of siltstone',
    descFa: 'تناوب ماسه‌سنگ با میان‌لایه‌های نازک سیلت و شیل، بلوک‌بندی حفظ شده است.',
    descEn: 'Sandstone with thin inter-layers of siltstone',
    gsiRange: [45, 55],
    typicalGsi: 50,
    typicalSurface: 'fair',
  },
  C: {
    id: 'C',
    group: 'sandstone_siltstone',
    titleFa: 'C. ماسه‌سنگ و سیلت‌استون با مقادیر تقریباً برابر',
    titleEn: 'C. Sandstone and siltstone in similar amounts',
    descFa: 'لایه‌بندی متناوب ماسه‌سنگ و سیلت‌استون با ضخامت‌های برابر و درزه‌داری متقاطع.',
    descEn: 'Sandstone and siltstone in similar amounts',
    gsiRange: [40, 50],
    typicalGsi: 45,
    typicalSurface: 'fair',
  },
  D: {
    id: 'D',
    group: 'sandstone_siltstone',
    titleFa: 'D. سیلت‌استون یا شیل سیلتی با لایه‌های ماسه‌سنگ',
    titleEn: 'D. Siltstone or silty shale with sandstone layers',
    descFa: 'سیلت‌استون یا شیل دارای لایه‌های نازک ماسه‌سنگی با تسلط فاز دانه‌ریز.',
    descEn: 'Siltstone or silty shale with sandstone layers',
    gsiRange: [35, 45],
    typicalGsi: 40,
    typicalSurface: 'poor',
  },
  E: {
    id: 'E',
    group: 'sandstone_siltstone',
    titleFa: 'E. سیلت‌استون ضعیف یا شیل رسی با لایه‌های ماسه‌سنگ',
    titleEn: 'E. Weak siltstone or clayey shale with sandstone layers',
    descFa: 'سیلت‌استون هوازده یا شیل رسی ضعیف با نوارهای پراکنده ماسه‌سنگ.',
    descEn: 'Weak siltstone or clayey shale with sandstone layers',
    gsiRange: [30, 40],
    typicalGsi: 35,
    typicalSurface: 'poor',
  },
  F: {
    id: 'F',
    group: 'disturbed_f',
    titleFa: 'F. شیل رسی یا سیلت‌استون شدیداً برشی، چین‌خورده و گسل‌خورده تکتونیکی',
    titleEn: 'F. Tectonically deformed, sheared clayey shale with deformed sandstone layers',
    descFa:
      'تغییر شکل تکتونیکی شدید، چین‌خوردگی/گسل‌خوردگی فشرده، شیل رسی برشی با لایه‌های شکسته و درهم‌پیچیده ماسه‌سنگ تشکیل‌دهنده ساختار شبه‌آشفته (Chaotic).',
    descEn:
      'Tectonically deformed, intensively folded/faulted, sheared clayey shale or siltstone with broken and deformed sandstone layers forming an almost chaotic structure',
    gsiRange: [18, 30],
    typicalGsi: 24,
    typicalSurface: 'very_poor',
  },
  G: {
    id: 'G',
    group: 'shale_gh',
    titleFa: 'G. شیل رسی یا سیلتی دست‌نخورده با یا بدون لایه‌های ماسه‌سنگی بسیار نازک',
    titleEn: 'G. Undisturbed silty or clayey shale with or without very thin sandstone layers',
    descFa: 'شیل سیلتی یا رسی با لایه‌بندی ظریف و دست‌نخورده، فاقد آشفتگی شدید تکتونیکی.',
    descEn: 'Undisturbed silty or clayey shale with or without a few very thin sandstone layers',
    gsiRange: [20, 30],
    typicalGsi: 25,
    typicalSurface: 'poor',
  },
  H: {
    id: 'H',
    group: 'shale_gh',
    titleFa: 'H. شیل سیلتی یا رسی دست‌خورده تکتونیکی با پاکت‌های رس و ساختار آشفته',
    titleEn: 'H. Tectonically deformed silty/clayey shale forming chaotic structure with clay pockets',
    descFa:
      'تغییرشکل‌یافته تکتونیکی با پاکت‌های رس نرم؛ لایه‌های نازک ماسه‌سنگ به قطعات خردشده سنگی تبدیل شده‌اند.',
    descEn:
      'Tectonically deformed silty or clayey shale forming a chaotic structure with pockets of clay. Thin layers of sandstone are transformed into small rock pieces.',
    gsiRange: [10, 20],
    typicalGsi: 15,
    typicalSurface: 'very_poor',
  },
};

export interface GsiMatrixCell {
  structure: RockStructureType;
  surface: SurfaceQualityType;
  gsiMin: number;
  gsiMax: number;
  gsiDefault: number;
  descriptionFa: string;
  descriptionEn: string;
}

export interface IntactRockType {
  id: string;
  categoryFa: string;
  categoryEn: string;
  nameFa: string;
  nameEn: string;
  miDefault: number;
  miRange: [number, number];
  typicalUcsMPa: number;
  typicalEiGPa: number;
}

export interface HoekBrownParams {
  gsi: number;
  sigmaCi: number; // MPa
  mi: number;
  dFactor: number; // 0 to 1
  eiGPa?: number; // Intact rock modulus
  
  // Hoek-Brown parameters
  mb: number;
  s: number;
  a: number;
  
  // Rock mass properties
  sigmaCm: number; // Rock mass compressive strength (MPa)
  sigmaTm: number; // Rock mass tensile strength (MPa)
  ermGPa: number; // Rock mass deformation modulus (GPa)
  
  // Equivalent Mohr-Coulomb
  cohesionMPa: number; // Equivalent cohesion c
  frictionAngleDeg: number; // Equivalent friction angle phi
}

export const ROCK_STRUCTURES: Record<
  RockStructureType,
  {
    id: RockStructureType;
    nameFa: string;
    nameEn: string;
    descFa: string;
    descEn: string;
    gsiRange: [number, number];
  }
> = {
  intact_massive: {
    id: 'intact_massive',
    nameFa: 'سنگ بکر یا حجیم (Intact / Massive)',
    nameEn: 'Intact or Massive Rock',
    descFa: 'سنگ یکپارچه و متراکم با ناپیوستگی‌های بسیار اندک با فواصل بسیار زیاد',
    descEn: 'Intact rock or massive rock mass with very few widely spaced discontinuities',
    gsiRange: [70, 100],
  },
  blocky: {
    id: 'blocky',
    nameFa: 'بلوکی (Blocky)',
    nameEn: 'Blocky',
    descFa: 'توده سنگ بسیار درهم‌قفل‌شده، دست‌نخورده متشکل از بلوک‌های مکعبی با ۳ دسته درزه متعامد',
    descEn: 'Well interlocked undisturbed rock mass consisting of cubical blocks formed by 3 orthogonal sets',
    gsiRange: [50, 85],
  },
  very_blocky: {
    id: 'very_blocky',
    nameFa: 'بسیار بلوکی (Very Blocky)',
    nameEn: 'Very Blocky',
    descFa: 'درهم‌قفل‌شده، تا حدی دست‌خورده با بلوک‌های زاویه‌دار حاصل از ۴ دسته درزه یا بیشتر',
    descEn: 'Interlocked, partially disturbed rock mass with multi-faceted angular blocks formed by 4+ sets',
    gsiRange: [35, 65],
  },
  blocky_disturbed: {
    id: 'blocky_disturbed',
    nameFa: 'بلوکی دست‌خورده / درزه‌دار (Blocky / Disturbed)',
    nameEn: 'Blocky / Disturbed / Seamy',
    descFa: 'چین‌خورده یا گسل‌خورده با بلوک‌های زاویه‌دار بر اثر تقاطع دسته‌های درزه‌داری فشرده',
    descEn: 'Folded and/or faulted with angular blocks formed by many intersecting discontinuity sets',
    gsiRange: [20, 50],
  },
  disintegrated: {
    id: 'disintegrated',
    nameFa: 'خرد شده و متلاشی (Disintegrated)',
    nameEn: 'Disintegrated',
    descFa: 'ضعیف درهم‌قفل‌شده، شدیداً شکسته با مخلوطی از قطعات سنگی زاویه‌دار و گردشده',
    descEn: 'Poorly interlocked, heavily broken rock mass with mix of angular and rounded pieces',
    gsiRange: [10, 30],
  },
  laminated_sheared: {
    id: 'laminated_sheared',
    nameFa: 'لایه‌ای / برشی‌شده (Laminated / Sheared)',
    nameEn: 'Laminated / Sheared',
    descFa: 'فاقد بلوک‌بندی مشخص به دلیل فواصل بسیار اندک ورقه‌ورقه‌شدگی یا سطوح شیستوزیته و برشی',
    descEn: 'Lack of blockiness due to close spacing of weak schistosity, foliation or shear planes',
    gsiRange: [5, 25],
  },
};

export const SURFACE_QUALITIES: Record<
  SurfaceQualityType,
  {
    id: SurfaceQualityType;
    nameFa: string;
    nameEn: string;
    descFa: string;
    descEn: string;
  }
> = {
  very_good: {
    id: 'very_good',
    nameFa: 'بسیار خوب (Very Good)',
    nameEn: 'Very Good',
    descFa: 'سطوح بسیار خشن و زبر، کاملاً تازه و بدون هوازدگی',
    descEn: 'Very rough, fresh, unweathered surfaces',
  },
  good: {
    id: 'good',
    nameFa: 'خوب (Good)',
    nameEn: 'Good',
    descFa: 'سطوح زبر با هوازدگی اندک و رنگ‌گرفتگی اکسید آهن',
    descEn: 'Rough, slightly weathered, iron-stained surfaces',
  },
  fair: {
    id: 'fair',
    nameFa: 'متوسط (Fair)',
    nameEn: 'Fair',
    descFa: 'سطوح صاف یا نسبتاً زبر با هوازدگی و دگرسانی متوسط',
    descEn: 'Smooth, moderately weathered or altered surfaces',
  },
  poor: {
    id: 'poor',
    nameFa: 'ضعیف (Poor)',
    nameEn: 'Poor',
    descFa: 'سطوح لغزنده (آینه‌سنگ / Slickensided)، به شدت هوازده با پوشش‌های نازک رس نرم',
    descEn: 'Slickensided, highly weathered surfaces with compact coatings or thin soft clay fillings',
  },
  very_poor: {
    id: 'very_poor',
    nameFa: 'بسیار ضعیف (Very Poor)',
    nameEn: 'Very Poor',
    descFa: 'سطوح لغزنده براق، هوازدگی شدید با پوشش‌های ضخیم یا پرشدگی‌های رس متورم‌شونده',
    descEn: 'Slickensided, heavily weathered with thick soft clay coatings or continuous gouge',
  },
};

// Standard GSI matrix table (Hoek, 1994; Hoek & Marinos, 2000)
export const GSI_MATRIX: Record<RockStructureType, Record<SurfaceQualityType, number>> = {
  intact_massive: {
    very_good: 95,
    good: 85,
    fair: 75,
    poor: 65,
    very_poor: 55,
  },
  blocky: {
    very_good: 85,
    good: 75,
    fair: 65,
    poor: 55,
    very_poor: 45,
  },
  very_blocky: {
    very_good: 70,
    good: 60,
    fair: 50,
    poor: 40,
    very_poor: 30,
  },
  blocky_disturbed: {
    very_good: 55,
    good: 45,
    fair: 35,
    poor: 25,
    very_poor: 18,
  },
  disintegrated: {
    very_good: 40,
    good: 30,
    fair: 22,
    poor: 15,
    very_poor: 10,
  },
  laminated_sheared: {
    very_good: 30,
    good: 24,
    fair: 18,
    poor: 12,
    very_poor: 5,
  },
};

// Common intact rock types with typical Hoek-Brown mi values (Hoek, 2007)
export const INTACT_ROCK_TYPES: IntactRockType[] = [
  // Igneous
  {
    id: 'granite',
    categoryFa: 'آذرین (Igneous)',
    categoryEn: 'Igneous',
    nameFa: 'گرانیت (Granite)',
    nameEn: 'Granite',
    miDefault: 32,
    miRange: [29, 35],
    typicalUcsMPa: 160,
    typicalEiGPa: 60,
  },
  {
    id: 'basalt',
    categoryFa: 'آذرین (Igneous)',
    categoryEn: 'Igneous',
    nameFa: 'بازالت (Basalt)',
    nameEn: 'Basalt',
    miDefault: 25,
    miRange: [22, 28],
    typicalUcsMPa: 180,
    typicalEiGPa: 65,
  },
  {
    id: 'andesite',
    categoryFa: 'آذرین (Igneous)',
    categoryEn: 'Igneous',
    nameFa: 'آندزیت (Andesite)',
    nameEn: 'Andesite',
    miDefault: 25,
    miRange: [20, 30],
    typicalUcsMPa: 140,
    typicalEiGPa: 50,
  },
  {
    id: 'diorite',
    categoryFa: 'آذرین (Igneous)',
    categoryEn: 'Igneous',
    nameFa: 'دیوریت (Diorite)',
    nameEn: 'Diorite',
    miDefault: 25,
    miRange: [22, 28],
    typicalUcsMPa: 150,
    typicalEiGPa: 55,
  },
  {
    id: 'gabbro',
    categoryFa: 'آذرین (Igneous)',
    categoryEn: 'Igneous',
    nameFa: 'گابرو (Gabbro)',
    nameEn: 'Gabbro',
    miDefault: 27,
    miRange: [24, 30],
    typicalUcsMPa: 170,
    typicalEiGPa: 70,
  },
  // Sedimentary
  {
    id: 'limestone',
    categoryFa: 'رسوبی (Sedimentary)',
    categoryEn: 'Sedimentary',
    nameFa: 'سنگ آهک متراکم (Micritic Limestone)',
    nameEn: 'Sparitic/Micritic Limestone',
    miDefault: 12,
    miRange: [8, 16],
    typicalUcsMPa: 90,
    typicalEiGPa: 45,
  },
  {
    id: 'sandstone',
    categoryFa: 'رسوبی (Sedimentary)',
    categoryEn: 'Sedimentary',
    nameFa: 'ماسه‌سنگ (Sandstone)',
    nameEn: 'Sandstone',
    miDefault: 17,
    miRange: [13, 21],
    typicalUcsMPa: 80,
    typicalEiGPa: 30,
  },
  {
    id: 'dolomite',
    categoryFa: 'رسوبی (Sedimentary)',
    categoryEn: 'Sedimentary',
    nameFa: 'دولومیت (Dolomite)',
    nameEn: 'Dolomite',
    miDefault: 9,
    miRange: [7, 11],
    typicalUcsMPa: 110,
    typicalEiGPa: 50,
  },
  {
    id: 'shale',
    categoryFa: 'رسوبی (Sedimentary)',
    categoryEn: 'Sedimentary',
    nameFa: 'شیل (Shale)',
    nameEn: 'Shale',
    miDefault: 6,
    miRange: [4, 8],
    typicalUcsMPa: 35,
    typicalEiGPa: 15,
  },
  {
    id: 'siltstone',
    categoryFa: 'رسوبی (Sedimentary)',
    categoryEn: 'Sedimentary',
    nameFa: 'سیلت‌استون (Siltstone)',
    nameEn: 'Siltstone',
    miDefault: 7,
    miRange: [5, 9],
    typicalUcsMPa: 50,
    typicalEiGPa: 20,
  },
  {
    id: 'conglomerate',
    categoryFa: 'رسوبی (Sedimentary)',
    categoryEn: 'Sedimentary',
    nameFa: 'کنگلومرا (Conglomerate)',
    nameEn: 'Conglomerate',
    miDefault: 21,
    miRange: [18, 24],
    typicalUcsMPa: 70,
    typicalEiGPa: 25,
  },
  // Metamorphic
  {
    id: 'quartzite',
    categoryFa: 'دگرگونی (Metamorphic)',
    categoryEn: 'Metamorphic',
    nameFa: 'کوارتزیت (Quartzite)',
    nameEn: 'Quartzite',
    miDefault: 20,
    miRange: [17, 23],
    typicalUcsMPa: 220,
    typicalEiGPa: 75,
  },
  {
    id: 'gneiss',
    categoryFa: 'دگرگونی (Metamorphic)',
    categoryEn: 'Metamorphic',
    nameFa: 'گنیس (Gneiss)',
    nameEn: 'Gneiss',
    miDefault: 28,
    miRange: [24, 32],
    typicalUcsMPa: 130,
    typicalEiGPa: 50,
  },
  {
    id: 'schist',
    categoryFa: 'دگرگونی (Metamorphic)',
    categoryEn: 'Metamorphic',
    nameFa: 'شیست (Schist)',
    nameEn: 'Schist',
    miDefault: 12,
    miRange: [8, 16],
    typicalUcsMPa: 60,
    typicalEiGPa: 25,
  },
  {
    id: 'marble',
    categoryFa: 'دگرگونی (Metamorphic)',
    categoryEn: 'Metamorphic',
    nameFa: 'مرمر (Marble)',
    nameEn: 'Marble',
    miDefault: 9,
    miRange: [7, 11],
    typicalUcsMPa: 85,
    typicalEiGPa: 40,
  },
];

/**
 * Calculates Generalized Hoek-Brown Rock Mass Parameters (Hoek, Carranza-Torres & Corkum, 2002)
 * & Hoek & Diederichs (2006) Deformation Modulus
 */
export function calculateHoekBrownParams(
  gsi: number,
  sigmaCi: number,
  mi: number,
  dFactor: number = 0,
  eiGPaInput?: number
): HoekBrownParams {
  const safeGsi = Math.max(5, Math.min(100, gsi));
  const safeD = Math.max(0, Math.min(1, dFactor));
  const safeUcs = Math.max(1, sigmaCi);
  const safeMi = Math.max(2, mi);

  // Hoek-Brown parameters (2002 edition)
  // mb = mi * exp((GSI - 100) / (28 - 14D))
  const mb = safeMi * Math.exp((safeGsi - 100) / (28 - 14 * safeD));

  // s = exp((GSI - 100) / (9 - 3D))
  const s = Math.exp((safeGsi - 100) / (9 - 3 * safeD));

  // a = 0.5 + (1/6) * (exp(-GSI/15) - exp(-20/3))
  const a = 0.5 + (1 / 6) * (Math.exp(-safeGsi / 15) - Math.exp(-20 / 3));

  // Tensile strength: sigma_tm = -s * sigma_ci / mb
  const sigmaTm = -s * safeUcs / mb;

  // Uniaxial compressive strength of rock mass sigma_cm:
  // sigma_cm = sigma_ci * (mb + 4s - a*(mb - 8s)) * (mb/4 + s)^(a-1) / (2 * (1+a) * (2+a))
  const numerator = (mb + 4 * s - a * (mb - 8 * s)) * Math.pow(mb / 4 + s, a - 1);
  const denominator = 2 * (1 + a) * (2 + a);
  const sigmaCm = Math.max(0.01, safeUcs * (numerator / denominator));

  // Intact modulus Ei estimation if not provided: MR typically ~ 350-500
  const eiGPa = eiGPaInput && eiGPaInput > 0 ? eiGPaInput : (safeUcs * 400) / 1000;

  // Rock Mass Modulus Erm (Hoek & Diederichs, 2006):
  // Erm = Ei * (0.02 + (1 - D/2) / (1 + exp((60 + 15D - GSI) / 11)))
  const sigFactor = 1 + Math.exp((60 + 15 * safeD - safeGsi) / 11);
  const ermGPa = eiGPa * (0.02 + (1 - safeD / 2) / sigFactor);

  // Equivalent Mohr-Coulomb parameters (c and phi) for tunnel application
  // Based on Hoek et al. (2002) for upper confining stress sigma3_max
  // For tunneling: sigma3_max / sigma_cm = 0.47 * (sigma_cm / (gamma * H))^-0.94
  // Approximation for typical tunnel depth:
  const phiRad = Math.asin(
    (6 * a * mb * Math.pow(s + mb * 0.1, a - 1)) /
      (2 * (1 + a) * (2 + a) + 6 * a * mb * Math.pow(s + mb * 0.1, a - 1))
  );
  const frictionAngleDeg = Math.max(10, Math.min(65, (phiRad * 180) / Math.PI));

  // Equivalent cohesion:
  const cohesionMPa = Math.max(
    0.005,
    (safeUcs * ((1 + 2 * a) * s + (1 - a) * mb * 0.1) * Math.pow(s + mb * 0.1, a - 1)) /
      ((1 + a) * (2 + a) * Math.sqrt(1 + (6 * a * mb * Math.pow(s + mb * 0.1, a - 1)) / ((1 + a) * (2 + a))))
  );

  return {
    gsi: safeGsi,
    sigmaCi: safeUcs,
    mi: safeMi,
    dFactor: safeD,
    eiGPa,
    mb: Number(mb.toFixed(3)),
    s: Number(s.toFixed(5)),
    a: Number(a.toFixed(4)),
    sigmaCm: Number(sigmaCm.toFixed(2)),
    sigmaTm: Number(sigmaTm.toFixed(3)),
    ermGPa: Number(ermGPa.toFixed(2)),
    cohesionMPa: Number(cohesionMPa.toFixed(2)),
    frictionAngleDeg: Number(frictionAngleDeg.toFixed(1)),
  };
}

/**
 * Estimate GSI from Bieniawski RMR (1989)
 * Hoek et al.: GSI = RMR89' - 5 (assuming dry groundwater and favorable joint orientation)
 */
export function rmrToGsi(rmr89: number): number {
  return Math.max(5, Math.min(100, Math.round(rmr89 - 5)));
}

/**
 * Estimate GSI from Barton Q-System (Hoek et al., Barton 2002)
 * GSI = 9 * ln(Q') + 44
 * where Q' = (RQD / Jn) * (Jr / Ja)
 */
export function qPrimeToGsi(qPrime: number): number {
  const safeQPrime = Math.max(0.001, qPrime);
  const val = 9 * Math.log(safeQPrime) + 44;
  return Math.max(5, Math.min(100, Math.round(val)));
}

/**
 * Estimate RMR89 from GSI
 */
export function gsiToRmr(gsi: number): number {
  return Math.max(10, Math.min(100, Math.round(gsi + 5)));
}

/**
 * Estimate Q' from GSI
 */
export function gsiToQPrime(gsi: number): number {
  return Math.exp((gsi - 44) / 9);
}
