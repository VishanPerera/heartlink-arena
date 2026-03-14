package com.heartlink.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "player_scores")
public class PlayerScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String gameId;
    private String username;
    private int redHearts  = 0;
    private int blueHearts = 0;
    private int totalPoints = 0;
    private int rank = 0;

    public Long getId()           { return id; }
    public String getGameId()     { return gameId; }
    public String getUsername()   { return username; }
    public int getRedHearts()     { return redHearts; }
    public int getBlueHearts()    { return blueHearts; }
    public int getTotalPoints()   { return totalPoints; }
    public int getRank()          { return rank; }

    public void setGameId(String g)     { this.gameId = g; }
    public void setUsername(String u)   { this.username = u; }
    public void setRedHearts(int r)     { this.redHearts = r; }
    public void setBlueHearts(int b)    { this.blueHearts = b; }
    public void setTotalPoints(int t)   { this.totalPoints = t; }
    public void setRank(int r)          { this.rank = r; }
}
