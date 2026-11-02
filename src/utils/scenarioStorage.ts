/**
 * Project Profiles & Scenarios Management with *.STEMD File Support
 * Enables geotechnical and tunneling engineers to save, name, manage,
 * and switch between different tunnel design scenarios in localStorage,
 * as well as export and import configurations via *.STEMD files.
 */

import { ProjectScenario, ProjectScenarioData, StemdFileEnvelope } from '../types';

export const STEMD_FILE_EXTENSION = '.stemd';
const STORAGE_KEY_SCENARIOS = 'stemd_project_scenarios_v1';
const STORAGE_KEY_ACTIVE_ID = 'stemd_active_scenario_id_v1';

/**
 * Standard Built-in Benchmark Engineering Scenarios
 */
export const BUILTIN_BENCHMARK_SCENARIOS: ProjectScenario[] = [
  {
    id: 'stemd_highway_good_rock',
    name: 'تونل راه و آزادراه در توده‌سنگ سالم (کلاس II)',
    nameEn: 'Highway Tunnel - Good Rock Mass (Class II)',
    description: 'تونل دو خطه کوهستانی با دهانه ۱۰.۵ متر در عمق ۳۲۰ متری، توده‌سنگ آهکی متراکم با RMR=72 و Q=18.5، مناسب برای حفاری تمام‌مقطع.',
    descriptionEn: 'Two-lane mountain highway tunnel with 10.5m span at 320m depth in sound limestone, RMR=72 and Q=18.5, full-face excavation.',
    isBuiltIn: true,
    createdAt: 1710000001000,
    updatedAt: 1710000001000,
    data: {
      span: 10.5,
      height: 7.8,
      depth: 320,
      rmr: 72,
      qValue: 18.5,
      esr: 1.0,
      gsi: 70,
      ucs: 110,
      rqd: 85,
      unitWeight: 26.5,
      kRatio: 0.9,
      jointSpacing: 0.6,
      jointSets: 4,
      jr: 2.5,
      ja: 1.0,
      srf: 1.0,
      persistence: 4,
      aperture: 4,
      roughness: 4,
      infillingId: 'hard_lt5',
      weathering: 3,
      orientationAdj: -5,
      calcModeRmr: 'components',
      calcModeQ: 'components',
      mi: 15,
      dFactor: 0.0,
      groundwaterCondition: 'dry',
      groundwaterRmr: 15,
      jw: 1.0,
      pointLoadIs50: 4.5,
      method: 'both',
      fractureSpacingIf: 0.6,
      rockDensity: 2.65,
    },
  },
  {
    id: 'stemd_hydro_fair_rock',
    name: 'تونل انتقال آب نیروگاه در سنگ متوسط (کلاس III)',
    nameEn: 'Hydropower Headrace Tunnel - Fair Rock (Class III)',
    description: 'تونل آبرسان دایره‌ای/نعل‌اسبی به دهانه ۶.۵ متر در عمق ۲۲۰ متری، توالی ماسه‌سنگ و شیل با RMR=52 و Q=4.5 با شرایط رطوبتی نم‌دار.',
    descriptionEn: 'Hydropower headrace tunnel with 6.5m span at 220m depth in interbedded sandstone and shale with RMR=52 and Q=4.5 under damp conditions.',
    isBuiltIn: true,
    createdAt: 1710000002000,
    updatedAt: 1710000002000,
    data: {
      span: 6.5,
      height: 6.5,
      depth: 220,
      rmr: 52,
      qValue: 4.5,
      esr: 1.6,
      gsi: 50,
      ucs: 65,
      rqd: 68,
      unitWeight: 25.0,
      kRatio: 1.1,
      jointSpacing: 0.25,
      jointSets: 9,
      jr: 2.0,
      ja: 1.0,
      srf: 1.0,
      persistence: 3,
      aperture: 3,
      roughness: 3,
      infillingId: 'hard_lt5',
      weathering: 3,
      orientationAdj: -5,
      calcModeRmr: 'components',
      calcModeQ: 'components',
      mi: 12,
      dFactor: 0.0,
      groundwaterCondition: 'damp',
      groundwaterRmr: 10,
      jw: 0.66,
      pointLoadIs50: 2.8,
      method: 'both',
      fractureSpacingIf: 0.25,
      rockDensity: 2.5,
    },
  },
  {
    id: 'stemd_subway_poor_rock',
    name: 'تونل مترو شهری در زون خردشده و آبدار (کلاس IV)',
    nameEn: 'Urban Subway in Fault Zone - Poor Rock (Class IV)',
    description: 'ایستگاه و مسیر کم‌عمق شهری در عمق ۳۵ متری با دهانه ۸.۸ متر، توده‌سنگ هوازده و درزه‌دار با RMR=32 و Q=0.45 تحت آب ترشحی.',
    descriptionEn: 'Shallow urban subway tunnel at 35m depth with 8.8m span in heavily jointed fault zone with RMR=32 and Q=0.45 with dripping water.',
    isBuiltIn: true,
    createdAt: 1710000003000,
    updatedAt: 1710000003000,
    data: {
      span: 8.8,
      height: 7.2,
      depth: 35,
      rmr: 32,
      qValue: 0.45,
      esr: 1.0,
      gsi: 30,
      ucs: 30,
      rqd: 35,
      unitWeight: 23.5,
      kRatio: 1.25,
      jointSpacing: 0.1,
      jointSets: 12,
      jr: 1.5,
      ja: 3.0,
      srf: 2.5,
      persistence: 2,
      aperture: 2,
      roughness: 2,
      infillingId: 'soft_lt5',
      weathering: 2,
      orientationAdj: -5,
      calcModeRmr: 'components',
      calcModeQ: 'components',
      mi: 8,
      dFactor: 0.2,
      groundwaterCondition: 'wet',
      groundwaterRmr: 4,
      jw: 0.5,
      pointLoadIs50: 1.2,
      method: 'both',
      fractureSpacingIf: 0.1,
      rockDensity: 2.35,
    },
  },
  {
    id: 'stemd_deep_squeezing',
    name: 'تونل بسیار عمیق با پتانسیل مچاله‌شوندگی شدید (کلاس V)',
    nameEn: 'Deep Water Transfer Tunnel - High Squeezing (Class V)',
    description: 'تونل انتقال آب عمیق با روباره ۷۵۰ متر در سنگ بسیار ضعیف و رسی، RMR=18 و Q=0.08، خطر شدید خزش و مچاله‌شوندگی سنگ.',
    descriptionEn: 'Deep tunnel with 750m overburden in weak argillaceous rock, RMR=18 and Q=0.08, high squeezing ground and heavy rock loads.',
    isBuiltIn: true,
    createdAt: 1710000004000,
    updatedAt: 1710000004000,
    data: {
      span: 5.2,
      height: 5.2,
      depth: 750,
      rmr: 18,
      qValue: 0.08,
      esr: 1.3,
      gsi: 18,
      ucs: 18,
      rqd: 15,
      unitWeight: 25.5,
      kRatio: 1.4,
      jointSpacing: 0.05,
      jointSets: 15,
      jr: 1.0,
      ja: 4.0,
      srf: 10.0,
      persistence: 1,
      aperture: 1,
      roughness: 1,
      infillingId: 'soft_gt5',
      weathering: 1,
      orientationAdj: -5,
      calcModeRmr: 'components',
      calcModeQ: 'components',
      mi: 7,
      dFactor: 0.4,
      groundwaterCondition: 'dripping',
      groundwaterRmr: 2,
      jw: 0.33,
      pointLoadIs50: 0.7,
      method: 'both',
      fractureSpacingIf: 0.05,
      rockDensity: 2.55,
    },
  },
  {
    id: 'stemd_powerhouse_cavern',
    name: 'مغار بزرگ زیرزمینی نیروگاه در سنگ بسیار مرغوب (کلاس I)',
    nameEn: 'Large Underground Powerhouse Cavern - Very Good Rock (Class I)',
    description: 'فضای بزرگ زیرزمینی به دهانه ۱۸ متر و ارتفاع ۲۴ متر در گرانیت سالم، RMR=85 و Q=45، خودپایداری طولانی‌مدت با پتانسیل پرتاب سنگ الاستیک.',
    descriptionEn: 'Large powerhouse cavern with 18m span and 24m height in massive sound granite, RMR=85 and Q=45, exceptional stability.',
    isBuiltIn: true,
    createdAt: 1710000005000,
    updatedAt: 1710000005000,
    data: {
      span: 18.0,
      height: 24.0,
      depth: 160,
      rmr: 85,
      qValue: 45.0,
      esr: 1.0,
      gsi: 82,
      ucs: 140,
      rqd: 95,
      unitWeight: 27.0,
      kRatio: 0.8,
      jointSpacing: 1.2,
      jointSets: 3,
      jr: 3.0,
      ja: 0.75,
      srf: 1.0,
      persistence: 6,
      aperture: 5,
      roughness: 5,
      infillingId: 'none',
      weathering: 5,
      orientationAdj: -2,
      calcModeRmr: 'components',
      calcModeQ: 'components',
      mi: 18,
      dFactor: 0.0,
      groundwaterCondition: 'dry',
      groundwaterRmr: 15,
      jw: 1.0,
      pointLoadIs50: 6.0,
      method: 'both',
      fractureSpacingIf: 1.2,
      rockDensity: 2.7,
    },
  },
];

