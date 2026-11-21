package com.bugtracker.backend.controller;

import com.bugtracker.backend.dto.CommentResponse;
import com.bugtracker.backend.dto.CreateCommentRequest;
import com.bugtracker.backend.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping("/issues/{issueId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID issueId,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        CommentResponse response = commentService.addComment(issueId, request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/issues/{issueId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable UUID issueId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<CommentResponse> response = commentService.getCommentsByIssue(issueId, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable UUID commentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        commentService.deleteComment(commentId, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
    }
}

