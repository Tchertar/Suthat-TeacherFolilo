import { GoogleGenAI, Type } from "@google/genai";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initialize Gemini
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// AI Analyze Evidence endpoint
app.post("/api/ai/analyze-evidence", async (req, res) => {
  try {
    const { title, description, activityType, role, processText, output, outcome, quantitativeResult, qualitativeResult, files, profile, activeCriteria } = req.body;
    
    if (!title && !description) {
      return res.status(400).json({ error: "ต้องมีชื่อกิจกรรมหรือคำอธิบายอย่างน้อย 1 รายการ" });
    }

    const ai = getGeminiClient();

    const criteriaListStr = activeCriteria && activeCriteria.length > 0
      ? JSON.stringify(activeCriteria.map((c: any) => ({
          id: c.criterion_id,
          code: c.criterion_code,
          name: c.criterion_name,
          aspect: c.aspect
        })))
      : "เกณฑ์ PA มาตรฐาน ว9/2564";

    const prompt = `
คุณคือผู้เชี่ยวชาญด้านการประเมินผลการปฏิบัติงาน ว PA และการเลื่อนเงินเดือนข้าราชการครูของสำนักงาน ก.ค.ศ. ประเทศไทย

บริบทผู้ใช้งาน:
- ชื่อ: ${profile?.name || "ครู"}
- ตำแหน่ง/วิทยฐานะ: ${profile?.position || "ครู"} ${profile?.academicStanding || "ชำนาญการพิเศษ"}
- สังกัด: ${profile?.school || "โรงเรียน"} (${profile?.affiliation || "สพม./สพป."})
- วิชาที่สอน: ${Array.isArray(profile?.teachingSubjects) ? profile.teachingSubjects.join(", ") : ""}
- งานพิเศษ: ${Array.isArray(profile?.specialAssignments) ? profile.specialAssignments.join(", ") : ""}

รายการผลงาน/กิจกรรมที่ส่งเข้ามาวิเคราะห์:
- ชื่อกิจกรรม: ${title || "-"}
- ประเภทกิจกรรม: ${activityType || "-"}
- บทบาท: ${role || "-"}
- รายละเอียด: ${description || "-"}
- สิ่งที่ดำเนินการ (Process): ${processText || "-"}
- ผลผลิต (Output): ${output || "-"}
- ผลลัพธ์ (Outcome): ${outcome || "-"}
- ข้อมูลเชิงปริมาณ: ${quantitativeResult || "-"}
- ข้อมูลเชิงคุณภาพ: ${qualitativeResult || "-"}
- หลักฐานที่แนบ: ${files?.map((f: any) => f.file_name || f.file_category).join(", ") || "ไม่มีไฟล์แนบ"}

รายการตัวชี้วัดที่มีอยู่ในระบบ:
${criteriaListStr}

ข้อกำหนดสำคัญอย่างยิ่ง (STRICT RULES):
1. ห้ามสร้างข้อมูลเท็จโดยเด็ดขาด ห้ามแต่งตัวเลข สถิติ เปอร์เซ็นต์ รางวัล หรือข้อเท็จจริงที่ผู้ใช้ไม่ได้ให้มา
2. หากไม่มีข้อมูลตัวเลข ให้ระบุว่า "ยังไม่มีข้อมูลยืนยัน"
3. วิเคราะห์หาตัวชี้วัดหลัก (suggestedPrimaryCriterion) ที่ตรงที่สุด 1 ตัว
4. วิเคราะห์ตัวชี้วัดรอง (secondaryCriteria) ไม่เกิน 3 ตัว พร้อมให้คะแนนความมั่นใจ (0-100) และเหตุผลที่ตรงตามบริบท
5. สร้างข้อความประกอบการประเมิน 3 รูปแบบ:
   - shortEvaluationText: ข้อความสั้น 1-2 ประโยคสำหรับ Portfolio Card
   - formalEvaluationText: ข้อความทางการแบบรายงานราชการ 1 ย่อหน้า "ได้ดำเนินการ... โดย... ส่งผลให้..." โดยใช้เฉพาะข้อเท็จจริงที่ให้มา
   - outcomeAnalysis: สรุปผลสัมฤทธิ์หรือผลที่เกิดขึ้นต่อผู้เรียน/สถานศึกษา
6. ระบุข้อมูลที่ยังขาด (missingInformation) และข้อเสนอแนะในการเก็บหลักฐานเพิ่ม (recommendedEvidence)
7. ตอบกลับมาในรูปแบบ JSON ตาม Schema ที่กำหนดเท่านั้น
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            activityType: { type: Type.STRING },
            suggestedPrimaryCriterion: { type: Type.STRING },
            secondaryCriteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterion_id: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  reason: { type: Type.STRING }
                },
                required: ["criterion_id", "confidence", "reason"]
              }
            },
            confidence: { type: Type.NUMBER },
            reasoningSummary: { type: Type.STRING },
            missingInformation: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendedEvidence: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            shortEvaluationText: { type: Type.STRING },
            formalEvaluationText: { type: Type.STRING },
            outcomeAnalysis: { type: Type.STRING },
            warnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            "summary",
            "suggestedPrimaryCriterion",
            "secondaryCriteria",
            "confidence",
            "reasoningSummary",
            "missingInformation",
            "recommendedEvidence",
            "shortEvaluationText",
            "formalEvaluationText",
            "outcomeAnalysis",
            "warnings"
          ]
        }
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    res.json({
      success: true,
      data: {
        ...parsed,
        analyzedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    res.status(500).json({ error: error.message || "เกิดข้อผิดพลาดในการวิเคราะห์ผลงานด้วย AI" });
  }
});

// AI Generate Criterion Summary (สรุปภาพรวมตัวชี้วัดสำหรับรายงาน)
app.post("/api/ai/summarize-criterion", async (req, res) => {
  try {
    const { criterion, evidenceList, profile } = req.body;
    const ai = getGeminiClient();

    const prompt = `
คุณคือผู้เชี่ยวชาญการประเมิน PA ข้าราชการครู
สังเคราะห์ผลการปฏิบัติงานของตัวชี้วัด: ${criterion.criterion_code} ${criterion.criterion_name}
คำอธิบายตัวชี้วัด: ${criterion.criterion_description}

ข้อมูลครู: ${profile?.name} ตำแหน่ง ${profile?.position} ${profile?.academicStanding} โรงเรียน ${profile?.school}

รายการผลงาน/หลักฐานที่เชื่อมโยงกับตัวชี้วัดนี้ (${evidenceList?.length || 0} รายการ):
${evidenceList?.map((e: any, i: number) => `
${i + 1}. [${e.evidence_id}] ${e.title} (${e.start_date})
   - รายละเอียด: ${e.description || "-"}
   - การดำเนินงาน: ${e.process || "-"}
   - ผลผลิต: ${e.output || "-"}
   - ผลลัพธ์: ${e.outcome || "-"}
   - เชิงปริมาณ: ${e.quantitative_result || "-"}
   - เชิงคุณภาพ: ${e.qualitative_result || "-"}
   - เอกสารหลักฐาน: ${e.files?.map((f: any) => f.file_name).join(", ") || "ไม่มี"}
`).join("\n") || "ยังไม่มีผลงานบันทึกไว้"}

คำสั่ง:
1. เขียนสังเคราะห์ภาพรวมการปฏิบัติงานตามตัวชี้วัดนี้ในรูปแบบรายงานราชการที่เป็นทางการและน่าเชื่อถือ
2. โครงสร้างรายงาน:
   - สรุปกระบวนการดำเนินงานที่สอดคล้องกับตัวชี้วัด
   - ผลผลิตและผลลัพธ์ที่เกิดขึ้นกับผู้เรียน สถานศึกษา หรือวิชาชีพ (เน้น Outcome ตามหลักฐานจริง ไม่โอ้อวด)
   - หลักฐานเชิงประจักษ์ที่สำคัญ
   - สิ่งที่ควรพัฒนาต่อเนื่อง
3. ตอบกลับในรูปแบบ JSON ตาม Schema
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            synthesisText: { type: Type.STRING },
            keyOutcomes: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            evidenceStrengthAssessment: { type: Type.STRING },
            readinessStatus: {
              type: Type.STRING,
              description: "READY | PARTIAL | INSUFFICIENT"
            },
            nextActionRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["synthesisText", "keyOutcomes", "evidenceStrengthAssessment", "readinessStatus", "nextActionRecommendations"]
        }
      }
    });

    res.json({
      success: true,
      data: JSON.parse(response.text || "{}")
    });
  } catch (error: any) {
    console.error("AI Summarize Criterion error:", error);
    res.status(500).json({ error: error.message || "เกิดข้อผิดพลาดในการสังเคราะห์ตัวชี้วัด" });
  }
});

