# 🛡️ CareerFly — Codebase Protection & Feature Registry

> **PURPOSE**: This file is the source of truth for every feature in this project.
> When merging new UI or features, READ THIS FILE FIRST.
> Never delete, rename, or silently overwrite anything listed here.

---

## 📁 File Map — What Each File Does

| File | Role | Touch with caution? |
|---|---|---|
| `src/main.jsx` | App entry point. Wraps everything in `<BrowserRouter>` | ⚠️ YES |
| `src/firebase.js` | Firebase init, auth, Firestore db export | ⚠️ YES |
| `src/App.jsx` | Root component: auth, routing, real-time subcollection sync, shared state | 🔴 CRITICAL |
| `src/index.css` | ALL styling. Design system + animations | 🔴 CRITICAL |
| `src/AntiGravityKanban.css` | Anti-gravity 3D transitions and card-wrapper float animations | ⚠️ YES |
| `src/LandingPage.jsx` | Public landing page at route `/landing` | ✅ Safe to extend |
| `src/LoginPage.jsx` | Login/Register page at route `/login` | ✅ Safe to extend |
| `src/TrackerPage.jsx` | Manage Internship (Kanban board) at route `/` | ✅ Safe to extend |
| `src/OutreachPage.jsx` | AI Outreach email generator at route `/outreach` | ✅ Safe to extend |
| `src/ResumePage.jsx` | ATS Resume Analyzer (Local Lexical, Edge-AI, Gemini Cloud) at `/resume` | ✅ Safe to extend |
| `src/EdgeAnalyzer.jsx` | Standalone client-side semantic similarity analyzer component | ✅ Safe to extend |
| `src/CalendarPage.jsx` | Interview Schedule calendar component | ✅ Safe to extend |
| `src/AIInterviewPage.jsx` | AI Mock Interview at route `/interview` | ✅ Safe to extend |
| `src/GmailSyncButton.jsx` | Gmail OAuth + inbox parser component | ⚠️ YES |
| `src/KanbanSkeletonCard.jsx` | Loading placeholder card for Kanban | ✅ Safe |
| `firestore.rules` | Firestore security rules | ⚠️ YES |
| `backend/main.py` | FastAPI entry point, routes mount, and static build files server | ⚠️ YES |
| `backend/routes/interview.py` | FastAPI interview sessions controller router | ⚠️ YES |
| `backend/services/gemini_service.py` | API client integrations and mock seed models | ⚠️ YES |
| `backend/services/evaluation_service.py` | Mock interview performance compiler service | ⚠️ YES |
| `.env` | All environment variables | 🔴 CRITICAL |

---

## 🗺️ Route Structure — DO NOT CHANGE THESE PATHS

```
/landing    → LandingPage    (public, no auth required)
/login      → LoginPage      (public, handles login + register)
/           → TrackerPage    (protected, requires login)
/outreach   → OutreachPage   (protected)
/resume     → ResumePage     (protected)
/interview  → AIInterviewPage (protected)
```

### ⚠️ Critical Routing Rules
- The `/` route shows **TrackerPage** when `showDashboard === true`
- The `/` route shows **LandingPage** when `showDashboard === false`
- Login page reads a `?redirect=` query param and navigates there after login
- `LandingPage` clicking "Manage Internship" → `/` after login
- `LandingPage` clicking "AI Interview" → `/interview` after login
- **Never** change `/` to point directly to LandingPage — this will break the dashboard

---

## 🔐 Authentication System — DO NOT MODIFY THESE BEHAVIOURS

### States in `App.jsx` (NEVER delete or rename these):
```js
currentUser       // { email, uid, isMock } — null when logged out
showDashboard     // true = show app, false = show landing
isFirebaseMock    // true when Firebase is not configured
gmailToken        // OAuth token for Gmail API sync
gmailSyncing      // boolean for sync button loading state
```

### Auth Functions (NEVER delete or rename):
```js
handleAuthSubmit(e, tab)   // tab = 'login' | 'register'
handleGoogleSignIn()       // Google OAuth popup
handleLogout()             // Signs out + clears localStorage + navigates to /
handleLaunchSandbox()      // Sets isMock=true user for demo mode
```

### Auth Flow Rules:
1. `onAuthStateChanged` is the source of truth for real Firebase users
2. Mock/sandbox users have `isMock: true` — they skip Firestore
3. `currentUser` is persisted to `localStorage.currentUser` so sessions survive refresh
4. On logout: `localStorage.currentUser` is removed, `sessionStorage.gmailToken` is cleared
5. **NEVER** reset `applications` state when `currentUser` becomes null (causes data loss)

---

## ☁️ Firestore Cloud Sync — DO NOT MODIFY THIS LOGIC

### Data Paths:
```
Firestore User Apps Collection: users/{uid}/tracker/applications (Field: { apps: [...] })
Firestore Decentralized Sync Subcollection: users/{uid}/applications (Field: { company, title, stage })
localStorage key: applications_{uid}
```

