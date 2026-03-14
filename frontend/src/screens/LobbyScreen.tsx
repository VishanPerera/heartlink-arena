import { useState, useEffect } from 'react';
import { createGame, joinGame, getAvailableGames } from '../services/api';
import { Particles, ScreenLabel } from '../components/UI';
import type { UserSession, GameSummary } from '../types';

interface Props {
  session: UserSession;
  onEnterArena: (gameId: string) => void;
}

export default function LobbyScreen({ session, onEnterArena }: Props) {
  const [gameId,  setGameId]  = useState('');
  const [games,   setGames]   = useState<GameSummary[]>([]);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // Interoperability
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAvailableGames();
        if (res.availableGames) setGames(res.availableGames);
      } catch { /* silently fail poll */ }
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  // Event-driven
  const handleCreate = async () => {
    setLoading(true); setError('');
    try {
      const res = await createGame(session.username, session.token);
      if (res.success && res.gameId) onEnterArena(res.gameId);
      else setError(res.message);
    } catch {
      setError('Failed to create game. Is the backend running?');
    } finally { setLoading(false); }
  };

  // Event-driven
  const handleJoin = async (gid?: string) => {
    const id = gid || gameId.trim();
    if (!id) { setError('Please enter a Game ID'); return; }
    setLoading(true); setError('');
    try {
      const res = await joinGame(id, session.username, session.token);
      if (res.success && res.gameId) onEnterArena(res.gameId);
      else setError(res.message);
    } catch {
      setError('Failed to join game. Is the backend running?');
    } finally { setLoading(false); }
  };

  const ICONS = ['🏟️','🌸','⚡','🔮','🌙'];

  return (
    <div className="lobby-screen">
      <Particles count={12} />
      <div style={{ position:'absolute', right:-80, top:'50%', transform:'translateY(-50%)', width:500, height:500, borderRadius:'50%', border:'2px solid rgba(92,225,230,.06)', background:'radial-gradient(ellipse,rgba(91,30,233,.08) 0%,transparent 70%)', pointerEvents:'none' }} />

      {/* Top bar */}
      <div className="topbar">
        <span className="topbar-logo">💜 HeartLink Arena</span>
        <div style={{ flex:1 }} />
        <div className="topbar-hearts">💖 {session.heartsBalance} Hearts</div>
        <div className="topbar-avatar">🌟</div>
        <span className="topbar-username">{session.username}</span>
      </div>

      <div className="lobby-body">

        {/* Left panel */}
        <div className="lobby-left">
          {error && <div className="login-error">⚠️ {error}</div>}

          <div className="card lobby-panel-card">
            <p className="lobby-panel-title">🎮 Create Game</p>
            <p className="lobby-panel-desc">Start a new arena and invite friends!</p>
            <button className="btn btn-pink btn-md" style={{ width:'100%', justifyContent:'center' }}
              onClick={handleCreate} disabled={loading}>
              {loading ? '⏳...' : '✨ Create Game'}
            </button>
          </div>

          <div className="card lobby-panel-card">
            <p className="lobby-panel-title">🔗 Join by ID</p>
            <p className="lobby-panel-desc">Enter your friend's game code</p>
            <div className="join-row">
              <div className="input-wrap" style={{ flex:1 }}>
                <span className="input-icon">🎯</span>
                <input type="text" placeholder="e.g. HL-7821" value={gameId}
                  onChange={e => setGameId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()} />
              </div>
              <button className="btn btn-purple btn-sm" onClick={() => handleJoin()} disabled={loading}>Join</button>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="lobby-right">
          <div className="lobby-right-header">
            <p className="lobby-right-title">🌟 Available Games</p>
            <span style={{ color:'#6040a0', fontSize:'.78rem' }}>{games.length} games active</span>
          </div>
          <div className="games-list">
            {games.map((g, i) => {
              const full = g.playerCount >= g.maxPlayers;
              const fill = g.playerCount / g.maxPlayers;
              return (
                <div key={g.gameId} className="card game-item"
                  style={{ animationDelay:`${i * 0.1}s`, cursor: full ? 'default' : 'pointer' }}
                  onClick={() => !full && handleJoin(g.gameId)}>
                  <div className="game-item-icon">{ICONS[i % ICONS.length]}</div>
                  <div className="game-item-info">
                    <div className="game-item-name">{g.hostUsername}'s Arena</div>
                    <div className="game-item-meta">ID: {g.gameId} · {g.status}</div>
                    <div className="player-bar">
                      <div className="player-bar-fill" style={{ width:`${fill * 100}%` }} />
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ color: full ? '#6040a0' : '#c89cff', fontWeight:800, fontSize:'.85rem' }}>
                      {g.playerCount}/{g.maxPlayers} 👥
                    </div>
                    <div style={{ fontSize:'.72rem', marginTop:4, color: full ? '#6040a0' : '#5ce1e6' }}>
                      {full ? '🔒 Full' : 'Join!'}
                    </div>
                  </div>
                </div>
              );
            })}
            {games.length === 0 && (
              <div style={{ color:'#6040a0', textAlign:'center', padding:'40px 0', fontSize:'.9rem' }}>
                No games yet. Create one above! 🌸
              </div>
            )}
          </div>
        </div>
      </div>

      <ScreenLabel>SCREEN 2 — LOBBY</ScreenLabel>
    </div>
  );
}