import React, { useState } from 'react';
import { X, FilePlus, Sparkles, Layers } from 'lucide-react';
import { ProjectScenarioData } from '../../types';
import { saveCurrentAsScenario, BUILTIN_BENCHMARK_SCENARIOS } from '../../utils/scenarioStorage';

interface NewScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFa: boolean;
  currentData: ProjectScenarioData;
  onScenarioCreated: (newScenario: any) => void;
}

export const NewScenarioModal: React.FC<NewScenarioModalProps> = ({
  isOpen,
  onClose,
  isFa,
  currentData,
  onScenarioCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [baseOption, setBaseOption] = useState<'current' | 'default' | string>('current');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || (isFa ? 'سناریوی جدید تونل' : 'New Tunnel Scenario');

    let baseData = currentData;
    if (baseOption === 'default') {
      baseData = BUILTIN_BENCHMARK_SCENARIOS[0].data;
    } else if (baseOption.startsWith('builtin_')) {
      const found = BUILTIN_BENCHMARK_SCENARIOS.find(b => b.id === baseOption);
      if (found) baseData = found.data;
    }

    const created = saveCurrentAsScenario(
      finalName,
      description.trim() || (isFa ? 'سناریوی جدید طراحی تونل' : 'New tunnel design scenario'),
      baseData,
      finalName
    );

    onScenarioCreated(created);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        dir={isFa ? 'rtl' : 'ltr'}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto text-xs"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FilePlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                {isFa ? 'ایجاد سناریو / پرونده جدید (*.STEMD)' : 'New Project Scenario (*.STEMD)'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isFa
                  ? 'نام‌گذاری و ایجاد پرونده جدید برای طراحی و تحلیل تونل'
                  : 'Name and initialize a new tunnel design scenario'}
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

        {/* Form */}
        <form onSubmit={handleCreate} className="p-4 sm:p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold">
              {isFa ? 'نام سناریو / عنوان پرونده:' : 'Scenario / Document Name:'}
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isFa ? 'مثال: تونل انتقال خط ۲ - قطعه ب' : 'e.g., Transit Tunnel Section B'}
              className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold">
              {isFa ? 'توضیحات فنی یا موقعیت پروژه (اختیاری):' : 'Technical Description (Optional):'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isFa ? 'مقطع، شرایط لایه‌بندی و اهداف طراحی...' : 'Section details, rock strata, and objectives...'}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold">
              {isFa ? 'مبنای پارامترهای اولیه:' : 'Initial Parameters Baseline:'}
            </label>
            <select
              value={baseOption}
              onChange={(e) => setBaseOption(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="current">{isFa ? 'استفاده از پارامترهای ورودی جاری' : 'Use Current Input Parameters'}</option>
              <option value="default">{isFa ? 'مقادیر پیش‌فرض استاندارد' : 'Standard Default Baseline'}</option>
              {BUILTIN_BENCHMARK_SCENARIOS.map(b => (
                <option key={b.id} value={b.id}>
                  {isFa ? `الگوبرداری از: ${b.name}` : `Template from: ${b.nameEn || b.name}`}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer transition-colors"
            >
              {isFa ? 'انصراف' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-lg shadow-blue-600/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isFa ? 'ایجاد و باز کردن پرونده' : 'Create & Open'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
