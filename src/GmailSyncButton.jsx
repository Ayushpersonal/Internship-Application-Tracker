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
          params: { format: 'metadata', metadataHeaders: ['Subject', 'From'] }
        });
        const emailDetails = detailRes.result;
        const subjectHeader = emailDetails.payload?.headers?.find(h => h.name === 'Subject');
        const subject = subjectHeader?.value || '';
        const snippet = emailDetails.snippet || '';

        const companyName = parseEmailForCompany(subject, snippet);
        if (!companyName) continue;

        const { status, priority } = classifyStage(subject, snippet);

        setApplications(prev => {
          const exists = prev.some(app => app.company.toLowerCase() === companyName.toLowerCase());
          if (exists) {
            return prev.map(app => {
              if (app.company.toLowerCase() === companyName.toLowerCase()) {
                return { ...app, status, priority, animateTrigger: true };
              }
              return app;
            });
          } else {
            return [
              ...prev,
              {
                id: `app-indeed-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                company: companyName,
                role: 'Synced via Gmail',
                priority,
                status,
                logoLetter: companyName.charAt(0).toUpperCase(),
                customBg: 'linear-gradient(135deg, #0022ee, #0072ff)',
                animateTrigger: true
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
          const applied = prev.filter(app => app.status === 'applied');
          if (applied.length > 0) {
            const targetApp = applied[Math.floor(Math.random() * applied.length)];
            setTimeout(() => {
              setApplications(current => current.map(app =>
                app.id === targetApp.id ? { ...app, animateTrigger: false } : app
              ));
            }, 1000);
            return prev.map(app =>
              app.id === targetApp.id
                ? { ...app, status: 'interviewing', priority: 'Technical Round', animateTrigger: true }
                : app
            );
          }
          return prev;
        });
        alert('✅ Gmail Sandbox Sync: Simulated Indeed notification processed!');
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
