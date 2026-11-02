import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Shield,
  Layers,
  ArrowRight,
  Info,
  Sliders,
  ChevronDown,
  Edit3,
  Calculator,
  Zap,
  Activity,
  Link2,
} from 'lucide-react';
import {
  getRockClass,
  ROCK_CLASSES,
  rqdToRmrRating,
  rmrRatingToRqd,
  ucsToRmrRating,
  rmrRatingToUcs,
  spacingToRmrRating,
  rmrRatingToSpacing,
} from '../../utils/rmrCalculation';
import { RockClassInfo } from '../../types';

interface RmrClassificationTabProps {
  currentRmr: number;
  currentRqd: number;
  currentDepth: number;
  currentUcs: number;
  currentJointSpacing: number;
  currentJointSets: number;
  currentGroundwaterRmr?: number;
  currentPersistence?: number;
  currentAperture?: number;
  currentRoughness?: number;
  currentInfillingId?: string;
  currentWeathering?: number;
  currentOrientationAdj?: number;
  currentCalcMode?: 'components' | 'manual';
  onApplyRmr: (rmr: number) => void;
  onUpdateRqd: (rqd: number) => void;
  onUpdateDepth: (depth: number) => void;
  onUpdateUcs: (ucs: number) => void;
  onUpdateJointSpacing: (spacing: number) => void;
  onUpdateJointSets: (jointSets: number) => void;
  onUpdateGroundwaterRmr?: (val: number) => void;
  onUpdatePersistence?: (val: number) => void;
  onUpdateAperture?: (val: number) => void;
  onUpdateRoughness?: (val: number) => void;
  onUpdateInfillingId?: (id: string) => void;
  onUpdateWeathering?: (val: number) => void;
  onUpdateOrientationAdj?: (val: number) => void;
  onUpdateCalcMode?: (mode: 'components' | 'manual') => void;
  onNavigateToStandup: () => void;
  onNavigateToSupport?: () => void;
  lang: 'fa' | 'en';
}

