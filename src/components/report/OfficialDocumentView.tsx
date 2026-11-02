/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Compass,
  FileText,
  Printer,
  Copy,
  Download,
  Check,
  Award,
  Calendar,
  Layers,
  Pickaxe,
  Clock,
  Shield,
  UserCheck,
  Weight,
  AlertTriangle,
  Wrench,
  Hammer,
} from 'lucide-react';
import { RockClassInfo, ReportSectionsConfig } from '../../types';
import { GroundwaterConditionKey, GROUNDWATER_CONDITIONS } from '../../utils/waterConditions';
import { AppLogo } from '../common/AppLogo';

interface OfficialDocumentViewProps {
  sections?: ReportSectionsConfig;
  span: number;
  depth: number;
  rmr: number;
  qValue: number;
  gsi: number;
  ucs: number;
  rqd: number;
  esr: number;
  unitWeight: number;
  kRatio: number;
  jointSpacing: number;
  jointSets?: number;
  pointLoadIs50: number;
  overburdenStress: number;
  de: number;
  rockClass: RockClassInfo;
  qResult: any;
  franklinResult: any;
  mechanizedResult: any;
  isakssonResult: any;
  weaverResult: any;
  rmrStandUpResult: any;
  qStandUpResult: any;
  supportDetailed: any;
  rmrSupportResult: any;
  rqdSupportResult: any;
  russoSupportResult: any;
  gsiSupportResult: any;
  terzaghiResult?: any;
  cordingResult?: any;
  bartonRockLoadResult?: any;
  hoekRockLoadResult?: any;
  kirschStressResult?: any;
  deereRockLoadResult?: any;
  rockLoadComparison?: any[];
  groundwaterCondition?: GroundwaterConditionKey;
  groundwaterRmr?: number;
  jw?: number;
  reportDateStr: string;
  isFa: boolean;
  onCopyToClipboard: () => void;
  onDownloadDocx: () => void;
  onDownloadPdf: () => void;
  onPrint: () => void;
  copied: boolean;
  docSheetRef?: React.RefObject<HTMLDivElement | null>;
  projectTitle?: string;
  onUpdateProjectTitle?: (val: string) => void;
  designerName?: string;
  onUpdateDesignerName?: (val: string) => void;
  designerTitle?: string;
  onUpdateDesignerTitle?: (val: string) => void;
  approverName?: string;
  onUpdateApproverName?: (val: string) => void;
  approverTitle?: string;
  onUpdateApproverTitle?: (val: string) => void;
}

