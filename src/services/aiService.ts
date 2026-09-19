import { EvidenceItem, Criterion, UserProfile, PAPlan } from '../types';

export async function analyzeEvidenceWithAI(evidenceData: Partial<EvidenceItem>, profile: UserProfile, activeCriteria: Criterion[]) {
  const res = await fetch('/api/ai/analyze-evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: evidenceData.title,
      description: evidenceData.description,
      activityType: evidenceData.activity_type,
      role: evidenceData.role,
      processText: evidenceData.process,
      output: evidenceData.output,
      outcome: evidenceData.outcome,
      quantitativeResult: evidenceData.quantitative_result,
      qualitativeResult: evidenceData.qualitative_result,
      files: evidenceData.files,
      profile,
      activeCriteria
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'การวิเคราะห์ AI ล้มเหลว');
  }

  const result = await res.json();
  return result.data;
}

export async function summarizeCriterionWithAI(criterion: Criterion, evidenceList: EvidenceItem[], profile: UserProfile) {
  const res = await fetch('/api/ai/summarize-criterion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      criterion,
      evidenceList,
      profile
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'การสร้างบทสรุปตัวชี้วัดล้มเหลว');
  }

  const result = await res.json();
  return result.data;
}

export async function runGapAnalysisWithAI(profile: UserProfile, paPlan: PAPlan, criteria: Criterion[], evidenceList: EvidenceItem[]) {
  const res = await fetch('/api/ai/gap-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile,
      paPlan,
      criteria,
      evidenceList
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'การวิเคราะห์ช่องว่างล้มเหลว');
  }

  const result = await res.json();
  return result.data;
}

export interface ExpandedDescriptionResult {
  expandedDescription: string;
  pedagogicalLevelVerb: string;
  process: string;
  output: string;
  outcome: string;
  quantitativeResult: string;
  qualitativeResult: string;
  suggestedCriteriaIds: string[];
}