### Critical Rules:
- `firestoreWritePending` ref prevents echo update loops — **never remove it**
- `saveDebounceTimer` debounces writes by 1500ms — prevents Firestore quota abuse
- Mock users (`isMock: true`) **never** touch Firestore — localStorage only
- `onSnapshot` listener starts on login, unsubscribes on user change
- localStorage is always updated **immediately** as offline cache
- `cloudSyncStatus` state = `'idle' | 'saving' | 'saved' | 'error'` — shown in header badge

---

## 📧 Gmail Ingestion (Decentralized Apps Script Sync)

**Modal File**: `src/TrackerPage.jsx` connect Gmail modal
**Sync Code**: Google Apps Script script triggered hourly

* Bypasses intermediate servers. User copies and hosts the Google Apps Script in their personal accounts.
* The script makes a direct POST request to the Firebase Firestore REST API:
  `https://firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents/users/{uid}/applications`
* Real-time listeners on the subcollection `users/{uid}/applications` in `App.jsx` capture the changes and update the Kanban board immediately.

---

## 🤖 Edge Artificial Intelligence Model Ingestion

**Files**: `src/ResumePage.jsx`, `src/EdgeAnalyzer.jsx`

* Uses **Transformers.js** to load `Xenova/all-MiniLM-L6-v2` (sentence-transformers) inside the browser memory sandbox.
* Performs mean pooling and normalization to output 384-dimensional dense vectors:
  $$\mathbf{v}_R, \mathbf{v}_J \in \mathbb{R}^{384}$$
* Computes cosine vector similarity locally on client CPU/GPU:
  $$\text{Similarity}(R, J) = \sum_{i=1}^{384} v_{R,i} \cdot v_{J,i}$$
* **Self-Healing Model Cache Protocol**:
  * Employs `env.allowLocalModels = false` to prevent local file requests being routed as SPA HTML fallbacks.
  * Checks for corrupt browser cached HTML files. If a `SyntaxError` occurs during pipeline initialization, the code automatically deletes the cached model entry (`caches.delete('transformers-cache')`) and prompts the user to re-run the analysis to download a clean copy from the Hugging Face Hub CDN.

---

## 📋 Kanban Tracker — Card Data Schema

Every application card must have these exact fields:

```js
{
  id: string,           // e.g. 'app-google', 'app-indeed-1234'
  company: string,      // e.g. 'Google'
  role: string,         // e.g. 'Software Eng Intern'
  priority: string,     // one of the values below
  status: string,       // 'applied' | 'interviewing' | 'offer'
  logoClass: string,    // optional: 'logo-google' etc (CSS class)
  logoLetter: string,   // single letter for avatar
  customBg: string,     // optional: gradient string
  appliedDate: string,  // optional: date applied YYYY-MM-DD
  responseDate: string, // optional: date responded YYYY-MM-DD
  followUp3Done: bool,  // optional: tracker for calendar checklist
  followUp7Done: bool,  // optional: tracker for calendar checklist
  animateTrigger: bool  // optional: triggers zero-gravity glow animation
}
```

---

## 🚫 MERGE RULES — What You Must NEVER Do

