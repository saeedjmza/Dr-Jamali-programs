import React, { useState, useMemo, useEffect } from 'react';
import {
  Grid,
  Layers,
  Sparkles,
  Info,
  Scale,
  Activity,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Edit3,
  Sliders,
  RotateCcw,
  Link2,
} from 'lucide-react';
import {
  RockStructureType,
  SurfaceQualityType,
  FlyschClassType,
  FLYSCH_CLASSES,
  ROCK_STRUCTURES,
  SURFACE_QUALITIES,
  GSI_MATRIX,
  INTACT_ROCK_TYPES,
  calculateHoekBrownParams,
  rmrToGsi,
  gsiToRmr,
  gsiToQPrime,
} from '../../utils/gsiCalculation';
import { GeneralGsiChart } from './gsi/GeneralGsiChart';
import { FlyschGsiChart } from './gsi/FlyschGsiChart';
import { HoekBrownEnvelopeChart } from './HoekBrownEnvelopeChart';

interface GsiClassificationTabProps {
  currentRmr: number;
  currentQ: number;
  currentGsi?: number;
  currentUcs?: number;
  currentMi?: number;
  currentDFactor?: number;
  onApplyRmr: (rmr: number) => void;
  onApplyQ: (q: number) => void;
  onApplyGsi: (gsi: number) => void;
  onUpdateUcs?: (ucs: number) => void;
  onUpdateMi?: (mi: number) => void;
  onUpdateDFactor?: (d: number) => void;
  onNavigateToStandup: () => void;
  onNavigateToSupport?: () => void;
  lang: 'fa' | 'en';
}

