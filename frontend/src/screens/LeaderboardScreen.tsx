import { useState, useEffect, useRef } from 'react';
import { getLeaderboard } from '../services/api';
import { Particles, ScreenLabel, Divider } from '../components/UI';
import type { UserSession, LeaderboardEntry } from '../types';
import axios from 'axios';

interface Props {
  session:     UserSession;
  gameId:      string;
  onPlayAgain: () => void;
}

const RANK_EMOJIS = ['🌟','🌸','🌊','⚡','🔮','🌙'];

interface Confetti { id: number; x: number; color: string; delay: number; dur: number; }

function makeConfetti(): Confetti[] {
  const colors = ['#ff2d87','#ffd700','#9b5de5','#5ce1e6','#ff69b4','#fff'];
  return Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[i % colors.length],
    delay: Math.random() * 1.2,
    dur:   0.8 + Math.random() * 0.8,
  }));
}

export default function LeaderboardScreen({ session, gameId, onPlayAgain }: Props) {
  const [entries,       setEntries]       = useState<LeaderboardEntry[]>([]);
  const [doubled,       setDoubled]       = useState(false);

  const [showPuzzle,    setShowPuzzle]    = useState(true);   // show puzzle FIRST
  const [puzzleImg,     setPuzzleImg]     = useState('');
  const [puzzleAnswer,  setPuzzleAnswer]  = useState(-1);
  const [userAnswer,    setUserAnswer]    = useState('');
  const [puzzleLoading, setPuzzleLoading] = useState(true);
  const [puzzleResult,  setPuzzleResult]  = useState<'correct'|'wrong'|null>(null);
  const [confetti,      setConfetti]      = useState<Confetti[]>([]);
  const [submitting,    setSubmitting]    = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getLeaderboard(gameId).then(res => {
      if (res.rankings?.length) setEntries(res.rankings);
    }).catch(() => {
      setEntries([
        { rank:1, username: session.username, redHearts:7, blueHearts:3, totalPoints:29 },
        { rank:2, username:'PinkWizard',  redHearts:5, blueHearts:4, totalPoints:25 },
        { rank:3, username:'MoonGuardian',redHearts:3, blueHearts:2, totalPoints:16 },
        { rank:4, username:'StormHunter', redHearts:2, blueHearts:1, totalPoints:9  },
      ]);
    });
  }, [gameId]);

  useEffect(() => {
    setPuzzleLoading(true);
    axios.get('https://marcconrad.com/uob/heart/api.php?out=json&base64=no')
      .then(res => {
        // API returns: { question: "<image url>", solution: <number> }
        setPuzzleImg(res.data.question);
        setPuzzleAnswer(Number(res.data.solution));
        setPuzzleLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      })
      .catch(() => {
        setPuzzleLoading(false);
        setShowPuzzle(false);
      });
  }, []);

  const handleSubmit = () => {
    if (!userAnswer.trim() || submitting) return;
    setSubmitting(true);

    const guess = parseInt(userAnswer.trim(), 10);

    if (guess === puzzleAnswer) {
      setEntries(prev => prev.map(e =>
        e.username === session.username
          ? { ...e, totalPoints: e.totalPoints * 2 }
          : e
      ));
      setDoubled(true);
      setPuzzleResult('correct');
      setConfetti(makeConfetti());
      setTimeout(() => setShowPuzzle(false), 3500);
    } else {
      setPuzzleResult('wrong');
      setTimeout(() => setShowPuzzle(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const rankClass = (r: number) => r === 1 ? 'lb-rank-1' : r === 2 ? 'lb-rank-2' : r === 3 ? 'lb-rank-3' : 'lb-rank-n';
  const ptsClass  = (r: number) => r === 1 ? 'lb-pts-1'  : r === 2 ? 'lb-pts-2'  : 'lb-pts-n';

  const sortedEntries = [...entries].sort((a, b) => b.totalPoints - a.totalPoints)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  return (
    <div className="lb-screen">
      <Particles count={25} colors={['#ffd700','#ff69b4','#c89cff','#5ce1e6','#ff2d87']} />

      {/* ── HEART PUZZLE POPUP ────────────────────────────────────── */}
      {showPuzzle && (
        <div className="puzzle-overlay">

          {puzzleResult === 'correct' && confetti.map(c => (
            <div key={c.id} className="puzzle-confetti" style={{
              left: `${c.x}%`,
              background: c.color,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.dur}s`,
            }} />
          ))}

          <div className="puzzle-modal">

            {/* Loading state */}
            {puzzleLoading && (
              <div className="puzzle-loading">
                <div className="puzzle-spinner">💜</div>
                <p style={{ color: '#c89cff', marginTop: 12 }}>Loading your bonus challenge...</p>
              </div>
            )}

            {/* Puzzle ready — no result yet */}
            {!puzzleLoading && puzzleResult === null && (
              <>
                <div className="puzzle-header">
                  <span className="puzzle-icon">🎯</span>
                  <h2 className="puzzle-title">Bonus Round!</h2>
                  <p className="puzzle-subtitle">
                    Count the hearts correctly and <span style={{ color:'#ffd700', fontWeight:900 }}>DOUBLE your points!</span>
                  </p>
                </div>

                <div className="puzzle-image-wrap">
                  <img
                    src={puzzleImg}
                    alt="Count the hearts"
                    className="puzzle-image"
                    onError={e => {
                      // If image fails, skip puzzle
                      (e.target as HTMLImageElement).style.display = 'none';
                      setShowPuzzle(false);
                    }}
                  />
                </div>

                <p className="puzzle-question">How many hearts do you see?</p>

                <div className="puzzle-input-row">
                  <input
                    ref={inputRef}
                    type="number"
                    min="0"
                    max="99"
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="puzzle-input"
                    placeholder="Enter number..."
                  />
                  <button
                    className="btn btn-gold btn-md puzzle-submit-btn"
                    onClick={handleSubmit}
                    disabled={!userAnswer.trim() || submitting}
                  >
                    ✅ Submit
                  </button>
                </div>

                <p className="puzzle-hint">💡 Tip: Count carefully — correct answer doubles your score!</p>
              </>
            )}

            {/* CORRECT result */}
            {puzzleResult === 'correct' && (
              <div className="puzzle-result puzzle-result-correct">
                <div className="puzzle-result-icon">🎉</div>
                <h2 className="puzzle-result-title">Correct!</h2>
                <p className="puzzle-result-text">
                  Amazing! Your points have been <span style={{ color:'#ffd700', fontWeight:900 }}>doubled!</span>
                </p>
                <div className="puzzle-double-badge">× 2</div>
                <p style={{ color:'#c89cff', fontSize:'.85rem', marginTop:12 }}>
                  Taking you to the leaderboard...
                </p>
              </div>
            )}

            {/* WRONG result */}
            {puzzleResult === 'wrong' && (
              <div className="puzzle-result puzzle-result-wrong">
                <div className="puzzle-result-icon">😅</div>
                <h2 className="puzzle-result-title">Not quite!</h2>
                <p className="puzzle-result-text">
                  The correct answer was <span style={{ color:'#ff4d6d', fontWeight:900 }}>{puzzleAnswer}</span>.
                  Better luck next time!
                </p>
                <p style={{ color:'#c89cff', fontSize:'.85rem', marginTop:12 }}>
                  Going to leaderboard...
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── LEADERBOARD ───────────────────────────────────────────── */}
      <div className="card card-glow lb-card">
        <div>
          <span className="lb-trophy">🏆</span>
          <h2 className="lb-title">Final Scores</h2>
          <p className="lb-subtitle">Game {gameId} · Round Complete</p>
          {doubled && (
            <div className="lb-doubled-badge">
              ⚡ Your points were DOUBLED! ⚡
            </div>
          )}
        </div>

        <Divider />

        <div className="lb-list">
          {sortedEntries.map((e, i) => {
            const isYou = e.username === session.username;
            return (
              <div
                key={e.username}
                className={`lb-row${isYou ? ' lb-row-you' : ''}`}
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className={`lb-rank ${rankClass(e.rank)}`}>{e.rank}</div>
                <div className="lb-emoji">{RANK_EMOJIS[i % RANK_EMOJIS.length]}</div>
                <div className="lb-info">
                  <div className="lb-name">
                    {e.username}
                    {isYou && <span style={{ color:'#ffd700', fontSize:'.75rem' }}> 👑 You</span>}
                    {isYou && doubled && <span className="lb-x2-tag"> ×2 BONUS</span>}
                  </div>
                  <div className="lb-detail">❤️ {e.redHearts} Red · 💙 {e.blueHearts} Blue</div>
                </div>
                <div className={`${ptsClass(e.rank)}${isYou && doubled ? ' lb-pts-doubled' : ''}`}>
                  {e.totalPoints} pts
                </div>
              </div>
            );
          })}
        </div>

        <div className="lb-actions">
          <button
            className="btn btn-pink btn-lg"
            style={{ animation: 'glowPulse 2s ease-in-out infinite' }}
            onClick={onPlayAgain}
          >
            💖 Play Again
          </button>
        </div>

        <p className="lb-footer">
          {doubled
            ? '🌟 You solved the puzzle and doubled your score!'
            : '✨ Solve the bonus puzzle next time to double your points!'}
        </p>
      </div>

      <ScreenLabel>SCREEN 5 — LEADERBOARD</ScreenLabel>
    </div>
  );
}