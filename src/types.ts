/**
 * Types for Bieniawski RMR Stand-up Time & Geotechnical Assessment
 */

export type RockClassId = 1 | 2 | 3 | 4 | 5;

export type ClassificationMethod = 'rmr' | 'q' | 'both';

export interface RockClassInfo {
  id: RockClassId;
  code: string; // 'I' | 'II' | 'III' | 'IV' | 'V'
  nameFa: string;
  nameEn: string;
  rmrRange: [number, number];
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  cohesionKPa: string; // e.g. "> 400 kPa"
  frictionAngleDeg: string; // e.g. "> 45°"
  excavationMethodFa: string;
  excavationMethodEn: string;
  rockBoltsFa: string;
  rockBoltsEn: string;
  shotcreteFa: string;
  shotcreteEn: string;
  steelSetsFa: string;
  steelSetsEn: string;
}

export type QClassId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface QClassInfo {
  id: QClassId;
  nameFa: string;
  nameEn: string;
  qRange: [number, number]; // [min, max]
  descriptionFa: string;
  descriptionEn: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  supportCategoryFa: string;
  supportCategoryEn: string;
}

export interface CalculationResult {
  span: number; // m
  rmr: number; // 0 - 100
  standUpTimeHours: number;
  standUpTimeSeconds: number;
  formattedTimeFa: string;
  formattedTimeEn: string;
  timeUnitCategory: 'minutes' | 'hours' | 'days' | 'months' | 'years';
  timeBreakdown: {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    totalHours: number;
  };
  rockClass: RockClassInfo;
  isFeasible: boolean;
  maxAllowableSpan: number; // Maximum unsupported span for this RMR (m)
  minSpanAtEnvelope: number;
  status: 'safe' | 'warning' | 'critical' | 'impossible';
  statusMessageFa: string;
  statusMessageEn: string;
  pointLogX: number; // log10(Time in hours)
  pointLogY: number; // log10(Span in meters)
}

export interface QCalculationResult {
  span: number; // m
  qValue: number; // 0.001 - 1000
  esr: number; // 0.8 - 5.0
  equivalentDimension: number; // De = Span / ESR (m)
  maxUnsupportedSpan: number; // S_max = 2 * ESR * Q^0.4 (m)
  maxUnsupportedDe: number; // De_max = 2 * Q^0.4 (m)
  stabilityRatio: number; // S_max / Span
  isSelfSupporting: boolean;
  standUpTimeHours: number;
  standUpTimeSeconds: number;
  formattedTimeFa: string;
  formattedTimeEn: string;
  timeUnitCategory: 'minutes' | 'hours' | 'days' | 'months' | 'years';
  timeBreakdown: {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    totalHours: number;
  };
  qClass: QClassInfo;
  status: 'safe' | 'warning' | 'critical' | 'impossible';
  statusMessageFa: string;
  statusMessageEn: string;
  equivalentRmrBieniawski: number; // RMR = 9 * ln(Q) + 44
  equivalentRmrBarton: number; // RMR = 15 * log10(Q) + 50
  boltLength: number; // L = 2 + 0.15 * Span / ESR (m)
  supportGuidelineFa: {
    category: string;
    boltSpacing: string;
    shotcreteThickness: string;
    summary: string;
  };
  supportGuidelineEn: {
    category: string;
    boltSpacing: string;
    shotcreteThickness: string;
    summary: string;
  };
  supportDetailed?: QSupportDetailed;
  pointLogQ: number; // log10(Q)
  pointLogDe: number; // log10(De)
}

export interface QSupportDetailed {
  category: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  categoryLabelFa: string;
  categoryLabelEn: string;
  boltLength: number;
  de: number;
  // Fiber Reinforced Shotcrete (Sfr / Grimstad & Barton 1993, 2002)
  sfr: {
    thicknessMm: number;
    thicknessRangeFa: string;
    thicknessRangeEn: string;
    boltSpacingFa: string;
    boltSpacingEn: string;
    energyAbsorptionFa: string;
    energyAbsorptionEn: string;
    rrsTypeFa: string;
    rrsTypeEn: string;
    fiberDosageFa: string;
    fiberDosageEn: string;
    summaryFa: string;
    summaryEn: string;
  };
  // Conventional / Plain Shotcrete with Mesh (Barton, Lien & Lunde 1974/1980)
  plain: {
    thicknessMm: number;
    thicknessRangeFa: string;
    thicknessRangeEn: string;
    boltSpacingFa: string;
    boltSpacingEn: string;
    meshTypeFa: string;
    meshTypeEn: string;
    steelSetsFa: string;
    steelSetsEn: string;
    summaryFa: string;
    summaryEn: string;
  };
  comparisonSummaryFa: string;
  comparisonSummaryEn: string;
}

