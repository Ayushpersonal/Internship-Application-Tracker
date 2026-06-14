import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Clock, 
  Loader2, 
  ArrowLeft,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AIInterviewPage({ currentUser, isFirebaseMock }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const [interviewStage, setInterviewStage] = useState('setup'); // 'setup', 'console', 'report'
  const [interviewSessionId, setInterviewSessionId] = useState(null);
  const [roleSelectValue, setRoleSelectValue] = useState('Software Engineer Intern');
  const [customRole, setCustomRole] = useState('');
  const [interviewCompany, setInterviewCompany] = useState('');
  const [interviewSkills, setInterviewSkills] = useState('');
  const [interviewQuestion, setInterviewQuestion] = useState('Loading first question...');
  const [interviewAnswer, setInterviewAnswer] = useState('');
  const [interviewQuestionNum, setInterviewQuestionNum] = useState(1);
  const [interviewSeconds, setInterviewSeconds] = useState(0);
  const [isInterviewVoiceEnabled, setIsInterviewVoiceEnabled] = useState(true);
  const [isInterviewListening, setIsInterviewListening] = useState(false);
  const [voiceVisualizerState, setVoiceVisualizerState] = useState('hidden'); // 'hidden', 'speaking', 'listening'
  const [interviewLogs, setInterviewLogs] = useState([
    { text: 'System initialized.', type: 'sys' },
    { text: 'FastAPI connection client ready.', type: 'info' }
  ]);
  const [interviewReport, setInterviewReport] = useState(null);
  const [interviewSubmitting, setInterviewSubmitting] = useState(false);
  const [interviewInitializing, setInterviewInitializing] = useState(false);
  const [recordedAudioBase64, setRecordedAudioBase64] = useState(null);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const interviewTimerIntervalRef = useRef(null);
  const logsViewportRef = useRef(null);

  useEffect(() => {
    if (logsViewportRef.current) {
      logsViewportRef.current.scrollTop = logsViewportRef.current.scrollHeight;
    }
  }, [interviewLogs]);

  const addInterviewLog = (text, type = 'sys') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setInterviewLogs(prev => [...prev, { text: `[${time}] ${text}`, type }]);
  };

  const startInterviewTimer = () => {
    clearInterval(interviewTimerIntervalRef.current);
    setInterviewSeconds(0);
    interviewTimerIntervalRef.current = setInterval(() => {
      setInterviewSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopInterviewTimer = () => {
    clearInterval(interviewTimerIntervalRef.current);
  };

  const formatInterviewTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const speakText = (text) => {
    if (!isInterviewVoiceEnabled) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#\-`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural')));
    const standardVoice = voices.find(v => v.lang.startsWith('en'));
    utterance.voice = naturalVoice || standardVoice;
    utterance.rate = 0.95;
    
    if (isInterviewListening && recognitionRef.current) {
      recognitionRef.current.abort();
    }
    
    utterance.onstart = () => {
      setVoiceVisualizerState('speaking');
      addInterviewLog('AI is speaking the question...', 'info');
    };
    
    utterance.onend = () => {
      setVoiceVisualizerState('hidden');
      if (recognitionRef.current && isInterviewListening) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    };

    utterance.onerror = (e) => {
      setVoiceVisualizerState('hidden');
      console.warn('Speech synthesis error:', e);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addInterviewLog('Web Speech Recognition API is not supported in this browser.', 'warning');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsInterviewListening(true);
      setVoiceVisualizerState('listening');
      addInterviewLog('Voice Recognition active. Speak into your microphone...', 'info');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setInterviewAnswer(prev => {
          const spacer = prev && !prev.endsWith(' ') ? ' ' : '';
          return prev + spacer + finalTranscript.trim();
        });
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        addInterviewLog(`Voice Input warning: ${event.error}`, 'warning');
      }
    };

    recognition.onend = () => {
      setIsInterviewListening(false);
      setVoiceVisualizerState('hidden');
      addInterviewLog('Voice input listening stopped.', 'sys');
    };

    recognitionRef.current = recognition;
  };

  useEffect(() => {
    initSpeechRecognition();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      clearInterval(interviewTimerIntervalRef.current);
    };
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isInterviewListening) {
      recognitionRef.current.stop();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } else {
      window.speechSynthesis.cancel();
      setVoiceVisualizerState('hidden');
      try {
        recognitionRef.current.start();
        startAudioRecording();
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };

  const startAudioRecording = async () => {
    audioChunksRef.current = [];
    setRecordedAudioBase64(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setRecordedAudioBase64(reader.result);
          addInterviewLog("Audio response captured successfully.", "success");
        };
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
    } catch (err) {
      addInterviewLog(`Failed to initiate audio capture: ${err.message}`, 'warning');
    }
  };

  const handleVoiceToggle = () => {
    const nextVal = !isInterviewVoiceEnabled;
    setIsInterviewVoiceEnabled(nextVal);
    if (nextVal) {
      addInterviewLog('AI Text-to-Speech enabled.', 'info');
      if (interviewSessionId && interviewQuestion && !interviewQuestion.startsWith('Loading')) {
        speakText(interviewQuestion);
      }
    } else {
      window.speechSynthesis.cancel();
      setVoiceVisualizerState('hidden');
      addInterviewLog('AI Text-to-Speech muted.', 'warning');
    }
  };

  const handleStartInterviewSimulation = async (e) => {
    e.preventDefault();
    const role = roleSelectValue === 'Custom' ? customRole.trim() : roleSelectValue;
    const company = interviewCompany.trim() || 'General Interview';
    const skills = interviewSkills.trim();

    addInterviewLog(`Initializing voice interview for role "${role}" at "${company}"...`, 'sys');
    setInterviewInitializing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/interview/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: role,
          company: company,
          resume_skills: skills
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to start session: ${response.statusText}`);
      }

      const data = await response.json();
      setInterviewSessionId(data.session_id);
      setInterviewQuestion(data.question);
      setInterviewQuestionNum(1);
      setInterviewAnswer('');

      addInterviewLog('Interview simulation session spawned successfully!', 'success');
      addInterviewLog(`Session ID: ${data.session_id}`, 'info');

      setInterviewStage('console');
      speakText(data.question);
      startInterviewTimer();
    } catch (err) {
      addInterviewLog(`Initialization error: ${err.message}`, 'err');
      alert(`Could not start mock session. Ensure the backend FastAPI server is running at ${API_BASE_URL}.`);
    } finally {
      setInterviewInitializing(false);
    }
  };

  const handleSubmitInterviewAnswer = async () => {
    window.speechSynthesis.cancel();
    if (isInterviewListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const answer = interviewAnswer.trim();
    if (!answer) {
      alert('Please type or speak your response before submitting.');
      return;
    }

    stopInterviewTimer();
    addInterviewLog(`Submitting response for Question ${interviewQuestionNum}...`, 'sys');
    setInterviewSubmitting(true);

    try {
      const payload = {
        session_id: interviewSessionId,
        answer: answer
      };
      if (recordedAudioBase64) {
        payload.audio_data = recordedAudioBase64;
      }

      const response = await fetch(`${API_BASE_URL}/api/interview/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setRecordedAudioBase64(null);

      if (!response.ok) {
        throw new Error('Failed to save response');
      }

      const data = await response.json();
      const wordCount = answer.split(/\s+/).length;
      addInterviewLog(`Response saved. Words: ${wordCount}. Answering time: ${formatInterviewTimer(interviewSeconds)}`, 'success');

      if (data.is_finished) {
        addInterviewLog('All questions resolved. Gathering final AI evaluation...', 'sys');
        await fetchAndRenderInterviewEvaluation();
      } else {
        setInterviewQuestionNum(prev => prev + 1);
        setInterviewQuestion(data.question);
        setInterviewAnswer('');
        addInterviewLog(`Question ${interviewQuestionNum + 1} generated by Gemini.`, 'sys');
        speakText(data.question);
        startInterviewTimer();
      }
    } catch (err) {
      addInterviewLog(`Submission error: ${err.message}`, 'err');
      alert('Failed to transmit response to API. Please submit again.');
      startInterviewTimer();
    } finally {
      setInterviewSubmitting(false);
    }
  };

  const fetchAndRenderInterviewEvaluation = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/interview/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: interviewSessionId })
      });

      if (!response.ok) {
        throw new Error('Failed to generate final report');
      }

      const data = await response.json();
      setInterviewReport(data);
      addInterviewLog('Evaluation critique complete. Score gauge initialized.', 'success');
      setInterviewStage('report');
    } catch (err) {
      addInterviewLog(`Evaluation processing error: ${err.message}`, 'err');
      alert('Failed to retrieve evaluation. Please check server logs.');
    }
  };

  const handleRestartInterview = () => {
    addInterviewLog('Resetting interview simulator...', 'sys');
    setInterviewSessionId(null);
    setInterviewQuestionNum(1);
    setInterviewAnswer('');
    stopInterviewTimer();
    setInterviewSeconds(0);
    window.speechSynthesis.cancel();
    setInterviewReport(null);
    setInterviewStage('setup');
    addInterviewLog('Simulator reset complete. Ready for configuration.', 'sys');
  };

  return (
    <div className="interview-page-container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '80px auto 40px auto' }}>
      
      {/* Return button */}
      <div style={{ marginBottom: '24px' }}>
        <Link to="/" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <div className="dashboard-card card-double-width" style={{ width: '100%' }}>
        <div className="card-border-glow"></div>
        <div className="card-header">
          <div className="card-header-left">
            <div className="card-icon-container status-purple" style={{ background: 'rgba(157, 78, 221, 0.15)', border: '1px solid rgba(157, 78, 221, 0.3)', color: 'var(--neon-purple)' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="card-title" style={{ fontSize: '24px' }}>AI Mock Interview Simulator</h2>
              <p className="card-subtitle">Conduct real-time voice interviews evaluated by Gemini AI</p>
            </div>
          </div>
          <div className="card-header-right">
            <span className="subtitle-badge" style={{ textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700', color: 'var(--neon-cyan)', background: 'rgba(0, 240, 255, 0.08)', border: '1px solid rgba(0, 240, 255, 0.25)', padding: '6px 12px', borderRadius: '20px' }}>Gemini Copilot</span>
          </div>
        </div>

        <div className="card-body" style={{ display: 'block' }}>
          {/* STAGE 1: SETUP PANEL */}
          {interviewStage === 'setup' && (
            <div className="panel visible">
              <div className="panel-header" style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>Configure Interview Session</h4>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Specify targeting parameters to initialize the AI evaluator.</p>
              </div>
              
              <form onSubmit={handleStartInterviewSimulation}>
                <div className="form-group">
                  <label>Target Position / Role</label>
                  <select 
                    value={roleSelectValue} 
                    onChange={(e) => setRoleSelectValue(e.target.value)}
                    required
                    style={{ background: 'rgba(10, 10, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', padding: '10px 12px', borderRadius: '6px', width: '100%' }}
                  >
                    <option value="Software Engineer Intern">Software Engineer Intern</option>
                    <option value="Frontend Developer Intern">Frontend Developer Intern</option>
                    <option value="Backend Engineer">Backend Engineer</option>
                    <option value="Product Manager Intern">Product Manager Intern</option>
                    <option value="Custom">Custom Role...</option>
                  </select>
                </div>

                {roleSelectValue === 'Custom' && (
                  <div className="form-group">
                    <label>Specify Custom Role</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Data Scientist Intern"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      required
                      style={{ background: 'rgba(10, 10, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', padding: '10px 12px', borderRadius: '6px', width: '100%' }}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Target Company (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Google, Stripe, Meta (Leave blank for general)"
                    value={interviewCompany}
                    onChange={(e) => setInterviewCompany(e.target.value)}
                    style={{ background: 'rgba(10, 10, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', padding: '10px 12px', borderRadius: '6px', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>Your Skills & Experience (Resume Summary)</label>
                  <textarea 
                    rows="4" 
                    placeholder="e.g. Proficient in React, Node.js, CSS Grid. Built an online Kanban board."
                    value={interviewSkills}
                    onChange={(e) => setInterviewSkills(e.target.value)}
                    style={{ background: 'rgba(10, 10, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', padding: '10px 12px', borderRadius: '6px', width: '100%' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-full btn-glow" disabled={interviewInitializing}>
                  {interviewInitializing ? "Spawning Session..." : "Initialize AI Copilot"}
                </button>
              </form>
            </div>
          )}

          {/* STAGE 2: INTERVIEW CONSOLE */}
          {interviewStage === 'console' && (
            <div className="panel visible">
              <div className="console-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', marginBottom: '20px' }}>
                <div className="session-info" style={{ display: 'flex', gap: '10px' }}>
                  <span className="session-tag" style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', textTransform: 'uppercase' }}>{roleSelectValue === 'Custom' ? customRole : roleSelectValue}</span>
                  <span className="session-tag" style={{ color: 'var(--neon-purple)', borderColor: 'rgba(157, 78, 221, 0.3)', background: 'rgba(157, 78, 221, 0.08)', border: '1px solid rgba(157, 78, 221, 0.3)', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', textTransform: 'uppercase' }}>{interviewCompany || 'General'}</span>
                  <button 
                    type="button" 
                    className={`btn-voice-toggle ${isInterviewVoiceEnabled ? '' : 'muted'}`} 
                    onClick={handleVoiceToggle}
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center' }}
                  >
                    <svg viewBox="0 0 24 24" style={{ width: '12px', height: '12px', fill: 'currentColor' }}>
                      <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.07,19.86 21,16.28 21,12C21,7.72 18.07,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.77 16.5,12M3,9H7L12,4V20L7,15H3V9Z"/>
                    </svg>
                    <span>{isInterviewVoiceEnabled ? "Voice On" : "Voice Muted"}</span>
                  </button>
                </div>
                <div className="progress-bar-container" style={{ width: '140px' }}>
                  <div className="progress-label" style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)', textAlign: 'right', marginBottom: '4px' }}>Question {interviewQuestionNum} of 3</div>
                  <div className="progress-track" style={{ background: 'rgba(255, 255, 255, 0.08)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                    <div className="progress-fill" style={{ width: `${(interviewQuestionNum / 3) * 100}%`, background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-purple))', height: '100%', borderRadius: '2px', transition: 'width 0.4s ease' }}></div>
                  </div>
                </div>
              </div>

              {/* Chat Dialog Area */}
              <div className="chat-dialog" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div className="chat-message system" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div className="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '12px', color: 'var(--bg-dark)' }}>AI</div>
                  <div className="msg-content" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px 20px', borderRadius: '0 12px 12px 12px', maxWidth: 'calc(100% - 48px)', flexGrow: 1 }}>
                    <p style={{ fontSize: '15px', color: '#ffffff', margin: 0 }}>{interviewQuestion}</p>
                  </div>
                </div>
              </div>

              {/* Voice Visualizer Wave */}
              <div className={`voice-visualizer ${voiceVisualizerState === 'hidden' ? 'hidden' : voiceVisualizerState}`} style={{ display: voiceVisualizerState === 'hidden' ? 'none' : 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', height: '32px', margin: '16px 0', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '6px' }}>
                <div className="bar"></div>
                <div className="bar" style={{ animationDelay: '0.15s', backgroundColor: 'var(--neon-purple)' }}></div>
                <div className="bar" style={{ animationDelay: '0.3s', backgroundColor: 'var(--neon-blue)' }}></div>
                <div className="bar" style={{ animationDelay: '0.45s', backgroundColor: 'var(--neon-purple)' }}></div>
                <div className="bar" style={{ animationDelay: '0.6s', backgroundColor: 'var(--neon-cyan)' }}></div>
              </div>

              {/* Response Box */}
              <div className="response-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.6)' }}>Your Response</label>
                <div className="textarea-wrapper" style={{ position: 'relative', width: '100%' }}>
                  <textarea 
                    placeholder="Type your answer here in detail. Or click the microphone to speak..."
                    value={interviewAnswer}
                    onChange={(e) => setInterviewAnswer(e.target.value)}
                    style={{ paddingRight: '52px', minHeight: '120px', background: 'rgba(10, 10, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', borderRadius: '8px', width: '100%' }}
                  />
                  <button 
                    type="button" 
                    className={`btn-mic ${isInterviewListening ? 'active' : ''}`} 
                    onClick={handleMicClick}
                    title="Speak Response"
                  >
                    <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', fill: 'currentColor' }}>
                      <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
                    </svg>
                  </button>
                </div>
                
                <div className="action-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="timer-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', fontWeight: '700' }}>
                    <span className="timer-dot"></span>
                    <span>{formatInterviewTimer(interviewSeconds)}</span>
                  </div>
                  <button 
                    onClick={handleSubmitInterviewAnswer} 
                    className="btn btn-success btn-glow" 
                    disabled={interviewSubmitting}
                  >
                    {interviewSubmitting ? "Processing Response..." : (interviewQuestionNum === 3 ? "Submit & View Report" : "Submit Response & Next")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: EVALUATION REPORT */}
          {interviewStage === 'report' && interviewReport && (
            <div className="panel visible">
              <div className="report-header" style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>Evaluation Metrics & Feedback</h4>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Detailed performance report compiled by CareerFly AI</p>
              </div>

              {/* Top Stats Panel */}
              <div className="stats-row" style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
                <div className="radial-gauge-card" style={{ flex: 1, minWidth: '180px', display: 'flex', justifyContent: 'center' }}>
                  <div className="radial-gauge" style={{ width: '140px', height: '140px', position: 'relative' }}>
                    <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="50" cy="50" r="40" style={{ fill: 'none', stroke: 'rgba(255,255,255,0.05)', strokeWidth: '7' }}></circle>
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        style={{ 
                          fill: 'none', 
                          stroke: 'url(#radial-score-grad)', 
                          strokeWidth: '8', 
                          strokeLinecap: 'round', 
                          strokeDasharray: '251.2', 
                          strokeDashoffset: `${251.2 - (interviewReport.score / 100) * 251.2}`,
                          transition: 'stroke-dashoffset 1s ease-out' 
                        }}
                      ></circle>
                      <defs>
                        <linearGradient id="radial-score-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#00f0ff" />
                          <stop offset="50%" stopColor="#7000ff" />
                          <stop offset="100%" stopColor="#ff007b" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="gauge-content" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '30px', fontWeight: '800', color: '#ffffff' }}>{interviewReport.score}%</span>
                      <span className="gauge-label" style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', letterSpacing: '1.5px', fontWeight: '600' }}>Score</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-stats-card" style={{ flex: 2, minWidth: '250px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '16px' }}>
                  <div className="stat-item" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <div className="stat-val" style={{ fontSize: '20px', fontWeight: '800', color: 'var(--neon-cyan)', marginBottom: '4px' }}>{interviewReport.metadata?.total_word_count || 0}</div>
                    <div className="stat-label" style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.8px' }}>Words Submitted</div>
                  </div>
                  <div className="stat-item" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <div className="stat-val" style={{ fontSize: '20px', fontWeight: '800', color: 'var(--neon-cyan)', marginBottom: '4px' }}>{interviewReport.metadata?.average_word_count_per_answer || 0}</div>
                    <div className="stat-label" style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.8px' }}>Avg Words / Answer</div>
                  </div>
                  <div className="stat-item" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <div className="stat-val" style={{ fontSize: '20px', fontWeight: '800', color: 'var(--neon-cyan)', marginBottom: '4px' }}>
                      {interviewReport.metadata?.is_sandbox ? "Local Sandbox" : "Gemini AI"}
                    </div>
                    <div className="stat-label" style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.8px' }}>Evaluation Engine</div>
                  </div>
                </div>
              </div>

              {/* Strengths vs Improvements */}
              <div className="critique-split" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="critique-box strengths" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '12px' }}>
                  <h5 style={{ color: 'var(--neon-success)', fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>⚡ Core Strengths</h5>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
                    {(interviewReport.strengths || []).map((str, index) => (
                      <li key={index} style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.7)', position: 'relative', paddingLeft: '20px' }}>
                        <span style={{ color: 'var(--neon-success)', position: 'absolute', left: 0 }}>▪</span>
                        {str}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="critique-box improvements" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '12px' }}>
                  <h5 style={{ color: 'var(--neon-gold)', fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>🎯 Areas for Improvement</h5>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
                    {(interviewReport.improvements || []).map((imp, index) => (
                      <li key={index} style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.7)', position: 'relative', paddingLeft: '20px' }}>
                        <span style={{ color: 'var(--neon-gold)', position: 'absolute', left: 0 }}>▪</span>
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Answer Breakdown */}
              <div className="breakdown-container" style={{ textAlign: 'left' }}>
                <h5 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>💡 Detailed Question Breakdown</h5>
                <div className="breakdown-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(interviewReport.breakdown || []).map((item, index) => (
                    <div className="breakdown-card" key={index} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                      <div className="breakdown-q-header" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px 20px', fontWeight: '700', fontSize: '14px', color: 'var(--neon-cyan)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        Question {index + 1}: {item.question}
                      </div>
                      <div className="breakdown-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="b-section your-ans">
                          <h6 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '6px' }}>Your Response</h6>
                          <p style={{ fontSize: '13px', color: '#ffffff', fontStyle: 'italic', background: 'rgba(255, 255, 255, 0.02)', padding: '10px 14px', borderRadius: '6px', borderLeft: '2px solid var(--neon-purple)', margin: 0 }}>{item.answer || '(No answer provided)'}</p>
                        </div>
                        <div className="b-section feedback-critique">
                          <h6 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '6px' }}>AI Critique & Assessment</h6>
                          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>{item.feedback || 'No feedback generated.'}</p>
                        </div>
                        <div className="b-section ideal-ans">
                          <h6 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '6px' }}>Suggested Ideal Answer</h6>
                          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', background: 'rgba(0, 255, 135, 0.02)', padding: '12px 14px', borderRadius: '6px', borderLeft: '2px solid var(--neon-success)', margin: 0 }}>{item.ideal || 'No ideal answer generated.'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset CTA */}
              <div style={{ marginTop: '32px', textAlign: 'center' }}>
                <button onClick={handleRestartInterview} className="btn btn-primary">
                  Start New Mock Session
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scrolling Live Console */}
        <footer className="console-logs" style={{ marginTop: '24px', background: 'rgba(5, 5, 15, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', overflow: 'hidden', fontFamily: 'monospace', fontSize: '11px', textAlign: 'left' }}>
          <div className="console-logs-header" style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'rgba(255,255,255,0.4)' }}>
            <span>System Log Console</span>
            <span className="pulse-indicator" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--neon-success)', boxShadow: '0 0 6px var(--neon-success)' }}></span>
          </div>
          <div ref={logsViewportRef} className="logs-viewport" style={{ height: '90px', padding: '12px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {interviewLogs.map((log, index) => (
              <div key={index} className={`log-line ${log.type}`} style={{ color: log.type === 'sys' ? '#888888' : log.type === 'success' ? 'var(--neon-success)' : log.type === 'info' ? 'var(--neon-cyan)' : log.type === 'warning' ? 'var(--neon-gold)' : 'var(--neon-danger)' }}>
                {log.text}
              </div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
