package dev.ems.backend.dto;

import dev.ems.backend.model.NotificationType;
import java.util.UUID;

public record NotificationMessage(
    UUID id,
    UUID employeeId,
    String recipientEmail,
    String recipientName,
    String title,
    String message,
    NotificationType type
) {}
