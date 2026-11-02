import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Calculator,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  RotateCcw,
  Layers,
  Activity,
  Droplets,
  ShieldAlert,
  ArrowRight,
  Maximize2,
  Edit3,
  Sliders,
} from 'lucide-react';
import {
  Q_PARAMETER_OPTIONS,
  calculateQValue,
  getQClass,
  qToEquivalentRmr,
} from '../utils/qCalculation';
import { QParameterState } from '../types';

interface QParameterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyQ: (qValue: number) => void;
  initialQ: number;
  currentRqd?: number;
  currentJw?: number;
  onUpdateRqd?: (rqd: number) => void;
  onUpdateJw?: (jw: number) => void;
  lang: 'fa' | 'en';
}

export const QParameterModal: React.FC<QParameterModalProps> = ({
  isOpen,
  onClose,
  onApplyQ,
  initialQ,
  currentRqd = 75,
  currentJw = 0.66,
  onUpdateRqd,
  onUpdateJw,
  lang,
}) => {
  const isFa = lang === 'fa';

  const [calcMode, setCalcMode] = useState<'components' | 'manual'>('components');
  const [manualQ, setManualQ] = useState<number>(initialQ || 4.0);

  useEffect(() => {
    if (typeof initialQ === 'number' && !isNaN(initialQ)) {
      setManualQ(initialQ);
    }
  }, [initialQ]);

  // 6 Barton Q Parameters
  const [rqd, setRqd] = useState<number>(currentRqd || 75);
  const [jn, setJn] = useState<number>(4.0);
  const [jr, setJr] = useState<number>(2.0);
  const [ja, setJa] = useState<number>(1.0);
  const [jw, setJw] = useState<number>(currentJw);
  const [srf, setSrf] = useState<number>(1.0);

  useEffect(() => {
    if (typeof currentJw === 'number') {
      setJw(currentJw);
    }
  }, [currentJw]);

  const qState: QParameterState = useMemo(
    () => ({ rqd, jn, jr, ja, jw, srf }),
    [rqd, jn, jr, ja, jw, srf]
  );

  const rawCalculatedQ = useMemo(() => calculateQValue(qState), [qState]);
  const finalQ = calcMode === 'manual' ? manualQ : rawCalculatedQ;

  const qClass = useMemo(() => getQClass(finalQ), [finalQ]);
  const { rmrBieniawski, rmrBarton } = useMemo(
    () => qToEquivalentRmr(finalQ),
    [finalQ]
  );

  // 3 Key Quotients of Barton Q formula
  const blockQuotient = (rqd / jn).toFixed(1);
  const shearQuotient = (jr / ja).toFixed(2);
  const stressQuotient = (jw / srf).toFixed(2);

  if (!isOpen) return null;

  const handleResetDefaults = () => {
    setRqd(75);
    setJn(4.0);
    setJr(2.0);
    setJa(1.0);
    setJw(1.0);
    setSrf(1.0);
  };

  const handleApply = () => {
    onApplyQ(parseFloat(finalQ.toFixed(3)));
    onUpdateJw?.(jw);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-200 text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/25">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{isFa ? 'محاسبه شاخص Q بارتون (Barton Q-System)' : 'Barton Q-System Calculator'}</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-[10px] font-mono">
                  NGI 1974 / 2002
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isFa
                  ? 'محاسبه شاخص کیفی توده سنگ بر اساس ۶ پارامتر ژئومکانیکی تجربی بارتون'
                  : 'Calculate rock mass quality index from 6 empirical parameters'}
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

        {/* Mode Switcher */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/60 flex items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setCalcMode('components')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                calcMode === 'components'
                  ? 'bg-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isFa ? '۱. محاسبه با کسرها و ۶ مؤلفه بارتون' : '1. 6-Parameter Components'}</span>
            </button>
            <button
              onClick={() => {
                setCalcMode('manual');
                setManualQ(finalQ);
              }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                calcMode === 'manual'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isFa ? '۲. ورود دستی مستقیم مقدار Q' : '2. Direct Manual Input'}</span>
            </button>
          </div>
          <div className="hidden sm:block text-[11px] text-slate-400 font-mono">
            {calcMode === 'manual' ? (isFa ? 'حالت ورود دستی' : 'Manual Mode') : (isFa ? 'محاسبه فرمولی کسرها' : '3 Quotients Formula')}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {calcMode === 'manual' ? (
            <div className="p-5 rounded-xl bg-slate-950/70 border border-teal-500/30 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">
                    {isFa ? 'ورود مستقیم و سریع شاخص Q بارتون' : 'Direct Barton Q-Value Input'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isFa
                      ? 'مقدار شاخص کیفی سنگ Q (از ۰.۰۰۱ تا ۱۰۰۰) را وارد کرده یا از رده‌های زیر انتخاب نمایید.'
                      : 'Set the rock quality Q-index (0.001 - 1000) directly or pick from standard presets.'}
                  </p>
                </div>

                {/* Multiplier / adjustment buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setManualQ((prev) => Number(Math.max(0.001, prev * 0.1).toFixed(3)))}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
                  >
                    {isFa ? '÷ ۱۰' : '/ 10'}
                  </button>
                  <button
                    onClick={() => setManualQ((prev) => Number(Math.max(0.001, prev * 0.5).toFixed(3)))}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
                  >
                    {isFa ? '÷ ۲' : '/ 2'}
                  </button>
                  <div className="flex items-center px-3 py-1 rounded-xl bg-slate-900 border-2 border-teal-500">
                    <input
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
                      className="w-24 bg-transparent text-center font-mono font-black text-teal-400 text-2xl focus:outline-none"
                    />
                    <span className="text-xs font-bold text-slate-400 font-mono">Q</span>
                  </div>
                  <button
                    onClick={() => setManualQ((prev) => Number(Math.min(1000, prev * 2).toFixed(3)))}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
                  >
                    {isFa ? '× ۲' : '× 2'}
                  </button>
                  <button
                    onClick={() => setManualQ((prev) => Number(Math.min(1000, prev * 10).toFixed(3)))}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
                  >
                    {isFa ? '× ۱۰' : '× 10'}
                  </button>
                </div>
              </div>

              {/* Logarithmic Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{isFa ? 'لغزنده لگاریتمی پیوسته:' : 'Logarithmic Continuous Slider:'}</span>
                  <span className="font-mono font-bold text-teal-400">Q = {manualQ}</span>
                </div>
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
                <div className="flex justify-between text-[10px] text-slate-400 font-mono px-1">
                  <span>{isFa ? '۰.۰۰۱ (استثنایی بحرانی)' : '0.001 (Exceptionally Poor)'}</span>
                  <span>{isFa ? '۰.۱ (خیلی ضعیف)' : '0.1 (Extremely Poor)'}</span>
                  <span>{isFa ? '۱.۰ (ضعیف)' : '1.0 (Poor)'}</span>
                  <span>{isFa ? '۱۰ (خوب)' : '10 (Good)'}</span>
                  <span>{isFa ? '۱۰۰۰ (استثنایی عالی)' : '1000 (Exceptionally Good)'}</span>
                </div>
              </div>

              {/* 9 Barton Standard Rock Classes Chips */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block">
                  {isFa ? 'رده‌های ۹گانه کیفی استاندارد بارتون (NGI):' : 'Barton 9 Quality Classes Presets:'}
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
                      className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                        qClass.id === preset.classNum
                          ? 'border-teal-500 bg-teal-500/20 text-teal-300 font-bold'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-mono text-xs font-bold">
                        {isFa ? `رده ${preset.id} (${preset.qVal})` : `Class ${preset.id} (${preset.qVal})`}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate mt-0.5">
                        {isFa ? preset.nameFa : preset.nameEn}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Correlations preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">{isFa ? 'RMR معادل (Barton 2002):' : 'Equivalent RMR (Barton):'}</span>
                  <span className="font-mono font-bold text-amber-300 mt-0.5 block">{rmrBarton}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{isFa ? 'RMR معادل (Bieniawski 1989):' : 'Equivalent RMR (Bieniawski):'}</span>
                  <span className="font-mono font-bold text-amber-300 mt-0.5 block">{rmrBieniawski}</span>
                </div>
              </div>
            </div>
          ) : (
            <>
          {/* Formula & Live Quotients Overview Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-teal-900/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
              <span className="font-semibold text-slate-300 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-400" />
                {isFa ? 'فرمول بنیادی شاخص Q:' : 'Fundamental Q-System Formula:'}
              </span>
              <div className="font-mono text-teal-300 text-xs sm:text-sm bg-teal-950/60 px-3 py-1 rounded-lg border border-teal-800/60">
                Q = ( RQD / Jn ) × ( Jr / Ja ) × ( Jw / SRF )
              </div>
            </div>

            {/* 3 Quotients */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-400">
                  {isFa ? '۱. اندازه بلوک (Block Size):' : '1. Block Size:'}
                </span>
                <span className="font-mono font-bold text-sky-400 text-sm mt-0.5">
                  RQD / Jn = {blockQuotient}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {rqd}% / {jn}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-400">
                  {isFa ? '۲. مقاومت برشی درزه‌ها (Inter-block Shear):' : '2. Inter-block Shear:'}
                </span>
                <span className="font-mono font-bold text-amber-400 text-sm mt-0.5">
                  Jr / Ja = {shearQuotient}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {jr} / {ja}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-400">
                  {isFa ? '۳. تنش مؤثر / آب و تنش (Active Stress):' : '3. Active Stress:'}
                </span>
                <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                  Jw / SRF = {stressQuotient}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {jw} / {srf}
                </span>
              </div>
            </div>
          </div>

          {/* 6 PARAMETERS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PARAM 1: RQD */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>{isFa ? '۱. شاخص کیفیت سنگ (RQD)' : '1. Rock Quality Designation (RQD)'}</span>
                </label>
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-2.5 py-0.5 rounded-md">
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={rqd}
                    onChange={(e) => {
                      const val = Math.max(10, Math.min(100, Number(e.target.value)));
                      setRqd(val);
                      onUpdateRqd?.(val);
                    }}
                    className="w-12 bg-transparent text-right font-mono font-bold text-sky-400 text-xs focus:outline-none"
                  />
                  <span className="text-slate-400 font-mono">%</span>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={rqd}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setRqd(val);
                  onUpdateRqd?.(val);
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex flex-wrap gap-1">
                {Q_PARAMETER_OPTIONS.rqdPresets.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => {
                      setRqd(p.value);
                      onUpdateRqd?.(p.value);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                      rqd === p.value
                        ? 'bg-sky-600/30 border border-sky-500 text-sky-200 font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isFa ? p.labelFa : p.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* PARAM 2: Jn (Joint Set Number) */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>{isFa ? '۲. تعداد دسته‌های درزه (Jn)' : '2. Joint Set Number (Jn)'}</span>
                </label>
                <span className="font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                  Jn = {jn}
                </span>
              </div>
              <select
                value={jn}
                onChange={(e) => setJn(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-500"
              >
                {Q_PARAMETER_OPTIONS.jnOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {isFa ? opt.labelFa : opt.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* PARAM 3: Jr (Joint Roughness Number) */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isFa ? '۳. ضریب زبری درزه (Jr)' : '3. Joint Roughness Number (Jr)'}</span>
                </label>
                <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                  Jr = {jr}
                </span>
              </div>
              <select
                value={jr}
                onChange={(e) => setJr(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-500"
              >
                {Q_PARAMETER_OPTIONS.jrOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {isFa ? opt.labelFa : opt.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* PARAM 4: Ja (Joint Alteration Number) */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>{isFa ? '۴. ضریب دگرسانی و پرشدگی (Ja)' : '4. Joint Alteration (Ja)'}</span>
                </label>
                <span className="font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
                  Ja = {ja}
                </span>
              </div>
              <select
                value={ja}
                onChange={(e) => setJa(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-rose-500"
              >
                {Q_PARAMETER_OPTIONS.jaOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {isFa ? opt.labelFa : opt.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* PARAM 5: Jw (Joint Water Reduction Factor) */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span>{isFa ? '۵. ضریب کاهش آب زیرزمینی (Jw)' : '5. Water Reduction (Jw)'}</span>
                </label>
                <span className="font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                  Jw = {jw}
                </span>
              </div>
              <select
                value={jw}
                onChange={(e) => setJw(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500"
              >
                {Q_PARAMETER_OPTIONS.jwOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {isFa ? opt.labelFa : opt.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* PARAM 6: SRF (Stress Reduction Factor) */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>{isFa ? '۶. ضریب کاهش تنش (SRF)' : '6. Stress Reduction Factor (SRF)'}</span>
                </label>
                <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  SRF = {srf}
                </span>
              </div>
              <select
                value={srf}
                onChange={(e) => setSrf(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-emerald-500"
              >
                {Q_PARAMETER_OPTIONS.srfOptions.map((opt, idx) => (
                  <option key={idx} value={opt.value}>
                    {isFa ? opt.labelFa : opt.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Preview Box */}
          <div
            className="p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{
              backgroundColor: qClass.bgColor,
              borderColor: qClass.borderColor,
            }}
          >
            <div className="space-y-1 text-center sm:text-right">
              <span className="text-[11px] font-semibold text-slate-400">
                {isFa ? 'رده کیفی توده سنگ (Barton 9-Classes):' : 'Barton Rock Mass Quality Class:'}
              </span>
              <h4 className="text-base sm:text-lg font-black text-slate-100 flex items-center justify-center sm:justify-start gap-2">
                <span style={{ color: qClass.color }}>●</span>
                <span>{isFa ? qClass.nameFa : qClass.nameEn}</span>
              </h4>
              <p className="text-xs text-slate-300 max-w-lg">
                {isFa ? qClass.descriptionFa : qClass.descriptionEn}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px] text-slate-300">
                <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                  RMR (Bieniawski eq): <strong>{rmrBieniawski}</strong>
                </span>
                <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                  RMR (Barton eq): <strong>{rmrBarton}</strong>
                </span>
              </div>
            </div>

            {/* Big Q Value Score */}
            <div className="text-center bg-slate-950/80 p-4 rounded-xl border border-slate-800 shrink-0 min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                {isFa ? 'شاخص کیفی Q' : 'Calculated Q'}
              </span>
              <span
                className="text-3xl font-black font-mono tracking-tight"
                style={{ color: qClass.textColor }}
              >
                {finalQ < 0.01
                  ? finalQ.toFixed(4)
                  : finalQ < 1
                  ? finalQ.toFixed(3)
                  : finalQ.toFixed(2)}
              </span>
            </div>
          </div>
          </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div>
            {calcMode === 'components' ? (
              <button
                onClick={handleResetDefaults}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isFa ? 'مقادیر پیش‌فرض' : 'Reset Defaults'}</span>
              </button>
            ) : (
              <span className="text-slate-400 font-mono text-xs">
                {isFa ? `ورود دستی: Q = ${finalQ}` : `Direct Manual: Q = ${finalQ}`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              {isFa ? 'انصراف' : 'Cancel'}
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-teal-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isFa ? `اعمال مقدار Q = ${finalQ.toFixed(2)}` : `Apply Q = ${finalQ.toFixed(2)}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
