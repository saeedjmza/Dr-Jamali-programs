/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { calculateStandUpTime } from './utils/rmrCalculation';
import { calculateQStandUpTime, rmrToEquivalentQ } from './utils/qCalculation';
import {
  loadSavedInputs,
  saveInputs,
  clearSavedInputs,
  DEFAULT_TUNNEL_INPUTS,
} from './utils/storage';
import { ClassificationHub } from './components/classification/ClassificationHub';
import { StandupTimeHub } from './components/standup/StandupTimeHub';
import { SupportHub } from './components/support/SupportHub';
import { ExcavabilityHub } from './components/excavability/ExcavabilityHub';
import { RockLoadHub } from './components/rockload/RockLoadHub';
import { RmrParameterModal } from './components/RmrParameterModal';
import { QParameterModal } from './components/QParameterModal';
import { WindowsExeModal } from './components/WindowsExeModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { CreditsModal } from './components/CreditsModal';
import { ProjectReportHub } from './components/report/ProjectReportHub';
import { usePWAInstall } from './hooks/usePWAInstall';
import { checkGeotechnicalConsistency } from './utils/consistencyValidation';
import { GeotechnicalWarningBanner } from './components/GeotechnicalWarningBanner';
import { AppLogo } from './components/common/AppLogo';
import { ProjectProfilesModal } from './components/scenarios/ProjectProfilesModal';
import { WindowsMenuBar } from './components/desktop/WindowsMenuBar';
import { KeyboardShortcutsModal } from './components/desktop/KeyboardShortcutsModal';
import { NewScenarioModal } from './components/desktop/NewScenarioModal';
import { DesktopExitModal } from './components/desktop/DesktopExitModal';
import { QuickPasteModal } from './components/desktop/QuickPasteModal';
import {
  loadAllScenarios,
  getActiveScenarioId,
  setActiveScenarioId,
  updateScenario,
  deleteScenario,
  saveCurrentAsScenario,
  exportScenarioToStemd,
  exportAllScenariosToStemd,
  parseStemdFile,
  importStemdEnvelope,
  createSingleScenarioEnvelope,
  STEMD_FILE_EXTENSION,
  sanitizeFilename,
} from './utils/scenarioStorage';
import {
  ClassificationMethod,
  AppMainTab,
  ClassificationSubTab,
  ProjectScenario,
  ProjectScenarioData,
} from './types';
import {
  Compass,
  BookOpen,
  RotateCcw,
  Languages,
  Monitor,
  Smartphone,
  Clock,
  Sliders,
  Sparkles,
  Grid,
  Layers,
  X,
  Scale,
  Shield,
  Pickaxe,
  UserCheck,
  Mail,
  Phone,
  Award,
  Tag,
  Cpu,
  Ruler,
  FileText,
  AlertTriangle,
  Activity,
  Droplets,
  Weight,
  Heart,
  Coffee,
  MessageSquare,
  ExternalLink,
  FolderOpen,
  Save,
  Download,
  Plus,
  Undo2,
  Redo2,
  ChevronDown,
  Check,
  FilePlus,
  Keyboard,
  Maximize,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  Info,
} from 'lucide-react';
import {
  GroundwaterConditionKey,
  GROUNDWATER_CONDITIONS,
  rmrRatingToGroundwaterKey,
  jwToGroundwaterKey,
  groundwaterKeyToRmrRating,
  groundwaterKeyToJw,
} from './utils/waterConditions';
import { calculateHoekBrownParams } from './utils/gsiCalculation';

