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
| `src/App.jsx` | Root component: auth, routing, ALL shared state | 🔴 CRITICAL |
| `src/index.css` | ALL styling (66KB). Design system + animations | 🔴 CRITICAL |
| `src/LandingPage.jsx` | Public landing page at route `/landing` | ✅ Safe to extend |
| `src/LoginPage.jsx` | Login/Register page at route `/login` | ✅ Safe to extend |
| `src/TrackerPage.jsx` | Manage Internship (Kanban board) at route `/` | ✅ Safe to extend |
| `src/OutreachPage.jsx` | AI Outreach email generator at route `/outreach` | ✅ Safe to extend |
| `src/ResumePage.jsx` | ATS Resume Analyzer at route `/resume` | ✅ Safe to extend |
| `src/CalendarPage.jsx` | Interview Schedule calendar at route `/calendar` | ✅ Safe to extend |
| `src/AIInterviewPage.jsx` | AI Mock Interview at route `/interview` | ✅ Safe to extend |
| `src/GmailSyncButton.jsx` | Gmail OAuth + inbox parser component | ⚠️ YES |
| `src/KanbanSkeletonCard.jsx` | Loading placeholder card for Kanban | ✅ Safe |
| `firestore.rules` | Firestore security rules | ⚠️ YES |
| `.env` | All environment variables | 🔴 CRITICAL |

---

## 🗺️ Route Structure — DO NOT CHANGE THESE PATHS

```
/landing    → LandingPage    (public, no auth required)
/login      → LoginPage      (public, handles login + register)
/           → TrackerPage    (protected, requires login)
/outreach   → OutreachPage   (protected)
/resume     → ResumePage     (protected)
/calendar   → CalendarPage   (protected)
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

### Data Path:
```
Firestore: users/{uid}/tracker/applications
Field: { apps: [...], updatedAt: Timestamp }
localStorage key: applications_{uid}
```

### Critical Rules:
- `firestoreWritePending` ref prevents echo update loops — **never remove it**
- `saveDebounceTimer` debounces writes by 1500ms — prevents Firestore quota abuse
- Mock users (`isMock: true`) **never** touch Firestore — localStorage only
- `onSnapshot` listener starts on login, unsubscribes on user change
- localStorage is always updated **immediately** as offline cache
- `cloudSyncStatus` state = `'idle' | 'saving' | 'saved' | 'error'` — shown in header badge

### What happens on first login (new user):
1. `onSnapshot` fires → document doesn't exist
2. Seeds Firestore with whatever is in `localStorage` or `DEFAULT_APPS`
3. Sets `firestoreWritePending = true` to suppress the echo

### What happens on logout:
- Applications state is **NOT touched** — data stays safe in localStorage
- Firestore listener unsubscribes automatically
- On next login, Firestore snapshot fires and repopulates state

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
  animateTrigger: bool  // optional: triggers glow animation
}
```

### Priority Values (tied to CSS tag classes via `getTagClass()`):
```
'High Priority'    → tag-high    (neon cyan)
'Medium'           → tag-medium  (grey)
'Technical Round'  → tag-tech    (purple)
'Behavioral Round' → tag-hr      (yellow)
'Active Offer'     → tag-success (green)
```

### Kanban Actions (all live in `App.jsx`, passed as props to `TrackerPage`):
```js
handleMoveItem(itemId, targetStatus)  // moves card between columns
handleAddApplication(e)               // adds card from modal form
handleDragStart(e, cardId)            // HTML5 drag
handleDragOver(e)                     // HTML5 drag
handleDrop(e, columnStatus)           // HTML5 drop
getTagClass(priority)                 // maps priority → CSS class
```

---

## 📧 Gmail Sync — How It Works

**File**: `src/GmailSyncButton.jsx`

### Props (never rename these):
```js
accessToken     // current gmailToken from App.jsx
userId          // currentUser.uid
setApplications // to update Kanban after sync
setGmailToken   // to update token if refreshed
currentUser     // to detect mock mode
syncing         // bool loading state
setSyncing      // setter
```

