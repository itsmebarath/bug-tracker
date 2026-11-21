package com.bugtracker.backend.repository;

import com.bugtracker.backend.model.Issue;
import com.bugtracker.backend.model.IssuePriority;
import com.bugtracker.backend.model.IssueStatus;
import com.bugtracker.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IssueRepository extends JpaRepository<Issue, UUID> {

    List<Issue> findByProjectId(UUID projectId);

    List<Issue> findByAssignee(User assignee);

    long countByProjectId(UUID projectId);

    long countByProjectIdAndStatus(UUID projectId, IssueStatus status);

    long countByStatus(IssueStatus status);

    long countByAssignee(User assignee);

    long countByAssigneeAndStatus(User assignee, IssueStatus status);

    @Query("SELECT i FROM Issue i WHERE i.project.id = :projectId " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:priority IS NULL OR i.priority = :priority) " +
           "AND (:assigneeId IS NULL OR (i.assignee IS NOT NULL AND i.assignee.id = :assigneeId)) " +
           "AND (:search IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(i.key) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Issue> findFilteredIssues(
            @Param("projectId") UUID projectId,
            @Param("status") IssueStatus status,
            @Param("priority") IssuePriority priority,
            @Param("assigneeId") UUID assigneeId,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT i FROM Issue i WHERE " +
           "(:status IS NULL OR i.status = :status) " +
           "AND (:priority IS NULL OR i.priority = :priority) " +
           "AND (:assigneeId IS NULL OR (i.assignee IS NOT NULL AND i.assignee.id = :assigneeId)) " +
           "AND (:search IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(i.key) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Issue> findAllFilteredIssues(
            @Param("status") IssueStatus status,
            @Param("priority") IssuePriority priority,
            @Param("assigneeId") UUID assigneeId,
            @Param("search") String search,
            Pageable pageable
    );
}

