package com.heartlink.backend.controller;

import com.heartlink.backend.dto.GameDTOs.*;
import com.heartlink.backend.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class GameController {

    // Low coupling: Controller depends on service abstraction, not implementation
    @Autowired
    private GameService gameService;

    // ── Auth ─────────────────────────────────────────────────────────

    // Virtual identity: Login endpoint sets up user session via Heart Game API
    // Event-driven: Triggered when player clicks "Login" button
    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        AuthResponse res = gameService.login(req);
        return res.success()
            ? ResponseEntity.ok(res)
            : ResponseEntity.status(401).body(res);
    }

    // Event-driven: Triggered when player clicks "Register" button
    @PostMapping("/auth/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        AuthResponse res = gameService.register(req);
        return res.success()
            ? ResponseEntity.ok(res)
            : ResponseEntity.status(400).body(res);
    }

    // ── Lobby ─────────────────────────────────────────────────────────

    // Event-driven: Triggered when player clicks "Create Game"
    @PostMapping("/lobby/create")
    public ResponseEntity<LobbyResponse> createGame(@RequestBody CreateGameRequest req) {
        return ResponseEntity.ok(gameService.createGame(req));
    }

    // Event-driven: Triggered when player clicks "Join Game"
    @PostMapping("/lobby/join")
    public ResponseEntity<LobbyResponse> joinGame(@RequestBody JoinGameRequest req) {
        LobbyResponse res = gameService.joinGame(req);
        return res.success()
            ? ResponseEntity.ok(res)
            : ResponseEntity.status(404).body(res);
    }

    // Polling: Frontend polls this to refresh available games list
    @GetMapping("/lobby/games")
    public ResponseEntity<LobbyResponse> getGames() {
        return ResponseEntity.ok(gameService.getAvailableGamesResponse());
    }

    // ── Game State ────────────────────────────────────────────────────

    // Event-driven: Frontend polls every 2s to keep arena in sync
    // Interoperability: Would call Heart Game API for live state
    @GetMapping("/game/{gameId}/state")
    public ResponseEntity<GameStateResponse> getGameState(@PathVariable String gameId) {
        GameStateResponse state = gameService.getGameState(gameId);
        return state != null
            ? ResponseEntity.ok(state)
            : ResponseEntity.notFound().build();
    }

    // ── Collect Heart ─────────────────────────────────────────────────

    // Event-driven: Mouse click on heart in canvas triggers this
    @PostMapping("/game/collect")
    public ResponseEntity<CollectHeartResponse> collectHeart(@RequestBody CollectHeartRequest req) {
        return ResponseEntity.ok(gameService.collectHeart(req));
    }

    // ── Boost ─────────────────────────────────────────────────────────

    // Event-driven: Player clicks "Boost" button
    @PostMapping("/game/boost")
    public ResponseEntity<BoostResponse> activateBoost(@RequestBody BoostRequest req) {
        BoostResponse res = gameService.activateBoost(req);
        return res.success()
            ? ResponseEntity.ok(res)
            : ResponseEntity.status(400).body(res);
    }

    // ── Trade ─────────────────────────────────────────────────────────

    // Event-driven: Player submits Trade popup form
    // Interoperability: Calls Heart Game API transfer hearts endpoint
    @PostMapping("/game/trade")
    public ResponseEntity<TradeResponse> trade(@RequestBody TradeRequest req) {
        TradeResponse res = gameService.trade(req);
        return res.success()
            ? ResponseEntity.ok(res)
            : ResponseEntity.status(400).body(res);
    }

    // ── Leaderboard ───────────────────────────────────────────────────

    @GetMapping("/game/{gameId}/leaderboard")
    public ResponseEntity<LeaderboardResponse> getLeaderboard(@PathVariable String gameId) {
        return ResponseEntity.ok(gameService.getLeaderboard(gameId));
    }

    // ── Weather ───────────────────────────────────────────────────────

    // Interoperability: Fetches OpenWeatherMap data to affect spawn rates
    @GetMapping("/weather")
    public ResponseEntity<WeatherResponse> getWeather(
        @RequestParam(defaultValue = "London") String city
    ) {
        return ResponseEntity.ok(gameService.getWeather(city));
    }

    // ── Health check ──────────────────────────────────────────────────
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("HeartLink Arena backend is running!");
    }
}
