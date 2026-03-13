import { useState } from 'react';
import { sendTrade } from '../services/api';
import { ScreenLabel, Divider } from '../components/UI';
import type { UserSession } from '../types';

interface Props {
  session: UserSession;
  gameId:  string;
  onClose: () => void;
  onSent:  (msg: string) => void;
}

export default function TradePopup({ session, gameId, onClose, onSent }: Props) {
  const [target,    setTarget]    = useState('');
  const [amount,    setAmount]    = useState('');
  const [heartType, setHeartType] = useState<'red' | 'blue'>('red');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);

  // Event-driven: Send Trade button click
  const handleSend = async () => {
    if (!target.trim()) { setError('Please enter a target username'); return; }
    if (!amount || parseInt(amount) < 1) { setError('Please enter a valid amount'); return; }
    setLoading(true); setError('');
    try {
      // Interoperability: POST /api/game/trade → Spring Boot → Heart Game API
      const res = await sendTrade(gameId, session.username, target.trim(), session.token, parseInt(amount), heartType);
      if (res.success) {
        onSent(`💌 Sent ${amount} ${heartType} hearts to ${target}!`);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Trade failed. Please check the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const showPreview = target.trim() && amount && parseInt(amount) > 0;

  return (
    <div className="trade-overlay">
      <div className="card card-glow trade-modal">
        <div className="trade-icon">🔄</div>
        <h2 className="trade-title">Trade Hearts</h2>
        <p className="trade-desc">Send collected hearts to a fellow guardian</p>

        <Divider />

        {/* Heart type selector */}
        <div className="trade-type-row">
          <button
            className={`trade-type-btn${heartType === 'red' ? ' active-red' : ''}`}
            onClick={() => setHeartType('red')}>
            ❤️ Red (+2 pts)
          </button>
          <button
            className={`trade-type-btn${heartType === 'blue' ? ' active-blue' : ''}`}
            onClick={() => setHeartType('blue')}>
            💙 Blue (+5 pts)
          </button>
        </div>

        {/* Inputs */}
        <div className="input-wrap">
          <span className="input-icon">👤</span>
          <input type="text" placeholder="Target username" value={target}
            onChange={e => setTarget(e.target.value)} />
        </div>
        <div className="input-wrap">
          <span className="input-icon">💖</span>
          <input type="number" placeholder="Amount" min="1" value={amount}
            onChange={e => setAmount(e.target.value)} />
        </div>

        {/* Live preview */}
        {showPreview && (
          <div className="trade-preview">
            <div className="trade-preview-label">Trade Preview</div>
            <div className="trade-preview-text">
              You will send{' '}
              <strong style={{ color: heartType === 'red' ? '#ff4d6d' : '#5ce1e6' }}>
                {amount} {heartType} hearts
              </strong>
              {' '}to{' '}
              <strong style={{ color:'#c89cff' }}>{target}</strong>
            </div>
          </div>
        )}

        {error && <div className="login-error">⚠️ {error}</div>}

        <div className="trade-actions">
          <button className="btn btn-outline btn-md" onClick={onClose}>✕ Cancel</button>
          <button className="btn btn-pink btn-md" onClick={handleSend} disabled={loading}>
            {loading ? '⏳...' : '💌 Send Trade'}
          </button>
        </div>
      </div>
      <ScreenLabel>SCREEN 4 — TRADE POPUP</ScreenLabel>
    </div>
  );
}