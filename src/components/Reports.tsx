import React, { useState } from 'react';
import { EvidenceItem, Criterion, UserProfile, PAPlan } from '../types';
import { formatToThaiDate } from '../utils/dateUtils';
import { summarizeCriterionWithAI } from '../services/aiService';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  ExternalLink,
  Loader2,
  Calendar
} from 'lucide-react';

interface ReportsProps {
  profile: UserProfile;
  paPlan: PAPlan;
  criteria: Criterion[];
  evidenceList: EvidenceItem[];
  fiscalYear: string;
}

export const Reports: React.FC<ReportsProps> = ({
  profile,
  paPlan,
  criteria,
  evidenceList,
  fiscalYear
}) => {
  const [reportType, setReportType] = useState<'PA_SUMMARY' | 'SALARY_ROUND_1' | 'CRITERIA_INDEX'>('PA_SUMMARY');
  const [selectedCriterionForSummary, setSelectedCriterionForSummary] = useState<string>(criteria[0]?.criterion_id || '');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiCriterionSummary, setAiCriterionSummary] = useState<any | null>(null);

  const activeEvidences = evidenceList.filter(e => e.status === 'ACTIVE');

  const handleGenerateCriterionReport = async () => {
    const crit = criteria.find(c => c.criterion_id === selectedCriterionForSummary);
    if (!crit) return;

    setIsGeneratingSummary(true);
    try {
      const linkedEvidences = activeEvidences.filter(e => 
        e.criteria_mappings.some(m => m.criterion_id === crit.criterion_id)
      );
      const summary = await summarizeCriterionWithAI(crit, linkedEvidences, profile);
      setAiCriterionSummary(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-600" />
            รายงานสรุปผลการปฏิบัติงานและการประเมิน (Reports)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            สร้างรายงานทางราชการ สรุปผลงานตามตัวชี้วัด และพิมพ์ Portfolio
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            พิมพ์รายงาน / บันทึก PDF
          </button>
        </div>
      </div>

      {/* Report Selector Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap gap-2 print:hidden">
        <button
          onClick={() => setReportType('PA_SUMMARY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            reportType === 'PA_SUMMARY'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          รายงานสรุปผล PA ประจำปี
        </button>
        <button
          onClick={() => setReportType('SALARY_ROUND_1')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            reportType === 'SALARY_ROUND_1'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          สรุปเลื่อนเงินเดือน รอบ 1
        </button>
        <button
          onClick={() => setReportType('CRITERIA_INDEX')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            reportType === 'CRITERIA_INDEX'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          สารบัญหลักฐานตามตัวชี้วัด (Evidence Index)
        </button>
      </div>

      {/* AI Criterion Synthesis Tool */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl p-6 border border-amber-200 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-amber-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              สังเคราะห์ข้อความสรุปผลงานตามตัวชี้วัด (AI Criterion Synthesizer)
            </div>
            <div className="text-xs text-amber-800 mt-0.5">
              ให้ AI อ่านผลงานทั้งหมดที่เชื่อมโยงกับตัวชี้วัดที่เลือก แล้วเขียนสรุปภาพรวมในรูปแบบรายงานราชการ
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCriterionForSummary}
              onChange={(e) => setSelectedCriterionForSummary(e.target.value)}
              className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500"
            >
              {criteria.map(c => (
                <option key={c.criterion_id} value={c.criterion_id}>
                  [{c.criterion_code}] {c.criterion_name}
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerateCriterionReport}
              disabled={isGeneratingSummary}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {isGeneratingSummary ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              สร้างสรุป
            </button>
          </div>
        </div>

        {aiCriterionSummary && (
          <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-800 text-sm">
                บทสังเคราะห์สรุปผลงานตามตัวชี้วัด:
              </span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded">
                สถานะความพร้อม: {aiCriterionSummary.readinessStatus}
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
              {aiCriterionSummary.synthesisText}
            </p>
            {aiCriterionSummary.keyOutcomes && (
              <div>
                <span className="font-semibold text-slate-800">ผลสัมฤทธิ์สำคัญ (Key Outcomes):</span>
                <ul className="list-disc list-inside text-slate-600 mt-1 space-y-0.5">
                  {aiCriterionSummary.keyOutcomes.map((ko: string, idx: number) => (
                    <li key={idx}>{ko}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0 space-y-8">
        {/* Report Header */}
        <div className="text-center space-y-2 border-b-2 border-slate-900 pb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            รายงานผลการปฏิบัติงานตามข้อตกลงในการพัฒนางาน (PA)
          </h2>
          <div className="text-sm font-semibold text-slate-700">
            สำหรับข้าราชการครูและบุคลากรทางการศึกษา ตำแหน่งครู วิทยฐานะ{profile.academicStanding}
          </div>
          <div className="text-xs text-slate-500">
            ประจำปีงบประมาณ พ.ศ. {fiscalYear} (ระหว่างวันที่ 1 ตุลาคม ถึง 30 กันยายน)
          </div>
        </div>

        {/* Teacher Info Table */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div><span className="font-bold text-slate-700">ชื่อผู้รับการประเมิน:</span> {profile.name}</div>
            <div><span className="font-bold text-slate-700">ตำแหน่ง:</span> {profile.position} ({profile.academicStanding})</div>
            <div><span className="font-bold text-slate-700">สถานศึกษา:</span> {profile.school}</div>
            <div><span className="font-bold text-slate-700">สังกัด:</span> {profile.affiliation}</div>
            <div><span className="font-bold text-slate-700">กลุ่มสาระการเรียนรู้:</span> {profile.teachingSubjects.join(', ')}</div>
            <div><span className="font-bold text-slate-700">ระดับชั้นที่สอน:</span> {profile.gradeLevels.join(', ')}</div>
          </div>
        </div>

        {/* Challenge Section in Report */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
            1. สรุปผลการพัฒนางานที่เป็นประเด็นท้าทาย
          </h3>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-amber-50/40 p-4 rounded-xl border border-amber-200">
            <div className="font-bold text-amber-950 mb-1">
              ประเด็นท้าทาย: {paPlan.challenge_topic}
            </div>
            <p className="text-slate-600 mt-2">
              <span className="font-semibold text-slate-800">วิธีดำเนินการ:</span> {paPlan.challenge_method}
            </p>
            <p className="text-slate-600 mt-2">
              <span className="font-semibold text-slate-800">ผลลัพธ์เชิงประจักษ์:</span> {paPlan.challenge_expected_quantitative} ({paPlan.challenge_expected_qualitative})
            </p>
          </div>
        </div>

        {/* Evidence by Criteria Table */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
            2. สารบัญผลงานและหลักฐานเชิงประจักษ์แยกตามตัวชี้วัด (Evidence Index)
          </h3>

          <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden text-xs">
            {criteria.map((c) => {
              const linkedEvs = activeEvidences.filter(e => 
                e.criteria_mappings.some(m => m.criterion_id === c.criterion_id)
              );

              return (
                <div key={c.criterion_id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      ตัวชี้วัดที่ {c.criterion_code}: {c.criterion_name}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {linkedEvs.length} ผลงานที่เชื่อมโยง
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    {c.criterion_description}
                  </p>

                  {linkedEvs.length > 0 ? (
                    <div className="space-y-2 pt-2">
                      {linkedEvs.map((ev) => (
                        <div key={ev.evidence_id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 space-y-1">
                          <div className="font-bold text-xs flex items-center justify-between">
                            <span>• [{ev.evidence_id}] {ev.title}</span>
                            <span className="text-[10px] text-slate-400">{formatToThaiDate(ev.start_date)}</span>
                          </div>
                          {ev.outcome && (
                            <div className="text-[11px] text-slate-600">
                              <span className="font-semibold">ผลลัพธ์:</span> {ev.outcome}
                            </div>
                          )}
                          {ev.files && ev.files.length > 0 && (
                            <div className="text-[10px] text-slate-400">
                              หลักฐาน: {ev.files.map(f => f.file_name).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-400 italic text-[11px] pt-1">
                      - ยังไม่มีรายการผลงานในรอบนี้ -
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Signature Area for Thai Official Form */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-8 text-center text-xs">
          <div className="space-y-12">
            <div>(ลงชื่อ)........................................................................</div>
            <div>({profile.name})</div>
            <div>ตำแหน่ง {profile.position} ({profile.academicStanding})</div>
            <div>ผู้รายงาน</div>
          </div>

          <div className="space-y-12">
            <div>(ลงชื่อ)........................................................................</div>
            <div>(........................................................................)</div>
            <div>ผู้อำนวยการ{profile.school}</div>
            <div>ผู้รับรองรายงาน</div>
          </div>
        </div>
      </div>
    </div>
  );
};
