package com.heartlink.backend.service;

import com.heartlink.backend.dto.GameDTOs.*;
import com.heartlink.backend.model.GameRecord;
import com.heartlink.backend.model.GameSession;
import com.heartlink.backend.model.GameSession.HeartData;
import com.heartlink.backend.model.GameSession.PlayerData;
import com.heartlink.backend.model.PlayerScore;
import com.heartlink.backend.model.User;
import com.heartlink.backend.repository.GameRecordRepository;
import com.heartlink.backend.repository.PlayerScoreRepository;
import com.heartlink.backend.repository.UserRepository;

// import com.heartlink.model.GameSession.HeartData;
// import com.heartlink.model.GameSession.PlayerData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class GameService {

    // Interoperability
    @Autowired @Qualifier("heartApiClient")   private WebClient heartApiClient;
    @Autowired @Qualifier("weatherApiClient") private WebClient weatherApiClient;

    @Autowired private UserRepository        userRepository;
    @Autowired private GameRecordRepository  gameRecordRepository;
    @Autowired private PlayerScoreRepository playerScoreRepository;

    @Value("${app.use-mock-api}") private boolean useMockApi;
    @Value("${weather.api.key}")  private String weatherApiKey;

    private final Map<String, GameSession> sessions = new ConcurrentHashMap<>();

    private final Map<String, String> mockUsers = new ConcurrentHashMap<>(Map.of(
        "StarGuardian", "pass123",
        "PinkWizard",   "pass123",
        "MoonGuardian", "pass123"
    ));

    
    public AuthResponse login(LoginRequest req) {
        if (useMockApi) return mockLogin(req);

        // Interoperability: Replace with real Heart Game API login endpoint
        // Virtual identity: Token from API represents the user's session
        // TODO: Uncomment when real API is available
        /*
        return heartApiClient.post()
            .uri("/login")
            .bodyValue(Map.of("username", req.username(), "password", req.password()))
            .retrieve()
            .bodyToMono(AuthResponse.class)
            .block();
        */
        return mockLogin(req);
    }

    public AuthResponse register(RegisterRequest req) {
        if (useMockApi) return mockRegister(req);

        // Interoperability: Real Heart Game API register call
        // TODO: Uncomment when real API is available
        /*
        return heartApiClient.post()
            .uri("/register")
            .bodyValue(Map.of("username", req.username(), "password", req.password()))
            .retrieve()
            .bodyToMono(AuthResponse.class)
            .block();
        */
        return mockRegister(req);
    }

    private AuthResponse mockLogin(LoginRequest req) {
    Optional<User> userOpt = userRepository.findByUsername(req.username());
    if (userOpt.isPresent() && userOpt.get().getPassword().equals(req.password())) {
        User user = userOpt.get();
        String token = "token-" + user.getUsername() + "-" + System.currentTimeMillis();
        return new AuthResponse(true, token, user.getUsername(), user.getHeartsBalance(), "Login successful");
    }
    return new AuthResponse(false, null, null, 0, "Invalid username or password");
}

    private AuthResponse mockRegister(RegisterRequest req) {
    if (userRepository.existsByUsername(req.username())) {
        return new AuthResponse(false, null, null, 0, "Username already taken");
    }
    User user = new User();
    user.setUsername(req.username());
    user.setPassword(req.password());  // TODO: hash with BCrypt before submission
    user.setEmail(req.email());
    userRepository.save(user);  // saves to PostgreSQL
    String token = "token-" + req.username() + "-" + System.currentTimeMillis();
    return new AuthResponse(true, token, req.username(), 0, "Registered successfully!");
}

  
    public LobbyResponse createGame(CreateGameRequest req) {
        String gameId = "HL-" + (1000 + new Random().nextInt(8999));
        GameSession session = new GameSession(gameId, req.username());

        session.getPlayers().put(req.username(), new PlayerData());
        session.setStatus(GameSession.Status.ACTIVE);

        spawnHearts(session, 10);
        sessions.put(gameId, session);

        GameRecord record = new GameRecord();
    record.setGameId(gameId);
    record.setHostUsername(req.username());
    record.setStatus("ACTIVE");
    record.setTimeRemaining(300);
    gameRecordRepository.save(record);

        return new LobbyResponse(true, gameId, "Game created!", getAvailableGames());
    }

    public LobbyResponse joinGame(JoinGameRequest req) {
        GameSession session = sessions.get(req.gameId());
        if (session == null) {
            return new LobbyResponse(false, null, "Game not found", null);
        }
        if (session.getPlayerCount() >= 5) {
            return new LobbyResponse(false, null, "Game is full", null);
        }

        session.getPlayers().put(req.username(), new PlayerData());

        if (!useMockApi) {
            // Interoperability: Real Heart Game API join game
            // TODO: Call heartApiClient to register player in Heart API
        }

        return new LobbyResponse(true, req.gameId(), "Joined game!", getAvailableGames());
    }

    public LobbyResponse getAvailableGamesResponse() {
        return new LobbyResponse(true, null, "OK", getAvailableGames());
    }

    private List<GameSummary> getAvailableGames() {
        List<GameSummary> list = sessions.values().stream()
            .filter(s -> s.getStatus() == GameSession.Status.ACTIVE)
            .map(s -> new GameSummary(
                s.getGameId(), s.getHostUsername(),
                s.getPlayerCount(), 5, s.getStatus().name()
            ))
            .collect(Collectors.toList());

        if (list.size() < 2) {
            list.add(new GameSummary("HL-3821", "MoonGuardian", 3, 5, "ACTIVE"));
            list.add(new GameSummary("HL-5540", "PinkWizard",   2, 5, "ACTIVE"));
        }
        return list;
    }

    public GameStateResponse getGameState(String gameId) {
        GameSession session = sessions.get(gameId);
        if (session == null) return null;

        if (!useMockApi) {
            // Interoperability: Poll Heart Game API for latest state
            // TODO: merge remote state from heartApiClient into session
        }

        return buildStateResponse(session);
    }

    private GameStateResponse buildStateResponse(GameSession session) {
        List<PlayerState> players = session.getPlayers().entrySet().stream()
            .map(e -> new PlayerState(
                e.getKey(),
                e.getValue().getRedHearts(),
                e.getValue().getBlueHearts(),
                e.getValue().getTotalPoints(),
                e.getValue().isBoostActive(),
                e.getValue().getPosX(),
                e.getValue().getPosY()
            ))
            .collect(Collectors.toList());

        List<com.heartlink.backend.dto.GameDTOs.HeartObject> hearts = session.getHearts().stream()
            .filter(h -> !h.isCollected())
            .map(h -> new com.heartlink.backend.dto.GameDTOs.HeartObject(
                h.getId(), h.getType(), h.getX(), h.getY(), false
            ))
            .collect(Collectors.toList());

        return new GameStateResponse(
            session.getGameId(),
            session.getTimeRemaining(),
            players,
            hearts,
            session.getStatus().name(),
            session.getSpawnMultiplier()
        );
    }

    public CollectHeartResponse collectHeart(CollectHeartRequest req) {
        // Event-driven
        GameSession session = sessions.get(req.gameId());
        if (session == null) return new CollectHeartResponse(false, 0, 0, 0, 0, "Game not found");

        PlayerData player = session.getPlayers().get(req.username());
        if (player == null) return new CollectHeartResponse(false, 0, 0, 0, 0, "Player not found");

        session.getHearts().stream()
            .filter(h -> h.getId().equals(req.heartId()) && !h.isCollected())
            .findFirst()
            .ifPresent(h -> h.setCollected(true));

        boolean boosted = player.isBoostActive();
        int base   = req.heartType().equals("blue") ? 5 : 2;
        int earned = boosted ? base * 2 : base;

        if (req.heartType().equals("blue")) player.setBlueHearts(player.getBlueHearts() + 1);
        else                                player.setRedHearts(player.getRedHearts() + 1);

        if (!useMockApi) {
            // Interoperability: Notify Heart Game API of collection
            // TODO: heartApiClient.post("/collect").bodyValue(...).retrieve().block();
        }

        respawnHeart(session, req.heartType());

        return new CollectHeartResponse(
            true, earned, player.getTotalPoints(),
            player.getRedHearts(), player.getBlueHearts(),
            boosted ? "Boosted! +" + earned : "+" + earned + " pts"
        );
    }


    public BoostResponse activateBoost(BoostRequest req) {
        // Event-driven
        GameSession session = sessions.get(req.gameId());
        if (session == null) return new BoostResponse(false, 0, 0, 0, "Game not found");

        PlayerData player = session.getPlayers().get(req.username());
        if (player == null) return new BoostResponse(false, 0, 0, 0, "Player not found");

        if (player.getTotalPoints() < 10) {
            return new BoostResponse(false, 0, player.getTotalPoints(), 0, "Need at least 10 points");
        }

        deductPoints(player, 10);
        player.setBoostActive(true);

        new Timer().schedule(new TimerTask() {
            @Override public void run() { player.setBoostActive(false); }
        }, 30_000);

        if (!useMockApi) {
            // Interoperability: Notify Heart Game API about boost
            // TODO: heartApiClient.post("/boost").bodyValue(...).retrieve().block();
        }

        return new BoostResponse(true, 10, player.getTotalPoints(), 30, "Boost active for 30 seconds!");
    }

    private void deductPoints(PlayerData player, int pointsToDeduct) {
        // Remove red hearts first (2 pts each), then blue (5 pts each)
        int remaining = pointsToDeduct;
        while (remaining >= 2 && player.getRedHearts() > 0) {
            player.setRedHearts(player.getRedHearts() - 1);
            remaining -= 2;
        }
        while (remaining >= 5 && player.getBlueHearts() > 0) {
            player.setBlueHearts(player.getBlueHearts() - 1);
            remaining -= 5;
        }
    }

  
    public TradeResponse trade(TradeRequest req) {
        // Event-driven
        // Interoperability
        GameSession session = sessions.get(req.gameId());
        if (session == null) return new TradeResponse(false, 0, req.toUsername(), 0, "Game not found");

        PlayerData sender   = session.getPlayers().get(req.fromUsername());
        PlayerData receiver = session.getPlayers().get(req.toUsername());

        if (sender == null)   return new TradeResponse(false, 0, req.toUsername(), 0, "Sender not found");
        if (receiver == null) return new TradeResponse(false, 0, req.toUsername(), 0, "Recipient not found in this game");

        int available = req.heartType().equals("blue") ? sender.getBlueHearts() : sender.getRedHearts();
        if (available < req.amount()) {
            return new TradeResponse(false, 0, req.toUsername(), available, "Not enough hearts to trade");
        }

        // Transfer hearts
        if (req.heartType().equals("blue")) {
            sender.setBlueHearts(sender.getBlueHearts() - req.amount());
            receiver.setBlueHearts(receiver.getBlueHearts() + req.amount());
        } else {
            sender.setRedHearts(sender.getRedHearts() - req.amount());
            receiver.setRedHearts(receiver.getRedHearts() + req.amount());
        }

        if (!useMockApi) {
            // Interoperability: Real Heart Game API transfer hearts
            // TODO: heartApiClient.post("/transfer")
            //   .bodyValue(Map.of("from", req.fromUsername(), "to", req.toUsername(), "amount", req.amount()))
            //   .retrieve().bodyToMono(String.class).block();
        }

        return new TradeResponse(true, req.amount(), req.toUsername(), sender.getTotalPoints(),
            "Sent " + req.amount() + " " + req.heartType() + " hearts to " + req.toUsername());
    }

   
    public LeaderboardResponse getLeaderboard(String gameId) {
    GameSession session = sessions.get(gameId);

    List<LeaderboardEntry> ranked;

    if (session != null) {
        List<Map.Entry<String, PlayerData>> sorted = session.getPlayers().entrySet().stream()
            .sorted((a, b) -> b.getValue().getTotalPoints() - a.getValue().getTotalPoints())
            .collect(Collectors.toList());

        ranked = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            var e = sorted.get(i);
            ranked.add(new LeaderboardEntry(
                i + 1,
                e.getKey(),
                e.getValue().getRedHearts(),
                e.getValue().getBlueHearts(),
                e.getValue().getTotalPoints()
            ));
        }

        for (LeaderboardEntry entry : ranked) {
            PlayerScore score = new PlayerScore();
            score.setGameId(gameId);
            score.setUsername(entry.username());
            score.setRedHearts(entry.redHearts());
            score.setBlueHearts(entry.blueHearts());
            score.setTotalPoints(entry.totalPoints());
            score.setRank(entry.rank());
            playerScoreRepository.save(score);  // persists to database
        }

        gameRecordRepository.findById(gameId).ifPresent(record -> {
            record.setStatus("FINISHED");
            record.setFinishedAt(Instant.now());
            gameRecordRepository.save(record);
        });

    } else {
        List<PlayerScore> dbScores = playerScoreRepository
            .findByGameIdOrderByTotalPointsDesc(gameId);

        if (!dbScores.isEmpty()) {
            ranked = dbScores.stream()
                .map(s -> new LeaderboardEntry(
                    s.getRank(),
                    s.getUsername(),
                    s.getRedHearts(),
                    s.getBlueHearts(),
                    s.getTotalPoints()
                ))
                .collect(Collectors.toList());
        } else {
            ranked = mockLeaderboard(gameId).rankings();
        }
    }

    return new LeaderboardResponse(gameId, ranked);
}

