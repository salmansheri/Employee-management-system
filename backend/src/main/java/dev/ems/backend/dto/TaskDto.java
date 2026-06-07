package dev.ems.backend.dto;

import dev.ems.backend.model.TaskPriority;
import dev.ems.backend.model.TaskStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TaskDto {
    private UUID id;
    private String title;
    private String description;
    private UUID assignedToId;
    private String assignedToName;
    private UUID assignedById;
    private String assignedByName;
    private LocalDate dueDate;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