export async function expandDescriptionWithAI(
  evidenceData: Partial<EvidenceItem>,
  profile: UserProfile
): Promise<ExpandedDescriptionResult> {
  const standing = profile.academicStanding || 'ชำนาญการพิเศษ';
  
  // Determine standard verb based on ก.ค.ศ. guidelines
  let verbStandard = 'ริเริ่ม พัฒนา';
  if (standing.includes('เชี่ยวชาญพิเศษ')) {
    verbStandard = 'สร้างการเปลี่ยนแปลง';
  } else if (standing.includes('เชี่ยวชาญ')) {
    verbStandard = 'คิดค้น ปรับเปลี่ยน';
  } else if (standing.includes('ชำนาญการพิเศษ')) {
    verbStandard = 'ริเริ่ม พัฒนา';
  } else if (standing.includes('ชำนาญการ')) {
    verbStandard = 'แก้ไขปัญหา';
  } else {
    verbStandard = 'ปรับประยุกต์';
  }

  try {
    const res = await fetch('/api/ai/expand-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: evidenceData.title,
        description: evidenceData.description,
        activityType: evidenceData.activity_type,
        academicStanding: standing,
        position: profile.position,
        subject: evidenceData.subject || profile.teachingSubjects?.[0] || 'วิชาการ',
        gradeLevel: evidenceData.grade_level || profile.gradeLevels?.[0] || 'มัธยมศึกษา',
        existingProcess: evidenceData.process,
        existingOutput: evidenceData.output,
        existingOutcome: evidenceData.outcome
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn('Backend AI expand API unavailable, using intelligent PA template fallback:', err);
  }

  // High-craft deterministic rule-based fallback according to OTEPC ว9/2564
  const title = evidenceData.title || 'การจัดกิจกรรมการเรียนรู้';
  const rawDesc = evidenceData.description || '';
  const subject = evidenceData.subject || profile.teachingSubjects?.[0] || 'กลุ่มสาระการเรียนรู้';

  return {
    expandedDescription: `ได้ดำเนินการ${verbStandard}การจัดการเรียนรู้และนวัตกรรมการศึกษาในหัวข้อ "${title}" สำหรับผู้เรียนในกลุ่มสาระ${subject} ${rawDesc ? `โดยมีเป้าหมายเพื่อ${rawDesc} ` : ''}มุ่งเน้นการจัดการเรียนรู้เชิงรุก (Active Learning) ที่เปิดโอกาสให้ผู้เรียนได้ลงมือปฏิบัติจริง มีการแก้ปัญหาและพัฒนาทักษะตามสมรรถนะสำคัญของผู้เรียนอย่างเป็นระบบตามมาตรฐาน ว.PA`,
    pedagogicalLevelVerb: verbStandard,
    process: `1. วางแผน (Plan): วิเคราะห์หลักสูตรและมาตรฐานการเรียนรู้ เพื่อ${verbStandard}รูปแบบและแผนการจัดการเรียนรู้ที่เน้นผู้เรียนเป็นสำคัญ\n2. ปฏิบัติการ (Do): ดำเนินกิจกรรมการเรียนรู้ "${title}" โดยใช้สื่อ นวัตกรรม และเทคโนโลยีดิจิทัลประกอบการสอน\n3. ตรวจสอบ (Check): วัดและประเมินผลสัมฤทธิ์ทางการเรียนและทักษะกระบวนการของผู้เรียนด้วยเครื่องมือที่หลากหลาย\n4. ปรับปรุงพัฒนา (Act): นำผลการประเมินและสะท้อนคิด (Reflection) มาปรับประยุกต์และแลกเปลี่ยนเรียนรู้ผ่านชุมชนการเรียนรู้ทางวิชาชีพ (PLC)`,
    output: `แผนการจัดการเรียนรู้ สื่อ/นวัตกรรมประกอบการจัดกิจกรรม "${title}" และแบบประเมินผลการเรียนรู้ของผู้เรียน`,
    outcome: `ผู้เรียนเกิดองค์ความรู้ ทักษะกระบวนการ และมีเจตคติที่ดีต่อการเรียนรู้ สามารถเชื่อมโยงสู่การปฏิบัติและแก้ปัญหาในชีวิตจริงได้`,
    quantitativeResult: `ผู้เรียนไม่น้อยกว่าร้อยละ 80 มีผลสัมฤทธิ์ทางการเรียนหรือทักษะผ่านเกณฑ์การประเมินที่กำหนดไว้ในหลักสูตร`,
    qualitativeResult: `ผู้เรียนมีความกระตือรือร้น มีความพึงพอใจต่อรูปแบบกิจกรรมการเรียนรู้ในระดับดีมาก และมีสมรรถนะสำคัญตามหลักสูตร`,
    suggestedCriteriaIds: ['PA-1.1', 'PA-1.2', 'PA-1.3']
  };
}

export interface AutoMapResult {
  primaryCriterionId: string;
  primaryReason: string;
  matchedCriteria: Array<{
    criterion_id: string;
    relation_type: 'Primary' | 'Supporting';
    confidence: number;
    reason: string;
  }>;
}

export async function autoMapCriteriaWithAI(
  evidence: Partial<EvidenceItem>,
  activeCriteria: Criterion[],
  profile: UserProfile
): Promise<AutoMapResult> {
  try {
    const res = await fetch('/api/ai/auto-map-criteria', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evidence,
        activeCriteria,
        profile
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn('Backend auto-map criteria failed, falling back to heuristic keyword mapper:', err);
  }

  // Heuristic rule-based multi-criteria mapper (maps to 1 primary and multiple supporting criteria)
  const titleAndDesc = `${evidence.title || ''} ${evidence.description || ''} ${evidence.activity_type || ''}`.toLowerCase();
  
  let primaryId = 'PA-1.1';
  let primaryReason = 'สอดคล้องกับการพัฒนาหลักสูตรและการจัดทำแผนการเรียนรู้';
  const matchedList: AutoMapResult['matchedCriteria'] = [];

  if (titleAndDesc.includes('สื่อ') || titleAndDesc.includes('นวัตกรรม') || titleAndDesc.includes('เทคโนโลยี') || titleAndDesc.includes('แอป')) {
    primaryId = 'PA-1.4';
    primaryReason = 'สอดคล้องกับการสร้างและหรือพัฒนาสื่อนวัตกรรมเทคโนโลยีและแหล่งเรียนรู้';
    matchedList.push({
      criterion_id: 'PA-1.4',
      relation_type: 'Primary',
      confidence: 95,
      reason: 'มีการสร้างหรือประยุกต์ใช้สื่อนวัตกรรมโดยตรง'
    });
    matchedList.push({
      criterion_id: 'PA-1.2',
      relation_type: 'Supporting',
      confidence: 85,
      reason: 'นำสื่อไปใช้ประกอบการออกแบบการจัดการเรียนรู้'
    });
  } else if (titleAndDesc.includes('วัด') || titleAndDesc.includes('ประเมิน') || titleAndDesc.includes('ข้อสอบ') || titleAndDesc.includes('รูบริก')) {
    primaryId = 'PA-1.5';
    primaryReason = 'สอดคล้องกับการวัดและประเมินผลการเรียนรู้';
    matchedList.push({
      criterion_id: 'PA-1.5',
      relation_type: 'Primary',
      confidence: 95,
      reason: 'เครื่องมือและเกณฑ์การวัดประเมินผลการเรียนรู้'
    });
    matchedList.push({
      criterion_id: 'PA-1.6',
      relation_type: 'Supporting',
      confidence: 80,
      reason: 'นำผลการประเมินไปศึกษาแก้ปัญหาและพัฒนาการเรียนรู้'
    });
  } else if (titleAndDesc.includes('วิจัย') || titleAndDesc.includes('แก้ปัญหา') || titleAndDesc.includes('คลินิก')) {
    primaryId = 'PA-1.6';
    primaryReason = 'สอดคล้องกับการศึกษา วิเคราะห์ และสังเคราะห์ เพื่อแก้ปัญหาหรือพัฒนาการเรียนรู้';
    matchedList.push({
      criterion_id: 'PA-1.6',
      relation_type: 'Primary',
      confidence: 95,
      reason: 'มีกระบวนการศึกษาและวิจัยแก้ปัญหาผู้เรียน'
    });
    matchedList.push({
      criterion_id: 'PA-1.2',
      relation_type: 'Supporting',
      confidence: 85,
      reason: 'พัฒนาการออกแบบการเรียนรู้ต่อเนื่อง'
    });
  } else if (titleAndDesc.includes('plc') || titleAndDesc.includes('ชุมชนแห่งการเรียนรู้') || titleAndDesc.includes('แลกเปลี่ยน')) {
    primaryId = 'PA-3.2';
    primaryReason = 'สอดคล้องกับการมีส่วนร่วมในการแลกเปลี่ยนเรียนรู้ทางวิชาชีพเพื่อพัฒนาการจัดการเรียนรู้';
    matchedList.push({
      criterion_id: 'PA-3.2',
      relation_type: 'Primary',
      confidence: 95,
      reason: 'เป็นกิจกรรม PLC และการแลกเปลี่ยนเรียนรู้ร่วมกับเพื่อนครู'
    });
    matchedList.push({
      criterion_id: 'PA-3.3',
      relation_type: 'Supporting',
      confidence: 85,
      reason: 'นำความรู้และทักษะจาก PLC มาพัฒนาการจัดการเรียนรู้'
    });
    matchedList.push({
      criterion_id: 'PA-2.3',
      relation_type: 'Supporting',
      confidence: 75,
      reason: 'การประสานความร่วมมือกับผู้ร่วมงาน'
    });
  } else if (titleAndDesc.includes('อบรม') || titleAndDesc.includes('สัมมนา') || titleAndDesc.includes('พัฒนาตนเอง')) {
    primaryId = 'PA-3.1';
    primaryReason = 'สอดคล้องกับการพัฒนาตนเองอย่างเป็นระบบและต่อเนื่อง';
    matchedList.push({
      criterion_id: 'PA-3.1',
      relation_type: 'Primary',
      confidence: 95,
      reason: 'การเข้ารับการพัฒนาสมรรถนะวิชาชีพครู'
    });
    matchedList.push({
      criterion_id: 'PA-3.3',
      relation_type: 'Supporting',
      confidence: 85,
      reason: 'นำความรู้จากการพัฒนาตนเองมาปรับใช้ในการจัดการเรียนรู้'
    });
  } else if (titleAndDesc.includes('เยี่ยมบ้าน') || titleAndDesc.includes('ดูแล') || titleAndDesc.includes('ช่วยเหลือ') || titleAndDesc.includes('แนะแนว')) {
    primaryId = 'PA-2.2';
    primaryReason = 'สอดคล้องกับการจัดระบบดูแลช่วยเหลือนักเรียน';
    matchedList.push({
      criterion_id: 'PA-2.2',
      relation_type: 'Primary',
      confidence: 95,
      reason: 'การติดตาม คัดกรอง และส่งเสริมนักเรียนเป็นรายบุคคล'
    });
    matchedList.push({
      criterion_id: 'PA-2.1',
      relation_type: 'Supporting',
      confidence: 80,
      reason: 'การจัดทำข้อมูลสารสนเทศของผู้เรียน'
    });
  } else {
    primaryId = 'PA-1.2';
    primaryReason = 'สอดคล้องกับการออกแบบการจัดการเรียนรู้';
    matchedList.push({
      criterion_id: 'PA-1.2',
      relation_type: 'Primary',
      confidence: 90,
      reason: 'การออกแบบกิจกรรมการเรียนรู้ Active Learning'
    });
    matchedList.push({
      criterion_id: 'PA-1.1',
      relation_type: 'Supporting',
      confidence: 85,
      reason: 'สอดคล้องกับมาตรฐานหลักสูตรและการจัดทำหน่วยการเรียนรู้'
    });
    matchedList.push({
      criterion_id: 'PA-1.3',
      relation_type: 'Supporting',
      confidence: 80,
      reason: 'การจัดกิจกรรมการเรียนรู้ที่เอื้อต่อการพัฒนาผู้เรียน'
    });
  }

  return {
    primaryCriterionId: primaryId,
    primaryReason,
    matchedCriteria: matchedList
  };
}
