import React, { useState } from 'react';
import { UserProfile, EducationRecord, LicenseRecord, DecorationRecord } from '../types';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Award, 
  ShieldCheck, 
  Mail, 
  Phone, 
  IdCard, 
  Building2, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Camera, 
  Sparkles, 
  Calendar, 
  BookOpen, 
  Layers,
  Clock,
  FileCheck
} from 'lucide-react';

interface TeacherProfileProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  fiscalYear: string;
}

export const TeacherProfile: React.FC<TeacherProfileProps> = ({
  profile,
  onUpdateProfile,
  fiscalYear
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [activeTab, setActiveTab] = useState<'general' | 'education' | 'career' | 'licenses'>('general');
  const [saveToast, setSaveToast] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newAssignment, setNewAssignment] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(profile.avatarUrl);

  const handleFieldChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Combine full name if prefix, first, last are changed
    const fullName = `${formData.prefix || ''}${formData.firstName} ${formData.lastName}`.trim();
    const updated = {
      ...formData,
      name: fullName || formData.name,
      avatarUrl: avatarPreview || formData.avatarUrl
    };
    onUpdateProfile(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

  // Avatar change handler
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Education Records
  const handleAddEducation = () => {
    const newEdu: EducationRecord = {
      id: `EDU-${Date.now()}`,
      institution: 'มหาวิทยาลัยราชภัฏเลย',
      level: 'ปริญญาตรี หรือ เทียบเท่า',
      degree: 'ครุศาสตรบัณฑิต (ค.บ.)',
      major: 'คอมพิวเตอร์ศึกษา',
      otepcCode: '5720980034013530',
      graduationDate: '29 มกราคม 2561'
    };
    setFormData(prev => ({
      ...prev,
      educationList: [...(prev.educationList || []), newEdu]
    }));
  };

  const handleRemoveEducation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      educationList: (prev.educationList || []).filter(e => e.id !== id)
    }));
  };

  const handleUpdateEducation = (id: string, field: keyof EducationRecord, val: string) => {
    setFormData(prev => ({
      ...prev,
      educationList: (prev.educationList || []).map(e => e.id === id ? { ...e, [field]: val } : e)
    }));
  };

  // License Records
  const handleAddLicense = () => {
    const newLic: LicenseRecord = {
      id: `LIC-${Date.now()}`,
      type: 'ใบอนุญาตประกอบวิชาชีพครูชั้นต้น (B License)',
      number: 'B66201201045623',
      expireDate: '29 มีนาคม 2571',
      status: 'ใช้งานได้'
    };
    setFormData(prev => ({
      ...prev,
      licenses: [...(prev.licenses || []), newLic]
    }));
  };

  const handleRemoveLicense = (id: string) => {
    setFormData(prev => ({
      ...prev,
      licenses: (prev.licenses || []).filter(l => l.id !== id)
    }));
  };

  const handleUpdateLicense = (id: string, field: keyof LicenseRecord, val: string) => {
    setFormData(prev => ({
      ...prev,
      licenses: (prev.licenses || []).map(l => l.id === id ? { ...l, [field]: val } : l)
    }));
  };

  // Teaching Subjects tag helpers
  const handleAddSubject = () => {
    if (!newSubject.trim()) return;
    if (!formData.teachingSubjects.includes(newSubject.trim())) {
      setFormData(prev => ({
        ...prev,
        teachingSubjects: [...prev.teachingSubjects, newSubject.trim()]
      }));
    }
    setNewSubject('');
  };

  const handleRemoveSubject = (sub: string) => {
    setFormData(prev => ({
      ...prev,
      teachingSubjects: prev.teachingSubjects.filter(s => s !== sub)
    }));
  };

  // Special Assignments tag helpers
  const handleAddAssignment = () => {
    if (!newAssignment.trim()) return;
    if (!formData.specialAssignments.includes(newAssignment.trim())) {
      setFormData(prev => ({
        ...prev,
        specialAssignments: [...prev.specialAssignments, newAssignment.trim()]
      }));
    }
    setNewAssignment('');
  };

  const handleRemoveAssignment = (ass: string) => {
    setFormData(prev => ({
      ...prev,
      specialAssignments: prev.specialAssignments.filter(a => a !== ass)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-purple-900 text-white rounded-2xl shadow-xl border border-amber-400/40 animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">บันทึกข้อมูลส่วนตัวสำเร็จ</div>
            <div className="text-xs text-amber-200">อัปเดตข้อมูลทะเบียนและระบบ PA เรียบร้อยแล้ว</div>
          </div>
        </div>
      )}

      {/* Top Banner & Profile Overview (White, Purple, Gold Technology Aesthetic) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white p-6 sm:p-8 border border-purple-800/80 shadow-lg">
        {/* Subtle Tech Glow Ornaments */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar with photo and file upload */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-400/80 bg-purple-900/60 shadow-lg flex items-center justify-center">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt={formData.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-12 h-12 text-amber-300" />
                )}
              </div>
              <label 
                htmlFor="avatar-upload"
                className="absolute bottom-1 right-1 p-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md cursor-pointer transition-transform group-hover:scale-110"
                title="เปลี่ยนรูปภาพประจำตัว"
              >
                <Camera className="w-4 h-4" />
                <input 
                  type="file" 
                  id="avatar-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarFile}
                />
              </label>
            </div>

            {/* Teacher Titles & Quick Identifiers */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>ทะเบียนข้าราชการครู • ปีงบประมาณ {fiscalYear}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                {formData.prefix}{formData.firstName} {formData.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-purple-200">
                <span className="font-medium text-amber-200">
                  ตำแหน่ง {formData.position} ({formData.currentRank})
                </span>
                <span>•</span>
                <span>เลขที่ตำแหน่ง {formData.positionNumber}</span>
                <span>•</span>
                <span>{formData.academicStanding}</span>
              </div>
              <div className="text-xs text-purple-300/90 flex flex-wrap items-center gap-2 pt-0.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{formData.school}</span>
                <span className="text-purple-400">•</span>
                <span>{formData.affiliation}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-row md:flex-col items-center gap-3 w-full md:w-auto">
            <button
              id="save-profile-btn-top"
              onClick={handleSave}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-bold text-sm shadow-md hover:from-amber-300 hover:to-yellow-400 hover:shadow-amber-500/25 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              บันทึกการแก้ไขโปรไฟล์
            </button>
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="mt-6 pt-5 border-t border-purple-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-purple-900/40 border border-purple-800/50">
            <span className="text-purple-300 block">เลขประจำตัวประชาชน</span>
            <span className="font-semibold text-white tracking-wide">{formData.idCard}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-900/40 border border-purple-800/50">
            <span className="text-purple-300 block">ใบอนุญาตประกอบวิชาชีพ</span>
            <span className="font-semibold text-amber-300">B License (ใช้งานได้)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-900/40 border border-purple-800/50">
            <span className="text-purple-300 block">วันบรรจุรับราชการ</span>
            <span className="font-semibold text-white">{formData.appointmentDate}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-900/40 border border-purple-800/50">
            <span className="text-purple-300 block">อีเมลสถานศึกษา</span>
            <span className="font-semibold text-white truncate block">{formData.email}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Profile Sections */}
      <div className="bg-white rounded-2xl p-1.5 border border-purple-100/80 shadow-xs flex flex-wrap gap-1.5">
        <button
          id="profile-tab-general"
          onClick={() => setActiveTab('general')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'bg-purple-900 text-white shadow-xs border border-purple-800'
              : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50'
          }`}
        >
          <User className={`w-4 h-4 ${activeTab === 'general' ? 'text-amber-400' : 'text-slate-400'}`} />
          ข้อมูลทั่วไป &amp; การติดต่อ
        </button>

        <button
          id="profile-tab-education"
          onClick={() => setActiveTab('education')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'education'
              ? 'bg-purple-900 text-white shadow-xs border border-purple-800'
              : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50'
          }`}
        >
          <GraduationCap className={`w-4 h-4 ${activeTab === 'education' ? 'text-amber-400' : 'text-slate-400'}`} />
          ประวัติการศึกษา ({formData.educationList?.length || 0})
        </button>

        <button
          id="profile-tab-career"
          onClick={() => setActiveTab('career')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'career'
              ? 'bg-purple-900 text-white shadow-xs border border-purple-800'
              : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50'
          }`}
        >
          <Briefcase className={`w-4 h-4 ${activeTab === 'career' ? 'text-amber-400' : 'text-slate-400'}`} />
          ประวัติการรับราชการ / ตำแหน่ง
        </button>

        <button
          id="profile-tab-licenses"
          onClick={() => setActiveTab('licenses')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'licenses'
              ? 'bg-purple-900 text-white shadow-xs border border-purple-800'
              : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50'
          }`}
        >
          <Award className={`w-4 h-4 ${activeTab === 'licenses' ? 'text-amber-400' : 'text-slate-400'}`} />
          ใบอนุญาตวิชาชีพ &amp; เครื่องราชฯ
        </button>
      </div>

      {/* Tab 1: ข้อมูลทั่วไป & การติดต่อ */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-purple-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-purple-100/80 pb-4">
            <div>
              <h2 className="text-base font-bold text-purple-950 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-600" />
                ข้อมูลส่วนบุคคล และข้อมูลการติดต่อ
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ข้อมูลพื้นฐานสำหรับระบุตัวตนในแบบข้อตกลง PA1 และเอกสารรายงานราชการ
              </p>
            </div>
            <span className="px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold rounded-lg">
              ข้อมูลทางการ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">คำนำหน้าชื่อ</label>
              <input
                type="text"
                value={formData.prefix || ''}
                onChange={(e) => handleFieldChange('prefix', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm outline-hidden"
                placeholder="เช่น นาย / นาง / นางสาว / ดร."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ชื่อจริง</label>
              <input
                type="text"
                value={formData.firstName || ''}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm outline-hidden"
                placeholder="สุทัศน์"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">นามสกุล</label>
              <input
                type="text"
                value={formData.lastName || ''}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm outline-hidden"
                placeholder="บุตรชานนท์"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">เลขประจำตัวประชาชน</label>
              <input
                type="text"
                value={formData.idCard || ''}
                onChange={(e) => handleFieldChange('idCard', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm outline-hidden font-mono"
                placeholder="1-4009-00204-39-1"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">วันเดือนปีเกิด</label>
              <input
                type="text"
                value={formData.birthDate || ''}
                onChange={(e) => handleFieldChange('birthDate', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm outline-hidden"
                placeholder="23 กุมภาพันธ์ 2569"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">เพศ</label>
              <select
                value={formData.gender || 'ชาย'}
                onChange={(e) => handleFieldChange('gender', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm outline-hidden bg-white"
              >
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
                <option value="ไม่ระบุ">ไม่ระบุ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-600" />
                หมายเลขโทรศัพท์มือถือ
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm outline-hidden font-mono"
                placeholder="099-929-6367"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-600" />
                อีเมลสถานศึกษา (School Email)
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm outline-hidden"
                placeholder="suthut.b@pcshsloei.ac.th"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">สถานศึกษา / โรงเรียน</label>
              <input
                type="text"
                value={formData.school || ''}
                onChange={(e) => handleFieldChange('school', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm outline-hidden"
                placeholder="โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย เลย"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">สังกัด</label>
              <input
                type="text"
                value={formData.affiliation || ''}
                onChange={(e) => handleFieldChange('affiliation', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm outline-hidden"
                placeholder="สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาเลย หนองบัวลำภู"
              />
            </div>
          </div>

          {/* Teaching Subjects */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-700" />
              รายวิชาที่รับผิดชอบการสอน
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.teachingSubjects.map((sub, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-900 border border-purple-200 rounded-xl text-xs font-medium"
                >
                  {sub}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(sub)}
                    className="hover:text-rose-600 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubject(); } }}
                placeholder="พิมพ์ชื่อวิชาที่สอน แล้วกดเพิ่ม เช่น วิทยาการคำนวณ ม.4"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-purple-600 outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddSubject}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                + เพิ่มวิชา
              </button>
            </div>
          </div>

          {/* Special Assignments */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-600" />
              ภาระงานหน้าที่พิเศษ / งานที่ได้รับมอบหมาย
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.specialAssignments.map((ass, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-medium"
                >
                  {ass}
                  <button
                    type="button"
                    onClick={() => handleRemoveAssignment(ass)}
                    className="hover:text-rose-600 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAssignment}
                onChange={(e) => setNewAssignment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAssignment(); } }}
                placeholder="พิมพ์ภาระงานพิเศษ เช่น งานสารสนเทศและเทคโนโลยี, ครูที่ปรึกษา"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-purple-600 outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddAssignment}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                + เพิ่มภาระงาน
              </button>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              บันทึกข้อมูลทั่วไป
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: ข้อมูลการศึกษา & คุณวุฒิ ก.ค.ศ. */}
      {activeTab === 'education' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-purple-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-purple-100/80 pb-4">
            <div>
              <h2 className="text-base font-bold text-purple-950 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-700" />
                ข้อมูลคุณวุฒิการศึกษาและรหัส ก.ค.ศ. รับรอง
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ข้อมูลวุฒิการศึกษาที่ผ่านการรับรองจาก ก.ค.ศ. ใช้สำหรับตรวจสอบคุณสมบัติวิทยฐานะ
              </p>
            </div>
            <button
              onClick={handleAddEducation}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-purple-700" />
              เพิ่มคุณวุฒิการศึกษา
            </button>
          </div>

          {/* List of Education Records */}
          <div className="space-y-4">
            {formData.educationList && formData.educationList.length > 0 ? (
              formData.educationList.map((edu, index) => (
                <div 
                  key={edu.id}
                  className="p-5 rounded-2xl border border-purple-100 bg-purple-50/30 hover:border-purple-200 transition-all space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-900 text-amber-300 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <h3 className="text-sm font-bold text-purple-950">
                        {edu.degree} - {edu.major}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleRemoveEducation(edu.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                      title="ลบรายการ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">ระดับการศึกษา</label>
                      <input
                        type="text"
                        value={edu.level}
                        onChange={(e) => handleUpdateEducation(edu.id, 'level', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:border-purple-600 outline-hidden"
                        placeholder="ปริญญาตรี หรือ เทียบเท่า"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">คุณวุฒิการศึกษา</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:border-purple-600 outline-hidden"
                        placeholder="ครุศาสตรบัณฑิต (ค.บ.)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">สาขาวิชา</label>
                      <input
                        type="text"
                        value={edu.major}
                        onChange={(e) => handleUpdateEducation(edu.id, 'major', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:border-purple-600 outline-hidden"
                        placeholder="คอมพิวเตอร์ศึกษา"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1 text-purple-900 font-semibold">
                        รหัสคุณวุฒิที่ ก.ค.ศ. รับรอง
                      </label>
                      <input
                        type="text"
                        value={edu.otepcCode}
                        onChange={(e) => handleUpdateEducation(edu.id, 'otepcCode', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/40 text-amber-950 font-mono text-xs focus:border-amber-500 outline-hidden font-semibold"
                        placeholder="5720980034013530"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">สถาบันการศึกษา</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:border-purple-600 outline-hidden"
                        placeholder="มหาวิทยาลัยราชภัฏเลย"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">วันที่สำเร็จการศึกษา</label>
                      <input
                        type="text"
                        value={edu.graduationDate}
                        onChange={(e) => handleUpdateEducation(edu.id, 'graduationDate', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:border-purple-600 outline-hidden"
                        placeholder="29 มกราคม 2561"
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">ยังไม่มีข้อมูลคุณวุฒิการศึกษา</p>
                <button
                  onClick={handleAddEducation}
                  className="mt-3 px-4 py-2 bg-purple-900 text-white rounded-xl text-xs font-semibold"
                >
                  + เพิ่มคุณวุฒิแรก
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              บันทึกข้อมูลการศึกษา
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: ประวัติการรับราชการ / ตำแหน่ง */}
      {activeTab === 'career' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-purple-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-purple-100/80 pb-4">
            <div>
              <h2 className="text-base font-bold text-purple-950 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-600" />
                ประวัติการรับราชการและตำแหน่งปัจจุบัน
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ข้อมูลการบรรจุแต่งตั้ง อันดับเงินเดือน และวันเข้าปฏิบัติหน้าที่ในสถานศึกษา
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold rounded-lg">
              เลขตำแหน่ง: {formData.positionNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ตำแหน่งปัจจุบัน</label>
              <input
                type="text"
                value={formData.position || ''}
                onChange={(e) => handleFieldChange('position', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 text-sm outline-hidden"
                placeholder="ครู"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">อันดับปัจจุบัน</label>
              <input
                type="text"
                value={formData.currentRank || ''}
                onChange={(e) => handleFieldChange('currentRank', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 text-sm outline-hidden font-semibold text-purple-900"
                placeholder="คศ.1"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">วิทยฐานะปัจจุบัน</label>
              <input
                type="text"
                value={formData.academicStanding || ''}
                onChange={(e) => handleFieldChange('academicStanding', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 text-sm outline-hidden"
                placeholder="ครู (ไม่มีวิทยฐานะ) / ชำนาญการ"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">เลขที่ตำแหน่งปัจจุบัน</label>
              <input
                type="text"
                value={formData.positionNumber || ''}
                onChange={(e) => handleFieldChange('positionNumber', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 text-sm outline-hidden font-mono"
                placeholder="100721"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">วันบรรจุ (พ.ศ.)</label>
              <input
                type="text"
                value={formData.appointmentDate || ''}
                onChange={(e) => handleFieldChange('appointmentDate', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 text-sm outline-hidden"
                placeholder="14 กุมภาพันธ์ 2567"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">วันที่แต่งตั้งตำแหน่งปัจจุบัน</label>
              <input
                type="text"
                value={formData.currentPositionDate || ''}
                onChange={(e) => handleFieldChange('currentPositionDate', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 text-sm outline-hidden"
                placeholder="14 กุมภาพันธ์ 2569"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">วันที่เข้าทำงาน/ย้ายเข้า</label>
              <input
                type="text"
                value={formData.entryDate || ''}
                onChange={(e) => handleFieldChange('entryDate', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 text-sm outline-hidden"
                placeholder="2 กรกฎาคม 2569"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ปีงบประมาณรอบประเมิน PA ปัจจุบัน</label>
              <input
                type="text"
                value={formData.fiscalYear || fiscalYear}
                onChange={(e) => handleFieldChange('fiscalYear', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 text-sm outline-hidden font-semibold text-purple-900"
                placeholder="2570"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              บันทึกประวัติการรับราชการ
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: ใบอนุญาตประกอบวิชาชีพ & เครื่องราชฯ */}
      {activeTab === 'licenses' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-purple-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-purple-100/80 pb-4">
            <div>
              <h2 className="text-base font-bold text-purple-950 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                ใบอนุญาตประกอบวิชาชีพครู (คุรุสภา) และเครื่องราชอิสริยาภรณ์
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ข้อมูลสถานะการรับรองทางวิชาชีพครูตามมาตรฐานคุรุสภา
              </p>
            </div>
            <button
              onClick={handleAddLicense}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-purple-700" />
              เพิ่มใบอนุญาต
            </button>
          </div>

          {/* Licenses Cards */}
          <div className="space-y-4">
            {formData.licenses && formData.licenses.length > 0 ? (
              formData.licenses.map((lic, index) => (
                <div 
                  key={lic.id}
                  className="p-5 rounded-2xl border-2 border-amber-300/70 bg-gradient-to-br from-white via-amber-50/20 to-purple-50/20 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-xs">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-amber-800">ใบอนุญาตทางการ</span>
                        <h3 className="text-sm font-bold text-purple-950">{lic.type}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-full flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {lic.status || 'ใช้งานได้'}
                      </span>
                      <button
                        onClick={() => handleRemoveLicense(lic.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50"
                        title="ลบรายการ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">ประเภทใบอนุญาต</label>
                      <input
                        type="text"
                        value={lic.type}
                        onChange={(e) => handleUpdateLicense(lic.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:border-purple-600 outline-hidden font-medium"
                        placeholder="ใบอนุญาตประกอบวิชาชีพครูชั้นต้น (B License)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">เลขที่ใบอนุญาต</label>
                      <input
                        type="text"
                        value={lic.number}
                        onChange={(e) => handleUpdateLicense(lic.id, 'number', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:border-purple-600 outline-hidden font-mono font-semibold text-purple-900"
                        placeholder="B66201201045623"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">วันหมดอายุใบอนุญาตฯ (พ.ศ.)</label>
                      <input
                        type="text"
                        value={lic.expireDate}
                        onChange={(e) => handleUpdateLicense(lic.id, 'expireDate', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:border-purple-600 outline-hidden"
                        placeholder="29 มีนาคม 2571"
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
                <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">ไม่มีข้อมูลใบอนุญาต</p>
              </div>
            )}
          </div>

          {/* Decorations section */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              ข้อมูลเครื่องราชอิสริยาภรณ์
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              รายการเครื่องราชอิสริยาภรณ์และเหรียญจักรพรรดิมาลาที่ได้รับพระราชทาน
            </p>
            <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-slate-600 flex items-center justify-between">
              <span>ยังไม่มีข้อมูลการขอรับพระราชทานเครื่องราชอิสริยาภรณ์ (สามารถระบุเพิ่มเติมได้เมื่อได้รับ)</span>
              <button 
                type="button"
                className="px-3 py-1 bg-white border border-purple-200 text-purple-900 rounded-lg font-semibold hover:bg-purple-100 transition-colors"
              >
                + บันทึกเครื่องราชฯ
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              บันทึกข้อมูลใบอนุญาต
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
