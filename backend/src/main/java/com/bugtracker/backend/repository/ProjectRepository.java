package com.bugtracker.backend.repository;

import com.bugtracker.backend.model.Project;
import com.bugtracker.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    boolean existsByKey(String key);

    Optional<Project> findByKey(String key);

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members m WHERE p.owner = :user OR m = :user")
    List<Project> findAllAccessibleProjects(@Param("user") User user);
}

