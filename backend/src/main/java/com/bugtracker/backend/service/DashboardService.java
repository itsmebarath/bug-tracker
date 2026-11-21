package com.bugtracker.backend.service;

import com.bugtracker.backend.dto.DashboardSummaryResponse;
import com.bugtracker.backend.dto.IssueResponse;
import com.bugtracker.backend.dto.ProjectStatsResponse;
import com.bugtracker.backend.exception.ResourceNotFoundException;
import com.bugtracker.backend.model.IssueStatus;
import com.bugtracker.backend.model.Project;
import com.bugtracker.backend.model.Role;
import com.bugtracker.backend.model.User;
import com.bugtracker.backend.repository.IssueRepository;
import com.bugtracker.backend.repository.ProjectRepository;
import com.bugtracker.backend.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final IssueService issueService;

    public DashboardService(
            ProjectRepository projectRepository,
            IssueRepository issueRepository,
            UserRepository userRepository,
            IssueService issueService) {
        this.projectRepository = projectRepository;
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
        this.issueService = issueService;
    }

    public DashboardSummaryResponse getSummary(String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentUserEmail));

        long totalProjects;
        if (currentUser.getRole() == Role.ADMIN) {
            totalProjects = projectRepository.count();
        } else {
            totalProjects = projectRepository.findAllAccessibleProjects(currentUser).size();
        }

        long totalIssues = issueRepository.count();
        long openIssues = issueRepository.countByStatus(IssueStatus.TO_DO);
        long inProgressIssues = issueRepository.countByStatus(IssueStatus.IN_PROGRESS);
        long inReviewIssues = issueRepository.countByStatus(IssueStatus.IN_REVIEW);
        long completedIssues = issueRepository.countByStatus(IssueStatus.DONE);
        long myAssignedIssues = issueRepository.countByAssignee(currentUser);

        List<IssueResponse> recentIssues = issueRepository.findAll(
                PageRequest.of(0, 5, Sort.by("createdAt").descending())
        ).getContent().stream()
                .map(issueService::mapToResponse)
                .collect(Collectors.toList());

        return new DashboardSummaryResponse(
                totalProjects,
                totalIssues,
                openIssues,
                inProgressIssues,
                inReviewIssues,
                completedIssues,
                myAssignedIssues,
                recentIssues
        );
    }

    public ProjectStatsResponse getProjectStats(UUID projectId, String currentUserEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        long totalIssues = issueRepository.countByProjectId(projectId);
        long todoCount = issueRepository.countByProjectIdAndStatus(projectId, IssueStatus.TO_DO);
        long inProgressCount = issueRepository.countByProjectIdAndStatus(projectId, IssueStatus.IN_PROGRESS);
        long inReviewCount = issueRepository.countByProjectIdAndStatus(projectId, IssueStatus.IN_REVIEW);
        long doneCount = issueRepository.countByProjectIdAndStatus(projectId, IssueStatus.DONE);

        return new ProjectStatsResponse(
                project.getId(),
                project.getName(),
                project.getKey(),
                totalIssues,
                todoCount,
                inProgressCount,
                inReviewCount,
                doneCount
        );
    }
}

