# HeartLink Arena

![Java](https://img.shields.io/badge/Backend-Java%2017-007396?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.11-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)

HeartLink Arena is a full-stack multiplayer web game where players join lobbies, collect red/blue hearts in a shared arena, activate boosts, trade hearts, and compete on a leaderboard. The backend exposes REST APIs for game flow, weather-based spawn behavior, and persistence of users and scores.

## Project Title and Description

**Project:** HeartLink Arena  
**Description:** A real-time-style arena game prototype with:
- Authentication (register/login)
- Lobby creation and joining
- Heart collection and score progression
- Boost and player-to-player trade mechanics
- Leaderboard ranking with database persistence
- Weather integration for spawn-rate behavior

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Axios
- CSS (custom styles, no UI framework)

### Backend
- Java 17
- Spring Boot 3.5.11
- Spring Web (REST APIs)
- Spring WebFlux `WebClient` (external API integration)
- Spring Data JPA
- PostgreSQL driver
- Maven

## Features

- User registration and login
- Create game lobby and join existing game by ID
- Pollable game state endpoint for arena synchronization
- Collect red/blue hearts and calculate points
- Boost activation (temporary score advantage behavior)
- In-game heart trading between players
- Game leaderboard with ranking persistence
- Weather endpoint integration (OpenWeatherMap) for spawn multiplier logic
- Health check endpoint

## Prerequisites

- Java 17+
- Maven 3.9+ (or use included `mvnw` / `mvnw.cmd`)
- Node.js 20+
- npm 10+
- PostgreSQL database (local or hosted, e.g., Supabase)

## Installation and Setup Instructions

### Backend Setup

```bash
cd backend
./mvnw clean install
```

For Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd clean install
```

Run backend:

```bash
./mvnw spring-boot:run
```

Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Default backend URL: `http://localhost:8080`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Default frontend URL: `http://localhost:5173`

## Environment Variables / Configuration

Current runtime config is in `backend/src/main/resources/application.yml`.

### Backend Configuration

| Key | Description | Example |
|---|---|---|
| `server.port` | Spring Boot port | `8080` |
| `spring.datasource.url` | PostgreSQL JDBC URL | `jdbc:postgresql://<host>:5432/postgres?sslmode=require` |
| `spring.datasource.username` | DB username | `postgres` |
| `spring.datasource.password` | DB password | `********` |
| `spring.jpa.hibernate.ddl-auto` | Schema strategy | `update` |
| `heart.api.base-url` | External Heart API base URL | `https://marconrad.com/uob/heart` |
| `app.use-mock-api` | Toggle mock/live integrations | `true` |
| `app.cors.allowed-origins` | CORS origin allow-list | `http://localhost:5173,http://localhost:3000` |
| `weather.api.key` | OpenWeather API key | `YOUR_OPENWEATHER_KEY_HERE` |
| `weather.api.base-url` | OpenWeather API URL | `https://api.openweathermap.org/data/2.5` |

### Frontend Configuration

Frontend uses Axios base URL in `frontend/src/services/api.ts`:

- `const BASE_URL = '/api'` (proxied by Vite to backend in development)

If deploying frontend and backend separately, set this to your deployed backend URL (or keep reverse proxy config).

## API Endpoints Reference

Base path: `/api`

### Auth

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/auth/login` | Login user |
| `POST` | `/auth/register` | Register user |

### Lobby

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/lobby/create` | Create new game |
| `POST` | `/lobby/join` | Join existing game |
| `GET` | `/lobby/games` | List available games |

### Game

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/game/{gameId}/state` | Get current game state |
| `POST` | `/game/collect` | Collect a heart |
| `POST` | `/game/boost` | Activate boost |
| `POST` | `/game/trade` | Trade hearts |
| `GET` | `/game/{gameId}/leaderboard` | Get game leaderboard |

### Weather and Health

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/weather?city=London` | Get weather-based spawn multiplier |
| `GET` | `/health` | Service health check |

## Database Schema Overview

The backend persists core entities with JPA:

### `users`
- `id` (PK, auto)
- `username` (unique, required)
- `password` (required)
- `email`
- `hearts_balance`
- `created_at`

### `game_records`
- `game_id` (PK)
- `host_username`
- `status` (`WAITING`/`ACTIVE`/`FINISHED`)
- `time_remaining`
- `created_at`
- `finished_at`

### `player_scores`
- `id` (PK, auto)
- `game_id`
- `username`
- `red_hearts`
- `blue_hearts`
- `total_points`
- `rank`

Notes:
- Active in-progress sessions are held in memory (`GameSession`).
- Leaderboard results are persisted to `player_scores`.

## How to Run Locally

1. Start backend on port `8080`.
2. Start frontend on port `5173`.
3. Open `http://localhost:5173`.
4. Register or log in.
5. Create or join a game and play.

Quick start (two terminals):

```bash
# Terminal 1
cd backend
./mvnw spring-boot:run

# Terminal 2
cd frontend
npm install
npm run dev
```

## Deployment Guide

### Option A: Backend on Render/Railway, Frontend on Vercel/Netlify

1. Deploy backend (`backend/`) as a Java service.
2. Configure backend env vars for DB + API keys.
3. Provision PostgreSQL and set datasource vars.
4. Deploy frontend (`frontend/`) as static site.
5. Update frontend API base URL or configure reverse proxy to backend.
6. Update backend CORS allow-list to include frontend production domain.

### Option B: Single Host with Reverse Proxy

1. Build frontend: `npm run build` in `frontend/`.
2. Host frontend static files via Nginx/Apache.
3. Run backend JAR/service behind proxy.
4. Route `/api/*` to Spring Boot service.

### Recommended Production Hardening

- Move DB credentials and secrets out of source files into environment variables.
- Set `app.use-mock-api=false` for live integrations.
- Hash passwords with BCrypt before storing.
- Use `spring.jpa.hibernate.ddl-auto=validate` (or migrations with Flyway/Liquibase).

## Project Structure (Full Tree)

```text
heartlink-arena/
├── backend/
│   ├── HELP.md
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── heartlink/
│   │   │   │           └── backend/
│   │   │   │               ├── HeartLinkApplication.java
│   │   │   │               ├── config/
│   │   │   │               │   ├── CorsConfig.java
│   │   │   │               │   └── WebClientConfig.java
│   │   │   │               ├── controller/
│   │   │   │               │   └── GameController.java
│   │   │   │               ├── dto/
│   │   │   │               │   └── GameDTOs.java
│   │   │   │               ├── model/
│   │   │   │               │   ├── GameRecord.java
│   │   │   │               │   ├── GameSession.java
│   │   │   │               │   ├── PlayerScore.java
│   │   │   │               │   └── User.java
│   │   │   │               ├── repository/
│   │   │   │               │   ├── GameRecordRepository.java
│   │   │   │               │   ├── PlayerScoreRepository.java
│   │   │   │               │   └── UserRepository.java
│   │   │   │               └── service/
│   │   │   │                   └── GameService.java
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── static/
│   │   │       └── templates/
│   │   └── test/
│   │       └── java/
│   │           └── com/
│   │               └── heartlink/
│   │                   └── backend/
│   │                       └── BackendApplicationTests.java
│   └── target/
│       ├── classes/
│       │   ├── application.properties
│       │   ├── application.yml
│       │   └── com/
│       │       └── heartlink/
│       │           └── backend/
│       │               ├── config/
│       │               ├── controller/
│       │               ├── dto/
│       │               ├── model/
│       │               ├── repository/
│       │               └── service/
│       ├── generated-sources/
│       │   └── annotations/
│       ├── generated-test-sources/
│       │   └── test-annotations/
│       ├── maven-status/
│       │   └── maven-compiler-plugin/
│       │       ├── compile/
│       │       │   └── default-compile/
│       │       │       ├── createdFiles.lst
│       │       │       └── inputFiles.lst
│       │       └── testCompile/
│       │           └── default-testCompile/
│       │               ├── createdFiles.lst
│       │               └── inputFiles.lst
│       └── test-classes/
│           └── com/
│               └── heartlink/
│                   └── backend/
├── frontend/
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── public/
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── vite-env.d.ts
│       ├── components/
│       │   └── UI.tsx
│       ├── screens/
│       │   ├── ArenaScreen.tsx
│       │   ├── LeaderboardScreen.tsx
│       │   ├── LobbyScreen.tsx
│       │   ├── LoginScreen.tsx
│       │   └── TradePopup.tsx
│       ├── services/
│       │   └── api.ts
│       ├── styles/
│       │   └── global.css
│       └── types/
│           └── index.ts
└── README.md
```

## Branch Diagram

```text
main
├── develop
│   ├── feature/frontend
│   └── feature/backend
└── hotfix
```

## Notes

- This project currently includes direct configuration values in `application.yml`; use environment variables for production secrets.
- Backend has a mock mode (`app.use-mock-api`) enabled by default for easier local development.
