# CareerFly - Project Summary & Tech Stack

Welcome to **CareerFly**, the ultimate AI-powered student internship tracker SaaS application. Designed to streamline the application lifecycle, recruiter outreach, resume optimization, and interview scheduling, CareerFly brings frontend, backend, and AI features together in a sleek, premium space-themed dashboard.

---

## 🚀 Tech Stack

CareerFly is engineered with a modern, high-performance web stack:

1. **Frontend Architecture**:
   * **React (v19)**: Declarative, component-based view rendering.
   * **Vite**: Ultra-fast bundle system with Hot-Module Replacement (HMR).
   * **Vanilla CSS**: Clean, responsive layout grid using CSS variables, custom glassmorphism effects (`backdrop-filter`), neon glowing colors, and float keyframes.
   * **Lucide React**: Crisp vector icons served dynamically as React components.
2. **Backend & Services**:
   * **Firebase Core SDK (v12)**: Bootstrapping engine for cloud services.
   * **Firebase Authentication**: Support for secure Email/Password logins and native **Google Sign-In** auth popup overlays.
3. **Environment Security**:
   * **Dotenv Configuration (`.env`)**: Encapsulates secret credentials (`VITE_FIREBASE_API_KEY`, etc.) away from public code.
   * **Git Ignores (`.gitignore`)**: Enforces safety by excluding credentials files from version control tracking.

---

## 🎨 Design & Aesthetic System

* **Deep Space Aesthetics**: Deep space background with gentle glowing nebulae radial gradients (`#03030d` base theme).
* **Interactive Particle Starfield**: An HTML5 Canvas rendering drifting cosmic stars. Stars respond to mouse proximity, deflecting dynamically based on velocity calculations.
* **Futuristic Glassmorphism**: Cards feature translucent panel backdrops (`rgba(13, 13, 35, 0.45)` with `backdrop-filter: blur(16px)`) bounded by thin, gradient neon glowing borders (cyan, soft purple, and electric blue).
* **Anti-Gravity Floating Animations**: Keyframe-driven floating physics to give dashboard cards a floating, weightless feel.

---

## 🛠️ Core Dashboard Modules & Logic

The application features four hyper-detailed, highly interactive showcase cards:

### 1. Internship Kanban Tracker
* **Logic**: Uses a state array (`applications`) partitioned into columns: `Applied`, `Interviewing`, and `Offer Received`.
* **Interactivity**: Drag-and-drop support (via standard HTML5 drag listeners mapped to React state) or button arrow controls to transition internship cards.
* **New Application Drawer**: Click **"Add App"** to show a glass modal form. Adding a company name creates a card with custom priorities, random gradient icon badges, and status targets.
* **Automatic Metrics**: Re-calculates total applications, offer success rates, and overall tracker progress bars on the fly.

### 2. AI Recruiter Outreach (Cold Email Generator)
* **Logic**: Form inputs mapping recruiter name, target company, role, and tone settings (Professional, Warm, Concise).
* **Interactivity**: Simulated typing engine rendering email copy character-by-character with auto-scrolling viewports on generation.
* **Clipboard Actions**: One-click **"Copy"** button with temporary green validation tags.

### 3. AI Resume ATS Matcher
* **Logic**: Uses dual textareas comparison mapping a student's resume against job requirements.
* **Interactivity**: Toggling **"Re-Analyze Match"** parses content for key competencies (e.g. *React, Node, APIs, CSS, Git*) to compute a match percentage.
* **Visual Ring Gauge**: Animates an SVG radial circular track using dashoffset offsets based on computed score tiers, printing colored evaluations ("Excellent Fit", "Strong Match", "Optimize Needed").

### 4. Interview Calendar & Daily Checklist
* **Logic**: Renders a dynamic monthly grid for **June 2026**. Dates with active interviews are flagged with glowing red/yellow notification badges.
* **Day-by-Day Agenda Selection**: Click dates to filter and render specific daily tasks (e.g. June 12/22 for Google/Meta/Stripe onsite rounds).
* **Interactive Checklist**: Click checkmarks to strike through finished items, updating task counters dynamically.
* **Quick Task Adder**: Type custom tasks and hit `+` or Enter to schedule new items for the selected calendar date.

---

## 🔐 Authentication System

* **Dual-Authentication Core**:
  1. **Firebase Authentication Service**: If your `.env` contains correct credentials, the modal logs users in via standard Firebase Auth.
  2. **Sandbox Mock Mode**: If Firebase configs are unconfigured or local APIs are blocked, the app runs in Sandbox Mode. Clicking Email or Google Sign-In automatically logs in a sandbox profile (`sandbox-google-user@gmail.com`), allowing full sandbox testing.
* **Session Adaptation**: Authenticated states greet the user by name, reveal customized CTA shortcuts, display user profile tags in the header, and render working **"Logout"** buttons.

---

## 💻 Running the Project Locally

### Prerequisites
* Ensure you have **Node.js** (v18+) installed.

### Setup and Running Commands

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Add credentials**:
   Create a `.env` file in the root folder with your Firebase parameters:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser to: **`http://localhost:5173/`**

4. **Build the production bundle**:
   ```bash
   npm run build
   ```
   *Compiled files will be saved in the `/dist` directory.*
