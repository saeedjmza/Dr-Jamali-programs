import React, { useState, useMemo, useEffect } from 'react';
import {
  Pickaxe,
  TrendingUp,
  Sliders,
  Table,
  Truck,
  Flame,
  Zap,
  Layers,
  Compass,
  FileSpreadsheet,
  AlertCircle,
  Activity,
  CheckCircle2,
  Gauge,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  ExcavabilitySubTab,
  WeaverInputState,
} from '../../types';
import {
  calculateFranklinExcavability,
  calculateGsiExcavability,
  calculateIsakssonExcavability,
  calculateWeaverRippability,
} from '../../utils/excavabilityCalculation';
import {
  loadExcavabilityInputs,
  saveExcavabilityInputs,
  DEFAULT_EXCAVABILITY_INPUTS,
} from '../../utils/storage';
import { FranklinChart } from './FranklinChart';
import { GsiExcavabilityChart } from './GsiExcavabilityChart';
import { IsakssonChart } from './IsakssonChart';

interface ExcavabilityHubProps {
  currentSpan: number;
  currentGsi: number;
  currentUcs?: number;
  currentJointSpacing?: number;
  currentUnitWeight?: number;
  currentDepth?: number;
  currentHeight?: number;
  pointLoadIs50?: number;
  onUpdateUcs?: (ucs: number) => void;
  onUpdateJointSpacing?: (spacing: number) => void;
  onUpdateGsi?: (gsi: number) => void;
  onUpdateUnitWeight?: (gamma: number) => void;
  onUpdatePointLoadIs50?: (is50: number) => void;
  lang: 'fa' | 'en';
}

