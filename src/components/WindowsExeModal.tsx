import React from 'react';
import { AppLogo } from './common/AppLogo';
import {
  X,
  Monitor,
  Sparkles,
  ShieldCheck,
  WifiOff,
  FileText,
  MousePointerClick,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';

interface WindowsExeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fa' | 'en';
}

export const WindowsExeModal: React.FC<WindowsExeModalProps> = ({ isOpen, onClose, lang }) => {
  const isFa = lang === 'fa';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <AppLogo size="md" className="shrink-0" />
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{isFa ? 'راهنمای اجرای برنامه در ویندوز (Windows Desktop)' : 'Windows Desktop Application Guide'}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-mono">
                  Windows 10 / 11
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isFa
                  ? 'نصب و اجرای آفلاین برنامه به عنوان نرم‌افزار مستقل دسکتاپ در کامپیوتر'
                  : 'Run the application offline as a standalone desktop program'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Option 1: Direct Desktop Installation via Browser (Recommended) */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/40 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {isFa
                    ? 'روش ۱: نصب مستقیم به عنوان نرم‌افزار دسکتاپ ویندوز (پیشنهادی - فوری)'
                    : 'Method 1: Direct Desktop App Installation (Instant)'}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                {isFa ? 'سریع و آسان' : 'Recommended'}
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed text-xs">
              {isFa
                ? 'شما می‌توانید با یک کلیک، این سامانه را مستقیماً به عنوان یک نرم‌افزار مستقل روی سیستم‌عامل ویندوز خود نصب کنید تا آیکون اختصاصی آن در دسکتاپ و منوی استارت قرار گیرد:'
                : 'You can install this system directly as a standalone Windows desktop app with its own dedicated desktop shortcut:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/90 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px]">۱</span>
                  <span>{isFa ? 'کلیک روی آیکون نصب' : 'Click Install Icon'}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isFa
                    ? 'در بالای مرورگر Google Chrome یا Microsoft Edge، روی آیکون 💻 یا نماد نصب در سمت راست نوار آدرس کلیک کنید.'
                    : 'In Chrome or Edge, click the 💻 icon in the address bar.'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/90 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px]">۲</span>
                  <span>{isFa ? 'تأیید نصب' : 'Confirm Install'}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isFa
                    ? 'در پنجره باز شده دکمه Install را بزنید تا برنامه بلافاصله در ویندوز ثبت شود.'
                    : 'Click Install to register the app in Windows.'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/90 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px]">۳</span>
                  <span>{isFa ? 'اجرای مستقل' : 'Run Standalone'}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isFa
                    ? 'برنامه در پنجره‌ای مجزا، تمام‌صفحه و بدون نوار آدرس مرورگر با سرعت بالا باز می‌شود.'
                    : 'The program launches in a clean window without browser bars.'}
                </p>
              </div>
            </div>
          </div>

          {/* Option 2: Running Standalone Executable (.exe) */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <FolderOpen className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                {isFa
                  ? 'روش ۲: اجرای نسخه اجرایی و نصبی (*.exe)'
                  : 'Method 2: Standalone Windows Executable (*.exe)'}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              {isFa
                ? 'در صورتی که فایل نصبی یا نسخه پرتابل برنامه (فایل با پسوند exe) توسط مدیر سامانه در اختیارتان قرار گرفته است، کافی است روی فایل دابل‌کلیک کنید تا بدون نیاز به اتصال اینترنت اجرا شود.'
                : 'If you have received the standalone .exe installation package, simply double-click the file to launch the application completely offline.'}
            </p>
          </div>

          {/* Windows App Highlights */}
          <div className="space-y-2 pt-1">
            <h4 className="font-bold text-slate-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>{isFa ? 'مزایای نسخه دسکتاپ ویندوز:' : 'Desktop Version Features:'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5">
                <WifiOff className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200 text-xs block">
                    {isFa ? 'کارکرد کاملاً آفلاین' : '100% Offline Capability'}
                  </span>
                  <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                    {isFa
                      ? 'پس از اولین اجرا، تمام محاسبات، نمودارها و تحلیل‌ها در محل پروژه بدون نیاز به اینترنت کار می‌کنند.'
                      : 'All calculation engines and charts run locally without internet access.'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200 text-xs block">
                    {isFa ? 'خروجی گزارش رسمی و چاپ' : 'Official Word & Print Reports'}
                  </span>
                  <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                    {isFa
                      ? 'امکان تولید مستقیم فایل Word با فرمت رسمی و پرینت مستقیم دفترچه محاسبات فنی.'
                      : 'Export comprehensive DOCX reports and print official documentation.'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5">
                <MousePointerClick className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200 text-xs block">
                    {isFa ? 'بهینه‌سازی برای دسکتاپ و لپ‌تاپ' : 'Optimized for Desktop'}
                  </span>
                  <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                    {isFa
                      ? 'چینش عریض، دسترسی سریع با کلیدهای میانبر، ماوس و نمایش چندستونه برای تحلیل‌های سنگین مهندسی.'
                      : 'High-density engineering layouts tailored for monitors and workstations.'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200 text-xs block">
                    {isFa ? 'حفظ کامل داده‌ها در سیستم' : 'Secure Local Storage'}
                  </span>
                  <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                    {isFa
                      ? 'تمامی اطلاعات و پروژه‌های شما در حافظه سیستم ذخیره شده و با بستن برنامه از دست نمی‌روند.'
                      : 'All inputs and project models remain securely stored on your local drive.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 font-mono">
            Windows 10 / 11 • x64 Architecture
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md shadow-blue-600/30 cursor-pointer"
          >
            {isFa ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
