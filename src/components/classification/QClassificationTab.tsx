import React, { useState, useEffect } from 'react';
import {
  Layers,
  CheckCircle2,
  Sparkles,
  Shield,
  ArrowRight,
  Info,
  Scale,
  Activity,
  Sliders,
  Edit3,
  RotateCcw,
} from 'lucide-react';
import {
  calculateQStandUpTime,
  Q_CLASSES,
  rmrToEquivalentQ,
} from '../../utils/qCalculation';
import { QClassInfo } from '../../types';

interface QClassificationTabProps {
  currentQ: number;
  currentRqd: number;
  currentSpan: number;
  currentEsr: number;
  currentDepth: number;
  currentUcs: number;
  currentJointSpacing: number;
  currentJointSets: number;
  currentJr?: number;
  currentJa?: number;
  currentJw?: number;
  currentSrf?: number;
  currentCalcMode?: 'components' | 'manual';
  onApplyQ: (q: number) => void;
  onUpdateRqd: (rqd: number) => void;
  onUpdateDepth: (depth: number) => void;
  onUpdateUcs: (ucs: number) => void;
  onUpdateJointSpacing: (spacing: number) => void;
  onUpdateJointSets: (jointSets: number) => void;
  onUpdateJr?: (jr: number) => void;
  onUpdateJa?: (ja: number) => void;
  onUpdateJw?: (jw: number) => void;
  onUpdateSrf?: (srf: number) => void;
  onUpdateCalcMode?: (mode: 'components' | 'manual') => void;
  onNavigateToStandup: () => void;
  lang: 'fa' | 'en';
}

