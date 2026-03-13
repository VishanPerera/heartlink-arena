package com.heartlink.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

// Creates a "game_records" table — stores finished games
@Entity
@Table(name = "game_records")
public class GameRecord {

    @Id
    private String gameId;

    private String hostUsername;
    private String status;       // WAITING, ACTIVE, FINISHED
    private int timeRemaining;
    private Instant createdAt = Instant.now();
    private Instant finishedAt;

    public String getGameId()         { return gameId; }
    public String getHostUsername()   { return hostUsername; }
    public String getStatus()         { return status; }
    public int getTimeRemaining()     { return timeRemaining; }
    public Instant getCreatedAt()     { return createdAt; }
    public Instant getFinishedAt()    { return finishedAt; }

    public void setGameId(String id)        { this.gameId = id; }
    public void setHostUsername(String h)   { this.hostUsername = h; }
    public void setStatus(String s)         { this.status = s; }
    public void setTimeRemaining(int t)     { this.timeRemaining = t; }
    public void setFinishedAt(Instant f)    { this.finishedAt = f; }
}
