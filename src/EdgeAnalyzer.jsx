import { useState } from 'react';
import { pipeline, env } from '@xenova/transformers';

// Disable loading local models from the local dev server (prevents Vite serving index.html on missing model files)
env.allowLocalModels = false;
import { Brain, Cpu, CheckCircle } from 'lucide-react';

export default function EdgeAnalyzer() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');

  const calculateSemanticMatch = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) return;
    setLoading(true);
    setLoadingStatus('Initializing browser inference engine...');

    try {
      // Load a lightweight feature extraction model locally in the browser engine
      setLoadingStatus('Downloading/Loading Xenova/all-MiniLM-L6-v2 (~90MB, cached in browser)...');
      const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

      setLoadingStatus('Generating embeddings for resume...');
      const resumeOutput = await extractor(resumeText, { pooling: 'mean', normalize: true });
      
      setLoadingStatus('Generating embeddings for job description...');
      const jobOutput = await extractor(jobDescription, { pooling: 'mean', normalize: true });

      const resumeVector = Array.from(resumeOutput.data);
      const jobVector = Array.from(jobOutput.data);

      setLoadingStatus('Calculating cosine similarity vector space metrics...');
      // Perform Cosine Similarity calculation mathematically at the edge
      const dotProduct = resumeVector.reduce((sum, val, i) => sum + val * jobVector[i], 0);
      const matchPercentage = Math.min(Math.max(Math.round(dotProduct * 100), 0), 100);

      setScore(matchPercentage);
    } catch (error) {
      console.error("Local inference execution failed:", error);
      if (error.message && (error.message.includes('Unexpected token') || error.message.includes('not valid JSON') || error.message.includes('<!DOCTYPE html>'))) {
        if ('caches' in window) {
          try {
            await caches.delete('transformers-cache');
            console.log('Cleared corrupt transformers-cache successfully.');
          } catch (cacheErr) {
            console.warn('Failed to clear transformers-cache:', cacheErr);
          }
        }
        alert("Detected a corrupt model files cache in your browser. We have automatically cleared the cache. Please click 'Run Local Inference Validation' again to download the correct files.");
      } else {
        alert("Local inference execution failed: " + (error.message || error));
      }
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  return (
    <div className="glass-panel text-white p-6 max-w-2xl mx-auto rounded-xl border border-white/10 backdrop-blur-md bg-black/40" style={{ marginTop: '20px' }}>
      <div className="card-border-glow"></div>
      <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 700 }}>
        <Brain size={20} style={{ color: 'var(--neon-cyan)' }} />
        Edge-AI Semantic ATS Analyzer
      </h2>
      <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '20px' }}>
        Run open-source sentence transformer models locally in your browser sandbox. Your resume and data never leave your computer.
      </p>
      
      <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group">
          <label className="block text-xs text-cyan-400 uppercase tracking-wider mb-2" style={{ color: 'var(--neon-cyan)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Resume Corpus</label>
          <textarea 
            className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            style={{
              width: '100%',
              height: '120px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '12px',
              color: '#f8fafc',
              fontSize: '13px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              marginTop: '6px'
            }}
            placeholder="Paste raw resume text details here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="block text-xs text-purple-400 uppercase tracking-wider mb-2" style={{ color: 'var(--neon-purple)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Target Job Description</label>
          <textarea 
            className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
            style={{
              width: '100%',
              height: '120px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '12px',
              color: '#f8fafc',
              fontSize: '13px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              marginTop: '6px'
            }}
            placeholder="Paste target job criteria specifications..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <button 
          onClick={calculateSemanticMatch}
          disabled={loading || !resumeText.trim() || !jobDescription.trim()}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 text-white font-medium py-2.5 px-4 rounded-lg transition-all text-sm disabled:opacity-50"
          style={{
            width: '100%',
            background: 'linear-gradient(90deg, #00f0ff, #7000ff)',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            padding: '12px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '10px',
            opacity: (loading || !resumeText.trim() || !jobDescription.trim()) ? 0.5 : 1
          }}
        >
          {loading ? (
            <>
              <Cpu size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span>{loadingStatus}</span>
            </>
          ) : (
            <>
              <Cpu size={16} />
              <span>Run Local Inference Validation</span>
            </>
          )}
        </button>

        {score !== null && (
          <div className="mt-4 text-center p-4 bg-white/5 rounded-lg border border-white/10 animate-fade-in" style={{
            marginTop: '16px',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block' }}>
              Calculated Semantic Vector Match Score:
            </span>
            <div style={{
              fontSize: '32px',
              fontWeight: 800,
              background: 'linear-gradient(90deg, #00ff87, #00f0ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginTop: '6px'
            }}>
              {score}%
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--neon-success)',
              background: 'rgba(0, 255, 135, 0.08)',
              padding: '4px 10px',
              borderRadius: '20px',
              marginTop: '8px'
            }}>
              <CheckCircle size={12} />
              <span>Cosine Similarity Validated locally</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
