import { Criterion, UserProfile, PAPlan, ActivityType } from './types';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'ครูสุทัศน์ บัวขาว',
  position: 'ครู',
  academicStanding: 'ชำนาญการพิเศษ',
  school: 'โรงเรียนสาธิตมัธยมศึกษา',
  affiliation: 'สำนักงานเขตพื้นที่การศึกษามัธยมศึกษา',
  education: 'การศึกษามหาบัณฑิต (กศ.ม.) สาขาเทคโนโลยีการศึกษา',
  major: 'เทคโนโลยีและคอมพิวเตอร์การศึกษา',
  teachingSubjects: ['วิทยาการคำนวณ ม.4', 'การออกแบบและเทคโนโลยี ม.5', 'โครงงานวิทยาศาสตร์และเทคโนโลยี'],
  gradeLevels: ['มัธยมศึกษาปีที่ 4', 'มัธยมศึกษาปีที่ 5'],
  specialAssignments: ['หัวหน้างานสารสนเทศและเทคโนโลยี', 'คณะกรรมการพัฒนาหลักสูตรสถานศึกษา', 'ครูที่ปรึกษา ม.4/2'],
  fiscalYear: '2570'
};

export const ACTIVITY_TYPES: ActivityType[] = [
  'การจัดการเรียนรู้',
  'การพัฒนาหลักสูตร',
  'นวัตกรรม',
  'สื่อการเรียนรู้',
  'วิจัยในชั้นเรียน',
  'การวัดและประเมินผล',
  'PLC',
  'อบรม',
  'วิทยากร',
  'กรรมการ',
  'งานวิชาการ',
  'งานพิเศษ',
  'ดูแลนักเรียน',
  'โครงงานนักเรียน',
  'แข่งขัน',
  'รางวัล',
  'ความร่วมมือภายนอก',
  'บริการวิชาการ',
  'อื่น ๆ'
];

