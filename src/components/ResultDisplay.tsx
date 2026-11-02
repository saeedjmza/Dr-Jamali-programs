import React, { useState } from 'react';
import { CalculationResult, QCalculationResult, ClassificationMethod } from '../types';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  Layers,
  ArrowRight,
  Copy,
  Check,
  CheckCircle,
  TrendingUp,
  Maximize2,
  Scale,
  Compass,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResultDisplayProps {
  method: ClassificationMethod;
  rmrResult: CalculationResult;
  qResult: QCalculationResult;
  lang: 'fa' | 'en';
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  method,
  rmrResult,
  qResult,
  lang,
}) => {
  const isFa = lang === 'fa';
  const [copied, setCopied] = useState(false);

  const triggerConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#3b82f6', '#14b8a6'],
    });
  };

  const handleCopySummary = () => {
    let text = '';
    if (method === 'rmr') {
      text = isFa
        ? `📊 نتایج ارزیابی ژئومکانیکی تونل (بینیاوسکی ۱۹۸۹):
🔹 دهانه بدون نگهداری: ${rmrResult.span} متر
🔹 رتبه RMR: ${rmrResult.rmr} (${rmrResult.rockClass.nameFa})
⏱️ زمان خودایستایی: ${rmrResult.formattedTimeFa}
🏗️ حداکثر دهانه خودایستای مجاز: ${rmrResult.maxAllowableSpan.toFixed(1)} متر
🛡️ چسبندگی: ${rmrResult.rockClass.cohesionKPa} | زاویه اصطکاک داخلی: ${rmrResult.rockClass.frictionAngleDeg}
📌 روش حفاری: ${rmrResult.rockClass.excavationMethodFa}`
        : `📊 Geomechanical Tunnel Assessment (Bieniawski 1989):
🔹 Unsupported Span: ${rmrResult.span} m
🔹 RMR Rating: ${rmrResult.rmr} (${rmrResult.rockClass.nameEn})
⏱️ Stand-up Time: ${rmrResult.formattedTimeEn}
🏗️ Max Allowable Span: ${rmrResult.maxAllowableSpan.toFixed(1)} m
🛡️ Cohesion: ${rmrResult.rockClass.cohesionKPa} | Friction Angle: ${rmrResult.rockClass.frictionAngleDeg}
📌 Excavation: ${rmrResult.rockClass.excavationMethodEn}`;
    } else if (method === 'q') {
      text = isFa
        ? `📊 نتایج ارزیابی ژئومکانیکی تونل (سیستم Q بارتون):
🔹 دهانه حفاری: ${qResult.span} متر (ضریب ESR: ${qResult.esr})
🔹 شاخص کیفی Q: ${qResult.qValue} (${qResult.qClass.nameFa})
🔹 ابعاد معادل De: ${qResult.equivalentDimension} متر
⏱️ زمان خودایستایی تخمینی: ${qResult.formattedTimeFa}
🏗️ حداکثر دهانه خودایستا (Smax = 2*ESR*Q^0.4): ${qResult.maxUnsupportedSpan} متر
🛡️ ضریب پایداری: ${qResult.stabilityRatio} (${qResult.isSelfSupporting ? 'پایدار' : 'نیازمند نگهداری'})
📐 طول پیشنهادی راک‌بولت: ${qResult.boltLength} متر
📌 دستورالعمل نگهداری: ${qResult.supportGuidelineFa.summary}`
        : `📊 Geomechanical Tunnel Assessment (Barton Q-System):
🔹 Excavation Span: ${qResult.span} m (ESR: ${qResult.esr})
🔹 Rock Quality Q: ${qResult.qValue} (${qResult.qClass.nameEn})
🔹 Equivalent Dimension De: ${qResult.equivalentDimension} m
⏱️ Stand-up Time: ${qResult.formattedTimeEn}
🏗️ Max Unsupported Span: ${qResult.maxUnsupportedSpan} m
🛡️ Stability Ratio: ${qResult.stabilityRatio} (${qResult.isSelfSupporting ? 'Self-supporting' : 'Support required'})
📐 Recommended Bolt Length: ${qResult.boltLength} m
📌 Support: ${qResult.supportGuidelineEn.summary}`;
    } else {
      // Both
      text = isFa
        ? `📊 تحلیل مقایسه‌ای جامع ژئومکانیکی تونل (RMR بینیاوسکی و Q بارتون):
🔹 مشخصات مقطع: دهانه ${rmrResult.span} متر | ضریب ESR = ${qResult.esr}
---------------------------------
🔸 نتایج بینیاوسکی (RMR = ${rmrResult.rmr}):
   • رده توده سنگ: ${rmrResult.rockClass.nameFa}
   • زمان خودایستایی: ${rmrResult.formattedTimeFa}
   • حداکثر دهانه مجاز: ${rmrResult.maxAllowableSpan.toFixed(1)} متر
---------------------------------
🔸 نتایج بارتون (Q = ${qResult.qValue}):
   • رده کیفی بارتون: ${qResult.qClass.nameFa}
   • ابعاد معادل De: ${qResult.equivalentDimension} متر
   • حداکثر دهانه خودایستا (Smax): ${qResult.maxUnsupportedSpan} متر
   • زمان خودایستایی: ${qResult.formattedTimeFa}
   • طول راک‌بولت: ${qResult.boltLength} متر
---------------------------------
📌 وضعیت نهایی پایداری: ${qResult.isSelfSupporting ? 'خودایستا و ایمن' : 'نیازمند نصب نگهداری مهندسی'}`
        : `📊 Comprehensive Tunnel Geomechanical Comparison (RMR & Q):
🔹 Excavation Span: ${rmrResult.span} m | ESR: ${qResult.esr}
🔸 Bieniawski RMR (${rmrResult.rmr}): Stand-up Time = ${rmrResult.formattedTimeEn} | Max Span = ${rmrResult.maxAllowableSpan.toFixed(1)}m
🔸 Barton Q (${qResult.qValue}): Stand-up Time = ${qResult.formattedTimeEn} | Max Span = ${qResult.maxUnsupportedSpan}m
📌 Final Stability: ${qResult.isSelfSupporting ? 'Self-supporting' : 'Support Installation Required'}`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Status badges
  const getStatusBadge = (status: 'safe' | 'warning' | 'critical' | 'impossible') => {
    switch (status) {
      case 'impossible':
        return {
          icon: <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />,
          titleFa: 'فراتر از حد مجاز خودایستایی (ناپایداری آنی)',
          titleEn: 'Exceeds Allowable Envelope (Immediate Failure)',
          bg: 'bg-rose-950/40 border-rose-800/80 text-rose-200',
        };
      case 'critical':
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          titleFa: 'نیازمند نصب سریع نگهداری اولیه',
          titleEn: 'Requires Rapid Support Installation',
          bg: 'bg-amber-950/40 border-amber-800/80 text-amber-200',
        };
      case 'safe':
      default:
        return {
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />,
          titleFa: 'پایداری مناسب و خودایستایی ایمن',
          titleEn: 'Adequate Stability & Safe Stand-up Time',
          bg: 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200',
        };
    }
  };

  const activeResult = method === 'q' ? qResult : rmrResult;
  const statusBadge = getStatusBadge(activeResult.status);

  return (
    <div
      id="result-display-panel"
      className="bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5 relative overflow-hidden"
    >
      {/* Background ambient glow */}
      <div
        className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-700"
        style={{
          backgroundColor:
            method === 'q'
              ? qResult.qClass.color
              : rmrResult.rockClass.color,
        }}
      />

      {/* Header with Title & Copy button */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              {isFa ? 'زمان خودایستایی و وضعیت پایداری' : 'Stand-up Time & Stability'}
            </h2>
            <p className="text-xs text-slate-400">
              {method === 'rmr'
                ? isFa ? 'خروجی مدل تجربی بینیاوسکی (RMR)' : 'Bieniawski (1989) Empirical Model'
                : method === 'q'
                ? isFa ? 'خروجی مدل ژئومکانیکی شاخص Q بارتون' : 'Barton Q-System Analytical Output'
                : isFa ? 'مقایسه خروجی‌های RMR و Q' : 'Dual RMR & Q System Comparison'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(rmrResult.rmr >= 70 || qResult.qValue >= 40) && (
            <button
              onClick={triggerConfetti}
              title={isFa ? 'کیفیت سنگ عالی!' : 'Great rock quality!'}
              className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleCopySummary}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{isFa ? 'کپی شد' : 'Copied'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{isFa ? 'کپی نتایج' : 'Copy'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SINGLE METHOD VIEW: RMR */}
      {method === 'rmr' && (
        <div className="space-y-4">
          <div
            className="rounded-2xl p-5 border text-center relative overflow-hidden transition-all duration-500"
            style={{
              backgroundColor: rmrResult.rockClass.bgColor,
              borderColor: rmrResult.rockClass.borderColor,
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
              {isFa ? 'زمان خودایستایی تخمینی دهانه (Stand-up Time)' : 'Estimated Stand-up Time'}
            </span>

            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-100 py-1 drop-shadow-md flex items-center justify-center gap-2">
              <span>{isFa ? rmrResult.formattedTimeFa : rmrResult.formattedTimeEn}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-medium text-slate-300">
              <span className="bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-800/80">
                {isFa ? 'رده توده‌سنگ:' : 'Rock Class:'}{' '}
                <strong style={{ color: rmrResult.rockClass.color }}>
                  {rmrResult.rockClass.code} ({isFa ? rmrResult.rockClass.nameFa : rmrResult.rockClass.nameEn})
                </strong>
              </span>
              <span className="bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-800/80">
                {isFa ? 'حداکثر دهانه خودایستا:' : 'Max Allowable Span:'}{' '}
                <strong className="text-amber-300">{rmrResult.maxAllowableSpan.toFixed(1)} {isFa ? 'متر' : 'm'}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
              <span className="text-slate-400">{isFa ? 'چسبندگی (Cohesion):' : 'Cohesion:'}</span>
              <span className="font-mono font-bold text-slate-200 text-sm mt-1">{rmrResult.rockClass.cohesionKPa}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
              <span className="text-slate-400">{isFa ? 'زاویه اصطکاک (Friction Angle):' : 'Friction Angle:'}</span>
              <span className="font-mono font-bold text-slate-200 text-sm mt-1">{rmrResult.rockClass.frictionAngleDeg}</span>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE METHOD VIEW: BARTON Q */}
      {method === 'q' && (
        <div className="space-y-4">
          <div
            className="rounded-2xl p-5 border text-center relative overflow-hidden transition-all duration-500"
            style={{
              backgroundColor: qResult.qClass.bgColor,
              borderColor: qResult.qClass.borderColor,
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
              {isFa ? 'زمان خودایستایی بر اساس شاخص Q بارتون' : 'Barton Q-System Stand-up Time'}
            </span>

            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-100 py-1 drop-shadow-md flex items-center justify-center gap-2">
              <span>{isFa ? qResult.formattedTimeFa : qResult.formattedTimeEn}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-medium text-slate-300">
              <span className="bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-800/80">
                {isFa ? 'رده کیفی:' : 'Quality:'}{' '}
                <strong style={{ color: qResult.qClass.textColor }}>
                  {isFa ? qResult.qClass.nameFa : qResult.qClass.nameEn}
                </strong>
              </span>
              <span className="bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-800/80">
                {isFa ? 'ابعاد معادل De:' : 'De:'}{' '}
                <strong className="text-teal-300">{qResult.equivalentDimension} {isFa ? 'متر' : 'm'}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between min-h-[72px]">
              <span className="text-slate-400 text-[11px] leading-tight">{isFa ? 'حداکثر دهانه خودایستا:' : 'Max Unsupported Span:'}</span>
              <span className="font-mono font-bold text-emerald-400 text-sm mt-1.5">{qResult.maxUnsupportedSpan} m</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between min-h-[72px]">
              <span className="text-slate-400 text-[11px] leading-tight">{isFa ? 'ضریب پایداری دهانه:' : 'Stability Ratio:'}</span>
              <span className={`font-mono font-bold text-sm mt-1.5 ${qResult.stabilityRatio >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {qResult.stabilityRatio} {qResult.stabilityRatio >= 1.0 ? (isFa ? '(ایمن)' : '(Safe)') : (isFa ? '(بحرانی)' : '(Critical)')}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between min-h-[72px]">
              <span className="text-slate-400 text-[11px] leading-tight">{isFa ? 'طول راک‌بولت (L):' : 'Bolt Length (L):'}</span>
              <span className="font-mono font-bold text-amber-400 text-sm mt-1.5">{qResult.boltLength} m</span>
            </div>
          </div>
        </div>
      )}

      {/* DUAL METHOD VIEW: BOTH */}
      {method === 'both' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* RMR Box */}
            <div
              className="p-4 rounded-xl border text-center relative overflow-hidden"
              style={{
                backgroundColor: rmrResult.rockClass.bgColor,
                borderColor: rmrResult.rockClass.borderColor,
              }}
            >
              <span className="text-[11px] font-bold text-slate-300 flex items-center justify-center gap-1 mb-1">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                <span>{isFa ? 'روش بینیاوسکی (RMR)' : 'Bieniawski RMR'}</span>
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-100 py-1">
                {isFa ? rmrResult.formattedTimeFa : rmrResult.formattedTimeEn}
              </div>
              <div className="text-[11px] text-slate-300 mt-1 font-mono">
                RMR = {rmrResult.rmr} | S_max = {rmrResult.maxAllowableSpan.toFixed(1)}m
              </div>
            </div>

            {/* Q-System Box */}
            <div
              className="p-4 rounded-xl border text-center relative overflow-hidden"
              style={{
                backgroundColor: qResult.qClass.bgColor,
                borderColor: qResult.qClass.borderColor,
              }}
            >
              <span className="text-[11px] font-bold text-slate-300 flex items-center justify-center gap-1 mb-1">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                <span>{isFa ? 'روش بارتون (Q-System)' : 'Barton Q-System'}</span>
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-100 py-1">
                {isFa ? qResult.formattedTimeFa : qResult.formattedTimeEn}
              </div>
              <div className="text-[11px] text-slate-300 mt-1 font-mono">
                Q = {qResult.qValue} | S_max = {qResult.maxUnsupportedSpan}m
              </div>
            </div>
          </div>

          {/* Equivalence Cross-Check Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-indigo-400" />
              <span>{isFa ? 'معادل‌سازی بینیاوسکی و بارتون:' : 'RMR - Q Equivalence:'}</span>
            </span>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                RMR_eq = 9 ln(Q) + 44 = <strong>{qResult.equivalentRmrBieniawski}</strong>
              </span>
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                Q_eq = exp((RMR-44)/9)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Geomechanical Status Alert Strip */}
      <div className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${statusBadge.bg}`}>
        {statusBadge.icon}
        <div className="flex-1">
          <h4 className="font-bold text-xs">
            {isFa ? statusBadge.titleFa : statusBadge.titleEn}
          </h4>
          <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
            {isFa ? activeResult.statusMessageFa : activeResult.statusMessageEn}
          </p>
        </div>
      </div>
    </div>
  );
};