export const GsiClassificationTab: React.FC<GsiClassificationTabProps> = ({
  currentRmr,
  currentQ,
  currentGsi = 55,
  currentUcs,
  currentMi,
  currentDFactor,
  onApplyRmr,
  onApplyQ,
  onApplyGsi,
  onUpdateUcs,
  onUpdateMi,
  onUpdateDFactor,
  onNavigateToStandup,
  onNavigateToSupport,
  lang,
}) => {
  const isFa = lang === 'fa';

  // State for apply confirmation toast
  const [isApplied, setIsApplied] = useState<boolean>(false);

  // Mode: 2D Geological Matrix vs Direct Manual GSI Input
  const [calcMode, setCalcMode] = useState<'matrix' | 'manual'>('matrix');

  // Selected structure and surface quality
  const [selectedStructure, setSelectedStructure] =
    useState<RockStructureType>('blocky');
  const [selectedSurface, setSelectedSurface] =
    useState<SurfaceQualityType>('fair');

  // Rock type: General Rock Mass (Hoek & Marinos 2000) vs Flysch (Marinos & Hoek 2001)
  const [rockType, setRockType] = useState<'General' | 'Flysch'>('General');
  const [selectedFlyschClass, setSelectedFlyschClass] =
    useState<FlyschClassType>('A');

  // Direct GSI override slider / manual - initialized with current project GSI
  const [customGsi, setCustomGsi] = useState<number>(currentGsi);

  // Keep customGsi in sync when currentGsi prop changes (e.g. file loaded)
  useEffect(() => {
    if (typeof currentGsi === 'number' && !isNaN(currentGsi) && currentGsi !== customGsi) {
      setCustomGsi(currentGsi);
    }
  }, [currentGsi]);

  // Intact rock type & parameters
  const [selectedRockId, setSelectedRockId] = useState<string>('sandstone');
  const selectedRock =
    INTACT_ROCK_TYPES.find((r) => r.id === selectedRockId) ??
    INTACT_ROCK_TYPES[5];

  // Synchronized with RMR UCS parameter
  const [sigmaCi, setSigmaCi] = useState<number>(currentUcs ?? selectedRock.typicalUcsMPa);
  const [mi, setMi] = useState<number>(currentMi ?? selectedRock.miDefault);
  const [dFactor, setDFactor] = useState<number>(currentDFactor ?? 0.0); // Disturbance factor 0 to 1
  const [eiGPa, setEiGPa] = useState<number>(selectedRock.typicalEiGPa);

  // Keep sigmaCi in sync if user changes UCS in RMR
  useEffect(() => {
    if (currentUcs !== undefined && currentUcs > 0 && currentUcs !== sigmaCi) {
      setSigmaCi(currentUcs);
    }
  }, [currentUcs]);

  // Keep mi in sync if external mi changes
  useEffect(() => {
    if (currentMi !== undefined && currentMi > 0 && currentMi !== mi) {
      setMi(currentMi);
    }
  }, [currentMi]);

  // Keep dFactor in sync
  useEffect(() => {
    if (currentDFactor !== undefined && currentDFactor !== dFactor) {
      setDFactor(currentDFactor);
    }
  }, [currentDFactor]);

  // When rock changes, update defaults and propagate to RMR and global state
  const handleRockTypeChange = (rockId: string) => {
    setSelectedRockId(rockId);
    const r = INTACT_ROCK_TYPES.find((item) => item.id === rockId);
    if (r) {
      setSigmaCi(r.typicalUcsMPa);
      onUpdateUcs?.(r.typicalUcsMPa);
      setMi(r.miDefault);
      onUpdateMi?.(r.miDefault);
      setEiGPa(r.typicalEiGPa);
    }
  };

  const handleSigmaCiChange = (newVal: number) => {
    const val = Math.max(1, newVal);
    setSigmaCi(val);
    onUpdateUcs?.(val);
  };

  const handleMiChange = (newMi: number) => {
    const val = Math.max(2, newMi);
    setMi(val);
    onUpdateMi?.(val);
  };

  const handleDFactorChange = (newD: number) => {
    setDFactor(newD);
    onUpdateDFactor?.(newD);
  };

  // Matrix cell selection
  const handleSelectCell = (
    struct: RockStructureType,
    surf: SurfaceQualityType
  ) => {
    setSelectedStructure(struct);
    setSelectedSurface(surf);
    const val = GSI_MATRIX[struct][surf];
    setCustomGsi(val);
    onApplyGsi(val);
  };

  // Sync from current RMR
  const handleSyncFromRmr = () => {
    const val = rmrToGsi(currentRmr);
    setCustomGsi(val);
    onApplyGsi(val);
  };

  // Generalized Hoek-Brown calculations
  const hbResults = useMemo(() => {
    return calculateHoekBrownParams(customGsi, sigmaCi, mi, dFactor, eiGPa);
  }, [customGsi, sigmaCi, mi, dFactor, eiGPa]);

  // GSI Qualitative category label
  const gsiCategory = useMemo(() => {
    if (customGsi >= 75)
      return {
        labelFa: 'بسیار خوب تا عالی (Very Good to Excellent)',
        labelEn: 'Very Good to Excellent',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
      };
    if (customGsi >= 55)
      return {
        labelFa: 'خوب (Good)',
        labelEn: 'Good',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10 border-cyan-500/30',
      };
    if (customGsi >= 40)
      return {
        labelFa: 'متوسط (Fair)',
        labelEn: 'Fair',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
      };
    if (customGsi >= 20)
      return {
        labelFa: 'ضعیف (Poor)',
        labelEn: 'Poor',
        color: 'text-orange-400',
        bg: 'bg-orange-500/10 border-orange-500/30',
      };
    return {
      labelFa: 'بسیار ضعیف تا بحرانی (Very Poor)',
      labelEn: 'Very Poor',
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/30',
    };
  }, [customGsi]);

  const structureKeys = Object.keys(ROCK_STRUCTURES) as RockStructureType[];
  const surfaceKeys = Object.keys(SURFACE_QUALITIES) as SurfaceQualityType[];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick GSI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Main GSI Index Card */}
        <div className="md:col-span-4 p-5 rounded-2xl bg-gradient-to-br from-purple-950/50 via-slate-900 to-slate-950 border border-purple-800/40 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>{isFa ? 'شاخص مقاومت زمین‌شناسی' : 'Geological Strength Index'}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-500/20 border border-purple-500/40 text-purple-200">
                Hoek & Brown
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-5xl font-black text-slate-100 tracking-tight font-mono">
                {customGsi}
              </span>
              <span className="text-sm font-semibold text-purple-300">/ 100</span>
            </div>

            <div className={`mt-3 p-2.5 rounded-xl border text-xs font-medium ${gsiCategory.bg} ${gsiCategory.color}`}>
              {isFa ? gsiCategory.labelFa : gsiCategory.labelEn}
            </div>

            <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
              {isFa
                ? 'شاخص GSI بر اساس مشاهده صحرایی ساختار درزه‌داری توده‌سنگ و کیفیت سطوح ناپیوستگی‌ها تعیین می‌شود.'
                : 'GSI is determined from visual assessment of rock mass blockiness and discontinuity surface condition.'}
            </p>
          </div>

          {/* Slider for fine adjustment */}
          <div className="mt-4 pt-3 border-t border-purple-900/40">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
              <span>GSI Slider:</span>
              <span className="text-purple-300 font-bold">{customGsi}</span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={1}
              value={customGsi}
              onChange={(e) => setCustomGsi(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>{isFa ? '5 (خرد شده)' : '5 (Crushed)'}</span>
              <span>{isFa ? '50 (متوسط)' : '50 (Medium)'}</span>
              <span>{isFa ? '100 (بکر)' : '100 (Intact)'}</span>
            </div>

            {/* Apply GSI to Project Button & Status */}
            <div className="mt-3.5 pt-3 border-t border-purple-900/40 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{isFa ? 'مقدار ثبت‌شده در پروژه:' : 'Current Project Value:'}</span>
                <span className="font-bold text-purple-300">
                  GSI = {currentGsi}
                  {customGsi === currentGsi && (
                    <span className="text-[10px] text-emerald-400 font-sans mr-1 ml-1">({isFa ? 'همگام' : 'Synced'})</span>
                  )}
                </span>
              </div>

              <button
                onClick={() => {
                  onApplyGsi(customGsi);
                  setIsApplied(true);
                  setTimeout(() => setIsApplied(false), 2500);
                }}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isApplied
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-purple-200" />
                <span>
                  {isApplied
                    ? (isFa ? 'مقدار GSI به پروژه اعمال شد ✓' : 'GSI applied to project ✓')
                    : (isFa ? 'اعمال مقدار GSI به پروژه' : 'Apply GSI to Project')}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Correlations with RMR & Q Card */}
        <div className="md:col-span-8 p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>{isFa ? 'همبستگی و روابط تجربی با RMR و سیستم Q' : 'Correlations with RMR and Q-System'}</span>
              </h4>
              <button
                onClick={handleSyncFromRmr}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title={isFa ? 'دریافت GSI بر مبنای مقدار فعلی RMR در سیستم' : 'Sync GSI from current RMR'}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isFa ? `محاسبه از RMR (${currentRmr})` : `Calc from RMR (${currentRmr})`}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {/* RMR Correlation */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400">RMR 1989 (Bieniawski)</span>
                  <span className="font-mono text-slate-300 font-bold">
                    ≈ {gsiToRmr(customGsi)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                  {isFa ? 'فرمول هوک (2002): GSI = RMR - 5' : 'Hoek formula: GSI = RMR89 - 5'}
                </p>
                <button
                  onClick={() => onApplyRmr(gsiToRmr(customGsi))}
                  className="w-full py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-200 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {isFa ? 'ثبت این مقدار برای RMR در سیستم' : 'Apply to RMR in system'}
                </button>
              </div>

              {/* Q-Prime Correlation */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-400">Barton Q' (Modified Q)</span>
                  <span className="font-mono text-slate-300 font-bold">
                    ≈ {gsiToQPrime(customGsi).toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                  {isFa ? 'فرمول بارتون: GSI = 9×ln(Q\') + 44' : 'Barton formula: GSI = 9*ln(Q\') + 44'}
                </p>
                <button
                  onClick={() => onApplyQ(Number(gsiToQPrime(customGsi).toFixed(2)))}
                  className="w-full py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/40 text-teal-200 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {isFa ? 'ثبت این مقدار برای Q در سیستم' : 'Apply to Q in system'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-400">
              {isFa ? 'انتقال مشخصات GSI به ماژول‌های تحلیلی:' : 'Transfer GSI parameters:'}
            </span>
            <div className="flex items-center gap-2">
              {onNavigateToSupport && (
                <button
                  onClick={onNavigateToSupport}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-900/30 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{isFa ? 'ورود به برآورد سیستم نگهداری' : 'Go to Support Design'}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isFa ? 'rotate-180' : ''}`} />
                </button>
              )}
              <button
                onClick={onNavigateToStandup}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-900/30 cursor-pointer"
              >
                <span>{isFa ? 'زمان خودپایداری' : 'Stand-up Time'}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isFa ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher: Geological Matrix vs Direct Manual GSI Input */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            onClick={() => setCalcMode('matrix')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              calcMode === 'matrix'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Grid className="w-4 h-4 text-purple-300" />
            <span>{isFa ? '۱. دیاگرام‌های استاندارد هوک و مارینوس (General & Flysch)' : '1. Standard Hoek & Marinos Charts (General & Flysch)'}</span>
          </button>

          <button
            onClick={() => setCalcMode('manual')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              calcMode === 'manual'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Edit3 className="w-4 h-4 text-purple-200" />
            <span>{isFa ? '۲. ورود مستقیم و دستی عدد GSI' : '2. Direct Manual GSI Entry'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono self-end sm:self-center">
          <span className="text-slate-400">{isFa ? 'وضعیت ورودی:' : 'Input Mode:'}</span>
          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold">
            {calcMode === 'matrix'
              ? (isFa ? 'ماتریس ساختار و سطوح' : 'Chart Selection')
              : (isFa ? 'ورود دستی مستقیم کاربر' : 'Direct Manual')}
          </span>
        </div>
      </div>

      {/* Conditional: Manual Input Card vs Interactive 2D GSI Matrix Table */}
      {calcMode === 'manual' ? (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-purple-500/40 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>{isFa ? 'ورود مستقیم و سریع شاخص مقاومت زمین‌شناسی GSI' : 'Direct Manual GSI Entry'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Manual Mode
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isFa
                    ? 'عدد شاخص مقاومت زمین‌شناسی (۵ تا ۱۰۰) را وارد کرده یا از طیف رده‌های تجربی پنج‌گانه انتخاب کنید.'
                    : 'Set the GSI value (5 to 100) directly via stepper, slider, or qualitative class presets.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSyncFromRmr}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer self-start sm:self-auto"
              title={isFa ? 'محاسبه مقدار GSI بر پایه RMR فعلی' : 'Calculate GSI based on RMR'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
              <span>{isFa ? `محاسبه از RMR پروژه (${currentRmr})` : `Sync from RMR (${currentRmr})`}</span>
            </button>
          </div>

          {/* Stepper, Direct Numeric Input, and Class Badge */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-5 p-5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-xs font-semibold text-slate-300">
                {isFa ? 'مقدار عددی شاخص GSI پروژه:' : 'Project GSI Value:'}
              </span>

              {/* Steppers */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCustomGsi((prev) => Math.max(5, prev - 5))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
                >
                  {isFa ? '-۵' : '-5'}
                </button>
                <button
                  onClick={() => setCustomGsi((prev) => Math.max(5, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
                >
                  {isFa ? '-۱' : '-1'}
                </button>
                <div className="flex items-center px-4 py-2 rounded-xl bg-slate-900 border-2 border-purple-500 shadow-inner">
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={customGsi}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setCustomGsi(Math.max(5, Math.min(100, val)));
                    }}
                    className="w-20 bg-transparent text-center font-mono font-black text-purple-400 text-3xl focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-400 font-mono">{isFa ? '/ ۱۰۰' : '/ 100'}</span>
                </div>
                <button
                  onClick={() => setCustomGsi((prev) => Math.min(100, prev + 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
                >
                  {isFa ? '+۱' : '+1'}
                </button>
                <button
                  onClick={() => setCustomGsi((prev) => Math.min(100, prev + 5))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
                >
                  {isFa ? '+۵' : '+5'}
                </button>
              </div>

              {/* Active Category Badge */}
              <div className={`px-3 py-1 rounded-lg text-xs font-bold ${gsiCategory.bg} ${gsiCategory.color}`}>
                {isFa ? gsiCategory.labelFa : gsiCategory.labelEn}
              </div>
            </div>

            {/* Slider & Presets */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="font-semibold">{isFa ? 'لغزنده پیوسته شاخص GSI:' : 'Continuous GSI Slider:'}</span>
                  <span className="font-mono font-bold text-purple-400">GSI = {customGsi}</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={1}
                  value={customGsi}
                  onChange={(e) => setCustomGsi(Number(e.target.value))}
                  className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono px-1">
                  <span>{isFa ? '۵ (خرد شده / بحرانی)' : '5 (Disintegrated)'}</span>
                  <span>{isFa ? '۳۰ (ضعیف)' : '30 (Poor)'}</span>
                  <span>{isFa ? '۵۰ (متوسط)' : '50 (Fair)'}</span>
                  <span>{isFa ? '۷۰ (خوب)' : '70 (Good)'}</span>
                  <span>{isFa ? '۱۰۰ (بکر / بسیار عالی)' : '100 (Intact / Very Good)'}</span>
                </div>
              </div>

              {/* 5 Qualitative Classes Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-slate-400 font-medium block">
                  {isFa ? 'انتخاب سریع از رده‌های کیفی استاندارد هوک:' : 'Quick Select Standard Hoek Qualitative Classes:'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {[
                    { val: 85, labelFa: 'بسیار خوب تا عالی', labelEn: 'Very Good to Excellent', range: '75-100', color: 'emerald' },
                    { val: 65, labelFa: 'خوب', labelEn: 'Good', range: '55-75', color: 'cyan' },
                    { val: 48, labelFa: 'متوسط', labelEn: 'Fair', range: '40-55', color: 'amber' },
                    { val: 28, labelFa: 'ضعیف', labelEn: 'Poor', range: '20-40', color: 'orange' },
                    { val: 12, labelFa: 'خیلی ضعیف', labelEn: 'Very Poor', range: '< 20', color: 'red' },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      onClick={() => setCustomGsi(preset.val)}
                      className={`p-2 rounded-lg border text-center transition-all cursor-pointer hover:scale-102 ${
                        (preset.val >= 75 && customGsi >= 75) ||
                        (preset.val === 65 && customGsi >= 55 && customGsi < 75) ||
                        (preset.val === 48 && customGsi >= 40 && customGsi < 55) ||
                        (preset.val === 28 && customGsi >= 20 && customGsi < 40) ||
                        (preset.val === 12 && customGsi < 20)
                          ? 'border-purple-500 bg-purple-500/20 text-purple-300 font-bold'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{isFa ? preset.labelFa : preset.labelEn}</div>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">GSI ≈ {preset.val} ({preset.range})</div>
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onApplyGsi(customGsi);
                        setIsApplied(true);
                        setTimeout(() => setIsApplied(false), 2500);
                      }}
                      className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-purple-600/30 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 text-purple-200" />
                      <span>
                        {isApplied
                          ? (isFa ? 'اعمال شد ✓' : 'Applied ✓')
                          : (isFa ? `اعمال GSI = ${customGsi} به پروژه` : `Apply GSI = ${customGsi} to Project`)}
                      </span>
                    </button>
                    <span className="text-[11px] font-mono text-slate-400">
                      ({isFa ? 'پروژه:' : 'Project:'} GSI = {currentGsi})
                    </span>
                  </div>

                  {onNavigateToSupport && (
                    <button
                      onClick={onNavigateToSupport}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-purple-400" />
                      <span>{isFa ? 'برآورد سیستم نگهداری' : 'Support Design'}</span>
                      <ArrowRight className={`w-3 h-3 ${isFa ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Visual Reconstructed Hoek & Marinos GSI Charts (General & Flysch) */
        <div className="space-y-4 animate-in fade-in duration-200">
          {rockType === 'General' ? (
            <GeneralGsiChart
              selectedGsi={customGsi}
              onSelectGsi={(gsi) => setCustomGsi(gsi)}
              selectedStructure={selectedStructure}
              selectedSurface={selectedSurface}
              onSelectStructureAndSurface={(struct, surf, gsi) => {
                setSelectedStructure(struct);
                setSelectedSurface(surf);
                setCustomGsi(gsi);
              }}
              rockType={rockType}
              onChangeRockType={(type) => setRockType(type)}
            />
          ) : (
            <FlyschGsiChart
              selectedGsi={customGsi}
              onSelectGsi={(gsi) => setCustomGsi(gsi)}
              selectedFlyschClass={selectedFlyschClass}
              onSelectFlyschClass={(fClass, gsi) => {
                setSelectedFlyschClass(fClass);
                setCustomGsi(gsi);
              }}
              rockType={rockType}
              onChangeRockType={(type) => setRockType(type)}
            />
          )}
        </div>
      )}

      {/* Hoek-Brown Rock Mass Mechanical Parameters Section */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                {isFa
                  ? 'محاسبه پارامترهای مکانیکی توده‌سنگ بر پایه معیار هوک و براون (Hoek-Brown Criterion)'
                  : 'Rock Mass Mechanical Parameters (Generalized Hoek-Brown Criterion)'}
              </h3>
              <p className="text-xs text-slate-400">
                {isFa
                  ? 'برآورد پارامترهای mb، s، a، مدول الاستیسیته Erm، مقاومت فشاری توده‌سنگ و مقادیر معادل موهر-کولمب'
                  : 'Estimating mb, s, a, Erm deformation modulus, compressive strength and equivalent Mohr-Coulomb'}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono text-xs border border-indigo-500/40">
            Hoek et al. 2002
          </span>
        </div>

        {/* Inputs for Hoek-Brown: Rock Type, UCS, mi, D-factor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Rock Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {isFa ? 'نوع سنگ بکر (Intact Rock Type):' : 'Intact Rock Type:'}
            </label>
            <select
              value={selectedRockId}
              onChange={(e) => handleRockTypeChange(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              {INTACT_ROCK_TYPES.map((rock) => (
                <option key={rock.id} value={rock.id}>
                  {isFa ? `${rock.nameFa} (${rock.categoryFa})` : `${rock.nameEn} (${rock.categoryEn})`}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500 font-mono">
              mi: {selectedRock.miDefault} | UCS: {selectedRock.typicalUcsMPa} MPa
            </span>
          </div>

          {/* Intact UCS with Direct Link to RMR */}
          <div className="space-y-1.5 p-2 rounded-xl bg-amber-500/5 border border-amber-500/30">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{isFa ? 'مقاومت تک‌محوری سنگ بکر (σci):' : 'Intact UCS (σci):'}</span>
              </span>
              <span className="font-mono text-amber-400 font-bold">{sigmaCi} MPa</span>
            </div>
            <input
              type="number"
              min={1}
              max={400}
              value={sigmaCi}
              onChange={(e) => handleSigmaCiChange(Number(e.target.value))}
              className="w-full p-2 rounded-xl bg-slate-950 border border-amber-500/40 text-xs text-amber-200 font-mono font-bold focus:border-amber-400 focus:outline-none"
            />
            <div className="flex items-center justify-between text-[10px] text-amber-400/90 pt-0.5 font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{isFa ? 'همگام و لینک با برآورد RMR' : 'Linked with RMR UCS'}</span>
              </span>
              <span className="font-mono text-slate-400">RMR UCS: {currentUcs ?? sigmaCi} MPa</span>
            </div>
          </div>

          {/* mi value */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">
                {isFa ? 'پارامتر سنگ بکر (mi):' : 'Intact constant (mi):'}
              </span>
              <span className="font-mono text-indigo-400 font-bold">{mi}</span>
            </div>
            <input
              type="number"
              min={2}
              max={45}
              value={mi}
              onChange={(e) => handleMiChange(Number(e.target.value))}
              className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 block">
              {isFa ? 'بر مبنای جنس سنگ بکر' : 'Based on intact lithology'}
            </span>
          </div>

          {/* Disturbance Factor D */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">
                {isFa ? 'فاکتور دست‌خوردگی انفجار (D):' : 'Disturbance factor (D):'}
              </span>
              <span className="font-mono text-indigo-400 font-bold">{dFactor}</span>
            </div>
            <select
              value={dFactor}
              onChange={(e) => handleDFactorChange(Number(e.target.value))}
              className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value={0}>D = 0.0 ({isFa ? 'تونل TBM یا انفجار کنترل‌شده بسیار نرم' : 'TBM or smooth mechanical'})</option>
              <option value={0.2}>D = 0.2 ({isFa ? 'آتشباری خوب با آسیب ناچیز' : 'Good quality controlled blasting'})</option>
              <option value={0.5}>D = 0.5 ({isFa ? 'حفاری با آتشباری معمولی' : 'Standard production blasting'})</option>
              <option value={0.8}>D = 0.8 ({isFa ? 'آتشباری ضعیف با خردشدگی دیواره' : 'Poor blasting with overbreak'})</option>
              <option value={1.0}>D = 1.0 ({isFa ? 'دست‌خوردگی شدید و گسیختگی شیب' : 'Heavily disturbed / squeeze'})</option>
            </select>
            <span className="text-[10px] text-slate-500 block">
              {isFa ? 'کاهش مقاومت ناشی از انفجار' : 'Blast damage factor'}
            </span>
          </div>
        </div>

        {/* Results Cards Display */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {/* mb */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">mb</span>
            <span className="text-base font-bold font-mono text-indigo-300">{hbResults.mb}</span>
            <span className="text-[10px] text-slate-500 block">
              {isFa ? 'ضریب اصطکاک سنگ' : 'Friction factor'}
            </span>
          </div>

          {/* s */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">s</span>
            <span className="text-base font-bold font-mono text-indigo-300">{hbResults.s}</span>
            <span className="text-[10px] text-slate-500 block">
              {isFa ? 'شاخص چسبندگی' : 'Cohesion factor'}
            </span>
          </div>

          {/* a */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">a</span>
            <span className="text-base font-bold font-mono text-indigo-300">{hbResults.a}</span>
            <span className="text-[10px] text-slate-500 block">
              {isFa ? 'توان منحنی شکست' : 'Exponent power'}
            </span>
          </div>

          {/* sigma_cm */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">σcm (MPa)</span>
            <span className="text-base font-bold font-mono text-emerald-400">{hbResults.sigmaCm}</span>
            <span className="text-[10px] text-slate-500 block">
              {isFa ? 'مقاومت توده‌سنگ' : 'Mass strength'}
            </span>
          </div>

          {/* Erm */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">Erm (GPa)</span>
            <span className="text-base font-bold font-mono text-cyan-400">{hbResults.ermGPa}</span>
            <span className="text-[10px] text-slate-500 block">
              {isFa ? 'مدول تغییرشکل‌پذیری' : 'Deformation modulus'}
            </span>
          </div>

          {/* c & phi */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">c' / φ'</span>
            <span className="text-sm font-bold font-mono text-amber-300">
              {hbResults.cohesionMPa} MPa / {hbResults.frictionAngleDeg}°
            </span>
            <span className="text-[10px] text-slate-500 block">
              {isFa ? 'موهر-کولمب معادل' : 'Mohr-Coulomb equiv'}
            </span>
          </div>
        </div>
      </div>

      {/* Hoek-Brown Strength Envelopes Chart (Recharts) */}
      <HoekBrownEnvelopeChart
        currentGsi={customGsi}
        currentRmr={currentRmr}
        sigmaCi={sigmaCi}
        mi={mi}
        dFactor={dFactor}
        lang={lang}
      />
    </div>
  );
};
