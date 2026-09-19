import { EvidenceItem } from './types';

export const INITIAL_SAMPLE_EVIDENCE: EvidenceItem[] = [
  {
    evidence_id: 'E-2570-0001',
    title: 'การออกแบบและพัฒนาชุดกิจกรรมการเรียนรู้ Micro:bit เพื่อพัฒนาทักษะคิดคำนวณ',
    activity_type: 'สื่อการเรียนรู้',
    start_date: '2026-05-20',
    end_date: '2026-06-30',
    description: 'จัดทำชุดกิจกรรมการเรียนรู้แบบโครงงานเรื่อง Smart Farm ขนาดจำลอง โดยใช้บอร์ด Micro:bit ร่วมกับเซนเซอร์วัดความชื้นในดิน สำหรับนักเรียนชั้น ม.4/2',
    role: 'ผู้สอนหลักและผู้ออกแบบชุดกิจกรรม',
    subject: 'วิทยาการคำนวณ ม.4',
    grade_level: 'มัธยมศึกษาปีที่ 4',
    target_group: 'นักเรียนห้อง ม.4/2',
    participant_count: 38,
    process: '1. วิเคราะห์มาตรฐานและตัวชี้วัด ว4.2 ม.4\n2. ออกแบบชุดใบกิจกรรม 5 ภารกิจ (Hands-on)\n3. ทดลองใช้ในการเรียนการสอนแบบ Active Learning\n4. ประเมินผลงานผ่านเกณฑ์ Rubric',
    output: 'ชุดกิจกรรม Smart Farm จำลองจำนวน 8 ชุด และใบงานกระบวนการแก้ปัญหาดิจิทัล',
    outcome: 'นักเรียนสามารถออกแบบโปรแกรมและเชื่อมต่อวงจรฮาร์ดแวร์เพื่อแก้ปัญหาการรดน้ำต้นไม้อัตโนมัติได้สำเร็จทุกกลุ่ม',
    quantitative_result: 'นักเรียนร้อยละ 92.11 (35 จาก 38 คน) มีคะแนนประเมินทักษะการเขียนโปรแกรมผ่านเกณฑ์ร้อยละ 75',
    qualitative_result: 'นักเรียนแสดงออกถึงความกระตือรือร้น มีการทำงานเป็นทีม และสามารถอธิบายเหตุผลเชิงตรรกะในงานของตนเองได้ดี',
    problem: 'ช่วงแรกเซนเซอร์บางตัวให้ค่าไม่เสถียร',
    solution: 'ปรับแก้โค้ดเพิ่มตัวกรองสัญญาณรบกวน (Kalman/Moving Average อย่างง่าย)',
    lesson_learned: 'การเรียนรู้ผ่านอุปกรณ์จริงทำให้นามธรรมในวิชาวิทยาการคำนวณจับต้องได้ชัดเจนยิ่งขึ้น',
    tags: ['Micro:bit', 'Active Learning', 'Smart Farm', 'Coding'],
    fiscal_year: '2570',
    salary_cycle: 'ROUND_1',
    pa_cycle: '2570',
    created_at: '2026-06-30T10:00:00Z',
    updated_at: '2026-06-30T10:00:00Z',
    status: 'ACTIVE',
    files: [
      {
        file_id: 'F-001',
        evidence_id: 'E-2570-0001',
        file_name: 'แผนการจัดการเรียนรู้_Microbit_ม4.pdf',
        mime_type: 'application/pdf',
        file_category: 'แผนการสอน/กิจกรรม',
        drive_url: 'https://drive.google.com/sample_plan',
        uploaded_at: '2026-06-30T10:05:00Z'
      },
      {
        file_id: 'F-002',
        evidence_id: 'E-2570-0001',
        file_name: 'ภาพบรรยากาศการจัดกิจกรรม_ActiveLearning.jpg',
        mime_type: 'image/jpeg',
        file_category: 'ภาพถ่าย',
        drive_url: 'https://drive.google.com/sample_photo',
        uploaded_at: '2026-06-30T10:06:00Z'
      }
    ],
    criteria_mappings: [
      {
        mapping_id: 'M-001',
        evidence_id: 'E-2570-0001',
        criterion_id: 'PA-1.4',
        relation_type: 'Primary',
        ai_confidence: 96,
        ai_reason: 'ตรงกับการสร้างและหรือพัฒนาสื่อ นวัตกรรม เทคโนโลยี และแหล่งเรียนรู้ เพื่อส่งเสริมทักษะผู้เรียน',
        user_confirmed: true,
        confirmed_at: '2026-06-30T11:00:00Z'
      },
      {
        mapping_id: 'M-002',
        evidence_id: 'E-2570-0001',
        criterion_id: 'PA-1.3',
        relation_type: 'Supporting',
        ai_confidence: 88,
        ai_reason: 'สะท้อนการจัดกิจกรรมการเรียนรู้แบบ Active Learning',
        user_confirmed: true,
        confirmed_at: '2026-06-30T11:00:00Z'
      },
      {
        mapping_id: 'M-003',
        evidence_id: 'E-2570-0001',
        criterion_id: 'PA-CHALLENGE',
        relation_type: 'Primary',
        ai_confidence: 94,
        ai_reason: 'เป็นส่วนหนึ่งของการดำเนินงานตามประเด็นท้าทายเรื่อง Micro:bit และการคิดเชิงคำนวณ',
        user_confirmed: true,
        confirmed_at: '2026-06-30T11:00:00Z'
      }
    ],
    ai_analysis: {
      summary: 'พัฒนาชุดกิจกรรม Micro:bit Smart Farm ช่วยยกระดับทักษะเขียนโปรแกรมของ นร. ม.4/2 ผ่านเกณฑ์ 92%',
      suggestedPrimaryCriterion: 'PA-1.4',
      secondaryCriteria: [
        { criterion_id: 'PA-1.3', confidence: 88, reason: 'จัดกิจกรรมการเรียนรู้เชิงรุก' },
        { criterion_id: 'PA-1.2', confidence: 80, reason: 'การออกแบบหน่วยการเรียนรู้' }
      ],
      confidence: 96,
      reasoningSummary: 'ผลงานมีทั้งตัวชิ้นงานสื่อการสอน นวัตกรรม และข้อมูลเชิงปริมาณแสดงผลการเรียนรู้อย่างชัดเจน',
      missingInformation: [],
      recommendedEvidence: ['ควรเพิ่มบันทึกหลังสอนและแบบสะท้อนความคิดเห็นของผู้เรียน'],
      shortEvaluationText: 'พัฒนาชุดกิจกรรม Micro:bit Smart Farm เพื่อยกระดับทักษะคิดคำนวณ นักเรียนร้อยละ 92 ผ่านเกณฑ์ระดับดี',
      formalEvaluationText: 'ได้ดำเนินการออกแบบและพัฒนาชุดกิจกรรมการเรียนรู้ Micro:bit เรื่อง Smart Farm แบบ Active Learning สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 4/2 โดยใช้กระบวนการแก้ปัญหาเชิงโครงงาน ส่งผลให้นักเรียนร้อยละ 92.11 มีผลการประเมินทักษะการเขียนโปรแกรมผ่านเกณฑ์ที่กำหนด',
      outcomeAnalysis: 'ผู้เรียนสามารถต่อยอดองค์ความรู้ไปสู่นวัตกรรมเชิงแก้ปัญหาในชีวิตจริงได้อย่างมีประสิทธิภาพ',
      warnings: [],
      analyzedAt: '2026-06-30T10:15:00Z'
    }
  },
  {
    evidence_id: 'E-2570-0002',
    title: 'การแลกเปลี่ยนเรียนรู้ทางวิชาชีพ (PLC) การจัดการเรียนรู้ Coding ไร้จอคอมพิวเตอร์',
    activity_type: 'PLC',
    start_date: '2026-07-15',
    end_date: '2026-07-15',
    description: 'ร่วมเป็นวิทยากรและผู้นำกลุ่ม PLC กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี แลกเปลี่ยนแนวทาง Unplugged Coding ในระดับมัธยมศึกษาตอนต้น',
    role: 'ผู้ร่วมแลกเปลี่ยนและบันทึก PLC',
    subject: 'วิทยาการคำนวณ',
    target_group: 'ครูผู้สอนในกลุ่มสาระฯ 7 คน',
    participant_count: 7,
    process: 'วิเคราะห์ปัญหาพื้นฐานตรรกะของนักเรียนใหม่ และร่วมกันออกแบบบอร์ดเกมตรรกะสำหรับใช้ในชั่วโมงปรับพื้นฐาน',
    output: 'แบบบันทึกกิจกรรม PLC ครั้งที่ 4 และต้นแบบบอร์ดเกมแก้ปัญหาตรรกะ 1 ชุด',
    outcome: 'ครูในกลุ่มสาระฯ นำแนวคิดไปปรับใช้ในการสอนคาบแรก ส่งผลให้นักเรียนมีความเข้าใจเงื่อนไข Condition ดีขึ้น',
    quantitative_result: 'การประชุม PLC ดำเนินการครบ 2 ชั่วโมง มีครูเข้าร่วม 100%',
    qualitative_result: 'เกิดการแลกเปลี่ยนสื่อและข้อค้นพบระหว่างครูผู้สอนในกลุ่มสาระอย่างเป็นกัลยาณมิตร',
    tags: ['PLC', 'Unplugged Coding', 'พัฒนาวิชาชีพ'],
    fiscal_year: '2570',
    salary_cycle: 'ROUND_1',
    pa_cycle: '2570',
    created_at: '2026-07-16T08:30:00Z',
    updated_at: '2026-07-16T08:30:00Z',
    status: 'ACTIVE',
    files: [
      {
        file_id: 'F-003',
        evidence_id: 'E-2570-0002',
        file_name: 'แบบบันทึก_PLC_ครั้งที่4_2570.pdf',
        mime_type: 'application/pdf',
        file_category: 'รายงานสรุป',
        drive_url: 'https://drive.google.com/sample_plc',
        uploaded_at: '2026-07-16T08:35:00Z'
      }
    ],
    criteria_mappings: [
      {
        mapping_id: 'M-004',
        evidence_id: 'E-2570-0002',
        criterion_id: 'PA-3.2',
        relation_type: 'Primary',
        ai_confidence: 98,
        ai_reason: 'ตรงกับตัวชี้วัด 3.2 การมีส่วนร่วมในการแลกเปลี่ยนเรียนรู้ทางวิชาชีพ (PLC) โดยตรง',
        user_confirmed: true,
        confirmed_at: '2026-07-16T09:00:00Z'
      },
      {
        mapping_id: 'M-005',
        evidence_id: 'E-2570-0002',
        criterion_id: 'PA-3.3',
        relation_type: 'Supporting',
        ai_confidence: 85,
        ai_reason: 'นำผลจาก PLC มาปรับใช้ในการจัดการเรียนรู้และพัฒนาสื่อ',
        user_confirmed: true,
        confirmed_at: '2026-07-16T09:00:00Z'
      }
    ]
  }
];
