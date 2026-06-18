# 🚀 CareerFly — Project Overview

Welcome to **CareerFly**, an AI-powered student internship tracker SaaS application. CareerFly brings together frontend, backend, and edge artificial intelligence in a premium, deep-space-themed dashboard designed to streamline the student application lifecycle.

---

## 🌌 Core Pillars & Architecture

CareerFly is built on three core design principles: **Absolute Privacy**, **Zero Infrastructure Footprint**, and **Premium Interactive Aesthetics**.

```
                           ┌────────────────────────┐
                           │   CareerFly Frontend   │
                           │   (React / Vite SPA)   │
                           └──────────┬─────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│   Decentralized Sync  │ │   Edge AI Embeddings  │ │  Interactive Systems  │
│  User-deployed Apps   │ │  Transformers.js inside│ │ HTML5 Starfield & 3D  │
│  Script -> Firestore  │ │  browser (ONNX / Wasm)│ │ anti-gravity CSS cards│
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘
```

### 1. Decentralized Serverless Ingestion
* **Problem**: Centralized email parsing requires invasive third-party OAuth permissions (`gmail.readonly`) and expensive backend hosting.
* **Solution**: CareerFly guides the user to set up a **$0 cost Google Apps Script** running in their own personal Google Workspace context. The script polls their Gmail inbox for job confirmations and streams parsed details directly to their personal Firestore database using the REST API. 
* **Outcome**: 100% data privacy and zero server hosting costs for the SaaS operator.

### 2. Browser-Resident Edge-AI
* **Problem**: Running LLM APIs for resume optimization incurs recurring API token costs and exposes private resumes to cloud providers.
* **Solution**: CareerFly loads a sentence-transformer deep learning model (`all-MiniLM-L6-v2` via `@xenova/transformers`) directly in the browser sandbox. The client tokenizes content, generates 384-dimensional dense vector embeddings, and calculates semantic match scores via Cosine Similarity calculations completely locally.
* **Outcome**: Free, private, and instant resume ATS scoring.

### 3. Starfield & Zero-G Aesthetic System
* ** starfield Canvas**: An interactive HTML5 background that responds to mouse hover velocities, repelling and attracting celestial particles in real-time.
* **Zero-Gravity Transitions**: Applied 3D transform perspective keyframe animations (`AntiGravityKanban.css`) that cause Kanban cards to lift, float, and drift dynamically when updated or synced.

---

## 🛠️ Main Showcase Modules

| Module | Purpose | Key Technical Feature |
| :--- | :--- | :--- |
| **Internship Kanban Tracker** | Tracks applications across columns (`Applied`, `Interviewing`, `Offer Received`). | Real-time `onSnapshot` database listener, drag-and-drop, and automated progress gauges. |
| **AI Resume Matcher** | Computes ATS keyword density and semantic resume compatibility. | Toggles between **Local Lexical** regex, **Edge-AI** Wasm ONNX similarity, and **Gemini Cloud** models. |
| **AI Sourcing & Outreach** | Generates tailored cover letters, recruiter emails, and sourcing intel. | Word-by-word typing effect simulator, tone presets, and hunter.io email locator briefs. |
| **Calendar Checklist** | Schedules interview dates and lists automated application check-ins. | Day-by-day task lists, time checklists, and automated 3-day/7-day follow-up reminders. |
| **Mock Interview Simulator** | Virtual interactive voice-based technical interview simulator. | Web Speech Synthesis + audio capture, FastAPI integration, and Gemini critique reports. |

---

## 📂 Core File Layout

```
Internship-Application-Tracker/
├── backend/                       # Python FastAPI Server
│   ├── routes/interview.py        # Interview endpoints
│   ├── services/gemini_service.py # Gemini client integrations
│   └── main.py                    # Server config & routes mapping
├── src/                           # React Frontend
│   ├── main.jsx                   # React application router mount
│   ├── App.jsx                    # Root state, auth, & database routing
│   ├── index.css                  # Core CSS and space aesthetics styling
│   ├── AntiGravityKanban.css      # 3D keyframes floating CSS
│   ├── TrackerPage.jsx            # Kanban Board & Gmail Modal Page
│   ├── OutreachPage.jsx           # Email Sourcing Generator Page
│   ├── ResumePage.jsx             # ATS Resume Scanner page
│   ├── EdgeAnalyzer.jsx           # Standalone local model inference card
│   ├── AIInterviewPage.jsx        # Voice Interview simulator page
│   └── GmailSyncButton.jsx        # Google OAuth Web client sync button
├── firestore.rules                # Database Security Rules
├── package.json                   # Frontend dependencies configuration
└── .env                           # Environment variables template
```

---

## ⚡ Quick Start

### 1. Run Frontend (React)
```bash
npm install
npm run dev
```

### 2. Run Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --port 8000 --reload
```
