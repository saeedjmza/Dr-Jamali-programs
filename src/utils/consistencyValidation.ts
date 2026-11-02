/**
 * Geotechnical Input Parameters Consistency Validation Engine
 * Validates mutual consistency between empirical classification indices:
 * - Bieniawski (1989) RMR
 * - Hoek & Brown (1995, 2002) GSI
 * - Barton (1974, 2002) Q-System
 *
 * Scientific Basis:
 * - Hoek et al. (1995, 2002): GSI ≈ RMR'89 - 5 (dry condition) or GSI ≈ RMR'76
 * - Bieniawski (1976): RMR ≈ 9 * ln(Q) + 44
 * - Barton (2002): RMR ≈ 15 * log10(Q) + 50
 */

import { rmrToGsi, gsiToRmr } from './gsiCalculation';
import { qToEquivalentRmr } from './qCalculation';
import { ROCK_CLASSES } from './rmrCalculation';

export interface ConsistencyIssue {
  id: string;
  type: 'rmr_gsi' | 'rmr_q' | 'gsi_q';
  severity: 'warning' | 'critical';
  titleFa: string;
  titleEn: string;
  messageFa: string;
  messageEn: string;
  detailsFa: string;
  detailsEn: string;
  primaryValueLabel: string;
  primaryValue: number;
  conflictingValueLabel: string;
  conflictingValue: number;
  difference: number;
  suggestedAction?: {
    labelFa: string;
    labelEn: string;
    actionType: 'sync_gsi_from_rmr' | 'sync_rmr_from_gsi' | 'sync_q_from_rmr' | 'sync_rmr_from_q' | 'sync_q_from_gsi';
    targetValue: number;
  };
}

export interface GeotechnicalConsistencyReport {
  hasConflict: boolean;
  hasRmrGsiConflict: boolean;
  hasQConflict: boolean;
  hasRmrQConflict: boolean;
  hasGsiQConflict: boolean;
  severity: 'none' | 'warning' | 'critical';
  issues: ConsistencyIssue[];
  primaryIssue: ConsistencyIssue | null;
  rmrGsiDiff: number;
  rmrQDiff: number;
  gsiQDiff: number;
  expectedGsiFromRmr: number;
  expectedRmrFromGsi: number;
  expectedQFromRmr: number;
  expectedQFromGsi: number;
  equivalentRmrFromQ: number;
  equivalentGsiFromQ: number;
}

/**
 * Checks geotechnical consistency between RMR, GSI, and Barton Q.
 *
 * @param rmr Bieniawski Rock Mass Rating (0 - 100)
 * @param gsi Geological Strength Index (5 - 100)
 * @param qValue Barton Q value (0.001 - 1000)
 */
