import React, { useState } from 'react';
import { Criterion, EvidenceItem } from '../types';
import { formatToThaiDate } from '../utils/dateUtils';
import { 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Sparkles, 
  FolderOpen, 
  ExternalLink,
  BookOpen,
  ArrowLeft
} from 'lucide-react';

interface CriteriaExplorerProps {
  criteria: Criterion[];
  evidenceList: EvidenceItem[];
  selectedCriterionId?: string;
  onSelectCriterion: (criterionId: string) => void;
  onNavigateAddWithCriterion: (criterionId: string) => void;
}

export const CriteriaExplorer: React.FC<CriteriaExplorerProps> = ({
  criteria,
  evidenceList,
  selectedCriterionId,
  onSelectCriterion,
  onNavigateAddWithCriterion
}) => {
  const [activeAspectFilter, setActiveAspectFilter] = useState<string>('ALL');

  const activeCriterion = selectedCriterionId 
    ? criteria.find(c => c.criterion_id === selectedCriterionId)
    : null;

  const activeEvidences = evidenceList.filter(e => e.status === 'ACTIVE');

  // Filter criteria by aspect
  const filteredCriteria = criteria.filter(c => {
    if (activeAspectFilter === 'ALL') return true;
    return c.aspect === activeAspectFilter;
  });

  const aspects = Array.from(new Set(criteria.map(c => c.aspect)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            ตัวชี้วัด &amp; เกณฑ์การประเมิน (Criteria Manager)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            มาตรฐานตำแหน่งครู 3 ด้าน (15 ตัวชี้วัด) ตาม ว9/2564 และองค์ประกอบการเลื่อนเงินเดือน ว23/2564
          </p>
        </div>
      </div>

      {activeCriterion ? (
        /* Detailed Single Criterion View */
        <div className="space-y-6">
          <button
            onClick={() => onSelectCriterion('')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 p-1"
          >
            <ArrowLeft className="w-4 h-4" /> ย้อนกลับไปดูตัวชี้วัดทั้งหมด
          </button>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                  {activeCriterion.aspect}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-2">
                  ตัวชี้วัดที่ {activeCriterion.criterion_code}: {activeCriterion.criterion_name}
                </h2>
              </div>
              <button
                onClick={() => onNavigateAddWithCriterion(activeCriterion.criterion_id)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                + บันทึกผลงานเชื่อมกับตัวชี้วัดนี้
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
              <span className="font-bold text-slate-800">คำอธิบายตัวชี้วัด (ตามเกณฑ์ ก.ค.ศ.):</span>
              <p>{activeCriterion.criterion_description}</p>
              <div className="text-[11px] text-slate-400 pt-1">
                อ้างอิง: {activeCriterion.official_reference} ({activeCriterion.criteria_scope})
              </div>
            </div>

            {/* Evidences for this criterion */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-slate-900">
                ผลงานและหลักฐานที่เชื่อมโยงกับตัวชี้วัดนี้
              </h3>

              {(() => {
                const linked = activeEvidences.filter(e => 
                  e.criteria_mappings.some(m => m.criterion_id === activeCriterion.criterion_id)
                );

                if (linked.length === 0) {
                  return (
                    <div className="p-8 text-center bg-amber-50/40 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-2">
                      <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                      <div className="font-bold">ยังไม่มีผลงานที่เชื่อมโยงกับตัวชี้วัดนี้ในรอบปัจจุบัน</div>
                      <p className="text-slate-600">
                        คุณสามารถบันทึกกิจกรรม หรือให้ AI วิเคราะห์ผลงานเดิมเพื่อเชื่อมโยงเข้ามาได้
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {linked.map(ev => {
                      const mapInfo = ev.criteria_mappings.find(m => m.criterion_id === activeCriterion.criterion_id);
                      return (
                        <div key={ev.evidence_id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">{ev.title}</span>
                            <span className="text-[10px] text-slate-400">{formatToThaiDate(ev.start_date)}</span>
                          </div>
                          <p className="text-slate-600">{ev.description || ev.outcome}</p>
                          {mapInfo?.ai_reason && (
                            <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                              <span className="font-semibold">ความเกี่ยวข้อง:</span> {mapInfo.ai_reason} ({mapInfo.relation_type})
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      ) : (
        /* Criteria Grid List */
        <div className="space-y-4">
          {/* Aspect Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveAspectFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeAspectFilter === 'ALL'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              ทั้งหมด ({criteria.length})
            </button>
            {aspects.map(aspect => (
              <button
                key={aspect}
                onClick={() => setActiveAspectFilter(aspect)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeAspectFilter === aspect
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {aspect}
              </button>
            ))}
          </div>

          {/* Criteria Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCriteria.map(c => {
              const linkedCount = activeEvidences.filter(e => 
                e.criteria_mappings.some(m => m.criterion_id === c.criterion_id)
              ).length;
              const hasEvidence = linkedCount > 0;

              return (
                <div
                  key={c.criterion_id}
                  onClick={() => onSelectCriterion(c.criterion_id)}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-400 shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                        {c.criterion_code}
                      </span>
                      {hasEvidence ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          มีหลักฐานแล้ว ({linkedCount})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <AlertCircle className="w-3 h-3" />
                          ยังไม่มีหลักฐาน
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                      {c.criterion_name}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {c.criterion_description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>{c.aspect}</span>
                    <span className="text-amber-700 font-semibold group-hover:underline flex items-center gap-0.5">
                      ดูหลักฐาน <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
