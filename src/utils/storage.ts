/**
 * Geotechnical Engineering Parameters Local Storage Persistence
 * Safely persists user inputs (Span, RMR, Q-value, GSI, UCS, Overburden Depth, etc.)
 * across browser sessions and page reloads.
 */

import { ClassificationMethod, AppMainTab, ClassificationSubTab, WeaverInputState, ExcavabilitySubTab } from '../types';

export interface SavedTunnelInputs {
  span: number;
  height?: number; // Tunnel height (m)
  depth: number;
  rmr: number;
  qValue: number;
  esr: number;
  gsi: number;
  ucs: number;
  rqd: number;
  unitWeight: number;
  kRatio: number;
  jointSpacing: number;
  jointSets: number;
  jr?: number; // Joint roughness number Jr
  ja?: number; // Joint alteration number Ja
  srf?: number; // Stress Reduction Factor SRF
  mi?: number;
  dFactor?: number;
  groundwaterCondition: 'dry' | 'damp' | 'wet' | 'dripping' | 'flowing';
  groundwaterRmr: number;
  jw: number;
  pointLoadIs50: number;
  method: ClassificationMethod;
  // Sub-parameters
  persistence?: number;
  aperture?: number;
  roughness?: number;
  infillingId?: string;
  weathering?: number;
  orientationAdj?: number;
  calcModeRmr?: 'components' | 'manual';
  calcModeQ?: 'components' | 'manual';
  fractureSpacingIf?: number;
  rockDensity?: number;
  // Project metadata
  projectName?: string;
  tunnelSection?: string;
  engineerName?: string;
  projectTitle?: string;
  designerName?: string;
  designerTitle?: string;
  approverName?: string;
  approverTitle?: string;
  notes?: string;
  mainTab: AppMainTab;
  classificationSubTab: ClassificationSubTab;
  lang: 'fa' | 'en';
}

export const DEFAULT_TUNNEL_INPUTS: SavedTunnelInputs = {
  span: 5.0,
  height: 5.0,
  depth: 250,
  rmr: 50,
  qValue: 4.0,
  esr: 1.0,
  gsi: 55,
  ucs: 65,
  rqd: 75,
  unitWeight: 25,
  kRatio: 1.0,
  jointSpacing: 0.25,
  jointSets: 9,
  jr: 2.0,
  ja: 1.0,
  srf: 1.0,
  persistence: 4,
  aperture: 4,
  roughness: 3,
  infillingId: 'hard_lt5',
  weathering: 3,
  orientationAdj: -5,
  calcModeRmr: 'components',
  calcModeQ: 'components',
  fractureSpacingIf: 0.25,
  rockDensity: 2.55,
  mi: 12,
  dFactor: 0.0,
  groundwaterCondition: 'damp',
  groundwaterRmr: 10,
  jw: 0.66,
  pointLoadIs50: 2.5,
  method: 'rmr',
  projectName: '',
  tunnelSection: '',
  engineerName: '',
  projectTitle: '',
  designerName: '',
  designerTitle: '',
  approverName: '',
  approverTitle: '',
  notes: '',
  mainTab: 'classification',
  classificationSubTab: 'rmr',
  lang: 'fa',
};

const STORAGE_KEY_MAIN = 'rock_tunnel_geotech_params_v1';
const STORAGE_KEY_EXCAV = 'rock_tunnel_excavability_params_v1';

