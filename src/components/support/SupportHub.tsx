import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Shield,
  Layers,
  Hammer,
  Sliders,
  Table,
  Eye,
  Info,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Grid,
  FileSpreadsheet,
  Activity,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import {
  SupportSubTab,
  RockClassInfo,
  QCalculationResult,
} from '../../types';
import {
  calculateRqdSupport,
  calculateRussoSupport,
  calculateGsiSupport,
} from '../../utils/supportCalculation';
import { ROCK_CLASSES, RMR_SUPPORT_VALIDITY_NOTE } from '../../utils/rmrCalculation';
import { getBartonSupportDetailed } from '../../utils/qCalculation';
import { checkGeotechnicalConsistency } from '../../utils/consistencyValidation';
import { GeotechnicalWarningBanner } from '../GeotechnicalWarningBanner';
import { BartonSupportChart } from './BartonSupportChart';
import { RussoMultipleGraphChart } from './RussoMultipleGraphChart';

interface SupportHubProps {
  currentSpan: number;
  currentRmr: number;
  currentQ: number;
  currentEsr: number;
  currentGsi: number;
  currentRqd: number;
  currentDepth: number;
  currentUcs: number;
  currentJointSpacing?: number;
  currentJointSets?: number;
  rockClass: RockClassInfo;
  qResult: QCalculationResult;
  onUpdateSpan: (span: number) => void;
  onUpdateRmr: (rmr: number) => void;
  onUpdateQ: (q: number) => void;
  onUpdateGsi: (gsi: number) => void;
  onUpdateRqd: (rqd: number) => void;
  onUpdateDepth: (depth: number) => void;
  onUpdateUcs: (ucs: number) => void;
  onUpdateJointSpacing?: (spacing: number) => void;
  onUpdateJointSets?: (jointSets: number) => void;
  onNavigateToGsiClassification?: () => void;
  onNavigateToQClassification?: () => void;
  onNavigateToRmrClassification?: () => void;
  lang: 'fa' | 'en';
}

