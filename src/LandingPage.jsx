import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Video,
  Calendar,
  PlayCircle,
  Headphones,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Play,
  Globe,
  Award,
  Users,
  Cpu,
  Mail
} from 'lucide-react';
import './LandingPage.css';

// ---- Mini Mockup Components (self-contained in LandingPage) ----
function MiniKanbanMockup() {
  const [mockCards, setMockCards] = useState([
    { id: 1, company: 'Google', role: 'SWE Intern', status: 'applied', tag: 'High Priority', tagClass: 'tag-high' },
    { id: 2, company: 'Stripe', role: 'Backend Eng', status: 'interviewing', tag: 'Technical Round', tagClass: 'tag-tech' },
    { id: 3, company: 'Vercel', role: 'Frontend Intern', status: 'offer', tag: 'Active Offer', tagClass: 'tag-success' },
  ]);

  const moveCard = (id) => {
    setMockCards(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'applied' ? 'interviewing' : (c.status === 'interviewing' ? 'offer' : 'applied');
        const nextTag = nextStatus === 'applied' ? 'High Priority' : (nextStatus === 'interviewing' ? 'Technical Round' : 'Active Offer');
        const nextTagClass = nextStatus === 'applied' ? 'tag-high' : (nextStatus === 'interviewing' ? 'tag-tech' : 'tag-success');
        return { ...c, status: nextStatus, tag: nextTag, tagClass: nextTagClass };
      }
      return c;
    }));
  };

  return (
    <div className="mini-kanban-board" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '16px', background: '#0a0a1a' }}>
      {['applied', 'interviewing', 'offer'].map(col => (
        <div key={col} className="mini-kanban-column" style={{ background: '#111129', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px', minHeight: '140px' }}>
          <h5 style={{ textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontSize: '9px', letterSpacing: '0.05em', marginBottom: '8px', textAlign: 'left' }}>{col}</h5>
          {mockCards.filter(c => c.status === col).map(c => (
            <div key={c.id} className="mini-kanban-card" style={{ background: '#1a1a3a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px', marginBottom: '8px', position: 'relative' }}>
              <div className="mini-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mini-card-company" style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '11px' }}>{c.company}</span>
                <button
                  className="mini-card-btn"
                  onClick={(e) => { e.stopPropagation(); moveCard(c.id); }}
                  title="Move stage"
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#00f0ff', borderRadius: '4px', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                >
                  <ArrowRight size={10} />
                </button>
              </div>
              <div className="mini-card-role" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', display: 'block', marginTop: '2px', textAlign: 'left' }}>{c.role}</div>
              <span className={`mini-card-tag ${c.tagClass}`} style={{
                display: 'inline-block',
                fontSize: '8px',
                fontWeight: 'bold',
                padding: '1px 4px',
                borderRadius: '3px',
                marginTop: '6px',
                textTransform: 'uppercase',
                background: c.status === 'offer' ? 'rgba(0, 255, 135, 0.15)' : (c.status === 'interviewing' ? 'rgba(0, 114, 255, 0.15)' : 'rgba(255, 0, 123, 0.15)'),
                color: c.status === 'offer' ? '#00ff87' : (c.status === 'interviewing' ? '#0072ff' : '#ff007b')
              }}>{c.tag}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function MiniOutreachMockup() {
  const [tone, setTone] = useState('professional');
  const templates = {
    professional: "Dear Hiring Team,\n\nI am writing to express my interest in the Software Engineer Intern position at Stripe. With background in building React SaaS dashboards, I am excited about the opportunity...",
    warm: "Hi Sarah!\n\nI've been following Stripe's engineering culture and love how developer-first you guys are. I'd love to connect and learn about potential internship roles...",
    concise: "Hi Sarah,\n\nQuick query: Do you have openings for SWE Interns this summer? Specialized in React/Node. Portfolio: portfolio.com. Let me know if you have 5 mins to chat.\n\nBest,\nSavit"
  };

  return (
    <div className="mini-outreach" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
      <div className="mini-outreach-tones" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {['professional', 'warm', 'concise'].map(t => (
          <button
            key={t}
            className={`mini-tone-btn ${tone === t ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setTone(t); }}
            style={{
              background: tone === t ? '#2C92C9' : '#f1f5f9',
              color: tone === t ? '#ffffff' : '#475569',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease'
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mini-outreach-preview" style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '11px',
        lineHeight: '1.5',
        color: '#334155',
        textAlign: 'left',
        whiteSpace: 'pre-wrap',
        minHeight: '80px'
      }}>
        {templates[tone]}
      </div>
    </div>
  );
}
// ---- End Mini Mockup Components ----

export default function LandingPage({
  currentUser,
  handleLaunchSandbox,
  handleLogout,
  setShowDashboard
}) {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    if (setShowDashboard) {
      setShowDashboard(true);
    }
    navigate('/');
  };

  // Add body class on mount and remove on unmount
  useEffect(() => {
    document.body.classList.add('landing-page-active');
    return () => {
      document.body.classList.remove('landing-page-active');
    };
  }, []);

  // Testimonials database
  const testimonials = [
    {
      text: "“CareerFly completely transformed my summer search. The Google Apps Script synchronization parsed confirmation emails in real-time, letting me track 40+ positions without manual entry.”",
      name: "Helen Jamey",
      title: "UI/UX Student",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80"
    },
    {
      text: "“The Edge-AI Resume Matching calculates compatibility vectors locally. It's incredibly secure, doesn't leak my resume details to random servers, and the suggestions are spot on.”",
      name: "Ralph Edwards",
      title: "SWE Student",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80"
    },
    {
      text: "“I practiced my Stripe mock interviews using the voice simulator. The feedback caught my filler words and critiqued my structure, helping me land the internship.”",
      name: "Helene Alice",
      title: "Product Intern",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80"
    }
  ];

  // Avatars grid placeholder for "Meet students and teachers" section
  const avatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&h=150&q=80"
  ];

  return (
    <div className="landing-page-root">

      {/* ── HEADER / NAVIGATION ── */}
      <header className="lp-header">
        <div className="lp-nav-container">
          <Link to="/" className="lp-logo" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo_all.png" alt="CareerFly Logo" style={{ height: '78px', objectFit: 'contain' }} />
          </Link>

          <nav className="lp-nav-links">
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#solutions" className="lp-nav-link">Solutions</a>
            <a href="#pricing" className="lp-nav-link">Pricing</a>
            <a href="#resources" className="lp-nav-link">Resources</a>
          </nav>

          <div className="lp-nav-actions">
            {currentUser ? (
              <>
                <button 
                  onClick={handleGoToDashboard} 
                  className="lp-btn-primary"
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  Dashboard <ArrowRight size={16} />
                </button>
                <button 
                  onClick={handleLogout} 
                  className="lp-btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="lp-btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>Login</Link>
                <Link to="/login?tab=signup" className="lp-btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>Register</Link>
                <button 
                  onClick={() => {
                    handleLaunchSandbox();
                    navigate('/');
                  }} 
                  className="lp-btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '14px', border: '1px dashed var(--neon-gold)', color: 'var(--neon-gold)' }}
                >
                  Launch Sandbox
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="lp-hero-section">
        <div className="lp-hero-content">
          <div className="lp-hero-announcement">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2C92C9', display: 'inline-block' }}></span>
            Now in Sandbox Sandbox-V2
          </div>

          <h1 className="lp-hero-title">
            <span className="lp-scribble-wrapper">
              Track
              <span className="lp-scribble-line"></span>
            </span> internships worldwide
          </h1>

          <p className="lp-hero-desc">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Elementum dictum egestas tempor suspendisse viverra vel. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>

          <div className="lp-hero-actions">
            {currentUser ? (
              <button
                onClick={handleGoToDashboard}
                className="lp-btn-primary"
              >
                Go to Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    handleLaunchSandbox();
                    navigate('/');
                  }}
                  className="lp-btn-primary"
                >
                  Launch Sandbox Workspace <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="lp-btn-secondary"
                >
                  View demo <PlayCircle size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hero Overlapping Images */}
        <div className="lp-hero-images-container">
          <div className="lp-teacher-blob-wrapper">
            <img src="/Teacher.png" alt="Teacher background yellow" className="lp-teacher-img" />
          </div>

          <div className="lp-student-blob-wrapper">
            <img src="/Student.png" alt="Student background orange" className="lp-student-img" />
          </div>

          {/* Floating Badges */}
          <div className="lp-badge-floating lp-badge-1">
            <Video size={16} />
            <span>Gmail Sync</span>
          </div>

          <div className="lp-badge-floating lp-badge-2">
            <Calendar size={16} />
            <span>3D Kanban Board</span>
          </div>

          <div className="lp-badge-floating lp-badge-3">
            <PlayCircle size={16} />
            <span>Local ATS Scanner</span>
          </div>

          <div className="lp-badge-floating lp-badge-4">
            <Headphones size={16} />
            <span>Mock Interviews</span>
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY SECTION ── */}
      <section className="lp-trusted-section">
        <div className="lp-trusted-text">
          Trusted by<br />
          300+ Students
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <img src="/Press.png" alt="Trusted partners logos" className="lp-trusted-logos-img" />
        </div>
      </section>

      {/* ── ALL THE TOOLS THAT YOU NEED ── */}
      <section className="lp-section lp-section-bg-light" id="features">
        <div className="lp-section-container">
          <div className="lp-section-header">
            <h2 className="lp-section-title">
              All the
              <span className="lp-scribble-wrapper" style={{ marginLeft: 8 }}>
                tools
                <span className="lp-scribble-line"></span>
              </span> that you need
            </h2>
            <p className="lp-section-subtitle">
              Track, apply, audit, and prep with zero-cost automation. Drag and drop cards below to try out our anti-gravity internship tracker directly in this preview mockup!
            </p>
          </div>

          {/* Interactive Screenshot Mockup */}
          <div className="lp-mockup-wrapper">
            <div className="lp-mockup-window">
              <div className="lp-mockup-header-bar">
                <div className="lp-mockup-dot lp-mockup-dot-red"></div>
                <div className="lp-mockup-dot lp-mockup-dot-yellow"></div>
                <div className="lp-mockup-dot lp-mockup-dot-green"></div>
                <div className="lp-mockup-window-title">careerfly-saas-dashboard.html</div>
              </div>
              <MiniKanbanMockup />
            </div>
          </div>

          {/* App Integrations */}
          <div className="lp-mockup-integrations">
            <img src="/icons.svg" alt="App integrations logos" className="lp-integrations-img" />
          </div>
        </div>
      </section>

      {/* ── AN ALL-IN-ONE APP ── */}
      <section className="lp-section" id="solutions">
        <div className="lp-section-container lp-two-cols">
          <div className="lp-col-content">
            <h2 className="lp-col-title">
              An
              <span className="lp-scribble-wrapper" style={{ margin: '0 8px' }}>
                all-in-one
                <span className="lp-scribble-line"></span>
              </span> app that makes it easier
            </h2>

            <div className="lp-features-list">
              <div className="lp-feature-item">
                <div className="lp-feature-check">✓</div>
                <div className="lp-feature-text">
                  <strong>Find opportunities dynamically:</strong> Query resume fits locally inside your browser sandbox.
                </div>
              </div>
              <div className="lp-feature-item">
                <div className="lp-feature-check">✓</div>
                <div className="lp-feature-text">
                  <strong>Schedule interviews & track lists:</strong> Day-by-day task checking, automatic follow-up timing.
                </div>
              </div>
              <div className="lp-feature-item">
                <div className="lp-feature-check">✓</div>
                <div className="lp-feature-text">
                  <strong>Get smart feedback:</strong> Practice sessions evaluated securely with generative AI.
                </div>
              </div>
            </div>

            <a href="#features" className="lp-link-arrow">
              Find out more <ArrowRight size={16} />
            </a>
          </div>

          {/* Mock Video Frame */}
          <div className="lp-video-mockup">
            <div className="lp-video-bg-gradient"></div>
            <div className="lp-video-play-btn">
              <Play size={24} style={{ transform: 'translateX(2px)' }} />
            </div>

            {/* Overlapping Mockup Tags */}
            <div className="lp-video-overlay-card lp-video-card-1">
              Personal Sync
            </div>
            <div className="lp-video-overlay-card lp-video-card-2">
              Edge-AI Sandbox
            </div>
            <div className="lp-video-overlay-card lp-video-card-3">
              Fast API Voice
            </div>
          </div>
        </div>
      </section>

      {/* ── MEET PEERS & MENTORS ── */}
      <section className="lp-section lp-section-bg-light">
        <div className="lp-section-container lp-two-cols" style={{ direction: 'rtl' }}>
          {/* Content (RTL to reverse order, but alignment is normal) */}
          <div className="lp-col-content" style={{ direction: 'ltr' }}>
            <h2 className="lp-col-title">
              Meet successful peers &amp; industry mentors
            </h2>
            <p className="lp-hero-desc" style={{ marginBottom: 30 }}>
              Connect with developers, peers, and mentors across universities worldwide. Share customized Google Apps Script triggers, review cover letter templates, and mock interview with experts.
            </p>
            <a href="#features" className="lp-link-arrow" style={{ fontSize: 14 }}>
              Product features and options <ChevronDown size={14} />
            </a>
          </div>

          {/* Avatar Grid (LTR) */}
          <div className="lp-avatar-grid" style={{ direction: 'ltr' }}>
            {avatars.map((url, i) => (
              <div key={i} className="lp-avatar-card">
                <div className="lp-avatar-img-placeholder" style={{ backgroundImage: `url(${url})` }}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATISTICS BANNER ── */}
      <section className="lp-stats-banner">
        <div className="lp-stats-container">
          <div className="lp-stat-item">
            <div className="lp-stat-icon-wrapper">
              <Globe size={24} />
            </div>
            <div className="lp-stat-info">
              <div className="lp-stat-number">195+</div>
              <div className="lp-stat-label">universities</div>
            </div>
          </div>

          <div className="lp-stat-item">
            <div className="lp-stat-icon-wrapper">
              <Award size={24} />
            </div>
            <div className="lp-stat-info">
              <div className="lp-stat-number">1M+</div>
              <div className="lp-stat-label">applications synced</div>
            </div>
          </div>

          <div className="lp-stat-item">
            <div className="lp-stat-icon-wrapper">
              <Users size={24} />
            </div>
            <div className="lp-stat-info">
              <div className="lp-stat-number">15K+</div>
              <div className="lp-stat-label">successful offers</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT EVERYONE SAYS (TESTIMONIALS) ── */}
      <section className="lp-section">
        <div className="lp-section-container">
          <div className="lp-testimonials-header">
            <h2 className="lp-testimonials-title">What everyone says</h2>
            <div className="lp-testimonials-nav">
              <button className="lp-testimonials-nav-btn" aria-label="Previous testimonial"><ChevronLeft size={20} /></button>
              <button className="lp-testimonials-nav-btn" aria-label="Next testimonial"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="lp-testimonials-grid">
            {testimonials.map((t, idx) => (
              <div key={idx} className="lp-testimonial-card">
                <p className="lp-testimonial-text">{t.text}</p>
                <div className="lp-testimonial-author">
                  <div className="lp-author-avatar" style={{ backgroundImage: `url(${t.avatar})` }}></div>
                  <div className="lp-author-info">
                    <span className="lp-author-name">{t.name}</span>
                    <span className="lp-author-title">{t.title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ALL THE COOL FEATURES ── */}
      <section className="lp-section lp-section-bg-light">
        <div className="lp-section-container lp-two-cols">
          <div className="lp-col-content">
            <h2 className="lp-col-title">
              All the cool
              <span className="lp-scribble-wrapper" style={{ marginLeft: 8 }}>
                features
                <span className="lp-scribble-line"></span>
              </span>
            </h2>
            <p className="lp-hero-desc" style={{ marginBottom: 30 }}>
              Tailor Cold Outreach letters in seconds with our customizable templates. Switch tones instantly to craft professional follow-ups or concise connection requests.
            </p>
            <a href="#features" className="lp-link-arrow">
              See all features <ArrowRight size={16} />
            </a>
          </div>

          <div className="lp-features-col-right">
            <div className="lp-feature-card-main">
              <div className="lp-feature-card-header">
                <h4>Design for how you work</h4>
                <p>Customize components and outreach emails to match recruiter profiles.</p>
              </div>
              <div className="lp-feature-card-body">
                <MiniOutreachMockup />
              </div>
            </div>

            {/* Floating details cards */}
            <div className="lp-features-floating-card lp-features-fc-1" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={14} style={{ color: '#2C92C9' }} />
              <span style={{ fontSize: 11, fontWeight: 'bold' }}>Edge-AI Vector Search</span>
            </div>
            <div className="lp-features-floating-card lp-features-fc-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14} style={{ color: '#0d9488' }} />
              <span style={{ fontSize: 11, fontWeight: 'bold' }}>Hourly Email Sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── JOIN A WORLD OF LEARNING CTA ── */}
      <section className="lp-cta-section">
        <div className="lp-cta-box">
          {/* Floating background avatars */}
          <div className="lp-cta-avatar lp-cta-av-1" style={{ backgroundImage: `url(${avatars[0]})` }}></div>
          <div className="lp-cta-avatar lp-cta-av-2" style={{ backgroundImage: `url(${avatars[1]})` }}></div>
          <div className="lp-cta-avatar lp-cta-av-3" style={{ backgroundImage: `url(${avatars[2]})` }}></div>
          <div className="lp-cta-avatar lp-cta-av-4" style={{ backgroundImage: `url(${avatars[3]})` }}></div>
          <div className="lp-cta-avatar lp-cta-av-5" style={{ backgroundImage: `url(${avatars[4]})` }}></div>

          <div className="lp-cta-content">
            <h2 className="lp-cta-title">Accelerate your internship search</h2>
            <p className="lp-cta-desc">
              Organize your summer schedules, optimize your resume ATS compatibility, and simulate voice interviews with a zero-setup local client sandbox.
            </p>
            {currentUser ? (
              <button
                onClick={handleGoToDashboard}
                className="lp-btn-primary"
                style={{ padding: '16px 36px', fontSize: 16, background: '#2C92C9', color: '#fff' }}
              >
                Enter Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/login?tab=signup')}
                className="lp-btn-primary"
                style={{ padding: '16px 36px', fontSize: 16, background: '#2C92C9', color: '#fff' }}
              >
                Sign Up Free
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-container">
          <div className="lp-footer-logo-col">
            <div className="lp-footer-logo" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <img src="/logo_all.png" alt="CareerFly Logo" style={{ height: '56px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            </div>
            <p className="lp-footer-desc">
              Next-generation AI student dashboards. Built on local WASM vector scoring and user-owned script endpoints for 100% cloud privacy.
            </p>
            <div className="lp-footer-socials">
              <a href="#" className="lp-footer-social-icon">F</a>
              <a href="#" className="lp-footer-social-icon">T</a>
              <a href="#" className="lp-footer-social-icon">I</a>
              <a href="#" className="lp-footer-social-icon">L</a>
            </div>
          </div>

          <div>
            <h5 className="lp-footer-col-title">Product</h5>
            <ul className="lp-footer-links">
              <li><a href="#features" className="lp-footer-link">Features</a></li>
              <li><a href="#solutions" className="lp-footer-link">Pricing</a></li>
              <li><a href="/" className="lp-footer-link">Workspace</a></li>
              <li><a href="/interview" className="lp-footer-link">AI Interview</a></li>
            </ul>
          </div>

          <div>
            <h5 className="lp-footer-col-title">Features</h5>
            <ul className="lp-footer-links">
              <li><a href="/resume" className="lp-footer-link">ATS Resume</a></li>
              <li><a href="/outreach" className="lp-footer-link">Outreach</a></li>
              <li><a href="/" className="lp-footer-link">Kanban board</a></li>
              <li><a href="/login" className="lp-footer-link">Sync OAuth</a></li>
            </ul>
          </div>

          <div>
            <h5 className="lp-footer-col-title">Resources</h5>
            <ul className="lp-footer-links">
              <li><a href="#" className="lp-footer-link">Guide docs</a></li>
              <li><a href="#" className="lp-footer-link">Blog</a></li>
              <li><a href="#" className="lp-footer-link">WASM models</a></li>
              <li><a href="#" className="lp-footer-link">Apps Script</a></li>
            </ul>
          </div>

          <div>
            <h5 className="lp-footer-col-title">Support</h5>
            <ul className="lp-footer-links">
              <li><a href="#" className="lp-footer-link">Contact</a></li>
              <li><a href="#" className="lp-footer-link">Security rules</a></li>
              <li><a href="#" className="lp-footer-link">Status page</a></li>
            </ul>
          </div>

          <div>
            <h5 className="lp-footer-col-title">Company</h5>
            <ul className="lp-footer-links">
              <li><a href="#" className="lp-footer-link">About Us</a></li>
              <li><a href="#" className="lp-footer-link">Careers</a></li>
              <li><a href="#" className="lp-footer-link">Terms</a></li>
              <li><a href="#" className="lp-footer-link">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <div>© {new Date().getFullYear()} CareerFly. All rights reserved. Built with Antigravity-v2.</div>
          <div className="lp-footer-bottom-links">
            <a href="#" className="lp-footer-bottom-link">Terms</a>
            <a href="#" className="lp-footer-bottom-link">Privacy</a>
            <a href="#" className="lp-footer-bottom-link">Cookies</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