export interface PresetScenario {
  id: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  span: number;
  rmr: number;
  qValue?: number;
  esr?: number;
  categoryFa: string;
}

export interface RmrParameterState {
  ucsRating: number;
  ucsValue: number; // MPa
  rqdRating: number;
  rqdValue: number; // %
  spacingRating: number;
  spacingValue: number; // m or mm
  persistenceRating: number;
  apertureRating: number;
  roughnessRating: number;
  infillRating: number;
  weatheringRating: number;
  groundwaterRating: number;
  groundwaterCondition: 'dry' | 'damp' | 'wet' | 'dripping' | 'flowing';
  orientationAdjustment: number;
  orientationCategory: 'very_favourable' | 'favourable' | 'fair' | 'unfavourable' | 'very_unfavourable';
}

export interface QParameterState {
  rqd: number; // 0 - 100 %
  jn: number; // 0.5 - 20 (Joint Set Number)
  jr: number; // 0.5 - 4.0 (Joint Roughness Number)
  ja: number; // 0.75 - 20 (Joint Alteration Number)
  jw: number; // 0.05 - 1.0 (Joint Water Reduction Factor)
  srf: number; // 0.5 - 400 (Stress Reduction Factor)
}

export interface EsrOption {
  value: number;
  labelFa: string;
  labelEn: string;
  descriptionFa: string;
  descriptionEn: string;
}

export type AppMainTab =
  | 'classification'
  | 'excavability'
  | 'standup_time'
  | 'support'
  | 'rock_load'
  | 'report';

export type ClassificationSubTab = 'rmr' | 'q' | 'gsi';
export type SupportSubTab = 'rmr' | 'q' | 'gsi' | 'rqd' | 'russo' | 'comparison';
export type ExcavabilitySubTab = 'franklin' | 'gsi' | 'isaksson' | 'weaver' | 'comparison';
export type RockLoadSubTab = 'terzaghi' | 'barton' | 'cording' | 'hoek' | 'kirsch' | 'comparison';

// Rock Load Estimation Types
export type TerzaghiRockConditionKey =
  | 'hard_intact'
  | 'hard_stratified'
  | 'massive_moderately_jointed'
  | 'moderately_blocky_seamy'
  | 'very_blocky_seamy'
  | 'completely_crushed'
  | 'squeezing_moderate'
  | 'squeezing_great'
  | 'swelling';

export interface TerzaghiConditionInfo {
  key: TerzaghiRockConditionKey;
  code: string;
  nameFa: string;
  nameEn: string;
  hpFormulaFa: string;
  hpFormulaEn: string;
  remarksFa: string;
  remarksEn: string;
  sidePressureNoteFa: string;
  sidePressureNoteEn: string;
  typicalSidePressureRatio: number;
}

export interface TerzaghiRockLoadResult {
  condition: TerzaghiConditionInfo;
  spanB: number;
  heightHt: number;
  unitWeightGamma: number;
  hpMin: number;
  hpMax: number;
  hpAvg: number;
  pvMinKPa: number;
  pvMaxKPa: number;
  pvAvgKPa: number;
  pvAvgMPa: number;
  phAvgKPa: number;
  phAvgMPa: number;
  sidePressureRatioKh: number;
  liningRecommendationFa: string;
  liningRecommendationEn: string;
}

export interface CordingRockLoadResult {
  spanB: number;
  heightHt: number;
  unitWeightGamma: number;
  rqd: number;
  hpCrown: number;
  hpSidewall: number;
  pCrownKPa: number;
  pCrownMPa: number;
  pSidewallKPa: number;
  pSidewallMPa: number;
  crownBoltLength: number;
  sidewallBoltLength: number;
  isHighRqdReduction: boolean;
  remarksFa: string;
  remarksEn: string;
}

export interface BartonRockLoadResult {
  qValue: number;
  jn: number;
  jr: number;
  esr: number;
  spanB: number;
  unitWeightGamma: number;
  pRoofMPa: number;
  pRoofKPa: number;
  hpEquivalentM: number;
  qWall: number;
  pWallMPa: number;
  pWallKPa: number;
  boltLengthL: number;
  maxUnsupportedSpan: number;
  formulaRoofFa: string;
  formulaRoofEn: string;
  statusFa: string;
  statusEn: string;
}

