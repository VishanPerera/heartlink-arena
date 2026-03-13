import { useState } from 'react';
import './styles/global.css';

import LoginScreen       from './screens/LoginScreen';
import LobbyScreen       from './screens/LobbyScreen';
import ArenaScreen       from './screens/ArenaScreen';
import TradePopup        from './screens/TradePopup';
import LeaderboardScreen from './screens/LeaderboardScreen';
import { Toast, PrototypeNav } from './components/UI';
import type { UserSession } from './types';

type Screen = 'login' | 'lobby' | 'arena' | 'leaderboard';

export default function App() {
  const [screen,     setScreen]     = useState<Screen>('login');
  const [session,    setSession]    = useState<UserSession | null>(null);
  const [gameId,     setGameId]     = useState<string>('');
  const [showTrade,  setShowTrade]  = useState(false);
  const [toast,      setToast]      = useState<string | null>(null);

  const goTo = (s: string) => {
    if (s === 'trade') { setShowTrade(true); return; }
    setShowTrade(false);
    setScreen(s as Screen);
  };

  const showToast = (msg: string) => { setToast(msg); };

  // Fallback session for direct navigation via prototype nav
  const safeSession: UserSession = session ?? { username: 'StarGuardian', token: 'demo-token', heartsBalance: 100 };
  const safeGameId = gameId || 'HL-0000';

  return (
    <div className="screen-wrapper">

      {/* ── Screens ── */}
      <div key={screen} style={{ position:'absolute', inset:0, animation:'fadeSlideIn .45s ease' }}>
        {screen === 'login' && (
          <LoginScreen onLogin={sess => { setSession(sess); goTo('lobby'); }} />
        )}
        {screen === 'lobby' && (
          <LobbyScreen
            session={safeSession}
            onEnterArena={gid => { setGameId(gid); goTo('arena'); }}
          />
        )}
        {screen === 'arena' && (
          <ArenaScreen
            session={safeSession}
            gameId={safeGameId}
            onTrade={() => goTo('trade')}
            onEndGame={() => goTo('leaderboard')}
            onLobby={() => goTo('lobby')}
          />
        )}
        {screen === 'leaderboard' && (
          <LeaderboardScreen
            session={safeSession}
            gameId={safeGameId}
            onPlayAgain={() => goTo('lobby')}
          />
        )}
      </div>

      {/* ── Trade popup — layered above arena ── */}
      {showTrade && (
        <TradePopup
          session={safeSession}
          gameId={safeGameId}
          onClose={() => setShowTrade(false)}
          onSent={msg => { setShowTrade(false); showToast(msg); }}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {/* ── Prototype nav chrome ── */}
      <PrototypeNav screen={showTrade ? 'trade' : screen} goTo={goTo} />

    </div>
  );
}