package com.heartlink.backend.repository;

import com.heartlink.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// Spring auto-generates all SQL — you just call these methods
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}