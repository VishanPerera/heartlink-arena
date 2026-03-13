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
  const [email,    setEmail]    = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // Event-driven: Login button click
  const handleLogin = async () => {
    if (!username || !password) { setError('Please enter username and password'); return; }
    setLoading(true); setError('');
    try {
      // Interoperability: POST /api/auth/login → Spring Boot → (mock or Heart API)
      const res = await loginUser(username, password);
      if (res.success && res.token && res.username) {
        // Virtual identity: Store session from API
        onLogin({ username: res.username, token: res.token, heartsBalance: res.heartsBalance });
      } else {
        setError(res.message || 'Login failed');
      }
    } catch {
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  // Event-driven: Register button click
  const handleRegister = async () => {
    if (!username || !password) { setError('Please fill in username and password'); return; }
    setLoading(true); setError('');
    try {
      const res = await registerUser(username, password, email);
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
          <button className={`login-tab${tab === 'login' ? ' active' : ''}`}    onClick={() => { setTab('login');    setError(''); }}>🔐 Login</button>
          <button className={`login-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>🌸 Register</button>
        </div>

        {/* Inputs */}
        <div className="input-wrap">
          <span className="input-icon">👤</span>
          <input type="text" placeholder="Username" value={username}
            onChange={e => setUsername(e.target.value)} onKeyDown={handleKeyDown} />
        </div>

        {tab === 'register' && (
          <div className="input-wrap">
            <span className="input-icon">📧</span>
            <input type="email" placeholder="Email (optional)" value={email}
              onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} />
          </div>
        )}

        <div className="input-wrap">
          <span className="input-icon">🔒</span>
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
        </div>

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