export interface HoekRockLoadResult {
  depth: number;
  unitWeightGamma: number;
  p0HydrostaticMPa: number;
  sigmaCmMPa: number;
  frictionAngleDeg: number;
  rankineK: number;
  criticalPressurePcrMPa: number;
  criticalPressurePcrKPa: number;
  requiresSupport: boolean;
  plasticZoneRadiusM: number;
  statusMessageFa: string;
  statusMessageEn: string;
  hoekBrownParams: {
    gsi: number;
    sigmaCi: number;
    mb: number;
    s: number;
    a: number;
  };
}

export interface KirschStressResult {
  spanB: number;
  radiusA: number;
  depth: number;
  unitWeightGamma: number;
  sigmaV: number;
  sigmaH: number;
  kRatio: number;
  sigmaThetaRoof: number;
  sigmaThetaWall: number;
  sigmaThetaMax: number;
  hasRoofTension: boolean;
  hasWallTension: boolean;
  sigmaCm: number;
  frictionAngleDeg: number;
  cohesionMPa: number;
  rankineKp: number;
  plasticZoneRadiusM: number;
  plasticZoneRatio: number;
  mohrCoulombWallYield: boolean;
  mohrCoulombRoofYield: boolean;
  factorOfSafetyWallMC: number;
  factorOfSafetyRoofMC: number;
  strengthToStressRatioWall: number;
  strengthToStressRatioRoof: number;
  spallingRiskFa: string;
  spallingRiskEn: string;
  radialProfile: Array<{
    rRatio: number;
    rMeters: number;
    sigmaRoofTheta: number;
    sigmaRoofR: number;
    sigmaWallTheta: number;
    sigmaWallR: number;
    mohrCoulombLimitRoof: number;
    mohrCoulombLimitWall: number;
    fsRoofMC: number;
    fsWallMC: number;
    wallYielded: boolean;
  }>;
}

export interface RockLoadComparisonSummary {
  id: string;
  methodNameFa: string;
  methodNameEn: string;
  authorYear: string;
  rockLoadHeightM: number;
  roofPressureKPa: number;
  roofPressureMPa: number;
  wallPressureKPa: number;
  boltLengthM?: number;
  applicableConditionsFa: string;
  applicableConditionsEn: string;
  color: string;
}

// Support Method Types
export interface RqdSupportResult {
  rqd: number;
  span: number;
  categoryFa: string;
  categoryEn: string;
  qualityGrade: string;
  color: string;
  rockLoadHeightHp: number; // m
  rockLoadPressurePv: number; // kN/m2 (assuming gamma = 25 kN/m3)
  rockBoltsFa: string;
  rockBoltsEn: string;
  shotcreteFa: string;
  shotcreteEn: string;
  steelSetsFa: string;
  steelSetsEn: string;
  recommendationFa: string;
  recommendationEn: string;
}

export interface RussoSupportMitigation {
  code: string;
  category: 'Ma' | 'Mb';
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
}

export interface RussoSupportResult {
  gsi: number;
  span: number;
  depth: number; // Overburden depth H (m)
  ucs: number; // Intact rock strength sigma_c (MPa)
  unitWeight: number; // gamma (kN/m3)
  kRatio: number; // horizontal to vertical stress ratio k
  brittlenessIndexIf: number; // IF = sigma_c / sigma_t
  // Calculations
  sHoek: number;
  aHoek: number;
  jpParameter: number; // RMi Jointing parameter JP = s^a
  rockMassStrengthScm: number; // sigma_cm = sigma_c * s^a (MPa)
  verticalStressSigmaV: number; // sigma_v = gamma * H / 1000 (MPa)
  tangentialStressSigmaTheta: number; // sigma_theta = (3 - k)*sigma_v or 2*sigma_v (MPa)
  competencyIndexIc: number; // IC = sigma_cm / sigma_theta
  stressStrengthRatio: number; // sigma_theta / sigma_c
  radialDeformationDelta0: number; // delta_0 = 0.006 * IC^(-1.45) (%)
  plasticRadiusRatio: number; // Rp / R0 = 0.99 * IC^(-0.44)
  estimatedRmr: number; // RMR approx 0.65*GSI + 20
  // Section Type & Hazard
  classCode: 'A' | 'B' | 'C1' | 'C2' | 'C3' | 'C4' | 'D' | 'E' | 'F';
  sectionType: string; // e.g. 'ST = C1'
  classNameFa: string;
  classNameEn: string;
  hazardCode: 'H1' | 'H2' | 'H3' | 'H4';
  hazardNameFa: string;
  hazardNameEn: string;
  hazardDescFa: string;
  hazardDescEn: string;
  behaviorFa: string;
  behaviorEn: string;
  behaviorDomain: 'elastic' | 'elastic_plastic' | 'plastic' | 'brittle_failure' | 'collapse';
  color: string;
  // Mitigations
  mitigationCodes: string[];
  mitigations: RussoSupportMitigation[];
  // Standard support specifications
  excavationMethodFa: string;
  excavationMethodEn: string;
  advanceRate: string;
  radialBolting: string;
  radialBoltingFa: string;
  radialBoltingEn: string;
  shotcreteLining: string;
  shotcreteLiningFa: string;
  shotcreteLiningEn: string;
  steelRibs: string;
  steelRibsFa: string;
  steelRibsEn: string;
  invertRequirement: string;
  invertRequirementFa: string;
  invertRequirementEn: string;
  safetyConsiderationsFa: string;
  safetyConsiderationsEn: string;
}

