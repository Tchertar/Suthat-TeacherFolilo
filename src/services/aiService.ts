import { EvidenceItem, Criterion, UserProfile, PAPlan } from '../types';

export async function analyzeEvidenceWithAI(evidenceData: Partial<EvidenceItem>, profile: UserProfile, activeCriteria: Criterion[]) {
  const res = await fetch('/api/ai/analyze-evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: evidenceData.title,
      description: evidenceData.description,
      activityType: evidenceData.activity_type,
      role: evidenceData.role,
      processText: evidenceData.process,
      output: evidenceData.output,
      outcome: evidenceData.outcome,
      quantitativeResult: evidenceData.quantitative_result,
      qualitativeResult: evidenceData.qualitative_result,
      files: evidenceData.files,
      profile,
      activeCriteria
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'การวิเคราะห์ AI ล้มเหลว');
  }

  const result = await res.json();
  return result.data;
}

export async function summarizeCriterionWithAI(criterion: Criterion, evidenceList: EvidenceItem[], profile: UserProfile) {
  const res = await fetch('/api/ai/summarize-criterion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      criterion,
      evidenceList,
      profile
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'การสร้างบทสรุปตัวชี้วัดล้มเหลว');
  }

  const result = await res.json();
  return result.data;
}

export async function runGapAnalysisWithAI(profile: UserProfile, paPlan: PAPlan, criteria: Criterion[], evidenceList: EvidenceItem[]) {
  const res = await fetch('/api/ai/gap-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile,
      paPlan,
      criteria,
      evidenceList
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'การวิเคราะห์ช่องว่างล้มเหลว');
  }

  const result = await res.json();
  return result.data;
}
