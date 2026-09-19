import React, { useState } from 'react';
import { EvidenceItem, Criterion, UserProfile } from '../types';
import { formatToThaiDate } from '../utils/dateUtils';
import { 
  CircleDollarSign, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Save, 
  ChevronRight,
  Calculator,
  ShieldCheck
} from 'lucide-react';

interface SalaryEvaluationProps {
  profile: UserProfile;
  criteria: Criterion[];
  evidenceList: EvidenceItem[];
  fiscalYear: string;
}

export const SalaryEvaluation: React.FC<SalaryEvaluationProps> = ({
  profile,
  criteria,
  evidenceList,
  fiscalYear
}) => {
  const [round, setRound] = useState<'ROUND_1' | 'ROUND_2'>('ROUND_1');
  const [selfScore1, setSelfScore1] = useState(57); // Max 60
  const [selfScore2, setSelfScore2] = useState(19); // Max 20
  const [selfScore3, setSelfScore3] = useState(10); // Max 10
  const [selfScore4, setSelfScore4] = useState(10); // Max 10
  const [actualScore, setActualScore] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);

  const totalSelfScore = selfScore1 + selfScore2 + selfScore3 + selfScore4;

  const activeEvidences = evidenceList.filter(e => e.status === 'ACTIVE');

  const handleSaveScores = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-amber-600" />
            การประเมินเพื่อเลื่อนเงินเดือนข้าราชการครู (ว23/2564)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            เชื่อมโยงผลงานเข้ากับ 3 องค์ประกอบหลัก เพื่อใช้ประกอบการพิจารณาเลื่อนเงินเดือน
          </p>
        </div>

        {/* Round switch */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setRound('ROUND_1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              round === 'ROUND_1' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
            }`}
          >
            รอบที่ 1 (1 ต.ค. - 31 มี.ค.)
          </button>
          <button
            onClick={() => setRound('ROUND_2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              round === 'ROUND_2' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
            }`}
          >
            รอบที่ 2 (1 เม.ย. - 30 ก.ย.)
          </button>
        </div>
      </div>

      {/* Warning Notice: Real Evaluation Grade Notice */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold">ข้อความชี้แจงตามหลักเกณฑ์ ก.ค.ศ.:</div>
          <p className="text-amber-800 leading-relaxed">
            ระบบช่วยคำนวณและสรุปหลักฐานตามองค์ประกอบ คะแนนที่บันทึกในระบบเป็นเพียง **การประเมินตนเอง (Self-Evaluation)** ส่วนคะแนนจริงเป็นอำนาจหน้าที่ของคณะกรรมการประเมินและผู้บังคับบัญชา
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          บันทึกผลการประเมินตนเองเรียบร้อยแล้ว
        </div>
      )}

      {/* 3 Components Summary Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          โครงสร้างองค์ประกอบการประเมิน (รอบที่ {round === 'ROUND_1' ? '1' : '2'} ปีงบประมาณ {fiscalYear})
        </h2>

        {/* Component 1: Performance (80 pts) */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                องค์ประกอบที่ 1 (80 คะแนน)
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                ประสิทธิภาพและประสิทธิผลการปฏิบัติงานตามมาตรฐานตำแหน่ง
              </h3>
            </div>
            <div className="text-xs font-bold text-slate-700">
              รวมคะแนนตนเอง: {selfScore1 + selfScore2} / 80 คะแนน
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between font-semibold">
                <span>ตอนที่ 1: งานตามมาตรฐานตำแหน่งครู (60 คะแนน)</span>
                <span className="text-amber-700 font-bold">{selfScore1} / 60</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                ครอบคลุม 3 ด้าน 15 ตัวชี้วัด (จัดการเรียนรู้, สนับสนุน, พัฒนาตนเอง)
              </p>
              <input
                type="range"
                min="0"
                max="60"
                value={selfScore1}
                onChange={(e) => setSelfScore1(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between font-semibold">
                <span>ตอนที่ 2: ข้อตกลงประเด็นท้าทาย (20 คะแนน)</span>
                <span className="text-amber-700 font-bold">{selfScore2} / 20</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                ความสำเร็จและผลลัพธ์เชิงประจักษ์ของการแก้ไขปัญหาตามระดับวิทยฐานะ
              </p>
              <input
                type="range"
                min="0"
                max="20"
                value={selfScore2}
                onChange={(e) => setSelfScore2(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Component 2 & 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Component 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between font-bold">
              <span>องค์ประกอบที่ 2: การมีส่วนร่วมพัฒนาการศึกษา (10 คะแนน)</span>
              <span className="text-amber-700">{selfScore3} / 10</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              งานที่ได้รับมอบหมายจากสถานศึกษา ชุมชน และนโยบาย
            </p>
            <input
              type="range"
              min="0"
              max="10"
              value={selfScore3}
              onChange={(e) => setSelfScore3(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Component 3 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between font-bold">
              <span>องค์ประกอบที่ 3: วินัย คุณธรรม จริยธรรม (10 คะแนน)</span>
              <span className="text-amber-700">{selfScore4} / 10</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              การรักษาวินัย จรรยาบรรณวิชาชีพ และการปฏิบัติตนเป็นแบบอย่างที่ดี
            </p>
            <input
              type="range"
              min="0"
              max="10"
              value={selfScore4}
              onChange={(e) => setSelfScore4(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Summary total self evaluation */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <div className="font-bold text-amber-950 text-sm">
              ผลรวมคะแนนการประเมินตนเอง: {totalSelfScore} / 100 คะแนน
            </div>
            <div className="text-amber-800 text-[11px] mt-0.5">
              ระดับผลการปฏิบัติงาน: {totalSelfScore >= 90 ? 'ดีเด่น' : totalSelfScore >= 80 ? 'ดีมาก' : totalSelfScore >= 70 ? 'ดี' : 'พอใช้'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="คะแนนจริงหลังได้รับผล (ถ้ามี)"
              value={actualScore}
              onChange={(e) => setActualScore(e.target.value)}
              className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs w-48 text-slate-800"
            />
            <button
              onClick={handleSaveScores}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            >
              บันทึกคะแนน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
