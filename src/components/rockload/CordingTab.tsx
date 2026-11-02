import React, { useState } from 'react';
import { CordingRockLoadResult } from '../../types';
import { calculateCordingRockLoad } from '../../utils/rockLoadCalculation';
import { Layers, ShieldCheck, AlertCircle, Ruler, ArrowDownCircle } from 'lucide-react';

interface CordingTabProps {
  span: number;
  tunnelHeight?: number;
  unitWeight: number;
  rqd: number;
  lang: 'fa' | 'en';
  onUpdateSpan?: (span: number) => void;
  onUpdateTunnelHeight?: (height: number) => void;
  onUpdateRqd?: (rqd: number) => void;
  onUpdateUnitWeight?: (gamma: number) => void;
}

export const CordingTab: React.FC<CordingTabProps> = ({
  span,
  tunnelHeight: propHeight,
  unitWeight,
  rqd,
  lang,
  onUpdateSpan,
  onUpdateTunnelHeight,
  onUpdateRqd,
  onUpdateUnitWeight,
}) => {
  const isFa = lang === 'fa';
  const [localHeight, setLocalHeight] = useState<number>(propHeight ?? span);
  const effectiveHeight = propHeight !== undefined ? propHeight : localHeight;

  const result: CordingRockLoadResult = calculateCordingRockLoad(
    span,
    effectiveHeight,
    unitWeight,
    rqd
  );

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950/20 border border-blue-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                Cording et al. (1971)
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                {isFa ? 'برآورد فشار بار سنگ و طول راک‌بولت به روش کوردینگ (۱۹۷۱)' : 'Cording et al. Rock Load & Bolt Length (1971)'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {isFa
                ? 'روش تجربی کوردینگ و همکاران (۱۹۷۱) بر مبنای تاریخچه موارد واقعی حفاری‌های زیرزمینی، فشار نگهداری سقف و دیواره و طول بهینه راک‌بولت‌ها را بر اساس ابعاد دهانه (B) و ارتفاع تونل (H) و کیفیت RQD برآورد می‌کند.'
                : 'Cording et al. (1971) compilation provides empirical roof and sidewall support pressures and rock bolt lengths based on excavation width (B), height (H), and RQD quality.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'فشار سقف (P_crown):' : 'Crown Pressure:'}</span>
              <span className="text-lg font-mono font-bold text-blue-400">{result.pCrownKPa} kPa</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'طول بولت سقف:' : 'Crown Bolt Length:'}</span>
              <span className="text-lg font-mono font-bold text-amber-400">{result.crownBoltLength} m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Geometry and Input Quick Adjusters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div>
          <label className="text-slate-400 block mb-1 font-medium">
            {isFa ? 'عرض دهانه (B):' : 'Tunnel Width (B):'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.5"
              min="1"
              max="25"
              value={span}
              onChange={(e) => onUpdateSpan?.(Math.max(1, parseFloat(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-slate-200 text-sm focus:border-blue-500 focus:outline-none"
            />
            <span className="text-slate-400 font-mono">m</span>
          </div>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium">
            {isFa ? 'ارتفاع بازشدگی (H):' : 'Excavation Height (H):'}
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
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-slate-200 text-sm focus:border-blue-500 focus:outline-none"
            />
            <span className="text-slate-400 font-mono">m</span>
          </div>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium">
            {isFa ? 'شاخص کیفیت مغزه (RQD):' : 'Rock Quality (RQD):'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              value={rqd}
              onChange={(e) => onUpdateRqd?.(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-slate-200 text-sm focus:border-blue-500 focus:outline-none"
            />
            <span className="text-slate-400 font-mono">%</span>
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
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-slate-200 text-sm focus:border-blue-500 focus:outline-none"
            />
            <span className="text-slate-400 font-mono">kN/m³</span>
          </div>
        </div>
      </div>

      {/* RQD Rule Banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
        result.isHighRqdReduction
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
      }`}>
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold block">
            {isFa ? 'شرط ویژه کیفیت سنگ در روش کوردینگ (RQD > 75% Rule):' : 'Cording et al. Special RQD Rule (> 75%):'}
          </span>
          <p className="leading-relaxed">
            {isFa
              ? 'طبق گزارش کوردینگ (۱۹۷۱)، در سنگ‌های با RQD بزرگتر از ۷۵٪، فشار نگهداری دیواره به صورت معمول بسیار کمتر (اغلب صفر) بوده و تنها نصب بولت‌های موردی (Spot Bolts) جهت مهار گوه‌های منفرد آشکار مورد نیاز خواهد بود.'
              : 'In rock with an RQD greater than 75%, it is expected that the sidewall pressure typically will be smaller (often zero) and only spot bolts to hold obvious wedges will be required.'}
          </p>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Crown Section */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
              <ArrowDownCircle className="w-4 h-4" />
              <span>{isFa ? 'نگهداری و بار سقف (Crown)' : 'Crown Support & Rock Load'}</span>
            </h4>
            <span className="text-xs font-mono bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">
              Hp = 0.3B
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">{isFa ? 'ارتفاع بار سست سنگ در سقف:' : 'Crown Rock Load Height:'}</span>
              <span className="font-mono font-bold text-slate-100 text-sm">
                0.3 × {span} = <strong className="text-blue-400">{result.hpCrown} m</strong>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">{isFa ? 'فشار بار قائم سقف (P_crown):' : 'Crown Support Pressure:'}</span>
              <div className="text-end">
                <span className="font-mono font-bold text-emerald-400 text-base block">{result.pCrownKPa} kPa</span>
                <span className="font-mono text-[10px] text-slate-400">({result.pCrownMPa} MPa)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-400">{isFa ? 'طول راک‌بولت سقف (0.33B):' : 'Crown Bolt Length (0.33B):'}</span>
              </div>
              <span className="font-mono font-bold text-amber-400 text-sm">
                0.33 × {span} = <strong>{result.crownBoltLength} m</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Sidewall Section */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{isFa ? 'نگهداری و بار دیواره‌ها (Sidewall)' : 'Sidewall Support & Rock Load'}</span>
            </h4>
            <span className="text-xs font-mono bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20">
              Hp = 0.15H
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">{isFa ? 'ارتفاع معادل بار دیواره:' : 'Sidewall Load Height:'}</span>
              <span className="font-mono font-bold text-slate-100 text-sm">
                {result.isHighRqdReduction ? (
                  <span className="text-emerald-400">{isFa ? '۰ (به دلیل RQD > ۷۵٪)' : '0 (Due to RQD > 75%)'}</span>
                ) : (
                  <span>0.15 × {effectiveHeight} = <strong className="text-cyan-400">{result.hpSidewall} m</strong></span>
                )}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">{isFa ? 'فشار جانبی دیواره (P_sidewall):' : 'Sidewall Support Pressure:'}</span>
              <div className="text-end">
                <span className="font-mono font-bold text-cyan-400 text-base block">{result.pSidewallKPa} kPa</span>
                <span className="font-mono text-[10px] text-slate-400">({result.pSidewallMPa} MPa)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-400">{isFa ? 'طول راک‌بولت دیواره (0.33H):' : 'Sidewall Bolt Length (0.33H):'}</span>
              </div>
              <span className="font-mono font-bold text-amber-400 text-sm">
                0.33 × {effectiveHeight} = <strong>{result.sidewallBoltLength} m</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
