# 🌌 CareerFly Project Explainer

Welcome to **CareerFly**, a premium, AI-powered student internship tracker SaaS application. CareerFly integrates frontend, backend, and client-side Edge-AI into a deep-space-themed dashboard designed to streamline the student application lifecycle.

This document provides a clean, structured, and easy-to-read explanation of the project's purpose, design architecture, key features, and file organization.

---

## 🧭 Executive Summary

**CareerFly** is built to solve three main problems faced by students applying for internships:
1. **Manual Tracking Fatigue**: Students apply to dozens of roles weekly and struggle to update spreadsheets.
2. **Data Privacy**: Existing email-parsing services demand invasive access to user inboxes and store private data on centralized servers.
3. **High AI/API Costs**: Running large AI models on a cloud backend for resume screening and ATS matching is expensive and raises privacy concerns.

**The Solution**: CareerFly uses a **decentralized, serverless footprint** where possible. It runs sentence-transformer AI models directly in the user's browser sandbox (local inference) and relies on user-deployed Google Apps Scripts to sync emails, keeping operational infrastructure cost at **$0** while ensuring absolute data privacy.

---

## 🏗️ System Architecture & Data Flow

CareerFly separates local edge execution, user-deployed automation, and backend cloud processing:

```mermaid
graph TD
    %% Frontend Subsystem
    subgraph Browser Context (React SPA)
        A[App.jsx Router & State] --> B[TrackerPage.jsx - Kanban Board]
        A --> C[ResumePage.jsx - ATS Matcher]
        A --> D[OutreachPage.jsx - Cold Email Writer]
        A --> E[AIInterviewPage.jsx - Mock Interview]

        %% Local Edge AI
        C -->|Loads via Wasm/ONNX| F[Transformers.js all-MiniLM-L6-v2]
        F -->|384-d Vector Embeddings| G[Local Semantic Match Score]
    end

    %% User's Cloud Context
    subgraph User's Personal Cloud (Google Workspace)
        H[Gmail Inbox] -->|Polled Hourly| I[Google Apps Script]
        I -->|Direct REST Write| J[(User's Firebase Firestore)]
    end

    %% Firestore Sync
    J -->|Real-time onSnapshot Listener| B

    %% Backend Context
    subgraph Cloud Backend
        E -->|Audio & Transcripts| K[FastAPI Server backend/main.py]
        K -->|Evaluate Prep| L[Gemini Cloud API]
    end

    style A fill:#0d0d23,stroke:#3b82f6,stroke-width:2px,color:#fff
    style F fill:#1e1b4b,stroke:#a855f7,stroke-width:2px,color:#fff
    style I fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff
    style K fill:#3f1f00,stroke:#f59e0b,stroke-width:2px,color:#fff
```

---

## 🛠️ The 3 Core Pillars

### 1. Decentralized Sync (Gmail Ingestion)
* **How it works**: Instead of running a centralized server scanning every user's emails, CareerFly lets users connect their Gmail via a **personal Google Apps Script**.
* **Flow**: The script runs in the user's Google Account, filters for emails from hiring platforms, extracts the company/role, and writes directly to their Firebase database.
* **Why it matters**: Zero server costs for the developer and complete data ownership for the student.

### 2. Edge-AI Resume Matching
* **How it works**: When a student uploads a resume and compares it to a job description, calculations occur locally.
* **Flow**: Using `@xenova/transformers`, the browser downloads a compact version of `all-MiniLM-L6-v2` (ONNX format). It compiles vector representations of both texts locally and calculates a Cosine Similarity score on the fly.
* **Why it matters**: Secure, instant, and private resume scanning without leaking PII (Personally Identifiable Information) to external LLM servers.

### 3. Starfield & Zero-G Aesthetic
* **How it works**: A beautiful, fluid dark-space UI designed with custom interactive canvas starfields and 3D floating animation triggers.
* **Why it matters**: A highly responsive visual environment that turns internship tracking from a chore into a premium, engaging experience.

---

## 📂 Project Directory Mapping

Here is the high-level layout of the codebase:

* **[backend/](file:///d:/githubcodes/Internship-Application-Tracker/backend)**: Python FastAPI server.
  * **[main.py](file:///d:/githubcodes/Internship-Application-Tracker/backend/main.py)**: Server routing configuration.
  * **[routes/interview.py](file:///d:/githubcodes/Internship-Application-Tracker/backend/routes/interview.py)**: Audio transcript analysis and mock session state routes.
* **[src/](file:///d:/githubcodes/Internship-Application-Tracker/src)**: React Vite frontend.
  * **[App.jsx](file:///d:/githubcodes/Internship-Application-Tracker/src/App.jsx)**: Authentication state, routing system, and layout scaffolding.
  * **[TrackerPage.jsx](file:///d:/githubcodes/Internship-Application-Tracker/src/TrackerPage.jsx)**: Interactive Kanban columns with the "Connect Gmail" setup modal.
  * **[ResumePage.jsx](file:///d:/githubcodes/Internship-Application-Tracker/src/ResumePage.jsx)**: Semantic resume matcher with fallback modes.
  * **[EdgeAnalyzer.jsx](file:///d:/githubcodes/Internship-Application-Tracker/src/EdgeAnalyzer.jsx)**: Standalone in-browser vector inference card.
  * **[OutreachPage.jsx](file:///d:/githubcodes/Internship-Application-Tracker/src/OutreachPage.jsx)**: Recruit email generator featuring a simulated typewriter display.
  * **[AIInterviewPage.jsx](file:///d:/githubcodes/Internship-Application-Tracker/src/AIInterviewPage.jsx)**: Vocal simulator frontend displaying progress gauges and evaluation dashboards.
  * **[AntiGravityKanban.css](file:///d:/githubcodes/Internship-Application-Tracker/src/AntiGravityKanban.css)**: Floating card physics and keyframe specifications.

---

## ⚡ Quick Start Instructions

Follow these steps to run the complete environment locally:

### 1. Run the Frontend (Vite + React)
```bash
# 1. Install node dependencies
npm install

# 2. Start the hot-reloading dev server
npm run dev
```
Open **`http://localhost:5173/`** to view the app. If no Firebase variables are provided in a root `.env`, the application automatically runs in **Sandbox Mock Mode**, letting you sign in with any email.

### 2. Run the Backend (FastAPI)
```bash
# 1. Enter the backend folder
cd backend

# 2. Install Python requirements
pip install -r requirements.txt

# 3. Spin up the uvicorn development server
python -m uvicorn main:app --port 8000 --reload
```
The mock interview API will listen on **`http://127.0.0.1:8000`**. Ensure you have a valid `GEMINI_API_KEY` defined in `backend/.env` for model evaluations.

---

## 💡 Technology Checklist

* **Frontend**: React 19, Vite, Vanilla CSS.
* **Database & Auth**: Firebase Firestore (Real-time listener `onSnapshot`), Firebase Auth.
* **Edge-AI**: Transformers.js (`all-MiniLM-L6-v2`), WebAssembly, ONNX Runtime.
* **Backend**: Python 3.10+, FastAPI, Google GenAI SDK.
