import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Kanban, Mail, ShieldCheck, Cpu } from 'lucide-react';

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
    <div className="mini-kanban-board">
      {['applied', 'interviewing', 'offer'].map(col => (
        <div key={col} className="mini-kanban-column">
          <h4 style={{ textTransform: 'uppercase' }}>{col}</h4>
          {mockCards.filter(c => c.status === col).map(c => (
            <div key={c.id} className="mini-kanban-card">
              <div className="mini-card-header">
                <span className="mini-card-company">{c.company}</span>
                <button className="mini-card-btn" onClick={(e) => { e.stopPropagation(); moveCard(c.id); }} title="Move stage">
                  <ArrowRight size={10} />
                </button>
              </div>
              <span className="mini-card-role">{c.role}</span>
              <span className={`mini-card-tag ${c.tagClass}`}>{c.tag}</span>
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
    <div className="mini-outreach">
      <div className="mini-outreach-tones">
        {['professional', 'warm', 'concise'].map(t => (
          <button 
            key={t} 
            className={`mini-tone-btn ${tone === t ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setTone(t); }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="mini-outreach-preview">
        {templates[tone]}
      </div>
    </div>
  );
}
// ---- End Mini Mockup Components ----

export default function LandingPage({
  currentUser,
  handleLaunchSandbox,
  envMode,
  setEnvMode,
  terminalLogs
}) {
  const navigate = useNavigate();

  const handleActionClick = (path) => {
    if (currentUser) {
      navigate(path);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(path)}`);
    }
  };

  // Guard against undefined/null terminalLogs
  const safeLogs = Array.isArray(terminalLogs) ? terminalLogs : [];

  return (
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
            The Ultimate AI-Powered Application &amp; Outreach Dashboard for Students
          </p>
          
          <div className="hero-cta-container">
            {currentUser ? (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button 
                  onClick={() => handleActionClick('/')} 
                  className="btn btn-primary btn-lg btn-glow pulse-animation"
                >
                  Manage Internship <ArrowRight size={20} />
                </button>
                <button 
                  onClick={() => handleActionClick('/interview')} 
                  className="btn btn-secondary btn-lg"
                >
                  AI Mock Interview
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button 
                  className="btn btn-primary btn-lg btn-glow pulse-animation" 
                  id="hero-cta-btn"
                  onClick={() => {
                    handleLaunchSandbox();
                    navigate('/');
                  }}
                >
                  Launch Sandbox Workspace <ArrowRight size={20} />
                </button>
                <button 
                  className="btn btn-secondary btn-lg" 
                  onClick={() => navigate('/login')}
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
        {/* Manage Internship Card */}
        <div className="bento-card col-7" style={{ cursor: 'pointer' }} onClick={() => handleActionClick('/')}>
          <div className="card-border-glow"></div>
          <div className="card-header" style={{ marginBottom: '10px' }}>
            <div className="card-header-left">
              <div className="card-icon-container status-cyan">
                <Kanban size={18} />
              </div>
              <div>
                <h3 className="card-title" style={{ fontSize: '16px' }}>Manage Internship</h3>
                <p className="card-subtitle">Visualize and move applications across stages (Click to enter)</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <MiniKanbanMockup />
          </div>
        </div>

        {/* AI Interview Card */}
        <div className="bento-card col-5" style={{ cursor: 'pointer' }} onClick={() => handleActionClick('/interview')}>
          <div className="card-border-glow"></div>
          <div className="card-header" style={{ marginBottom: '10px' }}>
            <div className="card-header-left">
              <div className="card-icon-container status-purple">
                <Cpu size={18} />
              </div>
              <div>
                <h3 className="card-title" style={{ fontSize: '16px' }}>AI Mock Interview</h3>
                <p className="card-subtitle">Practice live interview sessions evaluated by AI (Click to start)</p>
              </div>
            </div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '140px', padding: '10px' }}>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--neon-purple)', fontWeight: 'bold', fontSize: '12px' }}>Start Mock Interview</span>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Conduct voice/text interview rounds with real-time feedback</p>
            </div>
          </div>
        </div>

        {/* Outreach Card */}
        <div className="bento-card col-7" style={{ cursor: 'pointer' }} onClick={() => handleActionClick('/outreach')}>
          <div className="card-border-glow"></div>
          <div className="card-header" style={{ marginBottom: '10px' }}>
            <div className="card-header-left">
              <div className="card-icon-container status-purple">
                <Mail size={18} />
              </div>
              <div>
                <h3 className="card-title" style={{ fontSize: '16px' }}>AI Recruiter Outreach</h3>
                <p className="card-subtitle">Generate outreach letters matching tones (Click to enter)</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <MiniOutreachMockup />
          </div>
        </div>
      </section>

      <div className="sandbox-highlight-container">
        <div className="sandbox-highlight-card">
          <div className="sandbox-highlight-icon">
            <ShieldCheck size={32} />
          </div>
          <div className="sandbox-highlight-text">
            <h3>Failover Protocol: Sandbox Mock Mode</h3>
            <p>
              CareerFly handles unconfigured environments with an autonomous failover router. If Firebase credentials are not found in the local environment, the client engine automatically redirects authentication states to a localized user profile.
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

      {/* MOCK SHOWCASE CONTROLS */}
      <div className="live-demo-evaluator">
        <div className="evaluator-card">
          <div className="evaluator-header">
            <h3>Interactive SaaS Sandbox Console</h3>
            <p>Switch between client runtime states to mock server connection issues</p>
          </div>
          
          <div className="evaluator-controls">
            <button 
              className={`evaluator-btn ${envMode === 'sandbox' ? 'active' : ''}`}
              onClick={() => setEnvMode('sandbox')}
            >
              Active Local Sandbox Mode
            </button>
            <button 
              className={`evaluator-btn ${envMode === 'production' ? 'active' : ''}`}
              onClick={() => setEnvMode('production')}
            >
              Mock Server Connection Failure
            </button>
          </div>

          <div className="evaluator-terminal">
            <div className="terminal-header">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
              <span className="terminal-title">careerfly-sandbox-v2.sh</span>
            </div>
            <div className="terminal-body" id="sandbox-terminal-out">
              {safeLogs.map((log, index) => (
                <div key={index} className={`terminal-line ${log && log.type ? log.type : ''}`}>
                  {log && log.text ? log.text : ''}
                </div>
              ))}
              <span className="terminal-caret"></span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