/**
 * Load all project scenarios from local storage, falling back to built-in benchmarks
 */
export function loadAllScenarios(): ProjectScenario[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return BUILTIN_BENCHMARK_SCENARIOS;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_SCENARIOS);
    if (!raw) {
      saveAllScenarios(BUILTIN_BENCHMARK_SCENARIOS);
      return BUILTIN_BENCHMARK_SCENARIOS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure built-ins are always accessible
      const existingIds = new Set(parsed.map((p: ProjectScenario) => p.id));
      const missingBuiltins = BUILTIN_BENCHMARK_SCENARIOS.filter(b => !existingIds.has(b.id));
      if (missingBuiltins.length > 0) {
        const merged = [...parsed, ...missingBuiltins];
        saveAllScenarios(merged);
        return merged;
      }
      return parsed;
    }
    return BUILTIN_BENCHMARK_SCENARIOS;
  } catch (err) {
    console.warn('Failed to parse saved scenarios from localStorage:', err);
    return BUILTIN_BENCHMARK_SCENARIOS;
  }
}

/**
 * Save all scenarios list to localStorage
 */
export function saveAllScenarios(scenarios: ProjectScenario[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY_SCENARIOS, JSON.stringify(scenarios));
  } catch (err) {
    console.error('Failed to save scenarios to localStorage:', err);
  }
}

