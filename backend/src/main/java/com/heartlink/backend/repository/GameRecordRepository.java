package com.heartlink.backend.repository;

import com.heartlink.backend.model.GameRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GameRecordRepository extends JpaRepository<GameRecord, String> {
    List<GameRecord> findByStatusOrderByCreatedAtDesc(String status);
}