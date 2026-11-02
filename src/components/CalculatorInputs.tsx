import React from 'react';
import { RockClassInfo, QClassInfo, ClassificationMethod, EsrOption } from '../types';
import { ROCK_CLASSES, PRESET_SCENARIOS } from '../utils/rmrCalculation';
import { Q_CLASSES, ESR_OPTIONS } from '../utils/qCalculation';
import {
  Sliders,
  Sparkles,
  Calculator,
  Compass,
  CheckCircle2,
  FolderOpen,
  ArrowUpDown,
  Layers,
  Scale,
  Building,
  Info,
  AlertTriangle,
} from 'lucide-react';

interface CalculatorInputsProps {
  method: ClassificationMethod;
  setMethod: (method: ClassificationMethod) => void;
  span: number;
  setSpan: (val: number) => void;
  rmr: number;
  setRmr: (val: number) => void;
  qValue: number;
  setQValue: (val: number) => void;
  esr: number;
  setEsr: (val: number) => void;
  rockClass: RockClassInfo;
  qClass: QClassInfo;
  onOpenRmrWizard: () => void;
  onOpenQWizard: () => void;
  onSelectPreset: (span: number, rmr: number, q?: number, esr?: number) => void;
  gsi?: number;
  onUpdateGsi?: (val: number) => void;
  lang: 'fa' | 'en';
}

