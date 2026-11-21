package com.bugtracker.backend.dto;

import com.bugtracker.backend.model.IssuePriority;
import com.bugtracker.backend.model.IssueStatus;
import com.bugtracker.backend.model.IssueType;

import java.time.LocalDateTime;
import java.util.UUID;

public class IssueResponse {

    private UUID id;
    private String title;
    private String description;
    private String key;
    private IssuePriority priority;
    private IssueStatus status;
    private IssueType type;
    private UUID projectId;
    private String projectName;
    private String projectKey;
    private UserResponse reporter;
    private UserResponse assignee;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public IssueResponse() {
    }

    public IssueResponse(UUID id, String title, String description, String key,
                         IssuePriority priority, IssueStatus status, IssueType type,
                         UUID projectId, String projectName, String projectKey,
                         UserResponse reporter, UserResponse assignee,
                         LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.key = key;
        this.priority = priority;
        this.status = status;
        this.type = type;
        this.projectId = projectId;
        this.projectName = projectName;
        this.projectKey = projectKey;
        this.reporter = reporter;
        this.assignee = assignee;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public IssuePriority getPriority() {
        return priority;
    }

    public void setPriority(IssuePriority priority) {
        this.priority = priority;
    }

    public IssueStatus getStatus() {
        return status;
    }

    public void setStatus(IssueStatus status) {
        this.status = status;
    }

    public IssueType getType() {
        return type;
    }

    public void setType(IssueType type) {
        this.type = type;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getProjectKey() {
        return projectKey;
    }

    public void setProjectKey(String projectKey) {
        this.projectKey = projectKey;
    }

    public UserResponse getReporter() {
        return reporter;
    }

    public void setReporter(UserResponse reporter) {
        this.reporter = reporter;
    }

    public UserResponse getAssignee() {
        return assignee;
    }

    public void setAssignee(UserResponse assignee) {
        this.assignee = assignee;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

