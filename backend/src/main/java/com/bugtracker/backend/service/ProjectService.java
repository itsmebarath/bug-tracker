package com.bugtracker.backend.service;

import com.bugtracker.backend.dto.*;
import com.bugtracker.backend.exception.BadRequestException;
import com.bugtracker.backend.exception.ResourceNotFoundException;
import com.bugtracker.backend.model.Project;
import com.bugtracker.backend.model.Role;
import com.bugtracker.backend.model.User;
import com.bugtracker.backend.repository.ProjectRepository;
import com.bugtracker.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public ProjectResponse createProject(CreateProjectRequest request, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);

        String normalizedKey = request.getKey().trim().toUpperCase();
        if (projectRepository.existsByKey(normalizedKey)) {
            throw new BadRequestException("Project key '" + normalizedKey + "' already exists");
        }

        Project project = new Project();
        project.setName(request.getName().trim());
        project.setKey(normalizedKey);
        project.setDescription(request.getDescription());
        project.setOwner(currentUser);

        // Owner is automatically a member of the project
        project.getMembers().add(currentUser);

        Project savedProject = projectRepository.save(project);
        return mapToResponse(savedProject);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjectsForUser(String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);

        List<Project> projects;
        if (currentUser.getRole() == Role.ADMIN) {
            projects = projectRepository.findAll();
        } else {
            projects = projectRepository.findAllAccessibleProjects(currentUser);
        }

        return projects.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(UUID id, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        Project project = getProjectEntity(id);

        checkProjectAccess(project, currentUser);
        return mapToResponse(project);
    }

    public ProjectResponse updateProject(UUID id, UpdateProjectRequest request, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        Project project = getProjectEntity(id);

        checkProjectManagementPermission(project, currentUser);

        project.setName(request.getName().trim());
        project.setDescription(request.getDescription());

        Project updated = projectRepository.save(project);
        return mapToResponse(updated);
    }

    public void deleteProject(UUID id, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        Project project = getProjectEntity(id);

        // Only owner or ADMIN can delete project
        if (!project.getOwner().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new BadRequestException("Only the project owner or an administrator can delete this project");
        }

        projectRepository.delete(project);
    }

    public ProjectResponse addMember(UUID id, AddMemberRequest request, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        Project project = getProjectEntity(id);

        checkProjectManagementPermission(project, currentUser);

        User memberToAdd = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        project.getMembers().add(memberToAdd);
        Project saved = projectRepository.save(project);
        return mapToResponse(saved);
    }

    public ProjectResponse removeMember(UUID id, UUID userId, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        Project project = getProjectEntity(id);

        checkProjectManagementPermission(project, currentUser);

        if (project.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Cannot remove the project owner from the team");
        }

        project.getMembers().removeIf(member -> member.getId().equals(userId));
        Project saved = projectRepository.save(project);
        return mapToResponse(saved);
    }

    public Project getProjectEntity(UUID id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
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
            throw new BadRequestException("You do not have permission to access this project");
        }
    }

    private void checkProjectManagementPermission(Project project, User user) {
        if (user.getRole() == Role.ADMIN) return;

        boolean isOwner = project.getOwner().getId().equals(user.getId());
        boolean isManager = user.getRole() == Role.MANAGER && project.getMembers().stream()
                .anyMatch(m -> m.getId().equals(user.getId()));

        if (!isOwner && !isManager) {
            throw new BadRequestException("You must be the project owner or a project manager to perform this action");
        }
    }

    public ProjectResponse mapToResponse(Project project) {
        UserResponse ownerResponse = mapUserToResponse(project.getOwner());

        Set<UserResponse> memberResponses = project.getMembers().stream()
                .map(this::mapUserToResponse)
                .collect(Collectors.toSet());

        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getKey(),
                project.getDescription(),
                ownerResponse,
                memberResponses,
                project.getCreatedAt(),
                project.getUpdatedAt()
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

