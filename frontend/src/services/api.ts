import axios from 'axios';
import type {
  AuthResponse, LobbyResponse, GameStateResponse,
  CollectHeartResponse, BoostResponse, TradeResponse,
  LeaderboardResponse, WeatherResponse
} from '../types';

// Base URL — change this when deploying backend to Render
// To switch to production: change to 'https://your-app.onrender.com'
const BASE_URL = '/api';  // proxied to localhost:8080 via vite.config.ts

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// Auth 

export const loginUser = (username: string, password: string): Promise<AuthResponse> =>
  api.post('/auth/login', { username, password }).then(r => r.data);

export const registerUser = (username: string, password: string, email: string): Promise<AuthResponse> =>
  api.post('/auth/register', { username, password, email }).then(r => r.data);

// Lobby 

export const createGame = (username: string, token: string): Promise<LobbyResponse> =>
  api.post('/lobby/create', { username, token }).then(r => r.data);

export const joinGame = (gameId: string, username: string, token: string): Promise<LobbyResponse> =>
  api.post('/lobby/join', { gameId, username, token }).then(r => r.data);

export const getAvailableGames = (): Promise<LobbyResponse> =>
  api.get('/lobby/games').then(r => r.data);

// Game State

// Interoperability: Polls backend which in turn queries Heart Game API
export const getGameState = (gameId: string): Promise<GameStateResponse> =>
  api.get(`/game/${gameId}/state`).then(r => r.data);

// Collect Heart

// Event-driven: Called on mouse-click on a heart in the canvas
export const collectHeart = (
  gameId: string, username: string, token: string,
  heartId: string, heartType: string
): Promise<CollectHeartResponse> =>
  api.post('/game/collect', { gameId, username, token, heartId, heartType }).then(r => r.data);

// Boost

export const activateBoost = (gameId: string, username: string, token: string): Promise<BoostResponse> =>
  api.post('/game/boost', { gameId, username, token }).then(r => r.data);


//heart API
export const getHeartPuzzle = (): Promise<{ question: string; solution: number }> =>
  axios.get('https://marcconrad.com/uob/heart/api.php?out=json&base64=no')
    .then(r => r.data)
    .catch(() => ({
      question: 'https://marcconrad.com/uob/heart/api.php?out=json&base64=no',
      solution: -1  // -1 means API unavailable
    }));

    // Trade 
export const sendTrade = (
  gameId: string, fromUsername: string, toUsername: string,
  token: string, amount: number, heartType: string
): Promise<TradeResponse> =>
  api.post('/game/trade', { gameId, fromUsername, toUsername, token, amount, heartType }).then(r => r.data);

// Leaderboard 

export const getLeaderboard = (gameId: string): Promise<LeaderboardResponse> =>
  api.get(`/game/${gameId}/leaderboard`).then(r => r.data);

// Weather 

// Interoperability
export const getWeather = (city = 'London'): Promise<WeatherResponse> =>
  api.get('/weather', { params: { city } }).then(r => r.data);

export default api;