// AI Gap Analysis & Recommendations
app.post("/api/ai/gap-analysis", async (req, res) => {
  try {
    const { profile, paPlan, criteria, evidenceList } = req.body;
    const ai = getGeminiClient();

    const prompt = `
คุณคือที่ปรึกษาด้านการประเมิน ว PA และการเลื่อนเงินเดือนครู
วิเคราะห์ช่องว่าง (Gap Analysis) และโอกาสในการจัดเก็บหลักฐานของครู:
ครู: ${profile?.name}, วิทยฐานะ: ${profile?.academicStanding}, กลุ่มสาระ/วิชา: ${Array.isArray(profile?.teachingSubjects) ? profile.teachingSubjects.join(", ") : ""}
ประเด็นท้าทาย: ${paPlan?.challenge_topic || "ไม่ได้ระบุ"}

รายการตัวชี้วัดทั้งหมด:
${criteria?.map((c: any) => `${c.criterion_id} (${c.criterion_name})`).join(", ")}

สรุปผลงานที่มีอยู่ในระบบ (${evidenceList?.length || 0} รายการ):
${evidenceList?.map((e: any) => `- [${e.evidence_id}] ${e.title} -> ตัวชี้วัดที่เชื่อม: ${e.criteria_mappings?.map((m: any) => m.criterion_id).join(", ")}`).join("\n")}

วิเคราะห์:
1. ตัวชี้วัดใดที่ขาดหลักฐาน หรือหลักฐานยังอ่อน (ไม่มี Outcome, มีแต่รูปไม่มีผลลัพธ์)
2. เสนอแนะ Actionable Next Steps ไม่เกิน 4 ข้อ ที่ครูสามารถลงมือทำได้จริงในโรงเรียน โดยอ้างอิงวิชาที่สอนและวิทยฐานะ
3. เสนอแนะโอกาสการสร้างหลักฐาน (Opportunity Finder)
ตอบเป็น JSON ตาม Schema
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallReadinessVerdict: { type: Type.STRING },
            highPriorityGaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterion_id: { type: Type.STRING },
                  criterion_name: { type: Type.STRING },
                  issue: { type: Type.STRING },
                  suggestedActivity: { type: Type.STRING }
                },
                required: ["criterion_id", "criterion_name", "issue", "suggestedActivity"]
              }
            },
            opportunityFinderItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  targetCriterion: { type: Type.STRING },
                  actionableTip: { type: Type.STRING },
                  sampleEvidence: { type: Type.STRING }
                },
                required: ["title", "targetCriterion", "actionableTip", "sampleEvidence"]
              }
            }
          },
          required: ["overallReadinessVerdict", "highPriorityGaps", "opportunityFinderItems"]
        }
      }
    });

    res.json({
      success: true,
      data: JSON.parse(response.text || "{}")
    });
  } catch (error: any) {
    console.error("AI Gap Analysis error:", error);
    res.status(500).json({ error: error.message || "เกิดข้อผิดพลาดในการวิเคราะห์ Gap" });
  }
});

// AI Auto-Expand Description by Academic Standing (ขยายความคำอธิบายตามระดับวิทยฐานะ)
app.post("/api/ai/expand-description", async (req, res) => {
  try {
    const { 
      title, 
      description, 
      activityType, 
      academicStanding, 
      position, 
      subject, 
      gradeLevel,
      existingProcess,
      existingOutput,
      existingOutcome
    } = req.body;

    const standing = academicStanding || "ชำนาญการพิเศษ";
    
    // Determine expected pedagogical verb level according to ว.PA (ก.ค.ศ.)
    let verbStandard = "ริเริ่ม พัฒนา";
    let verbExplanation = "ริเริ่ม พัฒนา นวัตกรรมและการจัดการเรียนรู้ Active Learning และแก้ปัญหาผู้เรียน";
    if (standing.includes("เชี่ยวชาญพิเศษ")) {
      verbStandard = "สร้างการเปลี่ยนแปลง";
      verbExplanation = "สร้างการเปลี่ยนแปลง พัฒนานวัตกรรมต้นแบบระดับชาติหรือระดับองค์กร เผยแพร่ขยายผล";
    } else if (standing.includes("เชี่ยวชาญ")) {
      verbStandard = "คิดค้น ปรับเปลี่ยน";
      verbExplanation = "คิดค้น ปรับเปลี่ยน รูปแบบการจัดการเรียนรู้ให้สอดคล้องกับบริบทและเป็นแบบอย่าง";
    } else if (standing.includes("ชำนาญการพิเศษ")) {
      verbStandard = "ริเริ่ม พัฒนา";
      verbExplanation = "ริเริ่ม พัฒนา นวัตกรรมการจัดการเรียนรู้ Active Learning และแก้ปัญหาผู้เรียน";
    } else if (standing.includes("ชำนาญการ")) {
      verbStandard = "แก้ไขปัญหา";
      verbExplanation = "แก้ไขปัญหาการจัดการเรียนรู้และการพัฒนาคุณภาพผู้เรียน";
    } else {
      verbStandard = "ปรับประยุกต์";
      verbExplanation = "ปรับประยุกต์หลักสูตรและแผนการจัดการเรียนรู้ให้เหมาะสมกับผู้เรียนและบริบท";
    }

    const ai = getGeminiClient();

    const prompt = `
คุณคือผู้เชี่ยวชาญการประเมินวิทยฐานะข้าราชการครู (ว.PA) ตามเกณฑ์ ก.ค.ศ. ว9/2564
หน้าที่ของคุณคือ: "ขยายความและเรียบเรียงคำอธิบายผลงาน/กิจกรรมของครูให้ละเอียด ชัดเจน เป็นมืออาชีพ ถูกต้องตามระเบียบราชการ และตรงตามระดับความคาดหวังของวิทยฐานะของครูอย่างแม่นยำ"

ข้อมูลครูและวิทยฐานะ:
- ตำแหน่ง: ${position || "ครู"}
- ระดับวิทยฐานะ: ${standing}
- ระดับการปฏิบัติที่คาดหวังตามเกณฑ์ ก.ค.ศ.: "${verbStandard}" (${verbExplanation})
- กลุ่มสาระ/วิชา: ${subject || "ทั่วไป"}
- ระดับชั้น: ${gradeLevel || "ทั่วไป"}

ข้อมูลผลงานที่ครูระบุเบื้องต้น:
- ชื่อผลงาน/กิจกรรม: ${title || "-"}
- ประเภทกิจกรรม: ${activityType || "การจัดการเรียนรู้"}
- คำอธิบายเดิม: ${description || "-"}
- สิ่งที่ดำเนินการเดิม: ${existingProcess || "-"}
- ผลผลิตเดิม: ${existingOutput || "-"}
- ผลลัพธ์เดิม: ${existingOutcome || "-"}

แนวทางการขยายความ:
1. ต้องสอดแทรกคำกริยาระดับมาตรฐานวิทยฐานะ "${verbStandard}" ในคำอธิบายและกระบวนการอย่างเป็นธรรมชาติและสอดคล้องกับเนื้อหางานจริง
2. ขยายความคำอธิบาย (expandedDescription) ให้เห็นบริบท วัตถุประสงค์ กระบวนการจัดกิจกรรม Active Learning หรือการแก้ปัญหาผู้เรียน และผลสัมฤทธิ์
3. กระบวนการ (process): อธิบายเป็นขั้นตอนชัดเจนตามวงจร PDCA (วางแผน ดำเนินการ ตรวจสอบ ประเมินผลและปรับปรุง)
4. ผลผลิต (output): ระบุชิ้นงาน นวัตกรรม แผน หรือเอกสารที่จับต้องได้
5. ผลลัพธ์ (outcome): การเปลี่ยนแปลงเชิงพฤติกรรม ทักษะ หรือสมรรถนะของผู้เรียน
6. ข้อมูลเชิงปริมาณ (quantitativeResult): ตัวชี้วัดที่วัดได้เป็นตัวเลขหรือร้อยละ เช่น ร้อยละของผู้เรียนที่ผ่านเกณฑ์
7. ข้อมูลเชิงคุณภาพ (qualitativeResult): คุณภาพความพึงพอใจและพัฒนาการ
8. แนะนำรหัสตัวชี้วัด PA ที่ตรงกับงานนี้อย่างน้อย 1-3 ตัวชี้วัด (เช่น "PA-1.1", "PA-1.2", "PA-1.3", "PA-2.1")
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            expandedDescription: { type: Type.STRING },
            pedagogicalLevelVerb: { type: Type.STRING },
            process: { type: Type.STRING },
            output: { type: Type.STRING },
            outcome: { type: Type.STRING },
            quantitativeResult: { type: Type.STRING },
            qualitativeResult: { type: Type.STRING },
            suggestedCriteriaIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            "expandedDescription",
            "pedagogicalLevelVerb",
            "process",
            "output",
            "outcome",
            "quantitativeResult",
            "qualitativeResult",
            "suggestedCriteriaIds"
          ]
        }
      }
    });

    res.json({
      success: true,
      data: JSON.parse(response.text || "{}")
    });
  } catch (error: any) {
    console.error("AI Expand Description error:", error);
    res.status(500).json({ error: error.message || "เกิดข้อผิดพลาดในการขยายความคำอธิบายด้วย AI" });
  }
});

