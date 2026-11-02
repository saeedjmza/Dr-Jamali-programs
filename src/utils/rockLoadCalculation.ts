/**
 * Rock Load & Tunnel Support Pressure Estimation Engine
 * 
 * Implemented Formulations:
 * 1. Terzaghi (1946) Rock Mass Classification & Rock Loadings (Table 6-8)
 * 2. Cording et al. (1971) Empirical Support Pressures & Bolt Lengths
 * 3. Barton et al. (1980) & Grimstad-Barton (1993) Support Pressures & Bolt Lengths
 * 4. Hoek (1999) Critical Support Pressure for Rock Mass Stability
 * 5. Kirsch (1898) Analytical Elastic Stress Distribution Around Circular Excavations
 * 6. Deere et al. (1970) RQD-based Rock Load Method
 */

import {
  TerzaghiConditionInfo,
  TerzaghiRockConditionKey,
  TerzaghiRockLoadResult,
  CordingRockLoadResult,
  BartonRockLoadResult,
  HoekRockLoadResult,
  KirschStressResult,
  RockLoadComparisonSummary,
} from '../types';
import { calculateHoekBrownParams } from './gsiCalculation';

// ============================================================================
// 1. TERZAGHI (1946) TABLE 6-8 ROCK CONDITIONS & LOADINGS
// ============================================================================

export const TERZAGHI_CONDITIONS: Record<TerzaghiRockConditionKey, TerzaghiConditionInfo> = {
  hard_intact: {
    key: 'hard_intact',
    code: '1',
    nameFa: 'سنگ سخت و یکپارچه (Hard and intact)',
    nameEn: 'Hard and intact',
    hpFormulaFa: 'Hp = 0',
    hpFormulaEn: 'Hp = 0',
    remarksFa: 'پوشش سبک تنها در صورت رخ دادن پوسته‌شدگی (Spalling) یا ترکیدگی سنگ (Popping) لازم است.',
    remarksEn: 'Light lining, required only if spalling or popping occurs.',
    sidePressureNoteFa: 'فاقد فشار جانبی بر دیواره‌ها (Side Pressure = 0)',
    sidePressureNoteEn: 'No side pressure.',
    typicalSidePressureRatio: 0,
  },
  hard_stratified: {
    key: 'hard_stratified',
    code: '2',
    nameFa: 'سنگ سخت لایه‌ای یا شیستی (Hard stratified or schistose)',
    nameEn: 'Hard stratified or schistose',
    hpFormulaFa: 'Hp = 0 تا 0.5 B',
    hpFormulaEn: 'Hp = 0 to 0.5 B',
    remarksFa: 'سیستم نگهداری سبک. بار سنگ ممکن است به طور تصادفی و نامنظم از نقطه‌ای به نقطه دیگر تغییر کند.',
    remarksEn: 'Light support. Load may change erratically from point to point.',
    sidePressureNoteFa: 'فشار جانبی ناچیز تا صفر در لایه‌بندی افقی',
    sidePressureNoteEn: 'Little or no side pressure.',
    typicalSidePressureRatio: 0.05,
  },
  massive_moderately_jointed: {
    key: 'massive_moderately_jointed',
    code: '3',
    nameFa: 'توده‌سنگ حجیم با درزه‌داری متوسط (Massive, moderately jointed)',
    nameEn: 'Massive, moderately jointed',
    hpFormulaFa: 'Hp = 0 تا 0.25 B',
    hpFormulaEn: 'Hp = 0 to 0.25 B',
    remarksFa: 'سیستم نگهداری سبک. بار سنگ ممکن است به طور نامنظم تغییر کند؛ بلوک‌ها نیاز به مهار دارند.',
    remarksEn: 'Light support. Load may change erratically from point to point.',
    sidePressureNoteFa: 'فشار جانبی اندک و محدود به گوه‌های ناپایدار',
    sidePressureNoteEn: 'Negligible side pressure except on loose wedges.',
    typicalSidePressureRatio: 0.05,
  },
  moderately_blocky_seamy: {
    key: 'moderately_blocky_seamy',
    code: '4',
    nameFa: 'بلوکی و درزه‌دار با درزه‌های پرشده (Moderately blocky and seamy)',
    nameEn: 'Moderately blocky and seamy',
    hpFormulaFa: 'Hp = 0.25 B تا 0.35 (B + Ht)',
    hpFormulaEn: 'Hp = 0.25 B to 0.35 (B + Ht)',
    remarksFa: 'بدون فشار جانبی روی دیواره‌ها. نگهداری سقف برای جلوگیری از ریزش بلوک‌های قفل‌شده الزامی است.',
    remarksEn: 'No side pressure.',
    sidePressureNoteFa: 'فاقد فشار جانبی دیواره (No side pressure)',
    sidePressureNoteEn: 'No side pressure.',
    typicalSidePressureRatio: 0,
  },
  very_blocky_seamy: {
    key: 'very_blocky_seamy',
    code: '5',
    nameFa: 'بسیار بلوکی و خردشده با درزه‌های متعدد (Very blocky and seamy)',
    nameEn: 'Very blocky and seamy',
    hpFormulaFa: 'Hp = (0.35 تا 1.10) × (B + Ht)',
    hpFormulaEn: 'Hp = (0.35 to 1.10) (B + Ht)',
    remarksFa: 'فشار جانبی بسیار کم یا صفر. بار سنگ ناشی از گسیختگی سیستماتیک درزه‌های چندجهته است.',
    remarksEn: 'Little or no side pressure.',
    sidePressureNoteFa: 'فشار جانبی ناچیز تا کم (Little or no side pressure)',
    sidePressureNoteEn: 'Little or no side pressure.',
    typicalSidePressureRatio: 0.15,
  },
  completely_crushed: {
    key: 'completely_crushed',
    code: '6',
    nameFa: 'کاملاً خردشده اما از نظر شیمیایی سالم (Completely crushed but chemically intact)',
    nameEn: 'Completely crushed but chemically intact',
    hpFormulaFa: 'Hp = 1.10 × (B + Ht)',
    hpFormulaEn: 'Hp = 1.10 (B + Ht)',
    remarksFa: 'فشار جانبی قابل توجه. اثر نرم‌شدگی ناشی از تراوش به سمت کف تونل مستلزم نگهداری پیوسته پایه قاب‌ها یا قاب‌های دایره‌ای است.',
    remarksEn: 'Considerable side pressure. Softening effect of seepage towards bottom of tunnel requires either continuous support for lower ends of ribs or circular ribs.',
    sidePressureNoteFa: 'فشار جانبی قابل توجه (Considerable side pressure)',
    sidePressureNoteEn: 'Considerable side pressure; continuous base support required.',
    typicalSidePressureRatio: 0.35,
  },
  squeezing_moderate: {
    key: 'squeezing_moderate',
    code: '7',
    nameFa: 'سنگ مچاله‌شونده، در عمق متوسط (Squeezing rock, moderate depth)',
    nameEn: 'Squeezing rock, moderate depth',
    hpFormulaFa: 'Hp = (1.10 تا 2.10) × (B + Ht)',
    hpFormulaEn: 'Hp = (1.10 to 2.10) (B + Ht)',
    remarksFa: 'فشار جانبی سنگین؛ اجرای پایه‌های مهارکننده کف (Invert Struts) و بستن سریع مقطع الزامی است.',
    remarksEn: 'Heavy side pressure, invert struts required.',
    sidePressureNoteFa: 'فشار جانبی سنگین (Heavy side pressure)',
    sidePressureNoteEn: 'Heavy side pressure; invert struts required.',
    typicalSidePressureRatio: 0.65,
  },
  squeezing_great: {
    key: 'squeezing_great',
    code: '8',
    nameFa: 'سنگ مچاله‌شونده، در عمق زیاد (Squeezing rock, great depth)',
    nameEn: 'Squeezing rock, great depth',
    hpFormulaFa: 'Hp = (2.10 تا 4.50) × (B + Ht)',
    hpFormulaEn: 'Hp = (2.10 to 4.50) (B + Ht)',
    remarksFa: 'تغییرشکل‌های پلاستیک بسیار بزرگ. مقطع دایره‌ای کامل با قاب‌های صلب یا تسلیم‌پذیر توصیه می‌شود.',
    remarksEn: 'Circular ribs are recommended.',
    sidePressureNoteFa: 'فشار همه‌جانبه بسیار شدید هیدرواستاتیک پلاستیک',
    sidePressureNoteEn: 'Extreme all-around pressure; circular ribs mandatory.',
    typicalSidePressureRatio: 0.85,
  },
  swelling: {
    key: 'swelling',
    code: '9',
    nameFa: 'سنگ متورم‌شونده (Swelling rock)',
    nameEn: 'Swelling rock',
    hpFormulaFa: 'Hp = تا 75 متر (250 ft) مستقل از ابعاد مقطع',
    hpFormulaEn: 'Hp = Up to 250 ft irrespective of (B + Ht)',
    remarksFa: 'قاب‌های دایره‌ای الزامی است. در شرایط بحرانی از سیستم‌های نگهداری تسلیم‌پذیر (Yielding Support) استفاده شود.',
    remarksEn: 'Circular ribs required. In extreme cases use yielding support.',
    sidePressureNoteFa: 'فشار انبساطی شیمیایی بسیار بالا در تماس با رطوبت',
    sidePressureNoteEn: 'High swelling pressure; yielding circular support required.',
    typicalSidePressureRatio: 1.0,
  },
};

