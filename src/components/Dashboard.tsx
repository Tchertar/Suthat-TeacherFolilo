import React, { useState } from 'react';
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
  AlertCircle,
  ArrowRight,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  paPlan: PAPlan;
  criteria: Criterion[];
  evidenceList: EvidenceItem[];
  onNavigateTab: (tab: string) => void;
  onSelectCriterion: (criterionId: string) => void;
  fiscalYear: string;
}

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
      // Check if evidence has files & outcome
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

  // Evidence Readiness Progress (not evaluation grade!)
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
  const sep30 = new Date(now.getFullYear(), 8, 30); // Sep 30
  if (now > sep30) {
    sep30.setFullYear(sep30.getFullYear() + 1);
  }
  const diffTime = Math.abs(sep30.getTime() - now.getTime());
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* 1. Welcome & Cycle Status Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle decorative gold/amber glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              ระบบสะสมผลงานการประเมิน PA & เลื่อนเงินเดือน
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              สวัสดี {profile.name}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              {profile.position} {profile.academicStanding} • {profile.school} ({profile.affiliation})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/80 backdrop-blur-xs border border-slate-700/80 px-4 py-2.5 rounded-2xl text-center">
              <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                ปีงบประมาณ
              </div>
              <div className="text-lg font-bold text-amber-400">
                {fiscalYear}
              </div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-xs border border-slate-700/80 px-4 py-2.5 rounded-2xl text-center">
              <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                สิ้นสุดรอบ PA
              </div>
              <div className="text-lg font-bold text-slate-100">
                อีก {daysLeft} วัน
              </div>
            </div>

            <button
              id="dashboard-quick-add-btn"
              onClick={() => onNavigateTab('add-evidence')}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + เพิ่มผลงานใหม่
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">ผลงานทั้งหมด</span>
            <FolderCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeEvidences.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">รายการที่ใช้งานอยู่</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">ไฟล์หลักฐาน</span>
            <FileCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{allFilesCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">เอกสาร/รูปภาพใน Drive</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">มีหลักฐานแล้ว</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{coveredCount} / {totalCriteriaCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">ตัวชี้วัดที่มีผลงานเชื่อมโยง</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">AI Inbox รอยืนยัน</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{unconfirmedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {unconfirmedCount > 0 ? (
              <button onClick={() => onNavigateTab('ai-inbox')} className="text-purple-700 underline font-medium">
                ตรวจยืนยันเลย
              </button>
            ) : (
              'ยืนยันครบแล้ว'
            )}
          </div>
        </div>
      </div>

      {/* 3. Evidence Readiness Bar (Not Score Notice) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                ความพร้อมของหลักฐาน (Evidence Readiness)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                {readinessPercent}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              คำนวณจากความครอบคลุมของตัวชี้วัด การมีไฟล์แนบ และผลลัพธ์เชิงประจักษ์
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Info className="w-4 h-4 text-amber-500 shrink-0" />
            <span>ไม่ใช่คะแนนประเมินจริง คะแนนเป็นดุลยพินิจของคณะกรรมการ</span>
          </div>
        </div>

        {/* Progress bar visual */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${readinessPercent}%` }}
          />
        </div>

        {/* Breakdown sub-progress */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
            <span className="text-slate-600 font-medium">ความพร้อม PA ประจำปี (ว9/2564):</span>
            <span className="font-bold text-slate-900">{paPercent}% ({coveredPACount}/{paCriteria.length})</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
            <span className="text-slate-600 font-medium">ประเมินเงินเดือน รอบ 1:</span>
            <span className="font-bold text-slate-900">พร้อม {Math.min(100, Math.round(paPercent * 0.9))}%</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
            <span className="text-slate-600 font-medium">ประเด็นท้าทาย (PA Challenge):</span>
            <span className="font-bold text-emerald-600">{paPlan.challenge_progress_percent || 65}%</span>
          </div>
        </div>
      </div>

      {/* 4. Gap Analysis & Next Best Action Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Missing Indicators (Gap Analysis) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">
                สิ่งที่ยังขาด / ตัวชี้วัดที่ต้องการหลักฐานเพิ่มเติม
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              ขาดอีก {emptyCount} ตัวชี้วัด
            </span>
          </div>

          {uncoveredCriteria.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-emerald-900">ยินดีด้วย! คุณมีหลักฐานเชื่อมโยงครบทุกตัวชี้วัดแล้ว</div>
              <p className="text-xs text-emerald-700 mt-1">สามารถตรวจสอบความสมบูรณ์ของเอกสารแนบและข้อความรายงานเพิ่มเติมได้ในหน้ารายงาน</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uncoveredCriteria.slice(0, 5).map((c) => (
                <div 
                  key={c.criterion_id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/20 transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-xs">
                        {c.criterion_code}
                      </span>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-amber-800">
                        {c.criterion_name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {c.criterion_description}
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectCriterion(c.criterion_id)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-amber-400 text-slate-700 hover:text-amber-700 rounded-lg text-xs font-semibold shrink-0 transition-colors"
                  >
                    ดูแนวทาง & เพิ่มงาน
                  </button>
                </div>
              ))}
              {uncoveredCriteria.length > 5 && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => onNavigateTab('criteria')}
                    className="text-xs font-semibold text-amber-700 hover:underline inline-flex items-center gap-1"
                  >
                    ดูตัวชี้วัดที่ยังขาดทั้งหมด ({uncoveredCriteria.length} รายการ) <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: AI Opportunity Finder & Next Actions */}
        <div className="bg-gradient-to-b from-amber-50/70 to-orange-50/40 rounded-2xl p-6 border border-amber-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm border-b border-amber-200 pb-3">
            <Lightbulb className="w-4.5 h-4.5 text-amber-600" />
            โอกาสในการสร้างหลักฐาน (AI Opportunity Finder)
          </div>

          <p className="text-xs text-amber-800/90 leading-relaxed">
            AI คัดสรรกิจกรรมที่สอดคล้องกับวิทยฐานะ {profile.academicStanding} และวิชา {profile.teachingSubjects[0]} เพื่อเติมเต็มตัวชี้วัดที่ยังว่าง:
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-white/90 rounded-xl border border-amber-200 shadow-xs text-xs space-y-1">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>บันทึกแบบประเมิน Rubric</span>
                <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">ตัวชี้วัด 1.5</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                นำเกณฑ์การประเมินชิ้นงาน Micro:bit พร้อมภาพถ่ายการตรวจชิ้นงานมาบันทึกเป็นหลักฐานวัดและประเมินผล
              </p>
            </div>

            <div className="p-3 bg-white/90 rounded-xl border border-amber-200 shadow-xs text-xs space-y-1">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>บันทึก PLC ร่วมกับกลุ่มสาระฯ</span>
                <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">ตัวชี้วัด 3.2</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                เพิ่มแบบบันทึกการแลกเปลี่ยนปัญหาการจัดการเรียนรู้เพื่อสะท้อนการมีส่วนร่วมในวิชาชีพอย่างต่อเนื่อง
              </p>
            </div>

            <div className="p-3 bg-white/90 rounded-xl border border-amber-200 shadow-xs text-xs space-y-1">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>ประสานงานภาคีเครือข่าย</span>
                <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">ตัวชี้วัด 2.4</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                เก็บหลักฐานการแจ้งข้อมูลพัฒนาการเรียนรู้แก่นักเรียนและผู้ปกครองผ่านระบบออนไลน์
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('add-evidence')}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs text-center block"
          >
            เพิ่มหลักฐานตามคำแนะนำ
          </button>
        </div>
      </div>

      {/* 5. Recent Evidences Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">
            ผลงานที่บันทึกล่าสุด
          </h2>
          <button
            onClick={() => onNavigateTab('portfolio')}
            className="text-xs font-semibold text-amber-700 hover:underline flex items-center gap-1"
          >
            ดูทั้งหมด ({activeEvidences.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeEvidences.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            ยังไม่มีผลงานบันทึกไว้ในระบบ กดปุ่ม "+ เพิ่มผลงานใหม่" เพื่อเริ่มต้น
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeEvidences.slice(0, 4).map((ev) => (
              <div key={ev.evidence_id} className="p-4 rounded-xl border border-slate-200 hover:border-amber-300 transition-all space-y-2 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {ev.evidence_id}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatToThaiDate(ev.start_date)}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {ev.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {ev.description || ev.outcome || 'ไม่มีรายละเอียด'}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-slate-500 font-medium">
                    {ev.activity_type}
                  </span>
                  <span className="text-slate-400">
                    {ev.files?.length || 0} ไฟล์แนบ
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
