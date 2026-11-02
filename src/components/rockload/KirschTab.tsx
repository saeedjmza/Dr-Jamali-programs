import React, { useState } from 'react';
import { KirschStressResult } from '../../types';
import { calculateKirschStresses } from '../../utils/rockLoadCalculation';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Compass,
  ArrowUpDown,
  Link2,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface KirschTabProps {
  span: number;
  tunnelHeight?: number;
  depth: number;
  unitWeight: number;
  kRatio: number;
  ucs: number;
  gsi: number;
  sigmaCm?: number; // Linked rock mass compressive strength from GSI (Hoek-Brown)
  frictionAngleDeg?: number; // Linked friction angle from GSI (Hoek-Brown equiv MC)
  cohesionMPa?: number; // Linked cohesion from GSI (Hoek-Brown equiv MC)
  mi?: number;
  dFactor?: number;
  lang: 'fa' | 'en';
  onUpdateSpan?: (span: number) => void;
  onUpdateTunnelHeight?: (height: number) => void;
  onUpdateDepth?: (depth: number) => void;
  onUpdateKRatio?: (k: number) => void;
  onUpdateUcs?: (ucs: number) => void;
  onUpdateUnitWeight?: (gamma: number) => void;
  onUpdateGsi?: (gsi: number) => void;
}

