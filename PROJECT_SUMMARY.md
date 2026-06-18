# CareerFly - Project Summary & Tech Stack

Welcome to **CareerFly**, the ultimate AI-powered student internship tracker SaaS application. Designed to streamline the application lifecycle, recruiter outreach, resume optimization, and interview scheduling, CareerFly brings frontend, backend, and AI features together in a sleek, premium space-themed dashboard.

---

## 🚀 Tech Stack

CareerFly is engineered with a modern, high-performance web stack:

1. **Frontend Architecture**:
   * **React (v19)**: Declarative, component-based view rendering.
   * **Vite**: Ultra-fast bundle system with Hot-Module Replacement (HMR).
   * **Vanilla CSS / Zero-G Transitions**: Clean, responsive layout grid using CSS variables, custom glassmorphism effects (`backdrop-filter`), neon glowing colors, and 3D matrix hover animations (`AntiGravityKanban.css`) for floating cards.
   * **Lucide React**: Crisp vector icons served dynamically as React components.
2. **Backend & Services**:
   * **FastAPI Backend (Python)**: Handles mock interview session storage, parses user responses, tracks audio files, and evaluates transcripts using Google GenAI models.
   * **Firebase Core SDK (v12)**: Bootstrapping engine for cloud services.
   * **Firebase Authentication**: Support for secure Email/Password logins and native **Google Sign-In** auth popup overlays.
   * **Google Apps Script**: User-hosted sync trigger code that queries Gmail local context and pipes job details directly to Firestore.
3. **Edge Artificial Intelligence**:
   * **Transformers.js (`@xenova/transformers`)**: Client-side execution of sentence-transformer models (`Xenova/all-MiniLM-L6-v2`) via WebAssembly/ONNX Runtime Web to calculate cosine vector similarity.
4. **Environment Security**:
   * **Dotenv Configuration (`.env`)**: Encapsulates secret credentials (`VITE_FIREBASE_API_KEY`, etc.) away from public code.
   * **Git Ignores (`.gitignore`)**: Enforces safety by excluding credentials files from version control tracking.

---

## 🎨 Design & Aesthetic System

* **Deep Space Aesthetics**: Deep space background with gentle glowing nebulae radial gradients (`#03030d` base theme).
* **Interactive Particle Starfield**: An HTML5 Canvas rendering drifting cosmic stars. Stars respond to mouse proximity, deflecting dynamically based on velocity calculations.
* **Futuristic Glassmorphism**: Cards feature translucent panel backdrops (`rgba(13, 13, 35, 0.45)` with `backdrop-filter: blur(16px)`) bounded by thin, gradient neon glowing borders (cyan, soft purple, and electric blue).
* **Anti-Gravity Floating Animations**: Keyframe-driven floating physics to give dashboard cards a floating, weightless feel. Synced elements float onto the board with a custom 3D scale-and-lift entry transition.

---

## 🛠️ Core Dashboard Modules & Logic

The application features five hyper-detailed, highly interactive showcase modules:

### 1. Internship Kanban Tracker (Decentralized Apps Script Sync)
* **Logic**: Uses a state array (`applications`) partitioned into columns: `Applied`, `Interviewing`, and `Offer Received`.
* **Interactivity**: Drag-and-drop support (via standard HTML5 drag listeners mapped to React state) or button arrow controls to transition internship cards.
* **Decentralized Ingestion**: Connect Gmail modal provides users with pre-filled Google Apps Script code containing their active Firebase Project ID and User UID. The script runs on an hourly time-driven trigger in the user's personal Google context, scans for job confirmation emails, and posts updates directly to the Firestore REST API. A real-time `onSnapshot` listener on the frontend intercepts the database writes and updates the Kanban board instantly.
* **Automatic Metrics**: Re-calculates total applications, offer success rates, and overall tracker progress bars on the fly.

