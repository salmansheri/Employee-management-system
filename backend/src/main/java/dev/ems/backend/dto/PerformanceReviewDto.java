package dev.ems.backend.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PerformanceReviewDto {
    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private UUID reviewerId;
    private String reviewerName;
    private LocalDate reviewDate;
    private String feedback;
    private Integer rating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