export const KirschTab: React.FC<KirschTabProps> = ({
  span,
  tunnelHeight,
  depth,
  unitWeight,
  kRatio,
  ucs,
  gsi,
  sigmaCm,
  frictionAngleDeg,
  cohesionMPa,
  mi = 12,
  dFactor = 0.0,
  lang,
  onUpdateSpan,
  onUpdateTunnelHeight,
  onUpdateDepth,
  onUpdateKRatio,
  onUpdateUcs,
  onUpdateUnitWeight,
  onUpdateGsi,
}) => {
  const isFa = lang === 'fa';

  // State to manage whether the parameters are strictly locked to GSI results or temporarily overridden
  const [isLinkedToGsi, setIsLinkedToGsi] = useState<boolean>(true);
  const [customSigmaCm, setCustomSigmaCm] = useState<number | null>(null);
  const [customFriction, setCustomFriction] = useState<number | null>(null);

  // Active values passed to Kirsch calculation
  const activeSigmaCm = !isLinkedToGsi && customSigmaCm !== null ? customSigmaCm : sigmaCm;
  const activeFrictionAngle = !isLinkedToGsi && customFriction !== null ? customFriction : frictionAngleDeg;

  const result: KirschStressResult = calculateKirschStresses(
    span,
    depth,
    unitWeight,
    kRatio,
    ucs,
    gsi,
    activeSigmaCm,
    activeFrictionAngle,
    cohesionMPa,
    mi,
    dFactor
  );

  const handleResetToGsi = () => {
    setIsLinkedToGsi(true);
    setCustomSigmaCm(null);
    setCustomFriction(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-pink-950/20 border border-pink-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40">
                Kirsch (1898)
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                {isFa ? 'روابط تحلیلی توزیع تنش الاستیک کرش (Kirsch Equations)' : 'Kirsch (1898) Analytical Elastic Stresses'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {isFa
                ? 'حل کلاسیک و دقیق کرش برای توزیع تنش‌های مماسی (σθ) و شعاعی (σr) پیرامون بازشدگی دایره‌ای با انطباق مستقیم بر مقاومت توده‌سنگ (σcm) و زاویه اصطکاک (φ\') استخراج‌شده از روش GSI و هوک-براون.'
                : 'Kirsch classic exact analytical solution for tangential (σθ) and radial (σr) stresses around circular openings, directly integrated with GSI-derived rock mass strength (σcm) and friction angle (φ\').'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'تنش تاج (Roof):' : 'Crown Stress:'}</span>
              <span className={`text-lg font-mono font-bold ${result.hasRoofTension ? 'text-rose-400' : 'text-pink-400'}`}>
                {result.sigmaThetaRoof} MPa
              </span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'تنش دیواره (Wall):' : 'Wall Stress:'}</span>
              <span className={`text-lg font-mono font-bold ${result.hasWallTension ? 'text-rose-400' : 'text-cyan-400'}`}>
                {result.sigmaThetaWall} MPa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Geometry & In-Situ Stress Inputs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div>
          <label className="text-slate-400 block mb-1 font-medium">{isFa ? 'دهانه حفاری (B):' : 'Tunnel Span (B):'}</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.5"
              min="1"
              max="25"
              value={span}
              onChange={(e) => onUpdateSpan?.(Math.max(1, parseFloat(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-slate-200 text-sm focus:border-pink-500 focus:outline-none"
            />
            <span className="text-slate-400 font-mono text-xs">m</span>
          </div>
        </div>

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
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-slate-200 text-sm focus:border-pink-500 focus:outline-none"
            />
            <span className="text-slate-400 font-mono text-xs">m</span>
          </div>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium">{isFa ? 'ضریب تنش برجا (K):' : 'In-situ Ratio (K):'}</label>
          <input
            type="number"
            step="0.05"
            min="0.1"
            max="4.0"
            value={kRatio}
            onChange={(e) => onUpdateKRatio?.(Math.max(0.1, parseFloat(e.target.value) || 1))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-slate-200 text-sm focus:border-pink-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium flex items-center justify-between">
            <span>{isFa ? 'مقاومت تک‌محوری (UCS):' : 'Intact UCS:'}</span>
            <span className="text-[9px] text-amber-400 font-mono">σci</span>
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="5"
              min="1"
              max="350"
              value={ucs}
              onChange={(e) => onUpdateUcs?.(Math.max(1, parseFloat(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-amber-500/40 rounded-lg px-2 py-1.5 font-mono text-amber-300 font-bold text-sm focus:border-amber-400 focus:outline-none"
            />
            <span className="text-slate-400 font-mono text-xs">MPa</span>
          </div>
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
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-slate-200 text-sm focus:border-pink-500 focus:outline-none"
            />
            <span className="text-slate-400 font-mono text-xs">kN/m³</span>
          </div>
        </div>
      </div>

      {/* NEW DEDICATED SECTION: GSI-LINKED ROCK MASS PARAMETERS (σcm, φ', c', kp) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Link2 className="w-4 h-4 text-purple-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-100">
                  {isFa ? 'پارامترهای مقاومتی توده‌سنگ لینک‌شده از روش GSI و هوک-براون' : 'GSI & Hoek-Brown Linked Rock Mass Parameters'}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  GSI = {gsi} | UCS = {ucs} MPa
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFa
                  ? 'مقاومت فشاری توده‌سنگ (σcm) و زاویه اصطکاک داخلی (φ\') مستقیماً از محاسبات تب GSI لینک شده‌اند.'
                  : 'Rock mass compressive strength (σcm) and friction angle (φ\') are directly synchronized from the GSI estimation tab.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {isLinkedToGsi ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isFa ? 'لینک خودکار فعال است' : 'Active GSI Link'}</span>
              </span>
            ) : (
              <button
                onClick={handleResetToGsi}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isFa ? 'بازنشانی به مقادیر محاسبه‌شده GSI' : 'Reset to GSI Values'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Rock Mass Compressive Strength (σcm) */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                <span>{isFa ? 'مقاومت فشاری توده‌سنگ (σcm):' : 'Rock Mass Strength (σcm):'}</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                {isLinkedToGsi ? (isFa ? 'از GSI' : 'GSI Linked') : (isFa ? 'دستی' : 'Manual')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.1"
                min="0.05"
                max="200"
                value={result.sigmaCm}
                onChange={(e) => {
                  setIsLinkedToGsi(false);
                  setCustomSigmaCm(Math.max(0.01, parseFloat(e.target.value) || 1));
                }}
                className="w-full bg-slate-900 border border-purple-500/40 rounded-lg px-2 py-1 font-mono text-purple-300 font-bold text-base focus:border-purple-400 focus:outline-none"
              />
              <span className="text-slate-400 font-mono text-xs">MPa</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              {isFa ? 'بر پایه معیار تعمیم‌یافته هوک و براون ۲۰۰۲' : 'Generalized Hoek-Brown (2002)'}
            </span>
          </div>

          {/* Card 2: Rock Mass Friction Angle (phi') */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isFa ? 'زاویه اصطکاک توده‌سنگ (φ\'):' : 'Friction Angle (φ\'):'}</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                {isLinkedToGsi ? (isFa ? 'از GSI' : 'GSI Linked') : (isFa ? 'دستی' : 'Manual')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.5"
                min="5"
                max="65"
                value={result.frictionAngleDeg}
                onChange={(e) => {
                  setIsLinkedToGsi(false);
                  setCustomFriction(Math.max(5, parseFloat(e.target.value) || 20));
                }}
                className="w-full bg-slate-900 border border-indigo-500/40 rounded-lg px-2 py-1 font-mono text-indigo-300 font-bold text-base focus:border-indigo-400 focus:outline-none"
              />
              <span className="text-slate-400 font-mono text-xs">درجه (°)</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              {isFa ? 'زاویه اصطکاک معادل موهر-کولمب' : 'Equivalent Mohr-Coulomb friction'}
            </span>
          </div>

          {/* Card 3: Rock Mass Cohesion (c') */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">
                {isFa ? 'چسبندگی توده‌سنگ (c\'):' : 'Rock Mass Cohesion (c\'):'}
              </span>
              <span className="font-mono text-teal-400 font-bold">{result.cohesionMPa} MPa</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 font-mono text-teal-300 font-bold text-sm">
              {result.cohesionMPa} MPa
            </div>
            <span className="text-[10px] text-slate-500 block">
              {isFa ? 'چسبندگی معادل موهر-کولمب' : 'Equivalent cohesion'}
            </span>
          </div>

          {/* Card 4: Mohr-Coulomb Triaxial Ratio kp */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">
                {isFa ? 'ضریب مقاومت سه‌محوره (kp):' : 'MC Triaxial Factor (kp):'}
              </span>
              <span className="font-mono text-amber-400 font-bold">{result.rankineKp}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 font-mono text-amber-300 font-bold text-sm">
              kp = (1+sinφ)/(1-sinφ) = {result.rankineKp}
            </div>
            <span className="text-[10px] text-slate-500 block">
              {isFa ? 'شیب منحنی شکست در فضای σ1-σ3' : 'Failure slope dσ1/dσ3'}
            </span>
          </div>
        </div>
      </div>

      {/* Boundary Stress Formulas Banner */}
      <div className="p-4 rounded-xl bg-slate-950 border border-pink-500/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-pink-400 block">
              {isFa ? 'تنش مماسی تاج و کف تونل (θ = 90° و 270°):' : 'Crown & Invert Tangential Stress (θ = 90° & 270°):'}
            </span>
            <div className="font-mono text-xs sm:text-sm text-slate-200 bg-slate-900 p-2 rounded border border-slate-800">
              σ<sub>θ,roof</sub> = σ<sub>v</sub> · (3 · K - 1) = {result.sigmaV} · (3 × {result.kRatio} - 1) = <strong className="text-pink-300">{result.sigmaThetaRoof} MPa</strong>
            </div>
            {result.hasRoofTension && (
              <span className="text-[11px] text-rose-400 font-bold flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {isFa ? 'هشدار کشش در سقف (K < 0.33): بازشدگی درزه‌ها و ریزش بلوک‌ها' : 'Tensile Stress in Crown (K < 0.33)'}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-cyan-400 block">
              {isFa ? 'تنش مماسی دیواره‌های تونل (θ = 0° و 180°):' : 'Springline / Sidewall Stress (θ = 0° & 180°):'}
            </span>
            <div className="font-mono text-xs sm:text-sm text-slate-200 bg-slate-900 p-2 rounded border border-slate-800">
              σ<sub>θ,wall</sub> = σ<sub>v</sub> · (3 - K) = {result.sigmaV} · (3 - {result.kRatio}) = <strong className="text-cyan-300">{result.sigmaThetaWall} MPa</strong>
            </div>
            {result.hasWallTension && (
              <span className="text-[11px] text-rose-400 font-bold flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {isFa ? 'هشدار کشش در دیواره (K > 3.0)' : 'Tensile Stress in Sidewall (K > 3.0)'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Stresses and Mohr-Coulomb Failure Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1: Far-field In-situ Stresses */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-bold border-b border-slate-800 pb-2">
            <ArrowUpDown className="w-4 h-4 text-amber-400" />
            <span>{isFa ? 'تنش‌های برجای دوردست (Far-field)' : 'Far-field In-situ Stresses'}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">{isFa ? 'تنش قائم روباره (σv):' : 'Vertical Stress (σv):'}</span>
              <span className="font-mono font-bold text-slate-200">{result.sigmaV} MPa</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">{isFa ? 'تنش افقی برجا (σh = K·σv):' : 'Horizontal Stress (σh):'}</span>
              <span className="font-mono font-bold text-slate-200">{result.sigmaH} MPa</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">{isFa ? 'شعاع مقطع (a = B/2):' : 'Tunnel Radius (a):'}</span>
              <span className="font-mono font-bold text-slate-200">{result.radiusA} m</span>
            </div>
          </div>
        </div>

        {/* Card 2: Mohr-Coulomb Yield & Safety Factors */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>{isFa ? 'معیار شکست موهر-کولمب و ضریب اطمینان' : 'Mohr-Coulomb Failure Criteria & SSR'}</span>
            </div>
            {result.mohrCoulombWallYield ? (
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                {isFa ? 'تسلیم پلاستیک دیواره' : 'Wall Yielded'}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                {isFa ? 'الاستیک و پایدار' : 'Elastic Stable'}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">{isFa ? 'مقاومت توده‌سنگ (σcm):' : 'Rock Mass Strength:'}</span>
              <span className="font-mono font-bold text-purple-300">{result.sigmaCm} MPa</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">{isFa ? 'ضریب اطمینان دیواره (FS دیواره):' : 'Wall Factor of Safety:'}</span>
              <span className={`font-mono font-bold ${result.factorOfSafetyWallMC < 1.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {result.factorOfSafetyWallMC} {result.factorOfSafetyWallMC < 1.0 ? (isFa ? '(تسلیم برشی)' : '(Yield)') : ''}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">{isFa ? 'ضریب اطمینان سقف (FS تاج):' : 'Roof Factor of Safety:'}</span>
              <span className={`font-mono font-bold ${result.factorOfSafetyRoofMC < 1.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {result.factorOfSafetyRoofMC}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Plastic Yield Zone & Spalling */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-bold border-b border-slate-800 pb-2">
            <TrendingUp className="w-4 h-4 text-pink-400" />
            <span>{isFa ? 'زون پلاستیک تسلیم‌یافته (Plastic Zone)' : 'Plastic Zone & Spalling'}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">{isFa ? 'شعاع زون پلاستیک (Rp):' : 'Plastic Zone Radius (Rp):'}</span>
              <span className={`font-mono font-bold ${result.plasticZoneRatio > 1.0 ? 'text-amber-300' : 'text-slate-300'}`}>
                {result.plasticZoneRadiusM} m ({result.plasticZoneRatio} × a)
              </span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
              <span className="text-pink-400 font-bold block mb-0.5">
                {isFa ? 'ارزیابی پوسته‌شدگی و ریسک پایداری:' : 'Spalling & Squeezing Assessment:'}
              </span>
              {isFa ? result.spallingRiskFa : result.spallingRiskEn}
            </div>
          </div>
        </div>
      </div>

      {/* Radial Stress Distribution & Mohr-Coulomb Failure Profile Table */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Compass className="w-4 h-4 text-pink-400" />
            <span>
              {isFa
                ? 'پروفیل شعاعی تنش‌ها و مقایسه با معیار شکست موهر-کولمب (از دیواره r/a = 1.0 تا 4.0):'
                : 'Kirsch Radial Profiles & Mohr-Coulomb Failure Check (r/a = 1.0 to 4.0):'}
            </span>
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            σ<sub>1,f</sub> = σ<sub>cm</sub> + kp·σ<sub>r</sub>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <th className="p-2">r / a</th>
                <th className="p-2">{isFa ? 'فاصله (m)' : 'Radius (m)'}</th>
                <th className="p-2 text-pink-400">{isFa ? 'سقف σθ (MPa)' : 'Roof σθ (MPa)'}</th>
                <th className="p-2 text-pink-300">{isFa ? 'سقف σr (MPa)' : 'Roof σr (MPa)'}</th>
                <th className="p-2 text-indigo-400">{isFa ? 'حد مقاومت سقف σ1,f' : 'Roof Limit σ1,f'}</th>
                <th className="p-2 text-emerald-400">{isFa ? 'FS سقف' : 'Roof FS'}</th>
                <th className="p-2 text-cyan-400">{isFa ? 'دیواره σθ (MPa)' : 'Wall σθ (MPa)'}</th>
                <th className="p-2 text-cyan-300">{isFa ? 'دیواره σr (MPa)' : 'Wall σr (MPa)'}</th>
                <th className="p-2 text-indigo-400">{isFa ? 'حد مقاومت دیواره σ1,f' : 'Wall Limit σ1,f'}</th>
                <th className="p-2 text-emerald-400">{isFa ? 'FS دیواره' : 'Wall FS'}</th>
                <th className="p-2">{isFa ? 'وضعیت' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {result.radialProfile.map((row, idx) => (
                <tr
                  key={idx}
                  className={
                    row.rRatio === 1
                      ? 'bg-pink-500/10 font-bold'
                      : row.wallYielded
                      ? 'bg-rose-500/5 hover:bg-slate-800/30'
                      : 'hover:bg-slate-800/30'
                  }
                >
                  <td className="p-2">{row.rRatio === 1 ? `${row.rRatio} (مرز تونل)` : row.rRatio}</td>
                  <td className="p-2">{row.rMeters} m</td>
                  <td className="p-2 text-pink-300">{row.sigmaRoofTheta}</td>
                  <td className="p-2 text-slate-400">{row.sigmaRoofR}</td>
                  <td className="p-2 text-indigo-300 font-bold">{row.mohrCoulombLimitRoof}</td>
                  <td className={`p-2 font-bold ${row.fsRoofMC < 1.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {row.fsRoofMC}
                  </td>
                  <td className="p-2 text-cyan-300">{row.sigmaWallTheta}</td>
                  <td className="p-2 text-slate-400">{row.sigmaWallR}</td>
                  <td className="p-2 text-indigo-300 font-bold">{row.mohrCoulombLimitWall}</td>
                  <td className={`p-2 font-bold ${row.fsWallMC < 1.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {row.fsWallMC}
                  </td>
                  <td className="p-2">
                    {row.wallYielded ? (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px]">
                        {isFa ? 'تسلیم پلاستیک' : 'Plastic'}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                        {isFa ? 'الاستیک' : 'Elastic'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
