export interface AuthResponse {
  success: boolean;
  token: string | null;
  username: string | null;
  heartsBalance: number;
  message: string;
}

export interface GameSummary {
  gameId: string;
  hostUsername: string;
  playerCount: number;
  maxPlayers: number;
  status: string;
}

export interface LobbyResponse {
  success: boolean;
  gameId: string | null;
  message: string;
  availableGames: GameSummary[];
}

export interface HeartObject {
  id: string;
  type: 'red' | 'blue';
  x: number;
  y: number;
  collected: boolean;
}

export interface PlayerState {
  username: string;
  redHearts: number;
  blueHearts: number;
  totalPoints: number;
  boostActive: boolean;
  posX: number;
  posY: number;
}

export interface GameStateResponse {
  gameId: string;
  timeRemaining: number;
  players: PlayerState[];
  hearts: HeartObject[];
  status: string;
  spawnMultiplier: number;
}

export interface CollectHeartResponse {
  success: boolean;
  pointsEarned: number;
  newTotal: number;
  redHearts: number;
  blueHearts: number;
  message: string;
}

export interface BoostResponse {
  success: boolean;
  pointsSpent: number;
  remainingPoints: number;
  durationSeconds: number;
  message: string;
}

export interface TradeResponse {
  success: boolean;
  amountSent: number;
  toUsername: string;
  newBalance: number;
  message: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  redHearts: number;
  blueHearts: number;
  totalPoints: number;
}

export interface LeaderboardResponse {
  gameId: string;
  rankings: LeaderboardEntry[];
}

export interface WeatherResponse {
  condition: string;
  spawnMultiplier: number;
  description: string;
}

// App-level session state
export interface UserSession {
  username: string;
  token: string;
  heartsBalance: number;
}