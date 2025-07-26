// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-backend-url.com'
  : 'http://localhost:3001';

// Helper function to normalize job title for consistent range lookup
function normalizeJobTitle(title: string): string {
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

export const analyzeResume = async (file: File) => {
  console.log('analyzeResume called with file:', file.name);
  console.log('Request URL:', `${API_BASE_URL}/api/analyze-resume`);
  console.log('Request Method: POST');

  const formData = new FormData();
  formData.append('resume', file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze-resume`, {
      method: 'POST',
      body: formData,
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Analysis Result:', result);
    
    // The backend should already have normalized data, but double-check
    const normalizedData = {
      ...result.data,
      careerGrowth: result.data.careerGrowth.map((item: any) => ({
        ...item,
        salary: item.salary < 1000 ? item.salary * 1000 : Math.round(item.salary),
        demand: Math.round(item.demand),
      })),
    };
    
    console.log('Normalized Data (analyzeResume):', normalizedData.careerGrowth);
    return normalizedData;
  } catch (error) {
    console.error('Resume analysis error:', error);
    console.log('Falling back to mock data due to API error');
    const mockData = generateMockAnalysis(file.name);
    console.log('Mock Data (analyzeResume):', mockData.careerGrowth);
    return mockData;
  }
};

// Fallback mock data generator (for development/testing)
export const generateMockAnalysis = (fileName: string) => {
  const jobTitles = [
    'Senior Software Engineer',
    'Product Manager',
    'Data Scientist',
    'UX Designer',
    'DevOps Engineer',
    'Marketing Manager',
  ];

  const SALARY_RANGES: Record<string, { min: number; max: number }> = {
    'Senior Software Engineer': { min: 100000, max: 250000 },
    'Data Scientist': { min: 100000, max: 220000 },
    'Product Manager': { min: 90000, max: 180000 },
    'UX Designer': { min: 70000, max: 150000 },
    'DevOps Engineer': { min: 95000, max: 200000 },
    'Marketing Manager': { min: 80000, max: 160000 },
    'default': { min: 60000, max: 150000 },
  };

  // STRICT demand ranges - NEVER exceed these values
  const DEMAND_RANGES: Record<string, { min: number; max: number }> = {
    'Senior Software Engineer': { min: 70, max: 85 },
    'Data Scientist': { min: 75, max: 90 },
    'Product Manager': { min: 60, max: 80 },
    'UX Designer': { min: 50, max: 70 },
    'DevOps Engineer': { min: 65, max: 85 },
    'Marketing Manager': { min: 45, max: 65 },
    'default': { min: 40, max: 60 },
  };

  const experienceLevels = [
    'Mid-level (3-5 years)',
    'Senior (5-8 years)',
    'Expert (8+ years)',
    'Entry-level (0-2 years)',
  ];

  const riskLevels = ['Low', 'Medium', 'High'] as const;

  const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
  const normalizedJobTitle = normalizeJobTitle(jobTitle);
  const experienceLevel = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
  const aiRiskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];

  const coreSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker',
    'Machine Learning', 'Data Analysis', 'Project Management', 'Leadership',
    'UI/UX Design', 'SQL', 'Git', 'Agile', 'Communication',
  ].slice(0, 8 + Math.floor(Math.random() * 4));

  const salaryRange = SALARY_RANGES[normalizedJobTitle] || SALARY_RANGES['default'];
  const demandRange = DEMAND_RANGES[normalizedJobTitle] || DEMAND_RANGES['default'];
  
  console.log(`Mock data for ${jobTitle} (normalized: ${normalizedJobTitle})`);
  console.log(`Demand range: ${demandRange.min}% - ${demandRange.max}%`);
  console.log(`Salary range: $${salaryRange.min.toLocaleString()} - $${salaryRange.max.toLocaleString()}`);

  // Generate realistic career growth with market fluctuations
  const careerGrowth = Array.from({ length: 10 }, (_, i) => {
    const year = 2024 + i;
    
    // Create realistic demand progression with some market fluctuations
    const demandProgress = i / 10; // 0 to 0.9
    const marketFluctuation = (Math.random() - 0.5) * 0.1; // -5% to +5% random variation
    
    // Calculate base demand within the allowed range
    let demand = demandRange.min + (demandRange.max - demandRange.min) * (0.6 + demandProgress * 0.3 + marketFluctuation);
    
    // Strictly enforce the maximum demand
    demand = Math.round(Math.min(demandRange.max, Math.max(demandRange.min, demand)));
    
    // Generate salary with realistic growth
    const salaryProgress = i / 9; // 0 to 1 over 10 years
    const baseSalary = salaryRange.min + (salaryRange.max - salaryRange.min) * (0.4 + salaryProgress * 0.5);
    const salaryVariation = (Math.random() - 0.5) * 0.1; // Small random variation
    const salary = Math.round(baseSalary * (1 + salaryVariation));
    
    return {
      year,
      demand,
      salary: Math.min(salaryRange.max, Math.max(salaryRange.min, salary)),
    };
  });

  console.log(`Mock careerGrowth for ${jobTitle}:`, careerGrowth.map(item => `${item.year}: ${item.demand}%`));
  
  // Verify no demand values exceed the maximum
  const maxDemandInData = Math.max(...careerGrowth.map(item => item.demand));
  if (maxDemandInData > demandRange.max) {
    console.error(`ERROR: Generated demand ${maxDemandInData}% exceeds maximum ${demandRange.max}% for ${jobTitle}`);
  }

  const skillsAssessment = [
    { skill: 'Technical Skills', current: Math.round(75 + Math.random() * 20), recommended: Math.round(85 + Math.random() * 15) },
    { skill: 'Leadership', current: Math.round(55 + Math.random() * 25), recommended: Math.round(65 + Math.random() * 20) },
    { skill: 'Communication', current: Math.round(70 + Math.random() * 20), recommended: Math.round(85 + Math.random() * 15) },
    { skill: 'Problem Solving', current: Math.round(80 + Math.random() * 15), recommended: Math.round(90 + Math.random() * 10) },
    { skill: 'Adaptability', current: Math.round(65 + Math.random() * 25), recommended: Math.round(85 + Math.random() * 15) },
    { skill: 'Innovation', current: Math.round(70 + Math.random() * 20), recommended: Math.round(80 + Math.random() * 20) },
  ];

  const emergingRoles = [
    { title: 'AI/ML Engineer', growth: Math.round(85 + Math.random() * 15), match: Math.round(75 + Math.random() * 20) },
    { title: 'Cloud Architect', growth: Math.round(70 + Math.random() * 20), match: Math.round(65 + Math.random() * 25) },
    { title: 'Product Strategist', growth: Math.round(60 + Math.random() * 25), match: Math.round(70 + Math.random() * 20) },
    { title: 'Data Engineer', growth: Math.round(80 + Math.random() * 15), match: Math.round(60 + Math.random() * 30) },
  ];

  const aiImpactSummaries = [
    'AI will enhance your role by automating routine tasks, allowing you to focus on strategic thinking and creative problem-solving.',
    'While AI may automate some tasks, your domain expertise and interpersonal skills remain highly valuable.',
    'AI presents both challenges and opportunities in your field. Adapting to AI tools will be crucial for maintaining competitiveness.',
  ];

  const timelines = ['2-3 years', '3-5 years', '5-7 years'];

  const recommendationSets = [
    [
      'Develop expertise in AI and machine learning fundamentals to stay competitive.',
      'Focus on cross-functional collaboration skills that AI cannot replicate.',
      'Pursue certifications in cloud platforms (AWS, Azure, GCP) for modern infrastructure.',
      'Invest in data analysis and visualization skills for data-driven decision making.',
      'Build a professional network through industry events and online communities.',
    ],
    [
      'Enhance understanding of emerging technologies in your field.',
      'Develop project management and leadership capabilities.',
      'Focus on continuous learning and adaptability in a rapidly changing market.',
      'Build expertise in automation tools to improve efficiency.',
      'Cultivate strategic thinking and business acumen for career advancement.',
    ],
  ];

  return {
    jobTitle,
    experienceLevel,
    aiRiskLevel,
    coreSkills: coreSkills.slice(0, 6 + Math.floor(Math.random() * 4)),
    careerGrowth,
    skillsAssessment,
    emergingRoles,
    aiImpact: {
      summary: aiImpactSummaries[Math.floor(Math.random() * aiImpactSummaries.length)],
      timeline: timelines[Math.floor(Math.random() * timelines.length)],
      adaptationPotential: Math.round(60 + Math.random() * 35),
    },
    recommendations: recommendationSets[Math.floor(Math.random() * recommendationSets.length)],
  };
};