/**
 * Auto-suggest the most plausible Terzaghi rock condition based on RMR, RQD, and GSI
 */
export function autoSuggestTerzaghiCondition(
  rmr: number,
  rqd: number,
  depth: number,
  ucs: number
): TerzaghiRockConditionKey {
  // Squeezing check: Competency factor = UCS / sigma_v
  const sigmaV = (25 * depth) / 1000; // MPa approx
  const stressRatio = sigmaV > 0 ? ucs / sigmaV : 10;

  if (stressRatio < 1.0 && depth > 500) {
    return 'squeezing_great';
  }
  if (stressRatio < 1.8 && depth > 200) {
    return 'squeezing_moderate';
  }

  if (rmr >= 85 && rqd >= 90) return 'hard_intact';
  if (rmr >= 70 && rqd >= 75) return 'massive_moderately_jointed';
  if (rmr >= 55 && rqd >= 50) return 'moderately_blocky_seamy';
  if (rmr >= 35 && rqd >= 25) return 'very_blocky_seamy';
  if (rmr < 35 && rqd < 25) return 'completely_crushed';

  return 'moderately_blocky_seamy';
}

/**
 * Calculates Terzaghi (1946) Table 6-8 Rock Load & Pressure
 */
export function calculateTerzaghiRockLoad(
  conditionKey: TerzaghiRockConditionKey,
  spanB: number,
  heightHt: number,
  unitWeightGamma: number
): TerzaghiRockLoadResult {
  const cond = TERZAGHI_CONDITIONS[conditionKey] || TERZAGHI_CONDITIONS.moderately_blocky_seamy;
  const B = Math.max(1, spanB);
  const Ht = Math.max(1, heightHt);
  const gamma = Math.max(10, unitWeightGamma);

  let hpMin = 0;
  let hpMax = 0;

  switch (conditionKey) {
    case 'hard_intact':
      hpMin = 0;
      hpMax = 0;
      break;
    case 'hard_stratified':
      hpMin = 0;
      hpMax = 0.5 * B;
      break;
    case 'massive_moderately_jointed':
      hpMin = 0;
      hpMax = 0.25 * B;
      break;
    case 'moderately_blocky_seamy':
      hpMin = 0.25 * B;
      hpMax = 0.35 * (B + Ht);
      break;
    case 'very_blocky_seamy':
      hpMin = 0.35 * (B + Ht);
      hpMax = 1.10 * (B + Ht);
      break;
    case 'completely_crushed':
      hpMin = 1.10 * (B + Ht);
      hpMax = 1.10 * (B + Ht);
      break;
    case 'squeezing_moderate':
      hpMin = 1.10 * (B + Ht);
      hpMax = 2.10 * (B + Ht);
      break;
    case 'squeezing_great':
      hpMin = 2.10 * (B + Ht);
      hpMax = 4.50 * (B + Ht);
      break;
    case 'swelling':
      // Up to 250 ft = 76.2 m
      hpMin = Math.min(25, 1.5 * (B + Ht));
      hpMax = 75; // 250 ft
      break;
    default:
      hpMin = 0.25 * B;
      hpMax = 0.35 * (B + Ht);
  }

  const hpAvg = Number(((hpMin + hpMax) / 2).toFixed(2));
  const pvMinKPa = Number((hpMin * gamma).toFixed(1));
  const pvMaxKPa = Number((hpMax * gamma).toFixed(1));
  const pvAvgKPa = Number((hpAvg * gamma).toFixed(1));
  const pvAvgMPa = Number((pvAvgKPa / 1000).toFixed(3));

  const sideRatio = cond.typicalSidePressureRatio;
  const phAvgKPa = Number((pvAvgKPa * sideRatio).toFixed(1));
  const phAvgMPa = Number((phAvgKPa / 1000).toFixed(3));

  return {
    condition: cond,
    spanB: B,
    heightHt: Ht,
    unitWeightGamma: gamma,
    hpMin: Number(hpMin.toFixed(2)),
    hpMax: Number(hpMax.toFixed(2)),
    hpAvg,
    pvMinKPa,
    pvMaxKPa,
    pvAvgKPa,
    pvAvgMPa,
    phAvgKPa,
    phAvgMPa,
    sidePressureRatioKh: sideRatio,
    liningRecommendationFa: cond.remarksFa,
    liningRecommendationEn: cond.remarksEn,
  };
}

