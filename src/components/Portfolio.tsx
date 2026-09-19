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
import { motion } from 'motion/react';

interface PortfolioProps {
  evidenceList: EvidenceItem[];
  criteria: Criterion[];
  fiscalYear: string;
  onSelectEvidence: (evidence: EvidenceItem) => void;
  onDeleteEvidence: (evidenceId: string) => void;
  onNavigateAdd: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }
  }
};

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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header bar (Apple Clean Styling) */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-semibold text-[#1d1d1f] tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-black/[0.04] text-[#1d1d1f] flex items-center justify-center font-semibold text-base">
              <FolderOpen className="w-4 h-4 text-[#0071e3]" />
            </span>
            คลังผลงานและหลักฐานทั้งหมด (Portfolio)
          </h1>
          <p className="text-xs text-[#86868b] mt-1">
            รวบรวม {activeEvidences.length} รายการผลงานที่บันทึกไว้ตลอดปีงบประมาณ {fiscalYear} พร้อมเอกสารหลักฐานและตัวชี้วัดที่เชื่อมโยง
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Segmented control for Grid/List */}
          <div className="flex items-center bg-[#f0f0f2] p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white shadow-xs text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            onClick={onNavigateAdd}
            className="px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs rounded-full shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            บันทึกผลงานใหม่
          </motion.button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-3xl p-4.5 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="ค้นหาชื่อผลงาน, รหัส, แท็ก..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-black/10 text-[#1d1d1f] focus:outline-hidden focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] bg-[#fbfbfd]"
            />
          </div>

          {/* Activity Type select */}
          <div>
            <select
              value={selectedActivityType}
              onChange={(e) => setSelectedActivityType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 text-[#1d1d1f] focus:outline-hidden focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] bg-[#fbfbfd]"
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
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 text-[#1d1d1f] focus:outline-hidden focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] bg-[#fbfbfd]"
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
      </motion.div>

      {/* Content Rendering */}
      {filtered.length === 0 ? (
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-3xl p-12 border border-black/[0.06] text-center space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
        >
          <div className="w-14 h-14 rounded-full bg-black/[0.04] text-[#1d1d1f] flex items-center justify-center mx-auto">
            <FolderOpen className="w-6 h-6 text-[#86868b]" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-semibold text-[#1d1d1f]">
              {activeEvidences.length === 0 ? 'ยังไม่มีผลงานบันทึกไว้' : 'ไม่พบผลงานที่ตรงกับเงื่อนไขการค้นหา'}
            </h3>
            <p className="text-xs text-[#86868b] leading-relaxed">
              {activeEvidences.length === 0 
                ? 'ระบบพร้อมให้คุณครูบันทึกผลงานจริงของปีการศึกษาปัจจุบันได้ทันที สามารถอัปโหลดไฟล์ รูปภาพ หรือพิมพ์บันทึกกิจกรรม'
                : 'ลองล้างคำค้นหาหรือเปลี่ยนตัวกรองประเภทกิจกรรมเพื่อดูรายการผลงานทั้งหมด'}
            </p>
          </div>
          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              onClick={onNavigateAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              บันทึกผลงานแรก
            </motion.button>
          </div>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filtered.map(item => {
            const primaryMapping = item.criteria_mappings.find(m => m.relation_type === 'Primary');
            const primaryCriterion = criteria.find(c => c.criterion_id === primaryMapping?.criterion_id);

            return (
              <motion.div 
                key={item.evidence_id} 
                variants={itemVariants}
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className="bg-white rounded-3xl p-5 border border-black/[0.06] hover:border-black/15 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all flex flex-col justify-between group cursor-pointer"
                onClick={() => onSelectEvidence(item)}
              >
                <div className="space-y-3">
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[#515154] bg-black/[0.04] px-2.5 py-0.5 rounded-md">
                      {item.evidence_id}
                    </span>
                    <span className="text-xs text-[#86868b] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#86868b]" />
                      {formatToThaiDate(item.start_date)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  {/* Description or Outcome snippet */}
                  <p className="text-xs text-[#86868b] line-clamp-3 leading-relaxed">
                    {item.description || item.outcome || 'ไม่มีคำอธิบาย'}
                  </p>

                  {/* Linked Primary Criterion */}
                  {primaryCriterion && (
                    <div className="p-2.5 rounded-2xl bg-[#fbfbfd] border border-black/[0.05] text-[11px] text-[#515154]">
                      <span className="font-semibold text-[#1d1d1f]">ตัวชี้วัดหลัก:</span> [{primaryCriterion.criterion_code}] {primaryCriterion.criterion_name}
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((t, idx) => (
                        <span key={idx} className="text-[10px] text-[#515154] bg-black/[0.03] px-2 py-0.5 rounded-full border border-black/[0.04]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="pt-3.5 mt-3.5 border-t border-black/[0.04] flex items-center justify-between text-xs text-[#86868b]">
                  <div className="flex items-center gap-1 text-[#515154]">
                    <Paperclip className="w-3.5 h-3.5 text-[#0071e3]" />
                    <span>{item.files?.length || 0} ไฟล์</span>
                  </div>
                  <span className="font-medium text-[#1d1d1f] bg-black/[0.04] px-2 py-0.5 rounded-md">
                    {item.activity_type}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        /* List Mode */
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-3xl border border-black/[0.06] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] divide-y divide-black/[0.04]"
        >
          {filtered.map(item => (
            <motion.div 
              key={item.evidence_id}
              whileHover={{ backgroundColor: 'rgba(0,0,0,0.015)' }}
              className="p-4.5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              onClick={() => onSelectEvidence(item)}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#515154] bg-black/[0.04] px-2 py-0.5 rounded-md">
                    {item.evidence_id}
                  </span>
                  <span className="text-xs text-[#86868b]">
                    {formatToThaiDate(item.start_date)}
                  </span>
                  <span className="text-xs text-[#1d1d1f] font-medium px-2 py-0.5 bg-black/[0.04] rounded-md">
                    {item.activity_type}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#1d1d1f] truncate">
                  {item.title}
                </h3>
                <p className="text-xs text-[#86868b] truncate">
                  {item.description || item.outcome}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs text-[#86868b]">
                <span className="inline-flex items-center gap-1 text-[#515154]">
                  <Paperclip className="w-3.5 h-3.5 text-[#0071e3]" /> {item.files?.length || 0}
                </span>
                <span className="text-[#0071e3] font-medium hover:underline">
                  ดูรายละเอียด →
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