export function loadSavedInputs(): SavedTunnelInputs {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_TUNNEL_INPUTS;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_MAIN);
    if (!raw) return DEFAULT_TUNNEL_INPUTS;
    const parsed = JSON.parse(raw);
    return {
      span: typeof parsed.span === 'number' && !isNaN(parsed.span) ? Math.max(0.5, Math.min(30, parsed.span)) : DEFAULT_TUNNEL_INPUTS.span,
      height: typeof parsed.height === 'number' && !isNaN(parsed.height) ? Math.max(0.5, Math.min(30, parsed.height)) : (typeof parsed.span === 'number' ? parsed.span : DEFAULT_TUNNEL_INPUTS.height),
      depth: typeof parsed.depth === 'number' && !isNaN(parsed.depth) ? Math.max(1, Math.min(3000, parsed.depth)) : DEFAULT_TUNNEL_INPUTS.depth,
      rmr: typeof parsed.rmr === 'number' && !isNaN(parsed.rmr) ? Math.max(0, Math.min(100, parsed.rmr)) : DEFAULT_TUNNEL_INPUTS.rmr,
      qValue: typeof parsed.qValue === 'number' && !isNaN(parsed.qValue) ? Math.max(0.001, Math.min(1000, parsed.qValue)) : DEFAULT_TUNNEL_INPUTS.qValue,
      esr: typeof parsed.esr === 'number' && !isNaN(parsed.esr) ? Math.max(0.5, Math.min(5.0, parsed.esr)) : DEFAULT_TUNNEL_INPUTS.esr,
      gsi: typeof parsed.gsi === 'number' && !isNaN(parsed.gsi) ? Math.max(5, Math.min(100, parsed.gsi)) : DEFAULT_TUNNEL_INPUTS.gsi,
      ucs: typeof parsed.ucs === 'number' && !isNaN(parsed.ucs) ? Math.max(1, Math.min(400, parsed.ucs)) : DEFAULT_TUNNEL_INPUTS.ucs,
      rqd: typeof parsed.rqd === 'number' && !isNaN(parsed.rqd) ? Math.max(0, Math.min(100, parsed.rqd)) : DEFAULT_TUNNEL_INPUTS.rqd,
      unitWeight: typeof parsed.unitWeight === 'number' && !isNaN(parsed.unitWeight) ? Math.max(15, Math.min(40, parsed.unitWeight)) : DEFAULT_TUNNEL_INPUTS.unitWeight,
      kRatio: typeof parsed.kRatio === 'number' && !isNaN(parsed.kRatio) ? Math.max(0.2, Math.min(4.0, parsed.kRatio)) : DEFAULT_TUNNEL_INPUTS.kRatio,
      jointSpacing: typeof parsed.jointSpacing === 'number' && !isNaN(parsed.jointSpacing) ? Math.max(0.01, Math.min(5.0, parsed.jointSpacing)) : DEFAULT_TUNNEL_INPUTS.jointSpacing,
      jointSets: typeof parsed.jointSets === 'number' && !isNaN(parsed.jointSets) ? Math.max(0.5, Math.min(20, parsed.jointSets)) : DEFAULT_TUNNEL_INPUTS.jointSets,
      jr: typeof parsed.jr === 'number' && !isNaN(parsed.jr) ? Math.max(0.5, Math.min(5.0, parsed.jr)) : DEFAULT_TUNNEL_INPUTS.jr,
      ja: typeof parsed.ja === 'number' && !isNaN(parsed.ja) ? Math.max(0.75, Math.min(20, parsed.ja)) : DEFAULT_TUNNEL_INPUTS.ja,
      srf: typeof parsed.srf === 'number' && !isNaN(parsed.srf) ? Math.max(0.25, Math.min(20, parsed.srf)) : DEFAULT_TUNNEL_INPUTS.srf,
      mi: typeof parsed.mi === 'number' && !isNaN(parsed.mi) ? Math.max(1, Math.min(50, parsed.mi)) : DEFAULT_TUNNEL_INPUTS.mi,
      dFactor: typeof parsed.dFactor === 'number' && !isNaN(parsed.dFactor) ? Math.max(0, Math.min(1, parsed.dFactor)) : DEFAULT_TUNNEL_INPUTS.dFactor,
      groundwaterCondition: ['dry', 'damp', 'wet', 'dripping', 'flowing'].includes(parsed.groundwaterCondition) ? parsed.groundwaterCondition : DEFAULT_TUNNEL_INPUTS.groundwaterCondition,
      groundwaterRmr: typeof parsed.groundwaterRmr === 'number' && !isNaN(parsed.groundwaterRmr) ? Math.max(0, Math.min(15, parsed.groundwaterRmr)) : DEFAULT_TUNNEL_INPUTS.groundwaterRmr,
      jw: typeof parsed.jw === 'number' && !isNaN(parsed.jw) ? Math.max(0.05, Math.min(1.0, parsed.jw)) : DEFAULT_TUNNEL_INPUTS.jw,
      pointLoadIs50: typeof parsed.pointLoadIs50 === 'number' && !isNaN(parsed.pointLoadIs50) ? Math.max(0.1, Math.min(20, parsed.pointLoadIs50)) : DEFAULT_TUNNEL_INPUTS.pointLoadIs50,
      method: ['rmr', 'q', 'both'].includes(parsed.method) ? parsed.method : DEFAULT_TUNNEL_INPUTS.method,
      persistence: typeof parsed.persistence === 'number' && !isNaN(parsed.persistence) ? parsed.persistence : DEFAULT_TUNNEL_INPUTS.persistence,
      aperture: typeof parsed.aperture === 'number' && !isNaN(parsed.aperture) ? parsed.aperture : DEFAULT_TUNNEL_INPUTS.aperture,
      roughness: typeof parsed.roughness === 'number' && !isNaN(parsed.roughness) ? parsed.roughness : DEFAULT_TUNNEL_INPUTS.roughness,
      infillingId: typeof parsed.infillingId === 'string' ? parsed.infillingId : DEFAULT_TUNNEL_INPUTS.infillingId,
      weathering: typeof parsed.weathering === 'number' && !isNaN(parsed.weathering) ? parsed.weathering : DEFAULT_TUNNEL_INPUTS.weathering,
      orientationAdj: typeof parsed.orientationAdj === 'number' && !isNaN(parsed.orientationAdj) ? parsed.orientationAdj : DEFAULT_TUNNEL_INPUTS.orientationAdj,
      calcModeRmr: ['components', 'manual'].includes(parsed.calcModeRmr) ? parsed.calcModeRmr : DEFAULT_TUNNEL_INPUTS.calcModeRmr,
      calcModeQ: ['components', 'manual'].includes(parsed.calcModeQ) ? parsed.calcModeQ : DEFAULT_TUNNEL_INPUTS.calcModeQ,
      fractureSpacingIf: typeof parsed.fractureSpacingIf === 'number' && !isNaN(parsed.fractureSpacingIf) ? parsed.fractureSpacingIf : (typeof parsed.jointSpacing === 'number' ? parsed.jointSpacing : DEFAULT_TUNNEL_INPUTS.fractureSpacingIf),
      rockDensity: typeof parsed.rockDensity === 'number' && !isNaN(parsed.rockDensity) ? parsed.rockDensity : DEFAULT_TUNNEL_INPUTS.rockDensity,
      projectName: typeof parsed.projectName === 'string' ? parsed.projectName : DEFAULT_TUNNEL_INPUTS.projectName,
      tunnelSection: typeof parsed.tunnelSection === 'string' ? parsed.tunnelSection : DEFAULT_TUNNEL_INPUTS.tunnelSection,
      engineerName: typeof parsed.engineerName === 'string' ? parsed.engineerName : DEFAULT_TUNNEL_INPUTS.engineerName,
      projectTitle: typeof parsed.projectTitle === 'string' ? parsed.projectTitle : DEFAULT_TUNNEL_INPUTS.projectTitle,
      designerName: typeof parsed.designerName === 'string' ? parsed.designerName : DEFAULT_TUNNEL_INPUTS.designerName,
      designerTitle: typeof parsed.designerTitle === 'string' ? parsed.designerTitle : DEFAULT_TUNNEL_INPUTS.designerTitle,
      approverName: typeof parsed.approverName === 'string' ? parsed.approverName : DEFAULT_TUNNEL_INPUTS.approverName,
      approverTitle: typeof parsed.approverTitle === 'string' ? parsed.approverTitle : DEFAULT_TUNNEL_INPUTS.approverTitle,
      notes: typeof parsed.notes === 'string' ? parsed.notes : DEFAULT_TUNNEL_INPUTS.notes,
      mainTab: ['classification', 'excavability', 'standup_time', 'support', 'rock_load', 'report'].includes(parsed.mainTab) ? parsed.mainTab : DEFAULT_TUNNEL_INPUTS.mainTab,
      classificationSubTab: ['rmr', 'q', 'gsi'].includes(parsed.classificationSubTab) ? parsed.classificationSubTab : DEFAULT_TUNNEL_INPUTS.classificationSubTab,
      lang: ['fa', 'en'].includes(parsed.lang) ? parsed.lang : DEFAULT_TUNNEL_INPUTS.lang,
    };
  } catch (err) {
    console.warn('Failed to load geotech params from localStorage', err);
    return DEFAULT_TUNNEL_INPUTS;
  }
}

