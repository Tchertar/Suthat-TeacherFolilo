import React, { useState } from 'react';
import { 
  EvidenceItem, 
  Criterion, 
  UserProfile, 
  EvidenceFile, 
  ActivityType,
  EvidenceCriterionMap 
} from '../types';
import { ACTIVITY_TYPES } from '../constants';
import { expandDescriptionWithAI, autoMapCriteriaWithAI } from '../services/aiService';
import { uploadFileToDrive } from '../services/googleWorkspaceService';
import { 
  X, 
  Sparkles, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Paperclip, 
  Tag, 
  Trash2, 
  ExternalLink,
  Loader2,
  Plus,
  Link as LinkIcon,
  Check,
  Layers,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EditEvidenceModalProps {
  evidence: EvidenceItem;
  criteria: Criterion[];
  profile: UserProfile;
  driveFolderId?: string;
  onSave: (updatedEvidence: EvidenceItem) => void;
  onClose: () => void;
}

export const EditEvidenceModal: React.FC<EditEvidenceModalProps> = ({
  evidence,
  criteria,
  profile,
  driveFolderId,
  onSave,
  onClose
}) => {
  // Form state
  const [title, setTitle] = useState(evidence.title || '');
  const [activityType, setActivityType] = useState<ActivityType>(evidence.activity_type || 'การจัดการเรียนรู้');
  const [startDate, setStartDate] = useState(evidence.start_date || '');
  const [endDate, setEndDate] = useState(evidence.end_date || '');
  const [role, setRole] = useState(evidence.role || 'ผู้สอนหลัก');
  const [subject, setSubject] = useState(evidence.subject || profile.teachingSubjects?.[0] || '');
  const [gradeLevel, setGradeLevel] = useState(evidence.grade_level || profile.gradeLevels?.[0] || '');
  const [description, setDescription] = useState(evidence.description || '');
  const [processText, setProcessText] = useState(evidence.process || '');
  const [output, setOutput] = useState(evidence.output || '');
  const [outcome, setOutcome] = useState(evidence.outcome || '');
  const [quantitativeResult, setQuantitativeResult] = useState(evidence.quantitative_result || '');
  const [qualitativeResult, setQualitativeResult] = useState(evidence.qualitative_result || '');
  const [tags, setTags] = useState<string[]>(evidence.tags || []);
  const [tagInput, setTagInput] = useState('');

  // Existing files and new files
  const [existingFiles, setExistingFiles] = useState<EvidenceFile[]>(evidence.files || []);
  const [newSelectedFiles, setNewSelectedFiles] = useState<File[]>([]);
  const [fileCategory, setFileCategory] = useState<EvidenceFile['file_category']>('ภาพถ่าย');
  const [newExternalLink, setNewExternalLink] = useState('');
  const [externalLinks, setExternalLinks] = useState<string[]>(evidence.external_links || []);

  // Criteria mappings state (Multi-criteria)
  const [selectedCriteriaIds, setSelectedCriteriaIds] = useState<string[]>(
    evidence.criteria_mappings?.map(m => m.criterion_id) || []
  );
  const [primaryCriterionId, setPrimaryCriterionId] = useState<string>(
    evidence.criteria_mappings?.find(m => m.relation_type === 'Primary')?.criterion_id || 
    evidence.criteria_mappings?.[0]?.criterion_id || 
    ''
  );

  // AI states
  const [isExpanding, setIsExpanding] = useState(false);
  const [isAutoMapping, setIsAutoMapping] = useState(false);
  const [expandedNotice, setExpandedNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Academic standing verb
  const standing = profile.academicStanding || 'ชำนาญการพิเศษ';
  const expectedVerb = standing.includes('เชี่ยวชาญพิเศษ')
    ? 'สร้างการเปลี่ยนแปลง'
    : standing.includes('เชี่ยวชาญ')
    ? 'คิดค้น ปรับเปลี่ยน'
    : standing.includes('ชำนาญการพิเศษ')
    ? 'ริเริ่ม พัฒนา'
    : standing.includes('ชำนาญการ')
    ? 'แก้ไขปัญหา'
    : 'ปรับประยุกต์';

  // Toggle criteria selection
  const handleToggleCriterion = (critId: string) => {
    setSelectedCriteriaIds(prev => {
      if (prev.includes(critId)) {
        const next = prev.filter(id => id !== critId);
        if (primaryCriterionId === critId) {
          setPrimaryCriterionId(next[0] || '');
        }
        return next;
      } else {
        if (!primaryCriterionId) {
          setPrimaryCriterionId(critId);
        }
        return [...prev, critId];
      }
    });
  };

  // AI Expand Description by Academic Standing
  const handleAIExpand = async () => {
    if (!title.trim() && !description.trim()) {
      setErrorMessage('กรุณาระบุชื่อผลงานหรือข้อความเบื้องต้นก่อนให้ AI ขยายความ');
      return;
    }
    setErrorMessage('');
    setIsExpanding(true);

    try {
      const result = await expandDescriptionWithAI(
        {
          title,
          description,
          activity_type: activityType,
          subject,
          grade_level: gradeLevel,
          process: processText,
          output,
          outcome
        },
        profile
      );

      setDescription(result.expandedDescription);
      if (result.process) setProcessText(result.process);
      if (result.output) setOutput(result.output);
      if (result.outcome) setOutcome(result.outcome);
      if (result.quantitativeResult) setQuantitativeResult(result.quantitativeResult);
      if (result.qualitativeResult) setQualitativeResult(result.qualitativeResult);

      // Also suggest criteria if none selected
      if (result.suggestedCriteriaIds && result.suggestedCriteriaIds.length > 0) {
        setSelectedCriteriaIds(prev => {
          const combined = Array.from(new Set([...prev, ...result.suggestedCriteriaIds]));
          return combined;
        });
        if (!primaryCriterionId && result.suggestedCriteriaIds[0]) {
          setPrimaryCriterionId(result.suggestedCriteriaIds[0]);
        }
      }

      setExpandedNotice(`ขยายความตามระดับวิทยฐานะ "${standing}" เรียบร้อยแล้ว (มาตรฐาน: "${result.pedagogicalLevelVerb}")`);
      setTimeout(() => setExpandedNotice(null), 6000);
    } catch (err: any) {
      setErrorMessage(err.message || 'ขยายความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsExpanding(false);
    }
  };

  // AI Auto-map to multiple criteria
  const handleAIAutoMap = async () => {
    if (!title.trim()) {
      setErrorMessage('กรุณาระบุชื่อผลงานก่อนให้ AI จัดตัวชี้วัด');
      return;
    }
    setIsAutoMapping(true);
    setErrorMessage('');

    try {
      const mapRes = await autoMapCriteriaWithAI(
        {
          title,
          description,
          activity_type: activityType,
          process: processText,
          output,
          outcome
        },
        criteria,
        profile
      );

      if (mapRes.matchedCriteria && mapRes.matchedCriteria.length > 0) {
        const matchedIds = mapRes.matchedCriteria.map(m => m.criterion_id);
        setSelectedCriteriaIds(Array.from(new Set([...matchedIds])));
        setPrimaryCriterionId(mapRes.primaryCriterionId || matchedIds[0]);
        setExpandedNotice(`จัดผลงานเข้า ${matchedIds.length} ตัวชี้วัดที่เหมาะสมเรียบร้อยแล้ว`);
        setTimeout(() => setExpandedNotice(null), 5000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'การจัดตัวชี้วัดอัตโนมัติล้มเหลว');
    } finally {
      setIsAutoMapping(false);
    }
  };

  // Handle file additions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setNewSelectedFiles(prev => [...prev, ...filesArr]);
    }
  };

  const handleRemoveExistingFile = (fileId: string) => {
    setExistingFiles(prev => prev.filter(f => f.file_id !== fileId));
  };

  const handleRemoveNewSelectedFile = (idx: number) => {
    setNewSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddExternalLink = () => {
    if (newExternalLink.trim()) {
      let formatted = newExternalLink.trim();
      if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
        formatted = `https://${formatted}`;
      }
      setExternalLinks(prev => [...prev, formatted]);
      setNewExternalLink('');
    }
  };

  const handleRemoveExternalLink = (idx: number) => {
    setExternalLinks(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter(x => x !== t));
  };

  // Save changes
  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMessage('กรุณาระบุชื่อผลงานหรือกิจกรรม');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const finalFiles: EvidenceFile[] = [...existingFiles];

      // Upload newly attached files if any
      for (const f of newSelectedFiles) {
        try {
          const uploaded = await uploadFileToDrive(f, driveFolderId);
          finalFiles.push({
            file_id: `F-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            evidence_id: evidence.evidence_id,
            drive_file_id: uploaded.id,
            drive_url: uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`,
            file_name: f.name,
            mime_type: f.type,
            file_size: f.size,
            file_category: fileCategory,
            uploaded_at: new Date().toISOString()
          });
        } catch (uploadErr) {
          console.warn('Drive upload bypassed, attaching local reference:', uploadErr);
          finalFiles.push({
            file_id: `F-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            evidence_id: evidence.evidence_id,
            file_name: f.name,
            mime_type: f.type,
            file_size: f.size,
            file_category: fileCategory,
            uploaded_at: new Date().toISOString()
          });
        }
      }

      // Reconstruct criteria mappings (supporting multiple criteria)
      const finalMappings: EvidenceCriterionMap[] = selectedCriteriaIds.map((cId) => {
        const isPrimary = cId === primaryCriterionId;
        const existingMap = evidence.criteria_mappings?.find(m => m.criterion_id === cId);
        const critObj = criteria.find(c => c.criterion_id === cId);

        return {
          mapping_id: existingMap?.mapping_id || `M-${Date.now()}-${cId}`,
          evidence_id: evidence.evidence_id,
          criterion_id: cId,
          relation_type: isPrimary ? 'Primary' : 'Supporting',
          ai_confidence: existingMap?.ai_confidence || (isPrimary ? 95 : 85),
          ai_reason: existingMap?.ai_reason || (isPrimary ? `ตัวชี้วัดหลัก: ${critObj?.criterion_name || cId}` : `ตัวชี้วัดสนับสนุน: ${critObj?.criterion_name || cId}`),
          user_confirmed: true,
          confirmed_at: new Date().toISOString()
        };
      });

      const updatedItem: EvidenceItem = {
        ...evidence,
        title,
        activity_type: activityType,
        start_date: startDate,
        end_date: endDate || undefined,
        role,
        subject,
        grade_level: gradeLevel,
        description,
        process: processText,
        output,
        outcome,
        quantitative_result: quantitativeResult,
        qualitative_result: qualitativeResult,
        tags,
        external_links: externalLinks,
        files: finalFiles,
        criteria_mappings: finalMappings,
        updated_at: new Date().toISOString()
      };

      onSave(updatedItem);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'บันทึกการแก้ไขไม่สำเร็จ');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-black/[0.08] relative max-h-[92vh] overflow-y-auto space-y-6 text-[#1d1d1f]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
          <div>
            <span className="text-[11px] font-semibold text-[#86868b] bg-black/[0.04] px-2.5 py-0.5 rounded-full">
              แก้ไขผลงาน ({evidence.evidence_id})
            </span>
            <h2 className="text-lg sm:text-xl font-semibold text-[#1d1d1f] tracking-tight mt-1">
              แก้ไขรายละเอียดและเพิ่มหลักฐานในผลงานเดิม
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback alert */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {expandedNotice && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{expandedNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section 1: Basic details */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
              ชื่อผลงาน / กิจกรรม <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ระบุชื่อผลงาน กิจกรรม นวัตกรรม หรือชิ้นงาน"
              className="w-full px-4 py-2.5 bg-[#fbfbfd] border border-black/[0.12] rounded-xl text-xs sm:text-sm text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#86868b] mb-1">
                ประเภทกิจกรรม
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as ActivityType)}
                className="w-full px-3 py-2 bg-[#fbfbfd] border border-black/[0.12] rounded-xl text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:outline-hidden"
              >
                {ACTIVITY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#86868b] mb-1">
                วันที่เริ่มกิจกรรม
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#fbfbfd] border border-black/[0.12] rounded-xl text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#86868b] mb-1">
                บทบาท
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="เช่น ผู้สอนหลัก, วิทยากร"
                className="w-full px-3 py-2 bg-[#fbfbfd] border border-black/[0.12] rounded-xl text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 2: AI Auto-Expand Description based on Academic Standing */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#f5f5f7] via-[#fafafa] to-[#f0f4fa] border border-black/[0.08] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1d1d1f]">
                <Award className="w-4 h-4 text-[#0071e3]" />
                <span>ขยายความตามระดับวิทยฐานะ: <strong>{standing}</strong></span>
                <span className="text-[11px] font-normal text-[#0071e3] bg-[#0071e3]/10 px-2 py-0.5 rounded-md">
                  มาตรฐาน: "{expectedVerb}"
                </span>
              </div>
              <p className="text-[11px] text-[#86868b] mt-0.5">
                ให้ AI นำชื่อผลงานและข้อความเดิมมาเรียบเรียงขยายความให้ครบวงจร PDCA และสอดแทรกคำกริยาตามเกณฑ์ ว.PA
              </p>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAIExpand}
              disabled={isExpanding}
              className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 text-white font-medium text-xs rounded-full shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {isExpanding ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  กำลังขยายความ...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  AI ขยายความตามวิทยฐานะ
                </>
              )}
            </motion.button>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
              คำอธิบายรายละเอียดผลงาน
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุคำอธิบาย หรือกดปุ่ม AI ขยายความตามวิทยฐานะ เพื่อสร้างข้อความอัตโนมัติ"
              className="w-full px-4 py-2.5 bg-white border border-black/[0.12] rounded-xl text-xs sm:text-sm text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:outline-hidden leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
              สิ่งที่ดำเนินการ (Process / ขั้นตอน PDCA)
            </label>
            <textarea
              rows={3}
              value={processText}
              onChange={(e) => setProcessText(e.target.value)}
              placeholder="1. วางแผน 2. ปฏิบัติการ 3. ประเมินผล 4. ปรับปรุงพัฒนา"
              className="w-full px-4 py-2.5 bg-white border border-black/[0.12] rounded-xl text-xs sm:text-sm text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:outline-hidden leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
                ผลผลิต (Output)
              </label>
              <textarea
                rows={2}
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                placeholder="เช่น แผนการสอน, สื่อนวัตกรรม, ใบงาน"
                className="w-full px-3 py-2 bg-white border border-black/[0.12] rounded-xl text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
                ผลลัพธ์ (Outcome)
              </label>
              <textarea
                rows={2}
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="เช่น ผู้เรียนเกิดทักษะการคิดวิเคราะห์"
                className="w-full px-3 py-2 bg-white border border-black/[0.12] rounded-xl text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
                ข้อมูลเชิงปริมาณ (Quantitative)
              </label>
              <input
                type="text"
                value={quantitativeResult}
                onChange={(e) => setQuantitativeResult(e.target.value)}
                placeholder="เช่น ร้อยละ 85 ของผู้เรียนมีผลคะแนนผ่านเกณฑ์"
                className="w-full px-3 py-2 bg-white border border-black/[0.12] rounded-xl text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
                ข้อมูลเชิงคุณภาพ (Qualitative)
              </label>
              <input
                type="text"
                value={qualitativeResult}
                onChange={(e) => setQualitativeResult(e.target.value)}
                placeholder="เช่น ผู้เรียนมีความพึงพอใจและมีเจตคติที่ดี"
                className="w-full px-3 py-2 bg-white border border-black/[0.12] rounded-xl text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Criteria Mapping (Multi-Criteria Supported) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.06] pb-2">
            <div>
              <h3 className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#0071e3]" />
                จัดเข้าตัวชี้วัด (เลือกได้มากกว่า 1 ตัวชี้วัด)
              </h3>
              <p className="text-[11px] text-[#86868b]">
                เลือกตัวชี้วัดที่สอดคล้องกับผลงานนี้ หรือให้ AI แนะนำอัตโนมัติ
              </p>
            </div>

            <button
              type="button"
              onClick={handleAIAutoMap}
              disabled={isAutoMapping}
              className="px-3 py-1.5 bg-[#f0f0f2] hover:bg-[#e4e4e7] disabled:opacity-50 text-[#1d1d1f] text-xs font-medium rounded-full transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              {isAutoMapping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />}
              ให้ AI จัดเข้าตัวชี้วัดอัตโนมัติ
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
            {criteria.map((c) => {
              const isSelected = selectedCriteriaIds.includes(c.criterion_id);
              const isPrimary = c.criterion_id === primaryCriterionId;

              return (
                <div
                  key={c.criterion_id}
                  onClick={() => handleToggleCriterion(c.criterion_id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    isSelected 
                      ? 'bg-[#0071e3]/5 border-[#0071e3]/30 text-[#1d1d1f]' 
                      : 'bg-[#fbfbfd] border-black/[0.06] hover:border-black/[0.15] text-[#515154]'
                  }`}
                >
                  <div className={`w-4 h-4 mt-0.5 rounded-md flex items-center justify-center text-xs shrink-0 transition-colors ${
                    isSelected ? 'bg-[#0071e3] text-white' : 'border border-black/[0.2] bg-white'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div className="min-w-0 flex-1 text-xs">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold truncate">
                        [{c.criterion_code}] {c.criterion_name}
                      </span>
                      {isSelected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrimaryCriterionId(c.criterion_id);
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 transition-colors ${
                            isPrimary 
                              ? 'bg-[#0071e3] text-white' 
                              : 'bg-black/[0.05] text-[#86868b] hover:text-[#1d1d1f]'
                          }`}
                        >
                          {isPrimary ? 'ตัวชี้วัดหลัก ★' : 'ตั้งเป็นหลัก'}
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-[#86868b] line-clamp-1 mt-0.5">
                      {c.aspect}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Add & Manage Evidence Files (เพิ่มหลักฐานในผลงานเดิม) */}
        <div className="space-y-3 border-t border-black/[0.06] pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-[#0071e3]" />
                หลักฐานและเอกสารแนบ ({existingFiles.length + newSelectedFiles.length} รายการ)
              </h3>
              <p className="text-[11px] text-[#86868b]">
                เพิ่มไฟล์ใหม่ หรือแนบลิงก์ Google Drive / เว็บไซต์ ในผลงานนี้
              </p>
            </div>
          </div>

          {/* Existing Files List */}
          {existingFiles.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-[#86868b] block">ไฟล์เดิมในผลงาน:</span>
              {existingFiles.map((f) => (
                <div 
                  key={f.file_id}
                  className="flex items-center justify-between p-2.5 bg-[#fbfbfd] border border-black/[0.06] rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileText className="w-4 h-4 text-[#0071e3] shrink-0" />
                    <span className="font-medium text-[#1d1d1f] truncate">{f.file_name}</span>
                    <span className="text-[10px] text-[#86868b]">({f.file_category})</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {f.drive_url && (
                      <a 
                        href={f.drive_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[#0071e3] hover:underline flex items-center gap-1 text-[11px]"
                      >
                        ดูไฟล์ <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingFile(f.file_id)}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="ลบไฟล์นี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* New Selected Files List */}
          {newSelectedFiles.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-emerald-700 block">ไฟล์ที่เตรียมเพิ่มใหม่:</span>
              {newSelectedFiles.map((file, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-950"
                >
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate font-medium">{file.name}</span>
                    <span className="text-[10px] text-emerald-700">({(file.size / 1024).toFixed(0)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveNewSelectedFile(idx)}
                    className="p-1 text-rose-500 hover:text-rose-700 rounded-md cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Dropzone / Picker */}
          <div className="p-4 border-2 border-dashed border-black/[0.12] hover:border-[#0071e3] rounded-2xl bg-[#fbfbfd] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black/[0.04] flex items-center justify-center text-[#0071e3] shrink-0">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#1d1d1f]">
                  เพิ่มหลักฐานไฟล์ใหม่ (ภาพถ่าย, แผน, สรุปผล, PDF, Word)
                </div>
                <div className="text-[11px] text-[#86868b]">
                  คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={fileCategory}
                onChange={(e) => setFileCategory(e.target.value as EvidenceFile['file_category'])}
                className="px-2.5 py-1.5 bg-white border border-black/[0.12] rounded-xl text-xs text-[#1d1d1f]"
              >
                <option value="ภาพถ่าย">ภาพถ่าย</option>
                <option value="แผนการสอน/กิจกรรม">แผนการสอน/กิจกรรม</option>
                <option value="ชิ้นงาน/ผลสัมฤทธิ์">ชิ้นงาน/ผลสัมฤทธิ์</option>
                <option value="รายงานสรุป">รายงานสรุป</option>
                <option value="คำสั่ง/โครงการ">คำสั่ง/โครงการ</option>
                <option value="อื่น ๆ">อื่น ๆ</option>
              </select>

              <label className="px-3.5 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs rounded-full shadow-xs cursor-pointer shrink-0 transition-colors flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" />
                เลือกไฟล์
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* External Links Section */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-medium text-[#1d1d1f]">
              ลิงก์ภายนอก (เช่น Google Drive, YouTube วิดีโอการสอน, Canva, เว็บไซต์)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-3.5 h-3.5 text-[#86868b] absolute left-3 top-3" />
                <input
                  type="url"
                  value={newExternalLink}
                  onChange={(e) => setNewExternalLink(e.target.value)}
                  placeholder="https://drive.google.com/... หรือ https://..."
                  className="w-full pl-8 pr-3 py-2 bg-[#fbfbfd] border border-black/[0.12] rounded-xl text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:outline-hidden"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddExternalLink();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleAddExternalLink}
                className="px-3 py-2 bg-[#f0f0f2] hover:bg-[#e4e4e7] text-[#1d1d1f] font-medium text-xs rounded-xl transition-colors cursor-pointer"
              >
                เพิ่มลิงก์
              </button>
            </div>

            {externalLinks.length > 0 && (
              <div className="space-y-1 mt-1.5">
                {externalLinks.map((url, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-[#fbfbfd] border border-black/[0.06] rounded-xl text-xs">
                    <a href={url} target="_blank" rel="noreferrer" className="text-[#0071e3] truncate hover:underline flex items-center gap-1.5 pr-2">
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{url}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveExternalLink(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Tags */}
        <div className="space-y-2 border-t border-black/[0.06] pt-4">
          <label className="block text-xs font-medium text-[#1d1d1f]">
            แท็กกำกับผลงาน
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="พิมพ์แท็ก เช่น ActiveLearning, โครงงาน"
              className="flex-1 px-3 py-2 bg-[#fbfbfd] border border-black/[0.12] rounded-xl text-xs text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:outline-hidden"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3.5 py-2 bg-[#f0f0f2] hover:bg-[#e4e4e7] text-[#1d1d1f] font-medium text-xs rounded-xl cursor-pointer"
            >
              เพิ่ม
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 bg-black/[0.04] text-[#1d1d1f] text-xs rounded-full flex items-center gap-1"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-600 ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-5 border-t border-black/[0.06]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 text-[#515154] hover:text-[#1d1d1f] hover:bg-black/[0.04] font-medium text-xs rounded-full transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 text-white font-medium text-xs rounded-full shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                กำลังบันทึกการแก้ไข...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                บันทึกการแก้ไขและหลักฐาน
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
