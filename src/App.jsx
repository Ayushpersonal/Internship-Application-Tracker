import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Kanban, 
  Plus, 
  Mail, 
  Sparkles, 
  Copy, 
  Check, 
  FileCheck2, 
  FileText, 
  Briefcase, 
  RefreshCw, 
  Calendar as CalendarIcon, 
  Clock, 
  Loader2, 
  Info,
  LogIn,
  LogOut,
  AlertCircle,
  Layers,
  ShieldCheck,
  Orbit,
  MousePointer,
  ArrowUpCircle,
  ExternalLink
} from 'lucide-react';
import { auth, db, googleProvider } from './firebase';
import { doc, updateDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';

// ==========================================
// BENTO FEATURES GRID MINIATURE MOCKUPS
// ==========================================

function MiniKanbanMockup() {
  const [column, setColumn] = useState('applied');

  const handleNext = (e) => {
    e.stopPropagation();
    if (column === 'applied') setColumn('interviewing');
    else if (column === 'interviewing') setColumn('offer');
    else setColumn('applied');
  };

  return (
    <div className="mini-kanban-board">
      <div className="mini-kanban-column">
        <h4>Applied</h4>
        {column === 'applied' && (
          <div className="mini-kanban-card">
            <div className="mini-card-header">
              <span className="mini-card-company">Google</span>
              <button className="mini-card-btn" onClick={handleNext} title="Move to Interviewing">
                <ArrowRight size={10} />
              </button>
            </div>
            <span className="mini-card-role">Software Eng Intern</span>
            <span className="mini-card-tag tag-high" style={{ fontSize: '8px', padding: '2px 6px' }}>High</span>
          </div>
        )}
        <div className="mini-kanban-card">
          <div className="mini-card-header">
            <span className="mini-card-company">Stripe</span>
          </div>
          <span className="mini-card-role">Backend Engineer</span>
          <span className="mini-card-tag tag-medium" style={{ fontSize: '8px', padding: '2px 6px' }}>Medium</span>
        </div>
      </div>

      <div className="mini-kanban-column">
        <h4>Interviewing</h4>
        {column === 'interviewing' && (
          <div className="mini-kanban-card">
            <div className="mini-card-header">
              <span className="mini-card-company">Google</span>
              <button className="mini-card-btn" onClick={handleNext} title="Move to Offer Received">
                <ArrowRight size={10} />
              </button>
            </div>
            <span className="mini-card-role">Software Eng Intern</span>
            <span className="mini-card-tag tag-high" style={{ fontSize: '8px', padding: '2px 6px' }}>High</span>
          </div>
        )}
        <div className="mini-kanban-card">
          <div className="mini-card-header">
            <span className="mini-card-company">Meta</span>
          </div>
          <span className="mini-card-role">Product Manager Intern</span>
          <span className="mini-card-tag tag-tech" style={{ fontSize: '8px', padding: '2px 6px' }}>Tech</span>
        </div>
      </div>

      <div className="mini-kanban-column">
        <h4>Offer</h4>
        {column === 'offer' && (
          <div className="mini-kanban-card offer-border-pulse" style={{ borderColor: 'var(--neon-success)' }}>
            <div className="mini-card-header">
              <span className="mini-card-company" style={{ color: 'var(--neon-success)' }}>Google</span>
              <button className="mini-card-btn" onClick={handleNext} title="Reset to Applied" style={{ color: 'var(--neon-success)' }}>
                <RefreshCw size={10} />
              </button>
            </div>
            <span className="mini-card-role">Software Eng Intern</span>
            <span className="mini-card-tag tag-success" style={{ fontSize: '8px', padding: '2px 6px' }}>Active Offer</span>
          </div>
        )}
        <div className="mini-kanban-card">
          <div className="mini-card-header">
            <span className="mini-card-company">Vercel</span>
          </div>
          <span className="mini-card-role">Next.js Dev Intern</span>
          <span className="mini-card-tag tag-success" style={{ fontSize: '8px', padding: '2px 6px' }}>Active Offer</span>
        </div>
      </div>
    </div>
  );
}

function MiniOutreachMockup() {
  const [tone, setTone] = useState('professional');
  const [displayText, setDisplayText] = useState('');
  const typingTimer = useRef(null);

  const emails = {
    professional: "Subject: Software Engineer Intern Application\n\nDear Hiring Team,\n\nI am a computer science student writing to express my interest in the Software Engineer Intern position. My stack includes React 19, vanilla CSS layouts, and Firebase. I would welcome the opportunity to discuss my qualifications.\n\nBest regards,\nSavit",
    warm: "Subject: Inspired by your engineering culture!\n\nHi Sarah,\n\nI'm reaching out because I follow your engineering developments and am incredibly inspired by your dev-first platforms. As a student specializing in smooth glassmorphic React systems, my dream is to learn and contribute as an intern on your team. Let's chat!\n\nWarmly,\nSavit",
    concise: "Subject: Software Eng Intern Query - Savit\n\nHello,\n\nI specialize in clean React architectures, responsive layouts, and robust Node backends.\n- Built 4+ complex web applications\n- Proficient in vanilla CSS & design systems\n\nMy portfolio is attached. Do you have 5 minutes this week for a brief call?\n\nBest,\nSavit"
  };

  useEffect(() => {
    if (typingTimer.current) clearInterval(typingTimer.current);

    const textToType = emails[tone];
    setDisplayText('');
    let index = 0;
    
    typingTimer.current = setInterval(() => {
      if (index < textToType.length) {
        setDisplayText(prev => prev + textToType.charAt(index));
        index++;
      } else {
        clearInterval(typingTimer.current);
      }
    }, 10);

    return () => {
      if (typingTimer.current) clearInterval(typingTimer.current);
    };
  }, [tone]);

  return (
    <div className="mini-outreach">
      <div className="mini-outreach-tones">
        <button 
          className={`mini-tone-btn ${tone === 'professional' ? 'active' : ''}`}
          onClick={() => setTone('professional')}
        >
          Professional
        </button>
        <button 
          className={`mini-tone-btn ${tone === 'warm' ? 'active' : ''}`}
          onClick={() => setTone('warm')}
        >
          Warm
        </button>
        <button 
          className={`mini-tone-btn ${tone === 'concise' ? 'active' : ''}`}
          onClick={() => setTone('concise')}
        >
          Concise
        </button>
      </div>
      <div className="mini-outreach-preview">
        {displayText}
        <span className="terminal-caret" style={{ width: '4px', height: '10px' }}></span>
      </div>
    </div>
  );
}

function MiniAtsMatcherMockup() {
  const [score, setScore] = useState(85);
  const [animScore, setAnimScore] = useState(85);
  const [running, setRunning] = useState(false);

  const maxOffset = 251.2;
  const offset = maxOffset - (animScore / 100) * maxOffset;

  const triggerMatch = () => {
    if (running) return;
    setRunning(true);
    setAnimScore(0);
    
    let current = 0;
    const interval = setInterval(() => {
      if (current < score) {
        current += 5;
        if (current > score) current = score;
        setAnimScore(current);
      } else {
        clearInterval(interval);
        setRunning(false);
      }
    }, 40);
  };

  return (
    <div className="mini-ats-matcher">
      <div className="mini-ats-left">
        <div className="radial-gauge-wrapper" style={{ width: '80px', height: '80px', margin: 0 }}>
          <svg viewBox="0 0 100 100" className="radial-svg">
            <circle cx="50" cy="50" r="40" className="radial-bg-track"></circle>
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              className="radial-fill-track"
              style={{ strokeDashoffset: offset }}
              stroke="url(#radial-gradient-score-mini)"
              strokeWidth="8"
            ></circle>
            <defs>
              <linearGradient id="radial-gradient-score-mini" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" />
                <stop offset="100%" stopColor="#9d4edd" />
              </linearGradient>
            </defs>
          </svg>
          <div className="radial-score-content" style={{ top: '53%' }}>
            <span className="score-number" style={{ fontSize: '16px' }}>{animScore}%</span>
            <span className="score-label" style={{ fontSize: '7px' }}>Match</span>
          </div>
        </div>
      </div>
      <div className="mini-ats-right">
        <button className="mini-ats-btn" onClick={triggerMatch} disabled={running}>
          {running ? "Analyzing..." : "Run ATS Scan"}
        </button>
        <div className="mini-ats-tag visible" style={{
          color: 'var(--neon-cyan)',
          borderColor: 'rgba(0, 240, 255, 0.3)',
          background: 'rgba(0, 240, 255, 0.08)'
        }}>
          Excellent Fit
        </div>
      </div>
    </div>
  );
}

function MiniCalendarMockup() {
  const [selectedDay, setSelectedDay] = useState(2);

  const events = {
    2: { title: "Google Online Assessment", time: "10:00 AM" },
    12: { title: "Meta Tech Phone Screen", time: "11:00 AM" },
    22: { title: "Stripe Onsite Presentation", time: "9:00 AM" }
  };

  const days = [];
  days.push({ day: 31, isPrev: true });
  for (let i = 1; i <= 30; i++) {
    days.push({ day: i, isPrev: false });
  }

  const selectedEvent = events[selectedDay];

  return (
    <div className="mini-calendar-wrapper">
      <div className="mini-calendar-grid">
        {days.slice(0, 21).map((d, i) => {
          const hasEvent = events[d.day] && !d.isPrev;
          const isSelected = selectedDay === d.day && !d.isPrev;
          
          let classes = "mini-calendar-day";
          if (d.isPrev) classes += " prev";
          if (isSelected) classes += " selected";
          if (hasEvent) {
            classes += " event";
            classes += (d.day === 2 || d.day === 12) ? " event-red" : " event-yellow";
          }

          return (
            <div 
              key={i} 
              className={classes}
              onClick={() => {
                if (!d.isPrev) setSelectedDay(d.day);
              }}
            >
              {d.day}
            </div>
          );
        })}
      </div>
      <div className="mini-calendar-agenda">
        <div className="mini-agenda-title">Agenda (June {selectedDay})</div>
        {selectedEvent ? (
          <div className="mini-agenda-item">
            <span className="mini-task-name">{selectedEvent.title}</span>
            <span className="mini-task-time">🕒 {selectedEvent.time}</span>
          </div>
        ) : (
          <div className="mini-agenda-item" style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', fontSize: '9px' }}>
            No scheduled events.
          </div>
        )}
      </div>
    </div>
  );
}

const loadGapi = () => {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      resolve(window.gapi);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => resolve(window.gapi);
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

function KanbanSkeletonCard() {
  return (
    <div className="kanban-item skeleton-card">
      <div className="item-meta">
        <div className="company-logo skeleton-logo"></div>
        <div className="item-details">
          <div className="skeleton-line skeleton-role"></div>
          <div className="skeleton-line skeleton-company"></div>
        </div>
      </div>
      <div className="item-footer">
        <div className="skeleton-line skeleton-tag"></div>
        <div className="skeleton-arrow"></div>
      </div>
    </div>
  );
}

function GmailSyncButton({ accessToken, userId, setApplications, setGmailToken, currentUser, syncing, setSyncing }) {

  const syncIndeedApplications = async () => {
    let token = accessToken;

    // If sandbox mock user, run the simulated sync
    if (currentUser?.isMock || token === 'sandbox-mock-token') {
      setSyncing(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setApplications(prev => {
          const applied = prev.filter(app => app.status === 'applied');
          if (applied.length > 0) {
            const targetApp = applied[Math.floor(Math.random() * applied.length)];
            
            // Turn off the trigger a second later so it resets clean for future changes
            setTimeout(() => {
              setApplications(current => current.map(app => {
                if (app.id === targetApp.id) {
                  return { ...app, animateTrigger: false };
                }
                return app;
              }));
            }, 1000);

            return prev.map(app => {
              if (app.id === targetApp.id) {
                return { ...app, status: 'interviewing', priority: 'Technical Round', animateTrigger: true };
              }
              return app;
            });
          }
          return prev;
        });

        alert("Gmail Sandbox Sync Complete: Simulated Indeed notification resolved! Promoted Stripe to 'Interviewing' with Zero-G launch.");
      } finally {
        setSyncing(false);
      }
      return;
    }

    // If no token and not a mock user, we trigger the Google Sign-in popup with Gmail scope in real-time
    if (!token) {
      try {
        if (!auth) {
          throw new Error("Firebase Auth is not initialized or configured.");
        }
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        token = credential?.accessToken;
        if (token) {
          setGmailToken(token);
          sessionStorage.setItem('gmailToken', token);
          console.log("Captured Google access token in real-time:", token);
        } else {
          alert("Access token was not granted by Google Auth.");
          return;
        }
      } catch (err) {
        console.error("Google Auth error during sync trigger:", err);
        alert("Google Login is required to authenticate Gmail. Error: " + err.message);
        return;
      }
    }

    setSyncing(true);
    try {
      // Load Google API Client Library dynamically to bypass browser CORS preflight blocks
      const gapi = await loadGapi();
      await new Promise((resolve) => gapi.load('client', resolve));
      gapi.client.setToken({ access_token: token });

      // 1. Ask Google's REST API for indeed emails (regardless of read or unread) using secure Google iframe client request
      console.log("[Indeed Sync Debug] Querying last 50 Indeed emails (regardless of read/unread status)...");
      const listResponse = await gapi.client.request({
        path: 'https://gmail.googleapis.com/gmail/v1/users/me/messages',
        params: { q: 'from:no-reply@indeed.com', maxResults: 50 }
      });
      
      const listData = listResponse.result;
      
      if (!listData.messages || listData.messages.length === 0) {
        alert("No Indeed application notifications found in your inbox!");
        setSyncing(false);
        return;
      }

      let syncCount = 0;
      // 2. Loop through the matching email IDs found
      for (const msgInfo of listData.messages) {
        const detailResponse = await gapi.client.request({
          path: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgInfo.id}`
        });
        const emailDetails = detailResponse.result;
        
        // Extract Subject and Body snippet
        const subjectHeader = emailDetails.payload.headers.find(h => h.name === "Subject");
        const subject = subjectHeader ? subjectHeader.value : "";
        const snippet = emailDetails.snippet || "";
        const completeText = (subject + " " + snippet).toLowerCase();

        // 3. Robust Regex parser running safely on the client side
        let companyName = null;
        
        // Rule 1: "Your application to [Company] was/has/is..."
        const rule1 = subject.match(/Your application to\s+([a-zA-Z0-9\s&'.,\-]+?)(?:\s+(?:was|has|is|confirmed|received|sent|viewed)\b|$)/i);
        if (rule1) {
          companyName = rule1[1].trim();
          console.log(`[Indeed Sync Debug] Rule 1 matched: "${companyName}"`);
        }
        
        // Rule 2: "at [Company]" in Subject
        if (!companyName) {
          const rule2 = subject.match(/\bat\s+([a-zA-Z0-9\s&'.,\-]+?)(?:\s*[\-\–\|]|\s+(?:was|has|is|confirmed|received|sent|viewed|in|on)\b|$)/i);
          if (rule2) {
            companyName = rule2[1].trim();
            console.log(`[Indeed Sync Debug] Rule 2 matched: "${companyName}"`);
          }
        }
        
        // Rule 3: "Update from [Company]" or "Message from [Company]"
        if (!companyName) {
          const rule3 = subject.match(/(?:Update|Message|Invitation)\s+from\s+([a-zA-Z0-9\s&'.,\-]+?)(?:\s+(?:about|for|regarding|is|has|was)\b|$)/i);
          if (rule3) {
            companyName = rule3[1].trim();
            console.log(`[Indeed Sync Debug] Rule 3 matched: "${companyName}"`);
          }
        }
        
        // Rule 4: "Indeed Application: [Company] - [Role]"
        if (!companyName) {
          const rule4 = subject.match(/Indeed Application:\s*([a-zA-Z0-9\s&'.,\-]+?)\s*[\-\–\|]/i);
          if (rule4) {
            companyName = rule4[1].trim();
            console.log(`[Indeed Sync Debug] Rule 4 matched: "${companyName}"`);
          }
        }

        // Rule 5: "Indeed Application: [Company]"
        if (!companyName) {
          const rule5 = subject.match(/Indeed Application:\s*([a-zA-Z0-9\s&'.,\-]+)$/i);
          if (rule5) {
            companyName = rule5[1].trim();
            console.log(`[Indeed Sync Debug] Rule 5 matched: "${companyName}"`);
          }
        }

        // Rule 6: Check snippet for "Company: [Company]" or "Employer: [Company]" or "at [Company]"
        if (!companyName) {
          const rule6 = snippet.match(/(?:Company|Employer|at):\s*([a-zA-Z0-9\s&'.,\-]+?)(?:\r|\n|-|–|\||$)/i);
          if (rule6) {
            companyName = rule6[1].trim();
            console.log(`[Indeed Sync Debug] Rule 6 matched: "${companyName}"`);
          }
        }

        // Rule 7: Fallback to old regex on completeText
        if (!companyName) {
          const fallbackMatch = completeText.match(/(?:company|at):\s*([a-zA-Z0-9\s&'.,\-]+)/i);
          if (fallbackMatch) {
            companyName = fallbackMatch[1].trim();
            console.log(`[Indeed Sync Debug] Rule 7 (Fallback) matched: "${companyName}"`);
          }
        }

        // Rule 8: "Stand out by sending a quick message to [Company]" or similar "message to [Company]"
        if (!companyName) {
          const rule8 = subject.match(/(?:sending a quick message|message|send message)\s+to\s+([a-zA-Z0-9\s&'.,\-]+?)(?:\s+(?:about|on|for|regarding|is|has|was)\b|$)/i);
          if (rule8) {
            companyName = rule8[1].trim();
            console.log(`[Indeed Sync Debug] Rule 8 (message to [Company]) matched: "${companyName}"`);
          }
        }

        // Rule 9: "[Company] has messaged you" or "[Company] sent you a message"
        if (!companyName) {
          const rule9 = subject.match(/([a-zA-Z0-9\s&'.,\-]+?)\s+(?:has messaged you|sent you a message)/i);
          if (rule9) {
            companyName = rule9[1].trim();
            console.log(`[Indeed Sync Debug] Rule 9 matched: "${companyName}"`);
          }
        }

        // Rule 10: Filter out platform names
        if (companyName) {
          const lowerName = companyName.toLowerCase();
          if (lowerName === "indeed" || lowerName === "indeed job search" || lowerName === "indeed jobs") {
            companyName = null;
          }
        }

        if (companyName) {
          // If the company name got captured with HTML or extra junk, clean it up or restrict it
          if (companyName.length > 50) {
            companyName = companyName.substring(0, 50).trim();
          }

          // Determine the target Kanban stage
          let targetStage = "applied";
          let targetPriority = "High Priority";
          if (completeText.includes("interview") || completeText.includes("schedule")) {
            targetStage = "interviewing";
            targetPriority = "Technical Round";
          } else if (completeText.includes("offer") || completeText.includes("congratulations")) {
            targetStage = "offer";
            targetPriority = "Active Offer";
          }

          console.log(`[Indeed Sync Debug] Successfully matched company: "${companyName}". Stage: "${targetStage}", Priority: "${targetPriority}"`);

          // 4. Directly update their document in Firestore or auto-create it in the background
          // Runs asynchronously so that Firestore connection/rule errors or offline issues never freeze the Gmail Sync thread
          (async () => {
            try {
              if (!db || !userId) return;
              const appsRef = collection(db, "users", userId, "applications");
              const q = query(appsRef, where("companyName", "==", companyName));
              const querySnapshot = await getDocs(q);

              if (querySnapshot.empty) {
                const newDocRef = await addDoc(appsRef, {
                  companyName: companyName,
                  jobTitle: "Imported via Indeed Sync",
                  stage: targetStage,
                  animateTrigger: true,
                  lastUpdated: new Date()
                });

                setTimeout(async () => {
                  try {
                    await updateDoc(newDocRef, { animateTrigger: false });
                  } catch (e) {
                    console.warn("Reset trigger doc error:", e);
                  }
                }, 1000);
              } else {
                querySnapshot.forEach(async (appDoc) => {
                  const docRef = doc(db, "users", userId, "applications", appDoc.id);
                  const existingDocData = appDoc.data();
                  const currentDocStage = existingDocData.stage || 'applied';

                  // Stage progression weights: only promote, never demote
                  const stageWeights = { 'applied': 1, 'interviewing': 2, 'offer': 3 };
                  const shouldPromote = stageWeights[targetStage] > stageWeights[currentDocStage];
                  const resolvedStage = shouldPromote ? targetStage : currentDocStage;

                  // First flash the trigger to kick off animations
                  await updateDoc(docRef, {
                    stage: resolvedStage,
                    animateTrigger: shouldPromote, // Only float on actual promotion
                    lastUpdated: new Date()
                  });

                  // Turn off the trigger a second later so it resets clean for future changes
                  setTimeout(async () => {
                    try {
                      await updateDoc(docRef, { animateTrigger: false });
                    } catch (e) {
                      console.warn("Reset trigger doc error:", e);
                    }
                  }, 1000);
                });
              }
            } catch (dbErr) {
              console.log("[Indeed Sync Debug] Firestore update bypassed (running local state sync only):", dbErr.message);
            }
          })();

          const currentSyncCount = ++syncCount;

          // Also sync local React state to update the visual board
          setApplications(prev => {
            const exists = prev.some(app => app.company.toLowerCase() === companyName.toLowerCase());
            if (exists) {
              // Determine whether we should promote this card
              const existingApp = prev.find(app => app.company.toLowerCase() === companyName.toLowerCase());
              const currentStage = existingApp ? existingApp.status : 'applied';
              const stageWeights = { 'applied': 1, 'interviewing': 2, 'offer': 3 };
              const shouldPromote = stageWeights[targetStage] > stageWeights[currentStage];
              const resolvedStage = shouldPromote ? targetStage : currentStage;
              const resolvedPriority = shouldPromote ? targetPriority : (existingApp ? existingApp.priority : targetPriority);

              // Turn off the trigger a second later for local state
              setTimeout(() => {
                setApplications(current => current.map(app => {
                  if (app.company.toLowerCase() === companyName.toLowerCase()) {
                    return { ...app, animateTrigger: false };
                  }
                  return app;
                }));
              }, 1000);

              return prev.map(app => {
                if (app.company.toLowerCase() === companyName.toLowerCase()) {
                  return {
                    ...app,
                    status: resolvedStage,
                    priority: resolvedPriority,
                    animateTrigger: shouldPromote, // Only float if promoted
                    lastUpdated: new Date()
                  };
                }
                return app;
              });
            } else {
              // Turn off the trigger a second later for new local state card
              setTimeout(() => {
                setApplications(current => current.map(app => {
                  if (app.company.toLowerCase() === companyName.toLowerCase()) {
                    return { ...app, animateTrigger: false };
                  }
                  return app;
                }));
              }, 1000);

              return [
                ...prev,
                {
                  id: 'app-indeed-' + Date.now().toString().slice(-4) + '-' + currentSyncCount,
                  company: companyName,
                  role: 'Indeed Automated Application',
                  priority: targetPriority,
                  status: targetStage,
                  logoLetter: companyName.charAt(0).toUpperCase(),
                  customBg: 'linear-gradient(135deg, #0022ee, #0072ff)',
                  animateTrigger: true
                }
              ];
            }
          });
        } else {
          console.log(`[Indeed Sync Debug] Email parsing failed for message ID "${msgInfo.id}". Subject: "${subject}". Snippet: "${snippet.substring(0, 60)}..."`);
        }
      }

      if (syncCount === 0) {
        alert("Indeed Gmail Sync complete! We scanned 50 Indeed emails but couldn't parse the company name format. Please check the Developer Console logs to see the subjects.");
      } else {
        alert(`Indeed Gmail Sync Complete! Successfully updated or added ${syncCount} applications.`);
      }
    } catch (error) {
      console.error("Gmail fetching error:", error);
      alert("Error scanning Indeed notifications: " + error.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button 
      onClick={syncIndeedApplications} 
      disabled={syncing}
      className="btn btn-action"
      style={{
        background: 'rgba(0, 255, 135, 0.12)',
        border: '1px solid rgba(0, 255, 135, 0.25)',
        color: 'var(--neon-success)',
        padding: '6px 12px',
        fontSize: '12px'
      }}
    >
      {syncing ? "Scanning Inbox..." : "⚡ Sync with Indeed via Gmail"}
    </button>
  );
}

export default function App() {
  // ==========================================
  // 1. STARFIELD CANVAS REF & HOOK
  // ==========================================
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let stars = [];
    const starCount = 120;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let mouse = { x: -1000, y: -1000, radius: 150 };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    class Star {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.15;
        this.speedY = -Math.random() * 0.2 - 0.05;
        this.opacity = Math.random() * 0.7 + 0.3;
        this.color = Math.random() > 0.5 ? '#00f0ff' : (Math.random() > 0.5 ? '#9d4edd' : '#ffffff');
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.y < 0) {
          this.y = height;
          this.x = Math.random() * width;
        }
        if (this.x < 0 || this.x > width) {
          this.reset();
        }

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 1.5;
          this.y -= Math.sin(angle) * force * 1.5;
        }
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        if (this.size > 1.8) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = this.color;
        }
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      stars.forEach(star => {
        star.update();
        star.draw();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // ==========================================
  // 2. FIREBASE USER AUTHENTICATION STATE
  // ==========================================
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isFirebaseMock, setIsFirebaseMock] = useState(false);
  const [gmailToken, setGmailToken] = useState(() => sessionStorage.getItem('gmailToken') || null); // OAuth access token for Gmail
  const [gmailSyncing, setGmailSyncing] = useState(false);

  // Landing Page Specific States
  const [showDashboard, setShowDashboard] = useState(() => {
    try {
      return localStorage.getItem('currentUser') !== null;
    } catch {
      return false;
    }
  });
  const [envMode, setEnvMode] = useState(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        return user.isMock ? 'sandbox' : 'production';
      }
    } catch {}
    return 'sandbox';
  });
  const [terminalLogs, setTerminalLogs] = useState([]);
  const logTimerRef = useRef(null);

  // Kanban Tracker applications state persisted in localStorage
  const [applications, setApplications] = useState(() => {
    try {
      const savedApps = localStorage.getItem('applications');
      if (savedApps) {
        return JSON.parse(savedApps);
      }
    } catch (e) {
      console.warn("Failed to load applications from localStorage:", e);
    }
    return [
      { id: 'app-google', company: 'Google', role: 'Software Eng Intern', priority: 'High Priority', status: 'applied', logoClass: 'logo-google', logoLetter: 'G' },
      { id: 'app-meta', company: 'Meta', role: 'Product Manager Intern', priority: 'Medium', status: 'applied', logoClass: 'logo-meta', logoLetter: 'M' },
      { id: 'app-stripe', company: 'Stripe', role: 'Backend Engineer', priority: 'High Priority', status: 'applied', logoClass: 'logo-stripe', logoLetter: 'S' },
      { id: 'app-netflix', company: 'Netflix', role: 'UI/UX Engineer', priority: 'Technical Round', status: 'interviewing', logoClass: 'logo-netflix', logoLetter: 'N' },
      { id: 'app-airbnb', company: 'Airbnb', role: 'Frontend Developer', priority: 'Behavioral Round', status: 'interviewing', logoClass: 'logo-airbnb', logoLetter: 'A' },
      { id: 'app-vercel', company: 'Vercel', role: 'Next.js Dev Intern', priority: 'Active Offer', status: 'offer', logoClass: 'logo-vercel', logoLetter: '▲' }
    ];
  });

  // Sync auth state with showDashboard and localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        setShowDashboard(true);
      } else {
        localStorage.removeItem('currentUser');
        setShowDashboard(false);
      }
    } catch (e) {
      console.warn("Failed to update currentUser in localStorage:", e);
    }
  }, [currentUser]);

  // Sync applications state with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('applications', JSON.stringify(applications));
    } catch (e) {
      console.warn("Failed to save applications to localStorage:", e);
    }
  }, [applications]);

  // Firebase auth state change listener
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      if (auth) {
        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            const userData = { email: user.email, uid: user.uid, isMock: false };
            setCurrentUser(userData);
            setIsFirebaseMock(false);
          } else {
            // Guard: Only clear currentUser if it's not a sandbox/mock user session
            setCurrentUser(prev => (prev && prev.isMock) ? prev : null);
          }
        });
      }
    } catch (e) {
      console.warn("Firebase Auth not initialized or failing, running in mock mode.", e);
      setIsFirebaseMock(true);
    }
    return () => unsubscribe();
  }, []);

  // Terminal Simulator Logger Effect
  useEffect(() => {
    const sandboxLogs = [
      { text: "[SYSTEM] Initializing Local Sandbox environment...", type: "sys" },
      { text: "[SYSTEM] Bypassing secure cloud authentication protocols.", type: "sys" },
      { text: "[SUCCESS] Local memory session spawned: sandbox-google-user@gmail.com", type: "success" },
      { text: "[SYSTEM] Seeding Kanban board with 6 active internship records...", type: "sys" },
      { text: "[SYSTEM] Initializing ATS resume matcher keywords array...", type: "sys" },
      { text: "[STATUS] Sandbox environment ACTIVE. Zero-latency memory store.", type: "status" }
    ];

    const productionLogs = [
      { text: "[SYSTEM] Initializing Firebase Auth client...", type: "sys" },
      { text: "[SYSTEM] Check environment config (.env configuration)...", type: "sys" },
      { text: "[WARNING] VITE_FIREBASE_API_KEY is not defined in local environment!", type: "warning" },
      { text: "[ERROR] Firebase database connection failed: API key invalid.", type: "error" },
      { text: "[SYSTEM] Executing graceful failover routing protocol...", type: "sys" },
      { text: "[STATUS] Falling back to Sandbox Mode. Secure evaluator session ready.", type: "status" }
    ];

    const targetLogs = envMode === 'sandbox' ? sandboxLogs : productionLogs;
    setTerminalLogs([]);

    let intervalId;
    let currentLineIndex = 0;
    const typeNextLine = () => {
      if (currentLineIndex < targetLogs.length) {
        setTerminalLogs(prev => [...prev, targetLogs[currentLineIndex]]);
        currentLineIndex++;
      } else {
        if (intervalId) {
          clearInterval(intervalId);
        }
      }
    };

    typeNextLine();
    intervalId = setInterval(typeNextLine, 500);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [envMode]);

  const handleLaunchSandbox = () => {
    setCurrentUser({ email: 'sandbox-google-user@gmail.com', uid: 'sandbox-google-user-123', isMock: true });
    setGmailToken('sandbox-mock-token');
    sessionStorage.setItem('gmailToken', 'sandbox-mock-token');
    setShowDashboard(true);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please fill out all fields.');
      return;
    }
    if (authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setAuthError('');
    setAuthLoading(true);

    try {
      if (isFirebaseMock || !auth) {
        // Fallback Mock Login Simulation (always succeeds for quick local testing!)
        setTimeout(() => {
          setCurrentUser({ email: authEmail.trim(), uid: 'mock-user-123', isMock: true });
          setAuthLoading(false);
          setShowAuthModal(false);
          setAuthEmail('');
          setAuthPassword('');
          console.log("Mock logged in successfully:", authEmail);
        }, 1200);
      } else {
        // Real Firebase Auth
        if (authTab === 'login') {
          await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        } else {
          await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        }
        setAuthLoading(false);
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
      }
    } catch (err) {
      console.error("Auth error:", err);
      // Clean up technical Firebase messages
      let friendlyMessage = err.message;
      if (err.code === 'auth/user-not-found') friendlyMessage = 'No account found with this email.';
      else if (err.code === 'auth/wrong-password') friendlyMessage = 'Incorrect password.';
      else if (err.code === 'auth/email-already-in-use') friendlyMessage = 'An account with this email already exists.';
      else if (err.code === 'auth/invalid-email') friendlyMessage = 'Please enter a valid email address.';
      else if (err.code === 'auth/invalid-credential') friendlyMessage = 'Invalid credentials. Please verify your details.';
      
      // If Firebase Auth API fails completely due to network or fake configuration, auto-switch to Mock
      if (err.code === 'auth/api-key-not-valid' || err.message.includes('API key')) {
        setIsFirebaseMock(true);
        setAuthError('Invalid Firebase API config. Switched to visual Local Sandbox Mode. Click submit again to proceed!');
      } else {
        setAuthError(friendlyMessage);
      }
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setGmailToken(null);
      sessionStorage.removeItem('gmailToken');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('applications');
      
      // Reset applications to default list
      setApplications([
        { id: 'app-google', company: 'Google', role: 'Software Eng Intern', priority: 'High Priority', status: 'applied', logoClass: 'logo-google', logoLetter: 'G' },
        { id: 'app-meta', company: 'Meta', role: 'Product Manager Intern', priority: 'Medium', status: 'applied', logoClass: 'logo-meta', logoLetter: 'M' },
        { id: 'app-stripe', company: 'Stripe', role: 'Backend Engineer', priority: 'High Priority', status: 'applied', logoClass: 'logo-stripe', logoLetter: 'S' },
        { id: 'app-netflix', company: 'Netflix', role: 'UI/UX Engineer', priority: 'Technical Round', status: 'interviewing', logoClass: 'logo-netflix', logoLetter: 'N' },
        { id: 'app-airbnb', company: 'Airbnb', role: 'Frontend Developer', priority: 'Behavioral Round', status: 'interviewing', logoClass: 'logo-airbnb', logoLetter: 'A' },
        { id: 'app-vercel', company: 'Vercel', role: 'Next.js Dev Intern', priority: 'Active Offer', status: 'offer', logoClass: 'logo-vercel', logoLetter: '▲' }
      ]);

      if (currentUser?.isMock || isFirebaseMock || !auth) {
        setCurrentUser(null);
        setShowDashboard(false);
      } else {
        await signOut(auth);
        setShowDashboard(false);
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Logout error:", err);
      setCurrentUser(null);
      setShowDashboard(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      if (isFirebaseMock || !auth) {
        setTimeout(() => {
          setCurrentUser({ email: 'sandbox-google-user@gmail.com', uid: 'mock-google-user-123', isMock: true });
          setGmailToken('sandbox-mock-token');
          sessionStorage.setItem('gmailToken', 'sandbox-mock-token');
          setAuthLoading(false);
          setShowAuthModal(false);
          console.log("Mock Google login successful");
        }, 1200);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken || null;
        if (accessToken) {
          setGmailToken(accessToken);
          sessionStorage.setItem('gmailToken', accessToken);
          console.log("OAuth Access Token captured successfully:", accessToken);
        }
        setCurrentUser({ email: user.email, uid: user.uid, isMock: false });
        setIsFirebaseMock(false);
        setAuthLoading(false);
        setShowAuthModal(false);
        console.log("Google user logged in successfully:", user.email);
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      if (err.code === 'auth/api-key-not-valid' || err.message.includes('API key') || err.code === 'auth/operation-not-allowed') {
        setIsFirebaseMock(true);
        setAuthError('Google Auth not enabled/configured. Switched to local Sandbox Google Login. Click Google again to login!');
      } else {
        setAuthError(err.message);
      }
      setAuthLoading(false);
    }
  };


  // ==========================================
  // 3. KANBAN TRACKER STATE & ACTIONS
  // ==========================================
  // Note: applications state hook moved to top of the component to prevent ReferenceError in handleLogout

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newPriority, setNewPriority] = useState('High Priority');
  const [newStatus, setNewStatus] = useState('applied');

  const appliedApps = applications.filter(a => a.status === 'applied');
  const interviewingApps = applications.filter(a => a.status === 'interviewing');
  const offerApps = applications.filter(a => a.status === 'offer');

  const totalAppsCount = applications.length;
  const successRate = totalAppsCount > 0 ? Math.round((offerApps.length / totalAppsCount) * 100) : 0;
  const progressPercent = totalAppsCount > 0 
    ? Math.round(((interviewingApps.length * 0.5 + offerApps.length) / totalAppsCount) * 100) 
    : 0;

  const handleMoveItem = (itemId, targetStatus) => {
    setApplications(prev => prev.map(app => {
      if (app.id === itemId) {
        let updatedPriority = app.priority;
        if (targetStatus === 'offer') {
          updatedPriority = 'Active Offer';
        } else if (app.priority === 'Active Offer') {
          updatedPriority = itemId.includes('google') || itemId.includes('stripe') ? 'High Priority' : 'Medium';
        }
        return { ...app, status: targetStatus, priority: updatedPriority };
      }
      return app;
    }));
  };

  const handleAddApplication = (e) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim()) return;

    const newId = 'app-' + newCompany.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4);
    
    const colors = [
      'linear-gradient(135deg, #a855f7, #6366f1)',
      'linear-gradient(135deg, #ec4899, #f43f5e)',
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      'linear-gradient(135deg, #f59e0b, #d97706)'
    ];
    const customBg = colors[Math.floor(Math.random() * colors.length)];

    const newCardObj = {
      id: newId,
      company: newCompany.trim(),
      role: newRole.trim(),
      priority: newStatus === 'offer' ? 'Active Offer' : newPriority,
      status: newStatus,
      logoLetter: newCompany.trim().charAt(0).toUpperCase(),
      customBg: customBg
    };

    setApplications(prev => [...prev, newCardObj]);
    setNewCompany('');
    setNewRole('');
    setNewPriority('High Priority');
    setNewStatus('applied');
    setShowAddModal(false);
  };

  const handleDragStart = (e, cardId) => {
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, columnStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      handleMoveItem(id, columnStatus);
    }
  };

  const getTagClass = (priority) => {
    if (priority === 'High Priority') return 'tag-high';
    if (priority === 'Medium') return 'tag-medium';
    if (priority === 'Technical Round') return 'tag-tech';
    if (priority === 'Behavioral Round') return 'tag-hr';
    if (priority === 'Active Offer') return 'tag-success';
    return 'tag-medium';
  };

  // ==========================================
  // 4. COLD EMAIL OUTREACH STATE & ANIMATION
  // ==========================================
  const [recruiterName, setRecruiterName] = useState('Sarah Jenkins');
  const [recruiterCompany, setRecruiterCompany] = useState('Stripe');
  const [outreachRole, setOutreachRole] = useState('Software Engineer Intern');
  const [outreachTone, setOutreachTone] = useState('professional');
  
  const [emailSubject, setEmailSubject] = useState('Outreach - Software Engineer Intern Application');
  const [emailBodyDisplay, setEmailBodyDisplay] = useState(
    `Subject: Software Engineer Intern Role - Stripe\n\nDear Sarah,\n\nI hope this email finds you well. \n\nI am a passionate software engineering student deeply inspired by Stripe's developer-first financial infrastructure. Having built complex frontend-backend projects integrated with Stripe API, I'm reaching out to see if you have any open roles for a Software Engineer Intern.\n\nI have attached my resume and portfolio which showcases my deep alignment with Stripe's technical engineering principles. I would love to connect for 10 minutes to discuss how my skill set can contribute to the core payment infrastructure.\n\nThank you so much for your time and consideration.\n\nBest regards,\n[Your Name]`
  );
  
  const [isTyping, setIsTyping] = useState(false);
  const [copiedState, setCopiedState] = useState(false);

  const handleGenerateOutreach = () => {
    if (isTyping) return;

    const rName = recruiterName.trim() || 'Sarah Jenkins';
    const rCompany = recruiterCompany.trim() || 'Stripe';
    const rRole = outreachRole.trim() || 'Software Engineer Intern';

    const subjects = {
      professional: `Outreach: ${rRole} Application - ${rCompany}`,
      warm: `Deep admiration for ${rCompany} & connection for ${rRole}`,
      concise: `${rRole} role query - ${rCompany}`
    };

    const templates = {
      professional: `Subject: ${subjects.professional}\n\nDear ${rName},\n\nI hope this email finds you well. \n\nI am a passionate software engineering student deeply inspired by ${rCompany}'s industry leadership. Having built high-fidelity frontend applications and interactive web systems, I'm reaching out to see if you have any open roles for a ${rRole} on your engineering team.\n\nI have attached my resume and portfolio, which showcases my deep alignment with ${rCompany}'s technical requirements. I would love to connect for 10 minutes to discuss how my skill set can contribute to your core developments.\n\nThank you so much for your time and consideration.\n\nBest regards,\n[Your Name]`,
      
      warm: `Subject: ${subjects.warm}\n\nDear ${rName},\n\nI hope you're having a wonderful week! \n\nI’m reaching out because I’ve been following ${rCompany}’s engineering growth for a long time, and I am absolutely blown away by your technical culture. As a computer science student passionate about user-centric UI/UX and solid backend architecture, my dream is to learn and contribute as a ${rRole}.\n\nI’ve built several projects inspired directly by products that ${rCompany} builds. I would be incredibly grateful to jump on a quick 5-minute call just to learn more about your career path at ${rCompany} and see if there are internship openings for this summer.\n\nThank you for inspiring the next generation of engineers!\n\nWarmest regards,\n[Your Name]`,
      
      concise: `Subject: ${subjects.concise}\n\nDear ${rName},\n\nI'm a software engineering student looking for a ${rRole} opportunity at ${rCompany} this summer.\n\nI specialize in clean React architectures, responsive layouts, and robust Node backends. Here is what I bring to the table:\n- Rapid developer skills (built 4+ complex applications)\n- Deep understanding of modern UI/UX engineering workflows\n- Self-starter attitude\n\nMy portfolio is attached. Do you have 10 minutes this week for a brief introductory call?\n\nBest,\n[Your Name]`
    };

    const finalSubject = subjects[outreachTone];
    const finalBody = templates[outreachTone];

    setEmailSubject(finalSubject);
    setIsTyping(true);

    let charIndex = 0;
    setEmailBodyDisplay('');
    
    const typingInterval = finalBody.length > 500 ? 2 : 4;
    
    const type = () => {
      if (charIndex < finalBody.length) {
        setEmailBodyDisplay(prev => prev + finalBody.charAt(charIndex));
        charIndex++;
        setTimeout(type, typingInterval);
      } else {
        setIsTyping(false);
      }
    };
    
    type();
  };

  const handleCopyOutreach = () => {
    navigator.clipboard.writeText(emailBodyDisplay).then(() => {
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    });
  };

  // ==========================================
  // 5. AI RESUME ATS MATCHER STATE & ANALYZER
  // ==========================================
  const [resumeText, setResumeText] = useState(
    `Savit - CS Student at Top University\nTechnical Skills: JavaScript, React, Next.js, Node.js, Express, Postgres, MongoDB, RESTful APIs, Git, Docker, HTML5, Vanilla CSS, Tailwind, Responsive Web Design, Unit Testing, Agile methodologies.\nProjects: Built an e-commerce platform and an open-source collaborative task manager using Vite and WebSocket.`
  );
  
  const [jdText, setJdText] = useState(
    `Software Engineer Intern - Frontend & Backend\nRequirements:\n- Proficient in JavaScript/TypeScript\n- Deep understanding of modern React / Next.js\n- Experience building RESTful APIs using Node/Express\n- Strong CSS foundation and Responsive Design layouts\n- Knowledge of relational and non-relational databases`
  );

  const [matchScore, setMatchScore] = useState(92);
  const [scoreAnimationVal, setScoreAnimationVal] = useState(92);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const maxDashoffset = 251.2;
  const dashoffsetVal = maxDashoffset - (scoreAnimationVal / 100) * maxDashoffset;

  const handleAnalyzeResume = () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setScoreAnimationVal(0);

    const rText = resumeText.toLowerCase();
    const jText = jdText.toLowerCase();

    const keywords = [
      'javascript', 'typescript', 'react', 'next.js', 'node', 'express', 
      'css', 'html', 'tailwind', 'database', 'restful api', 'mongodb', 
      'postgres', 'git', 'docker', 'ui', 'ux', 'responsive'
    ];

    let checkCount = 0;
    let matchCount = 0;

    keywords.forEach(keyword => {
      if (jText.includes(keyword)) {
        checkCount++;
        if (rText.includes(keyword)) {
          matchCount++;
        }
      }
    });

    let calculatedScore = 55;
    if (checkCount > 0) {
      calculatedScore += Math.round((matchCount / checkCount) * 43);
    } else {
      calculatedScore = Math.floor(Math.random() * 20) + 70;
    }
    calculatedScore = Math.max(50, Math.min(99, calculatedScore));

    setMatchScore(calculatedScore);

    let tick = 0;
    const ticker = setInterval(() => {
      if (tick < calculatedScore) {
        tick += Math.ceil((calculatedScore - tick) / 8);
        if (tick > calculatedScore) tick = calculatedScore;
        setScoreAnimationVal(tick);
      } else {
        clearInterval(ticker);
        setIsAnalyzing(false);
      }
    }, 30);
  };

  const getMatchStatusText = (score) => {
    if (score >= 88) return 'Excellent Fit';
    if (score >= 75) return 'Strong Match';
    return 'Optimize Needed';
  };

  const getMatchStatusStyle = (score) => {
    if (score >= 88) return {
      color: 'var(--neon-success)',
      borderColor: 'rgba(0, 255, 135, 0.3)',
      background: 'rgba(0, 255, 135, 0.1)'
    };
    if (score >= 75) return {
      color: 'var(--neon-cyan)',
      borderColor: 'rgba(0, 240, 255, 0.3)',
      background: 'rgba(0, 240, 255, 0.1)'
    };
    return {
      color: 'var(--neon-gold)',
      borderColor: 'rgba(255, 170, 0, 0.3)',
      background: 'rgba(255, 170, 0, 0.1)'
    };
  };

  // ==========================================
  // 6. INTERVIEW CALENDAR & AGENDAS
  // ==========================================
  const [selectedDay, setSelectedDay] = useState(2);
  const [quickTaskText, setQuickTaskText] = useState('');
  
  const [agendaDatabase, setAgendaDatabase] = useState({
    2: [
      { title: 'Submit Google Online Assessment (OA)', time: '10:00 AM', done: true },
      { title: 'Mock Interview with Savit (System Design focus)', time: '2:00 PM', done: false },
      { title: 'Revise Netflix UI/UX specs and design tokens', time: '5:00 PM', done: false }
    ],
    12: [
      { title: 'Meta Technical Interview Screen', time: '11:00 AM', done: false },
      { title: 'Practice 3 LeetCode Greedy problems', time: '3:30 PM', done: false }
    ],
    22: [
      { title: 'Stripe Onsite Panel Presentation', time: '9:00 AM', done: false },
      { title: 'Send thank you follow-up letters', time: '4:00 PM', done: false }
    ],
    5: [
      { title: 'Apply to 5 high-priority positions on CareerFly', time: '10:00 AM', done: false },
      { title: 'Schedule resume audit check-in', time: '2:00 PM', done: true }
    ],
    18: [
      { title: 'Airbnb UI review panel callback', time: '1:30 PM', done: false }
    ]
  });

  const currentTasks = agendaDatabase[selectedDay] || [];
  const remainingTasksCount = currentTasks.filter(t => !t.done).length;

  const handleToggleTask = (taskIndex) => {
    setAgendaDatabase(prev => {
      const dayTasks = prev[selectedDay] ? [...prev[selectedDay]] : [];
      if (dayTasks[taskIndex]) {
        dayTasks[taskIndex] = { ...dayTasks[taskIndex], done: !dayTasks[taskIndex].done };
      }
      return { ...prev, [selectedDay]: dayTasks };
    });
  };

  const handleQuickAddTask = (e) => {
    if (e.key && e.key !== 'Enter') return;
    if (!quickTaskText.trim()) return;

    setAgendaDatabase(prev => {
      const dayTasks = prev[selectedDay] ? [...prev[selectedDay]] : [];
      
      const now = new Date();
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const timeStr = `${hours}:${minutes} ${ampm}`;

      const newTask = {
        title: quickTaskText.trim(),
        time: timeStr,
        done: false
      };

      return { ...prev, [selectedDay]: [...dayTasks, newTask] };
    });

    setQuickTaskText('');
  };

  const daysInJune = [];
  daysInJune.push({ day: 31, isPrev: true });
  for (let i = 1; i <= 30; i++) {
    daysInJune.push({ day: i, isPrev: false });
  }

  return (
    <div>
      {/* Background Interactive Elements */}
      <canvas id="space-starfield" ref={canvasRef}></canvas>
      <div className="nebula nebula-cyan"></div>
      <div className="nebula nebula-purple"></div>
      <div className="nebula nebula-blue"></div>

      {/* Main Header */}
      <header className="main-header" id="site-header">
        <div className="header-container">
          <a href="#" className="logo-area" id="header-logo-link">
            <div className="logo-icon">
              <svg viewBox="0 0 100 100" className="svg-logo">
                <polygon points="20,80 50,20 80,80 50,60" fill="url(#logo-gradient)"></polygon>
                <circle cx="50" cy="50" r="10" fill="#ffffff" className="logo-core"></circle>
                <defs>
                  <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f0ff" />
                    <stop offset="50%" stopColor="#7000ff" />
                    <stop offset="100%" stopColor="#ff007b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="logo-text">CareerFly</span>
          </a>
          
          <nav className="nav-menu" id="header-nav-menu">
            {showDashboard ? (
              <>
                <a href="#tracker-section" className="nav-link" id="nav-link-tracker">Kanban Tracker</a>
                <a href="#email-section" className="nav-link" id="nav-link-email">AI Outreach</a>
                <a href="#match-section" className="nav-link" id="nav-link-resume">Resume Analyzer</a>
                <a href="#calendar-section" className="nav-link" id="nav-link-calendar">Schedules</a>
              </>
            ) : (
              <>
                <a href="#features-grid-anchor" className="nav-link" id="nav-link-features">Features</a>
                <a href="#architecture-anchor" className="nav-link" id="nav-link-architecture">Tech Stack</a>
                <a href="#live-demo-anchor" className="nav-link" id="nav-link-livedemo">Live Demo</a>
              </>
            )}
          </nav>
          
          <div className="header-actions">
            {showDashboard ? (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button 
                  className="btn btn-secondary btn-header" 
                  onClick={() => setShowDashboard(false)}
                >
                  Back to Website
                </button>
                {currentUser && (
                  <span className="user-display-email">
                    {currentUser.isMock && <span style={{ color: 'var(--neon-gold)', marginRight: '4px' }}>[Sandbox]</span>}
                    {currentUser.email}
                  </span>
                )}
                <button 
                  className="btn btn-secondary btn-header" 
                  id="btn-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <>
                {currentUser ? (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                      className="btn btn-primary btn-header btn-glow" 
                      onClick={() => setShowDashboard(true)}
                    >
                      Enter Workspace
                    </button>
                    <button 
                      className="btn btn-secondary btn-header" 
                      id="btn-logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <button 
                      className="btn btn-secondary btn-header" 
                      id="btn-login-header"
                      onClick={() => {
                        setAuthTab('login');
                        setShowAuthModal(true);
                      }}
                    >
                      <LogIn size={14} /> Login
                    </button>
                    <button 
                      className="btn btn-primary btn-header btn-glow" 
                      onClick={handleLaunchSandbox}
                    >
                      Launch Sandbox
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main-layout">
        {showDashboard ? (
          <>
            {/* SHOWCASE GRID */}
            <section className="dashboard-grid-section" id="dashboard-interactive-showcase">
          
          {/* CARD 1: TRACKER */}
          <div className="dashboard-card card-double-width" id="tracker-section">
            <div className="card-border-glow"></div>
            <div className="card-header">
              <div className="card-header-left">
                <div className="card-icon-container status-cyan">
                  <Kanban size={20} />
                </div>
                <div>
                  <h3 className="card-title">Internship Tracker</h3>
                  <p className="card-subtitle">Manage, categorize, and track application lifecycles</p>
                </div>
              </div>
              <div className="card-header-right" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <GmailSyncButton 
                  accessToken={gmailToken} 
                  userId={currentUser?.uid || 'guest-evaluator'} 
                  setApplications={setApplications} 
                  setGmailToken={setGmailToken}
                  currentUser={currentUser}
                  syncing={gmailSyncing}
                  setSyncing={setGmailSyncing}
                />
                <button 
                  className="btn btn-action" 
                  id="btn-add-application" 
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus size={14} /> Add App
                </button>
              </div>
            </div>
            
            <div className="card-body">
              <div className="tracker-progress-summary">
                <div className="progress-info">
                  <span className="progress-label">Total Applications: <strong>{totalAppsCount}</strong></span>
                  <span className="progress-percentage">Success rate: <strong>{successRate}%</strong></span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              <div className="kanban-board">
                {/* Column: Applied */}
                <div 
                  className="kanban-column" 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'applied')}
                >
                  <div className="column-header">
                    <span className="column-title"><span className="status-dot dot-purple"></span> Applied</span>
                    <span className="column-badge">{appliedApps.length}</span>
                  </div>
                  <div className="kanban-cards-container">
                    {appliedApps.map(app => (
                      <div 
                        className={`kanban-item ${app.animateTrigger ? "anti-gravity-floating" : ""}`} 
                        key={app.id} 
                        id={app.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                      >
                        <div className="item-meta">
                          <div 
                            className={`company-logo ${app.logoClass || ''}`}
                            style={app.customBg ? { background: app.customBg } : {}}
                          >
                            {app.logoLetter}
                          </div>
                          <div className="item-details">
                            <span className="item-role">{app.role}</span>
                            <span className="item-company">{app.company}</span>
                          </div>
                        </div>
                        <div className="item-footer">
                          <span className={`item-tag ${getTagClass(app.priority)}`}>{app.priority}</span>
                          <div className="item-actions">
                            <button 
                              className="btn-item-arrow" 
                              onClick={() => handleMoveItem(app.id, 'interviewing')}
                              title="Move to Interviewing"
                            >
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {gmailSyncing && <KanbanSkeletonCard />}
                  </div>
                </div>

                {/* Column: Interviewing */}
                <div 
                  className="kanban-column"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'interviewing')}
                >
                  <div className="column-header">
                    <span className="column-title"><span className="status-dot dot-blue"></span> Interviewing</span>
                    <span className="column-badge">{interviewingApps.length}</span>
                  </div>
                  <div className="kanban-cards-container">
                    {interviewingApps.map(app => (
                      <div 
                        className={`kanban-item ${app.animateTrigger ? "anti-gravity-floating" : ""}`} 
                        key={app.id}
                        id={app.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                      >
                        <div className="item-meta">
                          <div 
                            className={`company-logo ${app.logoClass || ''}`}
                            style={app.customBg ? { background: app.customBg } : {}}
                          >
                            {app.logoLetter}
                          </div>
                          <div className="item-details">
                            <span className="item-role">{app.role}</span>
                            <span className="item-company">{app.company}</span>
                          </div>
                        </div>
                        <div className="item-footer">
                          <span className={`item-tag ${getTagClass(app.priority)}`}>{app.priority}</span>
                          <div className="item-actions">
                            <button 
                              className="btn-item-arrow arrow-back" 
                              onClick={() => handleMoveItem(app.id, 'applied')}
                              title="Move back to Applied"
                              style={{ marginRight: '4px' }}
                            >
                              <ArrowLeft size={12} />
                            </button>
                            <button 
                              className="btn-item-arrow" 
                              onClick={() => handleMoveItem(app.id, 'offer')}
                              title="Move to Offer"
                            >
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {gmailSyncing && <KanbanSkeletonCard />}
                  </div>
                </div>

                {/* Column: Offer */}
                <div 
                  className="kanban-column"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'offer')}
                >
                  <div className="column-header">
                    <span className="column-title"><span className="status-dot dot-cyan"></span> Offer Received</span>
                    <span className="column-badge">{offerApps.length}</span>
                  </div>
                  <div className="kanban-cards-container">
                    {offerApps.map(app => (
                      <div 
                        className={`kanban-item offer-border-pulse ${app.animateTrigger ? "anti-gravity-floating" : ""}`} 
                        key={app.id}
                        id={app.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                      >
                        <div className="item-meta">
                          <div 
                            className={`company-logo ${app.logoClass || ''}`}
                            style={app.customBg ? { background: app.customBg } : {}}
                          >
                            {app.logoLetter}
                          </div>
                          <div className="item-details">
                            <span className="item-role">{app.role}</span>
                            <span className="item-company">{app.company}</span>
                          </div>
                        </div>
                        <div className="item-footer">
                          <span className={`item-tag ${getTagClass(app.priority)}`}>{app.priority}</span>
                          <div className="item-actions">
                            <button 
                              className="btn-item-arrow arrow-back" 
                              onClick={() => handleMoveItem(app.id, 'interviewing')}
                              title="Move back to Interviewing"
                            >
                              <ArrowLeft size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {gmailSyncing && <KanbanSkeletonCard />}
                  </div>
                </div>
              </div>
            </div>

            {/* Kanban Card Add Modal */}
            <div className={`application-modal-overlay ${showAddModal ? 'active' : ''}`}>
              <div className="application-modal">
                <div className="modal-header">
                  <h3>Add Internship Application</h3>
                  <button className="btn-close" onClick={() => setShowAddModal(false)}>&times;</button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleAddApplication}>
                    <div className="form-group">
                      <label htmlFor="form-company">Company Name</label>
                      <input 
                        type="text" 
                        id="form-company" 
                        required 
                        placeholder="e.g. Microsoft"
                        value={newCompany}
                        onChange={(e) => setNewCompany(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="form-role">Internship Role</label>
                      <input 
                        type="text" 
                        id="form-role" 
                        required 
                        placeholder="e.g. Software Engineer Intern"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="form-priority">Priority / Urgency</label>
                      <select 
                        id="form-priority"
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                      >
                        <option value="High Priority">High Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="Low Priority">Low Priority</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="form-status">Initial Status</label>
                      <select 
                        id="form-status"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offer">Offer</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '10px' }}>
                      Create Application
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: OUTREACH */}
          <div className="dashboard-card" id="email-section">
            <div className="card-border-glow"></div>
            <div className="card-header">
              <div className="card-header-left">
                <div className="card-icon-container status-purple">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="card-title">AI Recruiter Outreach</h3>
                  <p className="card-subtitle">Generate hyper-personalized cold outreach emails</p>
                </div>
              </div>
            </div>
            
            <div className="card-body flex-col">
              <div className="outreach-form">
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label htmlFor="recruiter-name">Recruiter Name</label>
                    <input 
                      type="text" 
                      id="recruiter-name" 
                      value={recruiterName} 
                      onChange={(e) => setRecruiterName(e.target.value)}
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label htmlFor="recruiter-company">Target Company</label>
                    <input 
                      type="text" 
                      id="recruiter-company" 
                      value={recruiterCompany}
                      onChange={(e) => setRecruiterCompany(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label htmlFor="email-role">Target Position</label>
                    <input 
                      type="text" 
                      id="email-role" 
                      value={outreachRole}
                      onChange={(e) => setOutreachRole(e.target.value)}
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label htmlFor="email-tone">Tone Selection</label>
                    <select 
                      id="email-tone"
                      value={outreachTone}
                      onChange={(e) => setOutreachTone(e.target.value)}
                    >
                      <option value="professional">Professional & Bold</option>
                      <option value="warm">Warm & Appreciative</option>
                      <option value="concise">Concise & Direct</option>
                    </select>
                  </div>
                </div>

                <button 
                  className="btn btn-primary btn-full btn-glow" 
                  id="btn-generate-email"
                  onClick={handleGenerateOutreach}
                  disabled={isTyping}
                >
                  {isTyping ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Analyzing & Writing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Generate AI Outreach Email
                    </>
                  )}
                </button>
              </div>

              <div className="email-output-container">
                <div className="output-header">
                  <span className="subject-line">Subject: <span>{emailSubject}</span></span>
                  <button 
                    className="btn-copy" 
                    id="btn-copy-email" 
                    onClick={handleCopyOutreach}
                    style={copiedState ? { borderColor: 'var(--neon-success)', color: 'var(--neon-success)' } : {}}
                  >
                    {copiedState ? (
                      <>
                        <Check size={12} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="output-body" id="email-body-out">
                  {emailBodyDisplay}
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: ATS RESUME MATCHER */}
          <div className="dashboard-card" id="match-section">
            <div className="card-border-glow"></div>
            <div className="card-header">
              <div className="card-header-left">
                <div className="card-icon-container status-blue">
                  <FileCheck2 size={20} />
                </div>
                <div>
                  <h3 className="card-title">AI Resume ATS Matcher</h3>
                  <p className="card-subtitle">Analyze resume compatibility against JD keywords</p>
                </div>
              </div>
            </div>
            
            <div className="card-body flex-col">
              <div className="match-score-radial-container">
                <div className="radial-gauge-wrapper">
                  <svg viewBox="0 0 100 100" className="radial-svg">
                    <circle cx="50" cy="50" r="40" className="radial-bg-track"></circle>
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      className="radial-fill-track" 
                      id="score-circle-gauge"
                      style={{ strokeDashoffset: dashoffsetVal }}
                      stroke="url(#radial-gradient-score-main)"
                    ></circle>
                    <defs>
                      <linearGradient id="radial-gradient-score-main" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00f0ff" />
                        <stop offset="100%" stopColor="#0072ff" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="radial-score-content">
                    <span className="score-number" id="match-score-val">{scoreAnimationVal}%</span>
                    <span className="score-label">Match Score</span>
                  </div>
                </div>
                <div 
                  className="match-status-pill success-glow" 
                  id="match-status-banner"
                  style={getMatchStatusStyle(scoreAnimationVal)}
                >
                  {getMatchStatusText(scoreAnimationVal)}
                </div>
              </div>

              <div className="comparison-grid">
                <div className="comparison-pane">
                  <div className="pane-header">
                    <span><FileText size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Resume Profile</span>
                  </div>
                  <textarea 
                    className="pane-textarea" 
                    id="resume-textarea"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>
                
                <div className="comparison-pane">
                  <div className="pane-header">
                    <span><Briefcase size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Job Description</span>
                  </div>
                  <textarea 
                    className="pane-textarea" 
                    id="jd-textarea"
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                  />
                </div>
              </div>
              
              <button 
                className="btn btn-primary btn-full btn-glow" 
                id="btn-reanalyze-match"
                onClick={handleAnalyzeResume}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Re-matching ATS Algorithms...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} /> Re-Analyze Matching Score
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CARD 4: CALENDAR */}
          <div className="dashboard-card card-double-width" id="calendar-section">
            <div className="card-border-glow"></div>
            <div className="card-header">
              <div className="card-header-left">
                <div className="card-icon-container status-gold">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <h3 className="card-title">Interview Calendar & Checklist</h3>
                  <p className="card-subtitle">Keep track of technical assessments, HR follow-ups, and schedules</p>
                </div>
              </div>
              <div className="card-header-right">
                <span className="calendar-month-indicator" id="current-month-year">June 2026</span>
              </div>
            </div>
            
            <div className="card-body">
              <div className="calendar-split-container">
                <div className="calendar-left-pane">
                  <div className="calendar-weekdays">
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                  </div>
                  <div className="calendar-days">
                    {daysInJune.map((d, index) => {
                      const isToday = !d.isPrev && d.day === 2;
                      const isSelected = !d.isPrev && d.day === selectedDay;
                      const hasEvent = !d.isPrev && agendaDatabase[d.day];
                      
                      let dayClass = 'calendar-day';
                      if (d.isPrev) dayClass += ' prev-next-month';
                      if (isToday) dayClass += ' today';
                      if (isSelected) dayClass += ' selected';

                      let dotColorClass = '';
                      if (hasEvent) {
                        dotColorClass = (d.day === 2 || d.day === 12 || d.day === 22) ? 'dot-red' : 'dot-yellow';
                      }

                      return (
                        <div 
                          className={dayClass} 
                          key={index}
                          onClick={() => {
                            if (!d.isPrev) setSelectedDay(d.day);
                          }}
                        >
                          {d.day}
                          {hasEvent && <span className={`day-event-dot ${dotColorClass}`}></span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="agenda-right-pane">
                  <div className="agenda-header">
                    <span className="agenda-date" id="selected-agenda-date">
                      {selectedDay === 2 ? 'Today - ' : ''}June {selectedDay}, 2026
                    </span>
                    <span className="agenda-count" id="active-tasks-count">
                      {remainingTasksCount} Remaining
                    </span>
                  </div>
                  
                  <div className="agenda-list">
                    {currentTasks.length === 0 ? (
                      <div className="empty-agenda">
                        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px', padding: '24px 0' }}>
                          <Info size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> 
                          No interviews scheduled. Keep building!
                        </p>
                      </div>
                    ) : (
                      currentTasks.map((task, index) => (
                        <div className="agenda-task-item" key={index}>
                          <label className="checkbox-container">
                            <input 
                              type="checkbox" 
                              checked={task.done} 
                              onChange={() => handleToggleTask(index)}
                            />
                            <span className="checkmark"></span>
                            <div className="task-info">
                              <span className={`task-title ${task.done ? 'strike' : ''}`}>
                                {task.title}
                              </span>
                              <span className="task-time">
                                <Clock size={10} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> 
                                {task.time}
                              </span>
                            </div>
                          </label>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="quick-add-task-container">
                    <input 
                      type="text" 
                      id="quick-task-input" 
                      placeholder="Add custom agenda item..."
                      value={quickTaskText}
                      onChange={(e) => setQuickTaskText(e.target.value)}
                      onKeyDown={handleQuickAddTask}
                    />
                    <button 
                      className="btn btn-action" 
                      id="btn-quick-add-task"
                      onClick={() => handleQuickAddTask({})}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* METRICS */}
        <section className="metrics-section" id="metrics-panel">
          <div className="metrics-container">
            <div className="metric-card">
              <span className="metric-number">10x</span>
              <span className="metric-title">Faster Applications</span>
              <span className="metric-desc">Personalized AI drafting enables students to apply with quality in minutes, not hours.</span>
            </div>
            <div className="metric-card">
              <span className="metric-number">94%</span>
              <span className="metric-title">ATS Success Rate</span>
              <span className="metric-desc">Keyword matching ensures your resume gets parsed and pushed to real recruiters.</span>
            </div>
            <div className="metric-card">
              <span className="metric-number">0</span>
              <span className="metric-title">Missed Deadlines</span>
              <span className="metric-desc">Automated alerts and task synchronizers ensure follow-ups are done on schedule.</span>
            </div>
          </div>
        </section>
          </>
        ) : (
          <>
            {/* HERO SECTION */}
            <section className="hero-section" id="hero-area">
              <div className="hero-content">
                <div className="hero-badge" id="hero-badge-announcement">
                  <span className="badge-dot"></span>
                  <span className="badge-text">
                    {currentUser 
                      ? `Welcome back, ${currentUser.email.split('@')[0]}!` 
                      : "Next-Gen React SaaS v2.0 is Live"
                    }
                  </span>
                </div>
                <h1 className="hero-heading" id="hero-main-title">
                  ACE YOUR <br />
                  <span className="gradient-text">INTERNSHIP SEARCH</span>
                </h1>
                <p className="hero-subheading" id="hero-main-subtitle">
                  The Ultimate AI-Powered Application & Outreach Dashboard for Students
                </p>
                
                <div className="hero-cta-container">
                  {currentUser ? (
                    <button 
                      onClick={() => setShowDashboard(true)} 
                      className="btn btn-primary btn-lg btn-glow pulse-animation"
                    >
                      Enter Workspace <ArrowRight size={20} />
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <button 
                        className="btn btn-primary btn-lg btn-glow pulse-animation" 
                        id="hero-cta-btn"
                        onClick={handleLaunchSandbox}
                      >
                        Launch Sandbox Workspace <ArrowRight size={20} />
                      </button>
                      <button 
                        className="btn btn-secondary btn-lg" 
                        onClick={() => {
                          setAuthTab('signup');
                          setShowAuthModal(true);
                        }}
                      >
                        Register Account
                      </button>
                    </div>
                  )}
                  <p className="hero-tagline" id="hero-tagline-text">
                    Combines Frontend + Backend + AI | Real Problem Solved
                  </p>
                </div>
              </div>

              <div className="levitating-crystal crystal-1"></div>
              <div className="levitating-crystal crystal-2"></div>
              <div className="levitating-crystal crystal-3"></div>
            </section>

            {/* Section Divider */}
            <div id="features-grid-anchor" className="section-divider">
              <span className="divider-line"></span>
              <span className="divider-pill">CORE SaaS MODULES</span>
              <span className="divider-line"></span>
            </div>

            {/* SECTION 2: BENTO FEATURES GRID */}
            <section className="bento-features-grid">
              {/* Card 1: Kanban Tracker Mockup */}
              <div className="bento-card col-7">
                <div className="card-border-glow"></div>
                <div className="card-header" style={{ marginBottom: '10px' }}>
                  <div className="card-header-left">
                    <div className="card-icon-container status-cyan">
                      <Kanban size={18} />
                    </div>
                    <div>
                      <h3 className="card-title" style={{ fontSize: '16px' }}>Kanban Internship Tracker</h3>
                      <p className="card-subtitle">Visualize and move applications across stages</p>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <MiniKanbanMockup />
                </div>
              </div>

              {/* Card 2: AI Outreach Mockup */}
              <div className="bento-card col-5">
                <div className="card-border-glow"></div>
                <div className="card-header" style={{ marginBottom: '10px' }}>
                  <div className="card-header-left">
                    <div className="card-icon-container status-purple">
                      <Mail size={18} />
                    </div>
                    <div>
                      <h3 className="card-title" style={{ fontSize: '16px' }}>AI Recruiter Outreach</h3>
                      <p className="card-subtitle">Generate outreach letters matching tones</p>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <MiniOutreachMockup />
                </div>
              </div>

              {/* Card 3: ATS Matcher Mockup */}
              <div className="bento-card col-5">
                <div className="card-border-glow"></div>
                <div className="card-header" style={{ marginBottom: '10px' }}>
                  <div className="card-header-left">
                    <div className="card-icon-container status-blue">
                      <FileCheck2 size={18} />
                    </div>
                    <div>
                      <h3 className="card-title" style={{ fontSize: '16px' }}>Resume ATS Matcher</h3>
                      <p className="card-subtitle">Scan compatibility for job descriptions</p>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <MiniAtsMatcherMockup />
                </div>
              </div>

              {/* Card 4: Interview Calendar Mockup */}
              <div className="bento-card col-7">
                <div className="card-border-glow"></div>
                <div className="card-header" style={{ marginBottom: '10px' }}>
                  <div className="card-header-left">
                    <div className="card-icon-container status-gold">
                      <CalendarIcon size={18} />
                    </div>
                    <div>
                      <h3 className="card-title" style={{ fontSize: '16px' }}>Interview Calendar</h3>
                      <p className="card-subtitle">Select dates to filter agenda checklists</p>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <MiniCalendarMockup />
                </div>
              </div>
            </section>

            {/* Section Divider */}
            <div id="architecture-anchor" className="section-divider">
              <span className="divider-line"></span>
              <span className="divider-pill">UNDER THE HOOD</span>
              <span className="divider-line"></span>
            </div>

            {/* SECTION 3: ARCHITECTURE & TECH STACK VISUALIZER */}
            <section className="tech-stack-visualizer">
              {/* Frontend Core */}
              <div className="tech-card">
                <div className="tech-icon-wrapper status-cyan">
                  <Layers size={22} />
                </div>
                <h3 className="tech-title">Frontend Core</h3>
                <ul className="tech-list">
                  <li className="tech-item">
                    <Sparkles size={14} className="status-cyan" style={{ transform: 'none' }} />
                    <span><strong className="tech-item-name">React 19:</strong> Declarative components & strict state hooks.</span>
                  </li>
                  <li className="tech-item">
                    <Layers size={14} className="status-cyan" />
                    <span><strong className="tech-item-name">Vite:</strong> Ultra-fast dev server with hot modular replacement.</span>
                  </li>
                  <li className="tech-item">
                    <Layers size={14} className="status-cyan" />
                    <span><strong className="tech-item-name">Vanilla CSS:</strong> Pure layout variables with glassmorphism blurs.</span>
                  </li>
                </ul>
              </div>

              {/* Backend & Security */}
              <div className="tech-card">
                <div className="tech-icon-wrapper status-purple">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="tech-title">Backend & Security</h3>
                <ul className="tech-list">
                  <li className="tech-item">
                    <Layers size={14} className="status-purple" />
                    <span><strong className="tech-item-name">Firebase Core:</strong> Cloud computing application services infrastructure.</span>
                  </li>
                  <li className="tech-item">
                    <LogIn size={14} className="status-purple" />
                    <span><strong className="tech-item-name">Google Auth:</strong> Secure popup-window single-sign-on interfaces.</span>
                  </li>
                  <li className="tech-item">
                    <ShieldCheck size={14} className="status-purple" />
                    <span><strong className="tech-item-name">Dotenv & Git:</strong> Masked client api credentials & ignored security keys.</span>
                  </li>
                </ul>
              </div>

              {/* Starfield Engine */}
              <div className="tech-card">
                <div className="tech-icon-wrapper status-gold">
                  <Orbit size={22} />
                </div>
                <h3 className="tech-title">Starfield Engine</h3>
                <ul className="tech-list">
                  <li className="tech-item">
                    <Orbit size={14} className="status-gold" />
                    <span><strong className="tech-item-name">HTML5 Canvas:</strong> Dynamic particles rendering on 60fps render cycles.</span>
                  </li>
                  <li className="tech-item">
                    <MousePointer size={14} className="status-gold" />
                    <span><strong className="tech-item-name">Deflection Physics:</strong> Real-time vector math displacing particles.</span>
                  </li>
                  <li className="tech-item">
                    <ArrowUpCircle size={14} className="status-gold" />
                    <span><strong className="tech-item-name">Anti-Gravity:</strong> Hover drift animation physics for elements.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* FAILOVER HIGHLIGHT CARD */}
            <div className="sandbox-highlight-container">
              <div className="sandbox-highlight-card">
                <div className="sandbox-highlight-icon">
                  <ShieldCheck size={32} />
                </div>
                <div className="sandbox-highlight-text">
                  <h3>Failover Protocol: Sandbox Mock Mode</h3>
                  <p>
                    CareerFly handles unconfigured environments with an autonomous failover router. If Firebase credentials are not found in the local environment, the client engine automatically redirects authentication states to a localized user profile, enabling instant dashboard evaluation without any registration or database setups.
                  </p>
                </div>
              </div>
            </div>

            {/* Section Divider */}
            <div id="live-demo-anchor" className="section-divider">
              <span className="divider-line"></span>
              <span className="divider-pill">LIVE SANDBOX DEMO</span>
              <span className="divider-line"></span>
            </div>

            {/* SECTION 4: INTERACTIVE DEMO / PREVIEW CALLOUT */}
            <div className="sandbox-simulator-card">
              <div className="simulator-controls">
                <div className="simulator-title-area">
                  <h3 className="simulator-title">Live Sandbox Environment Simulator</h3>
                  <span className="simulator-subtitle">Toggle connection configurations and inspect state connection logs</span>
                </div>
                <div className="toggle-switch-wrapper">
                  <button 
                    className={`toggle-btn ${envMode === 'production' ? 'active production' : ''}`}
                    onClick={() => setEnvMode('production')}
                  >
                    Production Mode
                  </button>
                  <button 
                    className={`toggle-btn ${envMode === 'sandbox' ? 'active sandbox' : ''}`}
                    onClick={() => setEnvMode('sandbox')}
                  >
                    Sandbox Mock Mode
                  </button>
                </div>
              </div>

              <div className="terminal-window">
                <div className="terminal-header">
                  <div className="terminal-buttons">
                    <span className="terminal-dot dot-close"></span>
                    <span className="terminal-dot dot-minimize"></span>
                    <span className="terminal-dot dot-expand"></span>
                  </div>
                  <span className="terminal-title">careerfly-auth-state-machine</span>
                </div>
                <div className="terminal-body">
                  {terminalLogs.map((log, index) => {
                    if (!log) return null;
                    return (
                      <div key={index} className={`terminal-line ${log.type}`}>
                        {log.text}
                      </div>
                    );
                  })}
                  <span className="terminal-caret"></span>
                </div>
              </div>

              <div className="simulator-cta">
                <button 
                  className="btn btn-primary btn-lg btn-glow pulse-animation"
                  onClick={handleLaunchSandbox}
                >
                  Launch Sandbox Workspace <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Main Footer */}
      <footer className="main-footer" id="site-footer">
        <div className="footer-container">
          <div className="footer-left">
            <div className="footer-logo">
              <svg viewBox="0 0 100 100" className="svg-logo footer-logo-svg">
                <polygon points="20,80 50,20 80,80 50,60" fill="url(#footer-logo-gradient)"></polygon>
                <defs>
                  <linearGradient id="footer-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f0ff" />
                    <stop offset="100%" stopColor="#ff007b" />
                  </linearGradient>
                </defs>
              </svg>
              <span>CareerFly</span>
            </div>
            <p className="footer-copyright">
              &copy; 2026 CareerFly SaaS. Built for students to conquer internships using Frontend + Backend + AI solutions. All rights reserved.
            </p>
            <p className="footer-disclaimer">
              Disclaimer: This open-source dashboard is a demo project built for demonstration purposes. Firebase client SDK is used for real-time authentication.
            </p>
          </div>
          
          <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '8px' }}>Developer Links</h4>
            <div className="footer-social-links">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" title="GitHub Repository">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" title="LinkedIn Profile">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a href="https://portfolio.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" title="Personal Portfolio">
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-glow"></div>
      </footer>

      {/* ==========================================
         ACTIVE USER LOGIN/SIGNUP MODAL OVERLAY
         ========================================== */}
      <div className={`application-modal-overlay ${showAuthModal ? 'active' : ''}`}>
        <div className="application-modal" style={{ maxWidth: '400px' }}>
          <div className="modal-header" style={{ marginBottom: '14px' }}>
            <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {authTab === 'login' ? 'Account Login' : 'Student Register'}
            </h3>
            <button className="btn-close" onClick={() => setShowAuthModal(false)}>&times;</button>
          </div>
          
          <div className="modal-body">
            {/* Tabs for Login vs Signup */}
            <div className="auth-tabs">
              <button 
                className={`auth-tab-btn ${authTab === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setAuthTab('login');
                  setAuthError('');
                }}
              >
                Login
              </button>
              <button 
                className={`auth-tab-btn ${authTab === 'signup' ? 'active' : ''}`}
                onClick={() => {
                  setAuthTab('signup');
                  setAuthError('');
                }}
              >
                Register
              </button>
            </div>

            {/* Error alerts */}
            {authError && (
              <div className="auth-error-alert">
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit}>
              <div className="form-group">
                <label htmlFor="auth-email">Email Address</label>
                <input 
                  type="email" 
                  id="auth-email" 
                  required 
                  placeholder="name@university.edu"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label htmlFor="auth-password">Password</label>
                <input 
                  type="password" 
                  id="auth-password" 
                  required 
                  placeholder="Min 6 characters"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-full btn-glow"
                disabled={authLoading}
              >
                {authLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Authenticating...
                  </>
                ) : (
                  <>
                    {authTab === 'login' ? 'Sign In' : 'Sign Up Free'}
                  </>
                )}
              </button>
            </form>

            {/* Visual Divider */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', color: 'rgba(255, 255, 255, 0.35)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }}></div>
              <span style={{ padding: '0 10px' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }}></div>
            </div>

            {/* Google Sign In Button */}
            <button 
              onClick={handleGoogleSignIn}
              type="button"
              className="btn btn-secondary btn-full"
              style={{ display: 'flex', justifyContent: 'center', gap: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              disabled={authLoading}
            >
              <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V13.4h6.86c-.277 1.56-1.602 4.585-6.86 4.585-4.54 0-8.24-3.765-8.24-8.4s3.7-8.4 8.24-8.4c2.58 0 4.307 1.095 5.298 2.045l2.465-2.37C18.435 1.21 15.62 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"/>
              </svg>
              Continue with Google
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
