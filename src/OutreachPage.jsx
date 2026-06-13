import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, Sparkles, Loader2, Check, Copy, ChevronRight, Users, GitBranch, Zap } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = geminiApiKey && geminiApiKey !== 'YOUR_GEMINI_API_KEY' ? new GoogleGenerativeAI(geminiApiKey) : null;

/* ─────────────────────────────────────────────────────────────────
   TEMPLATE ENGINE & AI INTEGRATION
───────────────────────────────────────────────────────────────── */

async function generateColdEmailWithGemini(name, company, role, tone) {
  if (!genAI) throw new Error("Gemini API key not configured.");
  
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const n = name || 'Hiring Team';
  const c = company || 'a tech company';
  const r = role || 'Software Engineer Intern';

  let toneInstruction = "professional and bold";
  if (tone === 'warm') toneInstruction = "warm and appreciative";
  else if (tone === 'concise') toneInstruction = "concise and direct";

  const prompt = `You are an expert career coach writing a cold outreach email for an internship application.
Target Recruiter/Contact: ${n}
Target Company: ${c}
Target Role: ${r}
Tone: ${toneInstruction}

Write a highly personalized, compelling email. Do NOT include placeholder text except for the signature which should be "[Your Name]".
Return a JSON object strictly in this format without markdown code blocks:
{
  "subject": "Email Subject Here",
  "body": "Email Body Here"
}`;

  try {
    let result;
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-3.5-flash"];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting generation with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        if (result && result.response) {
          console.log(`Success with model: ${modelName}`);
          break;
        }
      } catch (err) {
        console.warn(`Model ${modelName} failed:`, err);
        lastError = err;
      }
    }

    if (!result) {
      throw lastError || new Error("All Gemini models failed to generate content.");
    }

    const text = result.response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}

const generateColdEmail = (name, company, role, tone) => {
  const n = name || 'Hiring Team';
  const c = company || 'your company';
  const r = role || 'Software Engineer Intern';
  const subjects = {
    professional: `Outreach: ${r} Application – ${c}`,
    warm: `Deep admiration for ${c} & interest in ${r} role`,
    concise: `${r} query – ${c}`,
  };
  const bodies = {
    professional: `Subject: ${subjects.professional}\n\nDear ${n},\n\nI hope this message finds you well.\n\nI am a passionate software engineering student with hands-on experience building full-stack SaaS platforms and AI-integrated applications. Having researched ${c} extensively, I am deeply aligned with your engineering culture and eager to contribute as a ${r}.\n\nMy background covers React, Node.js, Firebase, and real-time data pipelines — the exact skill set your team leverages at scale. I have attached my resume and portfolio, which demonstrate measurable outcomes across multiple shipped projects.\n\nI would be honored to connect for 15 minutes to discuss how my experience maps to your current engineering priorities.\n\nThank you sincerely for your time.\n\nBest regards,\n[Your Name]\n[LinkedIn] · [Portfolio] · [GitHub]`,
    warm: `Subject: ${subjects.warm}\n\nHi ${n}!\n\nI hope your week is going wonderfully.\n\nI am reaching out because I have been following ${c}'s engineering blog and recent product launches — the culture of craftsmanship your team brings to every release is genuinely inspiring.\n\nAs a CS student passionate about developer experience and clean system design, my dream is to contribute as a ${r} this coming season. I would be incredibly grateful to jump on a quick 5-minute call just to learn about your hiring journey and see if there might be a fit.\n\nThank you for inspiring the next wave of engineers!\n\nWarmly,\n[Your Name]`,
    concise: `Subject: ${subjects.concise}\n\nHi ${n},\n\nI'm a software engineering student exploring ${r} opportunities at ${c} for this term.\n\nCore strengths:\n• Full-stack React / Node.js (4+ shipped projects)\n• Firebase, real-time sync, CI/CD pipelines\n• Self-starter with strong async collaboration\n\nPortfolio attached. Do you have 10 minutes this week?\n\nBest,\n[Your Name]`,
  };
  return { subject: subjects[tone] || subjects.professional, body: bodies[tone] || bodies.professional };
};