/**
 * Get active scenario ID from localStorage
 */
export function getActiveScenarioId(): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return BUILTIN_BENCHMARK_SCENARIOS[0].id;
  }
  try {
    const id = window.localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (id) return id;
  } catch (e) {
    // fallback
  }
  return BUILTIN_BENCHMARK_SCENARIOS[0].id;
}

/**
 * Set active scenario ID in localStorage
 */
export function setActiveScenarioId(id: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch (e) {
    // ignore
  }
}

/**
 * Save current configuration as a new named Scenario
 */
export function saveCurrentAsScenario(
  name: string,
  description: string,
  data: ProjectScenarioData,
  nameEn?: string
): ProjectScenario {
  const all = loadAllScenarios();
  const id = `scenario_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newScenario: ProjectScenario = {
    id,
    name: name.trim() || `سناریوی جدید ${all.length + 1}`,
    nameEn: nameEn?.trim() || `New Scenario ${all.length + 1}`,
    description: description.trim(),
    descriptionEn: description.trim(),
    isBuiltIn: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    data: { ...data },
  };

  const updatedList = [newScenario, ...all];
  saveAllScenarios(updatedList);
  setActiveScenarioId(id);
  return newScenario;
}

/**
 * Update an existing scenario
 */
export function updateScenario(
  id: string,
  updates: {
    name?: string;
    nameEn?: string;
    description?: string;
    descriptionEn?: string;
    data?: Partial<ProjectScenarioData>;
  }
): ProjectScenario | null {
  const all = loadAllScenarios();
  const idx = all.findIndex(s => s.id === id);
  if (idx === -1) return null;

  const current = all[idx];
  const updated: ProjectScenario = {
    ...current,
    name: updates.name !== undefined ? updates.name.trim() : current.name,
    nameEn: updates.nameEn !== undefined ? updates.nameEn.trim() : current.nameEn,
    description: updates.description !== undefined ? updates.description.trim() : current.description,
    descriptionEn: updates.descriptionEn !== undefined ? updates.descriptionEn.trim() : current.descriptionEn,
    updatedAt: Date.now(),
    data: updates.data ? { ...current.data, ...updates.data } : current.data,
  };

  all[idx] = updated;
  saveAllScenarios(all);
  return updated;
}

/**
 * Duplicate an existing scenario
 */
export function duplicateScenario(id: string, newNamePrefix = 'کپی از '): ProjectScenario | null {
  const all = loadAllScenarios();
  const target = all.find(s => s.id === id);
  if (!target) return null;

  const newId = `scenario_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const copy: ProjectScenario = {
    ...target,
    id: newId,
    name: `${newNamePrefix}${target.name}`,
    nameEn: `Copy of ${target.nameEn || target.name}`,
    isBuiltIn: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    data: { ...target.data },
  };

  const updatedList = [copy, ...all];
  saveAllScenarios(updatedList);
  setActiveScenarioId(newId);
  return copy;
}

