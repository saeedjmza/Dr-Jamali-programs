import React, { useState, useRef, useEffect } from 'react';
import { Layers, ChevronDown, Check, Plus, FolderOpen, Download } from 'lucide-react';
import { ProjectScenario } from '../../types';
import { loadAllScenarios } from '../../utils/scenarioStorage';

interface ScenarioQuickSwitcherProps {
  isFa: boolean;
  activeScenario: ProjectScenario | null;
  onSelectScenario: (scenario: ProjectScenario) => void;
  onOpenManageModal: () => void;
}

export const ScenarioQuickSwitcher: React.FC<ScenarioQuickSwitcherProps> = ({
  isFa,
  activeScenario,
  onSelectScenario,
  onOpenManageModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scenarios, setScenarios] = useState<ProjectScenario[]>(() => loadAllScenarios());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      setScenarios(loadAllScenarios());
    }
    setIsOpen(prev => !prev);
  };

  const displayName = activeScenario
    ? isFa
      ? activeScenario.name
      : activeScenario.nameEn || activeScenario.name
    : isFa
    ? 'انتخاب سناریو...'
    : 'Select Scenario...';

  return (
    <div className="relative inline-block text-right shrink-0" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg bg-slate-900 border border-amber-500/40 hover:border-amber-500/80 hover:bg-slate-800/90 text-slate-200 text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-sm shadow-amber-500/5 group"
        title={isFa ? 'سوئیچ سریع بین سناریوهای پروژه و فایل‌های *.STEMD' : 'Quickly switch project scenarios (*.STEMD)'}
      >
        <Layers className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform shrink-0" />
        <span className="text-[11px] sm:text-xs text-amber-300 font-bold hidden xs:inline">
          {isFa ? 'سناریو:' : 'Scenario:'}
        </span>
        <span className="truncate max-w-[130px] sm:max-w-[190px] md:max-w-[240px] text-slate-100 font-medium text-xs">
          {displayName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          dir={isFa ? 'rtl' : 'ltr'}
          className="absolute right-0 sm:right-auto sm:left-0 mt-1.5 w-72 sm:w-80 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl py-2 z-50 text-xs overflow-hidden animate-fadeIn"
        >
          <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-bold text-slate-400 flex items-center justify-between">
            <span>{isFa ? 'سناریوهای پروژه (*.STEMD)' : 'Project Scenarios (*.STEMD)'}</span>
            <span className="text-amber-400 font-mono text-[10px]">{scenarios.length}</span>
          </div>

          {/* Scenario Items List */}
          <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
            {scenarios.map(sc => {
              const isSelected = activeScenario?.id === sc.id;
              const name = isFa ? sc.name : sc.nameEn || sc.name;

              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    onSelectScenario(sc);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-right flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{name}</span>
                      {sc.isBuiltIn && (
                        <span className="px-1 py-0.2 rounded bg-slate-800 text-[9px] text-slate-400 shrink-0">
                          {isFa ? 'مرجع' : 'Base'}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Span: {sc.data.span}m | RMR: {sc.data.rmr} | Q: {sc.data.qValue}
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Dropdown Bottom Actions */}
          <div className="p-2 border-t border-slate-800 bg-slate-950/60 flex items-center gap-1.5">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenManageModal();
              }}
              className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>{isFa ? 'مدیریت و ورود/خروج (*.STEMD)' : 'Manage & Import/Export'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
