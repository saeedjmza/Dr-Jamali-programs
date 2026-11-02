import React, { useState, useMemo, useRef } from 'react';
import { AppLogo } from '../common/AppLogo';
import {
  FileText,
  Copy,
  Check,
  Download,
  Printer,
  Sliders,
  Eye,
  Layers,
  Shield,
  Pickaxe,
  Clock,
  Compass,
  Ruler,
  Cpu,
  Grid,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ChevronDown,
  ChevronUp,
  Settings2,
  Sparkles,
  Info,
  Calendar,
  UserCheck,
  Hash,
  Scale,
  Hammer,
  Weight,
  Wrench,
  ShieldCheck,
  FolderGit2,
  Building2,
  Droplets,
  ListChecks,
  CheckSquare,
  Square,
  RotateCcw,
} from 'lucide-react';
import {
  RockClassInfo,
  QCalculationResult,
  WeaverInputState,
  ReportSectionsConfig,
  DEFAULT_REPORT_SECTIONS,
} from '../../types';
import { calculateStandUpTime } from '../../utils/rmrCalculation';
import { calculateQStandUpTime, getBartonSupportDetailed } from '../../utils/qCalculation';
import {
  calculateFranklinExcavability,
  calculateGsiExcavability,
  calculateIsakssonExcavability,
  calculateWeaverRippability,
} from '../../utils/excavabilityCalculation';
import {
  calculateRqdSupport,
  calculateRussoSupport,
  calculateGsiSupport,
} from '../../utils/supportCalculation';
import {
  calculateTerzaghiRockLoad,
  calculateCordingRockLoad,
  calculateBartonRockLoad,
  calculateHoekCriticalSupportPressure,
  calculateKirschStresses,
  calculateDeereRockLoad,
  synthesizeRockLoadComparison,
  autoSuggestTerzaghiCondition,
} from '../../utils/rockLoadCalculation';
import { OfficialDocumentView } from './OfficialDocumentView';
import { generateDocxBlob, type DocxReportData } from '../../utils/docxExport';
import { generateOfficialPdf } from '../../utils/pdfExport';
import {
  GroundwaterConditionKey,
  GROUNDWATER_CONDITIONS,
  jwToGroundwaterKey,
  rmrRatingToGroundwaterKey,
} from '../../utils/waterConditions';

export interface ProjectReportHubProps {
  span: number;
  onUpdateSpan: (val: number) => void;
  height?: number;
  onUpdateHeight?: (val: number) => void;
  depth: number;
  onUpdateDepth: (val: number) => void;
  rmr: number;
  onUpdateRmr: (val: number) => void;
  qValue: number;
  onUpdateQ: (val: number) => void;
  gsi: number;
  onUpdateGsi: (val: number) => void;
  ucs: number;
  onUpdateUcs: (val: number) => void;
  rqd: number;
  onUpdateRqd: (val: number) => void;
  esr: number;
  onUpdateEsr: (val: number) => void;
  unitWeight: number;
  onUpdateUnitWeight: (val: number) => void;
  kRatio: number;
  onUpdateKRatio: (val: number) => void;
  jointSpacing: number;
  onUpdateJointSpacing: (val: number) => void;
  pointLoadIs50: number;
  onUpdatePointLoadIs50: (val: number) => void;
  rockClass: RockClassInfo;
  qResult: QCalculationResult;
  jointSets?: number;
  onUpdateJointSets?: (val: number) => void;
  jr?: number;
  onUpdateJr?: (val: number) => void;
  ja?: number;
  onUpdateJa?: (val: number) => void;
  mi?: number;
  dFactor?: number;
  groundwaterCondition?: GroundwaterConditionKey;
  groundwaterRmr?: number;
  jw?: number;
  onUpdateGroundwaterCondition?: (val: GroundwaterConditionKey) => void;
  activeScenarioName?: string;
  lang: 'fa' | 'en';
  projectTitle?: string;
  onUpdateProjectTitle?: (val: string) => void;
  designerName?: string;
  onUpdateDesignerName?: (val: string) => void;
  designerTitle?: string;
  onUpdateDesignerTitle?: (val: string) => void;
  approverName?: string;
  onUpdateApproverName?: (val: string) => void;
  approverTitle?: string;
  onUpdateApproverTitle?: (val: string) => void;
}

