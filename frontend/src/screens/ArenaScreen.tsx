import { useState, useEffect, useRef, useCallback } from 'react';
import { getGameState, collectHeart, activateBoost, getWeather } from '../services/api';
import { Particles, ScreenLabel } from '../components/UI';
import type { UserSession, HeartObject, PlayerState } from '../types';

interface Props {
  session:   UserSession;
  gameId:    string;
  onTrade:   () => void;
  onEndGame: () => void;
  onLobby:   () => void;
}

interface ScorePopup { id: number; x: number; y: number; pts: number; color: string; }

let heartCounter = 0;

function randomHeart(): HeartObject {
  heartCounter++;
  const type = Math.random() < 0.65 ? 'red' : 'blue'; // 65% red, 35% blue
  return {
    id:        `local-${heartCounter}-${Date.now()}`,
    type,
    x:         8 + Math.random() * 84,   // keep away from edges
    y:         12 + Math.random() * 76,
    collected: false,
  };
}

function initialHearts(): HeartObject[] {
  return Array.from({ length: 8 }, randomHeart);
}

function formatTime(s: number) {
  const clamped = Math.max(0, s);
  return `${Math.floor(clamped / 60)}:${String(clamped % 60).padStart(2, '0')}`;
}

const BASE_SPAWN_INTERVAL = 2500; 

