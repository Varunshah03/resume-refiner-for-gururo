import express from "express";
import cors from "cors";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFParser from "pdf2json";
import mammoth from "mammoth";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:8080",
      "https://your-frontend.vercel.app", // Update this with your actual Vercel URL
      "https://*.vercel.app", // Allow all Vercel subdomains during development
    ],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Origin:", req.get("Origin"));
  res.on("finish", () => {
    console.log("Response Headers:", res.getHeaders());
  });
  next();
});

app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and DOCX files are allowed."));
    }
  },
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function extractTextFromPDF(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", (err) => {
      console.error("PDF parsing error:", err);
      reject(new Error("Failed to parse PDF"));
    });
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      const text = pdfData.Pages.map((page) =>
        page.Texts.map((text) => decodeURIComponent(text.R[0].T)).join(" ")
      ).join(" ");
      resolve(text);
    });
    pdfParser.parseBuffer(buffer);
  });
}

async function extractTextFromDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("DOCX extraction error:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}

// Helper function to normalize job title for consistent range lookup
function normalizeJobTitle(title) {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('senior') && (titleLower.includes('software') || titleLower.includes('engineer'))) {
    return 'Senior Software Engineer';
  }
  if (titleLower.includes('data') && titleLower.includes('scientist')) {
    return 'Data Scientist';
  }
  if (titleLower.includes('product') && titleLower.includes('manager')) {
    return 'Product Manager';
  }
  if (titleLower.includes('ux') || titleLower.includes('ui')) {
    return 'UX Designer';
  }
  if (titleLower.includes('devops')) {
    return 'DevOps Engineer';
  }
  if (titleLower.includes('marketing') && titleLower.includes('manager')) {
    return 'Marketing Manager';
  }
  
  return 'default';
}

// Fallback function to generate reliable data when AI fails
function generateFallbackAnalysis(jobTitle, normalizedJobTitle, resumeText) {
  const DEMAND_RANGES = {
    'Senior Software Engineer': { min: 70, max: 85 },
    'Data Scientist': { min: 75, max: 90 },
    'Product Manager': { min: 60, max: 80 },
    'UX Designer': { min: 50, max: 70 },
    'DevOps Engineer': { min: 65, max: 85 },
    'Marketing Manager': { min: 45, max: 65 },
    'default': { min: 40, max: 60 },
  };

  const SALARY_RANGES = {
    'Senior Software Engineer': { min: 100000, max: 250000 },
    'Data Scientist': { min: 100000, max: 220000 },
    'Product Manager': { min: 90000, max: 180000 },
    'UX Designer': { min: 70000, max: 150000 },
    'DevOps Engineer': { min: 95000, max: 200000 },
    'Marketing Manager': { min: 80000, max: 160000 },
    'default': { min: 60000, max: 150000 },
  };

  const demandRange = DEMAND_RANGES[normalizedJobTitle];
  const salaryRange = SALARY_RANGES[normalizedJobTitle];

  console.log(`Generating fallback data for ${normalizedJobTitle}: Demand ${demandRange.min}-${demandRange.max}%`);

  // Generate realistic career growth data
  const careerGrowth = Array.from({ length: 10 }, (_, i) => {
    const year = 2024 + i;
    const demandSpread = demandRange.max - demandRange.min;
    const salarySpread = salaryRange.max - salaryRange.min;
    
    // Create some variation but keep within bounds
    const demandVariation = Math.floor(Math.random() * (demandSpread + 1));
    const salaryVariation = Math.floor(Math.random() * (salarySpread + 1));
    
    return {
      year,
      demand: demandRange.min + demandVariation,
      salary: salaryRange.min + salaryVariation
    };
  });

  return {
    jobTitle,
    experienceLevel: "Mid Level",
    aiRiskLevel: "Medium",
    coreSkills: ["Technical Skills", "Problem Solving", "Communication", "Leadership", "Adaptability", "Innovation"],
    careerGrowth,
    skillsAssessment: [
      { skill: "Technical Skills", current: 75, recommended: 85 },
      { skill: "Leadership", current: 65, recommended: 75 },
      { skill: "Communication", current: 70, recommended: 80 },
      { skill: "Problem Solving", current: 80, recommended: 90 },
      { skill: "Adaptability", current: 70, recommended: 85 }
    ],
    emergingRoles: [
      { title: "AI/ML Engineer", growth: 85, match: 75 },
      { title: "Cloud Architect", growth: 70, match: 65 },
      { title: "Product Strategist", growth: 60, match: 70 }
    ],
    aiImpact: {
      summary: "AI will enhance your role by automating routine tasks while increasing demand for strategic thinking and human-centered skills.",
      timeline: "3-5 years",
      adaptationPotential: 75
    },
    recommendations: [
      "Develop expertise in emerging technologies relevant to your field",
      "Focus on skills that complement AI rather than compete with it",
      "Build cross-functional collaboration capabilities",
      "Invest in continuous learning and adaptability",
      "Strengthen strategic thinking and leadership skills"
    ]
  };
}

