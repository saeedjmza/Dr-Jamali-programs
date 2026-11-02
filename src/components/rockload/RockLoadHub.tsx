import React, { useState } from 'react';
import { RockLoadSubTab } from '../../types';
import { TerzaghiTab } from './TerzaghiTab';
import { CordingTab } from './CordingTab';
import { BartonRockLoadTab } from './BartonRockLoadTab';
import { HoekRockLoadTab } from './HoekRockLoadTab';
import { KirschTab } from './KirschTab';
import { RockLoadComparisonTab } from './RockLoadComparisonTab';
import {
  calculateTerzaghiRockLoad,
  calculateCordingRockLoad,
  calculateBartonRockLoad,
  calculateHoekCriticalSupportPressure,
  calculateKirschStresses,
  calculateDeereRockLoad,
  synthesizeRockLoadComparison,
  autoSuggestTerzaghiCondition,
} from '../../utils/rockLoadCalculation';
import { calculateHoekBrownParams } from '../../utils/gsiCalculation';
import {
  Weight,
  Layers,
  Ruler,
  Cpu,
  ShieldAlert,
  Activity,
  BarChart3,
  Link,
  HelpCircle,
} from 'lucide-react';

interface RockLoadHubProps {
  span: number;
  height?: number;
  depth: number;
  ucs: number;
  rqd: number;
  rmr: number;
  qValue: number;
  gsi: number;
  sigmaCm?: number;
  frictionAngleDeg?: number;
  cohesionMPa?: number;
  mi?: number;
  dFactor?: number;
  esr?: number;
  kRatio?: number;
  unitWeight?: number;
  jointSets?: number;
  jr?: number;
  ja?: number;
  jointSpacing?: number;
  groundwaterCondition?: string;
  lang: 'fa' | 'en';
  onUpdateSpan?: (span: number) => void;
  onUpdateHeight?: (height: number) => void;
  onUpdateDepth?: (depth: number) => void;
  onUpdateUcs?: (ucs: number) => void;
  onUpdateRqd?: (rqd: number) => void;
  onUpdateQValue?: (q: number) => void;
  onUpdateGsi?: (gsi: number) => void;
  onUpdateMi?: (mi: number) => void;
  onUpdateDFactor?: (d: number) => void;
  onUpdateUnitWeight?: (gamma: number) => void;
  onUpdateKRatio?: (k: number) => void;
  onUpdateEsr?: (esr: number) => void;
  onUpdateJointSets?: (jn: number) => void;
  onUpdateJr?: (jr: number) => void;
  onUpdateJa?: (ja: number) => void;
  onUpdateJointSpacing?: (spacing: number) => void;
  onUpdateFrictionAngle?: (phi: number) => void;
  onUpdateCohesion?: (c: number) => void;
}