### Sync flow:
1. If `currentUser.isMock` → run sandbox simulation (fake card move)
2. If real token exists → call Gmail API directly
3. If token missing/expired → use **Google Identity Services** to request fresh `gmail.readonly` token
4. Searches 4 Gmail queries: Indeed, LinkedIn, Glassdoor, generic subject
5. Parses with 5 regex patterns to extract company names
6. Creates/updates cards in `applications` state

### Requires in `.env`:
```
VITE_GOOGLE_CLIENT_ID=267278392165-XXXX.apps.googleusercontent.com
```
(Get from Firebase Console → Auth → Google → Web client ID)

---

## 🎨 Design System — CSS in `index.css`

### CSS Variables (NEVER rename these — used everywhere):
```css
--neon-cyan: #00f0ff
--neon-purple: #9d4edd
--neon-success: #00ff87
--neon-gold: #ffaa00
--bg-deep: #050510
--bg-card: rgba(255,255,255,0.03)
--border-glow: rgba(0,240,255,0.15)
```

### Key CSS Classes (used across all pages — do NOT rename):
```
.btn .btn-primary .btn-secondary .btn-lg .btn-glow .btn-header .btn-action
.dashboard-card .card-border-glow .card-header .card-header-left .card-body
.bento-card .col-5 .col-7
.kanban-column .kanban-card .kanban-card-header
.tag-high .tag-medium .tag-tech .tag-hr .tag-success
.hero-section .hero-content .hero-heading .gradient-text
.mini-kanban-board .mini-kanban-column .mini-kanban-card
.mini-outreach .mini-outreach-tones .mini-tone-btn
.nav-link .nav-menu .main-header .header-container .header-actions
.progress-bar-container .progress-bar-fill
.modal-overlay .modal-box
.user-display-email
.nebula .nebula-cyan .nebula-purple .nebula-blue
#space-starfield (canvas element ID)
```

### Background Animation:
- `<canvas id="space-starfield">` renders an animated starfield with mouse repel
- `<div class="nebula nebula-*">` renders glowing background blobs
- These are in `App.jsx` `return()` and must always be the FIRST children of the root div

---

## 🧩 Component Props — What Each Page Receives

### TrackerPage receives from App.jsx:
```js
applications, appliedApps, interviewingApps, offerApps,
totalAppsCount, successRate, progressPercent,
gmailToken, currentUser, gmailSyncing,
setApplications, setGmailToken, setGmailSyncing,
setShowAddModal, showAddModal,
newCompany, setNewCompany,
newRole, setNewRole,
newPriority, setNewPriority,
newStatus, setNewStatus,
handleAddApplication, handleDragOver, handleDrop, handleDragStart,
handleMoveItem, getTagClass
```

### LandingPage receives from App.jsx:
```js
currentUser, handleLaunchSandbox,
envMode, setEnvMode, terminalLogs
```
> ⚠️ `MiniKanbanMockup` and `MiniOutreachMockup` are defined **inside LandingPage.jsx** — NOT passed as props

### LoginPage receives from App.jsx:
```js
currentUser, handleAuthSubmit, handleGoogleSignIn,
authEmail, setAuthEmail,
authPassword, setAuthPassword,
authError, setAuthError,
authLoading
```

---

## 🌐 Mini Mockup Components (in `LandingPage.jsx`)

`MiniKanbanMockup` — interactive preview of Kanban board
`MiniOutreachMockup` — interactive tone-switcher email preview

**These are defined at the top of `LandingPage.jsx`** (not in App.jsx, not passed as props).
- They use local `useState` only
- They have their own CSS classes: `.mini-kanban-board`, `.mini-outreach`, etc.
- Click handlers have `e.stopPropagation()` to prevent card click from bubbling

---

## 🤖 AI Interview Page (`AIInterviewPage.jsx`)

- Route: `/interview`
- Large file (~37KB), fully self-contained
- Has its own state for session management, question generation, scoring
- **Do NOT move any of its state to App.jsx**
- Has a "Back to Website" link — must navigate to `/landing` (not `/`)