// ============================================================================
// 2. CORDING ET AL. (1971) ROCK LOAD & SUPPORT PRESSURE
// ============================================================================

export function calculateCordingRockLoad(
  spanB: number,
  heightHt: number,
  unitWeightGamma: number,
  rqd: number
): CordingRockLoadResult {
  const B = Math.max(1, spanB);
  const Ht = Math.max(1, heightHt);
  const gamma = Math.max(10, unitWeightGamma);
  const safeRqd = Math.max(0, Math.min(100, rqd));

  // Crown load: Hp = 0.3 B
  const hpCrown = Number((0.3 * B).toFixed(2));
  const pCrownKPa = Number((hpCrown * gamma).toFixed(1));
  const pCrownMPa = Number((pCrownKPa / 1000).toFixed(3));

  // Sidewall load: Hp = 0.15 Ht
  // Special rule: In rock with RQD > 75%, sidewall pressure is typically smaller (often zero)
  // and only spot bolts to hold obvious wedges will be required.
  const isHighRqdReduction = safeRqd > 75;
  const hpSidewall = isHighRqdReduction ? 0 : Number((0.15 * Ht).toFixed(2));
  const pSidewallKPa = isHighRqdReduction ? 0 : Number((hpSidewall * gamma).toFixed(1));
  const pSidewallMPa = Number((pSidewallKPa / 1000).toFixed(3));

  // Bolt lengths: L_crown = 0.33 B, L_sidewall = 0.33 Ht
  const crownBoltLength = Number((0.33 * B).toFixed(2));
  const sidewallBoltLength = Number((0.33 * Ht).toFixed(2));

  const remarksFa = isHighRqdReduction
    ? `با توجه به اینکه شاخص RQD=${safeRqd}% بزرگتر از ۷۵٪ است، فشار جانبی دیواره طبق کارهای میدانی کوردینگ صفر یا ناچیز لحاظ شده و تنها بولت‌های موردی (Spot Bolts) جهت مهار گوه‌های موضعی مورد نیاز است.`
    : `فشار سقف بر مبنای بار سنگ به ارتفاع 0.3B (${hpCrown} متر) و فشار دیواره بر مبنای ارتفاع 0.15H (${hpSidewall} متر) محاسبه گردید.`;

  const remarksEn = isHighRqdReduction
    ? `Because RQD=${safeRqd}% > 75%, sidewall support pressure is typically zero or negligible according to Cording et al. (1971); only spot bolts for wedges are required.`
    : `Crown support pressure equals rock load of 0.3B (${hpCrown} m) and sidewall pressure equals 0.15H (${hpSidewall} m).`;

  return {
    spanB: B,
    heightHt: Ht,
    unitWeightGamma: gamma,
    rqd: safeRqd,
    hpCrown,
    hpSidewall,
    pCrownKPa,
    pCrownMPa,
    pSidewallKPa,
    pSidewallMPa,
    crownBoltLength,
    sidewallBoltLength,
    isHighRqdReduction,
    remarksFa,
    remarksEn,
  };
}

