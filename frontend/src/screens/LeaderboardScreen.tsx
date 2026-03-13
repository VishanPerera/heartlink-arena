
import { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/api';
import { Particles, ScreenLabel, Divider } from '../components/UI';
import type { UserSession, LeaderboardEntry } from '../types';

interface Props {
  session:     UserSession;
  gameId:      string;
  onPlayAgain: () => void;
}

const RANK_EMOJIS = ['🌟','🌸','🌊','⚡','🔮','🌙'];

export default function LeaderboardScreen({ session, gameId, onPlayAgain }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Interoperability: GET /api/game/{gameId}/leaderboard
    getLeaderboard(gameId).then(res => {
      if (res.rankings?.length) setEntries(res.rankings);
    }).catch(() => {
      // Fallback mock data if backend unavailable
      setEntries([
        { rank:1, username: session.username, redHearts:7, blueHearts:3, totalPoints:29 },
        { rank:2, username:'PinkWizard',  redHearts:5, blueHearts:4, totalPoints:25 },
        { rank:3, username:'MoonGuardian',redHearts:3, blueHearts:2, totalPoints:16 },
        { rank:4, username:'StormHunter', redHearts:2, blueHearts:1, totalPoints:9  },
      ]);
    });
  }, [gameId]);

  const rankClass = (r: number) => r === 1 ? 'lb-rank-1' : r === 2 ? 'lb-rank-2' : r === 3 ? 'lb-rank-3' : 'lb-rank-n';
  const ptsClass  = (r: number) => r === 1 ? 'lb-pts-1'  : r === 2 ? 'lb-pts-2'  : 'lb-pts-n';

  return (
    <div className="lb-screen">
      <Particles count={25} colors={['#ffd700','#ff69b4','#c89cff','#5ce1e6','#ff2d87']} />

      <div className="card card-glow lb-card">
        <div>
          <span className="lb-trophy">🏆</span>
          <h2 className="lb-title">Final Scores</h2>
          <p className="lb-subtitle">Game {gameId} · Round Complete</p>
        </div>

        <Divider />

        <div className="lb-list">
          {entries.map((e, i) => {
            const isYou = e.username === session.username;
            return (
              <div key={e.rank}
                className={`lb-row${isYou ? ' lb-row-you' : ''}`}
                style={{ animationDelay:`${i * 0.12}s` }}>
                <div className={`lb-rank ${rankClass(e.rank)}`}>{e.rank}</div>
                <div className="lb-emoji">{RANK_EMOJIS[i % RANK_EMOJIS.length]}</div>
                <div className="lb-info">
                  <div className="lb-name">
                    {e.username}
                    {isYou && <span style={{ color:'#ffd700', fontSize:'.75rem' }}> 👑 You</span>}
                  </div>
                  <div className="lb-detail">❤️ {e.redHearts} Red · 💙 {e.blueHearts} Blue</div>
                </div>
                <div className={ptsClass(e.rank)}>{e.totalPoints} pts</div>
              </div>
            );
          })}
        </div>

        <div className="lb-actions">
          <button className="btn btn-pink btn-lg"
            style={{ animation:'glowPulse 2s ease-in-out infinite' }}
            onClick={onPlayAgain}>
            💖 Play Again
          </button>
        </div>

        <p className="lb-footer">✨ You earned 3 Star Shards this round!</p>
      </div>

      <ScreenLabel>SCREEN 5 — LEADERBOARD</ScreenLabel>
    </div>
  );
}