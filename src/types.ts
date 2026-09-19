export type EvaluationType = 'PA' | 'SALARY_ROUND_1' | 'SALARY_ROUND_2' | 'BOTH';

export type ActivityType =
  | 'การจัดการเรียนรู้'
  | 'การพัฒนาหลักสูตร'
  | 'นวัตกรรม'
  | 'สื่อการเรียนรู้'
  | 'วิจัยในชั้นเรียน'
  | 'การวัดและประเมินผล'
  | 'PLC'
  | 'อบรม'
  | 'วิทยากร'
  | 'กรรมการ'
  | 'งานวิชาการ'
  | 'งานพิเศษ'
  | 'ดูแลนักเรียน'
  | 'โครงงานนักเรียน'
  | 'แข่งขัน'
  | 'รางวัล'
  | 'ความร่วมมือภายนอก'
  | 'บริการวิชาการ'
  | 'อื่น ๆ';

export interface UserProfile {
  name: string;
  position: string;
  academicStanding: string; // วิทยฐานะ (เช่น ชำนาญการ, ชำนาญการพิเศษ, เชี่ยวชาญ)
  school: string;
  affiliation: string; // สังกัด เช่น สพม., สพป.
  education: string;
  major: string;
  teachingSubjects: string[];
  gradeLevels: string[];
  specialAssignments: string[];
  avatarUrl?: string;
  fiscalYear: string; // e.g. "2570"
}

export interface Criterion {
  criterion_id: string; // e.g. "PA-1.1", "SAL-1.1", "SAL-2"
  criterion_code: string; // "1.1", "1.2", ...
  criterion_name: string;
  criterion_description: string;
  evaluation_type: 'PA' | 'SALARY' | 'BOTH';
  aspect: 'ด้านที่ 1 การจัดการเรียนรู้' | 'ด้านที่ 2 การส่งเสริมและสนับสนุน' | 'ด้านที่ 3 การพัฒนาตนเองและวิชาชีพ' | 'องค์ประกอบที่ 1' | 'องค์ประกอบที่ 2' | 'องค์ประกอบที่ 3';
  parent_criterion?: string;
  weight?: number;
  criteria_version: string;
  official_reference: string;
  criteria_scope: 'Official / OTEPC' | 'School Policy' | 'User Custom';
  is_active: boolean;
}

export interface EvidenceFile {
  file_id: string;
  evidence_id: string;
  drive_file_id?: string;
  drive_url?: string;
  file_name: string;
  mime_type: string;
  file_size?: number;
  file_category: 'คำสั่ง/โครงการ' | 'แผนการสอน/กิจกรรม' | 'ภาพถ่าย' | 'ชิ้นงาน/ผลสัมฤทธิ์' | 'รายงานสรุป' | 'อื่น ๆ';
  uploaded_at: string;
}

export interface EvidenceCriterionMap {
  mapping_id: string;
  evidence_id: string;
  criterion_id: string;
  relation_type: 'Primary' | 'Supporting';
  ai_confidence: number; // 0 - 100
  ai_reason: string;
  user_confirmed: boolean;
  confirmed_at?: string;
}

export interface EvidenceItem {
  evidence_id: string; // e.g. "E-2570-0001"
  title: string;
  activity_type: ActivityType;
  start_date: string; // YYYY-MM-DD
  end_date?: string;
  description: string;
  role: string; // เช่น ผู้สอนหลัก, วิทยากร, คณะทำงาน
  subject?: string;
  grade_level?: string;
  target_group?: string;
  participant_count?: number;
  process?: string; // สิ่งที่ดำเนินการ
  output?: string; // ผลผลิต
  outcome?: string; // ผลลัพธ์
  quantitative_result?: string; // ข้อมูลเชิงปริมาณ
  qualitative_result?: string; // ข้อมูลเชิงคุณภาพ
  problem?: string; // ปัญหาที่พบ
  solution?: string; // การแก้ไข
  lesson_learned?: string; // สิ่งที่ได้เรียนรู้
  external_links?: string[];
  tags: string[];
  fiscal_year: string; // e.g. "2570"
  salary_cycle?: 'ROUND_1' | 'ROUND_2' | 'BOTH';
  pa_cycle?: string; // e.g. "2570"
  created_at: string;
  updated_at: string;
  status: 'ACTIVE' | 'TRASH';
  
  // Attached files and criteria mappings
  files: EvidenceFile[];
  criteria_mappings: EvidenceCriterionMap[];
  
  // AI analysis cache
  ai_analysis?: AIAnalysisResult;
  generated_texts?: GeneratedText[];
}

export interface AIAnalysisResult {
  summary: string;
  activityType?: string;
  suggestedPrimaryCriterion: string;
  secondaryCriteria: Array<{
    criterion_id: string;
    confidence: number;
    reason: string;
  }>;
  confidence: number;
  reasoningSummary: string;
  missingInformation: string[];
  recommendedEvidence: string[];
  shortEvaluationText: string;
  formalEvaluationText: string;
  outcomeAnalysis: string;
  warnings: string[];
  analyzedAt: string;
}

export interface GeneratedText {
  generated_text_id: string;
  evidence_id: string;
  criterion_id?: string;
  text_type: 'SHORT' | 'FORMAL_REPORT' | 'CRITERION_LINK';
  text_content: string;
  model: string;
  created_at: string;
  is_selected: boolean;
}

export interface PAPlan {
  fiscal_year: string;
  teaching_load_hours: number;
  support_tasks: string;
  school_quality_tasks: string;
  policy_tasks: string;
  target_indicators: string;
  challenge_topic: string;
  challenge_problem: string;
  challenge_method: string;
  challenge_expected_quantitative: string;
  challenge_expected_qualitative: string;
  challenge_progress_percent?: number;
  pa1_file_drive_url?: string;
}

export interface SalaryEvaluationForm {
  cycle: 'ROUND_1' | 'ROUND_2';
  fiscal_year: string;
  self_score_part1?: number; // งานตามมาตรฐาน 60
  self_score_part2?: number; // ประเด็นท้าทาย 20
  self_score_part3?: number; // การมีส่วนร่วม 10
  self_score_part4?: number; // วินัยคุณธรรม 10
  actual_score_total?: number;
  evaluator_feedback?: string;
}

export interface SystemSettings {
  appName: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  driveFolderId?: string;
  driveFolderName?: string;
  userEmail: string;
  fiscalYear: string;
  currentCycle: 'ROUND_1' | 'ROUND_2';
  geminiModel: string;
  isGoogleConnected: boolean;
  privacyMaskStudentNames: boolean;
}