export function saveInputs(data: Partial<SavedTunnelInputs>): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const existing = loadSavedInputs();
    const updated = { ...existing, ...data };
    window.localStorage.setItem(STORAGE_KEY_MAIN, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save geotech params to localStorage', err);
  }
}

export function clearSavedInputs(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY_MAIN);
    window.localStorage.removeItem(STORAGE_KEY_EXCAV);
  } catch (err) {
    console.warn('Failed to clear saved geotech params', err);
  }
}

export interface SavedExcavabilityInputs {
  activeSubTab: ExcavabilitySubTab;
  fractureSpacingIf: number;
  pointLoadIs50: number;
  ucs: number;
  rockDensity: number;
  weaverState: WeaverInputState;
}

export const DEFAULT_EXCAVABILITY_INPUTS: SavedExcavabilityInputs = {
  activeSubTab: 'comparison',
  fractureSpacingIf: 0.25,
  pointLoadIs50: 2.5,
  ucs: 60,
  rockDensity: 2.65,
  weaverState: {
    seismicVelocityVp: 1.6,
    ucs: 45,
    weatheringGrade: 3,
    jointSpacing: 0.35,
    continuity: 'continuous_gouge',
    gouge: 'hard',
  },
};

export function loadExcavabilityInputs(): SavedExcavabilityInputs {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_EXCAVABILITY_INPUTS;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_EXCAV);
    if (!raw) return DEFAULT_EXCAVABILITY_INPUTS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_EXCAVABILITY_INPUTS,
      ...parsed,
      weaverState: {
        ...DEFAULT_EXCAVABILITY_INPUTS.weaverState,
        ...(parsed.weaverState || {}),
      },
    };
  } catch (err) {
    console.warn('Failed to load excavability params from localStorage', err);
    return DEFAULT_EXCAVABILITY_INPUTS;
  }
}

export function saveExcavabilityInputs(data: Partial<SavedExcavabilityInputs>): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const existing = loadExcavabilityInputs();
    const updated = { ...existing, ...data };
    window.localStorage.setItem(STORAGE_KEY_EXCAV, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save excavability params to localStorage', err);
  }
}
