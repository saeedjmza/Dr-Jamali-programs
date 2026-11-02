import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
} from 'docx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { ReportSectionsConfig } from '../types';

export interface DocxReportData {
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
  rockClass: any;
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
  groundwaterCondition?: string;
  groundwaterRmr?: number;
  jw?: number;
  reportDateStr: string;
  isFa: boolean;
  projectTitle?: string;
  designerName?: string;
  designerTitle?: string;
  approverName?: string;
  approverTitle?: string;
  sections?: Partial<ReportSectionsConfig>;
}

/**
 * Creates a clean cell with standard borders and padding, fully supporting RTL for Persian
 */
function createCell(
  text: string,
  options?: {
    bold?: boolean;
    isHeader?: boolean;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    color?: string;
    isFa?: boolean;
  }
) {
  const isHeader = options?.isHeader ?? false;
  const isFa = options?.isFa ?? false;

  // For Persian, default alignment is RIGHT unless specified otherwise
  const alignment = options?.align ?? (isFa ? AlignmentType.RIGHT : AlignmentType.LEFT);

  return new TableCell({
    shading: isHeader ? { fill: '0f172a' } : undefined,
    children: [
      new Paragraph({
        bidirectional: isFa,
        alignment,
        children: [
          new TextRun({
            text,
            rightToLeft: isFa,
            bold: options?.bold ?? isHeader,
            color: isHeader ? 'ffffff' : (options?.color ?? '1e293b'),
            size: isHeader ? 20 : 19,
            font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial',
          }),
        ],
      }),
    ],
    margins: {
      top: 100,
      bottom: 100,
      left: 140,
      right: 140,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
    },
  });
}

/**
 * Generates an official Microsoft Word (.docx) document
 */
