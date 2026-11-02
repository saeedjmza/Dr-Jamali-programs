import React, { useMemo } from 'react';
import {
  Compass,
  Layers,
  Grid,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ClassificationSubTab } from '../../types';
import { RmrClassificationTab } from './RmrClassificationTab';
import { QClassificationTab } from './QClassificationTab';
import { GsiClassificationTab } from './GsiClassificationTab';
import { checkGeotechnicalConsistency } from '../../utils/consistencyValidation';
import { GeotechnicalWarningBanner } from '../GeotechnicalWarningBanner';
import { rmrToEquivalentQ } from '../../utils/qCalculation';

import { GroundwaterConditionKey } from '../../utils/waterConditions';

interface ClassificationHubProps {
  activeSubTab: ClassificationSubTab;
  onSelectSubTab: (tab: ClassificationSubTab) => void;
  currentRmr: number;
  currentQ: number;
  currentGsi: number;
  currentRqd: number;
  currentSpan: number;
  currentEsr: number;
  currentDepth: number;
  currentUcs: number;
  currentJointSpacing: number;
  currentJointSets: number;
  currentMi?: number;
  currentDFactor?: number;
  currentGroundwaterCondition?: GroundwaterConditionKey;
  currentGroundwaterRmr?: number;
  currentJw?: number;
  currentPersistence?: number;
  currentAperture?: number;
  currentRoughness?: number;
  currentInfillingId?: string;
  currentWeathering?: number;
  currentOrientationAdj?: number;
  currentCalcModeRmr?: 'components' | 'manual';
  currentJr?: number;
  currentJa?: number;
  currentSrf?: number;
  currentCalcModeQ?: 'components' | 'manual';
  onApplyRmr: (rmr: number) => void;
  onApplyQ: (q: number) => void;
  onApplyGsi: (gsi: number) => void;
  onUpdateRqd: (rqd: number) => void;
  onUpdateDepth: (depth: number) => void;
  onUpdateUcs: (ucs: number) => void;
  onUpdateMi?: (mi: number) => void;
  onUpdateDFactor?: (d: number) => void;
  onUpdateJointSpacing: (spacing: number) => void;
  onUpdateJointSets: (jointSets: number) => void;
  onUpdateGroundwaterCondition?: (key: GroundwaterConditionKey) => void;
  onUpdateGroundwaterRmr?: (val: number) => void;
  onUpdateJw?: (jw: number) => void;
  onUpdatePersistence?: (val: number) => void;
  onUpdateAperture?: (val: number) => void;
  onUpdateRoughness?: (val: number) => void;
  onUpdateInfillingId?: (id: string) => void;
  onUpdateWeathering?: (val: number) => void;
  onUpdateOrientationAdj?: (val: number) => void;
  onUpdateCalcModeRmr?: (mode: 'components' | 'manual') => void;
  onUpdateJr?: (val: number) => void;
  onUpdateJa?: (val: number) => void;
  onUpdateSrf?: (val: number) => void;
  onUpdateCalcModeQ?: (mode: 'components' | 'manual') => void;
  onNavigateToStandup: () => void;
  onNavigateToSupport?: () => void;
  lang: 'fa' | 'en';
}

