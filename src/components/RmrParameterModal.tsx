import React, { useState, useEffect } from 'react';
import {
  X,
  Calculator,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Sliders,
} from 'lucide-react';
import { getRockClass, rqdToRmrRating, rmrRatingToRqd } from '../utils/rmrCalculation';

interface RmrParameterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRmr: (rmrValue: number) => void;
  initialRmr: number;
  currentRqd?: number;
  currentGroundwaterRmr?: number;
  onUpdateRqd?: (rqd: number) => void;
  onUpdateGroundwaterRmr?: (val: number) => void;
  lang: 'fa' | 'en';
}

export const RmrParameterModal: React.FC<RmrParameterModalProps> = ({
  isOpen,
  onClose,
  onApplyRmr,
  initialRmr,
  currentRqd = 75,
  currentGroundwaterRmr = 10,
  onUpdateRqd,
  onUpdateGroundwaterRmr,
  lang,
}) => {
  const isFa = lang === 'fa';

  // Mode: Components calculation vs Direct Manual RMR input
  const [calcMode, setCalcMode] = useState<'components' | 'manual'>('components');
  const [manualRmr, setManualRmr] = useState<number>(initialRmr || 65);

  useEffect(() => {
    if (typeof initialRmr === 'number' && !isNaN(initialRmr)) {
      setManualRmr(initialRmr);
    }
  }, [initialRmr]);

  // 1. UCS (0-15)
  const [ucsRating, setUcsRating] = useState<number>(7);
  // 2. RQD (3-20)
  const [rqdRating, setRqdRating] = useState<number>(() => rqdToRmrRating(currentRqd));
  // 3. Spacing (5-20)
  const [spacingRating, setSpacingRating] = useState<number>(10);
  // 4. Condition (0-30): persistence, aperture, roughness, infilling, weathering
  const [persistence, setPersistence] = useState<number>(4);
  const [aperture, setAperture] = useState<number>(4);
  const [roughness, setRoughness] = useState<number>(3);
  const [infillingId, setInfillingId] = useState<string>('hard_lt5');
  const [weathering, setWeathering] = useState<number>(3);
  // 5. Groundwater (0-15)
  const [groundwater, setGroundwater] = useState<number>(currentGroundwaterRmr);

  useEffect(() => {
    if (typeof currentGroundwaterRmr === 'number') {
      setGroundwater(currentGroundwaterRmr);
    }
  }, [currentGroundwaterRmr]);
  // 6. Tunnel joint orientation adjustment (0 to -12)
  const [orientationAdj, setOrientationAdj] = useState<number>(-5);

  const infillingOptions = [
    { id: 'none', val: 6, labelFa: 'بدون پرکننده', labelEn: 'None' },
    { id: 'hard_lt5', val: 4, labelFa: 'سخت < ۵mm', labelEn: 'Hard <5mm' },
    { id: 'hard_gt5', val: 2, labelFa: 'سخت > ۵mm', labelEn: 'Hard >5mm' },
    { id: 'soft_lt5', val: 2, labelFa: 'نرم < ۵mm', labelEn: 'Soft <5mm' },
    { id: 'soft_gt5', val: 0, labelFa: 'نرم > ۵mm', labelEn: 'Soft >5mm' },
  ];

  const currentInfilling = infillingOptions.find((o) => o.id === infillingId) ?? infillingOptions[1];
  const infilling = currentInfilling.val;

  if (!isOpen) return null;

  const conditionTotal = persistence + aperture + roughness + infilling + weathering;
  const basicRmr = ucsRating + rqdRating + spacingRating + conditionTotal + groundwater;
  const totalRmr =
    calcMode === 'manual'
      ? manualRmr
      : Math.max(0, Math.min(100, basicRmr + orientationAdj));
  const currentClass = getRockClass(totalRmr);

  const handleApply = () => {
    onApplyRmr(totalRmr);
    onUpdateGroundwaterRmr?.(groundwater);
    onClose();
  };

  const handleReset = () => {
    setUcsRating(7);
    setRqdRating(13);
    setSpacingRating(10);
    setPersistence(4);
    setAperture(4);
    setRoughness(3);
    setInfillingId('hard_lt5');
    setWeathering(3);
    setGroundwater(10);
    setOrientationAdj(-5);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {isFa ? 'محاسبه‌گر ۶ پارامتری RMR بینیاوسکی (1989)' : 'Bieniawski RMR 1989 6-Parameter Calculator'}
              </h3>
              <p className="text-xs text-slate-400">
                {isFa
                  ? 'برآورد رتبه ژئومکانیکی بر اساس آزمایش‌های آزمایشگاهی و پیمایش درزه‌داری'
                  : 'Calculate RMR based on UCS, RQD, joint spacing, conditions & groundwater'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calculation Mode Switcher */}
        <div className="px-4 sm:px-6 pt-3 pb-3 bg-slate-950/60 flex items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setCalcMode('components')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                calcMode === 'components'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isFa ? '۱. محاسبه با مؤلفه‌های ۶گانه (Ratings)' : '1. Component Ratings'}</span>
            </button>
            <button
              onClick={() => {
                setCalcMode('manual');
                setManualRmr(totalRmr);
              }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                calcMode === 'manual'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isFa ? '۲. ورود دستی مستقیم مقدار RMR' : '2. Direct Manual Input'}</span>
            </button>
          </div>
          <div className="hidden sm:block text-[11px] text-slate-400 font-mono">
            {calcMode === 'manual' ? (isFa ? 'حالت ورود دستی' : 'Manual Mode') : (isFa ? 'محاسبه فرمولی ۶ پارامتر' : '6 Parameters')}
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Real-time RMR Score Header Sticky Banner */}
          <div
            className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 sticky top-0 z-10 shadow-lg backdrop-blur-md"
            style={{
              backgroundColor: currentClass.bgColor,
              borderColor: currentClass.borderColor,
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-slate-300">
                  {calcMode === 'manual'
                    ? (isFa ? 'مقدار دستی RMR:' : 'Manual RMR Value:')
                    : (isFa ? 'مجموع نهایی RMR:' : 'Total Calculated RMR:')}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-100 font-mono">
                    {totalRmr}
                  </span>
                  <span className="text-xs text-slate-300">/ ۱۰۰</span>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-700/60 hidden sm:block" />
              <div>
                <span className="text-[11px] text-slate-300 block">{isFa ? 'رده کیفی:' : 'Class:'}</span>
                <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: currentClass.color }}
                  />
                  {isFa ? currentClass.nameFa : currentClass.nameEn}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mr-auto">
              {calcMode === 'components' && (
                <button
                  onClick={handleReset}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isFa ? 'بازنشانی' : 'Reset'}</span>
                </button>
              )}
              <button
                onClick={handleApply}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isFa ? 'اعمال در محاسبه‌گر' : 'Apply to Model'}</span>
              </button>
            </div>
          </div>

          {/* Conditional Body: Manual Input Panel vs 6-Parameter Flow */}
          {calcMode === 'manual' ? (
            <div className="p-5 rounded-xl bg-slate-950/70 border border-indigo-500/30 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">
                    {isFa ? 'ورود مستقیم و سریع نمره RMR' : 'Direct RMR Score Input'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isFa
                      ? 'مقدار نهایی RMR (بین ۰ تا ۱۰۰) را با کیبورد یا اسلایدر تنظیم نمایید.'
                      : 'Set the final RMR score (0-100) directly via slider or text input.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setManualRmr((prev) => Math.max(0, prev - 5))}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
                  >
                    {isFa ? '-۵' : '-5'}
                  </button>
                  <button
                    onClick={() => setManualRmr((prev) => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
                  >
                    {isFa ? '-۱' : '-1'}
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={manualRmr}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setManualRmr(Math.max(0, Math.min(100, val)));
                      }
                    }}
                    className="w-20 px-2 py-1.5 rounded-lg bg-slate-900 border-2 border-indigo-500 text-center font-mono text-xl font-black text-indigo-400 focus:outline-none"
                  />
                  <button
                    onClick={() => setManualRmr((prev) => Math.min(100, prev + 1))}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
                  >
                    {isFa ? '+۱' : '+1'}
                  </button>
                  <button
                    onClick={() => setManualRmr((prev) => Math.min(100, prev + 5))}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
                  >
                    {isFa ? '+۵' : '+5'}
                  </button>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={manualRmr}
                  onChange={(e) => setManualRmr(parseInt(e.target.value, 10))}
                  className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>{isFa ? '۰ (بسیار ضعیف)' : '0 (Very Poor)'}</span>
                  <span>{isFa ? '۲۱ (ضعیف)' : '21 (Poor)'}</span>
                  <span>{isFa ? '۴۱ (متوسط)' : '41 (Fair)'}</span>
                  <span>{isFa ? '۶۱ (خوب)' : '61 (Good)'}</span>
                  <span>{isFa ? '۸۱ (بسیار خوب)' : '81 (Very Good)'}</span>
                  <span>{isFa ? '۱۰۰' : '100'}</span>
                </div>
              </div>

              {/* 5 Standard Rock Classes Quick Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block">
                  {isFa ? 'انتخاب سریع بر اساس ۵ رده استاندارد بینیاوسکی:' : 'Quick Select 5 Bieniawski Classes:'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'I', labelFa: 'رده I (بسیار خوب)', labelEn: 'Class I (Very Good)', val: 85, range: '81-100', color: '#10b981' },
                    { id: 'II', labelFa: 'رده II (خوب)', labelEn: 'Class II (Good)', val: 70, range: '61-80', color: '#06b6d4' },
                    { id: 'III', labelFa: 'رده III (متوسط)', labelEn: 'Class III (Fair)', val: 50, range: '41-60', color: '#f59e0b' },
                    { id: 'IV', labelFa: 'رده IV (ضعیف)', labelEn: 'Class IV (Poor)', val: 30, range: '21-40', color: '#f97316' },
                    { id: 'V', labelFa: 'رده V (بسیار ضعیف)', labelEn: 'Class V (Very Poor)', val: 15, range: '< 20', color: '#ef4444' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setManualRmr(preset.val)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        currentClass.code === preset.id
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{isFa ? preset.labelFa : preset.labelEn}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">RMR ≈ {preset.val} ({preset.range})</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Class Properties Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">{isFa ? 'چسبندگی توده سنگ (c):' : 'Cohesion (c):'}</span>
                  <span className="font-bold text-slate-200 mt-0.5 block">{currentClass.cohesionKPa}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{isFa ? 'زاویه اصطکاک داخلی (φ):' : 'Friction Angle (φ):'}</span>
                  <span className="font-bold text-slate-200 mt-0.5 block">{currentClass.frictionAngleDeg}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{isFa ? 'مدول تغییرشکل‌پذیری (Em):' : 'Deformation Modulus:'}</span>
                  <span className="font-mono font-bold text-emerald-400 mt-0.5 block">
                    {manualRmr > 50
                      ? `${Math.round(2 * manualRmr - 100)} GPa`
                      : `${(0.1 * Math.pow(manualRmr / 10, 3)).toFixed(1)} GPa`}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <>
          {/* PARAMETER 1: UCS */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-sm">
                {isFa ? '۱. مقاومت فشاری تک‌محوری سنگ بکر (UCS)' : '1. Strength of Intact Rock (UCS)'}
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-800/80 text-indigo-300 font-mono font-bold">
                {isFa ? `امتیاز: ${ucsRating}` : `Rating: ${ucsRating}`}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { val: 15, label: '> 250 MPa' },
                { val: 12, label: '100 - 250 MPa' },
                { val: 7, label: '50 - 100 MPa' },
                { val: 4, label: '25 - 50 MPa' },
                { val: 2, label: '5 - 25 MPa' },
                { val: 1, label: '1 - 5 MPa' },
                { val: 0, label: '< 1 MPa' },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setUcsRating(item.val)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    ucsRating === item.val
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-mono">{item.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">({item.val} pts)</div>
                </button>
              ))}
            </div>
          </div>

          {/* PARAMETER 2: RQD */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-sm">
                {isFa ? '۲. شاخص کیفی سنگ (RQD %)' : '2. Rock Quality Designation (RQD %)'}
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-800/80 text-indigo-300 font-mono font-bold">
                {isFa ? `امتیاز: ${rqdRating}` : `Rating: ${rqdRating}`}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {[
                { val: 20, label: '90 - 100%' },
                { val: 17, label: '75 - 90%' },
                { val: 13, label: '50 - 75%' },
                { val: 8, label: '25 - 50%' },
                { val: 3, label: '< 25%' },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => {
                    setRqdRating(item.val);
                    onUpdateRqd?.(rmrRatingToRqd(item.val));
                  }}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    rqdRating === item.val
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-mono">{item.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">({item.val} pts)</div>
                </button>
              ))}
            </div>
          </div>

          {/* PARAMETER 3: Discontinuity Spacing */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-sm">
                {isFa ? '۳. فاصله ناپیوستگی‌ها و درزه‌ها (Joint Spacing)' : '3. Spacing of Discontinuities'}
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-800/80 text-indigo-300 font-mono font-bold">
                {isFa ? `امتیاز: ${spacingRating}` : `Rating: ${spacingRating}`}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {[
                { val: 20, label: '> 2 m' },
                { val: 15, label: '0.6 - 2.0 m' },
                { val: 10, label: '200 - 600 mm' },
                { val: 8, label: '60 - 200 mm' },
                { val: 5, label: '< 60 mm' },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setSpacingRating(item.val)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    spacingRating === item.val
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-mono">{item.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">({item.val} pts)</div>
                </button>
              ))}
            </div>
          </div>

          {/* PARAMETER 4: Condition of Discontinuities (Sub-parameters) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-sm">
                {isFa ? '۴. وضعیت سطوح ناپیوستگی‌ها (Condition of Discontinuities)' : '4. Condition of Discontinuities'}
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-800/80 text-indigo-300 font-mono font-bold">
                {isFa ? `مجموع: ${conditionTotal} / ۳۰` : `Total: ${conditionTotal} / 30`}
              </span>
            </div>

            {/* 4a. Persistence / Length */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 block font-semibold">
                {isFa ? 'طول تداوم درزه (Persistence):' : 'Persistence (Length):'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1">
                {[
                  { val: 6, label: '< 1 m' },
                  { val: 4, label: '1 - 3 m' },
                  { val: 2, label: '3 - 10 m' },
                  { val: 1, label: '10 - 20 m' },
                  { val: 0, label: '> 20 m' },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setPersistence(item.val)}
                    className={`py-1 px-1.5 rounded border text-center text-[11px] ${
                      persistence === item.val
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    {item.label} ({item.val})
                  </button>
                ))}
              </div>
            </div>

            {/* 4b. Aperture / Separation */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 block font-semibold">
                {isFa ? 'میزان بازشدگی (Aperture):' : 'Aperture / Separation:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1">
                {[
                  { val: 6, label: isFa ? 'بسته (None)' : 'None' },
                  { val: 5, label: '< 0.1 mm' },
                  { val: 4, label: '0.1 - 1.0 mm' },
                  { val: 1, label: '1.0 - 5.0 mm' },
                  { val: 0, label: '> 5.0 mm' },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setAperture(item.val)}
                    className={`py-1 px-1.5 rounded border text-center text-[11px] ${
                      aperture === item.val
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    {item.label} ({item.val})
                  </button>
                ))}
              </div>
            </div>

            {/* 4c. Roughness */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 block font-semibold">
                {isFa ? 'زبری سطح درزه (Roughness):' : 'Roughness:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1">
                {[
                  { val: 6, label: isFa ? 'بسیار زبر' : 'Very Rough' },
                  { val: 5, label: isFa ? 'زبر' : 'Rough' },
                  { val: 3, label: isFa ? 'کمی زبر' : 'Slightly Rough' },
                  { val: 1, label: isFa ? 'صاف' : 'Smooth' },
                  { val: 0, label: isFa ? 'صیقلی' : 'Slickensided' },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setRoughness(item.val)}
                    className={`py-1 px-1.5 rounded border text-center text-[11px] ${
                      roughness === item.val
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    {item.label} ({item.val})
                  </button>
                ))}
              </div>
            </div>

            {/* 4d. Infilling */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 block font-semibold">
                {isFa ? 'ماده پرکننده (Infilling / Gouge):' : 'Infilling (Gouge):'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1">
                {infillingOptions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setInfillingId(item.id)}
                    className={`py-1 px-1.5 rounded border text-center text-[11px] transition-all ${
                      infillingId === item.id
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {isFa ? item.labelFa : item.labelEn} ({item.val})
                  </button>
                ))}
              </div>
            </div>

            {/* 4e. Weathering */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 block font-semibold">
                {isFa ? 'هوازدگی (Weathering):' : 'Weathering:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1">
                {[
                  { val: 6, label: isFa ? 'بدون هوازدگی' : 'Unweathered' },
                  { val: 5, label: isFa ? 'کمی هوازده' : 'Slightly' },
                  { val: 3, label: isFa ? 'متوسط' : 'Moderately' },
                  { val: 1, label: isFa ? 'شدیداً هوازده' : 'Highly' },
                  { val: 0, label: isFa ? 'کاملاً خردشده' : 'Decomposed' },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setWeathering(item.val)}
                    className={`py-1 px-1.5 rounded border text-center text-[11px] ${
                      weathering === item.val
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    {item.label} ({item.val})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PARAMETER 5: Groundwater */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-sm">
                {isFa ? '۵. شرایط آب زیرزمینی (Groundwater)' : '5. Groundwater Conditions'}
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-800/80 text-indigo-300 font-mono font-bold">
                {isFa ? `امتیاز: ${groundwater}` : `Rating: ${groundwater}`}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {[
                { val: 15, labelFa: 'کاملاً خشک', labelEn: 'Completely Dry' },
                { val: 10, labelFa: 'مرطوب (Damp)', labelEn: 'Damp' },
                { val: 7, labelFa: 'خیس (Wet)', labelEn: 'Wet' },
                { val: 4, labelFa: 'چکه‌کننده (Dripping)', labelEn: 'Dripping' },
                { val: 0, labelFa: 'جاری (Flowing)', labelEn: 'Flowing' },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setGroundwater(item.val)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    groundwater === item.val
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div>{isFa ? item.labelFa : item.labelEn}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">({item.val} pts)</div>
                </button>
              ))}
            </div>
          </div>

          {/* PARAMETER 6: Orientation Adjustment for Tunnels */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-sm">
                {isFa ? '۶. تصحیح جهت‌داری درزه‌ها نسبت به محور تونل' : '6. Joint Orientation Adjustment (Tunnels)'}
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-950/70 border border-rose-800/80 text-rose-300 font-mono font-bold">
                {isFa ? `تصحیح: ${orientationAdj}` : `Adjustment: ${orientationAdj}`}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {[
                { val: 0, labelFa: 'بسیار مساعد', labelEn: 'Very Favourable' },
                { val: -2, labelFa: 'مساعد', labelEn: 'Favourable' },
                { val: -5, labelFa: 'متوسط', labelEn: 'Fair' },
                { val: -10, labelFa: 'نامساعد', labelEn: 'Unfavourable' },
                { val: -12, labelFa: 'بسیار نامساعد', labelEn: 'Very Unfavourable' },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setOrientationAdj(item.val)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    orientationAdj === item.val
                      ? 'bg-rose-600/20 border-rose-500 text-rose-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div>{isFa ? item.labelFa : item.labelEn}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">({item.val} pts)</div>
                </button>
              ))}
            </div>
          </div>
          </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {calcMode === 'manual'
              ? (isFa ? `حالت ورودی مستقیم: ${manualRmr}` : `Direct Manual Input: ${manualRmr}`)
              : isFa
              ? `RMR پایه: ${basicRmr} | تصحیح جهت: ${orientationAdj} | نهایی: ${totalRmr}`
              : `Basic RMR: ${basicRmr} | Adjustment: ${orientationAdj} | Final: ${totalRmr}`}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs transition-colors"
            >
              {isFa ? 'انصراف' : 'Cancel'}
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isFa ? 'تأیید و اعمال در برنامه' : 'Apply Score'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
