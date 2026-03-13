package com.heartlink.backend.model;

import java.time.Instant;
import java.util.*;

public class GameSession {

    public enum Status { WAITING, ACTIVE, FINISHED }

    private final String gameId;
    private final String hostUsername;
    private Status status;
    private int timeRemaining;                        // seconds
    private final Map<String, PlayerData> players;   // username → data
    private final List<HeartData> hearts;
    private final Instant createdAt;
    private double spawnMultiplier;                   // weather modifier

    public GameSession(String gameId, String hostUsername) {
        this.gameId        = gameId;
        this.hostUsername  = hostUsername;
        this.status        = Status.WAITING;
        this.timeRemaining = 300;  // 5 minutes
        this.players       = new LinkedHashMap<>();
        this.hearts        = new ArrayList<>();
        this.createdAt     = Instant.now();
        this.spawnMultiplier = 1.0;
    }

    // ── Getters ──────────────────────────────────────────────────────
    public String getGameId()            { return gameId; }
    public String getHostUsername()      { return hostUsername; }
    public Status getStatus()            { return status; }
    public int getTimeRemaining()        { return timeRemaining; }
    public Map<String, PlayerData> getPlayers() { return players; }
    public List<HeartData> getHearts()   { return hearts; }
    public double getSpawnMultiplier()   { return spawnMultiplier; }
    public int getPlayerCount()          { return players.size(); }

    // ── Setters ──────────────────────────────────────────────────────
    public void setStatus(Status s)              { this.status = s; }
    public void setTimeRemaining(int t)          { this.timeRemaining = t; }
    public void setSpawnMultiplier(double m)     { this.spawnMultiplier = m; }

    // ── Nested: Player Data ──────────────────────────────────────────
    public static class PlayerData {
        private int redHearts   = 0;
        private int blueHearts  = 0;
        private boolean boostActive = false;
        private double posX = 400;
        private double posY = 270;

        public int getRedHearts()     { return redHearts; }
        public int getBlueHearts()    { return blueHearts; }
        public boolean isBoostActive(){ return boostActive; }
        public double getPosX()       { return posX; }
        public double getPosY()       { return posY; }

        public void setRedHearts(int r)     { this.redHearts = r; }
        public void setBlueHearts(int b)    { this.blueHearts = b; }
        public void setBoostActive(boolean a){ this.boostActive = a; }
        public void setPosX(double x)       { this.posX = x; }
        public void setPosY(double y)       { this.posY = y; }

        public int getTotalPoints() {
            return (redHearts * 2) + (blueHearts * 5);
        }
    }

    // ── Nested: Heart Data ───────────────────────────────────────────
    public static class HeartData {
        private final String id;
        private final String type;  // "red" or "blue"
        private double x;
        private double y;
        private boolean collected;

        public HeartData(String id, String type, double x, double y) {
            this.id        = id;
            this.type      = type;
            this.x         = x;
            this.y         = y;
            this.collected = false;
        }

        public String getId()         { return id; }
        public String getType()       { return type; }
        public double getX()          { return x; }
        public double getY()          { return y; }
        public boolean isCollected()  { return collected; }
        public void setCollected(boolean c) { this.collected = c; }
    }
}