/**
 * Delete a scenario (built-in scenarios are protected unless forced)
 */
export function deleteScenario(id: string): boolean {
  const all = loadAllScenarios();
  const target = all.find(s => s.id === id);
  if (!target || target.isBuiltIn) return false;

  const filtered = all.filter(s => s.id !== id);
  saveAllScenarios(filtered);

  if (getActiveScenarioId() === id) {
    if (filtered.length > 0) {
      setActiveScenarioId(filtered[0].id);
    }
  }
  return true;
}

/**
 * Reset all scenarios to factory built-in benchmarks
 */
export function resetScenariosToFactory(): ProjectScenario[] {
  saveAllScenarios(BUILTIN_BENCHMARK_SCENARIOS);
  setActiveScenarioId(BUILTIN_BENCHMARK_SCENARIOS[0].id);
  return BUILTIN_BENCHMARK_SCENARIOS;
}

// -------------------------------------------------------------
// *.STEMD File Export and Import Handlers
// -------------------------------------------------------------

export function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim() || 'Tunnel_Scenario';
}

/**
 * Trigger download of a string content with custom filename
 */
function downloadFile(content: string, filename: string, mimeType = 'application/octet-stream') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Build a standard *.STEMD envelope for a scenario
 */
export function createSingleScenarioEnvelope(scenario: ProjectScenario): StemdFileEnvelope {
  return {
    format: 'STEMD',
    version: '1.0',
    app: 'Tunnel Empirical Method Design Suite v1.0',
    exportDate: new Date().toISOString(),
    type: 'single_scenario',
    activeScenarioId: scenario.id,
    payload: {
      ...scenario,
      data: { ...scenario.data },
    },
  };
}

/**
 * Export a single scenario as a *.STEMD file download
 */