const generateFollowUp = (name, company, role) => {
  const n = name || 'there';
  const c = company || 'your company';
  const r = role || 'the internship';
  return `━━━ DAY 3 FOLLOW-UP ━━━\n\nSubject: Re: ${r} – Quick Follow-Up, ${c}\n\nHi ${n},\n\nI wanted to briefly follow up on my previous message regarding the ${r} opportunity at ${c}.\n\nI remain very enthusiastic about the role and believe my full-stack SaaS experience maps well to your team's current sprint work. If you are the right person to connect with, I would love a brief intro call — or happy to be redirected if someone else handles this intake.\n\nThank you again for your time.\n\nBest,\n[Your Name]\n\n\n━━━ DAY 7 CHECK-IN ━━━\n\nSubject: ${r} at ${c} — Brief Check-In\n\nHi ${n},\n\nJust a gentle check-in on my earlier outreach for the ${r} position at ${c}.\n\nI know hiring pipelines move fast — if this timing is off, I would be happy to stay on your radar for future cycles. Alternatively, if there's a preferred application portal or recruiter contact, please feel free to point me there.\n\nEither way, I appreciate you and the team at ${c}. Rooting for everything you're building!\n\nWarm regards,\n[Your Name]`;
};

const generateRecruiterIntel = (company, role) => {
  const c = company || 'the company';
  const r = role || 'Software Engineer Intern';
  return `━━━ RECRUITER INTELLIGENCE BRIEF ━━━\nTarget: ${c}  |  Role: ${r}\n\n──────────────────────────────────────\n📧  KNOWN EMAIL ARCHITECTURE PATTERNS\n──────────────────────────────────────\n\nMost tech companies follow one of these formats. Try each in order:\n\n  Pattern A:  {first}@${c.toLowerCase().replace(/\s+/g, '')}.com\n  Pattern B:  {first}.{last}@${c.toLowerCase().replace(/\s+/g, '')}.com\n  Pattern C:  {f}{last}@${c.toLowerCase().replace(/\s+/g, '')}.com\n  Pattern D:  {first}_{last}@${c.toLowerCase().replace(/\s+/g, '')}.com\n\nVerification tools: hunter.io · rocketreach.co · apollo.io\nTip: Paste "site:linkedin.com/in @${c.toLowerCase().replace(/\s+/g, '')}.com" into Google to surface real email patterns.\n\n──────────────────────────────────────\n🎯  LINKEDIN UNIVERSITY RECRUITER HUNT\n──────────────────────────────────────\n\nStep 1 — LinkedIn Search query:\n  "${c}" AND ("university recruiter" OR "campus recruiter" OR "early career")\n  Filter: Current company = ${c}\n\nStep 2 — Filter further by:\n  • University Programs / Campus Recruiting titles\n  • HR / People / Talent Acquisition departments\n\nStep 3 — InMail script starter:\n  "Hi [Name], I came across your profile while researching ${c}'s early talent programs.\n   I'm actively looking for a ${r} opportunity and would love to learn more about\n   your hiring process and timeline for the upcoming cycle. Would you have 10 minutes?"\n\n──────────────────────────────────────\n📋  STRUCTURAL ATTACK PLAN\n──────────────────────────────────────\n\n  1. Verify email format via hunter.io domain search → ${c.toLowerCase().replace(/\s+/g, '')}.com\n  2. Cross-reference with any found email in GitHub commit history for open-source ${c} repos\n  3. Search Twitter/X: "recruiting @${c.toLowerCase().replace(/\s+/g, '')}" for active recruiters\n  4. Check ${c}'s careers page for recruiter name embedded in job posting metadata\n  5. Attend ${c} virtual info sessions / hackathons to get direct recruiter contacts`;
};

/* ─────────────────────────────────────────────────────────────────
   FLOATING CHECKMARK BADGE
───────────────────────────────────────────────────────────────── */
function FloatingCheck({ visible }) {
  return visible ? (
    <span className="outreach-float-check">
      <Check size={12} /> Copied!
    </span>
  ) : null;
}