private LeaderboardResponse mockLeaderboard(String gameId) {
    return new LeaderboardResponse(gameId, List.of(
        new LeaderboardEntry(1, "StarGuardian", 7, 3, 29),
        new LeaderboardEntry(2, "PinkWizard",   5, 4, 25),
        new LeaderboardEntry(3, "MoonGuardian", 3, 2, 16),
        new LeaderboardEntry(4, "StormHunter",  2, 1, 9)
    ));
}

    public WeatherResponse getWeather(String city) {
        if (useMockApi || weatherApiKey.equals("YOUR_OPENWEATHER_KEY_HERE")) {
            return new WeatherResponse("clear", 1.0, "Clear skies — normal spawn rate");
        }

        try {
            var raw = weatherApiClient.get()
                .uri(u -> u.path("/weather")
                    .queryParam("q", city)
                    .queryParam("appid", weatherApiKey)
                    .queryParam("units", "metric")
                    .build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (raw == null) return new WeatherResponse("unknown", 1.0, "Could not fetch weather");

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> weatherList = (List<Map<String, Object>>) raw.get("weather");
            String condition = weatherList != null && !weatherList.isEmpty()
                ? (String) weatherList.get(0).get("main")
                : "Clear";

            double multiplier = switch (condition.toLowerCase()) {
                case "rain", "drizzle", "thunderstorm" -> 0.5;
                case "snow"  -> 0.7;
                case "clouds"-> 0.85;
                default      -> 1.0;
            };

            return new WeatherResponse(condition.toLowerCase(), multiplier,
                condition + " — spawn rate x" + multiplier);
        } catch (Exception e) {
            return new WeatherResponse("unknown", 1.0, "Weather API error: " + e.getMessage());
        }
    }

    private void spawnHearts(GameSession session, int count) {
        Random rnd = new Random();
        for (int i = 0; i < count; i++) {
            boolean isBlue = rnd.nextDouble() < 0.3;  // 30% chance blue
            session.getHearts().add(new HeartData(
                UUID.randomUUID().toString(),
                isBlue ? "blue" : "red",
                50 + rnd.nextDouble() * 800,
                50 + rnd.nextDouble() * 440
            ));
        }
    }

    private void respawnHeart(GameSession session, String preferredType) {
        Random rnd = new Random();
        boolean isBlue = preferredType.equals("blue") || rnd.nextDouble() < 0.3;
        session.getHearts().add(new HeartData(
            UUID.randomUUID().toString(),
            isBlue ? "blue" : "red",
            50 + rnd.nextDouble() * 800,
            50 + rnd.nextDouble() * 440
        ));
    }
}
