package com.heartlink.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

// This class creates a "users" table in PostgreSQL automatically
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    private String email;
    private int heartsBalance = 0;
    private Instant createdAt = Instant.now();

    // Getters and setters
    public Long getId()                  { return id; }
    public String getUsername()          { return username; }
    public String getPassword()          { return password; }
    public String getEmail()             { return email; }
    public int getHeartsBalance()        { return heartsBalance; }
    public Instant getCreatedAt()        { return createdAt; }

    public void setUsername(String u)    { this.username = u; }
    public void setPassword(String p)    { this.password = p; }
    public void setEmail(String e)       { this.email = e; }
    public void setHeartsBalance(int b)  { this.heartsBalance = b; }
}