import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Layers,
  FolderOpen,
  Plus,
  Download,
  Upload,
  Check,
  Trash2,
  Copy,
  Edit3,
  RefreshCw,
  Search,
  FileCheck,
  AlertCircle,
  FileText,
  Compass,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ProjectScenario, ProjectScenarioData, StemdFileEnvelope } from '../../types';
import {
  loadAllScenarios,
  saveAllScenarios,
  saveCurrentAsScenario,
  updateScenario,
  deleteScenario,
  duplicateScenario,
  resetScenariosToFactory,
  exportScenarioToStemd,
  exportAllScenariosToStemd,
  parseStemdFile,
  importStemdEnvelope,
  setActiveScenarioId,
  STEMD_FILE_EXTENSION,
} from '../../utils/scenarioStorage';
import { AppLogo } from '../common/AppLogo';

interface ProjectProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFa: boolean;
  activeScenarioId: string;
  currentData: ProjectScenarioData;
  onApplyScenario: (scenario: ProjectScenario) => void;
}

type ModalTab = 'list' | 'save_new' | 'export_import';

export const ProjectProfilesModal: React.FC<ProjectProfilesModalProps> = ({
  isOpen,
  onClose,
  isFa,
  activeScenarioId,
  currentData,
  onApplyScenario,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('list');
  const [scenarios, setScenarios] = useState<ProjectScenario[]>(() => loadAllScenarios());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'custom' | 'builtin'>('all');

  // Save New Scenario Form State
  const [newName, setNewName] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Edit Existing Scenario State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Import File State
  const [importedEnvelope, setImportedEnvelope] = useState<StemdFileEnvelope | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refresh scenarios from localStorage
  const refreshList = () => {
    setScenarios(loadAllScenarios());
  };

  const activeScenario = useMemo(() => {
    return scenarios.find(s => s.id === activeScenarioId) || scenarios[0];
  }, [scenarios, activeScenarioId]);

  // Filtered Scenarios
  const filteredScenarios = useMemo(() => {
    return scenarios.filter(s => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.nameEn && s.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;
      if (filterType === 'builtin') return s.isBuiltIn;
      if (filterType === 'custom') return !s.isBuiltIn;
      return true;
    });
  }, [scenarios, searchQuery, filterType]);

  // Handle Save New
  const handleSaveNewScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created = saveCurrentAsScenario(newName, newDesc, currentData, newNameEn);
    refreshList();
    onApplyScenario(created);
    setNewName('');
    setNewNameEn('');
    setNewDesc('');
    setSaveSuccessMsg(
      isFa
        ? `سناریوی «${created.name}» با موفقیت ذخیره و فعال شد.`
        : `Scenario "${created.name}" successfully saved and activated.`
    );
    setActiveTab('list');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Handle Update Active Scenario with Current Data
  const handleUpdateActiveWithCurrent = () => {
    if (!activeScenario) return;
    const updated = updateScenario(activeScenario.id, {
      data: currentData,
    });
    if (updated) {
      refreshList();
      onApplyScenario(updated);
      setSaveSuccessMsg(
        isFa
          ? `مقادیر سناریوی فعال «${updated.name}» با داده‌های جاری به‌روزرسانی شد.`
          : `Active scenario "${updated.name}" updated with current engineering inputs.`
      );
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  // Handle Edit Scenario Info
  const handleStartEdit = (sc: ProjectScenario) => {
    setEditingId(sc.id);
    setEditName(sc.name);
    setEditDesc(sc.description || '');
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    updateScenario(id, {
      name: editName,
      description: editDesc,
    });
    setEditingId(null);
    refreshList();
  };

  // Handle Duplicate
  const handleDuplicate = (id: string) => {
    const copy = duplicateScenario(id, isFa ? 'کپی از ' : 'Copy of ');
    if (copy) {
      refreshList();
      onApplyScenario(copy);
      setSaveSuccessMsg(
        isFa
          ? `یک نسخه جدید از سناریو با نام «${copy.name}» ایجاد و فعال شد.`
          : `Duplicated scenario "${copy.name}" created and activated.`
      );
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  // Handle Delete
  const handleDelete = (id: string, name: string) => {
    if (
      window.confirm(
        isFa
          ? `آیا از حذف سناریوی «${name}» اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`
          : `Are you sure you want to delete scenario "${name}"? This action cannot be undone.`
      )
    ) {
      deleteScenario(id);
      refreshList();
    }
  };

  // Handle Factory Reset
  const handleFactoryReset = () => {
    if (
      window.confirm(
        isFa
          ? 'آیا مایل به بازنشانی سناریوها به ۵ سناریوی استاندارد پیش‌فرض هستید؟ سناریوهای ساخته‌شده شما حذف خواهند شد.'
          : 'Reset all scenarios to the 5 default benchmark configurations? Custom scenarios will be removed.'
      )
    ) {
      const resetList = resetScenariosToFactory();
      setScenarios(resetList);
      if (resetList[0]) {
        onApplyScenario(resetList[0]);
      }
    }
  };

  // Handle File Input Change
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.stemd')) {
      setImportError(
        isFa
          ? 'فقط و فقط فایل‌های پروژه با پسوند *.stemd مجاز هستند. فایل انتخابی دارای پسوند مجاز نیست.'
          : 'Only project files with *.stemd extension are supported.'
      );
      setImportedEnvelope(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const envelope = parseStemdFile(text);
        setImportedEnvelope(envelope);
        setImportError(null);
      } catch (err: any) {
        setImportError(err.message || (isFa ? 'خطا در پردازش فایل STEMD' : 'Error reading STEMD file'));
        setImportedEnvelope(null);
      }
    };
    reader.readAsText(file);
  };

  // Execute Import
  const handleExecuteImport = (activateImmediately = true) => {
    if (!importedEnvelope) return;
    try {
      const { importedScenarios, activeToApply } = importStemdEnvelope(importedEnvelope);
      refreshList();
      if (activateImmediately && activeToApply) {
        onApplyScenario(activeToApply);
      }
      setImportSuccessMsg(
        isFa
          ? `تعداد ${importedScenarios.length} سناریو از فایل با موفقیت اضافه شد.`
          : `Successfully imported ${importedScenarios.length} scenario(s) from STEMD file.`
      );
      setImportedEnvelope(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => {
        setImportSuccessMsg(null);
        setActiveTab('list');
      }, 2000);
    } catch (err: any) {
      setImportError(err.message || 'Error saving imported scenarios');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        dir={isFa ? 'rtl' : 'ltr'}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <AppLogo size="md" className="shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                  <span>{isFa ? 'مدیریت سناریوها و پروفایل‌های پروژه' : 'Project Profiles & Scenarios'}</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold">
                    *.STEMD
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFa
                  ? 'ذخیره، نام‌گذاری، سوئیچ سریع بین پیکربندی‌های مختلف تونل و انتقال فایل‌های *.STEMD'
                  : 'Save, name, quickly switch between tunnel design configurations & transfer *.STEMD files'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title={isFa ? 'بستن پنجره' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Notifications Banner */}
        {saveSuccessMsg && (
          <div className="px-4 py-2.5 bg-emerald-950/80 border-b border-emerald-700/60 text-emerald-200 text-xs flex items-center justify-between gap-2 shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{saveSuccessMsg}</span>
            </div>
            <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-400 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Active Scenario Quick Card Banner */}
        {activeScenario && (
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/60 border-b border-slate-800 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-400 font-medium">
                      {isFa ? 'سناریوی جاری فعال در نرم‌افزار:' : 'Active Applied Scenario:'}
                    </span>
                    <span className="text-sm font-bold text-slate-100">
                      {isFa ? activeScenario.name : (activeScenario.nameEn || activeScenario.name)}
                    </span>
                    {activeScenario.isBuiltIn && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-900/50 border border-blue-700/60 text-blue-300 text-[10px] font-medium">
                        {isFa ? 'استاندارد مرجع' : 'Benchmark'}
                      </span>
                    )}
                  </div>
                  {/* Key Parameter Badges */}
                  <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-slate-300 font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700">
                      B: {activeScenario.data.span} m
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700">
                      H: {activeScenario.data.depth} m
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-amber-300">
                      RMR: {activeScenario.data.rmr}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-teal-300">
                      Q: {activeScenario.data.qValue}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-purple-300">
                      GSI: {activeScenario.data.gsi}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions for Active Scenario */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={handleUpdateActiveWithCurrent}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-700/80 text-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  title={isFa ? 'به‌روزرسانی مقادیر این سناریو با اعداد اسلایدرهای جاری' : 'Update this scenario with current slider values'}
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{isFa ? 'به‌روزرسانی با مقادیر فعلی' : 'Update with Current'}</span>
                </button>

                <button
                  onClick={() => exportScenarioToStemd({ ...activeScenario, data: currentData })}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={isFa ? 'دانلود فایل سناریو فعال (*.STEMD)' : 'Export Active Scenario (*.STEMD)'}
                >
                  <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{isFa ? 'خروجی STEMD' : 'Export'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Tabs Navigation Bar */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800 bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isFa ? 'فهرست سناریوها' : 'Scenarios List'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900/60 text-[10px]">
                {scenarios.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('save_new')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'save_new'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isFa ? 'ذخیره سناریوی جدید' : 'Save As New Scenario'}</span>
            </button>

            <button
              onClick={() => setActiveTab('export_import')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'export_import'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>{isFa ? 'ورود و خروج فایل (*.STEMD)' : 'Import / Export (*.STEMD)'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: SCENARIOS LIST */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={
                      isFa
                        ? 'جستجو بر اساس نام سناریو، شرایط زمین‌شناسی، کلاس سنگ...'
                        : 'Search scenarios by name, rock class, notes...'
                    }
                    className="w-full h-9 pr-9 pl-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 shrink-0 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      filterType === 'all'
                        ? 'bg-slate-800 text-amber-400 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isFa ? 'همه' : 'All'} ({scenarios.length})
                  </button>
                  <button
                    onClick={() => setFilterType('custom')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      filterType === 'custom'
                        ? 'bg-slate-800 text-amber-400 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isFa ? 'سناریوهای من' : 'Custom'} ({scenarios.filter(s => !s.isBuiltIn).length})
                  </button>
                  <button
                    onClick={() => setFilterType('builtin')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      filterType === 'builtin'
                        ? 'bg-slate-800 text-amber-400 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isFa ? 'استاندارد مرجع' : 'Benchmarks'} ({scenarios.filter(s => s.isBuiltIn).length})
                  </button>
                </div>
              </div>

              {/* Scenarios Cards Grid */}
              {filteredScenarios.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 space-y-3">
                  <Layers className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-400">
                    {isFa ? 'سناریویی با این مشخصات یافت نشد.' : 'No scenarios match the filter criteria.'}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('all');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isFa ? 'نمایش همه سناریوها' : 'Show All'}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredScenarios.map(sc => {
                    const isActive = sc.id === activeScenarioId;
                    const isEditing = editingId === sc.id;

                    return (
                      <div
                        key={sc.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                          isActive
                            ? 'bg-slate-900/95 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        {/* Card Header */}
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {sc.isBuiltIn ? (
                                <span className="px-2 py-0.5 rounded-md bg-blue-950/80 border border-blue-700/60 text-blue-300 text-[10px] font-semibold">
                                  {isFa ? 'استاندارد مهندسی' : 'Benchmark'}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-semibold">
                                  {isFa ? 'سناریوی سفارشی' : 'Custom'}
                                </span>
                              )}

                              {isActive && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>{isFa ? 'فعال' : 'Active'}</span>
                                </span>
                              )}
                            </div>

                            {/* Single Export STEMD Button */}
                            <button
                              onClick={() => exportScenarioToStemd(sc.id === activeScenarioId ? { ...sc, data: currentData } : sc)}
                              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-amber-300 transition-colors"
                              title={isFa ? 'دانلود این سناریو به عنوان فایل *.STEMD' : 'Export this scenario as *.STEMD'}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Title / Rename Area */}
                          {isEditing ? (
                            <div className="mt-2 space-y-2">
                              <input
                                type="text"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                className="w-full px-2 py-1 rounded bg-slate-800 border border-amber-500 text-slate-100 text-xs font-bold"
                              />
                              <textarea
                                value={editDesc}
                                onChange={e => setEditDesc(e.target.value)}
                                rows={2}
                                className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-slate-200 text-xs"
                              />
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs"
                                >
                                  {isFa ? 'انصراف' : 'Cancel'}
                                </button>
                                <button
                                  onClick={() => handleSaveEdit(sc.id)}
                                  className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold text-xs"
                                >
                                  {isFa ? 'ذخیره' : 'Save'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2">
                              <h4 className="text-sm font-bold text-slate-100 leading-snug">
                                {isFa ? sc.name : (sc.nameEn || sc.name)}
                              </h4>
                              {sc.description && (
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                  {isFa ? sc.description : (sc.descriptionEn || sc.description)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Engineering Specs Matrix */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] font-mono text-center">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-slate-500 block">Span (B)</span>
                            <span className="font-bold text-slate-200">{sc.data.span} m</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-slate-500 block">Depth (H)</span>
                            <span className="font-bold text-slate-200">{sc.data.depth} m</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-slate-500 block">RMR</span>
                            <span className="font-bold text-amber-400">{sc.data.rmr}</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-slate-500 block">Q-Value</span>
                            <span className="font-bold text-teal-400">{sc.data.qValue}</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-slate-500 block">GSI</span>
                            <span className="font-bold text-purple-400">{sc.data.gsi}</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-slate-500 block">UCS</span>
                            <span className="font-bold text-sky-400">{sc.data.ucs} MPa</span>
                          </div>
                        </div>

                        {/* Card Bottom Actions */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                          <div className="flex items-center gap-1.5">
                            {/* Duplicate */}
                            <button
                              onClick={() => handleDuplicate(sc.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                              title={isFa ? 'تکثیر این سناریو' : 'Duplicate Scenario'}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit (only custom or if user wants to rename) */}
                            <button
                              onClick={() => handleStartEdit(sc)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                              title={isFa ? 'ویرایش نام و توضیحات' : 'Edit Name & Notes'}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete (only for non-built-in) */}
                            {!sc.isBuiltIn && (
                              <button
                                onClick={() => handleDelete(sc.id, sc.name)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors"
                                title={isFa ? 'حذف سناریو' : 'Delete Scenario'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Apply / Activate Button */}
                          <button
                            onClick={() => {
                              onApplyScenario(sc);
                              onClose();
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                              isActive
                                ? 'bg-amber-500 text-slate-950 ring-1 ring-amber-400'
                                : 'bg-slate-800 hover:bg-amber-600 text-slate-200 hover:text-slate-950'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>{isActive ? (isFa ? 'سناریوی جاری' : 'Applied') : (isFa ? 'اعمال و بارگذاری' : 'Apply')}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVE NEW SCENARIO */}
          {activeTab === 'save_new' && (
            <form onSubmit={handleSaveNewScenario} className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>{isFa ? 'ایجاد پروفایل جدید از مقادیر جاری نرم‌افزار' : 'Save Current Inputs as a New Scenario'}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isFa
                    ? 'تمامی مقادیر جاری ابعاد تونل، روباره، پارامترهای سیستم RMR، سیستم Q، شاخص GSI، پارامترهای هوک-براون، رطوبت آب زیرزمینی و قابلیت حفاری در این سناریو ذخیره خواهند شد.'
                    : 'All active geometry, depth, RMR, Q, GSI, Hoek-Brown parameters, groundwater, and excavability parameters will be captured.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isFa ? 'نام سناریو / پروژه *' : 'Scenario / Project Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder={isFa ? 'مثال: تونل قطعه ۳ - سنگ متوسط هوازده' : 'e.g., Section 3 Tunnel - Weathered Rock'}
                      className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isFa ? 'نام انگلیسی (اختیاری)' : 'English Name (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={newNameEn}
                      onChange={e => setNewNameEn(e.target.value)}
                      placeholder="e.g., Section 3 Tunnel - Fair Rock"
                      className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isFa ? 'توضیحات ژئوتکنیکی و یادداشت‌ها' : 'Geotechnical Notes & Site Observations'}
                  </label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder={
                      isFa
                        ? 'توضیحات تکمیلی نظیر کیلومتراژ، سازند زمین‌شناسی، جهت درزه‌داری یا شرایط آب زیرزمینی...'
                        : 'Chainage, geological formation, joint orientation, water ingress...'
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Snapshot Preview of Parameters */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                <h5 className="text-xs font-bold text-slate-300">
                  {isFa ? 'پیش‌نمایش پارامترهایی که ذخیره می‌شوند:' : 'Parameters Snapshot to be Stored:'}
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">دهانه و ارتفاع (B × H)</span>
                    <span className="font-bold text-slate-200">
                      {currentData.span}m × {currentData.height}m
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">عمق روباره (H)</span>
                    <span className="font-bold text-slate-200">{currentData.depth} m</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">RMR89 & GSI</span>
                    <span className="font-bold text-amber-400">
                      {currentData.rmr} / GSI {currentData.gsi}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">سیستم Barton Q</span>
                    <span className="font-bold text-teal-400">Q = {currentData.qValue} (ESR={currentData.esr})</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">مقاومت فشاری (UCS)</span>
                    <span className="font-bold text-sky-400">{currentData.ucs} MPa</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">شاخص RQD و فاصله درزه‌ها</span>
                    <span className="font-bold text-slate-200">
                      {currentData.rqd}% | {currentData.jointSpacing}m
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">وضعیت آب زیرزمینی</span>
                    <span className="font-bold text-blue-400">
                      {currentData.groundwaterCondition} (Jw={currentData.jw})
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">تنش برجا K0 و وزن واحد</span>
                    <span className="font-bold text-slate-200">
                      K={currentData.kRatio} | γ={currentData.unitWeight}kN/m³
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  {isFa ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>{isFa ? 'ذخیره در حافظه محلی و فعال‌سازی' : 'Save & Activate Scenario'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: EXPORT & IMPORT *.STEMD FILES */}
          {activeTab === 'export_import' && (
            <div className="space-y-4">
              {/* STEMD Format Explanation */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
                  <FileCheck className="w-4 h-4" />
                  <span>
                    {isFa
                      ? 'قالب اختصاصی داده‌های مهندسی تونل (*.STEMD)'
                      : 'Tunnel Empirical Method Design (*.STEMD) File Format'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isFa
                    ? 'فایل‌های با پسوند *.STEMD شامل تمامی پارامترهای هندسی، ژئومکانیکی، طبقه‌بندی‌های RMR/Q/GSI، آب زیرزمینی و بار سنگ هستند. شما می‌توانید هر سناریو را به عنوان یک فایل مستقل دریافت کرده و یا آن را به همکاران خود جهت بارگذاری و بررسی ارسال فرمایید.'
                    : 'The *.STEMD file format stores complete tunnel geometry, geomechanical classification (RMR/Q/GSI), groundwater, and rock load configurations for cross-device sharing.'}
                </p>
              </div>

              {/* Import Section */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>{isFa ? 'ورود و بارگذاری فایل سناریو (*.STEMD)' : 'Import Scenario File (*.STEMD)'}</span>
                </h4>

                <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/70 rounded-xl p-6 text-center space-y-3 transition-colors bg-slate-900/40">
                  <FolderOpen className="w-10 h-10 text-slate-500 mx-auto" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      {isFa
                        ? 'فایل *.STEMD خود را بکشید و اینجا رها کنید، یا کلیک کنید:'
                        : 'Drag & drop your *.STEMD file here, or click to browse:'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {isFa ? 'پشتیبانی از سناریوهای منفرد یا بسته تجمیعی' : 'Supports single scenario or full package'}
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".stemd"
                    onChange={handleFileSelected}
                    className="hidden"
                    id="stemd-file-upload"
                  />
                  <label
                    htmlFor="stemd-file-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/80 text-emerald-200 text-xs font-bold transition-colors cursor-pointer shadow-md"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isFa ? 'انتخاب فایل *.STEMD' : 'Browse *.STEMD File'}</span>
                  </label>
                </div>

                {/* Import Feedback / Preview */}
                {importError && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{importError}</span>
                  </div>
                )}

                {importSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{importSuccessMsg}</span>
                  </div>
                )}

                {importedEnvelope && (
                  <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-700/60 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-slate-100">
                          {isFa ? 'فایل معتبر تشخیص داده شد:' : 'Valid STEMD File Detected:'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {importedEnvelope.exportDate?.slice(0, 10)}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                      {Array.isArray(importedEnvelope.payload) ? (
                        <p className="text-slate-300">
                          {isFa
                            ? `بسته تجمیعی شامل ${importedEnvelope.payload.length} سناریو مهندسی`
                            : `Package containing ${importedEnvelope.payload.length} scenarios`}
                        </p>
                      ) : (
                        <div>
                          <p className="font-bold text-amber-300">{importedEnvelope.payload.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            Span: {importedEnvelope.payload.data.span}m | RMR: {importedEnvelope.payload.data.rmr} | Q: {importedEnvelope.payload.data.qValue}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleExecuteImport(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                      >
                        {isFa ? 'افزودن به لیست سناریوها' : 'Add to Scenarios List'}
                      </button>
                      <button
                        onClick={() => handleExecuteImport(true)}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isFa ? 'افزودن و اعمال فوری در پروژه' : 'Import & Apply Now'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bulk Export & Backup Section */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>{isFa ? 'پشتیبان‌گیری و خروجی تجمیعی' : 'Full Workspace Backup & Bulk Export'}</span>
                </h4>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      {isFa ? 'دانلود تمامی سناریوهای جاری در یک فایل *.STEMD' : 'Export all active scenarios in a single *.STEMD package'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isFa
                        ? `شامل ${scenarios.length} سناریوی ذخیره‌شده و استاندارد`
                        : `Includes ${scenarios.length} saved and benchmark scenarios`}
                    </p>
                  </div>

                  <button
                    onClick={() => exportAllScenariosToStemd(scenarios.map(s => s.id === activeScenarioId ? { ...s, data: currentData } : s), activeScenarioId)}
                    className="px-4 py-2 rounded-xl bg-indigo-900/70 hover:bg-indigo-800 border border-indigo-700/80 text-indigo-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shrink-0"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>{isFa ? 'دانلود بسته کامل (*.STEMD)' : 'Export All Scenarios (*.STEMD)'}</span>
                  </button>
                </div>

                {/* Factory Reset Option */}
                <div className="flex items-center justify-between gap-2 pt-2 text-xs">
                  <span className="text-slate-500">
                    {isFa ? 'بازگشت به ۵ سناریوی پیش‌فرض کارخانه:' : 'Restore standard factory benchmark scenarios:'}
                  </span>
                  <button
                    onClick={handleFactoryReset}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-700 text-slate-400 hover:text-rose-300 transition-colors"
                  >
                    {isFa ? 'بازنشانی سناریوها' : 'Reset Scenarios'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3 shrink-0 text-xs">
          <div className="text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {isFa
                ? 'سناریوها در حافظه محلی مرورگر (Local Storage) ذخیره می‌شوند.'
                : 'Scenarios are securely saved in browser Local Storage.'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
          >
            {isFa ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
