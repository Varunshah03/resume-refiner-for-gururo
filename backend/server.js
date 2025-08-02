import express from "express";
import cors from "cors";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFParser from "pdf2json";
import mammoth from "mammoth";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";
import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Ensure cache directory exists
const cacheDir = path.join(__dirname, "cache");
if (!existsSync(cacheDir)) {
  mkdirSync(cacheDir);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:8080",
        "resume-refiner-for-gururo.vercel.app",
        "resume-refiner-for-gururo-lby6lvb8o-varunshah03s-projects.vercel.app",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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

// Track API requests for quota monitoring
let dailyRequestCount = 0;
const DAILY_QUOTA_LIMIT = 50; // Free tier limit for gemini-1.5-flash

async function extractTextFromPDF(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", (err) => {
      console.error("PDF parsing error:", err);
      reject(new Error("Failed to parse PDF"));
    });
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      try {
        const text = pdfData.Pages.map((page) =>
          page.Texts.map((text) => decodeURIComponent(text.R[0].T)).join(" ")
        ).join(" ");
        console.log(
          "Extracted PDF text (first 500 chars):",
          text.substring(0, 500)
        );
        resolve(text);
      } catch (err) {
        console.error("Error processing PDF data:", err);
        reject(new Error("Failed to process PDF content"));
      }
    });
    try {
      pdfParser.parseBuffer(buffer);
    } catch (err) {
      console.error("PDF parsing failed:", err);
      reject(new Error("Failed to parse PDF"));
    }
  });
}