export interface GsiSupportResult {
  gsi: number;
  span: number;
  depth: number; // m
  unitWeight: number; // kN/m3
  ucs: number; // MPa
  verticalStressP0: number; // MPa
  rockMassStrengthScm: number; // MPa
  stressStrengthRatio: number; // Scm / P0
  behaviorCategoryFa: string;
  behaviorCategoryEn: string;
  color: string;
  squeezingSeverity: 'none' | 'minor' | 'severe' | 'very_severe';
  strainPercent: number; // %
  requiredSupportPressurePi: number; // MPa
  supportTypeFa: string;
  supportTypeEn: string;
  boltsFa: string;
  boltsEn: string;
  shotcreteFa: string;
  shotcreteEn: string;
  ribsFa: string;
  ribsEn: string;
}

// Excavability Method Types
export type FranklinCategory =
  | 'dig'
  | 'rip'
  | 'blast_to_loosen'
  | 'blast_to_fracture'
  | 'digging'
  | 'easy_ripping'
  | 'hard_ripping'
  | 'blasting';

export interface FranklinResult {
  fractureSpacingIf: number; // m
  fractureFrequency: number; // fractures/m
  pointLoadIs50: number; // MPa
  equivalentUcs: number; // MPa
  excavabilityIndexIex: number; // Is * If
  excavationMethodFa: string;
  excavationMethodEn: string;
  equipmentFa: string;
  equipmentEn: string;
  category: FranklinCategory;
  categoryNameFa: string;
  categoryNameEn: string;
  color: string;
  descriptionFa: string;
  descriptionEn: string;
  pointLogIf: number; // log10(If)
  pointLogIs: number; // log10(Is)
  strengthGrade: 'VL' | 'L' | 'M' | 'H' | 'VH' | 'EH';
  spacingGrade: 'VL' | 'L' | 'M' | 'H' | 'VH' | 'EH';
}

export interface GsiExcavabilityResult {
  gsi: number;
  ucs: number; // MPa
  rockMassStrengthScm: number; // MPa
  excavabilityClassFa: string;
  excavabilityClassEn: string;
  color: string;
  machineryFa: string;
  machineryEn: string;
  specificEnergySE: number; // MJ/m3
  tbmFeasibilityFa: string;
  tbmFeasibilityEn: string;
  drillAndBlastRecommendationFa: string;
  drillAndBlastRecommendationEn: string;
}

export interface IsakssonResult {
  ucs: number; // MPa
  jointFrequencyJv: number; // joints/m3
  jointSpacingM: number; // m
  rockDensity: number; // t/m3
  tunnelSpan: number; // m
  specificChargeQ: number; // kg/m3 (powder factor)
  specificDrillingSD: number; // m/m3
  driEstimate: number; // Drilling Rate Index (0 - 100)
  drillabilityClassFa: string;
  drillabilityClassEn: string;
  blastabilityClassFa: string;
  blastabilityClassEn: string;
  advancePerRound: number; // m
  bitWearRate: string; // m/bit
  bitWearRateFa: string;
  bitWearRateEn: string;
  overbreakRiskFa: string;
  overbreakRiskEn: string;
  explosiveTypeFa: string;
  explosiveTypeEn: string;
}

