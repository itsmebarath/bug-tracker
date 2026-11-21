package com.bugtracker.backend.dto;

import com.bugtracker.backend.model.IssueStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateStatusRequest {

    @NotNull(message = "Status is required")
    private IssueStatus status;

    public UpdateStatusRequest() {
    }

    public IssueStatus getStatus() {
        return status;
    }

    public void setStatus(IssueStatus status) {
        this.status = status;
    }
}

