import React, { useState } from 'react';
import { EvidenceItem, Criterion, UserProfile } from '../types';
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
  Plus,
  Edit3,
  Layers,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';

interface PortfolioProps {
  evidenceList: EvidenceItem[];
  criteria: Criterion[];
  profile: UserProfile;
  fiscalYear: string;
  onSelectEvidence: (evidence: EvidenceItem) => void;
  onEditEvidence: (evidence: EvidenceItem) => void;
  onDeleteEvidence: (evidenceId: string) => void;
  onNavigateAdd: () => void;
  onBatchAutoMap?: () => Promise<void>;
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
  profile,
  fiscalYear,
  onSelectEvidence,
  onEditEvidence,
  onDeleteEvidence,
  onNavigateAdd,
  onBatchAutoMap
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivityType, setSelectedActivityType] = useState<string>('ALL');
  const [selectedCriterionFilter, setSelectedCriterionFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isBatchMapping, setIsBatchMapping] = useState(false);
  const [batchNotice, setBatchNotice] = useState<string | null>(null);

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

  const handleRunBatchAutoMap = async () => {
    if (!onBatchAutoMap) return;
    setIsBatchMapping(true);
    setBatchNotice(null);
    try {
      await onBatchAutoMap();
      setBatchNotice('จัดผลงานทั้งหมดเข้าตัวชี้วัดที่เหมาะสมเรียบร้อยแล้ว');
      setTimeout(() => setBatchNotice(null), 5000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsBatchMapping(false);
    }
  };

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
          {batchNotice && (
            <div className="mt-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {batchNotice}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Batch Auto Map button */}
          {onBatchAutoMap && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRunBatchAutoMap}
              disabled={isBatchMapping}
              className="px-4 py-2.5 bg-[#f0f4fa] hover:bg-[#e4edfa] text-[#0071e3] font-medium text-xs rounded-full border border-[#0071e3]/20 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="ให้ AI วิเคราะห์และจัดผลงานทั้งหมดเข้าตัวชี้วัดที่เหมาะสมอัตโนมัติ"
            >
              {isBatchMapping ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  กำลังจัดตัวชี้วัด...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
                  จัดตัวชี้วัดอัตโนมัติ (AI Auto-Map)
                </>
              )}
            </motion.button>
          )}

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
            const primaryMapping = item.criteria_mappings?.find(m => m.relation_type === 'Primary');
            const primaryCriterion = criteria.find(c => c.criterion_id === primaryMapping?.criterion_id);
            const otherMappings = item.criteria_mappings?.filter(m => m.relation_type !== 'Primary') || [];

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

                  {/* Multi-Criteria Badges */}
                  <div className="space-y-1.5 pt-1">
                    {primaryCriterion && (
                      <div className="p-2 rounded-xl bg-[#0071e3]/5 border border-[#0071e3]/15 text-[11px] text-[#1d1d1f] flex items-center gap-1.5">
                        <span className="font-semibold text-[#0071e3]">★ หลัก:</span>
                        <span className="font-medium truncate">[{primaryCriterion.criterion_code}] {primaryCriterion.criterion_name}</span>
                      </div>
                    )}
                    
                    {otherMappings.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[10px] text-[#86868b] font-medium">ร่วมกับ:</span>
                        {otherMappings.map(m => {
                          const cObj = criteria.find(c => c.criterion_id === m.criterion_id);
                          return (
                            <span 
                              key={m.criterion_id}
                              title={cObj?.criterion_name || m.criterion_id}
                              className="text-[10px] bg-black/[0.04] text-[#515154] px-2 py-0.5 rounded-md border border-black/[0.04]"
                            >
                              {cObj?.criterion_code || m.criterion_id}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

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

                {/* Card footer & Edit button */}
                <div className="pt-3.5 mt-3.5 border-t border-black/[0.04] flex items-center justify-between text-xs text-[#86868b]">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[#515154]">
                      <Paperclip className="w-3.5 h-3.5 text-[#0071e3]" />
                      <span>{item.files?.length || 0} ไฟล์</span>
                    </div>
                    <span className="font-medium text-[#1d1d1f] bg-black/[0.04] px-2 py-0.5 rounded-md text-[11px]">
                      {item.activity_type}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditEvidence(item);
                    }}
                    className="px-2.5 py-1 bg-black/[0.04] hover:bg-[#0071e3] hover:text-white text-[#1d1d1f] font-medium text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    แก้ไข / เพิ่มหลักฐาน
                  </button>
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
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#515154] bg-black/[0.04] px-2 py-0.5 rounded-md">
                    {item.evidence_id}
                  </span>
                  <span className="text-xs text-[#86868b]">
                    {formatToThaiDate(item.start_date)}
                  </span>
                  <span className="text-xs text-[#1d1d1f] font-medium px-2 py-0.5 bg-black/[0.04] rounded-md">
                    {item.activity_type}
                  </span>
                  {/* Multi-criteria pills in list */}
                  {item.criteria_mappings && item.criteria_mappings.length > 0 && (
                    <div className="flex items-center gap-1">
                      {item.criteria_mappings.map(m => {
                        const isPri = m.relation_type === 'Primary';
                        const cObj = criteria.find(c => c.criterion_id === m.criterion_id);
                        return (
                          <span
                            key={m.criterion_id}
                            className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                              isPri ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'bg-black/[0.04] text-[#86868b]'
                            }`}
                          >
                            {cObj?.criterion_code || m.criterion_id}
                          </span>
                        );
                      })}
                    </div>
                  )}
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

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditEvidence(item);
                  }}
                  className="px-2.5 py-1.5 bg-[#f0f0f2] hover:bg-[#0071e3] hover:text-white text-[#1d1d1f] font-medium text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  แก้ไข
                </button>

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
