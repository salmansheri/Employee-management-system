package dev.ems.backend.dto;

import dev.ems.backend.model.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class TaskCreateRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private UUID assignedToId;

    private LocalDate dueDate;

    @NotNull
    private TaskPriority priority;
}