export async function generateDocxBlob(data: DocxReportData): Promise<Blob> {
  const isFa = data.isFa;
  const sfr = data.supportDetailed?.sfr || {};

  // Table 1: Input parameters
  const jointSetsVal = data.jointSets ?? 9;
  const jointSetsDesc = isFa
    ? jointSetsVal === 9
      ? '۳ دسته‌درزه ساختاری در توده‌سنگ'
      : jointSetsVal === 6
      ? '۲ دسته‌درزه به‌علاوه درزه‌های تصادفی'
      : jointSetsVal === 4
      ? '۲ دسته‌درزه ساختاری'
      : jointSetsVal === 12
      ? '۳ دسته‌درزه به‌علاوه درزه‌های تصادفی'
      : jointSetsVal >= 15
      ? 'بسیار درزه‌دار یا خردشده'
      : 'تعداد دسته‌درزه‌ها در توده‌سنگ'
    : jointSetsVal === 9
    ? '3 joint sets'
    : `${jointSetsVal} joint sets`;

  const inputRows = [
    new TableRow({
      tableHeader: true,
      children: [
        createCell(isFa ? 'ردیف' : '#', { isHeader: true, align: AlignmentType.CENTER, isFa }),
        createCell(isFa ? 'پارامتر ورودی' : 'Parameter', { isHeader: true, isFa }),
        createCell(isFa ? 'نماد' : 'Symbol', { isHeader: true, isFa }),
        createCell(isFa ? 'مقدار عددی' : 'Value', { isHeader: true, isFa }),
        createCell(isFa ? 'واحد' : 'Unit', { isHeader: true, isFa }),
        createCell(isFa ? 'توضیحات و رده مهندسی' : 'Engineering Meaning', { isHeader: true, isFa }),
      ],
    }),
    // 1. قطر و دهانه تونل
    new TableRow({
      children: [
        createCell('1', { align: AlignmentType.CENTER, isFa }),
        createCell(isFa ? 'قطر تونل / دهانه بدون نگهداری' : 'Tunnel Span / Diameter', { isFa }),
        createCell('Span / D', { bold: true, isFa }),
        createCell(`${data.span}`, { bold: true, isFa }),
        createCell('m', { isFa }),
        createCell(isFa ? 'ابعاد هندسی مقطع حفاری' : 'Opening geometry', { isFa }),
      ],
    }),
    // 2. عمق روباره تونل
    new TableRow({
      children: [
        createCell('2', { align: AlignmentType.CENTER, isFa }),
        createCell(isFa ? 'عمق روباره تونل' : 'Tunnel Depth', { isFa }),
        createCell('H / Depth', { bold: true, isFa }),
        createCell(`${data.depth}`, { bold: true, isFa }),
        createCell('m', { isFa }),
        createCell(isFa ? 'فاصله تا سطح زمین' : 'Depth below surface', { isFa }),
      ],
    }),
    // 3. ضریب کاربری سازه زیرزمینی
    new TableRow({
      children: [
        createCell('3', { align: AlignmentType.CENTER, isFa }),
        createCell(isFa ? 'ضریب کاربری سازه زیرزمینی' : 'Excavation Support Ratio (ESR)', { isFa }),
        createCell('ESR', { bold: true, isFa }),
        createCell(`${data.esr}`, { bold: true, isFa }),
        createCell('-', { isFa }),
        createCell(isFa ? 'ضریب کاربری و ایمنی بازشدگی' : 'Excavation safety & use factor', { isFa }),
      ],
    }),
    // 4. ابعاد معادل مهندسی
    new TableRow({
      children: [
        createCell('4', { align: AlignmentType.CENTER, isFa }),
        createCell(isFa ? 'نسبت ابعاد معادل مهندسی' : 'Equivalent Dimension (De)', { isFa }),
        createCell('De = Span/ESR', { bold: true, isFa }),
        createCell(`${data.de}`, { bold: true, isFa }),
        createCell('m', { isFa }),
        createCell(isFa ? 'دهانه معادل مبنای نمودار سیستم بارتون' : 'Equivalent span for Q-chart', { isFa }),
      ],
    }),
    // 5. تنش قائم روباره ژئواستاتیک
    new TableRow({
      children: [
        createCell('5', { align: AlignmentType.CENTER, isFa }),
        createCell(isFa ? 'تنش قائم ژئواستاتیک' : 'Vertical Stress', { isFa }),
        createCell('σv', { bold: true, isFa }),
        createCell(`${data.overburdenStress}`, { bold: true, isFa }),
        createCell('MPa', { isFa }),
        createCell(isFa ? 'تنش ناشی از وزن ستون سنگ (γ × H)' : 'Overburden lithostatic stress', { isFa }),
      ],
    }),
    // 6. مقاومت فشاری تک‌محوری سنگ بکر
    new TableRow({
      children: [
        createCell('6', { align: AlignmentType.CENTER, isFa }),
        createCell(isFa ? 'مقاومت فشاری تک‌محوری سنگ بکر' : 'Uniaxial Compressive Strength (UCS)', { isFa }),
        createCell('UCS / σc', { bold: true, isFa }),
        createCell(`${data.ucs}`, { bold: true, isFa }),
        createCell('MPa', { isFa }),
        createCell(isFa ? 'مقاومت سنگ بکر در آزمایش تک‌محوری' : 'Intact rock uniaxial strength', { isFa }),
      ],
    }),
    // 7. شاخص مقاومت بار نقطه‌ای
    new TableRow({
      children: [
        createCell('7', { align: AlignmentType.CENTER, isFa }),
        createCell(isFa ? 'شاخص مقاومت بار نقطه‌ای' : 'Point Load Strength Index', { isFa }),
        createCell('Is(50)', { bold: true, isFa }),
        createCell(`${data.pointLoadIs50}`, { bold: true, isFa }),
        createCell('MPa', { isFa }),
        createCell(isFa ? 'شاخص مبنای آزمون بار نقطه‌ای فرانکلین' : 'Point load test index', { isFa }),
      ],
    }),
    // 8. تعداد دسته‌درزه‌ها در سیستم بارتون
    new TableRow({
      children: [
        createCell('8', { align: AlignmentType.CENTER, isFa }),
        createCell(isFa ? 'عدد دسته‌درزه‌ها در سیستم بارتون' : 'Joint Set Number (Barton Jn)', { isFa }),
        createCell('Jn', { bold: true, isFa }),
        createCell(`${jointSetsVal}`, { bold: true, isFa }),
        createCell('-', { isFa }),
        createCell(jointSetsDesc, { isFa }),
      ],
    }),
    // 9. فاصله‌داری ناپیوستگی‌ها / درزه‌ها
    new TableRow({
      children: [
        createCell('9', { align: AlignmentType.CENTER, isFa }),
        createCell(isFa ? 'فاصله‌داری ناپیوستگی‌ها / درزه‌ها' : 'Discontinuity Spacing', { isFa }),
        createCell('If', { bold: true, isFa }),
        createCell(`${data.jointSpacing}`, { bold: true, isFa }),
        createCell('m', { isFa }),
        createCell(isFa ? 'میانگین فاصله دسته‌درزه‌ها در توده‌سنگ' : 'Average joint spacing', { isFa }),
      ],
    }),
    // 10. شرایط آب زیرزمینی یکپارچه
    new TableRow({
      children: [
        createCell('10', { align: AlignmentType.CENTER, isFa }),
        createCell(isFa ? 'شرایط آب زیرزمینی یکپارچه' : 'Unified Groundwater Conditions', { isFa }),
        createCell('Jw / RMR-w', { bold: true, isFa }),
        createCell(`Jw=${data.jw ?? 0.66} | RMR=${data.groundwaterRmr ?? 10}`, { bold: true, isFa }),
        createCell('-', { isFa }),
        createCell(data.groundwaterCondition || (isFa ? 'جریان یا فشار متوسط آب' : 'Medium inflow / pressure'), { isFa }),
      ],
    }),
    // 11. شاخص کیفیت مغزه سنگ (RQD)
    new TableRow({
      children: [
        createCell('11', { align: AlignmentType.CENTER, isFa }),
        createCell(isFa ? 'شاخص کیفیت مغزه سنگ' : 'Rock Quality Designation (RQD)', { isFa }),
        createCell('RQD', { bold: true, isFa }),
        createCell(`${data.rqd}%`, { bold: true, isFa }),
        createCell('%', { isFa }),
        createCell(isFa ? 'درصد طول قطعات مغزه سالم بالای ۱۰ سانتیمتر' : 'Intact core pieces > 10cm', { isFa }),
      ],
    }),
    // 12. شاخص طبقه‌بندی مهندسی سنگ بینیاوسکی (RMR)
    new TableRow({
      children: [
        createCell('12', { align: AlignmentType.CENTER, isFa }),
        createCell(isFa ? 'شاخص رده‌بندی بینیاوسکی' : 'Rock Mass Rating (RMR)', { isFa }),
        createCell('RMR89', { bold: true, isFa }),
        createCell(`${data.rmr}`, { bold: true, isFa }),
        createCell('0-100', { isFa }),
        createCell(isFa ? `${data.rockClass?.nameFa ?? ''} (${data.rockClass?.descriptionFa ?? ''})` : `${data.rockClass?.nameEn ?? ''}`, { isFa }),
      ],
    }),
    // 13. شاخص کیفیت مهندسی سنگ بارتون (Q)
    new TableRow({
      children: [
        createCell('13', { align: AlignmentType.CENTER, isFa }),
        createCell(isFa ? 'شاخص کیفیت مهندسی سنگ بارتون' : 'Barton Q-Value', { isFa }),
        createCell('Q', { bold: true, isFa }),
        createCell(`${data.qValue}`, { bold: true, isFa }),
        createCell('-', { isFa }),
        createCell(isFa ? (data.qResult?.classificationFa ?? '') : (data.qResult?.classificationEn ?? ''), { isFa }),
      ],
    }),
    // 14. شاخص مقاومت زمین‌شناسی هوک (GSI)
    new TableRow({
      children: [
        createCell('14', { align: AlignmentType.CENTER, isFa }),
        createCell(isFa ? 'شاخص مقاومت زمین‌شناسی' : 'Geological Strength Index (GSI)', { isFa }),
        createCell('GSI', { bold: true, isFa }),
        createCell(`${data.gsi}`, { bold: true, isFa }),
        createCell('5-100', { isFa }),
        createCell(isFa ? 'معیار تجربی هوک و براون (Hoek & Brown)' : 'Hoek-Brown criterion parameter', { isFa }),
      ],
    }),
  ];

  // Table 2: Excavability
  const excavabilityRows = [
    new TableRow({
      tableHeader: true,
      children: [
        createCell(isFa ? 'روش تحلیلی' : 'Method', { isHeader: true, isFa }),
        createCell(isFa ? 'پارامترهای کلیدی' : 'Key Parameters', { isHeader: true, isFa }),
        createCell(isFa ? 'رده قابلیت حفر' : 'Excavability Class', { isHeader: true, isFa }),
        createCell(isFa ? 'روش و ماشین‌آلات پیشنهادی' : 'Recommended Method & Machinery', { isHeader: true, isFa }),
      ],
    }),
    new TableRow({
      children: [
        createCell(isFa ? 'فرانکلین (Franklin 1971)' : 'Franklin (1971)', { bold: true, isFa }),
        createCell(`Is(50)=${data.pointLoadIs50} MPa | If=${data.jointSpacing} m`, { isFa }),
        createCell(isFa ? (data.franklinResult?.categoryNameFa ?? '') : (data.franklinResult?.categoryNameEn ?? ''), { bold: true, isFa }),
        createCell(isFa ? `${data.franklinResult?.excavationMethodFa ?? ''} (${data.franklinResult?.equipmentFa ?? ''})` : `${data.franklinResult?.excavationMethodEn ?? ''}`, { isFa }),
      ],
    }),
    new TableRow({
      children: [
        createCell(isFa ? 'حفاری مکانیزه TBM و رودهدر (GSI & Hoek)' : 'Mechanized TBM & Roadheader', { bold: true, isFa }),
        createCell(`GSI=${data.gsi} | UCS=${data.ucs} MPa`, { isFa }),
        createCell(isFa ? (data.mechanizedResult?.excavabilityClassFa ?? '') : (data.mechanizedResult?.excavabilityClassEn ?? ''), { bold: true, isFa }),
        createCell(isFa ? `${data.mechanizedResult?.machineryFa ?? ''} | ${data.mechanizedResult?.tbmFeasibilityFa ?? ''}` : `${data.mechanizedResult?.machineryEn ?? ''}`, { isFa }),
      ],
    }),
    new TableRow({
      children: [
        createCell(isFa ? 'قابلیت چالزنی ایساکسون (Isaksson 1979)' : 'Isaksson Drilling (1979)', { bold: true, isFa }),
        createCell(`DRI=${data.isakssonResult?.driEstimate ?? '—'} | Jv=${data.isakssonResult?.jointFrequencyJv ?? '—'}/m³`, { isFa }),
        createCell(isFa ? (data.isakssonResult?.drillabilityClassFa ?? '') : (data.isakssonResult?.drillabilityClassEn ?? ''), { bold: true, isFa }),
        createCell(isFa ? `${data.isakssonResult?.blastabilityClassFa ?? ''} | خرج ویژه: ${data.isakssonResult?.specificChargeQ ?? '—'} kg/m³` : `${data.isakssonResult?.blastabilityClassEn ?? ''}`, { isFa }),
      ],
    }),
    new TableRow({
      children: [
        createCell(isFa ? 'قابلیت ریپرزنی ویور (Weaver 1975)' : 'Weaver Ripping (1975)', { bold: true, isFa }),
        createCell(`Weaver Rating=${data.weaverResult?.totalRating ?? '—'}/100`, { isFa }),
        createCell(isFa ? (data.weaverResult?.classNameFa ?? '') : (data.weaverResult?.classNameEn ?? ''), { bold: true, isFa }),
        createCell(isFa ? `${data.weaverResult?.tractorRecommendationFa ?? ''} (${data.weaverResult?.rippabilityDescriptionFa ?? ''})` : `${data.weaverResult?.tractorRecommendationEn ?? ''}`, { isFa }),
      ],
    }),
  ];

  // Table 3: Stand-up Time
  const standUpRows = [
    new TableRow({
      tableHeader: true,
      children: [
        createCell(isFa ? 'سیستم تجربی' : 'System', { isHeader: true, isFa }),
        createCell(isFa ? 'شاخص و ابعاد' : 'Index & Span', { isHeader: true, isFa }),
        createCell(isFa ? 'زمان خودپایداری برآوردی' : 'Estimated Stand-up Time', { isHeader: true, isFa }),
        createCell(isFa ? 'حداکثر دهانه بدون نگهداری' : 'Max Unsupported Span', { isHeader: true, isFa }),
        createCell(isFa ? 'تفسیر مهندسی' : 'Engineering Guidance', { isHeader: true, isFa }),
      ],
    }),
    new TableRow({
      children: [
        createCell(isFa ? 'روش بینیاوسکی (Bieniawski RMR 1989)' : 'Bieniawski RMR (1989)', { bold: true, isFa }),
        createCell(`RMR = ${data.rmr} | Span = ${data.span} m`, { isFa }),
        createCell(isFa ? (data.rmrStandUpResult?.formattedTimeFa ?? '—') : (data.rmrStandUpResult?.formattedTimeEn ?? '—'), { bold: true, isFa }),
        createCell(`${data.rmrStandUpResult?.maxUnsupportedSpan ?? '—'} m`, { bold: true, isFa }),
        createCell(data.rmr >= 60 ? (isFa ? 'نصب نگهداری پس از پیشروی جبهه‌کار مجاز است' : 'Install after advance') : (isFa ? 'نصب فوری نگهداری در نزدیک‌ترین فاصله به جبهه‌کار ضروری است' : 'Immediate support required'), { isFa }),
      ],
    }),
    new TableRow({
      children: [
        createCell(isFa ? 'روش بارتون (Barton Q 1974/2002)' : 'Barton Q (1974/2002)', { bold: true, isFa }),
        createCell(`Q = ${data.qValue} | ESR = ${data.esr} | De = ${data.de} m`, { isFa }),
        createCell(isFa ? (data.qStandUpResult?.formattedTimeFa ?? '—') : (data.qStandUpResult?.formattedTimeEn ?? '—'), { bold: true, isFa }),
        createCell(`${data.qStandUpResult?.maxUnsupportedSpan ?? '—'} m`, { bold: true, isFa }),
        createCell(data.span > (data.qStandUpResult?.maxUnsupportedSpan ?? 999) ? (isFa ? 'دهانه تونل بزرگتر از سقف مجاز است؛ نصب بدون تاخیر الزامی است' : 'Span exceeds threshold') : (isFa ? 'دهانه در محدوده پایداری قابل قبول است' : 'Within stable bounds'), { isFa }),
      ],
    }),
  ];

  // Table 4: Support Systems
  const supportRows = [
    new TableRow({
      tableHeader: true,
      children: [
        createCell(isFa ? 'روش و استاندارد' : 'Method & Standard', { isHeader: true, isFa }),
        createCell(isFa ? 'رده یا کلاس' : 'Class / Category', { isHeader: true, isFa }),
        createCell(isFa ? 'راک‌بولت (طول و شبکه)' : 'Rock Bolts (Length & Spacing)', { isHeader: true, isFa }),
        createCell(isFa ? 'شاتکریت و مسلح‌سازی' : 'Shotcrete & Mesh', { isHeader: true, isFa }),
        createCell(isFa ? 'سایر تمهیدات مهندسی' : 'Other Recommendations', { isHeader: true, isFa }),
      ],
    }),
    new TableRow({
      children: [
        createCell(isFa ? 'سیستم Q بارتون (بتن‌پاشی الیافی Sfr)' : 'Barton Q (Sfr Shotcrete)', { bold: true, isFa }),
        createCell(`رده ${data.supportDetailed?.category ?? '—'} (${isFa ? (data.supportDetailed?.categoryLabelFa ?? '') : (data.supportDetailed?.categoryLabelEn ?? '')})`, { bold: true, isFa }),
        createCell(`L = ${data.supportDetailed?.boltLength ?? '—'} m | ${isFa ? (sfr?.boltSpacingFa ?? '') : (sfr?.boltSpacingEn ?? '')}`, { isFa }),
        createCell(`ضخامت ${sfr?.thicknessMm ?? '—'} mm (${isFa ? (sfr?.thicknessRangeFa ?? '') : (sfr?.thicknessRangeEn ?? '')})`, { isFa }),
        createCell(isFa ? (sfr?.summaryFa || sfr?.energyAbsorptionFa || 'نگهداری با شاتکریت الیافی') : (sfr?.summaryEn || sfr?.energyAbsorptionEn || 'Fiber shotcrete'), { isFa }),
      ],
    }),
    new TableRow({
      children: [
        createCell(isFa ? 'بینیاوسکی (Bieniawski RMR 1989)' : 'Bieniawski RMR (1989)', { bold: true, isFa }),
        createCell(`رده ${data.rmrSupportResult?.id ?? '—'} (${isFa ? (data.rmrSupportResult?.nameFa ?? '') : (data.rmrSupportResult?.nameEn ?? '')})`, { bold: true, isFa }),
        createCell(isFa ? (data.rmrSupportResult?.rockBoltsFa ?? '') : (data.rmrSupportResult?.rockBoltsEn ?? ''), { isFa }),
        createCell(isFa ? (data.rmrSupportResult?.shotcreteFa ?? '') : (data.rmrSupportResult?.shotcreteEn ?? ''), { isFa }),
        createCell(isFa ? (data.rmrSupportResult?.steelSetsFa ?? '') : (data.rmrSupportResult?.steelSetsEn ?? ''), { isFa }),
      ],
    }),
    new TableRow({
      children: [
        createCell(isFa ? 'روش تجربی دیر بر پایه RQD' : 'Deere RQD (1970)', { bold: true, isFa }),
        createCell(`کلاس ${data.rqdSupportResult?.qualityGrade ?? '—'} (${isFa ? (data.rqdSupportResult?.categoryFa ?? '') : (data.rqdSupportResult?.categoryEn ?? '')})`, { bold: true, isFa }),
        createCell(isFa ? (data.rqdSupportResult?.rockBoltsFa ?? '') : (data.rqdSupportResult?.rockBoltsEn ?? ''), { isFa }),
        createCell(isFa ? (data.rqdSupportResult?.shotcreteFa ?? '') : (data.rqdSupportResult?.shotcreteEn ?? ''), { isFa }),
        createCell(isFa ? (data.rqdSupportResult?.recommendationFa ?? '') : (data.rqdSupportResult?.recommendationEn ?? ''), { isFa }),
      ],
    }),
    new TableRow({
      children: [
        createCell(isFa ? 'روش روسو (Russo 1998 - پایداری جبهه‌کار)' : 'Russo Face Stability (1998)', { bold: true, isFa }),
        createCell(`بخش ${data.russoSupportResult?.classCode ?? '—'} (${isFa ? (data.russoSupportResult?.classNameFa ?? '') : (data.russoSupportResult?.classNameEn ?? '')})`, { bold: true, isFa }),
        createCell(isFa ? `${data.russoSupportResult?.behaviorFa ?? ''} | ${data.russoSupportResult?.excavationMethodFa ?? ''}` : `${data.russoSupportResult?.behaviorEn ?? ''}`, { isFa }),
        createCell(isFa ? (data.russoSupportResult?.excavationMethodFa ?? '') : (data.russoSupportResult?.excavationMethodEn ?? ''), { isFa }),
        createCell(data.russoSupportResult?.mitigations?.map((m: any) => isFa ? m.titleFa : m.titleEn).join('، ') || (isFa ? 'نگهداری استاندارد' : 'Standard support'), { isFa }),
      ],
    }),
    new TableRow({
      children: [
        createCell(isFa ? 'تحلیل مچاله‌شوندگی در عمق (Hoek & GSI)' : 'Hoek Squeezing at Depth', { bold: true, isFa }),
        createCell(isFa ? (data.gsiSupportResult?.behaviorCategoryFa ?? '') : (data.gsiSupportResult?.behaviorCategoryEn ?? ''), { bold: true, isFa }),
        createCell(`کرنش شعاعی: ${data.gsiSupportResult?.strainPercent ?? 0}%`, { isFa }),
        createCell(`فشار لازم (Pi): ${data.gsiSupportResult?.requiredSupportPressurePi ?? 0} MPa`, { isFa }),
        createCell(isFa ? (data.gsiSupportResult?.supportTypeFa ?? '') : (data.gsiSupportResult?.supportTypeEn ?? ''), { isFa }),
      ],
    }),
  ];

  // Table 5: Signatures (Designer empty, Middle is Software Developer Saeed Jamali, Right is Reviewer)
  const signatureRows = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              bidirectional: isFa,
              alignment: isFa ? AlignmentType.RIGHT : AlignmentType.LEFT,
              children: [
                new TextRun({ text: isFa ? 'طراح و محاسب پروژه:' : 'Project Designer / Engineer:', bold: true, size: 19, rightToLeft: isFa, font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial' }),
              ],
            }),
            new Paragraph({
              bidirectional: isFa,
              alignment: isFa ? AlignmentType.RIGHT : AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: isFa
                    ? `نام و نام خانوادگی: ${data.designerName || '___________________'}`
                    : `Name: ${data.designerName || '___________________'}`,
                  size: 18,
                  bold: Boolean(data.designerName),
                  rightToLeft: isFa,
                  font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial',
                }),
              ],
            }),
            new Paragraph({
              bidirectional: isFa,
              alignment: isFa ? AlignmentType.RIGHT : AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: isFa
                    ? `سمت / شرکت: ${data.designerTitle || '___________________'}`
                    : `Title / Org: ${data.designerTitle || '___________________'}`,
                  size: 18,
                  rightToLeft: isFa,
                  font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial',
                }),
              ],
            }),
            new Paragraph({
              bidirectional: isFa,
              alignment: isFa ? AlignmentType.RIGHT : AlignmentType.LEFT,
              children: [
                new TextRun({ text: isFa ? 'مهر و امضا:' : 'Signature / Stamp:', size: 18, rightToLeft: isFa, font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial' }),
              ],
            }),
          ],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
          },
          margins: { top: 120, bottom: 120, left: 140, right: 140 },
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              bidirectional: isFa,
              alignment: isFa ? AlignmentType.RIGHT : AlignmentType.LEFT,
              children: [
                new TextRun({ text: isFa ? 'تاییدکننده و مهندس ناظر ژئوتکنیک:' : 'Geotechnical Reviewer / Supervisor:', bold: true, size: 19, rightToLeft: isFa, font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial' }),
              ],
            }),
            new Paragraph({
              bidirectional: isFa,
              alignment: isFa ? AlignmentType.RIGHT : AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: isFa
                    ? `نام و نام خانوادگی: ${data.approverName || '___________________'}`
                    : `Name: ${data.approverName || '___________________'}`,
                  size: 18,
                  bold: Boolean(data.approverName),
                  rightToLeft: isFa,
                  font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial',
                }),
              ],
            }),
            new Paragraph({
              bidirectional: isFa,
              alignment: isFa ? AlignmentType.RIGHT : AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: isFa
                    ? `دستگاه نظارت: ${data.approverTitle || '___________________'}`
                    : `Supervision Body: ${data.approverTitle || '___________________'}`,
                  size: 18,
                  rightToLeft: isFa,
                  font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial',
                }),
              ],
            }),
            new Paragraph({
              bidirectional: isFa,
              alignment: isFa ? AlignmentType.RIGHT : AlignmentType.LEFT,
              children: [
                new TextRun({ text: isFa ? 'مهر و امضا:' : 'Signature / Stamp:', size: 18, rightToLeft: isFa, font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial' }),
              ],
            }),
          ],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
          },
          margins: { top: 120, bottom: 120, left: 140, right: 140 },
        }),
      ],
    }),
  ];

  const rockLoadRows = [
    new TableRow({
      children: [
        createCell(isFa ? 'روش و فرمول برآورد بار' : 'Method / Formulation', { isHeader: true, isFa, bold: true }),
        createCell(isFa ? 'پارامترهای مبنا' : 'Governing Parameters', { isHeader: true, isFa, bold: true }),
        createCell(isFa ? 'ارتفاع بار سنگ (Hp / m)' : 'Rock Load Height (Hp / m)', { isHeader: true, isFa, bold: true }),
        createCell(isFa ? 'فشار سقف (kPa)' : 'Roof Pressure (kPa)', { isHeader: true, isFa, bold: true }),
        createCell(isFa ? 'فشار دیواره / ملاحظات طراحی' : 'Sidewall Pressure / Design Notes', { isHeader: true, isFa, bold: true }),
      ],
    }),
    new TableRow({
      children: [
        createCell(isFa ? 'روش ترزاقی (Terzaghi 1946 - جدول ۶-۸)' : 'Terzaghi Method (1946 - Table 6-8)', { isFa, bold: true }),
        createCell(isFa ? (data.terzaghiResult?.condition?.nameFa ?? 'سنگ درزه‌دار') : (data.terzaghiResult?.condition?.nameEn ?? 'Jointed Rock'), { isFa }),
        createCell(`${data.terzaghiResult?.hpAvg ?? '—'} m (${data.terzaghiResult?.hpMin ?? 0}-${data.terzaghiResult?.hpMax ?? 0})`, { isFa, align: AlignmentType.CENTER }),
        createCell(`${data.terzaghiResult?.pvAvgKPa ?? '—'} kPa (${data.terzaghiResult?.pvAvgMPa ?? '—'} MPa)`, { isFa, align: AlignmentType.CENTER }),
        createCell(`${data.terzaghiResult?.phAvgKPa ?? '—'} kPa | ${isFa ? (data.terzaghiResult?.condition?.sidePressureNoteFa ?? '') : (data.terzaghiResult?.condition?.sidePressureNoteEn ?? '')}`, { isFa }),
      ],
    }),
    new TableRow({
      children: [
        createCell(isFa ? 'سیستم Q بارتون و گریمستاد (Grimstad & Barton 1993)' : 'Grimstad & Barton Q-System (1993)', { isFa, bold: true }),
        createCell(`Q=${data.qValue} | Jn=9 | Jr=1.5`, { isFa }),
        createCell(`${data.bartonRockLoadResult?.hpEquivalentM ?? '—'} m`, { isFa, align: AlignmentType.CENTER }),
        createCell(`${data.bartonRockLoadResult?.pRoofKPa ?? '—'} kPa (${data.bartonRockLoadResult?.pRoofMPa ?? '—'} MPa)`, { isFa, align: AlignmentType.CENTER }),
        createCell(`${data.bartonRockLoadResult?.pWallKPa ?? '—'} kPa | ${isFa ? `طول بولت L = ${data.bartonRockLoadResult?.boltLengthL ?? '—'}m` : `Bolt L = ${data.bartonRockLoadResult?.boltLengthL ?? '—'}m`}`, { isFa }),
      ],
    }),
    new TableRow({
      children: [
        createCell(isFa ? 'روش تجربی کوردینگ (Cording et al. 1971)' : 'Cording et al. Method (1971)', { isFa, bold: true }),
        createCell(`Hp = 0.3 B (${data.cordingResult?.hpCrown ?? '—'} m) | B=${data.span}m`, { isFa }),
        createCell(`${data.cordingResult?.hpCrown ?? '—'} m`, { isFa, align: AlignmentType.CENTER }),
        createCell(`${data.cordingResult?.pCrownKPa ?? '—'} kPa (${data.cordingResult?.pCrownMPa ?? '—'} MPa)`, { isFa, align: AlignmentType.CENTER }),
        createCell(`${data.cordingResult?.pSidewallKPa ?? '—'} kPa | ${isFa ? (data.rqd > 75 ? 'RQD > 75%: بار دیواره ناچیز و بولت موردی' : 'نگهداری دیواره الزامی است') : (data.rqd > 75 ? 'RQD > 75%: Negligible sidewall load' : 'Sidewall support mandatory')}`, { isFa }),
      ],
    }),
    new TableRow({
      children: [
        createCell(isFa ? 'فشار بحرانی نگهداری هوک (Hoek 1999)' : 'Hoek Critical Support Pressure (1999)', { isFa, bold: true }),
        createCell(`Po = ${data.hoekRockLoadResult?.p0HydrostaticMPa ?? '—'} MPa | σcm = ${data.hoekRockLoadResult?.sigmaCmMPa ?? '—'} MPa`, { isFa }),
        createCell(data.hoekRockLoadResult?.requiresSupport ? `${((data.hoekRockLoadResult?.criticalPressurePcrKPa ?? 0) / (data.unitWeight || 25)).toFixed(2)} m` : '0 m', { isFa, align: AlignmentType.CENTER }),
        createCell(`${Math.max(0, data.hoekRockLoadResult?.criticalPressurePcrKPa ?? 0)} kPa (${Math.max(0, data.hoekRockLoadResult?.criticalPressurePcrMPa ?? 0)} MPa)`, { isFa, align: AlignmentType.CENTER }),
        createCell(isFa ? (data.hoekRockLoadResult?.requiresSupport ? 'نیازمند اعمال فشار نگهداری داخلی Pi ≥ Pcr' : 'توده‌سنگ الاستیک؛ بدون نیاز به فشار نگهداری') : (data.hoekRockLoadResult?.requiresSupport ? 'Requires Pi ≥ Pcr' : 'Elastic rock mass'), { isFa }),
      ],
    }),
    new TableRow({
      children: [
        createCell(isFa ? 'تنش‌های الاستیک مرزی کرش (Kirsch 1898)' : 'Kirsch Elastic Boundary Stresses (1898)', { isFa, bold: true }),
        createCell(`σv = ${data.kirschStressResult?.sigmaV ?? '—'} MPa | K = ${data.kRatio}`, { isFa }),
        createCell('—', { isFa, align: AlignmentType.CENTER }),
        createCell(`${data.kirschStressResult?.sigmaThetaRoof ?? '—'} MPa (${isFa ? 'تاج' : 'Crown'})`, { isFa, align: AlignmentType.CENTER }),
        createCell(`${data.kirschStressResult?.sigmaThetaWall ?? '—'} MPa (${isFa ? 'دیواره' : 'Wall'}) | ${isFa ? (data.kirschStressResult?.spallingRiskFa ?? '') : (data.kirschStressResult?.spallingRiskEn ?? '')}`, { isFa }),
      ],
    }),
    new TableRow({
      children: [
        createCell(isFa ? 'روش دیر بر مبنای RQD (Deere et al. 1970)' : 'Deere et al. RQD Load (1970)', { isFa, bold: true }),
        createCell(`RQD = ${data.rqd}% | Hp = ((100-RQD)/100) × B`, { isFa }),
        createCell(`${data.deereRockLoadResult?.hp ?? '—'} m`, { isFa, align: AlignmentType.CENTER }),
        createCell(`${data.deereRockLoadResult?.pvKPa ?? '—'} kPa (${data.deereRockLoadResult?.pvMPa ?? '—'} MPa)`, { isFa, align: AlignmentType.CENTER }),
        createCell(isFa ? 'برآورد بار سنگ سست ناشی از درزه‌داری مغزه' : 'Dead weight rock load from jointed core', { isFa }),
      ],
    }),
  ];

  const sec = {
    inputs: data.sections?.inputs ?? true,
    excavability: data.sections?.excavability ?? true,
    standUpTime: data.sections?.standUpTime ?? true,
    support: data.sections?.support ?? true,
    rockLoad: data.sections?.rockLoad ?? true,
    signatures: data.sections?.signatures ?? true,
  };

  const docChildren: (Paragraph | Table)[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      bidirectional: isFa,
      children: [
        new TextRun({
          text: isFa
            ? 'گزارش رسمی تحلیل ژئومکانیکی، قابلیت حفاری، زمان خودپایداری و سیستم نگهداری تونل'
            : 'Official Geotechnical Analysis, Excavability, Stand-up Time & Support Design Report',
          bold: true,
          size: 28,
          color: '0f172a',
          rightToLeft: isFa,
          font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: isFa,
      children: [
        new TextRun({
          text: isFa
            ? `تاریخ صدور: ${data.reportDateStr} | شناسه گزارش: GEO-REP-${data.depth}-${Math.round(data.rmr)}`
            : `Report Date: ${data.reportDateStr} | Doc ID: GEO-REP-${data.depth}-${Math.round(data.rmr)}`,
          size: 19,
          color: '64748b',
          rightToLeft: isFa,
          font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: isFa ? AlignmentType.RIGHT : AlignmentType.LEFT,
      bidirectional: isFa,
      spacing: { before: 120, after: 120 },
      children: [
        new TextRun({
          text: isFa
            ? `عنوان پروژه: ${data.projectTitle || '____________________________________________________'}`
            : `Project Title: ${data.projectTitle || '____________________________________________________'}`,
          bold: true,
          size: 20,
          color: '0f172a',
          rightToLeft: isFa,
          font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial',
        }),
      ],
    }),
    new Paragraph({ text: '' }),
  ];

  let sectionCounter = 1;

  if (sec.inputs) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: isFa ? AlignmentType.RIGHT : AlignmentType.LEFT,
        bidirectional: isFa,
        children: [
          new TextRun({
            text: isFa ? `${sectionCounter}. مشخصات هندسی و پارامترهای ژئوتکنیکی ورودی` : `${sectionCounter}. Geometry & Input Geotechnical Parameters`,
            bold: true,
            size: 23,
            color: '1e3a8a',
            rightToLeft: isFa,
            font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial',
          }),
        ],
      }),
      new Table({
        visuallyRightToLeft: isFa,
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: inputRows,
      }),
      new Paragraph({ text: '' })
    );
    sectionCounter++;
  }

  if (sec.excavability) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: isFa ? AlignmentType.RIGHT : AlignmentType.LEFT,
        bidirectional: isFa,
        children: [
          new TextRun({
            text: isFa ? `${sectionCounter}. ارزیابی جامع قابلیت حفاری (Excavability Assessment)` : `${sectionCounter}. Comprehensive Excavability Assessment`,
            bold: true,
            size: 23,
            color: '1e3a8a',
            rightToLeft: isFa,
            font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial',
          }),
        ],
      }),
      new Table({
        visuallyRightToLeft: isFa,
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: excavabilityRows,
      }),
      new Paragraph({ text: '' })
    );
    sectionCounter++;
  }

  if (sec.standUpTime) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: isFa ? AlignmentType.RIGHT : AlignmentType.LEFT,
        bidirectional: isFa,
        children: [
          new TextRun({
            text: isFa ? `${sectionCounter}. ارزیابی زمان خودپایداری تونل (Stand-up Time Assessment)` : `${sectionCounter}. Tunnel Stand-up Time Assessment`,
            bold: true,
            size: 23,
            color: '1e3a8a',
            rightToLeft: isFa,
            font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial',
          }),
        ],
      }),
      new Table({
        visuallyRightToLeft: isFa,
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: standUpRows,
      }),
      new Paragraph({ text: '' })
    );
    sectionCounter++;
  }

  if (sec.support) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: isFa ? AlignmentType.RIGHT : AlignmentType.LEFT,
        bidirectional: isFa,
        children: [
          new TextRun({
            text: isFa ? `${sectionCounter}. طرح و توصیه سیستم نگهداری تجربی (Empirical Support Design)` : `${sectionCounter}. Empirical Support Recommendations`,
            bold: true,
            size: 23,
            color: '1e3a8a',
            rightToLeft: isFa,
            font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial',
          }),
        ],
      }),
      new Table({
        visuallyRightToLeft: isFa,
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: supportRows,
      }),
      new Paragraph({
        bidirectional: isFa,
        alignment: isFa ? AlignmentType.RIGHT : AlignmentType.LEFT,
        spacing: { before: 100, after: 100 },
        children: [
          new TextRun({
            text: isFa
              ? '• نکته کلیدی سیستم نگهداری RMR بینیاوسکی: این روش برای تونل نعل اسبی با دهانه ۱۰ متر، تنش قائم کمتر از ۲۵ مگاپاسکال و روش ساخت حفاری و انفجار معتبر است.'
              : '• Key Note for Bieniawski RMR Support: This method is valid for horseshoe-shaped tunnels with a 10 m span, vertical stress of less than 25 MPa, and drill & blast construction method.',
            bold: true,
            size: 19,
            color: '9a3412',
            rightToLeft: isFa,
            font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial',
          }),
        ],
      }),
      new Paragraph({ text: '' })
    );
    sectionCounter++;
  }

  if (sec.rockLoad) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: isFa ? AlignmentType.RIGHT : AlignmentType.LEFT,
        bidirectional: isFa,
        children: [
          new TextRun({
            text: isFa ? `${sectionCounter}. برآورد بار سنگ و تحلیل تنش‌های بازشدگی (Rock Load & Stress Estimation)` : `${sectionCounter}. Rock Load & Opening Stress Estimation`,
            bold: true,
            size: 23,
            color: '1e3a8a',
            rightToLeft: isFa,
            font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial',
          }),
        ],
      }),
      new Table({
        visuallyRightToLeft: isFa,
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: rockLoadRows,
      }),
      new Paragraph({
        bidirectional: isFa,
        alignment: isFa ? AlignmentType.RIGHT : AlignmentType.LEFT,
        spacing: { before: 100, after: 100 },
        children: [
          new TextRun({
            text: isFa
              ? '• یادداشت مهندسی بار سنگ: نتایج روش‌های ترزاقی، گریمستاد-بارتون، کوردینگ و هوک بر مبنای فرضیات متفاوتی (بلوک گسیختگی، فشار تجربی سقف و نگهداری الاستوپلاستیک) توسعه یافته‌اند و باید با توجه به شرایط زمین‌شناسی ساختگاهی مقایسه و استفاده شوند.'
              : '• Rock Load Engineering Note: Terzaghi, Barton, Cording, and Hoek results reflect different physical mechanisms (dead weight block, empirical roof pressure, and elastoplastic critical containment) and should be interpreted in conjunction with site geological conditions.',
            italics: true,
            size: 18,
            color: '475569',
            rightToLeft: isFa,
            font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial',
          }),
        ],
      }),
      new Paragraph({ text: '' })
    );
    sectionCounter++;
  }

  if (sec.signatures) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: isFa ? AlignmentType.RIGHT : AlignmentType.LEFT,
        bidirectional: isFa,
        children: [
          new TextRun({
            text: isFa ? `${sectionCounter}. شناسنامه مهندسی، توسعه‌دهنده نرم‌افزار و تاییدیه پروژه` : `${sectionCounter}. Engineering Credits, Software Developer & Project Sign-off`,
            bold: true,
            size: 23,
            color: '1e3a8a',
            rightToLeft: isFa,
            font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial',
          }),
        ],
      }),
      new Table({
        visuallyRightToLeft: isFa,
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: signatureRows,
      }),
      new Paragraph({
        bidirectional: isFa,
        alignment: isFa ? AlignmentType.RIGHT : AlignmentType.LEFT,
        spacing: { before: 180, after: 100 },
        children: [
          new TextRun({
            text: isFa
              ? 'نرم افزار طبقه بندی مهندسی سنگ و طراحی تونل بر اساس روش های تجربی، ورژن 1.0 توسعه دهنده سعید جمالی زواره'
              : 'Empirical Rock Mass Classification & Tunnel Design Software, Version 1.0 | Developer: Saeed Jamali Zavareh',
            size: 17,
            color: '475569',
            italics: true,
            rightToLeft: isFa,
            font: isFa ? 'B Nazanin, Tahoma, Arial' : 'Arial',
          }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Generates an official high-resolution PDF from the report HTML container.
 * Slices by discrete A4 pages (.official-document-page) to avoid splitting tables or lines across page boundaries.
 */
export async function generatePdfBlob(element: HTMLElement, fileName: string): Promise<void> {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const pageElements = element.querySelectorAll<HTMLElement>('.official-document-page');

    if (pageElements && pageElements.length > 0) {
      for (let i = 0; i < pageElements.length; i++) {
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        const pageEl = pageElements[i];
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc) => {
            const allElements = clonedDoc.querySelectorAll('*');
            allElements.forEach((node) => {
              const el = node as HTMLElement;
              if (el.style) {
                el.style.letterSpacing = 'normal';
                el.style.wordSpacing = 'normal';
              }
            });
          },
        });

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }
    } else {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((node) => {
            const el = node as HTMLElement;
            if (el.style) {
              el.style.letterSpacing = 'normal';
              el.style.wordSpacing = 'normal';
            }
          });
        },
      });

      const totalPages = Math.ceil(canvas.height / ((canvas.width * pdfHeight) / pdfWidth));
      const pageCanvasHeight = (canvas.width * pdfHeight) / pdfWidth;
      let renderedHeight = 0;

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.min(pageCanvasHeight, canvas.height - renderedHeight);

        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            renderedHeight,
            canvas.width,
            sliceCanvas.height,
            0,
            0,
            canvas.width,
            sliceCanvas.height
          );

          const sliceData = sliceCanvas.toDataURL('image/png');
          const sliceMmHeight = (sliceCanvas.height * pdfWidth) / canvas.width;
          pdf.addImage(sliceData, 'PNG', 0, 0, pdfWidth, sliceMmHeight);
        }

        renderedHeight += pageCanvasHeight;
      }
    }

    // Generate blob and download reliably via anchor tag
    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to generate PDF canvas, falling back to window.print():', error);
    window.print();
  }
}
