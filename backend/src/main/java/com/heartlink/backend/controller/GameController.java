package com.heartlink.backend.controller;

import com.heartlink.backend.dto.GameDTOs.*;
import com.heartlink.backend.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class GameController {

    // Low coupling: Controller depends on service abstraction
    @Autowired
    private GameService gameService;


    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        AuthResponse res = gameService.login(req);
        return res.success()
            ? ResponseEntity.ok(res)
            : ResponseEntity.status(401).body(res);
    }

    // Event-driven
    @PostMapping("/auth/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        AuthResponse res = gameService.register(req);
        return res.success()
            ? ResponseEntity.ok(res)
            : ResponseEntity.status(400).body(res);
    }


    // Event-driven
    @PostMapping("/lobby/create")
    public ResponseEntity<LobbyResponse> createGame(@RequestBody CreateGameRequest req) {
        return ResponseEntity.ok(gameService.createGame(req));
    }

    // Event-driven
    @PostMapping("/lobby/join")
    public ResponseEntity<LobbyResponse> joinGame(@RequestBody JoinGameRequest req) {
        LobbyResponse res = gameService.joinGame(req);
        return res.success()
            ? ResponseEntity.ok(res)
            : ResponseEntity.status(404).body(res);
    }

    // Polling
    @GetMapping("/lobby/games")
    public ResponseEntity<LobbyResponse> getGames() {
        return ResponseEntity.ok(gameService.getAvailableGamesResponse());
    }

    // Event-driven
    // Interoperability
    @GetMapping("/game/{gameId}/state")
    public ResponseEntity<GameStateResponse> getGameState(@PathVariable String gameId) {
        GameStateResponse state = gameService.getGameState(gameId);
        return state != null
            ? ResponseEntity.ok(state)
            : ResponseEntity.notFound().build();
    }

    // Event-driven
    @PostMapping("/game/collect")
    public ResponseEntity<CollectHeartResponse> collectHeart(@RequestBody CollectHeartRequest req) {
        return ResponseEntity.ok(gameService.collectHeart(req));
    }

  

    // Event-driven
    @PostMapping("/game/boost")
    public ResponseEntity<BoostResponse> activateBoost(@RequestBody BoostRequest req) {
        BoostResponse res = gameService.activateBoost(req);
        return res.success()
            ? ResponseEntity.ok(res)
            : ResponseEntity.status(400).body(res);
    }

    // Event-driven
    // Interoperability
    @PostMapping("/game/trade")
    public ResponseEntity<TradeResponse> trade(@RequestBody TradeRequest req) {
        TradeResponse res = gameService.trade(req);
        return res.success()
            ? ResponseEntity.ok(res)
            : ResponseEntity.status(400).body(res);
    }


    @GetMapping("/game/{gameId}/leaderboard")
    public ResponseEntity<LeaderboardResponse> getLeaderboard(@PathVariable String gameId) {
        return ResponseEntity.ok(gameService.getLeaderboard(gameId));
    }


    // Interoperability
    @GetMapping("/weather")
    public ResponseEntity<WeatherResponse> getWeather(
        @RequestParam(defaultValue = "London") String city
    ) {
        return ResponseEntity.ok(gameService.getWeather(city));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("HeartLink Arena backend is running!");
    }
}
