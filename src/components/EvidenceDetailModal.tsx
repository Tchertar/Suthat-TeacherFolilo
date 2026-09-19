import React, { useState } from 'react';
import { EvidenceItem, Criterion } from '../types';
import { formatToThaiDate } from '../utils/dateUtils';
import { 
  X, 
  ExternalLink, 
  Calendar, 
  Tag, 
  FileText, 
  Sparkles, 
  Paperclip, 
  CheckCircle2, 
  Download,
  Trash2,
  Edit3
} from 'lucide-react';

interface EvidenceDetailModalProps {
  evidence: EvidenceItem | null;
  criteria: Criterion[];
  onClose: () => void;
  onDelete: (evidenceId: string) => void;
}

export const EvidenceDetailModal: React.FC<EvidenceDetailModalProps> = ({
  evidence,
  criteria,
  onClose,
  onDelete
}) => {
  if (!evidence) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top meta */}
        <div className="space-y-1.5 pr-8">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
              {evidence.evidence_id}
            </span>
            <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded">
              {evidence.activity_type}
            </span>
            <span className="text-xs text-slate-400">
              {formatToThaiDate(evidence.start_date)}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {evidence.title}
          </h2>
        </div>

        {/* Linked Criteria Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            ตัวชี้วัดที่เชื่อมโยง
          </h4>
          <div className="space-y-2">
            {evidence.criteria_mappings.map(map => {
              const crit = criteria.find(c => c.criterion_id === map.criterion_id);
              return (
                <div key={map.mapping_id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-amber-950">
                    <span>[{crit?.criterion_code || map.criterion_id}] {crit?.criterion_name || map.criterion_id}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-semibold">
                      {map.relation_type === 'Primary' ? 'ตัวชี้วัดหลัก' : 'ตัวชี้วัดสนับสนุน'} ({map.ai_confidence}%)
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{map.ai_reason}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Description & Results */}
        <div className="space-y-3 text-xs text-slate-700">
          <div>
            <span className="font-bold text-slate-900 block mb-1">คำอธิบายรายละเอียด:</span>
            <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              {evidence.description || 'ไม่มีข้อมูล'}
            </p>
          </div>

          {evidence.process && (
            <div>
              <span className="font-bold text-slate-900 block mb-1">สิ่งที่ดำเนินการ (Process):</span>
              <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-line">
                {evidence.process}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {evidence.output && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">ผลผลิต (Output):</span>
                <span>{evidence.output}</span>
              </div>
            )}
            {evidence.outcome && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">ผลลัพธ์ (Outcome):</span>
                <span>{evidence.outcome}</span>
              </div>
            )}
          </div>

          {(evidence.quantitative_result || evidence.qualitative_result) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {evidence.quantitative_result && (
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 text-emerald-950">
                  <span className="font-bold block mb-0.5">ข้อมูลเชิงปริมาณ:</span>
                  <span>{evidence.quantitative_result}</span>
                </div>
              )}
              {evidence.qualitative_result && (
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-200 text-blue-950">
                  <span className="font-bold block mb-0.5">ข้อมูลเชิงคุณภาพ:</span>
                  <span>{evidence.qualitative_result}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Attached Files List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5" />
            เอกสารหลักฐานแนบ ({evidence.files?.length || 0} ไฟล์)
          </h4>

          {evidence.files && evidence.files.length > 0 ? (
            <div className="space-y-1.5">
              {evidence.files.map(f => (
                <div key={f.file_id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-medium text-slate-800 truncate">{f.file_name}</span>
                    <span className="text-[10px] text-slate-400">({f.file_category})</span>
                  </div>

                  {f.drive_url ? (
                    <a
                      href={f.drive_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:text-amber-700 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1"
                    >
                      เปิดดูใน Drive <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400 text-[11px]">บันทึกในระบบแล้ว</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">ไม่มีไฟล์แนบในรายการนี้</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={() => {
              if (confirm('คุณต้องการลบผลงานนี้ใช่หรือไม่?')) {
                onDelete(evidence.evidence_id);
                onClose();
              }
            }}
            className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            ลบผลงาน
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