export const ExcavabilityHub: React.FC<ExcavabilityHubProps> = ({
  currentSpan,
  currentGsi,
  currentUcs,
  currentJointSpacing,
  currentUnitWeight,
  currentDepth,
  currentHeight,
  pointLoadIs50: propPointLoad,
  onUpdateUcs,
  onUpdateJointSpacing,
  onUpdateGsi,
  onUpdateUnitWeight,
  onUpdatePointLoadIs50,
  lang,
}) => {
  const isFa = lang === 'fa';
  const [activeSubTab, setActiveSubTab] = useState<ExcavabilitySubTab>(() => loadExcavabilityInputs().activeSubTab);

  // Shared inputs (synchronized with global state when provided)
  const [localSpacing, setLocalSpacing] = useState<number>(() => loadExcavabilityInputs().fractureSpacingIf);
  const [localUcs, setLocalUcs] = useState<number>(() => loadExcavabilityInputs().ucs);
  const [localPointLoadIs50, setLocalPointLoadIs50] = useState<number>(() => loadExcavabilityInputs().pointLoadIs50); // MPa
  const [localGsi, setLocalGsi] = useState<number>(currentGsi || 55);
  const [localRockDensity, setLocalRockDensity] = useState<number>(() => loadExcavabilityInputs().rockDensity); // t/m3

  // Keep local inputs in sync when global props change (e.g. from scenario load)
  useEffect(() => {
    if (currentJointSpacing !== undefined && currentJointSpacing !== localSpacing) {
      setLocalSpacing(currentJointSpacing);
    }
  }, [currentJointSpacing]);

  useEffect(() => {
    if (currentUcs !== undefined && currentUcs !== localUcs) {
      setLocalUcs(currentUcs);
    }
  }, [currentUcs]);

  useEffect(() => {
    if (currentGsi !== undefined && currentGsi !== localGsi) {
      setLocalGsi(currentGsi);
    }
  }, [currentGsi]);

  useEffect(() => {
    if (propPointLoad !== undefined && propPointLoad !== localPointLoadIs50) {
      setLocalPointLoadIs50(propPointLoad);
    }
  }, [propPointLoad]);

  useEffect(() => {
    if (currentUnitWeight !== undefined) {
      const calcDensity = Number((currentUnitWeight / 9.81).toFixed(2));
      if (calcDensity !== localRockDensity) {
        setLocalRockDensity(calcDensity);
      }
    }
  }, [currentUnitWeight]);

  const fractureSpacingIf = currentJointSpacing !== undefined ? currentJointSpacing : localSpacing;
  const ucs = currentUcs !== undefined ? currentUcs : localUcs;
  const gsi = currentGsi !== undefined ? currentGsi : localGsi;
  const pointLoadIs50 = propPointLoad !== undefined ? propPointLoad : localPointLoadIs50;
  const rockDensity = currentUnitWeight !== undefined ? Number((currentUnitWeight / 9.81).toFixed(2)) : localRockDensity;

  const handleUpdateSpacing = (newVal: number) => {
    setLocalSpacing(newVal);
    onUpdateJointSpacing?.(newVal);
  };

  const handleUpdateUcs = (newUcs: number) => {
    setLocalUcs(newUcs);
    onUpdateUcs?.(newUcs);
  };

  const handleUpdateGsi = (newGsi: number) => {
    setLocalGsi(newGsi);
    onUpdateGsi?.(newGsi);
  };

  const handleUpdatePointLoad = (newIs50: number) => {
    setLocalPointLoadIs50(newIs50);
    onUpdatePointLoadIs50?.(newIs50);
  };

  const handleUpdateDensity = (newDensity: number) => {
    setLocalRockDensity(newDensity);
    onUpdateUnitWeight?.(Number((newDensity * 9.81).toFixed(1)));
  };

  // Weaver specific inputs
  const [weaverState, setWeaverState] = useState<WeaverInputState>(() => loadExcavabilityInputs().weaverState);

  // Auto-save excavability inputs
  useEffect(() => {
    saveExcavabilityInputs({
      activeSubTab,
      fractureSpacingIf,
      pointLoadIs50,
      ucs,
      rockDensity,
      weaverState,
    });
  }, [activeSubTab, fractureSpacingIf, pointLoadIs50, ucs, rockDensity, weaverState]);

  // Calculations
  const franklinResult = useMemo(() => {
    return calculateFranklinExcavability(fractureSpacingIf, pointLoadIs50);
  }, [fractureSpacingIf, pointLoadIs50]);

  const gsiExcavResult = useMemo(() => {
    return calculateGsiExcavability(gsi, ucs);
  }, [gsi, ucs]);

  const isakssonResult = useMemo(() => {
    return calculateIsakssonExcavability(ucs, fractureSpacingIf, rockDensity, currentSpan);
  }, [ucs, fractureSpacingIf, rockDensity, currentSpan]);

  const weaverResult = useMemo(() => {
    return calculateWeaverRippability(weaverState);
  }, [weaverState]);

  // Presets
  const applyPreset = (presetName: 'soft_shale' | 'jointed_sandstone' | 'hard_granite' | 'fault_zone') => {
    if (presetName === 'soft_shale') {
      handleUpdateSpacing(0.08);
      handleUpdatePointLoad(0.4);
      handleUpdateUcs(15);
      handleUpdateGsi(35);
      setWeaverState({
        seismicVelocityVp: 1.1,
        ucs: 12,
        weatheringGrade: 4,
        jointSpacing: 0.08,
        continuity: 'continuous_gouge',
        gouge: 'soft',
      });
    } else if (presetName === 'jointed_sandstone') {
      handleUpdateSpacing(0.25);
      handleUpdatePointLoad(2.2);
      handleUpdateUcs(55);
      handleUpdateGsi(52);
      setWeaverState({
        seismicVelocityVp: 1.6,
        ucs: 50,
        weatheringGrade: 3,
        jointSpacing: 0.25,
        continuity: 'continuous_no_gouge',
        gouge: 'hard',
      });
    } else if (presetName === 'hard_granite') {
      handleUpdateSpacing(1.2);
      handleUpdatePointLoad(6.5);
      handleUpdateUcs(160);
      handleUpdateGsi(75);
      setWeaverState({
        seismicVelocityVp: 2.6,
        ucs: 150,
        weatheringGrade: 1,
        jointSpacing: 1.5,
        continuity: 'non_continuous',
        gouge: 'none',
      });
    } else if (presetName === 'fault_zone') {
      handleUpdateSpacing(0.03);
      handleUpdatePointLoad(0.15);
      handleUpdateUcs(5);
      handleUpdateGsi(20);
      setWeaverState({
        seismicVelocityVp: 0.8,
        ucs: 5,
        weatheringGrade: 5,
        jointSpacing: 0.04,
        continuity: 'continuous_gouge',
        gouge: 'soft',
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
            <Pickaxe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>{isFa ? 'سامانه تخمین قابلیت حفاری و ریپرزنی سنگ (Excavability Hub)' : 'Rock Excavability & Rippability Suite'}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium">
                4 Methods
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {isFa
                ? 'ارزیابی روش حفاری (مکانیکی / ریپرزنی / آتشباری) بر اساس ۴ روش معتبر: Franklin 1971، روش GSI، Isaksson 2002 و شاخص Weaver 1975'
                : 'Excavation & rippability assessment via Franklin (1971), GSI method, Isaksson (2002) & Weaver (1975)'}
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-semibold ml-1">{isFa ? 'سناریوهای آماده:' : 'Presets:'}</span>
          <button
            onClick={() => applyPreset('soft_shale')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
          >
            {isFa ? 'شیل سست' : 'Soft Shale'}
          </button>
          <button
            onClick={() => applyPreset('jointed_sandstone')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
          >
            {isFa ? 'ماسه سنگ درزه‌دار' : 'Jointed Sandstone'}
          </button>
          <button
            onClick={() => applyPreset('hard_granite')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
          >
            {isFa ? 'گرانیت سخت' : 'Hard Granite'}
          </button>
          <button
            onClick={() => applyPreset('fault_zone')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
          >
            {isFa ? 'زون گسله خردشده' : 'Fault Zone'}
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <button
          onClick={() => setActiveSubTab('franklin')}
          className={`px-2 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center leading-tight ${
            activeSubTab === 'franklin'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-orange-300 shrink-0" />
          <span>{isFa ? '۱. روش Franklin (1971)' : '1. Franklin (1971)'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gsi')}
          className={`px-2 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center leading-tight ${
            activeSubTab === 'gsi'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-purple-300 shrink-0" />
          <span>{isFa ? '۲. روش GSI و انرژی ویژه' : '2. GSI Excavability'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('isaksson')}
          className={`px-2 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center leading-tight ${
            activeSubTab === 'isaksson'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-300 shrink-0" />
          <span>{isFa ? '۳. روش Isakson (رودهدر/آتشباری)' : '3. Isakson (Roadheader vs D&B)'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('weaver')}
          className={`px-2 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center leading-tight ${
            activeSubTab === 'weaver'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Truck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span>{isFa ? '۴. شاخص ریپرزنی Weaver (1975)' : '4. Weaver RRC (1975)'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('comparison')}
          className={`px-2 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center leading-tight ${
            activeSubTab === 'comparison'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Table className="w-3.5 h-3.5 shrink-0" />
          <span>{isFa ? 'مقایسه و جمع‌بندی جامع روش‌ها' : 'Comprehensive Comparison'}</span>
        </button>
      </div>

      {/* Global Controls Panel */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-300 font-bold">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFa ? 'مشخصات ژئومکانیکی توده‌سنگ جهت ارزیابی قابلیت کنده‌کاری:' : 'Rock Mass Geomechanical Inputs for Excavation:'}</span>
          </span>
          <span className="text-slate-400 text-[11px] font-mono">
            If = {fractureSpacingIf}m | Is = {pointLoadIs50} MPa | UCS = {ucs} MPa
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Fracture Spacing If */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300 font-medium">
              <span>{isFa ? 'فاصله‌داری درزه‌ها (If):' : 'Fracture Spacing (If):'}</span>
              <span className="font-mono font-bold text-amber-400">{fractureSpacingIf} m</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="6.0"
              step="0.01"
              value={fractureSpacingIf}
              onChange={(e) => handleUpdateSpacing(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Point Load Strength Is(50) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300 font-medium">
              <span>{isFa ? 'شاخص بار نقطه‌ای (Is 50):' : 'Point Load Index Is(50):'}</span>
              <span className="font-mono font-bold text-orange-400">{pointLoadIs50} MPa</span>
            </div>
            <input
              type="range"
              min="0.03"
              max="30.0"
              step="0.05"
              value={pointLoadIs50}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                handleUpdatePointLoad(val);
                handleUpdateUcs(Number((val * 24).toFixed(0)));
              }}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          {/* UCS */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300 font-medium">
              <span>{isFa ? 'مقاومت فشاری تک‌محوری (UCS):' : 'Uniaxial Strength (UCS):'}</span>
              <span className="font-mono font-bold text-purple-400">{ucs} MPa</span>
            </div>
            <input
              type="range"
              min="2"
              max="250"
              step="1"
              value={ucs}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                handleUpdateUcs(val);
                handleUpdatePointLoad(Number((val / 24).toFixed(2)));
              }}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* GSI */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300 font-medium">
              <span>{isFa ? 'شاخص مقاومت زمین‌شناسی (GSI):' : 'GSI Index:'}</span>
              <span className="font-mono font-bold text-emerald-400">{gsi}</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="1"
              value={gsi}
              onChange={(e) => handleUpdateGsi(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: COMPARISON OF ALL 4 EXCAVABILITY METHODS */}
      {activeSubTab === 'comparison' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* 1. Franklin Summary */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-orange-500/30 flex flex-col justify-between shadow-lg">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>Franklin et al. (1971)</span>
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-bold text-white"
                    style={{ backgroundColor: franklinResult.color }}
                  >
                    {franklinResult.category.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-100">
                  {isFa ? franklinResult.excavationMethodFa : franklinResult.excavationMethodEn}
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-3">
                  {isFa ? franklinResult.equipmentFa : franklinResult.equipmentEn}
                </p>
                <div className="font-mono text-[11px] text-orange-300 pt-1">
                  {isFa ? 'شاخص' : 'Index'} Iex = {franklinResult.excavabilityIndexIex}
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab('franklin')}
                className="mt-3 text-[11px] text-orange-400 hover:text-orange-300 font-semibold pt-2 border-t border-slate-800 cursor-pointer"
              >
                {isFa ? 'مشاهده نمودار لوگ-لوگ فرانکلین ←' : 'View Franklin Chart →'}
              </button>
            </div>

            {/* 2. GSI Method Summary */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 flex flex-col justify-between shadow-lg">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>GSI (Hoek 2000)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300">
                    GSI = {gsi}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-100">
                  {isFa ? gsiExcavResult.excavabilityClassFa : gsiExcavResult.excavabilityClassEn}
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-3">
                  {isFa ? gsiExcavResult.machineryFa : gsiExcavResult.machineryEn}
                </p>
                <div className="font-mono text-[11px] text-purple-300 pt-1">
                  {isFa ? 'انرژی ویژه: ' : 'Specific Energy: '}{gsiExcavResult.specificEnergySE} MJ/m³
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab('gsi')}
                className="mt-3 text-[11px] text-purple-400 hover:text-purple-300 font-semibold pt-2 border-t border-slate-800 cursor-pointer"
              >
                {isFa ? 'تحلیل TBM و رودهدر ←' : 'View GSI & TBM Details →'}
              </button>
            </div>

            {/* 3. Isaksson Summary */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/30 flex flex-col justify-between shadow-lg">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <Flame className="w-4 h-4" />
                    <span>Isaksson (2002)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300">
                    DRI = {isakssonResult.driEstimate}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-100">
                  {isFa ? isakssonResult.blastabilityClassFa : isakssonResult.blastabilityClassEn}
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div>{isFa ? 'خرج ویژه: ' : 'Specific Charge: '}<strong className="font-mono text-rose-300">{isakssonResult.specificChargeQ} kg/m³</strong></div>
                  <div>{isFa ? 'حفاری ویژه: ' : 'Specific Drilling: '}<strong className="font-mono text-rose-300">{isakssonResult.specificDrillingSD} m/m³</strong></div>
                  <div>{isFa ? 'گام پیشروی: ' : 'Advance per Round: '}<strong className="font-mono text-rose-300">{isakssonResult.advancePerRound} m</strong></div>
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab('isaksson')}
                className="mt-3 text-[11px] text-rose-400 hover:text-rose-300 font-semibold pt-2 border-t border-slate-800 cursor-pointer"
              >
                {isFa ? 'طراحی الگوی آتشباری Isaksson ←' : 'View Isaksson Blast Model →'}
              </button>
            </div>

            {/* 4. Weaver RRC Summary */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex flex-col justify-between shadow-lg">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Truck className="w-4 h-4" />
                    <span>Weaver (1975 RRC)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300">
                    {isFa ? `امتیاز ${weaverResult.totalRating}/100` : `Score ${weaverResult.totalRating}/100`}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-100">
                  {isFa ? weaverResult.classNameFa : weaverResult.classNameEn}
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-3">
                  {isFa ? weaverResult.tractorRecommendationFa : weaverResult.tractorRecommendationEn}
                </p>
                <div className="font-mono text-[11px] text-emerald-300 pt-1">
                  {isFa ? `کلاس ریپرزنی: ${weaverResult.classCode}` : `Rippability Class: ${weaverResult.classCode}`}
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab('weaver')}
                className="mt-3 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold pt-2 border-t border-slate-800 cursor-pointer"
              >
                {isFa ? 'پرسشنامه ۶ عاملی Weaver ←' : 'View Weaver Parameters →'}
              </button>
            </div>
          </div>

          {/* Master Excavability Table */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">
                {isFa ? 'ماتریس جامع مقایسه روش‌های حفاری و تجهیزات متناظر' : 'Master Excavation & Equipment Comparison'}
              </h3>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className={`w-full ${isFa ? 'text-right' : 'text-left'} text-xs border-collapse`}>
                <thead>
                  <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 text-[11px]">
                    <th className="p-3 font-bold">{isFa ? 'روش تخمین' : 'Method'}</th>
                    <th className="p-3 font-bold">{isFa ? 'روش حفاری اصلی' : 'Excavation Process'}</th>
                    <th className="p-3 font-bold">{isFa ? 'تجهیزات و ماشین‌آلات پیشنهادی' : 'Recommended Equipment'}</th>
                    <th className="p-3 font-bold">{isFa ? 'شاخص کمی' : 'Quantitative Index'}</th>
                    <th className="p-3 font-bold">{isFa ? 'محدودیت و ملاحظات فنی' : 'Technical Constraints'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {/* Franklin Row */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-orange-400">Franklin (1971)</td>
                    <td className="p-3 text-slate-200">{isFa ? franklinResult.excavationMethodFa : franklinResult.excavationMethodEn}</td>
                    <td className="p-3 text-slate-300">{isFa ? franklinResult.equipmentFa : franklinResult.equipmentEn}</td>
                    <td className="p-3 font-mono text-orange-300">Iex = {franklinResult.excavabilityIndexIex}</td>
                    <td className="p-3 text-slate-400">{isFa ? 'مبتنی بر ناپیوستگی و مقاومت نقطه‌ای' : 'Discontinuity spacing vs point load'}</td>
                  </tr>

                  {/* GSI Row */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-purple-400">GSI (Hoek 2000)</td>
                    <td className="p-3 text-slate-200">{isFa ? gsiExcavResult.excavabilityClassFa : gsiExcavResult.excavabilityClassEn}</td>
                    <td className="p-3 text-slate-300">{isFa ? gsiExcavResult.machineryFa : gsiExcavResult.machineryEn}</td>
                    <td className="p-3 font-mono text-purple-300">SE = {gsiExcavResult.specificEnergySE} MJ/m³</td>
                    <td className="p-3 text-slate-400">{isFa ? gsiExcavResult.tbmFeasibilityFa : gsiExcavResult.tbmFeasibilityEn}</td>
                  </tr>

                  {/* Isaksson Row */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-rose-400">Isaksson (2002)</td>
                    <td className="p-3 text-slate-200">{isFa ? isakssonResult.blastabilityClassFa : isakssonResult.blastabilityClassEn}</td>
                    <td className="p-3 text-slate-300">{isFa ? `جامبو دریل هیدرولیک، ${isakssonResult.explosiveTypeFa}` : `Hydraulic Jumbo Drill, ${isakssonResult.explosiveTypeEn}`}</td>
                    <td className="p-3 font-mono text-rose-300">q = {isakssonResult.specificChargeQ} kg/m³ | SD = {isakssonResult.specificDrillingSD} m/m³</td>
                    <td className="p-3 text-slate-400">{isFa ? isakssonResult.overbreakRiskFa : isakssonResult.overbreakRiskEn}</td>
                  </tr>

                  {/* Weaver Row */}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-emerald-400">Weaver (1975)</td>
                    <td className="p-3 text-slate-200">{isFa ? weaverResult.classNameFa : weaverResult.classNameEn}</td>
                    <td className="p-3 text-slate-300">{isFa ? weaverResult.tractorRecommendationFa : weaverResult.tractorRecommendationEn}</td>
                    <td className="p-3 font-mono text-emerald-300">RRC = {weaverResult.totalRating}/100 (Class {weaverResult.classCode})</td>
                    <td className="p-3 text-slate-400">{isFa ? weaverResult.rippabilityDescriptionFa : weaverResult.rippabilityDescriptionEn}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: FRANKLIN (1971) CHART */}
      {activeSubTab === 'franklin' && (
        <FranklinChart
          franklinResult={franklinResult}
          fractureSpacingIf={fractureSpacingIf}
          pointLoadIs50={pointLoadIs50}
          onUpdateIf={handleUpdateSpacing}
          onUpdateIs={handleUpdatePointLoad}
          lang={lang}
        />
      )}

      {/* SUB-VIEW 3: GSI METHOD */}
      {activeSubTab === 'gsi' && (
        <div className="space-y-6">
          {/* Full Simulation of Hoek & Marinos 2000 GSI Excavability Chart and Decision Table */}
          <GsiExcavabilityChart
            currentGsi={gsi}
            currentUcs={ucs}
            pointLoadIs50={pointLoadIs50}
            onUpdateGsi={handleUpdateGsi}
            lang={lang}
          />

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Layers className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-100">
                  {isFa ? 'روش GSI و مقاومت توده‌سنگ (Hoek & Karzulovic 2000)' : 'GSI & Rock Mass Strength Excavability'}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
                GSI = {gsi} | UCS = {ucs} MPa
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">{isFa ? 'مقاومت توده‌سنگ (σcm):' : 'Rock Mass Strength:'}</div>
                <div className="font-mono font-bold text-purple-300 text-base">{gsiExcavResult.rockMassStrengthScm} MPa</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">{isFa ? 'انرژی ویژه حفاری (SE):' : 'Specific Excavation Energy:'}</div>
                <div className="font-mono font-bold text-amber-300 text-base">{gsiExcavResult.specificEnergySE} MJ/m³</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">{isFa ? 'رده کلی قابلیت کنده‌کاری:' : 'Excavability Category:'}</div>
                <div className="font-bold text-emerald-300 text-sm truncate">
                  {isFa ? gsiExcavResult.excavabilityClassFa.split('(')[0] : gsiExcavResult.excavabilityClassEn.split('(')[0]}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-purple-400 font-bold flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>{isFa ? 'امکان‌سنجی حفر مکانیزه با TBM:' : 'TBM Excavation Feasibility:'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {isFa ? gsiExcavResult.tbmFeasibilityFa : gsiExcavResult.tbmFeasibilityEn}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-rose-400 font-bold flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  <span>{isFa ? 'توصیه‌های روش چالزنی و آتشباری (D&B):' : 'Drill & Blast Guidelines:'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {isFa ? gsiExcavResult.drillAndBlastRecommendationFa : gsiExcavResult.drillAndBlastRecommendationEn}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: ISAKSSON (2002) DRILLABILITY & BLASTABILITY */}
      {activeSubTab === 'isaksson' && (
        <div className="space-y-6">
          {/* Faithful Recreated Isakson Excavability Chart (Roadheader vs Drill & Blast) */}
          <IsakssonChart
            currentUcs={ucs}
            onUpdateUcs={handleUpdateUcs}
            lang={lang}
          />

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <Flame className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-100">
                  {isFa ? 'مدل مهندسی چالزنی و آتشباری Isaksson (2002)' : 'Isaksson (2002) Drillability & Blastability Model'}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
                {isFa ? 'خرج ویژه: ' : 'Specific Charge: '}{isakssonResult.specificChargeQ} kg/m³
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">{isFa ? 'شاخص نرخ چالزنی (DRI):' : 'Drilling Rate Index (DRI):'}</div>
                <div className="font-mono font-bold text-rose-300 text-base">{isakssonResult.driEstimate} / 100</div>
                <div className="text-[10px] text-slate-500">{isFa ? isakssonResult.drillabilityClassFa : isakssonResult.drillabilityClassEn}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">{isFa ? 'خرج ویژه ماده منفجره (q):' : 'Specific Charge (Powder Factor):'}</div>
                <div className="font-mono font-bold text-amber-300 text-base">{isakssonResult.specificChargeQ} kg/m³</div>
                <div className="text-[10px] text-slate-500">{isFa ? 'حجم هر متر طول تونل: ' : 'Volume per meter tunnel: '}{(Math.PI * Math.pow(currentSpan/2, 2) * 0.9).toFixed(1)} m³</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">{isFa ? 'متراژ چالزنی ویژه (SD):' : 'Specific Drilling (SD):'}</div>
                <div className="font-mono font-bold text-sky-300 text-base">{isakssonResult.specificDrillingSD} m/m³</div>
                <div className="text-[10px] text-slate-500">{isFa ? 'متر طول چال به ازای هر مترمکعب سنگ' : 'Meters of drill hole per m³'}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">{isFa ? 'پیشروی بهینه هر راند آتشباری:' : 'Optimal Advance per Round:'}</div>
                <div className="font-mono font-bold text-emerald-300 text-base">{isakssonResult.advancePerRound} m</div>
                <div className="text-[10px] text-slate-500">{isFa ? 'طول مفید چال‌های آتشباری' : 'Effective drill pull length'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-rose-400 font-bold flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  <span>{isFa ? 'کیفیت خردایش و ریسک آوربریک (Overbreak):' : 'Overbreak & Fragmentation:'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-semibold">
                  {isFa ? isakssonResult.blastabilityClassFa : isakssonResult.blastabilityClassEn}
                </p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {isFa ? isakssonResult.overbreakRiskFa : isakssonResult.overbreakRiskEn}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  <span>{isFa ? 'ترکیب خرج و نوع ماده منفجره پیشنهادی:' : 'Explosive Type & Selection:'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {isFa ? isakssonResult.explosiveTypeFa : isakssonResult.explosiveTypeEn}
                </p>
                <div className="text-slate-400 text-[11px] pt-1">
                  {isFa ? 'طول عمر تخمینی سرمته چالزنی: ' : 'Est. drill bit life: '}<strong className="text-slate-200">{isFa ? isakssonResult.bitWearRateFa : isakssonResult.bitWearRateEn}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: WEAVER RIPPABILITY RATING CHART (1975) */}
      {activeSubTab === 'weaver' && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Truck className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-100">
                  {isFa ? 'شاخص ریپرزنی ویور (Weaver 1975 Rippability Rating Chart - RRC)' : 'Weaver (1975) Rippability Rating Chart'}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                {weaverResult.totalRating} / 100 ({weaverResult.classCode})
              </span>
            </div>

            {/* 6 Weaver Evaluation Parameters Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              {/* 1. Seismic Velocity Vp */}
              <div className="space-y-1">
                <label className="text-slate-400 font-medium flex justify-between">
                  <span>{isFa ? '۱. سرعت امواج لرزه‌ای (Vp):' : '1. Seismic Velocity (Vp):'}</span>
                  <span className="font-mono text-emerald-400">{weaverState.seismicVelocityVp} km/s</span>
                </label>
                <select
                  value={weaverState.seismicVelocityVp}
                  onChange={(e) => setWeaverState({ ...weaverState, seismicVelocityVp: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs cursor-pointer"
                >
                  <option value="0.6">{isFa ? 'کمتر از ۰.۷۰ km/s (۲۶ امتیاز)' : '< 0.70 km/s (26 pts)'}</option>
                  <option value="1.0">{isFa ? '۰.۷۰ الی ۱.۲۰ km/s (۲۴ امتیاز)' : '0.70 - 1.20 km/s (24 pts)'}</option>
                  <option value="1.35">{isFa ? '۱.۲۰ الی ۱.۵۰ km/s (۱۸ امتیاز)' : '1.20 - 1.50 km/s (18 pts)'}</option>
                  <option value="1.65">{isFa ? '۱.۵۰ الی ۱.۸۵ km/s (۱۲ امتیاز)' : '1.50 - 1.85 km/s (12 pts)'}</option>
                  <option value="2.0">{isFa ? '۱.۸۵ الی ۲.۱۵ km/s (۶ امتیاز)' : '1.85 - 2.15 km/s (6 pts)'}</option>
                  <option value="2.5">{isFa ? 'بیشتر از ۲.۱۵ km/s (۰ امتیاز)' : '> 2.15 km/s (0 pts)'}</option>
                </select>
              </div>

              {/* 2. Rock Hardness */}
              <div className="space-y-1">
                <label className="text-slate-400 font-medium flex justify-between">
                  <span>{isFa ? '۲. سختی سنگ و UCS:' : '2. Rock Hardness & UCS:'}</span>
                  <span className="font-mono text-amber-400">{weaverState.ucs} MPa</span>
                </label>
                <select
                  value={weaverState.ucs}
                  onChange={(e) => setWeaverState({ ...weaverState, ucs: parseInt(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs cursor-pointer"
                >
                  <option value="2">{isFa ? 'خیلی نرم (UCS < 3 MPa - ۱۰ امتیاز)' : 'Very Soft (UCS < 3 MPa - 10 pts)'}</option>
                  <option value="7">{isFa ? 'نرم (UCS 3-10 MPa - ۸ امتیاز)' : 'Soft (UCS 3-10 MPa - 8 pts)'}</option>
                  <option value="18">{isFa ? 'سختی متوسط (UCS 10-25 MPa - ۵ امتیاز)' : 'Medium Hard (UCS 10-25 MPa - 5 pts)'}</option>
                  <option value="50">{isFa ? 'سخت (UCS 25-70 MPa - ۲ امتیاز)' : 'Hard (UCS 25-70 MPa - 2 pts)'}</option>
                  <option value="100">{isFa ? 'خیلی سخت (UCS > 70 MPa - ۰ امتیاز)' : 'Very Hard (UCS > 70 MPa - 0 pts)'}</option>
                </select>
              </div>

              {/* 3. Weathering */}
              <div className="space-y-1">
                <label className="text-slate-400 font-medium flex justify-between">
                  <span>{isFa ? '۳. درجه هوازدگی سنگ:' : '3. Weathering Degree:'}</span>
                  <span className="font-mono text-sky-400">{isFa ? `گرید ${weaverState.weatheringGrade}` : `Grade ${weaverState.weatheringGrade}`}</span>
                </label>
                <select
                  value={weaverState.weatheringGrade}
                  onChange={(e) => setWeaverState({ ...weaverState, weatheringGrade: parseInt(e.target.value) as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs cursor-pointer"
                >
                  <option value="5">{isFa ? 'کاملاً هوازده / خاک‌مانند (۹ امتیاز)' : 'Completely Weathered (9 pts)'}</option>
                  <option value="4">{isFa ? 'هوازدگی شدید (۷ امتیاز)' : 'Highly Weathered (7 pts)'}</option>
                  <option value="3">{isFa ? 'هوازدگی متوسط (۵ امتیاز)' : 'Moderately Weathered (5 pts)'}</option>
                  <option value="2">{isFa ? 'هوازدگی کم (۳ امتیاز)' : 'Slightly Weathered (3 pts)'}</option>
                  <option value="1">{isFa ? 'تازه و بدون هوازدگی (۰ امتیاز)' : 'Unweathered / Fresh (0 pts)'}</option>
                </select>
              </div>

              {/* 4. Joint Spacing */}
              <div className="space-y-1">
                <label className="text-slate-400 font-medium flex justify-between">
                  <span>{isFa ? '۴. فاصله‌داری درزه‌ها:' : '4. Joint Spacing:'}</span>
                  <span className="font-mono text-purple-400">{weaverState.jointSpacing} m</span>
                </label>
                <select
                  value={weaverState.jointSpacing}
                  onChange={(e) => setWeaverState({ ...weaverState, jointSpacing: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs cursor-pointer"
                >
                  <option value="0.04">{isFa ? 'کمتر از ۰.۰۵ متر (۳۰ امتیاز)' : '< 0.05 m (30 pts)'}</option>
                  <option value="0.08">{isFa ? '۰.۰۵ الی ۰.۱۰ متر (۲۵ امتیاز)' : '0.05 - 0.10 m (25 pts)'}</option>
                  <option value="0.2">{isFa ? '۰.۱۰ الی ۰.۳۰ متر (۲۰ امتیاز)' : '0.10 - 0.30 m (20 pts)'}</option>
                  <option value="0.6">{isFa ? '۰.۳۰ الی ۱.۰۰ متر (۱۵ امتیاز)' : '0.30 - 1.00 m (15 pts)'}</option>
                  <option value="1.8">{isFa ? '۱.۰۰ الی ۳.۰۰ متر (۱۰ امتیاز)' : '1.00 - 3.00 m (10 pts)'}</option>
                  <option value="4.0">{isFa ? 'بیش از ۳.۰۰ متر (۵ امتیاز)' : '> 3.00 m (5 pts)'}</option>
                </select>
              </div>

              {/* 5. Joint Continuity */}
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">{isFa ? '۵. پیوستگی و امتداد درزه‌ها:' : '5. Joint Continuity:'}</label>
                <select
                  value={weaverState.continuity}
                  onChange={(e) => setWeaverState({ ...weaverState, continuity: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs cursor-pointer"
                >
                  <option value="non_continuous">{isFa ? 'ناپیوسته و گسسته (۱۵ امتیاز)' : 'Non-continuous (15 pts)'}</option>
                  <option value="continuous_gouge">{isFa ? 'پیوسته با پرشدگی (۵ امتیاز)' : 'Continuous with Gouge (5 pts)'}</option>
                  <option value="continuous_no_gouge">{isFa ? 'پیوسته بدون پرشدگی (۰ امتیاز)' : 'Continuous no Gouge (0 pts)'}</option>
                </select>
              </div>

              {/* 6. Gouge / Infilling */}
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">{isFa ? '۶. پرشدگی و گوج درزه‌ها:' : '6. Joint Gouge / Infilling:'}</label>
                <select
                  value={weaverState.gouge}
                  onChange={(e) => setWeaverState({ ...weaverState, gouge: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs cursor-pointer"
                >
                  <option value="soft">{isFa ? 'پرشدگی نرم یا ضخیم > ۵mm (۱۰ امتیاز)' : 'Soft Gouge > 5mm (10 pts)'}</option>
                  <option value="hard">{isFa ? 'پرشدگی سخت (۵ امتیاز)' : 'Hard Gouge (5 pts)'}</option>
                  <option value="none">{isFa ? 'بدون پرشدگی / سالم (۰ امتیاز)' : 'No Gouge / Intact (0 pts)'}</option>
                </select>
              </div>
            </div>

            {/* Weaver Output Card */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-900/40 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="font-bold text-emerald-400 text-sm">
                  {isFa ? weaverResult.classNameFa : weaverResult.classNameEn}
                </div>
                <div className="font-mono text-emerald-300">
                  {isFa ? 'امتیاز کل' : 'Total Score'} RRC = {weaverResult.totalRating} / 100
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-slate-400 font-medium mb-1">{isFa ? 'تجهیزات و تراکتور پیشنهادی ویور:' : 'Recommended Tractor:'}</div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-semibold text-slate-100 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{isFa ? weaverResult.tractorRecommendationFa : weaverResult.tractorRecommendationEn}</span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-medium mb-1">{isFa ? 'شرح ویژگی‌های ریپرزنی:' : 'Rippability Characteristics:'}</div>
                  <p className="text-slate-300 leading-relaxed">
                    {isFa ? weaverResult.rippabilityDescriptionFa : weaverResult.rippabilityDescriptionEn}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