/* ─────────────────────────────────────────────────────────────────
   TARGET SELECTOR CARD
───────────────────────────────────────────────────────────────── */
function TargetSelectorCard({ app, selected, onClick }) {
  const bg = app.customBg || 'linear-gradient(135deg, #0072ff, #9d4edd)';
  return (
    <button
      className={`outreach-target-card ${selected ? 'selected' : ''}`}
      onClick={() => onClick(app)}
      title={`${app.company} — ${app.role}`}
    >
      <div className="outreach-target-logo" style={{ background: bg }}>
        {app.logoLetter || app.company?.charAt(0) || '?'}
      </div>
      <div className="outreach-target-info">
        <span className="outreach-target-company">{app.company}</span>
        <span className="outreach-target-role">{app.role}</span>
      </div>
      {selected && <div className="outreach-target-selected-dot" />}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */
export default function OutreachPage({
  /* Legacy props from App.jsx — still supported */
  recruiterName,    setRecruiterName,
  recruiterCompany, setRecruiterCompany,
  outreachRole,     setOutreachRole,
  outreachTone,     setOutreachTone,
  isTyping,         handleGenerateOutreach: legacyGenerate,
  emailSubject,     copiedState,
  handleCopyOutreach: legacyCopy,
  emailBodyDisplay,
  /* New props */
  applications,
}) {
  /* ── Local state ── */
  const [activeTab, setActiveTab]           = useState('cold');    // 'cold' | 'followup' | 'intel'
  const [generating, setGenerating]         = useState(false);
  const [fieldFloating, setFieldFloating]   = useState(false);  // anti-gravity animation trigger
  const [generationSource, setGenerationSource] = useState(null); // 'gemini' | 'local' | null
  const [useGemini, setUseGemini]           = useState(false);

  // Per-tab output
  const [coldOutput, setColdOutput]         = useState({ subject: emailSubject || '', body: emailBodyDisplay || '' });
  const [followOutput, setFollowOutput]     = useState('');
  const [intelOutput, setIntelOutput]       = useState('');
  const [coldTyped, setColdTyped]           = useState('');

  // Per-tab copy states
  const [copyCold, setCopyCold]             = useState(false);
  const [copyFollow, setCopyFollow]         = useState(false);
  const [copyIntel, setCopyIntel]           = useState(false);

  const typeRef = useRef(null);
  const outputRef = useRef(null);

  /* ── Applied applications for target selector ── */
  const appliedApps = Array.isArray(applications)
    ? applications.filter(a => a.status === 'applied' || a.status === 'interviewing')
    : [];

  /* ── Select a target application ── */
  const [selectedApp, setSelectedApp] = useState(null);

  const handleSelectTarget = useCallback((app) => {
    setSelectedApp(app);
    // Trigger anti-gravity float animation
    setFieldFloating(true);
    setTimeout(() => {
      setRecruiterCompany?.(app.company);
      setOutreachRole?.(app.role);
      setFieldFloating(false);
    }, 350);
  }, [setRecruiterCompany, setOutreachRole]);

  /* ── Typewriter engine ── */
  const runTypewriter = useCallback((text, setter, onDone) => {
    clearInterval(typeRef.current);
    setter('');
    let i = 0;
    const step = 6;
    const speed = 10;
    typeRef.current = setInterval(() => {
      if (i < text.length) {
        i += step;
        setter(text.slice(0, Math.min(i, text.length)));
        // Auto-scroll output
        if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
      } else {
        clearInterval(typeRef.current);
        onDone?.();
      }
    }, speed);
  }, []);

  /* ── Generate all outputs ── */
  const handleGenerate = useCallback(async () => {
    if (generating) return;
    setGenerating(true);
    setColdTyped('');
    setColdOutput({ subject: '', body: '' });
    setFollowOutput('');
    setIntelOutput('');

    await new Promise(r => setTimeout(r, 200)); // micro pause for border animation

    try {
      let subject, body;
      
      if (useGemini) {
        if (!genAI) {
          throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY in your .env file.");
        }
        const geminiResult = await generateColdEmailWithGemini(recruiterName, recruiterCompany, outreachRole, outreachTone);
        subject = geminiResult.subject;
        body = geminiResult.body;
        setGenerationSource('gemini');
      } else {
        const localResult = generateColdEmail(recruiterName, recruiterCompany, outreachRole, outreachTone);
        subject = localResult.subject;
        body = localResult.body;
        setGenerationSource('local');
      }
      
      const followText = generateFollowUp(recruiterName, recruiterCompany, outreachRole);
      const intelText  = generateRecruiterIntel(recruiterCompany, outreachRole);

      setColdOutput({ subject, body });
      setFollowOutput(followText);
      setIntelOutput(intelText);

      // Typewriter only on cold email tab
      runTypewriter(body, setColdTyped, () => setGenerating(false));
    } catch (err) {
      console.error(err);
      setColdOutput({ subject: "Generation Failed", body: err.message || "An error occurred while generating. Check your console." });
      setGenerating(false);
    }
  }, [generating, recruiterName, recruiterCompany, outreachRole, outreachTone, useGemini, runTypewriter]);

  useEffect(() => () => clearInterval(typeRef.current), []);

  /* ── Copy handlers with floating badge ── */
  const copyWithBadge = (text, setter) => {
    navigator.clipboard.writeText(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2200);
    });
  };

  /* ── Rendered output per tab ── */
  const hasOutput = coldOutput.body || followOutput || intelOutput;

  const tabs = [
    { key: 'cold',     label: 'Cold Outreach',         Icon: Mail },
    { key: 'followup', label: 'Follow-Up Sequences',   Icon: GitBranch },
    { key: 'intel',    label: 'Recruiter Intelligence', Icon: Users },
  ];

  return (
    <div className="outreach-page-container">

      {/* ── TARGET SELECTOR CAROUSEL ── */}
      {appliedApps.length > 0 && (
        <div className="outreach-target-selector">
          <div className="outreach-target-label">
            <Zap size={13} style={{ color: 'var(--neon-cyan)' }} />
            <span>Select from your tracked applications to auto-fill</span>
          </div>
          <div className="outreach-target-scroll">
            {appliedApps.map(app => (
              <TargetSelectorCard
                key={app.id}
                app={app}
                selected={selectedApp?.id === app.id}
                onClick={handleSelectTarget}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN CARD ── */}
      <div className={`dashboard-card outreach-main-card ${generating ? 'card-generating' : ''}`} id="email-section">
        <div className="card-border-glow" />

        {/* Header */}
        <div className="card-header">
          <div className="card-header-left">
            <div className="card-icon-container status-purple">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="card-title">Anti-Gravity Outreach Pipeline</h3>
              <p className="card-subtitle">Hyper-personalized email generation · Follow-up sequences · Recruiter intelligence</p>
            </div>
          </div>
        </div>

        <div className="card-body" style={{ flexDirection: 'column', gap: '24px' }}>

          {/* ── FORM ── */}
          <div className={`outreach-form ${fieldFloating ? 'field-floating' : ''}`}>
            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="recruiter-name">Recruiter Name</label>
                <input
                  type="text"
                  id="recruiter-name"
                  value={recruiterName}
                  onChange={e => setRecruiterName?.(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>
              <div className="form-group flex-1">
                <label htmlFor="recruiter-company">Target Company</label>
                <input
                  type="text"
                  id="recruiter-company"
                  value={recruiterCompany}
                  onChange={e => setRecruiterCompany?.(e.target.value)}
                  placeholder="e.g. Stripe"
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
                  onChange={e => setOutreachRole?.(e.target.value)}
                  placeholder="e.g. Software Engineer Intern"
                />
              </div>
              <div className="form-group flex-1">
                <label htmlFor="email-tone">Tone Selection</label>
                <select id="email-tone" value={outreachTone} onChange={e => setOutreachTone?.(e.target.value)}>
                  <option value="professional">Professional &amp; Bold</option>
                  <option value="warm">Warm &amp; Appreciative</option>
                  <option value="concise">Concise &amp; Direct</option>
                </select>
              </div>
            </div>

            {/* AI TOGGLE OPTION */}
            <div className="form-row" style={{ display: 'flex', alignItems: 'center' }}>
              <div className="form-group flex-1" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                <div className="ai-toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)', width: '100%', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={14} style={{ color: useGemini ? 'var(--neon-cyan)' : 'rgba(255, 255, 255, 0.4)' }} />
                    <span style={{ fontSize: '13px', fontWeight: '500', color: useGemini ? '#ffffff' : 'rgba(255, 255, 255, 0.6)' }}>
                      AI Custom Generation (Google Gemini)
                    </span>
                  </div>
                  <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
                    <input
                      type="checkbox"
                      checked={useGemini}
                      onChange={e => setUseGemini(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span className="slider round" style={{ position: 'absolute', cursor: 'pointer', inset: 0, backgroundColor: useGemini ? 'var(--neon-cyan)' : 'rgba(255, 255, 255, 0.1)', transition: '.4s', borderRadius: '34px', boxShadow: useGemini ? '0 0 10px rgba(0, 240, 255, 0.5)' : 'none' }}>
                      <span style={{ position: 'absolute', content: '""', height: '14px', width: '14px', left: useGemini ? '22px' : '4px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }} />
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* GENERATE BUTTON */}
            <button
              className={`btn btn-primary btn-full outreach-generate-btn ${generating ? 'btn-generating' : ''}`}
              id="btn-generate-email"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <><Loader2 size={16} className="animate-spin" /> Generating all outputs...</>
              ) : (
                <><Sparkles size={16} /> Generate AI Outreach Pipeline</>
              )}
            </button>
          </div>

          {/* ── BENTO TAB OUTPUT ── */}
          {hasOutput && (
            <div className="outreach-output-panel">
              {/* Tab Bar */}
              <div className="outreach-tab-bar">
                {tabs.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    className={`outreach-tab-btn ${activeTab === key ? 'active' : ''}`}
                    onClick={() => setActiveTab(key)}
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                ))}
              </div>

              {/* ── TAB 1: Cold Outreach ── */}
              {activeTab === 'cold' && (
                <div className="outreach-tab-content" key="cold">
                  <div className="output-header">
                    <span className="subject-line">
                      Subject: <span>{coldOutput.subject}</span>
                      {generationSource === 'gemini' && <span className="tag-success" style={{marginLeft: 8, fontSize: '10px', padding: '2px 6px', borderRadius: '4px'}}>✨ Gemini AI</span>}
                      {generationSource === 'local' && <span className="tag-medium" style={{marginLeft: 8, fontSize: '10px', padding: '2px 6px', borderRadius: '4px'}}>⚡ Local Template</span>}
                    </span>
                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                      <FloatingCheck visible={copyCold} />
                      <button
                        className="btn-copy"
                        id="btn-copy-cold"
                        onClick={() => copyWithBadge(coldOutput.body, setCopyCold)}
                        style={copyCold ? { borderColor: 'var(--neon-success)', color: 'var(--neon-success)' } : {}}
                      >
                        {copyCold ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy Cold Email</>}
                      </button>
                    </div>
                  </div>
                  <div className="output-body" id="email-body-out" ref={outputRef} style={{ minHeight: '220px' }}>
                    {coldTyped || coldOutput.body}
                    {generating && <span className="outreach-cursor">▋</span>}
                  </div>
                </div>
              )}

              {/* ── TAB 2: Follow-Up Sequences ── */}
              {activeTab === 'followup' && (
                <div className="outreach-tab-content" key="followup">
                  <div className="output-header">
                    <span className="subject-line">
                      <GitBranch size={12} style={{ display: 'inline', marginRight: '6px', color: 'var(--neon-purple)' }} />
                      Day 3 &amp; Day 7 Follow-Up Templates
                    </span>
                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                      <FloatingCheck visible={copyFollow} />
                      <button
                        className="btn-copy"
                        id="btn-copy-followup"
                        onClick={() => copyWithBadge(followOutput, setCopyFollow)}
                        style={copyFollow ? { borderColor: 'var(--neon-success)', color: 'var(--neon-success)' } : {}}
                      >
                        {copyFollow ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy Follow-Up</>}
                      </button>
                    </div>
                  </div>
                  <div className="output-body" style={{ minHeight: '220px', whiteSpace: 'pre-wrap' }}>
                    {followOutput}
                  </div>
                </div>
              )}

              {/* ── TAB 3: Recruiter Intelligence ── */}
              {activeTab === 'intel' && (
                <div className="outreach-tab-content" key="intel">
                  <div className="output-header">
                    <span className="subject-line">
                      <Users size={12} style={{ display: 'inline', marginRight: '6px', color: 'var(--neon-cyan)' }} />
                      Intel Brief for {recruiterCompany}
                    </span>
                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                      <FloatingCheck visible={copyIntel} />
                      <button
                        className="btn-copy"
                        id="btn-copy-intel"
                        onClick={() => copyWithBadge(intelOutput, setCopyIntel)}
                        style={copyIntel ? { borderColor: 'var(--neon-success)', color: 'var(--neon-success)' } : {}}
                      >
                        {copyIntel ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy Intel</>}
                      </button>
                    </div>
                  </div>
                  <div className="output-body" style={{ minHeight: '220px', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.7' }}>
                    {intelOutput}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
