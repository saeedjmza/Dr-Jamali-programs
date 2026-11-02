import React, { useState } from 'react';
import { X, ClipboardPaste, Check, AlertCircle } from 'lucide-react';
import { ProjectScenarioData } from '../../types';

interface QuickPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFa: boolean;
  onApplyPastedData: (data: Partial<ProjectScenarioData>) => void;
}

export const QuickPasteModal: React.FC<QuickPasteModalProps> = ({
  isOpen,
  onClose,
  isFa,
  onApplyPastedData,
}) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const parsed = JSON.parse(text);
      const dataToApply: Partial<ProjectScenarioData> = {};

      const numericKeys: (keyof ProjectScenarioData)[] = [
        'span', 'height', 'depth', 'rmr', 'qValue', 'esr', 'gsi', 'ucs', 'rqd',
        'unitWeight', 'kRatio', 'jointSpacing', 'jointSets', 'jr', 'ja', 'mi',
        'dFactor', 'groundwaterRmr', 'jw', 'pointLoadIs50'
      ];

      // Handle direct data or nested under data/payload
      const source = parsed.data || parsed.payload?.data || parsed;

      for (const k of numericKeys) {
        if (typeof source[k] === 'number') {
          (dataToApply as any)[k] = source[k];
        }
      }

      if (source.groundwaterCondition) {
        dataToApply.groundwaterCondition = source.groundwaterCondition;
      }
      if (source.method) {
        dataToApply.method = source.method;
      }

      if (Object.keys(dataToApply).length === 0) {
        throw new Error(isFa ? 'هیچ پارامتر مهندسی معتبری در متن یافت نشد.' : 'No valid engineering parameters found in pasted text.');
      }

      onApplyPastedData(dataToApply);
      setText('');
      onClose();
    } catch (err: any) {
      setError(err.message || (isFa ? 'فرمت داده نامعتبر است. لطفاً ساختار JSON معتبر وارد کنید.' : 'Invalid data format. Please provide valid JSON.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        dir={isFa ? 'rtl' : 'ltr'}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto text-xs"
      >
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ClipboardPaste className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">
              {isFa ? 'جایگذاری مشخصات ژئوتکنیکی (Paste Parameters)' : 'Paste Geotechnical Parameters'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleApply} className="p-5 space-y-3">
          <p className="text-slate-300">
            {isFa
              ? 'متن JSON مشخصات مهندسی سنگ را در کادر زیر جایگذاری نمایید:'
              : 'Paste JSON of rock engineering parameters below:'}
          </p>

          <textarea
            rows={7}
            required
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`{\n  "span": 10.5,\n  "depth": 320,\n  "rmr": 72,\n  "qValue": 18.5,\n  "ucs": 110,\n  "rqd": 85\n}`}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 font-mono text-[11px] text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
          />

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer transition-colors"
            >
              {isFa ? 'انصراف' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-md"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isFa ? 'اعمال مشخصات' : 'Apply Parameters'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