export default function ArenaScreen({ session, gameId, onTrade, onEndGame, onLobby }: Props) {
  const [hearts,      setHearts]      = useState<HeartObject[]>(initialHearts);
  const [players,     setPlayers]     = useState<PlayerState[]>([]);
  const [collecting,  setCollecting]  = useState<Set<string>>(new Set());
  const [redHearts,   setRedHearts]   = useState(0);
  const [blueHearts,  setBlueHearts]  = useState(0);
  const [totalPts,    setTotalPts]    = useState(0);
  const [boostActive, setBoostActive] = useState(false);
  const [boostZone,   setBoostZone]   = useState<{ x: number; y: number } | null>(null);
  const [timeLeft,    setTimeLeft]    = useState(300);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [weather,     setWeather]     = useState('☀️ Clear — normal spawn');
  const [spawnMult,   setSpawnMult]   = useState(1.0);
  const [gameOver,    setGameOver]    = useState(false);

  const popupId       = useRef(0);
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const boostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

 
  const timerInitialised = useRef(false);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []); 

  
  useEffect(() => {
    if (gameOver) onEndGame();
  }, [gameOver]);

 
  useEffect(() => {
    const spawnInterval = Math.round(BASE_SPAWN_INTERVAL / Math.max(spawnMult, 0.5));

    spawnRef.current = setInterval(() => {
      setHearts(prev => {
        if (prev.length >= 15) {
          return [...prev.slice(1), randomHeart()];
        }
        const count = Math.random() < 0.35 ? 2 : 1;
        const newOnes = Array.from({ length: count }, randomHeart);
        return [...prev, ...newOnes];
      });
    }, spawnInterval);

    return () => clearInterval(spawnRef.current!);
  }, [spawnMult]); 

  useEffect(() => {
    const poll = async () => {
      try {
        const state = await getGameState(gameId);
        if (!state) return;

        if (state.hearts?.length) {
          setHearts(state.hearts);
        }
        if (state.players?.length) setPlayers(state.players);

        if (!timerInitialised.current && state.timeRemaining > 0) {
          timerInitialised.current = true;
          setTimeLeft(state.timeRemaining);
        }

        if (state.spawnMultiplier) setSpawnMult(state.spawnMultiplier);

        const me = state.players?.find(p => p.username === session.username);
        if (me) {
          setRedHearts(me.redHearts);
          setBlueHearts(me.blueHearts);
          setTotalPts(me.totalPoints);
          setBoostActive(me.boostActive ?? false);
        }

        if (state.status === 'FINISHED') setGameOver(true);

      } catch {
      }
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [gameId, session.username]);

  useEffect(() => {
    getWeather('London')
      .then(w => {
        if (w.condition === 'rain') {
          setWeather('🌧️ Raining — faster spawns!');
          setSpawnMult(1.6);
        } else if (w.condition === 'snow') {
          setWeather('❄️ Snowing — slower spawns');
          setSpawnMult(0.7);
        } else {
          setWeather('☀️ Clear — normal spawn');
          setSpawnMult(1.0);
        }
      })
      .catch(() => {});
  }, []);

  
  const handleCollect = useCallback(async (heart: HeartObject) => {
    if (collecting.has(heart.id)) return;

    setCollecting(prev => new Set([...prev, heart.id]));

    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== heart.id));
      setCollecting(prev => { const n = new Set(prev); n.delete(heart.id); return n; });
    }, 380);


    const inBoostZone = (() => {
      if (!boostZone || !boostActive) return false;
      const dx = heart.x - boostZone.x;
      const dy = heart.y - boostZone.y;
      return Math.sqrt(dx * dx + dy * dy) <= 18; 
    })();

    const base   = heart.type === 'blue' ? 5 : 2;
    const earned = inBoostZone ? base * 2 : base;

    const pid = ++popupId.current;
    const popupColor = inBoostZone ? '#ffd700' : (heart.type === 'blue' ? '#5ce1e6' : '#ff4d6d');
    setScorePopups(prev => [
      ...prev,
      { id: pid, x: heart.x, y: heart.y, pts: earned, color: popupColor }
    ]);
    setTimeout(() => setScorePopups(prev => prev.filter(p => p.id !== pid)), 900);

    if (heart.type === 'blue') setBlueHearts(c => c + 1);
    else                        setRedHearts(c => c + 1);
    setTotalPts(t => t + earned);

    try {
      await collectHeart(gameId, session.username, session.token, heart.id, heart.type);
    } catch { /* keep local update */ }
  }, [collecting, boostActive, boostZone, gameId, session]);

  
  const handleBoost = async () => {
    if (totalPts < 10 || boostActive) return;

    const zone = {
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
    };

    const applyBoost = () => {
      setBoostActive(true);
      setBoostZone(zone);
      setTotalPts(t => t - 10);
      boostTimerRef.current = setTimeout(() => {
        setBoostActive(false);
        setBoostZone(null);
      }, 30_000);
    };

    try {
      const res = await activateBoost(gameId, session.username, session.token);
      if (res.success) {
        applyBoost();
        setTotalPts(res.remainingPoints);
      }
    } catch {
      applyBoost(); 
    }
  };

  useEffect(() => () => {
    if (boostTimerRef.current) clearTimeout(boostTimerRef.current);
  }, []);

  const PLAYER_STYLES = [
    { left: '50%', top: '58%', bodyClass: 'player-you',  emoji: '🌟', label: `${session.username} ★` },
    { left: '22%', top: '28%', bodyClass: 'player-pink', emoji: '🌸', label: 'PinkWizard' },
    { left: '74%', top: '22%', bodyClass: 'player-teal', emoji: '🌊', label: 'MoonGuardian' },
  ];

  const timerUrgent = timeLeft <= 30 && timeLeft > 0;

  return (
    <div className="arena-screen">

      {/* ── HUD ── */}
      <div className="hud">
        <div className={`hud-timer${timerUrgent ? ' urgent' : ''}`}>
          {formatTime(timeLeft)}
        </div>

        <div className="hud-stat hud-red">
          <span className="hud-stat-label">❤️ {redHearts}</span>
          <span className="hud-stat-sub">({redHearts * 2} pts)</span>
        </div>
        <div className="hud-stat hud-blue">
          <span className="hud-stat-label">💙 {blueHearts}</span>
          <span className="hud-stat-sub">({blueHearts * 5} pts)</span>
        </div>
        <div className="hud-stat hud-gold">
          <span className="hud-stat-label">⭐ {totalPts} pts</span>
        </div>

        {boostActive && (
          <div className="hud-boost-badge">⚡ BOOST ZONE ACTIVE!</div>
        )}

        <div style={{ flex: 1 }} />
        <span style={{ color: '#6040a0', fontSize: '.8rem' }}>Game: {gameId}</span>
        <span style={{ color: '#c89cff', fontWeight: 700 }}>🌟 {session.username}</span>
        <button className="btn btn-ghost btn-sm" onClick={onLobby}>← Lobby</button>
      </div>

      {/* ── Arena ── */}
      <div className="arena-body">
        <Particles count={8} colors={['#5ce1e666', '#9b5de544']} />

        {/* Weather banner */}
        <div className="weather-banner">{weather}</div>

        <div className="arena-canvas-wrap">
          <div className="arena-grid" />

          {/* Ambient glows */}
          <div style={{ position:'absolute', width:280, height:280, borderRadius:'50%',
            background:'radial-gradient(circle,rgba(92,225,230,.07) 0%,transparent 70%)',
            top:-60, left:-60, pointerEvents:'none' }} />
          <div style={{ position:'absolute', width:240, height:240, borderRadius:'50%',
            background:'radial-gradient(circle,rgba(155,93,229,.09) 0%,transparent 70%)',
            bottom:-40, right:60, pointerEvents:'none' }} />

          {/* ── FIX 3: Boost Zone — glowing coloured circle ── */}
          {boostActive && boostZone && (
            <div
              className="boost-zone"
              style={{
                left:   `${boostZone.x}%`,
                top:    `${boostZone.y}%`,
              }}
            >
              <div className="boost-zone-label">⚡ 2×</div>
            </div>
          )}

          {/* Players */}
          {PLAYER_STYLES.map((p, i) => (
            <div key={i} className="player-icon" style={{ left: p.left, top: p.top }}>
              <div className={`player-body ${p.bodyClass}`}>{p.emoji}</div>
              <div className="player-label">{p.label}</div>
            </div>
          ))}

          {/* ── FIX 2: Hearts — always visible, continuously spawned ── */}
          {hearts.filter(h => !h.collected).map((h, i) => {
            const inZone = boostActive && boostZone &&
              Math.sqrt((h.x - boostZone.x) ** 2 + (h.y - boostZone.y) ** 2) <= 18;
            return (
              <div
                key={h.id}
                className={`heart-obj ${h.type}${collecting.has(h.id) ? ' collecting' : ''}${inZone ? ' in-boost-zone' : ''}`}
                style={{
                  left:             `${h.x}%`,
                  top:              `${h.y}%`,
                  animationDuration: `${1.8 + (i % 5) * 0.3}s`,
                  animationDelay:    `${(i % 4) * 0.4}s`,
                }}
                onClick={() => handleCollect(h)}
              >
                {h.type === 'blue' ? '💙' : '❤️'}
                {inZone && <span className="heart-double-badge">×2</span>}
              </div>
            );
          })}

          
          {scorePopups.map(p => (
            <div
              key={p.id}
              className="score-popup"
              style={{
                left:       `${p.x}%`,
                top:        `${p.y}%`,
                transform:  'translate(-50%,-50%)',
                color:       p.color,
                textShadow: `0 0 10px ${p.color}`,
              }}
            >
              +{p.pts}
            </div>
          ))}
        </div>
      </div>

      
      <div className="arena-bottom">
        <span className="arena-hint">Click hearts to collect!</span>

        <button
          className={`btn btn-md ${boostActive ? 'btn-boost-active' : totalPts >= 10 ? 'btn-purple' : 'btn-ghost'}`}
          disabled={totalPts < 10 || boostActive}
          onClick={handleBoost}
        >
          {boostActive ? '⚡ Zone Active! (30s)' : '⚡ Boost Zone (10 pts)'}
        </button>

        <button className="btn btn-pink btn-md" onClick={onTrade}>🔄 Trade</button>
        <button className="btn btn-gold btn-sm" onClick={onEndGame}>🏆 End Game</button>
      </div>

      <ScreenLabel>SCREEN 3 — ARENA</ScreenLabel>
    </div>
  );
}