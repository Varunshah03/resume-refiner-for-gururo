# Resume Refiner - CareerScope AI Documentation

## Overview
Resume Refiner is a full-stack web app that analyzes resumes using AI to provide career insights, skill assessments, and personalized recommendations. It helps users understand their career growth and prepare for future job market changes.

## Architecture
- **Frontend:** React with TypeScript, Firebase Authentication, and UI components.
- **Backend:** Node.js with Express, Google Gemini AI for resume analysis.
- **Deployment:** Docker containers for frontend and backend.

## Features
- Upload PDF/DOCX resumes for AI-powered analysis.
- Skills assessment with radar charts.
- Career growth and AI impact predictions.
- Personalized learning path recommendations.
- User authentication and profile management.

## Frontend
- Built with React, TypeScript, and shadcn/ui components.
- Key components: UploadSection, AnalysisResults, SkillsRadarChart, UserProfile.
- Uses Firebase for authentication and Firestore for user data.
- Routes: /login, /signup, /dashboard, /profile, /upload.

## Backend
- Express server handling resume uploads and analysis.
- Extracts text from PDF/DOCX files.
- Calls Google Gemini AI to generate career analysis.
- Caches results to improve performance.
- API endpoints:
  - POST /api/analyze-resume: Upload and analyze resume.
  - GET /api/health: Server health check.

## Running the Project

### Prerequisites
- Node.js (v18+)
- NPM (v8+)
- Docker (optional for containerized deployment)
- Google API key for Gemini AI
- Firebase project with authentication enabled

### Frontend Setup
1. Navigate to `frontend` folder.
2. Run `npm install`.
3. Create `.env` with Firebase config.
4. Run `npm run dev` to start development server.

### Backend Setup
1. Navigate to `backend` folder.
2. Run `npm install`.
3. Create `.env` with `GOOGLE_API_KEY`.
4. Run `npm run dev` to start backend server.

### Using Docker
- Run `docker-compose up` to start both frontend and backend containers.

## Environment Variables

### Frontend (.env)
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

### Backend (.env)
```
GOOGLE_API_KEY=your_google_api_key
PORT=3001
```

## Project Structure
```
resume-refiner/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── cache/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── firebase.js
│   │   └── App.tsx
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## Troubleshooting
- Ensure correct environment variables are set.
- Check CORS settings if frontend cannot reach backend.
- Verify Google API key and Firebase config.
- File uploads must be PDF or DOCX and under 10MB.
- Use logs for debugging backend and frontend errors.

---

This documentation provides a concise overview to help developers understand, run, and contribute to the Resume Refiner project.
