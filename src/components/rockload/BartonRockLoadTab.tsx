import React, { useState } from 'react';
import { BartonRockLoadResult } from '../../types';
import { calculateBartonRockLoad } from '../../utils/rockLoadCalculation';
import { Cpu, Ruler, Shield, Layers, HelpCircle } from 'lucide-react';

interface BartonRockLoadTabProps {
  qValue: number;
  span: number;
  tunnelHeight?: number;
  esr: number;
  unitWeight: number;
  jointSets: number; // Jn
  jr?: number; // Jr
  lang: 'fa' | 'en';
  onUpdateSpan?: (span: number) => void;
  onUpdateTunnelHeight?: (height: number) => void;
  onUpdateQValue?: (q: number) => void;
  onUpdateEsr?: (esr: number) => void;
  onUpdateUnitWeight?: (gamma: number) => void;
  onUpdateJointSets?: (jn: number) => void;
  onUpdateJr?: (jr: number) => void;
}

export const BartonRockLoadTab: React.FC<BartonRockLoadTabProps> = ({
  qValue,
  span,
  tunnelHeight,
  esr,
  unitWeight,
  jointSets,
  jr: propJr,
  lang,
  onUpdateSpan,
  onUpdateTunnelHeight,
  onUpdateQValue,
  onUpdateEsr,
  onUpdateUnitWeight,
  onUpdateJointSets,
  onUpdateJr,
}) => {
  const isFa = lang === 'fa';

  // Jn from jointSets (default 9 or user value)
  const [localJn, setLocalJn] = useState<number>(jointSets > 0 ? jointSets : 9);
  const effectiveJn = jointSets > 0 ? jointSets : localJn;

  // Jr joint roughness coefficient (default 1.5 or 2.0)
  const [localJr, setLocalJr] = useState<number>(propJr ?? 2.0);
  const effectiveJr = propJr !== undefined ? propJr : localJr;

  const result: BartonRockLoadResult = calculateBartonRockLoad(
    qValue,
    effectiveJn,
    effectiveJr,
    esr,
    span,
    unitWeight
  );

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/20 border border-emerald-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Grimstad & Barton (1993)
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                {isFa ? 'فشار بار سنگ و نگهداری بر اساس سیستم Q بارتون و گریمستاد' : 'Barton & Grimstad Q Support Pressure (1993)'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {isFa
                ? 'روابط فرمول ۶-۳ تا ۶-۵ بارتون (۱۹۸۰) و گریمستاد-بارتون (۱۹۹۳) برای برآورد فشار دائمی سقف تونل (Proof)، طول راک‌بولت‌ها و حداکثر دهانه بدون نگهداری بر مبنای ضریب Q، ضریب Jn و زبری Jr.'
                : 'Barton et al. (1980) and Grimstad & Barton (1993) empirical formulas (6-3 to 6-5) for permanent roof support pressure (Proof), bolt length (L), and maximum unsupported span.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'فشار سقف (Proof):' : 'Roof Pressure:'}</span>
              <span className="text-lg font-mono font-bold text-emerald-400">{result.pRoofMPa} MPa</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'طول راک‌بولت (L):' : 'Bolt Length:'}</span>
              <span className="text-lg font-mono font-bold text-teal-400">{result.boltLengthL} m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inputs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div>
          <label className="text-slate-400 block mb-1 font-medium">Q (Barton):</label>
          <input
            type="number"
            step="0.1"
            min="0.001"
            max="1000"
            value={qValue}
            onChange={(e) => onUpdateQValue?.(Math.max(0.001, parseFloat(e.target.value) || 1))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium">{isFa ? 'تعداد درزه (Jn):' : 'Joint Set (Jn):'}</label>
          <input
            type="number"
            step="1"
            min="0.5"
            max="20"
            value={effectiveJn}
            onChange={(e) => {
              const val = Math.max(0.5, parseFloat(e.target.value) || 1);
              setLocalJn(val);
              onUpdateJointSets?.(val);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium">{isFa ? 'زبری درزه (Jr):' : 'Roughness (Jr):'}</label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            max="4"
            value={effectiveJr}
            onChange={(e) => {
              const val = Math.max(0.5, parseFloat(e.target.value) || 1);
              setLocalJr(val);
              onUpdateJr?.(val);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium">{isFa ? 'دهانه تونل (B):' : 'Span (B):'}</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.5"
              min="1"
              max="25"
              value={span}
              onChange={(e) => onUpdateSpan?.(Math.max(1, parseFloat(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <span className="text-slate-400 font-mono text-xs">m</span>
          </div>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium">{isFa ? 'ضریب کاربری (ESR):' : 'Support Ratio (ESR):'}</label>
          <input
            type="number"
            step="0.1"
            min="0.5"
            max="5"
            value={esr}
            onChange={(e) => onUpdateEsr?.(Math.max(0.5, parseFloat(e.target.value) || 1))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium">{isFa ? 'وزن مخصوص (γ):' : 'Unit Weight (γ):'}</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.5"
              min="15"
              max="35"
              value={unitWeight}
              onChange={(e) => onUpdateUnitWeight?.(Math.max(10, parseFloat(e.target.value) || 25))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <span className="text-slate-400 font-mono text-xs">kN/m³</span>
          </div>
        </div>
      </div>

      {/* Main Formula Card (Formula 6-5 from Image 2) */}
      <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-400 block">
              {isFa ? 'رابطه فشار دائمی سقف گریمستاد و بارتون (۱۹۹۳) - فرمول ۶-۵:' : 'Grimstad & Barton (1993) Roof Support Pressure (Eq. 6-5):'}
            </span>
            <div className="font-mono text-sm sm:text-base text-slate-200 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 inline-block">
              P<sub>roof</sub> (MPa) = (2 · √J<sub>n</sub> · Q<sup>-1/3</sup>) / (3 · J<sub>r</sub>)
            </div>
          </div>
          <div className="text-end">
            <span className="text-xs text-slate-400 block">{isFa ? 'فشار سقف محاسبه‌شده:' : 'Calculated Roof Pressure:'}</span>
            <span className="text-xl font-mono font-bold text-emerald-300">
              {result.pRoofMPa} MPa <span className="text-sm font-normal text-slate-400">({result.pRoofKPa} kPa)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Results 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Roof Pressure & Equivalent Rock Load */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-2">
            <Layers className="w-4 h-4" />
            <span>{isFa ? 'فشار و بار معادل سقف (Roof)' : 'Roof Pressure & Rock Load'}</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">P<sub>roof</sub> (MPa):</span>
              <span className="font-mono font-bold text-emerald-300 text-sm">{result.pRoofMPa} MPa</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">P<sub>roof</sub> (kPa):</span>
              <span className="font-mono font-bold text-emerald-300 text-sm">{result.pRoofKPa} kPa</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">{isFa ? 'ارتفاع معادل بار سنگ (Hp):' : 'Equivalent Load Height (Hp):'}</span>
              <span className="font-mono font-bold text-amber-400 text-sm">{result.hpEquivalentM} m</span>
            </div>
          </div>
        </div>

        {/* Card 2: Wall Pressure */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm border-b border-slate-800 pb-2">
            <Shield className="w-4 h-4" />
            <span>{isFa ? 'فشار دیواره‌ها (Wall Pressure)' : 'Wall Support Pressure'}</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">{isFa ? 'شاخص Q اصلاح‌شده دیواره (Qwall):' : 'Adjusted Wall Q (Qwall):'}</span>
              <span className="font-mono font-bold text-teal-300 text-sm">{result.qWall}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">P<sub>wall</sub> (MPa):</span>
              <span className="font-mono font-bold text-teal-300 text-sm">{result.pWallMPa} MPa</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">P<sub>wall</sub> (kPa):</span>
              <span className="font-mono font-bold text-teal-300 text-sm">{result.pWallKPa} kPa</span>
            </div>
          </div>
        </div>

        {/* Card 3: Rock Bolt Length & Max Span (Formulas 6-3 & 6-4) */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm border-b border-slate-800 pb-2">
            <Ruler className="w-4 h-4" />
            <span>{isFa ? 'طول راک‌بولت و دهانه خودایستا' : 'Bolt Length & Max Span'}</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isFa ? 'طول بولت L (فرمول ۶-۳):' : 'Bolt Length L (Eq. 6-3):'}</span>
                <span className="font-mono font-bold text-amber-300 text-sm">{result.boltLengthL} m</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">L = (2 + 0.15 · B) / ESR</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isFa ? 'حداکثر دهانه خودایستا (فرمول ۶-۴):' : 'Max Unsupported Span (Eq. 6-4):'}</span>
                <span className="font-mono font-bold text-teal-300 text-sm">{result.maxUnsupportedSpan} m</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">Span = 2 · ESR · Q^0.4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Assessment Message */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
        <span className="font-bold text-slate-300 block mb-1">
          {isFa ? 'تحلیل مهندسی بارتون:' : 'Barton Engineering Assessment:'}
        </span>
        <p className="text-slate-400 leading-relaxed">
          {isFa ? result.statusFa : result.statusEn}
        </p>
      </div>
    </div>
  );
};
