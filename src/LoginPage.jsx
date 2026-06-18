import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage({
  currentUser,
  handleAuthSubmit,
  handleGoogleSignIn,
  handleLaunchSandbox,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authError,
  setAuthError,
  authLoading
}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'signup'

  const targetRedirect = searchParams.get('redirect') || '/';

  // If user gets authenticated, automatically redirect
  useEffect(() => {
    if (currentUser) {
      navigate(targetRedirect);
    }
  }, [currentUser, targetRedirect, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleAuthSubmit(e, authTab);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '120px 20px 40px 20px' }}>
      <div className="dashboard-card" style={{ maxWidth: '420px', width: '100%', padding: '0' }}>
        <div className="card-border-glow"></div>
        <div className="modal-header" style={{ padding: '20px 24px 10px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {authTab === 'login' ? 'Account Login' : 'Student Register'}
          </h3>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          <div className="auth-tabs" style={{ marginBottom: '20px' }}>
            <button 
              className={`auth-tab-btn ${authTab === 'login' ? 'active' : ''}`}
              onClick={() => { setAuthTab('login'); setAuthError(''); }}
            >
              Login
            </button>
            <button 
              className={`auth-tab-btn ${authTab === 'signup' ? 'active' : ''}`}
              onClick={() => { setAuthTab('signup'); setAuthError(''); }}
            >
              Register
            </button>
          </div>

          {authError && (
            <div className="auth-error-alert" style={{ marginBottom: '20px' }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="name@university.edu"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Password</label>
              <input 
                type="password" 
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
                <Loader2 size={16} className="animate-spin" />
              ) : (
                authTab === 'login' ? 'Sign In' : 'Sign Up Free'
              )}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', color: 'rgba(255, 255, 255, 0.35)', fontSize: '11px', textTransform: 'uppercase' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }}></div>
            <span style={{ padding: '0 10px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }}></div>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            type="button"
            className="btn btn-secondary btn-full"
            style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}
            disabled={authLoading}
          >
            <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V13.4h6.86c-.277 1.56-1.602 4.585-6.86 4.585-4.54 0-8.24-3.765-8.24-8.4s3.7-8.4 8.24-8.4c2.58 0 4.307 1.095 5.298 2.045l2.465-2.37C18.435 1.21 15.62 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"/>
            </svg>
            Continue with Google
          </button>

          <button 
            onClick={() => {
              handleLaunchSandbox();
            }}
            type="button"
            className="btn btn-secondary btn-full btn-glow"
            style={{ display: 'flex', justifyContent: 'center', gap: '8px', border: '1px dashed var(--neon-gold)', color: 'var(--neon-gold)' }}
          >
            Launch Sandbox (Bypass Auth)
          </button>
        </div>
      </div>
    </div>
  );
}