// ============================================================================
// 3. BARTON ET AL. (1980) & GRIMSTAD-BARTON (1993) ROCK LOAD & PRESSURE
// ============================================================================

export function calculateBartonRockLoad(
  qValue: number,
  jn: number,
  jr: number,
  esr: number,
  spanB: number,
  unitWeightGamma: number
): BartonRockLoadResult {
  const safeQ = Math.max(0.001, qValue);
  const safeJn = Math.max(0.5, jn);
  const safeJr = Math.max(0.5, jr);
  const safeEsr = Math.max(0.5, esr);
  const B = Math.max(1, spanB);
  const gamma = Math.max(10, unitWeightGamma);

  // Barton et al. (1980):
  // Rock bolt length: L = (2 + 0.15 * B) / ESR
  const boltLengthL = Number(((2 + 0.15 * B) / safeEsr).toFixed(2));

  // Max unsupported span: 2 * ESR * Q^0.4
  const maxUnsupportedSpan = Number((2 * safeEsr * Math.pow(safeQ, 0.4)).toFixed(2));

  // Grimstad and Barton (1993) formula 6-5:
  // P_roof (MPa) = (2 * sqrt(Jn) * Q^(-1/3)) / (3 * Jr)
  const pRoofMPa = Number(
    ((2 * Math.sqrt(safeJn) * Math.pow(safeQ, -1 / 3)) / (3 * safeJr)).toFixed(3)
  );
  const pRoofKPa = Number((pRoofMPa * 1000).toFixed(1));

  // Equivalent rock load height Hp = P_roof / gamma
  const hpEquivalentM = Number(((pRoofKPa) / gamma).toFixed(2));

  // Wall support pressure:
  // Barton adjusts Q for wall: Q_wall = 5Q for Q > 10, 2.5Q for 0.1 <= Q <= 10, Q for Q < 0.1
  let qWall = safeQ;
  if (safeQ > 10) qWall = 5 * safeQ;
  else if (safeQ >= 0.1) qWall = 2.5 * safeQ;

  const pWallMPa = Number(
    ((2 * Math.sqrt(safeJn) * Math.pow(qWall, -1 / 3)) / (3 * safeJr)).toFixed(3)
  );
  const pWallKPa = Number((pWallMPa * 1000).toFixed(1));

  const formulaRoofFa = 'Proof = (2 · √Jn · Q^(-1/3)) / (3 · Jr)';
  const formulaRoofEn = 'Proof = (2 · √Jn · Q^(-1/3)) / (3 · Jr)';

  let statusFa = '';
  let statusEn = '';
  if (safeQ < 0.1) {
    statusFa = 'سنگ با کیفیت بسیار ضعیف تا استثنائاً ضعیف؛ فشار بار سنگ بالا نیازمند شاتکریت مسلح الیافی ضخیم و رولبولت‌های پرتراکم.';
    statusEn = 'Very poor to exceptionally poor rock; high support pressure requires thick fiber reinforced shotcrete and dense bolting.';
  } else if (safeQ < 4) {
    statusFa = 'سنگ با کیفیت ضعیف تا متوسط؛ فشار بار سنگ در حد متوسط با نگهداری سیستماتیک مهار می‌شود.';
    statusEn = 'Poor to fair rock quality; moderate support pressure handled by systematic bolting and shotcrete.';
  } else {
    statusFa = 'سنگ با کیفیت خوب تا فوق‌العاده خوب؛ فشار بار سنگ پایین و پایداری ذاتی بالا.';
    statusEn = 'Good to exceptionally good rock; low roof support pressure and high self-bearing capacity.';
  }

  return {
    qValue: safeQ,
    jn: safeJn,
    jr: safeJr,
    esr: safeEsr,
    spanB: B,
    unitWeightGamma: gamma,
    pRoofMPa,
    pRoofKPa,
    hpEquivalentM,
    qWall: Number(qWall.toFixed(2)),
    pWallMPa,
    pWallKPa,
    boltLengthL,
    maxUnsupportedSpan,
    formulaRoofFa,
    formulaRoofEn,
    statusFa,
    statusEn,
  };
}

// ============================================================================
// 4. HOEK (1999) CRITICAL SUPPORT PRESSURE
// ============================================================================

