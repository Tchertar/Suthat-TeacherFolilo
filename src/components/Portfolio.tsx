import React, { useState } from 'react';
import { EvidenceItem, Criterion } from '../types';
import { formatToThaiDate } from '../utils/dateUtils';
import { 
  Search, 
  Filter, 
  FileText, 
  ExternalLink, 
  Tag, 
  Calendar, 
  Paperclip, 
  Trash2, 
  Sparkles,
  ChevronDown,
  LayoutGrid,
  List
} from 'lucide-react';

interface PortfolioProps {
  evidenceList: EvidenceItem[];
  criteria: Criterion[];
  fiscalYear: string;
  onSelectEvidence: (evidence: EvidenceItem) => void;
  onDeleteEvidence: (evidenceId: string) => void;
  onNavigateAdd: () => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({
  evidenceList,
  criteria,
  fiscalYear,
  onSelectEvidence,
  onDeleteEvidence,
  onNavigateAdd
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivityType, setSelectedActivityType] = useState<string>('ALL');
  const [selectedCriterionFilter, setSelectedCriterionFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter evidence
  const activeEvidences = evidenceList.filter(e => e.status === 'ACTIVE');

  const filtered = activeEvidences.filter(item => {
    // Search keyword
    const matchSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (item.evidence_id.toLowerCase().includes(searchTerm.toLowerCase()));

    // Activity type filter
    const matchType = selectedActivityType === 'ALL' || item.activity_type === selectedActivityType;

    // Criterion filter
    const matchCriterion = 
      selectedCriterionFilter === 'ALL' || 
      item.criteria_mappings.some(m => m.criterion_id === selectedCriterionFilter);

    return matchSearch && matchType && matchCriterion;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            คลังผลงานและหลักฐานทั้งหมด (Portfolio)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            รวบรวม {activeEvidences.length} รายการผลงานที่บันทึกไว้ตลอดปีการศึกษา พร้อมเอกสารหลักฐานและตัวชี้วัดที่เชื่อมโยง
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={onNavigateAdd}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            + บันทึกผลงานใหม่
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="ค้นหาชื่อผลงาน, รหัส, แท็ก, ข้อความ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Activity Type select */}
          <div>
            <select
              value={selectedActivityType}
              onChange={(e) => setSelectedActivityType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">ทุกประเภทกิจกรรม</option>
              {Array.from(new Set(activeEvidences.map(e => e.activity_type))).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Criterion Filter */}
          <div>
            <select
              value={selectedCriterionFilter}
              onChange={(e) => setSelectedCriterionFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">ทุกตัวชี้วัด</option>
              {criteria.map(c => (
                <option key={c.criterion_id} value={c.criterion_id}>
                  [{c.criterion_code}] {c.criterion_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-slate-700">ไม่พบผลงานที่ตรงกับเงื่อนไขการค้นหา</div>
          <p className="text-xs text-slate-400">ลองล้างคำค้นหาหรือเปลี่ยนตัวกรองประเภทกิจกรรม</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(item => {
            const primaryMapping = item.criteria_mappings.find(m => m.relation_type === 'Primary');
            const primaryCriterion = criteria.find(c => c.criterion_id === primaryMapping?.criterion_id);

            return (
              <div 
                key={item.evidence_id} 
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                onClick={() => onSelectEvidence(item)}
              >
                <div className="space-y-3">
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                      {item.evidence_id}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatToThaiDate(item.start_date)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  {/* Description or Outcome snippet */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {item.description || item.outcome || 'ไม่มีคำอธิบาย'}
                  </p>

                  {/* Linked Primary Criterion */}
                  {primaryCriterion && (
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700">
                      <span className="font-bold text-amber-700">ตัวชี้วัดหลัก:</span> [{primaryCriterion.criterion_code}] {primaryCriterion.criterion_name}
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((t, idx) => (
                        <span key={idx} className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{item.files?.length || 0} ไฟล์</span>
                  </div>
                  <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {item.activity_type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {filtered.map(item => (
            <div 
              key={item.evidence_id}
              className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              onClick={() => onSelectEvidence(item)}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {item.evidence_id}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatToThaiDate(item.start_date)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded">
                    {item.activity_type}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  {item.description || item.outcome}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5" /> {item.files?.length || 0}
                </span>
                <span className="text-amber-700 font-semibold hover:underline">
                  ดูรายละเอียด &gt;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
