package dev.ems.backend.dto;

import dev.ems.backend.model.WorkLocation;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AttendanceDto {
    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private LocalDate date;
    private LocalDateTime clockIn;
    private LocalDateTime clockOut;
    private WorkLocation workLocation;
    private Double workHours;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
