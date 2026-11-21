package com.bugtracker.backend.dto;

import java.util.List;

public class DashboardSummaryResponse {

    private long totalProjects;
    private long totalIssues;
    private long openIssues;
    private long inProgressIssues;
    private long inReviewIssues;
    private long completedIssues;
    private long myAssignedIssues;
    private List<IssueResponse> recentIssues;

    public DashboardSummaryResponse() {
    }

    public DashboardSummaryResponse(long totalProjects, long totalIssues, long openIssues,
                                    long inProgressIssues, long inReviewIssues, long completedIssues,
                                    long myAssignedIssues, List<IssueResponse> recentIssues) {
        this.totalProjects = totalProjects;
        this.totalIssues = totalIssues;
        this.openIssues = openIssues;
        this.inProgressIssues = inProgressIssues;
        this.inReviewIssues = inReviewIssues;
        this.completedIssues = completedIssues;
        this.myAssignedIssues = myAssignedIssues;
        this.recentIssues = recentIssues;
    }

    public long getTotalProjects() {
        return totalProjects;
    }

    public void setTotalProjects(long totalProjects) {
        this.totalProjects = totalProjects;
    }

    public long getTotalIssues() {
        return totalIssues;
    }

    public void setTotalIssues(long totalIssues) {
        this.totalIssues = totalIssues;
    }

    public long getOpenIssues() {
        return openIssues;
    }

    public void setOpenIssues(long openIssues) {
        this.openIssues = openIssues;
    }

    public long getInProgressIssues() {
        return inProgressIssues;
    }

    public void setInProgressIssues(long inProgressIssues) {
        this.inProgressIssues = inProgressIssues;
    }

    public long getInReviewIssues() {
        return inReviewIssues;
    }

    public void setInReviewIssues(long inReviewIssues) {
        this.inReviewIssues = inReviewIssues;
    }

    public long getCompletedIssues() {
        return completedIssues;
    }

    public void setCompletedIssues(long completedIssues) {
        this.completedIssues = completedIssues;
    }

    public long getMyAssignedIssues() {
        return myAssignedIssues;
    }

    public void setMyAssignedIssues(long myAssignedIssues) {
        this.myAssignedIssues = myAssignedIssues;
    }

    public List<IssueResponse> getRecentIssues() {
        return recentIssues;
    }

    public void setRecentIssues(List<IssueResponse> recentIssues) {
        this.recentIssues = recentIssues;
    }
}