export interface WeaverInputState {
  seismicVelocityVp: number; // km/s
  ucs: number; // MPa
  weatheringGrade: 1 | 2 | 3 | 4 | 5; // 1: unweathered to 5: completely weathered
  jointSpacing: number; // m
  continuity: 'non_continuous' | 'continuous_gouge' | 'continuous_no_gouge';
  gouge: 'none' | 'hard' | 'soft';
}

export interface WeaverResult {
  totalRating: number; // 0 - 100
  classCode: 'I' | 'II' | 'III' | 'IV' | 'V';
  classNameFa: string;
  classNameEn: string;
  rippabilityDescriptionFa: string;
  rippabilityDescriptionEn: string;
  tractorRecommendationFa: string;
  tractorRecommendationEn: string;
  color: string;
  scores: {
    seismic: number;
    hardness: number;
    weathering: number;
    jointSpacing: number;
    continuity: number;
    gouge: number;
  };
}

/**
 * Project Profile / Scenario Data Configuration (*.STEMD)
 */
export interface ProjectScenarioData {
  span: number; // Tunnel span (m)
  height: number; // Tunnel height (m)
  depth: number; // Overburden depth (m)
  rmr: number; // Bieniawski RMR89 (0 - 100)
  qValue: number; // Barton Q-value (0.001 - 1000)
  esr: number; // Excavation Support Ratio (0.8 - 5.0)
  gsi: number; // Geological Strength Index (5 - 100)
  ucs: number; // Intact Rock Compressive Strength (MPa)
  rqd: number; // Rock Quality Designation (%)
  unitWeight: number; // Rock Unit Weight gamma (kN/m3)
  kRatio: number; // In-situ lateral stress coefficient K0
  jointSpacing: number; // Discontinuity spacing (m)
  jointSets: number; // Joint sets count / Jn
  jr: number; // Joint roughness number Jr
  ja: number; // Joint alteration number Ja
  mi: number; // Hoek-Brown intact constant mi
  dFactor: number; // Disturbance factor D (0 to 1)
  groundwaterCondition: 'dry' | 'damp' | 'wet' | 'dripping' | 'flowing';
  groundwaterRmr: number;
  jw: number;
  pointLoadIs50: number; // Point load index (MPa)
  method: ClassificationMethod;
  // Barton Q & Stress parameters
  srf?: number; // Stress Reduction Factor SRF (0.5 to 20)
  // Bieniawski RMR 1989 Sub-parameters
  persistence?: number; // Discontinuity persistence rating (1 to 6)
  aperture?: number; // Discontinuity aperture rating (0 to 6)
  roughness?: number; // Discontinuity roughness rating (1 to 6)
  infillingId?: string; // Infilling gouge type identifier
  weathering?: number; // Weathering grade rating (1 to 6)
  orientationAdj?: number; // Discontinuity strike/dip adjustment (0 to -12)
  calcModeRmr?: 'components' | 'manual'; // RMR calculation mode
  calcModeQ?: 'components' | 'manual'; // Q calculation mode
  // Optional excavability inputs
  fractureSpacingIf?: number;
  rockDensity?: number;
  // App navigation state
  mainTab?: AppMainTab;
  classificationSubTab?: ClassificationSubTab;
  // Project & Report metadata
  projectTitle?: string;
  projectName?: string;
  tunnelSection?: string;
  designerName?: string;
  designerTitle?: string;
  approverName?: string;
  approverTitle?: string;
  engineerName?: string;
  notes?: string;
}

export interface ProjectScenario {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  isBuiltIn?: boolean;
  createdAt: number;
  updatedAt: number;
  data: ProjectScenarioData;
}

export interface StemdFileEnvelope {
  format: 'STEMD';
  version: '1.0' | '0.9';
  app: string;
  exportDate: string;
  type: 'single_scenario' | 'scenarios_collection';
  activeScenarioId?: string;
  payload: ProjectScenario | ProjectScenario[];
}

export interface ReportSectionsConfig {
  inputs: boolean;        // مشخصات و پارامترهای ورودی
  excavability: boolean;  // قابلیت حفاری و روش‌های استخراج
  standUpTime: boolean;   // زمان خودایستایی و پایداری
  support: boolean;       // طرح سیستم نگهداری تجربی
  rockLoad: boolean;      // برآورد بار سنگ و فشار سقف
  signatures: boolean;    // شناسنامه مهندسی و امضاها
}

export const DEFAULT_REPORT_SECTIONS: ReportSectionsConfig = {
  inputs: true,
  excavability: true,
  standUpTime: true,
  support: true,
  rockLoad: true,
  signatures: true,
};