export default function App() {
  const [lang, setLang] = useState<'fa' | 'en'>(() => loadSavedInputs().lang);
  const isFa = lang === 'fa';

  // Main 2-Section Tabs: 'classification' | 'standup_time'
  const [mainTab, setMainTab] = useState<AppMainTab>(() => loadSavedInputs().mainTab);
  const [classificationSubTab, setClassificationSubTab] =
    useState<ClassificationSubTab>(() => loadSavedInputs().classificationSubTab);

  // Stand-up Time Analysis Method: 'rmr' | 'q' | 'both'
  const [method, setMethod] = useState<ClassificationMethod>(() => loadSavedInputs().method);

  // Core Geotechnical Input States
  const [span, setSpan] = useState<number>(() => loadSavedInputs().span); // Tunnel diameter / unsupported span in meters
  const [depth, setDepth] = useState<number>(() => loadSavedInputs().depth); // Tunnel overburden depth in meters
  const [rmr, setRmr] = useState<number>(() => loadSavedInputs().rmr); // Rock Mass Rating (0 - 100)
  const [qValue, setQValue] = useState<number>(() => loadSavedInputs().qValue); // Barton Q-Value (0.001 - 1000)
  const [esr, setEsr] = useState<number>(() => loadSavedInputs().esr); // Excavation Support Ratio
  const [gsi, setGsi] = useState<number>(() => loadSavedInputs().gsi); // Hoek-Brown Geological Strength Index (Independent)
  const [ucs, setUcs] = useState<number>(() => loadSavedInputs().ucs); // Intact rock uniaxial compressive strength (MPa)
  const [rqd, setRqd] = useState<number>(() => loadSavedInputs().rqd); // Rock Quality Designation (%)
  const [unitWeight, setUnitWeight] = useState<number>(() => loadSavedInputs().unitWeight); // Rock mass unit weight (kN/m3)
  const [kRatio, setKRatio] = useState<number>(() => loadSavedInputs().kRatio); // In-situ horizontal to vertical stress ratio
  const [tunnelHeight, setTunnelHeight] = useState<number>(() => loadSavedInputs().height ?? 6.0); // Tunnel height in meters
  const [jointSpacing, setJointSpacing] = useState<number>(() => loadSavedInputs().jointSpacing); // Discontinuity spacing If (m)
  const [jointSets, setJointSets] = useState<number>(() => loadSavedInputs().jointSets ?? 9); // Joint Set Number Jn (1 to 20)
  const [jr, setJr] = useState<number>(() => loadSavedInputs().jr ?? 2.0); // Joint Roughness Number Jr
  const [ja, setJa] = useState<number>(() => loadSavedInputs().ja ?? 1.0); // Joint Alteration Number Ja
  const [mi, setMi] = useState<number>(() => loadSavedInputs().mi ?? 12); // Hoek-Brown intact rock constant mi
  const [dFactor, setDFactor] = useState<number>(() => loadSavedInputs().dFactor ?? 0.0); // Disturbance factor D
  const [pointLoadIs50, setPointLoadIs50] = useState<number>(() => loadSavedInputs().pointLoadIs50); // Point load index Is50 (MPa)

  // Barton Q & Stress parameters
  const [srf, setSrf] = useState<number>(() => loadSavedInputs().srf ?? 1.0); // Stress Reduction Factor SRF
  const [calcModeQ, setCalcModeQ] = useState<'components' | 'manual'>(() => loadSavedInputs().calcModeQ ?? 'components');

  // Bieniawski RMR 1989 Sub-parameters
  const [persistence, setPersistence] = useState<number>(() => loadSavedInputs().persistence ?? 4);
  const [aperture, setAperture] = useState<number>(() => loadSavedInputs().aperture ?? 4);
  const [roughness, setRoughness] = useState<number>(() => loadSavedInputs().roughness ?? 3);
  const [infillingId, setInfillingId] = useState<string>(() => loadSavedInputs().infillingId ?? 'hard_lt5');
  const [weathering, setWeathering] = useState<number>(() => loadSavedInputs().weathering ?? 3);
  const [orientationAdj, setOrientationAdj] = useState<number>(() => loadSavedInputs().orientationAdj ?? -5);
  const [calcModeRmr, setCalcModeRmr] = useState<'components' | 'manual'>(() => loadSavedInputs().calcModeRmr ?? 'components');

  // Excavability & Discontinuity parameters
  const [fractureSpacingIf, setFractureSpacingIf] = useState<number>(() => loadSavedInputs().fractureSpacingIf ?? 0.25);
  const [rockDensity, setRockDensity] = useState<number>(() => loadSavedInputs().rockDensity ?? 2.55);

  // Project Document Metadata
  const [projectName, setProjectName] = useState<string>(() => loadSavedInputs().projectName ?? '');
  const [tunnelSection, setTunnelSection] = useState<string>(() => loadSavedInputs().tunnelSection ?? '');
  const [engineerName, setEngineerName] = useState<string>(() => loadSavedInputs().engineerName ?? '');
  const [projectTitle, setProjectTitle] = useState<string>(() => loadSavedInputs().projectTitle ?? loadSavedInputs().projectName ?? '');
  const [designerName, setDesignerName] = useState<string>(() => loadSavedInputs().designerName ?? loadSavedInputs().engineerName ?? '');
  const [designerTitle, setDesignerTitle] = useState<string>(() => loadSavedInputs().designerTitle ?? '');
  const [approverName, setApproverName] = useState<string>(() => loadSavedInputs().approverName ?? '');
  const [approverTitle, setApproverTitle] = useState<string>(() => loadSavedInputs().approverTitle ?? '');
  const [notes, setNotes] = useState<string>(() => loadSavedInputs().notes ?? '');

  // Unified Groundwater Hydrogeological Model (Bieniawski RMR Groundwater, Barton Jw, & Condition)
  const [groundwaterCondition, setGroundwaterCondition] = useState<GroundwaterConditionKey>(
    () => loadSavedInputs().groundwaterCondition ?? 'damp'
  );
  const [groundwaterRmr, setGroundwaterRmr] = useState<number>(
    () => loadSavedInputs().groundwaterRmr ?? 10
  );
  const [jw, setJw] = useState<number>(
    () => loadSavedInputs().jw ?? 0.66
  );

  // Synchronized groundwater condition handlers
  const handleUpdateGroundwaterCondition = (key: GroundwaterConditionKey) => {
    setGroundwaterCondition(key);
    setGroundwaterRmr(groundwaterKeyToRmrRating(key));
    setJw(groundwaterKeyToJw(key));
  };

  const handleUpdateGroundwaterRmr = (val: number) => {
    setGroundwaterRmr(val);
    const key = rmrRatingToGroundwaterKey(val);
    setGroundwaterCondition(key);
    setJw(groundwaterKeyToJw(key));
  };

  const handleUpdateJw = (val: number) => {
    setJw(val);
    const key = jwToGroundwaterKey(val);
    setGroundwaterCondition(key);
    setGroundwaterRmr(groundwaterKeyToRmrRating(key));
  };

  // Modals & PWA
  const [isRmrWizardOpen, setIsRmrWizardOpen] = useState<boolean>(false);
  const [isQWizardOpen, setIsQWizardOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState<boolean>(false);
  const [isExeModalOpen, setIsExeModalOpen] = useState<boolean>(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);
  const [isScenariosModalOpen, setIsScenariosModalOpen] = useState<boolean>(false);
  const [isNewScenarioOpen, setIsNewScenarioOpen] = useState<boolean>(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState<boolean>(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const { isInstallable } = usePWAInstall();

  // Desktop Window & View State
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isCompactHeader, setIsCompactHeader] = useState<boolean>(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState<boolean>(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeFileHandleRef = useRef<any>(null);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  // Active Project Scenario / Profile State (*.STEMD)
  const [activeScenario, setActiveScenario] = useState<ProjectScenario | null>(() => {
    const all = loadAllScenarios();
    const activeId = getActiveScenarioId();
    return all.find(s => s.id === activeId) || all[0] || null;
  });

  // Open Documents / Scenarios Tabs (Windows)
  const [openScenarios, setOpenScenarios] = useState<ProjectScenario[]>(() => {
    const all = loadAllScenarios();
    const activeId = getActiveScenarioId();
    const active = all.find(s => s.id === activeId) || all[0];
    const initialList = [active];
    for (const item of all.slice(0, 3)) {
      if (!initialList.some(s => s.id === item.id)) {
        initialList.push(item);
      }
    }
    return initialList;
  });

  // Current active engineering dataset snapshot
  const currentScenarioData: ProjectScenarioData = useMemo(() => ({
    span,
    height: tunnelHeight,
    depth,
    rmr,
    qValue,
    esr,
    gsi,
    ucs,
    rqd,
    unitWeight,
    kRatio,
    jointSpacing,
    jointSets,
    jr,
    ja,
    srf,
    mi,
    dFactor,
    groundwaterCondition,
    groundwaterRmr,
    jw,
    pointLoadIs50,
    method,
    persistence,
    aperture,
    roughness,
    infillingId,
    weathering,
    orientationAdj,
    calcModeRmr,
    calcModeQ,
    fractureSpacingIf,
    rockDensity,
    projectName,
    tunnelSection,
    engineerName,
    projectTitle,
    designerName,
    designerTitle,
    approverName,
    approverTitle,
    notes,
    mainTab,
    classificationSubTab,
  }), [
    span,
    tunnelHeight,
    depth,
    rmr,
    qValue,
    esr,
    gsi,
    ucs,
    rqd,
    unitWeight,
    kRatio,
    jointSpacing,
    jointSets,
    jr,
    ja,
    srf,
    mi,
    dFactor,
    groundwaterCondition,
    groundwaterRmr,
    jw,
    pointLoadIs50,
    method,
    persistence,
    aperture,
    roughness,
    infillingId,
    weathering,
    orientationAdj,
    calcModeRmr,
    calcModeQ,
    fractureSpacingIf,
    rockDensity,
    projectName,
    tunnelSection,
    engineerName,
    projectTitle,
    designerName,
    designerTitle,
    approverName,
    approverTitle,
    notes,
    mainTab,
    classificationSubTab,
  ]);

  // Undo / Redo Stacks for parameters
  const [undoStack, setUndoStack] = useState<ProjectScenarioData[]>([]);
  const [redoStack, setRedoStack] = useState<ProjectScenarioData[]>([]);

  // Apply a data snapshot to all engineering state variables
  const applyScenarioDataSnapshot = (data: ProjectScenarioData) => {
    if (!data) return;
    if (typeof data.span === 'number' && !isNaN(data.span)) setSpan(Number(data.span));
    if (typeof data.height === 'number' && !isNaN(data.height)) setTunnelHeight(Number(data.height));
    if (typeof data.depth === 'number' && !isNaN(data.depth)) setDepth(Number(data.depth));
    if (typeof data.rmr === 'number' && !isNaN(data.rmr)) setRmr(Number(data.rmr));
    if (typeof data.qValue === 'number' && !isNaN(data.qValue)) setQValue(Number(data.qValue));
    if (typeof data.esr === 'number' && !isNaN(data.esr)) setEsr(Number(data.esr));
    if (typeof data.gsi === 'number' && !isNaN(data.gsi)) setGsi(Number(data.gsi));
    if (typeof data.ucs === 'number' && !isNaN(data.ucs)) setUcs(Number(data.ucs));
    if (typeof data.rqd === 'number' && !isNaN(data.rqd)) setRqd(Number(data.rqd));
    if (typeof data.unitWeight === 'number' && !isNaN(data.unitWeight)) setUnitWeight(Number(data.unitWeight));
    if (typeof data.kRatio === 'number' && !isNaN(data.kRatio)) setKRatio(Number(data.kRatio));
    if (typeof data.jointSpacing === 'number' && !isNaN(data.jointSpacing)) setJointSpacing(Number(data.jointSpacing));
    if (typeof data.jointSets === 'number' && !isNaN(data.jointSets)) setJointSets(Number(data.jointSets));
    if (typeof data.jr === 'number' && !isNaN(data.jr)) setJr(Number(data.jr));
    if (typeof data.ja === 'number' && !isNaN(data.ja)) setJa(Number(data.ja));
    if (typeof data.srf === 'number' && !isNaN(data.srf)) setSrf(Number(data.srf));
    if (typeof data.mi === 'number' && !isNaN(data.mi)) setMi(Number(data.mi));
    if (typeof data.dFactor === 'number' && !isNaN(data.dFactor)) setDFactor(Number(data.dFactor));
    if (typeof data.pointLoadIs50 === 'number' && !isNaN(data.pointLoadIs50)) setPointLoadIs50(Number(data.pointLoadIs50));
    if (data.groundwaterCondition) setGroundwaterCondition(data.groundwaterCondition);
    if (typeof data.groundwaterRmr === 'number' && !isNaN(data.groundwaterRmr)) setGroundwaterRmr(Number(data.groundwaterRmr));
    if (typeof data.jw === 'number' && !isNaN(data.jw)) setJw(Number(data.jw));
    if (data.method) {
      setMethod(data.method);
    }
    if (typeof data.persistence === 'number' && !isNaN(data.persistence)) setPersistence(Number(data.persistence));
    if (typeof data.aperture === 'number' && !isNaN(data.aperture)) setAperture(Number(data.aperture));
    if (typeof data.roughness === 'number' && !isNaN(data.roughness)) setRoughness(Number(data.roughness));
    if (data.infillingId) setInfillingId(data.infillingId);
    if (typeof data.weathering === 'number' && !isNaN(data.weathering)) setWeathering(Number(data.weathering));
    if (typeof data.orientationAdj === 'number' && !isNaN(data.orientationAdj)) setOrientationAdj(Number(data.orientationAdj));
    if (data.calcModeRmr) setCalcModeRmr(data.calcModeRmr);
    if (data.calcModeQ) setCalcModeQ(data.calcModeQ);
    if (typeof data.fractureSpacingIf === 'number' && !isNaN(data.fractureSpacingIf)) setFractureSpacingIf(Number(data.fractureSpacingIf));
    if (typeof data.rockDensity === 'number' && !isNaN(data.rockDensity)) setRockDensity(Number(data.rockDensity));
    if (typeof data.projectName === 'string') setProjectName(data.projectName);
    if (typeof data.tunnelSection === 'string') setTunnelSection(data.tunnelSection);
    if (typeof data.engineerName === 'string') setEngineerName(data.engineerName);
    if (typeof data.projectTitle === 'string') setProjectTitle(data.projectTitle);
    if (typeof data.designerName === 'string') setDesignerName(data.designerName);
    if (typeof data.designerTitle === 'string') setDesignerTitle(data.designerTitle);
    if (typeof data.approverName === 'string') setApproverName(data.approverName);
    if (typeof data.approverTitle === 'string') setApproverTitle(data.approverTitle);
    if (typeof data.notes === 'string') setNotes(data.notes);
    if (data.mainTab) setMainTab(data.mainTab);
    if (data.classificationSubTab) setClassificationSubTab(data.classificationSubTab);
  };

  // Push snapshot to undo stack
  const pushUndoSnapshot = (data: ProjectScenarioData) => {
    setUndoStack(prev => [...prev.slice(-30), data]);
    setRedoStack([]);
  };

  // Undo action
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prevSnapshot = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, prev.length - 1));
    setRedoStack(prev => [...prev, currentScenarioData]);
    applyScenarioDataSnapshot(prevSnapshot);
    showToast(isFa ? 'واگرد انجام شد (Undo)' : 'Undo applied');
  };

  // Redo action
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextSnapshot = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, prev.length - 1));
    setUndoStack(prev => [...prev, currentScenarioData]);
    applyScenarioDataSnapshot(nextSnapshot);
    showToast(isFa ? 'ازنو انجام شد (Redo)' : 'Redo applied');
  };

  // Handler to load and activate a chosen scenario
  const handleApplyScenario = (scenario: ProjectScenario) => {
    pushUndoSnapshot(currentScenarioData);
    applyScenarioDataSnapshot(scenario.data);
    setActiveScenario(scenario);
    setActiveScenarioId(scenario.id);
  };

  // Select scenario with automatic tab addition
  const handleSelectScenarioWithTabs = (scenario: ProjectScenario) => {
    handleApplyScenario(scenario);
    setOpenScenarios(prev => {
      if (!prev.some(s => s.id === scenario.id)) {
        return [...prev, scenario];
      }
      return prev;
    });
  };

  // Close open scenario tab
  const handleCloseOpenScenario = (scenarioId: string) => {
    if (openScenarios.length <= 1) {
      showToast(isFa ? 'حداقل یک پرونده باید باز بماند.' : 'At least one document must remain open.');
      return;
    }

    const nextOpen = openScenarios.filter(s => s.id !== scenarioId);
    setOpenScenarios(nextOpen);

    if (activeScenario?.id === scenarioId) {
      const fallback = nextOpen[0];
      handleApplyScenario(fallback);
      showToast(isFa ? `پرونده بسته شد و به «${fallback.name}» منتقل شدید.` : `Switched to "${fallback.nameEn || fallback.name}".`);
    }
  };

  // Next / Previous Window (Ctrl+Tab / Ctrl+Shift+Tab)
  const handleNextWindow = () => {
    if (openScenarios.length <= 1) return;
    const currentIdx = openScenarios.findIndex(s => s.id === activeScenario?.id);
    const nextIdx = (currentIdx + 1) % openScenarios.length;
    handleApplyScenario(openScenarios[nextIdx]);
    showToast(isFa ? `پرونده: ${openScenarios[nextIdx].name}` : `Active: ${openScenarios[nextIdx].nameEn || openScenarios[nextIdx].name}`);
  };

  const handlePrevWindow = () => {
    if (openScenarios.length <= 1) return;
    const currentIdx = openScenarios.findIndex(s => s.id === activeScenario?.id);
    const prevIdx = (currentIdx - 1 + openScenarios.length) % openScenarios.length;
    handleApplyScenario(openScenarios[prevIdx]);
    showToast(isFa ? `پرونده: ${openScenarios[prevIdx].name}` : `Active: ${openScenarios[prevIdx].nameEn || openScenarios[prevIdx].name}`);
  };

  // Helper to write scenario directly to a FileSystemFileHandle
  const writeScenarioToFileHandle = async (handle: any, scenario: ProjectScenario) => {
    const envelope = createSingleScenarioEnvelope(scenario);
    const json = JSON.stringify(envelope, null, 2);
    const writable = await handle.createWritable();
    await writable.write(json);
    await writable.close();
  };

  // Save current scenario in-place (Ctrl+S) - Standard Windows behavior: writes to current open file without triggering downloads
  const handleSaveCurrentScenario = async () => {
    if (!activeScenario) return;

    // Update scenario in memory and storage
    let updated = updateScenario(activeScenario.id, {
      data: currentScenarioData,
    });

    if (!updated) {
      updated = saveCurrentAsScenario(
        `${activeScenario.name} (ویرایش‌شده)`,
        activeScenario.description || '',
        currentScenarioData,
        `${activeScenario.nameEn || activeScenario.name} (Custom)`
      );
    }

    if (updated) {
      setActiveScenario(updated);
      setOpenScenarios(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    }

    const scenarioToSave: ProjectScenario = updated || {
      ...activeScenario,
      data: currentScenarioData,
      updatedAt: Date.now(),
    };

    // If an active disk file handle is bound, write directly to that file
    if (activeFileHandleRef.current) {
      try {
        await writeScenarioToFileHandle(activeFileHandleRef.current, scenarioToSave);
        showToast(
          isFa
            ? `تغییرات در فایل جاری «${activeFileName || scenarioToSave.name}» روی دیسک ذخیره شد.`
            : `Changes saved in-place to ${activeFileName || scenarioToSave.name}.`
        );
        return;
      } catch (err: any) {
        console.warn('Failed in-place write to handle, prompting Save As:', err);
      }
    }

    // If no disk file handle is bound and File System Access API is supported, prompt Save As so user chooses location
    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      await handleSaveAsScenario();
      return;
    }

    // Fallback: scenario is saved in internal storage without unwanted browser downloads
    showToast(
      isFa
        ? `سناریوی «${scenarioToSave.name}» در سامانه ذخیره گردید (بدون دانلود مکرر).`
        : `Scenario "${scenarioToSave.name}" saved in-place.`
    );
  };

  // Save As (Ctrl+Shift+S) - Standard Windows Save As dialog with custom directory & filename
  const handleSaveAsScenario = async () => {
    if (!activeScenario) return;

    const baseName = sanitizeFilename(activeFileName ? activeFileName.replace(/\.stemd$/i, '') : activeScenario.name || 'Tunnel_Scenario');
    const defaultFilename = `${baseName}${STEMD_FILE_EXTENSION}`;

    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: defaultFilename,
          types: [
            {
              description: 'STEMD Tunnel Project File (*.stemd)',
              accept: {
                'application/octet-stream': [STEMD_FILE_EXTENSION],
                'application/x-stemd': [STEMD_FILE_EXTENSION],
              },
            },
          ],
        });

        const newName = handle.name.replace(/\.stemd$/i, '');
        const scenarioToSave: ProjectScenario = {
          id: `scen-${Date.now()}`,
          name: newName,
          nameEn: newName,
          createdAt: typeof activeScenario.createdAt === 'number' ? activeScenario.createdAt : Date.now(),
          updatedAt: Date.now(),
          isBuiltIn: false,
          description: activeScenario.description || 'Saved project scenario',
          data: currentScenarioData,
        };

        await writeScenarioToFileHandle(handle, scenarioToSave);
        activeFileHandleRef.current = handle;
        setActiveFileName(handle.name);

        const created = saveCurrentAsScenario(
          scenarioToSave.name,
          scenarioToSave.description || '',
          scenarioToSave.data,
          scenarioToSave.nameEn
        );

        setActiveScenario(created);
        setOpenScenarios(prev => {
          const exists = prev.some(s => s.id === created.id);
          return exists ? prev.map(s => (s.id === created.id ? created : s)) : [...prev, created];
        });

        showToast(
          isFa
            ? `پرونده در مسیر انتخابی با نام «${handle.name}» ذخیره شد و متصل گردید.`
            : `File saved to disk as "${handle.name}". Subsequent saves will write directly to this file.`
        );
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          return; // User cancelled the save dialog
        }
        console.warn('showSaveFilePicker error:', err);
      }
    }

    // Fallback modal for browsers that don't support File System Access API
    setIsNewScenarioOpen(true);
  };

  // Export current as *.STEMD
  const handleExportCurrentStemd = () => {
    if (!activeScenario) return;
    const scenarioToExport: ProjectScenario = {
      ...activeScenario,
      data: currentScenarioData,
    };
    exportScenarioToStemd(scenarioToExport);
    showToast(isFa ? `خروجی پرونده «${activeScenario.name}.stemd» با مقادیر جاری دریافت شد.` : `Exported "${activeScenario.name}.stemd" with current values.`);
  };

  // Export all as *.STEMD
  const handleExportAllStemd = () => {
    const all = loadAllScenarios();
    const updatedAll = all.map(s => (s.id === activeScenario?.id ? { ...s, data: currentScenarioData } : s));
    exportAllScenariosToStemd(updatedAll, activeScenario?.id);
    showToast(isFa ? 'نسخه پشتیبان کلیه سناریوها با داده‌های جاری صادر شد.' : 'Exported all scenarios backup with current parameters.');
  };

  // Open *.STEMD File Picker (Ctrl+O) - Uses native Windows Open dialog if supported
  const handleOpenFilePicker = async () => {
    if (typeof window !== 'undefined' && 'showOpenFilePicker' in window) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: 'STEMD Tunnel Project File (*.stemd)',
              accept: {
                'application/octet-stream': [STEMD_FILE_EXTENSION],
                'application/x-stemd': [STEMD_FILE_EXTENSION],
              },
            },
          ],
        });

        const file = await handle.getFile();
        if (file.name && !file.name.toLowerCase().endsWith('.stemd')) {
          showToast(
            isFa
              ? 'فقط و فقط فایل‌های پروژه با پسوند *.stemd مجاز هستند.'
              : 'Only project files with *.stemd extension are supported.'
          );
          return;
        }

        const content = await file.text();
        const parsed = parseStemdFile(content);
        if (!parsed) {
          showToast(isFa ? 'فرمت فایل *.STEMD نامعتبر است.' : 'Invalid *.STEMD file format.');
          return;
        }

        const importResult = importStemdEnvelope(parsed);
        const importedList = importResult.importedScenarios;
        const activeToApply = importResult.activeToApply || importedList[0];

        if (activeToApply) {
          activeFileHandleRef.current = handle;
          setActiveFileName(handle.name);
          handleApplyScenario(activeToApply);
          saveInputs({
            ...activeToApply.data,
            mainTab,
            classificationSubTab,
            lang,
          });
          setOpenScenarios(prev => {
            const next = [...prev];
            for (const item of importedList) {
              if (!next.some(s => s.id === item.id)) {
                next.push(item);
              }
            }
            return next;
          });
          showToast(
            isFa
              ? `فایل «${handle.name}» باز شد و به پرونده متصل گردید (Save بعدی مستقیماً روی همین فایل اعمال می‌شود).`
              : `Opened "${handle.name}". Subsequent saves will update this file directly.`
          );
          return;
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          return;
        }
        console.warn('showOpenFilePicker error, falling back to input:', err);
      }
    }

    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.stemd')) {
      showToast(
        isFa
          ? 'فقط و فقط فایل‌های پروژه با پسوند *.stemd مجاز و قابل بارگذاری هستند.'
          : 'Only project files with *.stemd extension can be loaded.'
      );
      if (e.target) e.target.value = '';
      return;
    }

    setActiveFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseStemdFile(content);
        if (!parsed) {
          showToast(isFa ? 'فرمت فایل *.STEMD نامعتبر است.' : 'Invalid *.STEMD file format.');
          return;
        }

        const importResult = importStemdEnvelope(parsed);
        const importedList = importResult.importedScenarios;
        const activeToApply = importResult.activeToApply || importedList[0];

        if (activeToApply) {
          handleApplyScenario(activeToApply);
          saveInputs({
            ...activeToApply.data,
            mainTab,
            classificationSubTab,
            lang,
          });
          setOpenScenarios(prev => {
            const next = [...prev];
            for (const item of importedList) {
              if (!next.some(s => s.id === item.id)) {
                next.push(item);
              }
            }
            return next;
          });
          showToast(
            isFa
              ? `پرونده «${activeToApply.name}» با موفقیت فراخوانی شد و تمام پارامترهای ورودی (دهانه=${activeToApply.data.span}m | RMR=${activeToApply.data.rmr} | Q=${activeToApply.data.qValue} | UCS=${activeToApply.data.ucs}MPa) در پروژه اعمال گردید.`
              : `Loaded "${activeToApply.nameEn || activeToApply.name}" and applied all input parameters.`
          );
        }
      } catch (err: any) {
        showToast(isFa ? (err?.message || 'خطا در بارگذاری فایل *.STEMD') : 'Error loading *.STEMD file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // New Scenario Created
  const handleScenarioCreated = (newScenario: ProjectScenario) => {
    handleApplyScenario(newScenario);
    setOpenScenarios(prev => [newScenario, ...prev]);
    exportScenarioToStemd(newScenario);
    showToast(isFa ? `پرونده «${newScenario.name}» ایجاد و فایل *.stemd صادر گردید.` : `Created & exported "${newScenario.nameEn || newScenario.name}".`);
  };

  // Copy parameters to clipboard (Ctrl+C)
  const handleCopyParameters = async () => {
    try {
      const payload = {
        scenarioName: activeScenario?.name || 'Current Configuration',
        exportDate: new Date().toISOString(),
        data: currentScenarioData,
      };
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      showToast(isFa ? 'مشخصات ژئوتکنیکی در حافظه کپی شد (Ctrl+C)' : 'Parameters copied to clipboard (Ctrl+C)');
    } catch {
      showToast(isFa ? 'کپی ناموفق بود' : 'Failed to copy to clipboard');
    }
  };

  // Cut parameters (Ctrl+X)
  const handleCutParameters = async () => {
    pushUndoSnapshot(currentScenarioData);
    await handleCopyParameters();
    handleResetAll();
    showToast(isFa ? 'مشخصات برش داده شده و ورودی‌ها بازنشانی شدند (Ctrl+X)' : 'Parameters cut & inputs reset (Ctrl+X)');
  };

  // Paste parameters (Ctrl+V)
  const applyPartialParameters = (source: Partial<ProjectScenarioData>) => {
    if (typeof source.span === 'number') setSpan(source.span);
    if (typeof source.height === 'number') setTunnelHeight(source.height);
    if (typeof source.depth === 'number') setDepth(source.depth);
    if (typeof source.rmr === 'number') setRmr(source.rmr);
    if (typeof source.qValue === 'number') setQValue(source.qValue);
    if (typeof source.esr === 'number') setEsr(source.esr);
    if (typeof source.gsi === 'number') setGsi(source.gsi);
    if (typeof source.ucs === 'number') setUcs(source.ucs);
    if (typeof source.rqd === 'number') setRqd(source.rqd);
    if (typeof source.unitWeight === 'number') setUnitWeight(source.unitWeight);
    if (typeof source.kRatio === 'number') setKRatio(source.kRatio);
    if (typeof source.jointSpacing === 'number') setJointSpacing(source.jointSpacing);
    if (typeof source.jointSets === 'number') setJointSets(source.jointSets);
    if (typeof source.jr === 'number') setJr(source.jr);
    if (typeof source.ja === 'number') setJa(source.ja);
    if (typeof source.srf === 'number') setSrf(source.srf);
    if (typeof source.mi === 'number') setMi(source.mi);
    if (typeof source.dFactor === 'number') setDFactor(source.dFactor);
    if (source.groundwaterCondition) handleUpdateGroundwaterCondition(source.groundwaterCondition);
    if (typeof source.groundwaterRmr === 'number') handleUpdateGroundwaterRmr(source.groundwaterRmr);
    if (typeof source.jw === 'number') handleUpdateJw(source.jw);
    if (typeof source.pointLoadIs50 === 'number') setPointLoadIs50(source.pointLoadIs50);
    if (source.method) setMethod(source.method);
    if (typeof source.persistence === 'number') setPersistence(source.persistence);
    if (typeof source.aperture === 'number') setAperture(source.aperture);
    if (typeof source.roughness === 'number') setRoughness(source.roughness);
    if (source.infillingId) setInfillingId(source.infillingId);
    if (typeof source.weathering === 'number') setWeathering(source.weathering);
    if (typeof source.orientationAdj === 'number') setOrientationAdj(source.orientationAdj);
    if (source.calcModeRmr) setCalcModeRmr(source.calcModeRmr);
    if (source.calcModeQ) setCalcModeQ(source.calcModeQ);
    if (typeof source.fractureSpacingIf === 'number') setFractureSpacingIf(source.fractureSpacingIf);
    if (typeof source.rockDensity === 'number') setRockDensity(source.rockDensity);
    if (typeof source.projectName === 'string') setProjectName(source.projectName);
    if (typeof source.tunnelSection === 'string') setTunnelSection(source.tunnelSection);
    if (typeof source.engineerName === 'string') setEngineerName(source.engineerName);
    if (typeof source.notes === 'string') setNotes(source.notes);
  };

  const handlePasteParameters = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim().startsWith('{')) {
        const parsed = JSON.parse(text);
        const source = parsed.data || parsed.payload?.data || parsed;
        pushUndoSnapshot(currentScenarioData);
        applyPartialParameters(source);
        showToast(isFa ? 'مشخصات ژئوتکنیکی از حافظه جایگذاری شد (Ctrl+V)' : 'Parameters pasted from clipboard (Ctrl+V)');
        return;
      }
    } catch {
      // If clipboard permission denied, open manual paste dialog
    }
    setIsPasteModalOpen(true);
  };

  // Delete current active scenario
  const handleDeleteCurrentScenario = () => {
    if (!activeScenario) return;
    if (activeScenario.isBuiltIn) {
      showToast(isFa ? 'سناریوهای استاندارد مرجع سیستم محافظت‌شده بوده و قابل حذف نیستند.' : 'Standard benchmark scenarios are protected.');
      return;
    }

    const success = deleteScenario(activeScenario.id);
    if (success) {
      const all = loadAllScenarios();
      const fallback = all[0];
      setOpenScenarios(prev => prev.filter(s => s.id !== activeScenario.id));
      handleApplyScenario(fallback);
      showToast(isFa ? `سناریوی «${activeScenario.name}» حذف گردید.` : `Deleted "${activeScenario.name}".`);
    }
  };

  // View Zoom Handlers
  const handleZoomIn = () => {
    setZoomPercent(prev => Math.min(140, prev + 10));
    showToast(isFa ? `بزرگ‌نمایی: ${Math.min(140, zoomPercent + 10)}٪` : `Zoom: ${Math.min(140, zoomPercent + 10)}%`);
  };

  const handleZoomOut = () => {
    setZoomPercent(prev => Math.max(75, prev - 10));
    showToast(isFa ? `کوچک‌نمایی: ${Math.max(75, zoomPercent - 10)}٪` : `Zoom: ${Math.max(75, zoomPercent - 10)}%`);
  };

  const handleResetZoom = () => {
    setZoomPercent(100);
    showToast(isFa ? 'اندازه استاندارد ۱۰۰٪' : 'Zoom reset to 100%');
  };

  // Full Screen Toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Sync fullscreen change state
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Global Keyboard Shortcuts (Ctrl+N, Ctrl+O, Ctrl+S, Ctrl+Shift+S, Ctrl+P, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // F1 -> Help / About
      if (e.key === 'F1') {
        e.preventDefault();
        setIsAboutOpen(true);
        return;
      }

      // F11 -> Full Screen
      if (e.key === 'F11') {
        e.preventDefault();
        handleToggleFullscreen();
        return;
      }

      if (isCtrlOrCmd) {
        // Ctrl + Z -> Undo
        if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
          if (!isInput) {
            e.preventDefault();
            handleUndo();
            return;
          }
        }

        // Ctrl + Y or Ctrl + Shift + Z -> Redo
        if ((e.key.toLowerCase() === 'y' && !e.shiftKey) || (e.key.toLowerCase() === 'z' && e.shiftKey)) {
          if (!isInput) {
            e.preventDefault();
            handleRedo();
            return;
          }
        }

        // Ctrl + S -> Save
        if (e.key.toLowerCase() === 's' && !e.shiftKey) {
          e.preventDefault();
          handleSaveCurrentScenario();
          return;
        }

        // Ctrl + Shift + S -> Save As
        if (e.key.toLowerCase() === 's' && e.shiftKey) {
          e.preventDefault();
          setIsNewScenarioOpen(true);
          return;
        }

        // Ctrl + O -> Open File
        if (e.key.toLowerCase() === 'o') {
          e.preventDefault();
          handleOpenFilePicker();
          return;
        }

        // Ctrl + N -> New Scenario
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          setIsNewScenarioOpen(true);
          return;
        }

        // Ctrl + P -> Results Report
        if (e.key.toLowerCase() === 'p') {
          e.preventDefault();
          setMainTab('report');
          return;
        }

        // Ctrl + M -> Minimize / Compact Header
        if (e.key.toLowerCase() === 'm') {
          e.preventDefault();
          setIsCompactHeader(prev => !prev);
          return;
        }

        // Ctrl + Tab -> Next Window
        if (e.key === 'Tab' && !e.shiftKey) {
          e.preventDefault();
          handleNextWindow();
          return;
        }

        // Ctrl + Shift + Tab -> Prev Window
        if (e.key === 'Tab' && e.shiftKey) {
          e.preventDefault();
          handlePrevWindow();
          return;
        }

        // Ctrl + W -> Close Window (when not editing an input)
        if (e.key.toLowerCase() === 'w' && !isInput) {
          e.preventDefault();
          if (activeScenario) {
            handleCloseOpenScenario(activeScenario.id);
          }
          return;
        }

        // Ctrl + + / Ctrl + = -> Zoom In
        if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          handleZoomIn();
          return;
        }

        // Ctrl + - -> Zoom Out
        if (e.key === '-') {
          e.preventDefault();
          handleZoomOut();
          return;
        }

        // Ctrl + 0 -> Reset Zoom
        if (e.key === '0') {
          e.preventDefault();
          handleResetZoom();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeScenario, openScenarios, zoomPercent]);

  // Auto-save input parameters to localStorage across refreshes
  useEffect(() => {
    saveInputs({
      span,
      height: tunnelHeight,
      depth,
      rmr,
      qValue,
      esr,
      gsi,
      ucs,
      rqd,
      unitWeight,
      kRatio,
      jointSpacing,
      jointSets,
      jr,
      ja,
      srf,
      mi,
      dFactor,
      groundwaterCondition,
      groundwaterRmr,
      jw,
      pointLoadIs50,
      method,
      persistence,
      aperture,
      roughness,
      infillingId,
      weathering,
      orientationAdj,
      calcModeRmr,
      calcModeQ,
      fractureSpacingIf,
      rockDensity,
      projectName,
      tunnelSection,
      engineerName,
      projectTitle,
      designerName,
      designerTitle,
      approverName,
      approverTitle,
      notes,
      mainTab,
      classificationSubTab,
      lang,
    });
  }, [
    span,
    tunnelHeight,
    depth,
    rmr,
    qValue,
    esr,
    gsi,
    ucs,
    rqd,
    unitWeight,
    kRatio,
    jointSpacing,
    jointSets,
    jr,
    ja,
    srf,
    mi,
    dFactor,
    groundwaterCondition,
    groundwaterRmr,
    jw,
    pointLoadIs50,
    method,
    persistence,
    aperture,
    roughness,
    infillingId,
    weathering,
    orientationAdj,
    calcModeRmr,
    calcModeQ,
    fractureSpacingIf,
    rockDensity,
    projectName,
    tunnelSection,
    engineerName,
    projectTitle,
    designerName,
    designerTitle,
    approverName,
    approverTitle,
    notes,
    mainTab,
    classificationSubTab,
    lang,
  ]);

  // Reactive calculations for Hoek-Brown rock mass parameters from GSI & intact UCS (σci)
  const hoekBrownParams = useMemo(() => {
    return calculateHoekBrownParams(gsi, ucs, mi, dFactor);
  }, [gsi, ucs, mi, dFactor]);

  // Reactive calculations for stand-up time
  const rmrResult = useMemo(() => {
    return calculateStandUpTime(span, rmr);
  }, [span, rmr]);

  const qResult = useMemo(() => {
    return calculateQStandUpTime(span, qValue, esr);
  }, [span, qValue, esr]);

  // Reactive Geotechnical Parameter Consistency Validation
  const consistencyReport = useMemo(() => {
    return checkGeotechnicalConsistency(rmr, gsi, qValue);
  }, [rmr, gsi, qValue]);

  // Sync handler when applying presets
  const handleSelectPreset = (
    pSpan: number,
    pRmr: number,
    pQ?: number,
    pEsr?: number,
    pGsi?: number
  ) => {
    setSpan(pSpan);
    setRmr(pRmr);
    setCalcModeRmr('manual');
    setGsi(pGsi !== undefined ? pGsi : Math.max(5, pRmr - 5));
    if (pQ !== undefined) {
      setQValue(pQ);
    } else {
      setQValue(rmrToEquivalentQ(pRmr));
    }
    setCalcModeQ('manual');
    if (pEsr !== undefined) {
      setEsr(pEsr);
    }
  };

  const handleResetAll = () => {
    pushUndoSnapshot(currentScenarioData);
    clearSavedInputs();
    setSpan(DEFAULT_TUNNEL_INPUTS.span);
    setTunnelHeight(DEFAULT_TUNNEL_INPUTS.height);
    setDepth(DEFAULT_TUNNEL_INPUTS.depth);
    setRmr(DEFAULT_TUNNEL_INPUTS.rmr);
    setQValue(DEFAULT_TUNNEL_INPUTS.qValue);
    setEsr(DEFAULT_TUNNEL_INPUTS.esr);
    setGsi(DEFAULT_TUNNEL_INPUTS.gsi);
    setUcs(DEFAULT_TUNNEL_INPUTS.ucs);
    setRqd(DEFAULT_TUNNEL_INPUTS.rqd);
    setUnitWeight(DEFAULT_TUNNEL_INPUTS.unitWeight);
    setKRatio(DEFAULT_TUNNEL_INPUTS.kRatio);
    setJointSpacing(DEFAULT_TUNNEL_INPUTS.jointSpacing);
    setJointSets(DEFAULT_TUNNEL_INPUTS.jointSets);
    setJr(DEFAULT_TUNNEL_INPUTS.jr);
    setJa(DEFAULT_TUNNEL_INPUTS.ja);
    setSrf(DEFAULT_TUNNEL_INPUTS.srf);
    setMi(DEFAULT_TUNNEL_INPUTS.mi);
    setDFactor(DEFAULT_TUNNEL_INPUTS.dFactor);
    setGroundwaterCondition(DEFAULT_TUNNEL_INPUTS.groundwaterCondition);
    setGroundwaterRmr(DEFAULT_TUNNEL_INPUTS.groundwaterRmr);
    setJw(DEFAULT_TUNNEL_INPUTS.jw);
    setPointLoadIs50(DEFAULT_TUNNEL_INPUTS.pointLoadIs50);
    setPersistence(DEFAULT_TUNNEL_INPUTS.persistence);
    setAperture(DEFAULT_TUNNEL_INPUTS.aperture);
    setRoughness(DEFAULT_TUNNEL_INPUTS.roughness);
    setInfillingId(DEFAULT_TUNNEL_INPUTS.infillingId);
    setWeathering(DEFAULT_TUNNEL_INPUTS.weathering);
    setOrientationAdj(DEFAULT_TUNNEL_INPUTS.orientationAdj);
    setCalcModeRmr(DEFAULT_TUNNEL_INPUTS.calcModeRmr);
    setCalcModeQ(DEFAULT_TUNNEL_INPUTS.calcModeQ);
    setFractureSpacingIf(DEFAULT_TUNNEL_INPUTS.fractureSpacingIf);
    setRockDensity(DEFAULT_TUNNEL_INPUTS.rockDensity);
    setProjectName(DEFAULT_TUNNEL_INPUTS.projectName);
    setTunnelSection(DEFAULT_TUNNEL_INPUTS.tunnelSection);
    setEngineerName(DEFAULT_TUNNEL_INPUTS.engineerName);
    setNotes(DEFAULT_TUNNEL_INPUTS.notes);
    setMethod(DEFAULT_TUNNEL_INPUTS.method);
    setMainTab(DEFAULT_TUNNEL_INPUTS.mainTab);
    setClassificationSubTab(DEFAULT_TUNNEL_INPUTS.classificationSubTab);
  };

  return (
    <div
      dir={isFa ? 'rtl' : 'ltr'}
      style={zoomPercent !== 100 ? { zoom: `${zoomPercent}%` } : undefined}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200"
    >
      {/* Hidden File Input for Open (*.STEMD) */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".stemd"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Windows Standard Title Bar, Menu Bar & Main Navigation Tabs */}
      <WindowsMenuBar
        isFa={isFa}
        activeScenario={activeScenario}
        activeFileName={activeFileName}
        openScenarios={openScenarios}
        zoomPercent={zoomPercent}
        isFullscreen={isFullscreen}
        isCompactHeader={isCompactHeader}
        onNewScenario={() => setIsNewScenarioOpen(true)}
        onOpenFilePicker={handleOpenFilePicker}
        onSaveCurrentScenario={handleSaveCurrentScenario}
        onSaveAsScenario={handleSaveAsScenario}
        onExportCurrentStemd={handleExportCurrentStemd}
        onExportAllStemd={handleExportAllStemd}
        onOpenReport={() => setMainTab('report')}
        onExitApp={() => setIsExitModalOpen(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onCopyParameters={handleCopyParameters}
        onCutParameters={handleCutParameters}
        onPasteParameters={handlePasteParameters}
        onDeleteCurrentScenario={handleDeleteCurrentScenario}
        onResetDefaults={handleResetAll}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onToggleFullscreen={handleToggleFullscreen}
        onToggleCompactHeader={() => setIsCompactHeader(prev => !prev)}
        onSelectScenario={handleSelectScenarioWithTabs}
        onCloseOpenScenario={handleCloseOpenScenario}
        onNextWindow={handleNextWindow}
        onPrevWindow={handlePrevWindow}
        onOpenManageScenarios={() => setIsScenariosModalOpen(true)}
        onOpenAbout={() => setIsCreditsOpen(true)}
        onOpenReferences={() => setIsAboutOpen(true)}
        onOpenExeModal={() => setIsExeModalOpen(true)}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsOpen(true)}
        mainTab={mainTab}
        onSelectMainTab={setMainTab}
        rmr={rmr}
        qValue={qValue}
        gsi={gsi}
        rqd={rqd}
        span={span}
        consistencyReport={consistencyReport}
        onToggleLang={() => setLang(isFa ? 'en' : 'fa')}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Geotechnical Inconsistency Alert Banner (when RMR, GSI, or Q conflict) */}
        {consistencyReport.hasConflict && (
          <GeotechnicalWarningBanner
            report={consistencyReport}
            currentRmr={rmr}
            currentGsi={gsi}
            currentQ={qValue}
            onSyncGsiFromRmr={(newGsi) => setGsi(newGsi)}
            onSyncRmrFromGsi={(newRmr) => setRmr(newRmr)}
            onSyncQFromRmr={(newQ) => setQValue(newQ)}
            onSyncQFromGsi={(newQ) => setQValue(newQ)}
            onSyncRmrFromQ={(newRmr) => setRmr(newRmr)}
            onSyncGsiFromQ={(newGsi) => setGsi(newGsi)}
            onSyncAllToRmr={() => {
              setGsi(consistencyReport.expectedGsiFromRmr);
              setQValue(consistencyReport.expectedQFromRmr);
            }}
            lang={lang}
          />
        )}
        {/* SECTION 1: طبقه‌بندی مهندسی سنگ (RMR, Q, GSI) */}
        {mainTab === 'classification' && (
          <ClassificationHub
            activeSubTab={classificationSubTab}
            onSelectSubTab={setClassificationSubTab}
            currentRmr={rmr}
            currentQ={qValue}
            currentGsi={gsi}
            currentRqd={rqd}
            currentSpan={span}
            currentEsr={esr}
            currentDepth={depth}
            currentUcs={ucs}
            currentJointSpacing={jointSpacing}
            currentJointSets={jointSets}
            currentMi={mi}
            currentDFactor={dFactor}
            currentJr={jr}
            currentJa={ja}
            currentSrf={srf}
            currentCalcModeQ={calcModeQ}
            currentPersistence={persistence}
            currentAperture={aperture}
            currentRoughness={roughness}
            currentInfillingId={infillingId}
            currentWeathering={weathering}
            currentOrientationAdj={orientationAdj}
            currentCalcModeRmr={calcModeRmr}
            onApplyRmr={(newRmr) => {
              setRmr(newRmr);
            }}
            onApplyQ={(newQ) => {
              setQValue(newQ);
            }}
            onApplyGsi={(newGsi) => {
              setGsi(newGsi);
            }}
            onUpdateRqd={(newRqd) => {
              setRqd(newRqd);
            }}
            onUpdateDepth={(newDepth) => {
              setDepth(newDepth);
            }}
            onUpdateUcs={(newUcs) => {
              setUcs(newUcs);
            }}
            onUpdateMi={(newMi) => {
              setMi(newMi);
            }}
            onUpdateDFactor={(newD) => {
              setDFactor(newD);
            }}
            onUpdateJointSpacing={(newSpacing) => {
              setJointSpacing(newSpacing);
            }}
            onUpdateJointSets={(newJointSets) => {
              setJointSets(newJointSets);
            }}
            onUpdateJr={(val) => setJr(val)}
            onUpdateJa={(val) => setJa(val)}
            onUpdateSrf={(val) => setSrf(val)}
            onUpdateCalcModeQ={(mode) => setCalcModeQ(mode)}
            onUpdatePersistence={(val) => setPersistence(val)}
            onUpdateAperture={(val) => setAperture(val)}
            onUpdateRoughness={(val) => setRoughness(val)}
            onUpdateInfillingId={(id) => setInfillingId(id)}
            onUpdateWeathering={(val) => setWeathering(val)}
            onUpdateOrientationAdj={(val) => setOrientationAdj(val)}
            onUpdateCalcModeRmr={(mode) => setCalcModeRmr(mode)}
            currentGroundwaterCondition={groundwaterCondition}
            currentGroundwaterRmr={groundwaterRmr}
            currentJw={jw}
            onUpdateGroundwaterCondition={handleUpdateGroundwaterCondition}
            onUpdateGroundwaterRmr={handleUpdateGroundwaterRmr}
            onUpdateJw={handleUpdateJw}
            onNavigateToStandup={() => setMainTab('standup_time')}
            onNavigateToSupport={() => setMainTab('support')}
            lang={lang}
          />
        )}

        {/* SECTION 2: برآورد قابلیت حفاری (Franklin 1971, GSI, Isaksson 2002, Weaver 1975) */}
        {mainTab === 'excavability' && (
          <ExcavabilityHub
            currentSpan={span}
            currentGsi={gsi}
            currentUcs={ucs}
            currentJointSpacing={jointSpacing}
            currentUnitWeight={unitWeight}
            currentDepth={depth}
            currentHeight={tunnelHeight}
            pointLoadIs50={pointLoadIs50}
            onUpdateUcs={(newUcs) => setUcs(newUcs)}
            onUpdateJointSpacing={(newSpacing) => setJointSpacing(newSpacing)}
            onUpdateGsi={(newGsi) => setGsi(newGsi)}
            onUpdateUnitWeight={(newGamma) => setUnitWeight(newGamma)}
            onUpdatePointLoadIs50={(newIs50) => setPointLoadIs50(newIs50)}
            lang={lang}
          />
        )}

        {/* SECTION 3: برآورد زمان خودپایداری (Bieniawski RMR & Barton Q) */}
        {mainTab === 'standup_time' && (
          <StandupTimeHub
            method={method}
            setMethod={setMethod}
            span={span}
            setSpan={setSpan}
            rmr={rmr}
            setRmr={(val) => {
              setRmr(val);
              setCalcModeRmr('manual');
            }}
            qValue={qValue}
            setQValue={(val) => {
              setQValue(val);
              setCalcModeQ('manual');
            }}
            esr={esr}
            setEsr={setEsr}
            rockClass={rmrResult.rockClass}
            qClass={qResult.qClass}
            rmrResult={rmrResult}
            qResult={qResult}
            onOpenRmrWizard={() => setIsRmrWizardOpen(true)}
            onOpenQWizard={() => setIsQWizardOpen(true)}
            onSelectPreset={handleSelectPreset}
            onNavigateToClassification={() => setMainTab('classification')}
            onNavigateToSupport={() => setMainTab('support')}
            gsi={gsi}
            onUpdateGsi={(val) => setGsi(val)}
            lang={lang}
          />
        )}

        {/* SECTION 4: برآورد سیستم نگهداری (RMR, Barton Q Sfr & Plain, GSI, RQD, Russo 1998) */}
        {mainTab === 'support' && (
          <SupportHub
            currentSpan={span}
            currentRmr={rmr}
            currentQ={qValue}
            currentEsr={esr}
            currentGsi={gsi}
            currentRqd={rqd}
            currentDepth={depth}
            currentUcs={ucs}
            currentJointSpacing={jointSpacing}
            currentJointSets={jointSets}
            rockClass={rmrResult.rockClass}
            qResult={qResult}
            onUpdateSpan={(val) => setSpan(val)}
            onUpdateRmr={(val) => setRmr(val)}
            onUpdateQ={(val) => setQValue(val)}
            onUpdateGsi={(val) => setGsi(val)}
            onUpdateRqd={(val) => setRqd(val)}
            onUpdateDepth={(val) => setDepth(val)}
            onUpdateUcs={(val) => setUcs(val)}
            onUpdateJointSpacing={(val) => setJointSpacing(val)}
            onUpdateJointSets={(val) => setJointSets(val)}
            onNavigateToGsiClassification={() => {
              setMainTab('classification');
              setClassificationSubTab('gsi');
            }}
            onNavigateToQClassification={() => {
              setMainTab('classification');
              setClassificationSubTab('q');
            }}
            onNavigateToRmrClassification={() => {
              setMainTab('classification');
              setClassificationSubTab('rmr');
            }}
            lang={lang}
          />
        )}

        {/* SECTION 5: برآورد بار سنگ (Rock Load Estimation - Terzaghi, Barton, Cording, Hoek, Kirsch) */}
        {mainTab === 'rock_load' && (
          <RockLoadHub
            span={span}
            onUpdateSpan={(val) => setSpan(val)}
            height={tunnelHeight}
            onUpdateHeight={(val) => setTunnelHeight(val)}
            depth={depth}
            onUpdateDepth={(val) => setDepth(val)}
            ucs={ucs}
            onUpdateUcs={(val) => setUcs(val)}
            rqd={rqd}
            onUpdateRqd={(val) => setRqd(val)}
            rmr={rmr}
            qValue={qValue}
            onUpdateQValue={(val) => setQValue(val)}
            gsi={gsi}
            onUpdateGsi={(val) => setGsi(val)}
            sigmaCm={hoekBrownParams.sigmaCm}
            frictionAngleDeg={hoekBrownParams.frictionAngleDeg}
            cohesionMPa={hoekBrownParams.cohesionMPa}
            mi={mi}
            dFactor={dFactor}
            onUpdateMi={(val) => setMi(val)}
            onUpdateDFactor={(val) => setDFactor(val)}
            esr={esr}
            onUpdateEsr={(val) => setEsr(val)}
            kRatio={kRatio}
            onUpdateKRatio={(val) => setKRatio(val)}
            unitWeight={unitWeight}
            onUpdateUnitWeight={(val) => setUnitWeight(val)}
            jointSets={jointSets}
            onUpdateJointSets={(val) => setJointSets(val)}
            jr={jr}
            onUpdateJr={(val) => setJr(val)}
            ja={ja}
            onUpdateJa={(val) => setJa(val)}
            jointSpacing={jointSpacing}
            onUpdateJointSpacing={(val) => setJointSpacing(val)}
            groundwaterCondition={groundwaterCondition}
            lang={lang}
          />
        )}

        {/* SECTION 6: گزارش نتایج مهندسی (Results Report) */}
        {mainTab === 'report' && (
          <ProjectReportHub
            span={span}
            onUpdateSpan={(val) => setSpan(val)}
            height={tunnelHeight}
            onUpdateHeight={(val) => setTunnelHeight(val)}
            depth={depth}
            onUpdateDepth={(val) => setDepth(val)}
            rmr={rmr}
            onUpdateRmr={(val) => {
              setRmr(val);
              setQValue(rmrToEquivalentQ(val));
            }}
            qValue={qValue}
            onUpdateQ={(val) => setQValue(val)}
            gsi={gsi}
            onUpdateGsi={(val) => setGsi(val)}
            ucs={ucs}
            onUpdateUcs={(val) => setUcs(val)}
            rqd={rqd}
            onUpdateRqd={(val) => setRqd(val)}
            esr={esr}
            onUpdateEsr={(val) => setEsr(val)}
            unitWeight={unitWeight}
            onUpdateUnitWeight={(val) => setUnitWeight(val)}
            kRatio={kRatio}
            onUpdateKRatio={(val) => setKRatio(val)}
            jointSpacing={jointSpacing}
            onUpdateJointSpacing={(val) => setJointSpacing(val)}
            pointLoadIs50={pointLoadIs50}
            onUpdatePointLoadIs50={(val) => setPointLoadIs50(val)}
            rockClass={rmrResult.rockClass}
            qResult={qResult}
            jointSets={jointSets}
            onUpdateJointSets={(val) => setJointSets(val)}
            jr={jr}
            onUpdateJr={(val) => setJr(val)}
            ja={ja}
            onUpdateJa={(val) => setJa(val)}
            mi={mi}
            dFactor={dFactor}
            groundwaterCondition={groundwaterCondition}
            groundwaterRmr={groundwaterRmr}
            jw={jw}
            onUpdateGroundwaterCondition={handleUpdateGroundwaterCondition}
            activeScenarioName={activeScenario ? (isFa ? activeScenario.name : activeScenario.nameEn || activeScenario.name) : undefined}
            projectTitle={projectTitle}
            onUpdateProjectTitle={(val) => setProjectTitle(val)}
            designerName={designerName}
            onUpdateDesignerName={(val) => setDesignerName(val)}
            designerTitle={designerTitle}
            onUpdateDesignerTitle={(val) => setDesignerTitle(val)}
            approverName={approverName}
            onUpdateApproverName={(val) => setApproverName(val)}
            approverTitle={approverTitle}
            onUpdateApproverTitle={(val) => setApproverTitle(val)}
            lang={lang}
          />
        )}
      </main>

      {/* Project Profiles & Scenarios Management Modal (*.STEMD) */}
      <ProjectProfilesModal
        isOpen={isScenariosModalOpen}
        onClose={() => setIsScenariosModalOpen(false)}
        isFa={isFa}
        activeScenarioId={activeScenario?.id || ''}
        currentData={currentScenarioData}
        onApplyScenario={handleApplyScenario}
      />

      {/* RMR 6-Parameter Wizard Modal */}
      <RmrParameterModal
        isOpen={isRmrWizardOpen}
        onClose={() => setIsRmrWizardOpen(false)}
        onApplyRmr={(val) => {
          setRmr(val);
          setQValue(rmrToEquivalentQ(val));
        }}
        initialRmr={rmr}
        currentRqd={rqd}
        currentGroundwaterRmr={groundwaterRmr}
        onUpdateRqd={(val) => setRqd(val)}
        onUpdateGroundwaterRmr={handleUpdateGroundwaterRmr}
        lang={lang}
      />

      {/* Barton Q-System 6-Parameter Wizard Modal */}
      <QParameterModal
        isOpen={isQWizardOpen}
        onClose={() => setIsQWizardOpen(false)}
        onApplyQ={(val) => {
          setQValue(val);
        }}
        initialQ={qValue}
        currentRqd={rqd}
        currentJw={jw}
        onUpdateRqd={(val) => setRqd(val)}
        onUpdateJw={handleUpdateJw}
        lang={lang}
      />

      {/* Android Mobile App (PWA / WebAPK) Modal */}
      <AndroidInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        lang={lang}
      />

      {/* Windows Desktop EXE Build Guide Modal */}
      <WindowsExeModal
        isOpen={isExeModalOpen}
        onClose={() => setIsExeModalOpen(false)}
        lang={lang}
      />

      {/* System Creators & Design Director Modal */}
      <CreditsModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
        lang={lang}
      />

      {/* Scientific Reference / About Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <AppLogo size="sm" rounded="rounded-lg" className="shrink-0" />
                <h3 className="text-base font-bold text-slate-100">
                  {isFa
                    ? 'مبانی علمی طبقه‌بندی مهندسی سنگ و زمان خودایستایی تونل'
                    : 'Scientific References: RMR, Q-System & GSI'}
                </h3>
              </div>
              <button
                onClick={() => setIsAboutOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed">
              {/* Creators & Developer Identification Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-indigo-950/70 border border-indigo-500/40 space-y-2.5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-indigo-800/40 pb-2.5">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-slate-100 text-xs sm:text-sm">
                      {isFa ? 'مشخصات تولیدکنندگان و شناسنامه سامانه:' : 'System Development & Design Specifications:'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30 shrink-0">
                      <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{isFa ? 'ورژن ۱.۰' : 'Version 1.0'}</span>
                    </span>
                    <button
                      onClick={() => {
                        setIsAboutOpen(false);
                        setIsCreditsOpen(true);
                      }}
                      className="text-[11px] text-indigo-300 hover:text-white underline cursor-pointer"
                    >
                      {isFa ? 'مشاهده شناسنامه کامل' : 'Full Details'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-0.5">
                    <div className="text-slate-400 text-[10px]">{isFa ? 'مدیر طراحی:' : 'Design Director:'}</div>
                    <div className="font-bold text-slate-100">{isFa ? 'سعید جمالی زواره' : 'Saeed Jamali Zavareh'}</div>
                    <div className="text-amber-400 font-medium text-[10px]">{isFa ? 'دکترای مکانیک سنگ' : 'Ph.D. in Rock Mechanics'}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-0.5">
                    <div className="text-slate-400 text-[10px]">{isFa ? 'پست الکترونیک:' : 'Email Address:'}</div>
                    <a href="mailto:Saeed.jm.za@gmail.com" className="font-mono text-blue-400 hover:underline block truncate" dir="ltr">
                      Saeed.jm.za@gmail.com
                    </a>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-0.5">
                    <div className="text-slate-400 text-[10px]">{isFa ? 'تلفن تماس:' : 'Phone Number:'}</div>
                    <a href="tel:+989124282899" className="font-mono text-emerald-400 hover:underline font-bold block" dir="ltr">
                      +989124282899
                    </a>
                  </div>
                </div>

                {/* Developer Feedback & Donation Support */}
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-slate-200 text-xs space-y-2.5">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      {isFa
                        ? 'توسعه دهندگان آماده شنیدن انتقادات و پیشنهادات شما هستند. در صورت رضایت از برنامه و علاقه به توسعه نرم افزارهای بیشتر میتوانید از ما حمایت کنید:'
                        : 'The developers welcome your feedback and suggestions. If you are satisfied with this application and interested in supporting further software development, you can support us at:'}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-amber-500/20">
                    {/* 1. Daramet Link (First) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-md bg-slate-900/60 border border-emerald-500/25">
                      <a
                        href="https://daramet.com/saeedjamali"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
                      >
                        <Coffee className="w-3 h-3 text-emerald-100" />
                        <span>{isFa ? 'حمایت مالی در درآمَدَت' : 'Support on Daramet'}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-emerald-100" />
                      </a>
                      <a
                        href="https://daramet.com/saeedjamali"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[10.5px] text-emerald-300 hover:underline select-all"
                        dir="ltr"
                      >
                        https://daramet.com/saeedjamali
                      </a>
                    </div>

                    {/* 2. Hamibash Link (Underneath) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-md bg-slate-900/60 border border-amber-500/25">
                      <a
                        href="https://hamibash.com/tunnelapp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-[11px] shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
                      >
                        <Heart className="w-3 h-3 fill-current text-white animate-pulse" />
                        <span>{isFa ? 'حمایت در حامی‌باش' : 'Support on Hamibash'}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-amber-100" />
                      </a>
                      <a
                        href="https://hamibash.com/tunnelapp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[10.5px] text-amber-300/90 hover:underline select-all"
                        dir="ltr"
                      >
                        https://hamibash.com/tunnelapp
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* GSI Section */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-900/50 space-y-2.5">
                <h4 className="font-bold text-purple-400 text-sm flex items-center gap-1.5">
                  <Grid className="w-4 h-4" />
                  <span>{isFa ? 'شاخص مقاومت زمین‌شناسی هوک و براون (GSI):' : 'Hoek & Brown GSI Index:'}</span>
                </h4>
                <p>
                  {isFa
                    ? 'شاخص GSI در سال ۱۹۹۴ توسط هوک و براون جهت رفع کاستی‌های RMR در توده‌سنگ‌های بسیار ضعیف و خردشده ابداع گردید. پارامترهای mb، s و a طبق ویرایش ۲۰۰۲ بر مبنای GSI و ضریب دست‌خوردگی انفجار D محاسبه می‌شوند.'
                    : 'GSI was introduced by Hoek & Brown (1994) to overcome RMR limitations in heavily fractured rock masses. Generalized Hoek-Brown parameters (mb, s, a) are derived from GSI and disturbance factor D.'}
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-purple-300 text-center text-xs">
                  mb = mi × exp((GSI - 100) / (28 - 14D)) &nbsp;&nbsp;|&nbsp;&nbsp; s = exp((GSI - 100) / (9 - 3D))
                </div>
              </div>

              {/* Barton Q-System Section */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-teal-900/50 space-y-2.5">
                <h4 className="font-bold text-teal-400 text-sm flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>{isFa ? 'روش شاخص کیفیت سنگ بارتون (Barton Q-System):' : 'Barton Q-System Methodology:'}</span>
                </h4>
                <p>
                  {isFa
                    ? 'سیستم Q در سال ۱۹۷۴ توسط بارتون، لین و لونده در موسسه ژئوتکنیک نروژ (NGI) توسعه یافت. حاصل‌ضرب نسبت‌های بلوک، اصطکاک و تنش بیانگر شاخص کیفیت سنگ است.'
                    : 'The Q-system was developed in 1974 by Barton et al. (NGI) based on extensive tunnel case records.'}
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-teal-300 text-center text-xs">
                  Q = ( RQD / Jn ) × ( Jr / Ja ) × ( Jw / SRF )
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-amber-300 text-center text-xs">
                  S_max = 2 × ESR × Q^0.4 &nbsp;&nbsp;|&nbsp;&nbsp; De = Span / ESR
                </div>
              </div>

              {/* Bieniawski RMR Section */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-900/50 space-y-2.5">
                <h4 className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  <span>{isFa ? 'روش رده‌بندی ژئومکانیکی بینیاوسکی (Bieniawski RMR 1989):' : 'Bieniawski RMR (1989):'}</span>
                </h4>
                <p>
                  {isFa
                    ? 'زمان خودایستایی عبارت است از حداکثر مدتی که یک مقطع حفاری بدون هیچ‌گونه نگهداری می‌تواند پایدار بماند. بینیاوسکی توده‌های سنگ را به ۵ رده تقسیم‌بندی نموده و برای هر رده پوش خودایستایی تجربی در مختصات لگاریتمی-لگاریتمی زمان در برابر دهانه ارائه کرده است.'
                    : 'Stand-up time is the duration that an excavation can stand unsupported. Bieniawski established empirical log-log curves relating unsupported span, rock rating and stand-up duration.'}
                </p>
              </div>

              {/* Equivalence Formulas */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-900/50 space-y-2.5">
                <h4 className="font-bold text-indigo-400 text-sm flex items-center gap-1.5">
                  <Scale className="w-4 h-4" />
                  <span>{isFa ? 'روابط هم‌ارزی بین RMR، Q و GSI:' : 'Equivalence Correlations (RMR, Q, GSI):'}</span>
                </h4>
                <ul className="space-y-1.5 list-disc list-inside font-mono text-slate-300 text-[11px]">
                  <li>Hoek (2002): GSI = RMR89 - 5 (for RMR &gt; 23)</li>
                  <li>Barton (2002): GSI = 9 × ln(Q') + 44</li>
                  <li>Bieniawski (1976): RMR = 9 × ln(Q) + 44</li>
                  <li>Barton (2002): RMR = 15 × log10(Q) + 50</li>
                </ul>
              </div>

              {/* Comprehensive Scientific References */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-900/50 space-y-3">
                <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>{isFa ? 'مراجع علمی و استانداردهای مرجع (Scientific References):' : 'Scientific References & Standards:'}</span>
                </h4>

                <div className="space-y-3 text-[11px] leading-relaxed text-slate-300 divide-y divide-slate-800/80">
                  {/* Category 1 */}
                  <div className="pt-1.5 first:pt-0 space-y-1">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>{isFa ? 'طبقه‌بندی ژئومکانیکی RMR و زمان خودپایداری توده‌سنگ:' : 'RMR Classification & Stand-up Time:'}</span>
                    </div>
                    <ul className="space-y-1 list-disc list-inside ps-2 text-slate-300 font-sans">
                      <li>Bieniawski, Z.T. (1973). <em>Engineering classification of jointed rock masses</em>. Trans. S. Afr. Inst. Civ. Eng., 15(12), 335–344.</li>
                      <li>Bieniawski, Z.T. (1976). <em>Rock mass classification in rock engineering</em>. In Exploration for rock engineering (pp. 97–106). Balkema, Rotterdam.</li>
                      <li>Bieniawski, Z.T. (1989). <em>Engineering Rock Mass Classifications: A Complete Manual for Engineers and Geologists</em>. John Wiley &amp; Sons, New York.</li>
                    </ul>
                  </div>

                  {/* Category 2 */}
                  <div className="pt-2.5 space-y-1">
                    <div className="font-bold text-teal-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                      <span>{isFa ? 'شاخص کیفیت Q بارتون و چارت‌های طراحی نگهداری تجربی:' : 'Barton Q-System & Empirical Support:'}</span>
                    </div>
                    <ul className="space-y-1 list-disc list-inside ps-2 text-slate-300 font-sans">
                      <li>Barton, N., Lien, R., &amp; Lunde, J. (1974). <em>Engineering classification of rock masses for the design of tunnel support</em>. Rock Mechanics, 6(4), 189–236.</li>
                      <li>Grimstad, E., &amp; Barton, N. (1993). <em>Updating the Q-system for NMT</em>. Proc. Int. Symp. on Sprayed Concrete, Fagernes, 46–66.</li>
                      <li>Barton, N. (2002). <em>Some new Q-value correlations to assist in site investigation and tunnel design</em>. Int. J. Rock Mech. Min. Sci., 39(2), 185–216.</li>
                      <li>NGI (2015). <em>Using the Q-system: Rock mass classification and support design</em>. Norwegian Geotechnical Institute, Oslo.</li>
                    </ul>
                  </div>

                  {/* Category 3 */}
                  <div className="pt-2.5 space-y-1">
                    <div className="font-bold text-purple-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      <span>{isFa ? 'معیار شکست هوک-براون و شاخص مقاومت زمین‌شناسی (GSI):' : 'Hoek-Brown Criterion & GSI:'}</span>
                    </div>
                    <ul className="space-y-1 list-disc list-inside ps-2 text-slate-300 font-sans">
                      <li>Hoek, E. (1994). <em>Strength of rock and rock masses</em>. ISRM News Journal, 2(2), 4–16.</li>
                      <li>Hoek, E., &amp; Brown, E.T. (1997). <em>Practical estimates of rock mass strength</em>. Int. J. Rock Mech. Min. Sci., 34(8), 1165–1186.</li>
                      <li>Hoek, E., Carranza-Torres, C., &amp; Corkum, B. (2002). <em>Hoek-Brown failure criterion - 2002 edition</em>. Proc. NARMS-TAC Conference, Toronto, 1, 267–273.</li>
                    </ul>
                  </div>

                  {/* Category 4 */}
                  <div className="pt-2.5 space-y-1">
                    <div className="font-bold text-sky-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                      <span>{isFa ? 'تئوری‌های بار سنگ، طاق‌بندی و شاخص RQD:' : 'Rock Load Theories, Arching & RQD:'}</span>
                    </div>
                    <ul className="space-y-1 list-disc list-inside ps-2 text-slate-300 font-sans">
                      <li>Terzaghi, K. (1946). <em>Rock defects and loads on tunnel supports</em>. In Rock Tunneling with Steel Supports (Proctor &amp; White), Commercial Shearing, Youngstown, OH.</li>
                      <li>Deere, D.U. (1964). <em>Technical description of rock cores for engineering purposes</em>. Rock Mech. Eng. Geol., 1(1), 16–22.</li>
                      <li>Deere, D.U., Peck, R.B., Monsees, J.E., &amp; Schmidt, B. (1969). <em>Design of tunnel liners and support systems</em>. Report for US DOT, Washington DC.</li>
                      <li>Rose, D. (1982). <em>Revising Terzaghi&apos;s tunnel rock load (40 years later)</em>. Proc. 23rd US Symp. on Rock Mech., Berkeley, CA.</li>
                    </ul>
                  </div>

                  {/* Category 5 */}
                  <div className="pt-2.5 space-y-1">
                    <div className="font-bold text-rose-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span>{isFa ? 'پایداری جبهه‌کار تونل و پیش‌نگهداری پیشانی حفاری:' : 'Face Stability & Pre-support:'}</span>
                    </div>
                    <ul className="space-y-1 list-disc list-inside ps-2 text-slate-300 font-sans">
                      <li>Russo, G., Borm, G., &amp; Delgado, J. (1998). <em>The classification of tunnel face stability: A geotechnical perspective</em>. Tunnels and Tunnelling Int., 30(6), 41–45.</li>
                      <li>Russo, G. (2014). <em>A new approach for the design of face support in weak rock tunnelling</em>. Rock Mech. Rock Eng., 47(3), 1051–1067.</li>
                      <li>Lunardi, P. (2008). <em>Design and Construction of Tunnels: Analysis of Controlled Deformations in Rocks and Soils (ADECO-RS)</em>. Springer-Verlag, Berlin.</li>
                    </ul>
                  </div>

                  {/* Category 6 */}
                  <div className="pt-2.5 space-y-1">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>{isFa ? 'قابلیت حفاری، چالزنی، آتشباری، ریپرزنی و استانداردهای شاتکریت:' : 'Excavability, Blasting, Rippability & Shotcrete Standards:'}</span>
                    </div>
                    <ul className="space-y-1 list-disc list-inside ps-2 text-slate-300 font-sans">
                      <li>Franklin, J.A., Broch, E., &amp; Walton, G. (1971). <em>Logging the properties of rock in test boreholes</em>. Trans. Inst. Min. Metall., 80, A1–A9.</li>
                      <li>Weaver, J.M. (1975). <em>Geological factors significant in the assessment of the rippability of South African rock masses</em>. Proc. Symp. on Exploration for Rock Engineering, 211–216.</li>
                      <li>Isaksson, M. (2002). <em>Tunnel blasting and drilling penetration rate index (DRI) empirical relationships</em>. Doctoral thesis, Luleå University of Technology.</li>
                      <li>EFNARC (1996) / EN 14488-5: <em>European Specification for Sprayed Concrete - Energy Absorption of Fibre Reinforced Slab Specimens</em>.</li>
                      <li>ASTM C1550: <em>Standard Test Method for Flexural Toughness of Fiber-Reinforced Concrete (Round Panel Test)</em>.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end shrink-0">
              <button
                onClick={() => setIsAboutOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                {isFa ? 'بستن' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Windows New Scenario Modal (*.STEMD) */}
      <NewScenarioModal
        isOpen={isNewScenarioOpen}
        onClose={() => setIsNewScenarioOpen(false)}
        isFa={isFa}
        currentData={currentScenarioData}
        onScenarioCreated={handleScenarioCreated}
      />

      {/* Windows Desktop Exit Confirmation Modal */}
      <DesktopExitModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        isFa={isFa}
        activeScenarioName={activeScenario ? (isFa ? activeScenario.name : activeScenario.nameEn || activeScenario.name) : ''}
        onSaveAndExit={() => {
          handleSaveCurrentScenario();
          setIsExitModalOpen(false);
          showToast(isFa ? 'پرونده ذخیره گردید.' : 'Scenario saved.');
        }}
        onExitWithoutSaving={() => {
          setIsExitModalOpen(false);
          showToast(isFa ? 'پنجره خروج بسته شد.' : 'Exit cancelled.');
        }}
      />

      {/* Windows Quick Paste Geotechnical Parameters Modal */}
      <QuickPasteModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        isFa={isFa}
        onApplyPastedData={(data) => {
          applyPartialParameters(data);
          showToast(isFa ? 'پارامترهای مهندسی با موفقیت اعمال شدند.' : 'Parameters applied successfully.');
        }}
      />

      {/* Windows Desktop Keyboard Shortcuts Reference Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        isFa={isFa}
      />

      {/* Windows Desktop Floating Toast Notification */}
      {toastMessage && (
        <div
          dir={isFa ? 'rtl' : 'ltr'}
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-amber-500/40 text-amber-200 text-xs font-medium shadow-2xl shadow-slate-950/80 backdrop-blur-md flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200 select-none"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Geotechnical Engineering Application Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/90 py-3.5 px-4 sm:px-6 text-xs text-slate-400 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-right">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <AppLogo size="xs" rounded="rounded-md" className="shrink-0" />
            <span className="font-semibold text-slate-200">
              {isFa ? 'طبقه‌بندی و طرح تونل بر اساس روابط تجربی' : 'Tunnel Classification & Design Based on Empirical Relationships'}
            </span>
            <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-amber-500/10 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30 shrink-0">
              <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{isFa ? 'ورژن ۱.۰' : 'v1.0'}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 text-[11px]">
            <span className="text-slate-300 font-medium">
              {isFa ? 'مدیر طراحی: سعید جمالی زواره (دکترای مکانیک سنگ)' : 'Design Director: Saeed Jamali Zavareh (Ph.D.)'}
            </span>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <a
              href="mailto:Saeed.jm.za@gmail.com"
              className="text-blue-400 hover:text-blue-300 font-mono transition-colors"
              dir="ltr"
            >
              Saeed.jm.za@gmail.com
            </a>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <a
              href="tel:+989124282899"
              className="text-emerald-400 hover:text-emerald-300 font-mono font-bold transition-colors"
              dir="ltr"
            >
              +989124282899
            </a>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <button
              onClick={() => setIsCreditsOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer font-medium"
            >
              {isFa ? 'مشخصات کامل طراح' : 'Credits'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