export const RmrClassificationTab: React.FC<RmrClassificationTabProps> = ({
  currentRmr,
  currentRqd,
  currentDepth,
  currentUcs,
  currentJointSpacing,
  currentJointSets,
  currentGroundwaterRmr = 10,
  currentPersistence = 4,
  currentAperture = 4,
  currentRoughness = 3,
  currentInfillingId = 'hard_lt5',
  currentWeathering = 3,
  currentOrientationAdj = -5,
  currentCalcMode = 'components',
  onApplyRmr,
  onUpdateRqd,
  onUpdateDepth,
  onUpdateUcs,
  onUpdateJointSpacing,
  onUpdateJointSets,
  onUpdateGroundwaterRmr,
  onUpdatePersistence,
  onUpdateAperture,
  onUpdateRoughness,
  onUpdateInfillingId,
  onUpdateWeathering,
  onUpdateOrientationAdj,
  onUpdateCalcMode,
  onNavigateToStandup,
  onNavigateToSupport,
  lang,
}) => {
  const isFa = lang === 'fa';

  // Mode: Calculate from 6 components vs Direct Manual RMR input
  const [calcMode, setCalcMode] = useState<'components' | 'manual'>(currentCalcMode);
  const [manualRmr, setManualRmr] = useState<number>(currentRmr || 65);

  // Sync mode with prop changes (e.g. file loaded)
  useEffect(() => {
    if (currentCalcMode) {
      setCalcMode(currentCalcMode);
    }
  }, [currentCalcMode]);

  // Sync manualRmr with currentRmr when changed externally (file import / preset)
  useEffect(() => {
    if (typeof currentRmr === 'number' && !isNaN(currentRmr)) {
      setManualRmr(currentRmr);
    }
  }, [currentRmr]);

  // 1. UCS (0-15) - Linked directly to unified global currentUcs (MPa)
  const ucsRating = ucsToRmrRating(currentUcs);
  // 2. RQD (3-20) - Linked directly to unified global currentRqd (%)
  const rqdRating = rqdToRmrRating(currentRqd);
  // 3. Spacing (5-20) - Linked directly to unified global currentJointSpacing (m)
  const spacingRating = spacingToRmrRating(currentJointSpacing);
  // 4. Condition (0-30)
  const [persistence, setPersistence] = useState<number>(currentPersistence);
  const [aperture, setAperture] = useState<number>(currentAperture);
  const [roughness, setRoughness] = useState<number>(currentRoughness);
  const [infillingId, setInfillingId] = useState<string>(currentInfillingId);
  const [weathering, setWeathering] = useState<number>(currentWeathering);

  // Sync sub-parameters when changed externally (file import / preset)
  useEffect(() => {
    if (typeof currentPersistence === 'number') setPersistence(currentPersistence);
  }, [currentPersistence]);
  useEffect(() => {
    if (typeof currentAperture === 'number') setAperture(currentAperture);
  }, [currentAperture]);
  useEffect(() => {
    if (typeof currentRoughness === 'number') setRoughness(currentRoughness);
  }, [currentRoughness]);
  useEffect(() => {
    if (currentInfillingId) setInfillingId(currentInfillingId);
  }, [currentInfillingId]);
  useEffect(() => {
    if (typeof currentWeathering === 'number') setWeathering(currentWeathering);
  }, [currentWeathering]);

  // 5. Groundwater (0-15) - Linked to unified project groundwater & Barton Jw
  const [groundwater, setGroundwater] = useState<number>(currentGroundwaterRmr);

  useEffect(() => {
    if (typeof currentGroundwaterRmr === 'number') {
      setGroundwater(currentGroundwaterRmr);
    }
  }, [currentGroundwaterRmr]);

  // 6. Joint Orientation Adjustment (0 to -12)
  const [orientationAdj, setOrientationAdj] = useState<number>(currentOrientationAdj);
  useEffect(() => {
    if (typeof currentOrientationAdj === 'number') {
      setOrientationAdj(currentOrientationAdj);
    }
  }, [currentOrientationAdj]);

  const infillingOptions = [
    { id: 'none', val: 6, labelFa: 'بدون پرکننده (سخت و محکم)', labelEn: 'None' },
    { id: 'hard_lt5', val: 4, labelFa: 'پرکننده سخت < ۵ میلی‌متر', labelEn: 'Hard <5mm' },
    { id: 'hard_gt5', val: 2, labelFa: 'پرکننده سخت > ۵ میلی‌متر', labelEn: 'Hard >5mm' },
    { id: 'soft_lt5', val: 2, labelFa: 'پرکننده رسی و نرم < ۵ میلی‌متر', labelEn: 'Soft clay <5mm' },
    { id: 'soft_gt5', val: 0, labelFa: 'پرکننده رسی و ضخیم > ۵ میلی‌متر', labelEn: 'Soft clay >5mm' },
  ];

  const currentInfilling =
    infillingOptions.find((o) => o.id === infillingId) ?? infillingOptions[1];
  const infilling = currentInfilling.val;

  // Joint condition total (max 30)
  const conditionRating =
    persistence + aperture + roughness + infilling + weathering;

  // Basic RMR (Parameters 1 to 5)
  const basicRmr =
    ucsRating + rqdRating + spacingRating + conditionRating + groundwater;

  // Final adjusted RMR (from components or direct manual input)
  const finalRmr =
    calcMode === 'manual'
      ? manualRmr
      : Math.max(0, Math.min(100, basicRmr + orientationAdj));

  const rockClass: RockClassInfo = getRockClass(finalRmr);

  // Reference stand-up time benchmark from Bieniawski 1989 Table Part D (Meaning of rock mass classes)
  const refStandUpTime = (() => {
    switch (rockClass.id) {
      case 1:
        return isFa ? '۲۰ سال برای دهانه ۱۵ متر' : '20 yr for 15m span';
      case 2:
        return isFa ? '۱ سال برای دهانه ۱۰ متر' : '1 yr for 10m span';
      case 3:
        return isFa ? '۱ هفته برای دهانه ۵ متر' : '1 week for 5m span';
      case 4:
        return isFa ? '۱۰ ساعت برای دهانه ۲.۵ متر' : '10 hr for 2.5m span';
      case 5:
      default:
        return isFa ? '۳۰ دقیقه برای دهانه ۱ متر' : '30 min for 1m span';
    }
  })();

  // Modulus of deformation Em (GPa) by Serafim & Pereira (1983) and Bieniawski (1978)
  const deformationModulus =
    finalRmr > 50
      ? (2 * finalRmr - 100).toFixed(1)
      : Math.pow(10, (finalRmr - 10) / 40).toFixed(2);

  const handleApplyToSystem = () => {
    onApplyRmr(finalRmr);
  };

  // Keep parent RMR continuously synchronized with the active calculation
  useEffect(() => {
    if (typeof finalRmr === 'number' && !isNaN(finalRmr) && finalRmr !== currentRmr) {
      onApplyRmr(finalRmr);
    }
  }, [finalRmr]);

  const handleSyncComponentsFromManual = (targetVal: number) => {
    if (targetVal >= 81) {
      handleResetToPreset('good');
    } else if (targetVal >= 41) {
      handleResetToPreset('fair');
    } else {
      handleResetToPreset('poor');
    }
  };

  const handleResetToPreset = (preset: 'good' | 'fair' | 'poor') => {
    if (preset === 'good') {
      onUpdateUcs(150);
      onUpdateRqd(rmrRatingToRqd(17));
      onUpdateJointSpacing(1.0);
      onUpdateJointSets(4);
      setPersistence(4);
      onUpdatePersistence?.(4);
      setAperture(4);
      onUpdateAperture?.(4);
      setRoughness(5);
      onUpdateRoughness?.(5);
      setInfillingId('hard_lt5');
      onUpdateInfillingId?.('hard_lt5');
      setWeathering(5);
      onUpdateWeathering?.(5);
      setGroundwater(15);
      onUpdateGroundwaterRmr?.(15);
      setOrientationAdj(-2);
      onUpdateOrientationAdj?.(-2);
    } else if (preset === 'fair') {
      onUpdateUcs(75);
      onUpdateRqd(rmrRatingToRqd(13));
      onUpdateJointSpacing(0.35);
      onUpdateJointSets(9);
      setPersistence(2);
      onUpdatePersistence?.(2);
      setAperture(3);
      onUpdateAperture?.(3);
      setRoughness(3);
      onUpdateRoughness?.(3);
      setInfillingId('hard_lt5');
      onUpdateInfillingId?.('hard_lt5');
      setWeathering(3);
      onUpdateWeathering?.(3);
      setGroundwater(10);
      onUpdateGroundwaterRmr?.(10);
      setOrientationAdj(-5);
      onUpdateOrientationAdj?.(-5);
    } else {
      onUpdateUcs(35);
      onUpdateRqd(rmrRatingToRqd(8));
      onUpdateJointSpacing(0.12);
      onUpdateJointSets(15);
      setPersistence(1);
      onUpdatePersistence?.(1);
      setAperture(1);
      onUpdateAperture?.(1);
      setRoughness(1);
      onUpdateRoughness?.(1);
      setInfillingId('soft_gt5');
      onUpdateInfillingId?.('soft_gt5');
      setWeathering(1);
      onUpdateWeathering?.(1);
      setGroundwater(4);
      onUpdateGroundwaterRmr?.(4);
      setOrientationAdj(-10);
      onUpdateOrientationAdj?.(-10);
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
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-300" />
            <span>{isFa ? '۱. محاسبه بر اساس مؤلفه‌های ۶گانه (Ratings)' : '1. Component Ratings (6 Parameters)'}</span>
          </button>

          <button
            onClick={() => {
              setCalcMode('manual');
              onUpdateCalcMode?.('manual');
              const targetVal = basicRmr + orientationAdj;
              setManualRmr(targetVal);
              onApplyRmr(targetVal);
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              calcMode === 'manual'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Edit3 className="w-4 h-4 text-amber-200" />
            <span>{isFa ? '۲. ورود دستی و مستقیم مقدار نهایی RMR' : '2. Direct Manual RMR Input'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono self-end sm:self-center">
          <span className="text-slate-400">{isFa ? 'وضعیت محاسباتی:' : 'Calculation Mode:'}</span>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
            {calcMode === 'components'
              ? (isFa ? 'محاسبه از مؤلفه‌ها' : 'Component-Based')
              : (isFa ? 'ورود مستقیم کاربر' : 'Direct Manual')}
          </span>
        </div>
      </div>

      {/* Top Banner: Score & Classification Output */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Main RMR Score Card */}
        <div
          className="md:col-span-5 p-5 rounded-2xl border flex flex-col justify-between shadow-xl"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: rockClass.borderColor,
          }}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>{isFa ? 'سیستم رده‌بندی بینیاوسکی' : 'Bieniawski RMR (1989)'}</span>
              </span>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
                style={{
                  backgroundColor: rockClass.bgColor,
                  color: rockClass.textColor,
                  border: `1px solid ${rockClass.borderColor}`,
                }}
              >
                {isFa ? `رده ${rockClass.code}` : `Class ${rockClass.code}`}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-5xl font-black text-slate-100 tracking-tight font-mono">
                {finalRmr}
              </span>
              <span className="text-sm font-semibold text-amber-300">/ 100</span>
              <span className="text-xs text-slate-400 font-mono">
                {calcMode === 'manual'
                  ? (isFa ? '(ورود مستقیم دستی)' : '(Direct Manual Entry)')
                  : `(${isFa ? 'پایه:' : 'Basic:'} ${basicRmr} | ${isFa ? 'اصلاح:' : 'Adj:'} ${orientationAdj})`}
              </span>
            </div>

            <div
              className="mt-3 p-2.5 rounded-xl border text-xs font-semibold"
              style={{
                backgroundColor: rockClass.bgColor,
                color: rockClass.textColor,
                borderColor: rockClass.borderColor,
              }}
            >
              {isFa ? rockClass.nameFa : rockClass.nameEn}
            </div>

            {/* Geomechanical Strength Properties */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">
                  {isFa ? 'چسبندگی توده‌سنگ (c):' : 'Cohesion (c):'}
                </span>
                <span className="font-bold text-slate-200 font-mono mt-0.5 block">
                  {rockClass.cohesionKPa}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">
                  {isFa ? 'زاویه اصطکاک (φ):' : 'Friction Angle (φ):'}
                </span>
                <span className="font-bold text-slate-200 font-mono mt-0.5 block">
                  {rockClass.frictionAngleDeg}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={handleApplyToSystem}
              className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shadow-md shadow-amber-600/30 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isFa ? 'اعمال مقدار RMR به پروژه' : 'Apply RMR to Project'}</span>
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

        {/* Geomechanical Characterization & Rating Breakdown (Bieniawski 1989 Parts C & D) */}
        <div className="md:col-span-7 p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>
                  {isFa
                    ? 'مشخصات ژئومکانیکی و رده‌بندی توده‌سنگ (Bieniawski 1989)'
                    : 'Geomechanical Properties & Rock Mass Characterization'}
                </span>
              </h4>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 mr-1 hidden sm:inline">
                  {isFa ? 'پیش‌تنظیم:' : 'Preset:'}
                </span>
                <button
                  onClick={() => handleResetToPreset('good')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 cursor-pointer"
                >
                  {isFa ? 'سنگ خوب' : 'Good'}
                </button>
                <button
                  onClick={() => handleResetToPreset('fair')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 cursor-pointer"
                >
                  {isFa ? 'متوسط' : 'Fair'}
                </button>
                <button
                  onClick={() => handleResetToPreset('poor')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 cursor-pointer"
                >
                  {isFa ? 'ضعیف' : 'Poor'}
                </button>
              </div>
            </div>

            {/* Geomechanical Metrics Grid (Bieniawski 1989 Table Part D) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1">
                  {isFa ? 'چسبندگی توده‌سنگ (c):' : 'Cohesion (c):'}
                </span>
                <span className="font-bold text-slate-100 font-mono text-xs block">
                  {rockClass.cohesionKPa}
                </span>
                <span className="text-[9px] text-slate-500 mt-1 block">Bieniawski (Part D)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1">
                  {isFa ? 'زاویه اصطکاک (φ):' : 'Friction Angle (φ):'}
                </span>
                <span className="font-bold text-slate-100 font-mono text-xs block">
                  {rockClass.frictionAngleDeg}
                </span>
                <span className="text-[9px] text-slate-500 mt-1 block">Bieniawski (Part D)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1">
                  {isFa ? 'مدول دفرماسیون (Em):' : 'Deform. Modulus (Em):'}
                </span>
                <span className="font-bold text-emerald-400 font-mono text-xs block">
                  {deformationModulus} GPa
                </span>
                <span className="text-[9px] text-slate-500 mt-1 block">
                  {finalRmr > 50 ? 'Bieniawski (1978)' : 'Serafim & Pereira (1983)'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1">
                  {isFa ? 'خودایستایی مرجع:' : 'Ref Stand-up Time:'}
                </span>
                <span className="font-bold text-cyan-400 text-[11px] block leading-tight">
                  {refStandUpTime}
                </span>
                <span className="text-[9px] text-slate-500 mt-1 block">Table Part D benchmark</span>
              </div>
            </div>

            {/* Parameter Contribution Breakdown */}
            {calcMode === 'components' ? (
              <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-300">
                    {isFa ? 'تفکیک سهم امتیاز مؤلفه‌های ۶گانه:' : 'Rating Contribution Breakdown (6 Parameters):'}
                  </span>
                  <span className="font-mono text-amber-400 font-bold text-[10px]">
                    {isFa
                      ? `پایه: ${basicRmr} + اصلاح: ${orientationAdj} = ${finalRmr}`
                      : `Basic: ${basicRmr} + Adj: ${orientationAdj} = ${finalRmr}`}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center font-mono">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">UCS</div>
                    <div className="text-amber-400 font-bold text-xs">
                      {ucsRating}
                      <span className="text-[9px] text-slate-500">/15</span>
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">RQD</div>
                    <div className="text-amber-400 font-bold text-xs">
                      {rqdRating}
                      <span className="text-[9px] text-slate-500">/20</span>
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">{isFa ? 'فاصله' : 'Spacing'}</div>
                    <div className="text-amber-400 font-bold text-xs">
                      {spacingRating}
                      <span className="text-[9px] text-slate-500">/20</span>
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">{isFa ? 'شرایط' : 'Cond.'}</div>
                    <div className="text-amber-400 font-bold text-xs">
                      {conditionRating}
                      <span className="text-[9px] text-slate-500">/30</span>
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">{isFa ? 'آب' : 'Water'}</div>
                    <div className="text-amber-400 font-bold text-xs">
                      {groundwater}
                      <span className="text-[9px] text-slate-500">/15</span>
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">{isFa ? 'امتداد' : 'Orient.'}</div>
                    <div className="text-amber-400 font-bold text-xs">{orientationAdj}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs">
                <span className="text-slate-400">
                  {isFa
                    ? 'امتیاز RMR به صورت دستی تنظیم شده است. برای مشاهده و تغییر سهم مؤلفه‌های ۶گانه (مقاومت، RQD، فاصله و شرایط درزه‌ها، آب و امتداد)، به تب «محاسبه از مؤلفه‌ها» بروید.'
                    : 'RMR score entered directly. Switch to "Component Ratings" to view or adjust individual parameter ratings.'}
                </span>
              </div>
            )}
          </div>

          {/* Cross-Reference Notice: Support & Excavation belong to Support Estimation section */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {isFa
                  ? 'طراحی سیستم نگهداری (راک‌بولت، شاتکریت، قاب فولادی) و روش حفاری در بخش «برآورد سیستم نگهداری» ارائه شده است.'
                  : 'Support system design (rockbolts, shotcrete, steel sets) and excavation guidelines are provided in the Support Estimation section.'}
              </span>
            </div>
            {onNavigateToSupport && (
              <button
                onClick={onNavigateToSupport}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shrink-0 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>{isFa ? 'ورود به بخش برآورد نگهداری' : 'Go to Support Design'}</span>
                <ArrowRight className={`w-3 h-3 ${isFa ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Either 6-Parameter Interactive Evaluation OR Direct Manual Input Panel */}
      {calcMode === 'manual' ? (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>{isFa ? 'ورود مستقیم و دستی امتیاز RMR بینیاوسکی' : 'Direct Manual Bieniawski RMR Entry'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Manual Mode
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isFa
                    ? 'مقدار نهایی RMR (بین ۰ تا ۱۰۰) را بدون نیاز به تعیین تک‌تک مؤلفه‌ها مستقیماً وارد یا با اسلایدر تنظیم نمایید.'
                    : 'Enter the final RMR score (0-100) directly or adjust via slider without selecting each component rating.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleSyncComponentsFromManual(manualRmr)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer self-start sm:self-auto"
              title={isFa ? 'تنظیم مؤلفه‌های ۶گانه متناظر با این عدد برای حالت مؤلفه‌ها' : 'Sync 6 components to match this RMR'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'تطبیق تقریبی مؤلفه‌ها با این عدد' : 'Estimate Components for this RMR'}</span>
            </button>
          </div>

          {/* Large Number Input & Stepper Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-5 p-5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
              <label htmlFor="manual-rmr-input" className="text-xs font-semibold text-slate-300">
                {isFa ? 'مقدار عددی RMR پروژه:' : 'Project RMR Value:'}
              </label>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setManualRmr(Math.max(0, manualRmr - 5))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs cursor-pointer"
                  title="-5"
                >
                  -5
                </button>
                <button
                  onClick={() => setManualRmr(Math.max(0, manualRmr - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs cursor-pointer"
                  title="-1"
                >
                  -1
                </button>

                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border-2 border-amber-500/50 shadow-inner">
                  <input
                    id="manual-rmr-input"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={manualRmr}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setManualRmr(Math.max(0, Math.min(100, val)));
                      }
                    }}
                    className="w-20 bg-transparent text-center font-mono font-black text-amber-400 text-3xl focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-400">{isFa ? '/ ۱۰۰' : '/ 100'}</span>
                </div>

                <button
                  onClick={() => setManualRmr(Math.min(100, manualRmr + 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs cursor-pointer"
                  title="+1"
                >
                  +1
                </button>
                <button
                  onClick={() => setManualRmr(Math.min(100, manualRmr + 5))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs cursor-pointer"
                  title="+5"
                >
                  +5
                </button>
              </div>

              <div
                className="px-3 py-1 rounded-lg text-xs font-bold"
                style={{
                  backgroundColor: rockClass.bgColor,
                  color: rockClass.textColor,
                  border: `1px solid ${rockClass.borderColor}`,
                }}
              >
                {isFa ? `رده ${rockClass.code}: ${rockClass.nameFa}` : `Class ${rockClass.code}: ${rockClass.nameEn}`}
              </div>
            </div>

            {/* Slider & Quick Class Presets */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="font-semibold">{isFa ? 'لغزنده تنظیم پیوسته:' : 'Continuous Adjustment Slider:'}</span>
                  <span className="font-mono font-bold text-amber-400">{manualRmr} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={manualRmr}
                  onChange={(e) => setManualRmr(parseInt(e.target.value, 10))}
                  className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
                  <span>{isFa ? '۰ (V بسیار ضعیف)' : '0 (V Very Poor)'}</span>
                  <span>{isFa ? '۲۵ (IV ضعیف)' : '25 (IV Poor)'}</span>
                  <span>{isFa ? '۵۰ (III متوسط)' : '50 (III Fair)'}</span>
                  <span>{isFa ? '۷۵ (II خوب)' : '75 (II Good)'}</span>
                  <span>{isFa ? '۱۰۰ (I عالی)' : '100 (I Very Good)'}</span>
                </div>
              </div>

              {/* 5 Quick Rock Class Selection Buttons */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-slate-400 font-medium block">
                  {isFa ? 'بارگذاری سریع رده‌های استاندارد سنگ:' : 'Quick Rock Class Presets:'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { code: 'V', rmrVal: 15, nameFa: 'بسیار ضعیف', nameEn: 'Very Poor', color: 'border-red-600/50 text-red-300' },
                    { code: 'IV', rmrVal: 30, nameFa: 'ضعیف', nameEn: 'Poor', color: 'border-orange-600/50 text-orange-300' },
                    { code: 'III', rmrVal: 50, nameFa: 'متوسط', nameEn: 'Fair', color: 'border-amber-600/50 text-amber-300' },
                    { code: 'II', rmrVal: 70, nameFa: 'خوب', nameEn: 'Good', color: 'border-lime-600/50 text-lime-300' },
                    { code: 'I', rmrVal: 90, nameFa: 'خیلی خوب', nameEn: 'Very Good', color: 'border-emerald-600/50 text-emerald-300' },
                  ].map((preset) => (
                    <button
                      key={preset.code}
                      onClick={() => setManualRmr(preset.rmrVal)}
                      className={`p-2 rounded-xl bg-slate-950/80 border text-center transition-all cursor-pointer hover:scale-102 ${
                        rockClass.code === preset.code
                          ? 'border-amber-500 bg-amber-500/15 shadow-md shadow-amber-500/20'
                          : preset.color
                      }`}
                    >
                      <div className="font-mono font-bold text-xs">{isFa ? `رده ${preset.code}` : `Class ${preset.code}`}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{isFa ? preset.nameFa : preset.nameEn} ({preset.rmrVal})</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Equivalent Index Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">{isFa ? 'معادل شاخص GSI هوک:' : 'Equiv Hoek GSI:'}</span>
              <span className="font-mono font-bold text-purple-300 text-sm mt-0.5 block">
                GSI ≈ {Math.max(5, manualRmr - 5)}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Hoek & Brown (1997): GSI = RMR - 5</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">{isFa ? 'معادل شاخص Q بارتون:' : 'Equiv Barton Q:'}</span>
              <span className="font-mono font-bold text-teal-300 text-sm mt-0.5 block">
                Q ≈ {Math.max(0.001, Number(Math.pow(10, (manualRmr - 50) / 15).toFixed(3)))}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Barton (2002): RMR = 15 log10(Q) + 50</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">{isFa ? 'معادل رابطه بینیاوسکی:' : 'Equiv Bieniawski:'}</span>
              <span className="font-mono font-bold text-sky-300 text-sm mt-0.5 block">
                Q ≈ {Math.max(0.001, Number(Math.exp((manualRmr - 44) / 9).toFixed(3)))}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">RMR = 9 ln(Q) + 44</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  {isFa
                    ? 'ارزیابی و تنظیم پارامترهای ۶ گانه سیستم RMR (Bieniawski 1989)'
                    : 'Bieniawski 6-Parameter Evaluation Matrix'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isFa
                    ? 'امتیاز هر بخش را با توجه به گزارش‌های ژئوتکنیکی و گمانه‌ها تنظیم نمایید.'
                    : 'Adjust parameter ratings according to borehole geotechnical logs.'}
                </p>
              </div>
            </div>
          </div>

        {/* Unified Project Parameters Context Bar (Depth, Joint Sets, RQD, UCS, Spacing) */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold">{isFa ? 'متغیرهای ژئوتکنیکی یکپارچه:' : 'Unified Geotech Variables:'}</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              {isFa ? '(همگام‌سازی بلادرنگ با سیستم Q، حفاری‌پذیری و نگهداری)' : '(Real-time synced with Q, Excavability & Support)'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap font-mono text-[11px]">
            {/* Depth H */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-indigo-500/30 text-indigo-300">
              <span className="text-slate-400">{isFa ? 'عمق روباره (H):' : 'Depth (H):'}</span>
              <strong className="text-indigo-400">{currentDepth}m</strong>
            </div>

            {/* Joint Sets Jn */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-teal-500/30 text-teal-300">
              <span className="text-slate-400">{isFa ? 'تعداد درزه‌ها (Jn):' : 'Joint Sets (Jn):'}</span>
              <strong className="text-teal-400">{currentJointSets}</strong>
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
          {/* 1. UCS (Synchronized with GSI Hoek-Brown, Kirsch, Excavability & Support Hub) */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/30 space-y-2.5 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-200 flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isFa ? '۱. مقاومت فشاری تک‌محوری (UCS / σci)' : '1. Uniaxial Strength (UCS / σci)'}</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{isFa ? 'لینک‌شده با σci در GSI' : 'Linked with GSI σci'}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded text-xs">
                  {ucsRating} / 15
                </span>
              </div>
            </div>

            {/* Direct Numeric Input + Slider row */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={350}
                step={1}
                value={currentUcs}
                onChange={(e) => onUpdateUcs(Number(e.target.value))}
                className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex items-center gap-1 shrink-0 bg-slate-900 border border-amber-500/40 rounded-lg px-2 py-1">
                <input
                  type="number"
                  min={1}
                  max={400}
                  value={currentUcs}
                  onChange={(e) => onUpdateUcs(Math.max(1, Number(e.target.value)))}
                  className="w-14 bg-transparent font-mono font-bold text-amber-300 text-xs text-center focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-mono">MPa</span>
              </div>
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1 MPa</span>
              <span>100 MPa</span>
              <span>350 MPa</span>
            </div>

            {/* Discrete Bieniawski Rating Selector */}
            <select
              value={ucsRating}
              onChange={(e) => onUpdateUcs(rmrRatingToUcs(Number(e.target.value)))}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            >
              <option value={15}>&gt; 250 MPa ({isFa ? 'بسیار زیاد - امتیاز ۱۵' : 'Very high - 15'})</option>
              <option value={12}>100 - 250 MPa ({isFa ? 'زیاد - امتیاز ۱۲' : 'High - 12'})</option>
              <option value={7}>50 - 100 MPa ({isFa ? 'متوسط - امتیاز ۷' : 'Medium - 7'})</option>
              <option value={4}>25 - 50 MPa ({isFa ? 'کم - امتیاز ۴' : 'Low - 4'})</option>
              <option value={2}>5 - 25 MPa ({isFa ? 'بسیار کم - امتیاز ۲' : 'Very low - 2'})</option>
              <option value={1}>1 - 5 MPa ({isFa ? 'ناچیز - امتیاز ۱' : 'Extremely low - 1'})</option>
              <option value={0}>&lt; 1 MPa ({isFa ? 'سنگ بسیار ضعیف - امتیاز ۰' : '<1 MPa - 0'})</option>
            </select>
          </div>

          {/* 2. RQD (Synchronized with Q-system and Support Hub) */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-200">
                  {isFa ? '۲. شاخص کیفیت سنگ (RQD)' : '2. Rock Quality (RQD)'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {isFa ? 'متصل به Q و نگهداری' : 'Linked to Q & Support'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-amber-300 font-bold text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {currentRqd}%
                </span>
                <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded text-xs">
                  {rqdRating} / 20
                </span>
              </div>
            </div>

            {/* Continuous RQD Slider */}
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={currentRqd}
              onChange={(e) => onUpdateRqd(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% ({isFa ? 'خیلی ضعیف' : 'Very poor'})</span>
              <span>50%</span>
              <span>100% ({isFa ? 'عالی' : 'Excellent'})</span>
            </div>

            {/* Discrete Bieniawski Rating Selector */}
            <select
              value={rqdRating}
              onChange={(e) => onUpdateRqd(rmrRatingToRqd(Number(e.target.value)))}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            >
              <option value={20}>90% - 100% ({isFa ? 'عالی - امتیاز ۲۰' : 'Excellent - 20'})</option>
              <option value={17}>75% - 90% ({isFa ? 'خوب - امتیاز ۱۷' : 'Good - 17'})</option>
              <option value={13}>50% - 75% ({isFa ? 'متوسط - امتیاز ۱۳' : 'Fair - 13'})</option>
              <option value={8}>25% - 50% ({isFa ? 'ضعیف - امتیاز ۸' : 'Poor - 8'})</option>
              <option value={3}>&lt; 25% ({isFa ? 'بسیار ضعیف - امتیاز ۳' : 'Very poor - 3'})</option>
            </select>
          </div>

          {/* 3. Discontinuity Spacing (Synchronized with Franklin, Isaksson & Support Hub) */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-200">
                  {isFa ? '۳. فاصله‌داری ناپیوستگی‌ها' : '3. Discontinuity Spacing'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {isFa ? 'متصل به حفاری‌پذیری' : 'Linked to Excavability'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-amber-300 font-bold text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {currentJointSpacing >= 1 ? `${currentJointSpacing.toFixed(2)} m` : `${Math.round(currentJointSpacing * 100)} cm`}
                </span>
                <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded text-xs">
                  {spacingRating} / 20
                </span>
              </div>
            </div>

            {/* Continuous Joint Spacing Slider */}
            <input
              type="range"
              min={0.02}
              max={3.0}
              step={0.02}
              value={currentJointSpacing}
              onChange={(e) => onUpdateJointSpacing(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>2 cm (&lt;60mm)</span>
              <span>60 cm</span>
              <span>3.0 m (&gt;2m)</span>
            </div>

            {/* Discrete Bieniawski Rating Selector */}
            <select
              value={spacingRating}
              onChange={(e) => onUpdateJointSpacing(rmrRatingToSpacing(Number(e.target.value)))}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            >
              <option value={20}>&gt; 2 m ({isFa ? 'بسیار زیاد - امتیاز ۲۰' : '>2m - 20'})</option>
              <option value={15}>0.6 - 2.0 m ({isFa ? 'زیاد - امتیاز ۱۵' : '0.6-2m - 15'})</option>
              <option value={10}>0.2 - 0.6 m ({isFa ? 'متوسط - امتیاز ۱۰' : '0.2-0.6m - 10'})</option>
              <option value={8}>60 - 200 mm ({isFa ? 'بسته - امتیاز ۸' : '60-200mm - 8'})</option>
              <option value={5}>&lt; 60 mm ({isFa ? 'بسیار فشرده - امتیاز ۵' : '<60mm - 5'})</option>
            </select>
          </div>

          {/* 4. Condition of Discontinuities */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 lg:col-span-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-200">
                {isFa ? '۴. شرایط ناپیوستگی‌ها (طول، بازشدگی، زبری، پرشدگی، هوازدگی)' : '4. Discontinuity Condition'}
              </span>
              <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                {conditionRating} / 30
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">{isFa ? 'تداوم/طول:' : 'Persistence:'}</span>
                <select
                  value={persistence}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPersistence(val);
                    onUpdatePersistence?.(val);
                  }}
                  className="w-full p-1.5 rounded bg-slate-900 border border-slate-700 text-[11px] text-slate-200"
                >
                  <option value={6}>&lt; 1 m (6)</option>
                  <option value={4}>1 - 3 m (4)</option>
                  <option value={2}>3 - 10 m (2)</option>
                  <option value={1}>10 - 20 m (1)</option>
                  <option value={0}>&gt; 20 m (0)</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">{isFa ? 'بازشدگی:' : 'Aperture:'}</span>
                <select
                  value={aperture}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAperture(val);
                    onUpdateAperture?.(val);
                  }}
                  className="w-full p-1.5 rounded bg-slate-900 border border-slate-700 text-[11px] text-slate-200"
                >
                  <option value={6}>None (6)</option>
                  <option value={5}>&lt; 0.1 mm (5)</option>
                  <option value={4}>0.1 - 1.0 mm (4)</option>
                  <option value={1}>1 - 5 mm (1)</option>
                  <option value={0}>&gt; 5 mm (0)</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">{isFa ? 'زبری سطح:' : 'Roughness:'}</span>
                <select
                  value={roughness}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setRoughness(val);
                    onUpdateRoughness?.(val);
                  }}
                  className="w-full p-1.5 rounded bg-slate-900 border border-slate-700 text-[11px] text-slate-200"
                >
                  <option value={6}>{isFa ? 'بسیار زبر (6)' : 'Very rough (6)'}</option>
                  <option value={5}>{isFa ? 'زبر (5)' : 'Rough (5)'}</option>
                  <option value={3}>{isFa ? 'کمی زبر (3)' : 'Slightly rough (3)'}</option>
                  <option value={1}>{isFa ? 'صاف (1)' : 'Smooth (1)'}</option>
                  <option value={0}>{isFa ? 'لغزنده (0)' : 'Slickensided (0)'}</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">{isFa ? 'پرکننده درزه:' : 'Infilling:'}</span>
                <select
                  value={infillingId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInfillingId(val);
                    onUpdateInfillingId?.(val);
                  }}
                  className="w-full p-1.5 rounded bg-slate-900 border border-slate-700 text-[11px] text-slate-200"
                >
                  {infillingOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {isFa ? opt.labelFa : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">{isFa ? 'هوازدگی:' : 'Weathering:'}</span>
                <select
                  value={weathering}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setWeathering(val);
                    onUpdateWeathering?.(val);
                  }}
                  className="w-full p-1.5 rounded bg-slate-900 border border-slate-700 text-[11px] text-slate-200"
                >
                  <option value={6}>{isFa ? 'تازه و هوانزده (6)' : 'Unweathered (6)'}</option>
                  <option value={5}>{isFa ? 'کمی هوازده (5)' : 'Slightly (5)'}</option>
                  <option value={3}>{isFa ? 'متوسط هوازده (3)' : 'Moderately (3)'}</option>
                  <option value={1}>{isFa ? 'شدیداً هوازده (1)' : 'Highly (1)'}</option>
                  <option value={0}>{isFa ? 'تجزیه شده (0)' : 'Decomposed (0)'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. Groundwater */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-200">
                {isFa ? '۵. شرایط آب زیرزمینی' : '5. Groundwater'}
              </span>
              <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                {groundwater} / 15
              </span>
            </div>
            <select
              value={groundwater}
              onChange={(e) => {
                const val = Number(e.target.value);
                setGroundwater(val);
                onUpdateGroundwaterRmr?.(val);
              }}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            >
              <option value={15}>{isFa ? 'کاملاً خشک (امتیاز ۱۵ | سیستم Q بارتون: Jw = ۱.۰)' : 'Completely dry (15 | Barton Jw = 1.0)'}</option>
              <option value={10}>{isFa ? 'مرطوب / نم‌دار (امتیاز ۱۰ | سیستم Q بارتون: Jw = ۰.۶۶)' : 'Damp / Moist (10 | Barton Jw = 0.66)'}</option>
              <option value={7}>{isFa ? 'خیس با آبدهی ملایم (امتیاز ۷ | سیستم Q بارتون: Jw = ۰.۵)' : 'Wet / medium inflow (7 | Barton Jw = 0.5)'}</option>
              <option value={4}>{isFa ? 'چکه‌کنان شدید (امتیاز ۴ | سیستم Q بارتون: Jw = ۰.۳۳)' : 'Dripping / outwash (4 | Barton Jw = 0.33)'}</option>
              <option value={0}>{isFa ? 'جاری و تحت فشار بالا (امتیاز ۰ | سیستم Q بارتون: Jw = ۰.۱)' : 'Flowing / high pressure (0 | Barton Jw = 0.1)'}</option>
            </select>
          </div>

          {/* 6. Orientation Adjustment */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 lg:col-span-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-200">
                {isFa
                  ? '۶. اصلاح امتداد و شیب درزه‌ها نسبت به محور تونل (Joint Orientation Adjustment)'
                  : '6. Adjustment for Joint Orientation in Tunnels'}
              </span>
              <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                {orientationAdj} (0 to -12)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => {
                  setOrientationAdj(0);
                  onUpdateOrientationAdj?.(0);
                }}
                className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                  orientationAdj === 0
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <div className="text-[11px]">{isFa ? 'بسیار مساعد' : 'Very Favourable'}</div>
                <div className="text-[10px] font-mono mt-0.5">0</div>
              </button>
              <button
                onClick={() => {
                  setOrientationAdj(-2);
                  onUpdateOrientationAdj?.(-2);
                }}
                className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                  orientationAdj === -2
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <div className="text-[11px]">{isFa ? 'مساعد' : 'Favourable'}</div>
                <div className="text-[10px] font-mono mt-0.5">-2</div>
              </button>
              <button
                onClick={() => {
                  setOrientationAdj(-5);
                  onUpdateOrientationAdj?.(-5);
                }}
                className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                  orientationAdj === -5
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <div className="text-[11px]">{isFa ? 'متوسط' : 'Fair'}</div>
                <div className="text-[10px] font-mono mt-0.5">-5</div>
              </button>
              <button
                onClick={() => {
                  setOrientationAdj(-10);
                  onUpdateOrientationAdj?.(-10);
                }}
                className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                  orientationAdj === -10
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <div className="text-[11px]">{isFa ? 'نامساعد' : 'Unfavourable'}</div>
                <div className="text-[10px] font-mono mt-0.5">-10</div>
              </button>
              <button
                onClick={() => {
                  setOrientationAdj(-12);
                  onUpdateOrientationAdj?.(-12);
                }}
                className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                  orientationAdj === -12
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <div className="text-[11px]">{isFa ? 'بسیار نامساعد' : 'Very Unfavourable'}</div>
                <div className="text-[10px] font-mono mt-0.5">-12</div>
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
