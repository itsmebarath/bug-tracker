package com.bugtracker.backend.service;

import com.bugtracker.backend.dto.CommentResponse;
import com.bugtracker.backend.dto.CreateCommentRequest;
import com.bugtracker.backend.dto.UserResponse;
import com.bugtracker.backend.exception.BadRequestException;
import com.bugtracker.backend.exception.ResourceNotFoundException;
import com.bugtracker.backend.model.*;
import com.bugtracker.backend.repository.CommentRepository;
import com.bugtracker.backend.repository.IssueRepository;
import com.bugtracker.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;

    public CommentService(
            CommentRepository commentRepository,
            IssueRepository issueRepository,
            UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
    }

    public CommentResponse addComment(UUID issueId, CreateCommentRequest request, String currentUserEmail) {
        User author = getUserByEmail(currentUserEmail);
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + issueId));

        checkProjectAccess(issue.getProject(), author);

        Comment comment = new Comment();
        comment.setContent(request.getContent().trim());
        comment.setIssue(issue);
        comment.setAuthor(author);

        Comment saved = commentRepository.save(comment);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByIssue(UUID issueId, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + issueId));

        checkProjectAccess(issue.getProject(), currentUser);

        return commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteComment(UUID commentId, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        boolean isAuthor = comment.getAuthor().getId().equals(currentUser.getId());
        boolean isProjectOwner = comment.getIssue().getProject().getOwner().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isAuthor && !isProjectOwner && !isAdmin) {
            throw new BadRequestException("You do not have permission to delete this comment");
        }

        commentRepository.delete(comment);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private void checkProjectAccess(Project project, User user) {
        if (user.getRole() == Role.ADMIN) return;

        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getId().equals(user.getId()));

        if (!project.getOwner().getId().equals(user.getId()) && !isMember) {
            throw new BadRequestException("You do not have permission to access this project's comments");
        }
    }

    private CommentResponse mapToResponse(Comment comment) {
        UserResponse authorResponse = new UserResponse(
                comment.getAuthor().getId(),
                comment.getAuthor().getFullName(),
                comment.getAuthor().getEmail(),
                comment.getAuthor().getRole().name(),
                comment.getAuthor().getCreatedAt()
        );

        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getIssue().getId(),
                authorResponse,
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }
}

