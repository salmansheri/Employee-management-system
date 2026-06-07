package dev.ems.backend.dto;

import dev.ems.backend.model.NotificationType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class NotificationDto {
    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private String title;
    private String message;
    private boolean isRead;
    private NotificationType type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
