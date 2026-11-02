import React from 'react';
import { ProjectScenario } from '../../types';
import { Layers, X, Plus, Sparkles } from 'lucide-react';

interface DocumentTabsBarProps {
  isFa: boolean;
  openScenarios: ProjectScenario[];
  activeScenarioId: string;
  onSelectScenario: (scenario: ProjectScenario) => void;
  onCloseScenario: (scenarioId: string) => void;
  onNewScenario: () => void;
}

export const DocumentTabsBar: React.FC<DocumentTabsBarProps> = ({
  isFa,
  openScenarios,
  activeScenarioId,
  onSelectScenario,
  onCloseScenario,
  onNewScenario,
}) => {
  if (!openScenarios || openScenarios.length === 0) return null;

  return (
    <div
      dir={isFa ? 'rtl' : 'ltr'}
      className="bg-slate-950/90 border-b border-slate-800/80 px-2 sm:px-4 flex items-center gap-1 overflow-x-auto select-none no-scrollbar h-8 text-xs"
    >
      <div className="flex items-center gap-1 flex-nowrap">
        {openScenarios.map(sc => {
          const isActive = sc.id === activeScenarioId;
          const name = isFa ? sc.name : sc.nameEn || sc.name;

          return (
            <div
              key={sc.id}
              onClick={() => onSelectScenario(sc)}
              className={`group relative h-7 px-2.5 rounded-t-lg border-t border-x flex items-center gap-2 cursor-pointer transition-all shrink-0 max-w-[200px] sm:max-w-[260px] ${
                isActive
                  ? 'bg-slate-900 border-slate-700 text-amber-300 font-bold shadow-sm'
                  : 'bg-slate-950/60 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
              title={`${name} (Span: ${sc.data.span}m | RMR: ${sc.data.rmr} | Q: ${sc.data.qValue})`}
            >
              <Layers
                className={`w-3.5 h-3.5 shrink-0 ${
                  isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-400'
                }`}
              />
              <span className="truncate text-xs">{name}</span>

              {/* Benchmark Pill */}
              {sc.isBuiltIn && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800/80 text-slate-400 font-normal shrink-0">
                  {isFa ? 'مرجع' : 'Base'}
                </span>
              )}

              {/* Close Tab Button */}
              {openScenarios.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseScenario(sc.id);
                  }}
                  className="p-0.5 rounded text-slate-500 hover:text-rose-300 hover:bg-slate-800 transition-colors cursor-pointer shrink-0 opacity-60 group-hover:opacity-100"
                  title={isFa ? 'بستن این پرونده (Ctrl+W)' : 'Close this tab (Ctrl+W)'}
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Active Tab Accent Line */}
              {isActive && (
                <div className="absolute top-0 inset-x-0 h-0.5 bg-amber-400 rounded-t-full" />
              )}
            </div>
          );
        })}

        {/* New Tab Button */}
        <button
          onClick={onNewScenario}
          className="h-7 w-7 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          title={isFa ? 'ایجاد سناریوی جدید (Ctrl+N)' : 'New Scenario (Ctrl+N)'}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
