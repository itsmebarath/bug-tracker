package com.bugtracker.backend.controller;

import com.bugtracker.backend.dto.DashboardSummaryResponse;
import com.bugtracker.backend.dto.ProjectStatsResponse;
import com.bugtracker.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        DashboardSummaryResponse response = dashboardService.getSummary(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<ProjectStatsResponse> getProjectStats(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        ProjectStatsResponse response = dashboardService.getProjectStats(projectId, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
}