export const CalculatorInputs: React.FC<CalculatorInputsProps> = ({
  method,
  setMethod,
  span,
  setSpan,
  rmr,
  setRmr,
  qValue,
  setQValue,
  esr,
  setEsr,
  rockClass,
  qClass,
  onOpenRmrWizard,
  onOpenQWizard,
  onSelectPreset,
  gsi,
  onUpdateGsi,
  lang,
}) => {
  const isFa = lang === 'fa';

  const quickSpans = [1.0, 2.5, 4.0, 6.0, 8.0, 10.0, 12.0, 15.0];

  const quickRmrClasses = [
    { classId: 5, labelFa: 'بسیار ضعیف (V)', labelEn: 'Very Poor (V)', defaultRmr: 15 },
    { classId: 4, labelFa: 'ضعیف (IV)', labelEn: 'Poor (IV)', defaultRmr: 30 },
    { classId: 3, labelFa: 'متوسط (III)', labelEn: 'Fair (III)', defaultRmr: 50 },
    { classId: 2, labelFa: 'خوب (II)', labelEn: 'Good (II)', defaultRmr: 70 },
    { classId: 1, labelFa: 'خیلی خوب (I)', labelEn: 'Very Good (I)', defaultRmr: 90 },
  ];

  const quickQPresets = [
    { label: '0.01', val: 0.01, descFa: 'فوق‌العاده ضعیف' },
    { label: '0.1', val: 0.1, descFa: 'بسیار ضعیف' },
    { label: '1.0', val: 1.0, descFa: 'ضعیف' },
    { label: '4.0', val: 4.0, descFa: 'متوسط' },
    { label: '10', val: 10.0, descFa: 'خوب' },
    { label: '40', val: 40.0, descFa: 'بسیار خوب' },
    { label: '100', val: 100.0, descFa: 'فوق‌العاده خوب' },
  ];

  return (
    <div
      id="calculator-inputs-panel"
      className="bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5"
    >
      {/* Panel Header & Method Selector */}
      <div className="space-y-3 border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {isFa ? 'تنظیمات و پارامترهای ورودی' : 'Calculation Parameters'}
              </h2>
              <p className="text-xs text-slate-400">
                {isFa ? 'روش تخمین، قطر دهانه و شاخص کیفی را تعیین نمایید' : 'Select method, excavation span & rock quality'}
              </p>
            </div>
          </div>
        </div>

        {/* 3-way Method Segmented Switch */}
        <div className="grid grid-cols-3 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setMethod('rmr')}
            className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              method === 'rmr'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{isFa ? 'روش RMR' : 'RMR 1989'}</span>
          </button>

          <button
            onClick={() => setMethod('q')}
            className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              method === 'q'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isFa ? 'روش شاخص Q' : 'Barton Q'}</span>
          </button>

          <button
            onClick={() => setMethod('both')}
            className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              method === 'both'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isFa ? 'تحلیل مقایسه‌ای' : 'Dual Compare'}</span>
          </button>
        </div>
      </div>

      {/* INPUT 1: Tunnel Diameter / Unsupported Span (Shared) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="span-input" className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>{isFa ? '۱. قطر دهانه بدون نگهداری (Unsupported Span)' : '1. Unsupported Span / Diameter'}</span>
          </label>
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg focus-within:border-amber-500">
            <input
              id="span-input"
              type="number"
              min="0.5"
              max="20"
              step="0.1"
              value={span}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) setSpan(Math.max(0.5, Math.min(20, val)));
              }}
              className="w-16 bg-transparent text-right font-mono font-bold text-amber-400 text-base focus:outline-none"
            />
            <span className="text-xs font-medium text-slate-400">{isFa ? 'متر' : 'm'}</span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="relative pt-1">
          <input
            id="span-slider"
            type="range"
            min="0.5"
            max="20"
            step="0.1"
            value={span}
            onChange={(e) => setSpan(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>{isFa ? '۰.۵ متر' : '0.5 m'}</span>
            <span>{isFa ? '۵ متر' : '5 m'}</span>
            <span>{isFa ? '۱۰ متر' : '10 m'}</span>
            <span>{isFa ? '۱۵ متر' : '15 m'}</span>
            <span>{isFa ? '۲۰ متر' : '20 m'}</span>
          </div>
        </div>

        {/* Quick Span Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 mr-1">{isFa ? 'دهانه‌های رایج:' : 'Quick Spans:'}</span>
          {quickSpans.map((qs) => (
            <button
              key={qs}
              onClick={() => setSpan(qs)}
              className={`px-2 py-0.5 rounded text-xs font-mono transition-all cursor-pointer ${
                span === qs
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold'
                  : 'bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {qs}m
            </button>
          ))}
        </div>
      </div>

      {/* INPUT 2: RMR Section (Shown when method is 'rmr' or 'both') */}
      {(method === 'rmr' || method === 'both') && (
        <div className="space-y-3 pt-3 border-t border-slate-800/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <label htmlFor="rmr-input" className="text-sm font-semibold text-slate-200">
                {isFa ? 'شاخص کیفی توده سنگ (RMR Rating)' : 'Rock Mass Rating (RMR)'}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-open-rmr-wizard"
                onClick={onOpenRmrWizard}
                className="px-2.5 py-1 rounded-lg bg-sky-600/20 border border-sky-500/40 hover:bg-sky-600/30 text-sky-300 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>{isFa ? 'ویزارد ۶ پارامتر RMR' : 'RMR Wizard'}</span>
              </button>
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg focus-within:border-sky-500">
                <input
                  id="rmr-input"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={rmr}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setRmr(Math.max(0, Math.min(100, val)));
                  }}
                  className="w-12 bg-transparent text-right font-mono font-bold text-sky-400 text-base focus:outline-none"
                />
                <span className="text-xs font-medium text-slate-400">{isFa ? '/ ۱۰۰' : '/ 100'}</span>
              </div>
            </div>
          </div>

          {/* Range Slider for RMR */}
          <div className="relative pt-1">
            <input
              id="rmr-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value={rmr}
              onChange={(e) => setRmr(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>{isFa ? '۰ (V)' : '0 (V)'}</span>
              <span>{isFa ? '۲۰ (IV)' : '20 (IV)'}</span>
              <span>{isFa ? '۴۰ (III)' : '40 (III)'}</span>
              <span>{isFa ? '۶۰ (II)' : '60 (II)'}</span>
              <span>{isFa ? '۸۰ (I)' : '80 (I)'}</span>
              <span>{isFa ? '۱۰۰' : '100'}</span>
            </div>
          </div>

          {/* Quick Rock Class Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
            {quickRmrClasses.map((qc) => {
              const isCurrentClass = rockClass.id === qc.classId;
              const rcInfo = ROCK_CLASSES[qc.classId];
              return (
                <button
                  key={qc.classId}
                  onClick={() => setRmr(qc.defaultRmr)}
                  className={`px-2 py-1.5 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                    isCurrentClass
                      ? 'border-sky-500/60 bg-sky-500/15 text-sky-200 shadow-sm'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: rcInfo.color }} />
                    <span>{isFa ? qc.labelFa : qc.labelEn}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Contextual Warning if RMR and GSI are in conflict */}
          {gsi !== undefined && Math.abs(rmr - gsi) >= 20 && (
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-[11px] text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  {isFa
                    ? `هشدار عدم تطابق: RMR=${rmr} با GSI=${gsi} (${Math.abs(rmr - gsi)} واحد تفاوت) همخوانی ندارد!`
                    : `Parameter Mismatch: RMR=${rmr} does not correlate with GSI=${gsi} (${Math.abs(rmr - gsi)} pts diff)!`}
                </span>
              </div>
              {onUpdateGsi && (
                <button
                  onClick={() => onUpdateGsi(Math.max(5, Math.min(100, rmr - 5)))}
                  className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-[10.5px] font-bold shrink-0 cursor-pointer self-end sm:self-auto"
                >
                  {isFa ? `تطبیق GSI (${Math.max(5, Math.min(100, rmr - 5))})` : `Sync GSI (${Math.max(5, Math.min(100, rmr - 5))})`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* INPUT 3: Q-System Section (Shown when method is 'q' or 'both') */}
      {(method === 'q' || method === 'both') && (
        <div className="space-y-3 pt-3 border-t border-slate-800/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <label htmlFor="q-input" className="text-sm font-semibold text-slate-200">
                {isFa ? 'شاخص کیفیت سنگ بارتون (Q-Value)' : 'Barton Q-Value'}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-open-q-wizard"
                onClick={onOpenQWizard}
                className="px-2.5 py-1 rounded-lg bg-teal-600/20 border border-teal-500/40 hover:bg-teal-600/30 text-teal-300 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>{isFa ? 'ویزارد ۶ پارامتر Q' : 'Q Wizard'}</span>
              </button>
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg focus-within:border-teal-500">
                <input
                  id="q-input"
                  type="number"
                  min="0.001"
                  max="1000"
                  step="0.01"
                  value={qValue}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setQValue(Math.max(0.001, Math.min(1000, val)));
                  }}
                  className="w-16 bg-transparent text-right font-mono font-bold text-teal-400 text-base focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Logarithmic Slider for Q */}
          <div className="relative pt-1">
            <input
              id="q-slider"
              type="range"
              min="-3"
              max="3"
              step="0.05"
              value={Math.log10(qValue)}
              onChange={(e) => {
                const logVal = parseFloat(e.target.value);
                const linearVal = Math.pow(10, logVal);
                setQValue(parseFloat(linearVal.toFixed(linearVal < 1 ? 3 : 2)));
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>0.001</span>
              <span>0.01</span>
              <span>0.1</span>
              <span>1.0</span>
              <span>10</span>
              <span>100</span>
              <span>1000</span>
            </div>
          </div>

          {/* Quick Q values chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 mr-1">{isFa ? 'مقادیر سریع Q:' : 'Quick Q:'}</span>
            {quickQPresets.map((qp) => (
              <button
                key={qp.val}
                onClick={() => setQValue(qp.val)}
                className={`px-2 py-0.5 rounded text-xs font-mono transition-all cursor-pointer ${
                  Math.abs(qValue - qp.val) < 0.001
                    ? 'bg-teal-500/20 border border-teal-500/40 text-teal-300 font-bold'
                    : 'bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* ESR (Excavation Support Ratio) Selector */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-teal-400" />
                <span>{isFa ? 'ضریب کاربری و نگهداری حفاری (ESR):' : 'Excavation Support Ratio (ESR):'}</span>
              </span>
              <span className="font-mono text-teal-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                ESR = {esr}
              </span>
            </label>
            <select
              value={esr}
              onChange={(e) => setEsr(parseFloat(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-teal-500"
            >
              {ESR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {isFa ? opt.labelFa : opt.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Preset Engineering Scenarios */}
      <div className="pt-3 border-t border-slate-800/70">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFa ? 'سناریوهای پروژه‌ای نمونه (Real Projects)' : 'Preset Project Scenarios'}</span>
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESET_SCENARIOS.slice(0, 4).map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p.span, p.rmr, p.qValue, p.esr)}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800/60 hover:border-slate-700 text-right transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors truncate">
                  {isFa ? p.titleFa : p.titleEn}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {p.span}m | RMR={p.rmr}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                {isFa ? p.descriptionFa : p.descriptionEn}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