export const OfficialDocumentView: React.FC<OfficialDocumentViewProps> = ({
  span,
  depth,
  rmr,
  qValue,
  gsi,
  ucs,
  rqd,
  esr,
  unitWeight,
  kRatio,
  jointSpacing,
  jointSets = 9,
  pointLoadIs50,
  overburdenStress,
  de,
  rockClass,
  qResult,
  franklinResult,
  mechanizedResult,
  isakssonResult,
  weaverResult,
  rmrStandUpResult,
  qStandUpResult,
  supportDetailed,
  rmrSupportResult,
  rqdSupportResult,
  russoSupportResult,
  gsiSupportResult,
  terzaghiResult,
  cordingResult,
  bartonRockLoadResult,
  hoekRockLoadResult,
  kirschStressResult,
  deereRockLoadResult,
  rockLoadComparison,
  groundwaterCondition = 'medium',
  groundwaterRmr = 10,
  jw = 0.66,
  reportDateStr,
  isFa,
  onCopyToClipboard,
  onDownloadDocx,
  onDownloadPdf,
  onPrint,
  copied,
  docSheetRef,
  sections,
  projectTitle = '',
  onUpdateProjectTitle,
  designerName = '',
  onUpdateDesignerName,
  designerTitle = '',
  onUpdateDesignerTitle,
  approverName = '',
  onUpdateApproverName,
  approverTitle = '',
  onUpdateApproverTitle,
}) => {
  const sfr = supportDetailed?.sfr || {};
  const effectiveRmrSupport = rmrSupportResult || rockClass || rmrStandUpResult?.rockClass;
  const docId = `GEO-REP-${depth}-${Math.round(rmr)}-${Math.round(qValue * 10)}`;

  const sec = {
    inputs: sections?.inputs ?? true,
    excavability: sections?.excavability ?? true,
    standUpTime: sections?.standUpTime ?? true,
    support: sections?.support ?? true,
    rockLoad: sections?.rockLoad ?? true,
    signatures: sections?.signatures ?? true,
  };

  const showPage1 = sec.inputs || sec.excavability || (!sec.standUpTime && !sec.support && !sec.rockLoad && !sec.signatures);
  const showPage2 = sec.standUpTime || sec.support;
  const showPage3 = sec.rockLoad || sec.signatures;

  const visiblePages: number[] = [];
  if (showPage1) visiblePages.push(1);
  if (showPage2) visiblePages.push(2);
  if (showPage3) visiblePages.push(3);
  const totalPages = Math.max(1, visiblePages.length);

  const getPageNum = (p: number) => {
    const idx = visiblePages.indexOf(p);
    return idx !== -1 ? idx + 1 : 1;
  };

  /**
   * Reusable Vertical Spine Margin Strip
   * Rendered on every A4 page with reversed orientation, lower page index, and without calibration note
   */
  const renderVerticalSpine = (pageNum: number, totalPages: number = 3) => (
    <div
      className="w-10 sm:w-11 bg-slate-100/90 border-r rtl:border-r-0 rtl:border-l border-slate-300 flex flex-col items-center justify-between pt-16 pb-12 shrink-0 select-none print:flex"
      style={{ minHeight: '100%' }}
    >
      {/* Top: Page index - brought down comfortably to be completely inside the box */}
      <div className="flex items-center justify-center my-4">
        <div
          className="text-[11px] font-mono font-bold text-slate-600 whitespace-nowrap"
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center center' }}
        >
          {isFa ? `صفحه ${pageNum} از ${totalPages}` : `Page ${pageNum} of ${totalPages}`}
        </div>
      </div>

      {/* Middle: Rotated Software and Developer identification - REVERSED direction (rotate(-90deg)) */}
      <div className="flex-1 flex items-center justify-center my-8 overflow-visible">
        <div
          className="text-[10.5px] font-medium text-slate-700 whitespace-nowrap"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center center',
            letterSpacing: 'normal',
            wordSpacing: 'normal',
          }}
        >
          {isFa
            ? 'نرم افزار طبقه بندی مهندسی سنگ و طراحی تونل بر اساس روش های تجربی، ورژن 1.0 توسعه دهنده سعید جمالی زواره'
            : 'Empirical Rock Mass Classification & Tunnel Design Software, Version 1.0 | Developer: Saeed Jamali Zavareh'}
        </div>
      </div>

      {/* Calibration notice removed as requested */}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Floating Control Strip (Hidden in Print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-slate-200">
            {isFa
              ? 'نمای سند رسمی مهندسی (فرمت استاندارد اداری A4 با پس‌زمینه سفید و حاشیه عمودی)'
              : 'Official Engineering Document View (A4 Standard Format, White Background & Vertical Spine)'}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onCopyToClipboard}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isFa ? 'کپی شد!' : 'Copied!') : (isFa ? 'کپی کل متن' : 'Copy All')}</span>
          </button>
          <button
            onClick={onDownloadDocx}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title={isFa ? 'دریافت فایل رسمی ورد Word (.docx)' : 'Download Word DOCX (.docx)'}
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>{isFa ? 'دریافت Word (.docx)' : 'Word (.docx)'}</span>
          </button>
          <button
            onClick={onDownloadPdf}
            className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title={isFa ? 'دریافت فایل PDF مستقیم' : 'Download Direct PDF'}
          >
            <Download className="w-3.5 h-3.5 text-rose-200" />
            <span>{isFa ? 'دریافت PDF' : 'Download PDF'}</span>
          </button>
          <button
            onClick={onPrint}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isFa ? 'چاپ' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THE PRINTABLE MULTI-PAGE A4 DOCUMENT SHEET (WHITE BACKGROUND & CRISP INK) */}
      {/* ========================================================================= */}
      <div
        ref={docSheetRef}
        id="official-document-sheet"
        dir={isFa ? 'rtl' : 'ltr'}
        style={{ letterSpacing: 'normal', wordSpacing: 'normal' }}
        className="space-y-8 print:space-y-0"
      >
        {/* ======================================================================= */}
        {/* PAGE 1: مشخصات ورودی پروژه و جمع‌بندی قابلیت حفاری                      */}
        {/* ======================================================================= */}
        {showPage1 && (
        <div
          className="official-document-page w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-900 border border-slate-300 shadow-xl rounded-lg overflow-hidden flex flex-row relative print:m-0 print:border-none print:shadow-none print:rounded-none"
          style={{ letterSpacing: 'normal', wordSpacing: 'normal' }}
        >
          {/* Vertical Spine Bar */}
          {renderVerticalSpine(getPageNum(1), totalPages)}

          {/* Page Content */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between overflow-hidden bg-white text-slate-900">
            <div className="space-y-4">
              {/* Document Official Header */}
              <div className="border-b-2 border-slate-300 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AppLogo size="md" rounded="rounded-lg" className="shrink-0 shadow-sm" />
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 leading-relaxed">
                      {isFa
                        ? 'گزارش رسمی تحلیل ژئومکانیکی، قابلیت حفاری، زمان خودپایداری و سیستم نگهداری تونل'
                        : 'Official Geomechanical, Excavability, Stand-up Time & Support Design Report'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 mt-0.5">
                      <span className="font-semibold text-slate-800">
                        {isFa ? (
                          <>استاندارد بین‌المللی <bdi dir="ltr">ISRM</bdi>، بینیاوسکی <bdi dir="ltr">(1989)</bdi>، بارتون <bdi dir="ltr">(2002)</bdi> و ترزاقی <bdi dir="ltr">(1946)</bdi></>
                        ) : (
                          'ISRM, Bieniawski (1989), Barton (2002) & Terzaghi (1946)'
                        )}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-300 text-slate-700 font-mono text-[10px]">
                        {isFa ? 'ورژن ۱.۰' : 'v1.0'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:text-end text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 shrink-0 space-y-1">
                  <div className="flex sm:justify-end items-center gap-1.5 font-sans">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-slate-600 font-medium">{isFa ? 'تاریخ:' : 'Date:'}</span>
                    <span className="font-semibold text-slate-900" dir={isFa ? 'rtl' : 'ltr'}>{reportDateStr}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex sm:justify-end items-center gap-1">
                    <span>{isFa ? 'شناسه سند:' : 'Doc ID:'}</span>
                    <strong className="text-blue-900" dir="ltr">{docId}</strong>
                  </div>
                </div>
              </div>

              {/* کادر مشخصات و عنوان پروژه (Project Title Box) */}
              <div className="bg-slate-50/90 rounded-lg border border-slate-300 px-3 py-1.5 flex items-center gap-2.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 shrink-0">
                  <FileText className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span>{isFa ? 'عنوان پروژه:' : 'Project Title:'}</span>
                </div>
                <div className="flex-1 border-b border-dotted border-slate-400 min-h-[22px] flex items-center px-1">
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => onUpdateProjectTitle?.(e.target.value)}
                    placeholder={isFa ? 'مثال: تونل انتقال آب - قطعه ۲' : 'e.g. Tunnel Project - Section 2'}
                    className="w-full bg-transparent border-none outline-none text-xs text-slate-900 font-semibold focus:ring-0 p-0"
                  />
                </div>
              </div>

              {/* TABLE 1: جدول مشخصات و پارامترهای ورودی پروژه */}
              {sec.inputs && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-blue-950 bg-slate-100 px-2.5 py-1 rounded border-r-4 rtl:border-r-4 ltr:border-l-4 border-blue-600">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-700" />
                    <span>{isFa ? '۱. جدول مشخصات و پارامترهای ورودی پروژه' : '1. Project Input Parameters'}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-normal">
                    {isFa ? (
                      <>عمق <bdi dir="ltr">{depth} m</bdi> | دهانه <bdi dir="ltr">{span} m</bdi> | <bdi dir="ltr">RMR={rmr}</bdi></>
                    ) : (
                      `Depth ${depth}m | Span ${span}m | RMR=${rmr}`
                    )}
                  </span>
                </div>

                <div className="overflow-x-auto rounded border border-slate-300">
                  <table className="w-full text-[11px] text-start border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 border-b border-slate-300">
                        <th className="py-1 px-2 font-bold text-center w-8">{isFa ? 'ردیف' : '#'}</th>
                        <th className="py-1 px-2 font-bold">{isFa ? 'عنوان پارامتر ورودی' : 'Parameter Name'}</th>
                        <th className="py-1 px-2 font-bold">{isFa ? 'نماد' : 'Symbol'}</th>
                        <th className="py-1 px-2 font-bold">{isFa ? 'مقدار عددی' : 'Value'}</th>
                        <th className="py-1 px-2 font-bold">{isFa ? 'واحد' : 'Unit'}</th>
                        <th className="py-1 px-2 font-bold">{isFa ? 'توضیحات و رده مهندسی' : 'Classification / Description'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-sans text-slate-800">
                      {/* ۱. پارامترهای هندسی: قطر و دهانه */}
                      <tr className="bg-white">
                        <td className="py-1 px-2 text-center text-slate-500 font-mono">{isFa ? '۱' : '1'}</td>
                        <td className="py-1 px-2 font-medium text-slate-900">{isFa ? 'قطر تونل / دهانه بدون نگهداری' : 'Tunnel Diameter / Unsupported Span'}</td>
                        <td className="py-1 px-2 text-blue-900 font-bold font-mono" dir="ltr">Span / D</td>
                        <td className="py-1 px-2 text-blue-950 font-bold font-mono">{span}</td>
                        <td className="py-1 px-2 text-slate-600">{isFa ? <>متر <bdi dir="ltr">(m)</bdi></> : 'm'}</td>
                        <td className="py-1 px-2 text-slate-700">{isFa ? 'ابعاد هندسی بازشدگی تونل' : 'Tunnel opening geometry'}</td>
                      </tr>

                      {/* ۲. عمق روباره تونل */}
                      <tr className="bg-slate-50/70">
                        <td className="py-1 px-2 text-center text-slate-500 font-mono">{isFa ? '۲' : '2'}</td>
                        <td className="py-1 px-2 font-medium text-slate-900">{isFa ? 'عمق روباره تونل' : 'Tunnel Overburden Depth'}</td>
                        <td className="py-1 px-2 text-blue-900 font-bold font-mono" dir="ltr">H / Depth</td>
                        <td className="py-1 px-2 text-blue-950 font-bold font-mono">{depth}</td>
                        <td className="py-1 px-2 text-slate-600">{isFa ? <>متر <bdi dir="ltr">(m)</bdi></> : 'm'}</td>
                        <td className="py-1 px-2 text-slate-700">{depth > 300 ? (isFa ? 'تونل عمیق با تمرکز تنش بالا' : 'Deep tunnel') : (isFa ? 'تونل کم‌عمق تا متوسط' : 'Shallow to medium depth')}</td>
                      </tr>

                      {/* ۳. ضریب کاربری سازه زیرزمینی */}
                      <tr className="bg-white">
                        <td className="py-1 px-2 text-center text-slate-500 font-mono">{isFa ? '۳' : '3'}</td>
                        <td className="py-1 px-2 font-medium text-slate-900">{isFa ? 'ضریب کاربری سازه زیرزمینی' : 'Excavation Support Ratio'}</td>
                        <td className="py-1 px-2 text-amber-900 font-bold font-mono" dir="ltr">ESR</td>
                        <td className="py-1 px-2 text-amber-950 font-bold font-mono">{esr}</td>
                        <td className="py-1 px-2 text-slate-600">{isFa ? 'بدون بعد' : 'Dimensionless'}</td>
                        <td className="py-1 px-2 text-slate-700">{esr === 1.0 ? (isFa ? 'تونل‌های اصلی راه‌آهن، جاده‌ای و هیدروالکتریک' : 'Major rail and road tunnels') : (isFa ? 'ضریب کاربری و ایمنی بازشدگی' : 'Excavation safety & use factor')}</td>
                      </tr>

                      {/* ۴. ابعاد معادل مهندسی */}
                      <tr className="bg-slate-50/70">
                        <td className="py-1 px-2 text-center text-slate-500 font-mono">{isFa ? '۴' : '4'}</td>
                        <td className="py-1 px-2 font-medium text-slate-900">{isFa ? 'ابعاد معادل مهندسی' : 'Equivalent Dimension'}</td>
                        <td className="py-1 px-2 text-cyan-900 font-bold font-mono" dir="ltr">
                          <bdi dir="ltr">De = Span/ESR</bdi>
                        </td>
                        <td className="py-1 px-2 text-cyan-950 font-bold font-mono">{de}</td>
                        <td className="py-1 px-2 text-slate-600">{isFa ? <>متر <bdi dir="ltr">(m)</bdi></> : 'm'}</td>
                        <td className="py-1 px-2 text-slate-700">{isFa ? 'دهانه معادل مبنای نمودار سیستم بارتون' : 'Equivalent span for Q-chart'}</td>
                      </tr>

                      {/* ۵. تنش قائم روباره ژئواستاتیک */}
                      <tr className="bg-white">
                        <td className="py-1 px-2 text-center text-slate-500 font-mono">{isFa ? '۵' : '5'}</td>
                        <td className="py-1 px-2 font-medium text-slate-900">{isFa ? 'تنش قائم روباره ژئواستاتیک' : 'Vertical Overburden Stress'}</td>
                        <td className="py-1 px-2 text-slate-700 font-bold font-mono" dir="ltr">
                          <bdi dir="ltr">σv = γ × H</bdi>
                        </td>
                        <td className="py-1 px-2 text-slate-950 font-bold font-mono">{overburdenStress}</td>
                        <td className="py-1 px-2 text-slate-600">{isFa ? <>مگاپاسکال <bdi dir="ltr">(MPa)</bdi></> : 'MPa'}</td>
                        <td className="py-1 px-2 text-slate-700">
                          {isFa ? (
                            <>بر اساس وزن مخصوص <bdi dir="ltr">{unitWeight} kN/m³</bdi> و عمق <bdi dir="ltr">{depth} m</bdi></>
                          ) : (
                            `Based on unit weight ${unitWeight} kN/m³ & depth ${depth} m`
                          )}
                        </td>
                      </tr>

                      {/* ۶. مقاومت فشاری تک‌محوری سنگ بکر */}
                      <tr className="bg-slate-50/70">
                        <td className="py-1 px-2 text-center text-slate-500 font-mono">{isFa ? '۶' : '6'}</td>
                        <td className="py-1 px-2 font-medium text-slate-900">{isFa ? 'مقاومت فشاری تک‌محوری سنگ بکر' : 'Intact Rock Uniaxial Compressive Strength'}</td>
                        <td className="py-1 px-2 text-rose-900 font-bold font-mono" dir="ltr">
                          <bdi dir="ltr">UCS (σc)</bdi>
                        </td>
                        <td className="py-1 px-2 text-rose-950 font-bold font-mono">{ucs}</td>
                        <td className="py-1 px-2 text-slate-600">{isFa ? <>مگاپاسکال <bdi dir="ltr">(MPa)</bdi></> : 'MPa'}</td>
                        <td className="py-1 px-2 text-slate-700">
                          {ucs >= 100 ? (isFa ? 'بسیار قوی تا فوق‌العاده مستحکم' : 'Very strong') : ucs >= 50 ? (isFa ? 'قوی و سخت' : 'Strong') : ucs >= 25 ? (isFa ? 'متوسط' : 'Medium strong') : (isFa ? 'سنگ ضعیف و نرم' : 'Weak rock')}
                        </td>
                      </tr>

                      {/* ۷. شاخص مقاومت بار نقطه‌ای */}
                      <tr className="bg-white">
                        <td className="py-1 px-2 text-center text-slate-500 font-mono">{isFa ? '۷' : '7'}</td>
                        <td className="py-1 px-2 font-medium text-slate-900">{isFa ? 'شاخص مقاومت بار نقطه‌ای' : 'Point Load Strength Index'}</td>
                        <td className="py-1 px-2 text-amber-900 font-bold font-mono" dir="ltr">
                          <bdi dir="ltr">Is(50)</bdi>
                        </td>
                        <td className="py-1 px-2 text-amber-950 font-bold font-mono">{pointLoadIs50}</td>
                        <td className="py-1 px-2 text-slate-600">{isFa ? <>مگاپاسکال <bdi dir="ltr">(MPa)</bdi></> : 'MPa'}</td>
                        <td className="py-1 px-2 text-slate-700">{isFa ? 'شاخص مبنای آزمون بار نقطه‌ای فرانکلین' : 'Point load test index'}</td>
                      </tr>

                      {/* ۸. تعداد دسته‌درزه‌ها در سیستم بارتون */}
                      <tr className="bg-slate-50/70">
                        <td className="py-1 px-2 text-center text-slate-500 font-mono">{isFa ? '۸' : '8'}</td>
                        <td className="py-1 px-2 font-medium text-slate-900">{isFa ? 'عدد دسته‌درزه‌ها در سیستم بارتون' : 'Joint Set Number (Barton Jn)'}</td>
                        <td className="py-1 px-2 text-indigo-900 font-bold font-mono" dir="ltr">Jn</td>
                        <td className="py-1 px-2 text-indigo-950 font-bold font-mono">{jointSets}</td>
                        <td className="py-1 px-2 text-slate-600">{isFa ? 'بدون بعد' : 'Dimensionless'}</td>
                        <td className="py-1 px-2 text-slate-700">
                          {jointSets === 9
                            ? (isFa ? '۳ دسته‌درزه ساختاری در توده‌سنگ' : '3 joint sets')
                            : jointSets === 6
                            ? (isFa ? '۲ دسته‌درزه به‌علاوه درزه‌های تصادفی' : '2 joint sets plus random')
                            : jointSets === 4
                            ? (isFa ? '۲ دسته‌درزه ساختاری' : '2 joint sets')
                            : jointSets === 12
                            ? (isFa ? '۳ دسته‌درزه به‌علاوه درزه‌های تصادفی' : '3 joint sets plus random')
                            : jointSets >= 15
                            ? (isFa ? 'بسیار درزه‌دار یا خردشده' : 'Heavily jointed / crushed')
                            : (isFa ? 'تعداد دسته‌درزه‌ها در توده‌سنگ' : 'Joint sets in rock mass')}
                        </td>
                      </tr>

                      {/* ۹. فاصله‌داری ناپیوستگی‌ها / درزه‌ها */}
                      <tr className="bg-white">
                        <td className="py-1 px-2 text-center text-slate-500 font-mono">{isFa ? '۹' : '9'}</td>
                        <td className="py-1 px-2 font-medium text-slate-900">{isFa ? 'فاصله‌داری ناپیوستگی‌ها / درزه‌ها' : 'Discontinuity Spacing'}</td>
                        <td className="py-1 px-2 text-indigo-900 font-bold font-mono" dir="ltr">If</td>
                        <td className="py-1 px-2 text-indigo-950 font-bold font-mono">{jointSpacing}</td>
                        <td className="py-1 px-2 text-slate-600">{isFa ? <>متر <bdi dir="ltr">(m)</bdi></> : 'm'}</td>
                        <td className="py-1 px-2 text-slate-700">{isFa ? 'میانگین فاصله دسته‌درزه‌ها در توده‌سنگ' : 'Average joint spacing'}</td>
                      </tr>

                      {/* ۱۰. شرایط آب زیرزمینی یکپارچه */}
                      <tr className="bg-teal-50/60">
                        <td className="py-1 px-2 text-center text-teal-700 font-mono">{isFa ? '۱۰' : '10'}</td>
                        <td className="py-1 px-2 font-medium text-teal-950">{isFa ? 'شرایط آب زیرزمینی یکپارچه' : 'Unified Groundwater Conditions'}</td>
                        <td className="py-1 px-2 text-teal-900 font-bold font-mono" dir="ltr">
                          <bdi dir="ltr">Jw / RMR-water</bdi>
                        </td>
                        <td className="py-1 px-2 text-teal-950 font-bold font-mono" dir="ltr">
                          <bdi dir="ltr">Jw={jw} | RMR={groundwaterRmr}</bdi>
                        </td>
                        <td className="py-1 px-2 text-slate-600">-</td>
                        <td className="py-1 px-2 text-slate-800">
                          {GROUNDWATER_CONDITIONS[groundwaterCondition] ? (
                            <span>
                              {isFa ? GROUNDWATER_CONDITIONS[groundwaterCondition].shortLabelFa : GROUNDWATER_CONDITIONS[groundwaterCondition].shortLabelEn}{' '}
                              <bdi dir="ltr">({isFa ? GROUNDWATER_CONDITIONS[groundwaterCondition].inflowRangeFa : GROUNDWATER_CONDITIONS[groundwaterCondition].inflowRangeEn})</bdi>
                            </span>
                          ) : (
                            <span>{isFa ? 'شرایط هیدرولوژی تونل' : 'Tunnel hydrological condition'}</span>
                          )}
                        </td>
                      </tr>

                      {/* ۱۱. شاخص کیفیت مغزه سنگ (RQD) */}
                      <tr className="bg-white">
                        <td className="py-1 px-2 text-center text-slate-500 font-mono">{isFa ? '۱۱' : '11'}</td>
                        <td className="py-1 px-2 font-medium text-slate-900">{isFa ? 'شاخص کیفیت مغزه سنگ' : 'Rock Quality Designation'}</td>
                        <td className="py-1 px-2 text-emerald-900 font-bold font-mono" dir="ltr">RQD</td>
                        <td className="py-1 px-2 text-emerald-950 font-bold font-mono">{rqd}</td>
                        <td className="py-1 px-2 text-slate-600">{isFa ? <>درصد <bdi dir="ltr">(%)</bdi></> : '%'}</td>
                        <td className="py-1 px-2 text-slate-700">
                          {rqd >= 90 ? (isFa ? <>عالی <bdi dir="ltr">(Excellent)</bdi></> : 'Excellent') : rqd >= 75 ? (isFa ? <>خوب <bdi dir="ltr">(Good)</bdi></> : 'Good') : rqd >= 50 ? (isFa ? <>متوسط <bdi dir="ltr">(Fair)</bdi></> : 'Fair') : rqd >= 25 ? (isFa ? <>ضعیف <bdi dir="ltr">(Poor)</bdi></> : 'Poor') : (isFa ? <>بسیار ضعیف <bdi dir="ltr">(Very Poor)</bdi></> : 'Very Poor')}
                        </td>
                      </tr>

                      {/* ۱۲. شاخص طبقه‌بندی مهندسی سنگ بینیاوسکی (RMR) */}
                      <tr className="bg-slate-50/70">
                        <td className="py-1 px-2 text-center text-slate-500 font-mono">{isFa ? '۱۲' : '12'}</td>
                        <td className="py-1 px-2 font-medium text-slate-900">{isFa ? 'شاخص طبقه‌بندی مهندسی سنگ بینیاوسکی' : 'Rock Mass Rating (Bieniawski)'}</td>
                        <td className="py-1 px-2 text-amber-900 font-bold font-mono" dir="ltr">RMR</td>
                        <td className="py-1 px-2 text-amber-950 font-bold font-mono">{rmr}</td>
                        <td className="py-1 px-2 text-slate-600">{isFa ? '۰ تا ۱۰۰' : '0 to 100'}</td>
                        <td className="py-1 px-2 text-slate-700">
                          {rmr >= 81 ? (isFa ? 'کلاس I: سنگ بسیار خوب' : 'Class I: Very Good') : rmr >= 61 ? (isFa ? 'کلاس II: سنگ خوب' : 'Class II: Good') : rmr >= 41 ? (isFa ? 'کلاس III: سنگ متوسط' : 'Class III: Fair') : rmr >= 21 ? (isFa ? 'کلاس IV: سنگ ضعیف' : 'Class IV: Poor') : (isFa ? 'کلاس V: سنگ بسیار ضعیف' : 'Class V: Very Poor')}
                        </td>
                      </tr>

                      {/* ۱۳. شاخص کیفیت مهندسی سنگ بارتون (Q) */}
                      <tr className="bg-white">
                        <td className="py-1 px-2 text-center text-slate-500 font-mono">{isFa ? '۱۳' : '13'}</td>
                        <td className="py-1 px-2 font-medium text-slate-900">{isFa ? 'شاخص کیفیت مهندسی سنگ بارتون' : 'Barton Q-Value'}</td>
                        <td className="py-1 px-2 text-teal-900 font-bold font-mono" dir="ltr">Q</td>
                        <td className="py-1 px-2 text-teal-950 font-bold font-mono">{qValue}</td>
                        <td className="py-1 px-2 text-slate-600">{isFa ? '۰.۰۰۱ تا ۱۰۰۰' : '0.001 to 1000'}</td>
                        <td className="py-1 px-2 text-slate-700">
                          {qValue >= 40 ? (isFa ? 'سنگ بسیار خوب تا عالی' : 'Very good to exceptionally good') : qValue >= 10 ? (isFa ? 'سنگ خوب' : 'Good rock') : qValue >= 4 ? (isFa ? 'سنگ متوسط' : 'Fair rock') : qValue >= 1 ? (isFa ? 'سنگ ضعیف' : 'Poor rock') : (isFa ? 'سنگ بسیار ضعیف تا خردشده' : 'Very poor to crushed rock')}
                        </td>
                      </tr>

                      {/* ۱۴. شاخص مقاومت زمین‌شناسی هوک (GSI) */}
                      <tr className="bg-slate-50/70">
                        <td className="py-1 px-2 text-center text-slate-500 font-mono">{isFa ? '۱۴' : '14'}</td>
                        <td className="py-1 px-2 font-medium text-slate-900">{isFa ? 'شاخص مقاومت زمین‌شناسی هوک' : 'Geological Strength Index (Hoek)'}</td>
                        <td className="py-1 px-2 text-purple-900 font-bold font-mono" dir="ltr">GSI</td>
                        <td className="py-1 px-2 text-purple-950 font-bold font-mono">{gsi}</td>
                        <td className="py-1 px-2 text-slate-600">{isFa ? '۵ تا ۱۰۰' : '5 to 100'}</td>
                        <td className="py-1 px-2 text-slate-700">{isFa ? 'ساختار بلوکی با ناپیوستگی‌های زبر (Hoek-Brown)' : 'Blocky structure with rough joints'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              )}

              {/* TABLE 2: جدول جمع‌بندی قابلیت حفاری */}
              {sec.excavability && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-950 bg-slate-100 px-2.5 py-1 rounded border-r-4 rtl:border-r-4 ltr:border-l-4 border-orange-600">
                  <Pickaxe className="w-3.5 h-3.5 text-orange-700" />
                  <span>{isFa ? '۲. ارزیابی جامع قابلیت حفاری توده‌سنگ (Excavability Summary)' : '2. Rock Excavability Assessment Summary'}</span>
                </div>

                <div className="overflow-x-auto rounded border border-slate-300">
                  <table className="w-full text-[11px] text-start border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 border-b border-slate-300">
                        <th className="py-1.5 px-2 font-bold">{isFa ? 'روش علمی و مرجع' : 'Method & Reference'}</th>
                        <th className="py-1.5 px-2 font-bold">{isFa ? 'شاخص کلیدی' : 'Key Metric'}</th>
                        <th className="py-1.5 px-2 font-bold">{isFa ? 'رده‌بندی قابلیت حفاری' : 'Excavability Category'}</th>
                        <th className="py-1.5 px-2 font-bold">{isFa ? 'روش حفاری پیشنهادی و ماشین‌آلات' : 'Recommended Excavation Method & Machinery'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-sans text-slate-800">
                      <tr className="bg-white">
                        <td className="py-1.5 px-2 font-bold text-slate-900">
                          {isFa ? <>روش فرانکلین <bdi dir="ltr">(Franklin 1971)</bdi></> : 'Franklin (1971)'}
                        </td>
                        <td className="py-1.5 px-2 font-mono text-slate-700" dir="ltr">
                          <bdi dir="ltr">Is(50)={pointLoadIs50} MPa | If={jointSpacing} m</bdi>
                        </td>
                        <td className="py-1.5 px-2 font-bold text-amber-900">{isFa ? (franklinResult?.categoryNameFa ?? '') : (franklinResult?.categoryNameEn ?? '')}</td>
                        <td className="py-1.5 px-2 text-slate-700">
                          {isFa ? (franklinResult?.excavationMethodFa ?? '') : (franklinResult?.excavationMethodEn ?? '')}{' '}
                          <bdi dir="ltr">({isFa ? (franklinResult?.equipmentFa ?? '') : (franklinResult?.equipmentEn ?? '')})</bdi>
                        </td>
                      </tr>
                      <tr className="bg-slate-50/70">
                        <td className="py-1.5 px-2 font-bold text-slate-900">
                          {isFa ? <>حفاری مکانیزه <bdi dir="ltr">TBM</bdi> و رودهدر <bdi dir="ltr">(GSI & Hoek)</bdi></> : 'Mechanized TBM & Roadheader'}
                        </td>
                        <td className="py-1.5 px-2 font-mono text-slate-700" dir="ltr">
                          <bdi dir="ltr">GSI={gsi} | UCS={ucs} MPa (Scm={mechanizedResult?.rockMassStrengthScm ?? '—'} MPa)</bdi>
                        </td>
                        <td className="py-1.5 px-2 font-bold text-teal-900">{isFa ? (mechanizedResult?.excavabilityClassFa ?? '') : (mechanizedResult?.excavabilityClassEn ?? '')}</td>
                        <td className="py-1.5 px-2 text-slate-700">{isFa ? (mechanizedResult?.machineryFa ?? '') : (mechanizedResult?.machineryEn ?? '')} | {isFa ? (mechanizedResult?.tbmFeasibilityFa ?? '') : (mechanizedResult?.tbmFeasibilityEn ?? '')}</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="py-1.5 px-2 font-bold text-slate-900">
                          {isFa ? <>قابلیت چالزنی ایساکسون <bdi dir="ltr">(Isaksson 1979)</bdi></> : 'Isaksson Drilling (1979)'}
                        </td>
                        <td className="py-1.5 px-2 font-mono text-slate-700" dir="ltr">
                          <bdi dir="ltr">DRI={isakssonResult?.driEstimate ?? '—'} | Jv={isakssonResult?.jointFrequencyJv ?? '—'}/m³</bdi>
                        </td>
                        <td className="py-1.5 px-2 font-bold text-emerald-900">{isFa ? (isakssonResult?.drillabilityClassFa ?? '') : (isakssonResult?.drillabilityClassEn ?? '')}</td>
                        <td className="py-1.5 px-2 text-slate-700">
                          {isFa ? (isakssonResult?.blastabilityClassFa ?? '') : (isakssonResult?.blastabilityClassEn ?? '')} | {isFa ? 'خرج ویژه:' : 'Specific charge:'} <bdi dir="ltr">{isakssonResult?.specificChargeQ ?? '—'} kg/m³</bdi>
                        </td>
                      </tr>
                      <tr className="bg-slate-50/70">
                        <td className="py-1.5 px-2 font-bold text-slate-900">
                          {isFa ? <>قابلیت ریپرزنی ویور <bdi dir="ltr">(Weaver 1975)</bdi></> : 'Weaver Ripping (1975)'}
                        </td>
                        <td className="py-1.5 px-2 font-mono text-slate-700" dir="ltr">
                          <bdi dir="ltr">Weaver Rating={weaverResult?.totalRating ?? '—'}/100</bdi>
                        </td>
                        <td className="py-1.5 px-2 font-bold text-purple-900">{isFa ? (weaverResult?.classNameFa ?? '') : (weaverResult?.classNameEn ?? '')}</td>
                        <td className="py-1.5 px-2 text-slate-700">
                          {isFa ? (weaverResult?.tractorRecommendationFa ?? '') : (weaverResult?.tractorRecommendationEn ?? '')}{' '}
                          <bdi dir="ltr">({isFa ? (weaverResult?.rippabilityDescriptionFa ?? '') : (weaverResult?.rippabilityDescriptionEn ?? '')})</bdi>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              )}
            </div>

            {/* Page 1 Bottom Footer */}
            <div className="border-t border-slate-300 pt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>{isFa ? `گزارش رسمی ژئومکانیک تونل - صفحه ${getPageNum(1)} از ${totalPages}` : `Official Geomechanics Report - Page ${getPageNum(1)} of ${totalPages}`}</span>
              <span>{docId}</span>
            </div>
          </div>
        </div>
        )}

        {/* ======================================================================= */}
        {/* PAGE 2: زمان خودپایداری، سیستم نگهداری تجربی و دستورالعمل RMR           */}
        {/* ======================================================================= */}
        {showPage2 && (
        <div
          className="official-document-page w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-900 border border-slate-300 shadow-xl rounded-lg overflow-hidden flex flex-row relative print:m-0 print:border-none print:shadow-none print:rounded-none"
          style={{ letterSpacing: 'normal', wordSpacing: 'normal' }}
        >
          {/* Vertical Spine Bar */}
          {renderVerticalSpine(getPageNum(2), totalPages)}

          {/* Page Content */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between overflow-hidden bg-white text-slate-900">
            <div className="space-y-4">
              {/* Mini Running Header */}
              <div className="border-b border-slate-300 pb-2 flex items-center justify-between text-[11px] text-slate-600 font-mono">
                <span className="font-bold text-slate-800">
                  {isFa ? 'ادامه گزارش رسمی تحلیل ژئومکانیکی و سیستم نگهداری تونل' : 'Official Tunnel Geomechanics Report (Continued)'}
                </span>
                <span>{docId}</span>
              </div>

              {/* TABLE 3: جدول جمع‌بندی زمان خودپایداری */}
              {sec.standUpTime && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 bg-slate-100 px-2.5 py-1 rounded border-r-4 rtl:border-r-4 ltr:border-l-4 border-amber-600">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isFa ? '۳. ارزیابی زمان خودپایداری توده‌سنگ (Stand-up Time Summary)' : '3. Stand-up Time Assessment Summary'}</span>
                </div>

                <div className="overflow-x-auto rounded border border-slate-300">
                  <table className="w-full text-[11px] text-start border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 border-b border-slate-300">
                        <th className="py-1.5 px-2 font-bold">{isFa ? 'سیستم رده‌بندی' : 'Classification System'}</th>
                        <th className="py-1.5 px-2 font-bold">{isFa ? 'شاخص محاسبه' : 'Index'}</th>
                        <th className="py-1.5 px-2 font-bold">{isFa ? 'زمان خودپایداری تخمینی' : 'Estimated Stand-up Time'}</th>
                        <th className="py-1.5 px-2 font-bold">{isFa ? 'حداکثر دهانه بدون نگهداری' : 'Max Unsupported Span'}</th>
                        <th className="py-1.5 px-2 font-bold">{isFa ? 'توصیه زمان نصب نگهداری' : 'Support Installation Timing'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-sans text-slate-800">
                      <tr className="bg-white">
                        <td className="py-1.5 px-2 font-bold text-slate-900">
                          {isFa ? <>روش تجربی بینیاوسکی <bdi dir="ltr">(Bieniawski 1989)</bdi></> : 'Bieniawski RMR (1989)'}
                        </td>
                        <td className="py-1.5 px-2 font-mono text-slate-700" dir="ltr">
                          <bdi dir="ltr">RMR={rmr} | Span={span}m</bdi>
                        </td>
                        <td className="py-1.5 px-2 font-mono font-bold text-amber-900">{isFa ? (rmrStandUpResult?.formattedTimeFa ?? '—') : (rmrStandUpResult?.formattedTimeEn ?? '—')}</td>
                        <td className="py-1.5 px-2 font-mono text-slate-900 font-bold">
                          <bdi dir="ltr">{rmrStandUpResult?.maxUnsupportedSpan ?? '—'} m</bdi>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700">{rmr >= 60 ? (isFa ? 'نصب نگهداری پس از پیشروی جبهه‌کار مجاز است' : 'Install after advance') : (isFa ? 'نصب فوری نگهداری در نزدیک‌ترین فاصله به جبهه‌کار ضروری است' : 'Immediate support required')}</td>
                      </tr>
                      <tr className="bg-slate-50/70">
                        <td className="py-1.5 px-2 font-bold text-slate-900">
                          {isFa ? <>روش تجربی بارتون <bdi dir="ltr">(Barton Q-System 1974/2002)</bdi></> : 'Barton Q-System (1974/2002)'}
                        </td>
                        <td className="py-1.5 px-2 font-mono text-slate-700" dir="ltr">
                          <bdi dir="ltr">Q={qValue} | ESR={esr} | De={de}m</bdi>
                        </td>
                        <td className="py-1.5 px-2 font-mono font-bold text-teal-900">{isFa ? (qStandUpResult?.formattedTimeFa ?? '—') : (qStandUpResult?.formattedTimeEn ?? '—')}</td>
                        <td className="py-1.5 px-2 font-mono text-slate-900 font-bold">
                          <bdi dir="ltr">{qStandUpResult?.maxUnsupportedSpan ?? '—'} m</bdi>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700">{span > (qStandUpResult?.maxUnsupportedSpan ?? 999) ? (isFa ? 'دهانه تونل بزرگتر از سقف مجاز است؛ نصب بدون تاخیر ضروری است' : 'Span exceeds threshold; immediate support mandatory') : (isFa ? 'دهانه در محدوده پایداری قابل قبول است' : 'Within stable bounds')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              )}

              {/* TABLE 4: جدول جمع‌بندی سیستم نگهداری تجربی */}
              {sec.support && (
              <>
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 bg-slate-100 px-2.5 py-1 rounded border-r-4 rtl:border-r-4 ltr:border-l-4 border-emerald-600">
                  <Shield className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isFa ? '۴. طراحی و توصیه‌های سیستم نگهداری (Support Design Summary)' : '4. Support Design Recommendations Summary'}</span>
                </div>

                <div className="overflow-x-auto rounded border border-slate-300">
                  <table className="w-full text-[11px] text-start border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 border-b border-slate-300">
                        <th className="py-1.5 px-2 font-bold">{isFa ? 'روش طراحی' : 'Design Method'}</th>
                        <th className="py-1.5 px-2 font-bold">{isFa ? 'کلاس / شاخص' : 'Class / Category'}</th>
                        <th className="py-1.5 px-2 font-bold">{isFa ? 'مشخصات راک‌بولت (طول و فواصل)' : 'Rock Bolts (Length & Spacing)'}</th>
                        <th className="py-1.5 px-2 font-bold">{isFa ? 'مشخصات شاتکریت و بتن‌پاشی' : 'Shotcrete Specifications'}</th>
                        <th className="py-1.5 px-2 font-bold">{isFa ? 'نگهداری تکمیلی و ملاحظات خاص' : 'Additional Support & Notes'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-sans text-slate-800">
                      <tr className="bg-white">
                        <td className="py-1.5 px-2 font-bold text-slate-900">
                          {isFa ? <>سیستم Q بارتون با بتن‌پاشی الیافی <bdi dir="ltr">(Sfr)</bdi></> : 'Barton Q (Fiber Shotcrete Sfr)'}
                        </td>
                        <td className="py-1.5 px-2 font-mono text-teal-900 font-bold">
                          {isFa ? 'رده ' : 'Class '}{supportDetailed?.category ?? '—'}{' '}
                          <bdi dir="ltr">({isFa ? (supportDetailed?.categoryLabelFa ?? '') : (supportDetailed?.categoryLabelEn ?? '')})</bdi>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700 font-mono">
                          <bdi dir="ltr">L = {supportDetailed?.boltLength ?? '—'}m | {isFa ? (sfr?.boltSpacingFa ?? '') : (sfr?.boltSpacingEn ?? '')}</bdi>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700 font-mono">
                          {isFa ? 'ضخامت ' : 'Thickness '}{sfr?.thicknessMm ?? '—'} mm{' '}
                          <bdi dir="ltr">({isFa ? (sfr?.thicknessRangeFa ?? '') : (sfr?.thicknessRangeEn ?? '')})</bdi>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700">{isFa ? (sfr?.summaryFa || sfr?.energyAbsorptionFa || 'نگهداری با شاتکریت الیافی') : (sfr?.summaryEn || sfr?.energyAbsorptionEn || 'Fiber reinforced shotcrete')}</td>
                      </tr>
                      <tr className="bg-slate-50/70">
                        <td className="py-1.5 px-2 font-bold text-slate-900">
                          <div>{isFa ? <>روش بینیاوسکی <bdi dir="ltr">(Bieniawski RMR 1989)</bdi></> : 'Bieniawski RMR (1989)'}</div>
                          <div className="text-[9.5px] text-slate-500 font-normal">
                            {isFa ? <>تونل نعل‌اسبی <bdi dir="ltr">10m</bdi>، تنش <bdi dir="ltr">&lt; 25 MPa</bdi></> : '10m horseshoe, σv < 25 MPa'}
                          </div>
                        </td>
                        <td className="py-1.5 px-2 font-bold text-amber-900">
                          {isFa ? 'رده ' : 'Class '}{effectiveRmrSupport?.code || effectiveRmrSupport?.id || '—'}{' '}
                          <bdi dir="ltr">({isFa ? (effectiveRmrSupport?.nameFa ?? '') : (effectiveRmrSupport?.nameEn ?? '')})</bdi>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700">{isFa ? (effectiveRmrSupport?.rockBoltsFa ?? '—') : (effectiveRmrSupport?.rockBoltsEn ?? '—')}</td>
                        <td className="py-1.5 px-2 text-slate-700">{isFa ? (effectiveRmrSupport?.shotcreteFa ?? '—') : (effectiveRmrSupport?.shotcreteEn ?? '—')}</td>
                        <td className="py-1.5 px-2 text-slate-700">{isFa ? (effectiveRmrSupport?.steelSetsFa ?? '—') : (effectiveRmrSupport?.steelSetsEn ?? '—')}</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="py-1.5 px-2 font-bold text-slate-900">
                          {isFa ? <>روش تجربی دیر بر پایه <bdi dir="ltr">RQD</bdi> <bdi dir="ltr">(Deere 1970)</bdi></> : 'Deere RQD Support (1970)'}
                        </td>
                        <td className="py-1.5 px-2 font-bold text-emerald-900">
                          {isFa ? 'کلاس ' : 'Class '}{rqdSupportResult?.qualityGrade ?? '—'}{' '}
                          <bdi dir="ltr">({isFa ? (rqdSupportResult?.categoryFa ?? '') : (rqdSupportResult?.categoryEn ?? '')})</bdi>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700">{isFa ? (rqdSupportResult?.rockBoltsFa ?? '') : (rqdSupportResult?.rockBoltsEn ?? '')}</td>
                        <td className="py-1.5 px-2 text-slate-700">{isFa ? (rqdSupportResult?.shotcreteFa ?? '') : (rqdSupportResult?.shotcreteEn ?? '')}</td>
                        <td className="py-1.5 px-2 text-slate-700">{isFa ? (rqdSupportResult?.recommendationFa ?? '') : (rqdSupportResult?.recommendationEn ?? '')}</td>
                      </tr>
                      <tr className="bg-slate-50/70">
                        <td className="py-1.5 px-2 font-bold text-slate-900">
                          {isFa ? <>روش روسو <bdi dir="ltr">(Russo 1998 - جبهه‌کار)</bdi></> : 'Russo Face Stability (1998)'}
                        </td>
                        <td className="py-1.5 px-2 font-mono text-indigo-900 font-bold">
                          {isFa ? 'بخش ' : 'Class '}{russoSupportResult?.classCode ?? '—'}{' '}
                          <bdi dir="ltr">({isFa ? (russoSupportResult?.classNameFa ?? '') : (russoSupportResult?.classNameEn ?? '')})</bdi>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700" colSpan={2}>{isFa ? (russoSupportResult?.behaviorFa ?? '') : (russoSupportResult?.behaviorEn ?? '')} | {isFa ? (russoSupportResult?.excavationMethodFa ?? '') : (russoSupportResult?.excavationMethodEn ?? '')}</td>
                        <td className="py-1.5 px-2 text-slate-700">{russoSupportResult?.mitigations?.map((m: any) => isFa ? m.titleFa : m.titleEn).join(isFa ? '، ' : ', ') || (isFa ? 'نگهداری استاندارد' : 'Standard support')}</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="py-1.5 px-2 font-bold text-slate-900">
                          {isFa ? <>تحلیل مچاله‌شوندگی در عمق <bdi dir="ltr">(Hoek & GSI)</bdi></> : 'Hoek Squeezing at Depth'}
                        </td>
                        <td className="py-1.5 px-2 font-bold text-purple-900">
                          {isFa ? (gsiSupportResult?.behaviorCategoryFa ?? '') : (gsiSupportResult?.behaviorCategoryEn ?? '')}
                        </td>
                        <td className="py-1.5 px-2 text-slate-700 font-mono">{isFa ? 'کرنش شعاعی: ' : 'Radial strain: '}{gsiSupportResult?.strainPercent ?? 0}%</td>
                        <td className="py-1.5 px-2 text-slate-700 font-mono">{isFa ? <>فشار لازم <bdi dir="ltr">(Pi)</bdi>: </> : 'Required support (Pi): '}{gsiSupportResult?.requiredSupportPressurePi ?? 0} MPa</td>
                        <td className="py-1.5 px-2 text-slate-700">{isFa ? (gsiSupportResult?.supportTypeFa ?? '') : (gsiSupportResult?.supportTypeEn ?? '')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detailed RMR Support System breakdown */}
              <div className="p-3.5 rounded border border-amber-300 bg-amber-50/50 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-1.5">
                  <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs">
                    <Compass className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <h4>
                      {isFa ? (
                        <>دستورالعمل تفصیلی سیستم نگهداری و حفاری به روش RMR بینیاوسکی <bdi dir="ltr">(Bieniawski 1989 - Table 4):</bdi></>
                      ) : (
                        'Detailed Bieniawski (1989) RMR Support & Excavation Guidelines (Table 4):'
                      )}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 text-[11px] font-bold font-mono border border-amber-300">
                    {isFa ? `رده ${effectiveRmrSupport?.code ?? effectiveRmrSupport?.id ?? '—'} - RMR = ${rmr}` : `Class ${effectiveRmrSupport?.code ?? effectiveRmrSupport?.id ?? '—'} - RMR = ${rmr}`}
                  </span>
                </div>

                {/* Validity Scope Box */}
                <div className="p-2 rounded bg-amber-100/70 border border-amber-300 text-[11px] text-amber-950 font-medium leading-relaxed">
                  <div className="flex items-center gap-1 font-bold text-amber-900 mb-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>{isFa ? 'نکته کلیدی و محدوده اعتبار سیستم نگهداری RMR بینیاوسکی:' : 'Key Note & Validity Scope of Bieniawski (1989) Support System:'}</span>
                  </div>
                  <p>
                    {isFa
                      ? 'این روش برای تونل نعل اسبی با دهانه ۱۰ متر، تنش قائم کمتر از ۲۵ مگاپاسکال و روش ساخت حفاری و انفجار معتبر است'
                      : 'This method is valid for horseshoe-shaped tunnels with a 10 m span, vertical stress of less than 25 MPa, and drill & blast construction method.'}
                  </p>
                </div>

                {/* 4 Governing Conditions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                  <div className="p-1.5 rounded bg-white border border-slate-300">
                    <span className="text-slate-500 block text-[9.5px]">{isFa ? 'شکل هندسی مقطع:' : 'Cross-section Shape:'}</span>
                    <span className="font-bold text-slate-900">{isFa ? <>نعل‌اسبی <bdi dir="ltr">(Horseshoe)</bdi></> : 'Horseshoe'}</span>
                  </div>
                  <div className="p-1.5 rounded bg-white border border-slate-300">
                    <span className="text-slate-500 block text-[9.5px]">{isFa ? 'دهانه مرجع مبنا:' : 'Reference Span:'}</span>
                    <span className="font-bold text-amber-900 font-mono">{isFa ? '۱۰ متر' : '10 m'}</span>
                  </div>
                  <div className="p-1.5 rounded bg-white border border-slate-300">
                    <span className="text-slate-500 block text-[9.5px]">{isFa ? <>حداکثر تنش قائم <bdi dir="ltr">(σv):</bdi></> : 'Max Vertical Stress (σv):'}</span>
                    <span className="font-bold text-amber-900 font-mono">{isFa ? '< ۲۵ مگاپاسکال' : '< 25 MPa'}</span>
                  </div>
                  <div className="p-1.5 rounded bg-white border border-slate-300">
                    <span className="text-slate-500 block text-[9.5px]">{isFa ? 'روش ساخت و احداث:' : 'Construction Method:'}</span>
                    <span className="font-bold text-slate-900">{isFa ? <>حفاری و انفجار <bdi dir="ltr">(D&B)</bdi></> : 'Drill & Blast'}</span>
                  </div>
                </div>

                {/* 4 Main Support Components */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-0.5">
                  <div className="p-2 rounded bg-white border border-slate-300 space-y-1">
                    <div className="flex items-center gap-1 text-amber-900 font-bold">
                      <Wrench className="w-3 h-3 text-amber-700 shrink-0" />
                      <span>{isFa ? <>۱. روش و گام پیشروی حفاری <bdi dir="ltr">(Excavation):</bdi></> : '1. Excavation Method & Advance:'}</span>
                    </div>
                    <p className="text-slate-800 text-[10.5px] leading-relaxed">
                      {isFa ? (effectiveRmrSupport?.excavationMethodFa ?? '—') : (effectiveRmrSupport?.excavationMethodEn ?? '—')}
                    </p>
                  </div>

                  <div className="p-2 rounded bg-white border border-slate-300 space-y-1">
                    <div className="flex items-center gap-1 text-sky-900 font-bold">
                      <Hammer className="w-3 h-3 text-sky-700 shrink-0" />
                      <span>{isFa ? <>۲. راک‌بولت‌ها <bdi dir="ltr">(Rock Bolts - قطر 20mm):</bdi></> : '2. Rock Bolts (20mm diam.):'}</span>
                    </div>
                    <p className="text-slate-800 text-[10.5px] leading-relaxed">
                      {isFa ? (effectiveRmrSupport?.rockBoltsFa ?? '—') : (effectiveRmrSupport?.rockBoltsEn ?? '—')}
                    </p>
                  </div>

                  <div className="p-2 rounded bg-white border border-slate-300 space-y-1">
                    <div className="flex items-center gap-1 text-emerald-900 font-bold">
                      <Layers className="w-3 h-3 text-emerald-700 shrink-0" />
                      <span>{isFa ? <>۳. شاتکریت و بتن پاشنده <bdi dir="ltr">(Shotcrete):</bdi></> : '3. Shotcrete & Mesh:'}</span>
                    </div>
                    <p className="text-slate-800 text-[10.5px] leading-relaxed">
                      {isFa ? (effectiveRmrSupport?.shotcreteFa ?? '—') : (effectiveRmrSupport?.shotcreteEn ?? '—')}
                    </p>
                  </div>

                  <div className="p-2 rounded bg-white border border-slate-300 space-y-1">
                    <div className="flex items-center gap-1 text-rose-900 font-bold">
                      <Shield className="w-3 h-3 text-rose-700 shrink-0" />
                      <span>{isFa ? <>۴. قاب‌های فولادی و اینورت <bdi dir="ltr">(Steel Sets & Invert):</bdi></> : '4. Steel Sets & Invert:'}</span>
                    </div>
                    <p className="text-slate-800 text-[10.5px] leading-relaxed">
                      {isFa ? (effectiveRmrSupport?.steelSetsFa ?? '—') : (effectiveRmrSupport?.steelSetsEn ?? '—')}
                    </p>
                  </div>
                </div>
              </div>
              </>
              )}
            </div>

            {/* Page 2 Bottom Footer */}
            <div className="border-t border-slate-300 pt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>{isFa ? `گزارش رسمی ژئومکانیک تونل - صفحه ${getPageNum(2)} از ${totalPages}` : `Official Geomechanics Report - Page ${getPageNum(2)} of ${totalPages}`}</span>
              <span>{docId}</span>
            </div>
          </div>
        </div>
        )}

        {/* ======================================================================= */}
        {/* PAGE 3 OF 3: تحلیل بار سنگ، جمع‌بندی طراحی و تاییدیه مهندسی             */}
        {/* ======================================================================= */}
        {showPage3 && (
        <div
          className="official-document-page w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-900 border border-slate-300 shadow-xl rounded-lg overflow-hidden flex flex-row relative print:m-0 print:border-none print:shadow-none print:rounded-none"
          style={{ letterSpacing: 'normal', wordSpacing: 'normal' }}
        >
          {/* Vertical Spine Bar */}
          {renderVerticalSpine(getPageNum(3), totalPages)}

          {/* Page Content */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between overflow-hidden bg-white text-slate-900">
            <div className="space-y-4">
              {/* Mini Running Header */}
              <div className="border-b border-slate-300 pb-2 flex items-center justify-between text-[11px] text-slate-600 font-mono">
                <span className="font-bold text-slate-800">
                  {isFa ? 'ادامه گزارش رسمی تحلیل ژئومکانیکی و سیستم نگهداری تونل' : 'Official Tunnel Geomechanics Report (Continued)'}
                </span>
                <span>{docId}</span>
              </div>

              {sec.rockLoad && (
              <>
              {/* TABLE 5: جدول برآورد بار سنگ و تحلیل تنش‌های بازشدگی */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-950 bg-slate-100 px-2.5 py-1 rounded border-r-4 rtl:border-r-4 ltr:border-l-4 border-cyan-600">
                  <Weight className="w-3.5 h-3.5 text-cyan-700" />
                  <span>{isFa ? '۵. برآورد بار سنگ و تحلیل تنش‌های بازشدگی (Rock Load & Boundary Stress Analysis)' : '5. Rock Load & Opening Boundary Stress Analysis'}</span>
                </div>

                <div className="overflow-x-auto rounded border border-slate-300">
                  <table className="w-full text-[11px] text-start border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 border-b border-slate-300">
                        <th className="py-1.5 px-2 font-bold">{isFa ? 'روش و فرمول محاسباتی' : 'Method & Formulation'}</th>
                        <th className="py-1.5 px-2 font-bold">{isFa ? 'پارامترهای حاکم' : 'Governing Parameters'}</th>
                        <th className="py-1.5 px-2 font-bold">{isFa ? <>ارتفاع بار سنگ <bdi dir="ltr">(Hp / m)</bdi></> : 'Rock Load Height (Hp / m)'}</th>
                        <th className="py-1.5 px-2 font-bold">{isFa ? 'فشار سقف / بحرانی' : 'Roof / Critical Pressure'}</th>
                        <th className="py-1.5 px-2 font-bold">{isFa ? 'فشار دیواره / کنترل پایداری' : 'Sidewall Pressure / Stability'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-sans text-slate-800">
                      {/* 1. Terzaghi */}
                      <tr className="bg-white">
                        <td className="py-1.5 px-2 font-bold text-slate-900">
                          <div>{isFa ? <>روش بار سنگ ترزاقی <bdi dir="ltr">(Terzaghi 1946)</bdi></> : 'Terzaghi Method (1946)'}</div>
                          <div className="text-[9.5px] text-slate-500 font-normal">{isFa ? `جدول ۶-۸ | رده ${terzaghiResult?.condition?.code ?? '—'}` : `Table 6-8 | Class ${terzaghiResult?.condition?.code ?? '—'}`}</div>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700">
                          <div className="font-semibold text-slate-900">{isFa ? (terzaghiResult?.condition?.nameFa ?? 'سنگ درزه‌دار') : (terzaghiResult?.condition?.nameEn ?? 'Jointed rock')}</div>
                          <div className="text-[9.5px] text-slate-500 font-mono" dir="ltr">
                            <bdi dir="ltr">{isFa ? terzaghiResult?.condition?.hpFormulaFa : terzaghiResult?.condition?.hpFormulaEn}</bdi>
                          </div>
                        </td>
                        <td className="py-1.5 px-2 font-mono text-amber-900 font-bold">
                          {terzaghiResult?.hpAvg ?? '—'} m
                          <span className="text-[9.5px] text-slate-500 block font-normal" dir="ltr">
                            <bdi dir="ltr">({terzaghiResult?.hpMin ?? 0} - {terzaghiResult?.hpMax ?? 0} m)</bdi>
                          </span>
                        </td>
                        <td className="py-1.5 px-2 font-mono text-slate-900 font-bold">
                          {terzaghiResult?.pvAvgKPa ?? '—'} kPa
                          <span className="text-[9.5px] text-slate-500 block font-normal" dir="ltr">
                            <bdi dir="ltr">({terzaghiResult?.pvAvgMPa ?? '—'} MPa)</bdi>
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700">
                          <div className="font-mono text-slate-900 font-semibold">{terzaghiResult?.phAvgKPa ?? '—'} kPa</div>
                          <div className="text-[9.5px] text-slate-500 leading-tight">{isFa ? (terzaghiResult?.condition?.sidePressureNoteFa ?? '') : (terzaghiResult?.condition?.sidePressureNoteEn ?? '')}</div>
                        </td>
                      </tr>

                      {/* 2. Grimstad & Barton */}
                      <tr className="bg-slate-50/70">
                        <td className="py-1.5 px-2 font-bold text-slate-900">
                          <div>{isFa ? <>سیستم Q گریمستاد و بارتون <bdi dir="ltr">(1993)</bdi></> : 'Grimstad & Barton Q (1993)'}</div>
                          <div className="text-[9.5px] text-slate-500 font-normal">{isFa ? 'رابطه ۶-۵ تجربی' : 'Empirical Eq. 6-5'}</div>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700 font-mono" dir="ltr">
                          <bdi dir="ltr">Q = {qValue} | Jn = 9 | Jr = 1.5</bdi>
                          <div className="text-[9.5px] text-slate-500 font-sans">{isFa ? 'بر مبنای درزه‌داری و زبری' : 'Joint sets & roughness'}</div>
                        </td>
                        <td className="py-1.5 px-2 font-mono text-teal-900 font-bold">
                          {bartonRockLoadResult?.hpEquivalentM ?? '—'} m
                          <span className="text-[9.5px] text-slate-500 block font-normal">{isFa ? 'معادل بار سنگ' : 'Equivalent'}</span>
                        </td>
                        <td className="py-1.5 px-2 font-mono text-slate-900 font-bold">
                          {bartonRockLoadResult?.pRoofKPa ?? '—'} kPa
                          <span className="text-[9.5px] text-slate-500 block font-normal" dir="ltr">
                            <bdi dir="ltr">({bartonRockLoadResult?.pRoofMPa ?? '—'} MPa)</bdi>
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700">
                          <div className="font-mono text-slate-900 font-semibold">{bartonRockLoadResult?.pWallKPa ?? '—'} kPa</div>
                          <div className="text-[9.5px] text-slate-500">{isFa ? `طول بولت L = ${bartonRockLoadResult?.boltLengthL ?? '—'}m` : `Bolt L = ${bartonRockLoadResult?.boltLengthL ?? '—'}m`}</div>
                        </td>
                      </tr>

                      {/* 3. Cording et al. */}
                      <tr className="bg-white">
                        <td className="py-1.5 px-2 font-bold text-slate-900">
                          <div>{isFa ? <>روش تجربی کوردینگ <bdi dir="ltr">(Cording 1971)</bdi></> : 'Cording et al. (1971)'}</div>
                          <div className="text-[9.5px] text-slate-500 font-normal">{isFa ? `دهانه B = ${span} m` : `Span B = ${span} m`}</div>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700 font-mono" dir="ltr">
                          <bdi dir="ltr">Hp = 0.3 B = {cordingResult?.hpCrown ?? '—'} m</bdi>
                          <div className="text-[9.5px] text-slate-500 font-sans"><bdi dir="ltr">RQD = {rqd}%</bdi></div>
                        </td>
                        <td className="py-1.5 px-2 font-mono text-blue-900 font-bold">
                          {cordingResult?.hpCrown ?? '—'} m
                        </td>
                        <td className="py-1.5 px-2 font-mono text-slate-900 font-bold">
                          {cordingResult?.pCrownKPa ?? '—'} kPa
                          <span className="text-[9.5px] text-slate-500 block font-normal" dir="ltr">
                            <bdi dir="ltr">({cordingResult?.pCrownMPa ?? '—'} MPa)</bdi>
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700">
                          <div className="font-mono text-slate-900 font-semibold">{cordingResult?.pSidewallKPa ?? '—'} kPa</div>
                          <div className="text-[9.5px] text-slate-500">{isFa ? (rqd > 75 ? 'RQD > 75%: بار دیواره ناچیز، بولت‌گذاری موردی' : 'نگهداری فعال دیواره الزامی است') : (rqd > 75 ? 'RQD > 75%: Negligible sidewall load' : 'Sidewall support mandatory')}</div>
                        </td>
                      </tr>

                      {/* 4. Hoek Critical Pressure */}
                      <tr className="bg-slate-50/70">
                        <td className="py-1.5 px-2 font-bold text-slate-900">
                          <div>{isFa ? <>فشار بحرانی هوک <bdi dir="ltr">(Hoek 1999)</bdi></> : 'Hoek Critical Pressure (1999)'}</div>
                          <div className="text-[9.5px] text-slate-500 font-normal">{isFa ? 'تحلیلی پلاستیک بازشدگی عمیق' : 'Deep opening plastic yield'}</div>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700 font-mono" dir="ltr">
                          <bdi dir="ltr">Po = {hoekRockLoadResult?.p0HydrostaticMPa ?? '—'} MPa</bdi>
                          <div className="text-[9.5px] text-slate-500 font-sans"><bdi dir="ltr">σcm = {hoekRockLoadResult?.sigmaCmMPa ?? '—'} MPa</bdi></div>
                        </td>
                        <td className="py-1.5 px-2 font-mono text-purple-900 font-bold">
                          {hoekRockLoadResult?.requiresSupport ? `${((hoekRockLoadResult?.criticalPressurePcrKPa ?? 0) / (unitWeight || 25)).toFixed(2)} m` : '0.00 m'}
                        </td>
                        <td className="py-1.5 px-2 font-mono text-slate-900 font-bold">
                          {Math.max(0, hoekRockLoadResult?.criticalPressurePcrKPa ?? 0)} kPa
                          <span className="text-[9.5px] text-slate-500 block font-normal" dir="ltr">
                            <bdi dir="ltr">({Math.max(0, hoekRockLoadResult?.criticalPressurePcrMPa ?? 0)} MPa)</bdi>
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] font-bold ${hoekRockLoadResult?.requiresSupport ? 'bg-rose-100 text-rose-900 border border-rose-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'}`}>
                            {isFa ? (hoekRockLoadResult?.requiresSupport ? <>نیازمند فشار داخلی <bdi dir="ltr">Pi ≥ Pcr</bdi></> : 'رفتار الاستیک (بدون زون پلاستیک)') : (hoekRockLoadResult?.requiresSupport ? 'Requires Pi ≥ Pcr' : 'Elastic, no plastic yielding')}
                          </span>
                        </td>
                      </tr>

                      {/* 5. Kirsch Elastic Stresses */}
                      <tr className="bg-white">
                        <td className="py-1.5 px-2 font-bold text-slate-900">
                          <div>{isFa ? <>تنش‌های الاستیک کرش <bdi dir="ltr">(Kirsch 1898)</bdi></> : 'Kirsch Elastic Stresses (1898)'}</div>
                          <div className="text-[9.5px] text-slate-500 font-normal">{isFa ? 'تاج و دیواره مقطع دایره‌ای' : 'Circular tunnel crown & sidewall'}</div>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700 font-mono" dir="ltr">
                          <bdi dir="ltr">σv = {kirschStressResult?.sigmaV ?? '—'} MPa | K = {kRatio}</bdi>
                          <div className="text-[9.5px] text-slate-500 font-sans"><bdi dir="ltr">σh = {kirschStressResult?.sigmaH ?? '—'} MPa</bdi></div>
                        </td>
                        <td className="py-1.5 px-2 font-mono text-slate-500 font-bold">—</td>
                        <td className="py-1.5 px-2 font-mono text-slate-900 font-bold">
                          {kirschStressResult?.sigmaThetaRoof ?? '—'} MPa
                          <span className="text-[9.5px] text-slate-500 block font-normal">{isFa ? 'تنش مماسی تاج' : 'Crown hoop stress'}</span>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700">
                          <div className="font-mono text-slate-900 font-semibold">
                            {kirschStressResult?.sigmaThetaWall ?? '—'} MPa <bdi dir="ltr">({isFa ? 'دیواره' : 'Wall'})</bdi>
                          </div>
                          <div className="text-[9.5px] text-slate-500 leading-tight">{isFa ? (kirschStressResult?.spallingRiskFa ?? '') : (kirschStressResult?.spallingRiskEn ?? '')}</div>
                        </td>
                      </tr>

                      {/* 6. Deere RQD */}
                      <tr className="bg-slate-50/70">
                        <td className="py-1.5 px-2 font-bold text-slate-900">
                          <div>{isFa ? <>روش دیر بر مبنای <bdi dir="ltr">RQD</bdi> <bdi dir="ltr">(Deere 1970)</bdi></> : 'Deere et al. RQD (1970)'}</div>
                          <div className="text-[9.5px] text-slate-500 font-normal" dir="ltr">
                            <bdi dir="ltr">Hp = ((100 - RQD) / 100) × B</bdi>
                          </div>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700 font-mono" dir="ltr">
                          <bdi dir="ltr">RQD = {rqd}% | B = {span} m</bdi>
                          <div className="text-[9.5px] text-slate-500 font-sans"><bdi dir="ltr">γ = {unitWeight} kN/m³</bdi></div>
                        </td>
                        <td className="py-1.5 px-2 font-mono text-cyan-900 font-bold">
                          {deereRockLoadResult?.hp ?? '—'} m
                        </td>
                        <td className="py-1.5 px-2 font-mono text-slate-900 font-bold">
                          {deereRockLoadResult?.pvKPa ?? '—'} kPa
                          <span className="text-[9.5px] text-slate-500 block font-normal" dir="ltr">
                            <bdi dir="ltr">({deereRockLoadResult?.pvMPa ?? '—'} MPa)</bdi>
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-slate-700">
                          <div className="text-[9.5px] text-slate-500">{isFa ? 'برآورد بار سست ناشی از شکستگی‌های مغزه در تاج تونل' : 'Dead load of loose fractured core at tunnel crown'}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Synthesis Bar */}
              <div className="text-[11px] text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                  <span className="text-blue-700">•</span>
                  <span>{isFa ? 'جمع‌بندی مهندسی بار سنگ و انتخاب پوشش طراحی:' : 'Rock Load Synthesis & Design Guidance:'}</span>
                </div>
                <p className="leading-relaxed text-[10.5px]">
                  {isFa
                    ? `دامنه فشار بار سنگ سقف حاصل از روش‌های تجربی بین ${Math.min(terzaghiResult?.pvAvgKPa || 0, cordingResult?.pCrownKPa || 0, bartonRockLoadResult?.pRoofKPa || 0)} تا ${Math.max(terzaghiResult?.pvAvgKPa || 0, cordingResult?.pCrownKPa || 0, bartonRockLoadResult?.pRoofKPa || 0)} کیلوپاسکال محاسبه شده است. در صورت نیاز به کنترل گسیختگی الاستوپلاستیک عمیق، فشار بحرانی هوک برابر ${hoekRockLoadResult?.criticalPressurePcrKPa ?? 0} کیلوپاسکال می‌باشد.`
                    : `Empirical roof support pressure ranges between ${Math.min(terzaghiResult?.pvAvgKPa || 0, cordingResult?.pCrownKPa || 0, bartonRockLoadResult?.pRoofKPa || 0)} and ${Math.max(terzaghiResult?.pvAvgKPa || 0, cordingResult?.pCrownKPa || 0, bartonRockLoadResult?.pRoofKPa || 0)} kPa. For deep elastoplastic yield containment, Hoek critical pressure is ${hoekRockLoadResult?.criticalPressurePcrKPa ?? 0} kPa.`}
                </p>
              </div>
              </>
              )}

              {/* Official Verification & Signatures (2 Columns: Designer & Geotechnical Reviewer) */}
              {sec.signatures && (
                <div className="pt-2 border-t-2 border-slate-300 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Box 1: Project Designer */}
                  <div className="p-3 rounded border border-slate-300 bg-slate-50/70 space-y-2">
                    <div className="flex items-center gap-1.5 text-blue-950 font-bold text-xs">
                      <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                      <span>{isFa ? 'طراح و محاسب پروژه:' : 'Project Designer / Engineer:'}</span>
                    </div>
                    <div className="space-y-1 text-slate-800 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600 shrink-0">{isFa ? 'نام و نام خانوادگی:' : 'Name:'}</span>
                        <input
                          type="text"
                          value={designerName}
                          onChange={(e) => onUpdateDesignerName?.(e.target.value)}
                          placeholder={isFa ? 'مهندس طراح' : 'Designer Name'}
                          className="border-b border-dotted border-slate-400 flex-1 h-5 bg-transparent outline-none px-1 text-slate-900 font-bold text-[11px]"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600 shrink-0">{isFa ? 'سمت / شرکت:' : 'Title / Org:'}</span>
                        <input
                          type="text"
                          value={designerTitle}
                          onChange={(e) => onUpdateDesignerTitle?.(e.target.value)}
                          placeholder={isFa ? 'شرکت مهندسی مشاور' : 'Firm / Title'}
                          className="border-b border-dotted border-slate-400 flex-1 h-5 bg-transparent outline-none px-1 text-slate-800 text-[11px]"
                        />
                      </div>
                    </div>
                    <div className="h-8 border-b border-dashed border-slate-400 flex items-end justify-center text-[10px] text-slate-500 font-mono">
                      [ {isFa ? 'مهر و امضای طراح پروژه' : 'Designer Stamp & Signature'} ]
                    </div>
                  </div>

                  {/* Box 2: Geotechnical Reviewer & Supervisor */}
                  <div className="p-3 rounded border border-slate-300 bg-slate-50/70 space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-950 font-bold text-xs">
                      <FileText className="w-3.5 h-3.5 text-slate-700" />
                      <span>{isFa ? 'تاییدکننده و مهندس ناظر ژئوتکنیک:' : 'Geotechnical Reviewer / Supervisor:'}</span>
                    </div>
                    <div className="space-y-1 text-slate-800 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600 shrink-0">{isFa ? 'نام و نام خانوادگی:' : 'Name:'}</span>
                        <input
                          type="text"
                          value={approverName}
                          onChange={(e) => onUpdateApproverName?.(e.target.value)}
                          placeholder={isFa ? 'مهندس ناظر / تاییدکننده' : 'Supervisor / Reviewer'}
                          className="border-b border-dotted border-slate-400 flex-1 h-5 bg-transparent outline-none px-1 text-slate-900 font-bold text-[11px]"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600 shrink-0">{isFa ? 'دستگاه نظارت:' : 'Supervision Body:'}</span>
                        <input
                          type="text"
                          value={approverTitle}
                          onChange={(e) => onUpdateApproverTitle?.(e.target.value)}
                          placeholder={isFa ? 'دستگاه نظارت / کارفرما' : 'Supervision / Client'}
                          className="border-b border-dotted border-slate-400 flex-1 h-5 bg-transparent outline-none px-1 text-slate-800 text-[11px]"
                        />
                      </div>
                    </div>
                    <div className="h-8 border-b border-dashed border-slate-400 flex items-end justify-center text-[10px] text-slate-500 font-mono">
                      [ {isFa ? 'مهر و امضای ناظر ژئوتکنیک' : 'Supervisor Stamp & Signature'} ]
                    </div>
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-500 font-mono pt-1">
                  {isFa
                    ? 'گواهی اصالت گزارش: کلیه محاسبات بر مبنای روابط تجربی معتبر بین‌المللی مکانیک سنگ استخراج شده و به عنوان سند طراحی اولیه معتبر است.'
                    : 'Certificate of Report Authenticity: All evaluations are derived from accredited international empirical rock engineering formulations.'}
                </div>
              </div>
              )}
            </div>

            {/* Page 3 Bottom Footer */}
            <div className="border-t border-slate-300 pt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>{isFa ? `گزارش رسمی ژئومکانیک تونل - صفحه ${getPageNum(3)} از ${totalPages}` : `Official Geomechanics Report - Page ${getPageNum(3)} of ${totalPages}`}</span>
              <span>{docId}</span>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
