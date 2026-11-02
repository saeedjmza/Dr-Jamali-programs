import React, { useState } from 'react';
import { RussoSupportResult } from '../../types';
import {
  Compass,
  AlertTriangle,
  Layers,
  Shield,
  Activity,
  Maximize2,
  Info,
  CheckCircle2,
  TrendingDown,
  Zap,
  BookOpen,
  Award,
  ArrowRightLeft,
  FileText,
} from 'lucide-react';
import { RussoFourQuadrantPlate } from './RussoFourQuadrantPlate';
import { RussoStSectionsExplorer } from './RussoStSectionsExplorer';

interface RussoMultipleGraphChartProps {
  russoResult: RussoSupportResult;
  onUpdateGsi: (gsi: number) => void;
  onUpdateDepth: (depth: number) => void;
  onUpdateUcs: (ucs: number) => void;
  lang: 'fa' | 'en';
}

export type RussoViewMode =
  | '4quadrants'       // Figure 2: The 4-graph interaction layout
  | 'graph4_behavior'  // Figure 4: Ground behaviour & support section types ST A - F
  | 'brittle_burst'    // Figure 3: Spalling & rockburst hazard criterion
  | 'table3_mitigations' // Table 3: Verbatim engineering mitigation measures (Ma & Mb)
  | 'authentic_source';  // Authentic literature citations, DOI & methodology notes