### 2. AI Recruiter Outreach (Cold Email & Intel Generator)
* **Logic**: Form inputs mapping recruiter name, target company, role, and tone settings (Professional, Warm, Concise).
* **Interactivity**: Simulated typing engine rendering email copy character-by-character with auto-scrolling viewports on generation. Supports multi-tab views for cold emails, follow-up sequences, and recruiter sourcing strategies.
* **Clipboard Actions**: One-click **"Copy"** button with temporary green validation tags.

### 3. AI Resume ATS Matcher & Local Edge-AI Analyzer
* **Logic**: Uses dual textareas comparing a student's resume against job requirements.
* **Analysis Modes**:
  1. *Local Lexical*: Fast regex-based keyword density comparison.
  2. *Edge-AI (Local)*: Loads a 90MB sentence transformer model (`all-MiniLM-L6-v2`) locally in the browser sandbox. It computes a 384-dimensional dense embedding vector and calculates semantic compatibility via cosine similarity math on the client GPU/CPU, ensuring complete privacy.
  3. *Gemini Cloud*: Query Gemini LLMs for advanced feedback.
* **Self-Healing Model Cache**: Bypasses local development server routing limits by enforcing `env.allowLocalModels = false`. If a corrupt cache is detected (such as Vite serving HTML instead of JSON for a missing file), the client automatically purges `caches.delete('transformers-cache')` and guides the user to retry.
* **Visual Ring Gauge**: Animates an SVG radial circular track using dashoffset offsets based on computed score tiers, printing colored evaluations ("Excellent Fit", "Strong Match", "Optimize Needed").

### 4. Interview Calendar & Daily Checklist
* **Logic**: Renders a dynamic monthly grid for **June 2026**. Dates with active interviews are flagged with glowing red/yellow notification badges.
* **Day-by-Day Agenda Selection**: Click dates to filter and render specific daily tasks (e.g. June 12/22 for Google/Meta/Stripe onsite rounds).
* **Interactive Checklist**: Click checkmarks to strike through finished items, updating task counters dynamically.
* **Quick Task Adder**: Type custom tasks and hit `+` or Enter to schedule new items for the selected calendar date.

### 5. AI Mock Interview Simulator
* **Logic**: Multi-stage mock interview interface powered by FastAPI and Gemini.
* **Interactivity**: Allows text or speech input (capturing audio via MediaRecorder and transcribing it securely using Gemini). Evaluates body length, calculates filler word ratios, and generates comprehensive performance reports detailing core strengths, improvements, and ideal model answers.

---

## 🔐 Authentication System

* **Dual-Authentication Core**:
  1. **Firebase Authentication Service**: If your `.env` contains correct credentials, the modal logs users in via standard Firebase Auth.
  2. **Sandbox Mock Mode**: If Firebase configs are unconfigured or local APIs are blocked, the app runs in Sandbox Mode. Clicking Email or Google Sign-In automatically logs in a sandbox profile (`sandbox-google-user@gmail.com`), allowing full sandbox testing.
* **Session Adaptation**: Authenticated states greet the user by name, reveal customized CTA shortcuts, display user profile tags in the header, and render working **"Logout"** buttons.

---

## 💻 Running the Project Locally

### Prerequisites
* Ensure you have **Node.js** (v18+) and **Python 3.10+** installed.

### Setup and Running Commands

1. **Install Frontend dependencies**:
   ```bash
   npm install
   ```

2. **Start the Frontend development server**:
   ```bash
   npm run dev
   ```
   Open your browser to: **`http://localhost:5173/`**

3. **Start the Backend FastAPI server**:
   Create a `.env` file inside the `backend` folder containing your `GEMINI_API_KEY`.
   Install backend requirements and run:
   ```bash
   cd backend
   pip install -r requirements.txt
   python -m uvicorn main:app --port 8000 --reload
   ```
   *The mock interview endpoints will be hosted at `http://127.0.0.1:8000`.*

4. **Build the production bundle**:
   ```bash
   npm run build
   ```
   *Compiled files will be saved in the `/dist` directory.*
