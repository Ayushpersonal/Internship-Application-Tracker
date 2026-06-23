# 🌌 CareerFly — End-to-End System Workflow

This document provides a comprehensive, step-by-step technical walkthrough of how data, AI models, and user interactions flow through the **CareerFly** ecosystem.

---

## 🗺️ Architectural Workflow Overview

```
                                  +---------------------------------------+
                                  |         1. AUTH & ENV SETUP           |
                                  |  - Sandbox Mode (Local Memory Store)  |
                                  |  - Firebase Production Authentication  |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |          2. LANDING PAGE              |
                                  |  - Interactive HTML5 Starfield Particle|
                                  |  - Terminal Log Logger simulation     |
                                  +-------------------+-------------------+
                                                      | (Enter Workspace)
                                                      v
  +---------------------------------------------------------------------------------------------------------------+
  |                                           3. WORKSPACE DASHBOARD                                              |
  +-----------------------+---------------------------+---------------------------+-------------------------------+
                          |                           |                           |
                          v                           v                           v
+-----------------------------------+  +-----------------------------+  +-----------------------------------+
|      A. INTERNSHIP TRACKER        |  |     B. ATS RESUME MATCHER   |  |   C. AI OUTREACH PIPELINE         |
|  - Real-time Firestore Kanban     |  |  - PDF text extraction      |  |  - Auto-fill from selected app    |
|  - Drag-and-drop column staging   |  |  - Local Regex Lexical match|  |  - Toggle Local vs Gemini Gen     |
|  - Gmail Sync script ingestion    |  |  - Wasm Edge-AI Embeddings  |  |  - Generate Sourcing Intel,       |
|  - Interactive Calendar tasks     |  |  - Gemini Cloud Deep-Scan   |  |    Cold Emails, & Follow-Ups      |
+-----------------------------------+  +--------------+--------------+  +-----------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |     D. AI MOCK INTERVIEW SIMULATOR    |
                                  |  - Formulates prompt from application |
                                  |  - FastAPI coordinates audio stream   |
                                  |  - TTS Speech & Voice Recognition     |
                                  |  - Gemini grading / ideal response    |
                                  +---------------------------------------+
```

---

## 🛠️ Step-by-Step Subsystem Workflows

### 1. Authentication & Session Bootstrapping
When a user visits CareerFly, the system initializes its database and session state:
1. **Firebase Check**: The frontend attempts to connect to the Firebase project configured in `.env`.
2. **Failover Protocol**: If the connection fails or keys are missing, the system gracefully falls back to **Sandbox Mode**, which simulates database reads/writes in local browser memory.
3. **User Action**: The user logs in via Firebase Email/Password, Google OAuth, or launches the **Sandbox Sandbox** directly.
4. **Dashboard Toggle**: Upon authentication, `showDashboard` changes to `true` and mounts the core layout.

---

### 2. Decentralized Gmail Sync Workflow
Rather than utilizing expensive servers to read users' emails, CareerFly implements a zero-cost, decentralized ingestion loop:

