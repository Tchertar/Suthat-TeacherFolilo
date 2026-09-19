import React, { useState } from 'react';
import { 
  EvidenceItem, 
  Criterion, 
  UserProfile, 
  EvidenceFile, 
  ActivityType,
  AIAnalysisResult 
} from '../types';
import { ACTIVITY_TYPES } from '../constants';
import { analyzeEvidenceWithAI } from '../services/aiService';
import { uploadFileToDrive, appendEvidenceToSheet } from '../services/googleWorkspaceService';
import { 
  Sparkles, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Link as LinkIcon, 
  Tag, 
  ChevronRight,
  Loader2,
  Trash2,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface AddEvidenceProps {
  profile: UserProfile;
  activeCriteria: Criterion[];
  fiscalYear: string;
  spreadsheetId?: string;
  driveFolderId?: string;
  onSaveEvidence: (newEvidence: EvidenceItem) => void;
  onNavigateToPortfolio: () => void;
}

export const AddEvidenceModal: React.FC<AddEvidenceProps> = ({
  profile,
  activeCriteria,
  fiscalYear,
  spreadsheetId,
  driveFolderId,
  onSaveEvidence,
  onNavigateToPortfolio
}) => {
  // Quick fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('การจัดการเรียนรู้');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [role, setRole] = useState('ผู้สอนหลัก');
  const [subject, setSubject] = useState(profile.teachingSubjects[0] || '');
  const [gradeLevel, setGradeLevel] = useState(profile.gradeLevels[0] || '');
  
  // Extended fields
  const [showExtended, setShowExtended] = useState(false);
  const [participantCount, setParticipantCount] = useState<number | undefined>();
  const [targetGroup, setTargetGroup] = useState('');
  const [processText, setProcessText] = useState('');
  const [output, setOutput] = useState('');
  const [outcome, setOutcome] = useState('');
  const [quantitativeResult, setQuantitativeResult] = useState('');
  const [qualitativeResult, setQualitativeResult] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [lessonLearned, setLessonLearned] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  // File state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileCategory, setFileCategory] = useState<EvidenceFile['file_category']>('ภาพถ่าย');
  const [uploadedFilesMeta, setUploadedFilesMeta] = useState<EvidenceFile[]>([]);

  // AI Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [selectedPrimaryCriterion, setSelectedPrimaryCriterion] = useState<string>('');
  const [selectedSecondaryCriteria, setSelectedSecondaryCriteria] = useState<string[]>([]);

  // Form saving status
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Run AI Analysis
  const handleTriggerAI = async () => {
    if (!title.trim()) {
      setErrorMessage('กรุณาระบุชื่อผลงานหรือกิจกรรมก่อนให้ AI วิเคราะห์');
      return;
    }
    setErrorMessage('');
    setIsAnalyzing(true);

    try {
      const tempEvidence: Partial<EvidenceItem> = {
        title,
        description,
        activity_type: activityType,
        role,
        process: processText,
        output,
        outcome,
        quantitative_result: quantitativeResult,
        qualitative_result: qualitativeResult,
        files: uploadedFilesMeta.length > 0 ? uploadedFilesMeta : selectedFiles.map((f, i) => ({
          file_id: `F-TEMP-${i}`,
          evidence_id: '',
          file_name: f.name,
          mime_type: f.type,
          file_category: fileCategory,
          uploaded_at: new Date().toISOString()
        }))
      };

      const result = await analyzeEvidenceWithAI(tempEvidence, profile, activeCriteria);
      setAiResult(result);
      if (result.suggestedPrimaryCriterion) {
        setSelectedPrimaryCriterion(result.suggestedPrimaryCriterion);
      }
      if (result.secondaryCriteria) {
        setSelectedSecondaryCriteria(result.secondaryCriteria.map((s: any) => s.criterion_id));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'AI วิเคราะห์ไม่สำเร็จ โปรดลองใหม่อีกครั้ง');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save evidence to State + Google Workspace
  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMessage('กรุณาระบุชื่อกิจกรรม/ผลงาน');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const evidenceId = `E-${fiscalYear}-${Date.now().toString().slice(-4)}`;
      const filesToAttach: EvidenceFile[] = [...uploadedFilesMeta];

      // If there are raw files and Drive is configured, attempt drive upload
      for (const file of selectedFiles) {
        try {
          const uploaded = await uploadFileToDrive(file, driveFolderId);
          filesToAttach.push({
            file_id: `F-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            evidence_id: evidenceId,
            drive_file_id: uploaded.id,
            drive_url: uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`,
            file_name: file.name,
            mime_type: file.type,
            file_size: file.size,
            file_category: fileCategory,
            uploaded_at: new Date().toISOString()
          });
        } catch (uploadErr) {
          console.warn('Drive upload bypassed or failed, using local meta reference:', uploadErr);
          filesToAttach.push({
            file_id: `F-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            evidence_id: evidenceId,
            file_name: file.name,
            mime_type: file.type,
            file_size: file.size,
            file_category: fileCategory,
            uploaded_at: new Date().toISOString()
          });
        }
      }

      // Build criteria mappings
      const criteriaMappings = [];
      if (selectedPrimaryCriterion) {
        criteriaMappings.push({
          mapping_id: `M-P-${Date.now()}`,
          evidence_id: evidenceId,
          criterion_id: selectedPrimaryCriterion,
          relation_type: 'Primary' as const,
          ai_confidence: aiResult?.confidence || 90,
          ai_reason: aiResult?.reasoningSummary || 'ผู้ใช้กำหนดเป็นตัวชี้วัดหลัก',
          user_confirmed: true,
          confirmed_at: new Date().toISOString()
        });
      }

      for (const secId of selectedSecondaryCriteria) {
        if (secId !== selectedPrimaryCriterion) {
          const secMatch = aiResult?.secondaryCriteria.find(s => s.criterion_id === secId);
          criteriaMappings.push({
            mapping_id: `M-S-${Date.now()}-${secId}`,
            evidence_id: evidenceId,
            criterion_id: secId,
            relation_type: 'Supporting' as const,
            ai_confidence: secMatch?.confidence || 80,
            ai_reason: secMatch?.reason || 'ตัวชี้วัดสนับสนุน',
            user_confirmed: true,
            confirmed_at: new Date().toISOString()
          });
        }
      }

      const newEvidence: EvidenceItem = {
        evidence_id: evidenceId,
        title,
        activity_type: activityType,
        start_date: startDate,
        end_date: endDate || undefined,
        description,
        role,
        subject,
        grade_level: gradeLevel,
        target_group: targetGroup || undefined,
        participant_count: participantCount,
        process: processText || undefined,
        output: output || undefined,
        outcome: outcome || undefined,
        quantitative_result: quantitativeResult || undefined,
        qualitative_result: qualitativeResult || undefined,
        problem: problem || undefined,
        solution: solution || undefined,
        lesson_learned: lessonLearned || undefined,
        tags,
        fiscal_year: fiscalYear,
        salary_cycle: 'ROUND_1',
        pa_cycle: fiscalYear,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'ACTIVE',
        files: filesToAttach,
        criteria_mappings: criteriaMappings,
        ai_analysis: aiResult || undefined
      };

      // Attempt to append to Google Sheets if spreadsheetId is active
      if (spreadsheetId) {
        try {
          await appendEvidenceToSheet(spreadsheetId, newEvidence);
        } catch (e) {
          console.warn('Could not append row to Google Sheets:', e);
        }
      }

      onSaveEvidence(newEvidence);
      setSaveSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'บันทึกผลงานไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-base">
                +
              </span>
              บันทึกผลงาน / กิจกรรมใหม่
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              กรอกข้อมูลเพียงเท่าที่มี หรือกรอกชื่อ + รายละเอียด แล้วให้ AI ช่วยเชื่อมโยงตัวชี้วัดและร่างข้อความประเมิน
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-full border border-amber-200">
              ปีงบประมาณ {fiscalYear}
            </span>
          </div>
        </div>
      </div>

      {saveSuccess ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-emerald-900">บันทึกผลงานสำเร็จเรียบร้อย!</h2>
          <p className="text-sm text-emerald-700 max-w-md mx-auto">
            ผลงานได้ถูกจัดเก็บเข้าสู่ระบบ พร้อมเชื่อมโยงตัวชี้วัดและคำนวณความพร้อมของหลักฐานให้โดยอัตโนมัติ
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setSaveSuccess(false);
                setTitle('');
                setDescription('');
                setSelectedFiles([]);
                setAiResult(null);
              }}
              className="px-4 py-2 bg-white border border-emerald-300 text-emerald-800 text-sm font-medium rounded-xl hover:bg-emerald-100"
            >
              + บันทึกผลงานอื่นต่อ
            </button>
            <button
              onClick={onNavigateToPortfolio}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 shadow-xs"
            >
              ไปที่คลังผลงาน
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Core Information Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
              1. ข้อมูลสำคัญของกิจกรรม (กรอกขั้นต่ำเพื่อเริ่มใช้งาน)
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ชื่อผลงาน / กิจกรรม <span className="text-rose-500">*</span>
              </label>
              <input
                id="evidence-title-input"
                type="text"
                placeholder="เช่น การพัฒนาชุดกิจกรรมบอร์ด Micro:bit สำหรับนักเรียน ม.4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ประเภทกิจกรรม
                </label>
                <select
                  id="evidence-activity-type-select"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value as ActivityType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                >
                  {ACTIVITY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  วันที่ดำเนินการ
                </label>
                <input
                  id="evidence-start-date-input"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  บทบาทของคุณ
                </label>
                <input
                  id="evidence-role-input"
                  type="text"
                  placeholder="เช่น ผู้สอนหลัก, วิทยากร, คณะทำงาน"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                คำอธิบายสั้น ๆ / สภาพปัญหาและสิ่งที่ดำเนินการ <span className="text-slate-400 font-normal">(ให้ข้อมูลเพื่อที่ AI จะนำไปวิเคราะห์ได้อย่างแม่นยำ)</span>
              </label>
              <textarea
                id="evidence-description-textarea"
                rows={3}
                placeholder="ระบุสิ่งที่ทำ ผลที่เกิดขึ้นกับนักเรียน หรือเหตุการณ์สำคัญ..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            {/* Quick Upload Files */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                แนบไฟล์หลักฐาน (PDF, รูปภาพ, รายงาน, ลิงก์ Drive)
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-amber-400 hover:bg-amber-50/20 transition-all cursor-pointer relative">
                <input
                  id="evidence-file-upload-input"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-slate-700">
                  คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  รองรับ PDF, DOCX, XLSX, JPG, PNG, MP4 (ไฟล์จะถูกส่งไปเก็บใน Google Drive)
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-semibold text-slate-600">ไฟล์ที่เลือก ({selectedFiles.length} ไฟล์):</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="truncate text-slate-700 font-medium">{file.name}</span>
                          <span className="text-slate-400">({(file.size / 1024).toFixed(0)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSelectedFile(idx)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Assistant Quick Trigger */}
            <div className="p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/50 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  AI Analysis & Writing Engine
                </div>
                <div className="text-xs text-amber-800/80 mt-0.5">
                  กดปุ่มนี้เพื่อให้ Gemini วิเคราะห์หาตัวชี้วัดที่สอดคล้อง แนะนำสิ่งที่ยังขาด และร่างข้อความรายงานทันที
                </div>
              </div>
              <button
                id="trigger-ai-analyze-btn"
                type="button"
                onClick={handleTriggerAI}
                disabled={isAnalyzing || !title.trim()}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 shrink-0 transition-all cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    กำลังวิเคราะห์ด้วย AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    วิเคราะห์ผลงานด้วย AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Result Card (Shows when analyzed) */}
          {aiResult && (
            <div className="bg-white rounded-2xl p-6 border-2 border-amber-400/60 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-lg flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    AI แนะนำ (ความมั่นใจ {aiResult.confidence}%)
                  </span>
                  <span className="text-xs text-slate-400">
                    * คุณสามารถปรับเปลี่ยนตัวชี้วัดได้ก่อนบันทึก
                  </span>
                </div>
              </div>

              {/* Primary Criterion Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  ตัวชี้วัดหลัก (Primary Criterion)
                </label>
                <select
                  id="primary-criterion-select"
                  value={selectedPrimaryCriterion}
                  onChange={(e) => setSelectedPrimaryCriterion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/30 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- เลือกตัวชี้วัดหลัก --</option>
                  {activeCriteria.map((c) => (
                    <option key={c.criterion_id} value={c.criterion_id}>
                      [{c.criterion_code}] {c.criterion_name} ({c.aspect})
                    </option>
                  ))}
                </select>
                {aiResult.reasoningSummary && (
                  <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-700">เหตุผลที่ AI แนะนำ:</span> {aiResult.reasoningSummary}
                  </p>
                )}
              </div>

              {/* Secondary Criteria Multi-select checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  ตัวชี้วัดสนับสนุน (Secondary Criteria)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {aiResult.secondaryCriteria?.map((sec) => {
                    const cInfo = activeCriteria.find(c => c.criterion_id === sec.criterion_id);
                    const isChecked = selectedSecondaryCriteria.includes(sec.criterion_id);
                    return (
                      <label 
                        key={sec.criterion_id} 
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isChecked ? 'bg-amber-50/60 border-amber-300 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSecondaryCriteria(prev => [...prev, sec.criterion_id]);
                            } else {
                              setSelectedSecondaryCriteria(prev => prev.filter(id => id !== sec.criterion_id));
                            }
                          }}
                          className="mt-0.5 rounded-sm text-amber-600 focus:ring-amber-500"
                        />
                        <div>
                          <div className="font-semibold">
                            {cInfo ? `[${cInfo.criterion_code}] ${cInfo.criterion_name}` : sec.criterion_id}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            ความมั่นใจ {sec.confidence}%: {sec.reason}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* AI Draft Texts */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-800">
                  ร่างข้อความประกอบการประเมิน (สามารถแก้ไขได้ตามจริง):
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-600">แบบสั้น (สำหรับ Portfolio Card):</span>
                  <input
                    type="text"
                    value={aiResult.shortEvaluationText}
                    onChange={(e) => setAiResult({ ...aiResult, shortEvaluationText: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-600">แบบทางการ (สำหรับรายงานผลการปฏิบัติงาน):</span>
                  <textarea
                    rows={3}
                    value={aiResult.formalEvaluationText}
                    onChange={(e) => setAiResult({ ...aiResult, formalEvaluationText: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              {/* Missing Information & Recommendations */}
              {(aiResult.missingInformation.length > 0 || aiResult.recommendedEvidence.length > 0) && (
                <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 text-xs">
                  {aiResult.missingInformation.length > 0 && (
                    <div>
                      <span className="font-bold text-amber-900">ข้อมูลที่ยังขาดเพื่อความสมบูรณ์:</span>
                      <ul className="list-disc list-inside text-amber-800 mt-1 space-y-0.5">
                        {aiResult.missingInformation.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiResult.recommendedEvidence.length > 0 && (
                    <div>
                      <span className="font-bold text-amber-900">ข้อเสนอแนะหลักฐานที่ควรจัดเก็บเพิ่มเติม:</span>
                      <ul className="list-disc list-inside text-amber-800 mt-1 space-y-0.5">
                        {aiResult.recommendedEvidence.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Toggle Extended Fields */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  2. รายละเอียดเพิ่มเติม (Outcome, ข้อมูลเชิงปริมาณ, ปัญหาที่พบ)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ไม่บังคับกรอกทันที สามารถกลับมาเติมได้ตลอดทั้งปีการศึกษา
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExtended(!showExtended)}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200"
              >
                {showExtended ? 'ย่อรายละเอียด' : '+ แสดงฟิลด์เพิ่มเติม'}
              </button>
            </div>

            {showExtended && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      กระบวนการดำเนินงาน (Process)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="ขั้นตอน 1, 2, 3..."
                      value={processText}
                      onChange={(e) => setProcessText(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ผลผลิต (Output)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="เช่น ชิ้นงาน, สื่อ, นวัตกรรมที่เกิดขึ้น..."
                      value={output}
                      onChange={(e) => setOutput(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ข้อมูลเชิงปริมาณ (Quantitative Result)
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น นักเรียนร้อยละ 85 มีคะแนนผ่านเกณฑ์..."
                      value={quantitativeResult}
                      onChange={(e) => setQuantitativeResult(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ข้อมูลเชิงคุณภาพ (Qualitative Result)
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น เกิดทักษะการทำงานเป็นทีม ความกระตือรือร้น..."
                      value={qualitativeResult}
                      onChange={(e) => setQualitativeResult(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ปัญหาและอุปสรรค
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น อุปกรณ์ไม่เพียงพอ..."
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      การแก้ไขและพัฒนา
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น ปรับการทำงานเป็นกลุ่มย่อย..."
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      สิ่งที่ได้เรียนรู้
                    </label>
                    <input
                      type="text"
                      placeholder="ข้อค้นพบเพื่อนำไปต่อยอด..."
                      value={lessonLearned}
                      onChange={(e) => setLessonLearned(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    แท็ก (Tags) สำหรับการค้นหา
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="พิมพ์แท็กแล้วกด เพิ่ม..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800 flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
                    >
                      เพิ่มแท็ก
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((t, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                          #{t}
                          <button type="button" onClick={() => handleRemoveTag(t)} className="text-slate-400 hover:text-rose-500">
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onNavigateToPortfolio}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              id="submit-save-evidence-btn"
              type="button"
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังบันทึกและส่งข้อมูล...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  บันทึกผลงานเข้าระบบ
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