export function checkGeotechnicalConsistency(
  rmr: number,
  gsi: number,
  qValue?: number
): GeotechnicalConsistencyReport {
  const issues: ConsistencyIssue[] = [];

  const safeRmr = Math.max(0, Math.min(100, Math.round(rmr)));
  const safeGsi = Math.max(5, Math.min(100, Math.round(gsi)));
  const expectedGsi = rmrToGsi(safeRmr);
  const expectedRmr = gsiToRmr(safeGsi);

  // Expected Q from RMR and GSI
  const calcExpectedQ = (rmrRating: number): number => {
    const raw = Math.exp((rmrRating - 44) / 9);
    return raw >= 10 ? Math.round(raw * 10) / 10 : parseFloat(raw.toPrecision(2));
  };

  const expectedQFromRmr = calcExpectedQ(safeRmr);
  const expectedQFromGsi = calcExpectedQ(safeGsi + 5);

  // Get qualitative descriptions
  const getRmrDesc = (val: number) => {
    if (val >= 81) return { fa: 'خیلی خوب (رده I)', en: 'Very Good (Class I)' };
    if (val >= 61) return { fa: 'خوب (رده II)', en: 'Good (Class II)' };
    if (val >= 41) return { fa: 'متوسط (رده III)', en: 'Fair (Class III)' };
    if (val >= 21) return { fa: 'ضعیف (رده IV)', en: 'Poor (Class IV)' };
    return { fa: 'بسیار ضعیف (رده V)', en: 'Very Poor (Class V)' };
  };

  const getGsiDesc = (val: number) => {
    if (val >= 75) return { fa: 'توده‌سنگ یکپارچه / مرغوب', en: 'Massive / High Quality' };
    if (val >= 55) return { fa: 'توده‌سنگ بلوکی / متوسط تا خوب', en: 'Blocky / Fair to Good' };
    if (val >= 35) return { fa: 'بسیار درزه‌دار / ضعیف', en: 'Very Blocky / Disturbed' };
    if (val >= 20) return { fa: 'خردشده / بسیار ضعیف', en: 'Disintegrated / Poor' };
    return { fa: 'کاملاً خردشده و متلاشی', en: 'Laminated / Sheared' };
  };

  const getQDesc = (val: number) => {
    if (val >= 100) return { fa: 'بسیار استثنایی / عالی', en: 'Exceptionally Good' };
    if (val >= 40) return { fa: 'بسیار خوب', en: 'Very Good' };
    if (val >= 10) return { fa: 'خوب', en: 'Good' };
    if (val >= 4) return { fa: 'متوسط', en: 'Fair' };
    if (val >= 1) return { fa: 'ضعیف', en: 'Poor' };
    if (val >= 0.1) return { fa: 'خیلی ضعیف', en: 'Very Poor' };
    if (val >= 0.01) return { fa: 'فوق‌العاده ضعیف', en: 'Extremely Poor' };
    return { fa: 'بسیار بحرانی و خردشده', en: 'Exceptionally Poor' };
  };

  const rmrDesc = getRmrDesc(safeRmr);
  const gsiDesc = getGsiDesc(safeGsi);

  // 1. Check RMR vs GSI Consistency
  const rmrGsiDiff = Math.abs(safeRmr - safeGsi);
  let hasRmrGsiConflict = false;

  if (rmrGsiDiff >= 30) {
    hasRmrGsiConflict = true;
    issues.push({
      id: 'rmr-gsi-critical',
      type: 'rmr_gsi',
      severity: 'critical',
      titleFa: 'هشدار عدم تطابق شدید شاخص‌های RMR و GSI',
      titleEn: 'Critical Geotechnical Conflict: RMR & GSI Mismatch',
      messageFa: `پارامترهای ورودی همخوانی ندارند: مقدار RMR (${safeRmr} - ${rmrDesc.fa}) و شاخص GSI (${safeGsi} - ${gsiDesc.fa}) دارای تفاوت شدید (${rmrGsiDiff} واحد) می‌باشند.`,
      messageEn: `Input parameters do not correlate: RMR (${safeRmr} - ${rmrDesc.en}) and GSI (${safeGsi} - ${gsiDesc.en}) exhibit a severe discrepancy of ${rmrGsiDiff} points.`,
      detailsFa: `بر اساس روابط تجربی هوک و براون (Hoek et al. 1995/2002)، شاخص GSI و رده‌بندی RMR بیانگر یک توده‌سنگ یکسان هستند و باید همبستگی نزدیکی داشته باشند (GSI ≈ RMR - 5). بر اساس مقدار فعلی RMR=${safeRmr}، مقدار تخمینی GSI باید حدود ${expectedGsi} باشد.`,
      detailsEn: `According to Hoek et al. (1995/2002), GSI and RMR represent the same rock mass and must closely align (GSI ≈ RMR - 5). For RMR=${safeRmr}, GSI is expected to be approximately ${expectedGsi}.`,
      primaryValueLabel: 'RMR',
      primaryValue: safeRmr,
      conflictingValueLabel: 'GSI',
      conflictingValue: safeGsi,
      difference: rmrGsiDiff,
      suggestedAction: {
        labelFa: `تنظیم GSI بر اساس RMR (${expectedGsi})`,
        labelEn: `Sync GSI to RMR (${expectedGsi})`,
        actionType: 'sync_gsi_from_rmr',
        targetValue: expectedGsi,
      },
    });
  } else if (rmrGsiDiff >= 20) {
    hasRmrGsiConflict = true;
    issues.push({
      id: 'rmr-gsi-warning',
      type: 'rmr_gsi',
      severity: 'warning',
      titleFa: 'هشدار عدم تطابق نسبی RMR و GSI',
      titleEn: 'Noticeable Discrepancy between RMR and GSI',
      messageFa: `بین شاخص RMR (${safeRmr}) و شاخص GSI (${safeGsi}) اختلاف قابل توجه (${rmrGsiDiff} واحد) وجود دارد.`,
      messageEn: `A noticeable discrepancy of ${rmrGsiDiff} points exists between RMR (${safeRmr}) and GSI (${safeGsi}).`,
      detailsFa: `در شرایط استاندارد مهندسی سنگ، انتظار می‌رود مقدار GSI در محدوده ${expectedGsi} باشد. لطفاً از صحت و تطابق پارامترهای ورودی مطمئن شوید.`,
      detailsEn: `Under standard geotechnical conditions, GSI is expected to be around ${expectedGsi}. Please verify input parameter consistency.`,
      primaryValueLabel: 'RMR',
      primaryValue: safeRmr,
      conflictingValueLabel: 'GSI',
      conflictingValue: safeGsi,
      difference: rmrGsiDiff,
      suggestedAction: {
        labelFa: `تنظیم GSI به ${expectedGsi}`,
        labelEn: `Set GSI to ${expectedGsi}`,
        actionType: 'sync_gsi_from_rmr',
        targetValue: expectedGsi,
      },
    });
  }

  // 2. Check Barton Q vs RMR and GSI Consistency
  let equivalentRmrFromQ = safeRmr;
  let equivalentGsiFromQ = expectedGsi;
  let rmrQDiff = 0;
  let gsiQDiff = 0;
  let hasRmrQConflict = false;
  let hasGsiQConflict = false;

  if (qValue !== undefined && qValue > 0) {
    const safeQ = Math.max(0.001, Math.min(1000, qValue));
    const { rmrBieniawski } = qToEquivalentRmr(safeQ);
    equivalentRmrFromQ = rmrBieniawski;
    equivalentGsiFromQ = Math.max(5, Math.min(100, Math.round(9 * Math.log(safeQ) + 39)));

    rmrQDiff = Math.abs(safeRmr - equivalentRmrFromQ);
    gsiQDiff = Math.abs(safeGsi - equivalentGsiFromQ);

    const qDesc = getQDesc(safeQ);

    // Q vs RMR check
    if (rmrQDiff >= 35) {
      hasRmrQConflict = true;
      issues.push({
        id: 'rmr-q-critical',
        type: 'rmr_q',
        severity: 'critical',
        titleFa: 'هشدار عدم تطابق شدید شاخص‌های RMR و Q بارتون',
        titleEn: 'Critical Conflict: RMR & Barton Q Mismatch',
        messageFa: `شاخص RMR (${safeRmr} - ${rmrDesc.fa}) با شاخص Q بارتون (${safeQ} - ${qDesc.fa}) در تضاد فاحش است. طبق رابطه بینیاوسکی و بارتون، شاخص Q=${safeQ} معادل RMR حدود ${equivalentRmrFromQ} می‌باشد (اختلاف: ${rmrQDiff} واحد).`,
        messageEn: `Severe geotechnical conflict: RMR (${safeRmr} - ${rmrDesc.en}) contradicts Barton Q (${safeQ} - ${qDesc.en}). Q=${safeQ} equates to RMR ≈ ${equivalentRmrFromQ} (difference: ${rmrQDiff} points).`,
        detailsFa: `بر اساس روابط استاندارد مهندسی سنگ (RMR ≈ 9 ln(Q) + 44 و Barton 2002)، این دو مقدار همزمان نمی‌توانند متعلق به یک توده‌سنگ باشند؛ به عنوان مثال کیفیت سنگ از دید یکی «بسیار خوب» و از دید دیگری «بسیار ضعیف» تلقی می‌شود. برای RMR=${safeRmr}، انتظار می‌رود Q حدود ${expectedQFromRmr} باشد.`,
        detailsEn: `Empirical rock mechanics equations (RMR ≈ 9 ln(Q) + 44) demonstrate these parameters represent conflicting rock masses. For RMR=${safeRmr}, expected Barton Q is approximately ${expectedQFromRmr}.`,
        primaryValueLabel: 'RMR',
        primaryValue: safeRmr,
        conflictingValueLabel: 'Q',
        conflictingValue: safeQ,
        difference: rmrQDiff,
        suggestedAction: {
          labelFa: `تطبیق Q بر اساس RMR (${expectedQFromRmr})`,
          labelEn: `Sync Q to RMR (${expectedQFromRmr})`,
          actionType: 'sync_q_from_rmr',
          targetValue: expectedQFromRmr,
        },
      });
    } else if (rmrQDiff >= 22) {
      hasRmrQConflict = true;
      issues.push({
        id: 'rmr-q-warning',
        type: 'rmr_q',
        severity: 'warning',
        titleFa: 'عدم تطابق نسبی شاخص RMR و سیستم Q بارتون',
        titleEn: 'Noticeable Discrepancy: RMR vs Barton Q',
        messageFa: `بین شاخص RMR (${safeRmr}) و شاخص Q بارتون (${safeQ}) اختلاف معنادار وجود دارد (Q معادل RMR=${equivalentRmrFromQ}، اختلاف: ${rmrQDiff} واحد).`,
        messageEn: `A noticeable discrepancy of ${rmrQDiff} points exists between RMR (${safeRmr}) and Barton Q (${safeQ}, equivalent to RMR ≈ ${equivalentRmrFromQ}).`,
        detailsFa: `برای دستیابی به طراحی دقیق سیستم نگهداری در روش‌های RMR و Q، هماهنگ‌سازی مقادیر توصیه می‌شود. برای RMR=${safeRmr}، مقدار محتمل Q حدود ${expectedQFromRmr} است.`,
        detailsEn: `To ensure cohesive support system design across RMR and Q methods, parameter alignment is recommended. For RMR=${safeRmr}, probable Q is ~${expectedQFromRmr}.`,
        primaryValueLabel: 'RMR',
        primaryValue: safeRmr,
        conflictingValueLabel: 'Q',
        conflictingValue: safeQ,
        difference: rmrQDiff,
        suggestedAction: {
          labelFa: `تنظیم Q به ${expectedQFromRmr}`,
          labelEn: `Set Q to ${expectedQFromRmr}`,
          actionType: 'sync_q_from_rmr',
          targetValue: expectedQFromRmr,
        },
      });
    }

    // Q vs GSI check (if GSI differs significantly from equivalent GSI from Q)
    if (gsiQDiff >= 35 && !hasRmrQConflict) {
      hasGsiQConflict = true;
      issues.push({
        id: 'gsi-q-critical',
        type: 'gsi_q',
        severity: 'critical',
        titleFa: 'هشدار عدم تطابق شدید شاخص‌های GSI و Q بارتون',
        titleEn: 'Critical Conflict: GSI & Barton Q Mismatch',
        messageFa: `شاخص GSI (${safeGsi}) با شاخص کیفیت Q بارتون (${safeQ}) تطابق ندارد. مقدار Q=${safeQ} معادل GSI حدود ${equivalentGsiFromQ} است (اختلاف: ${gsiQDiff} واحد).`,
        messageEn: `Geotechnical conflict: GSI (${safeGsi}) conflicts with Barton Q (${safeQ}, equivalent GSI ≈ ${equivalentGsiFromQ}, gap: ${gsiQDiff} points).`,
        detailsFa: `در شرایط مهندسی، انتظار می‌رود برای GSI=${safeGsi}، شاخص Q در محدوده ${expectedQFromGsi} باشد.`,
        detailsEn: `For GSI=${safeGsi}, Barton Q is expected to be approximately ${expectedQFromGsi}.`,
        primaryValueLabel: 'GSI',
        primaryValue: safeGsi,
        conflictingValueLabel: 'Q',
        conflictingValue: safeQ,
        difference: gsiQDiff,
        suggestedAction: {
          labelFa: `تطبیق Q بر اساس GSI (${expectedQFromGsi})`,
          labelEn: `Sync Q to GSI (${expectedQFromGsi})`,
          actionType: 'sync_q_from_gsi',
          targetValue: expectedQFromGsi,
        },
      });
    } else if (gsiQDiff >= 25 && !hasRmrQConflict) {
      hasGsiQConflict = true;
      issues.push({
        id: 'gsi-q-warning',
        type: 'gsi_q',
        severity: 'warning',
        titleFa: 'عدم تطابق شاخص GSI و سیستم Q بارتون',
        titleEn: 'Noticeable Discrepancy: GSI vs Barton Q',
        messageFa: `بین شاخص مقاومت GSI (${safeGsi}) و شاخص Q بارتون (${safeQ}) اختلاف ${gsiQDiff} واحدی وجود دارد.`,
        messageEn: `Discrepancy of ${gsiQDiff} points between GSI (${safeGsi}) and Barton Q (${safeQ}).`,
        detailsFa: `برای GSI=${safeGsi}، مقدار متناظر Q حدود ${expectedQFromGsi} برآورد می‌شود.`,
        detailsEn: `For GSI=${safeGsi}, the corresponding Q value is estimated at ~${expectedQFromGsi}.`,
        primaryValueLabel: 'GSI',
        primaryValue: safeGsi,
        conflictingValueLabel: 'Q',
        conflictingValue: safeQ,
        difference: gsiQDiff,
        suggestedAction: {
          labelFa: `تنظیم Q به ${expectedQFromGsi}`,
          labelEn: `Set Q to ${expectedQFromGsi}`,
          actionType: 'sync_q_from_gsi',
          targetValue: expectedQFromGsi,
        },
      });
    }
  }

  const hasConflict = issues.length > 0;
  const hasQConflict = hasRmrQConflict || hasGsiQConflict;
  const severity = issues.some((i) => i.severity === 'critical')
    ? 'critical'
    : issues.length > 0
    ? 'warning'
    : 'none';

  return {
    hasConflict,
    hasRmrGsiConflict,
    hasQConflict,
    hasRmrQConflict,
    hasGsiQConflict,
    severity,
    issues,
    primaryIssue: issues[0] || null,
    rmrGsiDiff,
    rmrQDiff,
    gsiQDiff,
    expectedGsiFromRmr: expectedGsi,
    expectedRmrFromGsi: expectedRmr,
    expectedQFromRmr,
    expectedQFromGsi,
    equivalentRmrFromQ,
    equivalentGsiFromQ,
  };
}
