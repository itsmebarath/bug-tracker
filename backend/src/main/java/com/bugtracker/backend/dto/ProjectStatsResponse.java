package com.bugtracker.backend.dto;

import java.util.UUID;

public class ProjectStatsResponse {

    private UUID projectId;
    private String projectName;
    private String projectKey;
    private long totalIssues;
    private long todoCount;
    private long inProgressCount;
    private long inReviewCount;
    private long doneCount;

    public ProjectStatsResponse() {
    }

    public ProjectStatsResponse(UUID projectId, String projectName, String projectKey,
                                long totalIssues, long todoCount, long inProgressCount,
                                long inReviewCount, long doneCount) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.projectKey = projectKey;
        this.totalIssues = totalIssues;
        this.todoCount = todoCount;
        this.inProgressCount = inProgressCount;
        this.inReviewCount = inReviewCount;
        this.doneCount = doneCount;
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

    public long getTotalIssues() {
        return totalIssues;
    }

    public void setTotalIssues(long totalIssues) {
        this.totalIssues = totalIssues;
    }

    public long getTodoCount() {
        return todoCount;
    }

    public void setTodoCount(long todoCount) {
        this.todoCount = todoCount;
    }

    public long getInProgressCount() {
        return inProgressCount;
    }

    public void setInProgressCount(long inProgressCount) {
        this.inProgressCount = inProgressCount;
    }

    public long getInReviewCount() {
        return inReviewCount;
    }

    public void setInReviewCount(long inReviewCount) {
        this.inReviewCount = inReviewCount;
    }

    public long getDoneCount() {
        return doneCount;
    }

    public void setDoneCount(long doneCount) {
        this.doneCount = doneCount;
    }
}