export function calculateHoekCriticalSupportPressure(
  depth: number,
  unitWeightGamma: number,
  ucs: number,
  gsi: number,
  kRatio: number = 1.0,
  userFrictionAngle?: number
): HoekRockLoadResult {
  const safeDepth = Math.max(10, depth);
  const gamma = Math.max(10, unitWeightGamma);
  const safeUcs = Math.max(1, ucs);
  const safeGsi = Math.max(5, Math.min(100, gsi));

  // Hydrostatic far-field stress Po:
  // Vertical stress sigma_v = gamma * H / 1000 (MPa)
  // For hydrostatic Hoek formula: Po = (1 + kRatio)/2 * sigma_v or sigma_v
  const sigmaV = (gamma * safeDepth) / 1000;
  const p0HydrostaticMPa = Number((((1 + kRatio) / 2) * sigmaV).toFixed(3));

  // Generalized Hoek-Brown parameters (2002)
  const hbParams = calculateHoekBrownParams(safeGsi, safeUcs, 12, 0);
  const sigmaCmMPa = hbParams.sigmaCm;

  // Friction angle of rock mass
  const frictionAngleDeg = userFrictionAngle && userFrictionAngle > 0
    ? userFrictionAngle
    : hbParams.frictionAngleDeg;

  const phiRad = (frictionAngleDeg * Math.PI) / 180;

  // Rankine passive coefficient: k = (1 + sin phi) / (1 - sin phi)
  const rankineK = Number(((1 + Math.sin(phiRad)) / (1 - Math.sin(phiRad))).toFixed(3));

  // Hoek (1999) formula 6-6:
  // P_cr = (2 * P_o - sigma_cm) / (1 + k)
  const rawPcr = (2 * p0HydrostaticMPa - sigmaCmMPa) / (1 + rankineK);
  const criticalPressurePcrMPa = Number(rawPcr.toFixed(3));
  const criticalPressurePcrKPa = Number((criticalPressurePcrMPa * 1000).toFixed(1));

  const requiresSupport = criticalPressurePcrMPa > 0;

  // Plastic zone radius estimation at zero internal pressure (Pi = 0)
  // rp = ro * [ 2 * (Po * (k - 1) + sigma_cm) / ((1 + k)*(k - 1)*Pi + sigma_cm) ]^(1 / (k - 1))
  let plasticZoneRadiusM = 0;
  if (requiresSupport && rankineK > 1) {
    const termNumerator = 2 * (p0HydrostaticMPa * (rankineK - 1) + sigmaCmMPa);
    const termDenominator = (1 + rankineK) * sigmaCmMPa;
    const exponent = 1 / (rankineK - 1);
    if (termNumerator > termDenominator) {
      plasticZoneRadiusM = Number(Math.pow(termNumerator / termDenominator, exponent).toFixed(2));
    }
  }

  let statusMessageFa = '';
  let statusMessageEn = '';

  if (!requiresSupport) {
    statusMessageFa = `فشار بحرانی منفی یا صفر است (Pcr = ${criticalPressurePcrMPa} MPa). مقاومت توده‌سنگ (σcm = ${sigmaCmMPa} MPa) بزرگتر از دو برابر تنش برجا (2Po = ${(2 * p0HydrostaticMPa).toFixed(2)} MPa) بوده و توده‌سنگ پیرامون مقطع در حالت الاستیک پایدار می‌ماند و تسلیم پلاستیک رخ نمی‌دهد.`;
    statusMessageEn = `Critical support pressure is non-positive (Pcr = ${criticalPressurePcrMPa} MPa). Rock mass strength (σcm = ${sigmaCmMPa} MPa) exceeds in-situ stress (2Po = ${(2 * p0HydrostaticMPa).toFixed(2)} MPa); rock mass remains elastic without requiring internal support pressure.`;
  } else {
    statusMessageFa = `فشار بحرانی مثبت است (Pcr = ${criticalPressurePcrMPa} MPa / ${criticalPressurePcrKPa} kPa). تنش هیدرواستاتیک برجا فراتر از ظرفیت الاستیک توده‌سنگ است و بدون اجرای حداقل فشار نگهداری Pcr، زون پلاستیک تسلیم‌یافته پیرامون تونل گسترش خواهد یافت.`;
    statusMessageEn = `Critical support pressure is positive (Pcr = ${criticalPressurePcrMPa} MPa / ${criticalPressurePcrKPa} kPa). In-situ stress exceeds rock mass elastic capacity; internal support pressure Pi ≥ Pcr is required to prevent plastic zone propagation.`;
  }

  return {
    depth: safeDepth,
    unitWeightGamma: gamma,
    p0HydrostaticMPa,
    sigmaCmMPa,
    frictionAngleDeg: Number(frictionAngleDeg.toFixed(1)),
    rankineK,
    criticalPressurePcrMPa,
    criticalPressurePcrKPa,
    requiresSupport,
    plasticZoneRadiusM,
    statusMessageFa,
    statusMessageEn,
    hoekBrownParams: {
      gsi: safeGsi,
      sigmaCi: safeUcs,
      mb: hbParams.mb,
      s: hbParams.s,
      a: hbParams.a,
    },
  };
}

// ============================================================================
// 5. KIRSCH (1898) ANALYTICAL ELASTIC STRESS DISTRIBUTION
// ============================================================================