export const ProjectReportHub: React.FC<ProjectReportHubProps> = ({
  span,
  onUpdateSpan,
  height,
  onUpdateHeight,
  depth,
  onUpdateDepth,
  rmr,
  onUpdateRmr,
  qValue,
  onUpdateQ,
  gsi,
  onUpdateGsi,
  ucs,
  onUpdateUcs,
  rqd,
  onUpdateRqd,
  esr,
  onUpdateEsr,
  unitWeight,
  onUpdateUnitWeight,
  kRatio,
  onUpdateKRatio,
  jointSpacing,
  onUpdateJointSpacing,
  pointLoadIs50,
  onUpdatePointLoadIs50,
  rockClass,
  qResult,
  jointSets = 9,
  onUpdateJointSets,
  jr = 2.0,
  onUpdateJr,
  ja = 1.0,
  onUpdateJa,
  mi = 12,
  dFactor = 0.0,
  groundwaterCondition,
  groundwaterRmr,
  jw,
  onUpdateGroundwaterCondition,
  activeScenarioName,
  lang,
  projectTitle = '',
  onUpdateProjectTitle,
  designerName = '',
  onUpdateDesignerName,
  designerTitle = '',
  onUpdateDesignerTitle,
  approverName = '',
  onUpdateApproverName,
  approverTitle = '',
  onUpdateApproverTitle,
}) => {
  const isFa = lang === 'fa';
  const printAreaRef = useRef<HTMLDivElement>(null);

  // States
  const [copied, setCopied] = useState<boolean>(false);
  const [showQuickInputs, setShowQuickInputs] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'cards' | 'document'>('cards');
  const [downloadingDocx, setDownloadingDocx] = useState<boolean>(false);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [pdfSuccess, setPdfSuccess] = useState<boolean>(false);
  const docSheetRef = useRef<HTMLDivElement>(null);

  // Report Sections Selection Checklist State (persisted to localStorage)
  const [reportSections, setReportSections] = useState<ReportSectionsConfig>(() => {
    try {
      const saved = localStorage.getItem('rock_tunnel_report_sections_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_REPORT_SECTIONS, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_REPORT_SECTIONS;
  });

  const toggleSection = (key: keyof ReportSectionsConfig) => {
    setReportSections((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('rock_tunnel_report_sections_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const selectAllSections = () => {
    const allTrue: ReportSectionsConfig = {
      inputs: true,
      excavability: true,
      standUpTime: true,
      support: true,
      rockLoad: true,
      signatures: true,
    };
    setReportSections(allTrue);
    try {
      localStorage.setItem('rock_tunnel_report_sections_v1', JSON.stringify(allTrue));
    } catch {}
  };

  const clearAllSections = () => {
    const allFalse: ReportSectionsConfig = {
      inputs: false,
      excavability: false,
      standUpTime: false,
      support: false,
      rockLoad: false,
      signatures: false,
    };
    setReportSections(allFalse);
    try {
      localStorage.setItem('rock_tunnel_report_sections_v1', JSON.stringify(allFalse));
    } catch {}
  };

  const resetDefaultSections = () => {
    setReportSections(DEFAULT_REPORT_SECTIONS);
    try {
      localStorage.setItem('rock_tunnel_report_sections_v1', JSON.stringify(DEFAULT_REPORT_SECTIONS));
    } catch {}
  };

  const activeSectionCount = useMemo(() => {
    return Object.values(reportSections).filter(Boolean).length;
  }, [reportSections]);

  const reportSectionDefs = useMemo(() => [
    {
      key: 'inputs' as keyof ReportSectionsConfig,
      num: 1,
      titleFa: '۱. مشخصات و پارامترهای ورودی',
      titleEn: '1. Input Parameters',
      descFa: 'هندسه تونل، عمق، تنش برجا، RMR، Q، GSI، UCS، RQD و آب زیرزمینی',
      descEn: 'Tunnel geometry, depth, stress, RMR, Q, GSI, UCS, RQD & groundwater',
      icon: Sliders,
      colorClass: 'text-blue-400',
    },
    {
      key: 'excavability' as keyof ReportSectionsConfig,
      num: 2,
      titleFa: '۲. قابلیت حفاری و استخراج',
      titleEn: '2. Excavability Assessment',
      descFa: 'مدل فرانکلین، مکانیزه TBM بر مبنای GSI، ایساکسون و ریپربلیتی ویور',
      descEn: 'Franklin, Mechanized TBM GSI, Isaksson drill/blast & Weaver rippability',
      icon: Pickaxe,
      colorClass: 'text-amber-400',
    },
    {
      key: 'standUpTime' as keyof ReportSectionsConfig,
      num: 3,
      titleFa: '۳. زمان خودایستایی و پایداری',
      titleEn: '3. Stand-up Time & Span',
      descFa: 'زمان خودپایداری RMR بینیاوسکی و حداکثر دهانه خودایستای مجاز Q بارتون',
      descEn: 'Bieniawski RMR stand-up time and Barton Q max unsupported span',
      icon: Clock,
      colorClass: 'text-teal-400',
    },
    {
      key: 'support' as keyof ReportSectionsConfig,
      num: 4,
      titleFa: '۴. طرح سیستم نگهداری تجربی',
      titleEn: '4. Support System Design',
      descFa: 'طراحی سیستم Q (شاتکریت الیافی Sfr)، جدول ۴ RMR، روش دیر RQD، روسو و هوک',
      descEn: 'Barton Q (Sfr fiber), Bieniawski Table 4, Deere RQD, Russo & Hoek',
      icon: Shield,
      colorClass: 'text-emerald-400',
    },
    {
      key: 'rockLoad' as keyof ReportSectionsConfig,
      num: 5,
      titleFa: '۵. بار سنگ و تحلیل تنش بازشدگی',
      titleEn: '5. Rock Load & Boundary Stress',
      descFa: 'بار سنگ ترزاقی، بارتون-گریمستاد، کوردینگ، فشار بحرانی هوک، تنش کرش و دیر',
      descEn: 'Terzaghi, Barton-Grimstad, Cording, Hoek Pcr, Kirsch stresses & Deere',
      icon: Weight,
      colorClass: 'text-cyan-400',
    },
    {
      key: 'signatures' as keyof ReportSectionsConfig,
      num: 6,
      titleFa: '۶. شناسنامه و امضای مهندسی',
      titleEn: '6. Signatures & Engineering Sign-off',
      descFa: 'عنوان پروژه، مشخصات طراح و محاسب، مشخصات تاییدکننده و ناظر ژئوتکنیک',
      descEn: 'Project title, Designer & Geotechnical Reviewer engineering sign-off',
      icon: UserCheck,
      colorClass: 'text-indigo-400',
    },
  ], []);

  // Weaver state for rock rippability
  const [weatheringGrade, setWeatheringGrade] = useState<1 | 2 | 3 | 4 | 5>(3);

  // Derived Groundwater Condition
  const effectiveGwKey: GroundwaterConditionKey = useMemo(() => {
    if (groundwaterCondition && GROUNDWATER_CONDITIONS[groundwaterCondition]) return groundwaterCondition;
    if (typeof jw === 'number') return jwToGroundwaterKey(jw);
    if (typeof groundwaterRmr === 'number') return rmrRatingToGroundwaterKey(groundwaterRmr);
    return 'damp';
  }, [groundwaterCondition, jw, groundwaterRmr]);

  const effectiveGwCondition = GROUNDWATER_CONDITIONS[effectiveGwKey];
  const effectiveGwRmr = typeof groundwaterRmr === 'number' ? groundwaterRmr : effectiveGwCondition.rmrRating;
  const effectiveJw = typeof jw === 'number' ? jw : effectiveGwCondition.jwValue;

  // Derived Calculations
  const rmrResult = useMemo(() => {
    return calculateStandUpTime(span, rmr);
  }, [span, rmr]);

  const currentQResult = useMemo(() => {
    return calculateQStandUpTime(span, qValue, esr);
  }, [span, qValue, esr]);

  const supportDetailed = useMemo(() => {
    return currentQResult.supportDetailed || getBartonSupportDetailed(qValue, span, esr);
  }, [currentQResult.supportDetailed, qValue, span, esr]);

  const franklinResult = useMemo(() => {
    return calculateFranklinExcavability(jointSpacing, pointLoadIs50);
  }, [jointSpacing, pointLoadIs50]);

  const gsiExcavResult = useMemo(() => {
    return calculateGsiExcavability(gsi, ucs);
  }, [gsi, ucs]);

  const isakssonResult = useMemo(() => {
    return calculateIsakssonExcavability(ucs, jointSpacing, unitWeight / 10, span);
  }, [ucs, jointSpacing, unitWeight, span]);

  const weaverState: WeaverInputState = useMemo(() => {
    return {
      seismicVelocityVp: Math.min(5.5, Math.max(0.8, Number((0.7 + (ucs / 100) * 2.2 + (rmr / 100) * 1.5).toFixed(2)))),
      ucs,
      weatheringGrade,
      jointSpacing,
      continuity: jointSpacing < 0.15 ? 'continuous_gouge' : 'continuous_no_gouge',
      gouge: jointSpacing < 0.1 ? 'soft' : jointSpacing < 0.3 ? 'hard' : 'none',
    };
  }, [ucs, weatheringGrade, jointSpacing, rmr]);

  const weaverResult = useMemo(() => {
    return calculateWeaverRippability(weaverState);
  }, [weaverState]);

  const rqdResult = useMemo(() => {
    return calculateRqdSupport(rqd, span);
  }, [rqd, span]);

  const russoResult = useMemo(() => {
    return calculateRussoSupport(gsi, span, depth, ucs, unitWeight, kRatio, 10);
  }, [gsi, span, depth, ucs, unitWeight, kRatio]);

  const gsiSupportResult = useMemo(() => {
    return calculateGsiSupport(gsi, span, depth, ucs);
  }, [gsi, span, depth, ucs]);

  // Rock Load Estimations (Terzaghi, Barton, Cording, Hoek, Kirsch, Deere)
  const effectiveHeight = height ?? span;
  const effectiveJr = jr ?? 2.0;

  const terzaghiCond = useMemo(() => {
    return autoSuggestTerzaghiCondition(rmr, rqd, depth, ucs);
  }, [rmr, rqd, depth, ucs]);

  const terzaghiResult = useMemo(() => {
    return calculateTerzaghiRockLoad(terzaghiCond, span, effectiveHeight, unitWeight);
  }, [terzaghiCond, span, effectiveHeight, unitWeight]);

  const cordingResult = useMemo(() => {
    return calculateCordingRockLoad(span, effectiveHeight, unitWeight, rqd);
  }, [span, effectiveHeight, unitWeight, rqd]);

  const bartonRockLoadResult = useMemo(() => {
    return calculateBartonRockLoad(qValue, jointSets || 9, effectiveJr, esr, span, unitWeight);
  }, [qValue, jointSets, effectiveJr, esr, span, unitWeight]);

  const hoekRockLoadResult = useMemo(() => {
    return calculateHoekCriticalSupportPressure(depth, unitWeight, ucs, gsi, kRatio);
  }, [depth, unitWeight, ucs, gsi, kRatio]);

  const kirschStressResult = useMemo(() => {
    return calculateKirschStresses(span, depth, unitWeight, kRatio, ucs, gsi);
  }, [span, depth, unitWeight, kRatio, ucs, gsi]);

  const deereRockLoadResult = useMemo(() => {
    return calculateDeereRockLoad(span, rqd, unitWeight);
  }, [span, rqd, unitWeight]);

  const rockLoadComparison = useMemo(() => {
    return synthesizeRockLoadComparison(
      terzaghiResult,
      cordingResult,
      bartonRockLoadResult,
      hoekRockLoadResult,
      kirschStressResult,
      deereRockLoadResult
    );
  }, [
    terzaghiResult,
    cordingResult,
    bartonRockLoadResult,
    hoekRockLoadResult,
    kirschStressResult,
    deereRockLoadResult,
  ]);

  // Report Date & Time
  const reportDateStr = useMemo(() => {
    const now = new Date();
    try {
      if (isFa) {
        const formatter = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
          calendar: 'persian',
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        const parts = formatter.formatToParts(now);
        const map: Record<string, string> = {};
        for (const p of parts) {
          map[p.type] = p.value;
        }
        if (map.weekday && map.day && map.month && map.year && map.hour && map.minute) {
          return `${map.weekday} ${map.day} ${map.month} ${map.year} ساعت ${map.hour}:${map.minute}`;
        }
      }
    } catch {
      // fallback
    }
    return now.toLocaleString(isFa ? 'fa-IR' : 'en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  }, [isFa]);

  // Plain Text & Markdown Generator
  const generateReportText = (format: 'text' | 'markdown' = 'text'): string => {
    const isMd = format === 'markdown';
    const h1 = isMd ? '# ' : '================================================================================\n';
    const h2 = isMd ? '## ' : '\n--------------------------------------------------------------------------------\n';
    const h3 = isMd ? '### ' : '\n[ ';
    const h3Close = isMd ? '' : ' ]\n';

    let content = `${h1}${isFa ? 'گزارش جامع طبقه‌بندی، پایداری و طرح سیستم نگهداری تونل' : 'Comprehensive Tunnel Classification, Stability & Support Design Report'}
${isFa ? 'مدیر طراحی: سعید جمالی زواره (دکترای مکانیک سنگ) | ورژن ۱.۰' : 'Design Director: Saeed Jamali Zavareh (Ph.D. in Rock Mechanics) | Version 1.0'}
${isFa ? 'تاریخ صدور گزارش: ' : 'Date of Issue: '}${reportDateStr}
${isFa ? `عنوان پروژه: ${projectTitle || '____________________________________________________'}` : `Project Title: ${projectTitle || '____________________________________________________'}`}
${activeScenarioName ? `${isFa ? 'پروفایل / سناریوی فعال (*.STEMD): ' : 'Active Scenario / Profile (*.STEMD): '}${activeScenarioName}\n` : ''}${isMd ? '---' : '================================================================================\n'}
`;

    if (reportSections.inputs) {
      content += `
${h2}${isFa ? '۱. مشخصات و پارامترهای ورودی پروژه (Project Input Parameters)' : '1. Project Input Parameters'}
${isFa ? '• ۱. قطر / دهانه مفید تونل (Span / Diameter D):' : '• 1. Tunnel Span / Diameter (D):'} ${span} m
${isFa ? '• ۲. عمق روباره تونل (Overburden Depth H):' : '• 2. Overburden Depth (H):'} ${depth} m
${isFa ? '• ۳. ضریب کاربری و ایمنی تونل (ESR):' : '• 3. Excavation Support Ratio (ESR):'} ${esr}
${isFa ? '• ۴. ابعاد معادل دهانه تونل (De = Span / ESR):' : '• 4. Equivalent Dimension (De):'} ${currentQResult.equivalentDimension} m
${isFa ? '• ۵. تنش قائم روباره ژئواستاتیک (Vertical Stress σv = γ × H / 1000):' : '• 5. Vertical Overburden Stress (σv):'} ${((unitWeight * depth) / 1000).toFixed(2)} MPa (γ = ${unitWeight} kN/m³, k = ${kRatio})
${isFa ? '• ۶. مقاومت فشاری تک‌محوری سنگ بکر (Intact Rock UCS σc):' : '• 6. Intact Rock UCS (σc):'} ${ucs} MPa
${isFa ? '• ۷. شاخص بار نقطه‌ای سنگ (Point Load Strength Is(50)): ' : '• 7. Point Load Strength (Is50): '} ${pointLoadIs50} MPa
${isFa ? '• ۸. عدد دسته‌درزه‌ها در سیستم بارتون (Joint Set Number Jn):' : '• 8. Joint Set Number (Jn):'} ${jointSets}
${isFa ? '• ۹. میانگین فاصله‌داری ناپیوستگی‌ها / درزه‌ها (Discontinuity Spacing If):' : '• 9. Discontinuity Spacing (If):'} ${jointSpacing} m
${isFa ? '• ۱۰. شرایط آب زیرزمینی یکپارچه (Unified Groundwater):' : '• 10. Unified Groundwater Conditions:'} ${isFa ? effectiveGwCondition.shortLabelFa : effectiveGwCondition.shortLabelEn} (Jw = ${effectiveJw} | RMR = ${effectiveGwRmr}) - ${isFa ? effectiveGwCondition.inflowRangeFa : effectiveGwCondition.inflowRangeEn}
${isFa ? '• ۱۱. شاخص کیفیت مغزه سنگ (Rock Quality Designation RQD):' : '• 11. Rock Quality Designation (RQD):'} ${rqd} % (${isFa ? rqdResult.categoryFa : rqdResult.categoryEn})
${isFa ? '• ۱۲. شاخص طبقه‌بندی مهندسی سنگ بینیاوسکی (RMR89):' : '• 12. Bieniawski RMR89 Rating:'} ${rmr} / 100 (${isFa ? rmrResult.rockClass.nameFa : rmrResult.rockClass.nameEn})
${isFa ? '• ۱۳. شاخص کیفیت تونل‌سازی بارتون (Barton Q-Value):' : '• 13. Barton Q-Value:'} ${qValue} (${isFa ? currentQResult.qClass.nameFa : currentQResult.qClass.nameEn})
${isFa ? '• ۱۴. شاخص مقاومت زمین‌شناسی هوک (Hoek-Brown GSI):' : '• 14. Hoek-Brown GSI Index:'} ${gsi} / 100${Math.abs(rmr - gsi) >= 20 ? (isFa ? `\n  ⚠️ هشدار تطابق ژئوتکنیکی: اختلاف شدید بین RMR (${rmr}) و GSI (${gsi}) وجود دارد (${Math.abs(rmr - gsi)} واحد). پیشنهاد می‌شود ورودی‌ها بازبینی شوند.` : `\n  ⚠️ Geotechnical Consistency Warning: Major discrepancy between RMR (${rmr}) and GSI (${gsi}) of ${Math.abs(rmr - gsi)} points. Review of input parameters recommended.`) : ''}
`;
    }

    if (reportSections.excavability) {
      content += `
${h2}${isFa ? '۲. جمع‌بندی قابلیت حفاری توده‌سنگ (Excavability Assessment Summary)' : '2. Excavability Assessment Summary'}
${h3}${isFa ? 'الف) روش استخراج بر اساس نمودار فرانکلین (Franklin 1971):' : 'A) Excavation Method by Franklin (1971):'}${h3Close}
${isFa ? '• روش پیشنهادی استخراج:' : '• Recommended Method:'} ${isFa ? franklinResult.categoryNameFa : franklinResult.categoryNameEn}
${isFa ? '• تجهیزات و ماشین‌آلات مناسب:' : '• Recommended Equipment:'} ${isFa ? franklinResult.equipmentFa : franklinResult.equipmentEn}
${isFa ? '• شاخص حفرپذیری (Iex = Is50 × If):' : '• Excavability Index (Iex):'} ${franklinResult.excavabilityIndexIex} MPa.m
${isFa ? '• رده مقاومت سنگ / رده فاصله‌داری درزه‌ها:' : '• Strength / Spacing Grade:'} ${franklinResult.strengthGrade} / ${franklinResult.spacingGrade}

${h3}${isFa ? 'ب) ارزیابی حفر مکانیزه و کاربرد ماشین‌آلات (GSI & Hoek):' : 'B) Mechanized TBM & Roadheader Feasibility (GSI):'}${h3Close}
${isFa ? '• مقاومت توده‌سنگ (Rock Mass Strength σcm):' : '• Rock Mass Strength (σcm):'} ${gsiExcavResult.rockMassStrengthScm} MPa
${isFa ? '• امکان‌سنجی استفاده از TBM و کله‌گاوی (Roadheader):' : '• TBM & Roadheader Feasibility:'} ${isFa ? gsiExcavResult.tbmFeasibilityFa : gsiExcavResult.tbmFeasibilityEn}
${isFa ? '• انرژی ویژه حفر (Specific Energy SE):' : '• Specific Energy (SE):'} ${gsiExcavResult.specificEnergySE} MJ/m³
${isFa ? '• توصیه روش حفاری سنتی / مکانیزه:' : '• Drill & Blast Recommendation:'} ${isFa ? gsiExcavResult.drillAndBlastRecommendationFa : gsiExcavResult.drillAndBlastRecommendationEn}

${h3}${isFa ? 'ج) پارامترهای چالزنی و آتشباری تونل (Isaksson 2002):' : 'C) Drilling & Blasting Parameters (Isaksson 2002):'}${h3Close}
${isFa ? '• خرج ویژه ماده منفجره برآورد شده (Specific Charge q):' : '• Estimated Specific Charge (q):'} ${isakssonResult.specificChargeQ} kg/m³
${isFa ? '• متراژ ویژه چالزنی (Specific Drilling SD):' : '• Specific Drilling (SD):'} ${isakssonResult.specificDrillingSD} m/m³
${isFa ? '• شاخص نرخ نفوذ مته (Drilling Rate Index DRI):' : '• Drill Rate Index (DRI):'} ${isakssonResult.driEstimate} / 100 (${isFa ? isakssonResult.drillabilityClassFa : isakssonResult.drillabilityClassEn})
${isFa ? '• طول پیشروی در هر راند آتشباری (Advance per Round):' : '• Advance per Round:'} ${isakssonResult.advancePerRound} m
${isFa ? '• ارزیابی ریسک آتشباری بیش از حد (Overbreak Risk):' : '• Overbreak Risk:'} ${isFa ? isakssonResult.overbreakRiskFa : isakssonResult.overbreakRiskEn}

${h3}${isFa ? 'د) رتبه‌بندی ریپرزنی بر اساس رده‌بندی ویور (Weaver 1975 RRC):' : 'D) Rippability Rating Chart (Weaver 1975):'}${h3Close}
${isFa ? '• رتبه کل ویور (Total Rating):' : '• Weaver Total Rating:'} ${weaverResult.totalRating} / 100 (${weaverResult.classCode})
${isFa ? '• توصیف قابلیت ریپرزنی:' : '• Rippability Assessment:'} ${isFa ? weaverResult.rippabilityDescriptionFa : weaverResult.rippabilityDescriptionEn}
${isFa ? '• تیپ بولدوزر و ریپر پیشنهادی:' : '• Recommended Tractor/Ripper:'} ${isFa ? weaverResult.tractorRecommendationFa : weaverResult.tractorRecommendationEn}
`;
    }

    if (reportSections.standUpTime) {
      content += `
${h2}${isFa ? '۳. جمع‌بندی زمان خودپایداری توده‌سنگ (Stand-up Time Summary)' : '3. Stand-up Time Assessment Summary'}
${h3}${isFa ? 'الف) برآورد به روش بینیاوسکی (Bieniawski RMR89):' : 'A) Bieniawski RMR Stand-up Time:'}${h3Close}
${isFa ? '• رده کیفی سنگ (Rock Class):' : '• Rock Class:'} ${isFa ? rmrResult.rockClass.nameFa : rmrResult.rockClass.nameEn} (Class ${rmrResult.rockClass.code})
${isFa ? '• تخمین زمان خودپایداری برای دهانه' : '• Estimated Stand-up Time for span'} ${span}m: ${isFa ? rmrResult.formattedTimeFa : rmrResult.formattedTimeEn} (${rmrResult.standUpTimeHours < 1000 ? rmrResult.standUpTimeHours.toFixed(1) : rmrResult.standUpTimeHours.toExponential(2)} ${isFa ? 'ساعت' : 'hours'})
${isFa ? '• حداکثر دهانه خودایستای مجاز توده‌سنگ:' : '• Max Allowable Unsupported Span:'} ${rmrResult.maxAllowableSpan} m
${isFa ? '• وضعیت پایداری بازشدگی تونل:' : '• Stability Status:'} ${isFa ? rmrResult.statusMessageFa : rmrResult.statusMessageEn}
${isFa ? '• زمان طلایی اجرای سیستم نگهداری:' : '• Critical Support Installation Window:'} ${isFa ? `سیستم نگهداری موقت باید قبل از انقضای زمان خودپایداری (${rmrResult.formattedTimeFa}) نصب شود.` : `Primary support must be installed within the estimated stand-up duration (${rmrResult.formattedTimeEn}).`}

${h3}${isFa ? 'ب) برآورد به روش سیستم Q بارتون (Barton Q-System):' : 'B) Barton Q-System Stability Assessment:'}${h3Close}
${isFa ? '• رده کیفی توده‌سنگ:' : '• Rock Mass Quality Class:'} ${isFa ? currentQResult.qClass.nameFa : currentQResult.qClass.nameEn}
${isFa ? '• حداکثر دهانه خودایستا (S_max = 2 × ESR × Q^0.4):' : '• Max Unsupported Span (Smax):'} ${currentQResult.maxUnsupportedSpan} m
${isFa ? '• ضریب پایداری دهانه (Stability Ratio = Smax / Span):' : '• Span Stability Ratio:'} ${currentQResult.stabilityRatio} (${currentQResult.isSelfSupporting ? (isFa ? 'خودایستا' : 'Self-supporting') : (isFa ? 'نیازمند نگهداری فوری' : 'Support Required')})
${isFa ? '• وضعیت پایداری بدون نگهداری:' : '• Stand-up Status:'} ${isFa ? currentQResult.statusMessageFa : currentQResult.statusMessageEn}
${isFa ? '• RMR معادل تخمینی بینیاوسکی:' : '• Equivalent RMR (Bieniawski 1976):'} ${currentQResult.equivalentRmrBieniawski}
${isFa ? '• RMR معادل تخمینی بارتون:' : '• Equivalent RMR (Barton 2002):'} ${currentQResult.equivalentRmrBarton}
`;
    }

    if (reportSections.support) {
      content += `
${h2}${isFa ? '۴. جمع‌بندی سیستم نگهداری تجربی (Support System Design Summary)' : '4. Support System Design Summary'}
${h3}${isFa ? 'الف) طرح نگهداری تجربی بینیاوسکی (Bieniawski 1989 RMR - Table 4):' : 'A) Bieniawski (1989) Empirical Support Guidelines (Table 4):'}${h3Close}
${isFa ? '• نکته کلیدی محدوده اعتبار: این روش برای تونل نعل اسبی با دهانه ۱۰ متر، تنش قائم کمتر از ۲۵ مگاپاسکال و روش ساخت حفاری و انفجار معتبر است.' : '• Key Validity Note: This method is valid for horseshoe-shaped tunnels with a 10 m span, vertical stress of less than 25 MPa, and drill & blast construction method.'}
${isFa ? '• رده توده‌سنگ بینیاوسکی:' : '• Bieniawski Rock Class:'} ${isFa ? rmrResult.rockClass.nameFa : rmrResult.rockClass.nameEn} (Class ${rmrResult.rockClass.code})
${isFa ? '• ۱. روش و گام پیشروی حفاری (Excavation):' : '• 1. Excavation Method & Advance:'} ${isFa ? rmrResult.rockClass.excavationMethodFa : rmrResult.rockClass.excavationMethodEn}
${isFa ? '• ۲. مشخصات راک‌بولت‌ها (Rock Bolts - قطر ۲۰ میلی‌متر):' : '• 2. Rock Bolts (20mm diam.):'} ${isFa ? rmrResult.rockClass.rockBoltsFa : rmrResult.rockClass.rockBoltsEn}
${isFa ? '• ۳. مشخصات شاتکریت و بتن‌پاشی (Shotcrete):' : '• 3. Shotcrete & Mesh:'} ${isFa ? rmrResult.rockClass.shotcreteFa : rmrResult.rockClass.shotcreteEn}
${isFa ? '• ۴. قاب‌های فولادی و اینورت (Steel Sets & Invert):' : '• 4. Steel Sets & Invert:'} ${isFa ? rmrResult.rockClass.steelSetsFa : rmrResult.rockClass.steelSetsEn}

${h3}${isFa ? 'ب) طرح نگهداری سیستم نروژی NMT بارتون (سیستم Q):' : 'B) Barton NMT / Q-System Support Guidelines:'}${h3Close}
${isFa ? '• دسته نگهداری بارتون:' : '• Barton Support Category:'} ${isFa ? supportDetailed.categoryLabelFa : supportDetailed.categoryLabelEn} (Category ${supportDetailed.category})
${isFa ? '• طول بهینه راک‌بولت (L = 2 + 0.15 × Span / ESR):' : '• Bolt Length (L):'} ${supportDetailed.boltLength} m
${isFa ? '• مشخصات شاتکریت مسلح به الیاف فولادی (Sfr):' : '• Steel Fiber-Reinforced Shotcrete (Sfr):'}
  - ${isFa ? 'ضخامت شاتکریت الیافی:' : 'Shotcrete Thickness:'} ${supportDetailed.sfr.thicknessMm} mm (${isFa ? supportDetailed.sfr.thicknessRangeFa : supportDetailed.sfr.thicknessRangeEn})
  - ${isFa ? 'فاصله شبکه‌ای راک‌بولت‌ها:' : 'Bolt Spacing:'} ${isFa ? supportDetailed.sfr.boltSpacingFa : supportDetailed.sfr.boltSpacingEn}
  - ${isFa ? 'رده جذب انرژی الیاف (Energy Absorption):' : 'Energy Absorption Class:'} ${isFa ? supportDetailed.sfr.energyAbsorptionFa : supportDetailed.sfr.energyAbsorptionEn}
  - ${isFa ? 'تیر بتنی مسلح به شاتکریت (RRS):' : 'Reinforced Ribs of Shotcrete (RRS):'} ${isFa ? supportDetailed.sfr.rrsTypeFa : supportDetailed.sfr.rrsTypeEn}

${h3}${isFa ? 'ج) بار سنگ و نگهداری بر اساس RQD (روش دریر و ترزاقی):' : 'C) Rock Load & Support by RQD (Deere & Terzaghi):'}${h3Close}
${isFa ? '• کیفیت سنگ بر اساس RQD:' : '• Quality Grade by RQD:'} ${isFa ? rqdResult.categoryFa : rqdResult.categoryEn} (Grade ${rqdResult.qualityGrade})
${isFa ? '• ارتفاع بار سنگ وارده به سقف (Hp = (100-RQD)/100 × Span):' : '• Rock Load Height (Hp):'} ${rqdResult.rockLoadHeightHp} m
${isFa ? '• فشار قائم بار سنگ بر نگهداری (Pv = γ × Hp):' : '• Vertical Rock Pressure (Pv):'} ${rqdResult.rockLoadPressurePv} kN/m²
${isFa ? '• نگهداری راک‌بولت:' : '• Bolting:'} ${isFa ? rqdResult.rockBoltsFa : rqdResult.rockBoltsEn}
${isFa ? '• شاتکریت پیشنهادی:' : '• Shotcrete:'} ${isFa ? rqdResult.shotcreteFa : rqdResult.shotcreteEn}
${isFa ? '• قاب فولادی:' : '• Steel Sets:'} ${isFa ? rqdResult.steelSetsFa : rqdResult.steelSetsEn}

${h3}${isFa ? 'د) تحلیل پایداری جبهه‌کار تونل و پیش‌نگهداری (Russo 1998):' : 'D) Tunnel Face Stability & Pre-support (Russo 1998):'}${h3Close}
${isFa ? '• تیپ مقطع رفتاری تونل (Section Type):' : '• Section Type:'} ${russoResult.sectionType} (${isFa ? russoResult.classNameFa : russoResult.classNameEn})
${isFa ? '• رده خطر پایداری جبهه‌کار تونل:' : '• Face Hazard Class:'} ${russoResult.hazardCode} - ${isFa ? russoResult.hazardNameFa : russoResult.hazardNameEn}
${isFa ? '• مشخصات خطر جبهه‌کار:' : '• Hazard Description:'} ${isFa ? russoResult.hazardDescFa : russoResult.hazardDescEn}
${isFa ? '• تدابیر پیش‌نگهداری جبهه‌کار (Pre-support Measures):' : '• Pre-support Measures:'}
${russoResult.mitigations.map((m) => `  - [${m.code}] ${isFa ? m.titleFa : m.titleEn}: ${isFa ? m.descFa : m.descEn}`).join('\n')}
${isFa ? '• روش حفاری و گام پیشروی جبهه‌کار:' : '• Face Excavation & Advance:'} ${isFa ? russoResult.excavationMethodFa : russoResult.excavationMethodEn} (${russoResult.advanceRate})

${h3}${isFa ? 'ه) ارزیابی پایداری در عمق و پدیده مچاله‌شوندگی (GSI & Hoek):' : 'E) Squeezing Behavior at Depth (Hoek & GSI):'}${h3Close}
${isFa ? '• رده رفتار تغییرشکلی توده‌سنگ در عمق:' : '• Deformation Behavior Category:'} ${isFa ? gsiSupportResult.behaviorCategoryFa : gsiSupportResult.behaviorCategoryEn}
${isFa ? '• شدت مچاله‌شوندگی توده‌سنگ (Squeezing Severity):' : '• Squeezing Severity:'} ${gsiSupportResult.squeezingSeverity.toUpperCase()}
${isFa ? '• کرنش شعاعی مورد انتظار:' : '• Expected Radial Strain:'} ${gsiSupportResult.strainPercent}%
${isFa ? '• فشار نگهداری داخلی مورد نیاز (Pi):' : '• Required Support Pressure (Pi):'} ${gsiSupportResult.requiredSupportPressurePi} MPa
${isFa ? '• سیستم نگهداری تجویزی برای پایداری در عمق:' : '• Prescribed Deep Support System:'} ${isFa ? gsiSupportResult.supportTypeFa : gsiSupportResult.supportTypeEn}
`;
    }

    if (reportSections.rockLoad) {
      content += `
${h2}${isFa ? '۵. برآورد بار سنگ و تحلیل تنش‌های بازشدگی (Rock Load & Opening Stress Analysis)' : '5. Rock Load & Opening Stress Analysis'}
${h3}${isFa ? 'الف) روش بار سنگ ترزاقی (Terzaghi 1946 - Table 6-8):' : 'A) Terzaghi Rock Load Classification (1946):'}${h3Close}
${isFa ? '• رده توده‌سنگ ترزاقی:' : '• Terzaghi Rock Condition:'} ${isFa ? terzaghiResult.condition.nameFa : terzaghiResult.condition.nameEn} (Class ${terzaghiResult.condition.code})
${isFa ? '• فرمول ارتفاع بار سنگ (Hp):' : '• Rock Load Height Formula:'} ${isFa ? terzaghiResult.condition.hpFormulaFa : terzaghiResult.condition.hpFormulaEn}
${isFa ? '• ارتفاع بار سنگ میانگین:' : '• Mean Rock Load Height (Hp):'} ${terzaghiResult.hpAvg} m (${terzaghiResult.hpMin} - ${terzaghiResult.hpMax} m)
${isFa ? '• فشار قائم وارده به سقف (Pv):' : '• Vertical Rock Pressure (Pv):'} ${terzaghiResult.pvAvgKPa} kPa (${terzaghiResult.pvAvgMPa} MPa)
${isFa ? '• فشار جانبی وارده به دیواره (Ph):' : '• Lateral Pressure (Ph):'} ${terzaghiResult.phAvgKPa} kPa (${isFa ? terzaghiResult.condition.sidePressureNoteFa : terzaghiResult.condition.sidePressureNoteEn})

${h3}${isFa ? 'ب) روش گریمستاد و بارتون بر اساس سیستم Q (Grimstad & Barton 1993):' : 'B) Barton & Grimstad Rock Load (1993):'}${h3Close}
${isFa ? '• رابطه تجربی فشار سقف:' : '• Roof Pressure Formula:'} Pv = (0.2 / Jr) × Q^(-1/3) = ${bartonRockLoadResult.pRoofKPa} kPa (${bartonRockLoadResult.pRoofMPa} MPa)
${isFa ? '• ارتفاع معادل بار سنگ سقف (Hp):' : '• Equivalent Rock Load Height:'} ${bartonRockLoadResult.hpEquivalentM} m
${isFa ? '• فشار جانبی دیواره (Pwall):' : '• Sidewall Pressure (Pwall):'} ${bartonRockLoadResult.pWallKPa} kPa
${isFa ? '• طول بهینه بولت (L):' : '• Recommended Bolt Length (L):'} ${bartonRockLoadResult.boltLengthL} m | ${isFa ? 'حداکثر دهانه خودایستا:' : 'Max Unsupported Span:'} ${bartonRockLoadResult.maxUnsupportedSpan} m

${h3}${isFa ? 'ج) روش تجربی کوردینگ (Cording et al. 1971):' : 'C) Cording et al. Empirical Rock Load (1971):'}${h3Close}
${isFa ? '• ارتفاع بار سقف (Hp = 0.3 B):' : '• Crown Rock Load Height (Hp):'} ${cordingResult.hpCrown} m
${isFa ? '• فشار قائم سقف (Pcrown = γ × Hp):' : '• Vertical Crown Pressure (Pcrown):'} ${cordingResult.pCrownKPa} kPa (${cordingResult.pCrownMPa} MPa)
${isFa ? '• فشار جانبی دیواره:' : '• Sidewall Pressure:'} ${cordingResult.pSidewallKPa} kPa (${isFa ? (rqd > 75 ? 'RQD > 75%: بار ناچیز' : 'نگهداری فعال دیواره الزامی است') : (rqd > 75 ? 'RQD > 75%: Negligible sidewall load' : 'Sidewall support mandatory')})

${h3}${isFa ? 'د) تحلیل الاستوپلاستیک فشار بحرانی هوک (Hoek 1999):' : 'D) Hoek Critical Support Pressure (1999):'}${h3Close}
${isFa ? '• تنش هیدرواستاتیک برجا (Po):' : '• In-situ Hydrostatic Stress (Po):'} ${hoekRockLoadResult.p0HydrostaticMPa} MPa
${isFa ? '• مقاومت فشاری توده‌سنگ (σcm):' : '• Rock Mass Strength (σcm):'} ${hoekRockLoadResult.sigmaCmMPa} MPa
${isFa ? '• زاویه اصطکاک داخلی معادل (φ):' : '• Equivalent Friction Angle (φ):'} ${hoekRockLoadResult.frictionAngleDeg}°
${isFa ? '• فشار بحرانی نگهداری (Pcr):' : '• Critical Support Pressure (Pcr):'} ${Math.max(0, hoekRockLoadResult.criticalPressurePcrKPa)} kPa (${Math.max(0, hoekRockLoadResult.criticalPressurePcrMPa)} MPa)
${isFa ? '• وضعیت پایداری الاستیک / پلاستیک:' : '• Stability Assessment:'} ${isFa ? hoekRockLoadResult.statusMessageFa : hoekRockLoadResult.statusMessageEn}

${h3}${isFa ? 'ه) تنش‌های الاستیک جدار بازشدگی به روش کرش (Kirsch 1898):' : 'E) Kirsch Elastic Boundary Stresses (1898):'}${h3Close}
${isFa ? '• تنش قائم برجا (σv):' : '• Vertical In-situ Stress (σv):'} ${kirschStressResult.sigmaV} MPa | ${isFa ? 'تنش افقی برجا (σh):' : 'Horizontal Stress (σh):'} ${kirschStressResult.sigmaH} MPa (K = ${kRatio})
${isFa ? '• تنش مماسی در تاج و کف (σθ,roof = 3σh - σv):' : '• Tangential Stress at Crown (σθ,roof):'} ${kirschStressResult.sigmaThetaRoof} MPa
${isFa ? '• تنش مماسی در دیواره (σθ,wall = 3σv - σh):' : '• Tangential Stress at Sidewall (σθ,wall):'} ${kirschStressResult.sigmaThetaWall} MPa
${isFa ? '• ریسک پدیده‌های شکست ناشی از تمرکز تنش:' : '• Stress-induced Failure Risk:'} ${isFa ? kirschStressResult.spallingRiskFa : kirschStressResult.spallingRiskEn}

${h3}${isFa ? 'و) بار سنگ بر مبنای RQD مغزه سنگ (Deere 1970):' : 'F) Deere et al. RQD Rock Load (1970):'}${h3Close}
${isFa ? '• ارتفاع بار سنگ سقف (Hp = ((100-RQD)/100) × B):' : '• Rock Load Height (Hp):'} ${deereRockLoadResult.hp} m
${isFa ? '• فشار قائم بار سنگ (Pv = γ × Hp):' : '• Vertical Rock Pressure (Pv):'} ${deereRockLoadResult.pvKPa} kPa (${deereRockLoadResult.pvMPa} MPa)
`;
    }

    if (reportSections.signatures) {
      content += `
${h2}${isFa ? '۶. شناسنامه مهندسی، طراح و تاییدیه پروژه (Engineering Credits & Sign-off)' : '6. Engineering Credits, Designer & Sign-off'}
${isFa ? `• طراح و محاسب پروژه: ${designerName || '---'}${designerTitle ? ` (${designerTitle})` : ''}` : `• Project Designer / Engineer: ${designerName || '---'}${designerTitle ? ` (${designerTitle})` : ''}`}
${isFa ? `• تأییدکننده و ناظر ژئوتکنیک: ${approverName || '---'}${approverTitle ? ` (${approverTitle})` : ''}` : `• Geotechnical Reviewer / Supervisor: ${approverName || '---'}${approverTitle ? ` (${approverTitle})` : ''}`}
${isFa ? '• نام سامانه: طبقه‌بندی و طرح تونل بر اساس روابط تجربی (ورژن ۱.۰)' : '• Software: Tunnel Classification & Empirical Design System (v1.0)'}
${isFa ? '• توسعه‌دهنده نرم‌افزار و مدیر طراحی: سعید جمالی زواره (دکترای مکانیک سنگ)' : '• Software Developer & System Architect: Saeed Jamali Zavareh (Ph.D. in Rock Mechanics)'}
${isFa ? '• ماهیت روابط: کلیه محاسبات بر اساس روابط تجربی استاندارد بین‌المللی مهندسی سنگ (Bieniawski 1989, Barton 2002, Hoek 2002, Russo 1998, Franklin 1971, Weaver 1975, Terzaghi 1946, Cording 1971, Kirsch 1898) انجام پذیرفته است و به عنوان راهنمای مهندسی پایه و پیش‌طراحی پروژه تلقی می‌گردد.' : '• Empirical Foundation: All assessments are derived from standard international rock mechanics empirical correlations (Bieniawski 1989, Barton 2002, Hoek 2002, Russo 1998, Franklin 1971, Weaver 1975, Terzaghi 1946, Cording 1971, Kirsch 1898) and serve as preliminary engineering design guidance.'}
`;
    }

    content += `\n${h1}\n`;
    return content;
  };

  // Copy to Clipboard Action
  const handleCopyReport = async () => {
    try {
      const text = generateReportText('text');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy report:', err);
    }
  };

  // Download Word DOCX (.docx) Action
  const handleDownloadDocx = async () => {
    try {
      setDownloadingDocx(true);
      const reportData: DocxReportData = {
        span,
        depth,
        rmr,
        qValue,
        gsi,
        ucs,
        rqd,
        esr,
        unitWeight,
        kRatio,
        jointSpacing,
        jointSets: jointSets ?? 9,
        pointLoadIs50,
        overburdenStress: Number(((unitWeight * depth) / 1000).toFixed(2)),
        de: currentQResult.equivalentDimension,
        rockClass,
        qResult: currentQResult,
        franklinResult,
        mechanizedResult: gsiExcavResult,
        isakssonResult,
        weaverResult,
        rmrStandUpResult: rmrResult,
        qStandUpResult: currentQResult,
        supportDetailed,
        rmrSupportResult: rmrResult.supportRecommendation,
        rqdSupportResult: rqdResult,
        russoSupportResult: russoResult,
        gsiSupportResult,
        terzaghiResult,
        cordingResult,
        bartonRockLoadResult,
        hoekRockLoadResult,
        kirschStressResult,
        deereRockLoadResult,
        rockLoadComparison,
        groundwaterCondition: isFa
          ? `${effectiveGwCondition.shortLabelFa} (${effectiveGwCondition.inflowRangeFa})`
          : `${effectiveGwCondition.shortLabelEn} (${effectiveGwCondition.inflowRangeEn})`,
        groundwaterRmr: effectiveGwRmr,
        jw: effectiveJw,
        reportDateStr,
        isFa,
        projectTitle,
        designerName,
        designerTitle,
        approverName,
        approverTitle,
        sections: reportSections,
      };

      const { generateDocxBlob } = await import('../../utils/docxExport');
      const blob = await generateDocxBlob(reportData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `Tunnel_Geotechnical_Report_${dateStamp}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate docx:', err);
    } finally {
      setDownloadingDocx(false);
    }
  };

  // Download Direct PDF Action (Guaranteed direct PDF file download, no browser print dialog)
  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const dateStamp = new Date().toISOString().slice(0, 10);
      const fileName = `Tunnel_Geotechnical_Report_${dateStamp}.pdf`;

      // 1. Locate the document element (from visible document or offscreen host)
      let sheetElem = document.getElementById('official-document-sheet');
      if (!sheetElem) {
        sheetElem = document.getElementById('offscreen-official-document-sheet');
      }

      const reportData: DocxReportData = {
        span,
        depth,
        rmr,
        qValue,
        gsi,
        ucs,
        rqd,
        esr,
        unitWeight,
        kRatio,
        jointSpacing,
        jointSets: jointSets ?? 9,
        pointLoadIs50,
        overburdenStress: Number(((unitWeight * depth) / 1000).toFixed(2)),
        de: currentQResult.equivalentDimension,
        rockClass,
        qResult: currentQResult,
        franklinResult,
        mechanizedResult: gsiExcavResult,
        isakssonResult,
        weaverResult,
        rmrStandUpResult: rmrResult,
        qStandUpResult: currentQResult,
        supportDetailed,
        rmrSupportResult: rmrResult.supportRecommendation,
        rqdSupportResult: rqdResult,
        russoSupportResult: russoResult,
        gsiSupportResult,
        terzaghiResult,
        cordingResult,
        bartonRockLoadResult,
        hoekRockLoadResult,
        kirschStressResult,
        deereRockLoadResult,
        rockLoadComparison,
        groundwaterCondition: effectiveGwCondition.shortLabelFa,
        groundwaterRmr: effectiveGwCondition.rmrRating,
        jw: effectiveGwCondition.jwValue,
        reportDateStr,
        isFa,
        projectTitle,
        designerName,
        designerTitle,
        approverName,
        approverTitle,
        sections: reportSections,
      };

      await generateOfficialPdf(sheetElem, reportData, fileName);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Banner & Action Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AppLogo size="lg" className="shrink-0" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>{isFa ? 'گزارش نتایج مهندسی تونل' : 'Tunnel Engineering Results Report'}</span>
              </h2>
              <span className="inline-flex items-center gap-1 h-5 px-2 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10.5px] font-bold border border-blue-500/30">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>{isFa ? 'گزارش تجمیعی' : 'Full Synthesis'}</span>
              </span>
              {activeScenarioName && (
                <span className="inline-flex items-center gap-1 h-5 px-2 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10.5px] font-bold border border-amber-500/30">
                  <Layers className="w-3 h-3 text-amber-400" />
                  <span>{activeScenarioName}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug">
              {isFa
                ? 'خلاصه جامع پارامترهای ورودی، قابلیت حفاری، زمان خودپایداری و سیستم نگهداری (قابل کپی و دانلود فایل)'
                : 'Complete synthesis of input parameters, excavability, stand-up time, and empirical support design'}
            </p>
          </div>
        </div>

        {/* Action Controls: Copy, Download TXT, Download MD, Print */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Copy Report Button */}
          <button
            onClick={handleCopyReport}
            className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/50'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30'
            }`}
            title={isFa ? 'کپی کل گزارش مهندسی در حافظه کلیپ‌بورد' : 'Copy Full Report to Clipboard'}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white animate-bounce" />
                <span>{isFa ? 'کپی شد! ✓' : 'Copied! ✓'}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{isFa ? 'کپی گزارش' : 'Copy Report'}</span>
              </>
            )}
          </button>

          {/* Download DOCX Button */}
          <button
            onClick={handleDownloadDocx}
            disabled={downloadingDocx}
            className="h-9 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-50"
            title={isFa ? 'دریافت فایل رسمی گزارش در فرمت ورد (.docx)' : 'Download Official Word DOCX (.docx)'}
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>{downloadingDocx ? (isFa ? 'درحال ساخت...' : 'Generating...') : (isFa ? 'فایل Word (.docx)' : 'Word (.docx)')}</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-rose-600/30 disabled:opacity-50 ring-1 ring-rose-400/30"
            title={isFa ? 'ذخیره مستقیم گزارش مهندسی در قالب فایل PDF' : 'Save Direct PDF Engineering Report File'}
          >
            {downloadingPdf ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-white" />
            )}
            <span>{downloadingPdf ? (isFa ? 'در حال تولید فایل PDF...' : 'Generating PDF...') : (isFa ? 'دانلود فایل PDF' : 'Download PDF')}</span>
          </button>

          {/* Download MD Button */}
          <button
            onClick={() => {
              const content = generateReportText('markdown');
              const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              const dateStamp = new Date().toISOString().slice(0, 10);
              a.href = url;
              a.download = `Tunnel_Geotechnical_Report_${dateStamp}.md`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="h-9 px-3 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title={isFa ? 'دریافت فایل مارک‌داون (.md)' : 'Download Markdown Report (.md)'}
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>{isFa ? 'فایل .md' : '.md File'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="h-9 px-3 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title={isFa ? 'چاپ یا پرینت سند' : 'Print Document'}
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFa ? 'چاپ' : 'Print'}</span>
          </button>

          {/* Toggle View Mode */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isFa ? 'نمای تفکیکی' : 'Cards'}
            </button>
            <button
              onClick={() => setViewMode('document')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === 'document' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isFa ? 'نمای سندی' : 'Document'}
            </button>
          </div>
        </div>
      </div>

      {/* PDF Download Success Alert */}
      {pdfSuccess && (
        <div className="p-3 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200 shadow-md">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">
              {isFa
                ? 'فایل PDF گزارش رسمی مهندسی با موفقیت تولید و بر روی دستگاه شما ذخیره شد.'
                : 'Official Engineering PDF Report has been generated and saved to your device.'}
            </span>
          </div>
          <button
            onClick={() => setPdfSuccess(false)}
            className="text-emerald-400 hover:text-emerald-200 text-[11px] underline cursor-pointer"
          >
            {isFa ? 'بستن' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Project & Report Metadata Specifications Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-100">
              {isFa ? 'سربرگ و مشخصات پروژه، طراح و تاییدکننده سند گزارش' : 'Project Title & Engineering Sign-off Specifications'}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {isFa ? 'درج خودکار در سند رسمی، فایل Word و PDF' : 'Included in Document, Word & PDF'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          {/* Project Title Field */}
          <div className="space-y-1.5 lg:col-span-1">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
              <span>{isFa ? 'عنوان پروژه تونل‌سازی:' : 'Tunnel Project Title:'}</span>
            </label>
            <input
              type="text"
              value={projectTitle || ''}
              onChange={(e) => onUpdateProjectTitle?.(e.target.value)}
              placeholder={isFa ? 'مثال: تونل انتقال آب کانی سیب - قطعه ۲' : 'e.g. Water Conveyance Tunnel - Section 2'}
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-all"
            />
          </div>

          {/* Designer / Engineer Info */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 lg:col-span-1">
            <div className="text-[11px] font-bold text-blue-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>{isFa ? 'مشخصات طراح و محاسب پروژه:' : 'Project Designer / Engineer:'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={designerName || ''}
                onChange={(e) => onUpdateDesignerName?.(e.target.value)}
                placeholder={isFa ? 'نام و نام خانوادگی طراح' : 'Designer Name'}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-blue-500 text-xs text-slate-100 placeholder:text-slate-500 outline-none"
              />
              <input
                type="text"
                value={designerTitle || ''}
                onChange={(e) => onUpdateDesignerTitle?.(e.target.value)}
                placeholder={isFa ? 'سمت / شرکت مهندسی' : 'Title / Company'}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-blue-500 text-xs text-slate-100 placeholder:text-slate-500 outline-none"
              />
            </div>
          </div>

          {/* Approver / Reviewer Info */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 lg:col-span-1">
            <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isFa ? 'مشخصات تاییدکننده و ناظر ژئوتکنیک:' : 'Reviewer / Supervisor:'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={approverName || ''}
                onChange={(e) => onUpdateApproverName?.(e.target.value)}
                placeholder={isFa ? 'نام و نام خانوادگی ناظر' : 'Supervisor Name'}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-emerald-500 text-xs text-slate-100 placeholder:text-slate-500 outline-none"
              />
              <input
                type="text"
                value={approverTitle || ''}
                onChange={(e) => onUpdateApproverTitle?.(e.target.value)}
                placeholder={isFa ? 'دستگاه نظارت / کارفرما' : 'Supervising Org'}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 focus:border-emerald-500 text-xs text-slate-100 placeholder:text-slate-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Report Sections Selection Checklist */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ListChecks className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold text-slate-100">
                  {isFa ? 'انتخاب بخش‌های مندرج در گزارش (چک‌لیست گزارش)' : 'Report Sections Selection Checklist'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {isFa ? `${activeSectionCount} از ۶ بخش فعال` : `${activeSectionCount} of 6 active`}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isFa
                  ? 'بخش‌های مورد نظر را برای درج در کارت‌های گزارش، سند رسمی، خروجی Word و PDF فعال یا غیرفعال نمایید'
                  : 'Toggle sections to include in the cards view, official document, Word (.docx) and PDF exports'}
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={selectAllSections}
              className="h-7 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700/80 shadow-xs"
              title={isFa ? 'انتخاب تمام بخش‌های گزارش' : 'Select all sections'}
            >
              <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>{isFa ? 'انتخاب همه' : 'Select All'}</span>
            </button>
            <button
              type="button"
              onClick={clearAllSections}
              className="h-7 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700/80 shadow-xs"
              title={isFa ? 'غیرفعال‌سازی همه بخش‌ها' : 'Clear all sections'}
            >
              <Square className="w-3.5 h-3.5 text-slate-400" />
              <span>{isFa ? 'پاک کردن همه' : 'Clear All'}</span>
            </button>
            <button
              type="button"
              onClick={resetDefaultSections}
              className="h-7 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700/80 shadow-xs"
              title={isFa ? 'بازنشانی به حالت پیش‌فرض (همه فعال)' : 'Reset to default (all active)'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'پیش‌فرض' : 'Default'}</span>
            </button>
          </div>
        </div>

        {/* 6 Sections Checklist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {reportSectionDefs.map((def) => {
            const isChecked = !!reportSections[def.key];
            const IconComponent = def.icon;
            return (
              <button
                key={def.key}
                type="button"
                onClick={() => toggleSection(def.key)}
                className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex items-start gap-3 select-none ${
                  isChecked
                    ? 'bg-slate-850/90 border-blue-500/50 shadow-md shadow-blue-950/30 ring-1 ring-blue-500/20'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700/80 opacity-60'
                }`}
              >
                <div
                  className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                    isChecked
                      ? 'bg-blue-600 border-blue-400 text-white'
                      : 'bg-slate-900 border-slate-700 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <IconComponent className={`w-3.5 h-3.5 ${isChecked ? def.colorClass : 'text-slate-500'}`} />
                    <span className={`text-xs font-bold truncate ${isChecked ? 'text-slate-100' : 'text-slate-400'}`}>
                      {isFa ? def.titleFa : def.titleEn}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {isFa ? def.descFa : def.descEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Input Editor Accordion Bar */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 overflow-hidden shadow-lg">
        <button
          onClick={() => setShowQuickInputs(!showQuickInputs)}
          className="w-full p-3.5 px-4 flex items-center justify-between text-start hover:bg-slate-850/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Settings2 className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">
              {isFa
                ? 'تنظیم و ویرایش سریع پارامترهای ورودی تونل (قطر، عمق، RMR، Q، GSI، UCS، RQD و ...)'
                : 'Quick Parameter Adjuster (Span, Depth, RMR, Q, GSI, UCS, RQD...)'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <span>{showQuickInputs ? (isFa ? 'بستن پنل ویرایش' : 'Collapse') : (isFa ? 'ویرایش پارامترها' : 'Edit Values')}</span>
            {showQuickInputs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showQuickInputs && (
          <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/60 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 text-xs">
            {/* 1. Span */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-[11px] font-semibold">{isFa ? 'قطر / دهانه تونل (m):' : 'Tunnel Span (m):'}</span>
                <span className="font-mono font-bold text-blue-400">{span}m</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="20.0"
                step="0.5"
                value={span}
                onChange={(e) => onUpdateSpan(parseFloat(e.target.value))}
                className="accent-blue-500 cursor-pointer"
              />
            </div>

            {/* 2. Depth */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-[11px] font-semibold">{isFa ? 'عمق روباره (m):' : 'Overburden Depth (m):'}</span>
                <span className="font-mono font-bold text-teal-400">{depth}m</span>
              </div>
              <input
                type="range"
                min="10"
                max="1500"
                step="10"
                value={depth}
                onChange={(e) => onUpdateDepth(parseInt(e.target.value, 10))}
                className="accent-teal-500 cursor-pointer"
              />
            </div>

            {/* 3. RMR */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-[11px] font-semibold">{isFa ? 'شاخص RMR بینیاوسکی:' : 'Bieniawski RMR:'}</span>
                <span className="font-mono font-bold text-amber-400">{rmr}</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="1"
                value={rmr}
                onChange={(e) => onUpdateRmr(parseInt(e.target.value, 10))}
                className="accent-amber-500 cursor-pointer"
              />
            </div>

            {/* 4. Q-Value */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-[11px] font-semibold">{isFa ? 'شاخص Q بارتون:' : 'Barton Q-Value:'}</span>
                <span className="font-mono font-bold text-teal-400">{qValue}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="100"
                step="0.05"
                value={qValue}
                onChange={(e) => onUpdateQ(parseFloat(e.target.value))}
                className="accent-teal-500 cursor-pointer"
              />
            </div>

            {/* 5. GSI */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-[11px] font-semibold">{isFa ? 'شاخص مقاومت GSI:' : 'Hoek GSI:'}</span>
                <span className="font-mono font-bold text-purple-400">{gsi}</span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                step="1"
                value={gsi}
                onChange={(e) => onUpdateGsi(parseInt(e.target.value, 10))}
                className="accent-purple-500 cursor-pointer"
              />
            </div>

            {/* 6. UCS */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-[11px] font-semibold">{isFa ? 'مقاومت فشاری UCS (MPa):' : 'Intact UCS (MPa):'}</span>
                <span className="font-mono font-bold text-rose-400">{ucs} MPa</span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="5"
                value={ucs}
                onChange={(e) => onUpdateUcs(parseInt(e.target.value, 10))}
                className="accent-rose-500 cursor-pointer"
              />
            </div>

            {/* 7. RQD */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-[11px] font-semibold">{isFa ? 'شاخص کیفیت RQD (%):' : 'RQD (%):'}</span>
                <span className="font-mono font-bold text-emerald-400">{rqd}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={rqd}
                onChange={(e) => onUpdateRqd(parseInt(e.target.value, 10))}
                className="accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* 8. ESR */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-[11px] font-semibold">{isFa ? 'ضریب کاربری تونل (ESR):' : 'ESR Factor:'}</span>
                <span className="font-mono font-bold text-amber-400">{esr}</span>
              </div>
              <select
                value={esr}
                onChange={(e) => onUpdateEsr(parseFloat(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-slate-200 text-xs"
              >
                <option value={0.8}>{isFa ? '۰.۸ - مغارهای حیاتی و نیروگاه هسته‌ای' : '0.8 - Critical / Nuclear cavern'}</option>
                <option value={1.0}>{isFa ? '۱.۰ - تونل‌های راه‌آهن و جاده‌ای اصلی' : '1.0 - Major highway & rail tunnel'}</option>
                <option value={1.3}>{isFa ? '۱.۳ - مجاری آب و هیدروالکتریک' : '1.3 - Hydroelectric water tunnels'}</option>
                <option value={1.6}>{isFa ? '۱.۶ - بازشدگی‌های دائم معدنی' : '1.6 - Permanent mine openings'}</option>
                <option value={3.0}>{isFa ? '۳.۰ - بازشدگی‌های موقت معدنی' : '3.0 - Temporary mine drifts'}</option>
              </select>
            </div>

            {/* 9. Groundwater Condition */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1.5 sm:col-span-2 lg:col-span-4">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-[11px] font-semibold">{isFa ? 'شرایط آب زیرزمینی (یکپارچه در تمام نرم‌افزار):' : 'Groundwater Conditions (Unified):'}</span>
                <span className="font-mono font-bold text-teal-400">
                  Jw = {effectiveJw} | RMR = {effectiveGwRmr}
                </span>
              </div>
              <select
                value={effectiveGwKey}
                onChange={(e) => onUpdateGroundwaterCondition?.(e.target.value as GroundwaterConditionKey)}
                className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-slate-200 text-xs"
              >
                {Object.values(GROUNDWATER_CONDITIONS).map((cond) => (
                  <option key={cond.key} value={cond.key}>
                    {isFa
                      ? `${cond.shortLabelFa} - ${cond.inflowRangeFa} (Jw: ${cond.jwValue} | امتیاز RMR: ${cond.rmrRating})`
                      : `${cond.shortLabelEn} - ${cond.inflowRangeEn} (Jw: ${cond.jwValue} | RMR: ${cond.rmrRating})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Report Body Container */}
      <div ref={printAreaRef} className="space-y-6">
        {viewMode === 'document' ? (
          <OfficialDocumentView
            span={span}
            depth={depth}
            rmr={rmr}
            qValue={qValue}
            gsi={gsi}
            ucs={ucs}
            rqd={rqd}
            esr={esr}
            unitWeight={unitWeight}
            kRatio={kRatio}
            jointSpacing={jointSpacing}
            jointSets={jointSets}
            pointLoadIs50={pointLoadIs50}
            overburdenStress={Number(((unitWeight * depth) / 1000).toFixed(2))}
            de={currentQResult.equivalentDimension}
            rockClass={rockClass}
            qResult={currentQResult}
            franklinResult={franklinResult}
            mechanizedResult={gsiExcavResult}
            isakssonResult={isakssonResult}
            weaverResult={weaverResult}
            rmrStandUpResult={rmrResult}
            qStandUpResult={currentQResult}
            supportDetailed={supportDetailed}
            rmrSupportResult={rmrResult.supportRecommendation}
            rqdSupportResult={rqdResult}
            russoSupportResult={russoResult}
            gsiSupportResult={gsiSupportResult}
            terzaghiResult={terzaghiResult}
            cordingResult={cordingResult}
            bartonRockLoadResult={bartonRockLoadResult}
            hoekRockLoadResult={hoekRockLoadResult}
            kirschStressResult={kirschStressResult}
            deereRockLoadResult={deereRockLoadResult}
            rockLoadComparison={rockLoadComparison}
            groundwaterCondition={effectiveGwKey}
            groundwaterRmr={effectiveGwRmr}
            jw={effectiveJw}
            reportDateStr={reportDateStr}
            isFa={isFa}
            onCopyToClipboard={handleCopyReport}
            onDownloadDocx={handleDownloadDocx}
            onDownloadPdf={handleDownloadPdf}
            copied={copied}
            docSheetRef={docSheetRef}
            projectTitle={projectTitle}
            onUpdateProjectTitle={onUpdateProjectTitle}
            designerName={designerName}
            onUpdateDesignerName={onUpdateDesignerName}
            designerTitle={designerTitle}
            onUpdateDesignerTitle={onUpdateDesignerTitle}
            approverName={approverName}
            onUpdateApproverName={onUpdateApproverName}
            approverTitle={approverTitle}
            onUpdateApproverTitle={onUpdateApproverTitle}
            sections={reportSections}
          />
        ) : (
          <>
            {/* Empty State when no sections are selected in checklist */}
            {activeSectionCount === 0 && (
              <div className="p-8 sm:p-10 rounded-2xl bg-slate-900/90 border border-dashed border-slate-700 text-center space-y-3.5 shadow-xl">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-200">
                  {isFa ? 'هیچ بخشی برای نمایش در گزارش انتخاب نشده است' : 'No report sections currently selected'}
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  {isFa
                    ? 'برای نمایش نتایج محاسبات، لطفاً از چک‌لیست بالا بخش‌های مورد نظر را انتخاب نمایید یا دکمه «فعال‌سازی همه بخش‌ها» را کلیک کنید.'
                    : 'Please select the desired sections from the checklist above or click "Enable All Sections".'}
                </p>
                <button
                  type="button"
                  onClick={selectAllSections}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>{isFa ? 'فعال‌سازی همه ۶ بخش گزارش' : 'Enable All 6 Report Sections'}</span>
                </button>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION 1: اول پارامترهای ورودی شامل قطر تونل، عمق و مقادیر RMR GSi Q UCS RQD و ... */}
            {/* ========================================================================= */}
            {reportSections.inputs && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                {isFa ? '۱' : '1'}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>{isFa ? 'مشخصات و پارامترهای ورودی پروژه' : 'Project Input Parameters'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isFa
                    ? 'مشخصات هندسی، موقعیت مکانی و مقادیر ژئومکانیکی مبنای محاسبات'
                    : 'Geometry, spatial overburden and geotechnical parameters defining the tunnel model'}
                </p>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{reportDateStr}</span>
            </div>
          </div>

          {/* Group 1: Tunnel Geometry & Scale (Span, Depth, ESR, De) */}
          <div>
            <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5" />
              <span>{isFa ? 'الف) ابعاد هندسی و مقیاس بازشدگی تونل:' : 'A) Tunnel Geometry & Excavation Scale:'}</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">{isFa ? '۱. قطر / دهانه مفید تونل (D):' : '1. Tunnel Span (D):'}</span>
                <span className="font-mono font-bold text-blue-400 text-sm mt-1">{span} m</span>
                <span className="text-[10px] text-slate-500">{isFa ? 'دهانه دهانه بازشدگی' : 'Excavation span'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">{isFa ? '۲. عمق روباره تونل (H):' : '2. Overburden Depth (H):'}</span>
                <span className="font-mono font-bold text-teal-400 text-sm mt-1">{depth} m</span>
                <span className="text-[10px] text-slate-500">{isFa ? 'عمق تا تراز تاج' : 'Crown overburden'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">{isFa ? '۳. ضریب کاربری سازه (ESR):' : '3. Support Ratio (ESR):'}</span>
                <span className="font-mono font-bold text-amber-400 text-sm mt-1">{esr}</span>
                <span className="text-[10px] text-slate-500">{isFa ? 'ضریب کاربری بارتون' : 'Barton ESR'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">{isFa ? '۴. ابعاد معادل مهندسی (De):' : '4. Equivalent Dim (De):'}</span>
                <span className="font-mono font-bold text-sky-400 text-sm mt-1">{currentQResult.equivalentDimension} m</span>
                <span className="text-[10px] text-slate-500">Span / ESR</span>
              </div>
            </div>
          </div>

          {/* Group 2: Overburden Stress & Intact Rock Strength (σv, UCS, Is50, γ, k) */}
          <div>
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>{isFa ? 'ب) تنش‌های روباره و مقاومت تک‌محوری سنگ بکر:' : 'B) Overburden Stress & Intact Rock Strength:'}</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">{isFa ? '۵. تنش قائم روباره (σv):' : '5. Vertical Stress (σv):'}</span>
                <span className="font-mono font-bold text-rose-400 text-sm mt-1">{((unitWeight * depth) / 1000).toFixed(2)} MPa</span>
                <span className="text-[10px] text-slate-500">σv = γ × H</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">{isFa ? '۶. مقاومت فشاری UCS سنگ:' : '6. Intact Rock UCS (σc):'}</span>
                <span className="font-mono font-bold text-rose-300 text-sm mt-1">{ucs} MPa</span>
                <span className="text-[10px] text-slate-500">{isFa ? 'مقاومت تک‌محوری' : 'Uniaxial strength'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">{isFa ? '۷. شاخص بار نقطه‌ای (Is50):' : '7. Point Load Strength (Is50):'}</span>
                <span className="font-mono font-bold text-amber-300 text-sm mt-1">{pointLoadIs50} MPa</span>
                <span className="text-[10px] text-slate-500">{isFa ? 'شاخص مقاومت سنگ' : 'Point load index'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">{isFa ? 'وزن مخصوص سنگ (γ):' : 'Unit Weight (γ):'}</span>
                <span className="font-mono font-bold text-slate-300 text-sm mt-1">{unitWeight} kN/m³</span>
                <span className="text-[10px] text-slate-500">{isFa ? 'چگالی موثر توده‌سنگ' : 'Effective density'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">{isFa ? 'نسبت تنش افقی به قائم (k):' : 'In-situ Stress Ratio (k):'}</span>
                <span className="font-mono font-bold text-cyan-300 text-sm mt-1">{kRatio}</span>
                <span className="text-[10px] text-slate-500">k = σh / σv</span>
              </div>
            </div>
          </div>

          {/* Group 3: Discontinuities & Fractures (Jn, Joint Spacing) */}
          <div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5" />
              <span>{isFa ? 'ج) ساختار شکستگی‌ها، دسته‌درزه‌ها و فاصله‌داری:' : 'C) Discontinuity Structure & Joint Spacing:'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">{isFa ? '۸. عدد دسته‌درزه‌ها در سیستم بارتون (Jn):' : '8. Barton Joint Set Number (Jn):'}</span>
                <span className="font-mono font-bold text-amber-400 text-sm mt-1">Jn = {jointSets}</span>
                <span className="text-[10px] text-slate-400">
                  {jointSets <= 1 ? (isFa ? 'سنگ یکپارچه و بدون درزه' : 'Massive, few joints') :
                   jointSets <= 3 ? (isFa ? '۱ دسته درزه + تصادفی' : '1 joint set + random') :
                   jointSets <= 4 ? (isFa ? '۲ دسته درزه مجزا' : '2 joint sets') :
                   jointSets <= 6 ? (isFa ? '۲ دسته درزه + تصادفی' : '2 joint sets + random') :
                   jointSets <= 9 ? (isFa ? '۳ دسته درزه متقاطع' : '3 joint sets') :
                   jointSets <= 12 ? (isFa ? '۳ دسته درزه + تصادفی' : '3 joint sets + random') :
                   (isFa ? 'توده‌سنگ کاملاً خردشده / ۴ دسته درزه' : 'Heavily jointed / 4+ sets')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">{isFa ? '۹. فاصله‌داری ناپیوستگی‌ها / درزه‌ها (If):' : '9. Discontinuity Spacing (If):'}</span>
                <span className="font-mono font-bold text-sky-400 text-sm mt-1">{jointSpacing} m</span>
                <span className="text-[10px] text-slate-400">{jointSpacing < 0.06 ? (isFa ? 'بسیار کم‌فاصله (< 60mm)' : 'Very close') : jointSpacing < 0.2 ? (isFa ? 'نزدیک (60-200mm)' : 'Close') : jointSpacing < 0.6 ? (isFa ? 'متوسط (0.2-0.6m)' : 'Moderate') : (isFa ? 'عریض (> 0.6m)' : 'Wide')}</span>
              </div>
            </div>
          </div>

          {/* Group 4: Unified Hydrogeological & Groundwater Conditions */}
          <div>
            <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5" />
              <span>{isFa ? 'د) شرایط هیدروژئولوژی و آب زیرزمینی یکپارچه:' : 'D) Hydrogeological & Groundwater Conditions (Unified):'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">{isFa ? '۱۰. وضعیت عمومی آب زیرزمینی:' : '10. General Groundwater Status:'}</span>
                <span className="font-bold text-teal-400 text-sm mt-1">{isFa ? effectiveGwCondition.shortLabelFa : effectiveGwCondition.shortLabelEn}</span>
                <span className="text-[10px] text-slate-400">{isFa ? effectiveGwCondition.inflowRangeFa : effectiveGwCondition.inflowRangeEn}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">{isFa ? 'ضریب کاهش آب بارتون (Jw):' : 'Barton Water Factor (Jw):'}</span>
                <span className="font-mono font-bold text-teal-400 text-sm mt-1">Jw = {effectiveJw}</span>
                <span className="text-[10px] text-slate-400">{isFa ? 'کاهش مقاومت برشی درزه‌ها' : 'Joint shear strength reduction'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">{isFa ? 'امتیاز آب در RMR بینیاوسکی:' : 'RMR Groundwater Rating:'}</span>
                <span className="font-mono font-bold text-indigo-400 text-sm mt-1">{effectiveGwRmr} / 15</span>
                <span className="text-[10px] text-slate-400">{isFa ? `از سقف ۱۵ امتیاز RMR` : 'Out of max 15 points'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">{isFa ? 'فشار آب درزه‌ها / تنش اصلی:' : 'Joint Water Pressure Ratio:'}</span>
                <span className="font-mono font-bold text-cyan-400 text-sm mt-1">{effectiveGwCondition.waterPressureRatio}</span>
                <span className="text-[10px] text-slate-400">{isFa ? 'نسبت فشار آب منفذی' : 'Pore pressure ratio'}</span>
              </div>
            </div>
          </div>

          {/* Group 5: Rock Mass Classification Indices (RQD, RMR, Q, GSI) */}
          <div>
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>{isFa ? 'هـ) شاخص‌های طبقه‌بندی مهندسی توده‌سنگ (RQD, RMR, Q, GSI):' : 'E) Rock Mass Classification Indices (RQD, RMR, Q, GSI):'}</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">{isFa ? '۱۱. شاخص کیفیت مغزه (RQD):' : '11. Core Quality (RQD):'}</span>
                <span className="font-mono font-bold text-emerald-400 text-sm mt-1">{rqd}%</span>
                <span className="text-[10px] text-slate-400">{isFa ? rqdResult.categoryFa : rqdResult.categoryEn}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">{isFa ? '۱۲. شاخص RMR بینیاوسکی:' : '12. Bieniawski RMR89:'}</span>
                <span className="font-mono font-bold text-amber-400 text-sm mt-1">{rmr} / 100</span>
                <span className="text-[10px] text-slate-400">{rmrResult.rockClass.code} ({isFa ? rmrResult.rockClass.nameFa : rmrResult.rockClass.nameEn})</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">{isFa ? '۱۳. شاخص کیفیت Q بارتون:' : '13. Barton Q-Value:'}</span>
                <span className="font-mono font-bold text-teal-400 text-sm mt-1">{qValue}</span>
                <span className="text-[10px] text-slate-400">{isFa ? currentQResult.qClass.nameFa : currentQResult.qClass.nameEn}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">{isFa ? '۱۴. شاخص مقاومت GSI هوک:' : '14. Hoek-Brown GSI:'}</span>
                <span className="font-mono font-bold text-purple-400 text-sm mt-1">{gsi} / 100</span>
                <span className="text-[10px] text-slate-400">σcm: {gsiExcavResult.rockMassStrengthScm} MPa</span>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: جمع بندی قابلیت حفاری */}
        {/* ========================================================================= */}
        {reportSections.excavability && (
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-xs">
              {isFa ? '۲' : '2'}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                <Pickaxe className="w-4 h-4 text-orange-400" />
                <span>{isFa ? 'جمع‌بندی جامع قابلیت حفاری توده‌سنگ (Excavability)' : 'Excavability Assessment Summary'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {isFa
                  ? 'برآورد روش استخراج، ریپرزنی، آتشباری و امکان‌سنجی ماشین‌آلات بر پایه ۴ مدل تجربی'
                  : 'Empirical synthesis of ripping, blasting, drillability, and TBM excavability'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Franklin (1971) Method */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>{isFa ? 'روش فرانکلین (Franklin et al. 1971):' : 'Franklin et al. (1971) Model:'}</span>
                </h4>
                <span
                  className="px-2 py-0.5 rounded-md font-bold text-[11px]"
                  style={{ backgroundColor: `${franklinResult.color}20`, color: franklinResult.color }}
                >
                  {isFa ? franklinResult.categoryNameFa : franklinResult.categoryNameEn}
                </span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFa ? 'روش استخراج پیشنهادی:' : 'Excavation Method:'}</span>
                  <span className="font-bold text-slate-100">{isFa ? franklinResult.excavationMethodFa : franklinResult.excavationMethodEn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFa ? 'ماشین‌آلات استخراج:' : 'Equipment:'}</span>
                  <span className="font-medium text-amber-300">{isFa ? franklinResult.equipmentFa : franklinResult.equipmentEn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFa ? 'شاخص حفرپذیری (Iex = Is50 × If):' : 'Excavability Index (Iex):'}</span>
                  <span className="font-mono text-sky-400">{franklinResult.excavabilityIndexIex} MPa.m</span>
                </div>
                <p className="text-slate-400 text-[11px] pt-1 border-t border-slate-800/60 leading-relaxed">
                  {isFa ? franklinResult.descriptionFa : franklinResult.descriptionEn}
                </p>
              </div>
            </div>

            {/* 2. Mechanized & GSI Method */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <h4 className="font-bold text-purple-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span>{isFa ? 'حفاری مکانیزه هوک و GSI (TBM & Roadheader):' : 'Mechanized Excavation (GSI & Hoek):'}</span>
                </h4>
                <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-purple-500/20 text-purple-300">
                  {isFa ? gsiExcavResult.excavabilityClassFa : gsiExcavResult.excavabilityClassEn}
                </span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFa ? 'مقاومت توده‌سنگ (σcm):' : 'Rock Mass Strength (σcm):'}</span>
                  <span className="font-mono font-bold text-purple-300">{gsiExcavResult.rockMassStrengthScm} MPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFa ? 'امکان‌سنجی TBM و کله‌گاوی:' : 'TBM / Roadheader Feasibility:'}</span>
                  <span className="font-bold text-slate-100">{isFa ? gsiExcavResult.tbmFeasibilityFa : gsiExcavResult.tbmFeasibilityEn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFa ? 'انرژی ویژه حفر (SE):' : 'Specific Energy (SE):'}</span>
                  <span className="font-mono text-amber-400">{gsiExcavResult.specificEnergySE} MJ/m³</span>
                </div>
                <p className="text-slate-400 text-[11px] pt-1 border-t border-slate-800/60 leading-relaxed">
                  {isFa ? gsiExcavResult.drillAndBlastRecommendationFa : gsiExcavResult.drillAndBlastRecommendationEn}
                </p>
              </div>
            </div>

            {/* 3. Isaksson (2002) Blasting & DRI */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <h4 className="font-bold text-teal-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                  <span>{isFa ? 'چالزنی و آتشباری ایساکسون (Isaksson 2002):' : 'Drilling & Blasting (Isaksson 2002):'}</span>
                </h4>
                <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-teal-500/20 text-teal-300">
                  DRI: {isakssonResult.driEstimate} / 100
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10.5px] text-slate-400 block">{isFa ? 'خرج ویژه مواد منفجره:' : 'Specific Charge (q):'}</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{isakssonResult.specificChargeQ} kg/m³</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10.5px] text-slate-400 block">{isFa ? 'متراژ ویژه چالزنی:' : 'Specific Drilling (SD):'}</span>
                  <span className="font-mono font-bold text-sky-400 text-sm">{isakssonResult.specificDrillingSD} m/m³</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10.5px] text-slate-400 block">{isFa ? 'طول پیشروی در هر راند:' : 'Advance per Round:'}</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{isakssonResult.advancePerRound} m</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10.5px] text-slate-400 block">{isFa ? 'ریسک شکست دیواره (Overbreak):' : 'Overbreak Risk:'}</span>
                  <span className="font-bold text-slate-100 text-xs">{isFa ? isakssonResult.overbreakRiskFa : isakssonResult.overbreakRiskEn}</span>
                </div>
              </div>
            </div>

            {/* 4. Weaver (1975) Rippability */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <h4 className="font-bold text-rose-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  <span>{isFa ? 'رده‌بندی ریپرزنی ویور (Weaver 1975 RRC):' : 'Weaver (1975) Rippability:'}</span>
                </h4>
                <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-rose-500/20 text-rose-300 font-mono">
                  {weaverResult.classCode} ({weaverResult.totalRating} pts)
                </span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFa ? 'توصیف قابلیت ریپرزنی:' : 'Rippability Description:'}</span>
                  <span className="font-bold text-slate-100">{isFa ? weaverResult.rippabilityDescriptionFa : weaverResult.rippabilityDescriptionEn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFa ? 'ماشین‌آلات ریپر پیشنهادی:' : 'Recommended Ripper:'}</span>
                  <span className="font-medium text-amber-300">{isFa ? weaverResult.tractorRecommendationFa : weaverResult.tractorRecommendationEn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFa ? 'سرعت برآورد شده موج لرزه‌ای (Vp):' : 'Seismic Velocity (Vp):'}</span>
                  <span className="font-mono text-teal-400">{weaverState.seismicVelocityVp} km/s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: جمع بندی زمان خودپایداری */}
        {/* ========================================================================= */}
        {reportSections.standUpTime && (
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-xs">
              {isFa ? '۳' : '3'}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>{isFa ? 'جمع‌بندی زمان خودپایداری توده‌سنگ (Stand-up Time)' : 'Stand-up Time Assessment Summary'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {isFa
                  ? 'برآورد زمان پایداری دهانه باز بدون نگهداری بر پایه روابط تجربی بینیاوسکی و سیستم Q بارتون'
                  : 'Empirical stand-up time duration and unsupported span capacity by Bieniawski and Barton'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Bieniawski RMR Stand-up Time Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: rmrResult.rockClass.color }} />
                  <span className="font-bold text-slate-200 text-sm">
                    {isFa ? 'روش RMR بینیاوسکی (Bieniawski 1989):' : 'Bieniawski RMR Model:'}
                  </span>
                </div>
                <span
                  className="px-2.5 py-0.5 rounded-full font-bold text-xs font-mono"
                  style={{ backgroundColor: rmrResult.rockClass.bgColor, color: rmrResult.rockClass.textColor }}
                >
                  Class {rmrResult.rockClass.code}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">
                    {isFa ? `زمان خودپایداری برای دهانه ${span} متری:` : `Stand-up Time for ${span}m span:`}
                  </span>
                  <span className="text-base sm:text-lg font-mono font-bold text-amber-300">
                    {isFa ? rmrResult.formattedTimeFa : rmrResult.formattedTimeEn}
                  </span>
                </div>
                <div className="text-end">
                  <span className="text-slate-400 block text-[11px]">{isFa ? 'ساعات کل:' : 'Total Hours:'}</span>
                  <span className="font-mono text-xs text-slate-300">
                    {rmrResult.standUpTimeHours < 1000
                      ? rmrResult.standUpTimeHours.toFixed(1)
                      : rmrResult.standUpTimeHours.toExponential(2)}{' '}
                    hrs
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFa ? 'حداکثر دهانه خودایستای مجاز:' : 'Max Allowable Span:'}</span>
                  <span className="font-mono font-bold text-emerald-400">{rmrResult.maxAllowableSpan} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFa ? 'وضعیت پایداری سقف بازشدگی:' : 'Opening Stability:'}</span>
                  <span
                    className={`font-bold ${
                      rmrResult.status === 'safe'
                        ? 'text-emerald-400'
                        : rmrResult.status === 'warning'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {isFa ? rmrResult.statusMessageFa : rmrResult.statusMessageEn}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] leading-relaxed">
                  <strong>{isFa ? 'مهلت بحرانی نصب نگهداری: ' : 'Critical Installation Window: '}</strong>
                  {isFa
                    ? `سیستم نگهداری موقت بایستی در بازه کمتر از ${rmrResult.formattedTimeFa} پس از آتشباری نصب گردد تا از ریزش و تفکیک سنگ جلوگیری شود.`
                    : `Primary support must be installed within ${rmrResult.formattedTimeEn} before rock mass degradation starts.`}
                </div>
              </div>
            </div>

            {/* Barton Q-System Stand-up Time Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentQResult.qClass.color }} />
                  <span className="font-bold text-slate-200 text-sm">
                    {isFa ? 'روش سیستم Q بارتون (Barton Q-System):' : 'Barton Q-System Model:'}
                  </span>
                </div>
                <span
                  className="px-2.5 py-0.5 rounded-full font-bold text-xs font-mono"
                  style={{ backgroundColor: currentQResult.qClass.bgColor, color: currentQResult.qClass.textColor }}
                >
                  Q = {currentQResult.qValue}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10.5px] text-slate-400 block">{isFa ? 'حداکثر دهانه خودایستا (Smax):' : 'Max Unsupported Span:'}</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">{currentQResult.maxUnsupportedSpan} m</span>
                  <span className="text-[10px] text-slate-400">S_max = 2 × ESR × Q^0.4</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10.5px] text-slate-400 block">{isFa ? 'ضریب پایداری دهانه:' : 'Stability Ratio:'}</span>
                  <span
                    className={`font-mono font-bold text-sm mt-0.5 block ${
                      currentQResult.stabilityRatio >= 1.0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {currentQResult.stabilityRatio} {currentQResult.stabilityRatio >= 1.0 ? (isFa ? '(ایمن)' : '(Safe)') : (isFa ? '(بحرانی)' : '(Critical)')}
                  </span>
                  <span className="text-[10px] text-slate-400">Ratio = S_max / Span</span>
                </div>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFa ? 'وضعیت خودایستایی دهانه:' : 'Self-supporting Status:'}</span>
                  <span className={`font-bold ${currentQResult.isSelfSupporting ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {currentQResult.isSelfSupporting
                      ? (isFa ? '✓ دهانه خودایستا (نیاز به نگهداری فوری ندارد)' : '✓ Self-supporting')
                      : (isFa ? '⚠ دهانه ناپایدار (نیازمند سیستم نگهداری فوری)' : '⚠ Support Required')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFa ? 'طول راک‌بولت برآورد شده (L):' : 'Estimated Bolt Length (L):'}</span>
                  <span className="font-mono font-bold text-amber-400">{currentQResult.boltLength} m</span>
                </div>
                <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-200 text-[11px] leading-relaxed">
                  <strong>{isFa ? 'هم‌ارزی تخمینی: ' : 'Equivalent RMR: '}</strong>
                  RMR(Bieniawski 1976) ≈ {currentQResult.equivalentRmrBieniawski} | RMR(Barton 2002) ≈ {currentQResult.equivalentRmrBarton}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: جمع بندی سیستم نگهداری */}
        {/* ========================================================================= */}
        {reportSections.support && (
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
              {isFa ? '۴' : '4'}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>{isFa ? 'جمع‌بندی جامع سیستم نگهداری تجربی تونل (Support System)' : 'Support System Design Summary'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {isFa
                  ? 'طراحی سیستم نگهداری بر اساس RMR بینیاوسکی، سیستم Q بارتون (الیافی و مش)، بار سنگ RQD و پایداری جبهه‌کار روسو'
                  : 'Comprehensive support synthesis across RMR, Q-system (Sfr & Mesh), RQD rock load, and Russo face support'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Barton Q-System Detailed (Modern Fiber vs Mesh) */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3 md:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                  <span className="font-bold text-teal-300 text-sm">
                    {isFa ? 'الف) طراحی نگهداری به روش نروژی NMT بارتون (بر اساس سیستم Q):' : 'A) Barton Q-System (NMT) Support Design:'}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 font-mono font-bold text-xs border border-teal-500/30">
                  {isFa ? supportDetailed.categoryLabelFa : supportDetailed.categoryLabelEn} (Cat {supportDetailed.category})
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-300 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    <span>{isFa ? 'طرح نگهداری شاتکریت مسلح به الیاف فولادی (Sfr)' : 'Steel Fiber-Reinforced Shotcrete (Sfr)'}</span>
                  </span>
                  <span className="font-mono text-teal-400 font-bold">{supportDetailed.sfr.thicknessMm} mm</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[11px] list-disc list-inside">
                  <li>
                    <strong>{isFa ? 'ضخامت و دامنه:' : 'Thickness Range:'}</strong>{' '}
                    {isFa ? supportDetailed.sfr.thicknessRangeFa : supportDetailed.sfr.thicknessRangeEn}
                  </li>
                  <li>
                    <strong>{isFa ? 'فاصله راک‌بولت‌ها:' : 'Bolt Spacing:'}</strong>{' '}
                    {isFa ? supportDetailed.sfr.boltSpacingFa : supportDetailed.sfr.boltSpacingEn} (L = {supportDetailed.boltLength}m)
                  </li>
                  <li>
                    <strong>{isFa ? 'رده جذب انرژی الیاف:' : 'Energy Class:'}</strong>{' '}
                    <span className="font-mono text-amber-300 font-semibold">{isFa ? supportDetailed.sfr.energyAbsorptionFa : supportDetailed.sfr.energyAbsorptionEn}</span>
                  </li>
                  <li>
                    <strong>{isFa ? 'تیر بتنی شاتکریتی (RRS):' : 'RRS Ribs:'}</strong>{' '}
                    {isFa ? supportDetailed.sfr.rrsTypeFa : supportDetailed.sfr.rrsTypeEn}
                  </li>
                </ul>
                <p className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-800 leading-relaxed">
                  {isFa ? supportDetailed.sfr.summaryFa : supportDetailed.sfr.summaryEn}
                </p>
              </div>
            </div>

            {/* 2. Bieniawski (1989) Empirical Support */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-amber-500/30 space-y-3.5 md:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="font-bold text-amber-300 text-sm">
                    {isFa ? 'ب) دستورالعمل نگهداری و حفاری به روش RMR بینیاوسکی (Bieniawski 1989 - Table 4):' : 'B) Bieniawski (1989) RMR Support & Excavation Guidelines (Table 4):'}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/30">
                  {isFa ? `رده ${rmrResult.rockClass.code} - RMR = ${rmr}` : `Class ${rmrResult.rockClass.code} - RMR = ${rmr}`}
                </span>
              </div>

              {/* Critical Validity Box with the exact user note */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {isFa
                      ? 'نکته کلیدی و محدوده اعتبار سیستم نگهداری RMR بینیاوسکی:'
                      : 'Key Note & Validity Scope of Bieniawski (1989) Support System:'}
                  </span>
                </div>
                <p className="text-xs text-amber-100 font-semibold leading-relaxed bg-amber-500/15 p-2 rounded-lg border border-amber-500/25">
                  {isFa
                    ? 'این روش برای تونل نعل اسبی با دهانه ۱۰ متر، تنش قائم کمتر از ۲۵ مگاپاسکال و روش ساخت حفاری و انفجار معتبر است'
                    : 'This method is valid for horseshoe-shaped tunnels with a 10 m span, vertical stress of less than 25 MPa, and drill & blast construction method.'}
                </p>
                {/* 4 Governing Conditions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">{isFa ? 'شکل هندسی مقطع:' : 'Cross-section Shape:'}</span>
                    <span className="font-bold text-slate-200">{isFa ? 'نعل‌اسبی (Horseshoe)' : 'Horseshoe'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">{isFa ? 'دهانه مرجع مبنا:' : 'Reference Span:'}</span>
                    <span className="font-bold text-amber-300 font-mono">{isFa ? '۱۰ متر' : '10 m'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">{isFa ? 'حداکثر تنش قائم (σv):' : 'Max Vertical Stress (σv):'}</span>
                    <span className="font-bold text-amber-300 font-mono">{isFa ? '< ۲۵ مگاپاسکال' : '< 25 MPa'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">{isFa ? 'روش ساخت و احداث:' : 'Construction Method:'}</span>
                    <span className="font-bold text-slate-200">{isFa ? 'حفاری و انفجار (D&B)' : 'Drill & Blast'}</span>
                  </div>
                </div>
              </div>

              {/* 4 Main Support Components (Excavation, Bolts, Shotcrete, Steel Sets) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{isFa ? '۱. روش و گام پیشروی حفاری (Excavation):' : '1. Excavation Method & Advance:'}</span>
                  </div>
                  <p className="text-slate-200 text-[11.5px] leading-relaxed">
                    {isFa ? rmrResult.rockClass.excavationMethodFa : rmrResult.rockClass.excavationMethodEn}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                    <Hammer className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{isFa ? '۲. راک‌بولت‌ها (Rock Bolts - قطر ۲۰mm):' : '2. Rock Bolts (20mm diam.):'}</span>
                  </div>
                  <p className="text-slate-200 text-[11.5px] leading-relaxed">
                    {isFa ? rmrResult.rockClass.rockBoltsFa : rmrResult.rockClass.rockBoltsEn}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{isFa ? '۳. شاتکریت و بتن پاشنده (Shotcrete):' : '3. Shotcrete & Mesh:'}</span>
                  </div>
                  <p className="text-slate-200 text-[11.5px] leading-relaxed">
                    {isFa ? rmrResult.rockClass.shotcreteFa : rmrResult.rockClass.shotcreteEn}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                    <Shield className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{isFa ? '۴. قاب‌های فولادی و اینورت (Steel Sets & Invert):' : '4. Steel Sets & Invert:'}</span>
                  </div>
                  <p className="text-slate-200 text-[11.5px] leading-relaxed">
                    {isFa ? rmrResult.rockClass.steelSetsFa : rmrResult.rockClass.steelSetsEn}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. RQD Rock Load & Support (Deere & Terzaghi) */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{isFa ? 'ج) بار سنگ و نگهداری بر اساس RQD (ترزاقی و دیر):' : 'C) Rock Load & Support by RQD:'}</span>
                </h4>
                <span className="font-mono font-bold text-emerald-400">RQD = {rqd}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{isFa ? 'ارتفاع بار سنگ سقف (Hp):' : 'Rock Load Height (Hp):'}</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{rqdResult.rockLoadHeightHp} m</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{isFa ? 'فشار قائم بار سنگ (Pv):' : 'Rock Load Pressure (Pv):'}</span>
                  <span className="font-mono font-bold text-sky-400 text-sm">{rqdResult.rockLoadPressurePv} kN/m²</span>
                </div>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                <li>
                  <strong className="text-slate-400">{isFa ? 'بولت‌گذاری:' : 'Bolts:'}</strong> {isFa ? rqdResult.rockBoltsFa : rqdResult.rockBoltsEn}
                </li>
                <li>
                  <strong className="text-slate-400">{isFa ? 'شاتکریت:' : 'Shotcrete:'}</strong> {isFa ? rqdResult.shotcreteFa : rqdResult.shotcreteEn}
                </li>
                <li>
                  <strong className="text-slate-400">{isFa ? 'قاب فولادی:' : 'Steel Ribs:'}</strong> {isFa ? rqdResult.steelSetsFa : rqdResult.steelSetsEn}
                </li>
              </ul>
            </div>

            {/* 4. Russo (1998) Face Stability & Pre-support */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <h4 className="font-bold text-rose-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  <span>{isFa ? 'د) پایداری جبهه‌کار و پیش‌نگهداری (Russo et al. 1998):' : 'D) Face Stability & Pre-support (Russo):'}</span>
                </h4>
                <span className="font-mono font-bold text-rose-400 text-xs">{russoResult.sectionType}</span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFa ? 'رده خطر پایداری جبهه‌کار:' : 'Face Hazard Code:'}</span>
                  <span className="font-bold text-rose-300">{russoResult.hazardCode} ({isFa ? russoResult.hazardNameFa : russoResult.hazardNameEn})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFa ? 'دامنه رفتار مکانیکی سنگ:' : 'Behavioral Domain:'}</span>
                  <span className="font-mono text-slate-200">{russoResult.behaviorDomain}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                  <span className="text-slate-400 block font-semibold">{isFa ? 'تدابیر پیش‌نگهداری جبهه‌کار (Pre-support):' : 'Pre-support Measures:'}</span>
                  {russoResult.mitigations.map((m) => (
                    <div key={m.code} className="flex items-start gap-1.5 text-slate-300">
                      <span className="font-mono font-bold text-amber-400 shrink-0">[{m.code}]</span>
                      <span>{isFa ? m.titleFa : m.titleEn}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Hoek Deep Squeezing Assessment */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <h4 className="font-bold text-purple-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span>{isFa ? 'ه) تحلیل فشردگی سنگ در عمق (Hoek Squeezing & GSI):' : 'E) Hoek Squeezing at Depth (GSI):'}</span>
                </h4>
                <span className="font-mono font-bold text-purple-400 text-xs">{gsiSupportResult.squeezingSeverity.toUpperCase()}</span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFa ? 'شدت پدیده مچاله‌شوندگی:' : 'Squeezing Severity:'}</span>
                  <span className="font-bold text-slate-100">{isFa ? gsiSupportResult.behaviorCategoryFa : gsiSupportResult.behaviorCategoryEn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFa ? 'کرنش شعاعی مورد انتظار:' : 'Expected Radial Strain:'}</span>
                  <span className="font-mono text-purple-400 font-bold">{gsiSupportResult.strainPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFa ? 'فشار نگهداری مورد نیاز (Pi):' : 'Required Support Pressure (Pi):'}</span>
                  <span className="font-mono text-amber-400 font-bold">{gsiSupportResult.requiredSupportPressurePi} MPa</span>
                </div>
                <p className="text-slate-400 text-[11px] pt-1 border-t border-slate-800/60 leading-relaxed">
                  {isFa ? gsiSupportResult.supportTypeFa : gsiSupportResult.supportTypeEn}
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 5: برآورد بار سنگ و تحلیل تنش‌های بازشدگی */}
        {/* ========================================================================= */}
        {reportSections.rockLoad && (
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
                    <Weight className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                      {isFa
                        ? '۵. برآورد بار سنگ و تحلیل تنش‌های بازشدگی (Rock Load & Opening Stress Analysis)'
                        : '5. Rock Load & Opening Boundary Stress Analysis'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {isFa
                        ? 'محاسبه بارهای وارده به سقف و دیواره به روش‌های ترزاقی، بارتون، کوردینگ، هوک، کرش و دیر'
                        : 'Terzaghi, Barton, Cording, Hoek, Kirsch, and Deere rock load calculations'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 text-xs font-mono font-bold">
                    Span B = {span} m | Depth H = {depth} m
                  </span>
                </div>
              </div>

              {/* Grid of 6 Rock Load Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Terzaghi */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span>{isFa ? 'روش ترزاقی (Terzaghi 1946):' : 'Terzaghi Method (1946):'}</span>
                    </h4>
                    <span className="font-mono font-bold text-amber-300 text-xs">Class {terzaghiResult.condition.code}</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                      <span className="text-slate-400 block text-[10px]">{isFa ? 'رده توده‌سنگ و رابطه ارتفاع بار سنگ:' : 'Rock condition & formula:'}</span>
                      <span className="font-semibold text-slate-200">{isFa ? terzaghiResult.condition.nameFa : terzaghiResult.condition.nameEn}</span>
                      <span className="font-mono text-amber-300 block text-[10px] mt-0.5">{isFa ? terzaghiResult.condition.hpFormulaFa : terzaghiResult.condition.hpFormulaEn}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{isFa ? 'ارتفاع بار سنگ (Hp):' : 'Load Height (Hp):'}</span>
                        <span className="font-mono font-bold text-amber-300 text-xs">{terzaghiResult.hpAvg} m</span>
                        <span className="text-[9px] text-slate-500 block">({terzaghiResult.hpMin} - {terzaghiResult.hpMax} m)</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{isFa ? 'فشار سقف (Pv):' : 'Roof Pressure (Pv):'}</span>
                        <span className="font-mono font-bold text-slate-200 text-xs">{terzaghiResult.pvAvgKPa} kPa</span>
                        <span className="text-[9px] text-slate-400 block">{terzaghiResult.pvAvgMPa} MPa</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{isFa ? 'فشار جانبی دیواره (Ph):' : 'Sidewall Pressure (Ph):'}</span>
                      <span className="font-mono font-bold text-slate-300">{terzaghiResult.phAvgKPa} kPa</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{isFa ? terzaghiResult.condition.sidePressureNoteFa : terzaghiResult.condition.sidePressureNoteEn}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Grimstad & Barton */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>{isFa ? 'بارتون و گریمستاد (Q 1993):' : 'Grimstad & Barton (1993):'}</span>
                    </h4>
                    <span className="font-mono font-bold text-emerald-300 text-xs">Q = {qValue}</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px]">
                      Pv = (0.2 / Jr) × Q^(-1/3) = {bartonRockLoadResult.pRoofKPa} kPa
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{isFa ? 'معادل بار سنگ سقف:' : 'Eq. Height (Hp):'}</span>
                        <span className="font-mono font-bold text-emerald-300 text-xs">{bartonRockLoadResult.hpEquivalentM} m</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{isFa ? 'فشار سقف (Pv):' : 'Roof Pressure (Pv):'}</span>
                        <span className="font-mono font-bold text-slate-200 text-xs">{bartonRockLoadResult.pRoofKPa} kPa</span>
                        <span className="text-[9px] text-slate-400 block">{bartonRockLoadResult.pRoofMPa} MPa</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5 text-[10px]">
                      <div><strong className="text-slate-400">{isFa ? 'فشار دیواره:' : 'Wall Pressure:'}</strong> <span className="font-mono">{bartonRockLoadResult.pWallKPa} kPa</span></div>
                      <div><strong className="text-slate-400">{isFa ? 'طول بولت L:' : 'Bolt Length L:'}</strong> <span className="font-mono">{bartonRockLoadResult.boltLengthL} m</span></div>
                      <div><strong className="text-slate-400">{isFa ? 'دهانه خودایستا:' : 'Max Span:'}</strong> <span className="font-mono">{bartonRockLoadResult.maxUnsupportedSpan} m</span></div>
                    </div>
                  </div>
                </div>

                {/* 3. Cording et al. */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <h4 className="font-bold text-blue-400 flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      <span>{isFa ? 'روش کوردینگ (Cording 1971):' : 'Cording et al. (1971):'}</span>
                    </h4>
                    <span className="font-mono font-bold text-blue-300 text-xs">Hp = 0.3 B</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px]">
                      Hp = 0.3 × {span} = {cordingResult.hpCrown} m | RQD = {rqd}%
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{isFa ? 'بار سنگ سقف:' : 'Crown Load (Hp):'}</span>
                        <span className="font-mono font-bold text-blue-300 text-xs">{cordingResult.hpCrown} m</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{isFa ? 'فشار قائم سقف:' : 'Crown Pressure:'}</span>
                        <span className="font-mono font-bold text-slate-200 text-xs">{cordingResult.pCrownKPa} kPa</span>
                        <span className="text-[9px] text-slate-400 block">{cordingResult.pCrownMPa} MPa</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{isFa ? 'فشار جانبی دیواره:' : 'Sidewall Pressure:'}</span>
                      <span className="font-mono font-bold text-slate-300">{cordingResult.pSidewallKPa} kPa</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{isFa ? (rqd > 75 ? 'RQD > 75%: بار ناچیز' : 'نگهداری فعال دیواره الزامی است') : (rqd > 75 ? 'RQD > 75%: Negligible' : 'Mandatory support')}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Hoek Critical Pressure */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <h4 className="font-bold text-purple-400 flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      <span>{isFa ? 'فشار بحرانی هوک (Hoek 1999):' : 'Hoek Critical Support (1999):'}</span>
                    </h4>
                    <span className="font-mono font-bold text-purple-300 text-xs">Pcr</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px] space-y-0.5">
                      <div>Po = {hoekRockLoadResult.p0HydrostaticMPa} MPa | σcm = {hoekRockLoadResult.sigmaCmMPa} MPa</div>
                      <div>φ = {hoekRockLoadResult.frictionAngleDeg}° | GSI = {gsi}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{isFa ? 'فشار بحرانی (Pcr):' : 'Critical Support (Pcr):'}</span>
                        <span className="font-mono font-bold text-purple-300 text-xs">{Math.max(0, hoekRockLoadResult.criticalPressurePcrKPa)} kPa</span>
                        <span className="text-[9px] text-slate-400 block">{Math.max(0, hoekRockLoadResult.criticalPressurePcrMPa)} MPa</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{isFa ? 'وضعیت پایداری:' : 'Stability Status:'}</span>
                        <span className={`text-[10px] font-bold block ${hoekRockLoadResult.requiresSupport ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {isFa ? (hoekRockLoadResult.requiresSupport ? 'نیازمند نگهداری داخلی' : 'الاستیک پایدار') : (hoekRockLoadResult.requiresSupport ? 'Yielding' : 'Elastic')}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {isFa ? hoekRockLoadResult.statusMessageFa : hoekRockLoadResult.statusMessageEn}
                    </p>
                  </div>
                </div>

                {/* 5. Kirsch Elastic Stresses */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <h4 className="font-bold text-pink-400 flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                      <span>{isFa ? 'تنش‌های کرش (Kirsch 1898):' : 'Kirsch Elastic Stresses:'}</span>
                    </h4>
                    <span className="font-mono font-bold text-pink-300 text-xs">K = {kRatio}</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px]">
                      σv = {kirschStressResult.sigmaV} MPa | σh = {kirschStressResult.sigmaH} MPa
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{isFa ? 'تنش مماسی تاج:' : 'Crown Hoop (σθ):'}</span>
                        <span className="font-mono font-bold text-pink-300 text-xs">{kirschStressResult.sigmaThetaRoof} MPa</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{isFa ? 'تنش مماسی دیواره:' : 'Wall Hoop (σθ):'}</span>
                        <span className="font-mono font-bold text-slate-200 text-xs">{kirschStressResult.sigmaThetaWall} MPa</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                      {isFa ? kirschStressResult.spallingRiskFa : kirschStressResult.spallingRiskEn}
                    </div>
                  </div>
                </div>

                {/* 6. Deere et al. RQD */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <h4 className="font-bold text-cyan-400 flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <span>{isFa ? 'روش دیر بر مبنای RQD (1970):' : 'Deere et al. RQD (1970):'}</span>
                    </h4>
                    <span className="font-mono font-bold text-cyan-300 text-xs">RQD = {rqd}%</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px]">
                      Hp = ((100 - {rqd}) / 100) × {span} = {deereRockLoadResult.hp} m
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{isFa ? 'ارتفاع بار سنگ:' : 'Load Height (Hp):'}</span>
                        <span className="font-mono font-bold text-cyan-300 text-xs">{deereRockLoadResult.hp} m</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{isFa ? 'فشار بار سنگ سقف:' : 'Roof Pressure (Pv):'}</span>
                        <span className="font-mono font-bold text-slate-200 text-xs">{deereRockLoadResult.pvKPa} kPa</span>
                        <span className="text-[9px] text-slate-400 block">{deereRockLoadResult.pvMPa} MPa</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                      {isFa ? 'برآورد بار سست ناشی از خردشدگی مغزه در تاج تونل' : 'Dead load of loose core fractures at crown'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Synthesis & Engineering Guidance */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-2 font-bold text-cyan-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>{isFa ? 'جمع‌بندی مهندسی بار سنگ و انتخاب پوشش طراحی:' : 'Rock Load Synthesis & Design Guidance:'}</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {isFa
                    ? `دامنه فشار بار سنگ سقف حاصل از روش‌های تجربی بین ${Math.min(terzaghiResult.pvAvgKPa, cordingResult.pCrownKPa, bartonRockLoadResult.pRoofKPa)} تا ${Math.max(terzaghiResult.pvAvgKPa, cordingResult.pCrownKPa, bartonRockLoadResult.pRoofKPa)} کیلوپاسکال محاسبه شده است. در صورت نیاز به کنترل گسیختگی الاستوپلاستیک عمیق، فشار بحرانی هوک برابر ${hoekRockLoadResult.criticalPressurePcrKPa} کیلوپاسکال می‌باشد.`
                    : `Empirical roof support pressure ranges between ${Math.min(terzaghiResult.pvAvgKPa, cordingResult.pCrownKPa, bartonRockLoadResult.pRoofKPa)} and ${Math.max(terzaghiResult.pvAvgKPa, cordingResult.pCrownKPa, bartonRockLoadResult.pRoofKPa)} kPa. For deep elastoplastic yield containment, Hoek critical pressure is ${hoekRockLoadResult.criticalPressurePcrKPa} kPa.`}
                </p>
              </div>
            </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION 6: شناسنامه فنی و اعتبارنامه سامانه */}
            {/* ========================================================================= */}
            {reportSections.signatures && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  {isFa
                    ? 'توسعه‌دهنده نرم‌افزار و مدیر طراحی سامانه: سعید جمالی زواره (دکترای مکانیک سنگ) | ورژن ۱.۰'
                    : 'Software Developer & System Architect: Saeed Jamali Zavareh (Ph.D. in Rock Mechanics) | Version 1.0'}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span>{isFa ? 'کد شناسایی گزارش:' : 'Report Hash:'}</span>
                <span className="text-slate-300">GEO-{Date.now().toString(36).toUpperCase()}</span>
              </div>
            </div>
            )}
          </>
        )}
      </div>

      {/* Offscreen host ensuring official-document-sheet is always mounted and ready for instant PDF generation */}
      {viewMode === 'cards' && (
        <div
          id="offscreen-pdf-host"
          aria-hidden="true"
          className="fixed -left-[99999px] top-0 pointer-events-none opacity-0 -z-50 w-[210mm] bg-white text-slate-900"
        >
          <OfficialDocumentView
            span={span}
            depth={depth}
            rmr={rmr}
            qValue={qValue}
            gsi={gsi}
            ucs={ucs}
            rqd={rqd}
            esr={esr}
            unitWeight={unitWeight}
            kRatio={kRatio}
            jointSpacing={jointSpacing}
            jointSets={jointSets}
            pointLoadIs50={pointLoadIs50}
            overburdenStress={Number(((unitWeight * depth) / 1000).toFixed(2))}
            de={currentQResult.equivalentDimension}
            rockClass={rockClass}
            qResult={currentQResult}
            franklinResult={franklinResult}
            mechanizedResult={gsiExcavResult}
            isakssonResult={isakssonResult}
            weaverResult={weaverResult}
            rmrStandUpResult={rmrResult}
            qStandUpResult={currentQResult}
            supportDetailed={supportDetailed}
            rmrSupportResult={rmrResult.supportRecommendation}
            rqdSupportResult={rqdResult}
            russoSupportResult={russoResult}
            gsiSupportResult={gsiSupportResult}
            terzaghiResult={terzaghiResult}
            cordingResult={cordingResult}
            bartonRockLoadResult={bartonRockLoadResult}
            hoekRockLoadResult={hoekRockLoadResult}
            kirschStressResult={kirschStressResult}
            deereRockLoadResult={deereRockLoadResult}
            rockLoadComparison={rockLoadComparison}
            groundwaterCondition={effectiveGwKey}
            groundwaterRmr={effectiveGwRmr}
            jw={effectiveJw}
            reportDateStr={reportDateStr}
            isFa={isFa}
            onCopyToClipboard={handleCopyReport}
            onDownloadDocx={handleDownloadDocx}
            onDownloadPdf={handleDownloadPdf}
            copied={copied}
            projectTitle={projectTitle}
            onUpdateProjectTitle={onUpdateProjectTitle}
            designerName={designerName}
            onUpdateDesignerName={onUpdateDesignerName}
            designerTitle={designerTitle}
            onUpdateDesignerTitle={onUpdateDesignerTitle}
            approverName={approverName}
            onUpdateApproverName={onUpdateApproverName}
            approverTitle={approverTitle}
            onUpdateApproverTitle={onUpdateApproverTitle}
            sections={reportSections}
          />
        </div>
      )}
    </div>
  );
};
