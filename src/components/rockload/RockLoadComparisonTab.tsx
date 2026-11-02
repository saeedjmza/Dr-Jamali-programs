import React from 'react';
import { RockLoadComparisonSummary } from '../../types';
import { BarChart3, ShieldCheck, ArrowDownCircle, Ruler, Info } from 'lucide-react';

interface RockLoadComparisonTabProps {
  summaries: RockLoadComparisonSummary[];
  span: number;
  gamma: number;
  lang: 'fa' | 'en';
}

export const RockLoadComparisonTab: React.FC<RockLoadComparisonTabProps> = ({
  summaries,
  span,
  gamma,
  lang,
}) => {
  const isFa = lang === 'fa';

  // Calculate design envelope (excluding extreme Kirsch boundary concentration if appropriate)
  const empiricalMethods = summaries.filter((s) => s.id !== 'kirsch');
  const roofPressuresKPa = empiricalMethods.map((s) => s.roofPressureKPa).filter((p) => p > 0);
  const minRoofKPa = roofPressuresKPa.length > 0 ? Math.min(...roofPressuresKPa) : 0;
  const maxRoofKPa = roofPressuresKPa.length > 0 ? Math.max(...roofPressuresKPa) : 0;
  const avgRoofKPa = roofPressuresKPa.length > 0
    ? Number((roofPressuresKPa.reduce((a, b) => a + b, 0) / roofPressuresKPa.length).toFixed(1))
    : 0;

  const boltLengths = summaries.map((s) => s.boltLengthM).filter((b): b is number => !!b && b > 0);
  const minBoltM = boltLengths.length > 0 ? Math.min(...boltLengths) : 0;
  const maxBoltM = boltLengths.length > 0 ? Math.max(...boltLengths) : 0;

  const maxValForBar = Math.max(...summaries.map((s) => s.roofPressureKPa), 10);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/20 border border-indigo-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Synthesis & Benchmarking
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                {isFa ? 'سنتز و مقایسه جامع روش‌های برآورد بار سنگ و فشار نگهداری' : 'Comprehensive Rock Load & Support Pressure Comparison'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {isFa
                ? 'مقایسه هم‌زمان نتایج روش‌های ترزاقی، کوردینگ، سیستم Q بارتون، فشار بحرانی هوک، روش RQD دیر و تمرکز تنش کرش جهت تعیین پوشش طراحی (Design Envelope).'
                : 'Simultaneous comparison of Terzaghi, Cording, Barton Q-system, Hoek critical pressure, Deere RQD, and Kirsch elastic stresses to determine the geotechnical design envelope.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'فشار سقف میانگین تجربی:' : 'Empirical Avg Roof:'}</span>
              <span className="text-lg font-mono font-bold text-indigo-400">{avgRoofKPa} kPa</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block">{isFa ? 'طول راک‌بولت طراحی:' : 'Design Bolt Length:'}</span>
              <span className="text-lg font-mono font-bold text-amber-400">
                {minBoltM > 0 ? `${minBoltM} - ${maxBoltM} m` : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Design Envelope KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400 block">{isFa ? 'دامنه فشار سقف تجربی (Envelope):' : 'Roof Support Pressure Range:'}</span>
            <span className="text-lg font-mono font-bold text-indigo-300 mt-1 block">
              {minRoofKPa} ~ {maxRoofKPa} <span className="text-xs font-normal text-slate-400">kPa</span>
            </span>
          </div>
          <ArrowDownCircle className="w-8 h-8 text-indigo-500/40 shrink-0" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400 block">{isFa ? 'طول راک‌بولت‌های پیشنهادی:' : 'Recommended Bolt Lengths:'}</span>
            <span className="text-lg font-mono font-bold text-amber-300 mt-1 block">
              {minBoltM > 0 ? `${minBoltM} تا ${maxBoltM}` : '-'} <span className="text-xs font-normal text-slate-400">m</span>
            </span>
          </div>
          <Ruler className="w-8 h-8 text-amber-500/40 shrink-0" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400 block">{isFa ? 'ضوابط کنترل سازه‌ای:' : 'Structural Checks:'}</span>
            <span className="text-xs font-bold text-emerald-400 mt-1 block">
              {isFa ? 'هم‌پوشانی روش‌های Q و تجربی' : 'Q & Empirical Alignment'}
            </span>
          </div>
          <ShieldCheck className="w-8 h-8 text-emerald-500/40 shrink-0" />
        </div>
      </div>

      {/* Visual Bar Comparison */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          <span>{isFa ? 'نمودار مقایسه‌ای فشار نگهداری سقف روش‌های مختلف (kPa):' : 'Roof Support Pressure Comparison Chart (kPa):'}</span>
        </h4>

        <div className="space-y-3 pt-2">
          {summaries.map((item) => {
            const barWidthPercent = Math.min(100, Math.max(2, (item.roofPressureKPa / maxValForBar) * 100));
            return (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{isFa ? item.methodNameFa : item.methodNameEn}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({item.authorYear})</span>
                  </span>
                  <span className="font-mono font-bold text-slate-100">
                    {item.roofPressureKPa} kPa <span className="text-[10px] text-slate-400">({item.roofPressureMPa} MPa)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${barWidthPercent}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparative Synthesis Matrix Table */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>{isFa ? 'ماتریس جامع مقایسه مشخصات و خروجی‌های محاسباتی:' : 'Comprehensive Comparison Matrix:'}</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <th className="p-2.5 text-start">{isFa ? 'روش و مرجع' : 'Method & Reference'}</th>
                <th className="p-2.5">{isFa ? 'ارتفاع بار سست Hp (m)' : 'Rock Load Hp (m)'}</th>
                <th className="p-2.5 text-emerald-400">{isFa ? 'فشار سقف (kPa)' : 'Roof Pressure (kPa)'}</th>
                <th className="p-2.5 text-emerald-300">{isFa ? 'فشار سقف (MPa)' : 'Roof Pressure (MPa)'}</th>
                <th className="p-2.5 text-cyan-400">{isFa ? 'فشار دیواره (kPa)' : 'Wall Pressure (kPa)'}</th>
                <th className="p-2.5 text-amber-400">{isFa ? 'طول راک‌بولت (m)' : 'Bolt Length (m)'}</th>
                <th className="p-2.5 text-start">{isFa ? 'مبنا و شرایط اعمال' : 'Application Basis'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {summaries.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30">
                  <td className="p-2.5 text-start font-sans font-medium text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span>{isFa ? item.methodNameFa : item.methodNameEn}</span>
                  </td>
                  <td className="p-2.5 text-slate-200">{item.rockLoadHeightM > 0 ? item.rockLoadHeightM : '-'}</td>
                  <td className="p-2.5 font-bold text-emerald-400">{item.roofPressureKPa}</td>
                  <td className="p-2.5 text-emerald-300">{item.roofPressureMPa}</td>
                  <td className="p-2.5 text-cyan-400">{item.wallPressureKPa > 0 ? item.wallPressureKPa : '-'}</td>
                  <td className="p-2.5 text-amber-300">{item.boltLengthM ? `${item.boltLengthM} m` : '-'}</td>
                  <td className="p-2.5 text-start font-sans text-slate-400 text-[10px] max-w-xs truncate">
                    {isFa ? item.applicableConditionsFa : item.applicableConditionsEn}
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