export function exportScenarioToStemd(scenario: ProjectScenario): void {
  const envelope = createSingleScenarioEnvelope(scenario);
  const cleanName = sanitizeFilename(scenario.name) || 'tunnel_scenario';
  const filename = `${cleanName}${STEMD_FILE_EXTENSION}`;
  downloadFile(JSON.stringify(envelope, null, 2), filename, 'application/octet-stream');
}

/**
 * Export all scenarios as a *.STEMD collection package
 */
export function exportAllScenariosToStemd(scenarios: ProjectScenario[], activeId?: string): void {
  const envelope: StemdFileEnvelope = {
    format: 'STEMD',
    version: '1.0',
    app: 'Tunnel Empirical Method Design Suite v1.0',
    exportDate: new Date().toISOString(),
    type: 'scenarios_collection',
    activeScenarioId: activeId || scenarios[0]?.id,
    payload: scenarios.map(s => ({ ...s, data: { ...s.data } })),
  };

  const filename = `Tunnel_Project_All_Scenarios_${new Date().toISOString().slice(0, 10)}${STEMD_FILE_EXTENSION}`;
  downloadFile(JSON.stringify(envelope, null, 2), filename, 'application/octet-stream');
}

/**
 * Parse and validate a *.STEMD file content with robust parameter extraction
 */
