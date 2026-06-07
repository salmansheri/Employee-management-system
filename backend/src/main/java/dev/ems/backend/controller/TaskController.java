package dev.ems.backend.controller;

import dev.ems.backend.dto.TaskCreateRequest;
import dev.ems.backend.dto.TaskDto;
import dev.ems.backend.mapper.TaskMapper;
import dev.ems.backend.model.Employee;
import dev.ems.backend.model.Task;
import dev.ems.backend.model.TaskStatus;
import dev.ems.backend.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final TaskMapper taskMapper;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<TaskDto> createTask(
            @Valid @RequestBody TaskCreateRequest request,
            @AuthenticationPrincipal Employee currentEmployee) {
        
        Task task = taskService.createTask(request, currentEmployee);
        return ResponseEntity.ok(taskMapper.toDto(task));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable UUID id,
            @Valid @RequestBody TaskCreateRequest request,
            @AuthenticationPrincipal Employee currentEmployee) {
        
        Task task = taskService.updateTask(id, request, currentEmployee);
        return ResponseEntity.ok(taskMapper.toDto(task));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TaskDto> updateTaskStatus(
            @PathVariable UUID id,
            @RequestParam TaskStatus status,
            @AuthenticationPrincipal Employee currentEmployee) {
        
        Task task = taskService.updateTaskStatus(id, status, currentEmployee);
        return ResponseEntity.ok(taskMapper.toDto(task));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable UUID id) {
        Task task = taskService.getTaskById(id);
        return ResponseEntity.ok(taskMapper.toDto(task));
    }

    @GetMapping("/my")
    public ResponseEntity<List<TaskDto>> getMyTasks(@AuthenticationPrincipal Employee currentEmployee) {
        List<Task> tasks = taskService.getTasksAssignedTo(currentEmployee.getId());
        return ResponseEntity.ok(taskMapper.toDtoList(tasks));
    }

    @GetMapping("/created")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<TaskDto>> getTasksCreatedBy(@AuthenticationPrincipal Employee currentEmployee) {
        List<Task> tasks = taskService.getTasksCreatedBy(currentEmployee.getId());
        return ResponseEntity.ok(taskMapper.toDtoList(tasks));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable UUID id,
            @AuthenticationPrincipal Employee currentEmployee) {
        
        taskService.deleteTask(id, currentEmployee);
        return ResponseEntity.noContent().build();
    }
}