export const DEFAULT_PA_CRITERIA: Criterion[] = [
  // ด้านที่ 1 การจัดการเรียนรู้ (8 ตัวชี้วัด)
  {
    criterion_id: 'PA-1.1',
    criterion_code: '1.1',
    criterion_name: 'สร้างและหรือพัฒนาหลักสูตร',
    criterion_description: 'จัดทำรายวิชาและหน่วยการเรียนรู้ให้สอดคล้องกับมาตรฐานการเรียนรู้ และตัวชี้วัดหรือผลการเรียนรู้ ตามหลักสูตร เพื่อให้ผู้เรียนได้พัฒนาสมรรถนะและการเรียนรู้เต็มศักยภาพ',
    evaluation_type: 'BOTH',
    aspect: 'ด้านที่ 1 การจัดการเรียนรู้',
    criteria_version: 'ว9/2564',
    official_reference: 'หลักเกณฑ์และวิธีการประเมินตำแหน่งและวิทยฐานะข้าราชการครู (ว9/2564)',
    criteria_scope: 'Official / OTEPC',
    is_active: true
  },
  {
    criterion_id: 'PA-1.2',
    criterion_code: '1.2',
    criterion_name: 'ออกแบบการจัดการเรียนรู้',
    criterion_description: 'เน้นผู้เรียนเป็นสำคัญ เพื่อให้ผู้เรียนมีความรู้ ทักษะ คุณลักษณะประจำวิชา คุณลักษณะอันพึงประสงค์ และสมรรถนะที่สำคัญตามหลักสูตร',
    evaluation_type: 'BOTH',
    aspect: 'ด้านที่ 1 การจัดการเรียนรู้',
    criteria_version: 'ว9/2564',
    official_reference: 'ว9/2564',
    criteria_scope: 'Official / OTEPC',
    is_active: true
  },
  {
    criterion_id: 'PA-1.3',
    criterion_code: '1.3',
    criterion_name: 'จัดกิจกรรมการเรียนรู้',
    criterion_description: 'อำนวยความสะดวกในการเรียนรู้ และส่งเสริมการเรียนรู้ ด้วยการจัดกิจกรรมเชิงรุก (Active Learning) ที่สอดคล้องกับความแตกต่างของผู้เรียน',
    evaluation_type: 'BOTH',
    aspect: 'ด้านที่ 1 การจัดการเรียนรู้',
    criteria_version: 'ว9/2564',
    official_reference: 'ว9/2564',
    criteria_scope: 'Official / OTEPC',
    is_active: true
  },
  {
    criterion_id: 'PA-1.4',
    criterion_code: '1.4',
    criterion_name: 'สร้างและหรือพัฒนาสื่อ นวัตกรรม เทคโนโลยี และแหล่งเรียนรู้',
    criterion_description: 'สอดคล้องกับกิจกรรมการเรียนรู้ สามารถแก้ไขปัญหาหรือพัฒนาการเรียนรู้ของผู้เรียนให้มีทักษะศตวรรษที่ 21',
    evaluation_type: 'BOTH',
    aspect: 'ด้านที่ 1 การจัดการเรียนรู้',
    criteria_version: 'ว9/2564',
    official_reference: 'ว9/2564',
    criteria_scope: 'Official / OTEPC',
    is_active: true
  },
  {
    criterion_id: 'PA-1.5',
    criterion_code: '1.5',
    criterion_name: 'วัดและประเมินผลการเรียนรู้',
    criterion_description: 'ใช้วิธีการ เครื่องมือวัดและประเมินผลที่หลากหลาย เหมาะสม และสอดคล้องกับมาตรฐานการเรียนรู้ และนำผลไปใช้แก้ไขปัญหาหรือพัฒนาผู้เรียน',
    evaluation_type: 'BOTH',
    aspect: 'ด้านที่ 1 การจัดการเรียนรู้',
    criteria_version: 'ว9/2564',
    official_reference: 'ว9/2564',
    criteria_scope: 'Official / OTEPC',
    is_active: true
  },
  {
    criterion_id: 'PA-1.6',
    criterion_code: '1.6',
    criterion_name: 'ศึกษา วิเคราะห์ และสังเคราะห์ เพื่อแก้ปัญหาหรือพัฒนาการเรียนรู้',
    criterion_description: 'นำผลการศึกษา วิเคราะห์ สังเคราะห์ หรือวิจัยในชั้นเรียนไปใช้แก้ไขปัญหาหรือพัฒนาการจัดการเรียนรู้ให้มีคุณภาพสูงขึ้น',
    evaluation_type: 'BOTH',
    aspect: 'ด้านที่ 1 การจัดการเรียนรู้',
    criteria_version: 'ว9/2564',
    official_reference: 'ว9/2564',
    criteria_scope: 'Official / OTEPC',
    is_active: true
  },
  {
    criterion_id: 'PA-1.7',
    criterion_code: '1.7',
    criterion_name: 'จัดบรรยากาศที่ส่งเสริมและพัฒนาผู้เรียน',
    criterion_description: 'จัดบรรยากาศที่ส่งเสริมและพัฒนาผู้เรียนให้เกิดกระบวนการคิด ทักษะชีวิต ทักษะการทำงาน ทักษะการเรียนรู้และนวัตกรรม ทักษะสารสนเทศ สื่อ และเทคโนโลยี',
    evaluation_type: 'BOTH',
    aspect: 'ด้านที่ 1 การจัดการเรียนรู้',
    criteria_version: 'ว9/2564',
    official_reference: 'ว9/2564',
    criteria_scope: 'Official / OTEPC',
    is_active: true
  },
  {
    criterion_id: 'PA-1.8',
    criterion_code: '1.8',
    criterion_name: 'อบรมและพัฒนาคุณลักษณะที่ดีของผู้เรียน',
    criterion_description: 'ปลูกฝังค่านิยม และคุณลักษณะที่ดีงาม ความมีวินัย คุณธรรม จริยธรรม ให้เกิดขึ้นกับผู้เรียนอย่างต่อเนื่อง',
    evaluation_type: 'BOTH',
    aspect: 'ด้านที่ 1 การจัดการเรียนรู้',
    criteria_version: 'ว9/2564',
    official_reference: 'ว9/2564',
    criteria_scope: 'Official / OTEPC',
    is_active: true
  },

  // ด้านที่ 2 ด้านการส่งเสริมและสนับสนุนการจัดการเรียนรู้ (4 ตัวชี้วัด)
  {
    criterion_id: 'PA-2.1',
    criterion_code: '2.1',
    criterion_name: 'จัดทำข้อมูลสารสนเทศของผู้เรียนและรายวิชา',
    criterion_description: 'จัดทำข้อมูลสารสนเทศของผู้เรียนและรายวิชา เพื่อใช้ในการส่งเสริมสนับสนุนการเรียนรู้ และพัฒนาคุณภาพผู้เรียน',
    evaluation_type: 'BOTH',
    aspect: 'ด้านที่ 2 การส่งเสริมและสนับสนุน',
    criteria_version: 'ว9/2564',
    official_reference: 'ว9/2564',
    criteria_scope: 'Official / OTEPC',
    is_active: true
  },
  {
    criterion_id: 'PA-2.2',
    criterion_code: '2.2',
    criterion_name: 'ดำเนินการตามระบบดูแลช่วยเหลือผู้เรียน',
    criterion_description: 'ใช้ข้อมูลสารสนเทศเกี่ยวกับผู้เรียนรายบุคคล และประสานความร่วมมือกับผู้มีส่วนเกี่ยวข้องเพื่อพัฒนาและแก้ไขปัญหาผู้เรียน',
    evaluation_type: 'BOTH',
    aspect: 'ด้านที่ 2 การส่งเสริมและสนับสนุน',
    criteria_version: 'ว9/2564',
    official_reference: 'ว9/2564',
    criteria_scope: 'Official / OTEPC',
    is_active: true
  },
  {
    criterion_id: 'PA-2.3',
    criterion_code: '2.3',
    criterion_name: 'ปฏิบัติงานวิชาการ และงานอื่น ๆ ของสถานศึกษา',
    criterion_description: 'ร่วมปฏิบัติงานทางวิชาการ และงานอื่น ๆ ของสถานศึกษา เพื่อยกระดับคุณภาพการจัดการศึกษาของสถานศึกษา',
    evaluation_type: 'BOTH',
    aspect: 'ด้านที่ 2 การส่งเสริมและสนับสนุน',
    criteria_version: 'ว9/2564',
    official_reference: 'ว9/2564',
    criteria_scope: 'Official / OTEPC',
    is_active: true
  },
  {
    criterion_id: 'PA-2.4',
    criterion_code: '2.4',
    criterion_name: 'ประสานความร่วมมือกับผู้ปกครอง ภาคีเครือข่าย และหรือสถานประกอบการ',
    criterion_description: 'ประสานความร่วมมือกับผู้ปกครอง ภาคีเครือข่าย และหรือสถานประกอบการ เพื่อร่วมกันพัฒนาผู้เรียน',
    evaluation_type: 'BOTH',
    aspect: 'ด้านที่ 2 การส่งเสริมและสนับสนุน',
    criteria_version: 'ว9/2564',
    official_reference: 'ว9/2564',
    criteria_scope: 'Official / OTEPC',
    is_active: true
  },

  // ด้านที่ 3 การพัฒนาตนเองและวิชาชีพ (3 ตัวชี้วัด)
  {
    criterion_id: 'PA-3.1',
    criterion_code: '3.1',
    criterion_name: 'พัฒนาตนเองอย่างเป็นระบบและต่อเนื่อง',
    criterion_description: 'เพื่อให้มีความรู้ ความสามารถ ทักษะ โดยเฉพาะอย่างยิ่งการใช้ภาษาไทยและภาษาอังกฤษเพื่อการสื่อสาร และการใช้เทคโนโลยีดิจิทัลเพื่อการศึกษา',
    evaluation_type: 'BOTH',
    aspect: 'ด้านที่ 3 การพัฒนาตนเองและวิชาชีพ',
    criteria_version: 'ว9/2564',
    official_reference: 'ว9/2564',
    criteria_scope: 'Official / OTEPC',
    is_active: true
  },
  {
    criterion_id: 'PA-3.2',
    criterion_code: '3.2',
    criterion_name: 'มีส่วนร่วมในการแลกเปลี่ยนเรียนรู้ทางวิชาชีพ (PLC)',
    criterion_description: 'มีส่วนร่วมและเป็นผู้นำในการแลกเปลี่ยนเรียนรู้ทางวิชาชีพ เพื่อแก้ไขปัญหาและพัฒนาการจัดการเรียนรู้',
    evaluation_type: 'BOTH',
    aspect: 'ด้านที่ 3 การพัฒนาตนเองและวิชาชีพ',
    criteria_version: 'ว9/2564',
    official_reference: 'ว9/2564',
    criteria_scope: 'Official / OTEPC',
    is_active: true
  },
  {
    criterion_id: 'PA-3.3',
    criterion_code: '3.3',
    criterion_name: 'นำความรู้ ทักษะที่ได้จากการพัฒนาตนเองและวิชาชีพมาใช้',
    criterion_description: 'นำความรู้ ความสามารถ ทักษะที่ได้จากการพัฒนาตนเองและวิชาชีพมาใช้ในการพัฒนาการจัดการเรียนรู้ การพัฒนาคุณภาพผู้เรียน และการพัฒนานวัตกรรมการจัดการเรียนรู้',
    evaluation_type: 'BOTH',
    aspect: 'ด้านที่ 3 การพัฒนาตนเองและวิชาชีพ',
    criteria_version: 'ว9/2564',
    official_reference: 'ว9/2564',
    criteria_scope: 'Official / OTEPC',
    is_active: true
  },

  // ส่วนประเด็นท้าทาย
  {
    criterion_id: 'PA-CHALLENGE',
    criterion_code: 'CHALLENGE',
    criterion_name: 'ข้อตกลงในการพัฒนางานที่เป็นประเด็นท้าทาย',
    criterion_description: 'การปฏิบัติงานที่เป็นประเด็นท้าทายในการพัฒนาผลลัพธ์การเรียนรู้ของผู้เรียน ตามระดับความคาดหวังของวิทยฐานะ (ริเริ่ม พัฒนา / คิดค้น ปรับเปลี่ยน)',
    evaluation_type: 'BOTH',
    aspect: 'องค์ประกอบที่ 1',
    weight: 20,
    criteria_version: 'ว9/2564',
    official_reference: 'ว9/2564',
    criteria_scope: 'Official / OTEPC',
    is_active: true
  },

  // องค์ประกอบเลื่อนเงินเดือน เพิ่มเติม
  {
    criterion_id: 'SAL-PART2',
    criterion_code: 'SAL-2',
    criterion_name: 'องค์ประกอบที่ 2: การมีส่วนร่วมในการพัฒนาการศึกษา',
    criterion_description: 'ความสำเร็จของงานที่ได้รับมอบหมายจากผู้บังคับบัญชา และการมีส่วนร่วมในกิจกรรมพัฒนาโรงเรียน/ชุมชนการศึกษา',
    evaluation_type: 'SALARY',
    aspect: 'องค์ประกอบที่ 2',
    weight: 10,
    criteria_version: 'ว23/2564',
    official_reference: 'ว23/2564 หลักเกณฑ์การประเมินเพื่อเลื่อนเงินเดือน',
    criteria_scope: 'Official / OTEPC',
    is_active: true
  },
  {
    criterion_id: 'SAL-PART3',
    criterion_code: 'SAL-3',
    criterion_name: 'องค์ประกอบที่ 3: การปฏิบัติตนในการรักษาวินัย คุณธรรม จริยธรรม',
    criterion_description: 'การยึดมั่นในสถาบันหลัก ความซื่อสัตย์สุจริต จรรยาบรรณวิชาชีพครู และการมีจิตสำนึกที่ดีต่อผู้เรียนและสังคม',
    evaluation_type: 'SALARY',
    aspect: 'องค์ประกอบที่ 3',
    weight: 10,
    criteria_version: 'ว23/2564',
    official_reference: 'ว23/2564',
    criteria_scope: 'Official / OTEPC',
    is_active: true
  }
];