export function parseStemdFile(rawContent: string): StemdFileEnvelope {
  let json: any;
  try {
    json = JSON.parse(rawContent);
  } catch (e) {
    throw new Error('فرمت فایل نامعتبر است. فایل مورد نظر باید دارای ساختار معتبر پروژه *.STEMD باشد.');
  }

  // Helper to extract or normalize ProjectScenarioData from any arbitrary object structure or casing
  const extractData = (source: any): ProjectScenarioData | null => {
    if (!source || typeof source !== 'object') return null;
    const s = source.data || source.payload?.data || source.payload || source;
    if (!s || typeof s !== 'object') return null;

    const findNum = (...keys: string[]): number | undefined => {
      for (const k of keys) {
        if (s[k] !== undefined && s[k] !== null && s[k] !== '' && !isNaN(Number(s[k]))) {
          return Number(s[k]);
        }
      }
      return undefined;
    };

    const findStr = (...keys: string[]): string | undefined => {
      for (const k of keys) {
        if (typeof s[k] === 'string' && s[k].trim().length > 0) {
          return s[k].trim();
        }
      }
      return undefined;
    };

    const hasAnyParam =
      findNum('rmr', 'RMR', 'Rmr', 'rmr89') !== undefined ||
      findNum('qValue', 'q', 'Q', 'q_value') !== undefined ||
      findNum('span', 'Span', 'B', 'b', 'spanB') !== undefined ||
      findNum('gsi', 'GSI') !== undefined ||
      findNum('ucs', 'UCS', 'sigmaCi') !== undefined ||
      findNum('rqd', 'RQD') !== undefined;

    if (!hasAnyParam && !s.span && !s.rmr && !s.qValue) {
      return null;
    }

    const gwConditionRaw = s.groundwaterCondition || s.waterCondition || s.groundwater;
    const validGw = ['dry', 'damp', 'wet', 'dripping', 'flowing'].includes(gwConditionRaw)
      ? gwConditionRaw
      : 'damp';

    const methodRaw = s.method || s.Method || s.calcMethod;
    const validMethod = ['rmr', 'q', 'both'].includes(methodRaw) ? methodRaw : 'both';

    return {
      ...(s && typeof s === 'object' ? s : {}),
      span: findNum('span', 'Span', 'B', 'b', 'spanB', 'tunnelSpan', 'diameter') ?? 5.0,
      height: findNum('height', 'Height', 'Ht', 'ht', 'tunnelHeight') ?? findNum('span', 'Span', 'B', 'b') ?? 5.0,
      depth: findNum('depth', 'Depth', 'H', 'h', 'overburden', 'overburdenDepth') ?? 250,
      rmr: findNum('rmr', 'RMR', 'Rmr', 'rmr89', 'rmrValue', 'rockMassRating') ?? 50,
      qValue: findNum('qValue', 'q', 'Q', 'q_value', 'bartonQ', 'qRating') ?? 4.0,
      esr: findNum('esr', 'ESR') ?? 1.0,
      gsi: findNum('gsi', 'GSI', 'gsiIndex') ?? 55,
      ucs: findNum('ucs', 'UCS', 'sigmaCi', 'sigmaci', 'sigma_ci', 'intactUcs') ?? 65,
      rqd: findNum('rqd', 'RQD', 'rqdPercent') ?? 75,
      unitWeight: findNum('unitWeight', 'unit_weight', 'unitWeightGamma', 'gamma', 'density') ?? 25,
      kRatio: findNum('kRatio', 'k0', 'K0', 'k_ratio', 'k') ?? 1.0,
      jointSpacing: findNum('jointSpacing', 'joint_spacing', 'spacing', 'If', 'if') ?? 0.25,
      jointSets: findNum('jointSets', 'jn', 'Jn', 'joint_sets') ?? 9,
      jr: findNum('jr', 'Jr', 'jointRoughness') ?? 2.0,
      ja: findNum('ja', 'Ja', 'jointAlteration') ?? 1.0,
      srf: findNum('srf', 'SRF', 'stressReductionFactor') ?? 1.0,
      persistence: findNum('persistence', 'Persistence') ?? 4,
      aperture: findNum('aperture', 'Aperture') ?? 4,
      roughness: findNum('roughness', 'Roughness') ?? 3,
      infillingId: findStr('infillingId', 'infilling_id', 'infilling') || 'hard_lt5',
      weathering: findNum('weathering', 'Weathering') ?? 3,
      orientationAdj: findNum('orientationAdj', 'orientation_adj') ?? -5,
      calcModeRmr: findStr('calcModeRmr', 'calcMode') === 'manual'
        ? 'manual'
        : findStr('calcModeRmr', 'calcMode') === 'components'
        ? 'components'
        : (s.persistence !== undefined || s.roughness !== undefined ? 'components' : 'manual'),
      calcModeQ: findStr('calcModeQ') === 'manual'
        ? 'manual'
        : findStr('calcModeQ') === 'components'
        ? 'components'
        : (s.srf !== undefined || s.ja !== undefined ? 'components' : 'manual'),
      mi: findNum('mi', 'Mi') ?? 12,
      dFactor: findNum('dFactor', 'd', 'D', 'disturbance') ?? 0.0,
      groundwaterCondition: validGw,
      groundwaterRmr: findNum('groundwaterRmr', 'gwRmr', 'waterRating') ?? 10,
      jw: findNum('jw', 'Jw', 'jointWater') ?? 0.66,
      pointLoadIs50: findNum('pointLoadIs50', 'is50', 'Is50', 'pointLoad') ?? 2.5,
      method: validMethod,
      fractureSpacingIf: findNum('fractureSpacingIf', 'spacingIf', 'If') ?? 0.25,
      rockDensity: findNum('rockDensity', 'rock_density') ?? 2.55,
      mainTab: ['classification', 'excavability', 'standup_time', 'support', 'rock_load', 'report'].includes(s.mainTab) ? s.mainTab : undefined,
      projectTitle: findStr('projectTitle', 'projectName', 'project_name', 'title') ?? (typeof source.name === 'string' ? source.name : undefined),
      projectName: findStr('projectTitle', 'projectName', 'project_name', 'title') ?? (typeof source.name === 'string' ? source.name : undefined),
      tunnelSection: findStr('tunnelSection', 'tunnel_section', 'section', 'chainage'),
      designerName: findStr('designerName', 'engineerName', 'engineer_name', 'author', 'designer'),
      designerTitle: findStr('designerTitle', 'designer_title', 'engineerTitle', 'company'),
      approverName: findStr('approverName', 'checkerName', 'reviewerName', 'supervisorName'),
      approverTitle: findStr('approverTitle', 'checkerTitle', 'reviewerTitle', 'supervisorTitle'),
      engineerName: findStr('designerName', 'engineerName', 'engineer_name', 'author', 'designer'),
      notes: findStr('notes', 'remarks') ?? (typeof source.description === 'string' ? source.description : undefined),
    };
  };

  // 1. Envelope format with payload
  if (json.format === 'STEMD' && json.payload) {
    if (Array.isArray(json.payload)) {
      const normalizedPayload = json.payload.map((item: any) => ({
        ...item,
        data: extractData(item) || item.data,
      }));
      return {
        ...json,
        payload: normalizedPayload,
      };
    } else {
      const normalizedData = extractData(json.payload) || json.payload.data;
      return {
        ...json,
        payload: {
          ...json.payload,
          data: normalizedData,
        },
      };
    }
  }

  // 2. Single Scenario with .data
  const scenarioData = extractData(json);
  if (scenarioData) {
    const scenario: ProjectScenario = {
      id: json.id || `imported_${Date.now()}`,
      name: json.name || json.projectName || 'پرونده واردشده (*.STEMD)',
      nameEn: json.nameEn || 'Imported Scenario (*.STEMD)',
      description: json.description || json.notes || 'واردشده از فایل مهندسی تونل',
      descriptionEn: json.descriptionEn || 'Imported from tunnel scenario file',
      isBuiltIn: false,
      createdAt: json.createdAt || Date.now(),
      updatedAt: Date.now(),
      data: scenarioData,
    };
    return {
      format: 'STEMD',
      version: '1.0',
      app: 'Tunnel Empirical Method Design',
      exportDate: new Date().toISOString(),
      type: 'single_scenario',
      activeScenarioId: scenario.id,
      payload: scenario,
    };
  }

  // 3. Array of scenarios
  if (Array.isArray(json) && json.length > 0) {
    const validItems: ProjectScenario[] = [];
    for (const item of json) {
      const d = extractData(item);
      if (d) {
        validItems.push({
          id: item.id || `imported_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: item.name || 'سناریوی واردشده',
          nameEn: item.nameEn || 'Imported Scenario',
          description: item.description || '',
          descriptionEn: item.descriptionEn || '',
          isBuiltIn: false,
          createdAt: item.createdAt || Date.now(),
          updatedAt: Date.now(),
          data: d,
        });
      }
    }
    if (validItems.length > 0) {
      return {
        format: 'STEMD',
        version: '1.0',
        app: 'Tunnel Empirical Method Design',
        exportDate: new Date().toISOString(),
        type: 'scenarios_collection',
        activeScenarioId: validItems[0].id,
        payload: validItems,
      };
    }
  }

  throw new Error('ساختار داده‌های فایل با پارامترهای مهندسی تونل همخوانی ندارد.');
}

/**
 * Import STEMD envelope and merge into localStorage
 */
export function importStemdEnvelope(envelope: StemdFileEnvelope): {
  importedScenarios: ProjectScenario[];
  activeToApply: ProjectScenario;
} {
  const currentList = loadAllScenarios();
  const importedList: ProjectScenario[] = [];

  const rawPayload = Array.isArray(envelope.payload) ? envelope.payload : [envelope.payload];

  for (const item of rawPayload) {
    const existingIndex = currentList.findIndex(s => s.id === item.id);
    const scenario: ProjectScenario = {
      ...item,
      id: item.id || `imported_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      isBuiltIn: false, // User-imported items are editable
      updatedAt: Date.now(),
      data: { ...item.data },
    };

    if (existingIndex !== -1) {
      // Overwrite/update existing scenario with the imported data!
      currentList[existingIndex] = scenario;
    } else {
      currentList.unshift(scenario);
    }
    importedList.push(scenario);
  }

  saveAllScenarios(currentList);

  const activeToApply = importedList[0];
  if (activeToApply) {
    setActiveScenarioId(activeToApply.id);
  }

  return {
    importedScenarios: importedList,
    activeToApply,
  };
}
