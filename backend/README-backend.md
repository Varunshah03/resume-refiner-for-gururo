# CareerScope AI Backend

A Node.js/Express backend service for AI-powered resume analysis using Google Gemini API.

## Features

- Resume file upload (PDF, DOCX) with validation
- AI-powered analysis using Google Gemini
- Text extraction from PDF and DOCX files
- Secure API key management
- CORS enabled for frontend integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Add your Google API key to `.env`:
```
GOOGLE_API_KEY=your_actual_api_key_here
```

4. Run the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### POST /api/analyze-resume
Upload and analyze a resume file.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: File upload with key 'resume'

**Response:**
```json
{
  "success": true,
  "data": {
    "jobTitle": "Software Engineer",
    "experienceLevel": "Mid Level",
    "aiRiskLevel": "Low",
    "coreSkills": ["JavaScript", "React", "Node.js"],
    "careerGrowth": [...],
    "skillsAssessment": [...],
    "emergingRoles": [...],
    "aiImpact": {...},
    "recommendations": [...]
  }
}
```

### GET /api/health
Health check endpoint.

## Security Best Practices

- API keys stored in environment variables
- File type and size validation
- Error handling and logging
- CORS configuration for production

## Deployment

For production deployment, ensure:
1. Set environment variables on your hosting platform
2. Update CORS origins for your frontend domain
3. Use HTTPS in production
4. Monitor API usage and costs

## Environment Variables

- `GOOGLE_API_KEY`: Your Google Gemini API key
- `PORT`: Server port (default: 3001)