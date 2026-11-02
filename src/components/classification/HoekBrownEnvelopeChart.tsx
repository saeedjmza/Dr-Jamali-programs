import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
} from 'recharts';
import {
  Activity,
  Layers,
  Scale,
  Sparkles,
  Info,
  Sliders,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { calculateHoekBrownParams, rmrToGsi } from '../../utils/gsiCalculation';

interface HoekBrownEnvelopeChartProps {
  currentGsi: number;
  currentRmr: number;
  sigmaCi: number; // MPa
  mi: number;
  dFactor: number;
  lang: 'fa' | 'en';
}

export const HoekBrownEnvelopeChart: React.FC<HoekBrownEnvelopeChartProps> = ({
  currentGsi,
  currentRmr,
  sigmaCi,
  mi,
  dFactor,
  lang,
}) => {
  const isFa = lang === 'fa';

  // Toggle curve visibility
  const [showGsiCurve, setShowGsiCurve] = useState<boolean>(true);
  const [showRmrCurve, setShowRmrCurve] = useState<boolean>(true);
  const [showIntactCurve, setShowIntactCurve] = useState<boolean>(true);
  const [showMcTangent, setShowMcTangent] = useState<boolean>(true);

  // Maximum confinement slider (sigma3_max)
  const defaultMaxSigma3 = useMemo(() => {
    return Math.min(80, Math.max(25, Math.round(sigmaCi * 0.4)));
  }, [sigmaCi]);

  const [maxSigma3, setMaxSigma3] = useState<number>(defaultMaxSigma3);

  // Calculate Hoek-Brown parameters for Project GSI
  const gsiParams = useMemo(() => {
    return calculateHoekBrownParams(currentGsi, sigmaCi, mi, dFactor);
  }, [currentGsi, sigmaCi, mi, dFactor]);

  // Derive equivalent GSI from RMR input (Hoek et al., 1995: GSI = RMR - 5 for RMR > 23)
  const rmrDerivedGsi = useMemo(() => {
    return rmrToGsi(currentRmr);
  }, [currentRmr]);

  // Calculate Hoek-Brown parameters for RMR-derived GSI
  const rmrParams = useMemo(() => {
    return calculateHoekBrownParams(rmrDerivedGsi, sigmaCi, mi, dFactor);
  }, [rmrDerivedGsi, sigmaCi, mi, dFactor]);

  // Generate Strength Envelope Curve Points (sigma1 vs sigma3)
  const chartData = useMemo(() => {
    const pointsCount = 35;
    const step = maxSigma3 / (pointsCount - 1);
    const data = [];

    // Intact rock parameters: s = 1.0, a = 0.5, mb = mi
    // Mohr-Coulomb line: sigma1 = sigma3 * Kp + 2 * c * sqrt(Kp)
    const phiRad = (gsiParams.frictionAngleDeg * Math.PI) / 180;
    const kp = (1 + Math.sin(phiRad)) / (1 - Math.sin(phiRad));
    const mcIntercept = 2 * gsiParams.cohesionMPa * Math.sqrt(kp);

    for (let i = 0; i < pointsCount; i++) {
      const s3 = Number((i * step).toFixed(2));

      // 1. Project GSI Hoek-Brown: sigma1 = s3 + sigmaCi * (mb * (s3 / sigmaCi) + s)^a
      const termGsi = gsiParams.mb * (s3 / sigmaCi) + gsiParams.s;
      const s1Gsi =
        termGsi > 0
          ? Number((s3 + sigmaCi * Math.pow(termGsi, gsiParams.a)).toFixed(2))
          : s3;

      // 2. RMR-derived GSI Hoek-Brown
      const termRmr = rmrParams.mb * (s3 / sigmaCi) + rmrParams.s;
      const s1Rmr =
        termRmr > 0
          ? Number((s3 + sigmaCi * Math.pow(termRmr, rmrParams.a)).toFixed(2))
          : s3;

      // 3. Intact Rock Envelope: sigma1 = s3 + sigmaCi * sqrt(mi * (s3 / sigmaCi) + 1)
      const termIntact = mi * (s3 / sigmaCi) + 1.0;
      const s1Intact =
        termIntact > 0
          ? Number((s3 + sigmaCi * Math.sqrt(termIntact)).toFixed(2))
          : s3;

      // 4. Equivalent Mohr-Coulomb Line
      const s1Mc = Number((s3 * kp + mcIntercept).toFixed(2));

      data.push({
        sigma3: s3,
        sigma1_gsi: s1Gsi,
        sigma1_rmr: s1Rmr,
        sigma1_intact: s1Intact,
        sigma1_mc: s1Mc,
      });
    }
    return data;
  }, [maxSigma3, sigmaCi, mi, gsiParams, rmrParams]);

  // Max value on Y axis for clean scaling
  const maxY = useMemo(() => {
    if (chartData.length === 0) return 100;
    const lastPoint = chartData[chartData.length - 1];
    const topVal = Math.max(
      lastPoint.sigma1_intact || 0,
      lastPoint.sigma1_gsi || 0,
      lastPoint.sigma1_rmr || 0
    );
    return Math.ceil(topVal / 20) * 20;
  }, [chartData]);

  return (
    <div
      id="hoek-brown-envelope-panel"
      className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5 select-none"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>
                {isFa
                  ? 'پوش‌های مقاومت شکست هوک و براون (Hoek-Brown Strength Envelopes)'
                  : 'Hoek-Brown Failure Strength Envelopes (σ1 vs σ3)'}
              </span>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60">
                σ1 = σ3 + σci (mb·σ3/σci + s)^a
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isFa
                ? 'مقایسه منحنی مقاومت توده‌سنگ بر پایه GSI ورودی پروژه با رده‌بندی RMR بینیاوسکی و سنگ بکر'
                : 'Comparative failure envelopes for Project GSI, RMR-derived GSI, Intact Rock, and Mohr-Coulomb'}
            </p>
          </div>
        </div>

        {/* Legend / Filter toggles */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <button
            onClick={() => setShowGsiCurve(!showGsiCurve)}
            className={`px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              showGsiCurve
                ? 'bg-purple-500/20 border-purple-500/60 text-purple-300 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span>{isFa ? `پروژه GSI (${currentGsi})` : `Project GSI (${currentGsi})`}</span>
          </button>

          <button
            onClick={() => setShowRmrCurve(!showRmrCurve)}
            className={`px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              showRmrCurve
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>{isFa ? `معادل RMR (${currentRmr})` : `RMR Equiv (${currentRmr})`}</span>
          </button>

          <button
            onClick={() => setShowIntactCurve(!showIntactCurve)}
            className={`px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              showIntactCurve
                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>{isFa ? 'سنگ بکر (Intact)' : 'Intact Rock'}</span>
          </button>

          <button
            onClick={() => setShowMcTangent(!showMcTangent)}
            className={`px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              showMcTangent
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>{isFa ? 'خط موهر-کولمب' : 'Mohr-Coulomb'}</span>
          </button>
        </div>
      </div>

      {/* Comparison Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Metric 1: GSI vs RMR */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold block">
            {isFa ? 'شاخص‌های طبقه‌بندی' : 'Classification Indices'}
          </span>
          <div className="flex items-center gap-2 font-mono text-sm font-bold">
            <span className="text-purple-400">GSI = {currentGsi}</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400">RMR = {currentRmr}</span>
          </div>
          <span className="text-[10px] text-slate-500 block font-mono">
            {isFa ? `معادل GSI(RMR) = ${rmrDerivedGsi}` : `GSI from RMR = ${rmrDerivedGsi}`}
          </span>
        </div>

        {/* Metric 2: sigma_cm Comparison */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold block">
            {isFa ? 'مقاومت فشاری توده‌سنگ (σcm)' : 'Mass Strength (σcm)'}
          </span>
          <div className="flex items-center gap-2 font-mono text-sm font-bold">
            <span className="text-purple-400">{gsiParams.sigmaCm} MPa</span>
            <span className="text-slate-600">vs</span>
            <span className="text-amber-400">{rmrParams.sigmaCm} MPa</span>
          </div>
          <span className="text-[10px] text-slate-500 block">
            {isFa ? `سنگ بکر: ${sigmaCi} MPa` : `Intact: ${sigmaCi} MPa`}
          </span>
        </div>

        {/* Metric 3: mb parameter */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold block">
            {isFa ? 'پارامتر اصطکاک (mb)' : 'Friction Constant (mb)'}
          </span>
          <div className="flex items-center gap-2 font-mono text-sm font-bold">
            <span className="text-purple-400">{gsiParams.mb}</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400">{rmrParams.mb}</span>
          </div>
          <span className="text-[10px] text-slate-500 block">
            {isFa ? `ثابت سنگ بکر mi: ${mi}` : `Intact mi: ${mi}`}
          </span>
        </div>

        {/* Metric 4: s parameter */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold block">
            {isFa ? 'پارامتر چسبندگی (s)' : 'Cohesion Constant (s)'}
          </span>
          <div className="flex items-center gap-2 font-mono text-sm font-bold">
            <span className="text-purple-400">{gsiParams.s}</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400">{rmrParams.s}</span>
          </div>
          <span className="text-[10px] text-slate-500 block">
            {isFa ? 'سنگ بکر: s = 1.0' : 'Intact: s = 1.0'}
          </span>
        </div>

        {/* Metric 5: Erm Modulus */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold block">
            {isFa ? 'مدول الاستیسیته (Erm)' : 'Mass Modulus (Erm)'}
          </span>
          <div className="flex items-center gap-2 font-mono text-sm font-bold">
            <span className="text-purple-400">{gsiParams.ermGPa} GPa</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400">{rmrParams.ermGPa} GPa</span>
          </div>
          <span className="text-[10px] text-slate-500 block">
            Hoek & Diederichs 2006
          </span>
        </div>

        {/* Metric 6: Equivalent MC (c' / phi') */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold block">
            {isFa ? 'موهر-کولمب معادل (c / φ)' : 'Equiv Mohr-Coulomb'}
          </span>
          <div className="font-mono text-xs font-bold text-emerald-300">
            {gsiParams.cohesionMPa} MPa / {gsiParams.frictionAngleDeg}°
          </div>
          <span className="text-[10px] text-slate-500 block">
            {isFa ? 'مماس بر پوش هوک-براون' : 'Tangent to HB curve'}
          </span>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 relative">
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 15, right: 30, left: 15, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.8} />
              <XAxis
                dataKey="sigma3"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                label={{
                  value: isFa
                    ? 'تنش اصلی فرعی / فشار محصورکنندگی σ3 (MPa)'
                    : 'Minor Principal Stress / Confinement σ3 (MPa)',
                  position: 'insideBottom',
                  offset: -15,
                  fill: '#94a3b8',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
              <YAxis
                stroke="#64748b"
                domain={[0, maxY]}
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                label={{
                  value: isFa
                    ? 'تنش اصلی عمده در لحظه شکست σ1 (MPa)'
                    : 'Major Principal Stress at Failure σ1 (MPa)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  fill: '#94a3b8',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-slate-950/95 border border-slate-700 shadow-xl text-xs space-y-1.5 font-mono">
                        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex justify-between gap-4">
                          <span>{isFa ? 'تنش محصورکنندگی (σ3):' : 'Confinement (σ3):'}</span>
                          <span className="text-cyan-400">{data.sigma3} MPa</span>
                        </div>
                        {showGsiCurve && (
                          <div className="flex justify-between gap-4 text-purple-400">
                            <span>{isFa ? 'پروژه GSI (σ1):' : 'Project GSI (σ1):'}</span>
                            <span className="font-bold">{data.sigma1_gsi} MPa</span>
                          </div>
                        )}
                        {showRmrCurve && (
                          <div className="flex justify-between gap-4 text-amber-400">
                            <span>{isFa ? 'معادل RMR (σ1):' : 'RMR Equiv (σ1):'}</span>
                            <span className="font-bold">{data.sigma1_rmr} MPa</span>
                          </div>
                        )}
                        {showIntactCurve && (
                          <div className="flex justify-between gap-4 text-cyan-400">
                            <span>{isFa ? 'سنگ بکر (σ1):' : 'Intact Rock (σ1):'}</span>
                            <span className="font-bold">{data.sigma1_intact} MPa</span>
                          </div>
                        )}
                        {showMcTangent && (
                          <div className="flex justify-between gap-4 text-emerald-400">
                            <span>{isFa ? 'موهر-کولمب (σ1):' : 'Mohr-Coulomb (σ1):'}</span>
                            <span className="font-bold">{data.sigma1_mc} MPa</span>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800 flex justify-between gap-4">
                          <span>{isFa ? 'تنش انحرافی (σ1 - σ3):' : 'Deviatoric (σ1 - σ3):'}</span>
                          <span>{(data.sigma1_gsi - data.sigma3).toFixed(2)} MPa</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 10 }}
                formatter={(value) => (
                  <span className="text-xs text-slate-300 font-sans font-medium px-1">
                    {value}
                  </span>
                )}
              />

              {/* Intact Rock Curve */}
              {showIntactCurve && (
                <Line
                  type="monotone"
                  dataKey="sigma1_intact"
                  name={isFa ? `سنگ بکر (σci = ${sigmaCi} MPa, mi = ${mi})` : `Intact Rock (σci = ${sigmaCi} MPa, mi = ${mi})`}
                  stroke="#38bdf8"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                  activeDot={{ r: 5, fill: '#38bdf8' }}
                />
              )}

              {/* Project GSI Curve */}
              {showGsiCurve && (
                <Line
                  type="monotone"
                  dataKey="sigma1_gsi"
                  name={isFa ? `پوش هوک-براون GSI پروژه (${currentGsi})` : `Hoek-Brown Project GSI (${currentGsi})`}
                  stroke="#a855f7"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
                />
              )}

              {/* RMR-Derived GSI Curve */}
              {showRmrCurve && (
                <Line
                  type="monotone"
                  dataKey="sigma1_rmr"
                  name={isFa ? `پوش هوک-براون معادل RMR (${currentRmr} ⟹ GSI = ${rmrDerivedGsi})` : `Hoek-Brown RMR Equiv (${currentRmr} ⟹ GSI = ${rmrDerivedGsi})`}
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  strokeDasharray="4 3"
                  dot={false}
                  activeDot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 1.5 }}
                />
              )}

              {/* Mohr-Coulomb Tangent Line */}
              {showMcTangent && (
                <Line
                  type="monotone"
                  dataKey="sigma1_mc"
                  name={isFa ? `مماس خطی موهر-کولمب (c' = ${gsiParams.cohesionMPa} MPa, φ' = ${gsiParams.frictionAngleDeg}°)` : `Linear Mohr-Coulomb (c' = ${gsiParams.cohesionMPa} MPa, φ' = ${gsiParams.frictionAngleDeg}°)`}
                  stroke="#10b981"
                  strokeWidth={1.8}
                  strokeDasharray="2 2"
                  dot={false}
                />
              )}

              {/* Highlight Unconfined Strength Point (sigma3 = 0) */}
              {showGsiCurve && (
                <ReferenceDot
                  x={0}
                  y={gsiParams.sigmaCm}
                  r={5}
                  fill="#a855f7"
                  stroke="#ffffff"
                  strokeWidth={2}
                  label={{
                    value: `σcm = ${gsiParams.sigmaCm}`,
                    position: 'top',
                    fill: '#c084fc',
                    fontSize: 10,
                    fontWeight: 'bold',
                  }}
                />
              )}

              {showRmrCurve && (
                <ReferenceDot
                  x={0}
                  y={rmrParams.sigmaCm}
                  r={4}
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Confinement Slider Tool */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span className="text-slate-400 font-medium">
              {isFa
                ? 'دامنه فشار محصورکنندگی (حداکثر σ3):'
                : 'Confinement Stress Range (Max σ3):'}
            </span>
            <span className="font-mono font-bold text-purple-300">
              0 - {maxSigma3} MPa
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-64">
            <input
              type="range"
              min={10}
              max={Math.max(100, Math.round(sigmaCi))}
              step={5}
              value={maxSigma3}
              onChange={(e) => setMaxSigma3(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <span className="text-[10px] font-mono text-slate-500">{maxSigma3}M</span>
          </div>
        </div>
      </div>
    </div>
  );
};
