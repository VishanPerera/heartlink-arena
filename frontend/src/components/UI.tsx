import React, { useEffect, useRef } from 'react';

// ── Particles ──────────────────────────────────────────────────────────
interface ParticlesDef {
  id: number; x: number; delay: number; dur: number; size: number;
  color: string; emoji: string;
}
export function Particles({ count = 16, colors = ['#ff69b4','#c89cff','#ff2d87','#ffd700','#5ce1e6'] }) {
  const list = useRef<ParticlesDef[]>(
    Array.from({ length: count }, (_, i) => ({
      id: i, x: Math.random() * 100,
      delay: Math.random() * 8, dur: 7 + Math.random() * 7,
      size: 0.8 + Math.random() * 0.9,
      color: colors[Math.floor(Math.random() * colors.length)],
      emoji: ['💜','💗','✨','💖','🌸','⭐','💫'][Math.floor(Math.random() * 7)],
    }))
  ).current;

  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
      {list.map(p => (
        <div key={p.id} className="particle" style={{
          left:`${p.x}%`, bottom:'-40px', fontSize:`${p.size}rem`,
          color:p.color, filter:`drop-shadow(0 0 6px ${p.color})`,
          animationDuration:`${p.dur}s`, animationDelay:`${p.delay}s`,
        }}>{p.emoji}</div>
      ))}
    </div>
  );
}

// ── ScreenLabel ────────────────────────────────────────────────────────
export function ScreenLabel({ children }: { children: React.ReactNode }) {
  return <div className="screen-label">{children}</div>;
}

// ── Divider ────────────────────────────────────────────────────────────
export function Divider() {
  return <div className="divider" />;
}

// ── Toast ──────────────────────────────────────────────────────────────
export function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, []);
  return <div className="toast">{msg}</div>;
}

// ── Prototype Navigator ───────────────────────────────────────────────
const NAV = [
  { id:'login',       label:'1. Login',       icon:'🔐' },
  { id:'lobby',       label:'2. Lobby',        icon:'🏠' },
  { id:'arena',       label:'3. Arena',        icon:'⚔️'  },
  { id:'trade',       label:'4. Trade Popup',  icon:'🔄' },
  { id:'leaderboard', label:'5. Leaderboard',  icon:'🏆' },
];
export function PrototypeNav({ screen, goTo }: { screen: string; goTo: (s: string) => void }) {
  return (
    <div className="proto-nav">
      <div className="proto-badge">💜 HeartLink Arena · Prototype</div>
      <div className="proto-panel">
        <div className="proto-panel-label">JUMP TO SCREEN</div>
        {NAV.map(s => (
          <button key={s.id} onClick={() => goTo(s.id)}
            className={`proto-btn${screen === s.id ? ' current' : ''}`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}