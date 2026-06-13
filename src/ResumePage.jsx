import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FileCheck2, FileText, Briefcase, Loader2, Sparkles,
  UploadCloud, CheckCircle, XCircle, Zap, ArrowRight,
  AlertTriangle, ChevronRight, Target, TrendingUp
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

/* ─────────────────────────────────────────────────────────────────
   GEMINI SETUP — uses same key as OutreachPage
───────────────────────────────────────────────────────────────── */
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = geminiApiKey && geminiApiKey !== 'YOUR_GEMINI_API_KEY'
  ? new GoogleGenerativeAI(geminiApiKey)
  : null;

async function analyzeWithGemini(resumeText, jdText) {
  if (!genAI) throw new Error('NO_KEY');
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.5-flash'];
  let lastError = null;

  const prompt = `You are an elite ATS resume analyst. Analyze the resume against the job description and return ONLY a valid JSON object with no markdown, no code blocks, no extra text. The JSON must match this structure exactly:
{
  "matchScore": <integer 0-100>,
  "missingKeywords": ["keyword1", "keyword2", ...],
  "bulletTailoring": [
    { "original": "original bullet point from resume", "suggestedUpgrade": "improved version with metrics" }
  ],
  "summary": "2 sentence executive summary of fit"
}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}

Return only the JSON object:`;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

/* ─────────────────────────────────────────────────────────────────
   LOCAL FALLBACK ANALYZER
───────────────────────────────────────────────────────────────── */
function analyzeLocally(resumeText, jdText) {
  const rText = resumeText.toLowerCase();
  const jText = jdText.toLowerCase();

  const allTechKeywords = [
    'javascript', 'typescript', 'react', 'next.js', 'node', 'express',
    'css', 'html', 'tailwind', 'database', 'restful api', 'mongodb',
    'postgres', 'git', 'docker', 'ui', 'ux', 'responsive', 'python',
    'java', 'aws', 'azure', 'kubernetes', 'ci/cd', 'graphql', 'redux',
    'vue', 'angular', 'sql', 'nosql', 'figma', 'agile', 'scrum'
  ];

  const jdKeywords = allTechKeywords.filter(k => jText.includes(k));
  const resumeKeywords = allTechKeywords.filter(k => rText.includes(k));
  const missing = jdKeywords.filter(k => !rText.includes(k));

  let score = 50;
  if (jdKeywords.length > 0) {
    score = Math.round(50 + (resumeKeywords.filter(k => jdKeywords.includes(k)).length / jdKeywords.length) * 48);
  }
  score = Math.max(42, Math.min(98, score));

  return {
    matchScore: score,
    missingKeywords: missing.slice(0, 8),
    bulletTailoring: [
      {
        original: 'Built web applications using React and Node.js',
        suggestedUpgrade: 'Engineered 4+ production-grade full-stack applications using React 18 and Node.js, reducing load time by 40% through code-splitting and lazy loading.'
      },
      {
        original: 'Worked on backend APIs',
        suggestedUpgrade: 'Architected and deployed 12 RESTful API endpoints handling 10k+ daily requests, achieving 99.8% uptime with Express.js and MongoDB Atlas.'
      }
    ],
    summary: `Your resume demonstrates solid ${jdKeywords.slice(0, 3).join(', ')} experience. To improve fit, consider adding ${missing.slice(0, 2).join(' and ')} to your skillset or project descriptions.`
  };
}

/* ─────────────────────────────────────────────────────────────────
   SVG RADIAL PROGRESS RING
───────────────────────────────────────────────────────────────── */
function RadialRing({ score, animating }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dashoffset = circ - (score / 100) * circ;

  const getColor = (s) => {
    if (s >= 80) return '#00ff87';
    if (s >= 60) return '#00f0ff';
    return '#ffaa00';
  };

  return (
    <div className="resume-radial-wrapper">
      <svg viewBox="0 0 120 120" className="resume-radial-svg">
        <defs>
          <linearGradient id="resume-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="50%" stopColor="#9d4edd" />
            <stop offset="100%" stopColor="#00ff87" />
          </linearGradient>
          <filter id="resume-ring-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background track */}
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />
        {/* Animated fill */}
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke="url(#resume-ring-grad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashoffset}
          transform="rotate(-90 60 60)"
          filter="url(#resume-ring-glow)"
          style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
        {/* Particle dot at the tip */}
        {score > 0 && (
          <circle
            cx="60"
            cy={60 - r}
            r="4"
            fill={getColor(score)}
            style={{
              filter: `drop-shadow(0 0 6px ${getColor(score)})`,
              transformOrigin: '60px 60px',
              transform: `rotate(${(score / 100) * 360 - 90}deg)`,
              transition: 'transform 1.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        )}
      </svg>
      <div className="resume-radial-content">
        <span className="resume-score-num" style={{ color: getColor(score) }}>
          {score}
        </span>
        <span className="resume-score-label">ATS Score</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   DRAG-AND-DROP PDF UPLOAD ZONE
───────────────────────────────────────────────────────────────── */
function DropZone({ onTextExtracted, uploadedFile, setUploadedFile }) {
  const [dragging, setDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
    setError('');
    setExtracting(true);
    setUploadedFile({ name: file.name, size: file.size });

    try {
      // Read PDF as text using FileReader + heuristic text extraction
      const reader = new FileReader();
      reader.onload = async (e) => {
        const buffer = e.target.result;
        const bytes = new Uint8Array(buffer);
        let extracted = '';

        // Extract readable ASCII text from the PDF byte stream
        let chunk = '';
        for (let i = 0; i < bytes.length; i++) {
          const c = bytes[i];
          if (c >= 32 && c < 127) {
            chunk += String.fromCharCode(c);
          } else {
            if (chunk.length > 4) extracted += chunk + ' ';
            chunk = '';
          }
        }
        if (chunk.length > 4) extracted += chunk;

        // Clean up the raw text
        const cleaned = extracted
          .replace(/\s{3,}/g, ' ')
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .trim();

        onTextExtracted(cleaned.length > 50 ? cleaned : `[PDF text extraction yielded minimal content. File: ${file.name}. Please paste your resume text below for best results.]`);
        setExtracting(false);
      };
      reader.readAsArrayBuffer(file);
    } catch {
      setError('Failed to read PDF. Please paste resume text manually.');
      setExtracting(false);
    }
  }, [onTextExtracted, setUploadedFile]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const formatSize = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

  return (
    <div
      className={`resume-dropzone ${dragging ? 'drag-active' : ''} ${uploadedFile ? 'has-file' : ''}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => !uploadedFile && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {extracting ? (
        <div className="dropzone-inner">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--neon-cyan)', marginBottom: 12 }} />
          <p className="dropzone-title">Parsing PDF...</p>
          <p className="dropzone-sub">Extracting text content</p>
        </div>
      ) : uploadedFile ? (
        <div className="dropzone-inner">
          <div className="dropzone-success-icon">
            <CheckCircle size={28} style={{ color: 'var(--neon-success)' }} />
          </div>
          <p className="dropzone-title" style={{ color: 'var(--neon-success)' }}>
            {uploadedFile.name}
          </p>
          <p className="dropzone-sub">{formatSize(uploadedFile.size)} · PDF uploaded</p>
          <button
            className="dropzone-replace-btn"
            onClick={(e) => { e.stopPropagation(); setUploadedFile(null); inputRef.current?.click(); }}
          >
            Replace File
          </button>
        </div>
      ) : (
        <div className="dropzone-inner">
          <div className="dropzone-icon">
            <UploadCloud size={36} />
          </div>
          <p className="dropzone-title">Drop your PDF resume here</p>
          <p className="dropzone-sub">or click to browse files</p>
          <div className="dropzone-badge">.PDF only</div>
        </div>
      )}
      {error && (
        <p style={{ color: 'var(--neon-gold)', fontSize: '12px', marginTop: 8, textAlign: 'center' }}>
          <AlertTriangle size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          {error}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   RESULT PANELS
───────────────────────────────────────────────────────────────── */
function MissingKeywordsPanel({ keywords }) {
  if (!keywords || keywords.length === 0) return (
    <div className="resume-result-card">
      <div className="result-card-header">
        <Target size={14} style={{ color: 'var(--neon-success)' }} />
        <span>Missing Keywords</span>
      </div>
      <p style={{ color: 'var(--neon-success)', fontSize: 13, marginTop: 8 }}>
        ✅ All required keywords found! Great job.
      </p>
    </div>
  );

  return (
    <div className="resume-result-card result-danger">
      <div className="result-card-header">
        <XCircle size={14} style={{ color: 'var(--neon-gold)' }} />
        <span>Missing Keywords ({keywords.length})</span>
      </div>
      <div className="keyword-chips">
        {keywords.map((kw, i) => (
          <span key={i} className="keyword-chip">{kw}</span>
        ))}
      </div>
      <p className="result-hint">Add these to your resume to boost ATS matching.</p>
    </div>
  );
}

function BulletTailoringPanel({ bullets }) {
  const [expanded, setExpanded] = useState(null);
  if (!bullets || bullets.length === 0) return null;

  return (
    <div className="resume-result-card result-upgrade">
      <div className="result-card-header">
        <TrendingUp size={14} style={{ color: 'var(--neon-cyan)' }} />
        <span>Bullet Point Upgrades</span>
      </div>
      <div className="bullet-list">
        {bullets.map((item, i) => (
          <div
            key={i}
            className={`bullet-item ${expanded === i ? 'expanded' : ''}`}
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <div className="bullet-header">
              <ChevronRight
                size={12}
                style={{
                  transition: 'transform 0.2s ease',
                  transform: expanded === i ? 'rotate(90deg)' : 'rotate(0deg)',
                  color: 'var(--neon-purple)', flexShrink: 0
                }}
              />
              <span className="bullet-original">{item.original}</span>
            </div>
            {expanded === i && (
              <div className="bullet-upgrade">
                <div className="upgrade-label">
                  <Zap size={11} style={{ color: 'var(--neon-cyan)' }} />
                  Suggested Upgrade
                </div>
                <p className="upgrade-text">{item.suggestedUpgrade}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE COMPONENT
───────────────────────────────────────────────────────────────── */
export default function ResumePage({
  /* Legacy props from App.jsx — keep compatibility */
  scoreAnimationVal: legacyScore,
  dashoffsetVal,
  getMatchStatusStyle,
  getMatchStatusText,
  resumeText: propResumeText,
  setResumeText: propSetResumeText,
  jdText: propJdText,
  setJdText: propSetJdText,
  handleAnalyzeResume: legacyAnalyze,
  isAnalyzing: legacyAnalyzing,
}) {
  /* ── Local state (self-contained so this works fully standalone) ── */
  const [resumeText, setResumeText] = useState(propResumeText || '');
  const [jdText, setJdText] = useState(propJdText || '');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [animScore, setAnimScore] = useState(0);
  const [results, setResults] = useState(null);
  const [analyzeError, setAnalyzeError] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [analysisSource, setAnalysisSource] = useState(null); // 'gemini' | 'local'

  /* Sync to parent (App.jsx compatibility) */
  useEffect(() => { propSetResumeText?.(resumeText); }, [resumeText]);
  useEffect(() => { propSetJdText?.(jdText); }, [jdText]);

  /* Animate score ring when displayScore changes */
  useEffect(() => {
    if (displayScore === 0) { setAnimScore(0); return; }
    let current = 0;
    const target = displayScore;
    const step = () => {
      current += Math.ceil((target - current) / 6);
      if (current >= target) { setAnimScore(target); return; }
      setAnimScore(current);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [displayScore]);

  /* ── Handle text extraction from PDF ── */
  const handleTextExtracted = useCallback((text) => {
    setResumeText(text);
  }, []);

  /* ── Main analyze handler ── */
  const handleAnalyze = useCallback(async () => {
    if (analyzing) return;
    if (!resumeText.trim() || !jdText.trim()) {
      setAnalyzeError('Please provide both resume content and a job description.');
      return;
    }
    setAnalyzeError('');
    setAnalyzing(true);
    setDisplayScore(0);
    setResults(null);

    try {
      let data;
      if (useAI && genAI) {
        data = await analyzeWithGemini(resumeText, jdText);
        setAnalysisSource('gemini');
      } else {
        await new Promise(r => setTimeout(r, 1200)); // simulate analysis
        data = analyzeLocally(resumeText, jdText);
        setAnalysisSource('local');
      }
      setDisplayScore(data.matchScore);
      setResults(data);
    } catch (err) {
      console.error('Analysis error:', err);
      // Fallback to local analysis on API failure
      const fallback = analyzeLocally(resumeText, jdText);
      setDisplayScore(fallback.matchScore);
      setResults(fallback);
      setAnalysisSource('local');
      if (useAI) setAnalyzeError('Gemini failed — showing local analysis instead.');
    } finally {
      setAnalyzing(false);
    }
  }, [analyzing, resumeText, jdText, useAI]);

  const getStatusBadge = (score) => {
    if (score >= 80) return { label: 'Excellent Fit', color: 'var(--neon-success)', bg: 'rgba(0,255,135,0.1)', border: 'rgba(0,255,135,0.3)' };
    if (score >= 60) return { label: 'Strong Match', color: 'var(--neon-cyan)', bg: 'rgba(0,240,255,0.1)', border: 'rgba(0,240,255,0.3)' };
    return { label: 'Needs Improvement', color: 'var(--neon-gold)', bg: 'rgba(255,170,0,0.1)', border: 'rgba(255,170,0,0.3)' };
  };

  const badge = animScore > 0 ? getStatusBadge(animScore) : null;

  return (
    <div className="resume-page-container">

      {/* ── PAGE HEADER ── */}
      <div className="resume-page-header">
        <div className="resume-page-header-icon">
          <FileCheck2 size={22} />
        </div>
        <div>
          <h1 className="resume-page-title">ATS Resume Analyzer</h1>
          <p className="resume-page-subtitle">
            Zero-gravity AI analysis · Keyword matching · Bullet point optimization
          </p>
        </div>
      </div>

      {/* ── ROW 1: Upload PDF + Job Description side-by-side ── */}
      <div className="resume-top-row">

        {/* PDF Upload Zone */}
        <div className="dashboard-card resume-panel-card">
          <div className="card-border-glow" />
          <div className="card-header">
            <div className="card-header-left">
              <div className="card-icon-container status-blue">
                <UploadCloud size={17} />
              </div>
              <div>
                <h3 className="card-title" style={{ fontSize: 15 }}>Upload Resume</h3>
                <p className="card-subtitle">Drag-and-drop PDF or click to browse</p>
              </div>
            </div>
          </div>
          <div style={{ padding: '0 24px 24px' }}>
            <DropZone
              onTextExtracted={handleTextExtracted}
              uploadedFile={uploadedFile}
              setUploadedFile={setUploadedFile}
            />
          </div>
        </div>

        {/* Job Description */}
        <div className="dashboard-card resume-panel-card">
          <div className="card-border-glow" />
          <div className="card-header">
            <div className="card-header-left">
              <div className="card-icon-container status-yellow">
                <Briefcase size={17} />
              </div>
              <div>
                <h3 className="card-title" style={{ fontSize: 15 }}>Job Description</h3>
                <p className="card-subtitle">Paste the target JD requirements</p>
              </div>
            </div>
          </div>
          <div style={{ padding: '0 24px 24px' }}>
            <textarea
              className="resume-textarea resume-textarea-tall"
              id="jd-textarea"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description here…"
            />
          </div>
        </div>
      </div>

      {/* ── ROW 2: AI Toggle + Analyze Button (full-width bar) ── */}
      <div className="resume-analyze-bar">
        <div className="ai-toggle-container resume-bar-toggle">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={13} style={{ color: useAI ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.4)' }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: useAI ? '#fff' : 'rgba(255,255,255,0.55)' }}>
              Deep AI Analysis (Gemini)
            </span>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: 40, height: 20 }}>
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute', cursor: 'pointer', inset: 0,
              backgroundColor: useAI ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.1)',
              transition: '.3s', borderRadius: 34,
              boxShadow: useAI ? '0 0 10px rgba(0,240,255,0.5)' : 'none'
            }}>
              <span style={{
                position: 'absolute', height: 14, width: 14,
                left: useAI ? 22 : 4, bottom: 3,
                backgroundColor: 'white', transition: '.3s', borderRadius: '50%'
              }} />
            </span>
          </label>
        </div>

        {analyzeError && (
          <p style={{ color: 'var(--neon-gold)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
            <AlertTriangle size={12} />
            {analyzeError}
          </p>
        )}

        <button
          className={`btn btn-primary resume-analyze-btn ${analyzing ? 'analyzing' : ''}`}
          id="btn-analyze-resume"
          onClick={handleAnalyze}
          disabled={analyzing}
          style={{ marginLeft: 'auto' }}
        >
          {analyzing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {useAI ? 'Gemini Analyzing…' : 'Analyzing Resume…'}
            </>
          ) : (
            <>
              <Zap size={16} />
              Analyze Resume Compatibility
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>

      {/* ── ROW 3: Compatibility Score + Results side-by-side ── */}
      <div className="resume-bottom-row">

        {/* Score Ring Card */}
        <div className="dashboard-card resume-score-card" id="match-section">
          <div className="card-border-glow" />
          <div className="resume-score-header">
            <div>
              <h3 className="card-title">Compatibility Score</h3>
              <p className="card-subtitle">ATS keyword match analysis</p>
            </div>
            {analysisSource && (
              <span className={`analysis-source-badge ${analysisSource}`}>
                {analysisSource === 'gemini' ? '✨ Gemini AI' : '⚡ Local'}
              </span>
            )}
          </div>

          <div className="resume-score-body">
            <RadialRing score={animScore} animating={analyzing} />

            {badge && (
              <div
                className="resume-status-pill"
                style={{ color: badge.color, background: badge.bg, borderColor: badge.border }}
              >
                {badge.label}
              </div>
            )}

            {!results && !analyzing && (
              <div className="resume-placeholder">
                <div className="resume-placeholder-icon">
                  <Target size={40} />
                </div>
                <p className="resume-placeholder-title">Ready to analyze</p>
                <p className="resume-placeholder-sub">
                  Upload your resume and paste a job description, then click Analyze above.
                </p>
              </div>
            )}

            {analyzing && (
              <div className="resume-analyzing-overlay">
                <div className="analyzing-steps">
                  {['Parsing resume content…', 'Extracting JD keywords…', 'Computing ATS score…', 'Generating upgrades…'].map((step, i) => (
                    <div key={i} className="analyzing-step" style={{ animationDelay: `${i * 0.4}s` }}>
                      <div className="step-dot" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {results?.summary && (
            <div className="resume-summary-box">
              <p className="resume-summary-text">{results.summary}</p>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="resume-results-col">
          {results ? (
            <>
              <MissingKeywordsPanel keywords={results.missingKeywords} />
              <BulletTailoringPanel bullets={results.bulletTailoring} />
            </>
          ) : (
            <div className="resume-results-empty">
              <div style={{ opacity: 0.12, marginBottom: 14 }}>
                <TrendingUp size={48} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.3)', margin: '0 0 6px' }}>
                Analysis results will appear here
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)', margin: 0 }}>
                Missing keywords and bullet upgrades shown after analysis
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
