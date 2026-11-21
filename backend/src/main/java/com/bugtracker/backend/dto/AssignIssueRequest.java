package com.bugtracker.backend.dto;

import java.util.UUID;

public class AssignIssueRequest {

    private UUID assigneeId;

    public AssignIssueRequest() {
    }

    public UUID getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(UUID assigneeId) {
        this.assigneeId = assigneeId;
    }
}

