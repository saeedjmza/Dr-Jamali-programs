import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFa: boolean;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  isFa,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { groupFa: 'منوی پرونده (File)', groupEn: 'File Menu', items: [
      { key: 'Ctrl + N', descFa: 'ایجاد سناریو / پرونده جدید', descEn: 'New Project Scenario' },
      { key: 'Ctrl + O', descFa: 'باز کردن فایل *.STEMD از حافظه دیسک', descEn: 'Open *.STEMD File' },
      { key: 'Ctrl + S', descFa: 'ذخیره در سناریوی فعال', descEn: 'Save to Active Scenario' },
      { key: 'Ctrl + Shift + S', descFa: 'ذخیره به نام جدید (Save As)', descEn: 'Save As (*.STEMD)' },
      { key: 'Ctrl + P', descFa: 'مشاهده گزارش نتایج و چاپ', descEn: 'View Results Report & Print' },
      { key: 'Alt + F4', descFa: 'خروج از برنامه', descEn: 'Exit Application' },
    ]},
    { groupFa: 'منوی ویرایش (Edit)', groupEn: 'Edit Menu', items: [
      { key: 'Ctrl + Z', descFa: 'واگرد آخرین تغییرات پارامترها (Undo)', descEn: 'Undo Parameter Changes' },
      { key: 'Ctrl + Y', descFa: 'ازنو اعمال تغییرات واگرد شده (Redo)', descEn: 'Redo Changes' },
      { key: 'Ctrl + C', descFa: 'کپی مشخصات ژئوتکنیکی به حافظه موقت', descEn: 'Copy Geotechnical Parameters' },
      { key: 'Ctrl + X', descFa: 'برش مشخصات و بازنشانی مقادیر', descEn: 'Cut Parameters & Reset' },
      { key: 'Ctrl + V', descFa: 'جایگذاری مشخصات (Paste)', descEn: 'Paste Parameters from Clipboard' },
      { key: 'Del', descFa: 'حذف سناریوی فعال جاری', descEn: 'Delete Active Scenario' },
      { key: 'Ctrl + R', descFa: 'بازنشانی مقادیر ورودی به حالت اولیه', descEn: 'Reset Inputs to Baseline' },
    ]},
    { groupFa: 'منوی نمایش (View)', groupEn: 'View Menu', items: [
      { key: 'Ctrl + +', descFa: 'بزرگ‌نمایی رابط کاربری (Zoom In)', descEn: 'Zoom In UI (+10%)' },
      { key: 'Ctrl + -', descFa: 'کوچک‌نمایی رابط کاربری (Zoom Out)', descEn: 'Zoom Out UI (-10%)' },
      { key: 'Ctrl + 0', descFa: 'اندازه واقعی ۱۰۰٪ (Reset Zoom)', descEn: 'Reset Zoom (100%)' },
      { key: 'F11', descFa: 'ورود / خروج از حالت تمام صفحه', descEn: 'Toggle Full Screen' },
      { key: 'Ctrl + M', descFa: 'کوچک‌سازی / جمع کردن سربرگ (Minimize)', descEn: 'Minimize / Compact Header' },
    ]},
    { groupFa: 'منوی پنجره‌ها (Window)', groupEn: 'Window Menu', items: [
      { key: 'Ctrl + Tab', descFa: 'جابجایی به پرونده باز بعدی', descEn: 'Next Open Window' },
      { key: 'Ctrl + Shift + Tab', descFa: 'جابجایی به پرونده باز قبلی', descEn: 'Previous Open Window' },
      { key: 'Ctrl + W', descFa: 'بستن پرونده جاری', descEn: 'Close Active Tab' },
    ]},
    { groupFa: 'منوی راهنما (Help)', groupEn: 'Help Menu', items: [
      { key: 'F1', descFa: 'درباره نرم‌افزار و شناسنامه سیستم', descEn: 'About & System Specifications' },
      { key: 'Ctrl + ?', descFa: 'مشاهده راهنمای کلیدهای میانبر', descEn: 'Show Keyboard Shortcuts' },
    ]},
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        dir={isFa ? 'rtl' : 'ltr'}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto text-xs"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                {isFa ? 'کلیدهای میانبر استاندارد ویندوز' : 'Windows Desktop Keyboard Shortcuts'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isFa
                  ? 'کلیدهای ترکیبی برای سرعت و سهولت در طراحی تونل و مدیریت سناریوها'
                  : 'Fast keyboard controls for tunnel design and scenario management'}
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shortcuts.map((group, gIdx) => (
              <div
                key={gIdx}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
              >
                <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                  <Command className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isFa ? group.groupFa : group.groupEn}</span>
                </div>
                <div className="space-y-1.5">
                  {group.items.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className="flex items-center justify-between gap-2 text-[11px]"
                    >
                      <span className="text-slate-300 truncate">
                        {isFa ? item.descFa : item.descEn}
                      </span>
                      <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[10px] border border-slate-700 shrink-0">
                        {item.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
          >
            {isFa ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
