# Job Hunter AI

> **"Find better-matched jobs. Tailor your application. Apply with confidence."**

Job Hunter AI is a full-stack job application assistant designed to help job seekers discover relevant jobs, objectively evaluate their profile against job requirements with cited evidence, tailor CVs honestly without fabricating credentials, generate grounded screening answers, prepare for interviews using the STAR method, and track every application across an 8-stage Kanban pipeline.

---

## 1. Core Principle: Anti-Fabrication Guarantee

**NEVER fabricate candidate information.**

Job Hunter AI adheres strictly to the candidate's verified background:
* **The AI may:** rewrite, reorganize, emphasize relevant existing accomplishments, improve phrasing, map verified skills to job requirements, and generate screening responses based on the candidate's actual profile.
* **The AI will NEVER:** invent work history, inflate years of experience, fake degrees or certifications, add unlisted technologies, or fabricate accomplishments. Missing requirements are clearly declared as gaps with transparent advice.
* **Transparent Matching Score:** represents **profile-to-job requirement alignment**, NOT a speculative "probability of getting hired".

---

## 2. Technology Stack

### Frontend
* **React 19 & TypeScript**
* **Vite**
* **Tailwind CSS v4**
* **Lucide Icons & Motion**

### Backend & API
* **Express & Node.js (Full-stack TypeScript runner)**
* **Flask & Python (Alternative standalone microservice in `/backend`)**
* **JWT & Bcrypt** for secure password hashing and authentication
* **ACID-safe persistent file store** with user-level data isolation in `/data/db.json`

### AI Architecture
* **Google Gemini API** (`@google/genai` with model `gemini-3.8-flash`)
* Strict system instruction: `ANTI_FABRICATION_SYSTEM_PROMPT`
* Server-side execution only (API key never exposed to client)
* Deterministic offline fallback engine for zero-downtime test drives when an API key is not yet configured.

---

## 3. Project Structure

```text
job-hunter-ai/
│
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── JobCard.tsx
│   │   ├── AntiFabricationBadge.tsx
│   │   ├── JobAnalysisModal.tsx
│   │   ├── CVTailoringModal.tsx
│   │   ├── CoverLetterModal.tsx
│   │   ├── ManualJobModal.tsx
│   │   └── ApplicationAssistantModal.tsx
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── FindJobsPage.tsx
│   │   ├── SavedJobsPage.tsx
│   │   ├── ApplicationsPage.tsx
│   │   ├── MyCVPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── ApplicationAnswersPage.tsx
│   │   ├── InterviewPrepPage.tsx
│   │   └── SettingsPage.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── server/
│   ├── middleware/
│   │   └── auth.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── profile.ts
│   │   ├── jobs.ts
│   │   ├── cv.ts
│   │   ├── ai.ts
│   │   └── applications.ts
│   ├── services/
│   │   └── aiService.ts
│   └── db.ts
│
├── backend/                  # Python Flask Alternative
│   ├── app/
│   │   └── __init__.py
│   ├── requirements.txt
│   └── run.py
│
├── server.ts                 # Full-stack Node entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── README.md
```

---

## 4. Quickstart & Local Installation

### Prerequisites
* Node.js 20+
* (Optional) Python 3.10+ if running the Python backend

### Setup & Run

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   PORT=3000
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Production Build:**
   ```bash
   npm run build
   npm start
   ```

---

## 5. Running the Python Flask Backend (Optional)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

---

## 6. Key Application Features

1. **Master CV vs. Tailored Versions:**
   * Your Master CV is the single source of truth and is never overwritten.
   * Tailored CVs are saved as distinct versions linked to target job descriptions.
2. **Evidence-Based Job Analysis:**
   * Every requirement match is paired with the verified evidence in your profile (e.g. *"Python — supported by: Junior Full-Stack Developer Trainee experience"*).
3. **Application Answers Generator:**
   * Generates short, medium, or detailed answers to screening questions (e.g. *"Describe your experience with Python"*) without inventing skills.
4. **Interview Preparation with STAR:**
   * Provides technical, behavioral (Situation, Task, Action, Result), role, and project deep-dive questions.
5. **8-Stage Application Tracker:**
   * Saved, Preparing, Applied, Assessment, Interview, Offer, Rejected, Withdrawn. Supports Kanban and Table views.