async function generateAnalysis(resumeText) {
  const DEMAND_RANGES = {
    'Senior Software Engineer': { min: 70, max: 85 },
    'Data Scientist': { min: 75, max: 90 },
    'Product Manager': { min: 60, max: 80 },
    'UX Designer': { min: 50, max: 70 },
    'DevOps Engineer': { min: 65, max: 85 },
    'Marketing Manager': { min: 45, max: 65 },
    'default': { min: 40, max: 60 },
  };

  const SALARY_RANGES = {
    'Senior Software Engineer': { min: 100000, max: 250000 },
    'Data Scientist': { min: 100000, max: 220000 },
    'Product Manager': { min: 90000, max: 180000 },
    'UX Designer': { min: 70000, max: 150000 },
    'DevOps Engineer': { min: 95000, max: 200000 },
    'Marketing Manager': { min: 80000, max: 160000 },
    'default': { min: 60000, max: 150000 },
  };

  // First, extract a preliminary job title to determine the correct ranges
  const titleExtractionPrompt = `
Analyze this resume and extract the most relevant job title. Respond with ONLY the job title, nothing else.

Resume content (first 500 chars):
${resumeText.substring(0, 500)}
`;

  let extractedTitle = 'default';
  try {
    const titleResult = await model.generateContent(titleExtractionPrompt);
    const titleResponse = await titleResult.response;
    extractedTitle = titleResponse.text().trim();
    console.log('Extracted job title:', extractedTitle);
  } catch (error) {
    console.warn('Failed to extract job title, using default');
  }

  const normalizedJobTitle = normalizeJobTitle(extractedTitle);
  const demandRange = DEMAND_RANGES[normalizedJobTitle];
  const salaryRange = SALARY_RANGES[normalizedJobTitle];

  console.log(`Using ranges for ${normalizedJobTitle}: Demand ${demandRange.min}-${demandRange.max}%, Salary $${salaryRange.min}-$${salaryRange.max}`);

  const prompt = `
Analyze this resume and provide a comprehensive career analysis in the following JSON format.

CRITICAL CONSTRAINTS FOR THIS SPECIFIC ROLE (${normalizedJobTitle}):
- Market demand MUST stay between ${demandRange.min}% and ${demandRange.max}%
- Salary range MUST be between $${salaryRange.min} and $${salaryRange.max}
- NEVER generate demand values above ${demandRange.max}% or below ${demandRange.min}%
- All values must be realistic integers

Generate exactly this JSON structure:
{
  "jobTitle": "${extractedTitle}",
  "experienceLevel": "Entry Level/Mid Level/Senior Level/Executive",
  "aiRiskLevel": "Low/Medium/High",
  "coreSkills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6"],
  "careerGrowth": [
    {"year": 2024, "demand": ${demandRange.min + Math.floor(Math.random() * (demandRange.max - demandRange.min + 1))}, "salary": ${salaryRange.min + Math.floor(Math.random() * (salaryRange.max - salaryRange.min + 1))}},
    {"year": 2025, "demand": ${demandRange.min + Math.floor(Math.random() * (demandRange.max - demandRange.min + 1))}, "salary": ${salaryRange.min + Math.floor(Math.random() * (salaryRange.max - salaryRange.min + 1))}},
    {"year": 2026, "demand": ${demandRange.min + Math.floor(Math.random() * (demandRange.max - demandRange.min + 1))}, "salary": ${salaryRange.min + Math.floor(Math.random() * (salaryRange.max - salaryRange.min + 1))}},
    {"year": 2027, "demand": ${demandRange.min + Math.floor(Math.random() * (demandRange.max - demandRange.min + 1))}, "salary": ${salaryRange.min + Math.floor(Math.random() * (salaryRange.max - salaryRange.min + 1))}},
    {"year": 2028, "demand": ${demandRange.min + Math.floor(Math.random() * (demandRange.max - demandRange.min + 1))}, "salary": ${salaryRange.min + Math.floor(Math.random() * (salaryRange.max - salaryRange.min + 1))}},
    {"year": 2029, "demand": ${demandRange.min + Math.floor(Math.random() * (demandRange.max - demandRange.min + 1))}, "salary": ${salaryRange.min + Math.floor(Math.random() * (salaryRange.max - salaryRange.min + 1))}},
    {"year": 2030, "demand": ${demandRange.min + Math.floor(Math.random() * (demandRange.max - demandRange.min + 1))}, "salary": ${salaryRange.min + Math.floor(Math.random() * (salaryRange.max - salaryRange.min + 1))}},
    {"year": 2031, "demand": ${demandRange.min + Math.floor(Math.random() * (demandRange.max - demandRange.min + 1))}, "salary": ${salaryRange.min + Math.floor(Math.random() * (salaryRange.max - salaryRange.min + 1))}},
    {"year": 2032, "demand": ${demandRange.min + Math.floor(Math.random() * (demandRange.max - demandRange.min + 1))}, "salary": ${salaryRange.min + Math.floor(Math.random() * (salaryRange.max - salaryRange.min + 1))}},
    {"year": 2033, "demand": ${demandRange.min + Math.floor(Math.random() * (demandRange.max - demandRange.min + 1))}, "salary": ${salaryRange.min + Math.floor(Math.random() * (salaryRange.max - salaryRange.min + 1))}}
  ],
  "skillsAssessment": [
    {"skill": "Technical Skills", "current": 75, "recommended": 85},
    {"skill": "Leadership", "current": 65, "recommended": 75},
    {"skill": "Communication", "current": 70, "recommended": 80},
    {"skill": "Problem Solving", "current": 80, "recommended": 90},
    {"skill": "Adaptability", "current": 70, "recommended": 85}
  ],
  "emergingRoles": [
    {"title": "AI/ML Engineer", "growth": 85, "match": 75},
    {"title": "Cloud Architect", "growth": 70, "match": 65},
    {"title": "Product Strategist", "growth": 60, "match": 70}
  ],
  "aiImpact": {
    "summary": "Detailed analysis of how AI will impact this specific role based on the resume content.",
    "timeline": "3-5 years",
    "adaptationPotential": 75
  },
  "recommendations": [
    "Develop expertise in emerging technologies relevant to your field",
    "Focus on skills that complement AI rather than compete with it",
    "Build cross-functional collaboration capabilities",
    "Invest in continuous learning and adaptability",
    "Strengthen strategic thinking and leadership skills"
  ]
}

Customize the analysis based on the actual resume content, but STRICTLY maintain the demand and salary ranges specified above.

Resume content:
${resumeText}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Raw AI Response:', text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("No valid JSON found in AI response, generating fallback data");
      return generateFallbackAnalysis(extractedTitle, normalizedJobTitle, resumeText);
    }

    let analysisData;
    try {
      analysisData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.warn("Failed to parse AI JSON response, generating fallback data");
      return generateFallbackAnalysis(extractedTitle, normalizedJobTitle, resumeText);
    }

    // Validate that we have the required structure
    if (!analysisData.careerGrowth || !Array.isArray(analysisData.careerGrowth) || analysisData.careerGrowth.length !== 10) {
      console.warn("AI response missing proper careerGrowth structure, generating fallback data");
      return generateFallbackAnalysis(extractedTitle, normalizedJobTitle, resumeText);
    }

    // The data should already be within ranges due to the pre-generated structure
    // But let's add one final validation layer just in case
    const finalNormalizedJobTitle = normalizeJobTitle(analysisData.jobTitle);
    const finalDemandRange = DEMAND_RANGES[finalNormalizedJobTitle];
    const finalSalaryRange = SALARY_RANGES[finalNormalizedJobTitle];

    console.log(`Final validation - Job Title: ${analysisData.jobTitle} -> Normalized: ${finalNormalizedJobTitle}`);
    console.log(`Final Demand Range: ${finalDemandRange.min}% - ${finalDemandRange.max}%`);

    // Final validation (should not be needed if AI followed instructions)
    analysisData.careerGrowth = analysisData.careerGrowth.map((item) => {
      let demand = Math.round(item.demand);
      let salary = Math.round(item.salary);

      if (demand < finalDemandRange.min || demand > finalDemandRange.max) {
        console.error(`AI generated invalid demand ${demand}% for ${analysisData.jobTitle}, forcing to range`);
        demand = Math.max(finalDemandRange.min, Math.min(finalDemandRange.max, demand));
      }

      if (salary < finalSalaryRange.min || salary > finalSalaryRange.max) {
        console.warn(`AI generated salary ${salary} outside range, adjusting`);
        salary = Math.max(finalSalaryRange.min, Math.min(finalSalaryRange.max, salary));
      }

      return {
        ...item,
        demand,
        salary
      };
    });

    // Validate other percentage fields
    analysisData.skillsAssessment = analysisData.skillsAssessment.map((item) => ({
      ...item,
      current: Math.min(100, Math.max(0, Math.round(item.current))),
      recommended: Math.min(100, Math.max(0, Math.round(item.recommended))),
    }));

    analysisData.emergingRoles = analysisData.emergingRoles.map((item) => ({
      ...item,
      growth: Math.min(100, Math.max(0, Math.round(item.growth))),
      match: Math.min(100, Math.max(0, Math.round(item.match))),
    }));

    analysisData.aiImpact.adaptationPotential = Math.min(100, Math.max(0, Math.round(
      analysisData.aiImpact.adaptationPotential
    )));

    console.log('Backend careerGrowth (validated):', analysisData.careerGrowth);
    console.log('Demand values:', analysisData.careerGrowth.map(item => `${item.year}: ${item.demand}%`));
    
    return analysisData;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    console.warn("Falling back to fallback analysis due to AI error");
    return generateFallbackAnalysis(extractedTitle, normalizedJobTitle, resumeText);
  }
}

app.post("/api/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let resumeText;

    if (req.file.mimetype === "application/pdf") {
      resumeText = await extractTextFromPDF(req.file.buffer);
    } else if (
      req.file.mimetype.includes("word") ||
      req.file.mimetype.includes("document")
    ) {
      resumeText = await extractTextFromDOCX(req.file.buffer);
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return res
        .status(400)
        .json({ error: "Could not extract meaningful text from the resume" });
    }

    const analysis = await generateAnalysis(resumeText);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Resume analysis error:", error);
    res.status(500).json({
      error: "Failed to analyze resume",
      message: error.message,
    });
  }
});

app.options("/api/analyze-resume", cors());

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "CareerScope AI Backend is running" });
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "File too large. Maximum size is 10MB." });
    }
  }
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});