export const SupportHub: React.FC<SupportHubProps> = ({
  currentSpan,
  currentRmr,
  currentQ,
  currentEsr,
  currentGsi,
  currentRqd,
  currentDepth,
  currentUcs,
  currentJointSpacing,
  currentJointSets,
  rockClass,
  qResult,
  onUpdateSpan,
  onUpdateRmr,
  onUpdateQ,
  onUpdateGsi,
  onUpdateRqd,
  onUpdateDepth,
  onUpdateUcs,
  onUpdateJointSpacing,
  onUpdateJointSets,
  onNavigateToGsiClassification,
  onNavigateToQClassification,
  onNavigateToRmrClassification,
  lang,
}) => {
  const isFa = lang === 'fa';
  const [activeSubTab, setActiveSubTab] = useState<SupportSubTab>('rmr');

  // Multi-method geotechnical consistency validation (RMR vs GSI vs Q)
  const consistencyReport = useMemo(() => {
    return checkGeotechnicalConsistency(currentRmr, currentGsi, currentQ);
  }, [currentRmr, currentGsi, currentQ]);

  // Globally unified Depth and UCS (synchronized across RMR, Q, Excavability, and Support)
  const overburdenDepth = currentDepth;
  const setOverburdenDepth = onUpdateDepth;
  const intactUcs = currentUcs;
  const setIntactUcs = onUpdateUcs;
  const [kRatio, setKRatio] = useState<number>(1.0); // in-situ stress ratio sigma_h / sigma_v
  const [brittlenessIf, setBrittlenessIf] = useState<number>(10); // Brittleness Index If = sigma_c / sigma_t

  // Calculate methods
  const rqdResult = useMemo(() => {
    return calculateRqdSupport(currentRqd, currentSpan);
  }, [currentRqd, currentSpan]);

  const russoResult = useMemo(() => {
    return calculateRussoSupport(
      currentGsi,
      currentSpan,
      overburdenDepth,
      intactUcs,
      25,
      kRatio,
      brittlenessIf
    );
  }, [currentGsi, currentSpan, overburdenDepth, intactUcs, kRatio, brittlenessIf]);

  const gsiResult = useMemo(() => {
    return calculateGsiSupport(currentGsi, currentSpan, overburdenDepth, intactUcs);
  }, [currentGsi, currentSpan, overburdenDepth, intactUcs]);

  const supportDetailed = useMemo(() => {
    return qResult.supportDetailed || getBartonSupportDetailed(currentQ, currentSpan, currentEsr);
  }, [qResult.supportDetailed, currentQ, currentSpan, currentEsr]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Overview Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>{isFa ? 'سامانه جامع تخمین و طراحی سیستم نگهداری تونل' : 'Comprehensive Tunnel Support Design Hub'}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium">
                5 Methods
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {isFa
                ? 'ارزیابی و مقایسه سیستم نگهداری بر اساس ۵ روش تجربی استاندارد: RMR بینیاوسکی، سیستم Q بارتون، GSI هوک، RQD دیر و روش Russo (2014) Multiple Graph'
                : 'Support system assessment based on Bieniawski RMR, Barton Q, Hoek GSI, Deere RQD & Russo (2014) Multiple Graph'}
            </p>
          </div>
        </div>

        {/* Global parameter quick controls */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">{isFa ? 'دهانه تونل (Span):' : 'Span:'}</span>
            <span className="font-mono font-bold text-emerald-300">{currentSpan}m</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">RMR:</span>
            <span className="font-mono font-bold text-amber-300">{currentRmr}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Q:</span>
            <span className="font-mono font-bold text-teal-300">{currentQ}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">GSI:</span>
            <span className="font-mono font-bold text-purple-300">{currentGsi}</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <button
          onClick={() => setActiveSubTab('rmr')}
          className={`px-2 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center leading-tight ${
            activeSubTab === 'rmr'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span>{isFa ? '۱. روش RMR بینیاوسکی' : '1. Bieniawski RMR'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('q')}
          className={`px-2 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center leading-tight ${
            activeSubTab === 'q'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-teal-300 shrink-0" />
          <span>{isFa ? '۲. سیستم Q بارتون' : '2. Barton Q'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gsi')}
          className={`px-2 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center leading-tight ${
            activeSubTab === 'gsi'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Grid className="w-3.5 h-3.5 text-purple-300 shrink-0" />
          <span>{isFa ? '۳. روش GSI هوک' : '3. Hoek GSI'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rqd')}
          className={`px-2 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center leading-tight ${
            activeSubTab === 'rqd'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-sky-300 shrink-0" />
          <span>{isFa ? '۴. روش RQD دیر' : '4. Deere RQD'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('russo')}
          className={`px-2 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center leading-tight ${
            activeSubTab === 'russo'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Wrench className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
          <span>{isFa ? '۵. روش Russo (2014)' : '5. Russo Multiple Graph'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('comparison')}
          className={`px-2 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center leading-tight ${
            activeSubTab === 'comparison'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Table className="w-3.5 h-3.5 shrink-0" />
          <span>{isFa ? 'مقایسه و جمع‌بندی جامع روش‌ها' : 'Cross-Comparison & Synthesis'}</span>
        </button>
      </div>

      {/* Global Interactive Sliders Box */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-300 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold text-slate-100">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isFa ? 'تنظیم متغیرهای طراحی مهندسی نگهداری:' : 'Interactive Engineering Support Inputs:'}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[11px] font-medium inline-flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-teal-400" />
              <span>
                {isFa
                  ? 'مقادیر RMR، Q، GSI و RQD مستقیماً متصل و هماهنگ با بخش طبقه‌بندی مهندسی سنگ هستند'
                  : 'RMR, Q, GSI & RQD values are fully synchronized with Rock Engineering Classification'}
              </span>
            </span>
          </div>
          <span className="text-slate-400 text-[11px] font-normal">
            {isFa ? 'تغییر همزمان پارامترها تمام ۵ روش را به روزرسانی می‌کند' : 'Modifying inputs reactively recalculates all 5 methods'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 text-xs">
          {/* Tunnel Span */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <div className="flex justify-between text-slate-300 font-medium">
              <span>{isFa ? 'دهانه تونل (B):' : 'Tunnel Span:'}</span>
              <span className="font-mono font-bold text-emerald-400">{currentSpan} m</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="20"
              step="0.5"
              value={currentSpan}
              onChange={(e) => onUpdateSpan(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1.5m</span>
              <span>20m</span>
            </div>
          </div>

          {/* Barton Q (Read from Classification) */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-teal-950/25 border border-teal-800/40 shadow-sm">
            <div className="flex justify-between items-center text-slate-300 font-medium">
              <span className="flex items-center gap-1 text-teal-300 font-bold">
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                <span>{isFa ? 'شاخص Q بارتون:' : 'Barton Q:'}</span>
              </span>
              <span className="font-mono font-bold text-teal-300">{currentQ}</span>
            </div>
            {/* Logarithmic Slider for Q from 0.001 (10^-3) to 1000 (10^3) */}
            <input
              type="range"
              min="-3"
              max="3"
              step="0.05"
              value={Math.log10(Math.max(0.001, Math.min(1000, currentQ)))}
              onChange={(e) => {
                const logVal = parseFloat(e.target.value);
                const rawQ = Math.pow(10, logVal);
                let roundedQ: number;
                if (rawQ >= 100) roundedQ = Math.round(rawQ);
                else if (rawQ >= 10) roundedQ = Math.round(rawQ * 10) / 10;
                else if (rawQ >= 1) roundedQ = Math.round(rawQ * 100) / 100;
                else roundedQ = parseFloat(rawQ.toPrecision(2));
                onUpdateQ(Math.max(0.001, Math.min(1000, roundedQ)));
              }}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>0.001</span>
              {onNavigateToQClassification && (
                <button
                  onClick={onNavigateToQClassification}
                  className="text-teal-400 hover:text-teal-300 underline cursor-pointer font-sans text-[10px]"
                  title={isFa ? 'رفتن به ماژول طبقه‌بندی مهندسی سنگ (شاخص Q)' : 'Go to Q classification'}
                >
                  {isFa ? 'طبقه‌بندی Q ←' : 'Q Class ←'}
                </button>
              )}
              <span>1000</span>
            </div>
          </div>

          {/* GSI Independent (Read from Classification) */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-purple-950/25 border border-purple-800/40 shadow-sm">
            <div className="flex justify-between items-center text-slate-300 font-medium">
              <span className="flex items-center gap-1 text-purple-300 font-bold">
                <Grid className="w-3.5 h-3.5 text-purple-400" />
                <span>{isFa ? 'شاخص GSI هوک:' : 'Hoek GSI:'}</span>
              </span>
              <span className="font-mono font-bold text-purple-300">{currentGsi}</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="1"
              value={currentGsi}
              onChange={(e) => onUpdateGsi(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>۵ (ضعیف)</span>
              {onNavigateToGsiClassification && (
                <button
                  onClick={onNavigateToGsiClassification}
                  className="text-purple-400 hover:text-purple-300 underline cursor-pointer font-sans text-[10px]"
                  title={isFa ? 'رفتن به جدول و دیاگرام‌های طبقه‌بندی GSI' : 'Go to GSI classification'}
                >
                  {isFa ? 'دیاگرام GSI ←' : 'GSI Chart ←'}
                </button>
              )}
              <span>۱۰۰ (بکر)</span>
            </div>
          </div>

          {/* RMR (Read from Classification) */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-amber-950/25 border border-amber-800/40 shadow-sm">
            <div className="flex justify-between items-center text-slate-300 font-medium">
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>{isFa ? 'امتیاز RMR:' : 'RMR Rating:'}</span>
              </span>
              <span className="font-mono font-bold text-amber-300">{currentRmr}</span>
            </div>
            <input
              type="range"
              min="5"
              max="95"
              step="1"
              value={currentRmr}
              onChange={(e) => onUpdateRmr(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>5</span>
              {onNavigateToRmrClassification && (
                <button
                  onClick={onNavigateToRmrClassification}
                  className="text-amber-400 hover:text-amber-300 underline cursor-pointer font-sans text-[10px]"
                  title={isFa ? 'رفتن به ماژول طبقه‌بندی مهندسی سنگ (امتیاز RMR)' : 'Go to RMR classification'}
                >
                  {isFa ? 'محاسبه RMR ←' : 'RMR Calc ←'}
                </button>
              )}
              <span>95</span>
            </div>
          </div>

          {/* RQD (Synchronized with RMR and Q Classification) */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-sky-950/25 border border-sky-800/40 shadow-sm">
            <div className="flex justify-between items-center text-slate-300 font-medium">
              <span className="flex items-center gap-1 text-sky-300 font-bold">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                <span>{isFa ? 'شاخص RQD دیر:' : 'Deere RQD:'}</span>
              </span>
              <span className="font-mono font-bold text-sky-300">{currentRqd}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="1"
              value={currentRqd}
              onChange={(e) => onUpdateRqd(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>5%</span>
              <span className="text-[10px] text-sky-400/80">
                {isFa ? 'متصل به RMR و Q' : 'Synced with RMR & Q'}
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Overburden Depth (for GSI and Russo in-situ stress) */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <div className="flex justify-between text-slate-300 font-medium">
              <span>{isFa ? 'عمق روباره (H):' : 'Depth (H):'}</span>
              <span className="font-mono font-bold text-indigo-400">{overburdenDepth} m</span>
            </div>
            <input
              type="range"
              min="20"
              max="1500"
              step="20"
              value={overburdenDepth}
              onChange={(e) => setOverburdenDepth(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>20m</span>
              <span className="text-[10px] text-indigo-400/80">
                {isFa ? 'یکپارچه با کل پروژه' : 'Globally Synced'}
              </span>
              <span>1500m</span>
            </div>
          </div>

          {/* Intact Rock UCS */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <div className="flex justify-between text-slate-300 font-medium">
              <span>{isFa ? 'مقاومت تک‌محوری (UCS):' : 'Intact UCS (σci):'}</span>
              <span className="font-mono font-bold text-rose-400">{intactUcs} MPa</span>
            </div>
            <input
              type="range"
              min="5"
              max="300"
              step="5"
              value={intactUcs}
              onChange={(e) => setIntactUcs(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>5 MPa</span>
              <span className="text-[10px] text-rose-400/80">
                {isFa ? 'متصل به RMR و هوک' : 'Synced to RMR & Hoek'}
              </span>
              <span>300 MPa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Geotechnical Consistency Mismatch Alert & Reconciliation (RMR vs GSI vs Q) */}
      <GeotechnicalWarningBanner
        report={consistencyReport}
        currentRmr={currentRmr}
        currentGsi={currentGsi}
        currentQ={currentQ}
        onSyncGsiFromRmr={(newGsi) => onUpdateGsi(newGsi)}
        onSyncRmrFromGsi={(newRmr) => onUpdateRmr(newRmr)}
        onSyncQFromRmr={(newQ) => onUpdateQ(newQ)}
        onSyncQFromGsi={(newQ) => onUpdateQ(newQ)}
        onSyncRmrFromQ={(newRmr) => onUpdateRmr(newRmr)}
        onSyncGsiFromQ={(newGsi) => onUpdateGsi(newGsi)}
        onSyncAllToRmr={() => {
          onUpdateGsi(consistencyReport.expectedGsiFromRmr);
          onUpdateQ(consistencyReport.expectedQFromRmr);
        }}
        lang={lang}
        variant="full"
      />

      {/* SUB-VIEW 1: COMPREHENSIVE COMPARISON OF ALL 5 METHODS */}
      {activeSubTab === 'comparison' && (
        <div className="space-y-6">
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-stretch">
            {/* 1. RMR Card */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Compass className="w-4 h-4" />
                    <span>RMR (1989)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300">
                    رده {rockClass.code}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-100">{isFa ? rockClass.nameFa : rockClass.nameEn}</div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="text-slate-400">{isFa ? 'راک‌بولت:' : 'Bolts:'}</div>
                  <div className="line-clamp-2 text-slate-200">{isFa ? rockClass.rockBoltsFa : rockClass.rockBoltsEn}</div>
                  <div className="text-slate-400 mt-1">{isFa ? 'شاتکریت:' : 'Shotcrete:'}</div>
                  <div className="line-clamp-2 text-slate-200">{isFa ? rockClass.shotcreteFa : rockClass.shotcreteEn}</div>
                  <div className="mt-2 pt-1.5 border-t border-slate-800/60 text-[10px] text-amber-300/90 leading-tight">
                    <span className="font-semibold text-amber-400">{isFa ? 'مبنای اعتبار: ' : 'Validity: '}</span>
                    <span>{isFa ? 'تونل نعل‌اسبی ۱۰m | تنش قائم < ۲۵ MPa | حفاری و انفجار' : '10m horseshoe tunnel | σv < 25 MPa | Drill & blast'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab('rmr')}
                className="mt-3 text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer pt-2 border-t border-slate-800"
              >
                <span>{isFa ? 'جزئیات کامل روش RMR' : 'View RMR Details'}</span>
                <ArrowRight className={`w-3 h-3 ${isFa ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* 2. Q-System Card */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-teal-500/30 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>Barton Q</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-500/20 text-teal-300">
                    Q={currentQ}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-100">
                  {isFa ? qResult.supportGuidelineFa.category : qResult.supportGuidelineEn.category}
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="text-slate-400">{isFa ? 'طول بهینه راک‌بولت (L):' : 'Bolt Length:'}</div>
                  <div className="font-mono font-bold text-teal-300">{qResult.boltLength} m</div>
                  <div className="text-slate-400 mt-1">{isFa ? 'شاتکریت الیافی:' : 'Fiber Shotcrete:'}</div>
                  <div className="line-clamp-2 text-slate-200">
                    {isFa ? qResult.supportGuidelineFa.shotcreteThickness : qResult.supportGuidelineEn.shotcreteThickness}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab('q')}
                className="mt-3 text-[11px] text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 cursor-pointer pt-2 border-t border-slate-800"
              >
                <span>{isFa ? 'جزئیات نمودار گریمستاد' : 'View Q Details'}</span>
                <ArrowRight className={`w-3 h-3 ${isFa ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* 3. GSI Method Card */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Grid className="w-4 h-4" />
                    <span>Hoek GSI</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300">
                    GSI={currentGsi}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-100">
                  {isFa ? gsiResult.behaviorCategoryFa : gsiResult.behaviorCategoryEn}
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="text-slate-400">{isFa ? 'فشار نگهداری (Pi):' : 'Support Pressure:'}</div>
                  <div className="font-mono font-bold text-purple-300">{gsiResult.requiredSupportPressurePi} MPa</div>
                  <div className="text-slate-400 mt-1">{isFa ? 'توصیه تحلیلی:' : 'Recommendation:'}</div>
                  <div className="line-clamp-2 text-slate-200">{isFa ? gsiResult.supportTypeFa : gsiResult.supportTypeEn}</div>
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab('gsi')}
                className="mt-3 text-[11px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer pt-2 border-t border-slate-800"
              >
                <span>{isFa ? 'جزئیات تغییرشکل و کرنش' : 'View GSI Details'}</span>
                <ArrowRight className={`w-3 h-3 ${isFa ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* 4. RQD Deere Card */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-sky-500/30 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    <span>Deere RQD</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/20 text-sky-300">
                    {currentRqd}%
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-100">
                  {isFa ? rqdResult.categoryFa : rqdResult.categoryEn}
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="text-slate-400">{isFa ? 'ارتفاع بار سنگ (Hp):' : 'Rock Load Height:'}</div>
                  <div className="font-mono font-bold text-sky-300">{rqdResult.rockLoadHeightHp} m ({rqdResult.rockLoadPressurePv} kN/m²)</div>
                  <div className="text-slate-400 mt-1">{isFa ? 'راک‌بولت RQD:' : 'RQD Bolting:'}</div>
                  <div className="line-clamp-2 text-slate-200">{isFa ? rqdResult.rockBoltsFa : rqdResult.rockBoltsEn}</div>
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab('rqd')}
                className="mt-3 text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer pt-2 border-t border-slate-800"
              >
                <span>{isFa ? 'جزئیات فرمول‌های ترزاگی-دیر' : 'View RQD Details'}</span>
                <ArrowRight className={`w-3 h-3 ${isFa ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* 5. Russo 2014 Card */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4" />
                    <span>Russo (2014)</span>
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: russoResult.color }}
                  >
                    {russoResult.sectionType}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-100">
                  {isFa ? russoResult.classNameFa : russoResult.classNameEn}
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="text-slate-400">{isFa ? 'شاخص شایستگی (IC):' : 'Competency Index:'}</div>
                  <div className="font-mono font-bold text-indigo-300">
                    IC = {russoResult.competencyIndexIc} ({russoResult.hazardCode})
                  </div>
                  <div className="text-slate-400 mt-1">{isFa ? 'گام پیشروی / لاینینگ:' : 'Advance & Support:'}</div>
                  <div className="line-clamp-2 text-slate-200">
                    گام {russoResult.advanceRate} | {russoResult.shotcreteLining}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab('russo')}
                className="mt-3 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer pt-2 border-t border-slate-800"
              >
                <span>{isFa ? 'نمودار چهارگانه و راهکارهای Ma/Mb' : 'View Multiple Graph & Mitigations'}</span>
                <ArrowRight className={`w-3 h-3 ${isFa ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Master Cross-Comparison Matrix Table */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  {isFa ? 'جدول ماتریس مقایسه‌ای عناصر سیستم نگهداری (Cross-Comparison Matrix)' : 'Cross-Comparison Support Matrix'}
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Span = {currentSpan}m | RMR={currentRmr} | Q={currentQ}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 text-[11px]">
                    <th className="p-3 font-bold">{isFa ? 'روش تجربی' : 'Method'}</th>
                    <th className="p-3 font-bold">{isFa ? 'رده کیفی / امتیاز' : 'Class / Rating'}</th>
                    <th className="p-3 font-bold">{isFa ? 'روش و گام حفاری' : 'Excavation & Advance'}</th>
                    <th className="p-3 font-bold">{isFa ? 'سیستم راک‌بولت (طول و فواصل)' : 'Rockbolts (L & Spacing)'}</th>
                    <th className="p-3 font-bold">{isFa ? 'شاتکریت و مش' : 'Shotcrete & Mesh'}</th>
                    <th className="p-3 font-bold">{isFa ? 'قاب فولادی و کف‌بند' : 'Steel Sets & Invert'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {/* RMR Row */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-amber-400 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" />
                      <span>RMR (Bieniawski 1989)</span>
                    </td>
                    <td className="p-3 font-semibold text-amber-300">
                      کلاس {rockClass.code} (RMR={currentRmr})
                    </td>
                    <td className="p-3 text-slate-300">
                      {isFa ? rockClass.excavationMethodFa : rockClass.excavationMethodEn}
                    </td>
                    <td className="p-3 text-slate-300">
                      {isFa ? rockClass.rockBoltsFa : rockClass.rockBoltsEn}
                    </td>
                    <td className="p-3 text-slate-300">
                      {isFa ? rockClass.shotcreteFa : rockClass.shotcreteEn}
                    </td>
                    <td className="p-3 text-slate-300">
                      {isFa ? rockClass.steelSetsFa : rockClass.steelSetsEn}
                    </td>
                  </tr>

                  {/* Q-System Row */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-teal-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Barton Q-System</span>
                    </td>
                    <td className="p-3 font-semibold text-teal-300">
                      {qResult.qClass.code || qResult.qClass.nameEn} (Q={currentQ})
                    </td>
                    <td className="p-3 text-slate-300">
                      حفاری بر اساس نسبت بعد معادل De = {qResult.equivalentDimension}m
                    </td>
                    <td className="p-3 text-slate-300 font-mono">
                      طول L = {qResult.boltLength}m | {isFa ? supportDetailed.sfr.boltSpacingFa : supportDetailed.sfr.boltSpacingEn}
                    </td>
                    <td className="p-3 text-slate-300">
                      <span className="text-teal-400 font-bold">{isFa ? 'شاتکریت مسلح به الیاف (Sfr): ' : 'Fiber Shotcrete (Sfr): '}</span>
                      <span>{isFa ? supportDetailed.sfr.thicknessRangeFa : supportDetailed.sfr.thicknessRangeEn}</span>
                    </td>
                    <td className="p-3 text-slate-300">
                      {supportDetailed.sfr.rrsTypeFa !== 'بدون نیاز به ریب‌های شاتکریتی' &&
                      supportDetailed.sfr.rrsTypeFa !== 'بدون نیاز به دنده‌های RRS' &&
                      supportDetailed.sfr.rrsTypeFa !== 'بدون نیاز به RRS'
                        ? (isFa ? supportDetailed.sfr.rrsTypeFa : supportDetailed.sfr.rrsTypeEn)
                        : (isFa ? 'شات الیافی سازه‌ای؛ جایگزین کامل قاب فولادی' : 'Structural Sfr replaces steel sets')}
                    </td>
                  </tr>

                  {/* GSI Row */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-purple-400 flex items-center gap-1.5">
                      <Grid className="w-3.5 h-3.5" />
                      <span>Hoek GSI</span>
                    </td>
                    <td className="p-3 font-semibold text-purple-300">
                      GSI={currentGsi} (Scm={gsiResult.rockMassStrengthScm} MPa)
                    </td>
                    <td className="p-3 text-slate-300">
                      {gsiResult.squeezingSeverity === 'very_severe' ? 'حفاری چندمرحله‌ای با پیش‌تحکیم' : 'حفاری تمام‌مقطع یا دو مرحله‌ای'}
                    </td>
                    <td className="p-3 text-slate-300">
                      {isFa ? gsiResult.boltsFa : gsiResult.boltsEn}
                    </td>
                    <td className="p-3 text-slate-300">
                      {isFa ? gsiResult.shotcreteFa : gsiResult.shotcreteEn}
                    </td>
                    <td className="p-3 text-slate-300">
                      {isFa ? gsiResult.ribsFa : gsiResult.ribsEn}
                    </td>
                  </tr>

                  {/* RQD Row */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-sky-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" />
                      <span>Deere RQD (1969)</span>
                    </td>
                    <td className="p-3 font-semibold text-sky-300">
                      {rqdResult.qualityGrade} (RQD={currentRqd}%)
                    </td>
                    <td className="p-3 text-slate-300">
                      {isFa ? rqdResult.recommendationFa : rqdResult.recommendationEn}
                    </td>
                    <td className="p-3 text-slate-300">
                      {isFa ? rqdResult.rockBoltsFa : rqdResult.rockBoltsEn}
                    </td>
                    <td className="p-3 text-slate-300">
                      {isFa ? rqdResult.shotcreteFa : rqdResult.shotcreteEn}
                    </td>
                    <td className="p-3 text-slate-300">
                      {isFa ? rqdResult.steelSetsFa : rqdResult.steelSetsEn} (Hp = {rqdResult.rockLoadHeightHp}m)
                    </td>
                  </tr>

                  {/* Russo 1998 Row */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-indigo-400 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Russo et al. (1998)</span>
                    </td>
                    <td className="p-3 font-semibold text-indigo-300">
                      رده {russoResult.classCode} ({isFa ? russoResult.classNameFa : russoResult.classNameEn})
                    </td>
                    <td className="p-3 text-slate-300">
                      {isFa ? russoResult.excavationMethodFa : russoResult.excavationMethodEn}
                    </td>
                    <td className="p-3 text-slate-300">
                      {russoResult.radialBolting}
                    </td>
                    <td className="p-3 text-slate-300">
                      {russoResult.shotcreteLining}
                    </td>
                    <td className="p-3 text-slate-300">
                      {russoResult.steelRibs} | {russoResult.invertRequirement}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table Footnote regarding RMR validity conditions */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11.5px]">
                <strong className="text-amber-300">{isFa ? 'یادداشت مهندسی روش RMR (جدول ۴ بینیاوسکی): ' : 'Bieniawski RMR Note: '}</strong>
                <span>
                  {isFa
                    ? 'این روش برای تونل نعل اسبی با دهانه ۱۰ متر، تنش قائم کمتر از ۲۵ مگاپاسکال و روش ساخت حفاری و انفجار معتبر است.'
                    : 'This method is valid for horseshoe-shaped tunnels with a 10 m span, vertical stress of less than 25 MPa, and drill & blast construction method.'}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: BIENIAWSKI RMR (1989) */}
      {activeSubTab === 'rmr' && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Compass className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-100">
                  {isFa ? 'دستورالعمل نگهداری و حفاری RMR بینیاوسکی (1989)' : 'Bieniawski (1989) Support Guidelines'}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                رده {rockClass.code} - RMR = {currentRmr}
              </span>
            </div>

            {/* Critical Validity Condition Box (User Request: Horseshoe tunnel, 10m span, vertical stress < 25 MPa, drill & blast) */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-950/80 to-slate-950/60 border border-amber-500/40 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {isFa
                    ? 'نکته کلیدی و محدوده اعتبار سیستم نگهداری RMR بینیاوسکی (Bieniawski 1989 - Table 4):'
                    : 'Key Note & Validity Scope of Bieniawski (1989) Support System:'}
                </span>
              </div>

              <p className="text-xs sm:text-[13px] text-amber-100/95 leading-relaxed font-semibold bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                {isFa
                  ? 'این روش برای تونل نعل اسبی با دهانه ۱۰ متر، تنش قائم کمتر از ۲۵ مگاپاسکال و روش ساخت حفاری و انفجار معتبر است.'
                  : 'This method is valid for horseshoe-shaped tunnels with a 10 m span, vertical stress of less than 25 MPa, and drill & blast construction method.'}
              </p>

              {/* 4 Pillars Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                <div className="p-2 rounded-lg bg-slate-900/90 border border-amber-500/20 text-[11px] flex flex-col gap-0.5">
                  <span className="text-slate-400 text-[10px]">{isFa ? 'شکل مقطع تونل:' : 'Tunnel Shape:'}</span>
                  <span className="font-bold text-slate-100">{isFa ? 'نعل‌اسبی (Horseshoe)' : 'Horseshoe'}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-amber-500/20 text-[11px] flex flex-col gap-0.5">
                  <span className="text-slate-400 text-[10px]">{isFa ? 'دهانه مرجع مبنا:' : 'Reference Span:'}</span>
                  <span className="font-bold text-amber-300 font-mono">{isFa ? '۱۰ متر (10 m)' : '10 m'}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-amber-500/20 text-[11px] flex flex-col gap-0.5">
                  <span className="text-slate-400 text-[10px]">{isFa ? 'حداکثر تنش قائم (σv):' : 'Max Vertical Stress:'}</span>
                  <span className="font-bold text-amber-300 font-mono">{isFa ? '< ۲۵ مگاپاسکال' : '< 25 MPa'}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-amber-500/20 text-[11px] flex flex-col gap-0.5">
                  <span className="text-slate-400 text-[10px]">{isFa ? 'روش ساخت و حفاری:' : 'Excavation Method:'}</span>
                  <span className="font-bold text-slate-100">{isFa ? 'حفاری و انفجار (D&B)' : 'Drill & Blast'}</span>
                </div>
              </div>

              {/* Contextual warning if current project parameters deviate */}
              {currentSpan !== 10 && (
                <div className="pt-1 flex items-start gap-1.5 text-[11px] text-amber-400/90 border-t border-amber-500/20">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    {isFa
                      ? `توجه مهندسی: دهانه فعلی پروژه شما (${currentSpan} متر) با دهانه مبنای ۱۰ متری تفاوت دارد؛ بنابراین برای مقاطع غیر از ۱۰ متر یا تنش‌های بالاتر، استفاده از روش‌های تکمیلی (نظیر سیستم Q بارتون و تحلیل عددی) توصیه می‌شود.`
                      : `Engineering Note: Current project span is ${currentSpan}m. For spans other than 10m or higher stresses, consider complementary systems (such as Barton Q) and numerical analysis.`}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Wrench className="w-4 h-4" />
                  <span>{isFa ? 'روش و گام پیشروی حفاری (Excavation):' : 'Excavation Method:'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {isFa ? rockClass.excavationMethodFa : rockClass.excavationMethodEn}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-bold">
                  <Hammer className="w-4 h-4" />
                  <span>{isFa ? 'راک‌بولت‌ها (Rock Bolts - 20mm diam.):' : 'Rock Bolts:'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {isFa ? rockClass.rockBoltsFa : rockClass.rockBoltsEn}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Layers className="w-4 h-4" />
                  <span>{isFa ? 'شاتکریت و بتن پاشنده (Shotcrete):' : 'Shotcrete:'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {isFa ? rockClass.shotcreteFa : rockClass.shotcreteEn}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <Shield className="w-4 h-4" />
                  <span>{isFa ? 'قاب‌های فولادی و اینورت (Steel Sets & Invert):' : 'Steel Sets:'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {isFa ? rockClass.steelSetsFa : rockClass.steelSetsEn}
                </p>
              </div>
            </div>

            {/* Complete Bieniawski RMR 1989 Reference Table */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 mb-3">
                {isFa ? 'ماتریس کامل ۵ رده سنگ بر اساس استاندارد بینیاوسکی:' : 'Complete Bieniawski 1989 Table:'}
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800">
                      <th className="p-2.5">{isFa ? 'رده' : 'Class'}</th>
                      <th className="p-2.5">{isFa ? 'RMR' : 'RMR'}</th>
                      <th className="p-2.5">{isFa ? 'حفاری' : 'Excavation'}</th>
                      <th className="p-2.5">{isFa ? 'راک بولت' : 'Bolts'}</th>
                      <th className="p-2.5">{isFa ? 'شاتکریت' : 'Shotcrete'}</th>
                      <th className="p-2.5">{isFa ? 'قاب فلزی' : 'Steel Sets'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                    {Object.values(ROCK_CLASSES).map((rc) => {
                      const isCurrent = rc.id === rockClass.id;
                      return (
                        <tr
                          key={rc.id}
                          className={`transition-colors ${
                            isCurrent ? 'bg-amber-950/40 font-bold text-amber-200' : 'text-slate-300 hover:bg-slate-850'
                          }`}
                        >
                          <td className="p-2.5 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: rc.color }} />
                            <span>{rc.code}</span>
                          </td>
                          <td className="p-2.5 font-mono">{rc.rmrRange[0]}-{rc.rmrRange[1]}</td>
                          <td className="p-2.5">{isFa ? rc.excavationMethodFa : rc.excavationMethodEn}</td>
                          <td className="p-2.5">{isFa ? rc.rockBoltsFa : rc.rockBoltsEn}</td>
                          <td className="p-2.5">{isFa ? rc.shotcreteFa : rc.shotcreteEn}</td>
                          <td className="p-2.5">{isFa ? rc.steelSetsFa : rc.steelSetsEn}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-amber-300 font-semibold">{isFa ? 'مرجع استاندارد: ' : 'Standard Reference: '}</strong>
                  {isFa
                    ? 'Bieniawski, Z.T. (1989) Table 4 - این روش برای تونل نعل اسبی با دهانه ۱۰ متر، تنش قائم کمتر از ۲۵ مگاپاسکال و روش ساخت حفاری و انفجار معتبر است.'
                    : 'Bieniawski, Z.T. (1989) Table 4 - This method is valid for horseshoe-shaped tunnels with a 10 m span, vertical stress of less than 25 MPa, and drill & blast construction method.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: BARTON Q-SYSTEM (NGI) WITH BOTH FIBER & PLAIN SHOTCRETE */}
      {activeSubTab === 'q' && (
        <BartonSupportChart
          currentQ={currentQ}
          span={currentSpan}
          esr={currentEsr}
          supportDetailed={supportDetailed}
          onPointChange={(newQ, newDe) => {
            onUpdateQ(newQ);
            // newDe = span / esr -> span = newDe * esr
            const newSpan = Number((newDe * currentEsr).toFixed(1));
            onUpdateSpan(newSpan);
          }}
          language={lang}
        />
      )}

      {/* SUB-VIEW 4: HOEK GSI SQUEEZING & CAPACITY */}
      {activeSubTab === 'gsi' && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Grid className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-100">
                  {isFa ? 'تخمین سیستم نگهداری بر اساس GSI و تنش القایی (Hoek et al.)' : 'Hoek et al. GSI Support & Squeezing Assessment'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold font-mono">
                  GSI = {currentGsi} | {isFa ? 'عمق' : 'Depth'} = {overburdenDepth}m
                </span>
                {onNavigateToGsiClassification && (
                  <button
                    onClick={onNavigateToGsiClassification}
                    className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{isFa ? 'جدول و دیاگرام GSI ←' : 'GSI Matrix ←'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Interactive Adjuster for GSI & Intact UCS in Hoek tab */}
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-medium text-slate-300">
                  <span className="text-purple-300 font-bold">{isFa ? 'تنظیم مقدار GSI:' : 'Hoek GSI:'}</span>
                  <span className="font-mono font-bold text-purple-300">{currentGsi}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={currentGsi}
                  onChange={(e) => onUpdateGsi(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between font-medium text-slate-300">
                  <span>{isFa ? 'مقاومت تک‌محوره سنگ بکر (σci):' : 'Intact Rock UCS (σci):'}</span>
                  <span className="font-mono font-bold text-amber-300">{intactUcs} MPa</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="250"
                  step="5"
                  value={intactUcs}
                  onChange={(e) => setIntactUcs(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between font-medium text-slate-300">
                  <span>{isFa ? 'عمق روباره (H):' : 'Overburden Depth (H):'}</span>
                  <span className="font-mono font-bold text-rose-300">{overburdenDepth} m</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1500"
                  step="20"
                  value={overburdenDepth}
                  onChange={(e) => setOverburdenDepth(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>

            {/* Stress & Strength Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">{isFa ? 'تنش برجا روباره (P0):' : 'In-situ Vertical Stress:'}</div>
                <div className="font-mono font-bold text-purple-300 text-base">{gsiResult.verticalStressP0} MPa</div>
                <div className="text-[10px] text-slate-500">P0 = γ × H (γ = 26 kN/m³)</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">{isFa ? 'مقاومت فشاری توده‌سنگ (σcm):' : 'Rock Mass Strength (σcm):'}</div>
                <div className="font-mono font-bold text-amber-300 text-base">{gsiResult.rockMassStrengthScm} MPa</div>
                <div className="text-[10px] text-slate-500">σcm = σci × s^a (UCS = {intactUcs} MPa)</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">{isFa ? 'نسبت مقاومت به تنش (σcm / P0):' : 'Strength/Stress Ratio:'}</div>
                <div className="font-mono font-bold text-emerald-300 text-base">{gsiResult.stressStrengthRatio}</div>
                <div className="text-[10px] text-slate-500">
                  {gsiResult.stressStrengthRatio < 1 ? (
                    <span className="text-rose-400 font-bold">خطر فشردگی (Squeezing)</span>
                  ) : (
                    <span className="text-emerald-400">بدون تسلیم بحرانی</span>
                  )}
                </div>
              </div>
            </div>

            {/* Specific Support Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold">
                  <Activity className="w-4 h-4" />
                  <span>{isFa ? 'رفتار توده‌سنگ و کرنش همگرایی:' : 'Ground Behavior & Strain:'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-semibold">
                  {isFa ? gsiResult.behaviorCategoryFa : gsiResult.behaviorCategoryEn}
                </p>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-purple-300">
                  کرنش پیرامونی تخمینی: {gsiResult.strainPercent}% | فشار نگهداری الزامی Pi = {gsiResult.requiredSupportPressurePi} MPa
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-bold">
                  <Hammer className="w-4 h-4" />
                  <span>{isFa ? 'نوع و مشخصات راک‌بولت پیشنهادی:' : 'Rockbolt Recommendation:'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {isFa ? gsiResult.boltsFa : gsiResult.boltsEn}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Layers className="w-4 h-4" />
                  <span>{isFa ? 'شاتکریت و مسلح‌کننده:' : 'Shotcrete Specification:'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {isFa ? gsiResult.shotcreteFa : gsiResult.shotcreteEn}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <Shield className="w-4 h-4" />
                  <span>{isFa ? 'قاب‌های صلب / تسلیم‌پذیر و رینگ اینورت:' : 'Steel Arches & Invert:'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {isFa ? gsiResult.ribsFa : gsiResult.ribsEn}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: DEERE RQD (1969) */}
      {activeSubTab === 'rqd' && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-sky-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sky-400">
                <Activity className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-100">
                  {isFa ? 'روش پیشنهادی RQD دیر (Deere et al. 1969 & Merritt 1972)' : 'Deere et al. (1969) RQD Tunnel Support Criteria'}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold">
                RQD = {currentRqd}% - رده کیفی {rqdResult.qualityGrade}
              </span>
            </div>

            {/* Terzaghi-Deere Rock Load Calculations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-slate-400 font-semibold">{isFa ? 'فرمول ارتفاع بار سنگ ترزاگی-دیر (Hp):' : 'Terzaghi-Deere Rock Load Height:'}</div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-sky-300 font-bold text-center">
                  Hp = ((100 - RQD) / 100) × Span = {rqdResult.rockLoadHeightHp} m
                </div>
                <p className="text-[11px] text-slate-400">
                  {isFa
                    ? 'ارتفاع توده سنگ سست بالای تاج تونل که بار استاتیکی آن باید توسط سیستم نگهداری تحمل شود.'
                    : 'Height of relaxed rock mass above the crown supported by structural elements.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-slate-400 font-semibold">{isFa ? 'فشار قائم وارد بر سقف (Pv):' : 'Vertical Overburden Rock Load:'}</div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-amber-300 font-bold text-center">
                  Pv = γ × Hp = {rqdResult.rockLoadPressurePv} kN/m² (≈ {(rqdResult.rockLoadPressurePv / 1000).toFixed(3)} MPa)
                </div>
                <p className="text-[11px] text-slate-400">
                  {isFa
                    ? 'بار وارده به راک‌بولت‌ها و قاب‌های فولادی سقف با در نظر گرفتن وزن مخصوص ۲۵ کیلو نیوتن بر متر مکعب.'
                    : 'Total dead weight rock load acting upon support roof.'}
                </p>
              </div>
            </div>

            {/* RQD Support Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-bold">
                  <Hammer className="w-4 h-4" />
                  <span>{isFa ? 'راک‌بولت‌گذاری بر اساس RQD:' : 'RQD Rockbolts:'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {isFa ? rqdResult.rockBoltsFa : rqdResult.rockBoltsEn}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Layers className="w-4 h-4" />
                  <span>{isFa ? 'شاتکریت بر اساس RQD:' : 'RQD Shotcrete:'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {isFa ? rqdResult.shotcreteFa : rqdResult.shotcreteEn}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <Shield className="w-4 h-4" />
                  <span>{isFa ? 'قاب فولادی بر اساس RQD:' : 'RQD Steel Sets:'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {isFa ? rqdResult.steelSetsFa : rqdResult.steelSetsEn}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Wrench className="w-4 h-4" />
                  <span>{isFa ? 'استراتژی پیشروی و روش حفاری:' : 'Excavation Strategy:'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {isFa ? rqdResult.recommendationFa : rqdResult.recommendationEn}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 6: RUSSO ET AL. (2014) MULTIPLE GRAPH APPROACH */}
      {activeSubTab === 'russo' && (
        <div className="space-y-6">
          {/* Scientific Reference Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Compass className="w-5 h-5" />
                <span>
                  {isFa
                    ? 'روش Russo (2014) - رویکرد نمودار چندگانه (Multiple Graph Approach)'
                    : 'Russo (2014) - An Update of the Multiple Graph Approach'}
                </span>
              </div>
              <p className="text-slate-300">
                {isFa
                  ? 'مرجع علمی: Russo, G. (2014). Tunnelling and Underground Space Technology, 41, 74–81. چارچوب مدرن ارزیابی رفتار جبهه‌کار و جداره‌ها، مخاطرات ژئوتکنیکی (H1 تا H4)، شکست ترد، و تعیین تدابیر کاهش خطر (Ma و Mb).'
                  : 'Ref: Russo, G. (2014). Tunnelling and Underground Space Technology 41, 74–81. Framework for excavation behavior, hazards (H1-H4), brittle spalling, and mitigation measures (Ma & Mb).'}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <span
                className="px-3 py-1.5 rounded-xl font-bold text-white text-xs shadow-md"
                style={{ backgroundColor: russoResult.color }}
              >
                {russoResult.sectionType}
              </span>
              <span className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold">
                {russoResult.hazardCode}
              </span>
            </div>
          </div>

          {/* Dedicated 4-Quadrant Multiple Graph Chart & Hazard Explorer */}
          <RussoMultipleGraphChart
            russoResult={russoResult}
            onUpdateGsi={onUpdateGsi}
            onUpdateDepth={setOverburdenDepth}
            onUpdateUcs={setIntactUcs}
            lang={lang}
          />

          {/* Advanced In-Situ Stress & Brittleness Control Panel */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Sliders className="w-4 h-4" />
                <span>{isFa ? 'پارامترهای تنش برجا و مشخصات سنگ روسو (In-Situ Stress & Brittleness):' : 'In-Situ Stress & Rock Parameters:'}</span>
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                σv = {russoResult.verticalStressSigmaV} MPa | σθ = {russoResult.tangentialStressSigmaTheta} MPa
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>{isFa ? 'ضریب تنش جانبی (k = σh/σv):' : 'Lateral Stress Ratio (k):'}</span>
                  <span className="font-mono font-bold text-indigo-400">{kRatio}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={kRatio}
                  onChange={(e) => setKRatio(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>{isFa ? 'شاخص شکنندگی (IF = σc/σt):' : 'Brittleness Index (IF):'}</span>
                  <span className="font-mono font-bold text-rose-400">{brittlenessIf}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={brittlenessIf}
                  onChange={(e) => setBrittlenessIf(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>{isFa ? 'شاخص مقاومت سنگ (GSI):' : 'GSI:'}</span>
                  <span className="font-mono font-bold text-purple-400">{currentGsi}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="1"
                  value={currentGsi}
                  onChange={(e) => onUpdateGsi(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>{isFa ? 'عمق روباره H:' : 'Depth H:'}</span>
                  <span className="font-mono font-bold text-emerald-400">{overburdenDepth} m</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1200"
                  step="10"
                  value={overburdenDepth}
                  onChange={(e) => setOverburdenDepth(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Support Specifications Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Compass className="w-4 h-4" />
                <span>{isFa ? 'روش حفاری و گام پیشروی مجاز:' : 'Excavation & Advance:'}</span>
              </div>
              <p className="text-slate-200 leading-relaxed">
                {isFa ? russoResult.excavationMethodFa : russoResult.excavationMethodEn}
              </p>
              <div className="font-mono text-amber-300">
                {isFa ? 'حداکثر گام پیشروی در هر سیکل:' : 'Max round length:'} {russoResult.advanceRate}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <Hammer className="w-4 h-4" />
                <span>{isFa ? 'الگوی بولت‌گذاری شعاعی (Radial Bolting):' : 'Radial Bolting:'}</span>
              </div>
              <p className="text-slate-200 leading-relaxed">
                {russoResult.radialBolting}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Layers className="w-4 h-4" />
                <span>{isFa ? 'پوشش شاتکریت اولیه (Shotcrete Lining):' : 'Shotcrete Lining:'}</span>
              </div>
              <p className="text-slate-200 leading-relaxed">
                {russoResult.shotcreteLining}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <Shield className="w-4 h-4" />
                <span>{isFa ? 'قاب‌های فولادی و بستن اینورت:' : 'Steel Ribs & Invert Ring:'}</span>
              </div>
              <p className="text-slate-200 leading-relaxed">
                {russoResult.steelRibs}
              </p>
              <p className="text-slate-300 font-mono text-[11px]">
                {russoResult.invertRequirement}
              </p>
            </div>
          </div>

          {/* Safety & Geotechnical Monitoring Alert */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-amber-300">
                {isFa ? 'ملاحظات ایمنی و پایش ژئومکانیکی Russo (2014):' : 'Safety & Geotechnical Monitoring (Russo 2014):'}
              </div>
              <p className="leading-relaxed text-slate-300">
                {isFa ? russoResult.safetyConsiderationsFa : russoResult.safetyConsiderationsEn}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