async function extractTextFromDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    console.log(
      "Extracted DOCX text (first 500 chars):",
      result.value.substring(0, 500)
    );
    return result.value;
  } catch (error) {
    console.error("DOCX extraction error:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}

// Helper function to normalize job title for consistent lookup
function normalizeJobTitle(title) {
  return title.trim().toLowerCase();
}

// Fallback job title extraction using keywords or filename
function extractJobTitleFallback(resumeText, fileName = "") {
  const jobTitleKeywords = [
    "software engineer",
    "data scientist",
    "product manager",
    "nurse",
    "lawyer",
    "ux designer",
    "marketing manager",
    "financial analyst",
    "teacher",
    "digital marketing",
    "product designer",
  ];
  const lowerText = resumeText.toLowerCase();
  let jobTitle = jobTitleKeywords.find((title) => lowerText.includes(title));
  if (!jobTitle && fileName) {
    const fileNameLower = fileName.toLowerCase();
    jobTitle = fileNameLower.includes("software")
      ? "Software Engineer"
      : fileNameLower.includes("data")
      ? "Data Scientist"
      : fileNameLower.includes("nurse")
      ? "Registered Nurse"
      : fileNameLower.includes("lawyer")
      ? "Lawyer"
      : fileNameLower.includes("ux")
      ? "UX Designer"
      : fileNameLower.includes("marketing")
      ? "Marketing Manager"
      : fileNameLower.includes("digital")
      ? "Digital Marketing"
      : fileNameLower.includes("financial")
      ? "Financial Analyst"
      : fileNameLower.includes("graphic")
      ? "Graphic Designer"
      : fileNameLower.includes("teacher")
      ? "Teacher"
      : fileNameLower.includes("product designer")
      ? "Product Designer"
      : "Professional";
  }
  return jobTitle || "Professional";
}

// Cache helper functions
async function getCachedAnalysis(resumeText, fileName) {
  const hash = createHash("md5")
    .update(resumeText + fileName)
    .digest("hex");
  try {
    const cached = await fs.readFile(
      path.join(cacheDir, `${hash}.json`),
      "utf-8"
    );
    console.log(`Cache hit for resume: ${fileName}`);
    return JSON.parse(cached);
  } catch {
    console.log(`Cache miss for resume: ${fileName}`);
    return null;
  }
}

async function cacheAnalysis(resumeText, fileName, analysis) {
  const hash = createHash("md5")
    .update(resumeText + fileName)
    .digest("hex");
  try {
    await fs.writeFile(
      path.join(cacheDir, `${hash}.json`),
      JSON.stringify(analysis)
    );
    console.log(`Cached analysis for resume: ${fileName}`);
  } catch (error) {
    console.error("Cache write error:", error);
  }
}

// Retry logic for API calls
async function makeRequestWithRetry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      dailyRequestCount++;
      console.log(
        `API request successful. Estimated requests used: ${dailyRequestCount}/${DAILY_QUOTA_LIMIT}`
      );
      if (dailyRequestCount >= DAILY_QUOTA_LIMIT * 0.8) {
        console.warn(
          `Quota warning: ${dailyRequestCount}/${DAILY_QUOTA_LIMIT} requests used. Approaching daily limit.`
        );
      }
      return result;
    } catch (error) {
      if ((error.status === 503 || error.status === 429) && i < retries - 1) {
        const retryDelay = error.errorDetails?.find(
          (detail) =>
            detail["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
        )?.retryDelay;
        const delayMs = retryDelay
          ? parseFloat(retryDelay) * 1000
          : delay * Math.pow(2, i);
        console.log(
          `Retrying API call (attempt ${
            i + 2
          }/${retries}) after ${delayMs}ms due to ${error.status} error`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw error;
    }
  }
}

// Fallback function to generate reliable data when AI fails
function generateFallbackAnalysis(jobTitle, resumeText, fileName) {
  const skillsAssessment = [
    { skill: "Technical Skills", current: 75, recommended: 85 },
    { skill: "Leadership", current: 65, recommended: 75 },
    { skill: "Communication", current: 70, recommended: 80 },
    { skill: "Problem Solving", current: 80, recommended: 90 },
    { skill: "Adaptability", current: 70, recommended: 85 },
  ];

  // Extract core skills from resumeText or use defaults
  const skillKeywords = [
    "javascript",
    "python",
    "sql",
    "leadership",
    "communication",
    "problem solving",
    "adaptability",
    "data analysis",
    "project management",
    "clinical skills",
    "legal writing",
    "patient care",
    "negotiation",
    "ux design",
    "marketing",
    "machine learning",
    "digital marketing",
  ];
  const coreSkills = skillKeywords
    .filter((keyword) => resumeText.toLowerCase().includes(keyword))
    .slice(0, 6)
    .map((skill) => skill.charAt(0).toUpperCase() + skill.slice(1))
    .concat(
      ["Technical Skills", "Communication", "Problem Solving"].slice(
        0,
        6 - skillKeywords.length
      )
    );

  // Generate dynamic learning paths based on core skills and skill gaps
  const learningPaths = skillsAssessment
    .filter((skill) => skill.current < skill.recommended)
    .slice(0, 3)
    .map((skill, index) => {
      const platforms = ["Coursera", "Udemy", "LinkedIn Learning"];
      const platform = platforms[index % platforms.length];
      const duration = `${8 + index * 5} hours`;
      const skillLower = skill.skill.toLowerCase();
      let courseTitle = `Advanced ${skill.skill}`;
      let link = `https://www.${platform
        .toLowerCase()
        .replace(" ", "")}.com/learn/${skillLower.replace(" ", "-")}`;

      if (skillLower.includes("technical")) {
        courseTitle = jobTitle.toLowerCase().includes("software")
          ? "Advanced Software Development"
          : jobTitle.toLowerCase().includes("data")
          ? "Data Analysis Fundamentals"
          : jobTitle.toLowerCase().includes("nurse")
          ? "Advanced Clinical Skills"
          : jobTitle.toLowerCase().includes("lawyer")
          ? "Legal Analysis and Writing"
          : jobTitle.toLowerCase().includes("marketing")
          ? "Digital Marketing Strategies"
          : jobTitle.toLowerCase().includes("product designer")
          ? "Advanced Product Design"
          : "Professional Skills Development";
        link = `https://www.${platform
          .toLowerCase()
          .replace(" ", "")}.com/learn/${courseTitle
          .toLowerCase()
          .replace(" ", "-")}`;
      } else if (skillLower.includes("leadership")) {
        courseTitle = "Leadership and Management";
      } else if (skillLower.includes("communication")) {
        courseTitle = "Effective Communication Skills";
      } else if (skillLower.includes("problem solving")) {
        courseTitle = "Problem Solving Techniques";
      } else if (skillLower.includes("adaptability")) {
        courseTitle = "Adaptability and Resilience";
      }

      return {
        title: courseTitle,
        platform,
        duration,
        link,
        skillAddressed: skill.skill,
      };
    });

  // Ensure at least 3 learning paths
  while (learningPaths.length < 3) {
    const defaultSkill =
      skillsAssessment[learningPaths.length % skillsAssessment.length].skill;
    learningPaths.push({
      title: `Introduction to ${defaultSkill}`,
      platform: "Coursera",
      duration: "10 hours",
      link: `https://www.coursera.org/learn/${defaultSkill
        .toLowerCase()
        .replace(" ", "-")}`,
      skillAddressed: defaultSkill,
    });
  }

  return {
    jobTitle,
    experienceLevel: "Mid Level",
    aiRiskLevel: "Medium",
    coreSkills,
    skillsAssessment,
    emergingRoles: [
      { title: "AI/ML Engineer", growth: 85, match: 75 },
      { title: "Cloud Architect", growth: 70, match: 65 },
      { title: "Product Strategist", growth: 60, match: 70 },
    ],
    aiImpact: {
      summary:
        "AI will enhance your role by automating routine tasks while increasing demand for strategic thinking and human-centered skills.",
      timeline: "3-5 years",
      adaptationPotential: 75,
    },
    recommendations: [
      "Develop expertise in emerging technologies relevant to your field",
      "Focus on skills that complement AI rather than compete with it",
      "Build cross-functional collaboration capabilities",
      "Invest in continuous learning and adaptability",
      "Strengthen strategic thinking and leadership skills",
    ],
    learningPaths,
    isFallback: true,
    extractionWarning: resumeText
      ? undefined
      : "Failed to extract text from resume, using fallback analysis",
    quotaExceeded: dailyRequestCount >= DAILY_QUOTA_LIMIT,
  };
}

async function generateAnalysis(resumeText, fileName) {
  // Check cache first
  const cached = await getCachedAnalysis(resumeText, fileName);
  if (cached) return cached;

  // Log resume text for debugging
  console.log(
    "Resume Text (first 500 chars):",
    resumeText?.substring(0, 500) || "No text extracted"
  );

  const prompt = `
You are a career analysis expert. Analyze the provided resume text and generate a comprehensive career analysis in the following JSON format. First, extract the most relevant job title from sections like "Objective," "Professional Summary," or job history. Then, provide a detailed analysis based on the resume content.

Return exactly this JSON structure:
{
  "jobTitle": "Extracted job title",
  "experienceLevel": "Entry Level/Mid Level/Senior Level/Executive",
  "aiRiskLevel": "Low/Medium/High",
  "coreSkills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6"],
  "skillsAssessment": [
    {"skill": "Technical Skills", "current": 75, "recommended": 85},
    {"skill": "Leadership", "current": 65, "recommended": 75},
    {"skill": "Communication", "current": 70, "recommended": 80},
    {"skill": "Problem Solving", "current": 80, "recommended": 90},
    {"skill": "Adaptability", "current": 70, "recommended": 85}
  ],
  "emergingRoles": [
    {"title": "Role1", "growth": 85, "match": 75},
    {"title": "Role2", "growth": 70, "match": 65},
    {"title": "Role3", "growth": 60, "match": 70}
  ],
  "aiImpact": {
    "summary": "Detailed analysis of how AI will impact this specific role based on the resume content.",
    "timeline": "3-5 years",
    "adaptationPotential": 75
  },
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2",
    "Recommendation 3",
    "Recommendation 4",
    "Recommendation 5"
  ],
  "learningPaths": [
    {
      "title": "Course title relevant to the job title and skill gaps",
      "platform": "Coursera/Udemy/LinkedIn Learning",
      "duration": "Estimated duration (e.g., 10 hours)",
      "link": "Valid platform URL",
      "skillAddressed": "Skill from skillsAssessment with a gap"
    }
  ]
}

- Extract the job title accurately from the resume text or use a fallback title like "Professional" if unclear.
- Customize the analysis based on the resume content. Identify core skills and skill gaps (where current < recommended).
- For learningPaths, recommend 3-5 online courses from Coursera, Udemy, or LinkedIn Learning that address skill gaps and are relevant to the job title and experience level.
- Ensure the response is valid JSON. Do not include any text outside the JSON object.

Resume content:
${resumeText || "No text available"}
`;

  try {
    const result = await makeRequestWithRetry(() =>
      model.generateContent(prompt)
    );
    const response = await result.response;
    const text = response.text();
    console.log("Raw AI Response:", text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn(
        "No valid JSON found in AI response, generating fallback data"
      );
      const fallbackTitle = extractJobTitleFallback(resumeText || "", fileName);
      return generateFallbackAnalysis(
        fallbackTitle,
        resumeText || "",
        fileName
      );
    }

    let analysisData;
    try {
      analysisData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.warn(
        "Failed to parse AI JSON response, generating fallback data"
      );
      const fallbackTitle = extractJobTitleFallback(resumeText || "", fileName);
      return generateFallbackAnalysis(
        fallbackTitle,
        resumeText || "",
        fileName
      );
    }

    // Validate percentage fields
    analysisData.skillsAssessment = analysisData.skillsAssessment.map(
      (item) => ({
        ...item,
        current: Math.min(100, Math.max(0, Math.round(item.current))),
        recommended: Math.min(100, Math.max(0, Math.round(item.recommended))),
      })
    );

    analysisData.emergingRoles = analysisData.emergingRoles.map((item) => ({
      ...item,
      growth: Math.min(100, Math.max(0, Math.round(item.growth))),
      match: Math.min(100, Math.max(0, Math.round(item.match))),
    }));

    analysisData.aiImpact.adaptationPotential = Math.min(
      100,
      Math.max(0, Math.round(analysisData.aiImpact.adaptationPotential))
    );

    // Ensure learningPaths is always an array
    analysisData.learningPaths = Array.isArray(analysisData.learningPaths)
      ? analysisData.learningPaths
      : [];

    // Cache the successful response
    await cacheAnalysis(resumeText, fileName, analysisData);

    return analysisData;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    console.warn("Falling back to fallback analysis due to AI error");
    const fallbackTitle = extractJobTitleFallback(resumeText || "", fileName);
    const fallbackData = generateFallbackAnalysis(
      fallbackTitle,
      resumeText || "",
      fileName
    );
    if (error.status === 429) {
      fallbackData.quotaExceeded = true;
    }
    return fallbackData;
  }
}

app.post("/api/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let resumeText;
    let extractionWarning;

    if (req.file.mimetype === "application/pdf") {
      try {
        resumeText = await extractTextFromPDF(req.file.buffer);
      } catch (error) {
        console.warn(
          "PDF text extraction failed, proceeding with fallback analysis"
        );
        resumeText = "";
        extractionWarning =
          "Failed to extract text from PDF, using fallback analysis";
      }
    } else if (
      req.file.mimetype.includes("word") ||
      req.file.mimetype.includes("document")
    ) {
      try {
        resumeText = await extractTextFromDOCX(req.file.buffer);
      } catch (error) {
        console.warn(
          "DOCX text extraction failed, proceeding with fallback analysis"
        );
        resumeText = "";
        extractionWarning =
          "Failed to extract text from DOCX, using fallback analysis";
      }
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Relaxed validation: allow short text or missing keywords
    if (!resumeText || resumeText.trim().length < 10) {
      console.warn("Resume text too short or empty, using fallback analysis");
      resumeText = "";
      extractionWarning =
        "Resume text too short or empty, using fallback analysis";
    }

    const analysis = await generateAnalysis(resumeText, req.file.originalname);
    if (extractionWarning) {
      analysis.extractionWarning = extractionWarning;
    }

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
