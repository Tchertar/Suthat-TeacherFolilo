import React from 'react';
import { 
  EvidenceItem, 
  Criterion, 
  UserProfile, 
  PAPlan 
} from '../types';
import { formatToThaiDate } from '../utils/dateUtils';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  Plus, 
  FolderCheck, 
  FileCheck, 
  ChevronRight, 
  Info, 
  User, 
  ShieldCheck, 
  ArrowUpRight,
  Lightbulb,
  Compass,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  profile: UserProfile;
  paPlan: PAPlan;
  criteria: Criterion[];
  evidenceList: EvidenceItem[];
  onNavigateTab: (tab: string) => void;
  onSelectCriterion: (criterionId: string) => void;
  fiscalYear: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(3px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
};

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  paPlan,
  criteria,
  evidenceList,
  onNavigateTab,
  onSelectCriterion,
  fiscalYear
}) => {
  // Filter active evidence
  const activeEvidences = evidenceList.filter(e => e.status === 'ACTIVE');
  const allFilesCount = activeEvidences.reduce((acc, curr) => acc + (curr.files?.length || 0), 0);

  // Criteria coverage calculation
  const totalCriteriaCount = criteria.length;
  const coveredCriteriaIds = new Set<string>();
  const readyCriteriaIds = new Set<string>();
  const partialCriteriaIds = new Set<string>();

  activeEvidences.forEach(ev => {
    ev.criteria_mappings.forEach(map => {
      coveredCriteriaIds.add(map.criterion_id);
      const hasFiles = ev.files && ev.files.length > 0;
      const hasOutcome = !!ev.outcome || !!ev.quantitative_result;
      if (hasFiles && hasOutcome && map.user_confirmed) {
        readyCriteriaIds.add(map.criterion_id);
      } else {
        partialCriteriaIds.add(map.criterion_id);
      }
    });
  });

  const uncoveredCriteria = criteria.filter(c => !coveredCriteriaIds.has(c.criterion_id));
  const coveredCount = coveredCriteriaIds.size;
  const readyCount = readyCriteriaIds.size;
  const emptyCount = totalCriteriaCount - coveredCount;

  // Evidence Readiness Progress
  const readinessPercent = Math.min(100, Math.round((readyCount * 1.0 + (coveredCount - readyCount) * 0.5) / (totalCriteriaCount || 1) * 100));

  // PA Specific readiness (15 PA criteria)
  const paCriteria = criteria.filter(c => c.aspect.startsWith('ด้านที่') || c.criterion_id === 'PA-CHALLENGE');
  const coveredPACount = paCriteria.filter(c => coveredCriteriaIds.has(c.criterion_id)).length;
  const paPercent = Math.round((coveredPACount / (paCriteria.length || 1)) * 100);

  // Unconfirmed AI suggestions
  const unconfirmedCount = activeEvidences.reduce((sum, ev) => {
    return sum + (ev.criteria_mappings?.filter(m => !m.user_confirmed).length || 0);
  }, 0);

  // Calculate days left in Thai fiscal cycle (Oct 1 to Sep 30)
  const now = new Date();
  const sep30 = new Date(now.getFullYear(), 8, 30);
  if (now > sep30) {
    sep30.setFullYear(sep30.getFullYear() + 1);
  }
  const diffTime = Math.abs(sep30.getTime() - now.getTime());
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-7"
    >
      {/* 1. Hero Showcase - Apple Clean Design */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-3xl p-6 sm:p-9 border border-black/[0.06] shadow-[0_2px_16px_rgba(0,0,0,0.03)] relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            {/* Teacher Avatar */}
            <motion.div 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              onClick={() => onNavigateTab('profile')}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-black/[0.08] bg-[#f5f5f7] shrink-0 shadow-xs cursor-pointer group relative"
              title="คลิกเพื่อดูและแก้ไขโปรไฟล์ครู"
            >
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-semibold text-[#1d1d1f] text-xl">
                  {profile.name ? profile.name.slice(0, 2) : 'ครู'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-medium">
                แก้ไข
              </div>
            </motion.div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.04] text-[#515154] text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0071e3]" />
                <span>ระบบประเมิน PA &amp; เลื่อนขั้นเงินเดือนข้าราชการครู</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] flex flex-wrap items-center gap-2">
                <span>{profile.name}</span>
                <button
                  onClick={() => onNavigateTab('profile')}
                  className="text-xs font-medium text-[#0071e3] hover:underline cursor-pointer"
                >
                  แก้ไขข้อมูล ✎
                </button>
              </h1>
              <p className="text-[#86868b] text-xs sm:text-sm max-w-2xl leading-relaxed">
                {profile.position} ({profile.currentRank}) • {profile.school} • {profile.affiliation}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0">
            <div className="bg-[#fbfbfd] border border-black/[0.06] px-4 py-2.5 rounded-2xl text-center min-w-[100px]">
              <div className="text-[11px] text-[#86868b] font-medium">
                ปีงบประมาณ
              </div>
              <div className="text-base font-semibold text-[#1d1d1f]">
                {fiscalYear}
              </div>
            </div>

            <div className="bg-[#fbfbfd] border border-black/[0.06] px-4 py-2.5 rounded-2xl text-center min-w-[100px]">
              <div className="text-[11px] text-[#86868b] font-medium">
                สิ้นสุดรอบ PA
              </div>
              <div className="text-base font-semibold text-[#1d1d1f]">
                อีก {daysLeft} วัน
              </div>
            </div>

            <motion.button
              id="dashboard-quick-add-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              onClick={() => onNavigateTab('add-evidence')}
              className="px-5 py-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs sm:text-sm transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>บันทึกผลงานใหม่</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 2. Key Metrics Summary Grid - Apple Bento Card Aesthetics */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)]"
        >
          <div className="flex items-center justify-between text-[#86868b] mb-2">
            <span className="text-xs font-medium">ผลงานทั้งหมด</span>
            <FolderCheck className="w-4.5 h-4.5 text-[#0071e3]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">{activeEvidences.length}</div>
          <div className="text-[11px] text-[#86868b] mt-1 truncate">
            {activeEvidences.length === 0 ? 'พร้อมบันทึกผลงาน' : 'รายการที่จัดเก็บ'}
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)]"
        >
          <div className="flex items-center justify-between text-[#86868b] mb-2">
            <span className="text-xs font-medium">ไฟล์หลักฐาน</span>
            <FileCheck className="w-4.5 h-4.5 text-[#34c759]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">{allFilesCount}</div>
          <div className="text-[11px] text-[#86868b] mt-1 truncate">ไฟล์เอกสาร &amp; รูปภาพ</div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)]"
        >
          <div className="flex items-center justify-between text-[#86868b] mb-2">
            <span className="text-xs font-medium">ความครอบคลุม</span>
            <CheckCircle2 className="w-4.5 h-4.5 text-[#ff9500]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">{coveredCount} <span className="text-lg font-normal text-[#86868b]">/ {totalCriteriaCount}</span></div>
          <div className="text-[11px] text-[#86868b] mt-1 truncate">ตัวชี้วัดที่มีหลักฐาน</div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)]"
        >
          <div className="flex items-center justify-between text-[#86868b] mb-2">
            <span className="text-xs font-medium">AI Inbox</span>
            <Sparkles className="w-4.5 h-4.5 text-[#5856d6]" />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-[#5856d6]">{unconfirmedCount}</div>
          <div className="text-[11px] text-[#86868b] mt-1 truncate">
            {unconfirmedCount > 0 ? (
              <button onClick={() => onNavigateTab('ai-inbox')} className="text-[#0071e3] hover:underline font-medium">
                ตรวจยืนยันเลย →
              </button>
            ) : (
              'ยืนยันครบถ้วนแล้ว'
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* 3. Evidence Readiness Bar */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-semibold text-[#1d1d1f] tracking-tight">
                ความพร้อมของหลักฐาน (Evidence Readiness)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0071e3]/10 text-[#0071e3]">
                {readinessPercent}%
              </span>
            </div>
            <p className="text-xs text-[#86868b] mt-0.5">
              คำนวณจากความครบถ้วนของตัวชี้วัด ไฟล์เอกสารแนบ และผลลัพธ์เชิงประจักษ์
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#86868b] bg-[#fbfbfd] px-3 py-1.5 rounded-full border border-black/[0.05]">
            <Info className="w-3.5 h-3.5 text-[#86868b] shrink-0" />
            <span>เกณฑ์ประเมินจริงเป็นไปตามดุลยพินิจของคณะกรรมการ</span>
          </div>
        </div>

        {/* Minimalist Apple Progress Track */}
        <div className="w-full bg-[#f0f0f2] rounded-full h-2.5 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(readinessPercent, 3)}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-[#0071e3] rounded-full"
          />
        </div>

        {/* Breakdown sub-metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fbfbfd] border border-black/[0.05]">
            <span className="text-[#515154] font-normal">ความพร้อม PA (ว9/2564):</span>
            <span className="font-semibold text-[#1d1d1f]">{paPercent}% ({coveredPACount}/{paCriteria.length})</span>
          </div>
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fbfbfd] border border-black/[0.05]">
            <span className="text-[#515154] font-normal">ประเมินเลื่อนเงินเดือน รอบ 1:</span>
            <span className="font-semibold text-[#1d1d1f]">พร้อม {Math.min(100, Math.round(paPercent * 0.9))}%</span>
          </div>
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fbfbfd] border border-black/[0.05]">
            <span className="text-[#515154] font-normal">ประเด็นท้าทาย (Challenge):</span>
            <span className="font-semibold text-[#ff9500]">{paPlan.challenge_progress_percent || 65}%</span>
          </div>
        </div>
      </motion.div>

      {/* 4. Gap Analysis & Next Best Action Section */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left 2 Cols: Missing Indicators */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-3.5">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#0071e3]" />
              <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight">
                ตัวชี้วัดที่แนะนำให้สะสมผลงานเพิ่มเติม
              </h2>
            </div>
            <span className="text-xs text-[#86868b] font-medium bg-black/[0.04] px-2.5 py-0.5 rounded-full">
              ขาดอีก {emptyCount} ตัวชี้วัด
            </span>
          </div>

          {uncoveredCriteria.length === 0 ? (
            <div className="p-8 text-center bg-[#fbfbfd] rounded-2xl border border-black/[0.06]">
              <CheckCircle2 className="w-8 h-8 text-[#34c759] mx-auto mb-2" />
              <div className="text-sm font-semibold text-[#1d1d1f]">คุณมีหลักฐานครอบคลุมครบทุกตัวชี้วัดแล้ว</div>
              <p className="text-xs text-[#86868b] mt-1">สามารถตรวจสอบความสมบูรณ์ของเอกสารแนบและสรุปรายงานในหมวดหมู่รายงานได้</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {uncoveredCriteria.slice(0, 5).map((c) => (
                <motion.div 
                  key={c.criterion_id}
                  whileHover={{ x: 2 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  className="p-3.5 rounded-2xl border border-black/[0.06] hover:bg-black/[0.02] transition-colors flex items-start justify-between gap-3 group cursor-pointer"
                  onClick={() => onSelectCriterion(c.criterion_id)}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-black/[0.05] text-[#1d1d1f] font-semibold text-xs">
                        {c.criterion_code}
                      </span>
                      <span className="text-xs font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">
                        {c.criterion_name}
                      </span>
                    </div>
                    <p className="text-xs text-[#86868b] line-clamp-1">
                      {c.criterion_description}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCriterion(c.criterion_id);
                    }}
                    className="px-3 py-1 bg-black/[0.04] hover:bg-[#0071e3] hover:text-white text-[#1d1d1f] rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer"
                  >
                    ดูแนวทาง
                  </button>
                </motion.div>
              ))}
              {uncoveredCriteria.length > 5 && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => onNavigateTab('criteria')}
                    className="text-xs font-medium text-[#0071e3] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    ดูตัวชี้วัดที่ยังขาดทั้งหมด ({uncoveredCriteria.length} รายการ) <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: AI Opportunity Finder */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-2 text-[#1d1d1f] font-semibold text-sm border-b border-black/[0.06] pb-3.5">
            <Lightbulb className="w-4.5 h-4.5 text-[#ff9500]" />
            <span className="tracking-tight">โอกาสการบันทึกงาน (AI Suggestion)</span>
          </div>

          <p className="text-xs text-[#86868b] leading-relaxed">
            กิจกรรมสอดคล้องกับวิชา <strong className="text-[#1d1d1f]">{profile.teachingSubjects[0] || 'คอมพิวเตอร์'}</strong>:
          </p>

          <div className="space-y-2.5">
            <div className="p-3 bg-[#fbfbfd] rounded-2xl border border-black/[0.05] text-xs space-y-1">
              <div className="font-semibold text-[#1d1d1f] flex items-center justify-between">
                <span>แผน Active Learning</span>
                <span className="text-[10px] text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.5 rounded-full font-medium">1.2, 1.3</span>
              </div>
              <p className="text-[#86868b] text-[11px] leading-relaxed">
                บันทึกแผนการสอน Coding หรือโครงงานพร้อมภาพถ่ายสะท้อนการมีส่วนร่วม
              </p>
            </div>

            <div className="p-3 bg-[#fbfbfd] rounded-2xl border border-black/[0.05] text-xs space-y-1">
              <div className="font-semibold text-[#1d1d1f] flex items-center justify-between">
                <span>บันทึกเกณฑ์ Rubric</span>
                <span className="text-[10px] text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.5 rounded-full font-medium">1.5</span>
              </div>
              <p className="text-[#86868b] text-[11px] leading-relaxed">
                นำเกณฑ์การประเมินชิ้นงานดิจิทัลพร้อมตัวอย่างผลงานนักเรียนมาแนบ
              </p>
            </div>

            <div className="p-3 bg-[#fbfbfd] rounded-2xl border border-black/[0.05] text-xs space-y-1">
              <div className="font-semibold text-[#1d1d1f] flex items-center justify-between">
                <span>บันทึก PLC สาระการเรียนรู้</span>
                <span className="text-[10px] text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.5 rounded-full font-medium">3.2</span>
              </div>
              <p className="text-[#86868b] text-[11px] leading-relaxed">
                แนบแบบบันทึกการแลกเปลี่ยนเรียนรู้เพื่อสะท้อนการพัฒนาวิชาชีพอย่างต่อเนื่อง
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            onClick={() => onNavigateTab('add-evidence')}
            className="w-full py-2.5 bg-[#1d1d1f] hover:bg-[#333336] text-white font-medium text-xs rounded-full transition-colors text-center block cursor-pointer"
          >
            + บันทึกตามคำแนะนำ
          </motion.button>
        </div>
      </motion.div>

      {/* 5. Recent Evidences Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4"
      >
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-3.5">
          <div>
            <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight">
              ผลงานที่บันทึกล่าสุด
            </h2>
            <p className="text-xs text-[#86868b]">
              ผลงานจริงที่คุณครูได้จัดเก็บไว้ในระบบ
            </p>
          </div>
          {activeEvidences.length > 0 && (
            <button
              onClick={() => onNavigateTab('portfolio')}
              className="text-xs font-medium text-[#0071e3] hover:underline flex items-center gap-1 cursor-pointer"
            >
              ดูทั้งหมด ({activeEvidences.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {activeEvidences.length === 0 ? (
          <div className="py-12 px-6 text-center rounded-2xl border border-dashed border-black/[0.1] bg-[#fbfbfd] space-y-4">
            <div className="w-12 h-12 rounded-full bg-black/[0.04] text-[#1d1d1f] flex items-center justify-center mx-auto">
              <FolderCheck className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-semibold text-[#1d1d1f]">
                พร้อมสำหรับการบันทึกผลงานจริงแล้ว
              </h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                คุณครูสามารถเริ่มต้นเพิ่มผลงานแรกเพื่อจัดเก็บลงใน Google Drive และ Google Sheets ได้ทันที
              </p>
            </div>
            <div className="flex justify-center gap-2.5 pt-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                onClick={() => onNavigateTab('add-evidence')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                บันทึกผลงานแรกของคุณครู
              </motion.button>
              <button
                onClick={() => onNavigateTab('profile')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] font-medium text-xs transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#515154]" />
                ตรวจสอบข้อมูลส่วนตัว
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeEvidences.slice(0, 4).map((ev) => (
              <motion.div 
                key={ev.evidence_id} 
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className="p-4.5 rounded-2xl border border-black/[0.06] hover:border-black/15 transition-all space-y-2 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.02)] cursor-pointer"
                onClick={() => onNavigateTab('portfolio')}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#515154] bg-black/[0.04] px-2 py-0.5 rounded-md">
                    {ev.evidence_id}
                  </span>
                  <span className="text-[11px] text-[#86868b]">
                    {formatToThaiDate(ev.start_date)}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#1d1d1f] line-clamp-1">
                  {ev.title}
                </h3>
                <p className="text-xs text-[#86868b] line-clamp-2 leading-relaxed">
                  {ev.description || ev.outcome || 'ไม่มีรายละเอียด'}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-black/[0.04] text-xs">
                  <span className="text-[#1d1d1f] font-medium">
                    {ev.activity_type}
                  </span>
                  <span className="text-[#86868b]">
                    {ev.files?.length || 0} ไฟล์แนบ
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
