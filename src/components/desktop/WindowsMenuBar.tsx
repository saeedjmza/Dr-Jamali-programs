import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  FilePlus,
  FolderOpen,
  Save,
  Download,
  Printer,
  LogOut,
  Undo2,
  Redo2,
  Copy,
  Scissors,
  ClipboardPaste,
  Trash2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize2,
  ChevronDown,
  Check,
  Layers,
  HelpCircle,
  Info,
  BookOpen,
  Keyboard,
  Monitor,
  Smartphone,
  X,
  Sparkles,
  RefreshCw,
  Sliders,
  Pickaxe,
  Clock,
  Shield,
  Weight,
  Languages,
  AlertTriangle,
  Activity,
  Cpu,
  Grid,
  Ruler,
} from 'lucide-react';
import { ProjectScenario, AppMainTab } from '../../types';
import { AppLogo } from '../common/AppLogo';

export interface WindowsMenuBarProps {
  isFa: boolean;
  activeScenario: ProjectScenario | null;
  openScenarios: ProjectScenario[];
  zoomPercent: number;
  isFullscreen: boolean;
  isCompactHeader: boolean;
  onNewScenario: () => void;
  onOpenFilePicker: () => void;
  onSaveCurrentScenario: () => void;
  onSaveAsScenario: () => void;
  onExportCurrentStemd: () => void;
  onExportAllStemd: () => void;
  onOpenReport: () => void;
  onExitApp: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onCopyParameters: () => void;
  onCutParameters: () => void;
  onPasteParameters: () => void;
  onDeleteCurrentScenario: () => void;
  onResetDefaults: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleFullscreen: () => void;
  onToggleCompactHeader: () => void;
  onSelectScenario: (scenario: ProjectScenario) => void;
  onCloseOpenScenario: (scenarioId: string) => void;
  onNextWindow: () => void;
  onPrevWindow: () => void;
  onOpenManageScenarios: () => void;
  onOpenAbout: () => void;
  onOpenReferences: () => void;
  onOpenExeModal: () => void;
  onOpenAndroidModal: () => void;
  onOpenShortcutsModal: () => void;
  // Main Navigation Tabs & Parameter Badges (Single Unified Toolbar)
  mainTab?: AppMainTab;
  onSelectMainTab?: (tab: AppMainTab) => void;
  rmr?: number;
  qValue?: number;
  gsi?: number;
  rqd?: number;
  consistencyReport?: { hasConflict: boolean; rmrGsiDiff: number; severity: 'warning' | 'critical' };
  onToggleLang?: () => void;
  activeFileName?: string | null;
}

type ActiveMenu = 'file' | 'edit' | 'view' | 'window' | 'help' | null;