// AI Auto-map evidence to multiple criteria (จัดผลงานเข้าตัวชี้วัดที่เหมาะสมมากกว่า 1 ตัวชี้วัด)
app.post("/api/ai/auto-map-criteria", async (req, res) => {
  try {
    const { evidence, activeCriteria, profile } = req.body;
    const ai = getGeminiClient();

    const criteriaListStr = activeCriteria && activeCriteria.length > 0
      ? JSON.stringify(activeCriteria.map((c: any) => ({
          id: c.criterion_id,
          code: c.criterion_code,
          name: c.criterion_name,
          aspect: c.aspect
        })))
      : "เกณฑ์มาตรฐาน ว.PA 15 ตัวชี้วัด";

    const prompt = `
คุณคือผู้เชี่ยวชาญการประเมิน ว.PA ก.ค.ศ.
ทำการจัดผลงานชิ้นนี้เข้าไปยังตัวชี้วัด PA ที่เหมาะสม โดยสามารถจัดไว้ได้มากกว่า 1 ตัวชี้วัด (Multi-criteria mapping) ตามความสอดคล้องของเนื้อหา

ข้อมูลครู: ${profile?.name || "ครู"} วิทยฐานะ: ${profile?.academicStanding || "ชำนาญการพิเศษ"}
ข้อมูลผลงาน:
- ชื่อผลงาน: ${evidence.title}
- ประเภท: ${evidence.activity_type}
- คำอธิบาย: ${evidence.description || "-"}
- กระบวนการ: ${evidence.process || "-"}
- ผลผลิต/ผลลัพธ์: ${evidence.output || "-"} / ${evidence.outcome || "-"}

รายการตัวชี้วัดทั้งหมด:
${criteriaListStr}

ข้อกำหนด:
1. เลือกตัวชี้วัดหลัก (Primary) ที่ตรงที่สุด 1 ตัวชี้วัด
2. เลือกตัวชี้วัดรอง/สนับสนุน (Supporting) ที่มีเนื้อหาสอดคล้องเกี่ยวข้องอีก 1-3 ตัวชี้วัด (รวมแล้วมากกว่า 1 ตัวชี้วัดได้)
3. ระบุเหตุผล (reason) และค่าความมั่นใจ (confidence 0-100)
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryCriterionId: { type: Type.STRING },
            primaryReason: { type: Type.STRING },
            matchedCriteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterion_id: { type: Type.STRING },
                  relation_type: { type: Type.STRING, description: "Primary | Supporting" },
                  confidence: { type: Type.NUMBER },
                  reason: { type: Type.STRING }
                },
                required: ["criterion_id", "relation_type", "confidence", "reason"]
              }
            }
          },
          required: ["primaryCriterionId", "primaryReason", "matchedCriteria"]
        }
      }
    });

    res.json({
      success: true,
      data: JSON.parse(response.text || "{}")
    });
  } catch (error: any) {
    console.error("AI Auto-map criteria error:", error);
    res.status(500).json({ error: error.message || "เกิดข้อผิดพลาดในการจัดตัวชี้วัดอัตโนมัติ" });
  }
});

// Vite Middleware & Static handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