export const RockLoadHub: React.FC<RockLoadHubProps> = ({
  span,
  height,
  depth,
  ucs,
  rqd,
  rmr,
  qValue,
  gsi,
  sigmaCm,
  frictionAngleDeg,
  cohesionMPa,
  mi = 12,
  dFactor = 0.0,
  esr = 1.0,
  kRatio = 1.0,
  unitWeight = 25,
  jointSets = 9,
  jr = 2.0,
  ja = 1.0,
  jointSpacing = 0.6,
  groundwaterCondition = 'damp',
  lang,
  onUpdateSpan,
  onUpdateHeight,
  onUpdateDepth,
  onUpdateUcs,
  onUpdateRqd,
  onUpdateQValue,
  onUpdateGsi,
  onUpdateMi,
  onUpdateDFactor,
  onUpdateUnitWeight,
  onUpdateKRatio,
  onUpdateEsr,
  onUpdateJointSets,
  onUpdateJr,
  onUpdateJa,
  onUpdateJointSpacing,
  onUpdateFrictionAngle,
  onUpdateCohesion,
}) => {
  const isFa = lang === 'fa';
  const [activeSubTab, setActiveSubTab] = useState<RockLoadSubTab>('terzaghi');

  // Tunnel height & Equivalent diameter
  const effectiveHeight = height ?? span;
  const equivalentDiameter = Number(Math.sqrt((4 * span * effectiveHeight) / Math.PI).toFixed(2));

  // Direct parameter bindings without internal state drift
  const effectiveGamma = unitWeight;
  const effectiveKRatio = kRatio;
  const effectiveEsr = esr;
  const effectiveJointSets = jointSets;
  const effectiveJr = jr;

  // Calculate Hoek-Brown rock mass parameters from GSI as authoritative source
  const hbParams = calculateHoekBrownParams(gsi, ucs, mi, dFactor);
  const effectiveSigmaCm = sigmaCm ?? hbParams.sigmaCm;
  const effectiveFrictionAngle = frictionAngleDeg ?? hbParams.frictionAngleDeg;
  const effectiveCohesion = cohesionMPa ?? hbParams.cohesionMPa;

  // Compute all methods for the comparison tab and quick summary
  const terzaghiCond = autoSuggestTerzaghiCondition(rmr, rqd, depth, ucs);
  const terzaghiRes = calculateTerzaghiRockLoad(terzaghiCond, span, effectiveHeight, effectiveGamma);
  const cordingRes = calculateCordingRockLoad(span, effectiveHeight, effectiveGamma, rqd);
  const bartonRes = calculateBartonRockLoad(qValue, effectiveJointSets, effectiveJr, effectiveEsr, span, effectiveGamma);
  const hoekRes = calculateHoekCriticalSupportPressure(depth, effectiveGamma, ucs, gsi, effectiveKRatio, effectiveFrictionAngle);
  const kirschRes = calculateKirschStresses(
    span,
    depth,
    effectiveGamma,
    effectiveKRatio,
    ucs,
    gsi,
    effectiveSigmaCm,
    effectiveFrictionAngle,
    effectiveCohesion,
    mi,
    dFactor
  );
  const deereRes = calculateDeereRockLoad(span, rqd, effectiveGamma);

  const comparisonSummaries = synthesizeRockLoadComparison(
    terzaghiRes,
    cordingRes,
    bartonRes,
    hoekRes,
    kirschRes,
    deereRes
  );

  const subTabs: Array<{ id: RockLoadSubTab; labelFa: string; labelEn: string; icon: React.ReactNode; badge?: string }> = [
    {
      id: 'terzaghi',
      labelFa: 'روش ترزاقی (۱۹۴۶)',
      labelEn: 'Terzaghi (1946)',
      icon: <Layers className="w-4 h-4" />,
      badge: `${terzaghiRes.pvAvgKPa} kPa`,
    },
    {
      id: 'barton',
      labelFa: 'سیستم Q بارتون (۱۹۹۳)',
      labelEn: 'Barton Q (1993)',
      icon: <Cpu className="w-4 h-4" />,
      badge: `${bartonRes.pRoofMPa} MPa`,
    },
    {
      id: 'cording',
      labelFa: 'روش کوردینگ (۱۹۷۱)',
      labelEn: 'Cording et al. (1971)',
      icon: <Ruler className="w-4 h-4" />,
      badge: `${cordingRes.pCrownKPa} kPa`,
    },
    {
      id: 'hoek',
      labelFa: 'فشار بحرانی هوک (۱۹۹۹)',
      labelEn: 'Hoek Critical (1999)',
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: `${hoekRes.criticalPressurePcrMPa} MPa`,
    },
    {
      id: 'kirsch',
      labelFa: 'روابط الاستیک کرش (۱۸۹۸)',
      labelEn: 'Kirsch Stresses (1898)',
      icon: <Activity className="w-4 h-4" />,
      badge: `${kirschRes.sigmaThetaRoof} MPa`,
    },
    {
      id: 'comparison',
      labelFa: 'مقایسه و سنتز جامع',
      labelEn: 'Synthesis & Comparison',
      icon: <BarChart3 className="w-4 h-4" />,
      badge: isFa ? 'پوشش طراحی' : 'Design Envelope',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Parameters Synchronization Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 text-slate-300">
          <div className="flex items-center gap-2">
            <Link className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-200">
              {isFa
                ? 'پارامترهای محاسباتی به صورت زنده و دوطرفه بین تمامی روش‌ها لینک و همگام هستند:'
                : 'All calculation parameters are live-linked and bidirectional across all methods:'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {isFa ? 'قطر معادل هندسی:' : 'Equiv Diameter:'}{' '}
            <strong className="text-amber-400 font-bold">{equivalentDiameter} m</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            UCS: <strong className="text-amber-400">{ucs} MPa</strong>
          </span>
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            {isFa ? 'عرض B:' : 'Span B:'} <strong className="text-teal-400">{span} m</strong>
          </span>
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            {isFa ? 'ارتفاع Ht:' : 'Height Ht:'} <strong className="text-teal-300">{effectiveHeight} m</strong>
          </span>
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            {isFa ? 'عمق H:' : 'Depth H:'} <strong className="text-cyan-400">{depth} m</strong>
          </span>
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            γ: <strong className="text-emerald-400">{effectiveGamma} kN/m³</strong>
          </span>
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            K: <strong className="text-blue-400">{effectiveKRatio}</strong>
          </span>
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            RMR: <strong className="text-amber-400">{rmr}</strong>
          </span>
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            Q: <strong className="text-emerald-400">{qValue}</strong>
          </span>
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            GSI: <strong className="text-purple-400">{gsi}</strong>
          </span>
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            RQD: <strong className="text-blue-400">{rqd}%</strong>
          </span>
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            φ\': <strong className="text-rose-400">{effectiveFrictionAngle.toFixed(1)}°</strong>
          </span>
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            c\': <strong className="text-pink-400">{effectiveCohesion.toFixed(2)} MPa</strong>
          </span>
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            Jn: <strong className="text-indigo-400">{effectiveJointSets}</strong> | Jr: <strong className="text-indigo-400">{effectiveJr}</strong>
          </span>
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            {isFa ? 'فاصله درزه‌ها:' : 'Spacing:'} <strong className="text-yellow-400">{jointSpacing} m</strong>
          </span>
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            {isFa ? 'آب زیرزمینی:' : 'Water:'} <strong className="text-sky-400">{groundwaterCondition}</strong>
          </span>
        </div>
      </div>

      {/* Sub-Tabs Navigation - Fully Responsive Grid without Horizontal Scrolling */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {subTabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex flex-col justify-between items-stretch p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-start relative overflow-hidden group ${
                isActive
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:bg-slate-850 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full mb-2">
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-amber-500/25 text-amber-300'
                      : 'bg-slate-950 text-slate-400 group-hover:text-slate-300'
                  }`}
                >
                  {tab.icon}
                </div>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold truncate max-w-[85px] ${
                      isActive
                        ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                    title={tab.badge}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="leading-snug text-xs font-bold truncate block">
                {isFa ? tab.labelFa : tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Sub-Tab View */}
      {activeSubTab === 'terzaghi' && (
        <TerzaghiTab
          span={span}
          tunnelHeight={effectiveHeight}
          unitWeight={effectiveGamma}
          rmr={rmr}
          rqd={rqd}
          depth={depth}
          ucs={ucs}
          lang={lang}
          onUpdateSpan={onUpdateSpan}
          onUpdateTunnelHeight={onUpdateHeight}
          onUpdateUnitWeight={onUpdateUnitWeight}
          onUpdateDepth={onUpdateDepth}
          onUpdateUcs={onUpdateUcs}
          onUpdateRqd={onUpdateRqd}
        />
      )}

      {activeSubTab === 'barton' && (
        <BartonRockLoadTab
          qValue={qValue}
          span={span}
          tunnelHeight={effectiveHeight}
          esr={effectiveEsr}
          unitWeight={effectiveGamma}
          jointSets={effectiveJointSets}
          jr={effectiveJr}
          lang={lang}
          onUpdateSpan={onUpdateSpan}
          onUpdateTunnelHeight={onUpdateHeight}
          onUpdateQValue={onUpdateQValue}
          onUpdateEsr={onUpdateEsr}
          onUpdateUnitWeight={onUpdateUnitWeight}
          onUpdateJointSets={onUpdateJointSets}
          onUpdateJr={onUpdateJr}
        />
      )}

      {activeSubTab === 'cording' && (
        <CordingTab
          span={span}
          tunnelHeight={effectiveHeight}
          unitWeight={effectiveGamma}
          rqd={rqd}
          lang={lang}
          onUpdateSpan={onUpdateSpan}
          onUpdateTunnelHeight={onUpdateHeight}
          onUpdateRqd={onUpdateRqd}
          onUpdateUnitWeight={onUpdateUnitWeight}
        />
      )}

      {activeSubTab === 'hoek' && (
        <HoekRockLoadTab
          depth={depth}
          unitWeight={effectiveGamma}
          ucs={ucs}
          gsi={gsi}
          kRatio={effectiveKRatio}
          frictionAngleDeg={effectiveFrictionAngle}
          lang={lang}
          onUpdateDepth={onUpdateDepth}
          onUpdateUcs={onUpdateUcs}
          onUpdateGsi={onUpdateGsi}
          onUpdateKRatio={onUpdateKRatio}
          onUpdateUnitWeight={onUpdateUnitWeight}
          onUpdateFrictionAngle={onUpdateFrictionAngle}
        />
      )}

      {activeSubTab === 'kirsch' && (
        <KirschTab
          span={span}
          tunnelHeight={effectiveHeight}
          depth={depth}
          unitWeight={effectiveGamma}
          kRatio={effectiveKRatio}
          ucs={ucs}
          gsi={gsi}
          sigmaCm={effectiveSigmaCm}
          frictionAngleDeg={effectiveFrictionAngle}
          cohesionMPa={effectiveCohesion}
          mi={mi}
          dFactor={dFactor}
          lang={lang}
          onUpdateSpan={onUpdateSpan}
          onUpdateTunnelHeight={onUpdateHeight}
          onUpdateDepth={onUpdateDepth}
          onUpdateKRatio={onUpdateKRatio}
          onUpdateUcs={onUpdateUcs}
          onUpdateUnitWeight={onUpdateUnitWeight}
          onUpdateGsi={onUpdateGsi}
        />
      )}

      {activeSubTab === 'comparison' && (
        <RockLoadComparisonTab
          summaries={comparisonSummaries}
          span={span}
          gamma={effectiveGamma}
          lang={lang}
        />
      )}
    </div>
  );
};