export const WindowsMenuBar: React.FC<WindowsMenuBarProps> = ({
  isFa,
  activeScenario,
  openScenarios,
  zoomPercent,
  isFullscreen,
  isCompactHeader,
  onNewScenario,
  onOpenFilePicker,
  onSaveCurrentScenario,
  onSaveAsScenario,
  onExportCurrentStemd,
  onExportAllStemd,
  onOpenReport,
  onExitApp,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onCopyParameters,
  onCutParameters,
  onPasteParameters,
  onDeleteCurrentScenario,
  onResetDefaults,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleFullscreen,
  onToggleCompactHeader,
  onSelectScenario,
  onCloseOpenScenario,
  onNextWindow,
  onPrevWindow,
  onOpenManageScenarios,
  onOpenAbout,
  onOpenReferences,
  onOpenExeModal,
  onOpenAndroidModal,
  onOpenShortcutsModal,
  mainTab,
  onSelectMainTab,
  rmr,
  qValue,
  gsi,
  rqd,
  span,
  consistencyReport,
  onToggleLang,
  activeFileName,
}) => {
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside or pressing Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveMenu(null);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleMenu = (menu: ActiveMenu) => {
    setActiveMenu(prev => (prev === menu ? null : menu));
  };

  const handleItemClick = (action: () => void) => {
    action();
    setActiveMenu(null);
  };

  // Keyboard shortcut badge component
  const Shortcut: React.FC<{ keys: string }> = ({ keys }) => (
    <span className="text-[10px] font-mono text-slate-400 bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-700/60 ltr:ml-auto rtl:mr-auto shrink-0">
      {keys}
    </span>
  );

  return (
    <>
      {/* Backdrop overlay to ensure menu closes on click-outside and sits firmly ON TOP */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-[95] bg-black/10 cursor-default"
          onClick={() => setActiveMenu(null)}
        />
      )}

      <div
        ref={menuBarRef}
        dir={isFa ? 'rtl' : 'ltr'}
        className="sticky top-0 z-[100] bg-slate-950 border-b border-slate-800 text-xs select-none text-slate-200 shadow-xl"
      >
        {/* Row 1: App Identity, Windows Menus & Quick Tools */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between h-8 sm:h-9 gap-2">
          {/* Start: App Branding & Menus (File, Edit, View, Window, Help) */}
          <div className="flex items-center gap-1.5 sm:gap-2 relative z-[100] min-w-0">
            {/* App Logo & Title */}
            <div className="flex items-center gap-1.5 shrink-0 pl-1 pr-1 border-e border-slate-800/80">
              <AppLogo size="xs" className="shrink-0" />
              <span className="font-bold text-slate-100 text-xs hidden sm:inline">
                {isFa ? 'طرح تجربی تونل' : 'Empirical Tunnel Suite'}
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold shrink-0">
                {isFa ? 'ورژن ۱.۰' : 'v1.0'}
              </span>
              {activeFileName && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10.5px] font-bold shrink-0 flex items-center gap-1 max-w-[150px] truncate" title={activeFileName}>
                  <FileText className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">{activeFileName}</span>
                </span>
              )}
            </div>

            {/* Direct Quick Save Button (Ctrl+S) - Saves in place */}
            <button
              onClick={onSaveCurrentScenario}
              className="h-6 px-2 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-sm"
              title={isFa ? 'ذخیره در فایل باز جاری (Ctrl+S)' : 'Save in-place (Ctrl+S)'}
            >
              <Save className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden md:inline">{isFa ? 'ذخیره' : 'Save'}</span>
            </button>

            {/* Direct Quick Open Button (Ctrl+O) - Loads STEMD */}
            <button
              onClick={onOpenFilePicker}
              className="h-6 px-2 rounded bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-sm"
              title={isFa ? 'فراخوانی و باز کردن فایل *.stemd (Ctrl+O)' : 'Open *.STEMD File (Ctrl+O)'}
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden md:inline">{isFa ? 'فراخوانی' : 'Open'}</span>
            </button>

            {/* FILE MENU */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('file')}
                onMouseEnter={() => activeMenu && setActiveMenu('file')}
                className={`h-6 sm:h-7 px-2 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  activeMenu === 'file'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span>{isFa ? 'پرونده' : 'File'}</span>
              </button>

              {activeMenu === 'file' && (
                <div className="absolute start-0 top-full mt-1 w-64 sm:w-72 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl py-1.5 z-[110] text-xs animate-in fade-in duration-100 ring-1 ring-black/70">
                  <button
                    onClick={() => handleItemClick(onNewScenario)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <FilePlus className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{isFa ? 'سناریوی جدید...' : 'New Scenario...'}</span>
                    <Shortcut keys="Ctrl+N" />
                  </button>

                  <button
                    onClick={() => handleItemClick(onOpenFilePicker)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{isFa ? 'باز کردن پرونده (*.STEMD)...' : 'Open File (*.STEMD)...'}</span>
                    <Shortcut keys="Ctrl+O" />
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    onClick={() => handleItemClick(onSaveCurrentScenario)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <Save className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{isFa ? 'ذخیره در فایل باز جاری (Save)' : 'Save in-place'}</span>
                    <Shortcut keys="Ctrl+S" />
                  </button>

                  <button
                    onClick={() => handleItemClick(onSaveAsScenario)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{isFa ? 'ذخیره به نام جدید در ویندوز (Save As...)' : 'Save As (*.STEMD)...'}</span>
                    <Shortcut keys="Ctrl+Shift+S" />
                  </button>

                  <button
                    onClick={() => handleItemClick(onExportCurrentStemd)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{isFa ? 'خروجی فایل سناریوی جاری (*.stemd)' : 'Export Current (*.STEMD)'}</span>
                  </button>

                  <button
                    onClick={() => handleItemClick(onExportAllStemd)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{isFa ? 'پشتیبان‌گیری کلی سناریوها (*.stemd)' : 'Export All Scenarios (*.STEMD)'}</span>
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    onClick={() => handleItemClick(onOpenManageScenarios)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-amber-300 hover:text-amber-200 font-medium transition-colors cursor-pointer text-start"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{isFa ? 'مدیریت سناریوهای پروژه (*.STEMD)...' : 'Manage Project Scenarios (*.STEMD)...'}</span>
                  </button>

                  <button
                    onClick={() => handleItemClick(onOpenReport)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <Printer className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{isFa ? 'چاپ و گزارش نتایج...' : 'Print / Results Report...'}</span>
                    <Shortcut keys="Ctrl+P" />
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    onClick={() => handleItemClick(onExitApp)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-red-950/60 text-rose-300 hover:text-rose-100 transition-colors cursor-pointer text-start"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{isFa ? 'خروج از برنامه' : 'Exit Application'}</span>
                    <Shortcut keys="Alt+F4" />
                  </button>
                </div>
              )}
            </div>

            {/* EDIT MENU */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('edit')}
                onMouseEnter={() => activeMenu && setActiveMenu('edit')}
                className={`h-6 sm:h-7 px-2 sm:px-2.5 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  activeMenu === 'edit'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span>{isFa ? 'ویرایش (Edit)' : 'Edit'}</span>
              </button>

              {activeMenu === 'edit' && (
                <div className="absolute start-0 top-full mt-1 w-64 sm:w-72 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl py-1.5 z-[110] text-xs animate-in fade-in duration-100 ring-1 ring-black/70">
                  {/* Undo (Ctrl+Z) */}
                  <button
                    onClick={() => canUndo && onUndo && handleItemClick(onUndo)}
                    disabled={!canUndo}
                    className={`w-full px-3 py-1.5 flex items-center gap-2 text-start transition-colors ${
                      canUndo
                        ? 'hover:bg-slate-800 text-slate-200 hover:text-white cursor-pointer'
                        : 'text-slate-600 cursor-not-allowed opacity-40'
                    }`}
                  >
                    <Undo2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{isFa ? 'واگرد (Undo)' : 'Undo'}</span>
                    <Shortcut keys="Ctrl+Z" />
                  </button>

                  {/* Redo (Ctrl+Y) */}
                  <button
                    onClick={() => canRedo && onRedo && handleItemClick(onRedo)}
                    disabled={!canRedo}
                    className={`w-full px-3 py-1.5 flex items-center gap-2 text-start transition-colors ${
                      canRedo
                        ? 'hover:bg-slate-800 text-slate-200 hover:text-white cursor-pointer'
                        : 'text-slate-600 cursor-not-allowed opacity-40'
                    }`}
                  >
                    <Redo2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{isFa ? 'ازنو (Redo)' : 'Redo'}</span>
                    <Shortcut keys="Ctrl+Y" />
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    onClick={() => handleItemClick(onCopyParameters)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <Copy className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{isFa ? 'کپی مشخصات ژئوتکنیکی' : 'Copy Parameters'}</span>
                    <Shortcut keys="Ctrl+C" />
                  </button>

                  <button
                    onClick={() => handleItemClick(onCutParameters)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <Scissors className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{isFa ? 'برش مشخصات و ریست' : 'Cut Parameters'}</span>
                    <Shortcut keys="Ctrl+X" />
                  </button>

                  <button
                    onClick={() => handleItemClick(onPasteParameters)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{isFa ? 'جایگذاری مشخصات (Paste)' : 'Paste Parameters'}</span>
                    <Shortcut keys="Ctrl+V" />
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    onClick={() => handleItemClick(onDeleteCurrentScenario)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-rose-300 hover:text-rose-100 transition-colors cursor-pointer text-start"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{isFa ? 'حذف سناریوی فعال' : 'Delete Active Scenario'}</span>
                    <Shortcut keys="Del" />
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    onClick={() => handleItemClick(onResetDefaults)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{isFa ? 'بازنشانی مقادیر اولیه' : 'Reset to Baseline Defaults'}</span>
                    <Shortcut keys="Ctrl+R" />
                  </button>
                </div>
              )}
            </div>

            {/* VIEW MENU */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('view')}
                onMouseEnter={() => activeMenu && setActiveMenu('view')}
                className={`h-6 sm:h-7 px-2 sm:px-2.5 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  activeMenu === 'view'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span>{isFa ? 'نمایش (View)' : 'View'}</span>
              </button>

              {activeMenu === 'view' && (
                <div className="absolute start-0 top-full mt-1 w-64 sm:w-72 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl py-1.5 z-[110] text-xs animate-in fade-in duration-100 ring-1 ring-black/70">
                  <button
                    onClick={() => handleItemClick(onZoomIn)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{isFa ? 'بزرگ‌نمایی (Zoom In)' : 'Zoom In'}</span>
                    <Shortcut keys="Ctrl++" />
                  </button>

                  <button
                    onClick={() => handleItemClick(onZoomOut)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <ZoomOut className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{isFa ? 'کوچک‌نمایی (Zoom Out)' : 'Zoom Out'}</span>
                    <Shortcut keys="Ctrl+-" />
                  </button>

                  <button
                    onClick={() => handleItemClick(onResetZoom)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{isFa ? `اندازه واقعی ۱۰۰٪ (${zoomPercent}٪)` : `Actual Size 100% (${zoomPercent}%)`}</span>
                    <Shortcut keys="Ctrl+0" />
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    onClick={() => handleItemClick(onToggleFullscreen)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <Maximize className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{isFullscreen ? (isFa ? 'خروج از تمام صفحه' : 'Exit Full Screen') : (isFa ? 'تمام صفحه (Full Screen)' : 'Full Screen')}</span>
                    <Shortcut keys="F11" />
                  </button>

                  <button
                    onClick={() => handleItemClick(onToggleCompactHeader)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <Minimize2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      {isCompactHeader
                        ? (isFa ? 'نمایش سربرگ استاندارد' : 'Show Standard Header')
                        : (isFa ? 'کوچک‌سازی سربرگ (Minimize)' : 'Minimize Header')}
                    </span>
                    <Shortcut keys="Ctrl+M" />
                  </button>
                </div>
              )}
            </div>

            {/* WINDOWS MENU (پنجره‌ها / پرونده‌های باز) */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('window')}
                onMouseEnter={() => activeMenu && setActiveMenu('window')}
                className={`h-6 sm:h-7 px-2 sm:px-2.5 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  activeMenu === 'window'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span>{isFa ? 'پنجره‌ها (Window)' : 'Window'}</span>
                <span className="text-[10px] px-1 bg-slate-800 text-amber-400 rounded-full font-mono font-bold">
                  {openScenarios.length}
                </span>
              </button>

              {activeMenu === 'window' && (
                <div className="absolute start-0 top-full mt-1 w-72 sm:w-80 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl py-1.5 z-[110] text-xs animate-in fade-in duration-100 ring-1 ring-black/70">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 flex items-center justify-between border-b border-slate-800">
                    <span>{isFa ? 'پرونده‌ها و سناریوهای باز' : 'Open Documents / Scenarios'}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{openScenarios.length} open</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1 space-y-0.5">
                    {openScenarios.map((sc, idx) => {
                      const isActive = sc.id === activeScenario?.id;
                      const name = isFa ? sc.name : sc.nameEn || sc.name;

                      return (
                        <div
                          key={sc.id}
                          className={`w-full px-3 py-1.5 flex items-center justify-between gap-2 transition-colors ${
                            isActive
                              ? 'bg-amber-500/15 text-amber-300 font-bold'
                              : 'hover:bg-slate-800 text-slate-300 hover:text-slate-100'
                          }`}
                        >
                          <button
                            onClick={() => handleItemClick(() => onSelectScenario(sc))}
                            className="flex items-center gap-2 min-w-0 flex-1 text-start cursor-pointer"
                          >
                            <span className="font-mono text-[11px] text-slate-500">{idx + 1}.</span>
                            <span className="truncate text-xs">{name}</span>
                            {sc.isBuiltIn && (
                              <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 shrink-0">
                                {isFa ? 'مرجع' : 'Base'}
                              </span>
                            )}
                          </button>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isActive && <Check className="w-3.5 h-3.5 text-amber-400" />}
                            {openScenarios.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onCloseOpenScenario(sc.id);
                                }}
                                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                title={isFa ? 'بستن این پرونده' : 'Close this file'}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    onClick={() => handleItemClick(onNextWindow)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{isFa ? 'پرونده بعدی (Next Window)' : 'Next Window'}</span>
                    <Shortcut keys="Ctrl+Tab" />
                  </button>

                  <button
                    onClick={() => handleItemClick(onPrevWindow)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 rotate-180 shrink-0" />
                    <span>{isFa ? 'پرونده قبلی (Previous Window)' : 'Previous Window'}</span>
                    <Shortcut keys="Ctrl+Shift+Tab" />
                  </button>
                </div>
              )}
            </div>

            {/* HELP MENU */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('help')}
                onMouseEnter={() => activeMenu && setActiveMenu('help')}
                className={`h-6 sm:h-7 px-2 sm:px-2.5 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  activeMenu === 'help'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span>{isFa ? 'راهنما (Help)' : 'Help'}</span>
              </button>

              {activeMenu === 'help' && (
                <div className="absolute start-0 top-full mt-1 w-64 sm:w-72 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl py-1.5 z-[110] text-xs animate-in fade-in duration-100 ring-1 ring-black/70">
                  <button
                    onClick={() => handleItemClick(onOpenAbout)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{isFa ? 'درباره نرم‌افزار و شناسنامه (About)' : 'About Tunnel Suite'}</span>
                    <Shortcut keys="F1" />
                  </button>

                  <button
                    onClick={() => handleItemClick(onOpenReferences)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{isFa ? 'منابع علمی و تئوری تجربی' : 'Scientific References & Guide'}</span>
                  </button>

                  <button
                    onClick={() => handleItemClick(onOpenShortcutsModal)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <Keyboard className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{isFa ? 'راهنمای کلیدهای میانبر ویندوز' : 'Keyboard Shortcuts List'}</span>
                    <Shortcut keys="Ctrl+?" />
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    onClick={() => handleItemClick(onOpenExeModal)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <Monitor className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{isFa ? 'راهنمای نسخه دسکتاپ ویندوز (EXE)' : 'Windows Desktop App Guide'}</span>
                  </button>

                  <button
                    onClick={() => handleItemClick(onOpenAndroidModal)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{isFa ? 'راهنمای نسخه موبایل اندروید' : 'Android App Installation'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        {/* Right / End: Active Document Status, Zoom, Language & Reset */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] text-slate-400">
          <button
            onClick={onOpenManageScenarios}
            className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/80 text-[11px] font-mono text-amber-300 font-bold hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title={isFa ? 'مدیریت سناریوهای پروژه (*.STEMD)' : 'Manage Project Scenarios (*.STEMD)'}
          >
            <Layers className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate max-w-[140px] xl:max-w-[180px]">
              {activeScenario ? (isFa ? activeScenario.name : activeScenario.nameEn || activeScenario.name) : 'No Scenario'}
            </span>
          </button>

          {/* Language Switcher */}
          {onToggleLang && (
            <button
              onClick={onToggleLang}
              className="h-6 px-2 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              title={isFa ? 'Switch to English' : 'تغییر به زبان فارسی'}
            >
              <Languages className="w-3 h-3 text-sky-400 shrink-0" />
              <span>{isFa ? 'EN' : 'فا'}</span>
            </button>
          )}

          {/* Reset Defaults */}
          <button
            onClick={onResetDefaults}
            className="h-6 w-6 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title={isFa ? 'بازنشانی مقادیر پیش‌فرض' : 'Reset to Default'}
          >
            <RotateCcw className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5 border-s border-slate-800/80 ps-1.5">
            <button
              onClick={onZoomOut}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              title={isFa ? 'کوچک‌نمایی (Ctrl+-)' : 'Zoom Out (Ctrl+-)'}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onResetZoom}
              className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              title={isFa ? 'اندازه ۱۰۰٪ (Ctrl+0)' : 'Reset Zoom 100%'}
            >
              {zoomPercent}%
            </button>
            <button
              onClick={onZoomIn}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              title={isFa ? 'بزرگ‌نمایی (Ctrl++)' : 'Zoom In (Ctrl++)'}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: The Main Software Standard Navigation Tabs (تب‌های اصلی نرم‌افزار) */}
      {onSelectMainTab && mainTab && (
        <div className="border-t border-slate-800/90 bg-slate-950 px-2 sm:px-4 py-1.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 shadow-inner">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 w-full lg:w-auto">
            {/* 1. Engineering Classification */}
            <button
              onClick={() => onSelectMainTab('classification')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center leading-tight ${
                mainTab === 'classification'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span>{isFa ? '۱. طبقه‌بندی سنگ' : '1. Classification'}</span>
            </button>

            {/* 2. Excavability Estimation */}
            <button
              onClick={() => onSelectMainTab('excavability')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center leading-tight ${
                mainTab === 'excavability'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Pickaxe className="w-3.5 h-3.5 shrink-0" />
              <span>{isFa ? '۲. قابلیت حفاری' : '2. Excavability'}</span>
            </button>

            {/* 3. Stand-up Time Estimation */}
            <button
              onClick={() => onSelectMainTab('standup_time')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center leading-tight ${
                mainTab === 'standup_time'
                  ? 'bg-gradient-to-r from-amber-600 to-teal-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{isFa ? '۳. زمان خودپایداری' : '3. Stand-up Time'}</span>
            </button>

            {/* 4. Empirical Support Estimation */}
            <button
              onClick={() => onSelectMainTab('support')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center leading-tight ${
                mainTab === 'support'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>{isFa ? '۴. سیستم نگهداری' : '4. Support Design'}</span>
            </button>

            {/* 5. Rock Load Estimation */}
            <button
              onClick={() => onSelectMainTab('rock_load')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center leading-tight ${
                mainTab === 'rock_load'
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Weight className="w-3.5 h-3.5 shrink-0" />
              <span>{isFa ? '۵. برآورد بار سنگ' : '5. Rock Load'}</span>
            </button>

            {/* 6. Results Report */}
            <button
              onClick={() => onSelectMainTab('report')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center leading-tight ${
                mainTab === 'report'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>{isFa ? '۶. گزارش پروژه' : '6. Report'}</span>
            </button>
          </div>

          {/* Real-time Parameter Badges & Inconsistency Indicator */}
          {rmr !== undefined && qValue !== undefined && (
            <div className="flex items-center gap-1.5 text-xs font-mono shrink-0 flex-wrap justify-end">
              <span className="inline-flex items-center gap-1 h-6 px-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <Layers className="w-3 h-3 text-amber-400" />
                <span>RMR: <strong>{rmr}</strong></span>
              </span>
              <span className="inline-flex items-center gap-1 h-6 px-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300">
                <Cpu className="w-3 h-3 text-teal-400" />
                <span>Q: <strong>{qValue}</strong></span>
              </span>
              {gsi !== undefined && (
                <span className="inline-flex items-center gap-1 h-6 px-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300">
                  <Grid className="w-3 h-3 text-purple-400" />
                  <span>GSI: <strong>{gsi}</strong></span>
                </span>
              )}
              {rqd !== undefined && (
                <span className="inline-flex items-center gap-1 h-6 px-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 hidden sm:inline-flex">
                  <Activity className="w-3 h-3 text-sky-400" />
                  <span>RQD: <strong>{rqd}%</strong></span>
                </span>
              )}
              {span !== undefined && (
                <span className="inline-flex items-center gap-1 h-6 px-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300">
                  <Ruler className="w-3 h-3 text-blue-400" />
                  <span>{isFa ? 'دهانه:' : 'Span:'} <strong>{span}m</strong></span>
                </span>
              )}
              {consistencyReport?.hasConflict && (
                <span
                  className="inline-flex items-center gap-1 h-6 px-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold animate-pulse"
                  title={isFa ? 'عدم تطابق RMR و GSI' : 'RMR & GSI Mismatch'}
                >
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>{isFa ? 'عدم تطابق' : 'Mismatch'}</span>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  </>
  );
};