export const QClassificationTab: React.FC<QClassificationTabProps> = ({
  currentQ,
  currentRqd,
  currentSpan,
  currentEsr,
  currentDepth,
  currentUcs,
  currentJointSpacing,
  currentJointSets,
  currentJr = 2.0,
  currentJa = 1.0,
  currentJw = 0.66,
  currentSrf = 1.0,
  currentCalcMode = 'components',
  onApplyQ,
  onUpdateRqd,
  onUpdateDepth,
  onUpdateUcs,
  onUpdateJointSpacing,
  onUpdateJointSets,
  onUpdateJr,
  onUpdateJa,
  onUpdateJw,
  onUpdateSrf,
  onUpdateCalcMode,
  onNavigateToStandup,
  lang,
}) => {
  const isFa = lang === 'fa';

  // Mode: Components calculation vs Direct Manual Q entry
  const [calcMode, setCalcMode] = useState<'components' | 'manual'>(currentCalcMode);
  const [manualQ, setManualQ] = useState<number>(currentQ || 4.0);

  // Sync mode with prop changes (e.g. file loaded)
  useEffect(() => {
    if (currentCalcMode) {
      setCalcMode(currentCalcMode);
    }
  }, [currentCalcMode]);

  // Sync manualQ with currentQ when changed externally (file import / preset)
  useEffect(() => {
    if (typeof currentQ === 'number' && !isNaN(currentQ)) {
      setManualQ(currentQ);
    }
  }, [currentQ]);

  // 6 Parameters of Q-system: RQD & Jn are unified globally across RMR, Q, and Support Hub
  const rqd = Math.max(10, Math.min(100, currentRqd));
  const jn = currentJointSets || 9; // Unified joint sets number
  const [jr, setJr] = useState<number>(currentJr); // Smooth, undulating
  const [ja, setJa] = useState<number>(currentJa); // Unaltered joint walls
  const [jw, setJw] = useState<number>(currentJw); // Unified groundwater reduction factor
  const [srf, setSrf] = useState<number>(currentSrf); // Medium stress

  // Sync parameters with prop changes
  useEffect(() => {
    if (typeof currentJr === 'number') setJr(currentJr);
  }, [currentJr]);
  useEffect(() => {
    if (typeof currentJa === 'number') setJa(currentJa);
  }, [currentJa]);
  useEffect(() => {
    if (typeof currentJw === 'number') setJw(currentJw);
  }, [currentJw]);
  useEffect(() => {
    if (typeof currentSrf === 'number') setSrf(currentSrf);
  }, [currentSrf]);

  // 3 Quotient Pairs
  const blockParam = jn > 0 ? rqd / jn : 10;
  const shearParam = ja > 0 ? jr / ja : 2;
  const stressParam = srf > 0 ? jw / srf : 1;

  // Calculated Q (either from 6 components or direct manual input)
  const rawQ = blockParam * shearParam * stressParam;
  const computedQ =
    calcMode === 'manual'
      ? Number(Math.max(0.001, Math.min(1000, manualQ)).toFixed(3))
      : Number(Math.max(0.001, Math.min(1000, rawQ)).toFixed(3));

  // Keep parent Q continuously synchronized with the active calculation
  useEffect(() => {
    if (typeof computedQ === 'number' && !isNaN(computedQ) && computedQ !== currentQ) {
      onApplyQ(computedQ);
    }
  }, [computedQ]);

  // Q Class lookup
  const qResult = calculateQStandUpTime(currentSpan, computedQ, currentEsr);
  const qClass: QClassInfo = qResult.qClass;

  // Equivalent RMR values
  const equivRmrBieniawski = Number((9 * Math.log(computedQ) + 44).toFixed(1));
  const equivRmrBarton = Number((15 * Math.log10(computedQ) + 50).toFixed(1));

  // Modified Q' (without Jw/SRF)
  const qPrime = Number((blockParam * shearParam).toFixed(2));
  const equivGsi = Math.max(5, Math.min(100, Math.round(9 * Math.log(Math.max(0.001, qPrime)) + 44)));

  const handleApplyToSystem = () => {
    onApplyQ(computedQ);
  };

  const handleSyncComponentsFromManualQ = (targetQ: number) => {
    if (targetQ >= 10) {
      handlePreset('good');
    } else if (targetQ >= 1) {
      handlePreset('fair');
    } else {
      handlePreset('poor');
    }
  };

  const handlePreset = (preset: 'good' | 'fair' | 'poor') => {
    if (preset === 'good') {
      onUpdateRqd(90);
      onUpdateJointSets(4);
      setJr(3);
      onUpdateJr?.(3);
      setJa(1);
      onUpdateJa?.(1);
      setJw(1);
      onUpdateJw?.(1);
      setSrf(1);
      onUpdateSrf?.(1);
    } else if (preset === 'fair') {
      onUpdateRqd(65);
      onUpdateJointSets(9);
      setJr(2);
      onUpdateJr?.(2);
      setJa(2);
      onUpdateJa?.(2);
      setJw(0.66);
      onUpdateJw?.(0.66);
      setSrf(1.5);
      onUpdateSrf?.(1.5);
    } else {
      onUpdateRqd(30);
      onUpdateJointSets(15);
      setJr(1);
      onUpdateJr?.(1);
      setJa(4);
      onUpdateJa?.(4);
      setJw(0.5);
      onUpdateJw?.(0.5);
      setSrf(2.5);
      onUpdateSrf?.(2.5);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher: Component Calculation vs. Direct Manual Input */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setCalcMode('components');
              onUpdateCalcMode?.('components');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              calcMode === 'components'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-teal-300" />
            <span>{isFa ? '۱. محاسبه بر اساس مؤلفه‌های ۶گانه (RQD, Jn, Jr, Ja, Jw, SRF)' : '1. Component Quotients (6 Parameters)'}</span>
          </button>

          <button
            onClick={() => {
              setCalcMode('manual');
              onUpdateCalcMode?.('manual');
              setManualQ(computedQ);
              onApplyQ(computedQ);
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              calcMode === 'manual'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Edit3 className="w-4 h-4 text-teal-200" />
            <span>{isFa ? '۲. ورود دستی و مستقیم مقدار نهایی Q' : '2. Direct Manual Q Input'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono self-end sm:self-center">
          <span className="text-slate-400">{isFa ? 'وضعیت محاسباتی:' : 'Calculation Mode:'}</span>
          <span className="px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/30 text-teal-300 font-bold">
            {calcMode === 'components'
              ? (isFa ? 'فرمول ۶ مؤلفه NGI' : '6-Parameter Formula')
              : (isFa ? 'ورود مستقیم کاربر' : 'Direct Manual')}
          </span>
        </div>
      </div>

      {/* Top Banner: Q Score & 3 Quotients Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Main Q Value Card */}
        <div
          className="md:col-span-5 p-5 rounded-2xl border flex flex-col justify-between shadow-xl"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: qClass.borderColor,
          }}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>{isFa ? 'سیستم کیفیت سنگ بارتون' : 'Barton Q-System (NGI)'}</span>
              </span>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
                style={{
                  backgroundColor: qClass.bgColor,
                  color: qClass.textColor,
                  border: `1px solid ${qClass.borderColor}`,
                }}
              >
                {isFa ? `رده کیفی ${qClass.id}` : `Class ${qClass.id}`}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-5xl font-black text-slate-100 tracking-tight font-mono">
                {computedQ}
              </span>
              <span className="text-sm font-semibold text-teal-300">Q-Value</span>
              <span className="text-xs text-slate-400 font-mono">
                {calcMode === 'manual'
                  ? (isFa ? '(ورود مستقیم دستی)' : '(Direct Manual Entry)')
                  : (isFa ? '(فرمول ۳ کسر بارتون)' : '(3 Quotients Formula)')}
              </span>
            </div>

            <div
              className="mt-3 p-2.5 rounded-xl border text-xs font-semibold"
              style={{
                backgroundColor: qClass.bgColor,
                color: qClass.textColor,
                borderColor: qClass.borderColor,
              }}
            >
              {isFa ? qClass.nameFa : qClass.nameEn}
            </div>

            <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
              {isFa ? qClass.descriptionFa : qClass.descriptionEn}
            </p>

            {/* Equivalent Values */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">
                  {isFa ? 'RMR معادل (Bieniawski):' : 'Equiv. RMR (Bieniawski):'}
                </span>
                <span className="font-bold text-amber-300 font-mono mt-0.5 block">
                  ≈ {equivRmrBieniawski}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">
                  {isFa ? 'GSI معادل (از Q\'):' : 'Equiv. GSI (from Q\'):'}
                </span>
                <span className="font-bold text-purple-300 font-mono mt-0.5 block">
                  ≈ {equivGsi}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={handleApplyToSystem}
              className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors shadow-md shadow-teal-600/30 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isFa ? 'اعمال مقدار Q به پروژه' : 'Apply Q to Project'}</span>
            </button>
            <button
              onClick={onNavigateToStandup}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
              title={isFa ? 'رفتن به بخش تخمین زمان پایداری' : 'Go to Stand-up time'}
            >
              <ArrowRight className={`w-3.5 h-3.5 ${isFa ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* 3 Physical Quotients Interpretation & Support Card */}
        <div className="md:col-span-7 p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-400" />
                <span>
                  {isFa
                    ? 'تفسیر فیزیکی ۳ نسبت بنیادی سیستم بارتون'
                    : 'Physical Meaning of the 3 Quotient Pairs'}
                </span>
              </h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePreset('good')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 cursor-pointer"
                >
                  {isFa ? 'سنگ خوب' : 'Good'}
                </button>
                <button
                  onClick={() => handlePreset('fair')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 cursor-pointer"
                >
                  {isFa ? 'متوسط' : 'Fair'}
                </button>
                <button
                  onClick={() => handlePreset('poor')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 cursor-pointer"
                >
                  {isFa ? 'ضعیف' : 'Poor'}
                </button>
              </div>
            </div>

            {/* 3 Quotients Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {/* RQD / Jn */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-teal-300 block">
                  RQD / Jn ({isFa ? 'اندازه بلوک' : 'Block Size'})
                </span>
                <span className="text-xl font-black font-mono text-slate-100 block">
                  {blockParam.toFixed(2)}
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isFa
                    ? 'بیانگر ابعاد هندسی و اندازه متوسط بلوک‌های سنگ بر حسب چگالی دسته‌های درزه.'
                    : 'Represents the relative block size of the rock mass.'}
                </p>
              </div>

              {/* Jr / Ja */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-amber-300 block">
                  Jr / Ja ({isFa ? 'اصطکاک درزه‌ها' : 'Inter-block Shear'})
                </span>
                <span className="text-xl font-black font-mono text-slate-100 block">
                  {shearParam.toFixed(2)}
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isFa
                    ? 'زاویه اصطکاک و مقاومت برشی سطوح ناپیوستگی و پرشدگی میان بلوک‌ها.'
                    : 'Represents inter-block shear strength and friction coefficient.'}
                </p>
              </div>

              {/* Jw / SRF */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-indigo-300 block">
                  Jw / SRF ({isFa ? 'تنش فعال' : 'Active Stress'})
                </span>
                <span className="text-xl font-black font-mono text-slate-100 block">
                  {stressParam.toFixed(2)}
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isFa
                    ? 'تعادل بین فشار آب منفذی و تنش‌های برجا یا بار سرباره محیط حفاری.'
                    : 'Represents the active stress ratio factoring in water pressure.'}
                </p>
              </div>
            </div>

            {/* NGI Support Recommendation */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 mt-3 space-y-1.5">
              <span className="font-semibold text-emerald-400 text-xs flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>{isFa ? 'سیستم نگهداری پیشنهادی NGI (بارتون و گریمستاد):' : 'NGI Support Guidelines:'}</span>
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isFa ? qClass.supportCategoryFa : qClass.supportCategoryEn}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Either 6-Parameter Interactive Selector OR Direct Manual Input Panel */}
      {calcMode === 'manual' ? (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-teal-500/40 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-teal-400">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>{isFa ? 'ورود مستقیم و دستی شاخص کیفیت سنگ Q بارتون' : 'Direct Manual Barton Q-Value Entry'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                    Manual Mode
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isFa
                    ? 'شاخص نهایی Q (از ۰.۰۰۱ تا ۱۰۰۰) را مستقیماً وارد کرده یا از طیف رده‌های تجربی ۹گانه بارتون انتخاب کنید.'
                    : 'Enter final Q-value (0.001 - 1000) directly or choose from Barton 9 empirical rock quality classes.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleSyncComponentsFromManualQ(manualQ)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer self-start sm:self-auto"
              title={isFa ? 'تنظیم مؤلفه‌های ۶گانه متناظر با این شاخص Q' : 'Sync 6 parameters to match this Q'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
              <span>{isFa ? 'تطبیق تقریبی مؤلفه‌ها با این Q' : 'Estimate 6 Parameters for this Q'}</span>
            </button>
          </div>

          {/* Direct Numeric Input, Multipliers & Class Badge */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-5 p-5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
              <label htmlFor="manual-q-input" className="text-xs font-semibold text-slate-300">
                {isFa ? 'مقدار عددی شاخص Q پروژه:' : 'Project Barton Q-Value:'}
              </label>

              {/* Multiplier buttons */}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <button
                  onClick={() => setManualQ(Number(Math.max(0.001, manualQ * 0.1).toFixed(3)))}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
                  title="Divide by 10"
                >
                  ÷ 10
                </button>
                <button
                  onClick={() => setManualQ(Number(Math.max(0.001, manualQ * 0.5).toFixed(3)))}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
                  title="Divide by 2"
                >
                  ÷ 2
                </button>
                <button
                  onClick={() => setManualQ(Number(Math.min(1000, manualQ * 2).toFixed(3)))}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
                  title="Multiply by 2"
                >
                  × 2
                </button>
                <button
                  onClick={() => setManualQ(Number(Math.min(1000, manualQ * 10).toFixed(3)))}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
                  title="Multiply by 10"
                >
                  × 10
                </button>
              </div>

              {/* Central Input Box */}
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border-2 border-teal-500/50 shadow-inner">
                <input
                  id="manual-q-input"
                  type="number"
                  min="0.001"
                  max="1000"
                  step="0.01"
                  value={manualQ}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      setManualQ(Math.max(0.001, Math.min(1000, val)));
                    }
                  }}
                  className="w-28 bg-transparent text-center font-mono font-black text-teal-400 text-3xl focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-400 font-mono">Q</span>
              </div>

              {/* Active Q Class Badge */}
              <div
                className="px-3 py-1 rounded-lg text-xs font-bold"
                style={{
                  backgroundColor: qClass.bgColor,
                  color: qClass.textColor,
                  border: `1px solid ${qClass.borderColor}`,
                }}
              >
                {isFa ? `رده ${qClass.id}: ${qClass.nameFa}` : `Class ${qClass.id}: ${qClass.nameEn}`}
              </div>
            </div>

            {/* Continuous Logarithmic Slider & 9 Barton Presets */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="font-semibold">{isFa ? 'لغزنده لگاریتمی پیوسته (Logarithmic):' : 'Logarithmic Continuous Slider:'}</span>
                  <span className="font-mono font-bold text-teal-400">Q = {manualQ}</span>
                </div>
                {/* Log slider: maps -3 to +3 (10^-3 to 10^3) */}
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.05"
                  value={Math.log10(Math.max(0.001, manualQ))}
                  onChange={(e) => {
                    const logVal = parseFloat(e.target.value);
                    const qVal = Number(Math.pow(10, logVal).toFixed(3));
                    setManualQ(Math.max(0.001, Math.min(1000, qVal)));
                  }}
                  className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
                  <span>{isFa ? '۰.۰۰۱ (استثنایی بحرانی)' : '0.001 (Exceptionally Poor)'}</span>
                  <span>{isFa ? '۰.۱ (خیلی ضعیف)' : '0.1 (Extremely Poor)'}</span>
                  <span>{isFa ? '۱.۰ (ضعیف)' : '1.0 (Poor)'}</span>
                  <span>{isFa ? '۱۰ (خوب)' : '10 (Good)'}</span>
                  <span>{isFa ? '۱۰۰۰ (استثنایی عالی)' : '1000 (Exceptionally Good)'}</span>
                </div>
              </div>

              {/* 9 Barton Standard Rock Classes Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-slate-400 font-medium block">
                  {isFa ? 'رده‌های ۹گانه استاندارد کیفی سنگ بارتون (NGI):' : 'Barton 9 Quality Classes Presets:'}
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {[
                    { id: 'A', classNum: 1, qVal: 600, nameFa: 'استثنایی عالی', nameEn: 'Exceptionally Good' },
                    { id: 'B', classNum: 2, qVal: 250, nameFa: 'بسیار عالی', nameEn: 'Extremely Good' },
                    { id: 'C', classNum: 3, qVal: 70, nameFa: 'خیلی خوب', nameEn: 'Very Good' },
                    { id: 'D', classNum: 4, qVal: 20, nameFa: 'خوب', nameEn: 'Good' },
                    { id: 'E', classNum: 5, qVal: 6.0, nameFa: 'متوسط', nameEn: 'Fair' },
                    { id: 'F', classNum: 6, qVal: 2.0, nameFa: 'ضعیف', nameEn: 'Poor' },
                    { id: 'G', classNum: 7, qVal: 0.5, nameFa: 'خیلی ضعیف', nameEn: 'Very Poor' },
                    { id: 'H', classNum: 8, qVal: 0.05, nameFa: 'بحرانی', nameEn: 'Extremely Poor' },
                    { id: 'I', classNum: 9, qVal: 0.005, nameFa: 'استثنایی بحرانی', nameEn: 'Exceptionally Poor' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setManualQ(preset.qVal)}
                      className={`p-1.5 rounded-lg bg-slate-950/80 border text-center transition-all cursor-pointer hover:scale-102 ${
                        qClass.id === preset.classNum
                          ? 'border-teal-500 bg-teal-500/15 shadow-md shadow-teal-500/20 text-teal-300 font-bold'
                          : 'border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-mono text-xs">
                        {isFa ? `رده ${preset.id} (${preset.qVal})` : `Class ${preset.id} (${preset.qVal})`}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">
                        {isFa ? preset.nameFa : preset.nameEn}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Equivalent Indexes & Correlations */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">{isFa ? 'RMR معادل رابطه بارتون:' : 'Barton Equivalent RMR:'}</span>
              <span className="font-mono font-bold text-amber-300 text-sm mt-0.5 block">
                RMR ≈ {Number((15 * Math.log10(manualQ) + 50).toFixed(1))}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">RMR = 15 log10(Q) + 50 (Barton 2002)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">{isFa ? 'RMR معادل رابطه بینیاوسکی:' : 'Bieniawski Equivalent RMR:'}</span>
              <span className="font-mono font-bold text-amber-300 text-sm mt-0.5 block">
                RMR ≈ {Number((9 * Math.log(manualQ) + 44).toFixed(1))}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">RMR = 9 ln(Q) + 44 (Bieniawski 1989)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">{isFa ? 'شاخص مقاومت زمین‌شناسی GSI:' : 'Hoek GSI Estimate:'}</span>
              <span className="font-mono font-bold text-purple-300 text-sm mt-0.5 block">
                GSI ≈ {Math.max(5, Math.min(100, Math.round(9 * Math.log(manualQ) + 44)))}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Hoek et al. (1995): GSI ≈ 9 ln(Q) + 44</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-teal-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  {isFa
                    ? 'ارزیابی و تنظیم پارامترهای ۶ گانه سیستم Q (Barton et al.)'
                    : 'Barton 6-Parameter Rating System'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isFa
                    ? 'مقادیر RQD، Jn، Jr، Ja، Jw و SRF را بر مبنای جدول استاندارد موسسه ژئوتکنیک نروژ تنظیم کنید.'
                    : 'Configure RQD, Jn, Jr, Ja, Jw, and SRF from NGI standards.'}
                </p>
              </div>
            </div>
          </div>

        {/* Unified Geotechnical Context Bar */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="font-semibold">{isFa ? 'متغیرهای ژئوتکنیکی یکپارچه:' : 'Unified Geotech Variables:'}</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              {isFa ? '(همگام‌سازی بلادرنگ با RMR، حفاری‌پذیری و سیستم نگهداری)' : '(Real-time synced with RMR, Excavability & Support)'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap font-mono text-[11px]">
            {/* Depth H */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-indigo-500/30 text-indigo-300">
              <span className="text-slate-400">{isFa ? 'عمق (H):' : 'Depth (H):'}</span>
              <strong className="text-indigo-400">{currentDepth}m</strong>
            </div>

            {/* Intact UCS */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-500/30 text-amber-300">
              <span className="text-slate-400">UCS:</span>
              <strong className="text-amber-400">{currentUcs} MPa</strong>
            </div>

            {/* Spacing */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-emerald-500/30 text-emerald-300">
              <span className="text-slate-400">{isFa ? 'فاصله‌داری:' : 'Spacing:'}</span>
              <strong className="text-emerald-400">
                {currentJointSpacing >= 1 ? `${currentJointSpacing.toFixed(2)}m` : `${Math.round(currentJointSpacing * 100)}cm`}
              </strong>
            </div>

            {/* Joint Sets Jn */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-teal-500/30 text-teal-300">
              <span className="text-slate-400">{isFa ? 'تعداد درزه‌ها (Jn):' : 'Joint Sets (Jn):'}</span>
              <strong className="text-teal-400">{jn}</strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
          {/* 1. RQD (Synchronized globally) */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-200">
                  {isFa ? '۱. شاخص کیفیت سنگ (RQD)' : '1. Rock Quality (RQD)'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                  {isFa ? 'متصل به RMR و نگهداری' : 'Linked to RMR & Support'}
                </span>
              </div>
              <span className="font-mono text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded">
                {rqd}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={1}
              value={rqd}
              onChange={(e) => onUpdateRqd(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10% ({isFa ? 'حداقل NGI' : 'NGI Min'})</span>
              <span>100% ({isFa ? 'عالی' : 'Excellent'})</span>
            </div>
          </div>

          {/* 2. Jn (Synchronized globally with RMR & Support Hub) */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-200">
                  {isFa ? '۲. تعداد دسته‌درزه‌ها (Jn)' : '2. Joint Set Number (Jn)'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                  {isFa ? 'متصل به RMR و نگهداری' : 'Linked to RMR & Support'}
                </span>
              </div>
              <span className="font-mono text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded">
                {jn}
              </span>
            </div>
            <select
              value={jn}
              onChange={(e) => onUpdateJointSets(Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
            >
              <option value={0.5}>{isFa ? 'تک‌سنگ، بدون درزه یا درزه‌های نادر (0.5)' : 'Massive, no/few joints (0.5)'}</option>
              <option value={2}>{isFa ? 'یک دسته درزه (2)' : 'One joint set (2)'}</option>
              <option value={3}>{isFa ? 'یک دسته درزه به اضافه درزه‌های تصادفی (3)' : 'One set plus random (3)'}</option>
              <option value={4}>{isFa ? 'دو دسته درزه (4)' : 'Two joint sets (4)'}</option>
              <option value={6}>{isFa ? 'دو دسته درزه به اضافه درزه‌های تصادفی (6)' : 'Two sets plus random (6)'}</option>
              <option value={9}>{isFa ? 'سه دسته درزه (9)' : 'Three joint sets (9)'}</option>
              <option value={12}>{isFa ? 'سه دسته درزه به اضافه درزه‌های تصادفی (12)' : 'Three sets plus random (12)'}</option>
              <option value={15}>{isFa ? 'چهار دسته درزه یا بیشتر (15)' : 'Four or more sets (15)'}</option>
              <option value={20}>{isFa ? 'سنگ کاملاً خرد شده، شبیه خاک (20)' : 'Crushed rock, earth-like (20)'}</option>
            </select>
          </div>

          {/* 3. Jr */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-200">
                {isFa ? '۳. ضریب زبری درزه (Jr)' : '3. Joint Roughness (Jr)'}
              </span>
              <span className="font-mono text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded">
                {jr}
              </span>
            </div>
            <select
              value={jr}
              onChange={(e) => {
                const val = Number(e.target.value);
                setJr(val);
                onUpdateJr?.(val);
              }}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
            >
              <option value={4}>{isFa ? 'ناپیوسته (4.0)' : 'Discontinuous joints (4.0)'}</option>
              <option value={3}>{isFa ? 'خشن و موج‌دار (3.0)' : 'Rough, undulating (3.0)'}</option>
              <option value={2}>{isFa ? 'صاف و موج‌دار (2.0)' : 'Smooth, undulating (2.0)'}</option>
              <option value={1.5}>{isFa ? 'خشن و صفحه‌ای (1.5)' : 'Rough, planar (1.5)'}</option>
              <option value={1}>{isFa ? 'صاف و صفحه‌ای (1.0)' : 'Smooth, planar (1.0)'}</option>
              <option value={0.5}>{isFa ? 'آینه‌سنگ و لغزنده (0.5)' : 'Slickensided planar (0.5)'}</option>
            </select>
          </div>

          {/* 4. Ja */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-200">
                {isFa ? '۴. ضریب هوازدگی و دگرسانی (Ja)' : '4. Joint Alteration (Ja)'}
              </span>
              <span className="font-mono text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded">
                {ja}
              </span>
            </div>
            <select
              value={ja}
              onChange={(e) => {
                const val = Number(e.target.value);
                setJa(val);
                onUpdateJa?.(val);
              }}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
            >
              <option value={0.75}>{isFa ? 'درزه کاملاً جوش‌خورده و سخت (0.75)' : 'Tightly healed (0.75)'}</option>
              <option value={1}>{isFa ? 'دیواره‌های درزه بدون تغییر و دگرسانی (1.0)' : 'Unaltered joint walls (1.0)'}</option>
              <option value={2}>{isFa ? 'اندکی دگرسان و پوشش اکسید آهن (2.0)' : 'Slightly altered / stained (2.0)'}</option>
              <option value={3}>{isFa ? 'پوشش سیلت یا ماسه بدون رس (3.0)' : 'Silty/sandy coatings (3.0)'}</option>
              <option value={4}>{isFa ? 'پوشش رسی نازک با چسبندگی کم (4.0)' : 'Clay coating (4.0)'}</option>
              <option value={8}>{isFa ? 'پرشدگی رسی ضخیم متراکم (8.0)' : 'Thick clay gouge (8.0)'}</option>
              <option value={15}>{isFa ? 'پرشدگی رسی متورم‌شونده ضخیم (15.0)' : 'Thick swelling clay (15.0)'}</option>
            </select>
          </div>

          {/* 5. Jw */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-200">
                {isFa ? '۵. ضریب کاهش آب زیرزمینی (Jw)' : '5. Water Reduction (Jw)'}
              </span>
              <span className="font-mono text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded">
                {jw}
              </span>
            </div>
            <select
              value={jw}
              onChange={(e) => {
                const val = Number(e.target.value);
                setJw(val);
                onUpdateJw?.(val);
              }}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
            >
              <option value={1.0}>{isFa ? 'حفاری خشک یا نشت بسیار اندک (Jw: 1.0 | امتیاز RMR: ۱۵)' : 'Dry / minor inflow (Jw: 1.0 | RMR: 15)'}</option>
              <option value={0.66}>{isFa ? 'جریان یا فشار متوسط آب (Jw: 0.66 | امتیاز RMR: ۱۰)' : 'Medium inflow / pressure (Jw: 0.66 | RMR: 10)'}</option>
              <option value={0.5}>{isFa ? 'آبدهی زیاد در سنگ درزه‌دار (Jw: 0.5 | امتیاز RMR: ۷)' : 'Large inflow in jointed rock (Jw: 0.5 | RMR: 7)'}</option>
              <option value={0.33}>{isFa ? 'آبدهی زیاد با شستشوی پرکننده (Jw: 0.33 | امتیاز RMR: ۴)' : 'Large inflow washing gouge (Jw: 0.33 | RMR: 4)'}</option>
              <option value={0.1}>{isFa ? 'آبدهی بسیار شدید و تحت فشار بالا (Jw: 0.1 | امتیاز RMR: ۰)' : 'Exceptionally high inflow (Jw: 0.1 | RMR: 0)'}</option>
            </select>
          </div>

          {/* 6. SRF */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-200">
                {isFa ? '۶. فاکتور کاهش تنش (SRF)' : '6. Stress Reduction (SRF)'}
              </span>
              <span className="font-mono text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded">
                {srf}
              </span>
            </div>
            <select
              value={srf}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSrf(val);
                onUpdateSrf?.(val);
              }}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
            >
              <option value={1.0}>{isFa ? 'تنش متوسط در عمق متداول (1.0)' : 'Medium stress conditions (1.0)'}</option>
              <option value={2.5}>{isFa ? 'مناطق سست و زون‌های خردشده ضعیف (2.5)' : 'Weakness zones / faults (2.5)'}</option>
              <option value={5.0}>{isFa ? 'زون‌های خردشده چندگانه با خاک رس (5.0)' : 'Multiple fault zones (5.0)'}</option>
              <option value={10.0}>{isFa ? 'تنش بسیار بالا با ریزش سنگ (Rockburst) (10.0)' : 'High stress rockburst (10.0)'}</option>
              <option value={15.0}>{isFa ? 'فشار سنگین پلاستیک (Squeezing rock) (15.0)' : 'Heavy squeezing rock (15.0)'}</option>
              <option value={0.5}>{isFa ? 'سنگ در عمق کم و تنش بسیار پایین (0.5)' : 'Low stress near surface (0.5)'}</option>
            </select>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
