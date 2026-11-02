import React from 'react';
import { LogOut, Save, X, AlertTriangle } from 'lucide-react';

interface DesktopExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFa: boolean;
  activeScenarioName: string;
  onSaveAndExit: () => void;
  onExitWithoutSaving: () => void;
}

export const DesktopExitModal: React.FC<DesktopExitModalProps> = ({
  isOpen,
  onClose,
  isFa,
  activeScenarioName,
  onSaveAndExit,
  onExitWithoutSaving,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        dir={isFa ? 'rtl' : 'ltr'}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto text-xs"
      >
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <LogOut className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">
              {isFa ? 'خروج از برنامه مهندسی تونل' : 'Exit Tunnel Engineering Suite'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {isFa
                  ? `آیا مایل به ذخیره تغییرات پرونده «${activeScenarioName}» هستید؟`
                  : `Do you want to save changes to "${activeScenarioName}" before closing?`}
              </p>
              <p className="text-[11px] text-amber-300/80 mt-1">
                {isFa
                  ? 'تمامی داده‌ها در حافظه محلی ذخیره شده‌اند و در بارگذاری بعدی در دسترس خواهند بود.'
                  : 'All data is kept in your local browser storage for your next session.'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer transition-colors"
          >
            {isFa ? 'انصراف' : 'Cancel'}
          </button>
          <button
            onClick={onExitWithoutSaving}
            className="px-3.5 py-1.5 rounded-lg bg-rose-950 border border-rose-800/80 hover:bg-rose-900 text-rose-200 font-semibold cursor-pointer transition-colors"
          >
            {isFa ? 'خروج بدون تغییر' : 'Close'}
          </button>
          <button
            onClick={onSaveAndExit}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isFa ? 'ذخیره و خروج' : 'Save & Close'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