1. ❌ **Never remove `MiniKanbanMockup` or `MiniOutreachMockup`** from `LandingPage.jsx`
2. ❌ **Never pass `MiniKanbanMockup` or `MiniOutreachMockup` as props** — they crash (lowercase prop names can't be used as JSX)
3. ❌ **Never add a `useEffect` that resets `applications` when `currentUser === null`** — causes data loss on logout
4. ❌ **Never save to `localStorage.setItem('applications', ...)` with no user key** — bleeds between accounts
5. ❌ **Never change route `/` to always show LandingPage** — breaks the dashboard
6. ❌ **Never rename or remove `handleLogout`, `handleGoogleSignIn`, `handleAuthSubmit`** — LoginPage depends on them
7. ❌ **Never remove `firestoreWritePending` ref** — causes infinite Firestore read/write loop
8. ❌ **Never delete `terminalLogs` state or the terminal simulator `useEffect`** — LandingPage uses it
9. ❌ **Never remove the `<canvas id="space-starfield">` element** — background animation breaks
10. ❌ **Never delete the `?redirect=` query param logic in LoginPage** — smart redirect after login breaks
11. ❌ **Never remove `env.allowLocalModels = false;`** in `ResumePage.jsx` or `EdgeAnalyzer.jsx` — causes Vite dev server routing mismatch loops.
12. ❌ **Never remove the self-healing catch blocks** that perform `caches.delete('transformers-cache')` on `SyntaxError` — essential for automatic recovery from corrupt local model storage.

---

## ✅ Safe Merge Checklist

When adding a new feature or UI, verify:

- [ ] All existing routes still exist in `App.jsx` `<Routes>`
- [ ] `showDashboard` logic at route `/` is unchanged
- [ ] `currentUser`, `gmailToken`, `applications` state is still in `App.jsx` (not moved)
- [ ] `terminalLogs` is still passed to `<LandingPage>`
- [ ] `MiniKanbanMockup` and `MiniOutreachMockup` are still at top of `LandingPage.jsx`
- [ ] `firestoreWritePending` ref still exists in Firestore save effect
- [ ] `isFirebaseMock || !auth` check still wraps all real Firebase calls
- [ ] `currentUser?.isMock` check still present in Firestore effects
- [ ] New pages are imported in `App.jsx` and added to `<Routes>`
- [ ] Run `npm run lint` — must be 100% clean of errors and warnings
- [ ] Run `npm run build` — zero errors before finishing

---

## 📊 Feature Inventory (Current v2.0)

| # | Feature | Page / Component | Status |
|---|---|---|---|
| 1 | Kanban Drag & Drop Board | TrackerPage | ✅ Live |
| 2 | Add Application Modal | TrackerPage | ✅ Live |
| 3 | Progress Bar & Success Rate | TrackerPage | ✅ Live |
| 4 | Gmail Sync (OAuth Web Integration) | TrackerPage / GmailSyncButton | ✅ Live |
| 5 | Google Apps Script Decentralized Setup Modal | TrackerPage | ✅ Live |
| 6 | Firestore Cloud Sync (real-time tracker collection) | App.jsx | ✅ Live |
| 7 | Firestore Subcollection Listener (decentralized ingestion) | App.jsx | ✅ Live |
| 8 | localStorage Cache (offline fallback) | App.jsx | ✅ Live |
| 9 | Cloud Sync Status Badge | App.jsx header | ✅ Live |
| 10 | AI Cold Email Outreach Generator | OutreachPage | ✅ Live |
| 11 | Typewriter Email Animation | OutreachPage | ✅ Live |
| 12 | 3 Tone Templates (professional/warm/concise) | OutreachPage | ✅ Live |
| 13 | Recruiter Sourcing Brief & Search Intel Sourcing | OutreachPage | ✅ Live |
| 14 | ATS Resume Keyword Matcher (Regex comparison) | ResumePage | ✅ Live |
| 15 | Edge-AI Semantic Matcher (all-MiniLM-L6-v2 local model) | ResumePage / EdgeAnalyzer | ✅ Live |
| 16 | Self-Healing Browser Cache Handler (`transformers-cache`) | ResumePage / EdgeAnalyzer | ✅ Live |
| 17 | Score Animation (circular progress ring) | ResumePage | ✅ Live |
| 18 | Interactive Interview Checklist & Task Calendar | CalendarPage / TrackerPage | ✅ Live |
| 19 | Quick Task Add (Enter key) | CalendarPage / TrackerPage | ✅ Live |
| 20 | AI Mock Interview Simulator (FastAPI + voice synthesis) | AIInterviewPage | ✅ Live |
| 21 | Web Speech Recognition & Audio Webm Recording | AIInterviewPage | ✅ Live |
| 22 | Google Sign-In OAuth | LoginPage | ✅ Live |
| 23 | Email/Password Auth | LoginPage | ✅ Live |
| 24 | Sandbox Mock Mode (no Firebase) | App.jsx | ✅ Live |
| 25 | Smart Redirect After Login | LoginPage | ✅ Live |
| 26 | Landing Page Bento Grid | LandingPage | ✅ Live |
| 27 | Interactive Mini Kanban Demo | LandingPage | ✅ Live |
| 28 | Interactive Mini Outreach Demo | LandingPage | ✅ Live |
| 29 | Terminal Simulator on Landing | LandingPage | ✅ Live |
| 30 | Starfield Background Animation | App.jsx | ✅ Live |
| 31 | Mouse-Repel Star Particles | App.jsx | ✅ Live |
| 32 | Nebula Background Blobs | App.jsx | ✅ Live |
| 33 | Per-Account Data Isolation | App.jsx | ✅ Live |
| 34 | Session Restore on Refresh | App.jsx | ✅ Live |
| 35 | "Back to Website" Button | Header | ✅ Live |
| 36 | Logout Preserves Cloud Data | App.jsx | ✅ Live |
| 37 | Hardware-Accelerated Zero-G Transitions (3D matrices) | AntiGravityKanban.css | ✅ Live |
| 38 | Self-Healing Model Cache Purge | ResumePage / EdgeAnalyzer | ✅ Live |
| 39 | Dynamic UI Mode Selector Segment Bar | ResumePage | ✅ Live |
| 40 | FastAPI Backed Interview Evaluator (Full report critique) | AIInterviewPage | ✅ Live |
| 41 | Web Speech Recognition Filler Words Ratio calculation | backend / gemini_service | ✅ Live |
| 42 | Pre-filled Firebase UID and Project ID in code blocks | TrackerPage | ✅ Live |
