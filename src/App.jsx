import { useState, useEffect, useRef } from 'react';
import {
  LogIn,
  LogOut
} from 'lucide-react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { auth, googleProvider, db } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  collection
} from 'firebase/firestore';

import './AntiGravityKanban.css';

// Component Pages
import TrackerPage from './TrackerPage';
import OutreachPage from './OutreachPage';
import ResumePage from './ResumePage';
import AIInterviewPage from './AIInterviewPage';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';



export default function App() {
  const canvasRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // ==========================================
  // STARFIELD BACKGROUND ANIMATION
  // ==========================================
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
  // AUTHENTICATION STATES
  // ==========================================
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isFirebaseMock, setIsFirebaseMock] = useState(false);
  const [gmailToken, setGmailToken] = useState(() => sessionStorage.getItem('gmailToken') || null);
  const [gmailSyncing, setGmailSyncing] = useState(false);

  const [showDashboard, setShowDashboard] = useState(() => {
    try {
      const hasUser = localStorage.getItem('currentUser') !== null;
      if (!hasUser) return false;
      const savedShow = localStorage.getItem('showDashboard');
      return savedShow !== 'false';
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
    } catch { /* ignored */ }
    return 'sandbox';
  });

  const [terminalLogs, setTerminalLogs] = useState([]);

  // Persist authentication status
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        const savedShow = localStorage.getItem('showDashboard');
        if (savedShow === null) {
          setShowDashboard(true);
        } else {
          setShowDashboard(savedShow === 'true');
        }
      } else {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('showDashboard');
        setShowDashboard(false);
      }
    } catch (e) {
      console.warn(e);
    }
  }, [currentUser]);

  // Sync showDashboard to localStorage when it changes
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('showDashboard', showDashboard ? 'true' : 'false');
      }
    } catch (e) {
      console.warn(e);
    }
  }, [showDashboard, currentUser]);

  // Synchronize dashboard view when accessing sub-pages directly while logged in
  useEffect(() => {
    if (currentUser && location.pathname !== '/' && location.pathname !== '/login') {
      setShowDashboard(true);
    }
  }, [location.pathname, currentUser]);

  // Auth Listener
  useEffect(() => {
    let unsubscribe = () => { };
    try {
      if (auth) {
        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            const userData = { email: user.email, uid: user.uid, isMock: false };
            setCurrentUser(userData);
            setIsFirebaseMock(false);
          } else {
            setCurrentUser(prev => (prev && prev.isMock) ? prev : null);
          }
        });
      }
    } catch (e) {
      console.warn("Auth initialization fallback.", e);
      setIsFirebaseMock(true);
    }
    return () => unsubscribe();
  }, []);

  const handleLaunchSandbox = () => {
    setCurrentUser({ email: 'sandbox-google-user@gmail.com', uid: 'sandbox-google-user-123', isMock: true });
    setGmailToken('sandbox-mock-token');
    sessionStorage.setItem('gmailToken', 'sandbox-mock-token');
    setShowDashboard(true);
  };

  const handleAuthSubmit = async (e, tab) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please fill out all fields.');
      return;
    }
    setAuthError('');
    setAuthLoading(true);

    try {
      if (isFirebaseMock || !auth) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        setCurrentUser({ email: authEmail.trim(), uid: 'mock-user-123', isMock: true });
        setAuthLoading(false);
        setAuthEmail('');
        setAuthPassword('');
      } else {
        if (tab === 'login') {
          await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        } else {
          await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        }
        setAuthLoading(false);
        setAuthEmail('');
        setAuthPassword('');
      }
    } catch (err) {
      setAuthError(err.message);
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setGmailToken(null);
      sessionStorage.removeItem('gmailToken');
      localStorage.removeItem('currentUser');
      if (currentUser?.isMock || isFirebaseMock || !auth) {
        setCurrentUser(null);
        setShowDashboard(false);
      } else {
        await signOut(auth);
        setShowDashboard(false);
        setCurrentUser(null);
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      setCurrentUser(null);
      setShowDashboard(false);
      navigate('/');
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      if (isFirebaseMock || !auth) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        setCurrentUser({ email: 'sandbox-google-user@gmail.com', uid: 'mock-google-user-123', isMock: true });
        setGmailToken('sandbox-mock-token');
        sessionStorage.setItem('gmailToken', 'sandbox-mock-token');
        setAuthLoading(false);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken || null;
        if (accessToken) {
          setGmailToken(accessToken);
          sessionStorage.setItem('gmailToken', accessToken);
        }
        setCurrentUser({ email: user.email, uid: user.uid, isMock: false });
        setIsFirebaseMock(false);
        setAuthLoading(false);
      }
    } catch (err) {
      setAuthError(err.message);
      setAuthLoading(false);
    }
  };

  // ==========================================
  // KANBAN TRACKER STATE & ACTIONS
  // ==========================================

  const getRelativeDateStr = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  // Default starter applications shown to new users
  const DEFAULT_APPS = [
    { id: 'app-google', company: 'Google', role: 'Software Eng Intern', priority: 'High Priority', status: 'applied', logoClass: 'logo-google', logoLetter: 'G', appliedDate: getRelativeDateStr(3), followUp3Done: false, followUp7Done: false },
    { id: 'app-meta', company: 'Meta', role: 'Product Manager Intern', priority: 'Medium', status: 'applied', logoClass: 'logo-meta', logoLetter: 'M', appliedDate: getRelativeDateStr(7), followUp3Done: false, followUp7Done: false },
    { id: 'app-stripe', company: 'Stripe', role: 'Backend Engineer', priority: 'High Priority', status: 'applied', logoClass: 'logo-stripe', logoLetter: 'S', appliedDate: getRelativeDateStr(0), followUp3Done: false, followUp7Done: false },
    { id: 'app-netflix', company: 'Netflix', role: 'UI/UX Engineer', priority: 'Technical Round', status: 'interviewing', logoClass: 'logo-netflix', logoLetter: 'N', appliedDate: getRelativeDateStr(10), responseDate: getRelativeDateStr(8) },
    { id: 'app-airbnb', company: 'Airbnb', role: 'Frontend Developer', priority: 'Behavioral Round', status: 'interviewing', logoClass: 'logo-airbnb', logoLetter: 'A', appliedDate: getRelativeDateStr(12), responseDate: getRelativeDateStr(10) },
    { id: 'app-vercel', company: 'Vercel', role: 'Next.js Dev Intern', priority: 'Active Offer', status: 'offer', logoClass: 'logo-vercel', logoLetter: '▲', appliedDate: getRelativeDateStr(15), responseDate: getRelativeDateStr(12) }
  ];

  const patchApps = (apps) => {
    if (!Array.isArray(apps)) return [];
    return apps.map(app => {
      if (app.status === 'applied' && !app.appliedDate) {
        return {
          ...app,
          appliedDate: new Date().toISOString().split('T')[0],
          followUp3Done: !!app.followUp3Done,
          followUp7Done: !!app.followUp7Done
        };
      }
      return app;
    });
  };

  // Initialize from localStorage cache for instant load (Firestore will sync over it)
  const [applications, setApplications] = useState(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      const userKey = savedUser ? JSON.parse(savedUser).uid : null;
      if (userKey) {
        const cached = localStorage.getItem(`applications_${userKey}`);
        if (cached) return patchApps(JSON.parse(cached));
      }
    } catch { /* ignored */ }
    return DEFAULT_APPS;
  });

  // Track whether we are the source of the latest write to avoid re-render loops
  const firestoreWritePending = useRef(false);
  const saveDebounceTimer = useRef(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'

  // ── Firestore real-time listener ──────────────────────────────────────────
  // Subscribes to the user's Firestore document and keeps local state in sync.
  // On first login with no cloud data, seeds Firestore with the local cache.
  useEffect(() => {
    // Sandbox/mock users skip Firestore
    if (!currentUser || currentUser.isMock || !db) return;

    const userDocRef = doc(db, 'users', currentUser.uid, 'tracker', 'applications');

    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (firestoreWritePending.current) {
        // We just wrote — ignore this echo update to avoid loop
        firestoreWritePending.current = false;
        return;
      }

      if (snapshot.exists()) {
        const cloudApps = snapshot.data().apps || [];
        const patchedApps = patchApps(cloudApps);
        setApplications(patchedApps);
        // Keep localStorage cache fresh
        try {
          localStorage.setItem(`applications_${currentUser.uid}`, JSON.stringify(patchedApps));
        } catch { /* ignored */ }
      } else {
        // No cloud document yet — seed Firestore with current local data
        const localCached = localStorage.getItem(`applications_${currentUser.uid}`);
        const seedData = localCached ? patchApps(JSON.parse(localCached)) : DEFAULT_APPS;
        firestoreWritePending.current = true;
        setDoc(userDocRef, { apps: seedData, updatedAt: serverTimestamp() })
          .then(() => setCloudSyncStatus('saved'))
          .catch(() => setCloudSyncStatus('error'));
        setApplications(seedData);
      }
    }, (err) => {
      console.warn('Firestore snapshot error (offline?):', err.message);
      setCloudSyncStatus('error');
    });

    return () => unsubscribe();
  }, [currentUser?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Firestore real-time listener for decentralized subcollection sync ─────
  useEffect(() => {
    // Sandbox/mock users skip Firestore
    if (!currentUser || currentUser.isMock || !db) return;

    const appsSubCollectionRef = collection(db, 'users', currentUser.uid, 'applications');

    const unsubscribe = onSnapshot(appsSubCollectionRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const docData = change.doc.data();
          const docId = change.doc.id;

          const company = docData.company?.stringValue || docData.company || '';
          const title = docData.title?.stringValue || docData.title || '';
          const stage = docData.stage?.stringValue || docData.stage || 'Applied';
          const updatedAt = docData.updatedAt ? new Date(docData.updatedAt).toISOString() : new Date().toISOString();

          if (!company) return;

          setApplications(prev => {
            // Check if card with this company already exists (case-insensitive) or has this docId
            const existsIndex = prev.findIndex(app => app.id === docId || app.company.toLowerCase() === company.toLowerCase());

            // Map stage from "Applied"/"Interviewing"/"Offer Received" to kanban status "applied"/"interviewing"/"offer"
            let status = 'applied';
            let priority = 'High Priority';
            if (stage === 'Interviewing' || stage === 'interviewing') {
              status = 'interviewing';
              priority = 'Technical Round';
            } else if (stage === 'Offer Received' || stage === 'Offer' || stage === 'offer') {
              status = 'offer';
              priority = 'Active Offer';
            }

            if (existsIndex >= 0) {
              const existingApp = prev[existsIndex];
              // Only update if stage or role changed
              if (existingApp.status !== status || existingApp.role !== title) {
                const updated = [...prev];
                updated[existsIndex] = {
                  ...existingApp,
                  role: title || existingApp.role,
                  status: status,
                  priority: status === 'offer' ? 'Active Offer' : existingApp.priority,
                  animateTrigger: true // Trigger animation!
                };
                return updated;
              }
              return prev;
            } else {
              // Add new application
              const newApp = {
                id: docId,
                company: company,
                role: title || 'Synced App',
                status: status,
                priority: priority,
                logoLetter: company.charAt(0).toUpperCase(),
                customBg: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                appliedDate: new Date(updatedAt).toISOString().split('T')[0],
                followUp3Done: false,
                followUp7Done: false,
                animateTrigger: true // Trigger animation!
              };
              return [...prev, newApp];
            }
          });
        }
      });
    }, (err) => {
      console.warn('Firestore subcollection listener error:', err.message);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // ── Debounced save to Firestore + localStorage ────────────────────────────
  // Fires 1.5s after the last change to avoid hammering Firestore on rapid updates.
  useEffect(() => {
    if (!currentUser || currentUser.isMock || !db) {
      // Sandbox: localStorage only
      if (currentUser?.isMock) {
        try {
          localStorage.setItem(`applications_${currentUser.uid}`, JSON.stringify(applications));
        } catch { /* ignored */ }
      }
      return;
    }

    // Always update localStorage cache immediately
    try {
      localStorage.setItem(`applications_${currentUser.uid}`, JSON.stringify(applications));
    } catch { /* ignored */ }

    // Debounce Firestore writes
    setCloudSyncStatus('saving');
    clearTimeout(saveDebounceTimer.current);
    saveDebounceTimer.current = setTimeout(async () => {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid, 'tracker', 'applications');
        firestoreWritePending.current = true;
        await setDoc(userDocRef, { apps: applications, updatedAt: serverTimestamp() });
        setCloudSyncStatus('saved');
      } catch (err) {
        console.warn('Firestore save failed (offline?):', err.message);
        setCloudSyncStatus('error');
        // Data is still safe in localStorage
      }
    }, 1500);

    return () => clearTimeout(saveDebounceTimer.current);
  }, [applications]); // eslint-disable-line react-hooks/exhaustive-deps

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
        const extraFields = {};
        if (targetStatus === 'applied') {
          extraFields.appliedDate = new Date().toISOString().split('T')[0];
          extraFields.followUp3Done = false;
          extraFields.followUp7Done = false;
        } else if (targetStatus === 'interviewing' || targetStatus === 'offer') {
          extraFields.responseDate = new Date().toISOString().split('T')[0];
        }
        return { ...app, status: targetStatus, priority: updatedPriority, ...extraFields };
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
      'linear-gradient(135deg, #2C92C9, #1e78a6)'
    ];
    const customBg = colors[Math.floor(Math.random() * colors.length)];

    const newCardObj = {
      id: newId,
      company: newCompany.trim(),
      role: newRole.trim(),
      priority: newStatus === 'offer' ? 'Active Offer' : newPriority,
      status: newStatus,
      logoLetter: newCompany.trim().charAt(0).toUpperCase(),
      customBg: customBg,
      appliedDate: newStatus === 'applied' ? new Date().toISOString().split('T')[0] : null,
      followUp3Done: false,
      followUp7Done: false
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
  // COLD EMAIL OUTREACH STATE & ANIMATION
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
  // AI RESUME ATS MATCHER STATE & ANALYZER
  // ==========================================
  const [resumeText, setResumeText] = useState(
    `Savit - CS Student at Top University\nTechnical Skills: JavaScript, React, Next.js, Node.js, Express, Postgres, MongoDB, RESTful APIs, Git, Docker, HTML5, Vanilla CSS, Tailwind, Responsive Web Design, Unit Testing, Agile methodologies.\nProjects: Built an e-commerce platform and an open-source collaborative task manager using Vite and WebSocket.`
  );

  const [jdText, setJdText] = useState(
    `Software Engineer Intern - Frontend & Backend\nRequirements:\n- Proficient in JavaScript/TypeScript\n- Deep understanding of modern React / Next.js\n- Experience building RESTful APIs using Node/Express\n- Strong CSS foundation and Responsive Design layouts\n- Knowledge of relational and non-relational databases`
  );

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

    // Removed unused matchScore setter

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
      borderColor: 'rgba(44, 146, 201, 0.3)',
      background: 'rgba(44, 146, 201, 0.1)'
    };
  };

  // ==========================================
  // INTERVIEW CALENDAR & AGENDAS
  // ==========================================
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());
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
      { title: 'Airbnb UI review callback', time: '1:30 PM', done: false }
    ]
  });

  const getDayEvents = (dayNum) => {
    const autoTasks = [];
    applications.forEach(app => {
      if (app.status === 'applied' && app.appliedDate) {
        const [year, month, day] = app.appliedDate.split('-').map(Number);
        const appliedDateObj = new Date(year, month - 1, day);
        const calendarDate = new Date(2026, 5, dayNum); // June 2026
        const diffTime = calendarDate.getTime() - appliedDateObj.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 3) {
          autoTasks.push({
            title: `Send follow-up email to ${app.company} (3 days after applying)`,
            time: '9:00 AM',
            done: !!app.followUp3Done,
            isAutoGenerated: true,
            appId: app.id,
            type: 'followUp3Done'
          });
        } else if (diffDays === 7) {
          autoTasks.push({
            title: `Send follow-up email to ${app.company} (7 days after applying)`,
            time: '9:00 AM',
            done: !!app.followUp7Done,
            isAutoGenerated: true,
            appId: app.id,
            type: 'followUp7Done'
          });
        }
      }
    });

    const manualTasks = agendaDatabase[dayNum] || [];
    return [...autoTasks, ...manualTasks];
  };

  const combinedAgendaDatabase = {};
  for (let d = 1; d <= 30; d++) {
    const events = getDayEvents(d);
    if (events.length > 0) {
      combinedAgendaDatabase[d] = events;
    }
  }

  const currentTasks = combinedAgendaDatabase[selectedDay] || [];
  const remainingTasksCount = currentTasks.filter(t => !t.done).length;

  const handleToggleTask = (task) => {
    if (task && task.isAutoGenerated) {
      setApplications(prev => prev.map(app => {
        if (app.id === task.appId) {
          return { ...app, [task.type]: !task.done };
        }
        return app;
      }));
    } else {
      setAgendaDatabase(prev => {
        const dayTasks = prev[selectedDay] ? [...prev[selectedDay]] : [];
        const updatedTasks = dayTasks.map(t => {
          if (t.title === task.title && t.time === task.time) {
            return { ...t, done: !t.done };
          }
          return t;
        });
        return { ...prev, [selectedDay]: updatedTasks };
      });
    }
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

  // Terminal Simulator Logger Effect for Landing Page
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
        if (intervalId) clearInterval(intervalId);
      }
    };

    typeNextLine();
    intervalId = setInterval(typeNextLine, 500);
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [envMode]);

  return (
    <div>
      {/* Background canvas and nebulas */}
      <canvas id="space-starfield" ref={canvasRef}></canvas>
      <div className="nebula nebula-cyan"></div>
      <div className="nebula nebula-purple"></div>
      <div className="nebula nebula-blue"></div>

      {/* Main Header */}
      <header className="main-header" id="site-header">
        <div className="header-container">
          <Link to="/" className="logo-area" id="header-logo-link" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="CareerFly Logo" style={{ height: '52px', objectFit: 'contain' }} />
            <span className="logo-text">CareerFly</span>
          </Link>

          <nav className="nav-menu" id="header-nav-menu">
            {showDashboard ? (
              <>
                <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} style={{ textDecoration: 'none' }}>Manage Internship</Link>
                <Link to="/outreach" className={`nav-link ${location.pathname === '/outreach' ? 'active' : ''}`} style={{ textDecoration: 'none' }}>AI Outreach</Link>
                <Link to="/resume" className={`nav-link ${location.pathname === '/resume' ? 'active' : ''}`} style={{ textDecoration: 'none' }}>Resume Analyzer</Link>
                <Link to="/interview" className={`nav-link ${location.pathname === '/interview' ? 'active' : ''}`} style={{ textDecoration: 'none' }}>AI Interview</Link>
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
                <Link
                  to="/"
                  className="btn btn-secondary btn-header"
                  style={{ textDecoration: 'none' }}
                  onClick={() => setShowDashboard(false)}
                >
                  Back to Website
                </Link>
                {currentUser && (
                  <span className="user-display-email" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {currentUser.isMock && <span style={{ color: 'var(--neon-gold)', marginRight: '4px' }}>[Sandbox]</span>}
                    {currentUser.email}
                    {/* Cloud sync status indicator */}
                    {!currentUser.isMock && db && (
                      <span
                        title={
                          cloudSyncStatus === 'saving' ? 'Saving to cloud...' :
                            cloudSyncStatus === 'saved' ? 'Synced to cloud ✓' :
                              cloudSyncStatus === 'error' ? 'Cloud sync failed (data saved locally)' :
                                'Cloud sync ready'
                        }
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '10px',
                          padding: '2px 7px',
                          borderRadius: '20px',
                          fontWeight: 600,
                          letterSpacing: '0.03em',
                          transition: 'all 0.4s ease',
                          background:
                            cloudSyncStatus === 'saving' ? 'rgba(251,191,36,0.15)' :
                              cloudSyncStatus === 'saved' ? 'rgba(0,255,135,0.12)' :
                                cloudSyncStatus === 'error' ? 'rgba(255,80,80,0.12)' :
                                  'rgba(255,255,255,0.05)',
                          color:
                            cloudSyncStatus === 'saving' ? '#fbbf24' :
                              cloudSyncStatus === 'saved' ? 'var(--neon-success)' :
                                cloudSyncStatus === 'error' ? '#ff5050' :
                                  'rgba(255,255,255,0.3)',
                          border: `1px solid ${cloudSyncStatus === 'saving' ? 'rgba(251,191,36,0.3)' :
                            cloudSyncStatus === 'saved' ? 'rgba(0,255,135,0.25)' :
                              cloudSyncStatus === 'error' ? 'rgba(255,80,80,0.3)' :
                                'rgba(255,255,255,0.08)'
                            }`
                        }}
                      >
                        {cloudSyncStatus === 'saving' ? '↻ Saving' :
                          cloudSyncStatus === 'saved' ? '☁ Saved' :
                            cloudSyncStatus === 'error' ? '⚠ Offline' :
                              '☁ Ready'}
                      </span>
                    )}
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
                    <Link
                      to="/login"
                      className="btn btn-secondary btn-header"
                      id="btn-login-header"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <LogIn size={14} /> Login
                    </Link>
                    <button
                      className="btn btn-primary btn-header btn-glow"
                      onClick={() => {
                        handleLaunchSandbox();
                      }}
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
        <Routes>
          <Route path="/interview" element={
            currentUser ? (
              <AIInterviewPage currentUser={currentUser} isFirebaseMock={isFirebaseMock} />
            ) : <Navigate to="/login?redirect=/interview" replace />
          } />

          <Route path="/outreach" element={
            currentUser ? (
              <OutreachPage
                recruiterName={recruiterName}
                setRecruiterName={setRecruiterName}
                recruiterCompany={recruiterCompany}
                setRecruiterCompany={setRecruiterCompany}
                outreachRole={outreachRole}
                setOutreachRole={setOutreachRole}
                outreachTone={outreachTone}
                setOutreachTone={setOutreachTone}
                isTyping={isTyping}
                handleGenerateOutreach={handleGenerateOutreach}
                emailSubject={emailSubject}
                copiedState={copiedState}
                handleCopyOutreach={handleCopyOutreach}
                emailBodyDisplay={emailBodyDisplay}
                applications={applications}
              />
            ) : <Navigate to="/login?redirect=/outreach" replace />
          } />

          <Route path="/resume" element={
            currentUser ? (
              <ResumePage
                scoreAnimationVal={scoreAnimationVal}
                dashoffsetVal={dashoffsetVal}
                getMatchStatusStyle={getMatchStatusStyle}
                getMatchStatusText={getMatchStatusText}
                resumeText={resumeText}
                setResumeText={setResumeText}
                jdText={jdText}
                setJdText={setJdText}
                handleAnalyzeResume={handleAnalyzeResume}
                isAnalyzing={isAnalyzing}
              />
            ) : <Navigate to="/login?redirect=/resume" replace />
          } />



          <Route path="/login" element={
            <LoginPage
              currentUser={currentUser}
              handleAuthSubmit={handleAuthSubmit}
              handleGoogleSignIn={handleGoogleSignIn}
              handleLaunchSandbox={handleLaunchSandbox}
              authEmail={authEmail}
              setAuthEmail={setAuthEmail}
              authPassword={authPassword}
              setAuthPassword={setAuthPassword}
              authError={authError}
              setAuthError={setAuthError}
              authLoading={authLoading}
            />
          } />

          <Route path="/" element={
            showDashboard ? (
              <TrackerPage
                applications={applications}
                appliedApps={appliedApps}
                interviewingApps={interviewingApps}
                offerApps={offerApps}
                totalAppsCount={totalAppsCount}
                successRate={successRate}
                progressPercent={progressPercent}
                gmailToken={gmailToken}
                currentUser={currentUser}
                gmailSyncing={gmailSyncing}
                setApplications={setApplications}
                setGmailToken={setGmailToken}
                setGmailSyncing={setGmailSyncing}
                setShowAddModal={setShowAddModal}
                showAddModal={showAddModal}
                newCompany={newCompany}
                setNewCompany={setNewCompany}
                newRole={newRole}
                setNewRole={setNewRole}
                newPriority={newPriority}
                setNewPriority={setNewPriority}
                newStatus={newStatus}
                setNewStatus={setNewStatus}
                handleAddApplication={handleAddApplication}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleDragStart={handleDragStart}
                handleMoveItem={handleMoveItem}
                getTagClass={getTagClass}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                remainingTasksCount={remainingTasksCount}
                daysInJune={daysInJune}
                agendaDatabase={combinedAgendaDatabase}
                currentTasks={currentTasks}
                handleToggleTask={handleToggleTask}
                quickTaskText={quickTaskText}
                setQuickTaskText={setQuickTaskText}
                handleQuickAddTask={handleQuickAddTask}
              />
            ) : (
              <LandingPage
                currentUser={currentUser}
                handleLaunchSandbox={handleLaunchSandbox}
                handleLogout={handleLogout}
                envMode={envMode}
                setEnvMode={setEnvMode}
                terminalLogs={terminalLogs}
                setShowDashboard={setShowDashboard}
              />
            )
          } />
        </Routes>
      </main>

      {/* FOOTER */}
      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-left">
            <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo.png" alt="CareerFly Logo" style={{ height: '70px', objectFit: 'contain' }} />
              <span>CareerFly</span>
            </div>
            <p className="footer-copyright">
              © 2026 CareerFly SaaS. Engineered for Google DeepMind Coding Challenge. All rights reserved.
            </p>
          </div>

          <div className="footer-right">
            <div className="footer-links-group">
              <Link to="/" className="footer-link">Tracker</Link>
              <Link to="/outreach" className="footer-link">Outreach</Link>
              <Link to="/resume" className="footer-link">ATS Scanner</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
