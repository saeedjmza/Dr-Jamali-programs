import React, { useState } from 'react';
import { TerzaghiRockConditionKey, TerzaghiRockLoadResult } from '../../types';
import { TERZAGHI_CONDITIONS, calculateTerzaghiRockLoad } from '../../utils/rockLoadCalculation';
import { Layers, Info, CheckCircle2, Sliders, ArrowDownCircle, ArrowLeftRight } from 'lucide-react';

interface TerzaghiTabProps {
  span: number;
  tunnelHeight?: number;
  unitWeight: number;
  rmr: number;
  rqd: number;
  depth: number;
  ucs: number;
  lang: 'fa' | 'en';
  onUpdateSpan?: (span: number) => void;
  onUpdateTunnelHeight?: (height: number) => void;
  onUpdateUnitWeight?: (gamma: number) => void;
  onUpdateDepth?: (depth: number) => void;
  onUpdateUcs?: (ucs: number) => void;
  onUpdateRqd?: (rqd: number) => void;
  onUpdateRmr?: (rmr: number) => void;
}

export const TerzaghiTab: React.FC<TerzaghiTabProps> = ({
  span,
  tunnelHeight: propHeight,
  unitWeight,
  rmr,
  rqd,
  depth,
  ucs,
  lang,
  onUpdateSpan,
  onUpdateTunnelHeight,
  onUpdateUnitWeight,
  onUpdateDepth,
  onUpdateUcs,
  onUpdateRqd,
  onUpdateRmr,
}) => {
  const isFa = lang === 'fa';

  // Tunnel height Ht: use prop when provided, fallback to local state
  const [localHeight, setLocalHeight] = useState<number>(propHeight ?? span);
  const effectiveHeight = propHeight !== undefined ? propHeight : localHeight;

  const [selectedCondition, setSelectedCondition] = useState<TerzaghiRockConditionKey>(() => {
    if (rmr >= 85 && rqd >= 90) return 'hard_intact';
    if (rmr >= 70 && rqd >= 75) return 'massive_moderately_jointed';
    if (rmr >= 55 && rqd >= 50) return 'moderately_blocky_seamy';
    if (rmr >= 35 && rqd >= 25) return 'very_blocky_seamy';
    if (rmr < 35 && rqd < 25) return 'completely_crushed';
    return 'moderately_blocky_seamy';
  });

  const result: TerzaghiRockLoadResult = calculateTerzaghiRockLoad(
    selectedCondition,
    span,
    effectiveHeight,
    unitWeight
  );

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-amber-950/20 border border-amber-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Table 6-8 Terzaghi (1946)
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                {isFa ? 'برآورد بار سنگ به روش ترزاقی (۱۹۴۶)' : 'Terzaghi Rock Load Estimation (1946)'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {isFa
                ? 'روش کلاسیک ترزاقی بر اساس طبقه‌بندی کیفی وضعیت سنگ و هندسه مقطع تونل (عرض B و ارتفاع Ht)، ارتفاع بار سست سنگ (Hp) و فشار ناشی از آن (Pv = γ · Hp) بر سیستم نگهداری را تخمین می‌زند.'
                : 'Terzaghi classic empirical method calculates rock load height (Hp) and resulting vertical rock pressure (Pv = γ · Hp) based on rock condition, tunnel span (B), and height (Ht).'}
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 shrink-0 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'ارتفاع میانگین بار (Hp):' : 'Avg Rock Load Hp:'}</span>
              <span className="text-lg font-mono font-bold text-amber-400">{result.hpAvg} m</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'فشار قائم میانگین (Pv):' : 'Avg Vertical Pressure:'}</span>
              <span className="text-lg font-mono font-bold text-emerald-400">{result.pvAvgKPa} kPa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Geometry and Input Quick Adjusters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div>
          <label className="text-slate-400 block mb-1 font-medium">
            {isFa ? 'عرض دهانه تونل (B):' : 'Tunnel Span / Width (B):'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.5"
              min="1"
              max="25"
              value={span}
              onChange={(e) => onUpdateSpan?.(Math.max(1, parseFloat(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
            />
            <span className="text-slate-400 font-mono">m</span>
          </div>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium">
            {isFa ? 'ارتفاع مقطع تونل (Ht):' : 'Tunnel Height (Ht):'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.5"
              min="1"
              max="25"
              value={effectiveHeight}
              onChange={(e) => {
                const val = Math.max(1, parseFloat(e.target.value) || 1);
                setLocalHeight(val);
                onUpdateTunnelHeight?.(val);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
            />
            <span className="text-slate-400 font-mono">m</span>
          </div>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium">
            {isFa ? 'وزن مخصوص سنگ (γ):' : 'Rock Unit Weight (γ):'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.5"
              min="15"
              max="35"
              value={unitWeight}
              onChange={(e) => onUpdateUnitWeight?.(Math.max(10, parseFloat(e.target.value) || 25))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
            />
            <span className="text-slate-400 font-mono">kN/m³</span>
          </div>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium">
            {isFa ? 'عمق روباره (H):' : 'Overburden Depth (H):'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="10"
              min="10"
              max="3000"
              value={depth}
              onChange={(e) => onUpdateDepth?.(Math.max(1, parseFloat(e.target.value) || 10))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
            />
            <span className="text-slate-400 font-mono">m</span>
          </div>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium">
            {isFa ? 'مقاومت فشاری (UCS):' : 'Intact UCS:'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="5"
              min="1"
              max="400"
              value={ucs}
              onChange={(e) => onUpdateUcs?.(Math.max(1, parseFloat(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
            />
            <span className="text-slate-400 font-mono">MPa</span>
          </div>
        </div>
      </div>

      {/* Rock Condition Selector (Table 6-8 Classes) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>{isFa ? 'انتخاب وضعیت سنگ بر اساس جدول ۶-۸ ترزاقی:' : 'Select Rock Condition (Table 6-8):'}</span>
          </label>
          <span className="text-xs text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {isFa ? `پیش‌فرض بر اساس RMR=${rmr} و RQD=${rqd}%` : `Synced with RMR=${rmr}, RQD=${rqd}%`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {Object.values(TERZAGHI_CONDITIONS).map((cond) => {
            const isSelected = cond.key === selectedCondition;
            return (
              <button
                key={cond.key}
                type="button"
                onClick={() => setSelectedCondition(cond.key)}
                className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/40'
                    : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-200">
                      {cond.code}. {isFa ? cond.nameFa : cond.nameEn}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-amber-300/90 font-medium">
                    {isFa ? cond.hpFormulaFa : cond.hpFormulaEn}
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-400 line-clamp-2">
                  {isFa ? cond.remarksFa : cond.remarksEn}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Calculation Results & Terzaghi Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Pressure & Height Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
            <span>{isFa ? 'نتایج بار قائم و جانبی سست سنگ' : 'Vertical & Lateral Rock Loading Results'}</span>
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">{isFa ? 'ارتفاع بار حداقل (Hp,min):' : 'Min Rock Load Height:'}</span>
              <span className="text-base font-mono font-bold text-slate-200 mt-0.5 block">{result.hpMin} m</span>
              <span className="text-[10px] text-slate-400">{result.pvMinKPa} kPa</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">{isFa ? 'ارتفاع بار حداکثر (Hp,max):' : 'Max Rock Load Height:'}</span>
              <span className="text-base font-mono font-bold text-slate-200 mt-0.5 block">{result.hpMax} m</span>
              <span className="text-[10px] text-slate-400">{result.pvMaxKPa} kPa</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-emerald-400 text-[11px] font-bold block">
                    {isFa ? 'فشار بار قائم مبنای طراحی (Pv,avg):' : 'Design Vertical Rock Pressure (Pv,avg):'}
                  </span>
                  <span className="text-xl font-mono font-bold text-emerald-300 mt-0.5 block">
                    {result.pvAvgKPa} kPa <span className="text-xs text-emerald-400/80 font-normal">({result.pvAvgMPa} MPa)</span>
                  </span>
                </div>
                <div className="text-end">
                  <span className="text-[10px] text-slate-400 block">{isFa ? 'ارتفاع میانگین (Hp):' : 'Avg Height:'}</span>
                  <span className="text-sm font-mono font-bold text-slate-200">{result.hpAvg} m</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-cyan-400 text-[11px] font-bold flex items-center gap-1">
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>{isFa ? 'فشار جانبی دیواره‌ها (Ph = Kh · Pv):' : 'Sidewall Lateral Pressure (Ph = Kh · Pv):'}</span>
                  </span>
                  <span className="text-lg font-mono font-bold text-cyan-300 mt-0.5 block">
                    {result.phAvgKPa} kPa <span className="text-xs text-cyan-400/80 font-normal">({result.phAvgMPa} MPa)</span>
                  </span>
                </div>
                <div className="text-end">
                  <span className="text-[10px] text-slate-400 block">{isFa ? 'ضریب فشار جانبی (Kh):' : 'Lateral Coeff (Kh):'}</span>
                  <span className="text-xs font-mono font-bold text-slate-200">{result.sidePressureRatioKh}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 mt-1.5 pt-1.5 border-t border-cyan-500/20">
                {isFa ? result.condition.sidePressureNoteFa : result.condition.sidePressureNoteEn}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Terzaghi Engineering Guidance & Lining Notes */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Info className="w-4 h-4 text-amber-400" />
            <span>{isFa ? 'دستورالعمل و توصیه‌های تجربی ترزاقی' : 'Terzaghi Empirical Remarks & Lining'}</span>
          </h4>

          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-amber-400 font-bold block mb-1">
                {isFa ? 'توصیه اجرایی سیستم نگهداری (Remarks):' : 'Support Recommendations (Remarks):'}
              </span>
              <p className="text-slate-300 leading-relaxed">
                {isFa ? result.condition.remarksFa : result.condition.remarksEn}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <span className="text-slate-400 font-bold block">
                {isFa ? 'فرمول‌های محاسبه ارتفاع بار سنگ (جدول ۶-۸):' : 'Rock Load Height Formulation (Table 6-8):'}
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 font-mono text-[11px]">
                <li>{isFa ? 'رده انتخابی:' : 'Selected Class:'} {result.condition.code} ({result.condition.nameEn})</li>
                <li>{isFa ? 'فرمول رابطه:' : 'Formula:'} {result.condition.hpFormulaFa}</li>
                <li>B = {span} m | Ht = {effectiveHeight} m | γ = {unitWeight} kN/m³</li>
                <li>B + Ht = {(span + effectiveHeight).toFixed(1)} m</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