export const DEFAULT_PA_PLAN: PAPlan = {
  fiscal_year: '2570',
  teaching_load_hours: 18,
  support_tasks: 'จัดทำระบบสารสนเทศดูแลช่วยเหลือผู้เรียน ม.4 และ ม.5 จำนวน 120 คน',
  school_quality_tasks: 'หัวหน้างานสารสนเทศและเทคโนโลยี ดูแลระบบเครือข่ายและระบบบริหารจัดการสถานศึกษา',
  policy_tasks: 'ขับเคลื่อนการจัดการเรียนรู้ด้าน Coding และ AI Literacy ตามนโยบายกระทรวงศึกษาธิการ',
  target_indicators: 'ผู้เรียนร้อยละ 80 มีผลการประเมินสมรรถนะการคิดเชิงคำนวณในระดับดีขึ้นไป',
  challenge_topic: 'การพัฒนานวัตกรรมการจัดการเรียนรู้แบบผสมผสานด้วยชุดกิจกรรมบอร์ดสมองกล Micro:bit ร่วมกับแพลตฟอร์มคลาวด์ เพื่อยกระดับทักษะการคิดเชิงคำนวณและแก้ปัญหาของนักเรียนชั้น ม.4',
  challenge_problem: 'นักเรียนชั้น ม.4 ยังขาดทักษะการคิดเชิงนามธรรมและการลงมือปฏิบัติการเขียนโปรแกรมควบคุมอุปกรณ์ฮาร์ดแวร์จริง ทำให้เกิดความเบื่อหน่ายในการเรียนทฤษฎี',
  challenge_method: '1. ศึกษาและออกแบบชุดกิจกรรมบอร์ดสมองกล Micro:bit\n2. จัดการเรียนรู้แบบโครงงานเป็นฐาน (Project-Based Learning)\n3. ใช้ระบบประเมิน Rubric วัดทักษะกระบวนการคิดและชิ้นงาน\n4. จัดเวทีนำเสนอผลงานสิ่งประดิษฐ์และแลกเปลี่ยนเรียนรู้',
  challenge_expected_quantitative: 'นักเรียนชั้น ม.4/2 ร้อยละ 85 มีผลสัมฤทธิ์ทางการเรียนผ่านเกณฑ์ร้อยละ 70 ขึ้นไป',
  challenge_expected_qualitative: 'นักเรียนมีทักษะการคิดเชิงคำนวณ ทักษะการแก้ปัญหา และสามารถสร้างสรรค์ผลงานนวัตกรรมดิจิทัลเพื่อแก้ปัญหาในชีวิตจริงได้',
  challenge_progress_percent: 65
};
