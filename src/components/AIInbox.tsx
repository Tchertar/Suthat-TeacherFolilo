import React, { useState } from 'react';
import { EvidenceItem, Criterion } from '../types';
import { formatToThaiDate } from '../utils/dateUtils';
import { 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Check, 
  Edit3, 
  ArrowRight, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface AIInboxProps {
  evidenceList: EvidenceItem[];
  criteria: Criterion[];
  onConfirmMapping: (evidenceId: string, mappingId: string, confirmedCriterionId: string) => void;
  onBatchConfirmAll: () => void;
}

export const AIInbox: React.FC<AIInboxProps> = ({
  evidenceList,
  criteria,
  onConfirmMapping,
  onBatchConfirmAll
}) => {
  // Find all evidence mappings that are NOT yet confirmed by user
  const unconfirmedItems: Array<{
    evidence: EvidenceItem;
    mapping: EvidenceItem['criteria_mappings'][0];
  }> = [];

  evidenceList.forEach(ev => {
    ev.criteria_mappings.forEach(map => {
      if (!map.user_confirmed) {
        unconfirmedItems.push({ evidence: ev, mapping: map });
      }
    });
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            AI Inbox & Verification
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            กล่องข้อความ AI รอยืนยันการจับคู่ตัวชี้วัด
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ผลงานที่ AI แนะนำตัวชี้วัดไว้ แต่ยังรอการตรวจทานและยืนยันโดยผู้ใช้ ({unconfirmedItems.length} รายการ)
          </p>
        </div>

        {unconfirmedItems.length > 0 && (
          <button
            onClick={onBatchConfirmAll}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Check className="w-4 h-4" />
            ยืนยันตาม AI แนะนำทั้งหมด
          </button>
        )}
      </div>

      {unconfirmedItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">ไม่มีรายการตกค้างใน AI Inbox</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            ตัวชี้วัดทั้งหมดได้รับการยืนยันโดยคุณเรียบร้อยแล้ว เมื่อคุณบันทึกผลงานใหม่ AI จะส่งคำแนะนำเข้ามาที่นี่
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {unconfirmedItems.map(({ evidence, mapping }) => {
            const criterion = criteria.find(c => c.criterion_id === mapping.criterion_id);

            return (
              <div
                key={mapping.mapping_id}
                className="bg-white rounded-2xl p-6 border border-purple-200 shadow-xs space-y-4 hover:border-purple-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                      {evidence.evidence_id}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatToThaiDate(evidence.start_date)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    ความมั่นใจ {mapping.ai_confidence}%
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {evidence.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {evidence.description || evidence.outcome}
                  </p>
                </div>

                {/* AI Proposed Mapping */}
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1 text-xs">
                    <div className="font-bold text-purple-950">
                      AI เสนอให้เชื่อมโยงกับ: [{criterion?.criterion_code}] {criterion?.criterion_name}
                    </div>
                    <div className="text-purple-800 text-[11px]">
                      <span className="font-semibold">เหตุผล:</span> {mapping.ai_reason}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onConfirmMapping(evidence.evidence_id, mapping.mapping_id, mapping.criterion_id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    ยืนยันตัวชี้วัดนี้
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
