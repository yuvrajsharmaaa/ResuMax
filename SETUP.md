# AI Resume Analyzer - Simplified Setup

## What Changed

This project has been simplified to remove authentication requirements while keeping all main features:

### Changes Made:
1. **Removed Authentication** - No login required. The app now works immediately without any sign-in process.
2. **Simplified User Flow** - Direct access to upload and analyze resumes.
3. **Removed `/auth` Route** - Authentication page is no longer in the routing system.
4. **Mock User** - A guest user is automatically authenticated in the background.

## Main Features (Still Working)

✅ **Resume Upload** - Upload PDF resumes for analysis  
✅ **AI Analysis** - Get AI-powered feedback on resumes using Puter.js AI  
✅ **ATS Score** - Receive ATS (Applicant Tracking System) compatibility scores  
✅ **Job Matching** - Analyze resumes against specific job descriptions  
✅ **Resume Management** - View all previously analyzed resumes  

## How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will be available at: **http://localhost:5173/**

### 3. Build for Production
```bash
npm run build
npm start
```

## How to Use

1. **Home Page** (`/`) - View all your analyzed resumes
2. **Upload Page** (`/upload`) - Upload a new resume for analysis
   - Enter company name
   - Enter job title
   - Paste job description
   - Upload your PDF resume
   - Click "Analyze Resume"
3. **Results Page** (`/resume/:id`) - View detailed analysis and feedback

## Technology Stack

- **Frontend**: React 19 + React Router 7
- **Styling**: TailwindCSS 4
- **State Management**: Zustand
- **AI & Storage**: Puter.js (provides AI analysis and key-value storage)
- **PDF Processing**: pdfjs-dist
- **Build Tool**: Vite

## Notes

- The app uses **Puter.js** for AI analysis and storage functionality
- All resume data is stored locally using Puter's key-value store
- PDF files are converted to images for AI analysis
- No backend server required - everything runs client-side with Puter.js APIs
