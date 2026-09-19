import React, { useState } from 'react';
import { PAPlan, UserProfile } from '../types';
import { Target, CheckCircle2, Save, FileText, Upload, Sparkles, AlertCircle } from 'lucide-react';

interface PA1ManagerProps {
  paPlan: PAPlan;
  profile: UserProfile;
  onUpdatePAPlan: (updated: PAPlan) => void;
}

export const PA1Manager: React.FC<PA1ManagerProps> = ({
  paPlan,
  profile,
  onUpdatePAPlan
}) => {
  const [form, setForm] = useState<PAPlan>(paPlan);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onUpdatePAPlan(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            ข้อตกลงในการพัฒนางาน (PA 1/ส) ประจำปีงบประมาณ {form.fiscal_year}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            กำหนดภาระงาน ค่าเป้าหมาย และประเด็นท้าทาย เพื่อใช้เป็นกรอบอ้างอิงให้ AI ช่วยจัดหมวดหมู่หลักฐาน
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Save className="w-4 h-4" />
          บันทึกแบบข้อตกลง PA1
        </button>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          บันทึกข้อมูลข้อตกลง PA1 เรียบร้อยแล้ว ข้อมูลจะถูกนำไปอ้างอิงในการให้คำแนะนำของ AI
        </div>
      )}

      {/* Part 1: General Job Agreement */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          ส่วนที่ 1: ข้อตกลงในการพัฒนางานตามมาตรฐานตำแหน่ง
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ภาระงานสอนตามตารางสอน (ชั่วโมง/สัปดาห์)
            </label>
            <input
              type="number"
              value={form.teaching_load_hours}
              onChange={(e) => setForm({ ...form, teaching_load_hours: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              งานตอบสนองนโยบายและจุดเน้น
            </label>
            <input
              type="text"
              value={form.policy_tasks}
              onChange={(e) => setForm({ ...form, policy_tasks: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            งานสนับสนุนการจัดการเรียนรู้ (เช่น งานดูแลช่วยเหลือนักเรียน, ระบบสารสนเทศ)
          </label>
          <textarea
            rows={2}
            value={form.support_tasks}
            onChange={(e) => setForm({ ...form, support_tasks: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            งานพัฒนาคุณภาพการจัดการศึกษาของสถานศึกษา (งานพิเศษ/หัวหน้างาน)
          </label>
          <textarea
            rows={2}
            value={form.school_quality_tasks}
            onChange={(e) => setForm({ ...form, school_quality_tasks: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            ตัวชี้วัดความสำเร็จ (Target Indicators)
          </label>
          <textarea
            rows={2}
            value={form.target_indicators}
            onChange={(e) => setForm({ ...form, target_indicators: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl text-slate-800"
          />
        </div>
      </div>

      {/* Part 2: Challenge Agreement */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">
              ส่วนที่ 2: ข้อตกลงในการพัฒนางานที่เป็นประเด็นท้าทาย (20 คะแนน)
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            ระดับความคาดหวัง: {profile.academicStanding}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            ชื่อประเด็นท้าทาย
          </label>
          <input
            type="text"
            value={form.challenge_topic}
            onChange={(e) => setForm({ ...form, challenge_topic: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl text-slate-800 font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            สภาพปัญหาการจัดการเรียนรู้และคุณภาพการเรียนรู้ของผู้เรียน
          </label>
          <textarea
            rows={3}
            value={form.challenge_problem}
            onChange={(e) => setForm({ ...form, challenge_problem: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            วิธีดำเนินการให้บรรลุผล (Methodology)
          </label>
          <textarea
            rows={4}
            value={form.challenge_method}
            onChange={(e) => setForm({ ...form, challenge_method: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl text-slate-800"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ผลลัพธ์การพัฒนาที่คาดหวังเชิงปริมาณ
            </label>
            <textarea
              rows={3}
              value={form.challenge_expected_quantitative}
              onChange={(e) => setForm({ ...form, challenge_expected_quantitative: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ผลลัพธ์การพัฒนาที่คาดหวังเชิงคุณภาพ
            </label>
            <textarea
              rows={3}
              value={form.challenge_expected_qualitative}
              onChange={(e) => setForm({ ...form, challenge_expected_qualitative: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl text-slate-800"
            />
          </div>
        </div>

        {/* Progress Slider */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
            <span>ความคืบหน้าการดำเนินงานประเด็นท้าทาย</span>
            <span className="text-amber-700 font-bold">{form.challenge_progress_percent || 0}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={form.challenge_progress_percent || 0}
            onChange={(e) => setForm({ ...form, challenge_progress_percent: parseInt(e.target.value, 10) })}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
