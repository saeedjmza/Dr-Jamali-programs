import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { GeotechnicalConsistencyReport } from '../utils/consistencyValidation';

interface GeotechnicalWarningBannerProps {
  report: GeotechnicalConsistencyReport;
  currentRmr: number;
  currentGsi: number;
  currentQ?: number;
  onSyncGsiFromRmr?: (newGsi: number) => void;
  onSyncRmrFromGsi?: (newRmr: number) => void;
  onSyncQFromRmr?: (newQ: number) => void;
  onSyncQFromGsi?: (newQ: number) => void;
  onSyncRmrFromQ?: (newRmr: number) => void;
  onSyncGsiFromQ?: (newGsi: number) => void;
  onSyncAllToRmr?: () => void;
  lang: 'fa' | 'en';
  variant?: 'full' | 'compact';
}

export const GeotechnicalWarningBanner: React.FC<GeotechnicalWarningBannerProps> = ({
  report,
  currentRmr,
  currentGsi,
  currentQ,
  onSyncGsiFromRmr,
  onSyncRmrFromGsi,
  onSyncQFromRmr,
  onSyncQFromGsi,
  onSyncRmrFromQ,
  onSyncGsiFromQ,
  onSyncAllToRmr,
  lang,
  variant = 'full',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  if (!report.hasConflict || isDismissed) {
    return null;
  }

  const isFa = lang === 'fa';
  const isCritical = report.severity === 'critical';
  const primaryIssue = report.primaryIssue;

  const borderColor = isCritical ? 'border-rose-500/60' : 'border-amber-500/50';
  const bgGradient = isCritical
    ? 'from-rose-950/70 via-slate-950/95 to-slate-950/80 shadow-rose-950/30'
    : 'from-amber-950/50 via-slate-950/95 to-slate-950/80 shadow-amber-950/20';
  const titleColor = isCritical ? 'text-rose-300' : 'text-amber-300';
  const badgeBg = isCritical
    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    : 'bg-amber-500/20 text-amber-300 border-amber-500/40';

  // Dynamic Header Title
  const getBannerTitle = () => {
    if (report.hasQConflict && report.hasRmrGsiConflict) {
      return isFa
        ? 'هشدار تضاد چندگانه پارامترها: شاخص‌های RMR، Q و GSI با یکدیگر همخوانی ندارند'
        : 'Multiple Geotechnical Inconsistencies: RMR, Barton Q & GSI Contradict Each Other';
    }
    if (report.hasQConflict) {
      return isFa
        ? `هشدار عدم تطابق ژئوتکنیکی: شاخص Q بارتون (${currentQ}) با RMR (${currentRmr}) یا GSI (${currentGsi}) تطابق ندارد`
        : `Geotechnical Conflict: Barton Q (${currentQ}) contradicts RMR (${currentRmr}) or GSI (${currentGsi})`;
    }
    return isFa
      ? 'هشدار عدم تطابق پارامترهای ورودی: شاخص‌های RMR و GSI همخوانی ندارند'
      : 'Geotechnical Inconsistency Warning: RMR & GSI Parameters Do Not Match';
  };

  if (variant === 'compact') {
    return (
      <div
        id="geotechnical-mismatch-warning-compact"
        className={`p-3 rounded-xl bg-gradient-to-r ${bgGradient} border ${borderColor} text-xs shadow-md transition-all`}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 min-w-0">
            {isCritical ? (
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className={`font-bold ${titleColor} truncate`}>
              {getBannerTitle()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {report.hasQConflict && onSyncQFromRmr && (
              <button
                onClick={() => onSyncQFromRmr(report.expectedQFromRmr)}
                className="px-2 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-200 text-[10.5px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                title={isFa ? 'تطبیق خودکار Q با RMR' : 'Sync Q to RMR'}
              >
                <ArrowRightLeft className="w-3 h-3 text-teal-400" />
                <span>Q → {report.expectedQFromRmr}</span>
              </button>
            )}
            {report.hasRmrGsiConflict && onSyncGsiFromRmr && (
              <button
                onClick={() => onSyncGsiFromRmr(report.expectedGsiFromRmr)}
                className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-[10.5px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                title={isFa ? 'تطبیق خودکار GSI با RMR' : 'Sync GSI from RMR'}
              >
                <ArrowRightLeft className="w-3 h-3 text-amber-400" />
                <span>GSI → {report.expectedGsiFromRmr}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="geotechnical-mismatch-warning-banner"
      className={`rounded-2xl bg-gradient-to-r ${bgGradient} border ${borderColor} shadow-xl overflow-hidden transition-all duration-300`}
    >
      {/* Header Bar */}
      <div className="p-4 sm:p-4.5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isCritical
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
                : 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
            }`}
          >
            {isCritical ? (
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md border font-mono ${badgeBg}`}>
                {isCritical ? (isFa ? 'تناقض شدید ژئوتکنیکی' : 'CRITICAL CONFLICT') : (isFa ? 'عدم تطابق پارامترها' : 'PARAMETER MISMATCH')}
              </span>
              <h3 className={`text-sm sm:text-base font-bold ${titleColor} leading-snug`}>
                {getBannerTitle()}
              </h3>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed font-medium">
              {primaryIssue ? (isFa ? primaryIssue.messageFa : primaryIssue.messageEn) : ''}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
            title={isExpanded ? (isFa ? 'بستن جزئیات' : 'Collapse') : (isFa ? 'نمایش جزئیات' : 'Expand')}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
            title={isFa ? 'بستن موقت پیام' : 'Dismiss'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Details & Reconcile Actions */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 sm:px-5 sm:pb-5 space-y-3.5 border-t border-slate-800/60 text-xs">
          {/* Comparison Cards Matrix (4 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* RMR Box */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-slate-400 text-[11px] mb-1 font-medium">
                  {isFa ? 'شاخص RMR بینیاوسکی:' : 'Bieniawski RMR:'}
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-lg font-bold text-sky-400">{currentRmr}</span>
                  <span className="text-[11px] text-slate-300 font-medium">
                    {currentRmr >= 61
                      ? (isFa ? 'رده I / II (خوب)' : 'Class I/II (Good)')
                      : currentRmr >= 41
                      ? (isFa ? 'رده III (متوسط)' : 'Class III (Fair)')
                      : (isFa ? 'رده IV / V (ضعیف)' : 'Class IV/V (Poor)')}
                  </span>
                </div>
              </div>
              <div className="text-[10.5px] text-slate-400 mt-2 border-t border-slate-800/60 pt-1 space-y-0.5">
                <div>{isFa ? `انتظار GSI: حدود ${report.expectedGsiFromRmr}` : `Expected GSI: ~${report.expectedGsiFromRmr}`}</div>
                <div>{isFa ? `انتظار Q: حدود ${report.expectedQFromRmr}` : `Expected Q: ~${report.expectedQFromRmr}`}</div>
              </div>
            </div>

            {/* Barton Q Box */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-slate-400 text-[11px] mb-1 font-medium">
                  {isFa ? 'شاخص Q بارتون:' : 'Barton Q-System:'}
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-lg font-bold text-teal-400">{currentQ ?? '-'}</span>
                  <span className="text-[11px] text-slate-300 font-medium">
                    {currentQ !== undefined ? (
                      currentQ >= 10
                        ? (isFa ? 'سنگ خوب / عالی' : 'Good/Excellent')
                        : currentQ >= 1
                        ? (isFa ? 'سنگ متوسط / ضعیف' : 'Fair/Poor')
                        : (isFa ? 'سنگ بسیار ضعیف / خردشده' : 'Very/Extremely Poor')
                    ) : ''}
                  </span>
                </div>
              </div>
              <div className="text-[10.5px] text-slate-400 mt-2 border-t border-slate-800/60 pt-1 space-y-0.5">
                <div>{isFa ? `معادل RMR: حدود ${report.equivalentRmrFromQ}` : `Equivalent RMR: ~${report.equivalentRmrFromQ}`}</div>
                <div>{isFa ? `معادل GSI: حدود ${report.equivalentGsiFromQ}` : `Equivalent GSI: ~${report.equivalentGsiFromQ}`}</div>
              </div>
            </div>

            {/* GSI Box */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-slate-400 text-[11px] mb-1 font-medium">
                  {isFa ? 'شاخص مقاومت GSI:' : 'Hoek-Brown GSI:'}
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-lg font-bold text-purple-400">{currentGsi}</span>
                  <span className="text-[11px] text-slate-300 font-medium">
                    {currentGsi >= 65
                      ? (isFa ? 'یکپارچه / مرغوب' : 'Massive / High')
                      : currentGsi >= 40
                      ? (isFa ? 'بلوکی / متوسط' : 'Blocky / Fair')
                      : (isFa ? 'خردشده / متلاشی' : 'Disintegrated')}
                  </span>
                </div>
              </div>
              <div className="text-[10.5px] text-slate-400 mt-2 border-t border-slate-800/60 pt-1 space-y-0.5">
                <div>{isFa ? `انتظار RMR: حدود ${report.expectedRmrFromGsi}` : `Expected RMR: ~${report.expectedRmrFromGsi}`}</div>
                <div>{isFa ? `انتظار Q: حدود ${report.expectedQFromGsi}` : `Expected Q: ~${report.expectedQFromGsi}`}</div>
              </div>
            </div>

            {/* Discrepancy & Status Box */}
            <div
              className={`p-3 rounded-xl border flex flex-col justify-between ${
                isCritical
                  ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                  : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
              }`}
            >
              <div>
                <div className="text-[11px] opacity-80 mb-1 font-medium">
                  {isFa ? 'وضعیت تطابق مهندسی:' : 'Geotechnical Consistency:'}
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-base font-bold">
                    {report.hasQConflict && report.hasRmrGsiConflict
                      ? (isFa ? 'تضاد چندگانه' : 'Multi-Conflict')
                      : report.hasQConflict
                      ? (isFa ? `اختلاف Q: ${report.rmrQDiff} واحد` : `Q-Diff: ${report.rmrQDiff} pts`)
                      : (isFa ? `اختلاف: ${report.rmrGsiDiff} واحد` : `Diff: ${report.rmrGsiDiff} pts`)}
                  </span>
                  <span className="text-[10.5px] font-bold">
                    {isCritical ? (isFa ? 'فاقد توجیه فیزیکی' : 'Inconsistent') : (isFa ? 'اختلاف بالا' : 'Deviation')}
                  </span>
                </div>
              </div>
              <div className="text-[10.5px] opacity-80 mt-2 border-t border-slate-800/60 pt-1">
                {report.hasQConflict
                  ? (isFa ? 'روابط تجربی بینیاوسکی (۱۹۷۶) و بارتون (۲۰۰۲)' : 'Bieniawski (1976) & Barton (2002)')
                  : (isFa ? 'معیار تجربی هوک و براون (۲۰۰۲)' : 'Hoek-Brown (2002) criterion')}
              </div>
            </div>
          </div>

          {/* Scientific Note */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11.5px] text-slate-300 flex items-start gap-2 leading-relaxed">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-amber-300">{isFa ? 'راهنمای حل تعارض ژئوتکنیکی: ' : 'Technical Guidance: '}</strong>
              {isFa
                ? 'شاخص‌های رده‌بندی ژئومکانیکی RMR، سیستم Q بارتون و GSI هوک همگی بیانگر کیفیت یک توده‌سنگ واحد هستند؛ بنابراین نمی‌توانند همزمان در دو قطب متضاد (مثلاً توده‌سنگ کاملاً ضعیف با RMR=10 و در عین حال سنگ بسیار مرغوب با Q=40 یا GSI=90) قرار گیرند. جهت دستیابی به محاسبات پایدار و طراحی دقیق نگهداری، لطفاً یکی از گزینه‌های هماهنگ‌سازی هوشمند زیر را انتخاب فرمایید:'
                : 'Empirical classification indices (RMR, Barton Q, and Hoek-Brown GSI) describe the engineering behavior of the identical rock mass; they cannot logically occupy contradicting extremes simultaneously. Please use the quick reconciliation buttons below to synchronize the parameters:'}
            </p>
          </div>

          {/* Reconcile Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-300 ml-1">
              {isFa ? 'عملیات تطبیق هوشمند:' : 'Quick Reconciliation:'}
            </span>

            {/* Sync Q to RMR */}
            {currentQ !== undefined && onSyncQFromRmr && report.hasQConflict && (
              <button
                onClick={() => onSyncQFromRmr(report.expectedQFromRmr)}
                className="px-3 py-1.5 rounded-lg bg-teal-600/25 hover:bg-teal-600/40 border border-teal-500/50 text-teal-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>
                  {isFa
                    ? `تطبیق Q بر اساس RMR (تنظیم Q = ${report.expectedQFromRmr})`
                    : `Sync Q to RMR (Set Q = ${report.expectedQFromRmr})`}
                </span>
              </button>
            )}

            {/* Sync GSI to RMR */}
            {onSyncGsiFromRmr && report.hasRmrGsiConflict && (
              <button
                onClick={() => onSyncGsiFromRmr(report.expectedGsiFromRmr)}
                className="px-3 py-1.5 rounded-lg bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/50 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  {isFa
                    ? `تطبیق GSI با RMR (تنظیم GSI = ${report.expectedGsiFromRmr})`
                    : `Sync GSI to RMR (Set GSI = ${report.expectedGsiFromRmr})`}
                </span>
              </button>
            )}

            {/* Sync RMR from Q */}
            {currentQ !== undefined && onSyncRmrFromQ && report.hasQConflict && (
              <button
                onClick={() => onSyncRmrFromQ(report.equivalentRmrFromQ)}
                className="px-3 py-1.5 rounded-lg bg-sky-600/25 hover:bg-sky-600/40 border border-sky-500/50 text-sky-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  {isFa
                    ? `تطبیق RMR با Q (تنظیم RMR = ${report.equivalentRmrFromQ})`
                    : `Sync RMR to Q (Set RMR = ${report.equivalentRmrFromQ})`}
                </span>
              </button>
            )}

            {/* Sync RMR from GSI */}
            {onSyncRmrFromGsi && report.hasRmrGsiConflict && (
              <button
                onClick={() => onSyncRmrFromGsi(report.expectedRmrFromGsi)}
                className="px-3 py-1.5 rounded-lg bg-sky-600/25 hover:bg-sky-600/40 border border-sky-500/50 text-sky-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  {isFa
                    ? `تطبیق RMR با GSI (تنظیم RMR = ${report.expectedRmrFromGsi})`
                    : `Sync RMR to GSI (Set RMR = ${report.expectedRmrFromGsi})`}
                </span>
              </button>
            )}

            {/* Master 1-Click Sync All to RMR */}
            {onSyncAllToRmr && (
              <button
                onClick={onSyncAllToRmr}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {isFa ? 'هماهنگ‌سازی کامل ۳ شاخص بر مبنای RMR' : 'Full Alignment (Sync All to RMR)'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
