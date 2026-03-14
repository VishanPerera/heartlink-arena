package com.heartlink.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

public class GameDTOs {

    public record LoginRequest(String username, String password) {}

    public record RegisterRequest(String username, String password, String email) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record AuthResponse(
        boolean success,
        String token,
        String username,
        int heartsBalance,
        String message
    ) {}

    public record CreateGameRequest(String username, String token) {}

    public record JoinGameRequest(String gameId, String username, String token) {}

    public record LobbyResponse(
        boolean success,
        String gameId,
        String message,
        List<GameSummary> availableGames
    ) {}

    public record GameSummary(
        String gameId,
        String hostUsername,
        int playerCount,
        int maxPlayers,
        String status
    ) {}

    public record GameStateResponse(
        String gameId,
        int timeRemaining,
        List<PlayerState> players,
        List<HeartObject> hearts,
        String status,
        double spawnMultiplier  // 1.0 = normal, <1.0 = rain slowdown
    ) {}

    public record PlayerState(
        String username,
        int redHearts,
        int blueHearts,
        int totalPoints,
        boolean boostActive,
        double posX,
        double posY
    ) {}

    public record HeartObject(
        String id,
        String type,   // "red" or "blue"
        double x,
        double y,
        boolean collected
    ) {}

    public record CollectHeartRequest(
        String gameId,
        String username,
        String token,
        String heartId,
        String heartType
    ) {}

    public record CollectHeartResponse(
        boolean success,
        int pointsEarned,
        int newTotal,
        int redHearts,
        int blueHearts,
        String message
    ) {}

    public record BoostRequest(String gameId, String username, String token) {}

    public record BoostResponse(
        boolean success,
        int pointsSpent,
        int remainingPoints,
        int durationSeconds,
        String message
    ) {}

    public record TradeRequest(
        String gameId,
        String fromUsername,
        String toUsername,
        String token,
        int amount,
        String heartType  // "red" or "blue"
    ) {}

    public record TradeResponse(
        boolean success,
        int amountSent,
        String toUsername,
        int newBalance,
        String message
    ) {}

    public record LeaderboardResponse(
        String gameId,
        List<LeaderboardEntry> rankings
    ) {}

    public record LeaderboardEntry(
        int rank,
        String username,
        int redHearts,
        int blueHearts,
        int totalPoints
    ) {}

    public record WeatherResponse(
        String condition,   // "rain", "clear", "clouds" etc.
        double spawnMultiplier,
        String description
    ) {}
}
