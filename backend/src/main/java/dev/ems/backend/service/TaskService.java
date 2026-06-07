package dev.ems.backend.service;

import dev.ems.backend.dto.TaskCreateRequest;
import dev.ems.backend.model.Employee;
import dev.ems.backend.model.Task;
import dev.ems.backend.model.TaskStatus;
import dev.ems.backend.model.NotificationType;
import dev.ems.backend.repository.EmployeeRepository;
import dev.ems.backend.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<Task> getTasksAssignedTo(UUID employeeId) {
        return taskRepository.findByAssignedToId(employeeId);
    }

    @Transactional(readOnly = true)
    public List<Task> getTasksCreatedBy(UUID creatorId) {
        return taskRepository.findByAssignedById(creatorId);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "tasks", key = "#id")
    public Task getTaskById(UUID id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + id));
    }

    @Transactional
    public Task createTask(TaskCreateRequest request, Employee creator) {
        Employee assignee = employeeRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new IllegalArgumentException("Assignee employee not found with ID: " + request.getAssignedToId()));

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .assignedTo(assignee)
                .assignedBy(creator)
                .dueDate(request.getDueDate())
                .status(TaskStatus.TODO)
                .priority(request.getPriority())
                .build();

        Task saved = taskRepository.save(task);

        String title = "New Task Assigned: " + saved.getTitle();
        String message = String.format("You have been assigned a new task: '%s' by %s %s. Due Date: %s. Priority: %s.",
                saved.getTitle(), creator.getFirstName(), creator.getLastName(),
                saved.getDueDate() != null ? saved.getDueDate() : "None", saved.getPriority());
        notificationService.sendNotification(assignee, title, message, NotificationType.TASK_ASSIGNED);

        return saved;
    }

    @Transactional
    @CacheEvict(value = "tasks", key = "#id")
    public Task updateTaskStatus(UUID id, TaskStatus status, Employee employee) {
        Task task = getTaskById(id);

        // Security check: Only the assignee (or creator or ADMIN) can change status
        if (!employee.getId().equals(task.getAssignedTo().getId()) &&
            !employee.getId().equals(task.getAssignedBy().getId()) &&
            !employee.getRole().name().equals("ROLE_ADMIN")) {
            throw new IllegalArgumentException("Unauthorized: You cannot change the status of this task");
        }

        task.setStatus(status);
        return taskRepository.save(task);
    }

    @Transactional
    @CacheEvict(value = "tasks", key = "#id")
    public Task updateTask(UUID id, TaskCreateRequest request, Employee editor) {
        Task task = getTaskById(id);

        // Security check: Only creator or ADMIN can edit details
        if (!editor.getId().equals(task.getAssignedBy().getId()) && !editor.getRole().name().equals("ROLE_ADMIN")) {
            throw new IllegalArgumentException("Unauthorized: Only task creator or admin can update task details");
        }

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getPriority() != null) task.setPriority(request.getPriority());

        if (request.getAssignedToId() != null) {
            Employee assignee = employeeRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new IllegalArgumentException("Assignee employee not found with ID: " + request.getAssignedToId()));
            task.setAssignedTo(assignee);
        }

        return taskRepository.save(task);
    }

    @Transactional
    @CacheEvict(value = "tasks", key = "#id")
    public void deleteTask(UUID id, Employee editor) {
        Task task = getTaskById(id);

        // Security check: Only creator or ADMIN can delete
        if (!editor.getId().equals(task.getAssignedBy().getId()) && !editor.getRole().name().equals("ROLE_ADMIN")) {
            throw new IllegalArgumentException("Unauthorized: Only task creator or admin can delete tasks");
        }

        taskRepository.delete(task);
    }
}
