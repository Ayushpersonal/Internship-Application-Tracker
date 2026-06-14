import React, { useRef } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || null;

export default function GmailSyncButton({ accessToken, userId, setApplications, setGmailToken, currentUser, syncing, setSyncing }) {
  const tokenClientRef = useRef(null);

  /**
   * Load the Google API (GAPI) client library dynamically.
   */
  const loadGapi = () => new Promise((resolve, reject) => {
    if (window.gapi) { resolve(window.gapi); return; }
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => resolve(window.gapi);
    script.onerror = reject;
    document.body.appendChild(script);
  });

  /**
   * Load the Google Identity Services library.
   */
  const loadGis = () => new Promise((resolve, reject) => {
    if (window.google?.accounts) { resolve(window.google.accounts); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => resolve(window.google.accounts);
    script.onerror = reject;
    document.body.appendChild(script);
  });

  /**
   * Parse Gmail messages to extract company names and classify stages.
   */
  const parseEmailForCompany = (subject, snippet) => {
    const patterns = [
      /Your application to\s+([a-zA-Z0-9\s&'.,\-]+?)(?:\s+(?:was|has|is|confirmed|received|sent|viewed)\b|$)/i,
      /\bat\s+([a-zA-Z0-9\s&'.,\-]+?)(?:\s*[\-\–\|]|\s+(?:was|has|is|confirmed|received|sent|viewed|in|on)\b|$)/i,
      /(?:Update|Message|Invitation)\s+from\s+([a-zA-Z0-9\s&'.,\-]+?)(?:\s+(?:about|for|regarding|is|has|was)\b|$)/i,
      /application\s+(?:for|to)\s+([a-zA-Z0-9\s&'.,\-]+?)(?:\s+(?:has|was|is)\b|\s*[-|]|$)/i,
      /(?:Company|Employer|at):\s*([a-zA-Z0-9\s&'.,\-]+?)(?:\r|\n|-|–|\||$)/i
    ];

    for (const pattern of patterns) {
      const match = (subject + ' ' + snippet).match(pattern);
      if (match && match[1]?.trim().length > 1) {
        return match[1].trim().replace(/[.,\s]+$/, '');
      }
    }
    return null;
  };

  /**
   * Classify the stage of the application based on email content.
   */
  const classifyStage = (subject, snippet) => {
    const text = (subject + ' ' + snippet).toLowerCase();
    if (text.includes('offer') || text.includes('congratulations') || text.includes('pleased to offer')) {
      return { status: 'offer', priority: 'Active Offer' };
    }
    if (text.includes('interview') || text.includes('schedule') || text.includes('next step') || text.includes('phone screen')) {
      return { status: 'interviewing', priority: 'Technical Round' };
    }
    return { status: 'applied', priority: 'High Priority' };
  };

  /**
   * Extract the job role title from the email subject or snippet.
   * If not mentioned, returns an empty string "".
   */
  const parseEmailForRole = (subject, snippet) => {
    const combined = (subject + ' ' + snippet).replace(/\s+/g, ' ');
    
    // Pattern 1: Match role description phrases
    const patterns = [
      /position\s+of\s+([a-zA-Z0-9\s&\-\/]+?\b(?:intern|internship|engineer|developer|designer|manager|specialist|analyst|architect|fellow|associate|lead|scientist|researcher)\b)/i,
      /application\s+(?:for|to)\s+(?:the\s+)?([a-zA-Z0-9\s&\-\/]+?\b(?:intern|internship|engineer|developer|designer|manager|specialist|analyst|architect|fellow|associate|lead|scientist|researcher)\b)/i,
      /applying\s+(?:for|to)\s+(?:the\s+)?([a-zA-Z0-9\s&\-\/]+?\b(?:intern|internship|engineer|developer|designer|manager|specialist|analyst|architect|fellow|associate|lead|scientist|researcher)\b)/i,
      /role\s+as\s+(?:a\s+)?([a-zA-Z0-9\s&\-\/]+?\b(?:intern|internship|engineer|developer|designer|manager|specialist|analyst|architect|fellow|associate|lead|scientist|researcher)\b)/i,
      /job\s+title\s*:\s*([a-zA-Z0-9\s&\-\/]+)/i
    ];

    for (const pattern of patterns) {
      const match = combined.match(pattern);
      if (match && match[1]?.trim().length > 1) {
        let role = match[1].trim();
        // Clean up trailing context
        role = role.replace(/\s+(?:at|with|for)\s+[A-Z][a-zA-Z0-9\s]*$/, '').trim();
        return role.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }
    }

    // Pattern 2: Search for common role names directly
    const commonRoles = [
      /software\s+engineer(?:\s+intern)?/i,
      /frontend\s+(?:engineer|developer)(?:\s+intern)?/i,
      /backend\s+(?:engineer|developer)(?:\s+intern)?/i,
      /fullstack\s+(?:engineer|developer)(?:\s+intern)?/i,
      /data\s+scientist(?:\s+intern)?/i,
      /product\s+manager(?:\s+intern)?/i,
      /ux\s+designer(?:\s+intern)?/i,
      /ui\s+designer(?:\s+intern)?/i,
      /cloud\s+engineer(?:\s+intern)?/i,
      /data\s+engineer(?:\s+intern)?/i,
      /devops\s+engineer(?:\s+intern)?/i,
      /ml\s+engineer(?:\s+intern)?/i,
      /machine\s+learning\s+engineer(?:\s+intern)?/i,
      /systems\s+engineer(?:\s+intern)?/i,
      /hardware\s+engineer(?:\s+intern)?/i,
      /security\s+analyst(?:\s+intern)?/i,
      /cybersecurity\s+engineer(?:\s+intern)?/i,
      /mobile\s+developer(?:\s+intern)?/i,
      /ios\s+developer(?:\s+intern)?/i,
      /android\s+developer(?:\s+intern)?/i,
      /technical\s+program\s+manager(?:\s+intern)?/i,
      /business\s+analyst(?:\s+intern)?/i,
      /internship/i
    ];

    for (const regex of commonRoles) {
      const match = combined.match(regex);
      if (match) {
        return match[0].split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }
    }

    return ""; // Empty role to let the user manually enter it
  };

  /**
   * Fetch and parse Gmail messages to extract internship details.
   */
  const fetchGmailApplications = async (token) => {
    const gapi = await loadGapi();
    await new Promise(resolve => gapi.load('client', resolve));
    gapi.client.setToken({ access_token: token });

    // Search both Indeed and LinkedIn/Glassdoor notifications
    const queries = [
      'from:no-reply@indeed.com',
      'from:jobs-noreply@linkedin.com',
      'from:noreply@glassdoor.com',
      'subject:"your application" OR subject:"application received" OR subject:"application submitted"'
    ];

    let allMessages = [];
    for (const q of queries) {
      try {
        const res = await gapi.client.request({
          path: 'https://gmail.googleapis.com/gmail/v1/users/me/messages',
          params: { q, maxResults: 25 }
        });
        if (res.result.messages) {
          allMessages = [...allMessages, ...res.result.messages];
        }
      } catch (e) {
        console.warn(`Query "${q}" failed:`, e);
      }
    }

    // De-duplicate by message id
    const seen = new Set();
    allMessages = allMessages.filter(m => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });

    if (allMessages.length === 0) {
      return 0;
    }

    let syncCount = 0;
    for (const msgInfo of allMessages) {
      try {
        const detailRes = await gapi.client.request({
          path: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgInfo.id}`,
          params: { format: 'metadata', metadataHeaders: ['Subject', 'From', 'Date'] }
        });
        const emailDetails = detailRes.result;
        const subjectHeader = emailDetails.payload?.headers?.find(h => h.name === 'Subject');
        const subject = subjectHeader?.value || '';
        const snippet = emailDetails.snippet || '';
        const dateHeader = emailDetails.payload?.headers?.find(h => h.name === 'Date');

        let formattedEmailDate = new Date().toISOString().split('T')[0];
        if (dateHeader?.value) {
          try {
            const parsedDate = new Date(dateHeader.value);
            if (!isNaN(parsedDate.getTime())) {
              formattedEmailDate = parsedDate.toISOString().split('T')[0];
            }
          } catch (e) {
            console.warn("Failed to parse email date:", e);
          }
        }

        const companyName = parseEmailForCompany(subject, snippet);
        if (!companyName) continue;

        const parsedRole = parseEmailForRole(subject, snippet);
        const { status, priority } = classifyStage(subject, snippet);

        setApplications(prev => {
          // Filter out preloaded placeholder cards
          const DEFAULT_IDS = ['app-google', 'app-meta', 'app-stripe', 'app-netflix', 'app-airbnb', 'app-vercel'];
          const cleanPrev = prev.filter(app => !DEFAULT_IDS.includes(app.id));

          const exists = cleanPrev.some(app => app.company.toLowerCase() === companyName.toLowerCase());
          if (exists) {
            return cleanPrev.map(app => {
              if (app.company.toLowerCase() === companyName.toLowerCase()) {
                const extraFields = {};
                if (status === 'applied') {
                  if (!app.appliedDate) {
                    extraFields.appliedDate = formattedEmailDate;
                  }
                  extraFields.followUp3Done = false;
                  extraFields.followUp7Done = false;
                } else if (status === 'interviewing' || status === 'offer') {
                  extraFields.responseDate = formattedEmailDate;
                }
                // Only overwrite role if it's currently generic or empty
                const updatedRole = app.role && app.role !== 'Synced via Gmail' ? app.role : parsedRole;
                return { 
                  ...app, 
                  role: updatedRole, 
                  status, 
                  priority, 
                  animateTrigger: true,
                  emailSubject: subject,
                  emailSnippet: snippet,
                  emailDate: formattedEmailDate,
                  ...extraFields 
                };
              }
              return app;
            });
          } else {
            const extraFields = {};
            if (status === 'applied') {
              extraFields.appliedDate = formattedEmailDate;
              extraFields.followUp3Done = false;
              extraFields.followUp7Done = false;
            } else if (status === 'interviewing' || status === 'offer') {
              extraFields.responseDate = formattedEmailDate;
            }
            return [
              ...cleanPrev,
              {
                id: `app-indeed-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                company: companyName,
                role: parsedRole,
                priority,
                status,
                logoLetter: companyName.charAt(0).toUpperCase(),
                customBg: 'linear-gradient(135deg, #0022ee, #0072ff)',
                animateTrigger: true,
                emailSubject: subject,
                emailSnippet: snippet,
                emailDate: formattedEmailDate,
                ...extraFields
              }
            ];
          }
        });
        syncCount++;
      } catch (err) {
        console.warn('Error fetching email detail:', err);
      }
    }

    return syncCount;
  };

  /**
   * Main sync handler.
   */
  const syncIndeedApplications = async () => {
    // --- Sandbox / Mock Mode ---
    if (currentUser?.isMock || accessToken === 'sandbox-mock-token') {
      setSyncing(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setApplications(prev => {
          // Remove default/preloaded apps
          const DEFAULT_IDS = ['app-google', 'app-meta', 'app-stripe', 'app-netflix', 'app-airbnb', 'app-vercel'];
          const cleanPrev = prev.filter(app => !DEFAULT_IDS.includes(app.id));

          // Mock two synchronized apps to test both cases: with parsed role and with empty/unspecified role.
          const todayStr = new Date().toISOString().split('T')[0];
          const mockOpenAI = {
            id: `app-mock-openai-${Date.now()}`,
            company: 'OpenAI',
            role: 'Software Engineer Intern', // Found role!
            priority: 'High Priority',
            status: 'applied',
            logoLetter: 'O',
            customBg: 'linear-gradient(135deg, #a855f7, #6366f1)',
            appliedDate: todayStr,
            followUp3Done: false,
            followUp7Done: false,
            animateTrigger: true,
            emailSubject: 'Confirming your application for Software Engineer Intern',
            emailSnippet: 'Thank you for applying to the Software Engineer Intern role at OpenAI. We have received your application and will review it soon. Our team is impressed by your projects and will reach out if there is a match.',
            emailDate: todayStr
          };

          const mockSpaceX = {
            id: `app-mock-spacex-${Date.now()}`,
            company: 'SpaceX',
            role: '', // Empty role to test manual entering!
            priority: 'Medium',
            status: 'applied',
            logoLetter: 'S',
            customBg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            appliedDate: todayStr,
            followUp3Done: false,
            followUp7Done: false,
            animateTrigger: true,
            emailSubject: 'SpaceX Careers Application Update',
            emailSnippet: 'We received your application for our technical internship positions. We are reviewing matching candidates at our Boca Chica and Hawthorne offices. You can monitor your status via your candidate profile.',
            emailDate: todayStr
          };

          return [...cleanPrev, mockOpenAI, mockSpaceX];
        });
        alert('✅ Gmail Sandbox Sync: Loaded OpenAI and SpaceX applications from Mock Inbox!');
      } finally {
        setSyncing(false);
      }
      return;
    }

    // --- Real Mode: Try existing token first ---
    let token = accessToken;

    if (token && token !== 'sandbox-mock-token') {
      setSyncing(true);
      try {
        const count = await fetchGmailApplications(token);
        alert(`✅ Indeed Gmail Sync Complete! Found and updated ${count} application(s).`);
        return;
      } catch (err) {
        console.warn('Existing token failed, re-requesting Gmail scope:', err.message);
        // Token may be expired or missing Gmail scope, fall through to re-auth
      } finally {
        setSyncing(false);
      }
    }

    // --- Request a fresh Gmail-scoped token using Google Identity Services ---
    try {
      const accounts = await loadGis();
      const clientId = GOOGLE_CLIENT_ID;

      if (!clientId) {
        alert('⚠️ Google Client ID not configured. Please sign in with Google first to enable Gmail sync.');
        return;
      }

      setSyncing(true);

      await new Promise((resolve, reject) => {
        const client = accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/gmail.readonly',
          callback: async (response) => {
            if (response.error) {
              reject(new Error(response.error));
              return;
            }
            const newToken = response.access_token;
            setGmailToken(newToken);
            sessionStorage.setItem('gmailToken', newToken);
            try {
              const count = await fetchGmailApplications(newToken);
              alert(`✅ Indeed Gmail Sync Complete! Found and updated ${count} application(s).`);
              resolve();
            } catch (fetchErr) {
              reject(fetchErr);
            }
          }
        });
        client.requestAccessToken({ prompt: 'consent' });
      });
    } catch (err) {
      console.error('Gmail sync error:', err);
      alert('❌ Gmail sync failed: ' + (err.message || 'Unknown error. Please sign in with Google to enable sync.'));
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
        fontSize: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        opacity: syncing ? 0.7 : 1,
      }}
    >
      {syncing ? (
        <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>↻</span> Scanning Inbox...</>
      ) : (
        <>⚡ Sync with Indeed via Gmail</>
      )}
    </button>
  );
}