export function calculateKirschStresses(
  spanB: number,
  depth: number,
  unitWeightGamma: number,
  kRatio: number,
  ucs: number,
  gsi: number,
  customSigmaCm?: number,
  customFrictionAngleDeg?: number,
  customCohesionMPa?: number,
  mi: number = 12,
  dFactor: number = 0
): KirschStressResult {
  const B = Math.max(1, spanB);
  const radiusA = B / 2;
  const safeDepth = Math.max(10, depth);
  const gamma = Math.max(10, unitWeightGamma);
  const safeK = Math.max(0.1, Math.min(5.0, kRatio));

  // Vertical in-situ stress: sigma_v = gamma * H / 1000 (MPa)
  const sigmaV = Number(((gamma * safeDepth) / 1000).toFixed(3));
  // Horizontal in-situ stress: sigma_h = K * sigma_v (MPa)
  const sigmaH = Number((safeK * sigmaV).toFixed(3));
  // Hydrostatic / mean stress: Po = (1 + K)/2 * sigma_v
  const p0Hydrostatic = ((1 + safeK) / 2) * sigmaV;

  // Kirsch equations at tunnel boundary (r = a):
  // Crown / Roof (theta = 90 deg): sigma_theta_roof = sigma_v * (3 * K - 1)
  const sigmaThetaRoof = Number((sigmaV * (3 * safeK - 1)).toFixed(3));

  // Springline / Sidewall (theta = 0 deg): sigma_theta_wall = sigma_v * (3 - K)
  const sigmaThetaWall = Number((sigmaV * (3 - safeK)).toFixed(3));

  const sigmaThetaMax = Math.max(sigmaThetaRoof, sigmaThetaWall);

  const hasRoofTension = sigmaThetaRoof < 0; // K < 1/3 (0.33)
  const hasWallTension = sigmaThetaWall < 0; // K > 3.0

  // Rock mass properties from GSI & Hoek-Brown
  const hbParams = calculateHoekBrownParams(gsi, ucs, mi, dFactor);
  const sigmaCm = customSigmaCm && customSigmaCm > 0 ? customSigmaCm : hbParams.sigmaCm;
  const frictionAngleDeg = customFrictionAngleDeg && customFrictionAngleDeg > 0 ? customFrictionAngleDeg : hbParams.frictionAngleDeg;
  const cohesionMPa = customCohesionMPa && customCohesionMPa > 0 ? customCohesionMPa : hbParams.cohesionMPa;

  const phiRad = (frictionAngleDeg * Math.PI) / 180;
  // Rankine passive coefficient / Triaxial stress multiplier: kp = (1 + sin phi) / (1 - sin phi)
  const rankineKp = Number(((1 + Math.sin(phiRad)) / Math.max(0.001, 1 - Math.sin(phiRad))).toFixed(3));

  // Strength-to-Stress Ratio (SSR) at boundary (r = a, where sigma_r = 0):
  const strengthToStressRatioWall = sigmaThetaWall > 0
    ? Number((sigmaCm / sigmaThetaWall).toFixed(2))
    : 99.9;
  const strengthToStressRatioRoof = sigmaThetaRoof > 0
    ? Number((sigmaCm / sigmaThetaRoof).toFixed(2))
    : 99.9;

  // Mohr-Coulomb failure check at boundary:
  // sigma_1 = sigma_theta, sigma_3 = 0 => failure limit is sigma_cm
  const mohrCoulombWallYield = sigmaThetaWall > sigmaCm;
  const mohrCoulombRoofYield = sigmaThetaRoof > sigmaCm;
  const factorOfSafetyWallMC = sigmaThetaWall > 0 ? Number((sigmaCm / sigmaThetaWall).toFixed(2)) : 99.9;
  const factorOfSafetyRoofMC = sigmaThetaRoof > 0 ? Number((sigmaCm / sigmaThetaRoof).toFixed(2)) : 99.9;

  // Plastic zone radius estimation (Salencon / Kastner closed form for circular opening under Po):
  let plasticZoneRadiusM = radiusA;
  let plasticZoneRatio = 1.0;
  const pCr = (2 * p0Hydrostatic - sigmaCm) / (1 + rankineKp);
  if (pCr > 0 && rankineKp > 1) {
    const termNum = 2 * (p0Hydrostatic * (rankineKp - 1) + sigmaCm);
    const termDenom = (1 + rankineKp) * sigmaCm;
    if (termNum > termDenom) {
      const exp = 1 / (rankineKp - 1);
      plasticZoneRatio = Number(Math.pow(termNum / termDenom, exp).toFixed(2));
      plasticZoneRadiusM = Number((radiusA * plasticZoneRatio).toFixed(2));
    }
  }

  let spallingRiskFa = '';
  let spallingRiskEn = '';

  const maxStress = Math.max(sigmaThetaWall, sigmaThetaRoof);
  const stressRatioToUcs = maxStress / Math.max(1, ucs);

  if (hasRoofTension) {
    spallingRiskFa = `کشش در تاج تونل (σθ = ${sigmaThetaRoof} MPa): ضریب K کمتر از ۰.۳۳ است و تاج تونل تحت کشش خالص قرار دارد که منجر به بازشدگی درزه‌ها و ریزش بلوک‌ها می‌شود.`;
    spallingRiskEn = `Roof tension detected (σθ = ${sigmaThetaRoof} MPa): K < 0.33 causes pure tension at the crown, promoting joint opening and block falling.`;
  } else if (hasWallTension) {
    spallingRiskFa = `کشش در دیواره تونل (σθ = ${sigmaThetaWall} MPa): ضریب K بزرگتر از ۳ است و دیواره‌های تونل تحت کشش قرار می‌گیرند.`;
    spallingRiskEn = `Sidewall tension detected (σθ = ${sigmaThetaWall} MPa): K > 3.0 causes tensile stress at the springline.`;
  } else if (mohrCoulombWallYield || mohrCoulombRoofYield) {
    spallingRiskFa = `تسلیم برشی موهر-کولمب توده‌سنگ: تنش مماسی حداکثر (${maxStress} MPa) از مقاومت فشاری توده‌سنگ (σcm = ${sigmaCm} MPa حاصل از GSI) فراتر رفته و با زاویه اصطکاک φ' = ${frictionAngleDeg}° زون پلاستیک تا شعاع Rp = ${plasticZoneRadiusM} m توسعه می‌یابد.`;
    spallingRiskEn = `Mohr-Coulomb shear yield: Maximum tangential stress (${maxStress} MPa) exceeds rock mass strength (σcm = ${sigmaCm} MPa from GSI), creating plastic zone up to Rp = ${plasticZoneRadiusM} m with φ' = ${frictionAngleDeg}°.`;
  } else if (stressRatioToUcs > 0.4) {
    spallingRiskFa = `ریسک بالای خردشدگی و پوسته‌شدگی سنگ (Spalling): نسبت تنش تانژانت ماکزیمم به مقاومت تک‌محوری سنگ برابر ${stressRatioToUcs.toFixed(2)} است (> ۰.۴).`;
    spallingRiskEn = `High spalling / rockburst risk: Maximum tangential stress exceeds 40% of intact UCS (${stressRatioToUcs.toFixed(2)} > 0.4).`;
  } else {
    spallingRiskFa = `حالت تنش فشاری متوازن در الاستیسیته بدون ریسک کشش یا تسلیم (SSR = ${strengthToStressRatioWall.toFixed(1)}، مقاومت توده‌سنگ σcm = ${sigmaCm} MPa و φ' = ${frictionAngleDeg}°).`;
    spallingRiskEn = `Balanced compressive elastic stress state without critical tensile failure or yielding (SSR = ${strengthToStressRatioWall.toFixed(1)}, σcm = ${sigmaCm} MPa, φ' = ${frictionAngleDeg}°).`;
  }

  // Radial stress profile from r/a = 1.0 to 4.0
  const rMultipliers = [1.0, 1.1, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 4.0];
  const radialProfile = rMultipliers.map((m) => {
    const aOverR = 1 / m;
    const a2OverR2 = Math.pow(aOverR, 2);
    const a4OverR4 = Math.pow(aOverR, 4);

    // Roof (theta = 90 deg, cos(2 theta) = -1)
    const sigmaRoofR = (sigmaV / 2) * ((1 + safeK) * (1 - a2OverR2) + (1 - safeK) * (1 - 4 * a2OverR2 + 3 * a4OverR4));
    const sigmaRoofTheta = (sigmaV / 2) * ((1 + safeK) * (1 + a2OverR2) - (1 - safeK) * (1 + 3 * a4OverR4));

    // Wall (theta = 0 deg, cos(2 theta) = +1)
    const sigmaWallR = (sigmaV / 2) * ((1 + safeK) * (1 - a2OverR2) - (1 - safeK) * (1 - 4 * a2OverR2 + 3 * a4OverR4));
    const sigmaWallTheta = (sigmaV / 2) * ((1 + safeK) * (1 + a2OverR2) + (1 - safeK) * (1 + 3 * a4OverR4));

    const sWallRClamped = Math.max(0, sigmaWallR);
    const sRoofRClamped = Math.max(0, sigmaRoofR);

    // Mohr-Coulomb compressive failure limit at this confining stress sigma_r:
    // sigma_1,failure = sigma_cm + kp * sigma_r
    const mcLimitRoof = Number((sigmaCm + rankineKp * sRoofRClamped).toFixed(2));
    const mcLimitWall = Number((sigmaCm + rankineKp * sWallRClamped).toFixed(2));

    const fsRoof = sigmaRoofTheta > 0 ? Number((mcLimitRoof / sigmaRoofTheta).toFixed(2)) : 99.9;
    const fsWall = sigmaWallTheta > 0 ? Number((mcLimitWall / sigmaWallTheta).toFixed(2)) : 99.9;

    return {
      rRatio: Number(m.toFixed(2)),
      rMeters: Number((m * radiusA).toFixed(2)),
      sigmaRoofTheta: Number(sigmaRoofTheta.toFixed(2)),
      sigmaRoofR: Number(sigmaRoofR.toFixed(2)),
      sigmaWallTheta: Number(sigmaWallTheta.toFixed(2)),
      sigmaWallR: Number(sigmaWallR.toFixed(2)),
      mohrCoulombLimitRoof: mcLimitRoof,
      mohrCoulombLimitWall: mcLimitWall,
      fsRoofMC: fsRoof,
      fsWallMC: fsWall,
      wallYielded: sigmaWallTheta > mcLimitWall,
    };
  });

  return {
    spanB: B,
    radiusA,
    depth: safeDepth,
    unitWeightGamma: gamma,
    sigmaV,
    sigmaH,
    kRatio: safeK,
    sigmaThetaRoof,
    sigmaThetaWall,
    sigmaThetaMax,
    hasRoofTension,
    hasWallTension,
    sigmaCm,
    frictionAngleDeg,
    cohesionMPa,
    rankineKp,
    plasticZoneRadiusM,
    plasticZoneRatio,
    mohrCoulombWallYield,
    mohrCoulombRoofYield,
    factorOfSafetyWallMC,
    factorOfSafetyRoofMC,
    strengthToStressRatioWall,
    strengthToStressRatioRoof,
    spallingRiskFa,
    spallingRiskEn,
    radialProfile,
  };
}