export const RussoMultipleGraphChart: React.FC<RussoMultipleGraphChartProps> = ({
  russoResult,
  onUpdateGsi,
  onUpdateDepth,
  onUpdateUcs,
  lang,
}) => {
  const isFa = lang === 'fa';
  const [activeView, setActiveView] = useState<RussoViewMode>('4quadrants');

  // Working point coordinates
  const currentIc = russoResult.competencyIndexIc;
  const currentScm = russoResult.rockMassStrengthScm;
  const currentRatio = russoResult.stressStrengthRatio;

  // Verbatim Table 3 Mitigation Measures Catalog from Russo (2014)
  const table3Catalog = [
    // Pre-confinement / at face (Ma)
    { code: 'Ma1', cat: 'Ma', titleFa: 'تزریق‌های تحکیمی و آب‌بندی در سینه کار', titleEn: 'Systematic face grouting / consolidation', descFa: 'تزریق دوغاب سیمان یا رزین پلی‌یورتان پیشرو جهت تحکیم خمیره سنگ‌های خردشده و کنترل جریان آب.', descEn: 'Consolidation grouting to stabilize fractured gouge and halt water ingress.' },
    { code: 'Ma2', cat: 'Ma', titleFa: 'میخ‌کوبی سینه کار با المان‌های فایبرگلاس (Fiberglass face nails)', titleEn: 'Face pre-reinforcement with fiberglass dowels', descFa: 'تثبیت سینه کار با میلگردهای فایبرگلاس برش‌پذیر (طول ۱۲-۱۸ متر) با اورلپ ۵-۶ متری جهت کنترل اکستروژن سینه کار.', descEn: 'Fiberglass face bolts (L=12-18m, overlap 5-6m) preventing face extrusion in squeezing/spalling ground.' },
    { code: 'Ma3', cat: 'Ma', titleFa: 'پیش‌نگهداری چتری لوله‌ای / فورپولینگ سنگین (Pipe forepoling umbrella)', titleEn: 'Heavy pipe roof umbrella forepoling', descFa: 'نصب لوله‌های فولادی مشبک Ø114-140mm بالای تاج با تزریق دوغاب جهت مهار ریزش‌های ناگهانی.', descEn: 'Grouted steel pipe arch (Ø114-140mm) over tunnel crown protecting face workers.' },
    { code: 'Ma4', cat: 'Ma', titleFa: 'حفر چال‌های تخلیه فشار آب پیشرو (Sub-horizontal drainage holes)', titleEn: 'Sub-horizontal face drainage boreholes', descFa: 'چال‌های زهکش سینه کار به طول ۱۵ تا ۲۵ متر جهت تخلیه اضافه فشار آب منفذی پیش از حفاری.', descEn: 'Drainage holes ahead of heading relieving transient water pressures.' },
    { code: 'Ma5', cat: 'Ma', titleFa: 'میکروپایل‌های جانبی و بهسازی کف (Spiling / micropiling)', titleEn: 'Spiling and side micropiles', descFa: 'میخ‌کوبی فولادی سبک (Spiles) با شاتکریت پیرامونی در سنگ‌های درزه‌دار با ناپایداری گوه‌ای.', descEn: 'Heavy spiles and spiling bars controlling unraveling crown wedges.' },
    { code: 'Ma6', cat: 'Ma', titleFa: 'حفاری طاق و پله و پیشروی مقطعی (Staged top heading and bench)', titleEn: 'Subdivided excavation (Top heading & bench)', descFa: 'تقسیم مقطع حفاری به کلاهک بالایی، پله و مقاطع جانبی برای محدودسازی تغییرشکل.', descEn: 'Staged excavation sequence preventing mass yielding of the full cross-section.' },
    { code: 'Ma7', cat: 'Ma', titleFa: 'شاتکریت حفاظتی سینه کار (Face sealing shotcrete)', titleEn: 'Protective face shotcrete sealing', descFa: 'پاشش لایه شاتکریت ۵ تا ۱۰ سانتی‌متری بلافاصله پس از آتشباری جهت ممانعت از هوازدگی و ریزش سنگ‌پریدگی.', descEn: 'Immediate shotcrete seal preventing atmospheric slaking and rockburst spalls.' },
    { code: 'Ma8', cat: 'Ma', titleFa: 'تعدیل طول گام حفاری (Restricted round length)', titleEn: 'Shortened round length (0.8 - 1.5 m)', descFa: 'کاهش طول گام پیشروی به ۱ الی ۱.۵ متر به منظور حفظ پایداری موقت دهانه.', descEn: 'Round length strictly restrained to minimize unsupported cavity span.' },

    // Primary lining behind face (Mb)
    { code: 'Mb1', cat: 'Mb', titleFa: 'راک‌بولت‌های شعاعی سیستماتیک (Systematic radial rockbolts)', titleEn: 'Systematic radial pattern rockbolts', descFa: 'نصب الگویی بولت‌های رزینی یا دوغابی به طول ۳ تا ۵ متر در تمام محیط سقف و دیواره.', descEn: 'Pattern rockbolts (L=3-5m) pinning rock blocks and forming an arch.' },
    { code: 'Mb2', cat: 'Mb', titleFa: 'شاتکریت مسلح به الیاف فولادی (Steel fiber reinforced shotcrete)', titleEn: 'Fiber reinforced shotcrete S(fr)', descFa: 'شاتکریت الیافی پرطاقت به ضخامت ۵۰ الی ۲۰۰ میلی‌متر با ظرفیت جذب انرژی بالا (E500-1000J).', descEn: 'High-toughness S(fr) conforming to ground deformation without brittle failure.' },
    { code: 'Mb3', cat: 'Mb', titleFa: 'المان‌های انعطاف‌پذیر تسلیم‌شونده در شاتکریت (Yielding lining slots)', titleEn: 'Yielding elements / lining deformational gaps', descFa: 'تعبیه درزهای طولی فشرده‌شونده (HiDCon یا شیارهای تسلیم‌شونده) جهت تخلیه کرنش‌های مچاله‌کننده بدون تخریب لاینینگ.', descEn: 'Compressible slots accommodating severe squeezing strains before full arch activation.' },
    { code: 'Mb4', cat: 'Mb', titleFa: 'دنده‌های شاتکریتی مسلح شده با آرماتور خرپایی (RRS Ribs)', titleEn: 'Reinforced Ribs of Shotcrete (RRS)', descFa: 'دنده‌های قوسی شاتکریتی RRS I تا RRS III با فاصله ۱.۰ تا ۲.۵ متر به عنوان جایگزین قاب فولادی.', descEn: 'Lattice girder / rebar reinforced ribs embedded in shotcrete for structural ring action.' },
    { code: 'Mb5', cat: 'Mb', titleFa: 'بولت‌های تسلیم‌شونده جاذب انرژی (Yielding / D-Bolts)', titleEn: 'Energy-absorbing yielding bolts (D-Bolts)', descFa: 'بولت‌های ویژه با قابلیت تغییرشکل پلاستیک بزرگ (تا ۲۰۰ میلی‌متر) تحت بارهای سنگ‌پریدگی پویا.', descEn: 'Highly ductile yielding bolts absorbing dynamic rockburst energy without tensile rupture.' },
    { code: 'Mb6', cat: 'Mb', titleFa: 'قاب‌های فولادی سنگین نوردشده یا لغزنده (Steel arches TH / HEB)', titleEn: 'Steel arches with sliding joints', descFa: 'قاب‌های فولادی HEB یا قوس‌های لغزنده TH با فواصل ۰.۸ تا ۱.۵ متر متصل به کف‌بند.', descEn: 'Heavy steel sets with yielding sliding fishplates.' },
    { code: 'Mb7', cat: 'Mb', titleFa: 'بستن فوری رینگ لاینینگ و بتن‌ریزی اینورت (Immediate invert closure)', titleEn: 'Prompt invert arch closure', descFa: 'اجرای قوس اینورت در فاصله کمتر از ۱۰-۱۵ متری سینه کار جهت تشکیل مقطع دایره‌ای بسته باربر.', descEn: 'Fast structural invert closure forming a closed compression ring against bottom heave.' },
    { code: 'Mb8', cat: 'Mb', titleFa: 'پایش مستمر ابزاردقیق و همگرایی‌سنجی (Real-time convergence monitoring)', titleEn: 'Convergence & extensometer monitoring', descFa: 'ثبت تغییرشکل‌های سه بعدی با تارگت‌های اپتیکی و اکستنسومترهای گمانه‌ای جهت اعتبارسنجی سیستم نگهداری.', descEn: '3D optical target monitoring and borehole extensometers validating support response.' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/95 border border-indigo-500/30 shadow-2xl space-y-5 animate-in fade-in duration-300">
      {/* Top Banner & Mode Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400">
            <Compass className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base sm:text-lg font-bold text-slate-100">
              {isFa
                ? 'پلاک‌های رسمی روش چهارگانه روسو (Russo 2014 Multiple Graph Approach)'
                : 'Authoritative Russo (2014) Multiple Graph Methodology & Plates'}
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {isFa
              ? 'مستندسازی و پیاده‌سازی وفادارانه دیاگرام‌های مقاله رسمی روسو (۲۰۱۴) در نشریه معتبر TUST: نمودار ۴ بخشی تعاملی، ارزیابی شکست ترد و سنگ‌پریدگی، و جدول ۳ تدابیر کاهش خطر'
              : 'Faithful implementation of published plates from Russo (2014) in Tunnelling and Underground Space Technology: 4-Graph matrix, brittle spalling, and Table 3 mitigation.'}
          </p>
        </div>

        {/* View Mode Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full lg:w-auto">
          <button
            onClick={() => setActiveView('4quadrants')}
            className={`px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center ${
              activeView === '4quadrants'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="نمودار ۴ بخشی یکپارچه تعاملی (Figure 2 روسو ۲۰۱۴)"
          >
            {isFa ? 'شکل ۲: نمودار ۴ بخشی' : 'Fig 2: 4-Quadrant Matrix'}
          </button>
          <button
            onClick={() => setActiveView('graph4_behavior')}
            className={`px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center ${
              activeView === 'graph4_behavior'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="نمودار رفتار و مقاطع ST (Figure 4 روسو ۲۰۱۴)"
          >
            {isFa ? 'شکل ۴: مقاطع ST و رفتار' : 'Fig 4: ST Sections'}
          </button>
          <button
            onClick={() => setActiveView('brittle_burst')}
            className={`px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center ${
              activeView === 'brittle_burst'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="تحلیل شکست ترد و راک‌برست (Figure 3 روسو ۲۰۱۴)"
          >
            {isFa ? 'شکل ۳: شکست ترد' : 'Fig 3: Brittle Spalling'}
          </button>
          <button
            onClick={() => setActiveView('table3_mitigations')}
            className={`px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center ${
              activeView === 'table3_mitigations'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="جدول ۳ روسو ۲۰۱۴: تدابیر کاهش خطر Ma و Mb"
          >
            {isFa ? 'جدول ۳: تدابیر کاهش خطر' : 'Table 3: Mitigations'}
          </button>
          <button
            onClick={() => setActiveView('authentic_source')}
            className={`px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center ${
              activeView === 'authentic_source'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="شناسنامه کتابشناختی و سند اصیل مقاله"
          >
            {isFa ? 'شناسنامه مأخذ' : 'Scholarly Source'}
          </button>
        </div>
      </div>

      {/* ACTIVE CITATION BOX */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-slate-300">
          <BookOpen className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span className="font-semibold text-slate-200">
            {isFa
              ? 'مأخذ علمی معتبر: Russo, G. (2014). "An update of the \'multiple graph\' approach", Tunnelling and Underground Space Technology, 41, 74–81.'
              : 'Official Citation: Russo, G. (2014), Tunnelling and Underground Space Technology, 41, 74–81. DOI: 10.1016/j.tust.2013.11.011'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px] self-end sm:self-auto">
          <span>IC = <strong className="text-emerald-300">{currentIc}</strong></span>
          <span>ST = <strong className="text-indigo-300">{russoResult.sectionType}</strong></span>
          <span>σcm = <strong className="text-purple-300">{currentScm} MPa</strong></span>
        </div>
      </div>

      {/* Interactive Sliders for Live Sensitivity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
        <div>
          <div className="flex justify-between font-semibold text-slate-300 mb-1">
            <span>{isFa ? 'شاخص مقاومت زمین‌شناسی (GSI):' : 'Geological Strength Index (GSI):'}</span>
            <span className="font-mono text-indigo-400 font-bold">{russoResult.gsi}</span>
          </div>
          <input
            type="range"
            min="10"
            max="90"
            step="1"
            value={russoResult.gsi}
            onChange={(e) => onUpdateGsi(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div>
          <div className="flex justify-between font-semibold text-slate-300 mb-1">
            <span>{isFa ? 'عمق روباره H (متر):' : 'Overburden Depth H (m):'}</span>
            <span className="font-mono text-indigo-400 font-bold">{russoResult.depth} m</span>
          </div>
          <input
            type="range"
            min="20"
            max="1200"
            step="10"
            value={russoResult.depth}
            onChange={(e) => onUpdateDepth(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div>
          <div className="flex justify-between font-semibold text-slate-300 mb-1">
            <span>{isFa ? 'مقاومت تک‌محوری سنگ بکر σc (MPa):' : 'Intact UCS σc (MPa):'}</span>
            <span className="font-mono text-indigo-400 font-bold">{russoResult.ucs} MPa</span>
          </div>
          <input
            type="range"
            min="5"
            max="220"
            step="5"
            value={russoResult.ucs}
            onChange={(e) => onUpdateUcs(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>

      {/* MAIN VIEW 1: FULL 4-QUADRANT VIEW (FIGURE 2 OF RUSSO 2014) */}
      {activeView === '4quadrants' && (
        <div className="space-y-4">
          <RussoFourQuadrantPlate
            russoResult={russoResult}
            onUpdateGsi={onUpdateGsi}
            onUpdateDepth={onUpdateDepth}
            onUpdateUcs={onUpdateUcs}
            lang={lang}
          />
        </div>
      )}

      {/* VIEW 2: GRAPH 4 DETAILED EXCAVATION BEHAVIOUR & ST SECTIONS (FIGURE 4 OF RUSSO 2014) */}
      {activeView === 'graph4_behavior' && (
        <div className="space-y-4">
          <RussoStSectionsExplorer
            russoResult={russoResult}
            lang={lang}
          />
        </div>
      )}

      {/* VIEW 3: SPALLING & ROCKBURST HAZARD EVALUATION (FIGURE 3 OF RUSSO 2014) */}
      {activeView === 'brittle_burst' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {isFa ? 'نمودار شکل ۳ روسو (۲۰۱۴): ارزیابی خطر شکست ترد، پرتاب سنگ و Spalling' : 'Fig 3 of Russo (2014): Brittle Spalling & Rockburst Criteria'}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${russoResult.isSpallingRisk ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
                {russoResult.isSpallingRisk ? (isFa ? 'مستعد Spalling / پرتاب سنگ' : 'Spalling Risk Active') : (isFa ? 'رفتار غیرترد / بدون خطر راک‌برست' : 'Ductile / No Rockburst Risk')}
              </span>
            </div>

            {/* METRICS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">{isFa ? 'نسبت تنش مماسی به مقاومت بکر:' : 'Stress / Strength Ratio:'}</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{currentRatio.toFixed(3)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">σθ / σc (آستانه: ۰.۶۰)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">{isFa ? 'شاخص شکنندگی سنگ (IF):' : 'Brittleness Index IF:'}</span>
                <span className="font-mono font-bold text-purple-400 text-sm">{russoResult.brittlenessIf || 10}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">IF = σc / σt &gt; 8 (شکننده)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">{isFa ? 'شدت تخمینی راک‌برست:' : 'Estimated Burst Severity:'}</span>
                <span className="font-bold text-rose-400 text-xs block mt-1">{russoResult.rockburstSeverityFa}</span>
              </div>
            </div>

            {/* INTERACTIVE FIGURE 3 CHART SVG */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300 font-bold px-1">
                <span>{isFa ? 'نمودار تعاملی روباره (H) در برابر مقاومت فشاری تک‌محوری (σc):' : 'Depth (H) vs Intact UCS (σc) Diagram:'}</span>
                <span className="font-mono text-indigo-400 text-[11px]">H={russoResult.depth}m | σc={russoResult.ucs}MPa</span>
              </div>

              <div className="w-full flex justify-center overflow-x-auto py-1">
                <svg viewBox="0 0 600 360" dir="ltr" className="w-full max-w-[560px] h-auto select-none font-sans text-xs">
                  <defs>
                    <pattern id="spallSevereHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="10" stroke="#ef4444" strokeWidth="1.2" strokeOpacity="0.4" />
                    </pattern>
                    <pattern id="spallMinorHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="10" stroke="#f59e0b" strokeWidth="1.2" strokeOpacity="0.3" />
                    </pattern>
                  </defs>

                  {/* Background Grid */}
                  <rect x="60" y="30" width="510" height="280" fill="#030712" stroke="#334155" strokeWidth="1.5" rx="6" />

                  {/* Coordinates: X: σc from 20 to 220 MPa (60 to 570 px), Y: Depth H from 0 to 1200 m (310 to 30 px) */}
                  {/* Grid Lines H */}
                  {[200, 400, 600, 800, 1000, 1200].map((h) => {
                    const y = 310 - (h / 1200) * 280;
                    return (
                      <g key={`fig3-h-${h}`}>
                        <line x1="60" y1={y} x2="570" y2={y} stroke="#1e293b" strokeWidth="0.8" />
                        <text x="54" y={y + 4} fill="#64748b" fontSize="9.5" textAnchor="end" fontFamily="monospace">
                          {h}
                        </text>
                      </g>
                    );
                  })}
                  {/* Grid Lines σc */}
                  {[40, 80, 120, 160, 200].map((sc) => {
                    const x = 60 + ((sc - 20) / 200) * 510;
                    return (
                      <g key={`fig3-sc-${sc}`}>
                        <line x1={x} y1="30" x2={x} y2="310" stroke="#1e293b" strokeWidth="0.8" />
                        <text x={x} y="324" fill="#64748b" fontSize="9.5" textAnchor="middle" fontFamily="monospace">
                          {sc}
                        </text>
                      </g>
                    );
                  })}

                  {/* Hazard Zone Polygons */}
                  {/* Zone 3: Severe Spalling & Violent Burst (σθ/σc >= 0.75 => H >= 15 * σc) */}
                  {/* For σc=20 => H=300 (y=240), for σc=80 => H=1200 (y=30) */}
                  <polygon
                    points={`60,${310 - (300 / 1200) * 280} ${60 + ((80 - 20) / 200) * 510},30 60,30`}
                    fill="url(#spallSevereHatch)"
                    stroke="#ef4444"
                    strokeWidth="1.2"
                  />
                  <text x="120" y="70" fill="#f87171" fontSize="10.5" fontWeight="bold">
                    {isFa ? 'راک‌برست شدید (H2)' : 'Violent Burst (H2)'}
                  </text>
                  <text x="120" y="86" fill="#fca5a5" fontSize="9" fontFamily="monospace">
                    σθ / σc ≥ 0.75
                  </text>

                  {/* Zone 2: Moderate Spalling (0.60 <= σθ/σc < 0.75) */}
                  {/* H = 12 * σc to 15 * σc */}
                  <polygon
                    points={`60,${310 - (240 / 1200) * 280} ${60 + ((100 - 20) / 200) * 510},30 ${60 + ((80 - 20) / 200) * 510},30 60,${310 - (300 / 1200) * 280}`}
                    fill="url(#spallMinorHatch)"
                    stroke="#f59e0b"
                    strokeWidth="1.2"
                  />
                  <text x="210" y="105" fill="#f59e0b" fontSize="10" fontWeight="bold">
                    {isFa ? 'اسپالینگ سنگین' : 'Heavy Spalling'}
                  </text>
                  <text x="210" y="120" fill="#fcd34d" fontSize="8.5" fontFamily="monospace">
                    0.60 ≤ σθ/σc &lt; 0.75
                  </text>

                  {/* Zone 1: Minor Spalling (0.40 <= σθ/σc < 0.60 => H = 8*σc to 12*σc) */}
                  <polygon
                    points={`60,${310 - (160 / 1200) * 280} ${60 + ((150 - 20) / 200) * 510},30 ${60 + ((100 - 20) / 200) * 510},30 60,${310 - (240 / 1200) * 280}`}
                    fill="#3b82f6"
                    fillOpacity="0.1"
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                  />
                  <text x="310" y="150" fill="#38bdf8" fontSize="10" fontWeight="bold">
                    {isFa ? 'اسپالینگ جزئی' : 'Minor Spalling'}
                  </text>
                  <text x="310" y="165" fill="#bae6fd" fontSize="8.5" fontFamily="monospace">
                    0.40 ≤ σθ/σc &lt; 0.60
                  </text>

                  {/* Safe Elastic / Stable Domain */}
                  <text x="440" y="270" fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="middle">
                    {isFa ? 'ناحیه پایدار / بدون Spalling' : 'Stable / No Spalling Hazard'}
                  </text>
                  <text x="440" y="286" fill="#6ee7b7" fontSize="9" fontFamily="monospace" textAnchor="middle">
                    σθ / σc &lt; 0.40
                  </text>

                  {/* Axis Titles */}
                  <text x="315" y="348" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle">
                    {isFa ? 'مقاومت فشاری تک‌محوری سنگ بکر σc (MPa)' : 'Intact UCS σc (MPa)'}
                  </text>
                  <text x="18" y="170" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle" transform="rotate(-90 18 170)">
                    {isFa ? 'عمق روباره H (m)' : 'Overburden Depth H (m)'}
                  </text>

                  {/* Current Working Point */}
                  {(() => {
                    const ptX = 60 + Math.max(0, Math.min(1, (russoResult.ucs - 20) / 200)) * 510;
                    const ptY = 310 - Math.max(0, Math.min(1, russoResult.depth / 1200)) * 280;

                    return (
                      <g>
                        <circle cx={ptX} cy={ptY} r="12" fill="#e11d48" fillOpacity="0.25" className="animate-ping" />
                        <line x1="60" y1={ptY} x2={ptX} y2={ptY} stroke="#e11d48" strokeWidth="1.2" strokeDasharray="3 3" />
                        <line x1={ptX} y1={ptY} x2={ptX} y2="310" stroke="#e11d48" strokeWidth="1.2" strokeDasharray="3 3" />
                        <circle cx={ptX} cy={ptY} r="6" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
                        <rect x={ptX + 10 > 440 ? ptX - 130 : ptX + 10} y={ptY - 14} width="124" height="26" rx="5" fill="#020617" fillOpacity="0.92" stroke="#e11d48" strokeWidth="1.2" />
                        <text x={ptX + 10 > 440 ? ptX - 68 : ptX + 72} y={ptY + 3} fill="#fecdd3" fontSize="10" fontWeight="bold" textAnchor="middle">
                          {isFa ? `پروژه: ${currentRatio.toFixed(2)}` : `Project: ${currentRatio.toFixed(2)}`}
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* FIGURE 3 VISUAL LEGEND */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-950/60 border border-slate-800">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-300 truncate">{isFa ? 'پایدار (σθ/σc < ۰.۴)' : 'Safe (< 0.40)'}</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-950/60 border border-slate-800">
                  <div className="w-3 h-3 rounded-full bg-sky-400 shrink-0" />
                  <span className="text-slate-300 truncate">{isFa ? 'اسپالینگ جزئی (۰.۴-۰.۶)' : 'Minor (0.4-0.6)'}</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-950/60 border border-slate-800">
                  <div className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-slate-300 truncate">{isFa ? 'اسپالینگ سنگین (۰.۶-۰.۷۵)' : 'Heavy (0.6-0.75)'}</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-950/60 border border-slate-800">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-slate-300 truncate">{isFa ? 'راک‌برست شدید (≥ ۰.۷۵)' : 'Violent (≥ 0.75)'}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong>{isFa ? 'تفسیر مکانیکی روسو (۲۰۱۴): ' : 'Mechanistic Interpretation: '}</strong>
              {isFa
                ? 'در اعماق زیاد و روباره‌های سنگین که سنگ دارای مقاومت تک‌محوری بالا (σc > 60 MPa) و درزه‌داری اندک (GSI > 60) است، تجمع تنش مماسی پیرامون حفره به آستانه آغاز ترک‌خوردگی الاستوپلاستیک (حدود ۰.۴ تا ۰.۶ مقاومت فشاری) رسیده و منجر به پدیده انفجاری پوسته شدن (Spalling) و پرتاب شدید تکه‌های سنگ می‌گردد.'
                : 'Under deep overburden in massive hard rocks (σc > 60 MPa, GSI > 60), high tangential stress concentration triggers explosive spalling and strainburst.'}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: TABLE 3 VERBATIM MITIGATION MEASURES */}
      {activeView === 'table3_mitigations' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  {isFa ? 'جدول ۳ مقاله روسو (۲۰۱۴): تدابیر کاهش خطر و مداخلات مهندسی (Ma و Mb)' : 'Table 3 of Russo (2014): Engineering Mitigation Measures'}
                </h4>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {isFa ? 'اقدامات پیش‌نگهداری در سینه کار (Ma1-Ma8) و سیستم نگهداری اولیه پیرامونی (Mb1-Mb8)' : 'Pre-confinement interventions (Ma) and primary support behind the face (Mb)'}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold font-mono">
                {isFa ? `مقطع فعال: ${russoResult.sectionType}` : `Active ST: ${russoResult.sectionType}`}
              </span>
            </div>

            {/* CATALOG OF MEASURES WITH ACTIVE HIGHLIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {table3Catalog.map((item) => {
                const isActive = russoResult.mitigations.some((m) => m.code === item.code);
                return (
                  <div
                    key={item.code}
                    className={`p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                        : 'bg-slate-900/60 border-slate-800/80 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${isActive ? 'bg-indigo-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                        {item.code} ({item.cat === 'Ma' ? (isFa ? 'سینه کار' : 'Face') : (isFa ? 'پیرامون' : 'Radial')})
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          {isFa ? 'الزامی برای مقطع فعلی' : 'Prescribed for Active ST'}
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-slate-200 mt-1">
                      {isFa ? item.titleFa : item.titleEn}
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed mt-1">
                      {isFa ? item.descFa : item.descEn}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: AUTHENTIC BIBLIOGRAPHY & SCHOLARLY SOURCE FACSIMILE */}
      {activeView === 'authentic_source' && (
        <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 shadow-2xl space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <Award className="w-5 h-5" />
              <h4 className="text-base font-bold text-slate-100">
                {isFa ? 'مشخصات استنادی و سند علمی مرجع روسو (۲۰۱۴)' : 'Bibliographic Metadata & Authoritative Citation: Russo (2014)'}
              </h4>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-[11px]">
              TUST Journal (Elsevier)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 leading-relaxed">
            <h5 className="text-sm font-bold text-slate-100">
              An update of the "multiple graph" approach for the preliminary assessment of the excavation behaviour in rock tunnelling
            </h5>
            <div className="text-slate-400 text-[11px] space-y-1">
              <div><strong>نویسنده / Author:</strong> Gianfranco Russo (Geodata Engineering S.p.A., Turin, Italy)</div>
              <div><strong>نشریه / Journal:</strong> Tunnelling and Underground Space Technology (Elsevier), Vol. 41, pp. 74–81.</div>
              <div><strong>شناسه دیجیتال / DOI:</strong> <a href="https://doi.org/10.1016/j.tust.2013.11.011" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">10.1016/j.tust.2013.11.011</a></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 space-y-2 leading-relaxed text-[11px]">
            <span className="text-indigo-300 font-bold block">{isFa ? 'خلاصه مقاله و دستاورد علمی:' : 'Paper Summary & Contributions:'}</span>
            <p>
              {isFa
                ? 'روش «چند نموداری» (Multiple Graph Approach) در اصل توسط روسو در سال ۲۰۰۹ به منظور رفع محدودیت‌های روش‌های تک‌عاملی طبقه‌بندی مهندسی سنگ ارائه گردید و در مقاله سال ۲۰۱۴ بازنگری کامل شد. این چارچوب چهار مؤلفه اساسی را به صورت حلقوی پیوند می‌دهد: ۱) ساختار سنگ با حجم بلوک Vb و شرایط درزه jC، ۲) تخمین مقاومت فشاری توده‌سنگ σcm با مدل هوک-براون، ۳) میدان تنش پیرامونی σθ و محاسبه شاخص شایستگی IC، و ۴) تعیین رده‌های مقطع ST و انتخاب تدابیر کاهش خطر Ma و Mb.'
                : 'Originally proposed by Russo in 2009 and comprehensively updated in 2014, the Multiple Graph approach connects rock mass fabric, Hoek-Brown strength, boundary stress, and competency index into a coherent preliminary tunneling design framework.'}
            </p>
          </div>
        </div>
      )}

      {/* ACTIVE SECTION TYPE CLASSIFICATION RESULT SUMMARY */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-md text-xs font-mono font-bold"
              style={{
                backgroundColor: `${russoResult.color}25`,
                color: russoResult.color,
                border: `1px solid ${russoResult.color}60`,
              }}
            >
              {russoResult.sectionType}
            </span>
            <span className="font-bold text-slate-100 text-sm sm:text-base">
              {isFa ? russoResult.classNameFa : russoResult.classNameEn}
            </span>
          </div>

          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-amber-300 text-xs font-mono font-bold">
            {russoResult.hazardCode}: {isFa ? russoResult.hazardNameFa : russoResult.hazardNameEn}
          </span>
        </div>

        {/* Hazard & Behavior Explanation */}
        <p className="text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-slate-200">{isFa ? 'شرح مخاطره ژئوتکنیکی:' : 'Hazard description:'} </span>
          {isFa ? russoResult.hazardDescFa : russoResult.hazardDescEn}
        </p>

        {/* Key Engineering Indices Calculated by Russo Model */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">{isFa ? 'شاخص شایستگی (IC):' : 'Competency Index (IC):'}</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">{russoResult.competencyIndexIc}</span>
            <span className="text-[10px] text-slate-500 block">
              {russoResult.competencyIndexIc > 1 ? (isFa ? 'دامنه الاستیک' : 'Elastic') : (isFa ? 'دامنه پلاستیک' : 'Plastic')}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">{isFa ? 'مقاومت توده‌سنگ (σcm):' : 'Rock Mass Strength (σcm):'}</span>
            <span className="font-mono font-bold text-purple-400 text-sm">{russoResult.rockMassStrengthScm} MPa</span>
            <span className="text-[10px] text-slate-500 block">Hoek-Brown (s={russoResult.sHoek.toFixed(4)})</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">{isFa ? 'کرنش شعاعی سینه کار (δ₀):' : 'Face Radial Strain (δ₀):'}</span>
            <span className="font-mono font-bold text-amber-400 text-sm">{russoResult.radialDeformationDelta0} %</span>
            <span className="text-[10px] text-slate-500 block">δ₀ = 0.006 · IC⁻¹·⁴⁵</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">{isFa ? 'شعاع زون پلاستیک (Rp/Ro):' : 'Plastic Zone Ratio (Rp/Ro):'}</span>
            <span className="font-mono font-bold text-rose-400 text-sm">{russoResult.plasticRadiusRatio}</span>
            <span className="text-[10px] text-slate-500 block">Rp/Ro = 0.99 · IC⁻⁰·⁴⁴</span>
          </div>
        </div>
      </div>
    </div>
  );
};
