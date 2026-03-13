package com.heartlink.backend.repository;

import com.heartlink.backend.model.PlayerScore;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlayerScoreRepository extends JpaRepository<PlayerScore, Long> {
    List<PlayerScore> findByGameIdOrderByTotalPointsDesc(String gameId);
    List<PlayerScore> findByUsername(String username);
}

