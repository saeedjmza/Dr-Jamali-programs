import React, { useState } from 'react';
import {
  Layers,
  Zap,
  BookOpen,
  Award,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { QSupportDetailed } from '../../types';
import { FiberReinforcedQChart } from './FiberReinforcedQChart';

interface BartonSupportChartProps {
  currentQ: number;
  span: number;
  esr: number;
  supportDetailed: QSupportDetailed;
  onPointChange?: (newQ: number, newDe: number) => void;
  language: 'fa' | 'en';
}

export type ChartSourceMode =
  | 'fiber_bw' // Chart: Steel Fiber-reinforced shotcrete S(fr)
  | 'source_facsimile'; // Academic citations & references

export const BartonSupportChart: React.FC<BartonSupportChartProps> = ({
  currentQ,
  span,
  esr,
  supportDetailed,
  onPointChange,
  language,
}) => {
  const isFa = language === 'fa';
  const [sourceMode, setSourceMode] = useState<ChartSourceMode>('fiber_bw');

  const de = Number((span / esr).toFixed(2));
  const safeQ = Math.max(0.001, Math.min(1000, currentQ));

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Source Identification & Switcher Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-teal-500/30 shadow-2xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-teal-400">
              <Award className="w-5 h-5 text-teal-400" />
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                {isFa
                  ? 'نمودار مرجع سیستم نگهداری تجربی Q بارتون (شاتکریت مسلح به الیاف فولادی S(fr))'
                  : 'Barton Q-System Empirical Support Reference Chart (Fiber-Reinforced Shotcrete S(fr))'}
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {isFa
                ? 'نمودار مرجع تجربی گریمستاد و بارتون (NGI) بر مبنای شاتکریت مسلح به الیاف فولادی S(fr) و راک‌بولت، کالیبراسیون هندسی لگاریتمی دقیق، فواصل بولت‌زنی، ۹ رده نگهداری و قابلیت کلیک و تعامل روی تمام نقاط.'
                : 'Grimstad & Barton (NGI) empirical reference chart based on steel fiber-reinforced shotcrete S(fr) and rock bolting, calibrated with precise logarithmic geometry and full-area interactivity.'}
            </p>
          </div>

          {/* PRIMARY TAB CONTROLS */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 flex-wrap self-start md:self-center">
            <button
              onClick={() => setSourceMode('fiber_bw')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                sourceMode === 'fiber_bw'
                  ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="نمودار مرجع شاتکریت مسلح به الیاف فولادی S(fr)"
            >
              <Zap className="w-4 h-4" />
              <span>{isFa ? 'نمودار شاتکریت الیافی S(fr)' : 'Fiber S(fr) Support Chart'}</span>
            </button>

            <button
              onClick={() => setSourceMode('source_facsimile')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                sourceMode === 'source_facsimile'
                  ? 'bg-indigo-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="شناسنامه و اسناد مأخذ مقاله Grimstad & Barton"
            >
              <BookOpen className="w-4 h-4" />
              <span>{isFa ? 'اسناد مأخذ علمی' : 'Literature & Sources'}</span>
            </button>
          </div>
        </div>

        {/* ACTIVE CITATION BANNER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-300">
            <BookOpen className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span className="font-semibold text-slate-200">
              {sourceMode === 'fiber_bw'
                ? isFa
                  ? 'مأخذ نمودار: سیستم نگهداری شاتکریت الیاف فولادی S(fr) و بولت‌زنی NMT (راهنمای Grimstad & Barton / NGI)'
                  : 'Source: Steel Fiber Reinforced Shotcrete (Sfr) Support Plate (Grimstad & Barton / NGI)'
                : isFa
                ? 'فاکسیمیل و مشخصات کتابشناختی نشریات مؤسسه ژئوتکنیک نروژ (NGI)'
                : 'Facsimile and Bibliographic Metadata of NGI Publications'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 self-end sm:self-auto font-mono text-[11px]">
            <span>Q = <strong className="text-teal-300">{safeQ}</strong></span>
            <span>De = <strong className="text-sky-300">{de}m</strong></span>
            <span>L = <strong className="text-amber-300">{supportDetailed.boltLength}m</strong></span>
          </div>
        </div>

        {/* QUICK NUMERICAL OVERVIEW BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 font-mono">Q Value:</span>
            <span className="font-mono font-bold text-teal-300 text-sm">{safeQ}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">{isFa ? 'بعد معادل De:' : 'De (Span/ESR):'}</span>
            <span className="font-mono font-bold text-sky-300 text-sm">{de} m</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">{isFa ? 'طول راک‌بولت (L):' : 'Bolt Length L:'}</span>
            <span className="font-mono font-bold text-amber-300 text-sm">{supportDetailed.boltLength} m</span>
          </div>
          <div className="p-2.5 rounded-xl bg-teal-950/20 border border-teal-500/40 flex items-center justify-between">
            <span className="text-slate-400">{isFa ? 'رده نگهداری:' : 'Category:'}</span>
            <span className="font-bold text-teal-200 text-xs truncate max-w-[120px]" title={supportDetailed.categoryLabelFa}>
              رده {supportDetailed.category}
            </span>
          </div>
        </div>

        {/* FIBER SHOTCRETE SPECIFICATIONS SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1 border-t border-slate-800/80">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">{isFa ? 'ضخامت شاتکریت الیافی:' : 'S(fr) Thickness:'}</span>
            <span className="font-bold text-emerald-300 text-xs">
              {isFa ? supportDetailed.sfr.thicknessRangeFa : supportDetailed.sfr.thicknessRangeEn}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">{isFa ? 'فاصله راک‌بولت‌ها:' : 'Bolt Spacing:'}</span>
            <span className="font-bold text-sky-300 text-xs truncate max-w-[150px]" title={isFa ? supportDetailed.sfr.boltSpacingFa : supportDetailed.sfr.boltSpacingEn}>
              {isFa ? supportDetailed.sfr.boltSpacingFa : supportDetailed.sfr.boltSpacingEn}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">{isFa ? 'رده جذب انرژی:' : 'Energy Class:'}</span>
            <span className="font-bold text-amber-300 text-xs">
              {isFa ? supportDetailed.sfr.energyAbsorptionFa : supportDetailed.sfr.energyAbsorptionEn}
            </span>
          </div>
        </div>
      </div>

      {/* VIEW: FIBER-REINFORCED SHOTCRETE CHART */}
      {sourceMode === 'fiber_bw' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/95 border border-teal-500/30 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-teal-400" />
              <div>
                <h4 className="text-sm font-bold text-slate-100">
                  {isFa
                    ? 'نمودار سیستم نگهداری تجربی Q با شاتکریت مسلح به الیاف فولادی S(fr)'
                    : 'Q-System Support Plate: Steel Fiber-Reinforced Shotcrete S(fr)'}
                </h4>
                <div className="text-[11px] text-slate-400">
                  {isFa
                    ? 'ترسیم دقیق هندسی با خطوط کالیبره‌شده، عناوین فارسی محورها، فواصل بولت‌زنی، ضخامت شاتکریت الیافی و جدول ۹ کلاس نگهداری NGI'
                    : 'Calibrated logarithmic plotting, bolt spacing contours, S(fr) shotcrete thickness ranges, and 9 NGI support classes table.'}
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold self-start sm:self-auto font-mono border border-teal-500/30">
              Q={safeQ} | De={de}m
            </span>
          </div>

          {/* Render Fiber Chart */}
          <FiberReinforcedQChart
            currentQ={safeQ}
            de={de}
            boltLength={supportDetailed.boltLength}
            onPointChange={onPointChange}
            language={language}
          />
        </div>
      )}

      {/* VIEW: SCHOLARLY CITATIONS & FACSIMILES */}
      {sourceMode === 'source_facsimile' && (
        <div className="p-5 rounded-2xl bg-slate-900/95 border border-indigo-500/30 shadow-2xl space-y-5">
          <div className="flex items-center gap-2 text-indigo-400 border-b border-slate-800 pb-3">
            <BookOpen className="w-5 h-5" />
            <h4 className="text-base font-bold text-slate-100">
              {isFa
                ? 'شناسنامه و مشخصات مقالات مرجع مؤسسه ژئوتکنیک نروژ (NGI)'
                : 'Scholarly Citations & Primary Literature Documentation'}
            </h4>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[11px]">
                NGI REFERENCE PUBLICATION (1993 / 2002)
              </span>
              <span className="text-slate-400 text-[11px]">Norwegian Geotechnical Institute</span>
            </div>
            <h5 className="text-sm font-bold text-slate-100 leading-snug">
              Updating the Q-system for NMT (Grimstad & Barton, 1993)
            </h5>
            <div className="text-slate-400 space-y-1.5 text-[11px] leading-relaxed">
              <div><strong>نویسندگان / Authors:</strong> Einar Grimstad & Nick Barton</div>
              <div><strong>نشریه / Journal:</strong> Proceedings of the International Symposium on Sprayed Concrete, Fagernes, pp. 46–66.</div>
              <div><strong>مقاله تکمیلی / Follow-up:</strong> Barton, N. (2002). Some new Q-value correlations to assist in site investigation and tunnel design. International Journal of Rock Mechanics and Mining Sciences, 39(2), 185–216.</div>
              <div className="pt-2 text-slate-300 border-t border-slate-800">
                {isFa
                  ? 'این استاندارد مرجع، طراحی سیستم نگهداری توده‌سنگ بر پایه شاتکریت مسلح به الیاف فولادی S(fr) را تدوین نموده و با حذف خطرات و کندی ناشی از توری‌های مش، نگهداری با عملکرد ضربه‌ای و جذب انرژی بالا (E500 تا E1000) را مهیا می‌سازد.'
                  : 'This landmark standard establishes rock mass support design using steel fiber-reinforced shotcrete S(fr), replacing conventional wire mesh with high energy absorption and ductile support.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
