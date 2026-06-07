package dev.ems.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class DepartmentDto {
    private UUID id;
    private String name;
    private String code;
    private UUID managerId;
    private String managerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
