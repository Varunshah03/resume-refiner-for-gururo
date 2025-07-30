// mockData.ts
// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://careerscope-ai.onrender.com'
  : 'http://localhost:3001';

// Helper function to normalize job title for consistent lookup
function normalizeJobTitle(title: string): string {
  return title.trim().toLowerCase();
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
    
    return result.data;
  } catch (error) {
    console.error('Resume analysis error:', error);
    console.log('Falling back to mock data due to API error');
    const mockData = generateMockAnalysis(file.name);
    console.log('Mock Data (analyzeResume):', mockData);
    return { ...mockData, isFallback: true };
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
    'Registered Nurse',
    'Lawyer',
    'Data Analyst',
    'Financial Analyst',
    'Graphic Designer',
    'Teacher',
    'Digital Marketing'
  ];

  const experienceLevels = [
    'Entry-level (0-2 years)',
    'Mid-level (3-5 years)',
    'Senior (5-8 years)',
'senior (5-8 years)',
    'Executive (8+ years)'
  ];

  const riskLevels = ['Low', 'Medium', 'High'] as const;

  // Derive job title from filename if possible
  const fileNameLower = fileName.toLowerCase();
  const jobTitle = fileNameLower.includes('software') ? 'Software Engineer' :
                   fileNameLower.includes('data') ? 'Data Scientist' :
                   fileNameLower.includes('nurse') ? 'Registered Nurse' :
                   fileNameLower.includes('lawyer') ? 'Lawyer' :
                   fileNameLower.includes('ux') ? 'UX Designer' :
                   fileNameLower.includes('marketing') ? 'Marketing Manager' :
                   fileNameLower.includes('digital') ? 'Digital Marketing' :
                   fileNameLower.includes('financial') ? 'Financial Analyst' :
                   fileNameLower.includes('graphic') ? 'Graphic Designer' :
                   fileNameLower.includes('teacher') ? 'Teacher' :
                   jobTitles[Math.floor(Math.random() * jobTitles.length)];
  const normalizedJobTitle = normalizeJobTitle(jobTitle);
  const experienceLevel = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
  const aiRiskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];

  const coreSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker',
    'Machine Learning', 'Data Analysis', 'Project Management', 'Leadership',
    'UI/UX Design', 'SQL', 'Git', 'Agile', 'Communication',
    'Clinical Skills', 'Legal Analysis', 'Patient Care', 'Negotiation',
    'Financial Modeling', 'Graphic Design', 'Curriculum Development',
    'Digital Marketing'
  ].slice(0, 6 + Math.floor(Math.random() * 4));

  const skillsAssessment = [
    { skill: 'Technical Skills', current: Math.round(75 + Math.random() * 20), recommended: Math.round(85 + Math.random() * 15) },
    { skill: 'Leadership', current: Math.round(55 + Math.random() * 25), recommended: Math.round(65 + Math.random() * 20) },
    { skill: 'Communication', current: Math.round(70 + Math.random() * 20), recommended: Math.round(85 + Math.random() * 15) },
    { skill: 'Problem Solving', current: Math.round(80 + Math.random() * 15), recommended: Math.round(90 + Math.random() * 10) },
    { skill: 'Adaptability', current: Math.round(65 + Math.random() * 25), recommended: Math.round(85 + Math.random() * 15) },
    { skill: 'Innovation', current: Math.round(70 + Math.random() * 20), recommended: Math.round(80 + Math.random() * 20) }
  ];

  const emergingRoles = [
    { title: 'AI/ML Engineer', growth: Math.round(85 + Math.random() * 15), match: Math.round(75 + Math.random() * 20) },
    { title: 'Cloud Architect', growth: Math.round(70 + Math.random() * 20), match: Math.round(65 + Math.random() * 25) },
    { title: 'Product Strategist', growth: Math.round(60 + Math.random() * 25), match: Math.round(70 + Math.random() * 20) },
    { title: 'Data Engineer', growth: Math.round(80 + Math.random() * 15), match: Math.round(60 + Math.random() * 30) }
  ];

  const aiImpactSummaries = [
    'AI will enhance your role by automating routine tasks, allowing you to focus on strategic thinking and creative problem-solving.',
    'While AI may automate some tasks, your domain expertise and interpersonal skills remain highly valuable.',
    'AI presents both challenges and opportunities in your field. Adapting to AI tools will be crucial for maintaining competitiveness.'
  ];

  const timelines = ['2-3 years', '3-5 years', '5-7 years'];

  // Generate dynamic learning paths based on core skills and skill gaps
  const learningPaths = skillsAssessment
    .filter(skill => skill.current < skill.recommended)
    .slice(0, 3)
    .map((skill, index) => {
      const platforms = ['Coursera', 'Udemy', 'LinkedIn Learning'];
      const platform = platforms[index % platforms.length];
      const duration = `${8 + index * 5} hours`;
      const skillLower = skill.skill.toLowerCase();
      let courseTitle = `Advanced ${skill.skill}`;
      let link = `https://www.${platform.toLowerCase().replace(' ', '')}.com/learn/${skillLower.replace(' ', '-')}`;

      if (skillLower.includes('technical')) {
        courseTitle = jobTitle.toLowerCase().includes('software') ? 'Advanced Software Development' :
                      jobTitle.toLowerCase().includes('data') ? 'Data Analysis Fundamentals' :
                      jobTitle.toLowerCase().includes('nurse') ? 'Advanced Clinical Skills' :
                      jobTitle.toLowerCase().includes('lawyer') ? 'Legal Analysis and Writing' :
                      jobTitle.toLowerCase().includes('marketing') ? 'Digital Marketing Strategies' :
                      jobTitle.toLowerCase().includes('financial') ? 'Financial Modeling and Analysis' :
                      jobTitle.toLowerCase().includes('graphic') ? 'Graphic Design Mastery' :
                      jobTitle.toLowerCase().includes('teacher') ? 'Modern Teaching Methods' :
                      'Professional Skills Development';
        link = `https://www.${platform.toLowerCase().replace(' ', '')}.com/learn/${courseTitle.toLowerCase().replace(' ', '-')}`;
      } else if (skillLower.includes('leadership')) {
        courseTitle = ' Leadership and Management';
      } else if (skillLower.includes('communication')) {
        courseTitle = 'Effective Communication Skills';
      } else if (skillLower.includes('problem solving')) {
        courseTitle = 'Problem Solving Techniques';
      } else if (skillLower.includes('adaptability')) {
        courseTitle = 'Adaptability and Resilience';
      }

      return {
        title: courseTitle,
        platform,
        duration,
        link,
        skillAddressed: skill.skill
      };
    });

  // Ensure at least 3 learning paths
  while (learningPaths.length < 3) {
    const defaultSkill = skillsAssessment[learningPaths.length % skillsAssessment.length].skill;
    learningPaths.push({
      title: `Introduction to ${defaultSkill}`,
      platform: 'Coursera',
      duration: '10 hours',
      link: `https://www.coursera.org/learn/${defaultSkill.toLowerCase().replace(' ', '-')}`,
      skillAddressed: defaultSkill
    });
  }

  return {
    jobTitle,
    experienceLevel,
    aiRiskLevel,
    coreSkills,
    skillsAssessment,
    emergingRoles,
    aiImpact: {
      summary: aiImpactSummaries[Math.floor(Math.random() * aiImpactSummaries.length)],
      timeline: timelines[Math.floor(Math.random() * timelines.length)],
      adaptationPotential: Math.round(60 + Math.random() * 35),
    },
    recommendations: [
      'Develop expertise in emerging technologies relevant to your field',
      'Focus on skills that complement AI rather than compete with it',
      'Build cross-functional collaboration capabilities',
      'Invest in continuous learning and adaptability',
      'Strengthen strategic thinking and leadership skills'
    ],
    learningPaths,
    extractionWarning: 'Failed to extract text from resume, using mock data'
  };
};