// ============================================================================
// 6. DEERE ET AL. (1970) RQD ROCK LOAD METHOD
// ============================================================================

export function calculateDeereRockLoad(
  spanB: number,
  rqd: number,
  unitWeightGamma: number
) {
  const safeRqd = Math.max(0, Math.min(100, rqd));
  const B = Math.max(1, spanB);
  const gamma = Math.max(10, unitWeightGamma);

  // Hp = ((100 - RQD) / 100) * B
  const hp = Number((((100 - safeRqd) / 100) * B).toFixed(2));
  const pvKPa = Number((hp * gamma).toFixed(1));
  const pvMPa = Number((pvKPa / 1000).toFixed(3));

  return {
    rqd: safeRqd,
    spanB: B,
    unitWeightGamma: gamma,
    hp,
    pvKPa,
    pvMPa,
  };
}

// ============================================================================
// 7. COMPREHENSIVE ROCK LOAD SYNTHESIS & COMPARISON
// ============================================================================

export function synthesizeRockLoadComparison(
  terzaghiRes: TerzaghiRockLoadResult,
  cordingRes: CordingRockLoadResult,
  bartonRes: BartonRockLoadResult,
  hoekRes: HoekRockLoadResult,
  kirschRes: KirschStressResult,
  deereRes: ReturnType<typeof calculateDeereRockLoad>
): RockLoadComparisonSummary[] {
  return [
    {
      id: 'terzaghi',
      methodNameFa: 'روش بار سنگ ترزاقی',
      methodNameEn: 'Terzaghi Rock Load Method',
      authorYear: 'Terzaghi (1946)',
      rockLoadHeightM: terzaghiRes.hpAvg,
      roofPressureKPa: terzaghiRes.pvAvgKPa,
      roofPressureMPa: terzaghiRes.pvAvgMPa,
      wallPressureKPa: terzaghiRes.phAvgKPa,
      applicableConditionsFa: terzaghiRes.condition.nameFa,
      applicableConditionsEn: terzaghiRes.condition.nameEn,
      color: '#f59e0b', // amber
    },
    {
      id: 'cording',
      methodNameFa: 'روش تجربی کوردینگ',
      methodNameEn: 'Cording et al. Method',
      authorYear: 'Cording et al. (1971)',
      rockLoadHeightM: cordingRes.hpCrown,
      roofPressureKPa: cordingRes.pCrownKPa,
      roofPressureMPa: cordingRes.pCrownMPa,
      wallPressureKPa: cordingRes.pSidewallKPa,
      boltLengthM: cordingRes.crownBoltLength,
      applicableConditionsFa: 'بر مبنای ابعاد بازشدگی (B و H) و کاهش فشار دیواره در RQD > 75%',
      applicableConditionsEn: 'Based on opening dimensions (B & H) with sidewall cutoff at RQD > 75%',
      color: '#3b82f6', // blue
    },
    {
      id: 'barton',
      methodNameFa: 'فشار سیستم Q بارتون و گریمستاد',
      methodNameEn: 'Grimstad & Barton Q Support Pressure',
      authorYear: 'Grimstad & Barton (1993)',
      rockLoadHeightM: bartonRes.hpEquivalentM,
      roofPressureKPa: bartonRes.pRoofKPa,
      roofPressureMPa: bartonRes.pRoofMPa,
      wallPressureKPa: bartonRes.pWallKPa,
      boltLengthM: bartonRes.boltLengthL,
      applicableConditionsFa: 'بر مبنای ضریب کیفیت Q، تعداد دسته‌درزه Jn و ضریب زبری درزه Jr',
      applicableConditionsEn: 'Empirical roof pressure derived from Q-system (Jn, Jr)',
      color: '#10b981', // emerald
    },
    {
      id: 'hoek',
      methodNameFa: 'فشار بحرانی نگهداری هوک',
      methodNameEn: 'Hoek Critical Support Pressure',
      authorYear: 'Hoek (1999)',
      rockLoadHeightM: hoekRes.criticalPressurePcrKPa > 0
        ? Number(((hoekRes.criticalPressurePcrKPa) / terzaghiRes.unitWeightGamma).toFixed(2))
        : 0,
      roofPressureKPa: Math.max(0, hoekRes.criticalPressurePcrKPa),
      roofPressureMPa: Math.max(0, hoekRes.criticalPressurePcrMPa),
      wallPressureKPa: Math.max(0, hoekRes.criticalPressurePcrKPa),
      applicableConditionsFa: 'حفظ رفتار الاستیک و جلوگیری از توسعه زون پلاستیک بر مبنای GSI و Po',
      applicableConditionsEn: 'Critical pressure required to prevent rock mass plastic yielding (GSI, Po)',
      color: '#8b5cf6', // purple
    },
    {
      id: 'deere',
      methodNameFa: 'روش بار سنگ دیر (بر مبنای RQD)',
      methodNameEn: 'Deere RQD Rock Load Method',
      authorYear: 'Deere et al. (1970)',
      rockLoadHeightM: deereRes.hp,
      roofPressureKPa: deereRes.pvKPa,
      roofPressureMPa: deereRes.pvMPa,
      wallPressureKPa: 0,
      applicableConditionsFa: 'برآورد بار سست براساس شاخص کیفیت مغزه سنگ RQD',
      applicableConditionsEn: 'Dead rock load height estimated directly from RQD',
      color: '#06b6d4', // cyan
    },
    {
      id: 'kirsch',
      methodNameFa: 'تمرکز تنش مرزی الاستیک کرش',
      methodNameEn: 'Kirsch Boundary Stress Concentration',
      authorYear: 'Kirsch (1898)',
      rockLoadHeightM: Number(((kirschRes.sigmaThetaMax * 1000) / terzaghiRes.unitWeightGamma).toFixed(2)),
      roofPressureKPa: Number((kirschRes.sigmaThetaRoof * 1000).toFixed(1)),
      roofPressureMPa: kirschRes.sigmaThetaRoof,
      wallPressureKPa: Number((kirschRes.sigmaThetaWall * 1000).toFixed(1)),
      applicableConditionsFa: 'توزیع تنش تحلیلی الاستیک در تاج و دیواره مقطع دایره‌ای',
      applicableConditionsEn: 'Analytical elastic boundary stresses at crown and springline',
      color: '#ec4899', // pink
    },
  ];
}