export const ClassificationHub: React.FC<ClassificationHubProps> = ({
  activeSubTab,
  onSelectSubTab,
  currentRmr,
  currentQ,
  currentGsi,
  currentRqd,
  currentSpan,
  currentEsr,
  currentDepth,
  currentUcs,
  currentJointSpacing,
  currentJointSets,
  currentMi,
  currentDFactor,
  currentGroundwaterCondition,
  currentGroundwaterRmr,
  currentJw,
  currentPersistence,
  currentAperture,
  currentRoughness,
  currentInfillingId,
  currentWeathering,
  currentOrientationAdj,
  currentCalcModeRmr,
  currentJr,
  currentJa,
  currentSrf,
  currentCalcModeQ,
  onApplyRmr,
  onApplyQ,
  onApplyGsi,
  onUpdateRqd,
  onUpdateDepth,
  onUpdateUcs,
  onUpdateMi,
  onUpdateDFactor,
  onUpdateJointSpacing,
  onUpdateJointSets,
  onUpdateGroundwaterCondition,
  onUpdateGroundwaterRmr,
  onUpdateJw,
  onUpdatePersistence,
  onUpdateAperture,
  onUpdateRoughness,
  onUpdateInfillingId,
  onUpdateWeathering,
  onUpdateOrientationAdj,
  onUpdateCalcModeRmr,
  onUpdateJr,
  onUpdateJa,
  onUpdateSrf,
  onUpdateCalcModeQ,
  onNavigateToStandup,
  onNavigateToSupport,
  lang,
}) => {
  const isFa = lang === 'fa';

  const consistencyReport = useMemo(() => {
    return checkGeotechnicalConsistency(currentRmr, currentGsi, currentQ);
  }, [currentRmr, currentGsi, currentQ]);

  const subTabs = [
    {
      id: 'rmr' as ClassificationSubTab,
      labelFa: 'سیستم RMR بینیاوسکی',
      labelEn: 'Bieniawski RMR',
      badge: `RMR = ${currentRmr}`,
      icon: Compass,
      color: 'text-amber-400',
      activeBg: 'bg-amber-500/15 border-amber-500/50 text-amber-300',
    },
    {
      id: 'q' as ClassificationSubTab,
      labelFa: 'سیستم Q بارتون',
      labelEn: 'Barton Q-System',
      badge: `Q = ${currentQ}`,
      icon: Layers,
      color: 'text-teal-400',
      activeBg: 'bg-teal-500/15 border-teal-500/50 text-teal-300',
    },
    {
      id: 'gsi' as ClassificationSubTab,
      labelFa: 'شاخص مقاومت GSI (هوک و براون)',
      labelEn: 'Hoek-Brown GSI',
      badge: `GSI = ${currentGsi}`,
      icon: Grid,
      color: 'text-purple-400',
      activeBg: 'bg-purple-500/15 border-purple-500/50 text-purple-300',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs */}
      <div className="p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectSubTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                  isActive
                    ? `${tab.activeBg} shadow-md`
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.color}`} />
                <span>{isFa ? tab.labelFa : tab.labelEn}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/60 text-slate-300 border border-slate-800">
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onNavigateToStandup}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-900/30 cursor-pointer"
        >
          <span>{isFa ? 'انتقال به تخمین زمان خودپایداری' : 'Go to Stand-up Time'}</span>
          <ArrowRight className={`w-3.5 h-3.5 ${isFa ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Geotechnical Consistency Mismatch Warning Banner */}
      {consistencyReport.hasConflict && (
        <GeotechnicalWarningBanner
          report={consistencyReport}
          currentRmr={currentRmr}
          currentGsi={currentGsi}
          currentQ={currentQ}
          onSyncGsiFromRmr={onApplyGsi}
          onSyncRmrFromGsi={onApplyRmr}
          onSyncQFromRmr={(newQ) => onApplyQ(newQ)}
          onSyncQFromGsi={(newQ) => onApplyQ(newQ)}
          onSyncRmrFromQ={(newRmr) => onApplyRmr(newRmr)}
          onSyncGsiFromQ={(newGsi) => onApplyGsi(newGsi)}
          onSyncAllToRmr={() => {
            onApplyGsi(consistencyReport.expectedGsiFromRmr);
            onApplyQ(consistencyReport.expectedQFromRmr);
          }}
          lang={lang}
        />
      )}

      {/* Active Sub-tab Content */}
      {activeSubTab === 'rmr' && (
        <RmrClassificationTab
          currentRmr={currentRmr}
          currentRqd={currentRqd}
          currentDepth={currentDepth}
          currentUcs={currentUcs}
          currentJointSpacing={currentJointSpacing}
          currentJointSets={currentJointSets}
          currentGroundwaterRmr={currentGroundwaterRmr}
          currentPersistence={currentPersistence}
          currentAperture={currentAperture}
          currentRoughness={currentRoughness}
          currentInfillingId={currentInfillingId}
          currentWeathering={currentWeathering}
          currentOrientationAdj={currentOrientationAdj}
          currentCalcMode={currentCalcModeRmr}
          onApplyRmr={onApplyRmr}
          onUpdateRqd={onUpdateRqd}
          onUpdateDepth={onUpdateDepth}
          onUpdateUcs={onUpdateUcs}
          onUpdateJointSpacing={onUpdateJointSpacing}
          onUpdateJointSets={onUpdateJointSets}
          onUpdateGroundwaterRmr={onUpdateGroundwaterRmr}
          onUpdatePersistence={onUpdatePersistence}
          onUpdateAperture={onUpdateAperture}
          onUpdateRoughness={onUpdateRoughness}
          onUpdateInfillingId={onUpdateInfillingId}
          onUpdateWeathering={onUpdateWeathering}
          onUpdateOrientationAdj={onUpdateOrientationAdj}
          onUpdateCalcMode={onUpdateCalcModeRmr}
          onNavigateToStandup={onNavigateToStandup}
          onNavigateToSupport={onNavigateToSupport}
          lang={lang}
        />
      )}

      {activeSubTab === 'q' && (
        <QClassificationTab
          currentQ={currentQ}
          currentRqd={currentRqd}
          currentSpan={currentSpan}
          currentEsr={currentEsr}
          currentDepth={currentDepth}
          currentUcs={currentUcs}
          currentJointSpacing={currentJointSpacing}
          currentJointSets={currentJointSets}
          currentJr={currentJr}
          currentJa={currentJa}
          currentJw={currentJw}
          currentSrf={currentSrf}
          currentCalcMode={currentCalcModeQ}
          onApplyQ={onApplyQ}
          onUpdateRqd={onUpdateRqd}
          onUpdateDepth={onUpdateDepth}
          onUpdateUcs={onUpdateUcs}
          onUpdateJointSpacing={onUpdateJointSpacing}
          onUpdateJointSets={onUpdateJointSets}
          onUpdateJr={onUpdateJr}
          onUpdateJa={onUpdateJa}
          onUpdateJw={onUpdateJw}
          onUpdateSrf={onUpdateSrf}
          onUpdateCalcMode={onUpdateCalcModeQ}
          onNavigateToStandup={onNavigateToStandup}
          lang={lang}
        />
      )}

      {activeSubTab === 'gsi' && (
        <GsiClassificationTab
          currentRmr={currentRmr}
          currentQ={currentQ}
          currentGsi={currentGsi}
          currentUcs={currentUcs}
          currentMi={currentMi}
          currentDFactor={currentDFactor}
          onApplyRmr={onApplyRmr}
          onApplyQ={onApplyQ}
          onApplyGsi={onApplyGsi}
          onUpdateUcs={onUpdateUcs}
          onUpdateMi={onUpdateMi}
          onUpdateDFactor={onUpdateDFactor}
          onNavigateToStandup={onNavigateToStandup}
          onNavigateToSupport={onNavigateToSupport}
          lang={lang}
        />
      )}
    </div>
  );
};
