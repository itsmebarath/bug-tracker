package com.bugtracker.backend.controller;

import com.bugtracker.backend.dto.*;
import com.bugtracker.backend.model.IssuePriority;
import com.bugtracker.backend.model.IssueStatus;
import com.bugtracker.backend.service.IssueService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "http://localhost:5173")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @PostMapping
    public ResponseEntity<IssueResponse> createIssue(
            @Valid @RequestBody CreateIssueRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        IssueResponse response = issueService.createIssue(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<IssueResponse>> getIssues(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) IssueStatus status,
            @RequestParam(required = false) IssuePriority priority,
            @RequestParam(required = false) UUID assigneeId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal UserDetails userDetails) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<IssueResponse> response = issueService.getFilteredIssues(
                projectId, status, priority, assigneeId, search, pageable, userDetails.getUsername()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<IssueResponse>> getIssuesByProject(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<IssueResponse> response = issueService.getIssuesByProject(projectId, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IssueResponse> getIssueById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        IssueResponse response = issueService.getIssueById(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IssueResponse> updateIssue(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateIssueRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        IssueResponse response = issueService.updateIssue(id, request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<IssueResponse> updateIssueStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        IssueResponse response = issueService.updateIssueStatus(id, request.getStatus(), userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<IssueResponse> assignIssue(
            @PathVariable UUID id,
            @RequestBody AssignIssueRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        IssueResponse response = issueService.assignIssue(id, request.getAssigneeId(), userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIssue(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        issueService.deleteIssue(id, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Issue deleted successfully"));
    }
}

