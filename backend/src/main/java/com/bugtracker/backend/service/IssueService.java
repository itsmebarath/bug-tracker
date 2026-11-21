package com.bugtracker.backend.service;

import com.bugtracker.backend.dto.*;
import com.bugtracker.backend.exception.BadRequestException;
import com.bugtracker.backend.exception.ResourceNotFoundException;
import com.bugtracker.backend.model.*;
import com.bugtracker.backend.repository.IssueRepository;
import com.bugtracker.backend.repository.ProjectRepository;
import com.bugtracker.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class IssueService {

    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public IssueService(
            IssueRepository issueRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository) {
        this.issueRepository = issueRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public IssueResponse createIssue(CreateIssueRequest request, String currentUserEmail) {
        User reporter = getUserByEmail(currentUserEmail);
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));

        checkProjectAccess(project, reporter);

        Issue issue = new Issue();
        issue.setTitle(request.getTitle().trim());
        issue.setDescription(request.getDescription());
        issue.setProject(project);
        issue.setReporter(reporter);
        issue.setStatus(IssueStatus.TO_DO);
        issue.setPriority(request.getPriority() != null ? request.getPriority() : IssuePriority.MEDIUM);
        issue.setType(request.getType() != null ? request.getType() : IssueType.BUG);

        // Generate sequential issue key, e.g. PROJ-1, PROJ-2
        long currentCount = issueRepository.countByProjectId(project.getId());
        issue.setKey(project.getKey() + "-" + (currentCount + 1));

        // Assignee
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found with id: " + request.getAssigneeId()));
            issue.setAssignee(assignee);
        }

        Issue saved = issueRepository.save(issue);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<IssueResponse> getFilteredIssues(
            UUID projectId,
            IssueStatus status,
            IssuePriority priority,
            UUID assigneeId,
            String search,
            Pageable pageable,
            String currentUserEmail) {

        User currentUser = getUserByEmail(currentUserEmail);

        if (projectId != null) {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
            checkProjectAccess(project, currentUser);

            return issueRepository.findFilteredIssues(projectId, status, priority, assigneeId, search, pageable)
                    .map(this::mapToResponse);
        } else {
            return issueRepository.findAllFilteredIssues(status, priority, assigneeId, search, pageable)
                    .map(this::mapToResponse);
        }
    }

    @Transactional(readOnly = true)
    public List<IssueResponse> getIssuesByProject(UUID projectId, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        checkProjectAccess(project, currentUser);

        return issueRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IssueResponse getIssueById(UUID id, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        Issue issue = getIssueEntity(id);

        checkProjectAccess(issue.getProject(), currentUser);
        return mapToResponse(issue);
    }

    public IssueResponse updateIssue(UUID id, UpdateIssueRequest request, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        Issue issue = getIssueEntity(id);

        checkProjectAccess(issue.getProject(), currentUser);

        issue.setTitle(request.getTitle().trim());
        issue.setDescription(request.getDescription());

        if (request.getPriority() != null) {
            issue.setPriority(request.getPriority());
        }
        if (request.getStatus() != null) {
            issue.setStatus(request.getStatus());
        }
        if (request.getType() != null) {
            issue.setType(request.getType());
        }

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found with id: " + request.getAssigneeId()));
            issue.setAssignee(assignee);
        } else {
            issue.setAssignee(null);
        }

        Issue updated = issueRepository.save(issue);
        return mapToResponse(updated);
    }

    public IssueResponse updateIssueStatus(UUID id, IssueStatus newStatus, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        Issue issue = getIssueEntity(id);

        checkProjectAccess(issue.getProject(), currentUser);

        issue.setStatus(newStatus);
        Issue updated = issueRepository.save(issue);
        return mapToResponse(updated);
    }

    public IssueResponse assignIssue(UUID id, UUID assigneeId, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        Issue issue = getIssueEntity(id);

        checkProjectAccess(issue.getProject(), currentUser);

        if (assigneeId != null) {
            User assignee = userRepository.findById(assigneeId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + assigneeId));
            issue.setAssignee(assignee);
        } else {
            issue.setAssignee(null);
        }

        Issue updated = issueRepository.save(issue);
        return mapToResponse(updated);
    }

    public void deleteIssue(UUID id, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        Issue issue = getIssueEntity(id);

        // Only reporter, project owner, manager or admin can delete
        boolean isReporter = issue.getReporter().getId().equals(currentUser.getId());
        boolean isOwner = issue.getProject().getOwner().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isManager = currentUser.getRole() == Role.MANAGER;

        if (!isReporter && !isOwner && !isAdmin && !isManager) {
            throw new BadRequestException("You do not have permission to delete this issue");
        }

        issueRepository.delete(issue);
    }

    public Issue getIssueEntity(UUID id) {
        return issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + id));
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
            throw new BadRequestException("You do not have access to this project's issues");
        }
    }

    public IssueResponse mapToResponse(Issue issue) {
        UserResponse reporterResponse = mapUserToResponse(issue.getReporter());
        UserResponse assigneeResponse = issue.getAssignee() != null ? mapUserToResponse(issue.getAssignee()) : null;

        return new IssueResponse(
                issue.getId(),
                issue.getTitle(),
                issue.getDescription(),
                issue.getKey(),
                issue.getPriority(),
                issue.getStatus(),
                issue.getType(),
                issue.getProject().getId(),
                issue.getProject().getName(),
                issue.getProject().getKey(),
                reporterResponse,
                assigneeResponse,
                issue.getCreatedAt(),
                issue.getUpdatedAt()
        );
    }

    private UserResponse mapUserToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }
}