---

## ⚙️ Environment Variables (`.env`)

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_GOOGLE_CLIENT_ID     ← needed for Gmail sync re-auth
```

> All variables must start with `VITE_` to be accessible in browser code.
> The app detects missing Firebase config and **auto-falls back to Sandbox Mode** — this is intentional.

---

## 🔁 Sandbox / Mock Mode

When Firebase is not configured OR user clicks "Launch Sandbox":
- `currentUser = { email: 'sandbox-google-user@gmail.com', uid: 'sandbox-google-user-123', isMock: true }`
- `gmailToken = 'sandbox-mock-token'`
- Gmail sync simulates a card move instead of hitting real API
- Firestore is **completely skipped** — localStorage only
- Header shows `[Sandbox]` badge in gold color
- **This mode must always work** even with no .env file

---

## 🧭 Navigation Logic

### `showDashboard` flag controls what renders at `/`:
```
showDashboard = true  → TrackerPage
showDashboard = false → LandingPage
```

### "Back to Website" button:
```js
onClick={() => setShowDashboard(false)}
// + Link to="/"
```
Sets `showDashboard=false` → renders LandingPage at same `/` URL.

### After logout: always `navigate('/')` which shows LandingPage (showDashboard=false).

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
- [ ] New pages receive props from `App.jsx`, not managing their own auth state
- [ ] Run `npm run build` — zero errors before finishing

---

## 📊 Feature Inventory (Current v2.0)

| # | Feature | Page | Status |
|---|---|---|---|
| 1 | Kanban Drag & Drop Board | TrackerPage | ✅ Live |
| 2 | Add Application Modal | TrackerPage | ✅ Live |
| 3 | Progress Bar & Success Rate | TrackerPage | ✅ Live |
| 4 | Gmail Sync (Indeed/LinkedIn/Glassdoor) | TrackerPage | ✅ Live |
| 5 | Firestore Cloud Sync (real-time) | App.jsx | ✅ Live |
| 6 | localStorage Cache (offline fallback) | App.jsx | ✅ Live |
| 7 | Cloud Sync Badge in Header | App.jsx header | ✅ Live |
| 8 | AI Cold Email Outreach Generator | OutreachPage | ✅ Live |
| 9 | Typewriter Email Animation | OutreachPage | ✅ Live |
| 10 | 3 Tone Templates (professional/warm/concise) | OutreachPage | ✅ Live |
| 11 | ATS Resume Keyword Matcher | ResumePage | ✅ Live |
| 12 | Score Animation (circular progress ring) | ResumePage | ✅ Live |
| 13 | Interview Calendar with Tasks | CalendarPage | ✅ Live |
| 14 | Quick Task Add (Enter key) | CalendarPage | ✅ Live |
| 15 | AI Mock Interview (full session) | AIInterviewPage | ✅ Live |
| 16 | Google Sign-In OAuth | LoginPage | ✅ Live |
| 17 | Email/Password Auth | LoginPage | ✅ Live |
| 18 | Sandbox Mock Mode (no Firebase) | App.jsx | ✅ Live |
| 19 | Smart Redirect After Login | LoginPage | ✅ Live |
| 20 | Landing Page Bento Grid | LandingPage | ✅ Live |
| 21 | Interactive Mini Kanban Demo | LandingPage | ✅ Live |
| 22 | Interactive Mini Outreach Demo | LandingPage | ✅ Live |
| 23 | Terminal Simulator on Landing | LandingPage | ✅ Live |
| 24 | Starfield Background Animation | App.jsx | ✅ Live |
| 25 | Mouse-Repel Star Particles | App.jsx | ✅ Live |
| 26 | Nebula Background Blobs | App.jsx | ✅ Live |
| 27 | Per-Account Data Isolation | App.jsx | ✅ Live |
| 28 | Session Restore on Refresh | App.jsx | ✅ Live |
| 29 | "Back to Website" Button | Header | ✅ Live |
| 30 | Logout Preserves Cloud Data | App.jsx | ✅ Live |
