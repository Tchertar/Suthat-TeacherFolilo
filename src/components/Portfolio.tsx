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
  List,
  FolderOpen,
  Plus
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
    const matchSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (item.evidence_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchType = selectedActivityType === 'ALL' || item.activity_type === selectedActivityType;

    const matchCriterion = 
      selectedCriterionFilter === 'ALL' || 
      item.criteria_mappings.some(m => m.criterion_id === selectedCriterionFilter);

    return matchSearch && matchType && matchCriterion;
  });

  return (
    <div className="space-y-6">
      {/* Header bar (White, Purple, Gold Tech Styling) */}
      <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-purple-950 tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-base border border-purple-200">
              <FolderOpen className="w-4.5 h-4.5 text-purple-800" />
            </span>
            คลังผลงานและหลักฐานทั้งหมด (Portfolio)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            รวบรวม {activeEvidences.length} รายการผลงานที่บันทึกไว้ตลอดปีงบประมาณ {fiscalYear} พร้อมเอกสารหลักฐานและตัวชี้วัดที่เชื่อมโยง
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-purple-50 p-1 rounded-xl border border-purple-200/80">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-purple-950 font-bold' : 'text-purple-600 hover:text-purple-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white shadow-xs text-purple-950 font-bold' : 'text-purple-600 hover:text-purple-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={onNavigateAdd}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + บันทึกผลงานใหม่
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="ค้นหาชื่อผลงาน, รหัส, แท็ก, ข้อความ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-purple-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-300 focus:border-purple-600"
            />
          </div>

          {/* Activity Type select */}
          <div>
            <select
              value={selectedActivityType}
              onChange={(e) => setSelectedActivityType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-300 focus:border-purple-600"
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
              className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-300 focus:border-purple-600"
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
        <div className="bg-white rounded-2xl p-12 border border-purple-100 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-600 flex items-center justify-center mx-auto border border-amber-300/40">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-purple-950">
              {activeEvidences.length === 0 ? 'ยังไม่มีผลงานบันทึกไว้ (ลบข้อมูลจำลองแล้ว)' : 'ไม่พบผลงานที่ตรงกับเงื่อนไขการค้นหา'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeEvidences.length === 0 
                ? 'ระบบพร้อมให้คุณครูบันทึกผลงานจริงของปีการศึกษาปัจจุบันได้ทันที สามารถอัปโหลดไฟล์ รูปภาพ หรือพิมพ์บันทึกกิจกรรม'
                : 'ลองล้างคำค้นหาหรือเปลี่ยนตัวกรองประเภทกิจกรรมเพื่อดูรายการผลงานทั้งหมด'}
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onNavigateAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              บันทึกผลงานแรก
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(item => {
            const primaryMapping = item.criteria_mappings.find(m => m.relation_type === 'Primary');
            const primaryCriterion = criteria.find(c => c.criterion_id === primaryMapping?.criterion_id);

            return (
              <div 
                key={item.evidence_id} 
                className="bg-white rounded-2xl p-5 border border-purple-100 hover:border-amber-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                onClick={() => onSelectEvidence(item)}
              >
                <div className="space-y-3">
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-md border border-purple-200">
                      {item.evidence_id}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-purple-400" />
                      {formatToThaiDate(item.start_date)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-900 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  {/* Description or Outcome snippet */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {item.description || item.outcome || 'ไม่มีคำอธิบาย'}
                  </p>

                  {/* Linked Primary Criterion */}
                  {primaryCriterion && (
                    <div className="p-2 rounded-xl bg-purple-50/50 border border-purple-100 text-[11px] text-slate-700">
                      <span className="font-bold text-amber-700">ตัวชี้วัดหลัก:</span> [{primaryCriterion.criterion_code}] {primaryCriterion.criterion_name}
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((t, idx) => (
                        <span key={idx} className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Paperclip className="w-3.5 h-3.5 text-purple-500" />
                    <span>{item.files?.length || 0} ไฟล์</span>
                  </div>
                  <span className="font-semibold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                    {item.activity_type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode */
        <div className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-xs divide-y divide-purple-50">
          {filtered.map(item => (
            <div 
              key={item.evidence_id}
              className="p-4 hover:bg-purple-50/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              onClick={() => onSelectEvidence(item)}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                    {item.evidence_id}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatToThaiDate(item.start_date)}
                  </span>
                  <span className="text-xs text-purple-900 font-semibold px-2 py-0.5 bg-purple-50 rounded border border-purple-100">
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
                <span className="inline-flex items-center gap-1 text-purple-700">
                  <Paperclip className="w-3.5 h-3.5" /> {item.files?.length || 0}
                </span>
                <span className="text-amber-700 font-bold hover:underline">
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