```
[Indeed / Recruiter Email] 
       │
       v (Inbox Delivery)
┌─────────────────────────────────────────────────────────────┐
│ 1. User's Personal Gmail Account                            │
│    - Automated Hourly Trigger runs google apps script       │
│    - Search query: "from:no-reply@indeed.com is:unread"     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼ (Extracts Company, Role, & Stage)
┌─────────────────────────────────────────────────────────────┐
│ 2. Personal Google Apps Script Context                      │
│    - Formulates JSON payload containing application details │
│    - Performs authorized REST POST directly to Firestore    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼ (Streaming Database Update)
┌─────────────────────────────────────────────────────────────┐
│ 3. Firestore DB Applications Collection                      │
│    - Real-time listener (`onSnapshot`) in App.jsx fires     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼ (State update + Visual effect)
┌─────────────────────────────────────────────────────────────┐
│ 4. CareerFly React Workspace                                │
│    - New Kanban card renders dynamically                    │
│    - Zero-G animation causes the card to float and fade in  │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. Edge-AI Resume Matcher Workflow
Calculates ATS compatibility without sending private files to external servers (when using Edge-AI):
1. **File Upload**: The user drops a PDF resume into the dropzone. A local `FileReader` extracts readable ASCII characters directly in the browser.
2. **Engine Selection**: The user selects one of three parsing engines:
   * **Local Lexical**: Basic regex keyword density scanning.
   * **Edge-AI (Local)**: Loads `Xenova/all-MiniLM-L6-v2` tokenizer and model via ONNX Runtime Web inside the browser.
   * **Gemini Cloud**: Sends text to the Gemini API via secure keys.
3. **Embedding Computation (Edge-AI Mode)**:
   * Tokenizes and computes dense 384-dimensional vector representation of the **Resume**.
   * Tokenizes and computes dense 384-dimensional vector representation of the **Job Description**.
   * Computes the Cosine Similarity (dot product) between vectors to determine the semantic compatibility score.
4. **UI Update**: Animates the SVG progress ring and generates bullet upgrade suggestions.

---

### 4. Sourcing & AI Outreach Workflow
Generates outreach communications using either templates or LLMs:
1. **App Selection**: The user clicks an active card in the **Target Selector Carousel** at the top of the Cold Outreach page.
2. **Form Auto-Fill**: Application details (Company Name, Role Name, Priority) are automatically extracted to fill the form.
3. **Tone Selection**: The user sets the output tone (e.g., *Warm*, *Concise*, *Bold*).
4. **Generation Trigger**:
   * **With Gemini Active**: Formulates an optimization prompt and queries the Gemini API for a custom formatted JSON payload.
   * **With Gemini Muted (Fallback)**: Executes a deterministic template engine mapping variables to pre-configured outreach structures.
5. **Typewriter Delivery**: Simulates a character-by-character typewriter typing effect inside the output pane.
6. **Tabs Rendered**:
   * **Cold Outreach**: Fully draftable recruiter email.
   * **Follow-Up Sequences**: Day-3 and Day-7 check-in sequences.
   * **Recruiter Intelligence**: Sourcing intel specifying domain email patterns (e.g. `{first}.{last}@stripe.com`) and target recruiter search arguments.

---

### 5. AI Mock Interview Simulator Workflow
Simulates a real-time conversational technical or behavioral screen using speech APIs and local Python backend assistance:

```
┌─────────────────┐       Initialize (Role/Company)      ┌────────────────┐
│                 ├─────────────────────────────────────>│                │
│                 │                                      │                │
│                 │      Generate Question (Gemini)      │                │
│                 │<─────────────────────────────────────┤  FastAPI Host  │
│                 │                                      │  (main.py)     │
│                 │       Analyze & Critique Audio       │                │
│                 │<─────────────────────────────────────┤                │
│   React App     │                                      └────────────────┘
│   (Frontend)    │
│                 │       Speak Question (SpeechSynthesis)
│                 │──┐
│                 │  │
│                 │  v
│                 │ Receive Answer (WebSpeech & MediaRecorder)
│                 │──┐
│                 │  │
│                 │  v
│                 │ Submit Audio + Answer text
└─────────────────┘
```

1. **Session Spawn**: The user inputs their target role, target company, and current skills. The frontend triggers a `POST` request to the backend `/api/interview/start` endpoint, spawning a unique session ID.
2. **FastAPI Coordination**: The FastAPI server creates an interview state container, prompts Gemini to formulate the initial interview question based on user profile parameters, and returns it.
3. **Text-To-Speech Output**: The browser's native `SpeechSynthesis` API receives the text question, cancels any existing queue, and vocalizes the question.
4. **Response Capture**:
   * The user clicks the microphone button.
   * Native `webkitSpeechRecognition` starts transcription, filling the text box in real-time.
   * Simultaneously, `MediaRecorder` captures raw audio packets into a `Blob`.
5. **Critique Computation**:
   * The text response and base64-encoded audio are sent to `/api/interview/submit`.
   * When all 3 questions are completed, a request is made to `/api/interview/evaluate`.
   * Gemini evaluates the responses, grading structural strengths, identifying gaps, and generating suggested ideal responses.
6. **Detailed Critique Page**: Transition to the report panel displaying an animated progress gauge, aggregate stats, and collapsible question critique cards.
