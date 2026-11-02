import React, { useState } from 'react';
import { HoekRockLoadResult } from '../../types';
import { calculateHoekCriticalSupportPressure } from '../../utils/rockLoadCalculation';
import { ShieldAlert, ShieldCheck, Activity, Sliders, CheckCircle2 } from 'lucide-react';

interface HoekRockLoadTabProps {
  depth: number;
  unitWeight: number;
  ucs: number;
  gsi: number;
  kRatio: number;
  frictionAngleDeg?: number;
  lang: 'fa' | 'en';
  onUpdateDepth?: (depth: number) => void;
  onUpdateUcs?: (ucs: number) => void;
  onUpdateGsi?: (gsi: number) => void;
  onUpdateKRatio?: (k: number) => void;
  onUpdateUnitWeight?: (gamma: number) => void;
  onUpdateFrictionAngle?: (phi: number) => void;
}

export const HoekRockLoadTab: React.FC<HoekRockLoadTabProps> = ({
  depth,
  unitWeight,
  ucs,
  gsi,
  kRatio,
  frictionAngleDeg,
  lang,
  onUpdateDepth,
  onUpdateUcs,
  onUpdateGsi,
  onUpdateKRatio,
  onUpdateUnitWeight,
  onUpdateFrictionAngle,
}) => {
  const isFa = lang === 'fa';
  const [localPhi, setLocalPhi] = useState<number | undefined>(frictionAngleDeg);

  const effectivePhi = frictionAngleDeg !== undefined ? frictionAngleDeg : localPhi;

  const result: HoekRockLoadResult = calculateHoekCriticalSupportPressure(
    depth,
    unitWeight,
    ucs,
    gsi,
    kRatio,
    effectivePhi
  );

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-purple-950/20 border border-purple-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Hoek (1999) - Eq. 6-6
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                {isFa ? 'فشار بحرانی نگهداری هوک برای جلوگیری از تسلیم توده‌سنگ (۱۹۹۹)' : 'Hoek (1999) Critical Support Pressure'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {isFa
                ? 'رابطه فرمول ۶-۶ هوک (۱۹۹۹) حداقل فشار نگهداری داخلی بحرانی (Pcr) لازم برای جلوگیری از شکست و تشکیل زون پلاستیک تسلیم‌یافته پیرامون تونل را بر اساس تنش هیدرواستاتیک برجا (Po)، مقاومت فشاری توده‌سنگ (σcm) و زاویه اصطکاک داخلی (φ) تعیین می‌کند.'
                : 'Hoek (1999) Eq. 6-6 defines the critical internal support pressure (Pcr) required to prevent failure and plastic yielding of rock mass surrounding the excavation based on far-field hydrostatic stress (Po), rock mass strength (σcm), and friction angle (φ).'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'فشار بحرانی (Pcr):' : 'Critical Pressure Pcr:'}</span>
              <span className={`text-lg font-mono font-bold ${result.requiresSupport ? 'text-rose-400' : 'text-emerald-400'}`}>
                {result.criticalPressurePcrMPa} MPa
              </span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'وضعیت الاستیک:' : 'State:'}</span>
              <span className={`text-xs font-bold ${result.requiresSupport ? 'text-amber-400' : 'text-emerald-400'}`}>
                {result.requiresSupport ? (isFa ? 'نیازمند نگهداری' : 'Yielding') : (isFa ? 'پایدار الاستیک' : 'Elastic')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Inputs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div>
          <label className="text-slate-400 block mb-1 font-medium">{isFa ? 'عمق روباره (H):' : 'Depth (H):'}</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="10"
              min="10"
              max="2500"
              value={depth}
              onChange={(e) => onUpdateDepth?.(Math.max(10, parseFloat(e.target.value) || 10))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-slate-200 text-sm focus:border-purple-500 focus:outline-none"
            />
            <span className="text-slate-400 font-mono text-xs">m</span>
          </div>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium">{isFa ? 'مقاومت تک‌محوری (UCS):' : 'Intact UCS:'}</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="5"
              min="1"
              max="350"
              value={ucs}
              onChange={(e) => onUpdateUcs?.(Math.max(1, parseFloat(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-slate-200 text-sm focus:border-purple-500 focus:outline-none"
            />
            <span className="text-slate-400 font-mono text-xs">MPa</span>
          </div>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium">{isFa ? 'شاخص GSI هوک:' : 'Hoek GSI:'}</label>
          <input
            type="number"
            step="1"
            min="5"
            max="100"
            value={gsi}
            onChange={(e) => onUpdateGsi?.(Math.max(5, Math.min(100, parseFloat(e.target.value) || 5)))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-slate-200 text-sm focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium">{isFa ? 'ضریب تنش برجا (K):' : 'In-situ Ratio (K):'}</label>
          <input
            type="number"
            step="0.1"
            min="0.2"
            max="3.5"
            value={kRatio}
            onChange={(e) => onUpdateKRatio?.(Math.max(0.2, parseFloat(e.target.value) || 1))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-slate-200 text-sm focus:border-purple-500 focus:outline-none"
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
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-slate-200 text-sm focus:border-purple-500 focus:outline-none"
            />
            <span className="text-slate-400 font-mono text-xs">kN/m³</span>
          </div>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium">{isFa ? 'زاویه اصطکاک φ (°):' : 'Friction φ (°):'}</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="1"
              min="15"
              max="65"
              value={effectivePhi !== undefined ? effectivePhi : result.frictionAngleDeg}
              onChange={(e) => {
                const val = Math.max(10, Math.min(65, parseFloat(e.target.value) || 30));
                setLocalPhi(val);
                onUpdateFrictionAngle?.(val);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-slate-200 text-sm focus:border-purple-500 focus:outline-none"
            />
            <span className="text-slate-400 font-mono text-xs">°</span>
          </div>
        </div>
      </div>

      {/* Main Formula Card (Formula 6-6 from Image 3) */}
      <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-purple-400 block">
              {isFa ? 'فرمول ۶-۶ هوک (۱۹۹۹) برای فشار بحرانی نگهداری (Critical Support Pressure):' : 'Hoek (1999) Eq. 6-6 for Critical Support Pressure:'}
            </span>
            <div className="font-mono text-sm sm:text-base text-slate-200 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 inline-block">
              P<sub>cr</sub> = (2 · P<sub>o</sub> - σ<sub>cm</sub>) / (1 + k) &nbsp;&nbsp;|&nbsp;&nbsp; k = (1 + sin φ) / (1 - sin φ)
            </div>
          </div>
          <div className="text-end">
            <span className="text-xs text-slate-400 block">{isFa ? 'فشار بحرانی Pcr:' : 'Critical Pressure Pcr:'}</span>
            <span className={`text-xl font-mono font-bold ${result.requiresSupport ? 'text-rose-400' : 'text-emerald-400'}`}>
              {result.criticalPressurePcrMPa} MPa <span className="text-sm font-normal text-slate-400">({result.criticalPressurePcrKPa} kPa)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Parameter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-slate-400 block text-[11px]">{isFa ? 'تنش هیدرواستاتیک برجا (Po):' : 'Hydrostatic Stress (Po):'}</span>
          <span className="text-lg font-mono font-bold text-slate-100 mt-1 block">{result.p0HydrostaticMPa} MPa</span>
          <span className="text-[10px] text-slate-400">Po = (1 + K)/2 · γ · H</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-slate-400 block text-[11px]">{isFa ? 'مقاومت تک‌محوری توده‌سنگ (σcm):' : 'Rock Mass Strength (σcm):'}</span>
          <span className="text-lg font-mono font-bold text-purple-300 mt-1 block">{result.sigmaCmMPa} MPa</span>
          <span className="text-[10px] text-slate-400">Hoek-Brown (2002) GSI={gsi}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-slate-400 block text-[11px]">{isFa ? 'زاویه اصطکاک توده‌سنگ (φ):' : 'Friction Angle (φ):'}</span>
          <span className="text-lg font-mono font-bold text-cyan-300 mt-1 block">{result.frictionAngleDeg}°</span>
          <span className="text-[10px] text-slate-400">Equivalent Mohr-Coulomb</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-slate-400 block text-[11px]">{isFa ? 'ضریب رانکین (k):' : 'Rankine Coefficient (k):'}</span>
          <span className="text-lg font-mono font-bold text-amber-300 mt-1 block">{result.rankineK}</span>
          <span className="text-[10px] text-slate-400">k = (1 + sin φ) / (1 - sin φ)</span>
        </div>
      </div>

      {/* Engineering Decision Banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
        result.requiresSupport
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
      }`}>
        {result.requiresSupport ? (
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
        ) : (
          <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
        )}
        <div className="text-xs space-y-1">
          <span className="font-bold block text-sm">
            {result.requiresSupport
              ? (isFa ? 'نیاز به اعمال فشار نگهداری داخلی (Pi ≥ Pcr) جهت کنترل زون پلاستیک' : 'Internal Support Pressure Required (Pi ≥ Pcr) to Halt Plastic Zone')
              : (isFa ? 'توده‌سنگ در محدوده الاستیک خودپایدار است (فاقد زون پلاستیک تسلیم‌یافته)' : 'Rock Mass Remains Self-Supporting in Elastic State')}
          </span>
          <p className="leading-relaxed text-slate-300">
            {isFa ? result.statusMessageFa : result.statusMessageEn}
          </p>
        </div>
      </div>
    </div>
  );
};
