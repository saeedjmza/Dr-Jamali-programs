import React, { useState } from 'react';
import { RockClassInfo, QClassInfo, ClassificationMethod, QCalculationResult } from '../types';
import { ROCK_CLASSES, RMR_SUPPORT_VALIDITY_NOTE } from '../utils/rmrCalculation';
import { Q_CLASSES } from '../utils/qCalculation';
import {
  Pickaxe,
  Wrench,
  Layers,
  Shield,
  Hammer,
  HelpCircle,
  FileSpreadsheet,
  CheckCircle,
  Compass,
  Building,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface SupportRecommendationsProps {
  method: ClassificationMethod;
  rockClass: RockClassInfo;
  qResult: QCalculationResult;
  span: number;
  rmr: number;
  lang: 'fa' | 'en';
}

export const SupportRecommendations: React.FC<SupportRecommendationsProps> = ({
  method,
  rockClass,
  qResult,
  span,
  rmr,
  lang,
}) => {
  const isFa = lang === 'fa';
  const [activeSystem, setActiveSystem] = useState<'rmr' | 'q'>(method === 'q' ? 'q' : 'rmr');
  const [activeView, setActiveView] = useState<'current' | 'fullTable'>('current');

  return (
    <div
      id="support-recommendations-panel"
      className="bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              {isFa
                ? 'دستورالعمل حفاری و طراحی سیستم نگهداری تجربی'
                : 'Empirical Excavation & Support Guidelines'}
            </h2>
            <p className="text-xs text-slate-400">
              {isFa
                ? `پیشنهادات اجرایی بر اساس سیستم‌های بینیاوسکی (۱۹۸۹) و بارتون (NGI Q-System)`
                : `Recommended support system based on Bieniawski and Barton Q-System`}
            </p>
          </div>
        </div>

        {/* Support system toggle and View switch */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Method toggle if in dual mode */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveSystem('rmr')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                activeSystem === 'rmr'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isFa ? 'نگهداری RMR بینیاوسکی' : 'RMR 1989'}
            </button>
            <button
              onClick={() => setActiveSystem('q')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                activeSystem === 'q'
                  ? 'bg-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isFa ? 'نگهداری Q بارتون (NGI)' : 'Barton Q'}
            </button>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveView('current')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                activeView === 'current'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isFa ? 'رده فعلی' : 'Current'}
            </button>
            <button
              onClick={() => setActiveView('fullTable')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                activeView === 'fullTable'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isFa ? 'ماتریس کامل' : 'Full Matrix'}
            </button>
          </div>
        </div>
      </div>

      {/* RMR SYSTEM SUPPORT */}
      {activeSystem === 'rmr' && (
        <>
          {/* Validity Scope Banner for RMR Table 4 */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-950/80 to-slate-950/60 border border-amber-500/40 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {isFa
                  ? 'محدوده اعتبار سیستم نگهداری تجربی RMR بینیاوسکی (Bieniawski 1989):'
                  : 'Validity Scope of Bieniawski (1989) Empirical Support:'}
              </span>
            </div>
            <p className="text-amber-100/95 leading-relaxed font-semibold bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
              {isFa
                ? 'این روش برای تونل نعل اسبی با دهانه ۱۰ متر، تنش قائم کمتر از ۲۵ مگاپاسکال و روش ساخت حفاری و انفجار معتبر است.'
                : 'This method is valid for horseshoe-shaped tunnels with a 10 m span, vertical stress of less than 25 MPa, and drill & blast construction method.'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-900/90 border border-amber-500/20 flex flex-col">
                <span className="text-slate-400 text-[10px]">{isFa ? 'شکل مقطع:' : 'Shape:'}</span>
                <span className="text-slate-100 font-bold">{isFa ? 'نعل اسبی (Horseshoe)' : 'Horseshoe'}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/90 border border-amber-500/20 flex flex-col">
                <span className="text-slate-400 text-[10px]">{isFa ? 'دهانه مبنا:' : 'Reference Span:'}</span>
                <span className="text-amber-300 font-bold font-mono">{isFa ? '۱۰ متر' : '10 m'}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/90 border border-amber-500/20 flex flex-col">
                <span className="text-slate-400 text-[10px]">{isFa ? 'حداکثر تنش قائم:' : 'Max Stress:'}</span>
                <span className="text-amber-300 font-bold font-mono">{isFa ? '< ۲۵ مگاپاسکال' : '< 25 MPa'}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/90 border border-amber-500/20 flex flex-col">
                <span className="text-slate-400 text-[10px]">{isFa ? 'روش ساخت:' : 'Method:'}</span>
                <span className="text-slate-100 font-bold">{isFa ? 'حفاری و انفجار (D&B)' : 'Drill & Blast'}</span>
              </div>
            </div>
          </div>

          {activeView === 'current' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                {/* Excavation Method */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Pickaxe className="w-4 h-4" />
                    <span>{isFa ? 'روش و گام حفاری (Excavation Method):' : 'Excavation Method:'}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {isFa ? rockClass.excavationMethodFa : rockClass.excavationMethodEn}
                  </p>
                </div>

                {/* Rock Bolts */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sky-400 font-bold">
                    <Hammer className="w-4 h-4" />
                    <span>{isFa ? 'بولت‌گذاری و مهاربندی (Rock Bolts):' : 'Rock Bolts (20mm diam., fully grouted):'}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {isFa ? rockClass.rockBoltsFa : rockClass.rockBoltsEn}
                  </p>
                </div>

                {/* Shotcrete */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Layers className="w-4 h-4" />
                    <span>{isFa ? 'بتن پاشنده / شاتکریت (Shotcrete):' : 'Shotcrete:'}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {isFa ? rockClass.shotcreteFa : rockClass.shotcreteEn}
                  </p>
                </div>

                {/* Steel Sets / Ribs */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <Shield className="w-4 h-4" />
                    <span>{isFa ? 'قاب‌های فولادی و کف‌بند (Steel Sets / Invert):' : 'Steel Sets:'}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {isFa ? rockClass.steelSetsFa : rockClass.steelSetsEn}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Full RMR Matrix */
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 text-[11px]">
                    <th className="p-2.5 text-right font-bold">{isFa ? 'رده سنگ' : 'Rock Class'}</th>
                    <th className="p-2.5 text-right font-bold">{isFa ? 'RMR' : 'RMR'}</th>
                    <th className="p-2.5 text-right font-bold">{isFa ? 'روش حفاری' : 'Excavation'}</th>
                    <th className="p-2.5 text-right font-bold">{isFa ? 'راک بولت' : 'Rockbolts'}</th>
                    <th className="p-2.5 text-right font-bold">{isFa ? 'شاتکریت' : 'Shotcrete'}</th>
                    <th className="p-2.5 text-right font-bold">{isFa ? 'قاب فلزی' : 'Steel Sets'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                  {Object.values(ROCK_CLASSES).map((rc) => {
                    const isSelected = rockClass.id === rc.id;
                    return (
                      <tr
                        key={rc.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-slate-800/80 font-medium' : 'hover:bg-slate-900'
                        }`}
                      >
                        <td className="p-2.5 text-right font-bold flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: rc.color }} />
                          <span>{rc.code} ({isFa ? rc.nameFa : rc.nameEn})</span>
                        </td>
                        <td className="p-2.5 text-right font-mono">{rc.rmrRange[0]} - {rc.rmrRange[1]}</td>
                        <td className="p-2.5 text-right">{isFa ? rc.excavationMethodFa : rc.excavationMethodEn}</td>
                        <td className="p-2.5 text-right">{isFa ? rc.rockBoltsFa : rc.rockBoltsEn}</td>
                        <td className="p-2.5 text-right">{isFa ? rc.shotcreteFa : rc.shotcreteEn}</td>
                        <td className="p-2.5 text-right">{isFa ? rc.steelSetsFa : rc.steelSetsEn}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* BARTON Q-SYSTEM SUPPORT */}
      {activeSystem === 'q' && (
        <>
          {activeView === 'current' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                {/* Q Category Summary */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400 font-bold">
                    <Compass className="w-4 h-4" />
                    <span>{isFa ? 'رده نگهداری بارتون و گریمستاد:' : 'Barton & Grimstad Category:'}</span>
                  </div>
                  <p className="text-slate-100 font-semibold leading-relaxed">
                    {isFa ? qResult.supportGuidelineFa.category : qResult.supportGuidelineEn.category}
                  </p>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {isFa ? qResult.supportGuidelineFa.summary : qResult.supportGuidelineEn.summary}
                  </p>
                </div>

                {/* Rock Bolts Specification */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Hammer className="w-4 h-4" />
                    <span>{isFa ? 'مشخصات و طول راک‌بولت (L):' : 'Rockbolt Design (L):'}</span>
                  </div>
                  <p className="text-slate-100 font-mono font-bold">
                    L = 2 + 0.15 × (Span / ESR) = {qResult.boltLength} {isFa ? 'متر' : 'm'}
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    {isFa ? qResult.supportGuidelineFa.boltSpacing : qResult.supportGuidelineEn.boltSpacing}
                  </p>
                </div>

                {/* Fiber-reinforced Shotcrete */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Layers className="w-4 h-4" />
                    <span>{isFa ? 'ضخامت شاتکریت الیافی (Fiber Shotcrete):' : 'Fiber-Reinforced Shotcrete:'}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {isFa ? qResult.supportGuidelineFa.shotcreteThickness : qResult.supportGuidelineEn.shotcreteThickness}
                  </p>
                </div>

                {/* S_max & Stability Metrics */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sky-400 font-bold">
                    <Shield className="w-4 h-4" />
                    <span>{isFa ? 'ابعاد بحرانی و نسبت پایداری:' : 'Critical Dimensions & Stability:'}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {isFa
                      ? `حداکثر دهانه خودایستا بدون نگهداری S_max برابر با ${qResult.maxUnsupportedSpan} متر است. نسبت پایداری: ${qResult.stabilityRatio}`
                      : `Max unsupported span S_max is ${qResult.maxUnsupportedSpan}m. Stability ratio: ${qResult.stabilityRatio}`}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Full Q Matrix */
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 text-[11px]">
                    <th className="p-2.5 text-right font-bold">{isFa ? 'رده کیفی بارتون' : 'Barton Quality'}</th>
                    <th className="p-2.5 text-right font-bold">{isFa ? 'بازه Q' : 'Q Range'}</th>
                    <th className="p-2.5 text-right font-bold">{isFa ? 'رده نگهداری NGI' : 'NGI Support Category'}</th>
                    <th className="p-2.5 text-right font-bold">{isFa ? 'توضیحات سنگ' : 'Description'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                  {Object.values(Q_CLASSES).map((qc) => {
                    const isSelected = qResult.qClass.id === qc.id;
                    return (
                      <tr
                        key={qc.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-slate-800/80 font-medium' : 'hover:bg-slate-900'
                        }`}
                      >
                        <td className="p-2.5 text-right font-bold flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: qc.color }} />
                          <span>{isFa ? qc.nameFa : qc.nameEn}</span>
                        </td>
                        <td className="p-2.5 text-right font-mono">{qc.qRange[0]} - {qc.qRange[1]}</td>
                        <td className="p-2.5 text-right">{isFa ? qc.supportCategoryFa : qc.supportCategoryEn}</td>
                        <td className="p-2.5 text-right text-slate-400">{isFa ? qc.descriptionFa : qc.descriptionEn}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Practical Geotechnical Note */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
        <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed space-y-1">
          <p>
            {isFa
              ? 'توجه مهندسی: سیستم‌های تجربی بینیاوسکی (RMR) و بارتون (Q) از معتبرترین استانداردهای بین‌المللی برای برآورد اولیه زمان خودپایداری و طراحی نگهداری تونل‌ها هستند.'
              : 'Engineering Note: Cross-referencing Bieniawski (RMR) and Barton (Q) empirical systems provides high geotechnical reliability for preliminary underground excavation support design.'}
          </p>
          <p className="text-amber-300/90 font-medium">
            {isFa
              ? '• یادداشت کاربرد RMR: این روش برای تونل نعل اسبی با دهانه ۱۰ متر، تنش قائم کمتر از ۲۵ مگاپاسکال و روش ساخت حفاری و انفجار معتبر است.'
              : '• RMR Applicability Note: This method is valid for horseshoe-shaped tunnels with a 10 m span, vertical stress of less than 25 MPa, and drill & blast construction method.'}
          </p>
        </div>
      </div>
    </div>
  );
};
