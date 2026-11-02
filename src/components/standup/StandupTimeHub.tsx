import React, { useState } from 'react';
import {
  Compass,
  Layers,
  Sparkles,
  Sliders,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import {
  ClassificationMethod,
  RockClassInfo,
  QClassInfo,
  CalculationResult,
  QCalculationResult,
} from '../../types';
import { CalculatorInputs } from '../CalculatorInputs';
import { ResultDisplay } from '../ResultDisplay';
import { BieniawskiChart } from '../BieniawskiChart';
import { BartonQChart } from '../BartonQChart';

interface StandupTimeHubProps {
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
  rmrResult: CalculationResult;
  qResult: QCalculationResult;
  onOpenRmrWizard: () => void;
  onOpenQWizard: () => void;
  onSelectPreset: (span: number, rmr: number, q?: number, esr?: number) => void;
  onNavigateToClassification: () => void;
  onNavigateToSupport?: () => void;
  gsi?: number;
  onUpdateGsi?: (val: number) => void;
  lang: 'fa' | 'en';
}

export const StandupTimeHub: React.FC<StandupTimeHubProps> = ({
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
  rmrResult,
  qResult,
  onOpenRmrWizard,
  onOpenQWizard,
  onSelectPreset,
  onNavigateToClassification,
  onNavigateToSupport,
  gsi,
  onUpdateGsi,
  lang,
}) => {
  const isFa = lang === 'fa';
  const [activeChart, setActiveChart] = useState<'rmr' | 'q'>(
    method === 'q' ? 'q' : 'rmr'
  );

  return (
    <div className="space-y-6">
      {/* Top Method Control Bar & Geotechnical Navigation Link */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Method Switcher Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => {
              setMethod('rmr');
              setActiveChart('rmr');
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
              method === 'rmr'
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{isFa ? 'بر اساس RMR بینیاوسکی' : 'Bieniawski RMR'}</span>
          </button>

          <button
            onClick={() => {
              setMethod('q');
              setActiveChart('q');
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
              method === 'q'
                ? 'bg-teal-500/20 border border-teal-500/50 text-teal-300 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>{isFa ? 'بر اساس شاخص Q بارتون' : 'Barton Q-System'}</span>
          </button>

          <button
            onClick={() => setMethod('both')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
              method === 'both'
                ? 'bg-blue-500/20 border border-blue-500/50 text-blue-300 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>{isFa ? 'تحلیل مقایسه‌ای همزمان (RMR & Q)' : 'Dual Comparison'}</span>
          </button>
        </div>

        {/* Link back to engineering classification */}
        <button
          onClick={onNavigateToClassification}
          className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            {isFa
              ? 'ورود به طبقه‌بندی مهندسی (RMR / Q / GSI)'
              : 'Go to Engineering Classification'}
          </span>
          <ArrowRight className={`w-3.5 h-3.5 ${isFa ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Main Grid: Inputs & Calculated Stand-up Time Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Output & Inputs */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          {/* Primary Calculation Output */}
          <ResultDisplay
            method={method}
            rmrResult={rmrResult}
            qResult={qResult}
            lang={lang}
          />

          {/* Inputs Panel */}
          <CalculatorInputs
            method={method}
            setMethod={setMethod}
            span={span}
            setSpan={setSpan}
            rmr={rmr}
            setRmr={setRmr}
            qValue={qValue}
            setQValue={setQValue}
            esr={esr}
            setEsr={setEsr}
            rockClass={rockClass}
            qClass={qClass}
            onOpenRmrWizard={onOpenRmrWizard}
            onOpenQWizard={onOpenQWizard}
            onSelectPreset={onSelectPreset}
            gsi={gsi}
            onUpdateGsi={onUpdateGsi}
            lang={lang}
          />
        </div>

        {/* Right Column: Active Stand-up Time Chart */}
        <div className="lg:col-span-7 space-y-4">
          {/* Chart Header Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-2 px-3 shadow-lg">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{isFa ? 'نمودار تحلیلی پایداری و زمان خودایستایی:' : 'Active Stand-up Time Chart:'}</span>
            </span>

            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold flex-wrap gap-1">
              <button
                onClick={() => setActiveChart('rmr')}
                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeChart === 'rmr'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5 shrink-0" />
                <span>{isFa ? 'نمودار RMR بینیاوسکی' : 'Bieniawski RMR'}</span>
              </button>

              <button
                onClick={() => setActiveChart('q')}
                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeChart === 'q'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>{isFa ? 'نمودار Q بارتون' : 'Barton Q-System'}</span>
              </button>
            </div>
          </div>

          {/* Active Chart Component */}
          {activeChart === 'rmr' ? (
            <BieniawskiChart
              result={rmrResult}
              onSelectPoint={(pickedSpan, pickedRmr) => {
                setSpan(pickedSpan);
                if (pickedRmr !== undefined) setRmr(pickedRmr);
              }}
              lang={lang}
            />
          ) : (
            <BartonQChart
              result={qResult}
              onUpdatePoint={(newSpan, newQ) => {
                setSpan(newSpan);
                setQValue(newQ);
              }}
              lang={lang}
            />
          )}
        </div>
      </div>

      {/* Navigation Banner to Dedicated Support Section */}
      {onNavigateToSupport && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-slate-900/90 border border-emerald-800/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">
                {isFa
                  ? 'طراحی و تخمین تفصیلی سیستم نگهداری تجربی'
                  : 'Detailed Empirical Support System Design'}
              </h4>
              <p className="text-xs text-slate-400">
                {isFa
                  ? 'مشاهده مشخصات راک‌بولت، شاتکریت و قاب‌های فولادی بر اساس روش‌های ۵ گانه: RMR، Q، GSI، RQD و Russo 1998'
                  : 'Inspect rockbolts, shotcrete and steel ribs via 5 methods: RMR, Q, GSI, RQD & Russo 1998'}
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToSupport}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
          >
            <span>{isFa ? 'ورود به تخمین سیستم نگهداری' : 'Go to Support Estimation'}</span>
            <ArrowRight className={`w-4 h-4 ${isFa ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );
};
