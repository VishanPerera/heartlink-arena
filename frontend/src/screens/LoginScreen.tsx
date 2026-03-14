import { useState } from 'react';
import { loginUser, registerUser } from '../services/api';
import { Particles, ScreenLabel, Divider } from '../components/UI';
import type { UserSession } from '../types';

interface Props {
  onLogin: (session: UserSession) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [tab,      setTab]      = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email,    setEmail]    = useState('');
  const [error,    setError]    = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [loading,  setLoading]  = useState(false);

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateLogin = () => {
    const nextErrors: { username?: string; password?: string } = {};

    if (!username.trim()) nextErrors.username = 'Username is required';
    else if (!usernameRegex.test(username.trim())) nextErrors.username = 'Username must be 3-20 letters, numbers, or _';

    if (!password) nextErrors.password = 'Password is required';

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateRegister = () => {
    const nextErrors: { username?: string; email?: string; password?: string; confirmPassword?: string } = {};

    if (!username.trim()) nextErrors.username = 'Username is required';
    else if (!usernameRegex.test(username.trim())) nextErrors.username = 'Username must be 3-20 letters, numbers, or _';

    if (!email.trim()) nextErrors.email = 'Email is required';
    else if (!emailRegex.test(email.trim())) nextErrors.email = 'Enter a valid email address';

    if (!password) nextErrors.password = 'Password is required';
    else if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters';

    if (!confirmPassword) nextErrors.confirmPassword = 'Confirm password is required';
    else if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const clearFieldError = (key: 'username' | 'email' | 'password' | 'confirmPassword') => {
    setFieldErrors(prev => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Event-driven
  const handleLogin = async () => {
    if (!validateLogin()) {
      setError('Please fix the highlighted fields');
      return;
    }
    setLoading(true); setError('');
    try {
      // Interoperability
      const res = await loginUser(username, password);
      if (res.success && res.token && res.username) {
        // Virtual identity
        onLogin({ username: res.username, token: res.token, heartsBalance: res.heartsBalance });
      } else {
        setError(' please enter Username and password again');
      }
    } catch {
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  // Event-driven
  const handleRegister = async () => {
    if (!validateRegister()) {
      setError('Please fix the highlighted fields');
      return;
    }
    setLoading(true); setError('');
    try {
      const res = await registerUser(username.trim(), password, email.trim());
      if (res.success && res.token && res.username) {
        onLogin({ username: res.username, token: res.token, heartsBalance: res.heartsBalance });
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch {
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') tab === 'login' ? handleLogin() : handleRegister();
  };

  return (
    <div className="login-screen">
      <Particles count={22} />

      {/* Decorative blobs */}
      <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(155,93,229,.12) 0%,transparent 70%)', top:-100, right:-100, pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,105,180,.1) 0%,transparent 70%)', bottom:-80, left:-80, pointerEvents:'none' }} />

      <div className="card card-glow login-card">
        <span className="login-big-heart">💜</span>

        <div>
          <h1 className="login-title">HeartLink<br />Arena</h1>
          <p className="login-subtitle">Magical Hearts Collection</p>
        </div>

        <Divider />

        {/* Tab switcher */}
        <div className="login-tab-row">
            <button className={`login-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError(''); setFieldErrors({}); }}>🔐 Login</button>
            <button className={`login-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setError(''); setFieldErrors({}); }}>🌸 Register</button>
        </div>

        {/* Inputs */}
        <div className="input-wrap">
          <span className="input-icon">👤</span>
            <input type="text" placeholder="Username" value={username}
              className={fieldErrors.username ? 'invalid' : ''}
              onChange={e => { setUsername(e.target.value); clearFieldError('username'); setError(''); }} onKeyDown={handleKeyDown} />
        </div>
          {fieldErrors.username && <div className="input-field-error">{fieldErrors.username}</div>}

        {tab === 'register' && (
            <>
              <div className="input-wrap">
                <span className="input-icon">📧</span>
                <input type="email" placeholder="Email" value={email}
                  className={fieldErrors.email ? 'invalid' : ''}
                  onChange={e => { setEmail(e.target.value); clearFieldError('email'); setError(''); }} onKeyDown={handleKeyDown} />
              </div>
              {fieldErrors.email && <div className="input-field-error">{fieldErrors.email}</div>}
            </>
        )}

        <div className="input-wrap">
          <span className="input-icon">🔒</span>
            <input type="password" placeholder="Password" value={password}
              className={fieldErrors.password ? 'invalid' : ''}
              onChange={e => { setPassword(e.target.value); clearFieldError('password'); setError(''); }} onKeyDown={handleKeyDown} />
        </div>
          {fieldErrors.password && <div className="input-field-error">{fieldErrors.password}</div>}

          {tab === 'register' && (
            <>
              <div className="input-wrap">
                <span className="input-icon">✅</span>
                <input type="password" placeholder="Confirm Password" value={confirmPassword}
                  className={fieldErrors.confirmPassword ? 'invalid' : ''}
                  onChange={e => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); setError(''); }} onKeyDown={handleKeyDown} />
              </div>
              {fieldErrors.confirmPassword && <div className="input-field-error">{fieldErrors.confirmPassword}</div>}
            </>
          )}

        {error && <div className="login-error">⚠️ {error}</div>}

        <button
          className="btn btn-pink btn-lg"
          style={{ width:'100%', justifyContent:'center', animation:'glowPulse 2s ease-in-out infinite' }}
          onClick={tab === 'login' ? handleLogin : handleRegister}
          disabled={loading}
        >
          {loading ? '⏳ Please wait...' : tab === 'login' ? '✨ Enter the Arena' : '🌸 Create Account'}
        </button>

        <p className="login-footer">💖 A world of magical hearts awaits</p>
      </div>

      <ScreenLabel>SCREEN 1 — LOGIN</ScreenLabel>
    </div>
  );
}